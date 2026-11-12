// Side-view raccoon on a bike. Responsive platforming: coyote time, jump buffer, variable jump,
// air dash, 3-hit lid combo, stomp, boost.
import Phaser from 'phaser';
import type { InputManager } from '../input/InputManager';
import { sfx } from '../audio/sfx';
import { puff } from '../ui/fx';

export const SIDE = {
  accel: 700, airAccel: 480, friction: 620, maxSpeed: 132, boostSpeed: 205,
  jumpVel: 330, jumpCut: 0.45, coyote: 0.1, buffer: 0.12, gravity: 1000,
  dashSpeed: 370, dashTime: 0.17, dashCd: 0.42,
  comboWindow: 0.38, swingTime: 0.2,
  maxHp: 5, invuln: 1.0,
  staminaMax: 100, staminaDrain: 34, staminaRegen: 24,
};

export interface Hitbox { x: number; y: number; w: number; h: number; dmg: number; kb: number; id: number }

export class SidePlayer {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  facing: 1 | -1 = 1;
  hp = SIDE.maxHp;
  private coyoteT = 0; private bufferT = 0;
  dashT = 0; private dashCd = 0; private airDashUsed = false;
  private swingT = 0; private comboT = 0; combo = 0; private swingId = 0;
  invulnT = 0; private hurtT = 0;
  stamina = SIDE.staminaMax; private exhausted = false; boosting = false;
  private wasGround = true;
  frozen = false;
  dead = false;

  constructor(private scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'chars', 'rs_0').setOrigin(0.5, 42 / 44);
    const b = this.sprite.body as Phaser.Physics.Arcade.Body;
    b.setSize(22, 16).setOffset(17, 26);
    b.setMaxVelocityY(600);
    this.sprite.play('rs_idle');
    this.sprite.setDepth(100);
  }

  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  get onGround() { return this.body.blocked.down || this.body.touching.down; }
  get attacking() { return this.swingT > 0; }
  get dashing() { return this.dashT > 0; }

  /** Current attack hitbox, if the swing is in its active window. */
  attackBox(): Hitbox | null {
    if (this.swingT <= 0) return null;
    const p = 1 - this.swingT / SIDE.swingTime;
    if (p < 0.2 || p > 0.75) return null;
    const w = this.combo === 3 ? 30 : 24;
    return { x: this.facing === 1 ? this.sprite.x + 4 : this.sprite.x - 4 - w, y: this.sprite.y - 30, w, h: 26, dmg: this.combo === 3 ? 2 : 1, kb: this.combo === 3 ? 260 : 120, id: this.swingId };
  }
  dashBox(): Hitbox | null {
    if (this.dashT <= 0) return null;
    return { x: this.sprite.x - 14, y: this.sprite.y - 26, w: 28, h: 24, dmg: 1, kb: 300, id: 1000 + this.swingId };
  }

  /** something that takes the hit instead (the Lane Eater peloton); returns true if it did */
  shield?: () => boolean;

  hurt(fromX: number, dmg = 1): boolean {
    if (this.invulnT > 0 || this.dashT > 0 || this.dead) return false;
    if (this.shield?.()) { this.invulnT = SIDE.invuln * 0.6; return false; }
    this.hp -= dmg; this.invulnT = SIDE.invuln; this.hurtT = 0.3;
    this.body.setVelocity((this.sprite.x < fromX ? -1 : 1) * 180, -200);
    sfx.hurt();
    if (this.hp <= 0) { this.dead = true; }
    return true;
  }

  bounce() { this.body.setVelocityY(-260); this.airDashUsed = false; }

  update(input: InputManager, dtMs: number) {
    const dt = dtMs / 1000, b = this.body, v = b.velocity;
    const ground = this.onGround;
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.invulnT = Math.max(0, this.invulnT - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.comboT = Math.max(0, this.comboT - dt);
    if (ground) { this.coyoteT = SIDE.coyote; this.airDashUsed = false; } else this.coyoteT -= dt;
    if (ground && !this.wasGround) { sfx.land(); puff(this.scene, this.sprite.x, this.sprite.y, 0xc9c5d1, 5, 12, 101); }
    this.wasGround = ground;

    const ctl = !this.frozen && this.hurtT <= 0 && !this.dead;
    const mx = ctl ? input.moveX : 0;

    // boost
    const wantBoost = ctl && input.isDown('boost') && Math.abs(mx) > 0.2 && !this.exhausted;
    if (wantBoost && !this.boosting) sfx.boost();
    this.boosting = !!wantBoost;
    if (this.boosting) { this.stamina -= SIDE.staminaDrain * dt; if (this.stamina <= 0) { this.stamina = 0; this.exhausted = true; } }
    else { this.stamina = Math.min(SIDE.staminaMax, this.stamina + SIDE.staminaRegen * dt); if (this.stamina > 35) this.exhausted = false; }

    // jump (buffered + coyote)
    if (ctl && input.justPressed('jump')) this.bufferT = SIDE.buffer; else this.bufferT -= dt;
    if (this.bufferT > 0 && this.coyoteT > 0) { v.y = -SIDE.jumpVel; this.bufferT = 0; this.coyoteT = 0; sfx.jump(); puff(this.scene, this.sprite.x, this.sprite.y, 0xc9c5d1, 4, 10, 101); }
    if (!input.isDown('jump') && v.y < 0) v.y *= Math.pow(SIDE.jumpCut, dt * 20); // variable height

    // dash (one air dash)
    if (ctl && input.justPressed('dash') && this.dashCd <= 0 && (ground || !this.airDashUsed)) {
      if (Math.abs(mx) > 0.2) this.facing = mx > 0 ? 1 : -1;
      this.dashT = SIDE.dashTime; this.dashCd = SIDE.dashCd; this.swingId++;
      if (!ground) this.airDashUsed = true;
      sfx.dash(); puff(this.scene, this.sprite.x, this.sprite.y - 8, 0xf6f2e9, 6, 14, 99);
    }
    // attack combo
    if (ctl && input.justPressed('act') && this.swingT <= 0.05) {
      this.combo = this.comboT > 0 ? (this.combo % 3) + 1 : 1;
      this.swingT = SIDE.swingTime; this.comboT = SIDE.comboWindow + SIDE.swingTime; this.swingId++;
      sfx.swing();
    }
    this.swingT = Math.max(0, this.swingT - dt);

    if (this.dashT > 0) {
      this.dashT -= dt;
      v.x = this.facing * SIDE.dashSpeed; v.y = 0; b.setAllowGravity(false);
      if (Math.random() < 0.7) puff(this.scene, this.sprite.x - this.facing * 10, this.sprite.y - 10, 0xf6f2e9, 1, 6, 99);
    } else {
      b.setAllowGravity(true);
      const max = this.boosting ? SIDE.boostSpeed : SIDE.maxSpeed;
      if (Math.abs(mx) > 0.1) {
        if (this.swingT <= 0) this.facing = mx > 0 ? 1 : -1;
        const a = (ground ? SIDE.accel : SIDE.airAccel) * dt;
        const target = mx * max;
        v.x = v.x < target ? Math.min(v.x + a * (Math.sign(target - v.x) !== Math.sign(v.x) ? 1.8 : 1), target) : Math.max(v.x - a * (Math.sign(target - v.x) !== Math.sign(v.x) ? 1.8 : 1), target);
      } else if (ground && this.hurtT <= 0) {
        const f = SIDE.friction * dt;
        v.x = Math.abs(v.x) <= f ? 0 : v.x - Math.sign(v.x) * f;
      }
      if (this.boosting && ground && Math.random() < 0.5) puff(this.scene, this.sprite.x - this.facing * 14, this.sprite.y - 2, 0xff9a2e, 1, 8, 99);
    }

    // animation
    const s = this.sprite;
    s.setFlipX(this.facing === -1);
    let anim = 'rs_idle';
    if (this.hurtT > 0 || this.dead) anim = 'rs_hurt';
    else if (this.swingT > 0) anim = '';
    else if (this.dashT > 0) anim = 'rs_dash';
    else if (!ground) anim = 'rs_jump';
    else if (Math.abs(v.x) > 10) anim = this.boosting ? 'rs_boost' : 'rs_ride';
    if (anim) {
      if (s.anims.currentAnim?.key !== anim) s.play(anim, true);
      if (anim === 'rs_ride') s.anims.timeScale = Phaser.Math.Clamp(Math.abs(v.x) / 90, 0.5, 2);
    } else {
      s.anims.stop();
      const p = 1 - this.swingT / SIDE.swingTime;
      const frames = this.scene.anims.get('rs_attack').frames;
      // combo hit 3 uses the big overhead->down arc; hits 1-2 sweep through the first two poses
      const idx = this.combo === 3 ? Math.min(2, Math.floor(p * 3)) : Math.min(1, Math.floor(p * 2)) + (this.combo === 2 ? 1 : 0);
      s.setFrame(frames[Math.min(2, idx)].textureFrame);
    }
    s.setAlpha(this.invulnT > 0 && Math.floor(this.invulnT * 20) % 2 === 0 ? 0.35 : 1);
  }
}
