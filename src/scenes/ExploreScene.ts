import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { InputManager } from '../input/InputManager';
import { TouchControls, wantsTouch } from '../input/TouchControls';
import { CityMap, type MapData, type Exit, OPPOSITE, exitSpan } from '../explore/CityMap';
import { TopDownPlayer } from '../explore/TopDownPlayer';
import { Traffic } from '../explore/Traffic';
import { Crowd } from '../explore/Crowd';
import { ctx } from '../core/ctx';
import { livability } from '../core/Livability';
import { networkPatches, networkLabel, missionNetwork } from '../data/network';
import { completeMission } from '../core/GameState';
import { UPGRADES } from '../data/upgrades';
import { MISSIONS, missionAvailable, districtOpen } from '../data/missions';
import { DISTRICTS, DISTRICT_ORDER } from '../data/districts';
import { text, iris, floatText, shake, bellRing, blinds, wrapLines } from '../ui/fx';
/** payoff headline: centred between the HUD (top left) and the info box (bottom), M3.1 */
const BANNER_Y = 104;
import { MAX_LIVES } from '../core/GameState';
import { award, awardOnce, fmtScore } from '../core/Score';
import { rankByTimeLeft, recordRank, rankLine } from '../core/Rank';
import { BikeBus } from '../explore/BikeBus';
import { DockDrop } from '../explore/DockDrop';
import { STATUS_GAP, type MapMission } from '../explore/guide';
import { submitRun } from '../core/Leaderboard';
import { music } from '../audio/Sequencer';
import { SONG_MAIN, SONG_IMPROVE, SONG_WIN } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { openPause, type MapInfo } from './PauseScene';
import type { Manifest } from './BootScene';

interface ExploreData { from?: 'mission' | 'district'; missionId?: string; won?: boolean; replay?: boolean; district?: string; /** M4.1: run this mission on the map (the Bike Bus; M4.3: or the Dock Drop) */ bikebus?: string; debug?: boolean; entry?: { side: 'w' | 'e' | 'n' | 's'; street?: string; dy?: number; y?: number; fromDistrict?: string } }
type Hud = { lives: Phaser.GameObjects.BitmapText; points: Phaser.GameObjects.BitmapText; box: Phaser.GameObjects.Graphics; meter: Phaser.GameObjects.Graphics; score: Phaser.GameObjects.BitmapText; tier: Phaser.GameObjects.BitmapText; stamina: Phaser.GameObjects.Graphics; prompt: Phaser.GameObjects.BitmapText; label: Phaser.GameObjects.BitmapText };

const DIR_V = [[1, 0], [0.7, 0.7], [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7]];

export class ExploreScene extends Phaser.Scene {
  private input2!: InputManager;
  private touch?: TouchControls;
  map!: CityMap;
  player!: TopDownPlayer;
  district = 'queenwest';
  private traffic!: Traffic;
  private crowd!: Crowd;
  private hud!: Hud;
  private markers: { id: string; x: number; y: number; g: Phaser.GameObjects.Container; done: boolean }[] = [];
  private toasts: Phaser.GameObjects.BitmapText[] = [];
  /** M4.15: when the "closed for now" note at a closed district's edge may show again */
  private closedToastAt = 0;
  private shownLiv = 60;
  private busy = false;
  private near: { kind: 'mission' | 'landmark'; id: string; replay?: boolean } | null = null;
  /** M4.1: a mission played on the map, while it runs (the Bike Bus; M4.3: the Dock Drop) */
  private em?: MapMission;
  /** upgrades + the bike network's streets so far (M4.3): what the map and its traffic show */
  private unlocked() { return [...ctx.state.upgrades, ...networkPatches(ctx.state.completedMissions)]; }
  private data0: ExploreData = {};

  constructor() { super('Explore'); }

  init(data: ExploreData) {
    this.data0 = data ?? {};
    const want = data?.district ?? ctx.state.player.district ?? 'queenwest';
    this.district = DISTRICTS[want] ? want : 'queenwest';
  }

  /** Districts load lazily: their building atlas, map and ground decals arrive when you ride in. */
  preload() {
    const m = this.registry.get('manifest') as Manifest;
    const d = m.districts?.[this.district];
    if (!d) return;
    if (!this.textures.exists(d.atlas.key)) this.load.atlas(d.atlas.key, d.atlas.png, d.atlas.json);
    if (!this.cache.json.exists(`map_${this.district}`)) this.load.json(`map_${this.district}`, d.map);
    for (const [k, p] of Object.entries(d.images)) if (!this.textures.exists(k)) this.load.image(k, p);
    if (this.load.list.size > 0) {
      const bar = this.add.graphics();
      this.load.on('progress', (p: number) => bar.clear().fillStyle(0x2a2536).fillRect(GAME_W / 2 - 60, GAME_H / 2, 120, 6).fillStyle(0x9bd35a).fillRect(GAME_W / 2 - 59, GAME_H / 2 + 1, 118 * p, 4));
      this.load.once('complete', () => bar.destroy());
    }
  }

  create() {
    const data = this.data0;
    this.busy = false;
    this.toasts = [];
    this.closedToastAt = 0;
    this.input2 = new InputManager(this);
    const md = this.cache.json.get(`map_${this.district}`) as MapData;
    this.map = new CityMap(this, md);
    for (const u of ctx.state.upgrades) for (const p of UPGRADES[u]?.mapPatches ?? []) if (md.improvements[p]) this.map.applyImprovement(p);
    for (const p of networkPatches(ctx.state.completedMissions)) if (md.improvements[p]) this.map.applyImprovement(p); // M4.3: the bike network

    let start = md.spawn;
    if (data.entry) {
      // arrive on the same street (matched by name; rows can differ between districts)
      const e = data.entry;
      const exits = md.exits ?? [];
      let ex = exits.find((x) => x.side === e.side && x.street === e.street && (!e.fromDistrict || x.to === e.fromDistrict));
      // M3.2: a connection can turn a corner (High Park's south edge -> the Waterfront's west end): the same
      // street and district on another side of the map
      const turned = !ex;
      if (!ex) ex = exits.find((x) => x.street === e.street && (!e.fromDistrict || x.to === e.fromDistrict));
      const side = ex?.side ?? e.side;
      // dy = how far along the exit's span the player was (rows for w/e exits, columns for n/s ones)
      const [lo, hi] = ex ? exitSpan(ex) : [0, 0];
      const along = ex ? (turned ? (lo + hi) / 2 : Phaser.Math.Clamp(lo + (e.dy ?? 40), lo + 8, hi - 8)) : undefined;
      if (side === 'n' || side === 's') start = { x: along ?? md.spawn.x, y: side === 'n' ? 30 : this.map.heightPx - 14 };
      else start = { x: side === 'w' ? 12 : this.map.widthPx - 12, y: along ?? e.y ?? md.spawn.y };
      data.entry = { ...e, side };
    }
    else if (ctx.state.player.district === this.district && ctx.state.player.x > 0 && ctx.state.player.x < this.map.widthPx && ctx.state.player.y < this.map.heightPx) start = ctx.state.player;
    const emKind = data.bikebus ? MISSIONS[data.bikebus]?.explore?.kind : undefined;
    const busDef = emKind === 'bikebus' ? md.bikebus : undefined, dockDef = emKind === 'docks' ? md.docks : undefined;
    if (busDef) start = { x: busDef.start[0], y: busDef.start[1] };
    if (dockDef) start = { x: dockDef.start[0], y: dockDef.start[1] };
    this.player = new TopDownPlayer(this, start.x, start.y);
    if (data.entry) this.player.dir = { w: 0, e: 4, n: 2, s: 6 }[data.entry.side];
    this.physics.world.setBounds(0, 0, this.map.widthPx, this.map.heightPx);
    this.physics.add.collider(this.player.sprite, this.map.solids);

    this.traffic = new Traffic(this, md.lanes, md.intersections, this.map.widthPx, this.map.heightPx, this.unlocked());
    this.traffic.setDensity(ctx.state.upgrades.length ? 0.8 : 1);
    this.crowd = new Crowd(this, md.walkways, md.critters ?? [], this.district === 'downtown' ? 44 : 34, md.underWalks ?? []);
    this.crowd.onSquirrelSpotted = () => {
      floatText(this, this.crowd.squirrelPos!.x, this.crowd.squirrelPos!.y - 16, 'THE WHITE SQUIRREL!', 'font_outline', 0xfff08a);
      if (!ctx.state.flags.whiteSquirrel) { ctx.state.flags.whiteSquirrel = true; this.toast('A RARE WHITE SQUIRREL:\nTRINITY BELLWOODS\' LOCAL CELEBRITY.'); }
      this.scorePop(awardOnce(ctx.state, 'egg_white_squirrel', 'egg'), 'EASTER EGG');
      ctx.save();
    };
    this.buildExitSigns(md.exits ?? []);
    this.buildLifeTokens(md);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.map.widthPx, this.map.heightPx).setRoundPixels(true);
    cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    cam.setBackgroundColor('#2a6e38');

    this.buildMarkers();
    this.buildHud();
    this.em = undefined;
    const emTime = data.bikebus ? MISSIONS[data.bikebus]?.explore?.time ?? 75 : 75;
    if (busDef) this.em = new BikeBus(this, busDef, emTime);
    else if (dockDef) this.em = new DockDrop(this, dockDef, emTime, (this.registry.get('manifest') as Manifest).shareCyclists ?? []);
    if (this.em) {
      const em = this.em;
      if (em.solids) this.physics.add.collider(this.player.sprite, em.solids);
      this.markers.forEach((mk) => mk.g.setVisible(false));
      this.time.delayedCall(700, () => this.toast(em.intro(wantsTouch()), 4200));
    }
    if (wantsTouch()) this.touch = new TouchControls(this, { map: true });
    this.scale.on('resize', this.layout, this);
    this.events.on('resume', () => this.input2.swallow());
    this.events.once('shutdown', () => { this.scale.off('resize', this.layout, this); if (!this.leaving) ctx.state.player = { scene: 'explore', district: this.district, x: this.player.x, y: this.player.y }; });

    music.play(SONG_MAIN, DISTRICTS[this.district]?.music);
    this.shownLiv = livability(ctx.state.upgrades);

    if (data.from === 'mission' && data.missionId && data.won && !data.replay) {
      void this.celebrate(data.missionId);
    } else {
      if (data.from === 'district') void blinds(this, 1, true); else void iris(this, 'open', GAME_W / 2, GAME_H / 2);
      if (data.from === 'mission' && data.replay) this.toast('MISSION REPLAYED.\nREPLAYS EARN NO POINTS.', 3200);
      if (data.from === 'district' || !ctx.state.flags[`visited_${this.district}`]) this.districtCard();
      ctx.state.flags[`visited_${this.district}`] = true;
      if (!ctx.state.flags.exploreHint) {
        ctx.state.flags.exploreHint = true;
        this.toast(wantsTouch() ? 'LEFT THUMB: RIDE    YELLOW: BOOST\nRED: BELL    MAP + II: TOP RIGHT' : 'WASD: RIDE  SHIFT: BOOST  SPACE: HOP\nQ: DASH  E: BELL  M: MAP  ESC: PAUSE', 6000);
      }
    }
    this.exposeDebug();
    if (DEBUG) this.input.keyboard?.on('keydown-T', () => { for (const id of Object.keys(md.improvements)) this.map.applyImprovement(id, true, this.player.x); });
  }

  private leaving = false;

  /** Big district name card on arrival. */
  private districtCard() {
    const d = DISTRICTS[this.district];
    // M3.3: on a dark band across the middle, clear of the HUD box (it used to sit over it on phones)
    const cy = Math.round(GAME_H / 2) - 10;
    const g = this.add.graphics().setScrollFactor(0).setDepth(20009).setAlpha(0).fillStyle(0x16121f, 0.7).fillRect(0, cy - 22, GAME_W, 46);
    const t = text(this, GAME_W / 2, cy - 6, d.name, 'font_big').setScrollFactor(0).setDepth(20010).setAlpha(0);
    const s = text(this, GAME_W / 2, cy + 14, d.sub, 'font_outline').setScrollFactor(0).setDepth(20010).setAlpha(0).setTint(0xfff08a);
    this.tweens.add({ targets: [t, s, g], alpha: 1, duration: 300, hold: 1800, yoyo: true, delay: 200, onComplete: () => { t.destroy(); s.destroy(); g.destroy(); } });
  }

  /** "< HIGH PARK" street signs where a street continues into the next district. */
  private buildExitSigns(exits: Exit[]) {
    const seen = new Set<string>();
    for (const e of exits) {
      const key = `${e.side}${e.to}${exitSpan(e)[0]}`;
      if (seen.has(key)) continue; seen.add(key);
      const name = DISTRICTS[e.to]?.name ?? e.to.toUpperCase();
      // M4.15: a closed district's sign is grey and still
      const open = districtOpen(e.to, ctx.state.completedMissions), tint = open ? 0xfff08a : 0x9793a6;
      if (e.side === 'n' || e.side === 's') {
        const cx = (e.x0! + e.x1!) / 2, y = e.side === 'n' ? 10 : this.map.heightPx - 10;
        const t = text(this, cx, y, e.side === 'n' ? `^ ${name}` : `v ${name}`, 'font_outline', 0.5).setOrigin(0.5, 0.5).setDepth(y + 60).setTint(tint);
        if (open) this.tweens.add({ targets: t, y: y + (e.side === 'n' ? -3 : 3), duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        continue;
      }
      const x = e.side === 'w' ? 6 : this.map.widthPx - 6;
      const t = text(this, x, e.y0! + 12, e.side === 'w' ? `< ${name}` : `${name} >`, 'font_outline', e.side === 'w' ? 0 : 1).setOrigin(e.side === 'w' ? 0 : 1, 0.5).setDepth(e.y0! + 40).setTint(tint);
      if (open) this.tweens.add({ targets: t, x: x + (e.side === 'w' ? -3 : 3), duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private buildMarkers() {
    this.markers.forEach((m) => m.g.destroy());
    const md = this.map.data;
    this.markers = md.markers.filter((m) => ctx.state.completedMissions.includes(m.id) || missionAvailable(m.id, ctx.state.completedMissions)).map((m) => {
      const done = ctx.state.completedMissions.includes(m.id);
      const g = this.add.container(m.x, m.y).setDepth(m.y);
      const ring = this.add.ellipse(0, 0, 26, 10, done ? 0x55a144 : 0xd42a24, 0.35).setStrokeStyle(1, done ? 0x9bd35a : 0xff6347);
      const arrow = this.add.triangle(0, -28, -5, 0, 5, 0, 0, 7, done ? 0x9bd35a : 0xf5c22e).setStrokeStyle(1, 0x16121f);
      const label = text(this, 0, -40, done ? (ctx.state.ranks[m.id] ? `FIXED! RANK ${ctx.state.ranks[m.id].rank}` : 'FIXED!') : MISSIONS[m.id]?.title ?? m.label, 'font_outline');
      label.setTint(done ? 0x9bd35a : 0xfff08a);
      g.add([ring, arrow, label]);
      this.tweens.add({ targets: arrow, y: -24, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: ring, scaleX: 1.25, scaleY: 1.25, alpha: 0.15, duration: 800, yoyo: true, repeat: -1 });
      return { id: m.id, x: m.x, y: m.y, g, done };
    });
  }

  private buildHud() {
    const box = this.add.graphics().setScrollFactor(0).setDepth(20000);
    box.fillStyle(0x16121f, 0.75).fillRoundedRect(4, 4, 118, 36, 3).lineStyle(1, 0x69657a).strokeRoundedRect(4, 4, 118, 36, 3);
    const label = text(this, 8, 8, 'LIVABILITY', 'font', 0).setScrollFactor(0).setDepth(20001).setTint(0x9bd35a);
    const score = text(this, 117, 8, '60', 'font', 0).setScrollFactor(0).setDepth(20001).setOrigin(1, 0);
    const meter = this.add.graphics().setScrollFactor(0).setDepth(20001);
    const tier = text(this, 8, 29, '', 'font', 0).setScrollFactor(0).setDepth(20001).setTint(0xfff08a);
    const stamina = this.add.graphics().setScrollFactor(0).setDepth(20001);
    const prompt = text(this, GAME_W / 2, GAME_H - 14, '', 'font_outline').setScrollFactor(0).setDepth(20001);
    // lives under the meter: a raccoon token + the count
    box.fillStyle(0x16121f, 0.75).fillRoundedRect(4, 42, 42, 14, 3).lineStyle(1, 0x69657a).strokeRoundedRect(4, 42, 42, 14, 3);
    this.add.image(13, 53, 'world', 'life_0').setOrigin(0.5, 1).setScrollFactor(0).setDepth(20001);
    const lives = text(this, 22, 46, '', 'font', 0).setScrollFactor(0).setDepth(20001).setTint(0xfff08a);
    // M3.1: the run's score, top right
    const points = text(this, GAME_W - 6, 6, '', 'font_outline', 0).setOrigin(1, 0).setScrollFactor(0).setDepth(20001);
    this.hud = { box, meter, score, tier, stamina, prompt, label, lives, points };
    this.drawLives();
    this.drawMeter(this.shownLiv);
  }

  private drawLives() { this.hud.lives.setText(`X${ctx.state.lives}`); this.hud.points.setText(fmtScore(ctx.state.score)); }
  /** points just earned on the map: a pop under the score + refresh the HUD */
  private scorePop(pts: number, what: string) {
    if (!pts) return;
    floatText(this, GAME_W - 30, wantsTouch() ? 54 : 26, `${what} +${pts}`, 'font_outline', 0xfff08a, 900).setScrollFactor(0).setDepth(20004).setOrigin(1, 0.5);
    this.drawLives();
  }
  /** easter eggs: ride into one to find it (once per run) */
  private checkEggs() {
    for (const e of this.map.data.eggs ?? []) {
      const px = this.player.x, py = this.player.y;
      if (px < e.x || px > e.x + e.w || py < e.y || py > e.y + e.h || ctx.state.flags[`score_egg_${e.id}`]) continue;
      const pts = awardOnce(ctx.state, `egg_${e.id}`, 'egg');
      sfx.ding();
      this.toast(`EASTER EGG: ${e.label}!\n${e.fact}`, 4500);
      this.scorePop(pts, 'EASTER EGG');
      ctx.save();
    }
  }

  /** hidden extra lives: a glinting raccoon token, once per spot */
  private lifeTokens: { s: Phaser.GameObjects.Sprite; key: string }[] = [];
  private buildLifeTokens(md: MapData) {
    this.lifeTokens = [];
    (md.lifeTokens ?? []).forEach((t, i) => {
      const key = `life_${this.district}_${i}`;
      if (ctx.state.flags[key]) return;
      const s = this.add.sprite(t.x, t.y, 'world', 'life_0').setOrigin(0.5, 1).setDepth(t.y).play('life_glint');
      this.tweens.add({ targets: s, y: t.y - 3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.lifeTokens.push({ s, key });
    });
  }
  private checkLifeTokens() {
    for (const t of this.lifeTokens) {
      if (!t.s.active || Phaser.Math.Distance.Between(this.player.x, this.player.y, t.s.x, t.s.y) > 14) continue;
      ctx.state.flags[t.key] = true;
      ctx.state.lives = Math.min(MAX_LIVES, ctx.state.lives + 1);
      sfx.ding(); sfx.bell();
      floatText(this, t.s.x, t.s.y - 20, '1UP!', 'font_big', 0xffffff, 600);
      this.scorePop(awardOnce(ctx.state, t.key, 'heart'), 'HEART');
      this.tweens.killTweensOf(t.s); t.s.destroy();
      this.toast(`EXTRA LIFE! LIVES: ${ctx.state.lives}`, 2500);
      this.drawLives();
      ctx.save();
    }
  }

  /** Re-anchor centred/right-aligned HUD when the view width changes. */
  private layout() {
    this.hud.prompt.setX(GAME_W / 2); this.hud.points.setX(GAME_W - 6);
    this.toasts.forEach((t) => t.active && t.setX(GAME_W / 2));
    if (wantsTouch() && window.innerHeight > window.innerWidth && !this.busy) openPause(this);
  }

  private drawMeter(v: number) {
    const g = this.hud.meter;
    g.clear();
    const x = 8, y = 18, w = 110, h = 7;
    g.fillStyle(0x2a2536).fillRect(x, y, w, h);
    const segs = 20;
    for (let i = 0; i < segs; i++) {
      const filled = (i + 1) / segs <= v / 100 + 0.001;
      const col = i < 12 ? 0xd9691c : i < 14 ? 0xf5c22e : i < 16 ? 0x9bd35a : i < 18 ? 0x55a144 : 0x35b2a6;
      g.fillStyle(filled ? col : 0x443f54).fillRect(x + 1 + i * 5.45, y + 1, 4, h - 2);
    }
    this.hud.score.setText(String(Math.round(v)));
    // M4.3 (Ivan): no tier names comparing Toronto to other cities: how much of the bike network is done instead
    this.hud.tier.setText(networkLabel(ctx.state.completedMissions));
  }

  private toast(msg: string, ms = 4200) {
    this.toasts.forEach((t) => t.destroy());
    // M4.16: during a map mission its status box has the bottom of the screen, so the toast sits above it
    // 1.0: anchored by its bottom edge, above the E: prompt line (a four-line easter egg ran onto the prompt);
    // and one bottom message at a time: a toast puts away an open plaque
    this.plaqueObj?.destroy(); this.plaqueObj = undefined;
    const t = text(this, GAME_W / 2, GAME_H - 24 - (this.em ? STATUS_GAP - 4 : 0), msg, 'font_outline').setOrigin(0.5, 1).setScrollFactor(0).setDepth(20002).setAlpha(0).setCenterAlign().setMaxWidth(GAME_W - 20);
    this.toasts = [t];
    this.tweens.add({ targets: t, alpha: 1, duration: 250, hold: ms, yoyo: true, onComplete: () => t.destroy() });
  }

  /** A bronze plaque: short centred lines, sized to fit any view width. */
  private plaque(lines: string[]) {
    this.plaqueObj?.destroy();
    this.toasts.forEach((t) => t.destroy()); this.toasts = []; // 1.0: the plaque takes the bottom of the screen
    const w = Math.min(GAME_W - 24, Math.max(...lines.map((l) => l.length)) * 6 + 24), h = lines.length * 11 + 14;
    const c = this.add.container(GAME_W / 2, GAME_H - 30 - h / 2).setScrollFactor(0).setDepth(20003).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x16121f).fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 5);
    g.fillStyle(0x74482a).fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    g.lineStyle(1, 0xd9a86c).strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 3);
    for (const [px, py] of [[-w / 2 + 5, -h / 2 + 5], [w / 2 - 5, -h / 2 + 5], [-w / 2 + 5, h / 2 - 5], [w / 2 - 5, h / 2 - 5]]) g.fillStyle(0xd9a86c).fillCircle(px, py, 1);
    c.add(g);
    lines.forEach((l, i) => c.add(text(this, 0, -h / 2 + 12 + i * 11, l, 'font').setTint(i === 0 ? 0xd9a86c : 0xffd3c4)));
    this.plaqueObj = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 200, hold: 4500, yoyo: true, onComplete: () => c.destroy() });
  }
  private plaqueObj?: Phaser.GameObjects.Container;

  /** Return-from-mission payoff: the city visibly changes. */
  private async celebrate(missionId: string) {
    this.busy = true;
    this.player.frozen = true;
    const mission = MISSIONS[missionId];
    const before = livability(ctx.state.upgrades);
    const firstTime = !ctx.state.completedMissions.includes(missionId);
    completeMission(ctx.state, missionId, mission?.upgrades ?? []);
    const after = livability(ctx.state.upgrades);
    ctx.save();
    void submitRun(ctx.state); // the online leaderboard, when it's configured (best-effort)
    this.drawLives();
    await iris(this, 'open', GAME_W / 2, GAME_H / 2, 450);
    music.stop();
    const cam = this.cameras.main;
    cam.stopFollow();
    // frame the street the upgrade changes, then pan along it while the improvement sweeps across
    const axis = mission?.focusAxis ?? 'x';
    let dur = 0;
    let banner: Phaser.GameObjects.BitmapText;
    // 1.0: the headline on a dark band (it sat on a mission marker's label as the camera swept the street)
    let band: Phaser.GameObjects.Graphics | undefined;
    const fitBand = () => { band ??= this.add.graphics().setScrollFactor(0).setDepth(20004); const b = banner.getBounds(); band.clear().fillStyle(0x16121f, 0.82).fillRoundedRect(b.x - 8, b.y - 4, b.width + 16, b.height + 8, 4); };
    if (axis === 'x') {
      const focusY = mission?.focusY ?? this.player.y;
      const startX = Phaser.Math.Clamp(mission?.focusX ?? this.player.x - 200, GAME_W / 2, this.map.widthPx - GAME_W / 2);
      cam.pan(startX, focusY, 600, 'Sine.easeInOut');
      await this.wait(700);
      banner = text(this, GAME_W / 2, BANNER_Y, 'THE CITY IS CHANGING...', 'font_big').setScrollFactor(0).setDepth(20005); fitBand();
      music.play(SONG_IMPROVE);
      for (const p of this.payoffPatches(mission)) dur = Math.max(dur, this.map.applyImprovement(p, true, startX - GAME_W / 2));
      cam.pan(startX + 420, focusY, Math.max(1400, dur * 0.6), 'Sine.easeInOut');
    } else {
      const fx = mission?.focusX ?? this.player.x, startY = Phaser.Math.Clamp(mission?.focusY ?? this.player.y - 150, GAME_H / 2, this.map.heightPx - GAME_H / 2);
      cam.pan(fx, startY, 600, 'Sine.easeInOut');
      await this.wait(700);
      banner = text(this, GAME_W / 2, BANNER_Y, 'THE CITY IS CHANGING...', 'font_big').setScrollFactor(0).setDepth(20005); fitBand();
      music.play(SONG_IMPROVE);
      for (const p of this.payoffPatches(mission)) dur = Math.max(dur, this.map.applyImprovement(p, true, startY - GAME_H / 2, 'y'));
      cam.pan(fx, startY + 360, Math.max(1400, dur * 0.7), 'Sine.easeInOut');
    }
    this.traffic.setUpgrades(this.unlocked());
    this.traffic.setDensity(0.8);
    await this.wait(Math.max(1600, dur * 0.6));
    const up = UPGRADES[mission.upgrades[0]];
    // the headline, wrapped onto lines that fit, big font scaled down if a word is still too wide
    banner.setText(up?.headline ?? up?.name ?? 'IMPROVED!').setMaxWidth(Math.round((GAME_W - 24) / 1)).setCenterAlign().setScale(1);
    if (banner.width > GAME_W - 16) banner.setScale((GAME_W - 16) / banner.width);
    fitBand();
    shake(this, 150, 0.004);
    sfx.ding();
    const o = { v: before };
    // 1.0: top centre, clear of the HUD box (it floated over BIKE NETWORK and the meter: text on text)
    floatText(this, GAME_W / 2, 30, `+${after - before} LIVABILITY`, 'font_outline', 0x9bd35a).setScrollFactor(0).setDepth(20006);
    this.tweens.add({ targets: o, v: after, duration: 1200, ease: 'Cubic.easeOut', onUpdate: () => { this.drawMeter(o.v); sfx.blip(); } });
    await this.wait(1300);
    // the evidence: in a box at the bottom; it stays until you press a key (and pages if it's long)
    await this.infoBox(up?.name ?? 'IMPROVED!', up?.blurb ?? '', up?.source, missionId);
    banner.destroy(); band?.destroy();
    cam.pan(this.player.x, this.player.y, 600, 'Sine.easeInOut');
    await this.wait(650);
    cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.buildMarkers();
    music.play(SONG_MAIN, DISTRICTS[this.district]?.music);
    this.player.frozen = false;
    this.busy = false;
    this.shownLiv = after;
    // M4: every mission done -> Dog Fjord concedes, then the report card and the credits
    if (Object.keys(MISSIONS).every((id) => ctx.state.completedMissions.includes(id)) && !ctx.state.flags.ended) {
      this.busy = true; this.player.frozen = true;
      await this.wait(1200);
      await iris(this, 'close');
      this.scene.start('Cutscene', { id: 'ending', next: 'Ending' });
      return;
    }
    if (!firstTime) return;
    // M4.3: the streets this mission added to the bike network (here or in other districts), then where to go next
    const added = missionNetwork(missionId);
    if (added.length) {
      const names = added.map((n) => n.name).filter((v, i, a) => a.indexOf(v) === i).join(' + ');
      this.toast(`${networkLabel(ctx.state.completedMissions)} STREETS\nNEW: ${names}`, 3200);
      this.time.delayedCall(3900, () => this.nextHint(missionId));
    } else this.nextHint(missionId);
  }

  /** the map patches a mission's payoff sweeps in here: its upgrades', and its bike network streets on this map */
  private payoffPatches(mission: (typeof MISSIONS)[string] | undefined) {
    if (!mission) return [];
    return [...mission.upgrades.flatMap((u) => UPGRADES[u].mapPatches), ...missionNetwork(mission.id).map((n) => `net_${n.id}`)];
  }

  /**
   * A semi-transparent box at the bottom of the screen: a title line + up to 3 lines of text per page.
   * It waits for E / Enter / a tap; longer text pages through (M2.1: the payoff text used to vanish).
   */
  private infoBox(title: string, body: string, source?: string, shareMission?: string): Promise<void> {
    return new Promise((resolve) => {
      // M4.18: the lines stop short of the E > / TAP prompt in the bottom-right corner (a long third line ran under it)
      const wrapW = GAME_W - 62;
      const lines = wrapLines(this, 'font_outline', body, wrapW).filter((l) => l);
      const pages: string[][] = [];
      for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
      // M3.3 (Ivan): the claim's source, on its own page (the links are under ABOUT > SOURCES and in the docs)
      if (source) pages.push(['SOURCE:', ...wrapLines(this, 'font_outline', source, wrapW).slice(0, 2)]);
      if (!pages.length) pages.push(['']);
      const h = 52, y = GAME_H - h - 6;
      const box = this.add.graphics().setScrollFactor(0).setDepth(20010);
      box.fillStyle(0x16121f, 0.85).fillRoundedRect(8, y, GAME_W - 16, h, 4).lineStyle(1, 0x9bd35a).strokeRoundedRect(8, y, GAME_W - 16, h, 4);
      const tt = text(this, 16, y + 5, title, 'font', 0).setScrollFactor(0).setDepth(20011).setTint(0x9bd35a);
      const bt = text(this, 16, y + 17, '', 'font_outline', 0).setScrollFactor(0).setDepth(20011);
      const pg = text(this, GAME_W - 16, y + 5, '', 'font', 1).setScrollFactor(0).setDepth(20011).setOrigin(1, 0).setTint(0x9793a6);
      const arrow = text(this, GAME_W - 18, y + h - 10, wantsTouch() ? 'TAP' : 'E >', 'font', 1).setScrollFactor(0).setDepth(20011).setOrigin(1, 0).setTint(0xfff08a);
      this.tweens.add({ targets: arrow, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
      // M4.1 (Ivan): a small SHARE button after each mission (S, or tap it): the poster overlay
      // M4.4 (Ivan missed it after Save the Science): a boxed button, not a line of text
      const share = shareMission ? text(this, GAME_W - 20, y - 11, wantsTouch() ? 'SHARE A POSTER' : 'S: SHARE A POSTER', 'font_outline', 1).setScrollFactor(0).setDepth(20012).setOrigin(1, 0.5).setTint(0xfff08a) : undefined;
      const shareBox = share ? this.add.graphics().setScrollFactor(0).setDepth(20011) : undefined;
      if (share && shareBox) { const r = share.getBounds(); shareBox.fillStyle(0x25529b, 0.95).fillRoundedRect(r.x - 6, r.y - 4, r.width + 12, r.height + 8, 3).lineStyle(1, 0x7cc6f2).strokeRoundedRect(r.x - 6, r.y - 4, r.width + 12, r.height + 8, 3); this.tweens.add({ targets: [share], alpha: 0.6, duration: 600, yoyo: true, repeat: -1 }); }
      const openShare = () => { sfx.select(); this.scene.launch('Share', { from: 'Explore', mission: shareMission }); this.scene.pause(); ready = this.time.now + 500; };
      const sKey = shareMission ? this.input.keyboard?.addKey('S') : undefined;
      const onS = () => openShare();
      sKey?.on('down', onS);
      let page = 0, ready = 0;
      const show = () => { bt.setText(pages[page].join('\n')); pg.setText(pages.length > 1 ? `${page + 1}/${pages.length}` : ''); ready = this.time.now + 350; };
      show();
      const advance = (p?: Phaser.Input.Pointer) => {
        if (share && p && share.getBounds().contains(p.x, p.y)) { openShare(); return; }
        if (this.time.now < ready) return;
        sfx.select();
        if (++page < pages.length) { show(); return; }
        this.events.off('update', poll); this.input.off('pointerdown', advance);
        [box, tt, bt, pg, arrow].forEach((o) => o.destroy()); share?.destroy(); shareBox?.destroy(); sKey?.off('down', onS);
        resolve();
      };
      const poll = () => { if (this.input2.justPressed('act') || this.input2.justPressed('confirm')) advance(); };
      this.events.on('update', poll);
      this.input.on('pointerdown', advance);
    });
  }

  /** After a mission: where to go next. */
  private nextHint(done: string) {
    const open = Object.values(MISSIONS).filter((m) => !ctx.state.completedMissions.includes(m.id) && missionAvailable(m.id, ctx.state.completedMissions));
    if (!open.length) { this.toast('EVERY MISSION SO FAR: FIXED!\nMORE OF THE CITY OPENS SOON.', 5000); return; }
    if (done === 'bike_lane_war') { this.toast('NEW MISSIONS IN QUEEN WEST.\nNOW OPEN: HIGH PARK (WEST), DOWNTOWN (EAST)', 5500); return; }
    // M4.15: the districts this mission opened
    const before = ctx.state.completedMissions.filter((x) => x !== done);
    const opened = DISTRICT_ORDER.filter((d) => districtOpen(d, ctx.state.completedMissions) && !districtOpen(d, before));
    if (opened.length) { this.toast(`NOW OPEN: ${opened.map((d) => DISTRICTS[d].name).join(' + ')}\n${open.length} MISSION${open.length > 1 ? 'S' : ''} LEFT`, 5000); return; }
    const where = open.map((m) => DISTRICTS[m.district]?.name ?? m.district).filter((v, i, a) => a.indexOf(v) === i).join(', ');
    this.toast(`${open.length} MISSION${open.length > 1 ? 'S' : ''} LEFT: ${where}`, 4500);
  }

  private wait(ms: number) { return new Promise<void>((r) => this.time.delayedCall(ms, r)); }

  private async startMission(id: string, replay = false) {
    if (this.busy) return;
    this.busy = true;
    this.player.frozen = true;
    sfx.select();
    ctx.state.player = { scene: 'explore', district: this.district, x: this.player.x, y: this.player.y };
    ctx.save();
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(this.player.x, this.player.y - 10, 400, 'Sine.easeInOut');
    cam.zoomTo(2, 600, 'Cubic.easeIn');
    await this.wait(350);
    await iris(this, 'close', GAME_W / 2, GAME_H / 2 - 10, 450);
    const brief = MISSIONS[id]?.briefing;
    // M4.1: an explore mission (the Bike Bus) runs here on the map, after its briefing
    const exp = MISSIONS[id]?.explore;
    const [to, toData] = exp ? ['Explore', { district: MISSIONS[id].district, bikebus: id, replay }] as const : ['Action', { mission: id, replay }] as const;
    if (brief) this.scene.start('Cutscene', { id: brief, next: to, nextData: toData });
    else this.scene.start(to, toData);
  }

  /** M4.1: a map mission is over: won (the Bike Bus reached the school; M4.3: every dock set) or late (again from the start) */
  private async finishExplore(won: boolean) {
    if (this.busy || !this.em) return;
    this.busy = true; this.player.frozen = true;
    const data = this.data0 as ExploreData, id = data.bikebus!, m = MISSIONS[id], replay = !!data.replay;
    const em = this.em;
    em.hideHud(); this.toasts.forEach((t) => t.setVisible(false));
    const head = (msg: string, sub: string) => {
      const t = text(this, GAME_W / 2, 66, msg, 'font_big').setScrollFactor(0).setDepth(20030);
      t.setScale(0.1); this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.easeOut' });
      const st = text(this, GAME_W / 2, 84, sub, 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(20030).setCenterAlign();
      // 1.0: on a dark band, like the side-view result cards (it sat on the street's shop signs)
      this.add.graphics().setScrollFactor(0).setDepth(20029).fillStyle(0x16121f, 0.86).fillRect(0, 66 - t.height / 2 - 6, GAME_W, st.y + st.height + 6 - (66 - t.height / 2 - 6));
    };
    if (!won) {
      music.stop(); sfx.hurt();
      head(...em.lateCard());
      await this.wait(2200);
      await iris(this, 'close', GAME_W / 2, GAME_H / 2, 450);
      this.leaving = true;
      this.scene.restart({ ...data, from: undefined });
      return;
    }
    music.play(SONG_WIN);
    const firstWin = !ctx.state.completedMissions.includes(id) && !replay;
    const earned = firstWin ? award(ctx.state, 'mission') : 0;
    const [wh, ws] = em.winCard();
    // M4.3: the rank, on the time left on the clock
    const r = { rank: rankByTimeLeft(em.t / (m.explore?.time ?? 75)), detail: `${Math.ceil(em.t)} S LEFT` };
    const rec = recordRank(ctx.state, id, r);
    head(wh, `${rankLine(r, rec)}\n${ws}\n${replay ? 'REPLAY: NO POINTS' : `SCORE +${earned}${firstWin ? ' (MISSION BONUS)' : ''}`}`);
    await this.wait(2200);
    await iris(this, 'close', GAME_W / 2, GAME_H / 2, 450);
    this.leaving = true;
    ctx.save();
    const next = { from: 'mission', missionId: id, won: true, district: m.district, replay };
    const [to, toData] = data.debug ? ['Title', { replay: { kind: 'mission', id } }] as const : ['Explore', next] as const;
    // after every second win Dog Fjord reacts (as after a side-view mission)
    const done = ctx.state.completedMissions.includes(id) ? ctx.state.completedMissions.length : ctx.state.completedMissions.length + 1;
    const beat = !replay && !data.debug && [2, 4, 6].includes(done) && !ctx.state.flags[`fjord_${done}`] ? `fjord_${done / 2}` : null;
    if (beat) { ctx.state.flags[`fjord_${done}`] = true; ctx.save(); }
    const ids = [m.debrief, beat].filter((x): x is string => !!x);
    const vars = { LIV: String(livability([...ctx.state.upgrades, ...m.upgrades])) };
    if (ids.length) this.scene.start('Cutscene', { ids, vars, next: to, nextData: toData });
    else this.scene.start(to, toData);
  }

  /** Ride off the edge of the map along a street: the next district loads. */
  private async goDistrict(e: Exit) {
    if (this.busy) return;
    this.busy = true; this.leaving = true;
    this.player.frozen = true;
    const [lo, hi] = exitSpan(e), ns = e.side === 'n' || e.side === 's';
    const entry = { side: OPPOSITE[e.side], street: e.arrive ?? e.street, dy: Phaser.Math.Clamp(ns ? this.player.x : this.player.y, lo + 8, hi - 8) - lo, fromDistrict: this.district };
    ctx.state.player = { scene: 'explore', district: e.to, x: -1, y: -1 };
    ctx.save();
    sfx.chain();
    await blinds(this, 260);
    this.scene.start('Explore', { from: 'district', district: e.to, entry });
  }

  minimapInfo(): MapInfo {
    const route = this.em?.route();
    return { map: this.map, district: this.district, player: { x: this.player.x, y: this.player.y }, markers: this.em ? [] : this.markers.map((m) => ({ x: m.x, y: m.y, label: MISSIONS[m.id]?.title ?? m.id, done: m.done })), route };
  }

  update(_t: number, dt: number) {
    this.input2.update();
    if (!this.busy && this.input2.justPressed('pause')) { openPause(this); return; }
    if (!this.busy && this.input2.justPressed('map')) { openPause(this, 'map'); return; }
    this.player.update(this.input2, dt);
    if (this.em && !this.busy) {
      this.em.update(dt, this.player.x, this.player.y);
      if (this.em.state !== 'ride') void this.finishExplore(this.em.state === 'won');
    }
    this.traffic.update(dt, this.player.x, this.player.y);
    this.crowd.update(dt, this.player.x, this.player.y, this.cameras.main.worldView);
    this.map.updateOcclusion(this.player.x, this.player.y);
    this.checkLifeTokens();
    this.checkEggs();
    // district edges: riding off the map along a street that continues (not while leading the Bike Bus)
    if (!this.busy && !this.em) {
      const px = this.player.x, py = this.player.y;
      for (const e of this.map.data.exits ?? []) {
        const [lo, hi] = exitSpan(e), along = e.side === 'n' || e.side === 's' ? px : py;
        if (along < lo || along > hi) continue;
        const m = this.input2, W = this.map.widthPx, H = this.map.heightPx;
        if ((e.side === 'w' && px < 8 && m.moveX < -0.2) || (e.side === 'e' && px > W - 8 && m.moveX > 0.2)
          || (e.side === 'n' && py < 10 && m.moveY < -0.2) || (e.side === 's' && py > H - 10 && m.moveY > 0.2)) {
          // M4.15 (Ivan): a district opens once a mission appears there; until then its streets end at the map's edge
          if (districtOpen(e.to, ctx.state.completedMissions)) void this.goDistrict(e);
          else if (this.time.now > this.closedToastAt) { this.closedToastAt = this.time.now + 5000; sfx.move(); this.toast(`${DISTRICTS[e.to]?.name ?? e.to.toUpperCase()} IS CLOSED FOR NOW.
IT OPENS WHEN A MISSION APPEARS THERE.`, 2600); }
          break;
        }
      }
    }
    // what's nearby: a mission marker or a landmark
    this.near = null;
    // M3.3 (Ivan): a FIXED marker can be replayed, for no points
    for (const m of this.markers) if (!this.em && Phaser.Math.Distance.Between(this.player.x, this.player.y, m.x, m.y) < 22) this.near = { kind: 'mission', id: m.id, replay: m.done };
    if (!this.near) for (const l of this.map.data.landmarks ?? []) if (Phaser.Math.Distance.Between(this.player.x, this.player.y, l.x, l.y + 24) < 40) this.near = { kind: 'landmark', id: l.id };
    const key = wantsTouch() ? 'RED' : 'E';
    this.hud.prompt.setText(this.busy || !this.near ? '' : this.near.kind === 'mission' ? (this.near.replay ? `${key}: REPLAY (NO POINTS)` : `${key}: START MISSION`) : `${key}: READ THE PLAQUE`);
    this.touch?.setLabel('act', this.near ? (this.near.kind === 'mission' ? 'GO!' : 'READ') : 'BELL');
    if (!this.busy && this.input2.justPressed('act')) {
      if (this.near?.kind === 'mission') void this.startMission(this.near.id, !!this.near.replay);
      else if (this.near?.kind === 'landmark') {
        const l = this.map.data.landmarks!.find((x) => x.id === this.near!.id)!;
        sfx.select(); this.plaque([l.label, ...l.fact.split('\n')]);
        this.scorePop(awardOnce(ctx.state, `plaque_${this.district}_${l.id}`, 'plaque'), 'PLAQUE');
        ctx.save();
      } else {
        // the bell rings at the handlebars, in front of the raccoon
        sfx.bell();
        const [vx, vy] = DIR_V[this.player.dir];
        bellRing(this, this.player.x + vx * 7, this.player.y + vy * 3 - 14 - this.player.z, this.player.y + 3);
        // 1.0: a bell for the mission (an SUV, the clutter crew) isn't answered by the street: their words landed on each other
        if (!this.em?.bell(this.player.x, this.player.y)) this.crowd.bell(this.player.x, this.player.y);
      }
    }
    // stamina bar under the player when boosting / recovering
    const st = this.hud.stamina;
    st.clear();
    if (this.player.stamina < 100) {
      const cam = this.cameras.main;
      const sx = (this.player.x - cam.worldView.x) * cam.zoom, sy = (this.player.y - cam.worldView.y) * cam.zoom + 5;
      st.fillStyle(0x16121f, 0.8).fillRect(sx - 9, sy, 18, 3).fillStyle(this.player.stamina > 35 ? 0xf5c22e : 0xd42a24).fillRect(sx - 8, sy + 1, (16 * this.player.stamina) / 100, 1);
    }
  }

  private exposeDebug() {
    const w = window as unknown as { __TP?: Record<string, unknown> };
    w.__TP = { ...(w.__TP ?? {}), scene: 'Explore', district: this.district, state: ctx.state, save: () => ctx.save(), player: () => ({ x: this.player.x, y: this.player.y }), teleport: (x: number, y: number) => this.player.sprite.setPosition(x, y), startMission: (id: string) => this.startMission(id), improve: (id: string) => this.map.applyImprovement(id, true, this.player.x), improveNow: (id: string) => this.map.applyImprovement(id, false), traffic: () => this.traffic.count, map: this.map.data,
      goto: (district: string, y?: number) => this.scene.start('Explore', { from: 'district', district, entry: y !== undefined ? { side: 'w', y } : undefined }),
      exits: () => this.map.data.exits,
      markers: () => this.markers.map((m) => m.id), applied: (id: string) => this.map.isApplied(id), hudTier: () => this.hud.tier.text, busy: () => this.busy, song: () => music.current, bus: () => this.em };
  }
}
