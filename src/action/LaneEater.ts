// Mission 5, "The Lane Eater" (Bloor West). Different from every other mission:
//  - The screen AUTO-SCROLLS. Dog Fraud's paving machine follows behind, chewing up the protected bike lane
//    and painting car-lane lines where it was.
//  - Riders wait along the curb: ring your bell (E) beside them and they join your PELOTON. Every rider in
//    the peloton absorbs one hit for you and slows the machine (critical mass).
//  - At the end of the street the machine turns on you: a boss with three weak points (the conveyor up top,
//    the foreman's cab, the grinder drum), each with its own pattern.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import { STREET_Y } from '../ui/sideLayout';
import type { Hitbox } from './SidePlayer';

export interface AutoScrollDef { speed: number; end: number; riders: number[]; ambush?: { at: number; rats: ('basic' | 'construction' | 'traffic')[] }[] }

const LE_W = 176;
// weak points relative to the machine's pivot (centre-bottom of the tracks)
const ZONES = { conveyor: { x: 30, y: 10, w: 70, h: 14 }, cab: { x: 104, y: 20, w: 30, h: 30 }, grinder: { x: 136, y: 58, w: 38, h: 40 } } as const;
type ZoneKey = keyof typeof ZONES;
const RIDER_IDS = ['a', 'b', 'c', 'd'];

/** riders waiting on Bloor + the peloton behind the raccoon */
export class Peloton {
  private waiting: { s: Phaser.GameObjects.Sprite; mark: Phaser.GameObjects.BitmapText; joined: boolean }[] = [];
  readonly riders: Phaser.GameObjects.Sprite[] = [];
  joinedTotal = 0;

  constructor(private scene: Phaser.Scene, xs: number[], private groundY: number) {
    xs.forEach((x, i) => {
      const id = RIDER_IDS[i % RIDER_IDS.length];
      const s = scene.add.sprite(x, groundY - 8, 'chars', `cys_${id}_0`).setOrigin(0.5, 1).setDepth(70);
      const mark = scene.add.bitmapText(x, groundY - 46, 'font_outline', 'RING!').setOrigin(0.5).setDepth(210).setTint(0xfff08a).setVisible(false);
      s.setData('id', id);
      this.waiting.push({ s, mark, joined: false });
    });
  }

  get size() { return this.riders.length; }

  /** E near a waiting rider: they join */
  ring(px: number) {
    let joined = false;
    for (const w of this.waiting) {
      if (w.joined || Math.abs(w.s.x - px) > 44) continue;
      w.joined = true; w.mark.destroy(); joined = true;
      this.riders.push(w.s);
      w.s.play(`cys_${w.s.getData('id')}`);
      this.joinedTotal++;
      floatText(this.scene, w.s.x, this.groundY - 50, Phaser.Utils.Array.GetRandom(['I\'M IN!', 'LET\'S RIDE!', 'SAVE BLOOR!', 'CRITICAL MASS!']), 'font', 0x9bd35a, 500);
    }
    if (joined) sfx.bell();
    return joined;
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

  update(dtMs: number, px: number, camLeft: number) {
    for (const w of this.waiting) if (!w.joined) {
      w.mark.setVisible(Math.abs(w.s.x - px) < 70).setY(Math.round(this.groundY - 46 + Math.sin(this.scene.time.now / 130)));
      if (w.s.x < camLeft - 60) { w.joined = true; w.mark.destroy(); this.scene.tweens.add({ targets: w.s, alpha: 0, duration: 300 }); } // left behind
    }
    // the peloton follows in a line behind the raccoon
    this.riders.forEach((r, i) => {
      const parked = this.parkAt !== null;
      const tx = parked ? this.parkAt! - i * 16 : px - 26 - i * 18, ty = parked ? STREET_Y + 6 : this.groundY - 8 + (i % 2) * 6;
      if (parked) { r.setDepth(12); if (Math.floor(this.scene.time.now / 300 + i) % 6 === 0) r.y = ty - 2; }
      r.x += (tx - r.x) * Math.min(1, dtMs / 120); r.y += (ty - r.y) * 0.2;
      if (!parked) r.setDepth(98 - i);
    });
  }
}

/** the machine while it chases (auto-scroll) and while you fight it (boss) */
export class LaneEater {
  readonly img: Phaser.GameObjects.Image;
  x: number;
  private lane: Phaser.GameObjects.Graphics;
  private puffT = 0;
  // boss state
  boss = false;
  readonly hp: Record<ZoneKey, number> = { conveyor: 6, cab: 6, grinder: 6 };
  readonly maxHp = 18;
  private move: 'idle' | 'gobs' | 'megaphone' | 'lunge' | 'hot' | 'back' | 'dead' = 'idle';
  private t = 1.5;
  private step = 0;
  private homeX = 0;
  private lastHit = -1;
  private gobs: { img: Phaser.GameObjects.Image; vx: number; vy: number }[] = [];
  private puddles: { g: Phaser.GameObjects.Ellipse; x: number; t: number }[] = [];
  private warn?: Phaser.GameObjects.BitmapText;

  constructor(private scene: Phaser.Scene, x: number, private groundY: number) {
    this.x = x;
    this.lane = scene.add.graphics().setDepth(6);
    this.img = scene.add.image(x, groundY + 6, 'world', 'laneeater_0').setOrigin(0.5, 103 / 112).setDepth(88);
  }

  get alive() { return this.move !== 'dead'; }
  get totalHp() { return this.hp.conveyor + this.hp.cab + this.hp.grinder; }
  get front() { return this.x + LE_W / 2; }
  private broken() { return (Object.keys(this.hp) as ZoneKey[]).filter((k) => this.hp[k] <= 0); }
  private frameKey(f: number) { const b = this.broken(); return b.length ? `laneeater_${f}_${b.map((k) => ({ conveyor: 'v', cab: 'b', grinder: 'g' })[k]).sort().join('')}` : `laneeater_${f}`; }
  private zoneRect(k: ZoneKey) {
    const z = ZONES[k], left = this.x - LE_W / 2, top = this.groundY + 6 - 103;
    return new Phaser.Geom.Rectangle(left + z.x, top + z.y, z.w, z.h);
  }

  /** the lane it has eaten: bike-lane green is paved over with car-lane paint */
  private drawLane(fromX: number) {
    const g = this.lane.clear(), y0 = STREET_Y + 16, h = 12, x1 = this.x - 40;
    if (x1 <= fromX) return;
    g.fillStyle(0x363644).fillRect(fromX, y0, x1 - fromX, h + 3);
    g.fillStyle(0x262631).fillRect(fromX, y0 + h + 3, x1 - fromX, 1);
    for (let x = Math.ceil(fromX / 24) * 24; x < x1; x += 24) g.fillStyle(0xf6f2e9).fillRect(x, y0 + h - 1, 12, 2);
  }

  /** auto-scroll phase: creep after the raccoon, slower with every peloton rider */
  chase(dtMs: number, scrollSpeed: number, riders: number, px: number, camLeft: number) {
    const dt = dtMs / 1000;
    const v = scrollSpeed + 10 - riders * 6;
    this.x = Phaser.Math.Clamp(this.x + v * dt, camLeft - 260, px - 30);
    this.img.setX(Math.round(this.x)).setFrame(this.frameKey(Math.floor(this.scene.time.now / 120) % 2));
    this.puffT -= dt;
    if (this.puffT <= 0) { puff(this.scene, this.x - 66, this.groundY - 76, 0x69657a, 3, 10, 87); this.puffT = 0.25; if (Math.random() < 0.25) sfx.construction(); }
    this.drawLane(camLeft - 40);
  }

  /** the machine's front is on the raccoon */
  touching(playerRect: Phaser.Geom.Rectangle) { return playerRect.x < this.front - 6 && playerRect.right > this.x - LE_W / 2; }

  // ---------------- boss ----------------
  startBoss(x: number) { this.boss = true; this.homeX = x; this.x = x; this.img.setX(x); this.t = 1.2; floatText(this.scene, x + 40, this.groundY - 120, 'MORE LANES!', 'font_red', 0xffffff, 900); sfx.laugh(); }

  private telegraph(msg: string) { this.warn?.destroy(); this.warn = this.scene.add.bitmapText(this.x + 40, this.groundY - 122, 'font_outline', msg).setOrigin(0.5).setTint(0xff6347).setDepth(200); }
  private clearWarn() { this.warn?.destroy(); this.warn = undefined; }

  takeHits(hits: Hitbox[], onBroken: (k: ZoneKey) => void) {
    for (const h of hits) {
      if (h.id === this.lastHit) continue;
      for (const k of Object.keys(ZONES) as ZoneKey[]) {
        if (this.hp[k] <= 0) continue;
        if (k === 'grinder' && this.move !== 'hot') continue; // only when it's overheated
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
    this.move = 'dead'; this.clearWarn();
    this.gobs.forEach((g) => g.img.destroy()); this.gobs = [];
    floatText(this.scene, this.x, this.groundY - 120, 'STALLED!', 'font_big', 0xffffff, 1400);
    shake(this.scene, 500, 0.012);
    this.scene.tweens.add({ targets: this.img, angle: -4, y: this.img.y + 4, duration: 400, ease: 'Bounce.easeOut' });
    for (let i = 0; i < 6; i++) this.scene.time.delayedCall(i * 160, () => puff(this.scene, this.x - 60 + Math.random() * 120, this.groundY - 60, 0x69657a, 10, 30, 95));
  }

  /** returns true if the player was hurt this frame */
  updateBoss(dtMs: number, px: number, playerRect: Phaser.Geom.Rectangle, onGround: boolean, hurt: (fromX: number) => void, summon: () => void, minions: number) {
    const dt = dtMs / 1000;
    this.img.setX(Math.round(this.x)).setFrame(this.frameKey(Math.floor(this.scene.time.now / (this.move === 'lunge' ? 60 : 160)) % 2));
    if (this.move === 'hot') this.img.setTint(Math.floor(this.scene.time.now / 100) % 2 ? 0xff9a2e : 0xffffff);
    // gobs fly, land, leave puddles
    for (const g of [...this.gobs]) {
      g.vy += 900 * dt; g.img.x += g.vx * dt; g.img.y += g.vy * dt; g.img.angle += 400 * dt;
      const r = new Phaser.Geom.Rectangle(g.img.x - 4, g.img.y - 4, 8, 8);
      if (Phaser.Geom.Rectangle.Overlaps(r, playerRect)) { hurt(g.img.x); g.img.destroy(); this.gobs.splice(this.gobs.indexOf(g), 1); continue; }
      if (g.img.y >= this.groundY - 2) {
        sfx.stamp();
        this.puddles.push({ g: this.scene.add.ellipse(g.img.x, this.groundY, 22, 5, 0x262631).setStrokeStyle(1, 0x16121f).setDepth(40), x: g.img.x, t: 2.2 });
        g.img.destroy(); this.gobs.splice(this.gobs.indexOf(g), 1);
      }
    }
    for (const p of [...this.puddles]) {
      p.t -= dt;
      if (onGround && Math.abs(playerRect.centerX - p.x) < 12 && playerRect.bottom > this.groundY - 6) hurt(p.x);
      if (p.t <= 0) { p.g.destroy(); this.puddles.splice(this.puddles.indexOf(p), 1); }
    }
    if (!this.alive) return;
    if (this.warn) this.warn.setPosition(Math.round(this.x + 40), Math.round(this.groundY - 122 - Math.sin(this.t * 20)));
    this.t -= dt;
    switch (this.move) {
      case 'idle':
        if (this.t <= 0) {
          const order = ['gobs', 'megaphone', 'lunge'] as const;
          let m: 'gobs' | 'megaphone' | 'lunge' = order[this.step++ % 3];
          if (m === 'gobs' && this.hp.conveyor <= 0) m = 'lunge';
          if (m === 'megaphone' && (this.hp.cab <= 0 || minions >= 3)) m = 'lunge';
          this.move = m; this.t = 0.8;
          this.telegraph(m === 'gobs' ? 'HOT ASPHALT!' : m === 'megaphone' ? 'MORE LANES!' : 'GRIND!');
        }
        break;
      case 'gobs':
        if (this.t <= 0) {
          this.clearWarn();
          for (let i = 0; i < 4; i++) this.scene.time.delayedCall(i * 160, () => {
            if (!this.alive) return;
            const sx = this.x - 20, sy = this.groundY - 92, tF = 0.9 + i * 0.12, dx = px - sx + (i - 1.5) * 30;
            this.gobs.push({ img: this.scene.add.image(sx, sy, 'world', 'paintgob_0').setDepth(96), vx: dx / tF, vy: -0.5 * 900 * tF + (this.groundY - sy) / tF });
            sfx.throwIt();
          });
          this.move = 'idle'; this.t = 1.8;
        }
        break;
      case 'megaphone':
        if (this.t <= 0) { this.clearWarn(); summon(); sfx.squeak(); this.move = 'idle'; this.t = 1.6; }
        break;
      case 'lunge':
        if (this.t <= 0) {
          this.clearWarn();
          // rolls forward fast: jump it (or dash through)
          this.x += 200 * dt;
          if (this.touching(playerRect) && !(playerRect.bottom < this.groundY - 40)) hurt(this.x);
          if (this.x > this.homeX + 110) { this.move = 'hot'; this.t = 2.2; floatText(this.scene, this.front - 10, this.groundY - 70, 'OVERHEATED! HIT THE GRINDER!', 'font', 0xfff08a, 1200); sfx.construction(); }
        }
        break;
      case 'hot':
        if (this.t <= 0) { this.img.clearTint(); this.move = 'back'; }
        break;
      case 'back':
        this.x -= 70 * dt;
        if (this.x <= this.homeX) { this.x = this.homeX; this.move = 'idle'; this.t = 1.2; }
        break;
    }
  }
}
