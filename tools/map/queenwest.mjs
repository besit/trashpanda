// Queen West district: Queen St W (501) at the bottom, Trinity Bellwoods Park in the middle,
// Dundas St W (505) at the top; Ossington Ave (west) and Bellwoods Ave (east) cross it,
// Strachan Ave runs south from the park gates. Fictionalized but geographically faithful:
// the real park does sit between Queen and Dundas, with its gates facing Strachan.
// Output is data only; images are built in build-assets.
import { rng } from '../lib/rng.mjs';
import { obliqueBuilding } from '../sprites/buildings.mjs';
import { GATE_W, tbGateSolids } from '../sprites/park.mjs';

export const W = 104, H = 76, TS = 16;

// --- layout constants (tile units) ---
export const OX = 8;    // Ossington Ave cols 8..11
export const BX = 88;   // Bellwoods Ave cols 88..91
export const SX = 50;   // Strachan Ave cols 50..53 (south of Queen only)
export const DUNDAS = 11; // Dundas rows 11..14 (11 parking/curb lane, 12 WB tracks, 13 EB tracks, 14 curb lane)
export const QUEEN = 54;  // Queen rows 54..57 (54 parking, 55 WB tracks, 56 EB tracks, 57 parking)
const PARK = { x0: 24, x1: 79, y0: 18, y1: 50 }; // inclusive tile bounds of the lawn
const GATE_X = (SX + 2) * TS; // gates centred on Strachan

export function generateQueenWest() {
  const r = rng(2026);
  const ground = Array.from({ length: H }, () => Array(W).fill('grass0'));
  const set = (x, y, name) => { if (x >= 0 && y >= 0 && x < W && y < H) ground[y][x] = name; };
  const get = (x, y) => ground[y]?.[x];
  const objects = [];
  const decals = [];
  const prop = (key, px, py, extra = {}) => objects.push({ type: 'prop', key, x: Math.round(px), y: Math.round(py), ...extra });
  const tprop = (key, tx, ty, ox = 8, oy = 12, extra = {}) => prop(key, tx * TS + ox, ty * TS + oy, extra);
  const isNS = (x) => (x >= OX && x <= OX + 3) || (x >= BX && x <= BX + 3);

  // ---------- base ground ----------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) set(x, y, `grass${(x * 7 + y * 3) % 3}`);
  for (let y = 0; y < 8; y++) for (let x = 0; x < W; x++) set(x, y, y < 3 ? 'laneway' : `grass${(x + y) % 3}`);

  // ---------- an E-W street with streetcar tracks ----------
  const ewStreet = (row, { parkingN = 'parking_n', parkingS = 'parking' } = {}) => {
    for (let x = 0; x < W; x++) {
      set(x, row - 3, `sidewalk${x % 3}`); set(x, row - 2, `sidewalk${(x + 1) % 3}`); set(x, row - 1, 'curb_n');
      set(x, row, x % 7 === 3 ? parkingN : 'asphalt' + (x % 4));
      set(x, row + 1, `tracks${x % 2}`); set(x, row + 2, `tracks${(x + 1) % 2}`);
      set(x, row + 3, x % 7 === 3 ? parkingS : 'asphalt' + ((x + 2) % 4));
      set(x, row + 4, 'curb_s'); set(x, row + 5, `sidewalk${x % 3}`); set(x, row + 6, `sidewalk${(x + 2) % 3}`);
    }
  };
  ewStreet(DUNDAS);
  ewStreet(QUEEN);

  // ---------- N-S streets ----------
  const nsStreet = (c, y0, y1) => {
    for (let y = y0; y <= y1; y++) { set(c, y, 'curb_w'); set(c + 1, y, 'road_ns_w'); set(c + 2, y, 'road_ns_e'); set(c + 3, y, 'curb_e'); }
  };
  nsStreet(OX, 0, H - 1);
  nsStreet(BX, 0, H - 1);
  nsStreet(SX, QUEEN + 4, H - 1);
  // intersections: crosswalks + stop bars
  const intersections = [];
  const cross = (c, row, tee = false) => {
    for (let y = row; y <= row + 3; y++) {
      if (!tee || true) { set(c, y, 'zebra_ns'); set(c + 3, y, 'zebra_ns'); }
      set(c + 1, y, y === row + 1 || y === row + 2 ? `tracks${y % 2}` : 'asphalt1');
      set(c + 2, y, y === row + 1 || y === row + 2 ? `tracks${(y + 1) % 2}` : 'asphalt2');
    }
    // crosswalks over the N-S street sit in the sidewalk band, stop bars just before them
    if (!tee) { set(c + 1, row - 2, 'zebra_ew'); set(c + 2, row - 2, 'zebra_ew'); set(c + 1, row - 3, 'road_ns_w_stop'); }
    set(c + 1, row + 5, 'zebra_ew'); set(c + 2, row + 5, 'zebra_ew'); set(c + 2, row + 6, 'road_ns_e_stop');
    intersections.push({ x0: c * TS, x1: (c + 4) * TS, y0: row * TS, y1: (row + 4) * TS, tee });
    for (const [sx, sy, oy] of [[c - 1, row - 1, 10], [c + 4, row - 1, 10], [c - 1, row + 4, 6], [c + 4, row + 4, 6]]) {
      if (tee && sy === row - 1) continue;
      tprop('signal', sx, sy, 8, oy);
    }
  };
  cross(OX, DUNDAS); cross(BX, DUNDAS); cross(OX, QUEEN); cross(BX, QUEEN);
  cross(SX, QUEEN, true);
  // the park side of Queen has no curb cut at Strachan: the gates sit there
  for (const c of [SX, SX + 3]) for (let y = QUEEN; y <= QUEEN + 3; y++) set(c, y, 'zebra_ns');
  for (const x of [SX + 1, SX + 2]) for (let y = QUEEN; y <= QUEEN + 3; y++) set(x, y, y === QUEEN + 1 || y === QUEEN + 2 ? `tracks${(x + y) % 2}` : 'asphalt3');

  // ---------- Trinity Bellwoods Park ----------
  for (let y = PARK.y0 - 1; y <= PARK.y1 + 1; y++) for (let x = PARK.x0 - 2; x <= PARK.x1 + 2; x++) set(x, y, `lawn${(x * 5 + y * 11) % 3}`);
  // side sidewalks (Crawford-ish on the west, Gore Vale-ish on the east)
  for (let y = DUNDAS + 5; y <= QUEEN - 1; y++) { for (const x of [PARK.x0 - 2, PARK.x1 + 2]) set(x, y, `sidewalk${y % 3}`); }
  // paths (drawn as one smooth decal; listed here so walkers + the minimap can use them)
  const P = (pts) => pts.map(([x, y]) => [x * TS, y * TS]);
  const parkPaths = [
    P([[52, 51], [52, 46], [48, 41], [44.5, 34], [41, 26], [38.5, 17.5]]),          // gates -> Dundas (main walk)
    P([[52, 46], [59, 42.5], [67, 37.5], [74, 33], [81, 31]]),                     // gates -> east side
    P([[22, 33.5], [33, 33.5], [44.5, 34]]),                                       // west entrance
    P([[44.5, 34], [52, 31.5], [60, 30.5], [66, 25], [69, 17.5]]),                 // past the bowl -> Dundas
    P([[22, 47], [34, 46], [48, 41]]),                                             // south-west
    P([[60, 30.5], [70, 30], [81, 31]]),
  ];
  decals.push({ key: 'park_paths', x: (PARK.x0 - 2) * TS, y: (PARK.y0 - 1) * TS, gen: { kind: 'paths', w: (PARK.x1 - PARK.x0 + 5) * TS, h: (PARK.y1 - PARK.y0 + 3) * TS, paths: parkPaths, ox: (PARK.x0 - 2) * TS, oy: (PARK.y0 - 1) * TS } });
  const bowl = { x: 46 * TS, y: 20 * TS, w: 176, h: 112 };
  decals.push({ key: 'dogbowl', x: bowl.x, y: bowl.y });
  const diamond = { x: 26 * TS, y: 19 * TS, w: 96, h: 96 };
  decals.push({ key: 'diamond', x: diamond.x, y: diamond.y });
  const courts = { x: 69 * TS, y: 37 * TS, w: 86, h: 93 };
  decals.push({ key: 'tennis', x: courts.x, y: courts.y });
  // the gates (solid only at the piers so you can ride through the carriage + pedestrian gates)
  prop('tbgates', GATE_X, (QUEEN - 3) * TS + 2, { solids: tbGateSolids(), landmark: 'TRINITY BELLWOODS GATES' });

  // trees: dense but leaving paths, decals and the gate approach clear
  const nearPath = (px, py, d) => parkPaths.some((pts) => pts.some((p, i) => {
    if (i === 0) return false;
    const [ax, ay] = pts[i - 1], [bx, by] = p, vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t)) < d;
  }));
  const inRect = (px, py, o, pad) => px > o.x - pad && px < o.x + o.w + pad && py > o.y - pad && py < o.y + o.h + pad;
  const blocked = (px, py) => nearPath(px, py, 20) || inRect(px, py, bowl, 10) || inRect(px, py, diamond, 8) || inRect(px, py, courts, 10) || Math.hypot(px - GATE_X, py - (QUEEN - 3) * TS) < 70;
  const trees = [];
  for (let i = 0; i < 900 && trees.length < 64; i++) {
    const px = r.int((PARK.x0) * TS, (PARK.x1 + 1) * TS), py = r.int((PARK.y0 + 1) * TS, (PARK.y1 + 1) * TS);
    if (blocked(px, py) || trees.some(([x, y]) => Math.hypot(x - px, y - py) < 30)) continue;
    trees.push([px, py]);
    prop(r.chance(0.6) ? 'tree_a' : r.chance(0.5) ? 'tree_b' : 'tree_c', px, py, { solid: 5 });
  }
  // a line of big trees along Queen + Dundas park edges
  for (let x = PARK.x0; x <= PARK.x1; x += 4) {
    if (Math.abs(x * TS + 8 - GATE_X) < 80) continue;
    prop('tree_a', x * TS + 8, (QUEEN - 4) * TS + 12, { solid: 5 });
    if (!nearPath(x * TS + 8, (PARK.y0) * TS, 22)) prop('tree_b', x * TS + 8, PARK.y0 * TS + 4, { solid: 5 });
  }
  // lamps + benches + bins along the paths
  parkPaths.forEach((pts, pi) => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
      for (let d = 40; d < len - 20; d += 96) {
        const t = d / len, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, side = (i + pi) % 2 ? 1 : -1;
        prop('parklamp', x + nx * 12 * side, y + ny * 12 * side);
        if ((i + Math.round(d)) % 3 === 0) { prop('bench', x - nx * 14 * side, y - ny * 14 * side + 4); prop('bin_green', x - nx * 14 * side + 14, y - ny * 14 * side + 4); }
      }
    }
  });

  // ---------- buildings ----------
  const bricksQueen = ['red', 'buff', 'teal', 'darkred', 'red', 'lilac', 'buff', 'grey', 'mustard', 'cream'];
  const bricksDundas = ['azulejo', 'red', 'azulejo_g', 'cream', 'mustard', 'azulejo', 'teal', 'buff', 'lilac', 'darkred'];
  let bid = 0;
  const addBuilding = (x, w, gen, place) => {
    const b = obliqueBuilding(gen);
    const imgH = b.img.h, d = gen.d;
    const base = place.base ?? place.top + imgH; // facade bottom (px)
    objects.push({ type: 'building', key: `bld_${bid}`, gen, x, y: base - d, w, d, imgH });
    bid++;
    return { top: base - imgH, base };
  };
  /** A row of buildings between tile cols [x0, x1). Either aligned at the facade base or at the roof top. */
  const row = (x0, x1, align, kind, floorsPick, bricks, d = 48) => {
    let x = x0; const out = [];
    while (x < x1) {
      let w = r.pick([2, 3, 3, 4]);
      if (x + w > x1) w = x1 - x;
      if (w < 2) { if (out.length) break; w = 2; }
      const gen = { w: w * TS, d, floors: r.pick(floorsPick), brick: r.pick(bricks), seed: 500 + bid, kind, murals: kind === 'rear' };
      out.push(addBuilding(x * TS, w * TS, gen, align));
      x += w;
    }
    return out;
  };
  const strips = [[0, OX], [OX + 4, BX], [BX + 4, W]];
  // Dundas north side: Little Portugal shops + tiled houses (facades on the sidewalk)
  for (const [a, b] of strips) row(a, b, { base: (DUNDAS - 3) * TS }, 'shop', [1, 2, 2], bricksDundas);
  // Queen north side, west + east of the park
  for (const [a, b] of [[0, OX], [OX + 4, PARK.x0 - 2], [PARK.x1 + 3, BX], [BX + 4, W]]) row(a, b, { base: (QUEEN - 3) * TS }, 'shop', [1, 2, 2, 3], bricksQueen);
  // blocks between Dundas and Queen beside the park: houses facing south
  for (const [a, b] of [[0, OX], [OX + 4, PARK.x0 - 2], [PARK.x1 + 3, BX], [BX + 4, W]]) {
    row(a, b, { top: (DUNDAS + 7) * TS }, 'house', [1, 2], bricksDundas, 40);
    row(a, b, { base: 38 * TS }, 'house', [1, 2], ['red', 'buff', 'darkred', 'cream', 'grey'], 40);
    for (let y = 38; y < 44; y++) for (let x = a; x < b; x++) if (!isNS(x)) set(x, y, y === 38 ? `sidewalk${x % 3}` : `grass${(x + y) % 3}`);
  }
  // Queen south side: shop backs onto the graffiti laneway (roofs start right behind the sidewalk)
  let laneTop = 0;
  for (const [a, b] of [[0, OX], [OX + 4, SX], [SX + 4, BX], [BX + 4, W]]) {
    for (const o of row(a, b, { top: (QUEEN + 7) * TS }, 'rear', [1, 1, 2], bricksQueen, 48)) laneTop = Math.max(laneTop, o.base);
  }
  const laneRow = Math.ceil(laneTop / TS);
  for (let y = QUEEN + 7; y < H; y++) for (let x = 0; x < W; x++) {
    if (isNS(x) || (x >= SX && x <= SX + 3)) continue;
    if (y < laneRow + 2) set(x, y, 'laneway');
    else set(x, y, `grass${(x * 3 + y) % 3}`);
  }
  for (let y = laneRow; y < laneRow + 2; y++) for (const c of [OX, BX, SX]) for (const dx of [0, 3]) set(c + dx, y, 'laneway');
  // backyards south of the lane: fences + bins + trees
  for (let x = 1; x < W - 1; x += 5) {
    if (isNS(x) || (x >= SX - 1 && x <= SX + 4)) continue;
    if (x % 10 === 1) tprop('tree_b', x, laneRow + 4, 8, 10, { solid: 4 });
    else { tprop('bin_green', x, laneRow + 2, 4, 4); tprop('bin_blue', x, laneRow + 2, 12, 4); }
  }

  // ---------- street furniture ----------
  const furnish = (row, side, x0, x1) => { // side: 'n' (north sidewalk of a street at `row`) or 's'
    for (let x = x0; x < x1; x++) {
      if (isNS(x) || isNS(x - 1) || isNS(x + 1)) continue;
      const sy = side === 'n' ? row - 2 : row + 5;
      if (x % 6 === 2) { set(x, sy, 'treepit'); tprop(r.chance(0.5) ? 'tree_a' : 'tree_b', x, sy, 8, 10, { solid: 4 }); }
      if (x % 8 === 5) tprop('streetlight', x, side === 'n' ? row - 1 : row + 4, 4, side === 'n' ? 8 : 6);
      if (x % 5 === 0) tprop('bikering', x, side === 'n' ? row - 3 : row + 6, 8, 14);
      if (x % 13 === 7) tprop('bench', x, side === 'n' ? row - 3 : row + 6, 8, 13);
      if (x % 11 === 3) tprop('newsbox', x, sy, 12, 6);
      if (x % 17 === 9) tprop('hydrant', x, side === 'n' ? row - 1 : row + 4, 4, 6);
    }
  };
  for (const [a, b] of [[0, PARK.x0 - 2], [PARK.x1 + 3, W]]) furnish(QUEEN, 'n', a, b);
  furnish(QUEEN, 's', 0, W);
  furnish(DUNDAS, 'n', 0, W);
  for (const [a, b] of [[0, PARK.x0 - 2], [PARK.x1 + 3, W]]) furnish(DUNDAS, 's', a, b);
  // along the park on Queen: benches facing the street, a TTC stop at Strachan
  for (let x = PARK.x0; x <= PARK.x1; x += 7) if (Math.abs(x * TS - GATE_X) > 90) { tprop('bench', x, QUEEN - 3, 8, 13); tprop('bin_green', x + 1, QUEEN - 3, 6, 13); }
  for (let x = PARK.x0 + 3; x <= PARK.x1; x += 8) tprop('streetlight', x, QUEEN - 1, 4, 8);
  // TTC stops (streetcars stop here)
  const stops = {
    queen_wb: [(SX - 1) * TS], queen_eb: [(SX + 5) * TS],
    dundas_wb: [(OX - 1) * TS, (BX - 1) * TS], dundas_eb: [(OX + 5) * TS, (BX + 5) * TS],
  };
  tprop('ttcstop', SX - 2, QUEEN - 1, 8, 8);
  tprop('ttcstop', SX + 5, QUEEN + 4, 8, 6);
  for (const c of [OX, BX]) { tprop('ttcstop', c - 2, DUNDAS - 1, 8, 8); tprop('ttcstop', c + 5, DUNDAS + 4, 8, 6); }

  // ---------- parked cars (Queen's parking lanes become bike lanes after the mission) ----------
  const COLORS = ['blue', 'red', 'white', 'yellow', 'teal', 'orange'];
  const park = (row, face, tag, avoid) => {
    for (let x = 1; x < W - 2;) {
      const px = x * TS + 8;
      if (isNS(x) || isNS(x + 1) || isNS(x + 2) || avoid.some(([a, b]) => px > a && px < b) || r.chance(0.55)) { x += r.int(1, 3); continue; }
      const key = r.chance(0.18) ? `suv_${face}` : `car_${r.pick(COLORS)}_${face}`;
      prop(key, px + 10, row * TS + 10, { solidBox: [-15, -6, 30, 10], tag });
      x += 3;
    }
  };
  const stopZone = (xs) => xs.map((s) => [s - 112, s + 24]);
  park(QUEEN, 'W', 'parked', [...stopZone(stops.queen_wb), [(SX - 1) * TS, (SX + 5) * TS]]);
  park(QUEEN + 3, 'E', 'parked', [...stopZone(stops.queen_eb).map(([a, b]) => [a - 24 + 112 - 24, b + 112]), [(SX - 1) * TS, (SX + 5) * TS]]);
  park(DUNDAS, 'W', undefined, stopZone(stops.dundas_wb));
  park(DUNDAS + 3, 'E', undefined, stopZone(stops.dundas_eb));

  // ---------- the civic upgrade: protected bike lanes replace Queen's parking lanes ----------
  const imp = { tiles: [], addProps: [], removeTag: 'parked' };
  for (let x = 0; x < W; x++) {
    if (isNS(x)) continue;
    imp.tiles.push([x, QUEEN, x % 12 === 5 ? 'bikelane_protected_n_stencil' : 'bikelane_protected_n']);
    if (x >= SX && x <= SX + 3) continue; // Strachan T: keep the crosswalk
    imp.tiles.push([x, QUEEN + 3, x % 12 === 9 ? 'bikelane_protected_stencil' : 'bikelane_protected']);
  }
  for (let x = 2; x < W; x += 6) {
    if (isNS(x) || isNS(x - 1) || isNS(x + 1)) continue;
    // planters sit ON the separator, i.e. the traffic side of each lane
    imp.addProps.push({ type: 'prop', key: 'planter', x: x * TS + 8, y: (QUEEN + 1) * TS - 1 });
    if (x >= SX - 1 && x <= SX + 4) continue;
    imp.addProps.push({ type: 'prop', key: 'planter', x: x * TS + 8, y: (QUEEN + 3) * TS + 4 });
  }

  // ---------- traffic + walkers ----------
  const lanes = [
    { id: 'queen_wb', axis: 'x', dir: -1, pos: (QUEEN + 1) * TS + 8, streetcar: true, stops: stops.queen_wb, cyclists: 'mixed' },
    { id: 'queen_eb', axis: 'x', dir: 1, pos: (QUEEN + 2) * TS + 8, streetcar: true, stops: stops.queen_eb, cyclists: 'mixed' },
    { id: 'queen_bike_wb', axis: 'x', dir: -1, pos: QUEEN * TS + 7, bikeOnly: true, requires: 'queen_protected_lanes' },
    { id: 'queen_bike_eb', axis: 'x', dir: 1, pos: (QUEEN + 3) * TS + 9, bikeOnly: true, requires: 'queen_protected_lanes' },
    { id: 'dundas_wb', axis: 'x', dir: -1, pos: (DUNDAS + 1) * TS + 8, streetcar: true, stops: stops.dundas_wb },
    { id: 'dundas_eb', axis: 'x', dir: 1, pos: (DUNDAS + 2) * TS + 8, streetcar: true, stops: stops.dundas_eb },
    { id: 'oss_sb', axis: 'y', dir: 1, pos: (OX + 1) * TS + 8 },
    { id: 'oss_nb', axis: 'y', dir: -1, pos: (OX + 2) * TS + 8 },
    { id: 'bell_sb', axis: 'y', dir: 1, pos: (BX + 1) * TS + 8, light: true },
    { id: 'bell_nb', axis: 'y', dir: -1, pos: (BX + 2) * TS + 8, light: true },
  ];
  const walkways = [
    [[0, (QUEEN - 2) * TS + 6], [W * TS, (QUEEN - 2) * TS + 6]],
    [[0, (QUEEN + 5) * TS + 10], [W * TS, (QUEEN + 5) * TS + 10]],
    [[0, (DUNDAS - 2) * TS + 6], [W * TS, (DUNDAS - 2) * TS + 6]],
    [[0, (DUNDAS + 5) * TS + 10], [W * TS, (DUNDAS + 5) * TS + 10]],
    [[OX * TS + 5, 0], [OX * TS + 5, H * TS]], [[(OX + 3) * TS + 11, 0], [(OX + 3) * TS + 11, H * TS]],
    [[BX * TS + 5, 0], [BX * TS + 5, H * TS]], [[(BX + 3) * TS + 11, 0], [(BX + 3) * TS + 11, H * TS]],
    ...parkPaths,
  ];

  const labels = [
    { text: 'QUEEN ST W', x: 30 * TS, y: (QUEEN + 2) * TS },
    { text: 'DUNDAS ST W', x: 30 * TS, y: (DUNDAS + 2) * TS },
    { text: 'OSSINGTON', x: (OX + 2) * TS, y: 33 * TS, vertical: true },
    { text: 'BELLWOODS', x: (BX + 2) * TS, y: 33 * TS, vertical: true },
    { text: 'STRACHAN', x: (SX + 2) * TS, y: 69 * TS, vertical: true },
    { text: 'TRINITY BELLWOODS', x: 52 * TS, y: 37 * TS, kind: 'landmark' },
    { text: 'DOG BOWL', x: 52 * TS, y: 23.5 * TS, kind: 'landmark' },
    { text: 'GATES', x: 52 * TS, y: 49 * TS, kind: 'landmark' },
    { text: 'GRAFFITI LANE', x: 30 * TS, y: (laneRow + 1) * TS, kind: 'landmark' },
  ];

  return {
    width: W, height: H, tileSize: TS, ground, objects, decals,
    improvements: { queen_protected_lanes: imp },
    spawn: { x: 45 * TS + 8, y: (QUEEN - 2) * TS + 8 },
    markers: [{ id: 'bike_lane_war', x: 62 * TS, y: (QUEEN - 2) * TS + 8, label: 'THE BIKE LANE WAR' }],
    lanes, intersections, walkways, labels,
    critters: [{ kind: 'white_squirrel', x: bowl.x + bowl.w + 30, y: bowl.y + 70 }],
    landmarks: [{ id: 'tb_gates', x: GATE_X, y: (QUEEN - 3) * TS - 10, label: 'TRINITY BELLWOODS GATES', fact: 'THE OLD GATES OF TRINITY COLLEGE, WHICH STOOD HERE FROM 1852 TO 1925. THE COLLEGE MOVED; THE GATES STAYED.' }],
  };
}
