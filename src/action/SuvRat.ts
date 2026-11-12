// The SUV Rat: Dog Fraud's through-traffic. Drives along the raccoon's lane, honking.
// Jump on the roof (stomp) or pump the bumper to make it give up and turn off ("RIGHT TURN ONLY!").
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

export class SuvRat {
  readonly img: Phaser.GameObjects.Image;
  hp: number;
  alive = true;
  dir: 1 | -1;
  speed: number;
  /** temporary slow-down (speed humps), 1 = none */
  slow = 1;
  private lastHit = -1;
  private honkCd = 0;
  private flashT = 0;
  private bounceT = 0;
  /** stalled after a hit: no movement, no contact damage */
  stallT = 0;
  tame = false;

  constructor(private scene: Phaser.Scene, x: number, readonly groundY: number, dir: 1 | -1, speed = 150, hp = 3) {
    this.dir = dir; this.speed = speed; this.hp = hp;
    this.img = scene.add.image(x, groundY + 2, 'world', 'suvrat_0').setOrigin(0.5, 0.92).setDepth(105).setFlipX(dir === -1);
    // M3.1 (Ivan): side-view cars drive in from off screen at the sides (the M2.1 rise-from-below was
    // only meant for the Parkway shot in the intro)
    sfx.carHonk();
  }

  get x() { return this.img.x; }
  get dangerous() { return this.alive && !this.tame && this.stallT <= 0; }
  /** body box (hurts the raccoon on contact) */
  rect() { return new Phaser.Geom.Rectangle(this.img.x - 30, this.groundY - 30, 60, 26); }
  /** the roof: land on it to stomp */
  roofY() { return this.groundY - 32; }

  takeHit(h: Hitbox): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    this.lastHit = h.id;
    this.hp -= h.dmg;
    this.flashT = 0.08;
    this.img.setTintFill(0xffffff);
    puff(this.scene, this.img.x, this.groundY - 20, 0xfff08a, 6, 18, 110);
    sfx.clang();
    // a hit stalls it and shoves it back: the combo can land, and a stalled car can't run you over
    this.stallT = 0.7;
    this.scene.tweens.add({ targets: this.img, x: this.img.x - this.dir * 14, duration: 120, ease: 'Quad.easeOut' });
    if (this.hp <= 0) this.defeat();
    else floatText(this.scene, this.img.x, this.groundY - 50, this.hp === 1 ? 'GRR!' : 'HEY!', 'font', 0xff6347, 250);
    return true;
  }

  private defeat() {
    this.alive = false;
    sfx.carHonk(); sfx.squeak();
    shake(this.scene, 120, 0.006);
    floatText(this.scene, this.img.x, this.groundY - 54, 'RIGHT TURN ONLY!', 'font_outline', 0x9bd35a, 900);
    // turns off the street: slides toward the camera and away
    this.scene.tweens.add({ targets: this.img, x: this.img.x + this.dir * 40, y: this.groundY + 60, angle: this.dir * 18, alpha: 0, duration: 700, ease: 'Cubic.easeIn', onComplete: () => this.img.destroy() });
  }

  /** a speed hump under the wheels: a bounce and a crawl */
  bump() {
    if (this.bounceT > 0) return;
    this.bounceT = 0.5; this.slow = 0.35;
    this.scene.tweens.add({ targets: this.img, y: this.groundY - 4, duration: 110, yoyo: true, ease: 'Sine.easeOut' });
    sfx.land();
  }

  update(dtMs: number, bounds: { left: number; right: number }, playerX: number) {
    if (!this.alive) return;
    const dt = dtMs / 1000;
    this.flashT -= dt; if (this.flashT <= 0) this.img.clearTint();
    this.bounceT -= dt;
    this.stallT -= dt;
    if (this.stallT > 0) return;
    this.slow = Math.min(1, this.slow + dt * 0.6);
    const sp = (this.tame ? 55 : this.speed) * this.slow;
    this.img.x += this.dir * sp * dt;
    this.img.setFrame(Math.floor(this.scene.time.now / 160) % 2 ? 'suvrat_1' : 'suvrat_0');
    // ping-pong inside the arena: it keeps coming back until it gives up
    if ((this.dir === 1 && this.img.x > bounds.right + 50) || (this.dir === -1 && this.img.x < bounds.left - 50)) {
      this.dir = this.dir === 1 ? -1 : 1;
      this.img.setFlipX(this.dir === -1);
    }
    this.honkCd -= dt;
    const ahead = (playerX - this.img.x) * this.dir;
    if (ahead > 0 && ahead < 140 && this.honkCd <= 0 && !this.tame) { sfx.carHonk(); this.honkCd = 1.6; }
  }
}
