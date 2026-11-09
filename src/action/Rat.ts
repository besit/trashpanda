// Dog Fraud's rats (side view). Small readable state machines with clear telegraphs.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

export type RatKind = 'basic' | 'construction' | 'traffic';

const DEFS: Record<RatKind, { hp: number; speed: number; reach: number; windup: number; cooldown: number; ranged?: boolean }> = {
  basic: { hp: 3, speed: 52, reach: 22, windup: 0.38, cooldown: 0.7 },
  construction: { hp: 3, speed: 40, reach: 110, windup: 0.55, cooldown: 1.6, ranged: true },
  traffic: { hp: 4, speed: 34, reach: 30, windup: 0.6, cooldown: 1.0 },
};

type State = 'enter' | 'walk' | 'windup' | 'attack' | 'recover' | 'hurt' | 'dead';

export class Rat {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  state: State = 'enter';
  private t = 0;
  private lastHit = -1;
  private warn?: Phaser.GameObjects.BitmapText;
  facing: 1 | -1 = -1;
  readonly def;

  constructor(private scene: Phaser.Scene, x: number, y: number, readonly kind: RatKind, private onThrow: (r: Rat) => void) {
    this.def = DEFS[kind];
    this.hp = this.def.hp;
    this.sprite = scene.physics.add.sprite(x, y, 'chars', `rat_${kind}_0`).setOrigin(15 / 32, 31 / 32).setDepth(90);
    const b = this.sprite.body as Phaser.Physics.Arcade.Body;
    b.setSize(14, 22).setOffset(8, 9);
    this.sprite.play(`rat_${kind}_walk`);
    this.t = 0.4;
  }

  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  get alive() { return this.state !== 'dead'; }

  /** Attack hitbox while in the active window. */
  attackBox(): Hitbox | null {
    if (this.state !== 'attack' || this.def.ranged) return null;
    const w = this.def.reach;
    return { x: this.facing === 1 ? this.sprite.x : this.sprite.x - w, y: this.sprite.y - 24, w, h: 20, dmg: 1, kb: 0, id: 0 };
  }

  takeHit(h: Hitbox, fromX: number): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    this.lastHit = h.id;
    this.hp -= h.dmg;
    this.warn?.destroy(); this.warn = undefined;
    const dir = this.sprite.x < fromX ? -1 : 1;
    this.body.setVelocity(dir * h.kb, -120 - h.kb * 0.3);
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => this.sprite.clearTint());
    puff(this.scene, this.sprite.x, this.sprite.y - 14, 0xfff08a, 5, 16, 95);
    sfx.hit();
    if (Math.random() < 0.5) sfx.squeak();
    if (this.hp <= 0) { this.die(); return true; }
    this.state = 'hurt'; this.t = 0.35;
    this.sprite.play(`rat_${this.kind}_hurt`);
    return true;
  }

  private die() {
    this.state = 'dead';
    this.body.setAllowGravity(true);
    this.body.checkCollision.none = true;
    this.body.setVelocity(this.body.velocity.x * 0.8, -220);
    this.sprite.play(`rat_${this.kind}_hurt`);
    sfx.squeak();
    this.scene.tweens.add({ targets: this.sprite, angle: this.facing * -540, duration: 700 });
    this.scene.time.delayedCall(650, () => {
      sfx.poof();
      puff(this.scene, this.sprite.x, this.sprite.y - 10, 0xc9c5d1, 10, 24, 95);
      floatText(this.scene, this.sprite.x, this.sprite.y - 20, '+1', 'font_outline', 0xfff08a);
      this.sprite.destroy();
    });
  }

  update(dtMs: number, px: number) {
    if (!this.alive) return;
    const dt = dtMs / 1000;
    this.t -= dt;
    const b = this.body;
    const dx = px - this.sprite.x, dist = Math.abs(dx);
    const ground = b.blocked.down || b.touching.down;
    if (this.state !== 'hurt' && this.state !== 'attack') this.facing = dx > 0 ? 1 : -1;
    this.sprite.setFlipX(this.facing === -1);

    switch (this.state) {
      case 'enter':
      case 'walk': {
        const want = this.def.ranged ? (dist > this.def.reach ? 1 : dist < 70 ? -1 : 0) : dist > this.def.reach - 4 ? 1 : 0;
        if (ground) b.setVelocityX(want * this.facing * this.def.speed);
        if (this.sprite.anims.currentAnim?.key !== `rat_${this.kind}_walk`) this.sprite.play(`rat_${this.kind}_walk`);
        this.sprite.anims.timeScale = want === 0 ? 0.3 : 1;
        if (this.t <= 0 && dist < this.def.reach + 6 && ground) {
          this.state = 'windup'; this.t = this.def.windup;
          b.setVelocityX(0);
          this.sprite.play(`rat_${this.kind}_windup`);
          this.warn = this.scene.add.bitmapText(this.sprite.x, this.sprite.y - 36, 'font_outline', '!').setOrigin(0.5).setTint(0xff6347).setDepth(200);
          if (Math.random() < 0.4) sfx.squeak();
        }
        break;
      }
      case 'windup':
        b.setVelocityX(0);
        if (this.warn) this.warn.setPosition(this.sprite.x, this.sprite.y - 36 - Math.sin(this.t * 30));
        if (this.t <= 0) {
          this.warn?.destroy(); this.warn = undefined;
          this.state = 'attack'; this.t = 0.16;
          this.sprite.play(`rat_${this.kind}_attack`);
          if (this.def.ranged) { this.onThrow(this); sfx.throwIt(); }
          else { b.setVelocityX(this.facing * 90); sfx.swing(); }
        }
        break;
      case 'attack':
        if (this.t <= 0) { this.state = 'recover'; this.t = 0.25; }
        break;
      case 'recover':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) { this.state = 'walk'; this.t = this.def.cooldown; }
        break;
      case 'hurt':
        if (this.t <= 0 && ground) { this.state = 'walk'; this.t = 0.5; }
        break;
    }
  }
}
