// Mission 8's boss (M3.1, Ivan: "feels like we need a boss here... maybe a pink excavator for the megaspa
// construction?"): the PINK DIGGER, the fictional MEGA SPA's excavator, driven by a rat in a bathrobe.
//  - it creeps toward you, raises its bucket (a red marker shows where it will land) and SLAMS it down
//  - the bucket sticks in the ground for a moment: that's when its arm can be pumped
//  - every other cycle it flings sand clods in arcs instead
//  - stomp the cab roof any time; touching the tracks hurts
//  - below half health it slams faster and flings more
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

type State = 'intro' | 'creep' | 'raise' | 'slam' | 'stuck' | 'recover' | 'fling' | 'dead';
const BUCKET_DX = -110; // where the slammed bucket lands, from the origin (it faces left)

export class SpaDigger {
  readonly img: Phaser.GameObjects.Image;
  readonly maxHp = 18;
  hp = this.maxHp;
  private state: State = 'intro';
  private t = 1.4;
  private cycle = 0;
  private lastHit = -1;
  private marker?: Phaser.GameObjects.Graphics;
  private clods: Phaser.Physics.Arcade.Image[] = [];
  private slamHit = 0;

  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private bounds: { left: number; right: number }, private onHurtPlayer: (fromX: number) => void) {
    this.img = scene.add.image(x, groundY + 4, 'world', 'digger_0').setOrigin(120 / 220, 120 / 124).setDepth(104);
    floatText(scene, x - 30, groundY - 110, 'NO SWIMMING WITHOUT A DAY PASS!', 'font_red', 0xffffff, 1400);
    sfx.construction();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get title() { return 'THE PINK DIGGER'; }
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.35 : 1; }
  /** the tracks + house: touching them hurts */
  rect() { return new Phaser.Geom.Rectangle(this.img.x - 16, this.groundY - 54, 104, 54); }
  /** the cab roof: stomp it */
  roofY() { return this.groundY - 92; }
  roofRect() { return new Phaser.Geom.Rectangle(this.img.x - 12, this.groundY - 98, 38, 10); }
  /** the arm + bucket, hittable only while the bucket is stuck */
  armRect() { return new Phaser.Geom.Rectangle(this.img.x + BUCKET_DX - 16, this.groundY - 70, 80, 70); }
  get stuck() { return this.state === 'stuck'; }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    if (kind === 'pump' && this.state !== 'stuck') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    puff(this.scene, kind === 'stomp' ? this.img.x + 6 : this.img.x + BUCKET_DX + 20, kind === 'stomp' ? this.groundY - 92 : this.groundY - 30, 0xff6347, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    this.marker?.destroy();
    sfx.squeak(); shake(this.scene, 400, 0.012);
    floatText(this.scene, this.img.x, this.groundY - 110, 'SPA CANCELLED!', 'font_big', 0xffffff, 1400);
    this.img.setFrame('digger_0');
    this.scene.tweens.add({ targets: this.img, x: this.img.x + 260, alpha: 0, duration: 1600, ease: 'Quad.easeIn' });
  }

  update(dtMs: number, px: number, pRect: Phaser.Geom.Rectangle) {
    const dt = dtMs / 1000;
    this.updateClods(dt, pRect);
    if (!this.alive) return;
    this.t -= dt;
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.state = 'creep'; this.t = 1.2; } break;
      case 'creep': {
        // keep the bucket's landing spot near the raccoon
        const want = px - BUCKET_DX - 10;
        const dx = Phaser.Math.Clamp(want - this.img.x, -1, 1);
        this.img.x = Phaser.Math.Clamp(this.img.x + dx * 46 * this.rage * dt, this.bounds.left + 150, this.bounds.right - 90);
        if (Math.random() < 0.15) puff(this.scene, this.img.x + 80, this.groundY - 66, 0x69657a, 1, 6, 103);
        if (this.t <= 0) {
          this.cycle++;
          if (this.cycle % 3 === 0) { this.state = 'fling'; this.t = 0.6; this.img.setFrame('digger_1'); }
          else { this.state = 'raise'; this.t = 0.9 / this.rage; this.img.setFrame('digger_1'); this.showMarker(); }
        }
        break;
      }
      case 'raise':
        if (this.marker) this.marker.setAlpha(0.5 + 0.5 * Math.sin(this.scene.time.now / 50));
        if (this.t <= 0) {
          this.state = 'slam'; this.t = 0.18; this.img.setFrame('digger_2'); this.slamHit = 0;
          shake(this.scene, 220, 0.012); sfx.hit();
          puff(this.scene, this.img.x + BUCKET_DX, this.groundY - 4, 0xd9a86c, 12, 34, 105);
        }
        break;
      case 'slam': {
        const zone = new Phaser.Geom.Rectangle(this.img.x + BUCKET_DX - 22, this.groundY - 34, 44, 34);
        if (!this.slamHit && Phaser.Geom.Rectangle.Overlaps(zone, pRect)) { this.slamHit = 1; this.onHurtPlayer(this.img.x + BUCKET_DX); }
        if (this.t <= 0) { this.state = 'stuck'; this.t = 1.7 / this.rage; this.marker?.destroy(); this.marker = undefined; floatText(this.scene, this.img.x + BUCKET_DX, this.groundY - 70, 'STUCK! PUMP THE ARM!', 'font', 0xfff08a, 700); }
        break;
      }
      case 'stuck':
        if (Math.random() < 0.3) puff(this.scene, this.img.x + BUCKET_DX + (Math.random() - 0.5) * 30, this.groundY - 4, 0xd9a86c, 1, 8, 105);
        if (this.t <= 0) { this.state = 'recover'; this.t = 0.4; this.img.setFrame('digger_0'); }
        break;
      case 'recover': if (this.t <= 0) { this.state = 'creep'; this.t = 1.0 / this.rage; } break;
      case 'fling':
        if (this.t <= 0) {
          const n = this.rage > 1 ? 4 : 3;
          for (let i = 0; i < n; i++) this.scene.time.delayedCall(i * 180, () => this.throwClod(px + (i - 1) * 40));
          sfx.throwIt();
          this.state = 'recover'; this.t = 0.9; this.img.setFrame('digger_0');
        }
        break;
    }
  }

  private showMarker() {
    this.marker?.destroy();
    const g = this.scene.add.graphics().setDepth(41);
    const x = this.img.x + BUCKET_DX;
    g.fillStyle(0xd42a24, 0.55).fillEllipse(x, this.groundY, 52, 10).lineStyle(1, 0xff6347).strokeEllipse(x, this.groundY, 52, 10);
    this.marker = g;
  }

  private throwClod(targetX: number) {
    if (!this.alive) return;
    const sx = this.img.x - 80, sy = this.groundY - 100, T = 1.0;
    const c = this.scene.physics.add.image(sx, sy, 'world', 'sandclod').setDepth(106);
    const b = c.body as Phaser.Physics.Arcade.Body;
    const g = (this.scene.physics.world.gravity.y || 1000);
    b.setVelocity((targetX - sx) / T, (this.groundY - 6 - sy - 0.5 * g * T * T) / T).setSize(8, 8);
    this.clods.push(c);
  }
  private updateClods(_dt: number, pRect: Phaser.Geom.Rectangle) {
    this.clods = this.clods.filter((c) => {
      if (!c.active) return false;
      if (Phaser.Geom.Rectangle.Overlaps(c.getBounds(), pRect)) { this.onHurtPlayer(c.x); puff(this.scene, c.x, c.y, 0xd9a86c, 6, 16, 106); c.destroy(); return false; }
      if (c.y >= this.groundY - 4) { puff(this.scene, c.x, this.groundY - 4, 0xd9a86c, 6, 16, 106); c.destroy(); return false; }
      return true;
    });
  }
}
