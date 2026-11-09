// Ambient traffic: cars + streetcars on lanes, a simple signal cycle, yielding to the player.
import Phaser from 'phaser';
import type { Manifest } from '../scenes/BootScene';
import { sfx } from '../audio/sfx';

interface Vehicle { s: Phaser.GameObjects.Image; dir: 1 | -1; axis: 'x' | 'y'; speed: number; v: number; len: number; kind: 'car' | 'streetcar'; lane: number; honkCd: number }

const COLORS = ['blue', 'red', 'white', 'yellow', 'teal', 'orange'];

export class Traffic {
  private vehicles: Vehicle[] = [];
  private spawnT = { wb: 1, eb: 2.5, nb: 3, sb: 5, scW: 6, scE: 16 };
  private signalT = 0;
  /** true = east-west green */
  ewGreen = true;
  density = 1;

  constructor(private scene: Phaser.Scene, private lanes: { wb: number; eb: number; crossX: number }, private mapW: number, private mapH: number) {
    // pre-populate so the street is alive from the first frame
    for (let i = 0; i < 4; i++) { this.spawn('wb', Math.random() * mapW); this.spawn('eb', Math.random() * mapW); }
  }

  private spawn(lane: 'wb' | 'eb' | 'nb' | 'sb', at?: number, kind: 'car' | 'streetcar' = 'car') {
    const pv = (this.scene.registry.get('manifest') as Manifest).pivots;
    const horiz = lane === 'wb' || lane === 'eb';
    const dir: 1 | -1 = lane === 'eb' || lane === 'sb' ? 1 : -1;
    const face = horiz ? (dir === 1 ? 'E' : 'W') : dir === 1 ? 'S' : 'N';
    let key = kind === 'streetcar' ? `streetcar_${face}` : Math.random() < 0.18 ? `suv_${face}` : `car_${COLORS[Math.floor(Math.random() * COLORS.length)]}_${face}`;
    if (!horiz && kind === 'streetcar') key = `car_white_${face}`;
    const len = kind === 'streetcar' ? 100 : key.startsWith('suv') ? 34 : 30;
    const pos = at ?? (dir === 1 ? -len : (horiz ? this.mapW : this.mapH) + len);
    const laneC = lane === 'wb' ? this.lanes.wb : lane === 'eb' ? this.lanes.eb : lane === 'nb' ? this.lanes.crossX + 8 : this.lanes.crossX - 8;
    // keep spacing at spawn
    if (this.vehicles.some((v) => v.lane === laneC && Math.abs((horiz ? v.s.x : v.s.y) - pos) < len + 30)) return;
    const p = pv[key] ?? { x: 0.5, y: 0.75 };
    const s = this.scene.add.image(horiz ? pos : laneC, horiz ? laneC : pos, 'world', key).setOrigin(p.x, p.y);
    const speed = kind === 'streetcar' ? 46 : 58 + Math.random() * 28;
    this.vehicles.push({ s, dir, axis: horiz ? 'x' : 'y', speed, v: speed, len, kind, lane: laneC, honkCd: 0 });
  }

  update(dtMs: number, px: number, py: number) {
    const dt = dtMs / 1000;
    this.signalT += dt;
    const cycle = this.ewGreen ? 9 : 5;
    if (this.signalT > cycle) { this.signalT = 0; this.ewGreen = !this.ewGreen; }

    for (const k of Object.keys(this.spawnT) as (keyof typeof this.spawnT)[]) {
      this.spawnT[k] -= dt * this.density;
      if (this.spawnT[k] <= 0) {
        if (k === 'scW' || k === 'scE') { this.spawn(k === 'scW' ? 'wb' : 'eb', undefined, 'streetcar'); this.spawnT[k] = 22 + Math.random() * 10; }
        else { this.spawn(k); this.spawnT[k] = (k === 'nb' || k === 'sb' ? 4 : 2.2) + Math.random() * 3; }
      }
    }

    const cx = this.lanes.crossX;
    const stopLineEW = (dir: number) => (dir === 1 ? cx - 40 : cx + 40);
    const stopLineNS = (dir: number) => (dir === 1 ? this.lanes.wb - 30 : this.lanes.eb + 30);

    for (const v of this.vehicles) {
      const pos = v.axis === 'x' ? v.s.x : v.s.y;
      const front = pos + (v.dir * v.len) / 2;
      let target = v.speed;
      // signal
      if (v.axis === 'x' && !this.ewGreen) { const sl = stopLineEW(v.dir); const dist = (sl - front) * v.dir; if (dist > -4 && dist < 40) target = Math.min(target, Math.max(0, dist - 2) * 2.5); }
      if (v.axis === 'y' && this.ewGreen) { const sl = stopLineNS(v.dir); const dist = (sl - front) * v.dir; if (dist > -4 && dist < 40) target = Math.min(target, Math.max(0, dist - 2) * 2.5); }
      // vehicle ahead
      for (const o of this.vehicles) {
        if (o === v || o.lane !== v.lane || o.axis !== v.axis) continue;
        const op = o.axis === 'x' ? o.s.x : o.s.y;
        const gap = (op - pos) * v.dir - (o.len + v.len) / 2;
        if (gap > -10 && gap < 40) target = Math.min(target, Math.max(0, gap - 8) * 2.2);
      }
      // yield to the raccoon
      const lat = v.axis === 'x' ? Math.abs(py - v.lane) : Math.abs(px - v.lane);
      const ahead = ((v.axis === 'x' ? px : py) - front) * v.dir;
      if (lat < 11 && ahead > -v.len && ahead < 34) {
        target = 0;
        v.honkCd -= dt;
        if (v.honkCd <= 0 && v.v < 5) { if (v.kind === 'streetcar') sfx.streetcarBell(); else if (Math.random() < 0.5) sfx.carHonk(); v.honkCd = 4; }
      }
      v.v = target < v.v ? Math.max(target, v.v - 160 * dt) : Math.min(target, v.v + 50 * dt);
      if (v.axis === 'x') v.s.x += v.v * v.dir * dt; else v.s.y += v.v * v.dir * dt;
      v.s.setDepth(v.s.y + 2);
    }
    // despawn
    this.vehicles = this.vehicles.filter((v) => {
      const p = v.axis === 'x' ? v.s.x : v.s.y, lim = v.axis === 'x' ? this.mapW : this.mapH;
      if (p < -v.len * 1.5 || p > lim + v.len * 1.5) { v.s.destroy(); return false; }
      return true;
    });
  }

  /** Remove/thin cars (used when the city improves). */
  setDensity(d: number) { this.density = d; }
}
