// Pause overlay: menu (resume / controls / volumes / shake / quit) and the city map.
// Launched on top of Explore or Action, which are paused underneath.
import Phaser from 'phaser';
import { DIFFICULTY, fmtScore } from '../core/Score';
import { DISTRICTS } from '../data/districts';
import { MISSIONS, missionAvailable } from '../data/missions';
import { GAME_W, GAME_H } from '../config';
import { InputManager, CONTROLS_KEYS, CONTROLS_ALT, CONTROLS_PAD, touchState } from '../input/InputManager';
import { wantsTouch } from '../input/TouchControls';
import { text, iris } from '../ui/fx';
import { ctx } from '../core/ctx';
import { music } from '../audio/Sequencer';
import { sfx } from '../audio/sfx';
import { exitSpan, type CityMap, type MapData } from '../explore/CityMap';
import type { Manifest } from './BootScene';
import { UPGRADES } from '../data/upgrades';
import { networkDone, networkPatches, networkLabel } from '../data/network';
import { fullscreenSupported, isFullscreen, isInstalled, toggleFullscreen } from '../core/fullscreen';

export interface PauseData { from: string; mode?: 'menu' | 'map' | 'controls'; /** M4.6: the controls page shown before the first ride */ first?: boolean }
const NET_GREEN = 0x55e05a, NET_YELLOW = 0xf5c22e;
export interface MapInfo { map: CityMap; district?: string; player: { x: number; y: number }; markers: { x: number; y: number; label: string; done: boolean }[]; /** M4.1: the Bike Bus's stops still to come */ route?: { x: number; y: number; kind: string; next: boolean }[] }

type Item = { label: () => string; act?: () => void; left?: () => void; right?: () => void; t?: Phaser.GameObjects.BitmapText; /** fires on pointerUP (browsers only allow fullscreen from a touch's pointerup) */ onUp?: boolean };

/** Open the pause overlay from a gameplay scene (no-op if already open). */
export function openPause(scene: Phaser.Scene, mode: PauseData['mode'] = 'menu', first = false) {
  if (scene.scene.isActive('Pause') || scene.scene.isPaused()) return;
  sfx.select();
  scene.scene.launch('Pause', { from: scene.scene.key, mode, first } satisfies PauseData);
  scene.scene.pause();
}

export class PauseScene extends Phaser.Scene {
  private input2!: InputManager;
  private from = '';
  private first = false;
  private mode: 'menu' | 'map' | 'controls' = 'menu';
  private root!: Phaser.GameObjects.Container;
  private items: Item[] = [];
  private sel = 0;
  private lastNY = 0;
  private lastNX = 0;
  private blink?: Phaser.GameObjects.Graphics;
  private blinkT = 0;
  private mapRect = { x: 0, y: 0, s: 1 };
  private info?: MapInfo;

  constructor() { super('Pause'); }

  create(data: PauseData) {
    this.from = data.from;
    this.first = !!data.first;
    this.input2 = new InputManager(this);
    // the key/button that opened the overlay is still held: don't let it close the overlay again (M1 flicker bug)
    this.input2.swallow();
    touchState.x = 0; touchState.y = 0;
    for (const k of Object.keys(touchState.buttons)) touchState.buttons[k] = false;
    touchState.taps.clear();
    this.sel = 0; this.lastNY = 0; this.lastNX = 0;
    music.duck(true);
    this.show(data.mode ?? 'menu');
    this.scale.on('resize', this.relayout, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.relayout, this); music.duck(false); });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.tap(p, false));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.tap(p, true));
  }

  private relayout() { this.show(this.mode); }

  private show(mode: 'menu' | 'map' | 'controls') {
    this.mode = mode;
    this.root?.destroy();
    this.blink = undefined;
    this.root = this.add.container(0, 0);
    const dim = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x16121f, mode === 'map' ? 0.88 : 0.72).setOrigin(0);
    this.root.add(dim);
    if (mode === 'menu') this.buildMenu();
    else if (mode === 'controls') this.buildControls();
    else this.buildMap();
    // close button (top right), always there
    const bx = GAME_W - 14, by = 14;
    const btn = this.add.graphics();
    btn.fillStyle(0x16121f).fillCircle(bx, by + 1, 10).fillStyle(0xd42a24).fillCircle(bx, by, 10).lineStyle(1, 0xf6f2e9).strokeCircle(bx, by, 10);
    this.root.add(btn);
    this.root.add(text(this, bx, by, 'X', 'font_outline'));
    this.closeBtn = { x: bx, y: by };
  }
  private closeBtn = { x: 0, y: 0 };

  private back() {
    if (this.mode === 'controls' && this.from !== 'Title') { sfx.select(); this.show('menu'); }
    else this.resume();
  }

  // ---------- menu ----------
  private buildMenu() {
    const cx = GAME_W / 2;
    this.root.add(text(this, cx, 34, 'PAUSED', 'font_big'));
    // M3.1: the run at a glance
    this.root.add(text(this, cx, 50, `${ctx.state.name}   ${DIFFICULTY[ctx.state.difficulty].label}   SCORE ${fmtScore(ctx.state.score)}`, 'font').setTint(0xfff08a));
    const pct = (v: number) => `${Math.round(v * 10)}`.padStart(2, ' ');
    const bar = (v: number) => '#'.repeat(Math.round(v * 10)) + '.'.repeat(10 - Math.round(v * 10));
    const vol = (k: 'music' | 'sfx', d: number) => () => { ctx.settings[k] = Phaser.Math.Clamp(Math.round((ctx.settings[k] + d) * 10) / 10, 0, 1); ctx.applySettings(); sfx.blip(); this.refresh(); };
    this.items = [
      { label: () => 'RESUME', act: () => this.resume() },
      ...(this.from === 'Explore' ? [{ label: () => 'CITY MAP', act: () => this.show('map') }, { label: () => 'SHARE YOUR CITY', act: () => { sfx.select(); this.scene.launch('Share', { from: 'Pause' }); this.scene.pause(); } }] : []),
      { label: () => 'CONTROLS', act: () => this.show('controls') },
      { label: () => `MUSIC  < ${bar(ctx.settings.music)} > ${pct(ctx.settings.music)}`, left: vol('music', -0.1), right: vol('music', 0.1), act: vol('music', 0.1) },
      { label: () => `SOUND  < ${bar(ctx.settings.sfx)} > ${pct(ctx.settings.sfx)}`, left: vol('sfx', -0.1), right: vol('sfx', 0.1), act: vol('sfx', 0.1) },
      { label: () => `SCREEN SHAKE  ${ctx.settings.shake ? 'ON' : 'OFF'}`, act: () => { ctx.settings.shake = !ctx.settings.shake; ctx.applySettings(); sfx.blip(); this.refresh(); }, left: () => this.items[this.sel].act!(), right: () => this.items[this.sel].act!() },
      ...(fullscreenSupported() ? [{ onUp: true, label: () => `FULLSCREEN  ${isFullscreen() ? 'ON' : 'OFF'}`, act: () => { void toggleFullscreen().then(() => this.time.delayedCall(250, () => this.refresh())); sfx.blip(); } }]
        : wantsTouch() && !isInstalled() ? [{ label: () => 'FULLSCREEN: SHARE > ADD TO HOME SCREEN' }] : []),
      { label: () => 'SAVE + QUIT TO TITLE', act: () => void this.quit() },
    ];
    this.sel = Math.min(this.sel, this.items.length - 1);
    const step = this.items.length > 7 ? 12 : 14; // M3.2: the FULLSCREEN line makes 8: keep clear of the bottom
    this.items.forEach((it, i) => { it.t = text(this, cx, 64 + i * step, '', 'font_outline'); this.root.add(it.t); });
    this.root.add(text(this, cx, GAME_H - 12, wantsTouch() ? 'TAP AN OPTION' : 'ARROWS: CHOOSE  E/ENTER: OK  ESC: BACK', 'font').setTint(0x9793a6));
    this.refresh();
  }

  private refresh() {
    this.items.forEach((it, i) => it.t?.setText(i === this.sel ? `> ${it.label()} <` : it.label()).setTint(i === this.sel ? 0xfff08a : 0xffffff));
  }

  // ---------- controls ----------
  private buildControls() {
    const cx = GAME_W / 2;
    this.root.add(text(this, cx, 22, 'CONTROLS', 'font_big'));
    if (wantsTouch()) {
      const rows: [string, string][] = [['LEFT THUMB', 'RIDE (STICK APPEARS)'], ['YELLOW', 'BOOST (HOLD)'], ['GREEN', 'HOP / JUMP'], ['BLUE', 'DASH'], ['RED', 'BELL / TALK / PUMP'], ['MAP / II', 'MAP / PAUSE']];
      rows.forEach(([k, v], i) => { this.root.add(text(this, cx - 8, 48 + i * 14, k, 'font_outline', 0).setOrigin(1, 0).setTint(0xfff08a)); this.root.add(text(this, cx + 8, 48 + i * 14, v, 'font_outline', 0)); });
    } else {
      // M4.7 (Ivan: overlapping text): 8 rows at 12 px end at ~135, clear of the missions note at 148
      CONTROLS_KEYS.forEach(([k, v], i) => { this.root.add(text(this, cx - 8, 42 + i * 12, k, 'font_outline', 0).setOrigin(1, 0).setTint(0xfff08a)); this.root.add(text(this, cx + 8, 42 + i * 12, v, 'font_outline', 0)); });
      // a dark band under the small notes so the ride behind the page doesn't show through the letters
      this.root.add(this.add.rectangle(0, 141, GAME_W, 51, 0x16121f, 0.86).setOrigin(0));
      this.root.add(text(this, cx, 148, 'IN MISSIONS: E SWINGS THE PUMP (3-HIT COMBO),', 'font').setTint(0xc9c5d1));
      this.root.add(text(this, cx, 158, 'Q DASHES THROUGH RATS, JUMP ON THEIR HEADS.', 'font').setTint(0xc9c5d1));
      this.root.add(text(this, cx, 174, CONTROLS_ALT, 'font').setTint(0x9793a6));
      this.root.add(text(this, cx, 184, CONTROLS_PAD, 'font').setTint(0x9793a6));
    }
    // M4.6 (Ivan: "show controls page when the person starts the game for the first time"): then it leads into the ride
    if (this.first) this.root.add(text(this, cx, GAME_H - 12, wantsTouch() ? '> TAP X: RIDE <' : '> ENTER: RIDE <', 'font_outline').setTint(0xfff08a));
    else this.root.add(text(this, cx, GAME_H - 12, wantsTouch() ? 'X: BACK' : 'ESC / E: BACK', 'font').setTint(0x9793a6));
  }

  // ---------- city map ----------
  /** which district the map is showing (M2.1: page through them with left/right) */
  private viewDistrict = '';

  private buildMap() {
    const ex = this.scene.get('Explore') as unknown as { minimapInfo?: () => MapInfo };
    this.info = ex.minimapInfo?.();
    const cx = GAME_W / 2;
    const here = this.info?.district ?? 'queenwest';
    if (!this.viewDistrict) this.viewDistrict = here;
    const view = this.viewDistrict;
    const live = view === here && this.info ? this.info.map : null;
    const md = (live?.data ?? this.cache.json.get(`map_${view}`)) as MapData | undefined;
    // M4.2 (Ivan): the district's name; its neighbours are marked outside the map's edges, where they connect
    this.root.add(text(this, 8, 7, DISTRICTS[view]?.name ?? 'TORONTO', 'font_outline', 0).setOrigin(0, 0.5).setTint(0xfff08a));
    this.root.add(text(this, GAME_W - 34, 7, `YOU: ${DISTRICTS[here]?.name ?? ''}`, 'font', 1).setOrigin(1, 0.5).setTint(0x9793a6));
    this.mapLinks = []; // M4.3 (review): the old district's links died with its root container
    if (!md) {
      // M3.3: another district's map data arrives on demand (it used to load every map at boot)
      const d = (this.registry.get('manifest') as Manifest).districts?.[view];
      if (d && !this.load.isLoading()) { this.load.json(`map_${view}`, d.map); this.load.once('complete', () => { if (this.mode === 'map' && this.viewDistrict === view && this.scene.isActive()) this.show('map'); }); this.load.start(); }
      this.root.add(text(this, cx, GAME_H / 2, 'LOADING...', 'font_outline').setTint(0x9793a6));
      return;
    }
    const key = 'minimap_live';
    if (this.textures.exists(key)) this.textures.remove(key);
    const tex = this.textures.createCanvas(key, md.width, md.height)!;
    const c = tex.getContext();
    const img = c.createImageData(md.width, md.height);
    const colors = md.tileColors ?? [];
    // ground: the live tilemap for this district, or the map data + every upgrade you've earned
    let ground: number[][] = md.ground;
    if (!live) {
      ground = md.ground.map((r) => r.slice());
      for (const p of [...ctx.state.upgrades.flatMap((u) => UPGRADES[u]?.mapPatches ?? []), ...networkPatches(ctx.state.completedMissions)]) for (const [x, y, t] of md.improvements[p]?.tiles ?? []) if (ground[y]) ground[y][x] = t;
    }
    for (let y = 0; y < md.height; y++) for (let x = 0; x < md.width; x++) {
      const t = live ? live.tilemap.getTileAt(x, y, true, live.layer)?.index ?? 0 : ground[y][x];
      const col = colors[t] ?? 0x2a6e38;
      const o = (y * md.width + x) * 4;
      img.data[o] = (col >> 16) & 255; img.data[o + 1] = (col >> 8) & 255; img.data[o + 2] = col & 255; img.data[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    // ground decals (park paths, dog bowl, courts, diamonds), when their textures are loaded
    for (const d of md.decals ?? []) {
      if (!this.textures.exists(d.key)) continue;
      const src = this.textures.get(d.key).getSourceImage() as CanvasImageSource & { width: number; height: number };
      c.imageSmoothingEnabled = true;
      c.drawImage(src, d.x / md.tileSize, d.y / md.tileSize, src.width / md.tileSize, src.height / md.tileSize);
    }
    // buildings as roof blocks
    const ts = md.tileSize;
    const blds = live ? live.buildings : md.objects.filter((o) => o.type === 'building').map((o) => ({ x: o.x, y: o.y, w: o.w!, d: o.d!, mapColor: o.mapColor }));
    for (const b of blds) {
      c.fillStyle = '#16121f'; c.fillRect(b.x / ts, b.y / ts, b.w / ts, b.d / ts);
      c.fillStyle = b.mapColor ?? '#8a7f94'; c.fillRect(b.x / ts + 0.15, b.y / ts + 0.15, b.w / ts - 0.3, b.d / ts - 0.3);
    }
    tex.refresh();
    // M4.2 (Ivan: "all maps large"): scaled to fill the space between the title and the footer, whatever its size
    const M = 10, top = 14 + M, bottom = GAME_H - 21 - M; // M4.3: two footer rows (the network's legend + the tally)
    const availW = GAME_W - 2 * M - 8, availH = bottom - top;
    const s = Math.min(availW / md.width, availH / md.height);
    const w = Math.round(md.width * s), h = Math.round(md.height * s);
    const x0 = Math.round(cx - w / 2), y0 = Math.round(top + (availH - h) / 2);
    this.mapRect = { x: x0, y: y0, s: w / md.width / md.tileSize };
    const frame = this.add.graphics();
    frame.fillStyle(0x16121f).fillRect(x0 - 3, y0 - 3, w + 6, h + 6).lineStyle(1, 0xf6f2e9).strokeRect(x0 - 2.5, y0 - 2.5, w + 5, h + 5);
    this.root.add(frame);
    this.root.add(this.add.image(x0, y0, key).setOrigin(0).setDisplaySize(w, h));
    // M4.3: the bike network over the streets: protected green, slow yellow, today's painted lanes thin grey
    const done = new Set(networkDone(ctx.state.completedMissions).map((n) => n.id));
    const net = this.add.graphics();
    for (const n of md.network ?? []) {
      const on = done.has(n.id);
      if (!on && !n.painted) continue;
      const col = !on ? 0xc9c5d1 : n.kind === 'protected' ? NET_GREEN : NET_YELLOW, lw = on ? 3 : 1;
      for (const [ax, ay, bx, by] of n.segs) {
        const p = (vx: number, vy: number) => [x0 + vx * this.mapRect.s, y0 + vy * this.mapRect.s] as const;
        const [sx, sy] = p(ax, ay), [ex, ey] = p(bx, by);
        net.lineStyle(lw + 2, 0x16121f, 0.85).lineBetween(sx, sy, ex, ey).lineStyle(lw, col).lineBetween(sx, sy, ex, ey);
      }
    }
    this.root.add(net);
    // M4.2 (Ivan: "too crowded with text"): street names and park names only
    // streets first, then parks; a label that would cover another, or stick out of the frame, is left out
    const placed: Phaser.Geom.Rectangle[] = [];
    const inFrame = new Phaser.Geom.Rectangle(x0 + 1, y0 + 1, w - 2, h - 2);
    for (const l of [...(md.labels ?? []).filter((l) => !l.kind), ...(md.labels ?? []).filter((l) => l.kind === 'park')]) {
      const t = text(this, x0 + l.x * this.mapRect.s, y0 + l.y * this.mapRect.s, l.text, 'font').setTint(l.kind === 'park' ? 0xfff08a : 0xf6f2e9);
      if (l.vertical) t.setAngle(-90);
      // nudged inside the frame if it hangs over an edge
      let r = t.getBounds();
      t.x += Math.max(0, inFrame.x - r.x) - Math.max(0, r.right - inFrame.right); t.y += Math.max(0, inFrame.y - r.y) - Math.max(0, r.bottom - inFrame.bottom);
      r = t.getBounds();
      const pad = new Phaser.Geom.Rectangle(r.x - 2, r.y - 1, r.width + 4, r.height + 2);
      const fits = Phaser.Geom.Rectangle.ContainsRect(inFrame, r) && !placed.some((q) => Phaser.Geom.Intersects.RectangleToRectangle(q, pad));
      if (!fits) { t.destroy(); continue; }
      placed.push(pad);
      this.root.add(t);
    }
    // the neighbours, outside the frame where their streets leave it (tap one, or press that direction)
    this.mapLinks = [];
    const groups = new Map<string, { side: string; to: string; sum: number; n: number }>();
    for (const e of md.exits ?? []) {
      if (!DISTRICTS[e.to]) continue;
      const k = `${e.side}${e.to}`, [lo, hi] = exitSpan(e), mid = (lo + hi) / 2;
      const g = groups.get(k) ?? { side: e.side, to: e.to, sum: 0, n: 0 };
      g.sum += mid; g.n++; groups.set(k, g);
    }
    for (const g of groups.values()) {
      const along = (g.sum / g.n) * this.mapRect.s, open = Object.values(MISSIONS).filter((m) => m.district === g.to && !ctx.state.completedMissions.includes(m.id) && missionAvailable(m.id, ctx.state.completedMissions)).length;
      const name = `${DISTRICTS[g.to].name}${open ? ` ${open}!` : ''}`;
      // M4.3 (review): kept inside the frame's span by half the label's own length (long names used to stick out
      // into the title row or under the close button)
      // M4.4 (Ivan): the side labels are turned on their side, so a '^' turned with them points out of the map
      const label = g.side === 's' ? `v ${name}` : `^ ${name}`;
      const t = text(this, 0, 0, label, 'font');
      const half = t.width / 2 + 3, ns = g.side === 'n' || g.side === 's';
      const pos = ns ? Phaser.Math.Clamp(x0 + along, x0 + half, Math.min(x0 + w, GAME_W - 30) - half) : Phaser.Math.Clamp(y0 + along, y0 + half, y0 + h - half);
      if (g.side === 'n') t.setPosition(pos, y0 - 9);
      else if (g.side === 's') t.setPosition(pos, y0 + h + 8);
      else if (g.side === 'w') t.setPosition(x0 - 9, pos).setAngle(-90);
      else t.setPosition(x0 + w + 9, pos).setAngle(90);
      t.setTint(open ? 0xfff08a : 0x9bd35a);
      this.root.add(t);
      this.mapLinks.push({ side: g.side, to: g.to, n: g.n, t });
    }
    // markers for the district on screen; the raccoon only where it is
    this.viewMarkers = live && this.info ? this.info.markers : md.markers.filter((m) => ctx.state.completedMissions.includes(m.id) || missionAvailable(m.id, ctx.state.completedMissions)).map((m) => ({ x: m.x, y: m.y, label: m.label, done: ctx.state.completedMissions.includes(m.id) }));
    this.viewHasPlayer = !!live;
    this.blink = this.add.graphics();
    this.root.add(this.blink);
    // M3.3: what there is to find here, and what you've found (plaques, hidden hearts, easter eggs)
    const fl = ctx.state.flags, plq = md.landmarks ?? [], hearts = md.lifeTokens ?? [], eggs = md.eggs ?? [];
    const tally = [`PLAQUES ${plq.filter((l) => fl[`score_plaque_${view}_${l.id}`]).length}/${plq.length}`, `HEARTS ${hearts.filter((_, i) => fl[`life_${view}_${i}`]).length}/${hearts.length}`, ...(eggs.length ? [`EGGS ${eggs.filter((e) => fl[`score_egg_${e.id}`]).length}/${eggs.length}`] : [])];
    this.root.add(text(this, 8, GAME_H - 6, tally.join('  '), 'font', 0).setOrigin(0, 0.5).setTint(0xfff08a));
    // M4.3: the network's legend, a row above
    const lg = this.add.graphics(); this.root.add(lg);
    let lx = 8;
    const item = (label: string, col?: number, tint = 0x9793a6) => {
      if (col !== undefined) { lg.fillStyle(0x16121f).fillRect(lx, GAME_H - 18, 12, 5).fillStyle(col).fillRect(lx + 1, GAME_H - 17, 10, 3); lx += 15; }
      const t = text(this, lx, GAME_H - 15, label, 'font', 0).setOrigin(0, 0.5).setTint(tint); this.root.add(t); lx += t.width + 10;
    };
    item(networkLabel(ctx.state.completedMissions), undefined, 0x9bd35a);
    item('PROTECTED', NET_GREEN); item('SLOW STREET', NET_YELLOW); item('PAINTED', 0xc9c5d1);
    this.root.add(text(this, GAME_W - 8, GAME_H - 6, wantsTouch() ? 'TAP A NEIGHBOUR' : 'ARROWS: MOVE  M: CLOSE', 'font', 1).setOrigin(1, 0.5).setTint(0x9793a6));
    this.drawBlink();
  }
  private viewMarkers: { x: number; y: number; label: string; done: boolean }[] = [];
  private viewHasPlayer = true;

  private mapLinks: { side: string; to: string; n: number; t: Phaser.GameObjects.BitmapText }[] = [];
  /** M4.2 (Ivan): move between the maps the way they connect: DOWN from High Park, Downtown or the East End is the Waterfront */
  private goMap(side: 'n' | 's' | 'w' | 'e') {
    const links = this.mapLinks.filter((l) => l.side === side).sort((a, b) => b.n - a.n);
    if (!links.length) return;
    this.goDistrict(links[0].to);
  }
  private goDistrict(to: string) {
    if (!DISTRICTS[to] || to === this.viewDistrict) return;
    this.viewDistrict = to;
    sfx.move();
    this.show('map');
  }

  private drawBlink() {
    if (!this.blink || !this.info) return;
    const g = this.blink.clear();
    const { x, y, s } = this.mapRect;
    const on = Math.floor(this.blinkT / 300) % 2 === 0;
    for (const m of this.viewMarkers) {
      const mx = x + m.x * s, my = y + m.y * s;
      g.fillStyle(0x16121f).fillRect(mx - 3, my - 3, 6, 6);
      g.fillStyle(m.done ? 0x9bd35a : on ? 0xff6347 : 0xd42a24).fillRect(mx - 2, my - 2, 4, 4);
    }
    if (!this.viewHasPlayer) return;
    for (const r of this.info.route ?? []) {
      const rx = x + r.x * s, ry = y + r.y * s;
      g.fillStyle(0x16121f).fillRect(rx - 3, ry - 3, 7, 7);
      g.fillStyle(r.kind === 'block' ? 0xff9a2e : r.kind === 'school' ? 0x7cc6f2 : 0xf5c22e).fillRect(rx - 2, ry - 2, 5, 5);
      if (r.next && on) g.lineStyle(1, 0xfff08a).strokeRect(rx - 5, ry - 5, 11, 11);
    }
    const px = x + this.info.player.x * s, py = y + this.info.player.y * s;
    g.fillStyle(0x16121f).fillCircle(px, py, 3.5);
    g.fillStyle(on ? 0xfff08a : 0xf6f2e9).fillCircle(px, py, 2.5);
  }

  // ---------- input ----------
  private tap(p: Phaser.Input.Pointer, up: boolean) {
    if (up) { // only the items that need a real gesture (fullscreen) act on release
      if (this.mode !== 'menu') return;
      const it = this.itemAt(p);
      if (it?.onUp) it.act?.();
      return;
    }
    if (Phaser.Math.Distance.Between(p.x, p.y, this.closeBtn.x, this.closeBtn.y) < 16) { this.viewDistrict = ''; this.back(); return; }
    if (this.mode === 'map') { const l = this.mapLinks.find((l) => { const r = l.t.getBounds(); return p.x > r.x - 6 && p.x < r.right + 6 && p.y > r.y - 6 && p.y < r.bottom + 6; }); if (l) this.goDistrict(l.to); return; }
    if (this.mode !== 'menu') return; // map + controls stay open until closed
    const it = this.itemAt(p);
    if (!it) return;
    this.sel = this.items.indexOf(it); this.refresh();
    if (it.onUp) return;
    if (it.left && p.x < GAME_W / 2 - 20) it.left(); else (it.act ?? it.right)?.();
  }
  /** the menu line under a pointer: the nearest one, within half a line */
  private itemAt(p: Phaser.Input.Pointer) {
    let best: Item | undefined, bd = 1e9;
    for (const it of this.items) {
      const b = it.t!.getBounds(), d = Math.abs(p.y - b.centerY);
      if (d < bd && d < 8 && p.x > b.x - 30 && p.x < b.right + 30) { bd = d; best = it; }
    }
    return best;
  }

  private resume() {
    sfx.select();
    this.scene.resume(this.from);
    this.scene.stop();
  }

  private async quit() {
    ctx.save();
    sfx.select();
    await iris(this, 'close');
    this.scene.stop(this.from);
    this.scene.start('Title', {});
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.blinkT += dt;
    if (this.mode === 'map') {
      this.drawBlink();
      if (this.input2.justPressed('map') || this.input2.justPressed('back') || this.input2.justPressed('pause')) { this.viewDistrict = ''; this.resume(); return; }
      const nx = this.input2.moveX < -0.5 ? -1 : this.input2.moveX > 0.5 ? 1 : 0, ny = this.input2.moveY < -0.5 ? -1 : this.input2.moveY > 0.5 ? 1 : 0;
      const tx = this.input2.tapX(), ty = this.input2.tapY();
      const dx = tx || (nx && !this.lastNX ? nx : 0), dy = ty || (ny && !this.lastNY ? ny : 0);
      if (dx) this.goMap(dx < 0 ? 'w' : 'e'); else if (dy) this.goMap(dy < 0 ? 'n' : 's');
      this.lastNX = nx || tx; this.lastNY = ny || ty;
      return;
    }
    if (this.mode === 'controls') {
      if (this.input2.justPressed('back') || this.input2.justPressed('confirm')) this.back();
      return;
    }
    if (this.input2.justPressed('pause') || this.input2.justPressed('back')) { this.resume(); return; }
    if (this.input2.justPressed('map') && this.from === 'Explore') { this.show('map'); return; }
    const ny = this.input2.moveY < -0.5 ? -1 : this.input2.moveY > 0.5 ? 1 : 0;
    const nx = this.input2.moveX < -0.5 ? -1 : this.input2.moveX > 0.5 ? 1 : 0;
    if (ny && !this.lastNY) { this.sel = (this.sel + ny + this.items.length) % this.items.length; sfx.move(); this.refresh(); }
    if (nx && !this.lastNX) { const it = this.items[this.sel]; (nx < 0 ? it.left : it.right)?.(); }
    this.lastNY = ny; this.lastNX = nx;
    if (this.input2.justPressed('confirm')) this.items[this.sel].act?.();
  }
}
