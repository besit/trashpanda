// Queen West district: Queen St W (501) at the bottom, Trinity Bellwoods Park in the middle,
// Dundas St W (505) at the top; Ossington Ave (west) and Bellwoods Ave (east) cross it,
// Strachan Ave runs south from the park gates. Fictionalized but geographically faithful:
// the real park does sit between Queen and Dundas, with its gates facing Strachan.
// Output is data only; images are built in build-assets.
import { tbGateSolids } from '../sprites/park.mjs';
import { District, nearPolyline, ellipsePts } from './common.mjs';

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
  const D = new District('queenwest', W, H, 2026);
  const r = D.r;
  const set = (x, y, name) => D.set(x, y, name);
  const decals = D.decals;
  const prop = (...a) => D.prop(...a);
  const tprop = (...a) => D.tprop(...a);
  const isNS = (x) => D.isNS(x);

  // ---------- base ground ----------
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) set(x, y, `grass${(x * 7 + y * 3) % 3}`);
  for (let y = 0; y < 8; y++) for (let x = 0; x < W; x++) set(x, y, y < 3 ? 'laneway' : `grass${(x + y) % 3}`);

  // ---------- streets ----------
  D.ewStreet(DUNDAS);
  D.ewStreet(QUEEN);
  D.nsStreet(OX, 0, H - 1);
  D.nsStreet(BX, 0, H - 1);
  D.nsStreet(SX, QUEEN + 4, H - 1);
  D.cross(OX, DUNDAS); D.cross(BX, DUNDAS); D.cross(OX, QUEEN); D.cross(BX, QUEEN);
  D.cross(SX, QUEEN, { tee: true });
  // the park side of Queen has no curb cut at Strachan: the gates sit there
  for (const c of [SX, SX + 3]) for (let y = QUEEN; y <= QUEEN + 3; y++) set(c, y, 'zebra_ns');
  for (const x of [SX + 1, SX + 2]) for (let y = QUEEN; y <= QUEEN + 3; y++) set(x, y, y === QUEEN + 1 || y === QUEEN + 2 ? `tracks${(x + y) % 2}` : 'asphalt3');
  // Queen and Dundas continue west into High Park / Roncesvalles and east downtown
  D.exit('w', QUEEN, 'highpark'); D.exit('w', DUNDAS, 'highpark');
  D.exit('e', QUEEN, 'downtown'); D.exit('e', DUNDAS, 'downtown');

  // ---------- Trinity Bellwoods Park ----------
  for (let y = PARK.y0 - 1; y <= PARK.y1 + 1; y++) for (let x = PARK.x0 - 2; x <= PARK.x1 + 2; x++) set(x, y, `lawn${(x * 5 + y * 11) % 3}`);
  // side sidewalks (Crawford-ish on the west, Gore Vale-ish on the east)
  for (let y = DUNDAS + 5; y <= QUEEN - 1; y++) { for (const x of [PARK.x0 - 2, PARK.x1 + 2]) set(x, y, `sidewalk${y % 3}`); }
  // Layout follows the Friends of Trinity Bellwoods park map (Ivan's ref), squeezed into our wider-than-tall
  // park: R(u, v) maps the real park's normalized coords (u: Crawford -> Gore Vale, v: Dundas -> Queen).
  const R = (u, v) => [(PARK.x0 - 1.5 + u * (PARK.x1 - PARK.x0 + 3)) * TS, (PARK.y0 - 0.5 + v * (PARK.y1 - PARK.y0 + 1.5)) * TS];
  const P = (pts) => pts.map(([u, v]) => R(u, v));
  const ellipse = ellipsePts;
  const parkPaths = [
    P([[0.505, 1.0], [0.505, 0.895]]),                                              // gates -> the circle
    P(ellipse(0.53, 0.80, 0.19, 0.095)),                                            // the circle (picnic areas 3 + 4)
    P([[0.0, 0.575], [0.33, 0.69], [0.53, 0.80], [0.80, 0.92], [1.0, 0.985]]),      // the long diagonal (Lobb -> Gore Vale/Queen)
    P([[0.36, 0.89], [0.345, 0.70], [0.34, 0.57], [0.33, 0.34], [0.31, 0.18], [0.25, 0.0]]), // west spine -> Dundas
    P([[0.0, 0.565], [0.34, 0.565], [0.72, 0.555]]),                                // the Lobb Ave crossing
    P([[0.33, 0.0], [0.39, 0.22], [0.56, 0.235], [0.74, 0.30], [0.76, 0.45], [0.72, 0.555]]), // field house + east of the dog bowl
    P([[0.74, 0.30], [1.0, 0.17]]),                                                 // to Gore Vale
    P([[0.0, 0.89], [0.20, 0.85], [0.345, 0.80]]),                                  // south-west, past the rec centre
  ];
  decals.push({ key: 'park_paths', x: (PARK.x0 - 2) * TS, y: (PARK.y0 - 1) * TS, gen: { kind: 'paths', w: (PARK.x1 - PARK.x0 + 5) * TS, h: (PARK.y1 - PARK.y0 + 3) * TS, paths: parkPaths, ox: (PARK.x0 - 2) * TS, oy: (PARK.y0 - 1) * TS } });
  const at = (u, v, w, h) => { const [x, y] = R(u, v); return { x: Math.round(x - w / 2), y: Math.round(y - h / 2), w, h }; };
  const bowl = at(0.56, 0.42, 208, 128);           // the dog off-leash bowl
  decals.push({ key: 'dogbowl', x: bowl.x, y: bowl.y });
  const diamond = at(0.64, 0.13, 96, 96);          // Baseball Diamond #1, "Skydome"
  const diamond2 = at(0.87, 0.56, 96, 96);         // Baseball Diamond #2
  decals.push({ key: 'diamond', x: diamond.x, y: diamond.y }, { key: 'diamond', x: diamond2.x, y: diamond2.y });
  const courts = at(0.84, 0.83, 86, 93);           // North + South tennis courts
  decals.push({ key: 'tennis', x: courts.x, y: courts.y });
  // picnic areas, numbered as on the park map
  const picnicSpots = [[0.11, 0.10], [0.60, 0.76], [0.44, 0.835], [0.18, 0.92], [0.37, 0.93], [0.60, 0.955], [0.93, 0.93]].map(([u, v]) => R(u, v));
  // the gates (solid only at the piers so you can ride through the carriage + pedestrian gates)
  prop('tbgates', GATE_X, (QUEEN - 3) * TS + 2, { solids: tbGateSolids(), landmark: 'TRINITY BELLWOODS GATES' });

  // trees: dense but leaving paths, decals and the gate approach clear
  const nearPath = (px, py, d) => nearPolyline(parkPaths, px, py, d);
  const inRect = (px, py, o, pad) => px > o.x - pad && px < o.x + o.w + pad && py > o.y - pad && py < o.y + o.h + pad;
  const blocked = (px, py) => nearPath(px, py, 20) || inRect(px, py, bowl, 10) || inRect(px, py, diamond, 8) || inRect(px, py, diamond2, 8) || inRect(px, py, courts, 10) || picnicSpots.some(([x, y]) => Math.hypot(px - x, py - y) < 34) || Math.hypot(px - GATE_X, py - (QUEEN - 3) * TS) < 70;
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
  // classic green picnic tables, in pairs, at each picnic area
  for (const [x, y] of picnicSpots) { prop('picnic', x - 16, y, { solid: 7 }); prop('picnic_l', x + 18, y + 8, { solid: 7 }); prop('bin_green', x + 2, y - 14); }
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
  const row = (...a) => D.row(...a);
  const strips = [[0, OX], [OX + 4, BX], [BX + 4, W]];
  // Dundas north side: Little Portugal shops + tiled houses (facades on the sidewalk)
  for (const [a, b] of strips) row(a, b, { base: (DUNDAS - 3) * TS }, 'shop', [1, 2, 2], bricksDundas);
  // Queen north side, west + east of the park
  for (const [a, b] of [[0, OX], [OX + 4, PARK.x0 - 2], [PARK.x1 + 3, BX], [BX + 4, W]]) row(a, b, { base: (QUEEN - 3) * TS }, 'shop', [1, 2, 2, 3], bricksQueen);
  // blocks between Dundas and Queen beside the park: houses facing south
  for (const [a, b] of [[0, OX], [OX + 4, PARK.x0 - 2], [PARK.x1 + 3, BX], [BX + 4, W]]) {
    row(a, b, { top: (DUNDAS + 7) * TS }, ['house', 'house', 'baygable', 'secondempire'], [1, 2], bricksDundas, 40);
    row(a, b, { base: 38 * TS }, ['baygable', 'baygable', 'queenanne', 'secondempire', 'queenanne'], [2], ['red', 'buff', 'darkred', 'red', 'cream', 'grey'], 40);
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
  const furnish = (...a) => D.furnish(...a);
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
  const park = (row, face, tag, avoid) => D.parkCars(row, face, tag, avoid);
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

  // ---------- mission 2's upgrade: transit signal priority on Queen ----------
  // white "transit bar" signal heads beside each Queen signal + TSP detector loops in the track lanes
  const tsp = { tiles: [], addProps: [] };
  for (const c of [OX, BX]) {
    tsp.addProps.push({ type: 'prop', key: 'tspsignal', x: (c - 1) * TS + 2, y: (QUEEN - 1) * TS + 10 });
    tsp.addProps.push({ type: 'prop', key: 'tspsignal', x: (c + 4) * TS + 14, y: (QUEEN + 4) * TS + 6 });
    for (const x of [c - 4, c + 7]) for (const y of [QUEEN + 1, QUEEN + 2]) tsp.tiles.push([x, y, `tracks_loop${(x + y) % 2}`]);
  }

  // ---------- traffic + walkers ----------
  const lanes = [
    { id: 'queen_wb', axis: 'x', dir: -1, pos: (QUEEN + 1) * TS + 8, streetcar: true, stops: stops.queen_wb, cyclists: 'mixed', priority: 'queen_tsp' },
    { id: 'queen_eb', axis: 'x', dir: 1, pos: (QUEEN + 2) * TS + 8, streetcar: true, stops: stops.queen_eb, cyclists: 'mixed', priority: 'queen_tsp' },
    { id: 'queen_bike_wb', axis: 'x', dir: -1, pos: QUEEN * TS + 7, bikeOnly: true, requires: 'queen_protected_lanes' },
    { id: 'queen_bike_eb', axis: 'x', dir: 1, pos: (QUEEN + 3) * TS + 9, bikeOnly: true, requires: 'queen_protected_lanes' },
    { id: 'dundas_wb', axis: 'x', dir: -1, pos: (DUNDAS + 1) * TS + 8, streetcar: true, stops: stops.dundas_wb },
    { id: 'dundas_eb', axis: 'x', dir: 1, pos: (DUNDAS + 2) * TS + 8, streetcar: true, stops: stops.dundas_eb },
    { id: 'oss_sb', axis: 'y', dir: 1, pos: (OX + 1) * TS + 8 },
    { id: 'oss_nb', axis: 'y', dir: -1, pos: (OX + 2) * TS + 8 },
    { id: 'bell_sb', axis: 'y', dir: 1, pos: (BX + 1) * TS + 8, light: true },
    { id: 'bell_nb', axis: 'y', dir: -1, pos: (BX + 2) * TS + 8, light: true },
  ];
  D.lanes.push(...lanes);
  D.walkways.push(
    [[0, (QUEEN - 2) * TS + 6], [W * TS, (QUEEN - 2) * TS + 6]],
    [[0, (QUEEN + 5) * TS + 10], [W * TS, (QUEEN + 5) * TS + 10]],
    [[0, (DUNDAS - 2) * TS + 6], [W * TS, (DUNDAS - 2) * TS + 6]],
    [[0, (DUNDAS + 5) * TS + 10], [W * TS, (DUNDAS + 5) * TS + 10]],
    [[OX * TS + 5, 0], [OX * TS + 5, H * TS]], [[(OX + 3) * TS + 11, 0], [(OX + 3) * TS + 11, H * TS]],
    [[BX * TS + 5, 0], [BX * TS + 5, H * TS]], [[(BX + 3) * TS + 11, 0], [(BX + 3) * TS + 11, H * TS]],
    ...parkPaths,
  );
  D.labels.push(
    { text: 'QUEEN ST W', x: 30 * TS, y: (QUEEN + 2) * TS },
    { text: 'DUNDAS ST W', x: 30 * TS, y: (DUNDAS + 2) * TS },
    { text: 'OSSINGTON', x: (OX + 2) * TS, y: 33 * TS, vertical: true },
    { text: 'BELLWOODS', x: (BX + 2) * TS, y: 33 * TS, vertical: true },
    { text: 'STRACHAN', x: (SX + 2) * TS, y: 69 * TS, vertical: true },
    { text: 'TRINITY BELLWOODS', x: R(0.5, 0.64)[0], y: R(0.5, 0.64)[1], kind: 'landmark' },
    { text: 'DOG BOWL', x: bowl.x + bowl.w / 2, y: bowl.y + bowl.h / 2, kind: 'landmark' },
    { text: 'GATES', x: 52 * TS, y: 49 * TS, kind: 'landmark' },
    { text: 'BACK LANE', x: 30 * TS, y: (laneRow + 1) * TS, kind: 'landmark' },
    { text: '< HIGH PARK', x: 3 * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
    { text: 'DOWNTOWN >', x: (W - 4) * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
  );
  D.improvements = { queen_protected_lanes: imp, queen_tsp: tsp };
  D.markers.push(
    { id: 'bike_lane_war', x: 62 * TS, y: (QUEEN - 2) * TS + 8, label: 'THE BIKE LANE WAR' },
    { id: 'streetcar_through', x: 17 * TS, y: (QUEEN - 2) * TS + 8, label: 'LET THE STREETCAR THROUGH' },
  );
  D.critters.push({ kind: 'white_squirrel', x: R(0.26, 0.48)[0], y: R(0.26, 0.48)[1] }); // where the park map draws its squirrel
  D.landmarks.push({ id: 'tb_gates', x: GATE_X, y: (QUEEN - 3) * TS - 10, label: 'THE UNIVERSITY OF', fact: 'TRINITY COLLEGE\n1852 - 1925' });
  return D.out({ spawn: { x: 45 * TS + 8, y: (QUEEN - 2) * TS + 8 } });
}
