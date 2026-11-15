// Mission 11's boss (M3.4, "Grounded"): THE JET TUG, a baggage tug with a rat at the wheel towing Dog Fjord's
// private jet nose first across Little Norway Park.
//  - it taxis across the arena; its jet blast trails behind it and BLOWS the raccoon back (no damage, but it
//    shoves you toward whatever is coming), and the tug and the jet hurt on contact while it moves
//  - at the edge it stops to REFUEL: that's when the tug can be pumped
//  - stomp the jet's cabin roof any time
//  - below half health it taxis faster, and each refuel stop sends a suitcase rolling at you
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

type State = 'intro' | 'taxi' | 'refuel' | 'turn' | 'dead';

export class JetTug {
  readonly img: Phaser.GameObjects.Image;
  readonly maxHp = 16;
  hp = this.maxHp;
  dir: 1 | -1 = -1;
  private state: State = 'intro';
  private t = 1.4;
  private lastHit = -1;
  private honkCd = 0;

  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private bounds: { left: number; right: number }, private onCase: (x: number, dir: 1 | -1) => void) {
    this.img = scene.add.image(x, groundY + 4, 'world', 'jettugl_0').setOrigin(0.5, 70 / 74).setDepth(105); // left-facing frames are their own sprites (the lettering)
    floatText(scene, x - 40, groundY - 90, 'CLEAR THE RUNWAY! VIP COMING THROUGH!', 'font_red', 0xffffff, 1400);
    sfx.carHonk();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get title() { return 'THE JET TUG'; }
  get refuelling() { return this.state === 'refuel'; }
  get phase() { return this.state; }
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.35 : 1; }
  /** the whole rig: hurts on contact while it taxis */
  rect() { return new Phaser.Geom.Rectangle(this.img.x - 112, this.groundY - 48, 224, 46); }
  /** the jet's cabin roof: stomp it */
  roofY() { return this.groundY - 48; }
  roofRect() { return this.dir === 1 ? new Phaser.Geom.Rectangle(this.img.x - 114, this.groundY - 54, 94, 10) : new Phaser.Geom.Rectangle(this.img.x + 20, this.groundY - 54, 94, 10); }
  /** the tug: pump it while it refuels */
  tugRect() { return this.dir === 1 ? new Phaser.Geom.Rectangle(this.img.x + 60, this.groundY - 32, 58, 32) : new Phaser.Geom.Rectangle(this.img.x - 118, this.groundY - 32, 58, 32); }
  /** the jet blast behind the tail */
  blastRect() { return this.dir === 1 ? new Phaser.Geom.Rectangle(this.img.x - 212, this.groundY - 46, 100, 46) : new Phaser.Geom.Rectangle(this.img.x + 112, this.groundY - 46, 100, 46); }
  get dangerous() { return this.state === 'taxi'; }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    if (kind === 'pump' && this.state !== 'refuel') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    const tr = this.tugRect();
    puff(this.scene, kind === 'stomp' ? this.roofRect().centerX : tr.centerX, kind === 'stomp' ? this.groundY - 50 : this.groundY - 16, 0xfff08a, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    sfx.carHonk(); sfx.squeak(); shake(this.scene, 400, 0.012);
    floatText(this.scene, this.img.x, this.groundY - 100, 'GROUNDED!', 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.img, x: this.img.x + this.dir * 160, y: this.groundY + 40, angle: this.dir * -6, alpha: 0, duration: 1500, ease: 'Quad.easeIn' });
  }

  /** the blast pushes a body standing in it away from the jet (no damage) */
  blast(pRect: Phaser.Geom.Rectangle, body: Phaser.Physics.Arcade.Body, dt: number) {
    if (this.state !== 'taxi' || !Phaser.Geom.Rectangle.Overlaps(this.blastRect(), pRect)) return false;
    body.velocity.x += -this.dir * 1100 * dt;
    if (Math.random() < 0.5) puff(this.scene, pRect.centerX + (Math.random() - 0.5) * 20, pRect.centerY + (Math.random() - 0.5) * 20, 0xc9c5d1, 1, 10, 106);
    return true;
  }

  update(dtMs: number, px: number) {
    if (!this.alive) return;
    const dt = dtMs / 1000;
    this.t -= dt;
    this.img.setFrame(`${this.dir === 1 ? 'jettug' : 'jettugl'}_${Math.floor(this.scene.time.now / 130) % 2}`);
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.state = 'taxi'; sfx.boost(); } break;
      case 'taxi': {
        this.img.x += this.dir * 105 * this.rage * dt;
        // exhaust: heat shimmer out of the tail
        const br = this.blastRect();
        if (Math.random() < 0.7) puff(this.scene, br.x + Math.random() * br.width, br.y + 8 + Math.random() * 30, Math.random() < 0.5 ? 0xc9c5d1 : 0xffd3c4, 1, 10, 104);
        this.honkCd -= dt; if (this.honkCd <= 0 && Math.abs(px - this.img.x) < 180) { sfx.carHonk(); this.honkCd = 1.5; }
        const edge = this.dir === 1 ? this.bounds.right - 118 : this.bounds.left + 118;
        if ((this.dir === 1 && this.img.x >= edge) || (this.dir === -1 && this.img.x <= edge)) {
          this.img.x = edge; this.state = 'refuel'; this.t = 2.4 / this.rage;
          sfx.brake();
          floatText(this.scene, Phaser.Math.Clamp(this.tugRect().centerX, this.bounds.left + 80, this.bounds.right - 80), this.groundY - 60, 'REFUELLING! PUMP THE TUG!', 'font', 0xfff08a, 900);
          if (this.rage > 1) this.scene.time.delayedCall(500, () => { if (this.state === 'refuel') this.onCase(this.img.x - this.dir * 100, px < this.img.x ? -1 : 1); });
        }
        break;
      }
      case 'refuel':
        if (Math.random() < 0.3) puff(this.scene, this.tugRect().centerX + (Math.random() - 0.5) * 30, this.groundY - 30, 0x69657a, 1, 8, 104);
        if (this.t <= 0) { this.state = 'turn'; this.t = 0.6; }
        break;
      case 'turn':
        if (this.t <= 0) { this.dir = this.dir === 1 ? -1 : 1; this.state = 'taxi'; sfx.boost(); }
        break;
    }
  }
}
