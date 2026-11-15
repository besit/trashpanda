// Mission 10's boss (M4, "Death by Highway"): THE HIGHWAY MECH, a walking stretch of the Gardiner.
//  - it STOMPS: a pier lifts and slams down, sending a shockwave each way along the ground (jump them)
//  - it FLINGS cars from the claw on its arm, in arcs at you (jump, dash, or get under them)
//  - then it VENTS: the chest grille opens and glows; that's when it can be pumped. Jump onto its deck
//    any time, from a slab: its deck is the stomp target
//  - at 2/3 and 1/3 health it roars ANOTHER LANE and drops a concrete slab you can stand on
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

type State = 'intro' | 'wind' | 'stomp' | 'fling' | 'vent' | 'dead';

export class HighwayMech {
  readonly img: Phaser.GameObjects.Image;
  readonly maxHp = 24;
  hp = this.maxHp;
  private state: State = 'intro';
  private t = 1.6;
  private lastHit = -1;
  private lanes = 0;
  private waves: { g: Phaser.GameObjects.Rectangle; x: number; dir: 1 | -1 }[] = [];
  private cars: Phaser.Physics.Arcade.Image[] = [];
  private warn?: Phaser.GameObjects.BitmapText;
  private cycle = 0;
  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private bounds: { left: number; right: number }, private hooks: { hurt: (fromX: number) => void; lane: (x: number) => void }) {
    this.img = scene.add.image(x, groundY + 2, 'world', 'highwaymech_0').setOrigin(0.5, 162 / 164).setDepth(104);
    floatText(scene, x - 60, groundY - 170, 'TORONTO NEEDS... ANOTHER LANE!', 'font_red', 0xffffff, 1600);
    sfx.rumble();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get title() { return 'THE HIGHWAY MECH'; }
  get phase() { return this.state; }
  private get rage() { return this.hp <= this.maxHp / 3 ? 1.4 : this.hp <= (this.maxHp * 2) / 3 ? 1.2 : 1; }
  /** the deck torso's top: stomp it (reachable with a jump from a slab; the sign above is out of reach) */
  roofY() { return this.groundY - 104; }
  roofRect() { return new Phaser.Geom.Rectangle(this.img.x - 70, this.groundY - 110, 140, 10); }
  /** the chest vent: pumpable while it vents */
  chestRect() { return new Phaser.Geom.Rectangle(this.img.x - 22, this.groundY - 98, 44, 18); }
  /** the legs: don't stand in them when it lands */
  legRects() { return [new Phaser.Geom.Rectangle(this.img.x - 62, this.groundY - 80, 36, 80), new Phaser.Geom.Rectangle(this.img.x + 10, this.groundY - 80, 36, 80)]; }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    if (kind === 'pump' && this.state !== 'vent') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    puff(this.scene, kind === 'stomp' ? this.img.x : this.img.x, kind === 'stomp' ? this.groundY - 150 : this.groundY - 90, 0xfff08a, 6, 22, 110); sfx.clang();
    // another lane: a slab drops at 2/3 and 1/3 health
    const stage = this.hp <= this.maxHp / 3 ? 2 : this.hp <= (this.maxHp * 2) / 3 ? 1 : 0;
    if (stage > this.lanes && this.alive && this.hp > 0) {
      this.lanes = stage;
      floatText(this.scene, this.img.x - 40, this.groundY - 176, 'ANOTHER LANE!', 'font_red', 0xffffff, 1000); sfx.laugh();
      this.hooks.lane(this.lanes === 1 ? this.bounds.left + 150 : this.bounds.left + 60);
    }
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    this.clearWarn(); this.waves.forEach((w) => w.g.destroy()); this.waves = [];
    sfx.rumble(); shake(this.scene, 600, 0.016);
    floatText(this.scene, this.img.x - 40, this.groundY - 176, 'NO MORE LANES.', 'font_big', 0xffffff, 1600);
    this.scene.tweens.add({ targets: this.img, angle: -8, y: this.groundY + 60, alpha: 0, duration: 1800, delay: 400, ease: 'Quad.easeIn' });
    for (let i = 0; i < 8; i++) this.scene.time.delayedCall(i * 160, () => puff(this.scene, this.img.x + (Math.random() - 0.5) * 120, this.groundY - 40 - Math.random() * 100, 0xa39c8b, 8, 30, 106));
  }
  private telegraph(msg: string) { this.clearWarn(); this.warn = this.scene.add.bitmapText(this.img.x, this.groundY - 176, 'font_outline', msg).setOrigin(0.5).setTint(0xff6347).setDepth(200); }
  private clearWarn() { this.warn?.destroy(); this.warn = undefined; }

  private fling(px: number, i: number) {
    const s = this.scene.physics.add.image(this.img.x - 76, this.groundY - 124, 'world', 'carside_red').setScale(0.45).setDepth(106).setFlipX(true);
    const tF = 0.9 + i * 0.2, dx = px - s.x + (i - 1) * 40;
    const b = s.body as Phaser.Physics.Arcade.Body;
    b.setVelocity(dx / tF, -0.5 * 1000 * tF + (this.groundY - 8 - s.y) / tF).setSize(40, 20);
    this.scene.tweens.add({ targets: s, angle: -360, duration: 700, repeat: 2 });
    this.cars.push(s); sfx.throwIt();
  }

  update(dtMs: number, px: number, pRect: Phaser.Geom.Rectangle, onGround: boolean) {
    const dt = dtMs / 1000;
    for (const w of [...this.waves]) {
      w.x += w.dir * 175 * this.rage * dt; w.g.setPosition(w.x, this.groundY - 4);
      if (onGround && Math.abs(pRect.centerX - w.x) < 14 && pRect.bottom > this.groundY - 10) { this.hooks.hurt(w.x); }
      if (w.x < this.bounds.left - 20 || w.x > this.bounds.right + 20) { w.g.destroy(); this.waves.splice(this.waves.indexOf(w), 1); }
    }
    for (const c of [...this.cars]) {
      const b = c.body as Phaser.Physics.Arcade.Body, r = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
      const kill = () => { c.destroy(); this.cars.splice(this.cars.indexOf(c), 1); };
      if (Phaser.Geom.Rectangle.Overlaps(r, pRect)) { this.hooks.hurt(c.x); kill(); continue; }
      if (c.y > this.groundY - 6) { sfx.stamp(); puff(this.scene, c.x, this.groundY - 4, 0xd42a24, 8, 20, 106); kill(); }
    }
    if (!this.alive) return;
    this.t -= dt;
    if (this.warn) this.warn.setPosition(this.img.x, Math.round(this.groundY - 176 - Math.sin(this.t * 20)));
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.state = 'wind'; this.t = 0.9 / this.rage; this.telegraph('!'); } break;
      case 'wind': { // the body lifts before it slams down
        this.img.y = this.groundY + 2 - 16 * Math.min(1, 1 - this.t / (0.9 / this.rage));
        if (this.t <= 0) {
          this.clearWarn(); this.state = 'stomp'; this.t = 0.35; this.img.y = this.groundY + 2;
          shake(this.scene, 300, 0.016); sfx.stamp(); sfx.rumble();
          for (const dir of [-1, 1] as const) { const g = this.scene.add.rectangle(this.img.x + dir * 50, this.groundY - 4, 26, 8, 0xa39c8b).setStrokeStyle(1, 0x16121f).setDepth(97); this.waves.push({ g, x: this.img.x + dir * 50, dir }); }
          for (const lr of this.legRects()) if (Phaser.Geom.Rectangle.Overlaps(lr, pRect)) this.hooks.hurt(this.img.x);
          puff(this.scene, this.img.x - 44, this.groundY - 2, 0xa39c8b, 10, 30, 105); puff(this.scene, this.img.x + 28, this.groundY - 2, 0xa39c8b, 10, 30, 105);
        }
        break;
      }
      case 'stomp':
        if (this.t <= 0) { this.state = 'fling'; this.t = 0.7 / this.rage; this.telegraph('!'); }
        break;
      case 'fling':
        if (this.t <= 0) {
          this.clearWarn();
          const n = this.rage > 1.3 ? 4 : 3;
          for (let i = 0; i < n; i++) this.scene.time.delayedCall(i * 220, () => this.alive && this.fling(px, i));
          this.state = 'vent'; this.t = 3.2 / this.rage; this.cycle++;
          this.img.setFrame('highwaymech_1'); sfx.boost();
          floatText(this.scene, this.img.x, this.groundY - 110, 'OVERHEATED! PUMP THE VENT!', 'font', 0xfff08a, 900);
        }
        break;
      case 'vent':
        if (Math.random() < 0.4) puff(this.scene, this.img.x + (Math.random() - 0.5) * 30, this.groundY - 96, 0xff9a2e, 1, 8, 105);
        if (this.t <= 0) { this.img.setFrame('highwaymech_0'); this.state = 'wind'; this.t = 0.9 / this.rage; this.telegraph('!'); }
        break;
    }
  }
}
