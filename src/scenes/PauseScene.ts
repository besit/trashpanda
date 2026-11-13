// Pause overlay: menu (resume / controls / volumes / shake / quit) and the city map.
// Launched on top of Explore or Action, which are paused underneath.
import Phaser from 'phaser';
import { DIFFICULTY, fmtScore } from '../core/Score';
import { DISTRICTS, DISTRICT_ORDER } from '../data/districts';
import { MISSIONS, missionAvailable } from '../data/missions';
import { GAME_W, GAME_H } from '../config';
import { InputManager, CONTROLS_KEYS, CONTROLS_ALT, CONTROLS_PAD, touchState } from '../input/InputManager';
import { wantsTouch } from '../input/TouchControls';
import { text, iris } from '../ui/fx';
import { ctx } from '../core/ctx';
import { music } from '../audio/Sequencer';
import { sfx } from '../audio/sfx';
import type { CityMap, MapData } from '../explore/CityMap';
import { UPGRADES } from '../data/upgrades';
import { fullscreenSupported, isFullscreen, isInstalled, toggleFullscreen } from '../core/fullscreen';

export interface PauseData { from: string; mode?: 'menu' | 'map' | 'controls' }
export interface MapInfo { map: CityMap; district?: string; player: { x: number; y: number }; markers: { x: number; y: number; label: string; done: boolean }[] }

type Item = { label: () => string; act?: () => void; left?: () => void; right?: () => void; t?: Phaser.GameObjects.BitmapText; /** fires on pointerUP (browsers only allow fullscreen from a touch's pointerup) */ onUp?: boolean };

/** Open the pause overlay from a gameplay scene (no-op if already open). */
export function openPause(scene: Phaser.Scene, mode: PauseData['mode'] = 'menu') {
  if (scene.scene.isActive('Pause') || scene.scene.isPaused()) return;
  sfx.select();
  scene.scene.launch('Pause', { from: scene.scene.key, mode } satisfies PauseData);
  scene.scene.pause();
}

export class PauseScene extends Phaser.Scene {
  private input2!: InputManager;
  private from = '';
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
      ...(this.from === 'Explore' ? [{ label: () => 'CITY MAP', act: () => this.show('map') }] : []),
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
      CONTROLS_KEYS.forEach(([k, v], i) => { this.root.add(text(this, cx - 8, 46 + i * 13, k, 'font_outline', 0).setOrigin(1, 0).setTint(0xfff08a)); this.root.add(text(this, cx + 8, 46 + i * 13, v, 'font_outline', 0)); });
      this.root.add(text(this, cx, 146, 'IN MISSIONS: E SWINGS THE PUMP (3-HIT COMBO),', 'font').setTint(0xc9c5d1));
      this.root.add(text(this, cx, 156, 'Q DASHES THROUGH RATS, JUMP ON THEIR HEADS.', 'font').setTint(0xc9c5d1));
      this.root.add(text(this, cx, 174, CONTROLS_ALT, 'font').setTint(0x9793a6));
      this.root.add(text(this, cx, 184, CONTROLS_PAD, 'font').setTint(0x9793a6));
    }
    this.root.add(text(this, cx, GAME_H - 12, wantsTouch() ? 'X: BACK' : 'ESC / E: BACK', 'font').setTint(0x9793a6));
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
    this.root.add(text(this, cx, 10, DISTRICTS[view]?.name ?? 'TORONTO', 'font_big'));
    // the city west to east: the district on screen is marked, "YOU" where the raccoon is, open missions counted
    // M3: five districts: > < = on screen, N! = open missions; where you are moved to the footer
    const makeStrip = (short: boolean) => DISTRICT_ORDER.map((d) => {
      const open = Object.values(MISSIONS).filter((m) => m.district === d && !ctx.state.completedMissions.includes(m.id) && missionAvailable(m.id, ctx.state.completedMissions)).length;
      return `${d === view ? '>' : ''}${short ? DISTRICTS[d].short : DISTRICTS[d].name}${open ? ` ${open}!` : ''}${d === view ? '<' : ''}`;
    }).join('  ');
    let strip = makeStrip(false);
    if (strip.length * 6 > GAME_W - 64) strip = makeStrip(true); // clear of the close button
    this.root.add(text(this, cx, 24, strip, 'font').setTint(0xc9c5d1));
    // paging arrows (also tappable)
    const vi = DISTRICT_ORDER.indexOf(view);
    if (vi > 0) this.root.add(text(this, 14, 12, '<', 'font_big').setTint(0xfff08a));
    if (vi < DISTRICT_ORDER.length - 1) this.root.add(text(this, GAME_W - 40, 12, '>', 'font_big').setTint(0xfff08a));
    if (!md) return;
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
      for (const u of ctx.state.upgrades) for (const p of UPGRADES[u]?.mapPatches ?? []) for (const [x, y, t] of md.improvements[p]?.tiles ?? []) if (ground[y]) ground[y][x] = t;
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
    const availW = GAME_W - 24, availH = GAME_H - 54;
    const s = Math.max(1, Math.floor(Math.min(availW / md.width, availH / md.height) * 2) / 2);
    const w = md.width * s, h = md.height * s;
    const x0 = Math.round(cx - w / 2), y0 = Math.round(34 + (availH - h) / 2);
    this.mapRect = { x: x0, y: y0, s: s / md.tileSize };
    const frame = this.add.graphics();
    frame.fillStyle(0x16121f).fillRect(x0 - 3, y0 - 3, w + 6, h + 6).lineStyle(1, 0xf6f2e9).strokeRect(x0 - 2.5, y0 - 2.5, w + 5, h + 5);
    this.root.add(frame);
    this.root.add(this.add.image(x0, y0, key).setOrigin(0).setScale(s));
    for (const l of md.labels ?? []) {
      const t = text(this, x0 + l.x * this.mapRect.s, y0 + l.y * this.mapRect.s, l.text, 'font').setTint(l.kind === 'landmark' ? 0xfff08a : l.kind === 'exit' ? 0x9bd35a : 0xf6f2e9);
      if (l.vertical) t.setAngle(-90);
      this.root.add(t);
    }
    // markers for the district on screen; the raccoon only where it is
    this.viewMarkers = live && this.info ? this.info.markers : md.markers.filter((m) => ctx.state.completedMissions.includes(m.id) || missionAvailable(m.id, ctx.state.completedMissions)).map((m) => ({ x: m.x, y: m.y, label: m.label, done: ctx.state.completedMissions.includes(m.id) }));
    this.viewHasPlayer = !!live;
    this.blink = this.add.graphics();
    this.root.add(this.blink);
    this.root.add(text(this, cx, GAME_H - 9, wantsTouch() ? `< > TAP THE ARROWS   YOU: ${DISTRICTS[here]?.short ?? ''}   X: CLOSE` : `A/D: DISTRICTS   YOU: ${DISTRICTS[here]?.name ?? ''}   M / ESC: CLOSE`, 'font').setTint(0x9793a6));
    this.drawBlink();
  }
  private viewMarkers: { x: number; y: number; label: string; done: boolean }[] = [];
  private viewHasPlayer = true;

  private pageMap(dir: number) {
    const i = DISTRICT_ORDER.indexOf(this.viewDistrict) + dir;
    if (i < 0 || i >= DISTRICT_ORDER.length) return;
    this.viewDistrict = DISTRICT_ORDER[i];
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
    if (this.mode === 'map' && p.y < 34) { if (p.x < 60) this.pageMap(-1); else if (p.x > GAME_W - 70) this.pageMap(1); return; }
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
    this.scene.start('Title');
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.blinkT += dt;
    if (this.mode === 'map') {
      this.drawBlink();
      if (this.input2.justPressed('map') || this.input2.justPressed('back') || this.input2.justPressed('pause')) { this.viewDistrict = ''; this.resume(); return; }
      const nx = this.input2.moveX < -0.5 ? -1 : this.input2.moveX > 0.5 ? 1 : 0;
      const tx = this.input2.tapX();
      if (tx) this.pageMap(tx);
      else if (nx && !this.lastNX) this.pageMap(nx);
      this.lastNX = nx || tx;
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
