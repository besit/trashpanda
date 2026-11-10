// Pedestrians walking the sidewalks and park paths, plus Trinity Bellwoods' famous white squirrel.
// Walkers follow walkway polylines back and forth, pause when the raccoon is in their way,
// and react to the bell.
import Phaser from 'phaser';
import type { Manifest } from '../scenes/BootScene';
import { floatText } from '../ui/fx';
import { sfx } from '../audio/sfx';

interface Walker {
  s: Phaser.GameObjects.Sprite; path: [number, number][]; seg: number; t: number; dir: 1 | -1;
  speed: number; id: string; facing: string; off: number; wait: number; reactCd: number;
}

const LINES = ['HI RACCOON!', 'NICE BELL!', 'CUTE BIKE!', 'OH! A RACCOON!', 'WATCH OUT!', 'MORNING!'];

export class Crowd {
  private walkers: Walker[] = [];
  private squirrel?: { s: Phaser.GameObjects.Sprite; home: { x: number; y: number }; vx: number; vy: number; t: number; spotted: boolean };
  onSquirrelSpotted?: () => void;

  constructor(private scene: Phaser.Scene, walkways: [number, number][][], critters: { kind: string; x: number; y: number }[], count = 30) {
    const m = scene.registry.get('manifest') as Manifest;
    const ids = m.peds ?? ['a'];
    const pv = m.pivots.ped ?? { x: 0.5, y: 0.9 };
    // weight paths by length so long sidewalks get more people
    const lens = walkways.map((p) => p.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0));
    const total = lens.reduce((a, b) => a + b, 0);
    for (let i = 0; i < count; i++) {
      let r = Math.random() * total, k = 0;
      while (r > lens[k] && k < lens.length - 1) { r -= lens[k]; k++; }
      const path = walkways[k];
      const seg = Math.floor(Math.random() * (path.length - 1));
      const id = ids[Math.floor(Math.random() * ids.length)];
      const s = scene.add.sprite(0, 0, 'chars', `ped_${id}_S_0`).setOrigin(pv.x, pv.y);
      this.walkers.push({ s, path, seg, t: Math.random(), dir: Math.random() < 0.5 ? 1 : -1, speed: id === 'kid' ? 30 : 16 + Math.random() * 12, id, facing: '', off: (Math.random() - 0.5) * 6, wait: 0, reactCd: 0 });
    }
    for (const c of critters) if (c.kind === 'white_squirrel') {
      const s = scene.add.sprite(c.x, c.y, 'world', 'sq_2').setOrigin(0.5, 1).play('sq_sit');
      this.squirrel = { s, home: { x: c.x, y: c.y }, vx: 0, vy: 0, t: 1, spotted: false };
    }
  }

  /** Bell rung at (x, y): nearby walkers react. */
  bell(x: number, y: number) {
    for (const w of this.walkers) {
      if (w.reactCd > 0 || Phaser.Math.Distance.Between(x, y, w.s.x, w.s.y) > 56) continue;
      w.reactCd = 6;
      if (Math.random() < 0.6) { floatText(this.scene, w.s.x, w.s.y - 30, LINES[Math.floor(Math.random() * LINES.length)], 'font', 0xfff08a); break; }
    }
  }

  update(dtMs: number, px: number, py: number, cam: Phaser.Geom.Rectangle) {
    const dt = dtMs / 1000;
    for (const w of this.walkers) {
      w.reactCd -= dt;
      const a = w.path[w.seg], b = w.path[w.seg + 1];
      const segLen = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
      const ux = (b[0] - a[0]) / segLen, uy = (b[1] - a[1]) / segLen;
      // pause if the raccoon is right in front
      const hx = w.s.x + ux * w.dir * 10, hy = w.s.y + uy * w.dir * 10;
      const blocked = Math.hypot(px - hx, py - hy) < 13;
      if (blocked) w.wait = 0.4;
      if (w.wait > 0) w.wait -= dt;
      else {
        w.t += (w.speed * w.dir * dt) / segLen;
        if (w.t > 1) { if (w.seg < w.path.length - 2) { w.seg++; w.t = 0; } else { w.t = 1; w.dir = -1; } }
        else if (w.t < 0) { if (w.seg > 0) { w.seg--; w.t = 1; } else { w.t = 0; w.dir = 1; } }
      }
      const x = a[0] + (b[0] - a[0]) * w.t - uy * w.off, y = a[1] + (b[1] - a[1]) * w.t + ux * w.off;
      w.s.setPosition(Math.round(x), Math.round(y)).setDepth(y);
      const vis = x > cam.x - 40 && x < cam.right + 40 && y > cam.y - 40 && y < cam.bottom + 40;
      w.s.setVisible(vis);
      if (!vis) continue;
      const dx = ux * w.dir, dy = uy * w.dir;
      const f = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : dy > 0 ? 'S' : 'N';
      const moving = w.wait <= 0;
      if (f !== w.facing || (moving && !w.s.anims.isPlaying)) { w.facing = f; w.s.play(`ped_${w.id}_${f}`, true); }
      if (!moving && w.s.anims.isPlaying) { w.s.anims.stop(); w.s.setFrame(`ped_${w.id}_${f}_0`); }
    }
    this.updateSquirrel(dt, px, py);
  }

  private updateSquirrel(dt: number, px: number, py: number) {
    const q = this.squirrel;
    if (!q) return;
    const d = Phaser.Math.Distance.Between(px, py, q.s.x, q.s.y);
    q.t -= dt;
    if (d < 46) {
      // flee, away from the raccoon, back toward home-ish
      const ax = q.s.x - px, ay = q.s.y - py, l = Math.max(1, Math.hypot(ax, ay));
      q.vx = (ax / l) * 70; q.vy = (ay / l) * 50; q.t = 0.7;
      if (!q.spotted) { q.spotted = true; sfx.squeak(); this.onSquirrelSpotted?.(); }
    } else if (q.t <= 0) {
      // wander: hop around home, then sit
      if (Math.random() < 0.5) { q.vx = 0; q.vy = 0; q.t = 1 + Math.random() * 2; }
      else { const a = Math.random() * Math.PI * 2; const back = Math.hypot(q.home.x - q.s.x, q.home.y - q.s.y) > 60; const ang = back ? Math.atan2(q.home.y - q.s.y, q.home.x - q.s.x) : a; q.vx = Math.cos(ang) * 40; q.vy = Math.sin(ang) * 30; q.t = 0.6 + Math.random() * 0.6; }
    }
    q.s.x += q.vx * dt; q.s.y += q.vy * dt;
    const moving = Math.abs(q.vx) + Math.abs(q.vy) > 1;
    const key = moving ? 'sq_run' : 'sq_sit';
    if (q.s.anims.currentAnim?.key !== key) q.s.play(key);
    if (q.vx) q.s.setFlipX(q.vx < 0);
    q.s.setDepth(q.s.y);
  }

  get squirrelPos() { return this.squirrel ? { x: this.squirrel.s.x, y: this.squirrel.s.y } : null; }
}
