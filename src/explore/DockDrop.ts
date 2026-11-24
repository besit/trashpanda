// M4.3 (Ivan: "Can we introduce citybikes into the game? Maybe a mission to install bikeshare stations?"): DOCK DROP,
// the second mission played on the map (Downtown). Bike share, unbranded (URBAN_RESEARCH §25).
// You tow a trailer of docks. Six gaps in the station map are marked; stop at one for a moment and a docking station
// goes down there, and share bikes ride out of it. Dog Fjord's "clutter crew" (rats in hard hats) come for some of
// the new stations and cart them off; ring your bell near one and it drops the station and runs. Set all six before
// the clock runs out.
import Phaser from 'phaser';
import { text, floatText, puff } from '../ui/fx';
import { sfx } from '../audio/sfx';
import { drawGuide, MissionHud, type MapMission } from './guide';

export interface DockSpot { name: string; x: number; y: number }
export interface DockDropDef { start: [number, number]; spots: DockSpot[] }

const SET_R = 26, SET_T = 0.8, BELL_R = 64, RAT_V = 44, HAUL_V = 26, HAUL_T = 5, GAP = 9;
/** after which stations (counting from 1) a crew rat comes for the one just set */
const CREW_AFTER = [2, 4, 5];

interface Spot { def: DockSpot; set: boolean; img?: Phaser.GameObjects.Image }
interface Crew { s: Phaser.GameObjects.Sprite; spot: Spot; state: 'walk' | 'haul' | 'flee'; t: number; dir: [number, number]; f: string }

export class DockDrop implements MapMission {
  state: 'ride' | 'won' | 'late' = 'ride';
  t: number;
  readonly total: number;
  private spots: Spot[];
  private crews: Crew[] = [];
  private trail: { x: number; y: number }[] = [];
  private trailer: Phaser.GameObjects.Image;
  private dwell = 0;
  private placed = 0;
  private hud: MissionHud;
  private arrow: Phaser.GameObjects.Graphics;
  private edgeLabel: Phaser.GameObjects.BitmapText;
  private marks: Phaser.GameObjects.Graphics;
  private ring: Phaser.GameObjects.Graphics;
  private riders: Phaser.GameObjects.Sprite[] = [];

  constructor(private scene: Phaser.Scene, readonly def: DockDropDef, time: number, private shareIds: string[]) {
    this.t = time;
    this.spots = def.spots.map((d) => ({ def: d, set: false }));
    this.total = this.spots.length;
    this.marks = scene.add.graphics().setDepth(4);
    this.ring = scene.add.graphics().setDepth(20004);
    this.trailer = scene.add.image(def.start[0], def.start[1], 'world', 'docktrailer_ew').setOrigin(0.5, 0.85);
    this.hud = new MissionHud(scene);
    this.arrow = scene.add.graphics().setDepth(20005);
    this.edgeLabel = text(scene, 0, 0, '', 'font_outline').setScrollFactor(0).setDepth(20006).setVisible(false);
  }

  get placedCount() { return this.spots.filter((s) => s.set).length; }
  /** x, y and state of every gap (debug/bot) */
  get gaps() { return this.spots.map((s) => ({ name: s.def.name, x: s.def.x, y: s.def.y, set: s.set })); }
  get crewCount() { return this.crews.filter((c) => c.state !== 'flee').length; }

  bell(x: number, y: number): boolean {
    if (this.state !== 'ride') return false;
    let hit = false;
    for (const c of this.crews) {
      if (c.state === 'flee' || Phaser.Math.Distance.Between(x, y, c.s.x, c.s.y) > BELL_R) continue;
      // it drops the station and runs; the station goes back where it was set
      floatText(this.scene, c.s.x, c.s.y - 24, Phaser.Utils.Array.GetRandom(['EEK!', 'IT\'S NOT CLUTTER?', 'FINE! KEEP IT!']), 'font_outline', 0xffffff, 700);
      if (c.state === 'haul' && c.spot.img) this.scene.tweens.add({ targets: c.spot.img, x: c.spot.def.x, y: c.spot.def.y, duration: 350, ease: 'Quad.easeOut', onUpdate: () => c.spot.img?.setDepth(c.spot.img.y) });
      c.state = 'flee'; c.t = 1.2;
      c.dir = this.away(c.s.x, c.s.y, x, y);
      sfx.squeak(); hit = true;
    }
    return hit;
  }

  update(dtMs: number, px: number, py: number) {
    if (this.state !== 'ride') return;
    const dt = dtMs / 1000;
    this.t = Math.max(0, this.t - dt);
    this.follow(px, py);
    // set a station: stop at an open gap for a moment
    const open = this.spots.filter((s) => !s.set);
    const at = open.find((s) => Phaser.Math.Distance.Between(px, py, s.def.x, s.def.y) < SET_R);
    const last = this.trail[this.trail.length - 1];
    const slow = !last || Phaser.Math.Distance.Between(last.x, last.y, px, py) < 0.5;
    this.dwell = at ? this.dwell + dt * (slow ? 1.6 : 1) : 0;
    this.ring.clear();
    if (at) {
      const cam = this.scene.cameras.main, sx = (at.def.x - cam.worldView.x) * cam.zoom, sy = (at.def.y - cam.worldView.y) * cam.zoom - 34;
      this.ring.setScrollFactor(0).lineStyle(3, 0x16121f).strokeCircle(sx, sy, 7).lineStyle(2, 0x9bd35a).beginPath().arc(sx, sy, 7, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.min(1, this.dwell / SET_T))).strokePath();
    }
    if (at && this.dwell >= SET_T) this.setDock(at);
    this.updateCrews(dt, px, py);
    this.updateRiders(dt);
    if (this.spots.every((s) => s.set) && this.crewCount === 0) { this.state = 'won'; sfx.ding(); }
    else if (this.t <= 0) { this.state = 'late'; sfx.squeak(); }
    this.drawMarks();
    this.drawHud(px, py);
  }

  /** the trailer follows a few samples behind the raccoon, facing the way it's pulled */
  private follow(px: number, py: number) {
    const last = this.trail[this.trail.length - 1];
    if (!last) this.trail.push({ x: px, y: py });
    else {
      let d = Phaser.Math.Distance.Between(last.x, last.y, px, py);
      while (d >= 2) {
        const l = this.trail[this.trail.length - 1], k = 2 / d;
        this.trail.push({ x: l.x + (px - l.x) * k, y: l.y + (py - l.y) * k });
        d = Phaser.Math.Distance.Between(this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y, px, py);
      }
      if (this.trail.length > GAP + 6) this.trail.splice(0, this.trail.length - (GAP + 6));
    }
    const p = this.trail[Math.max(0, this.trail.length - 1 - GAP)], q = this.trail[this.trail.length - 1];
    const dx = q.x - p.x, dy = q.y - p.y;
    if (Math.abs(dx) + Math.abs(dy) > 1) {
      const ew = Math.abs(dx) >= Math.abs(dy);
      this.trailer.setFrame(ew ? 'docktrailer_ew' : 'docktrailer_ns').setFlipX(ew && dx < 0).setFlipY(!ew && dy > 0);
    }
    this.trailer.setPosition(Math.round(p.x), Math.round(p.y)).setDepth(p.y - 1).setVisible(this.trail.length > GAP);
  }

  private setDock(s: Spot) {
    s.set = true; this.dwell = 0; this.placed++;
    s.img = this.scene.add.image(s.def.x, s.def.y, 'world', 'sharedock').setOrigin(0.5, 22 / 24).setDepth(s.def.y).setScale(0.2);
    this.scene.tweens.add({ targets: s.img, scale: 1, duration: 280, ease: 'Back.easeOut' });
    puff(this.scene, s.def.x, s.def.y - 4, 0x9bd35a, 8, 18, s.def.y + 1);
    sfx.bell(); sfx.ding();
    const n = this.placedCount;
    floatText(this.scene, s.def.x, s.def.y - 34, n === this.total ? 'EVERY GAP FILLED!' : `${s.def.name}: DOCKED! ${n}/${this.total}`, 'font_outline', 0x9bd35a, 900);
    // two share bikes ride out of it straight away
    for (let i = 0; i < 2; i++) this.scene.time.delayedCall(500 + i * 450, () => this.rideOut(s));
    // the clutter crew comes for some of them
    if (CREW_AFTER.includes(this.placed)) this.scene.time.delayedCall(900, () => this.sendCrew(s));
  }

  private rideOut(s: Spot) {
    if (!s.set || !this.shareIds.length) return;
    const id = Phaser.Utils.Array.GetRandom(this.shareIds), dir = Math.random() < 0.5 ? 'E' : 'W';
    const r = this.scene.add.sprite(s.def.x + (dir === 'E' ? 12 : -12), s.def.y + 6, 'chars', `cy_${id}_${dir}_0`).setOrigin(0.5, 0.8).play(`cy_${id}_${dir}`).setDepth(s.def.y + 6);
    r.setData('vx', dir === 'E' ? 46 : -46).setData('life', 2.6);
    this.riders.push(r);
  }
  private updateRiders(dt: number) {
    for (const r of this.riders) {
      r.x += r.getData('vx') * dt;
      const life = r.getData('life') - dt; r.setData('life', life);
      if (life < 0.6) r.setAlpha(Math.max(0, life / 0.6));
      if (life <= 0) r.destroy();
    }
    this.riders = this.riders.filter((r) => r.active);
  }

  /** a crew rat walks in from off screen toward a newly set station */
  private sendCrew(s: Spot) {
    if (this.state !== 'ride' || !s.set) return;
    const v = this.scene.cameras.main.worldView;
    // from the screen edge farther from the raccoon, so you see it coming
    const fromRight = s.def.x - v.x < v.width / 2;
    const x = fromRight ? v.right + 14 : v.x - 14, y = Phaser.Math.Clamp(s.def.y + 8, v.y + 40, v.bottom - 10);
    const f = fromRight ? 'W' : 'E';
    const c: Crew = { s: this.scene.add.sprite(x, y, 'chars', `ratop_${f}_0`).setOrigin(0.5, 25 / 28).play(`ratop_${f}`).setDepth(y), spot: s, state: 'walk', t: 0, dir: [0, 0], f };
    this.crews.push(c);
    floatText(this.scene, s.def.x, s.def.y - 46, 'THE CLUTTER CREW! RING THEM OFF!', 'font_outline', 0xff9a2e, 1200);
    sfx.laugh();
  }

  private away(x: number, y: number, fx: number, fy: number): [number, number] {
    const a = Math.atan2(y - fy, x - fx);
    return [Math.cos(a), Math.sin(a)];
  }

  private face(c: Crew, dx: number, dy: number) {
    const f = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : dy > 0 ? 'S' : 'N';
    if (f !== c.f) { c.f = f; c.s.play(`ratop_${f}`); }
  }

  private updateCrews(dt: number, px: number, py: number) {
    for (const c of this.crews) {
      const sp = c.spot;
      if (c.state === 'walk') {
        const dx = sp.def.x - c.s.x, dy = sp.def.y + 2 - c.s.y, d = Math.hypot(dx, dy);
        if (d < 4) { c.state = 'haul'; c.t = HAUL_T; c.dir = this.away(sp.def.x, sp.def.y, px, py); sfx.clang(); floatText(this.scene, sp.def.x, sp.def.y - 30, 'CLUTTER! IT GOES!', 'font_outline', 0xff6347, 800); }
        else { c.s.x += (dx / d) * RAT_V * dt; c.s.y += (dy / d) * RAT_V * dt; this.face(c, dx, dy); }
      } else if (c.state === 'haul') {
        // it drags the station away from the raccoon
        c.t -= dt;
        c.s.x += c.dir[0] * HAUL_V * dt; c.s.y += c.dir[1] * HAUL_V * dt; this.face(c, c.dir[0], c.dir[1]);
        sp.img?.setPosition(c.s.x - c.dir[0] * 16, c.s.y - c.dir[1] * 8).setDepth(c.s.y - 1);
        if (c.t <= 0) {
          // gone: the gap opens again
          floatText(this.scene, sp.def.x, sp.def.y - 30, `THEY TOOK THE ${sp.def.name} DOCK! SET IT AGAIN`, 'font_outline', 0xff6347, 1400);
          if (sp.img) this.scene.tweens.add({ targets: [sp.img, c.s], alpha: 0, duration: 400, onComplete: () => sp.img?.destroy() });
          sp.set = false; sp.img = undefined;
          c.state = 'flee'; c.t = 0.4;
        }
      } else {
        c.t -= dt;
        c.s.x += c.dir[0] * 90 * dt; c.s.y += c.dir[1] * 90 * dt; this.face(c, c.dir[0], c.dir[1]);
        c.s.setAlpha(Math.max(0, Math.min(1, c.t / 0.5)));
        if (c.t <= 0) c.s.destroy();
      }
      if (c.s.active) c.s.setDepth(c.s.y);
    }
    this.crews = this.crews.filter((c) => c.s.active);
  }

  /** open gaps: a dashed outline on the ground with a dock sign */
  private drawMarks() {
    const g = this.marks.clear(), now = this.scene.time.now;
    for (const s of this.spots) {
      if (s.set) continue;
      const a = 0.55 + 0.35 * Math.sin(now / 200);
      g.lineStyle(1, 0xfff08a, a);
      for (let x = -22; x < 22; x += 6) { g.lineBetween(s.def.x + x, s.def.y - 9, s.def.x + x + 3, s.def.y - 9); g.lineBetween(s.def.x + x, s.def.y + 1, s.def.x + x + 3, s.def.y + 1); }
      g.lineBetween(s.def.x - 24, s.def.y - 9, s.def.x - 24, s.def.y + 1).lineBetween(s.def.x + 24, s.def.y - 9, s.def.x + 24, s.def.y + 1);
    }
  }

  private target(px: number, py: number) {
    const crew = this.crews.find((c) => c.state !== 'flee');
    if (crew) return { x: crew.s.x, y: crew.s.y, color: 0xff9a2e, word: 'RAT' };
    const open = this.spots.filter((s) => !s.set).sort((a, b) => Phaser.Math.Distance.Between(px, py, a.def.x, a.def.y) - Phaser.Math.Distance.Between(px, py, b.def.x, b.def.y));
    return open[0] && { x: open[0].def.x, y: open[0].def.y, color: 0xfff08a, word: 'DOCK' };
  }

  private drawHud(px: number, py: number) {
    const sec = Math.ceil(this.t), mm = Math.floor(sec / 60), ss = String(sec % 60).padStart(2, '0');
    const crew = this.crews.some((c) => c.state !== 'flee');
    const what = crew ? 'A RAT IS CARTING A DOCK OFF: RING YOUR BELL' : 'STOP AT A YELLOW GAP TO SET A DOCK DOWN';
    this.hud.set(`DOCK DROP  DOCKS ${this.placedCount}/${this.total}  TIME ${mm}:${ss}\n${what}`, this.t < 15 ? 0xff9a2e : 0xffffff);
    drawGuide(this.scene, this.arrow, this.edgeLabel, this.target(px, py));
  }

  route() {
    const open = this.spots.filter((s) => !s.set).map((s) => ({ x: s.def.x, y: s.def.y, kind: 'stop', next: false }));
    const crews = this.crews.filter((c) => c.state !== 'flee').map((c) => ({ x: c.s.x, y: c.s.y, kind: 'block', next: true }));
    if (!crews.length && open.length) open[0].next = true;
    return [...crews, ...open];
  }
  intro(touch: boolean) { return `STOP AT EACH YELLOW GAP TO SET A DOCK DOWN.\n${touch ? 'RED' : 'E'} (BELL) AT THE RATS WHO CART THEM OFF.`; }
  lateCard(): [string, string] { return ['OUT OF TIME!', `${this.placedCount}/${this.total} DOCKS SET.\nBACK TO THE START!`]; }
  winCard(): [string, string] { return ['EVERY GAP FILLED!', `DOCKS: ${this.total}/${this.total}   ${Math.ceil(this.t)} S LEFT`]; }
  hideHud() { this.hud.setVisible(false); this.arrow.clear(); this.edgeLabel.setVisible(false); this.ring.clear(); }

  destroy() {
    this.hud.destroy(); this.arrow.destroy(); this.edgeLabel.destroy(); this.marks.destroy(); this.ring.destroy(); this.trailer.destroy();
    for (const c of this.crews) c.s.destroy();
    for (const r of this.riders) r.destroy();
    for (const s of this.spots) s.img?.destroy();
  }
}
