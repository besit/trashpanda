// The Bureaucrat Rat: mission 3's boss, Dog Fraud's permit office in rat form.
// A readable 4-move loop with telegraphs: STAMP VOLLEY (paper arcs) -> WALK + CLIPBOARD SHOVE ->
// SUMMON (desk bell, two clerks) -> RED TAPE (a ribbon sweeping the floor: jump it). Faster when hurt.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

type Move = 'intro' | 'stamp' | 'walk' | 'shove' | 'summon' | 'tape' | 'hurt' | 'dead';

export interface BossHooks {
  summon: (x: number) => void;
  clerksAlive: () => number;
  hurtPlayer: (fromX: number) => void;
}

export class Bureaucrat {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly maxHp = 32;
  hp = this.maxHp;
  move: Move = 'intro';
  private t = 1.4;
  private step = 0;
  private lastHit = -1;
  private stamps: Phaser.Physics.Arcade.Image[] = [];
  private tape?: { g: Phaser.GameObjects.Rectangle; x: number; dir: number };
  private warn?: Phaser.GameObjects.BitmapText;
  facing: 1 | -1 = -1;
  readonly desk: Phaser.GameObjects.Image;

  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private hooks: BossHooks) {
    this.desk = scene.add.image(x + 30, groundY + 1, 'world', 'desk').setOrigin(0.5, 1).setDepth(88);
    this.sprite = scene.physics.add.sprite(x, groundY - 40, 'chars', 'rat_bureaucrat_0').setOrigin(0.47, 47 / 48).setDepth(90).setFlipX(true);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(20, 34).setOffset(12, 13);
    this.sprite.play('rat_bureaucrat_walk');
    floatText(scene, x, groundY - 70, 'PERMIT DENIED!', 'font_red', 0xffffff, 900);
    sfx.stamp();
  }

  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  get alive() { return this.move !== 'dead'; }
  private get rage() { return this.hp <= 10 ? 1.6 : this.hp <= 21 ? 1.25 : 1; }

  attackBox(): Hitbox | null {
    if (this.move !== 'shove' || this.t > 0.12) return null; // active during the lunge only
    return { x: this.facing === 1 ? this.sprite.x : this.sprite.x - 34, y: this.groundY - 34, w: 34, h: 28, dmg: 1, kb: 0, id: 0 };
  }

  takeHit(h: Hitbox, fromX: number): boolean {
    if (!this.alive || h.id === this.lastHit || this.move === 'intro') return false;
    this.lastHit = h.id;
    this.hp -= h.dmg;
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => this.sprite.clearTint());
    puff(this.scene, this.sprite.x, this.sprite.y - 24, 0xf6f2e9, 6, 22, 95); // paperwork flies
    sfx.hit();
    if (this.hp <= 0) { this.die(); return true; }
    // only big hits (combo finisher, stomps) make him flinch; otherwise he keeps filing
    if (h.dmg >= 2 || h.kb >= 250) {
      this.clearWarn();
      this.move = 'hurt'; this.t = 0.5;
      this.body.setVelocity((this.sprite.x < fromX ? -1 : 1) * 90, -120);
      this.sprite.play('rat_bureaucrat_hurt');
    }
    return true;
  }

  private die() {
    this.move = 'dead';
    this.clearWarn();
    this.tape?.g.destroy(); this.tape = undefined;
    this.stamps.forEach((s) => s.destroy()); this.stamps = [];
    this.sprite.play('rat_bureaucrat_hurt');
    this.body.setVelocity(0, -260);
    this.body.checkCollision.none = true;
    shake(this.scene, 400, 0.012);
    sfx.squeak(); sfx.stamp();
    floatText(this.scene, this.sprite.x, this.groundY - 80, 'APPROVED!', 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.sprite, angle: 720, alpha: 0, duration: 1200, onComplete: () => this.sprite.destroy() });
    for (let i = 0; i < 4; i++) this.scene.time.delayedCall(i * 150, () => puff(this.scene, this.desk.x + (Math.random() - 0.5) * 40, this.groundY - 20, 0xf6f2e9, 8, 30, 95));
  }

  private telegraph(msg: string) {
    this.clearWarn();
    this.warn = this.scene.add.bitmapText(this.sprite.x, this.sprite.y - 56, 'font_outline', msg).setOrigin(0.5).setTint(0xff6347).setDepth(200);
  }
  private clearWarn() { this.warn?.destroy(); this.warn = undefined; }

  private next() {
    const order: Move[] = ['stamp', 'walk', 'summon', 'tape'];
    let m = order[this.step % order.length];
    if (m === 'summon' && this.hooks.clerksAlive() >= 2) m = 'stamp';
    this.step++;
    this.move = m;
    if (m === 'stamp') { this.t = 0.7 / this.rage; this.telegraph('!'); this.sprite.play('rat_bureaucrat_windup'); }
    else if (m === 'walk') { this.t = 2.2; this.sprite.play('rat_bureaucrat_walk'); }
    else if (m === 'summon') { this.t = 0.9; this.telegraph('DING!'); this.sprite.play('rat_bureaucrat_windup'); sfx.bell(); }
    else if (m === 'tape') { this.t = 0.8 / this.rage; this.telegraph('RED TAPE!'); this.sprite.play('rat_bureaucrat_windup'); }
  }

  private throwStamp(px: number, i: number) {
    const s = this.scene.physics.add.image(this.sprite.x - this.facing * -8, this.sprite.y - 36, 'world', 'stamp_0').setDepth(96);
    const tFlight = 0.8 + i * 0.18;
    const dx = px - s.x + (i - 1) * 26;
    const b = s.body as Phaser.Physics.Arcade.Body;
    b.setVelocity(dx / tFlight, -0.5 * 1000 * tFlight + (this.groundY - 6 - s.y) / tFlight).setSize(10, 8);
    this.scene.tweens.add({ targets: s, angle: 360, duration: 400, repeat: 3 });
    this.stamps.push(s);
    sfx.throwIt();
  }

  /** returns hazards for the scene to test against the player and the pump */
  update(dtMs: number, px: number, playerRect: Phaser.Geom.Rectangle, playerHits: Hitbox[], onGroundPlayer: boolean) {
    const dt = dtMs / 1000;
    // projectiles: stamps land and fade; can be swatted; hurt on contact
    for (const s of [...this.stamps]) {
      const b = s.body as Phaser.Physics.Arcade.Body;
      const r = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
      if (playerHits.some((h) => r.x < h.x + h.w && r.right > h.x && r.y < h.y + h.h && r.bottom > h.y)) { sfx.clang(); puff(this.scene, s.x, s.y, 0xd42a24, 5, 14, 97); s.destroy(); this.stamps.splice(this.stamps.indexOf(s), 1); continue; }
      if (Phaser.Geom.Rectangle.Overlaps(r, playerRect)) { this.hooks.hurtPlayer(s.x); s.destroy(); this.stamps.splice(this.stamps.indexOf(s), 1); continue; }
      if (s.y > this.groundY - 4) { sfx.stamp(); puff(this.scene, s.x, this.groundY - 2, 0xf6f2e9, 3, 10, 97); s.destroy(); this.stamps.splice(this.stamps.indexOf(s), 1); }
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
    if (this.move !== 'hurt' && this.move !== 'shove') this.facing = px > this.sprite.x ? 1 : -1;
    this.sprite.setFlipX(this.facing === -1);
    if (this.warn) this.warn.setPosition(this.sprite.x, this.sprite.y - 56 - Math.sin(this.t * 20));
    this.t -= dt;
    switch (this.move) {
      case 'intro': if (this.t <= 0) this.next(); break;
      case 'stamp':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) { this.clearWarn(); this.sprite.play('rat_bureaucrat_attack'); for (let i = 0; i < (this.rage > 1.3 ? 4 : 3); i++) this.scene.time.delayedCall(i * 140, () => this.alive && this.throwStamp(px, i)); this.move = 'hurt'; this.t = 0.9; }
        break;
      case 'walk': {
        const d = px - this.sprite.x;
        if (ground) b.setVelocityX(Math.sign(d) * 46 * this.rage);
        this.sprite.anims.timeScale = this.rage;
        if (Math.abs(d) < 40 || this.t <= 0) { this.move = 'shove'; this.t = 0.45 / this.rage; b.setVelocityX(0); this.telegraph('!'); this.sprite.play('rat_bureaucrat_windup'); }
        break;
      }
      case 'shove':
        if (this.t <= 0.12 && this.warn) { this.clearWarn(); this.sprite.play('rat_bureaucrat_attack'); b.setVelocityX(this.facing * 140); sfx.swing(); }
        if (this.t <= -0.2) { b.setVelocityX(0); this.next(); }
        break;
      case 'summon':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) { this.clearWarn(); this.hooks.summon(this.sprite.x); this.move = 'hurt'; this.t = 0.8; }
        break;
      case 'tape':
        if (ground) b.setVelocityX(0);
        if (this.t <= 0) {
          this.clearWarn();
          this.sprite.play('rat_bureaucrat_attack');
          const g = this.scene.add.rectangle(this.sprite.x, this.groundY - 3, 22, 5, 0xd42a24).setStrokeStyle(1, 0x16121f).setDepth(97);
          this.tape = { g, x: this.sprite.x, dir: this.facing };
          sfx.construction();
          this.move = 'hurt'; this.t = 1.0;
        }
        break;
      case 'hurt':
        if (this.t <= 0 && ground) { this.sprite.play('rat_bureaucrat_walk'); this.next(); }
        break;
    }
  }
}
