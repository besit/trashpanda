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
    // M4.3: the bike network (see netEW / netNS): its streets for the city map, their improvements, lanes to calm
    this.network = []; this.netImps = {}; this.slowLanes = {};
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
  cross(c, row, { tee = false, teeS = false, nsTracks = false, ewTracks = true } = {}) {
    for (let y = row; y <= row + 3; y++) {
      this.set(c, y, 'zebra_ns'); this.set(c + 3, y, 'zebra_ns');
      const mid = y === row + 1 || y === row + 2;
      for (const dx of [1, 2]) {
        const tr = ewTracks && mid;
        this.set(c + dx, y, tr && nsTracks ? 'tracks_x' : tr ? `tracks${(y + dx - 1) % 2}` : nsTracks ? (dx === 1 ? 'tracks_ns_w' : 'tracks_ns_e') : `asphalt${dx}`);
      }
    }
    if (!tee) { this.set(c + 1, row - 2, 'zebra_ew'); this.set(c + 2, row - 2, 'zebra_ew'); this.set(c + 1, row - 3, nsTracks ? 'tracks_ns_w' : 'road_ns_w_stop'); }
    // teeS: the street ends here (Spadina, University, Bay at Queens Quay): no south leg
    if (!teeS) { this.set(c + 1, row + 5, 'zebra_ew'); this.set(c + 2, row + 5, 'zebra_ew'); this.set(c + 2, row + 6, nsTracks ? 'tracks_ns_e' : 'road_ns_e_stop'); }
    this.intersections.push({ x0: c * TS, x1: (c + 4) * TS, y0: row * TS, y1: (row + 4) * TS, tee });
    for (const [sx, sy, oy] of [[c - 1, row - 1, 10], [c + 4, row - 1, 10], [c - 1, row + 4, 6], [c + 4, row + 4, 6]]) {
      if ((tee && sy === row - 1) || (teeS && sy === row + 4)) continue;
      this.tprop('signal', sx, sy, 8, oy);
    }
  }

  addBuilding(x, w, gen, place, { graffiti = gen.kind === 'rear' ? [1, 3] : null, tag } = {}) {
    const b = anyBuilding(gen);
    const imgH = b.img.h, d = gen.d;
    const base = place.base ?? place.top + imgH; // facade bottom (px)
    this.objects.push({ type: 'building', key: `bld_${this.id}_${this.bid}`, gen, x, y: base - d, w, d, imgH, ...(tag ? { tag } : {}) });
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
  exit(side, row, to, street, arrive) { this.exits.push({ side, y0: (row - 3) * TS, y1: (row + 7) * TS, to, street, ...(arrive ? { arrive } : {}) }); }
  /** a N-S street that continues across the north ('n') or south ('s') edge. `arrive` (M3.3): the street it lands
   *  on when that's a different one (two streets can lead to the same street on the next map) */
  exitNS(side, col, to, street, arrive) { this.exits.push({ side, x0: (col - 1) * TS, x1: (col + 5) * TS, to, street, ...(arrive ? { arrive } : {}) }); }
  /**
   * M3.3 hidden hearts: a spot under a building's roof, just behind its footprint, so it's hidden until you ride
   * behind the building (which then fades). Picks the building nearest (nx, ny) whose back is open ground.
   */
  hiddenHeart(nx, ny, fallback) {
    const blds = this.objects.filter((o) => o.type === 'building').sort((a, b) => Math.hypot(a.x + a.w / 2 - nx, a.y - ny) - Math.hypot(b.x + b.w / 2 - nx, b.y - ny));
    const blocked = (px, py) => this.objects.some((o) => {
      if (o.type === 'building') return px >= o.x - 2 && px < o.x + o.w + 2 && py >= o.y - 2 && py < o.y + o.d + 2;
      if (o.solidBox) { const [dx, dy, w, h] = o.solidBox; return px >= o.x + dx - 4 && px < o.x + dx + w + 4 && py >= o.y + dy - 4 && py < o.y + dy + h + 4; }
      if (o.solid) return Math.abs(px - o.x) < o.solid + 8 && Math.abs(py - o.y) < o.solid + 8;
      return false;
    });
    for (const b of blds) {
      const px = b.x + Math.round(b.w / 2), py = b.y - 8;
      if (py < b.y + b.d - b.imgH + 6) continue; // still under the roof image
      const tile = this.get(Math.floor(px / TS), Math.floor(py / TS)) ?? '';
      if (!/^(grass|lawn|laneway|lot$)/.test(tile)) continue;
      if ([-7, 0, 7].some((dx) => blocked(px + dx, py)) || blocked(px, py - 7)) continue;
      return { x: px, y: py };
    }
    return fallback;
  }

  // ---------- M4.3: bike share ----------
  /** a 3-tile stretch of sidewalk at `row`, starting at or right of tile x, with nothing standing on it: returns the
   *  dock's anchor (px, bottom centre). Searches outward from x */
  dockSpot(x, row) {
    const clear = (tx) => {
      const x0 = tx * TS - 4, x1 = (tx + 3) * TS + 4, y0 = row * TS - 10, y1 = (row + 1) * TS + 6;
      if (![0, 1, 2].every((i) => /^(sidewalk|plaza|treepit|laneway)/.test(this.get(tx + i, row) ?? '') && !/^treepit/.test(this.get(tx + i, row) ?? ''))) return false;
      return !this.objects.some((o) => (o.type === 'building' ? o.x < x1 && o.x + o.w > x0 && o.y < y1 && o.y + o.d > y0 : o.x > x0 && o.x < x1 && o.y > y0 && o.y < y1));
    };
    for (let d = 0; d < 30; d++) for (const tx of [x + d, x - d]) if (clear(tx)) return { x: (tx + 1.5) * TS, y: row * TS + 13 };
    throw new Error(`${this.id}: no clear dock spot near ${x},${row}`);
  }
  /** the payoff of the Dock Drop on this map: docking stations at these [tile x, row] spots */
  bikeShare(spots) {
    this.improvements.bike_share_grows = { tiles: [], addProps: spots.map(([x, row]) => ({ type: 'prop', key: 'sharedock', ...this.dockSpot(x, row) })) };
  }

  // ---------- M4.3: the bike network ----------
  // Every street in the city ends up either PROTECTED (a curb-separated lane each way) or SLOW (humps and sharrows:
  // cars at walking-and-cycling speed, bikes take the lane). Each street is an improvement `net_<id>` that a
  // mission unlocks (src/data/network.ts) plus a centre line for the city map's network overlay.
  /** is (tile x, row) inside an intersection box */
  inX(x, row) { return this.intersections.some((i) => x * TS >= i.x0 && x * TS < i.x1 && row * TS >= i.y0 && row * TS < i.y1); }
  /** register a street on the network. kind 'protected' | 'slow'; segs: centre lines [x0, y0, x1, y1] (px);
   *  patch: an improvement that already does it (a mission's own payoff); painted: has painted lanes today */
  netStreet(id, name, kind, segs, { patch, painted } = {}) { this.network.push({ id, name, kind, segs, ...(patch ? { patch } : {}), ...(painted ? { painted: true } : {}) }); }
  /** a PROTECTED E-W street at rows row..row+3: its curb lanes become green lanes behind a separator, its parked
   *  cars (tag) drive off, planters go on the separators, and cyclists ride both ways */
  netEW(id, name, row, { x0 = 0, x1 = this.W - 1, tag } = {}) {
    const imp = { tiles: [], addProps: [], ...(tag ? { removeTag: tag } : {}) };
    const curbLane = (t) => /^(asphalt|parking)/.test(t ?? '');
    for (let x = x0; x <= x1; x++) {
      if (!this.inX(x, row) && curbLane(this.get(x, row))) imp.tiles.push([x, row, x % 12 === 5 ? 'bikelane_protected_n_stencil' : 'bikelane_protected_n']);
      if (!this.inX(x, row + 3) && curbLane(this.get(x, row + 3))) imp.tiles.push([x, row + 3, x % 12 === 9 ? 'bikelane_protected_stencil' : 'bikelane_protected']);
      if (x % 6 === 2 && ![x - 1, x, x + 1].some((xx) => this.inX(xx, row + 1)) && curbLane(this.get(x, row)) && curbLane(this.get(x, row + 3))) {
        imp.addProps.push({ type: 'prop', key: 'planter', x: x * TS + 8, y: (row + 1) * TS - 1 }, { type: 'prop', key: 'planter', x: x * TS + 8, y: (row + 3) * TS + 4 });
      }
    }
    this.netImps[`net_${id}`] = imp;
    const range = x0 > 0 || x1 < this.W - 1 ? { range: [x0 * TS, (x1 + 1) * TS] } : {};
    this.lanes.push({ id: `${id}_bike_wb`, axis: 'x', dir: -1, pos: row * TS + 7, bikeOnly: true, requires: `net_${id}`, ...range }, { id: `${id}_bike_eb`, axis: 'x', dir: 1, pos: (row + 3) * TS + 9, bikeOnly: true, requires: `net_${id}`, ...range });
    this.netStreet(id, name, 'protected', [[x0 * TS, (row + 2) * TS, (x1 + 1) * TS, (row + 2) * TS]]);
  }
  /** a N-S street at cols c..c+3 rows y0..y1: PROTECTED (its curb columns become lanes behind a separator) or SLOW
   *  (humps and sharrows in its two lanes; laneIds: its traffic lanes, which get calmed) */
  netNS(id, name, c, kind, { y0 = 0, y1 = this.H - 1, laneIds = [], painted = false } = {}) {
    const imp = { tiles: [], addProps: [] };
    for (let y = y0; y <= y1; y++) {
      if (kind === 'protected') {
        if (/^curb_w(_paint)?$/.test(this.get(c, y) ?? '')) imp.tiles.push([c, y, 'curb_w_bike']);
        if (/^curb_e(_paint)?$/.test(this.get(c + 3, y) ?? '')) imp.tiles.push([c + 3, y, 'curb_e_bike']);
      } else if (this.get(c + 1, y) === 'road_ns_w' && this.get(c + 2, y) === 'road_ns_e' && this.get(c + 1, y - 1) === 'road_ns_w' && this.get(c + 1, y + 1) === 'road_ns_w') {
        if (y % 10 === 3) imp.tiles.push([c + 1, y, 'hump_ns'], [c + 2, y, 'hump_ns']);
        else if (y % 10 === 8) imp.tiles.push([c + 1, y, 'sharrow_ns_w'], [c + 2, y, 'sharrow_ns_e']);
      }
    }
    this.netImps[`net_${id}`] = imp;
    const range = { range: [y0 * TS, (y1 + 1) * TS] };
    if (kind === 'protected' && !painted) this.lanes.push({ id: `${id}_bike_sb`, axis: 'y', dir: 1, pos: c * TS + 11, bikeOnly: true, requires: `net_${id}`, ...range }, { id: `${id}_bike_nb`, axis: 'y', dir: -1, pos: (c + 3) * TS + 4, bikeOnly: true, requires: `net_${id}`, ...range });
    if (kind === 'slow') for (const l of laneIds) this.slowLanes[l] = `net_${id}`;
    this.netStreet(id, name, kind, [[(c + 2) * TS, y0 * TS, (c + 2) * TS, (y1 + 1) * TS]], { painted });
  }
  /** painted bike lanes on a N-S street today (Strachan): the curb columns get a lane line, and cyclists use them */
  paintNS(id, c, y0, y1) {
    for (let y = y0; y <= y1; y++) {
      if (this.get(c, y) === 'curb_w') this.set(c, y, 'curb_w_paint');
      if (this.get(c + 3, y) === 'curb_e') this.set(c + 3, y, 'curb_e_paint');
    }
    const range = { range: [y0 * TS, (y1 + 1) * TS] };
    this.lanes.push({ id: `${id}_bike_sb`, axis: 'y', dir: 1, pos: c * TS + 11, bikeOnly: true, ...range }, { id: `${id}_bike_nb`, axis: 'y', dir: -1, pos: (c + 3) * TS + 4, bikeOnly: true, ...range });
  }

  out(extra = {}) {
    for (const l of this.lanes) { delete l.stopsWB; delete l.stopsEB; if (l.stops === undefined) delete l.stops; if (this.slowLanes[l.id]) { l.slow = this.slowLanes[l.id]; l.cyclists = 'mixed'; } }
    return {
      id: this.id, width: this.W, height: this.H, tileSize: TS, ground: this.ground, objects: this.objects, decals: this.decals,
      improvements: { ...this.improvements, ...this.netImps }, network: this.network, markers: this.markers, lanes: this.lanes, intersections: this.intersections,
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
