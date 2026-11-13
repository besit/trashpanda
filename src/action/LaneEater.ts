// Mission 5, "The Lane Eater" (Bloor West). Different from every other mission:
//  - The screen AUTO-SCROLLS. Dog Fraud's paving machine follows behind, chewing up the protected bike lane
//    and painting car-lane lines where it was. It is always on screen at the left edge (Ivan, M3.1: "it was
//    not shown to me until I went backwards"), and its conveyor lobs hot asphalt at you.
//  - Riders wait along the curb. Ring your bell (E) beside one and they CLIP IN: they pedal up to speed,
//    and you have to stay beside them until they're rolling (Ivan: "you just pass them while ringing").
//    Every rider in the peloton absorbs one hit for you and holds the machine back (critical mass).
//  - At the end of the street the machine turns on you (M3.1 redesign, Ivan's pattern): it CHARGES across
//    the whole screen, so jump the grinder (only the grinder hurts). It slams into the edge of the screen,
//    rolls back and OVERHEATS: that's the window to hit it. Then it drives off and comes back from the other
//    side. Three weak points: the conveyor up top, the foreman's cab, the grinder drum.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import { STREET_Y } from '../ui/sideLayout';
import type { Hitbox } from './SidePlayer';

export interface AutoScrollDef { speed: number; end: number; riders: number[]; ambush?: { at: number; rats: ('basic' | 'construction' | 'traffic')[] }[] }

const LE_W = 176;
// weak points relative to the machine's left edge / top, when it faces right (mirrored when it faces left)
const ZONES = { conveyor: { x: 30, y: 10, w: 70, h: 14 }, cab: { x: 104, y: 20, w: 30, h: 30 }, grinder: { x: 136, y: 58, w: 38, h: 40 } } as const;
type ZoneKey = keyof typeof ZONES;
const RIDER_IDS = ['a', 'b', 'c', 'd'];
/** a rider clipping in has to roll this long with you beside them */
const CLIP_TIME = 0.9;
/** ...and you can't get further away than this */
const CLIP_RANGE = 50;

type Waiting = { s: Phaser.GameObjects.Sprite; mark: Phaser.GameObjects.BitmapText; bar: Phaser.GameObjects.Graphics; state: 'wait' | 'clip' | 'done'; t: number; vx: number };

/** riders waiting on Bloor + the peloton behind the raccoon */
export class Peloton {
  private waiting: Waiting[] = [];
  readonly riders: Phaser.GameObjects.Sprite[] = [];
  joinedTotal = 0;
  /** the bike lane is STREET_Y+16..+27: riders' wheels sit in it, not on its top edge (Ivan, M3.1) */
  private readonly laneY: number;

  constructor(private scene: Phaser.Scene, xs: number[], private groundY: number) {
    this.laneY = groundY + 4; // level with the raccoon: wheels on the same line, inside the green lane
    xs.forEach((x, i) => {
      const id = RIDER_IDS[i % RIDER_IDS.length];
      const s = scene.add.sprite(x, this.laneY, 'chars', `cys_${id}_0`).setOrigin(0.5, 1).setDepth(this.depthAt(this.laneY));
      const mark = scene.add.bitmapText(x, groundY - 46, 'font_outline', 'RING!').setOrigin(0.5).setDepth(210).setTint(0xfff08a).setVisible(false);
      const bar = scene.add.graphics().setDepth(210).setVisible(false);
      s.setData('id', id);
      this.waiting.push({ s, mark, bar, state: 'wait', t: 0, vx: 0 });
    });
  }

  /** whoever is lower on screen is in front (Ivan, M3.1: higher riders were drawn over lower ones) */
  private depthAt(y: number) { return 90 + (y - (this.groundY - 12)) * 0.5; }

  get size() { return this.riders.length; }

  /** E near a waiting rider: they start clipping in. Returns true if anyone heard the bell. */
  ring(px: number) {
    let heard = false;
    for (const w of this.waiting) {
      if (w.state !== 'wait' || Math.abs(w.s.x - px) > 44) continue;
      w.state = 'clip'; w.t = 0; w.vx = 0; heard = true;
      w.mark.setVisible(false); w.bar.setVisible(true);
      w.s.play(`cys_${w.s.getData('id')}`);
    }
    if (heard) sfx.bell();
    return heard;
  }

  private join(w: Waiting) {
    w.state = 'done'; w.mark.destroy(); w.bar.destroy();
    this.riders.push(w.s);
    this.joinedTotal++;
    floatText(this.scene, w.s.x, this.groundY - 50, Phaser.Utils.Array.GetRandom(['I\'M IN!', 'LET\'S RIDE!', 'SAVE BLOOR!', 'CRITICAL MASS!']), 'font', 0x9bd35a, 500);
    sfx.ding();
  }

  /** a hit lands on the peloton instead of the raccoon */
  absorb(): boolean {
    const r = this.riders.pop();
    if (!r) return false;
    sfx.hurt();
    floatText(this.scene, r.x, this.groundY - 44, 'OOF!', 'font', 0xff6347, 300);
    this.scene.tweens.add({ targets: r, x: r.x - 120, y: r.y + 40, alpha: 0, angle: -40, duration: 700, onComplete: () => r.destroy() });
    return true;
  }

  /** boss fight: the peloton pulls over onto the far sidewalk and cheers (out of the way, still loyal) */
  parkAt: number | null = null;

  /** the boss starts: anyone still waiting at the curb gets out of the arena, up onto the sidewalk */
  dismissWaiting() {
    for (const w of this.waiting) {
      if (w.state === 'done') continue;
      w.state = 'done'; w.mark.destroy(); w.bar.destroy();
      w.s.play(`cys_${w.s.getData('id')}`).setDepth(12);
      this.scene.tweens.add({ targets: w.s, y: STREET_Y + 6, x: w.s.x + 30, duration: 700, ease: 'Sine.easeOut', onComplete: () => w.s.stop() });
    }
  }

  update(dtMs: number, px: number, camLeft: number) {
    const dt = dtMs / 1000;
    for (const w of this.waiting) {
      if (w.state === 'wait') {
        w.mark.setVisible(Math.abs(w.s.x - px) < 70).setY(Math.round(this.groundY - 46 + Math.sin(this.scene.time.now / 130)));
        if (w.s.x < camLeft - 60) { w.state = 'done'; w.mark.destroy(); w.bar.destroy(); this.scene.tweens.add({ targets: w.s, alpha: 0, duration: 300 }); } // left behind
      } else if (w.state === 'clip') {
        // they get rolling from a standstill: you have to ease off and stay beside them
        w.t += dt; w.vx = Math.min(115, w.vx + 150 * dt); w.s.x += w.vx * dt;
        const p = Math.min(1, w.t / CLIP_TIME), bx = Math.round(w.s.x - 12), by = Math.round(this.groundY - 48);
        w.bar.clear().fillStyle(0x16121f).fillRect(bx - 1, by - 1, 26, 5).fillStyle(0x3a3550).fillRect(bx, by, 24, 3).fillStyle(0x9bd35a).fillRect(bx, by, Math.round(24 * p), 3);
        if (Math.abs(w.s.x - px) > CLIP_RANGE) {
          // too fast (or too slow): they lose you and stop. Ring again if they're still on screen
          w.state = 'wait'; w.vx = 0; w.bar.setVisible(false); w.s.stop(); w.s.setFrame(`cys_${w.s.getData('id')}_0`);
          floatText(this.scene, w.s.x, this.groundY - 50, Phaser.Utils.Array.GetRandom(['WAIT UP!', 'TOO FAST!', 'HEY!']), 'font', 0xff6347, 400);
        } else if (p >= 1) this.join(w);
      }
    }
    // the peloton follows in a staggered line behind the raccoon, every wheel in the bike lane
    this.riders.forEach((r, i) => {
      const parked = this.parkAt !== null;
      const tx = parked ? this.parkAt! - i * 16 : px - 26 - i * 18, ty = parked ? STREET_Y + 6 : this.laneY - 1 + (i % 2) * 2;
      if (parked) { r.setDepth(12); if (Math.floor(this.scene.time.now / 300 + i) % 6 === 0) r.y = ty - 2; }
      r.x += (tx - r.x) * Math.min(1, dtMs / 120); r.y += (ty - r.y) * 0.2;
      if (!parked) r.setDepth(this.depthAt(r.y) - i * 0.01);
    });
  }
}

type Move = 'idle' | 'backoff' | 'enter' | 'charge' | 'bounce' | 'hot' | 'leave' | 'dead';

/** the machine while it chases (auto-scroll) and while you fight it (boss) */
export class LaneEater {
  readonly img: Phaser.GameObjects.Image;
  x: number;
  private lane: Phaser.GameObjects.Graphics;
  private puffT = 0;
  /** +1 = facing/driving right, -1 = left */
  private dir: 1 | -1 = 1;
  // chase
  private gobT = 4;
  // boss
  boss = false;
  readonly hp: Record<ZoneKey, number> = { conveyor: 7, cab: 7, grinder: 7 };
  readonly maxHp = 21;
  private move: Move = 'idle';
  private t = 0;
  private arena = { left: 0, right: 0 };
  private lastHit = -1;
  private summoned = false;
  private gobs: { img: Phaser.GameObjects.Image; vx: number; vy: number; mark?: Phaser.GameObjects.Ellipse }[] = [];
  private puddles: { g: Phaser.GameObjects.Ellipse; x: number; t: number }[] = [];
  private warn?: Phaser.GameObjects.BitmapText;

  constructor(private scene: Phaser.Scene, x: number, private groundY: number) {
    this.x = x;
    this.lane = scene.add.graphics().setDepth(6);
    this.img = scene.add.image(x, groundY + 6, 'world', 'laneeater_0').setOrigin(0.5, 103 / 112).setDepth(88);
  }

  get alive() { return this.move !== 'dead'; }
  /** overheated against the edge of the screen: every weak point is open (debug/bot) */
  get hot() { return this.move === 'hot'; }
  get state() { return this.move; }
  get facing() { return this.dir; }
  get totalHp() { return this.hp.conveyor + this.hp.cab + this.hp.grinder; }
  get front() { return this.x + this.dir * LE_W / 2; }
  private broken() { return (Object.keys(this.hp) as ZoneKey[]).filter((k) => this.hp[k] <= 0); }
  private frameKey(f: number) { const b = this.broken(); return b.length ? `laneeater_${f}_${b.map((k) => ({ conveyor: 'v', cab: 'b', grinder: 'g' })[k]).sort().join('')}` : `laneeater_${f}`; }
  zoneRect(k: ZoneKey) {
    const z = ZONES[k], left = this.x - LE_W / 2, top = this.groundY + 6 - 103;
    const zx = this.dir === 1 ? z.x : LE_W - z.x - z.w;
    return new Phaser.Geom.Rectangle(left + zx, top + z.y, z.w, z.h);
  }
  /** the part that hurts: the spinning drum (trimmed to the drum itself, so a clean jump clears it) */
  private grinderRect() { const r = this.zoneRect('grinder'); return new Phaser.Geom.Rectangle(r.x + 3, this.groundY - 36, r.width - 6, 38); }
  private draw(f: number) { this.img.setX(Math.round(this.x)).setFlipX(this.dir === -1).setFrame(this.frameKey(f)); }

  /** the lane it has eaten: bike-lane green is paved over with car-lane paint */
  private drawLane(fromX: number) {
    const g = this.lane.clear(), y0 = STREET_Y + 16, h = 12, x1 = this.x - 40;
    if (x1 <= fromX) return;
    g.fillStyle(0x363644).fillRect(fromX, y0, x1 - fromX, h + 3);
    g.fillStyle(0x262631).fillRect(fromX, y0 + h + 3, x1 - fromX, 1);
    for (let x = Math.ceil(fromX / 24) * 24; x < x1; x += 24) g.fillStyle(0xf6f2e9).fillRect(x, y0 + h - 1, 12, 2);
  }

  /** a gob of hot asphalt from the conveyor, landing near `tx` in `tF` seconds, with a shadow where it'll land */
  private lob(tx: number, tF: number) {
    const sx = this.x + this.dir * -20, sy = this.groundY - 92;
    const mark = this.scene.add.ellipse(tx, this.groundY + 1, 6, 2, 0xff6347, 0.7).setDepth(41);
    this.scene.tweens.add({ targets: mark, scaleX: 3.2, scaleY: 2, duration: tF * 1000 });
    this.gobs.push({ img: this.scene.add.image(sx, sy, 'world', 'paintgob_0').setDepth(96), vx: (tx - sx) / tF, vy: -0.5 * 900 * tF + (this.groundY - sy) / tF, mark });
    sfx.throwIt();
  }

  /** gobs fly, land, leave puddles; true if one hit the raccoon */
  private updateGobs(dt: number, playerRect: Phaser.Geom.Rectangle, onGround: boolean, hurt: (fromX: number) => void) {
    for (const g of [...this.gobs]) {
      g.vy += 900 * dt; g.img.x += g.vx * dt; g.img.y += g.vy * dt; g.img.angle += 400 * dt;
      const r = new Phaser.Geom.Rectangle(g.img.x - 4, g.img.y - 4, 8, 8);
      const gone = () => { g.img.destroy(); g.mark?.destroy(); this.gobs.splice(this.gobs.indexOf(g), 1); };
      if (Phaser.Geom.Rectangle.Overlaps(r, playerRect)) { hurt(g.img.x); gone(); continue; }
      if (g.img.y >= this.groundY - 2) {
        sfx.stamp();
        this.puddles.push({ g: this.scene.add.ellipse(g.img.x, this.groundY, 22, 5, 0x262631).setStrokeStyle(1, 0x16121f).setDepth(40), x: g.img.x, t: 2.2 });
        gone();
      }
    }
    for (const p of [...this.puddles]) {
      p.t -= dt;
      if (onGround && Math.abs(playerRect.centerX - p.x) < 12 && playerRect.bottom > this.groundY - 6) hurt(p.x);
      if (p.t <= 0) { p.g.destroy(); this.puddles.splice(this.puddles.indexOf(p), 1); }
    }
  }

  /**
   * Auto-scroll phase: the machine stays on screen at the left edge. Every rider in the peloton holds it
   * further back; with nobody it creeps up on you. Its conveyor lobs hot asphalt where you're heading.
   */
  chase(dtMs: number, riders: number, px: number, pvx: number, camLeft: number, viewW: number, progress: number,
    playerRect: Phaser.Geom.Rectangle, onGround: boolean, hurt: (fromX: number) => void) {
    const dt = dtMs / 1000;
    // where its front should be on screen: 92 px in (alone) back to 30 px in (a full peloton)
    const gap = Phaser.Math.Clamp(92 - riders * 14, 30, 92);
    const targetX = camLeft + gap - LE_W / 2;
    this.x += Phaser.Math.Clamp(targetX - this.x, -40 * dt, 30 * dt) + (targetX - this.x > 60 ? (targetX - this.x) * dt * 2 : 0);
    this.draw(Math.floor(this.scene.time.now / 120) % 2);
    this.puffT -= dt;
    if (this.puffT <= 0) { puff(this.scene, this.x - 66, this.groundY - 76, 0x69657a, 3, 10, 87); this.puffT = 0.25; if (Math.random() < 0.25) sfx.construction(); }
    this.drawLane(camLeft - 40);
    // hot asphalt: lobbed ahead of where you're going (more often further down the street)
    this.gobT -= dt;
    if (this.gobT <= 0 && this.hp.conveyor > 0) {
      const tF = 1.15, lead = Phaser.Math.Clamp(px + pvx * tF * 0.8 + Phaser.Math.Between(-18, 18), camLeft + 40, camLeft + viewW - 20);
      this.lob(lead, tF);
      if (progress > 0.5 && Math.random() < 0.5) this.scene.time.delayedCall(260, () => this.lob(Phaser.Math.Clamp(lead + Phaser.Math.Between(30, 60), camLeft + 40, camLeft + viewW - 20), tF));
      this.gobT = Phaser.Math.Linear(3.8, 2.3, progress) + Math.random() * 0.8;
    }
    this.updateGobs(dt, playerRect, onGround, hurt);
  }

  /** the grinder is on the raccoon (only the drum hurts, never the machine's body; Ivan, M3.1) */
  touching(playerRect: Phaser.Geom.Rectangle) { return this.move !== 'hot' && Phaser.Geom.Rectangle.Overlaps(this.grinderRect(), playerRect); }

  // ---------------- boss ----------------
  startBoss(left: number, right: number) {
    this.boss = true; this.arena = { left, right };
    // it reverses off screen to the left, then comes back charging
    this.move = 'backoff'; this.dir = 1; this.t = 0;
    this.gobs.forEach((g) => { g.img.destroy(); g.mark?.destroy(); }); this.gobs = [];
    floatText(this.scene, left + 120, this.groundY - 120, 'MORE LANES!', 'font_red', 0xffffff, 900); sfx.laugh();
  }

  private telegraph(msg: string, x: number) { this.warn?.destroy(); this.warn = this.scene.add.bitmapText(x, this.groundY - 70, 'font_outline', msg).setOrigin(0.5).setTint(0xff6347).setDepth(200); }
  private clearWarn() { this.warn?.destroy(); this.warn = undefined; }

  takeHits(hits: Hitbox[], onBroken: (k: ZoneKey) => void) {
    if (this.move !== 'hot') return; // only while it's overheated against the edge
    for (const h of hits) {
      if (h.id === this.lastHit) continue;
      for (const k of Object.keys(ZONES) as ZoneKey[]) {
        if (this.hp[k] <= 0) continue;
        const r = this.zoneRect(k);
        if (h.x < r.right && h.x + h.w > r.x && h.y < r.bottom && h.y + h.h > r.y) {
          this.lastHit = h.id; this.hp[k] -= h.dmg;
          this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
          puff(this.scene, r.centerX, r.centerY, 0xfff08a, 6, 18, 95); sfx.clang();
          if (this.hp[k] <= 0) {
            shake(this.scene, 250, 0.01); sfx.poof();
            floatText(this.scene, r.centerX, r.y - 10, k === 'conveyor' ? 'CONVEYOR DOWN!' : k === 'cab' ? 'FOREMAN OUT!' : 'GRINDER BUSTED!', 'font_outline', 0x9bd35a, 900);
            for (let i = 0; i < 3; i++) this.scene.time.delayedCall(i * 120, () => puff(this.scene, r.centerX, r.centerY, 0xc9c5d1, 8, 24, 95));
            onBroken(k);
            if (this.totalHp <= 0) this.die();
          }
          break;
        }
      }
    }
  }

  private die() {
    this.move = 'dead'; this.clearWarn(); this.img.clearTint();
    this.gobs.forEach((g) => { g.img.destroy(); g.mark?.destroy(); }); this.gobs = [];
    floatText(this.scene, this.x, this.groundY - 120, 'STALLED!', 'font_big', 0xffffff, 1400);
    shake(this.scene, 500, 0.012);
    this.scene.tweens.add({ targets: this.img, angle: -4 * this.dir, y: this.img.y + 4, duration: 400, ease: 'Bounce.easeOut' });
    for (let i = 0; i < 6; i++) this.scene.time.delayedCall(i * 160, () => puff(this.scene, this.x - 60 + Math.random() * 120, this.groundY - 60, 0x69657a, 10, 30, 95));
  }

  /**
   * The boss cycle (Ivan's design): ENTER from one side (warning) -> CHARGE across the whole screen (jump
   * the grinder) -> BOUNCE off the far edge, roll back a little -> HOT (hit it!) -> LEAVE off that side ->
   * come back from there, charging the other way.
   */
  updateBoss(dtMs: number, px: number, playerRect: Phaser.Geom.Rectangle, onGround: boolean, hurt: (fromX: number) => void, summon: (side: 1 | -1) => void, minions: number) {
    const dt = dtMs / 1000;
    const { left, right } = this.arena, rage = this.totalHp <= this.maxHp / 2;
    const moving = this.move === 'charge' || this.move === 'leave' || this.move === 'enter' || this.move === 'backoff';
    this.draw(moving ? Math.floor(this.scene.time.now / (this.move === 'charge' ? 50 : 120)) % 2 : 0);
    if (this.move === 'hot') this.img.setTint(Math.floor(this.scene.time.now / 100) % 2 ? 0xff9a2e : 0xffffff);
    this.updateGobs(dt, playerRect, onGround, hurt);
    if (!this.alive) return;
    if (this.touching(playerRect) && this.move === 'charge') hurt(this.x);
    this.t -= dt;
    const offL = left - LE_W / 2 - 30, offR = right + LE_W / 2 + 30;
    switch (this.move) {
      case 'backoff':
        this.x -= 100 * dt;
        if (this.x < offL) { this.x = offL; this.move = 'enter'; this.t = 1.4; }
        break;
      case 'enter': {
        // waiting just off screen: the warning sits at the edge it will come from, the ground rumbles
        const edge = this.dir === 1 ? left + 34 : right - 34;
        if (!this.warn) { this.telegraph(this.dir === 1 ? 'GRIND! >>' : '<< GRIND!', edge); sfx.rumble(); }
        this.warn?.setPosition(edge, Math.round(this.groundY - 70 - Math.abs(Math.sin(this.t * 9)) * 4));
        if (Math.floor(this.t * 10) % 3 === 0) puff(this.scene, this.dir === 1 ? left + 4 : right - 4, this.groundY - 4, 0x69657a, 2, 8, 87);
        if (this.t <= 0) { this.clearWarn(); this.move = 'charge'; sfx.construction(); }
        break;
      }
      case 'charge': {
        this.x += this.dir * (rage ? 250 : 205) * dt;
        if ((this.dir === 1 && this.front >= right) || (this.dir === -1 && this.front <= left)) {
          // slam into the edge of the screen and roll back a little
          this.x = (this.dir === 1 ? right : left) - this.dir * LE_W / 2;
          this.move = 'bounce'; this.t = 0.35; shake(this.scene, 220, 0.012); sfx.clang();
          for (let i = 0; i < 4; i++) puff(this.scene, this.front, this.groundY - 10 - i * 14, 0xc9c5d1, 6, 20, 95);
          this.scene.tweens.add({ targets: this, x: this.x - this.dir * 30, duration: 350, ease: 'Quad.easeOut' });
        }
        break;
      }
      case 'bounce':
        if (this.t <= 0) {
          this.move = 'hot'; this.t = rage ? 2.6 : 3.2; this.summoned = false;
          floatText(this.scene, this.x, this.groundY - 112, 'OVERHEATED! HIT IT!', 'font', 0xfff08a, 1100); sfx.construction();
        }
        break;
      case 'hot':
        if (Math.floor(this.t * 6) % 2 === 0) puff(this.scene, this.x - this.dir * 50, this.groundY - 96, 0xe8e4f0, 2, 6, 87);
        // the foreman shouts for help through the megaphone (once per stall, while his cab still works)
        if (!this.summoned && this.t < 2.0 && this.hp.cab > 0 && minions < 2) { this.summoned = true; summon(this.dir === 1 ? -1 : 1); sfx.squeak(); }
        if (this.t <= 0) { this.img.clearTint(); this.move = 'leave'; }
        break;
      case 'leave':
        // drives on off screen past the edge it hit, then turns around out of sight
        this.x += this.dir * 120 * dt;
        if ((this.dir === 1 && this.x > offR) || (this.dir === -1 && this.x < offL)) {
          this.dir = this.dir === 1 ? -1 : 1;
          this.x = this.dir === 1 ? offL : offR;
          this.move = 'enter'; this.t = rage ? 1.1 : 1.5;
          // the conveyor lobs a couple of gobs from out of sight while it lines up
          if (this.hp.conveyor > 0) for (let i = 0; i < (rage ? 3 : 2); i++) this.scene.time.delayedCall(200 + i * 260, () => {
            if (this.move !== 'enter') return;
            const sx = this.dir === 1 ? left - 10 : right + 10, tx = Phaser.Math.Clamp(px + Phaser.Math.Between(-40, 40), left + 30, right - 30), tF = 1.0;
            const mark = this.scene.add.ellipse(tx, this.groundY + 1, 6, 2, 0xff6347, 0.7).setDepth(41);
            this.scene.tweens.add({ targets: mark, scaleX: 3.2, scaleY: 2, duration: tF * 1000 });
            this.gobs.push({ img: this.scene.add.image(sx, this.groundY - 90, 'world', 'paintgob_0').setDepth(96), vx: (tx - sx) / tF, vy: -0.5 * 900 * tF + 90 / tF, mark });
            sfx.throwIt();
          });
        }
        break;
    }
  }
}
