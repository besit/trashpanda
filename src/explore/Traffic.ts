// Ambient traffic on the map's lanes: cars, TTC streetcars (which stop at their stops), and cyclists.
// One shared signal cycle for all intersections; everything yields to the raccoon.
// Before the bike-lane upgrade a few brave cyclists ride in the streetcar lane (and cars queue behind them,
// honking); after it, cyclists get their own protected lanes and there are many more of them.
import Phaser from 'phaser';
import type { Manifest } from '../scenes/BootScene';
import { type Lane, type Intersection, underDepth, ELEVATED_DEPTH } from './CityMap';
import { sfx } from '../audio/sfx';

type Kind = 'car' | 'streetcar' | 'bike';
interface Turn { to: Lane; r: number; c: [number, number]; s: [number, number]; e: [number, number]; h0: number; h1: number; t: number; d1: [number, number]; d2: [number, number] }
interface Vehicle {
  s: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite; lane: Lane; kind: Kind;
  speed: number; v: number; len: number; honkCd: number; stopT: number; served: Set<number>; off: number;
  /** sprite key without the facing ('car_red', 'suv', 'streetcar', 'cy_b') */ base: string;
  /** the corner this vehicle will take, and the turn in progress */ plan?: Turn; turning?: Turn;
  /** a streetcar that turns is drawn as three articulated sections (rear, mid, front) that follow its route */
  parts?: Phaser.GameObjects.Image[]; after?: Turn;
}
/** section centres along the car from its middle (rear, mid, front; the Flexity's 5 modules split 2-1-2) */
const SC_OFF = [-28.8, 0, 28.8];
// 8 facings (screen angle, y down) -> sprite suffix; cyclists only have the 4 straight ones
const FACE8 = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
const faceOf = (ang: number, eight: boolean) => {
  const step = eight ? Math.PI / 4 : Math.PI / 2;
  const k = Math.round(ang / step);
  return eight ? FACE8[((k % 8) + 8) % 8] : ['E', 'S', 'W', 'N'][((k % 4) + 4) % 4];
};
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

  private byId = new Map<string, Lane>();
  /** the Gardiner's jam cycle (s): flowing, then a jam builds at a choke point and clears again */
  private jamT = 0;
  get jammed() { return this.jamT % 34 > 22; }

  constructor(private scene: Phaser.Scene, lanes: Lane[], private intersections: Intersection[], private mapW: number, private mapH: number, upgrades: string[]) {
    this.manifest = scene.registry.get('manifest') as Manifest;
    this.upgrades = new Set(upgrades);
    for (const l of lanes) this.byId.set(l.id, l);
    this.states = lanes.map((lane) => ({ lane, t: Math.random() * 3, scT: 4 + Math.random() * 14 }));
    // pre-populate so the streets are alive from the first frame
    for (const st of this.states) {
      if (!this.active(st.lane) || st.lane.noSpawn) continue;
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
    const base = kind === 'bike' ? (s.frame.name.split('_').slice(0, 2).join('_')) : (s.frame.name.replace(/_[NESW]$/, ''));
    // cars > streetcars > cyclists > pedestrians (16-28), so a cyclist in mixed traffic visibly holds cars up
    let speed = kind === 'streetcar' ? (this.has(lane.priority) ? 68 : 52) : kind === 'bike' ? 32 + Math.random() * 7 : lane.light ? 52 + Math.random() * 14 : 72 + Math.random() * 26;
    if (kind === 'car' && lane.speedy && !this.has(lane.calm)) speed = 108 + Math.random() * 22; // Parkside before calming
    if (kind === 'car' && this.has(lane.calm)) speed *= 0.5;
    if (lane.elevated) speed = 120 + Math.random() * 30; // the Gardiner, when it's moving
    const plan = this.planTurn(lane, kind);
    const v: Vehicle = { s, lane, kind, speed, v: speed, len, honkCd: 0, stopT: 0, served: new Set(), off, base, plan };
    // M3.2 (Ivan): a streetcar taking a corner bends at its joints instead of turning as one long piece
    if (kind === 'streetcar' && plan) { s.setVisible(false); v.parts = ['r', 'm', 'f'].map((k) => this.scene.add.image(0, 0, 'world', `scsec_${k}_${f}`)); this.placeParts(v); }
    this.vehicles.push(v);
  }

  /** pick the corner (if any) a new vehicle will take, and lay out its quarter-circle */
  private planTurn(lane: Lane, kind: Kind): Turn | undefined {
    for (const t of lane.turns ?? []) {
      if (t.kinds && !t.kinds.includes(kind)) continue;
      if (Math.random() >= t.p) continue;
      const to = this.byId.get(t.to);
      if (!to || to.axis === lane.axis) continue;
      const d1: [number, number] = lane.axis === 'x' ? [lane.dir, 0] : [0, lane.dir];
      const d2: [number, number] = to.axis === 'x' ? [to.dir, 0] : [0, to.dir];
      const P: [number, number] = lane.axis === 'y' ? [lane.pos, to.pos] : [to.pos, lane.pos];
      const s: [number, number] = [P[0] - d1[0] * t.r, P[1] - d1[1] * t.r];
      const e: [number, number] = [P[0] + d2[0] * t.r, P[1] + d2[1] * t.r];
      const c: [number, number] = [s[0] + d2[0] * t.r, s[1] + d2[1] * t.r];
      const h0 = Math.atan2(d1[1], d1[0]); let h1 = Math.atan2(d2[1], d2[0]);
      if (h1 - h0 > Math.PI) h1 -= Math.PI * 2; if (h0 - h1 > Math.PI) h1 += Math.PI * 2;
      return { to, r: t.r, c, s, e, h0, h1, t: 0, d1, d2 };
    }
    return undefined;
  }

  /** a vehicle mid-corner: follow the arc, show the facing nearest its heading (45-degree frames) */
  private steer(v: Vehicle, dt: number) {
    const T = v.turning!;
    T.t = Math.min(1, T.t + (Math.max(v.v, 18) * dt) / (T.r * Math.PI / 2 + 1));
    const h = T.h0 + (T.h1 - T.h0) * T.t;
    // the point on the arc: start angle (from the centre) is perpendicular to the heading
    const a0 = Math.atan2(T.s[1] - T.c[1], T.s[0] - T.c[0]), a1 = Math.atan2(T.e[1] - T.c[1], T.e[0] - T.c[0]);
    let da = a1 - a0; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2;
    const a = a0 + da * T.t;
    v.s.setPosition(T.c[0] + Math.cos(a) * T.r, T.c[1] + Math.sin(a) * T.r);
    const f = faceOf(h, v.kind !== 'bike');
    if (v.kind === 'bike') { const sp = v.s as Phaser.GameObjects.Sprite; const k = `${v.base}_${f}`; if (sp.anims.currentAnim?.key !== k) sp.play(k); }
    else (v.s as Phaser.GameObjects.Image).setFrame(`${v.base}_${f}`);
    if (T.t >= 1) {
      v.lane = T.to; v.turning = undefined; v.off = 0; v.after = T;
      v.s.setPosition(T.e[0], T.e[1]);
      if (v.kind !== 'bike') (v.s as Phaser.GameObjects.Image).setFrame(`${v.base}_${face(T.to)}`);
    }
  }

  private posOf(v: Vehicle) { return v.lane.axis === 'x' ? v.s.x : v.s.y; }

  /** a point `d` px along a turn's route (negative = still on the first street, past the arc = the second) */
  private routeAt(T: Turn, d: number): [number, number] {
    const arc = (T.r * Math.PI) / 2;
    if (d <= 0) return [T.s[0] + T.d1[0] * d, T.s[1] + T.d1[1] * d];
    if (d >= arc) return [T.e[0] + T.d2[0] * (d - arc), T.e[1] + T.d2[1] * (d - arc)];
    const a0 = Math.atan2(T.s[1] - T.c[1], T.s[0] - T.c[0]), a1 = Math.atan2(T.e[1] - T.c[1], T.e[0] - T.c[0]);
    let da = a1 - a0; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2;
    const a = a0 + (da * d) / arc;
    return [T.c[0] + Math.cos(a) * T.r, T.c[1] + Math.sin(a) * T.r];
  }

  /** lay the three sections of a turning streetcar along its route, each with the facing of its own stretch */
  private placeParts(v: Vehicle) {
    const T = v.turning ?? v.plan ?? v.after, parts = v.parts!;
    if (!T) return;
    const arc = (T.r * Math.PI) / 2;
    const dc = v.turning ? T.t * arc : v.plan ? (this.posOf(v) - (v.lane.axis === 'x' ? T.s[0] : T.s[1])) * v.lane.dir : arc + (this.posOf(v) - (v.lane.axis === 'x' ? T.e[0] : T.e[1])) * v.lane.dir;
    parts.forEach((im, i) => {
      const d = dc + SC_OFF[i], [x, y] = this.routeAt(T, d), a = this.routeAt(T, d - 9), b = this.routeAt(T, d + 9);
      const key = `scsec_${'rmf'[i]}_${faceOf(Math.atan2(b[1] - a[1], b[0] - a[0]), true)}`;
      if (im.frame.name !== key) { im.setFrame(key); const pv = this.manifest.pivots[key]; if (pv) im.setOrigin(pv.x, pv.y); }
      im.setPosition(Math.round(x), Math.round(y)).setDepth(y + 2);
    });
    // the whole car is out of the corner: back to the one-piece sprite
    if (v.after && dc + SC_OFF[0] > arc + 12) { parts.forEach((im) => im.destroy()); v.parts = undefined; v.after = undefined; v.s.setVisible(true); }
  }

  update(dtMs: number, px: number, py: number) {
    const dt = dtMs / 1000;
    this.signalT += dt;
    if (this.signalT > (this.ewGreen ? 10 : 6)) { this.signalT = 0; this.ewGreen = !this.ewGreen; }

    this.jamT += dt;
    for (const st of this.states) {
      const l = st.lane;
      if (!this.active(l) || l.noSpawn) continue;
      st.t -= dt * (l.bikeOnly ? 1 : this.density);
      if (st.t <= 0) {
        let kind: Kind = l.bikeOnly ? 'bike' : 'car';
        // brave cyclists in mixed traffic before there's anywhere safer to ride
        if (l.cyclists === 'mixed' && !this.protectedLanes && Math.random() < 0.18) kind = 'bike';
        this.spawn(l, undefined, kind);
        st.t = l.bikeOnly ? 2.2 + Math.random() * 2.5 : l.elevated ? 1.8 + Math.random() * 1.6 : l.axis === 'y' ? (l.light ? 9 : 5) + Math.random() * 4 : 2.6 + Math.random() * 3;
      }
      if (l.streetcar) { st.scT -= dt; if (st.scT <= 0) { this.spawn(l, undefined, 'streetcar'); st.scT = 24 + Math.random() * 12; } }
    }

    for (const v of this.vehicles) {
      if (v.turning) { this.steer(v, dt); v.s.setDepth(v.s.y + 2); if (v.parts) this.placeParts(v); continue; }
      const l = v.lane, pos = this.posOf(v), front = pos + (l.dir * v.len) / 2;
      let target = v.speed;
      // its corner is here: start the turn
      if (v.plan && (pos - (l.axis === 'x' ? v.plan.s[0] : v.plan.s[1])) * l.dir >= 0) { v.turning = v.plan; v.plan = undefined; this.steer(v, dt); continue; }
      const brakeTo = (stopAt: number, k = 2.5) => { const dist = (stopAt - front) * l.dir; if (dist > -4 && dist < 44) target = Math.min(target, Math.max(0, dist - 2) * k); };
      // signals (bikes in protected lanes obey them too)
      const priority = v.kind === 'streetcar' && this.has(l.priority); // TSP: the light waits for the streetcar
      // the Gardiner: no lights, but a jam builds up at a choke point now and then, and clears
      if (l.elevated && this.jammed) brakeTo(l.dir === 1 ? this.mapW * 0.62 : this.mapW * 0.38, 1.6);
      for (const it of this.intersections) {
        if (priority || l.elevated) break;
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
      const lat = l.elevated ? 999 : l.axis === 'x' ? Math.abs(py - (l.pos + v.off)) : Math.abs(px - (l.pos + v.off));
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
      v.s.setDepth(l.under ? underDepth(v.s.y) : l.elevated ? ELEVATED_DEPTH + 1 + v.s.y / 100000 : v.s.y + 2);
      if (v.kind === 'bike') (v.s as Phaser.GameObjects.Sprite).anims.timeScale = Math.max(0.05, v.v / 45);
      if (v.parts) this.placeParts(v);
    }
    // despawn
    this.vehicles = this.vehicles.filter((v) => {
      const p = this.posOf(v), [a, b] = this.span(v.lane);
      if (p < a - v.len * 1.5 || p > b + v.len * 1.5) { v.s.destroy(); v.parts?.forEach((im) => im.destroy()); return false; }
      return true;
    });
  }

  private near(v: Vehicle, px: number, py: number) { return Math.abs(v.s.x - px) < 260 && Math.abs(v.s.y - py) < 160; }

  /** Thin cars (used when the city improves). */
  setDensity(d: number) { this.density = d; }
  get count() { return this.vehicles.length; }
}
