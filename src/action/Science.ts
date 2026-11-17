// Mission 6, "Save the Science" (M4): the Science Centre is boarded up and Dog Fjord's rats are stripping it.
//  Patrol: guard rats stand watch with flashlights, sweeping left and right. Caught in the beam (and not
//          behind a crate) and the guard raises the alarm: it gives chase and calls two rats. Pass while it
//          looks the other way, or crouch behind the crates.
//  Wrecker: the boss (M4.2 redesign, see the class): it drives its boom over you, swings or drops the ball;
//          only the ball hurts; pump the engine or stomp the cab any time.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';
import type { Rat } from './Rat';
import { Shockwave } from './Shockwave';

export interface PatrolDef { at: number }

export class Patrol {
  private cone: Phaser.GameObjects.Graphics;
  private t = 0;
  alarmed = false;
  constructor(private scene: Phaser.Scene, readonly rat: Rat, private groundY: number, private onAlarm: (x: number) => void) {
    rat.patrol = true;
    rat.facing = Math.random() < 0.5 ? 1 : -1;
    this.cone = scene.add.graphics().setDepth(85);
    this.t = 1 + Math.random() * 1.5;
  }
  /** the beam: 110 px long, from the flashlight at chest height, widening to 44 px */
  private beam() {
    const x = this.rat.sprite.x, f = this.rat.facing, y = this.groundY - 18;
    return { x0: x + f * 8, x1: x + f * 118, top: y - 22, bottom: this.groundY, f };
  }
  update(dtMs: number, pRect: Phaser.Geom.Rectangle, hidden: boolean) {
    const g = this.cone.clear();
    if (this.alarmed || !this.rat.alive) return;
    const dt = dtMs / 1000;
    this.t -= dt;
    if (this.t <= 0) { this.rat.facing = this.rat.facing === 1 ? -1 : 1; this.t = 2.0 + Math.random() * 1.2; }
    const b = this.beam();
    const blink = this.t < 0.35 ? 0.5 + 0.5 * Math.sin(this.scene.time.now / 40) : 1; // flickers before it turns
    g.fillStyle(0xfff08a, 0.16 * blink).fillTriangle(b.x0, this.groundY - 20, b.x1, b.top, b.x1, b.bottom);
    g.fillStyle(0xfff08a, 0.08 * blink).fillTriangle(b.x0, this.groundY - 20, b.x1, b.top - 10, b.x1, b.bottom + 4);
    const inBeam = pRect.right > Math.min(b.x0, b.x1) && pRect.x < Math.max(b.x0, b.x1) && pRect.bottom > b.top;
    if (inBeam && !hidden) {
      this.alarmed = true; this.rat.patrol = false;
      floatText(this.scene, this.rat.sprite.x, this.groundY - 50, 'SPOTTED!', 'font_red', 0xffffff, 500);
      sfx.squeak(); sfx.signal();
      this.onAlarm(this.rat.sprite.x);
    }
  }
  destroy() { this.cone.destroy(); }
}

type WState = 'intro' | 'drive' | 'swing' | 'hoist' | 'drop' | 'stuck' | 'reload' | 'dead';

/**
 * M4.2 (Ivan: "the boss is boring: you just wait for it to stop swinging and then hit it... make us dodge the ball,
 * and only the wrecking ball attacks"). The crane DRIVES to bring its boom over you, then either SWINGS the ball
 * (jump it at the low point) or HOISTS it and DROPS it where you stand (a shadow marks the spot; the impact sends
 * shockwaves both ways). Only the ball (and its shockwaves) hurt. The cab can be stomped and the engine pumped any
 * time; every third attack it stops to RELOAD (steam), when a pump does double damage.
 */
export class Wrecker {
  readonly img: Phaser.GameObjects.Image;
  readonly maxHp = 18;
  hp = this.maxHp;
  private state: WState = 'intro';
  private t = 1.5;
  private lastHit = -1;
  private ang = 0;         // the chain's angle from straight down (radians): +ve swings toward the arena
  private phase = 0;
  private swings = 0;
  private len = 40;        // the chain's current length
  private cycle = 0;
  private targetX = 0;
  private dropV = 0;
  private chain: Phaser.GameObjects.Graphics;
  private ball: Phaser.GameObjects.Arc;
  private shadow: Phaser.GameObjects.Ellipse;
  private waves: Shockwave[] = [];
  private hitThisSwing = false;
  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private bounds: { left: number; right: number }) {
    this.img = scene.add.image(x, groundY + 4, 'world', 'wrecker').setOrigin(0.5, 104 / 108).setDepth(104);
    this.chain = scene.add.graphics().setDepth(103);
    this.ball = scene.add.circle(0, 0, 11, 0x2a2536).setStrokeStyle(2, 0x16121f).setDepth(105);
    this.shadow = scene.add.ellipse(0, groundY + 1, 10, 3, 0x16121f, 0.5).setDepth(41).setVisible(false);
    floatText(scene, x - 40, groundY - 118, 'DEMOLITION PERMIT: APPROVED BY ME!', 'font_red', 0xffffff, 1400);
    sfx.construction();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get title() { return 'THE WRECKER'; }
  get phaseName() { return this.state; }
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.3 : 1; }
  /** the boom tip the chain hangs from */
  private pivot() { return { x: this.img.x - 51, y: this.groundY - 100 }; } // the sheave at the boom's tip (see wrecker() in science.mjs)
  ballPos() { const p = this.pivot(); return { x: p.x - Math.sin(this.ang) * this.len, y: p.y + Math.cos(this.ang) * this.len }; }
  ballRect() { const b = this.ballPos(); return new Phaser.Geom.Rectangle(b.x - 10, b.y - 10, 20, 20); }
  /** the cab roof: stomp it */
  roofY() { return this.groundY - 56; }
  roofRect() { return new Phaser.Geom.Rectangle(this.img.x - 10, this.groundY - 62, 40, 10); }
  /** the engine housing: pump it any time (double while it reloads) */
  engineRect() { return new Phaser.Geom.Rectangle(this.img.x - 50, this.groundY - 44, 44, 44); }
  get reloading() { return this.state === 'reload'; }
  get ballDangerous() { return this.alive && (this.state === 'swing' || this.state === 'drop'); }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit || this.state === 'intro') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg * (this.state === 'reload' ? 2 : 1);
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    puff(this.scene, kind === 'stomp' ? this.img.x + 10 : this.img.x - 28, kind === 'stomp' ? this.groundY - 58 : this.groundY - 22, 0xfff08a, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    this.shadow.setVisible(false); this.waves.forEach((w) => w.destroy()); this.waves = [];
    sfx.squeak(); shake(this.scene, 400, 0.012);
    floatText(this.scene, this.img.x - 20, this.groundY - 120, 'PERMIT REVOKED!', 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.ball, y: this.groundY - 10, duration: 500, ease: 'Bounce.easeOut' });
    this.scene.tweens.add({ targets: this.img, x: this.img.x + 200, alpha: 0, duration: 1600, delay: 500, ease: 'Quad.easeIn', onComplete: () => { this.chain.clear(); this.ball.setVisible(false); } });
  }
  /** true when the ball just hit the raccoon (once per swing / drop) */
  touches(pRect: Phaser.Geom.Rectangle) {
    if (!this.ballDangerous || this.hitThisSwing) return false;
    if (!Phaser.Geom.Rectangle.Overlaps(this.ballRect(), pRect)) return false;
    this.hitThisSwing = true; return true;
  }
  /** a shockwave from a dropped ball reached a raccoon on the ground */
  waveHits(pRect: Phaser.Geom.Rectangle, onGround: boolean) { return this.waves.some((w) => w.hits(pRect, onGround)); }

  private next() {
    this.cycle++;
    if (this.cycle % 3 === 0) { this.state = 'reload'; this.t = 2.2 / this.rage; floatText(this.scene, this.img.x - 28, this.groundY - 64, 'STEAM! PUMP THE ENGINE: DOUBLE DAMAGE!', 'font', 0xfff08a, 1100); sfx.brake(); return; }
    this.state = 'drive'; this.t = 1.6;
  }

  update(dtMs: number, px = 0) {
    const dt = dtMs / 1000;
    for (const w of [...this.waves]) { w.update(dt); if (w.x < this.bounds.left - 30 || w.x > this.bounds.right + 30) { w.destroy(); this.waves.splice(this.waves.indexOf(w), 1); } }
    if (!this.alive) return;
    this.t -= dt;
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.state = 'drive'; this.t = 1.6; sfx.boost(); } break;
      case 'drive': {
        // bring the boom tip over the raccoon (the truck stays on screen), the ball hauled up short and safe
        this.targetX = Phaser.Math.Clamp(px + 51, this.bounds.left + 80, this.bounds.right - 40);
        const dx = this.targetX - this.img.x;
        this.img.x += Math.sign(dx) * Math.min(Math.abs(dx), 80 * this.rage * dt);
        this.len = Phaser.Math.Linear(this.len, 40, 0.15); this.ang = Phaser.Math.Linear(this.ang, 0, 0.15);
        if (Math.abs(dx) < 3 || this.t <= 0) {
          if (this.cycle % 2 === 0) { this.state = 'swing'; this.phase = 0; this.swings = 0; this.hitThisSwing = false; sfx.swing(); }
          else { this.state = 'hoist'; this.t = 0.7 / this.rage; this.shadow.setVisible(true); }
        }
        break;
      }
      case 'swing': {
        // a pendulum on the full chain: its low point sweeps the street in front of the truck; jump it
        this.len = Phaser.Math.Linear(this.len, 84, 0.2);
        const w = (2 * Math.PI) / (2.2 / this.rage);
        const prev = this.phase; this.phase += w * dt;
        // one-sided: out over the street and back, never through its own cab (from -0.3 to 1.2 rad)
        this.ang = 0.45 + 0.75 * Math.sin(this.phase);
        if (Math.floor(prev / Math.PI) !== Math.floor(this.phase / Math.PI)) { this.hitThisSwing = false; this.swings++; sfx.swing(); }
        if (this.swings >= 3 && Math.abs(this.ang - 0.45) < 0.12) this.next();
        break;
      }
      case 'hoist': { // up to the boom; the shadow on the ground shows where it will fall
        this.len = Phaser.Math.Linear(this.len, 26, 0.2); this.ang = Phaser.Math.Linear(this.ang, 0, 0.3);
        const k = 1 - Math.max(0, this.t) / (0.7 / this.rage);
        this.shadow.setPosition(this.pivot().x, this.groundY + 1).setSize(10 + 16 * k, 3 + 2 * k).setAlpha(0.3 + 0.4 * k);
        if (this.t <= 0) { this.state = 'drop'; this.dropV = 60; this.hitThisSwing = false; }
        break;
      }
      case 'drop': {
        this.dropV += 1400 * dt; this.len += this.dropV * dt;
        const floor = this.groundY - 11 - this.pivot().y;
        if (this.len >= floor) {
          this.len = floor; this.state = 'stuck'; this.t = 1.0; this.shadow.setVisible(false);
          const b = this.ballPos();
          shake(this.scene, 220, 0.014); sfx.hammer(); puff(this.scene, b.x, this.groundY - 4, 0xc9b88f, 12, 26, 106);
          for (const d of [-1, 1] as const) this.waves.push(new Shockwave(this.scene, b.x + d * 14, d, this.groundY, 170 * this.rage));
        }
        break;
      }
      case 'stuck': // in the ground for a moment, then hauled back up
        if (this.t <= 0) { this.len = Phaser.Math.Linear(this.len, 40, 0.12); if (this.len < 44) this.next(); }
        break;
      case 'reload':
        this.len = Phaser.Math.Linear(this.len, 30, 0.15); this.ang = 0;
        if (Math.random() < 0.4) puff(this.scene, this.img.x - 28 + (Math.random() - 0.5) * 30, this.groundY - 40, 0xc9c5d1, 1, 8, 104);
        if (this.t <= 0) { this.state = 'drive'; this.t = 1.6; sfx.boost(); }
        break;
    }
    // draw the chain + the ball
    const p = this.pivot(), b = this.ballPos();
    const g = this.chain.clear();
    g.lineStyle(2, 0x443f54).lineBetween(p.x, p.y, b.x, b.y);
    for (let i = 1; i < 6; i++) { const t = i / 6; g.fillStyle(0x69657a).fillRect(p.x + (b.x - p.x) * t - 1, p.y + (b.y - p.y) * t - 1, 2, 2); }
    this.ball.setPosition(b.x, b.y);
    if (this.state === 'swing' && Math.abs(this.ang) > 1.05 && Math.random() < 0.3) puff(this.scene, b.x, b.y + 8, 0xc9c5d1, 1, 6, 104);
  }
  destroy() { this.chain.destroy(); this.ball.destroy(); this.img.destroy(); this.shadow.destroy(); this.waves.forEach((w) => w.destroy()); }
}
