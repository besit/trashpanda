// Mission 2, "Let the Streetcar Through": a non-combat escort. The 501 rolls along the far lane behind
// the raccoon and stops for anything in its way:
//  - red signals: pump the yellow call box -> transit signal priority (green + the white transit bar)
//  - a double-parked delivery van / a car waiting to turn left across the tracks: pump it until it moves
//  - cones that construction rats drop on the tracks: swat them away (and bonk the rat)
// Every second the streetcar is held up by something counts against its schedule. Scheduled stops don't.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

export interface EscortDef {
  signals: number[];
  blockers: { at: number; kind: 'van' | 'turner' }[];
  coneRats: number[];
  stops: number[];
  end: number;
  allowDelay: number;
}

const TRACK_Y = 200; // base of the streetcar / things on the tracks
const SC_HALF = 96;  // half length of the side-view streetcar sprite
const CRUISE = 66;

interface Signal { x: number; img: Phaser.GameObjects.Image; state: 'red' | 'green' | 'tsp'; t: number; natural: number; hint?: Phaser.GameObjects.BitmapText }
interface Blocker { x: number; img: Phaser.GameObjects.Image; hits: number; need: number; kind: 'van' | 'turner'; gone: boolean; lastHit: number; blink?: Phaser.GameObjects.Rectangle }
interface Cone { img: Phaser.GameObjects.Image; x: number; gone: boolean }

export class Escort {
  readonly car: Phaser.GameObjects.Image;
  v = 0;
  delay = 0;
  done = false;
  failed = false;
  private signals: Signal[] = [];
  private blockers: Blocker[] = [];
  private cones: Cone[] = [];
  private rats: { s: Phaser.GameObjects.Sprite; state: 'run' | 'drop' | 'flee' | 'dead'; target: number; dropped: number }[] = [];
  private triggers: number[];
  private dwell = 0;
  private served = new Set<number>();
  private bellCd = 0;
  private arrow: Phaser.GameObjects.Container;
  cleared = 0;

  constructor(private scene: Phaser.Scene, private def: EscortDef, startX: number) {
    this.car = scene.add.image(startX, TRACK_Y + 6, 'world', 'streetcarside').setOrigin(0.5, 1).setDepth(60);
    for (const x of def.signals) {
      const img = scene.add.image(x, 184, 'world', 'sigpole_red').setOrigin(0.5, 1).setDepth(55);
      this.signals.push({ x, img, state: 'red', t: 0, natural: 6 + Math.random() * 3 });
    }
    for (const b of def.blockers) {
      const img = scene.add.image(b.at, TRACK_Y + 4, 'world', b.kind === 'van' ? 'vanside' : 'carside_blue_r').setOrigin(0.5, 1).setDepth(62);
      const blink = scene.add.rectangle(b.at + (b.kind === 'van' ? 40 : 30), TRACK_Y - 14, 3, 3, 0xff9a2e).setDepth(63);
      this.blockers.push({ x: b.at, img, hits: 0, need: b.kind === 'van' ? 3 : 2, kind: b.kind, gone: false, lastHit: -1, blink });
    }
    for (const x of def.stops) scene.add.image(x, 182, 'world', 'ttcstop').setOrigin(0.5, 1).setScale(2).setDepth(54);
    this.triggers = [...def.coneRats];
    // off-screen indicator for the streetcar
    const g = scene.add.graphics();
    g.fillStyle(0x16121f).fillRoundedRect(-2, -8, 40, 16, 3).fillStyle(0xd42a24).fillRoundedRect(0, -6, 36, 12, 2);
    g.fillStyle(0xf6f2e9).fillTriangle(3, 0, 9, -4, 9, 4);
    const t = scene.add.bitmapText(22, 0, 'font', '501').setOrigin(0.5).setTint(0xffffff);
    this.arrow = scene.add.container(6, 120, [g, t]).setScrollFactor(0).setDepth(2100).setVisible(false);
  }

  get front() { return this.car.x + SC_HALF; }

  private press(s: Signal) {
    if (s.state === 'tsp') { s.t = Math.max(s.t, 5); return; }
    s.state = 'tsp'; s.t = 7;
    s.img.setFrame('sigpole_tsp');
    sfx.signal();
    floatText(this.scene, s.x, 96, 'PRIORITY!', 'font_outline', 0xf6f2e9, 700);
  }

  private spawnConeRat(atX: number) {
    const s = this.scene.add.sprite(atX + 230, TRACK_Y - 1, 'chars', 'rat_construction_0').setOrigin(15 / 32, 31 / 32).setDepth(64).setFlipX(true).play('rat_construction_walk');
    this.rats.push({ s, state: 'run', target: atX + 120, dropped: 0 });
    sfx.squeak();
  }

  update(dtMs: number, px: number, hits: Hitbox[], newHit: (id: number) => boolean) {
    const dt = dtMs / 1000;
    const cam = this.scene.cameras.main;
    // signals: red by default; a short natural green now and then; TSP holds green for the streetcar
    for (const s of this.signals) {
      s.t -= dt; s.natural -= dt;
      if (s.state !== 'red' && s.t <= 0) { s.state = 'red'; s.img.setFrame('sigpole_red'); s.natural = 7 + Math.random() * 3; }
      if (s.state === 'red' && s.natural <= 0) { s.state = 'green'; s.t = 2.4; s.img.setFrame('sigpole_green'); }
      const near = Math.abs(px - s.x) < 30;
      if (near && hits.some((h) => newHit(h.id) && h.x < s.x + 14 && h.x + h.w > s.x - 14)) this.press(s);
      // the hint over a red signal the streetcar is approaching
      const want = s.state === 'red' && s.x > this.front - 20 && s.x - px < 200 && s.x - px > -60;
      if (want && !s.hint) s.hint = this.scene.add.bitmapText(s.x, 84, 'font_outline', 'PUMP THE BUTTON!').setOrigin(0.5).setDepth(210).setTint(0xfff08a);
      if (!want && s.hint) { s.hint.destroy(); s.hint = undefined; }
      s.hint?.setY(84 + Math.sin(this.scene.time.now / 120) * 1.5);
    }
    // blockers
    for (const b of this.blockers) {
      if (b.gone) continue;
      b.blink?.setVisible(Math.floor(this.scene.time.now / 350) % 2 === 0);
      const halfW = b.img.width / 2;
      for (const h of hits) {
        if (h.id === b.lastHit || h.x > b.x + halfW || h.x + h.w < b.x - halfW) continue;
        b.lastHit = h.id; b.hits++;
        sfx.clang(); puff(this.scene, h.x + h.w / 2, TRACK_Y - 20, 0xfff08a, 5, 14, 70);
        this.scene.tweens.add({ targets: b.img, x: b.img.x + 2, duration: 40, yoyo: true });
        floatText(this.scene, b.x, TRACK_Y - 58, b.hits >= b.need ? (b.kind === 'van' ? 'OK OK! MOVING!' : 'FINE! I\'LL GO AROUND!') : b.kind === 'van' ? 'MOVE IT!' : 'NOT ON THE TRACKS!', 'font_outline', 0xfff08a, 500);
        if (b.hits >= b.need) {
          b.gone = true; b.blink?.destroy(); this.cleared++;
          sfx.carHonk();
          this.scene.tweens.add({ targets: b.img, x: b.img.x + 420, duration: 1600, ease: 'Cubic.easeIn', onComplete: () => b.img.destroy() });
          if (b.kind === 'turner') this.scene.tweens.add({ targets: b.img, y: b.img.y + 30, duration: 1600, ease: 'Cubic.easeIn' });
        }
        break;
      }
    }
    // cone rats
    if (this.triggers.length && px > this.triggers[0]) this.spawnConeRat(this.triggers.shift()!);
    for (const r of this.rats) {
      if (r.state === 'dead') continue;
      if (hits.some((h) => h.x < r.s.x + 8 && h.x + h.w > r.s.x - 8 && newHit(h.id + 7000))) {
        r.state = 'dead'; sfx.hit(); sfx.squeak(); puff(this.scene, r.s.x, r.s.y - 14, 0xc9c5d1, 8, 20, 70);
        floatText(this.scene, r.s.x, r.s.y - 30, '+1', 'font_outline', 0xfff08a);
        this.scene.tweens.add({ targets: r.s, y: r.s.y - 30, alpha: 0, angle: 360, duration: 500, onComplete: () => r.s.destroy() });
        this.cleared++;
        continue;
      }
      if (r.state === 'run') {
        r.s.x -= 80 * dt;
        if (r.s.x <= r.target) { r.state = 'drop'; r.s.play('rat_construction_windup'); }
      } else if (r.state === 'drop') {
        r.s.x += 20 * dt;
        if (r.s.x > r.target + 16 * (r.dropped + 1)) {
          const img = this.scene.add.image(r.s.x - 8, TRACK_Y, 'world', 'cone').setOrigin(0.5, 1).setDepth(63).setScale(2);
          this.cones.push({ img, x: img.x, gone: false });
          sfx.clang();
          r.dropped++;
          if (r.dropped >= 3) { r.state = 'flee'; r.s.setFlipX(false).play('rat_construction_walk'); floatText(this.scene, r.s.x, r.s.y - 34, 'ANOTHER CAR LANE!', 'font', 0xff6347, 600); }
        }
      } else if (r.state === 'flee') {
        r.s.x += 110 * dt;
        if (r.s.x > cam.scrollX + cam.width + 60) { r.state = 'dead'; r.s.destroy(); }
      }
    }
    for (const c of this.cones) {
      if (c.gone) continue;
      if (hits.some((h) => h.x < c.x + 8 && h.x + h.w > c.x - 8)) {
        c.gone = true; sfx.clang(); puff(this.scene, c.x, TRACK_Y - 8, 0xff9a2e, 6, 16, 70);
        this.scene.tweens.add({ targets: c.img, x: c.x + 60, y: TRACK_Y + 30, angle: 300, alpha: 0, duration: 500, onComplete: () => c.img.destroy() });
      }
    }

    // ---- the streetcar ----
    let target = CRUISE, blocked = false;
    const front = this.front;
    const brakeAt = (x: number) => { const d = x - front; if (d > -10 && d < 70) { target = Math.min(target, Math.max(0, d - 6) * 1.6); if (d < 26) blocked = true; } };
    for (const s of this.signals) if (s.state === 'red') brakeAt(s.x - 18);
    for (const b of this.blockers) if (!b.gone) brakeAt(b.x - b.img.width / 2);
    for (const c of this.cones) if (!c.gone) brakeAt(c.x - 8);
    // scheduled TTC stops (not a delay)
    if (this.dwell > 0) { this.dwell -= dt; target = 0; if (this.dwell <= 0) sfx.streetcarBell(); }
    else for (const s of this.def.stops) {
      if (this.served.has(s)) continue;
      const d = s - front + 20;
      if (d < -10) { this.served.add(s); continue; }
      if (d < 70) target = Math.min(target, Math.max(0, d) * 1.4 + 2);
      if (d < 4 && this.v < 8) { this.dwell = 1.6; this.served.add(s); floatText(this.scene, s, 120, 'STOP: QUEEN AT STRACHAN', 'font', 0xf6f2e9, 600); }
    }
    if (target < this.v && this.v - target > 30) sfx.brake();
    this.v = target < this.v ? Math.max(target, this.v - 150 * dt) : Math.min(target, this.v + 40 * dt);
    this.car.x += this.v * dt;
    if (blocked && this.v < 6 && this.dwell <= 0) {
      this.delay += dt;
      this.bellCd -= dt;
      if (this.bellCd <= 0) { sfx.streetcarBell(); this.bellCd = 2.2; }
    }
    if (this.delay >= this.def.allowDelay) this.failed = true;
    if (front >= this.def.end) this.done = true;
    // off-screen indicator
    const onScreen = this.car.x + SC_HALF > cam.scrollX && this.car.x - SC_HALF < cam.scrollX + cam.width;
    this.arrow.setVisible(!onScreen && this.car.x < cam.scrollX);
    this.arrow.setY(120 + Math.sin(this.scene.time.now / 200) * 2);
  }

  /** 0..1 of the schedule left */
  get onTime() { return Math.max(0, 1 - this.delay / this.def.allowDelay); }
}
