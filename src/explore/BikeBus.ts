// M4.1 (Ivan: "a Bike Bus mission in the East End, on the map"): THE BIKE BUS, the game's first top-down mission.
// A bike bus is a group ride to school on a set route: kids join at stops along the way (URBAN_RESEARCH §24).
// You lead it: stop at each stop (slow down beside the kids and they hop on and ride in a line behind you),
// ring your bell at the SUVs parked in the bike lane so they move, and reach the school before the bell.
import Phaser from 'phaser';
import { text, floatText } from '../ui/fx';
import { sfx } from '../audio/sfx';
import { drawGuide, MissionHud, type MapMission } from './guide';

export interface BikeBusStep { kind: 'stop' | 'block' | 'school'; x: number; y: number; kids?: number; key?: string }
export interface BikeBusDef { start: [number, number]; steps: BikeBusStep[] }

interface Rider { s: Phaser.GameObjects.Sprite; id: string; f: string }

const BOARD_R = 30, BOARD_T = 0.5, BELL_R = 56, SCHOOL_R = 30, GAP = 7; // GAP: trail samples (2 px each) between riders

export class BikeBus implements MapMission {
  state: 'ride' | 'won' | 'late' = 'ride';
  t: number;
  step = 0;
  kids = 0;
  readonly total: number;
  private trail: { x: number; y: number }[] = [];
  private riders: Rider[] = [];
  private waiting = new Map<number, Phaser.GameObjects.Sprite[]>();
  private blocks = new Map<number, { img: Phaser.GameObjects.Image; zone: Phaser.GameObjects.Zone }>();
  private dwell = 0;
  private hud: MissionHud;
  private arrow: Phaser.GameObjects.Graphics;
  private edgeLabel: Phaser.GameObjects.BitmapText;
  private signs: Phaser.GameObjects.Graphics;
  readonly solids: Phaser.Physics.Arcade.StaticGroup;

  constructor(private scene: Phaser.Scene, readonly def: BikeBusDef, time: number) {
    this.t = time;
    this.total = def.steps.reduce((n, s) => n + (s.kids ?? 0), 0);
    this.solids = scene.physics.add.staticGroup();
    this.signs = scene.add.graphics();
    def.steps.forEach((s, i) => {
      if (s.kind === 'stop') {
        // the kids wait with their bikes beside a BIKE BUS sign
        const ks: Phaser.GameObjects.Sprite[] = [];
        for (let k = 0; k < (s.kids ?? 1); k++) ks.push(scene.add.sprite(s.x - 10 + k * 10, s.y + (k % 2) * 3, 'chars', 'ped_kid_S_0').setOrigin(0.5, 0.9).setDepth(s.y + k));
        this.waiting.set(i, ks);
        this.signs.fillStyle(0x16121f).fillRect(s.x + 16, s.y - 22, 2, 22).fillStyle(0xf5c22e).fillRect(s.x + 11, s.y - 30, 12, 9).fillStyle(0x16121f).fillRect(s.x + 13, s.y - 28, 8, 1).fillRect(s.x + 13, s.y - 25, 8, 1);
      } else if (s.kind === 'block') {
        const img = scene.add.image(s.x, s.y, 'world', s.key ?? 'suv_E').setOrigin(0.5, 0.8).setDepth(s.y);
        const zone = scene.add.zone(s.x, s.y - 4, 30, 16);
        this.solids.add(zone);
        this.blocks.set(i, { img, zone });
      }
    });
    this.signs.setDepth(5);
    this.hud = new MissionHud(scene);
    this.arrow = scene.add.graphics().setDepth(20005);
    this.edgeLabel = text(scene, 0, 0, '', 'font_outline').setScrollFactor(0).setDepth(20006).setVisible(false);
  }

  get target() { return this.def.steps[this.step]; }

  /** E near an SUV in the bike lane: it moves off */
  bell(x: number, y: number) {
    const s = this.target;
    if (this.state !== 'ride' || s?.kind !== 'block' || Phaser.Math.Distance.Between(x, y, s.x, s.y) > BELL_R) return;
    const b = this.blocks.get(this.step)!;
    sfx.carHonk();
    floatText(this.scene, s.x, s.y - 26, Math.random() < 0.5 ? 'OOPS! MOVING!' : 'JUST DROPPING OFF!', 'font_outline', 0xffffff, 700);
    b.zone.destroy();
    this.scene.tweens.add({ targets: b.img, x: s.x + 260, alpha: 0, duration: 1600, ease: 'Quad.easeIn', onComplete: () => b.img.destroy() });
    floatText(this.scene, s.x, s.y - 44, 'BIKE LANE CLEAR!', 'font_outline', 0x9bd35a, 900);
    this.step++;
  }

  update(dtMs: number, px: number, py: number) {
    if (this.state !== 'ride') return;
    const dt = dtMs / 1000;
    this.t = Math.max(0, this.t - dt);
    // the trail the riders follow, resampled every 2 px
    const last = this.trail[this.trail.length - 1];
    if (!last) this.trail.push({ x: px, y: py });
    else {
      let d = Phaser.Math.Distance.Between(last.x, last.y, px, py);
      while (d >= 2) {
        const l = this.trail[this.trail.length - 1], k = 2 / d;
        this.trail.push({ x: l.x + (px - l.x) * k, y: l.y + (py - l.y) * k });
        d = Phaser.Math.Distance.Between(this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y, px, py);
      }
      const keep = (this.riders.length + 2) * GAP + 4;
      if (this.trail.length > keep) this.trail.splice(0, this.trail.length - keep);
    }
    this.riders.forEach((r, i) => {
      const idx = this.trail.length - 1 - (i + 1) * GAP;
      const p = this.trail[Math.max(0, idx)], q = this.trail[Math.max(0, idx - 2)];
      r.s.setPosition(p.x, p.y).setDepth(p.y);
      const dx = p.x - q.x, dy = p.y - q.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.5) {
        const f = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : dy > 0 ? 'S' : 'N';
        if (f !== r.f) { r.f = f; r.s.play(`cy_${r.id}_${f}`); }
        r.s.anims.resume();
      } else r.s.anims.pause();
    });
    const s = this.target;
    if (s?.kind === 'stop') {
      // stop beside the kids (slow, close) for a moment and they hop on
      const near = Phaser.Math.Distance.Between(px, py, s.x, s.y) < BOARD_R;
      const slow = this.trail.length < 2 || Phaser.Math.Distance.Between(this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y, px, py) < 0.5;
      this.dwell = near ? this.dwell + dt * (slow ? 1.6 : 1) : 0;
      if (this.dwell >= BOARD_T) this.board();
    } else if (s?.kind === 'school' && Phaser.Math.Distance.Between(px, py, s.x, s.y) < SCHOOL_R) {
      this.state = 'won';
      sfx.ding();
    }
    if (this.state === 'ride' && this.t <= 0) { this.state = 'late'; sfx.squeak(); }
    this.drawHud(px, py);
  }

  private board() {
    const s = this.target!;
    const ks = this.waiting.get(this.step) ?? [];
    for (const k of ks) {
      const id = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
      const r: Rider = { s: this.scene.add.sprite(k.x, k.y, 'chars', `cy_${id}_E_0`).setOrigin(0.5, 0.8).setScale(0.8).play(`cy_${id}_E`), id, f: 'E' };
      this.riders.push(r);
      k.destroy();
    }
    this.kids += ks.length;
    sfx.bell();
    floatText(this.scene, s.x, s.y - 30, this.kids === this.total ? 'EVERYONE\'S ON! TO SCHOOL!' : `ALL ABOARD! ${this.kids}/${this.total}`, 'font_outline', 0x9bd35a, 900);
    this.dwell = 0;
    this.step++;
  }

  private drawHud(px: number, py: number) {
    const sec = Math.ceil(this.t), mm = Math.floor(sec / 60), ss = String(sec % 60).padStart(2, '0');
    const s = this.target;
    const what = !s ? '' : s.kind === 'stop' ? 'NEXT STOP: STOP BESIDE THE KIDS' : s.kind === 'block' ? 'AN SUV IN THE BIKE LANE: RING YOUR BELL (E)' : 'TO THE SCHOOL!';
    this.hud.set(`BIKE BUS  KIDS ${this.kids}/${this.total}  BELL IN ${mm}:${ss}\n${what}`, this.t < 15 ? 0xff9a2e : 0xffffff);
    // M4.2 (Ivan: "it wasn't obvious where to go; make the arrow more apparent"): the guide arrow (guide.ts, M4.3)
    drawGuide(this.scene, this.arrow, this.edgeLabel, s && { x: s.x, y: s.y, color: s.kind === 'block' ? 0xff9a2e : s.kind === 'school' ? 0x7cc6f2 : 0xfff08a, word: s.kind === 'stop' ? 'KIDS' : s.kind === 'block' ? 'SUV' : 'SCHOOL' });
    void px; void py;
  }

  route() { return this.def.steps.slice(this.step).map((s, i) => ({ x: s.x, y: s.y, kind: s.kind, next: i === 0 })); }
  intro(touch: boolean) { return touch ? 'STOP BESIDE THE KIDS AT EVERY STOP.\nRED (BELL) AT THE SUVS IN THE BIKE LANE.' : 'STOP BESIDE THE KIDS AT EVERY STOP.\nE (BELL) AT THE SUVS IN THE BIKE LANE.'; }
  lateCard(): [string, string] { return ['THE BELL RANG!', `THE BIKE BUS WAS LATE (${this.kids}/${this.total} KIDS).\nBACK TO THE FIRST STOP!`]; }
  winCard(): [string, string] { return ['ON TIME!', `KIDS: ${this.kids}/${this.total}   ${Math.ceil(this.t)} S TO THE BELL`]; }

  /** the run is over: clear the HUD so the result card stands alone */
  hideHud() { this.hud.setVisible(false); this.arrow.clear(); this.edgeLabel.setVisible(false); }

  destroy() {
    this.hud.destroy(); this.arrow.destroy(); this.edgeLabel.destroy(); this.signs.destroy();
    for (const r of this.riders) r.s.destroy();
    for (const ks of this.waiting.values()) ks.forEach((k) => k.destroy());
    for (const b of this.blocks.values()) { b.img.destroy(); if (b.zone.active) b.zone.destroy(); }
  }
}
