// Mission 6, "Save the Science" (M4): the Science Centre is boarded up and Dog Fjord's rats are stripping it.
//  Patrol: guard rats walk their beat with flashlights (M4.4). Caught in the beam (and not behind a crate) and
//          the guard raises the alarm: it gives chase and calls two rats. Crouch behind a crate, let it walk
//          past, and take it down from behind.
//  Wrecker: the boss (M4.4 redesign, see the class): only hittable while its ball is stuck after a drop.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';
import type { Rat } from './Rat';
import { Shockwave } from './Shockwave';

export interface PatrolDef { at: number }

const WALK = 30;   // a guard's patrol pace (px/s)
const LOOK = 1.4;  // how long it stands at each end of its beat before turning

/**
 * M4.4 (Ivan: "no sense in hiding behind the crate: the guard stands still, so it never passes it"): a guard WALKS
 * its beat, back and forth across a crate, flashlight ahead. Crouch behind the crate and it walks right past you;
 * then it has its back to you: hit it from behind and it's a one-hit TAKEDOWN. Caught in the beam (not hidden), or
 * hit from the front, and it raises the alarm: it gives chase and calls two rats.
 */
export class Patrol {
  private cone: Phaser.GameObjects.Graphics;
  private t = 0;
  private looking = false;
  alarmed = false;
  constructor(private scene: Phaser.Scene, readonly rat: Rat, private groundY: number, private beat: [number, number], private onAlarm: (x: number) => void) {
    rat.patrol = true;
    rat.facing = -1; // it comes toward you: time to find a crate
    this.cone = scene.add.graphics().setDepth(85);
  }
  /** the beam: 110 px long, from the flashlight at chest height, widening to 44 px */
  private beam() {
    const x = this.rat.sprite.x, f = this.rat.facing, y = this.groundY - 18;
    return { x0: x + f * 8, x1: x + f * 118, top: y - 22, bottom: this.groundY, f };
  }
  /** is the raccoon behind the guard (its back turned to it)? */
  behind(px: number) { return (px - this.rat.sprite.x) * this.rat.facing < 0; }
  /** spotted (the beam, or a hit from the front) */
  alarm() {
    if (this.alarmed || !this.rat.alive) return;
    this.alarmed = true; this.rat.patrol = false; this.rat.patrolVX = 0; this.cone.clear();
    floatText(this.scene, this.rat.sprite.x, this.groundY - 50, 'SPOTTED!', 'font_red', 0xffffff, 500);
    sfx.squeak(); sfx.signal();
    this.onAlarm(this.rat.sprite.x);
  }
  update(dtMs: number, pRect: Phaser.Geom.Rectangle, hidden: boolean) {
    const g = this.cone.clear();
    if (this.alarmed || !this.rat.alive) return;
    const dt = dtMs / 1000;
    const x = this.rat.sprite.x;
    if (this.looking) {
      this.t -= dt;
      this.rat.patrolVX = 0;
      if (this.t <= 0) { this.looking = false; this.rat.facing = this.rat.facing === 1 ? -1 : 1; }
    } else {
      this.rat.patrolVX = this.rat.facing * WALK;
      if ((this.rat.facing === -1 && x <= this.beat[0]) || (this.rat.facing === 1 && x >= this.beat[1])) { this.looking = true; this.t = LOOK; this.rat.patrolVX = 0; }
    }
    const b = this.beam();
    const blink = this.looking && this.t < 0.4 ? 0.5 + 0.5 * Math.sin(this.scene.time.now / 40) : 1; // flickers before it turns
    g.fillStyle(0xfff08a, 0.16 * blink).fillTriangle(b.x0, this.groundY - 20, b.x1, b.top, b.x1, b.bottom);
    g.fillStyle(0xfff08a, 0.08 * blink).fillTriangle(b.x0, this.groundY - 20, b.x1, b.top - 10, b.x1, b.bottom + 4);
    const inBeam = pRect.right > Math.min(b.x0, b.x1) && pRect.x < Math.max(b.x0, b.x1) && pRect.bottom > b.top;
    if (inBeam && !hidden) this.alarm();
  }
  destroy() { this.cone.destroy(); }
}

type WState = 'intro' | 'drive' | 'hoist' | 'drop' | 'stuck' | 'haul' | 'windup' | 'swing' | 'dead';

const STUCK_T = 3.0;  // the window: the ball is stuck in the ground, the crane can be hit
const WARN_T = 0.8;   // the end of the window: it strains to pull the ball out (get away)

/**
 * M4.4 (Ivan: "I shouldn't be able to attack it, unless when it drops the ball. Then it should stop for some time
 * when I can actually hit it. Then I need to move away. Make sure it's possible to jump over the ball when it
 * swings"). One cycle: the crane DRIVES its boom over you, HOISTS the ball (a shadow marks the spot) and DROPS it
 * (shockwaves both ways: jump them). The ball is STUCK in the ground: now, and only now, the cab can be stomped and
 * the engine hit. Then it strains (a warning), HAULS the ball out, lifts it to the far end of its swing (WINDUP,
 * high over your head) and SWINGS it back and forth twice: jump it at the low point, or stand clear of the arc.
 * The swing always starts from that high point, never on top of you (the M4.2 one could start with the chain
 * lengthening straight onto your head: a hit you couldn't avoid).
 */
export class Wrecker {
  readonly img: Phaser.GameObjects.Image;
  readonly maxHp = 24;
  hp = this.maxHp;
  private state: WState = 'intro';
  private t = 1.5;
  private lastHit = -1;
  private lastClang = -9999;
  private ang = 0;         // the chain's angle from straight down (radians): +ve swings toward the arena
  private phase = 0;
  private swings = 0;
  private len = 40;        // the chain's current length
  private cycle = 0;
  private targetX = 0;
  private dropV = 0;
  private warned = false;
  private chain: Phaser.GameObjects.Graphics;
  private ball: Phaser.GameObjects.Arc;
  private shadow: Phaser.GameObjects.Ellipse;
  private waves: Shockwave[] = [];
  private hitThisSwing = false;
  private msg?: Phaser.GameObjects.BitmapText;
  /** one message at a time over the crane (they used to stack: text on text) */
  private say(str: string, font: 'font' | 'font_outline' | 'font_red' | 'font_big', tint: number, hold: number, dy = 74) {
    if (this.msg?.active) { this.scene.tweens.killTweensOf(this.msg); this.msg.destroy(); }
    this.msg = floatText(this.scene, this.img.x - 20, this.groundY - dy, str, font, tint, hold);
  }
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
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.25 : 1; }
  /** the boom tip the chain hangs from */
  private pivot() { return { x: this.img.x - 51, y: this.groundY - 100 }; } // the sheave at the boom's tip (see wrecker() in science.mjs)
  ballPos() { const p = this.pivot(); return { x: p.x - Math.sin(this.ang) * this.len, y: p.y + Math.cos(this.ang) * this.len }; }
  ballRect() { const b = this.ballPos(); return new Phaser.Geom.Rectangle(b.x - 10, b.y - 10, 20, 20); }
  /** the cab roof: stomp it */
  roofY() { return this.groundY - 56; }
  roofRect() { return new Phaser.Geom.Rectangle(this.img.x - 10, this.groundY - 62, 40, 10); }
  /** the engine housing: hit it while the ball is stuck */
  engineRect() { return new Phaser.Geom.Rectangle(this.img.x - 50, this.groundY - 44, 44, 44); }
  /** the window: the ball is stuck in the ground */
  get vulnerable() { return this.state === 'stuck'; }
  get ballDangerous() { return this.alive && (this.state === 'swing' || this.state === 'drop'); }

  /** true: it took the hit. Outside the window a hit just clangs off (and says why, now and then) */
  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit || this.state === 'intro') return false;
    this.lastHit = h.id;
    if (!this.vulnerable) {
      sfx.clang();
      const now = this.scene.time.now;
      if (now - this.lastClang > 900) { this.lastClang = now; this.say('CLANG! WAIT FOR THE DROP', 'font', 0x9793a6, 500); }
      return false;
    }
    this.hp -= kind === 'stomp' ? 2 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    puff(this.scene, kind === 'stomp' ? this.img.x + 10 : this.img.x - 28, kind === 'stomp' ? this.groundY - 58 : this.groundY - 22, 0xfff08a, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    this.img.clearTint();
    this.shadow.setVisible(false); this.waves.forEach((w) => w.destroy()); this.waves = [];
    sfx.squeak(); shake(this.scene, 400, 0.012);
    this.say('PERMIT REVOKED!', 'font_big', 0xffffff, 1400, 120);
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
        if (Math.abs(dx) < 3 || this.t <= 0) { this.state = 'hoist'; this.t = 0.8 / this.rage; this.shadow.setVisible(true); }
        break;
      }
      case 'hoist': { // up to the boom; the shadow on the ground shows where it will fall
        this.len = Phaser.Math.Linear(this.len, 26, 0.2); this.ang = Phaser.Math.Linear(this.ang, 0, 0.3);
        const k = 1 - Math.max(0, this.t) / (0.8 / this.rage);
        this.shadow.setPosition(this.pivot().x, this.groundY + 1).setSize(10 + 16 * k, 3 + 2 * k).setAlpha(0.3 + 0.4 * k);
        if (this.t <= 0) { this.state = 'drop'; this.dropV = 60; this.hitThisSwing = false; }
        break;
      }
      case 'drop': {
        this.dropV += 1400 * dt; this.len += this.dropV * dt;
        const floor = this.groundY - 11 - this.pivot().y;
        if (this.len >= floor) {
          this.len = floor; this.state = 'stuck'; this.t = STUCK_T / this.rage; this.warned = false; this.shadow.setVisible(false);
          const b = this.ballPos();
          shake(this.scene, 220, 0.014); sfx.hammer(); puff(this.scene, b.x, this.groundY - 4, 0xc9b88f, 12, 26, 106);
          for (const d of [-1, 1] as const) this.waves.push(new Shockwave(this.scene, b.x + d * 14, d, this.groundY, 170 * this.rage));
          this.say(this.cycle < 2 ? 'STUCK! HIT IT NOW!' : 'STUCK!', 'font_outline', 0x9bd35a, 700);
        }
        break;
      }
      case 'stuck': {
        // the window: the crane shimmers; at the end it strains (shakes, steams) to pull the ball out
        const warn = this.t <= WARN_T;
        if (warn && !this.warned) { this.warned = true; this.img.clearTint(); sfx.brake(); this.say('GET CLEAR!', 'font_red', 0xffffff, 500); }
        if (warn) { this.img.x += Math.sin(this.scene.time.now / 25) * 0.6; if (Math.random() < 0.5) puff(this.scene, this.img.x - 28 + (Math.random() - 0.5) * 30, this.groundY - 40, 0xc9c5d1, 1, 8, 104); }
        else if (Math.floor(this.scene.time.now / 160) % 2 === 0) this.img.setTint(0xfff6c8); else this.img.clearTint();
        if (this.t <= 0) { this.img.clearTint(); this.state = 'haul'; this.t = 0.35; sfx.swing(); }
        break;
      }
      case 'haul': { // the ball rips out of the ground and goes up short (harmless), over 0.35 s
        const floor = this.groundY - 11 - this.pivot().y;
        this.len = 40 + (floor - 40) * Math.max(0, this.t / 0.35);
        if (this.t <= 0) { this.len = 40; this.state = 'windup'; this.t = 0.75 / this.rage; }
        break;
      }
      case 'windup': {
        // out to the far end of the arc, lengthening as it goes: always high over a standing raccoon
        const k = 1 - Math.max(0, this.t) / (0.75 / this.rage);
        this.ang = 1.2 * k; this.len = 40 + 44 * k;
        if (this.t <= 0) { this.state = 'swing'; this.phase = Math.PI / 2; this.swings = 0; this.hitThisSwing = false; sfx.swing(); }
        break;
      }
      case 'swing': {
        // a pendulum on the full chain, from the high end: its low point sweeps the street in front of the truck
        const w = (2 * Math.PI) / (2.2 / this.rage);
        const prev = this.phase; this.phase += w * dt;
        // one-sided: out over the street and back, never through its own cab (from -0.3 to 1.2 rad)
        this.ang = 0.45 + 0.75 * Math.sin(this.phase);
        // a half-swing ends at either end of the arc (phase = pi/2 + n*pi)
        const half = (ph: number) => Math.floor((ph - Math.PI / 2) / Math.PI);
        if (half(prev) !== half(this.phase)) { this.hitThisSwing = false; this.swings++; if (this.swings < 4) sfx.swing(); }
        if (this.swings >= 4) { this.cycle++; this.state = 'drive'; this.t = 1.6; }
        break;
      }
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
