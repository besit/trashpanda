// High Park district (west of Queen West). Fictionalized but faithful in its parts:
// - High Park itself on the west: Grenadier Pond with cherry trees on its east shore, black oak savanna,
//   the zoo (with capybaras), the playground, car-free park roads, the wooden HIGH PARK sign at Bloor.
// - Parkside Drive along the park's east edge: the school zone and the infamous speed camera (mission 4).
// - Roncesvalles Ave (504 streetcar) with the Revue Cinema; Bloor St W (bike lanes; High Park station)
//   along the top; the Queensway (501) along the bottom.
// Rows match Queen West so Queen and Bloor/Dundas continue across the east edge.
import { District, TS, nearPolyline } from './common.mjs';

export const W = 110, H = 76;
export const BLOOR = 11, QUEEN = 54;
export const PS = 64;   // Parkside Dr cols 64..67
export const RX = 90;   // Roncesvalles Ave cols 90..93 (streetcar)
const PARK = { x0: 0, x1: PS - 2, y0: BLOOR + 7, y1: QUEEN - 4 };

export function generateHighPark() {
  const D = new District('highpark', W, H, 1873);
  const r = D.r;

  // ---------- ground ----------
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  D.fill(0, 0, W - 1, 2, 'laneway');
  // the park: lawn from Bloor to the Queensway, Parkside to the west edge
  D.fill(PARK.x0, PARK.y0 - 2, PARK.x1 + 1, PARK.y1 + 2, (x, y) => `lawn${(x * 5 + y * 11) % 3}`);

  // ---------- streets ----------
  // Bloor: no tracks (the subway runs underneath), painted bike lanes in the curb lanes
  D.ewStreet(BLOOR, { tracks: false, parkingN: 'bikelane_n_stencil', parkingS: 'bikelane_stencil' });
  for (let x = 0; x < W; x++) { if (D.get(x, BLOOR) !== 'bikelane_n_stencil') D.set(x, BLOOR, 'bikelane_n'); if (D.get(x, BLOOR + 3) !== 'bikelane_stencil') D.set(x, BLOOR + 3, 'bikelane'); }
  D.ewStreet(QUEEN);
  D.nsStreet(PS, 0, H - 1);
  D.nsStreet(RX, 0, H - 1, { tracks: true });
  D.cross(PS, BLOOR, { ewTracks: false }); D.cross(PS, QUEEN);
  D.cross(RX, BLOOR, { ewTracks: false, nsTracks: true }); D.cross(RX, QUEEN, { nsTracks: true });
  D.exit('e', QUEEN, 'queenwest'); D.exit('e', BLOOR, 'queenwest');

  // ---------- High Park ----------
  // Grenadier Pond: an irregular blob down the west side
  const pond = (x, y) => {
    const t = (y - (BLOOR + 9)) / (QUEEN - 8 - (BLOOR + 9));
    if (t < 0 || t > 1) return false;
    const cx = 9 + Math.sin(t * 3.1) * 2.5, hw = 4 + Math.sin(t * Math.PI) * 4.5 + Math.sin(t * 9) * 0.8;
    return Math.abs(x + 0.5 - cx) < hw;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < PS; x++) if (pond(x, y)) D.set(x, y, `water${(x * 3 + y) % 3}`);
  for (let y = 1; y < H - 1; y++) for (let x = 0; x < PS; x++) {
    if (!pond(x, y)) continue;
    if (!pond(x, y - 1)) D.set(x, y, 'shore_n'); else if (!pond(x, y + 1)) D.set(x, y, 'shore_s');
    else if (!pond(x - 1, y)) D.set(x, y, 'shore_w'); else if (!pond(x + 1, y)) D.set(x, y, (y % 4 === 0) ? 'reeds' : 'shore_e');
  }
  // the pond is solid (no riding on water)
  const pondRows = [];
  for (let y = 0; y < H; y++) { let a = -1, b = -1; for (let x = 0; x < PS; x++) if (pond(x, y)) { if (a < 0) a = x; b = x; } if (a >= 0) pondRows.push([y, a, b]); }
  for (const [y, a, b] of pondRows) D.prop('blank', (a + b + 1) * TS / 2, (y + 1) * TS, { solidBox: [-(b - a + 1) * TS / 2 + 4, -TS, (b - a + 1) * TS - 8, TS], invisible: true });

  // park roads (car-free) + trails, as one decal over the lawn
  const P = (pts) => pts.map(([x, y]) => [x * TS, y * TS]);
  const roads = [
    P([[44, BLOOR + 4], [42, 22], [36, 28], [30, 34], [27, 42], [30, QUEEN - 3]]),           // Colborne Lodge Dr (car-free)
    P([[42, 22], [50, 26], [56, 30], [PS, 30]]),                                         // to Parkside
  ];
  const trails = [
    P([[20, BLOOR + 5], [20, 24], [21, 32], [22, 42], [21, QUEEN - 3]]),                  // the pond's east shore (cherry trees)
    P([[22, 42], [30, 46], [40, 48], [52, 47], [PS, 46]]),
    P([[30, 34], [38, 37], [46, 40], [54, 38], [PS, 36]]),
    P([[36, 28], [30, 22], [26, BLOOR + 5]]),
  ];
  D.decals.push({ key: 'hp_paths', x: 0, y: (PARK.y0 - 2) * TS, gen: { kind: 'paths', style: 'trail', w: (PS + 1) * TS, h: (PARK.y1 - PARK.y0 + 6) * TS, paths: trails, roads, ox: 0, oy: (PARK.y0 - 2) * TS, width: 5 } });
  const nearRoad = (px, py, d) => nearPolyline(roads, px, py, d + 8) || nearPolyline(trails, px, py, d);

  // the zoo: two pens (capybaras + bison) with rail fences
  const zoo = [{ x0: 40, y0: 41, x1: 47, y1: 46, who: 'capybara' }, { x0: 49, y0: 41, x1: 56, y1: 46, who: 'llama' }];
  for (const z of zoo) {
    D.fill(z.x0, z.y0, z.x1, z.y1, 'pen');
    for (let x = z.x0; x <= z.x1; x++) { D.tprop('fence_h', x, z.y0, 0, 2, { solidBox: [0, -4, 16, 4] }); D.tprop('fence_h', x, z.y1, 0, 15, { solidBox: [0, -4, 16, 4] }); }
    for (let y = z.y0; y <= z.y1; y++) { D.tprop('fence_v', z.x0, y, 1, 15, { solidBox: [-2, -15, 4, 15] }); D.tprop('fence_v', z.x1, y, 15, 15, { solidBox: [-2, -15, 4, 15] }); }
  }
  D.critters.push({ kind: 'capybara', x: 43 * TS, y: 44 * TS }, { kind: 'capybara', x: 45 * TS + 6, y: 43 * TS + 4 });
  D.landmarks.push({ id: 'capybaras', x: 44 * TS, y: 47 * TS + 14, label: 'BONNIE + CLYDE', fact: 'THE CAPYBARAS WHO ESCAPED\nTHE HIGH PARK ZOO IN 2016' });

  // the playground (west of the zoo road)
  D.prop('playground', 31 * TS, 31 * TS);
  // the HIGH PARK sign at the Bloor gate
  D.prop('hpsign', 46 * TS, (BLOOR + 7) * TS, { solidBox: [-22, -4, 44, 4], landmark: 'HIGH PARK' });
  D.landmarks.push({ id: 'hp_sign', x: 46 * TS, y: (BLOOR + 7) * TS - 8, label: 'HIGH PARK', fact: 'JOHN + JEMIMA HOWARD\nAGREED IN 1873 TO PASS\nTHEIR LAND TO THE CITY' });

  // trees: cherry blossoms along the pond's east shore, black oaks across the savanna
  const busy = (px, py) => nearRoad(px, py, 16) || zoo.some((z) => px > (z.x0 - 2) * TS && px < (z.x1 + 2) * TS && py > (z.y0 - 2) * TS && py < (z.y1 + 3) * TS) || Math.hypot(px - 31 * TS, py - 31 * TS) < 40 || Math.hypot(px - 46 * TS, py - (BLOOR + 7) * TS) < 50;
  for (let y = PARK.y0 + 1; y < PARK.y1; y += 3) {
    let edge = 0; for (let x = 0; x < PS; x++) if (pond(x, y)) edge = x;
    const px = (edge + 2) * TS + r.int(-2, 6), py = y * TS + r.int(0, 8);
    if (!busy(px, py)) D.prop('tree_cherry', px, py, { solid: 5 });
  }
  const trees = [];
  for (let i = 0; i < 1600 && trees.length < 90; i++) {
    const px = r.int(14 * TS, (PS - 1) * TS), py = r.int((PARK.y0 + 1) * TS, (PARK.y1 + 1) * TS);
    let pondNear = false; for (let dx = -2; dx <= 2; dx++) if (pond(Math.floor(px / TS) + dx, Math.floor(py / TS))) pondNear = true;
    if (pondNear || busy(px, py) || trees.some(([x, y]) => Math.hypot(x - px, y - py) < 28)) continue;
    trees.push([px, py]);
    D.prop(r.chance(0.55) ? 'tree_oak' : r.chance(0.5) ? 'tree_a' : 'tree_c', px, py, { solid: 5 });
  }
  // benches + bins along the trails
  trails.forEach((pts) => { for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const mx = (ax + bx) / 2, my = (ay + by) / 2; D.prop('bench', mx + 14, my + 4); D.prop('bin_green', mx + 28, my + 4); } });

  // ---------- Parkside Drive: the school zone ----------
  const SCHOOL = { x0: PS + 5, x1: PS + 17, base: 36 };
  D.addBuilding(SCHOOL.x0 * TS, (SCHOOL.x1 - SCHOOL.x0) * TS, { w: (SCHOOL.x1 - SCHOOL.x0) * TS, d: 48, floors: 2, brick: 'red', seed: 77, kind: 'school' }, { base: SCHOOL.base * TS }, { graffiti: null });
  D.fill(SCHOOL.x0, SCHOOL.base, SCHOOL.x1 - 1, SCHOOL.base + 1, (x) => `sidewalk${x % 3}`);
  D.fill(PS + 4, SCHOOL.base + 2, SCHOOL.x1 + 1, SCHOOL.base + 7, 'plaza_warm'); // schoolyard
  D.prop('playground', (PS + 13) * TS, (SCHOOL.base + 6) * TS);
  D.tprop('schoolsign', PS - 1, 26, 8, 14); D.tprop('schoolsign', PS + 4, 44, 8, 14);
  // the speed camera, cut down (the mission puts things right)
  D.tprop('speedcam_cut', PS + 4, 31, 4, 14, { tag: 'camstump' });
  D.landmarks.push({ id: 'speedcam', x: (PS + 4) * TS + 4, y: 31 * TS - 6, label: 'PARKSIDE SPEED CAMERA', fact: 'CUT DOWN 7 TIMES IN\nLESS THAN A YEAR. ONCE\nDUMPED IN A PARK POND.' });
  D.markers.push({ id: 'slow_down_dog', x: (PS + 4) * TS + 8, y: 34 * TS, label: 'SLOW DOWN, DOG' });

  // ---------- buildings ----------
  const bricks = ['red', 'buff', 'darkred', 'red', 'cream', 'grey', 'lilac'];
  // Bloor north side: Bloor West shops (+ High Park station at High Park Ave)
  for (const [a, b] of [[0, 40], [44, PS], [PS + 4, RX], [RX + 4, W]]) D.row(a, b, { base: (BLOOR - 3) * TS }, 'shop', [1, 2, 2], bricks);
  D.tprop('subway', 42, BLOOR - 3, 0, 12, { solidBox: [-12, -10, 24, 10] });
  D.tprop('subway', RX + 5, BLOOR - 3, 0, 12, { solidBox: [-12, -10, 24, 10] }); // Dundas West station
  // between Parkside and Roncesvalles: bay-and-gables and Queen Annes (Roncesvalles Village)
  const houses = ['baygable', 'baygable', 'queenanne', 'secondempire', 'house'];
  D.row(PS + 4, RX, { top: (BLOOR + 7) * TS }, houses, [1, 2], bricks, 40);
  D.row(PS + 18, RX, { base: SCHOOL.base * TS }, houses, [2], bricks, 40);
  D.row(PS + 4, RX, { base: 50 * TS }, houses, [2], bricks, 40);
  for (let y = SCHOOL.base; y < SCHOOL.base + 2; y++) for (let x = PS + 18; x < RX; x++) D.set(x, y, `sidewalk${x % 3}`);
  // east of Roncesvalles: shops facing Roncesvalles' cross streets, with the Revue Cinema
  D.row(RX + 4, W, { top: (BLOOR + 7) * TS }, houses, [1, 2], bricks, 40);
  const rev = D.row(RX + 4, RX + 8, { base: 34 * TS }, 'shop', [2], ['cream'], 40, { widths: [4] });
  D.prop('marquee', (RX + 6) * TS, rev[0].base - 19, { depth: rev[0].base + 0.3 });
  D.landmarks.push({ id: 'revue', x: (RX + 6) * TS, y: 34 * TS + 10, label: 'THE REVUE CINEMA', fact: 'RONCESVALLES AVE\nOPENED 1912' });
  D.row(RX + 8, W, { base: 34 * TS }, ['shop', 'baygable', 'house'], [2], bricks, 40);
  D.row(RX + 4, W, { base: 50 * TS }, houses, [2], bricks, 40);
  for (const y0 of [34, 50]) for (let y = y0; y < y0 + 2; y++) for (let x = RX + 4; x < W; x++) D.set(x, y, `sidewalk${x % 3}`);
  for (let y = 50; y < 52; y++) for (let x = PS + 4; x < RX; x++) D.set(x, y, `sidewalk${x % 3}`);
  // Queensway south side: shop backs + a laneway, like Queen West
  for (const [a, b] of [[0, PS], [PS + 4, RX], [RX + 4, W]]) D.row(a, b, { top: (QUEEN + 7) * TS }, 'rear', [1, 1, 2], bricks, 48, { graffiti: [0, 1] });
  D.fill(0, QUEEN + 13, W - 1, QUEEN + 14, (x) => (D.isNS(x) ? D.get(x, QUEEN + 13) : 'laneway'));

  // ---------- street furniture, stops, parked cars ----------
  D.furnish(BLOOR, 'n', 0, W);
  D.furnish(BLOOR, 's', PS + 4, W);
  D.furnish(QUEEN, 'n', PS + 4, W);
  D.furnish(QUEEN, 's', 0, W);
  for (let x = 2; x < PS - 1; x += 7) D.tprop('streetlight', x, QUEEN - 1, 4, 8);
  for (let y = PARK.y0; y < PARK.y1; y += 7) D.tprop('parklamp', PS - 1, y, 8, 8);
  const stops = { queen_wb: [(RX - 1) * TS, (PS - 1) * TS], queen_eb: [(RX + 5) * TS, (PS + 5) * TS], ronc_sb: [(BLOOR - 3) * TS - 40, (QUEEN - 3) * TS - 40], ronc_nb: [(QUEEN + 7) * TS + 40, (BLOOR + 7) * TS + 40] };
  for (const c of [PS, RX]) { D.tprop('ttcstop', c - 2, QUEEN - 1, 8, 8); D.tprop('ttcstop', c + 5, QUEEN + 4, 8, 6); }
  const stopZone = (xs) => xs.map((s) => [s - 112, s + 24]);
  D.parkCars(QUEEN, 'W', undefined, stopZone(stops.queen_wb), PS + 4);
  D.parkCars(QUEEN + 3, 'E', undefined, stopZone(stops.queen_eb), PS + 4);

  // ---------- the civic upgrade: Parkside slowed by design ----------
  const calm = { tiles: [], addProps: [], removeTag: 'camstump' };
  for (const y of [20, 27, 41, 47]) for (const x of [PS + 1, PS + 2]) calm.tiles.push([x, y, 'hump_ns']);
  for (const y of [32, 33]) for (let x = PS; x <= PS + 3; x++) calm.tiles.push([x, y, 'raised_ns']); // raised school crosswalk
  for (const y of [24, 38]) calm.tiles.push([PS + 1, y, 'slow_stencil']);
  for (const y of [30, 35]) { calm.addProps.push({ type: 'prop', key: 'planter', x: (PS + 1) * TS + 2, y: y * TS + 12, solid: 6 }); calm.addProps.push({ type: 'prop', key: 'planter', x: (PS + 3) * TS - 2, y: y * TS + 12, solid: 6 }); }
  calm.addProps.push({ type: 'prop', key: 'speedcam', x: (PS + 4) * TS + 4, y: 31 * TS + 14 });
  D.improvements = { parkside_calming: calm };

  // ---------- traffic + walkers ----------
  D.ewLanes('bloor', BLOOR, {});
  D.lanes.push({ id: 'bloor_bike_wb', axis: 'x', dir: -1, pos: BLOOR * TS + 7, bikeOnly: true }, { id: 'bloor_bike_eb', axis: 'x', dir: 1, pos: (BLOOR + 3) * TS + 9, bikeOnly: true });
  D.ewLanes('queen', QUEEN, { streetcar: true, stopsWB: stops.queen_wb, stopsEB: stops.queen_eb, cyclists: 'mixed' });
  D.nsLanes('parkside', PS, { calm: 'parkside_calming', speedy: true });
  D.nsLanes('ronc', RX, { streetcar: true });
  D.lanes.find((l) => l.id === 'ronc_sb').stops = stops.ronc_sb;
  D.lanes.find((l) => l.id === 'ronc_nb').stops = stops.ronc_nb;
  D.walkways.push(...trails);

  D.labels.push(
    { text: 'BLOOR ST W', x: 28 * TS, y: (BLOOR + 2) * TS },
    { text: 'DUNDAS ST W', x: 101 * TS, y: (BLOOR + 2) * TS },
    { text: 'THE QUEENSWAY', x: 30 * TS, y: (QUEEN + 2) * TS },
    { text: 'QUEEN ST W', x: 101 * TS, y: (QUEEN + 2) * TS },
    { text: 'PARKSIDE DR', x: (PS + 2) * TS, y: 40 * TS, vertical: true },
    { text: 'RONCESVALLES', x: (RX + 2) * TS, y: 42 * TS, vertical: true },
    { text: 'HIGH PARK', x: 36 * TS, y: 33 * TS, kind: 'landmark' },
    { text: 'GRENADIER POND', x: 9 * TS, y: 30 * TS, kind: 'landmark' },
    { text: 'ZOO', x: 48 * TS, y: 40 * TS, kind: 'landmark' },
    { text: 'SCHOOL', x: (SCHOOL.x0 + 6) * TS, y: (SCHOOL.base - 4) * TS, kind: 'landmark' },
    { text: 'QUEEN WEST >', x: (W - 4) * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
  );
  return D.out({ spawn: { x: (W - 3) * TS, y: (QUEEN - 2) * TS + 8 } });
}
