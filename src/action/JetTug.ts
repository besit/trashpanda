// Mission 11's boss, "Grounded": THE JET TUG, a baggage tug with a rat at the wheel towing Dog Fjord's private
// jet nose first across Little Norway Park. M4.1 rework (Ivan: "it should not hit me when I jump over it... so I
// can ride on top of it maybe, but it hits with the front... move away from the screen before swapping sides"):
//  - it drives in from one side, crosses the park and drives fully OFF the other side; then it comes back
//    from that side going the other way. It never turns round on screen
//  - only the TUG at the front hurts. The jet behind it is harmless and its fuselage is a moving platform you
//    can jump onto and ride (jump from the ground: the fuselage top is 40 px up)
//  - land on the tug's roof to stomp it
//  - halfway across it stops to REFUEL: then the tug is still and can be pumped
//  - its jet blast pushes you away from the tail (no damage); below half health it's faster and rolls a
//    suitcase at you at every refuel stop
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

const ROLL = 0.4;
type State = 'intro' | 'rev' | 'drive' | 'refuel' | 'away' | 'dead';
const JET = { x0: -120, x1: 58 };   // the jet's span in the right-facing image, from the image centre
const TUG = { x0: 64, x1: 118 };    // the tug's span

export class JetTug {
  readonly img: Phaser.GameObjects.Image;
  /** the jet's fuselage: a one-way platform that moves with the rig (ride it) */
  readonly platform: Phaser.GameObjects.Zone;
  readonly maxHp = 12;
  hp = this.maxHp;
  dir: 1 | -1 = -1;
  private state: State = 'intro';
  private t = 1.2;
  private lastHit = -1;
  private honkCd = 0;
  private refuelled = false;
  private revX = 0;
  /** M4.3 (review): the tug rolls the last stretch in to its rev spot instead of appearing there */
  private rollT = 0;

  constructor(private scene: Phaser.Scene, _x: number, private groundY: number, private bounds: { left: number; right: number }, private onCase: (x: number, dir: 1 | -1) => void) {
    // it starts off screen to the right, facing left; M4.2: it revs at the edge, only its tug showing
    const x0 = bounds.right + 130;
    this.img = scene.add.image(x0, groundY + 4, 'world', 'jettugl_0').setOrigin(0.5, 70 / 74).setDepth(105);
    this.platform = scene.add.zone(x0 + this.jetMid(), groundY - 37, JET.x1 - JET.x0 - 16, 6);
    scene.physics.add.existing(this.platform);
    const b = this.platform.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(false).setImmovable(true);
    b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false;
    floatText(scene, bounds.right - 120, groundY - 90, 'CLEAR THE RUNWAY! VIP COMING THROUGH!', 'font_red', 0xffffff, 1400);
    sfx.carHonk();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get title() { return 'THE JET TUG'; }
  get refuelling() { return this.state === 'refuel'; }
  get phase() { return this.state; }
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.3 : 1; }
  /**
   * M4.2 (Ivan: "too easy. Let's make him rev up a little, then go across the screen faster, and so we can't jump on
   * top before it goes across"): it waits at the screen's edge with only the tug poking in (the jet is still off
   * screen, so there's nothing to climb), revs, then crosses at 170 px/s (was 100).
   */
  private revAt() {
    const pb = this.platform.body as Phaser.Physics.Arcade.Body;
    // the tug's nose 46 px inside the edge it comes from
    this.img.x = this.dir === -1 ? this.bounds.right - 46 + TUG.x1 : this.bounds.left + 46 - TUG.x1;
    this.revX = this.img.x;
    this.platform.x = this.img.x + this.jetMid(); pb.reset(this.platform.x, this.platform.y);
    this.img.x = this.revX - this.dir * 64; // it rolls in from here (rollT)
    pb.checkCollision.up = false; // no riding until it rolls
    this.state = 'rev'; this.rollT = ROLL; this.t = 1.1 / this.rage + ROLL;
    sfx.boost();
    floatText(this.scene, Phaser.Math.Clamp(this.rect().centerX, this.bounds.left + 50, this.bounds.right - 50), this.groundY - 56, 'VRRROOOM!', 'font_red', 0xffffff, 700);
  }
  private jetMid() { return (this.dir === 1 ? (JET.x0 + JET.x1) / 2 : -(JET.x0 + JET.x1) / 2); }
  private span(s: { x0: number; x1: number }) { return this.dir === 1 ? [this.img.x + s.x0, this.img.x + s.x1] : [this.img.x - s.x1, this.img.x - s.x0]; }
  /** the tug at the front: the only part that hurts (while it drives) */
  rect() { const [a, b] = this.span(TUG); return new Phaser.Geom.Rectangle(a, this.groundY - 30, b - a, 30); }
  /** the tug's roof: land on it to stomp */
  roofY() { return this.groundY - 32; }
  roofRect() { const [a, b] = this.span(TUG); return new Phaser.Geom.Rectangle(a + 2, this.groundY - 36, b - a - 4, 8); }
  /** pumpable while it refuels */
  tugRect() { return this.rect(); }
  /** the jet blast behind the tail */
  blastRect() { const [a, b] = this.span(JET); return this.dir === 1 ? new Phaser.Geom.Rectangle(a - 90, this.groundY - 46, 90, 46) : new Phaser.Geom.Rectangle(b, this.groundY - 46, 90, 46); }
  get dangerous() { return this.state === 'drive'; }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit || this.state === 'away') return false;
    if (kind === 'pump' && this.state !== 'refuel') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    const tr = this.rect();
    puff(this.scene, tr.centerX, kind === 'stomp' ? this.groundY - 34 : this.groundY - 14, 0xfff08a, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    (this.platform.body as Phaser.Physics.Arcade.Body).setVelocityX(0).checkCollision.up = false;
    sfx.carHonk(); sfx.squeak(); shake(this.scene, 400, 0.012);
    floatText(this.scene, Phaser.Math.Clamp(this.img.x, this.bounds.left + 80, this.bounds.right - 80), this.groundY - 100, 'GROUNDED!', 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.img, y: this.groundY + 40, alpha: 0, duration: 1500, ease: 'Quad.easeIn' });
  }

  /** the blast pushes a body standing in it away from the jet (no damage) */
  blast(pRect: Phaser.Geom.Rectangle, body: Phaser.Physics.Arcade.Body, dt: number) {
    if (this.state !== 'drive' || !Phaser.Geom.Rectangle.Overlaps(this.blastRect(), pRect)) return false;
    body.velocity.x += -this.dir * 900 * dt;
    if (Math.random() < 0.5) puff(this.scene, pRect.centerX + (Math.random() - 0.5) * 20, pRect.centerY + (Math.random() - 0.5) * 20, 0xc9c5d1, 1, 10, 106);
    return true;
  }

  update(dtMs: number, px: number) {
    const pb = this.platform.body as Phaser.Physics.Arcade.Body;
    if (!this.alive) { pb.setVelocityX(0); return; }
    const dt = dtMs / 1000;
    this.t -= dt;
    let vx = 0;
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.refuelled = false; this.revAt(); } break;
      case 'rev': { // shaking on the spot, smoke and blast; then off it goes
        if (this.rollT > 0) { this.rollT = Math.max(0, this.rollT - dt); const k = this.rollT / ROLL; this.img.x = this.revX - this.dir * 64 * k * k; break; }
        this.img.x = this.revX + (Math.random() < 0.5 ? -1 : 1);
        if (Math.random() < 0.7) puff(this.scene, this.rect().centerX - this.dir * 30, this.groundY - 8, 0x69657a, 1, 10, 106);
        if (this.t <= 0) { this.state = 'drive'; (this.platform.body as Phaser.Physics.Arcade.Body).checkCollision.up = true; sfx.carHonk(); }
        break;
      }
      case 'drive': {
        vx = this.dir * 170 * this.rage;
        const br = this.blastRect();
        if (Math.random() < 0.6) puff(this.scene, br.x + Math.random() * br.width, br.y + 8 + Math.random() * 30, Math.random() < 0.5 ? 0xc9c5d1 : 0xffd3c4, 1, 10, 104);
        this.honkCd -= dt; if (this.honkCd <= 0 && Math.abs(px - this.img.x) < 180) { sfx.carHonk(); this.honkCd = 1.5; }
        // halfway across, the tug stops to refuel; then on and off the far side
        const mid = (this.bounds.left + this.bounds.right) / 2 + this.dir * 40;
        if (!this.refuelled && (this.img.x - mid) * this.dir >= 0) {
          this.state = 'refuel'; this.t = 2.6 / this.rage; this.refuelled = true;
          sfx.brake();
          floatText(this.scene, Phaser.Math.Clamp(this.rect().centerX, this.bounds.left + 80, this.bounds.right - 80), this.groundY - 60, 'REFUELLING! PUMP THE TUG!', 'font', 0xfff08a, 900);
          if (this.rage > 1) this.scene.time.delayedCall(500, () => { if (this.state === 'refuel') this.onCase(this.rect().centerX, px < this.img.x ? -1 : 1); });
        }
        if (this.dir === 1 ? this.img.x > this.bounds.right + 130 : this.img.x < this.bounds.left - 130) { this.state = 'away'; this.t = 1.1; }
        break;
      }
      case 'refuel':
        if (Math.random() < 0.3) puff(this.scene, this.rect().centerX + (Math.random() - 0.5) * 30, this.groundY - 30, 0x69657a, 1, 8, 104);
        if (this.t <= 0) { this.state = 'drive'; sfx.boost(); }
        break;
      case 'away': // off screen: it turns round out of sight and comes back from the side it left
        if (this.t <= 0) {
          this.dir = this.dir === 1 ? -1 : 1;
          this.refuelled = false;
          this.revAt();
        }
        break;
    }
    pb.setVelocityX(vx);
    // the image follows the platform's body, so a rider is carried exactly with the jet
    if (this.state !== 'rev') this.img.x = this.platform.x - this.jetMid();
    this.img.setFrame(`${this.dir === 1 ? 'jettug' : 'jettugl'}_${Math.floor(this.scene.time.now / 130) % 2}`);
  }
}
