// Mission 6, "Save the Science" (M4): the Science Centre is boarded up and Dog Fjord's rats are stripping it.
//  Patrol: guard rats stand watch with flashlights, sweeping left and right. Caught in the beam (and not
//          behind a crate) and the guard raises the alarm: it gives chase and calls two rats. Pass while it
//          looks the other way, or crouch behind the crates.
//  Wrecker: the boss. A crane truck with a rat in the cab swings a WRECKING BALL across the arena on a chain.
//          The ball hurts; its low point sweeps the ground, so jump it (or stand under the boom). After a few
//          swings the ball is parked high while the crane RELOADS: pump the engine then. Stomp the cab any time.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';
import type { Rat } from './Rat';

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

type WState = 'intro' | 'swing' | 'park' | 'reload' | 'dead';

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
  private chain: Phaser.GameObjects.Graphics;
  private ball: Phaser.GameObjects.Arc;
  private hitThisSwing = false;
  constructor(private scene: Phaser.Scene, x: number, private groundY: number, _bounds: { left: number; right: number }) {
    // the crane sits at the right edge, its boom reaching up and left over the arena
    this.img = scene.add.image(x, groundY + 4, 'world', 'wrecker').setOrigin(0.5, 104 / 108).setDepth(104);
    this.chain = scene.add.graphics().setDepth(103);
    this.ball = scene.add.circle(0, 0, 11, 0x2a2536).setStrokeStyle(2, 0x16121f).setDepth(105);
    floatText(scene, x - 40, groundY - 118, 'DEMOLITION PERMIT: APPROVED BY ME!', 'font_red', 0xffffff, 1400);
    sfx.construction();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get title() { return 'THE WRECKER'; }
  get phaseName() { return this.state; }
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.3 : 1; }
  /** the boom tip the chain hangs from */
  private pivot() { return { x: this.img.x - 51, y: this.groundY - 100 }; } // the sheave at the boom's tip (see wrecker() in north.mjs)
  private chainLen() { return 84; }
  ballPos() { const p = this.pivot(), L = this.chainLen(); return { x: p.x - Math.sin(this.ang) * L, y: p.y + Math.cos(this.ang) * L }; }
  ballRect() { const b = this.ballPos(); return new Phaser.Geom.Rectangle(b.x - 10, b.y - 10, 20, 20); }
  /** the cab roof: stomp it */
  roofY() { return this.groundY - 56; }
  roofRect() { return new Phaser.Geom.Rectangle(this.img.x - 10, this.groundY - 62, 40, 10); }
  /** the engine housing: pumpable while it reloads */
  engineRect() { return new Phaser.Geom.Rectangle(this.img.x - 50, this.groundY - 44, 44, 44); }
  /** the truck body hurts on contact (don't climb it) */
  rect() { return new Phaser.Geom.Rectangle(this.img.x - 52, this.groundY - 50, 100, 48); }
  get ballDangerous() { return this.state === 'swing' && this.alive; }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    if (kind === 'pump' && this.state !== 'reload') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    puff(this.scene, kind === 'stomp' ? this.img.x + 10 : this.img.x - 28, kind === 'stomp' ? this.groundY - 58 : this.groundY - 22, 0xfff08a, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    sfx.squeak(); shake(this.scene, 400, 0.012);
    floatText(this.scene, this.img.x - 20, this.groundY - 120, 'PERMIT REVOKED!', 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.ball, y: this.groundY - 10, duration: 500, ease: 'Bounce.easeOut' });
    this.scene.tweens.add({ targets: this.img, x: this.img.x + 200, alpha: 0, duration: 1600, delay: 500, ease: 'Quad.easeIn', onComplete: () => { this.chain.clear(); this.ball.setVisible(false); } });
  }
  /** true when the ball just hit the raccoon (once per swing) */
  touches(pRect: Phaser.Geom.Rectangle) {
    if (!this.ballDangerous || this.hitThisSwing) return false;
    if (!Phaser.Geom.Rectangle.Overlaps(this.ballRect(), pRect)) return false;
    this.hitThisSwing = true; return true;
  }

  update(dtMs: number) {
    if (!this.alive) return;
    const dt = dtMs / 1000;
    this.t -= dt;
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.state = 'swing'; this.phase = 0; this.swings = 0; sfx.boost(); } break;
      case 'swing': {
        // a pendulum: amplitude 1.25 rad, a full period of about 2.4 s (faster when hurt); the low point crosses the ground zone
        const w = (2 * Math.PI) / (2.4 / this.rage);
        const prev = this.phase; this.phase += w * dt;
        this.ang = 1.25 * Math.sin(this.phase);
        if (Math.floor(prev / Math.PI) !== Math.floor(this.phase / Math.PI)) { this.hitThisSwing = false; this.swings++; sfx.swing(); }
        if (this.swings >= 5) { this.state = 'park'; this.t = 0.6; }
        break;
      }
      case 'park': { // the ball winds up to the boom and stays there
        this.ang = Phaser.Math.Linear(this.ang, 0, 0.12);
        if (this.t <= 0) { this.state = 'reload'; this.t = 2.6 / this.rage; floatText(this.scene, this.img.x - 28, this.groundY - 64, 'RELOADING! PUMP THE ENGINE!', 'font', 0xfff08a, 900); sfx.brake(); }
        break;
      }
      case 'reload':
        this.ang = 0;
        if (Math.random() < 0.3) puff(this.scene, this.img.x - 28 + (Math.random() - 0.5) * 30, this.groundY - 40, 0x69657a, 1, 8, 104);
        if (this.t <= 0) { this.state = 'swing'; this.phase = 0; this.swings = 0; sfx.boost(); }
        break;
    }
    // draw the chain + the ball (parked: hauled up short)
    const p = this.pivot(), L = this.state === 'reload' || this.state === 'park' ? Phaser.Math.Linear(this.chainLen(), 30, this.state === 'reload' ? 1 : 1 - this.t / 0.6) : this.chainLen();
    const bx = p.x - Math.sin(this.ang) * L, by = p.y + Math.cos(this.ang) * L;
    const g = this.chain.clear();
    g.lineStyle(2, 0x443f54).lineBetween(p.x, p.y, bx, by);
    for (let i = 1; i < 6; i++) { const t = i / 6; g.fillStyle(0x69657a).fillRect(p.x + (bx - p.x) * t - 1, p.y + (by - p.y) * t - 1, 2, 2); }
    this.ball.setPosition(bx, by);
    if (this.state === 'swing' && Math.abs(this.ang) > 1.1 && Math.random() < 0.3) puff(this.scene, bx, by + 8, 0xc9c5d1, 1, 6, 104);
  }
  destroy() { this.chain.destroy(); this.ball.destroy(); this.img.destroy(); }
}
