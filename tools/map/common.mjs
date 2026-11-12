// Shared district-map toolkit: ground painting, streets, intersections, building rows, street furniture,
// parked cars. Every district generator builds on one `District` so streets, curbs and crosswalks match
// at district edges (streets continue across the seam at the same rows).
import { rng } from '../lib/rng.mjs';
import { anyBuilding } from '../sprites/anybuilding.mjs';
import { graffitiPieces } from '../sprites/park.mjs';

export const TS = 16;
export const GRAF = graffitiPieces();
export const CAR_COLORS = ['blue', 'red', 'white', 'yellow', 'teal', 'orange'];

export class District {
  constructor(id, W, H, seed) {
    this.id = id; this.W = W; this.H = H;
    this.r = rng(seed);
    this.ground = Array.from({ length: H }, () => Array(W).fill('grass0'));
    this.objects = []; this.decals = []; this.intersections = []; this.lanes = []; this.walkways = [];
    this.labels = []; this.landmarks = []; this.critters = []; this.markers = []; this.exits = [];
    this.improvements = {};
    this.nsCols = []; // [c0, c1] inclusive tile spans of N-S streets (furniture + parking avoid them)
    this.bid = 0;
  }
  set(x, y, name) { if (x >= 0 && y >= 0 && x < this.W && y < this.H) this.ground[y][x] = name; }
  get(x, y) { return this.ground[y]?.[x]; }
  fill(x0, y0, x1, y1, fn) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, typeof fn === 'function' ? fn(x, y) : fn); }
  prop(key, px, py, extra = {}) { const o = { type: 'prop', key, x: Math.round(px), y: Math.round(py), ...extra }; this.objects.push(o); return o; }
  tprop(key, tx, ty, ox = 8, oy = 12, extra = {}) { return this.prop(key, tx * TS + ox, ty * TS + oy, extra); }
  isNS(x) { return this.nsCols.some(([a, b]) => x >= a && x <= b); }

  /** E-W street, 4 lanes deep at rows row..row+3 with sidewalks 3 above / 3 below. tracks: streetcar rails in the middle lanes. */
  ewStreet(row, { tracks = true, parkingN = 'parking_n', parkingS = 'parking', x0 = 0, x1 = this.W - 1 } = {}) {
    for (let x = x0; x <= x1; x++) {
      this.set(x, row - 3, `sidewalk${x % 3}`); this.set(x, row - 2, `sidewalk${(x + 1) % 3}`); this.set(x, row - 1, 'curb_n');
      this.set(x, row, x % 7 === 3 ? parkingN : 'asphalt' + (x % 4));
      if (tracks) { this.set(x, row + 1, `tracks${x % 2}`); this.set(x, row + 2, `tracks${(x + 1) % 2}`); }
      else { this.set(x, row + 1, 'road_ew_n'); this.set(x, row + 2, 'road_ew_s'); }
      this.set(x, row + 3, x % 7 === 3 ? parkingS : 'asphalt' + ((x + 2) % 4));
      this.set(x, row + 4, 'curb_s'); this.set(x, row + 5, `sidewalk${x % 3}`); this.set(x, row + 6, `sidewalk${(x + 2) % 3}`);
    }
  }
  /** N-S street at cols c..c+3 (curb, 2 lanes, curb). tracks: rails in both lanes. */
  nsStreet(c, y0, y1, { tracks = false } = {}) {
    this.nsCols.push([c, c + 3]);
    for (let y = y0; y <= y1; y++) {
      this.set(c, y, 'curb_w'); this.set(c + 3, y, 'curb_e');
      this.set(c + 1, y, tracks ? 'tracks_ns_w' : 'road_ns_w'); this.set(c + 2, y, tracks ? 'tracks_ns_e' : 'road_ns_e');
    }
  }
  /** Signalised intersection of the N-S street at col c with the E-W street at `row`. */
  cross(c, row, { tee = false, nsTracks = false, ewTracks = true } = {}) {
    for (let y = row; y <= row + 3; y++) {
      this.set(c, y, 'zebra_ns'); this.set(c + 3, y, 'zebra_ns');
      const mid = y === row + 1 || y === row + 2;
      for (const dx of [1, 2]) {
        const tr = ewTracks && mid;
        this.set(c + dx, y, tr && nsTracks ? 'tracks_x' : tr ? `tracks${(y + dx - 1) % 2}` : nsTracks ? (dx === 1 ? 'tracks_ns_w' : 'tracks_ns_e') : `asphalt${dx}`);
      }
    }
    if (!tee) { this.set(c + 1, row - 2, 'zebra_ew'); this.set(c + 2, row - 2, 'zebra_ew'); this.set(c + 1, row - 3, nsTracks ? 'tracks_ns_w' : 'road_ns_w_stop'); }
    this.set(c + 1, row + 5, 'zebra_ew'); this.set(c + 2, row + 5, 'zebra_ew'); this.set(c + 2, row + 6, nsTracks ? 'tracks_ns_e' : 'road_ns_e_stop');
    this.intersections.push({ x0: c * TS, x1: (c + 4) * TS, y0: row * TS, y1: (row + 4) * TS, tee });
    for (const [sx, sy, oy] of [[c - 1, row - 1, 10], [c + 4, row - 1, 10], [c - 1, row + 4, 6], [c + 4, row + 4, 6]]) {
      if (tee && sy === row - 1) continue;
      this.tprop('signal', sx, sy, 8, oy);
    }
  }

  addBuilding(x, w, gen, place, { graffiti = gen.kind === 'rear' ? [1, 3] : null } = {}) {
    const b = anyBuilding(gen);
    const imgH = b.img.h, d = gen.d;
    const base = place.base ?? place.top + imgH; // facade bottom (px)
    this.objects.push({ type: 'building', key: `bld_${this.id}_${this.bid}`, gen, x, y: base - d, w, d, imgH });
    this.bid++;
    // graffiti from the shared sheet, sprayed over walls (any wall can take it; no graffiti pixels in buildings)
    if (graffiti) {
      const n = this.r.int(graffiti[0], graffiti[1]);
      for (let i = 0; i < n; i++) {
        const k = this.r.int(0, GRAF.length - 1), gw = GRAF[k].w;
        if (gw > w - 4) continue;
        this.objects.push({ type: 'prop', key: `graf_${k}`, x: x + this.r.int(2, w - gw - 2), y: base - this.r.int(2, 5), depth: base + 0.2 });
      }
    }
    return { top: base - imgH, base };
  }
  /** A row of buildings between tile cols [x0, x1), aligned at the facade base or at the roof top. */
  row(x0, x1, align, kind, floorsPick, bricks, d = 48, { widths = [2, 3, 3, 4], graffiti } = {}) {
    let x = x0; const out = [];
    const r = this.r;
    while (x < x1) {
      let w = r.pick(widths);
      if (x + w > x1) w = x1 - x;
      if (w < 2) { if (out.length) break; w = 2; }
      let k = Array.isArray(kind) ? r.pick(kind) : kind;
      if (k === 'queenanne' && w < 3) k = 'baygable'; // a turret needs room
      const gen = { w: w * TS, d, floors: r.pick(floorsPick), brick: r.pick(bricks), seed: 500 + this.bid, kind: k };
      out.push(this.addBuilding(x * TS, w * TS, gen, align, graffiti === undefined ? undefined : { graffiti }));
      x += w;
    }
    return out;
  }

  /** Trees, lights, bike rings, benches, news boxes, hydrants along the sidewalk of the street at `row`. */
  furnish(row, side, x0, x1, { trees = true } = {}) {
    const r = this.r;
    for (let x = x0; x < x1; x++) {
      if (this.isNS(x) || this.isNS(x - 1) || this.isNS(x + 1)) continue;
      const sy = side === 'n' ? row - 2 : row + 5;
      if (trees && x % 6 === 2) { this.set(x, sy, 'treepit'); this.tprop(r.chance(0.5) ? 'tree_a' : 'tree_b', x, sy, 8, 10, { solid: 4 }); }
      if (x % 8 === 5) this.tprop('streetlight', x, side === 'n' ? row - 1 : row + 4, 4, side === 'n' ? 8 : 6);
      if (x % 5 === 0) this.tprop('bikering', x, side === 'n' ? row - 3 : row + 6, 8, 14);
      if (x % 13 === 7) this.tprop('bench', x, side === 'n' ? row - 3 : row + 6, 8, 13);
      if (x % 11 === 3) this.tprop('newsbox', x, sy, 12, 6);
      if (x % 17 === 9) this.tprop('hydrant', x, side === 'n' ? row - 1 : row + 4, 4, 6);
    }
  }

  /** Curb-lane parked cars on `row` facing 'E'|'W'; avoid = [[px0, px1]] (stops, intersections). */
  parkCars(row, face, tag, avoid = [], x0 = 1, x1 = this.W - 2) {
    const r = this.r;
    for (let x = x0; x < x1;) {
      const px = x * TS + 8;
      if (this.isNS(x) || this.isNS(x + 1) || this.isNS(x + 2) || avoid.some(([a, b]) => px > a && px < b) || r.chance(0.55)) { x += r.int(1, 3); continue; }
      const key = r.chance(0.18) ? `suv_${face}` : `car_${r.pick(CAR_COLORS)}_${face}`;
      this.prop(key, px + 10, row * TS + 10, { solidBox: [-15, -6, 30, 10], tag });
      x += 3;
    }
  }

  /** Two-way traffic + sidewalks walkers for an E-W street (ids `${id}_wb|eb`). */
  ewLanes(id, row, extra = {}) {
    this.lanes.push(
      { id: `${id}_wb`, axis: 'x', dir: -1, pos: (row + 1) * TS + 8, ...extra, stops: extra.stopsWB, stopsWB: undefined, stopsEB: undefined },
      { id: `${id}_eb`, axis: 'x', dir: 1, pos: (row + 2) * TS + 8, ...extra, stops: extra.stopsEB, stopsWB: undefined, stopsEB: undefined },
    );
    this.walkways.push([[0, (row - 2) * TS + 6], [this.W * TS, (row - 2) * TS + 6]], [[0, (row + 5) * TS + 10], [this.W * TS, (row + 5) * TS + 10]]);
  }
  nsLanes(id, c, extra = {}, y0 = 0, y1 = this.H) {
    // a street that doesn't run the whole map (John St: Queen -> King) keeps its traffic to its own length
    const range = y0 > 0 || y1 < this.H ? { range: [y0 * TS, y1 * TS] } : {};
    this.lanes.push({ id: `${id}_sb`, axis: 'y', dir: 1, pos: (c + 1) * TS + 8, ...extra, ...range }, { id: `${id}_nb`, axis: 'y', dir: -1, pos: (c + 2) * TS + 8, ...extra, ...range });
    this.walkways.push([[c * TS + 5, y0 * TS], [c * TS + 5, y1 * TS]], [[(c + 3) * TS + 11, y0 * TS], [(c + 3) * TS + 11, y1 * TS]]);
  }
  /**
   * A street that continues into the neighbouring district across the map edge. Exits are matched by
   * street name, not by row (M2.1, Ivan): maps can differ in size and street rows can differ.
   */
  exit(side, row, to, street) { this.exits.push({ side, y0: (row - 3) * TS, y1: (row + 7) * TS, to, street }); }
  /** a N-S street that continues across the north ('n') or south ('s') edge */
  exitNS(side, col, to, street) { this.exits.push({ side, x0: (col - 1) * TS, x1: (col + 5) * TS, to, street }); }

  out(extra = {}) {
    for (const l of this.lanes) { delete l.stopsWB; delete l.stopsEB; if (l.stops === undefined) delete l.stops; }
    return {
      id: this.id, width: this.W, height: this.H, tileSize: TS, ground: this.ground, objects: this.objects, decals: this.decals,
      improvements: this.improvements, markers: this.markers, lanes: this.lanes, intersections: this.intersections,
      walkways: this.walkways, labels: this.labels, critters: this.critters, landmarks: this.landmarks, exits: this.exits, ...extra,
    };
  }
}

/** Catmull-free polyline helpers for park layouts. */
export const nearPolyline = (paths, px, py, d) => paths.some((pts) => pts.some((p, i) => {
  if (i === 0) return false;
  const [ax, ay] = pts[i - 1], [bx, by] = p, vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t)) < d;
}));
export const ellipsePts = (cu, cv, ru, rv, n = 22) => Array.from({ length: n + 1 }, (_, i) => [cu + Math.cos((i / n) * Math.PI * 2) * ru, cv + Math.sin((i / n) * Math.PI * 2) * rv]);
