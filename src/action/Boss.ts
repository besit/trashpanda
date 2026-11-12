// Arena bosses. One readable 4-move loop with telegraphs, configured per boss:
//   VOLLEY (arcing projectiles you can swat) -> WALK + SHOVE -> SUMMON (two minions) -> SPECIAL.
// The Bureaucrat Rat (mission 3): stamps, a clipboard shove, the desk bell, RED TAPE sweeping the floor.
// The Foreman Rat (mission 1, M2.1): cones, a jackhammer shove, a whistle, and a JACKHAMMER charge.
// Both get faster at 2/3 and 1/3 health; only finishers and stomps make them flinch.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

type Move = 'intro' | 'volley' | 'walk' | 'shove' | 'summon' | 'special' | 'charge' | 'dizzy' | 'hurt' | 'dead';
export type BossKind = 'bureaucrat' | 'foreman';

export interface BossHooks {
  summon: (x: number) => void;
  clerksAlive: () => number;
  hurtPlayer: (fromX: number) => void;
}

const DEFS = {
  bureaucrat: { key: 'rat_bureaucrat', title: 'THE BUREAUCRAT RAT', hp: 32, intro: 'PERMIT DENIED!', outro: 'APPROVED!', proj: 'stamp_0', projScale: 1, summonCall: 'DING!', special: 'tape' as const, specialCall: 'RED TAPE!', prop: 'desk', debris: 0xf6f2e9 },
  foreman: { key: 'rat_foreman', title: 'THE FOREMAN RAT', hp: 20, intro: 'THIS LANE IS CLOSED!', outro: 'LANE OPEN!', proj: 'cone', projScale: 1.4, summonCall: 'TWEET!', special: 'charge' as const, specialCall: 'JACKHAMMER!', prop: null, debris: 0xff9a2e },
};

export class Boss {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly def;
  readonly maxHp: number;
  hp: number;
  move: Move = 'intro';
  private t = 1.4;
  private step = 0;
  private lastHit = -1;
  private shots: Phaser.Physics.Arcade.Image[] = [];
  private tape?: { g: Phaser.GameObjects.Rectangle; x: number; dir: number };
  private warn?: Phaser.GameObjects.BitmapText;
  facing: 1 | -1 = -1;
  readonly props: Phaser.GameObjects.Image[] = [];

  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private hooks: BossHooks, readonly kind: BossKind = 'bureaucrat') {
    this.def = DEFS[kind];
    this.maxHp = this.def.hp; this.hp = this.maxHp;
    if (this.def.prop) this.props.push(scene.add.image(x + 30, groundY + 1, 'world', this.def.prop).setOrigin(0.5, 1).setDepth(88));
    else for (let i = 0; i < 3; i++) this.props.push(scene.add.image(x + 22 + i * 12, groundY + 1, 'world', 'cone').setOrigin(0.5, 1).setScale(2).setDepth(88));
    this.sprite = scene.physics.add.sprite(x, groundY - 40, 'chars', `${this.def.key}_0`).setOrigin(0.47, 47 / 48).setDepth(90).setFlipX(true);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(20, 34).setOffset(12, 13);
    this.sprite.play(`${this.def.key}_walk`);
    floatText(scene, x, groundY - 70, this.def.intro, 'font_red', 0xffffff, 900);
    sfx.stamp();
  }

  get title() { return this.def.title; }
  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  get alive() { return this.move !== 'dead'; }
  private get rage() { return this.hp <= this.maxHp / 3 ? 1.6 : this.hp <= (this.maxHp * 2) / 3 ? 1.25 : 1; }
  private anim(a: string) { this.sprite.play(`${this.def.key}_${a}`); }

  attackBox(): Hitbox | null {
    if (this.move === 'charge') return { x: this.sprite.x - 16, y: this.groundY - 34, w: 32, h: 30, dmg: 1, kb: 0, id: 0 };
    if (this.move !== 'shove' || this.t > 0.12) return null; // active during the lunge only
    return { x: this.facing === 1 ? this.sprite.x : this.sprite.x - 34, y: this.groundY - 34, w: 34, h: 28, dmg: 1, kb: 0, id: 0 };
  }

  takeHit(h: Hitbox, fromX: number): boolean {
    if (!this.alive || h.id === this.lastHit || this.move === 'intro') return false;
    this.lastHit = h.id;
    this.hp -= h.dmg;
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => this.sprite.clearTint());
    puff(this.scene, this.sprite.x, this.sprite.y - 24, this.def.debris, 6, 22, 95);
    sfx.hit();
    if (this.hp <= 0) { this.die(); return true; }
    if (h.dmg >= 2 || h.kb >= 250 || this.move === 'dizzy') {
      this.clearWarn();
      this.move = 'hurt'; this.t = 0.5;
      this.body.setVelocity((this.sprite.x < fromX ? -1 : 1) * 90, -120);
      this.anim('hurt');
    }
    return true;
  }

  private die() {
    this.move = 'dead';
    this.clearWarn();
    this.tape?.g.destroy(); this.tape = undefined;
    this.shots.forEach((s) => s.destroy()); this.shots = [];
    this.anim('hurt');
    this.body.setVelocity(0, -260);
    this.body.checkCollision.none = true;
    shake(this.scene, 400, 0.012);
    sfx.squeak(); sfx.stamp();
    floatText(this.scene, this.sprite.x, this.groundY - 80, this.def.outro, 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.sprite, angle: 720, alpha: 0, duration: 1200, onComplete: () => this.sprite.destroy() });
    const px = this.props[0]?.x ?? this.sprite.x;
    for (let i = 0; i < 4; i++) this.scene.time.delayedCall(i * 150, () => puff(this.scene, px + (Math.random() - 0.5) * 40, this.groundY - 20, this.def.debris, 8, 30, 95));
  }

  private telegraph(msg: string) {
    this.clearWarn();
    this.warn = this.scene.add.bitmapText(this.sprite.x, this.sprite.y - 56, 'font_outline', msg).setOrigin(0.5).setTint(0xff6347).setDepth(200);
  }
  private clearWarn() { this.warn?.destroy(); this.warn = undefined; }

  private next() {
    const order: Move[] = ['volley', 'walk', 'summon', 'special'];
    let m = order[this.step % order.length];
    if (m === 'summon' && this.hooks.clerksAlive() >= 2) m = 'volley';
    this.step++;
    this.move = m;
    if (m === 'volley') { this.t = 0.7 / this.rage; this.telegraph('!'); this.anim('windup'); }
    else if (m === 'walk') { this.t = 2.2; this.anim('walk'); }
    else if (m === 'summon') { this.t = 0.9; this.telegraph(this.def.summonCall); this.anim('windup'); sfx.bell(); }
    else if (m === 'special') { this.t = 0.8 / this.rage; this.telegraph(this.def.specialCall); this.anim('windup'); }
  }

  private shoot(px: number, i: number) {
    const s = this.scene.physics.add.image(this.sprite.x + this.facing * 8, this.sprite.y - 36, 'world', this.def.proj).setDepth(96).setScale(this.def.projScale);
    const tFlight = 0.8 + i * 0.18;
    const dx = px - s.x + (i - 1) * 26;
    const b = s.body as Phaser.Physics.Arcade.Body;
    b.setVelocity(dx / tFlight, -0.5 * 1000 * tFlight + (this.groundY - 6 - s.y) / tFlight).setSize(10, 8);
    this.scene.tweens.add({ targets: s, angle: 360, duration: 400, repeat: 3 });
    this.shots.push(s);
    sfx.throwIt();
  }

  update(dtMs: number, px: number, playerRect: Phaser.Geom.Rectangle, playerHits: Hitbox[], onGroundPlayer: boolean, bounds?: { left: number; right: number }) {
    const dt = dtMs / 1000;
    for (const s of [...this.shots]) {
      const b = s.body as Phaser.Physics.Arcade.Body;
      const r = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
      const kill = () => { s.destroy(); this.shots.splice(this.shots.indexOf(s), 1); };
      if (playerHits.some((h) => r.x < h.x + h.w && r.right > h.x && r.y < h.y + h.h && r.bottom > h.y)) { sfx.clang(); puff(this.scene, s.x, s.y, this.def.debris, 5, 14, 97); kill(); continue; }
      if (Phaser.Geom.Rectangle.Overlaps(r, playerRect)) { this.hooks.hurtPlayer(s.x); kill(); continue; }
      if (s.y > this.groundY - 4) { sfx.stamp(); puff(this.scene, s.x, this.groundY - 2, this.def.debris, 3, 10, 97); kill(); }
    }
    if (this.tape) {
      this.tape.x += this.tape.dir * 170 * this.rage * dt;
      this.tape.g.setPosition(this.tape.x, this.groundY - 3);
      const tr = new Phaser.Geom.Rectangle(this.tape.x - 12, this.groundY - 8, 24, 8);
      if (Phaser.Geom.Rectangle.Overlaps(tr, playerRect) && onGroundPlayer) this.hooks.hurtPlayer(this.tape.x);
      if (Math.abs(this.tape.x - this.sprite.x) > 460) { this.tape.g.destroy(); this.tape = undefined; }
    }
    if (!this.alive) return;
    const b = this.body;
    const ground = b.blocked.down || b.touching.down;
    if (this.move !== 'hurt' && this.move !== 'shove' && this.move !== 'charge' && this.move !== 'dizzy') this.facing = px > this.sprite.x ? 1 : -1;
    this.sprite.setFlipX(this.facing === -1);
    if (this.warn) this.warn.setPosition(this.sprite.x, Math.round(this.sprite.y - 56 - Math.sin(this.t * 20)));
    this.t -= dt;
    switch (this.move) {
      case 'intro': if (this.t <= 0) this.next(); break;
      case 'volley':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) { this.clearWarn(); this.anim('attack'); for (let i = 0; i < (this.rage > 1.3 ? 4 : 3); i++) this.scene.time.delayedCall(i * 140, () => this.alive && this.shoot(px, i)); this.move = 'hurt'; this.t = 0.9; }
        break;
      case 'walk': {
        const d = px - this.sprite.x;
        if (ground) b.setVelocityX(Math.sign(d) * 46 * this.rage);
        this.sprite.anims.timeScale = this.rage;
        if (Math.abs(d) < 40 || this.t <= 0) { this.move = 'shove'; this.t = 0.45 / this.rage; b.setVelocityX(0); this.telegraph('!'); this.anim('windup'); }
        break;
      }
      case 'shove':
        if (this.t <= 0.12 && this.warn) { this.clearWarn(); this.anim('attack'); b.setVelocityX(this.facing * 140); sfx.swing(); }
        if (this.t <= -0.2) { b.setVelocityX(0); this.next(); }
        break;
      case 'summon':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) { this.clearWarn(); this.hooks.summon(this.sprite.x); this.move = 'hurt'; this.t = 0.8; }
        break;
      case 'special':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) {
          this.clearWarn();
          this.anim('attack');
          if (this.def.special === 'tape') {
            const g = this.scene.add.rectangle(this.sprite.x, this.groundY - 3, 22, 5, 0xd42a24).setStrokeStyle(1, 0x16121f).setDepth(97);
            this.tape = { g, x: this.sprite.x, dir: this.facing };
            sfx.construction();
            this.move = 'hurt'; this.t = 1.0;
          } else {
            // JACKHAMMER: barrels across the arena (jump over him), then stands dizzy (free hits)
            this.move = 'charge'; this.t = 1.3;
            b.setVelocityX(this.facing * 190 * this.rage);
            sfx.construction();
          }
        }
        break;
      case 'charge':
        if (Math.random() < 0.4) puff(this.scene, this.sprite.x - this.facing * 10, this.groundY - 2, 0xc9c5d1, 1, 8, 89);
        if (Math.random() < 0.15) sfx.construction();
        if (this.t <= 0 || (bounds && (this.sprite.x < bounds.left + 20 || this.sprite.x > bounds.right - 20))) {
          b.setVelocityX(0); this.move = 'dizzy'; this.t = 1.1; this.anim('hurt');
          floatText(this.scene, this.sprite.x, this.groundY - 60, 'DIZZY!', 'font_outline', 0xfff08a, 500);
        }
        break;
      case 'dizzy':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) { this.anim('walk'); this.next(); }
        break;
      case 'hurt':
        if (this.t <= 0 && ground) { this.anim('walk'); this.next(); }
        break;
    }
  }
}
