import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { InputManager } from '../input/InputManager';
import { TouchControls, wantsTouch } from '../input/TouchControls';
import { CityMap, type MapData } from '../explore/CityMap';
import { TopDownPlayer } from '../explore/TopDownPlayer';
import { Traffic } from '../explore/Traffic';
import { Crowd } from '../explore/Crowd';
import { ctx } from '../core/ctx';
import { livability, tierName } from '../core/Livability';
import { completeMission } from '../core/GameState';
import { UPGRADES } from '../data/upgrades';
import { MISSIONS } from '../data/missions';
import { text, iris, floatText, shake, bellRing } from '../ui/fx';
import { music } from '../audio/Sequencer';
import { SONG_MAIN, SONG_IMPROVE } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { openPause, type MapInfo } from './PauseScene';

interface ExploreData { from?: 'mission'; missionId?: string; won?: boolean }
type Hud = { box: Phaser.GameObjects.Graphics; meter: Phaser.GameObjects.Graphics; score: Phaser.GameObjects.BitmapText; tier: Phaser.GameObjects.BitmapText; stamina: Phaser.GameObjects.Graphics; prompt: Phaser.GameObjects.BitmapText; label: Phaser.GameObjects.BitmapText };

const DIR_V = [[1, 0], [0.7, 0.7], [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7]];

export class ExploreScene extends Phaser.Scene {
  private input2!: InputManager;
  private touch?: TouchControls;
  map!: CityMap;
  player!: TopDownPlayer;
  private traffic!: Traffic;
  private crowd!: Crowd;
  private hud!: Hud;
  private markers: { id: string; x: number; y: number; g: Phaser.GameObjects.Container; done: boolean }[] = [];
  private toasts: Phaser.GameObjects.BitmapText[] = [];
  private shownLiv = 60;
  private busy = false;
  private near: { kind: 'mission' | 'landmark'; id: string } | null = null;

  constructor() { super('Explore'); }

  create(data: ExploreData) {
    this.busy = false;
    this.toasts = [];
    this.input2 = new InputManager(this);
    const md = this.cache.json.get('map_queenwest') as MapData;
    this.map = new CityMap(this, md);
    for (const u of ctx.state.upgrades) for (const p of UPGRADES[u]?.mapPatches ?? []) this.map.applyImprovement(p);

    const start = ctx.state.player.x > 0 && ctx.state.player.x < this.map.widthPx ? ctx.state.player : md.spawn;
    this.player = new TopDownPlayer(this, start.x, start.y);
    this.physics.world.setBounds(0, 0, this.map.widthPx, this.map.heightPx);
    this.physics.add.collider(this.player.sprite, this.map.solids);

    this.traffic = new Traffic(this, md.lanes, md.intersections, this.map.widthPx, this.map.heightPx, ctx.state.upgrades);
    this.traffic.setDensity(ctx.state.upgrades.length ? 0.8 : 1);
    this.crowd = new Crowd(this, md.walkways, md.critters ?? [], 34);
    this.crowd.onSquirrelSpotted = () => {
      floatText(this, this.crowd.squirrelPos!.x, this.crowd.squirrelPos!.y - 16, 'THE WHITE SQUIRREL!', 'font_outline', 0xfff08a);
      if (!ctx.state.flags.whiteSquirrel) { ctx.state.flags.whiteSquirrel = true; this.toast('A RARE WHITE SQUIRREL:\nTRINITY BELLWOODS\' LOCAL CELEBRITY.'); ctx.save(); }
    };

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.map.widthPx, this.map.heightPx).setRoundPixels(true);
    cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    cam.setBackgroundColor('#2a6e38');

    this.buildMarkers(md);
    this.buildHud();
    if (wantsTouch()) this.touch = new TouchControls(this, { map: true });
    this.scale.on('resize', this.layout, this);
    this.events.on('resume', () => this.input2.swallow());
    this.events.once('shutdown', () => { this.scale.off('resize', this.layout, this); ctx.state.player = { scene: 'explore', x: this.player.x, y: this.player.y }; });

    music.play(SONG_MAIN);
    this.shownLiv = livability(ctx.state.upgrades);

    if (data?.from === 'mission' && data.missionId && data.won) {
      void this.celebrate(data.missionId);
    } else {
      void iris(this, 'open', GAME_W / 2, GAME_H / 2);
      if (!ctx.state.flags.exploreHint) {
        ctx.state.flags.exploreHint = true;
        this.toast(wantsTouch() ? 'LEFT THUMB: RIDE    YELLOW: BOOST\nRED: BELL    MAP + II: TOP RIGHT' : 'WASD: RIDE  SHIFT: BOOST  SPACE: HOP\nQ: DASH  E: BELL  M: MAP  ESC: PAUSE', 6000);
      }
    }
    this.exposeDebug();
    if (DEBUG) this.input.keyboard?.on('keydown-T', () => { this.map.applyImprovement('queen_protected_lanes', true, this.player.x); });
  }

  private buildMarkers(md: MapData) {
    this.markers.forEach((m) => m.g.destroy());
    this.markers = md.markers.map((m) => {
      const done = ctx.state.completedMissions.includes(m.id);
      const g = this.add.container(m.x, m.y).setDepth(m.y);
      const ring = this.add.ellipse(0, 0, 26, 10, done ? 0x55a144 : 0xd42a24, 0.35).setStrokeStyle(1, done ? 0x9bd35a : 0xff6347);
      const arrow = this.add.triangle(0, -28, -5, 0, 5, 0, 0, 7, done ? 0x9bd35a : 0xf5c22e).setStrokeStyle(1, 0x16121f);
      const label = text(this, 0, -40, done ? 'FIXED!' : MISSIONS[m.id]?.title ?? m.label, 'font_outline');
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
    this.hud = { box, meter, score, tier, stamina, prompt, label };
    this.drawMeter(this.shownLiv);
  }

  /** Re-anchor centred/right-aligned HUD when the view width changes. */
  private layout() {
    this.hud.prompt.setX(GAME_W / 2);
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
    this.hud.tier.setText(tierName(Math.round(v)));
  }

  private toast(msg: string, ms = 4200) {
    this.toasts.forEach((t) => t.destroy());
    const t = text(this, GAME_W / 2, GAME_H - 38, msg, 'font_outline').setScrollFactor(0).setDepth(20002).setAlpha(0).setCenterAlign();
    this.toasts = [t];
    this.tweens.add({ targets: t, alpha: 1, duration: 250, hold: ms, yoyo: true, onComplete: () => t.destroy() });
  }

  /** Return-from-mission payoff: the city visibly changes. */
  private async celebrate(missionId: string) {
    this.busy = true;
    this.player.frozen = true;
    const mission = MISSIONS[missionId];
    const before = livability(ctx.state.upgrades);
    completeMission(ctx.state, missionId, mission?.upgrades ?? []);
    const after = livability(ctx.state.upgrades);
    ctx.save();
    await iris(this, 'open', GAME_W / 2, GAME_H / 2, 450);
    music.stop();
    const cam = this.cameras.main;
    cam.stopFollow();
    // frame the street the upgrade changes, then pan along it while the improvement sweeps across
    const focusY = mission?.focusY ?? this.player.y;
    const startX = Phaser.Math.Clamp(this.player.x - 200, GAME_W / 2, this.map.widthPx - GAME_W / 2);
    cam.pan(startX, focusY, 600, 'Sine.easeInOut');
    await this.wait(700);
    const banner = text(this, GAME_W / 2, 50, 'THE CITY IS CHANGING...', 'font_big').setScrollFactor(0).setDepth(20005);
    music.play(SONG_IMPROVE);
    let dur = 0;
    for (const u of mission?.upgrades ?? []) for (const p of UPGRADES[u].mapPatches) dur = Math.max(dur, this.map.applyImprovement(p, true, startX - GAME_W / 2));
    this.traffic.setUpgrades(ctx.state.upgrades);
    cam.pan(startX + 420, focusY, Math.max(1400, dur * 0.6), 'Sine.easeInOut');
    this.traffic.setDensity(0.8);
    await this.wait(Math.max(1600, dur * 0.6));
    banner.setText(UPGRADES[mission.upgrades[0]]?.name ?? 'IMPROVED!');
    shake(this, 150, 0.004);
    sfx.ding();
    const o = { v: before };
    floatText(this, 63, 40, `+${after - before} LIVABILITY`, 'font_outline', 0x9bd35a).setScrollFactor(0).setDepth(20006);
    this.tweens.add({ targets: o, v: after, duration: 1200, ease: 'Cubic.easeOut', onUpdate: () => { this.drawMeter(o.v); sfx.blip(); } });
    await this.wait(1500);
    const blurb = text(this, GAME_W / 2, 68, UPGRADES[mission.upgrades[0]]?.blurb ?? '', 'font_outline').setScrollFactor(0).setDepth(20005).setMaxWidth(Math.min(340, GAME_W - 40));
    blurb.setCenterAlign();
    await this.wait(3200);
    banner.destroy(); blurb.destroy();
    cam.pan(this.player.x, this.player.y, 600, 'Sine.easeInOut');
    await this.wait(650);
    cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.buildMarkers(this.cache.json.get('map_queenwest'));
    music.play(SONG_MAIN);
    this.player.frozen = false;
    this.busy = false;
    this.shownLiv = after;
  }

  private wait(ms: number) { return new Promise<void>((r) => this.time.delayedCall(ms, r)); }

  private async startMission(id: string) {
    if (this.busy) return;
    this.busy = true;
    this.player.frozen = true;
    sfx.select();
    ctx.state.player = { scene: 'explore', x: this.player.x, y: this.player.y };
    ctx.save();
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(this.player.x, this.player.y - 10, 400, 'Sine.easeInOut');
    cam.zoomTo(2, 600, 'Cubic.easeIn');
    await this.wait(350);
    await iris(this, 'close', GAME_W / 2, GAME_H / 2 - 10, 450);
    const brief = MISSIONS[id]?.briefing;
    if (brief) this.scene.start('Cutscene', { id: brief, next: 'Action', nextData: { mission: id } });
    else this.scene.start('Action', { mission: id });
  }

  minimapInfo(): MapInfo {
    return { map: this.map, player: { x: this.player.x, y: this.player.y }, markers: this.markers.map((m) => ({ x: m.x, y: m.y, label: MISSIONS[m.id]?.title ?? m.id, done: m.done })) };
  }

  update(_t: number, dt: number) {
    this.input2.update();
    if (!this.busy && this.input2.justPressed('pause')) { openPause(this); return; }
    if (!this.busy && this.input2.justPressed('map')) { openPause(this, 'map'); return; }
    this.player.update(this.input2, dt);
    this.traffic.update(dt, this.player.x, this.player.y);
    this.crowd.update(dt, this.player.x, this.player.y, this.cameras.main.worldView);
    this.map.updateOcclusion(this.player.x, this.player.y);
    // what's nearby: a mission marker or a landmark
    this.near = null;
    for (const m of this.markers) if (!m.done && Phaser.Math.Distance.Between(this.player.x, this.player.y, m.x, m.y) < 22) this.near = { kind: 'mission', id: m.id };
    if (!this.near) for (const l of this.map.data.landmarks ?? []) if (Phaser.Math.Distance.Between(this.player.x, this.player.y, l.x, l.y + 24) < 40) this.near = { kind: 'landmark', id: l.id };
    const key = wantsTouch() ? 'RED' : 'E';
    this.hud.prompt.setText(this.busy || !this.near ? '' : this.near.kind === 'mission' ? `${key}: START MISSION` : `${key}: READ THE PLAQUE`);
    this.touch?.setLabel('act', this.near ? (this.near.kind === 'mission' ? 'GO!' : 'READ') : 'BELL');
    if (!this.busy && this.input2.justPressed('act')) {
      if (this.near?.kind === 'mission') void this.startMission(this.near.id);
      else if (this.near?.kind === 'landmark') {
        const l = this.map.data.landmarks!.find((x) => x.id === this.near!.id)!;
        sfx.select(); this.toast(`${l.label}\n${l.fact}`, 5200);
      } else {
        // the bell rings at the handlebars, in front of the raccoon
        sfx.bell();
        const [vx, vy] = DIR_V[this.player.dir];
        bellRing(this, this.player.x + vx * 7, this.player.y + vy * 3 - 14 - this.player.z, this.player.y + 3);
        this.crowd.bell(this.player.x, this.player.y);
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
    w.__TP = { ...(w.__TP ?? {}), scene: 'Explore', state: ctx.state, player: () => ({ x: this.player.x, y: this.player.y }), teleport: (x: number, y: number) => this.player.sprite.setPosition(x, y), startMission: (id: string) => this.startMission(id), improve: (id: string) => this.map.applyImprovement(id, true, this.player.x), traffic: () => this.traffic.count, map: this.map.data };
  }
}
