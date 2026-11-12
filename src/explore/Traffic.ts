// Ambient traffic on the map's lanes: cars, TTC streetcars (which stop at their stops), and cyclists.
// One shared signal cycle for all intersections; everything yields to the raccoon.
// Before the bike-lane upgrade a few brave cyclists ride in the streetcar lane (and cars queue behind them,
// honking); after it, cyclists get their own protected lanes and there are many more of them.
import Phaser from 'phaser';
import type { Manifest } from '../scenes/BootScene';
import type { Lane, Intersection } from './CityMap';
import { sfx } from '../audio/sfx';

type Kind = 'car' | 'streetcar' | 'bike';
interface Vehicle {
  s: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite; lane: Lane; kind: Kind;
  speed: number; v: number; len: number; honkCd: number; stopT: number; served: Set<number>; off: number;
}
interface LaneState { lane: Lane; t: number; scT: number }

const COLORS = ['blue', 'red', 'white', 'yellow', 'teal', 'orange'];
const face = (l: Lane) => (l.axis === 'x' ? (l.dir === 1 ? 'E' : 'W') : l.dir === 1 ? 'S' : 'N');

export class Traffic {
  private vehicles: Vehicle[] = [];
  private states: LaneState[];
  private signalT = 0;
  /** true = east-west green */
  ewGreen = true;
  density = 1;
  private upgrades = new Set<string>();
  private manifest: Manifest;

  constructor(private scene: Phaser.Scene, lanes: Lane[], private intersections: Intersection[], private mapW: number, private mapH: number, upgrades: string[]) {
    this.manifest = scene.registry.get('manifest') as Manifest;
    this.upgrades = new Set(upgrades);
    this.states = lanes.map((lane) => ({ lane, t: Math.random() * 3, scT: 4 + Math.random() * 14 }));
    // pre-populate so the streets are alive from the first frame
    for (const st of this.states) {
      if (!this.active(st.lane)) continue;
      const n = st.lane.axis === 'x' ? (st.lane.bikeOnly ? 4 : 4) : 2;
      const [a, b] = this.span(st.lane);
      for (let i = 0; i < n; i++) this.spawn(st.lane, a + Math.random() * (b - a), st.lane.bikeOnly ? 'bike' : 'car');
    }
  }

  setUpgrades(u: string[]) { this.upgrades = new Set(u); }
  private active(l: Lane) { return !l.requires || this.upgrades.has(l.requires); }
  private get protectedLanes() { return this.upgrades.has('queen_protected_lanes'); }

  private has(id?: string) { return !!id && this.upgrades.has(id); }
  /** the stretch of map a lane runs along */
  private span(l: Lane): [number, number] { return l.range ?? [0, l.axis === 'x' ? this.mapW : this.mapH]; }

  private spawn(lane: Lane, at?: number, kind: Kind = 'car') {
    // King St corridor: no through traffic (a rare local delivery still turns in)
    if (kind === 'car' && this.has(lane.noCars) && Math.random() < 0.88) return;
    if (kind !== 'streetcar' && lane.transitOnly) return;
    const horiz = lane.axis === 'x';
    const f = face(lane);
    const len = kind === 'streetcar' ? 100 : kind === 'bike' ? 16 : 32;
    const [a, b] = this.span(lane);
    const pos = at ?? (lane.dir === 1 ? a - len : b + len);
    if (this.vehicles.some((v) => v.lane === lane && Math.abs(this.posOf(v) - pos) < (len + v.len) / 2 + 24)) return;
    let s: Vehicle['s'];
    let off = 0;
    if (kind === 'bike') {
      const id = Phaser.Utils.Array.GetRandom(this.manifest.cyclists ?? ['a']);
      const pv = this.manifest.pivots.cy ?? { x: 0.5, y: 0.8 };
      // in a mixed lane, cyclists hug the right-hand side (between the tracks and the parked cars)
      if (!lane.bikeOnly) off = lane.dir === 1 ? 6 : -6;
      s = this.scene.add.sprite(0, 0, 'chars', `cy_${id}_${f}_0`).setOrigin(pv.x, pv.y).play(`cy_${id}_${f}`);
    } else {
      const key = kind === 'streetcar' ? `streetcar_${f}` : Math.random() < 0.2 ? `suv_${f}` : `car_${COLORS[Math.floor(Math.random() * COLORS.length)]}_${f}`;
      const pv = this.manifest.pivots[key] ?? { x: 0.5, y: 0.75 };
      s = this.scene.add.image(0, 0, 'world', key).setOrigin(pv.x, pv.y);
    }
    if (horiz) s.setPosition(pos, lane.pos + off); else s.setPosition(lane.pos + off, pos);
    // cars > streetcars > cyclists > pedestrians (16-28), so a cyclist in mixed traffic visibly holds cars up
    let speed = kind === 'streetcar' ? (this.has(lane.priority) ? 68 : 52) : kind === 'bike' ? 32 + Math.random() * 7 : lane.light ? 52 + Math.random() * 14 : 72 + Math.random() * 26;
    if (kind === 'car' && lane.speedy && !this.has(lane.calm)) speed = 108 + Math.random() * 22; // Parkside before calming
    if (kind === 'car' && this.has(lane.calm)) speed *= 0.5;
    this.vehicles.push({ s, lane, kind, speed, v: speed, len, honkCd: 0, stopT: 0, served: new Set(), off });
  }

  private posOf(v: Vehicle) { return v.lane.axis === 'x' ? v.s.x : v.s.y; }

  update(dtMs: number, px: number, py: number) {
    const dt = dtMs / 1000;
    this.signalT += dt;
    if (this.signalT > (this.ewGreen ? 10 : 6)) { this.signalT = 0; this.ewGreen = !this.ewGreen; }

    for (const st of this.states) {
      const l = st.lane;
      if (!this.active(l)) continue;
      st.t -= dt * (l.bikeOnly ? 1 : this.density);
      if (st.t <= 0) {
        let kind: Kind = l.bikeOnly ? 'bike' : 'car';
        // brave cyclists in mixed traffic before there's anywhere safer to ride
        if (l.cyclists === 'mixed' && !this.protectedLanes && Math.random() < 0.18) kind = 'bike';
        this.spawn(l, undefined, kind);
        st.t = l.bikeOnly ? 2.2 + Math.random() * 2.5 : l.axis === 'y' ? (l.light ? 9 : 5) + Math.random() * 4 : 2.6 + Math.random() * 3;
      }
      if (l.streetcar) { st.scT -= dt; if (st.scT <= 0) { this.spawn(l, undefined, 'streetcar'); st.scT = 24 + Math.random() * 12; } }
    }

    for (const v of this.vehicles) {
      const l = v.lane, pos = this.posOf(v), front = pos + (l.dir * v.len) / 2;
      let target = v.speed;
      const brakeTo = (stopAt: number, k = 2.5) => { const dist = (stopAt - front) * l.dir; if (dist > -4 && dist < 44) target = Math.min(target, Math.max(0, dist - 2) * k); };
      // signals (bikes in protected lanes obey them too)
      const priority = v.kind === 'streetcar' && this.has(l.priority); // TSP: the light waits for the streetcar
      for (const it of this.intersections) {
        if (priority) break;
        if (l.axis === 'x') {
          if (it.tee || this.ewGreen || l.pos < it.y0 || l.pos > it.y1) continue;
          brakeTo(l.dir === 1 ? it.x0 - 2 : it.x1 + 2);
        } else {
          if (!this.ewGreen || l.pos < it.x0 || l.pos > it.x1) continue;
          brakeTo(l.dir === 1 ? it.y0 - 34 : it.y1 + 34);
        }
      }
      // TTC stops
      if (v.kind === 'streetcar') {
        if (v.stopT > 0) { v.stopT -= dt; target = 0; if (v.stopT <= 0) sfx.streetcarBell(); }
        else for (const s of l.stops ?? []) {
          if (v.served.has(s)) continue;
          const dist = (s - front) * l.dir;
          if (dist < -6) { v.served.add(s); continue; }
          if (dist < 60) target = Math.min(target, Math.max(0, dist) * 1.4 + 2);
          if (dist < 3 && v.v < 8) { v.stopT = 3.2; v.served.add(s); }
        }
      }
      // whatever is ahead in the same lane (cars stuck behind a cyclist honk)
      for (const o of this.vehicles) {
        if (o === v || o.lane !== l) continue;
        const gap = (this.posOf(o) - pos) * l.dir - (o.len + v.len) / 2;
        if (gap > -10 && gap < 40) {
          target = Math.min(target, Math.max(0, gap - 8) * 2.2);
          if (o.kind === 'bike' && v.kind === 'car' && gap < 30) { v.honkCd -= dt; if (v.honkCd <= 0) { if (this.near(v, px, py)) sfx.carHonk(); v.honkCd = 3 + Math.random() * 3; } }
        }
      }
      // yield to the raccoon
      const lat = l.axis === 'x' ? Math.abs(py - (l.pos + v.off)) : Math.abs(px - (l.pos + v.off));
      const ahead = ((l.axis === 'x' ? px : py) - front) * l.dir;
      if (lat < (v.kind === 'bike' ? 8 : 11) && ahead > -v.len && ahead < (v.kind === 'bike' ? 20 : 34)) {
        target = 0;
        v.honkCd -= dt;
        if (v.honkCd <= 0 && v.v < 5) {
          if (v.kind === 'streetcar') sfx.streetcarBell(); else if (v.kind === 'bike') sfx.bell(); else if (Math.random() < 0.5) sfx.carHonk();
          v.honkCd = 4;
        }
      }
      v.v = target < v.v ? Math.max(target, v.v - 160 * dt) : Math.min(target, v.v + (v.kind === 'streetcar' ? 30 : 50) * dt);
      if (l.axis === 'x') v.s.x += v.v * l.dir * dt; else v.s.y += v.v * l.dir * dt;
      v.s.setDepth(v.s.y + 2);
      if (v.kind === 'bike') (v.s as Phaser.GameObjects.Sprite).anims.timeScale = Math.max(0.05, v.v / 45);
    }
    // despawn
    this.vehicles = this.vehicles.filter((v) => {
      const p = this.posOf(v), [a, b] = this.span(v.lane);
      if (p < a - v.len * 1.5 || p > b + v.len * 1.5) { v.s.destroy(); return false; }
      return true;
    });
  }

  private near(v: Vehicle, px: number, py: number) { return Math.abs(v.s.x - px) < 260 && Math.abs(v.s.y - py) < 160; }

  /** Thin cars (used when the city improves). */
  setDensity(d: number) { this.density = d; }
  get count() { return this.vehicles.length; }
}
