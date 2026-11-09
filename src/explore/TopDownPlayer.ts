// Raccoon on a bike, 3/4 exploration view. Momentum-based steering, dash, hop, boost with stamina.
import Phaser from 'phaser';
import type { InputManager } from '../input/InputManager';
import { sfx } from '../audio/sfx';
import { puff } from '../ui/fx';

const DIRS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

export const TUNING = {
  speed: 96, boostSpeed: 168, accel: 560, decel: 420, turnAssist: 2.2,
  dashSpeed: 270, dashTime: 0.16, dashCooldown: 0.5,
  hopVel: 130, gravity: 520,
  staminaMax: 100, staminaDrain: 30, staminaRegen: 22,
};

export class TopDownPlayer {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly shadow: Phaser.GameObjects.Ellipse;
  dir = 0;
  z = 0; private vz = 0;
  dashT = 0; private dashCd = 0; private dashDir = new Phaser.Math.Vector2();
  stamina = TUNING.staminaMax; private exhausted = false;
  private chainT = 0;
  frozen = false;

  constructor(private scene: Phaser.Scene, x: number, y: number) {
    this.shadow = scene.add.ellipse(x, y, 14, 5, 0x16121f, 0.35);
    this.sprite = scene.physics.add.sprite(x, y, 'chars', 'rt_E_0').setOrigin(16 / 32, 26 / 32);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 6).setOffset(11, 23);
    body.setCollideWorldBounds(true);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get speed() { const b = this.sprite.body as Phaser.Physics.Arcade.Body; return b.velocity.length(); }
  get boosting() { return this._boosting; }
  private _boosting = false;

  update(input: InputManager, dtMs: number) {
    const dt = dtMs / 1000;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const v = body.velocity;
    this.dashCd = Math.max(0, this.dashCd - dt);

    let mx = this.frozen ? 0 : input.moveX, my = this.frozen ? 0 : input.moveY;
    // boost w/ stamina
    const wantBoost = !this.frozen && input.isDown('boost') && (mx || my) && !this.exhausted;
    if (wantBoost && !this._boosting) sfx.boost();
    this._boosting = !!wantBoost;
    if (this._boosting) { this.stamina -= TUNING.staminaDrain * dt; if (this.stamina <= 0) { this.stamina = 0; this.exhausted = true; } }
    else { this.stamina = Math.min(TUNING.staminaMax, this.stamina + TUNING.staminaRegen * dt); if (this.stamina > 35) this.exhausted = false; }

    // dash
    if (!this.frozen && input.justPressed('dash') && this.dashCd <= 0) {
      const d = mx || my ? new Phaser.Math.Vector2(mx, my).normalize() : new Phaser.Math.Vector2(Math.cos((this.dir * Math.PI) / 4), Math.sin((this.dir * Math.PI) / 4));
      this.dashDir.copy(d); this.dashT = TUNING.dashTime; this.dashCd = TUNING.dashCooldown;
      sfx.dash(); puff(this.scene, this.x, this.y, 0xc9c5d1, 6, 14);
    }
    // hop
    if (!this.frozen && input.justPressed('jump') && this.z <= 0) { this.vz = TUNING.hopVel; sfx.jump(); }

    if (this.dashT > 0) {
      this.dashT -= dt;
      v.set(this.dashDir.x * TUNING.dashSpeed, this.dashDir.y * TUNING.dashSpeed);
      if (Math.random() < 0.6) puff(this.scene, this.x, this.y, 0xf6f2e9, 1, 6);
    } else {
      const max = this._boosting ? TUNING.boostSpeed : TUNING.speed;
      const tx = mx * max, ty = my * max;
      const has = mx || my;
      // turning assist: steer faster when reversing direction, so it feels like a nimble bike, not a car
      const dot = has && v.length() > 1 ? (v.x * tx + v.y * ty) / (v.length() * Math.hypot(tx, ty)) : 1;
      const a = (has ? TUNING.accel : TUNING.decel) * (dot < 0 ? TUNING.turnAssist : 1) * dt;
      v.x = approach(v.x, tx, a); v.y = approach(v.y, ty, a);
    }

    // vertical hop
    if (this.z > 0 || this.vz > 0) {
      this.vz -= TUNING.gravity * dt; this.z += this.vz * dt;
      if (this.z <= 0) { this.z = 0; this.vz = 0; sfx.land(); puff(this.scene, this.x, this.y, 0xc9c5d1, 4, 10); }
    }

    // facing + animation
    const spd = v.length();
    if (spd > 8) this.dir = (Math.round(Math.atan2(v.y, v.x) / (Math.PI / 4)) + 8) % 8;
    const key = `rt_${DIRS[this.dir]}`;
    if (spd > 8) {
      if (this.sprite.anims.currentAnim?.key !== key) this.sprite.play(key, true);
      this.sprite.anims.timeScale = Phaser.Math.Clamp(spd / 80, 0.4, 2.2);
      this.chainT -= dt * spd;
      if (this.chainT <= 0) { sfx.chain(); this.chainT = 70; }
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(`rt_${DIRS[this.dir]}_0`);
    }
    this.sprite.setDisplayOrigin(16, 26 + this.z);
    this.sprite.setDepth(this.y + 1);
    this.shadow.setPosition(this.x, this.y).setDepth(this.y - 0.5).setScale(1 - Math.min(this.z, 20) / 40);
  }
}

function approach(cur: number, target: number, step: number) {
  return cur < target ? Math.min(cur + step, target) : Math.max(cur - step, target);
}
