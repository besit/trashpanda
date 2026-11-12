// High Park district (west of Queen West). M2.1: re-laid from the City's High Park map (Ivan's reference),
// with our assets. Everything inside the park is placed by normalized map coordinates P(u, v):
// u = 0 at the west edge -> 1 at Parkside Dr, v = 0 at Bloor -> 1 at the Queensway.
// - Grenadier Pond down the west side (swans + wood ducks), Spring Creek ponds on the east
// - the car-free park roads: Colborne Lodge Dr, West Rd, Spring Rd, Centre Rd, Deer Pen Rd
// - the Grenadier Cafe, the off-leash dog park, the zoo (capybaras), the greenhouse, the sports fields,
//   Hillside Gardens, the Jamie Bell Adventure Playground, Colborne Lodge, cherry trees along the pond
// - Parkside Dr's school zone + speed camera (park side), Roncesvalles (504) with the Revue, Bloor West
// Exits are matched by street name: the Queensway continues as Queen, Bloor as Dundas.
import { District, TS, nearPolyline } from './common.mjs';

export const W = 110, H = 102;
export const BLOOR = 11, QUEEN = 92;
export const PS = 64;   // Parkside Dr cols 64..67
export const RX = 90;   // Roncesvalles Ave cols 90..93 (streetcar)
const PARK = { x0: 0, x1: PS - 1, y0: BLOOR + 7, y1: QUEEN - 4 };

export function generateHighPark() {
  const D = new District('highpark', W, H, 1873);
  const r = D.r;
  const U = (u) => PARK.x0 + u * (PARK.x1 - PARK.x0);          // tiles
  const V = (v) => PARK.y0 + v * (PARK.y1 - PARK.y0);
  const P = (u, v) => [U(u) * TS, V(v) * TS];                     // px
  const PP = (pts) => pts.map(([u, v]) => P(u, v));

  // ---------- ground ----------
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  D.fill(0, 0, W - 1, 2, 'laneway');
  D.fill(PARK.x0, PARK.y0 - 1, PARK.x1, PARK.y1 + 1, (x, y) => `lawn${(x * 5 + y * 11) % 3}`);

  // ---------- streets ----------
  D.ewStreet(BLOOR, { tracks: false, parkingN: 'bikelane_n_stencil', parkingS: 'bikelane_stencil' });
  for (let x = 0; x < W; x++) { if (D.get(x, BLOOR) !== 'bikelane_n_stencil') D.set(x, BLOOR, 'bikelane_n'); if (D.get(x, BLOOR + 3) !== 'bikelane_stencil') D.set(x, BLOOR + 3, 'bikelane'); }
  D.ewStreet(QUEEN);
  D.nsStreet(PS, 0, H - 1);
  D.nsStreet(RX, 0, H - 1, { tracks: true });
  D.cross(PS, BLOOR, { ewTracks: false }); D.cross(PS, QUEEN);
  D.cross(RX, BLOOR, { ewTracks: false, nsTracks: true }); D.cross(RX, QUEEN, { nsTracks: true });
  D.exit('e', QUEEN, 'queenwest', 'queen'); D.exit('e', BLOOR, 'queenwest', 'dundas');

  // ---------- water: Grenadier Pond + Spring Creek ponds ----------
  const inPoly = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const grenadier = [[0.06, 0.33], [0.12, 0.30], [0.15, 0.36], [0.16, 0.47], [0.19, 0.58], [0.27, 0.68], [0.38, 0.76], [0.42, 0.84], [0.41, 0.97], [0.09, 0.97], [0.08, 0.78], [0.07, 0.60], [0.06, 0.45]].map(([u, v]) => [U(u), V(v)]);
  const creeks = [
    [[0.80, 0.12], [0.85, 0.11], [0.87, 0.16], [0.84, 0.21], [0.80, 0.19]],
    [[0.74, 0.71], [0.79, 0.70], [0.82, 0.76], [0.80, 0.82], [0.75, 0.80]],
    [[0.80, 0.86], [0.87, 0.85], [0.90, 0.92], [0.88, 0.98], [0.81, 0.97]],
  ].map((poly) => poly.map(([u, v]) => [U(u), V(v)]));
  const water = (x, y) => inPoly(grenadier, x + 0.5, y + 0.5) || creeks.some((c) => inPoly(c, x + 0.5, y + 0.5));
  for (let y = PARK.y0; y <= PARK.y1; y++) for (let x = PARK.x0; x <= PARK.x1; x++) if (water(x, y)) D.set(x, y, `water${(x * 3 + y) % 3}`);
  for (let y = PARK.y0; y <= PARK.y1 + 1; y++) for (let x = PARK.x0; x <= PARK.x1; x++) {
    if (!water(x, y)) continue;
    if (!water(x, y - 1)) D.set(x, y, 'shore_n'); else if (!water(x, y + 1)) D.set(x, y, 'shore_s');
    else if (!water(x - 1, y) && x > 0) D.set(x, y, 'shore_w'); else if (!water(x + 1, y)) D.set(x, y, (y % 4 === 0) ? 'reeds' : 'shore_e');
  }
  // water is solid: one collider per row run
  for (let y = 0; y < H; y++) {
    let a = -1;
    for (let x = 0; x <= PARK.x1 + 1; x++) {
      const wv = x <= PARK.x1 && water(x, y);
      if (wv && a < 0) a = x;
      if (!wv && a >= 0) { D.prop('blank', ((a + x) * TS) / 2, (y + 1) * TS, { solidBox: [-((x - a) * TS) / 2 + 4, -TS, (x - a) * TS - 8, TS], invisible: true }); a = -1; }
    }
  }
  // swans + wood ducks on the pond (Ivan: "I want some Wood Ducks and Swans in the water")
  for (const [u, v, k] of [[0.20, 0.72, 'swan'], [0.30, 0.86, 'swan'], [0.12, 0.50, 'woodduck'], [0.15, 0.62, 'woodduck'], [0.25, 0.90, 'woodduck'], [0.83, 0.16, 'woodduck'], [0.84, 0.91, 'swan']]) {
    const [x, y] = P(u, v); D.critters.push({ kind: k, x, y });
  }

  // ---------- the park roads (car-free) + trails ----------
  const roads = [
    PP([[0.58, -0.02], [0.56, 0.10], [0.52, 0.25], [0.47, 0.37], [0.42, 0.50], [0.37, 0.56], [0.39, 0.66], [0.45, 0.75], [0.51, 0.83], [0.55, 0.91], [0.57, 1.03]]), // Colborne Lodge Dr
    PP([[0.56, 0.10], [0.42, 0.16], [0.31, 0.22], [0.27, 0.32], [0.27, 0.45], [0.31, 0.51], [0.38, 0.52], [0.42, 0.50]]),                                       // West Rd
    PP([[0.57, 0.08], [0.70, 0.13], [0.78, 0.20], [0.80, 0.27], [0.76, 0.38], [0.73, 0.50], [0.77, 0.61], [0.78, 0.70], [0.83, 0.81], [0.86, 0.92], [0.89, 1.03]]), // Spring Rd
    PP([[0.42, 0.51], [0.52, 0.55], [0.66, 0.59], [0.77, 0.65], [1.02, 0.65]]),                                                                                // Centre Rd -> High Park Blvd
    PP([[0.38, 0.57], [0.45, 0.67], [0.53, 0.72], [0.66, 0.74], [0.77, 0.74]]),                                                                                // Deer Pen Rd
    PP([[0.88, 0.65], [0.89, 0.52], [1.02, 0.40]]),                                                                                                            // Howard Park
  ];
  const trails = [
    PP([[0.17, 0.30], [0.20, 0.42], [0.22, 0.52], [0.27, 0.60], [0.36, 0.70]]),     // pond east shore (the cherry walk)
    PP([[0.12, 0.29], [0.18, 0.16], [0.30, 0.08], [0.45, 0.04]]),                    // north woods
    PP([[0.45, 0.80], [0.55, 0.82], [0.66, 0.86], [0.76, 0.90]]),
    PP([[0.62, 0.30], [0.66, 0.42], [0.70, 0.50]]),
    PP([[0.30, 0.66], [0.38, 0.72], [0.44, 0.92], [0.40, 0.99]]),
  ];
  D.decals.push({ key: 'hp_paths', x: 0, y: (PARK.y0 - 1) * TS, gen: { kind: 'paths', style: 'trail', w: (PARK.x1 + 2) * TS, h: (PARK.y1 - PARK.y0 + 3) * TS, paths: trails, roads, ox: 0, oy: (PARK.y0 - 1) * TS, width: 5 } });
  const nearRoad = (px, py, d) => nearPolyline(roads, px, py, d + 8) || nearPolyline(trails, px, py, d);
  const zones = []; // [x, y, w, h] px rects kept clear of trees
  const zone = (u, v, w, h) => { const [x, y] = P(u, v); const z = [x - w / 2, y - h / 2, w, h]; zones.push(z); return { x: Math.round(z[0]), y: Math.round(z[1]), w, h, cx: x, cy: y }; };

  // ---------- park features (positions from the map) ----------
  // sports fields (NW), the pool, tennis courts
  const d1 = zone(0.36, 0.30, 96, 96), d2 = zone(0.46, 0.27, 96, 96), d3 = zone(0.35, 0.40, 96, 96);
  D.decals.push({ key: 'diamond', x: d1.x, y: d1.y }, { key: 'diamond', x: d2.x, y: d2.y }, { key: 'diamond', x: d3.x, y: d3.y });
  const tn = zone(0.60, 0.20, 86, 93); D.decals.push({ key: 'tennis', x: tn.x, y: tn.y });
  // the off-leash dog park (fenced dirt)
  const dog = zone(0.53, 0.43, 112, 96);
  for (let y = Math.floor(dog.y / TS); y < Math.ceil((dog.y + dog.h) / TS); y++) for (let x = Math.floor(dog.x / TS); x < Math.ceil((dog.x + dog.w) / TS); x++) D.set(x, y, 'pen');
  for (let x = Math.floor(dog.x / TS); x < Math.ceil((dog.x + dog.w) / TS); x++) { D.prop('fence_h', x * TS, dog.y + 2, { solidBox: [0, -4, 16, 4] }); D.prop('fence_h', x * TS, dog.y + dog.h, { solidBox: [0, -4, 16, 4] }); }
  D.labels.push({ text: 'DOG PARK', x: dog.cx, y: dog.cy, kind: 'landmark' });
  // the Grenadier Cafe (+ its patio), at the bottom of West Rd
  const cafe = zone(0.33, 0.47, 96, 72);
  D.addBuilding(cafe.x + 8, 80, { w: 80, d: 32, floors: 1, brick: 'buff', seed: 1955, kind: 'cafe' }, { base: cafe.y + 52 }, { graffiti: null });
  for (const [dx, k] of [[8, 'patio_r'], [36, 'patio_f'], [64, 'patio_r']]) D.prop(k, cafe.x + 8 + dx, cafe.y + 68);
  D.landmarks.push({ id: 'cafe', x: cafe.cx, y: cafe.y + 60, label: 'GRENADIER CAFE', fact: 'COFFEE, FRIES AND A\nVIEW OF THE POND.\nCYCLISTS WELCOME.' });
  // the zoo along Deer Pen Rd: capybaras + llamas
  const zoo = [zone(0.43, 0.63, 128, 96), zone(0.50, 0.69, 112, 80)];
  for (const [i, z] of zoo.entries()) {
    const x0 = Math.floor(z.x / TS), x1 = Math.floor((z.x + z.w) / TS) - 1, y0 = Math.floor(z.y / TS), y1 = Math.floor((z.y + z.h) / TS) - 1;
    D.fill(x0, y0, x1, y1, 'pen');
    for (let x = x0; x <= x1; x++) { D.tprop('fence_h', x, y0, 0, 2, { solidBox: [0, -4, 16, 4] }); D.tprop('fence_h', x, y1, 0, 15, { solidBox: [0, -4, 16, 4] }); }
    for (let y = y0; y <= y1; y++) { D.tprop('fence_v', x0, y, 1, 15, { solidBox: [-2, -15, 4, 15] }); D.tprop('fence_v', x1, y, 15, 15, { solidBox: [-2, -15, 4, 15] }); }
    if (i === 0) D.critters.push({ kind: 'capybara', x: z.cx - 14, y: z.cy + 4 }, { kind: 'capybara', x: z.cx + 16, y: z.cy - 6 }, { kind: 'capybara', x: z.cx + 2, y: z.cy + 18 });
  }
  D.landmarks.push({ id: 'capybaras', x: zoo[0].cx, y: zoo[0].y + zoo[0].h + 14, label: 'BONNIE + CLYDE', fact: 'THE CAPYBARAS WHO ESCAPED\nTHE HIGH PARK ZOO IN 2016' });
  D.labels.push({ text: 'ZOO', x: zoo[0].cx, y: zoo[0].y - 8, kind: 'landmark' });
  // the greenhouse
  const gh = zone(0.60, 0.64, 96, 80);
  D.addBuilding(gh.x + 8, 80, { w: 80, d: 40, floors: 1, seed: 3, kind: 'greenhouse' }, { base: gh.y + 70 }, { graffiti: null });
  // Hillside Gardens: flower beds by the pond
  const hs = zone(0.25, 0.58, 88, 56);
  for (let y = Math.floor(hs.y / TS); y < Math.ceil((hs.y + hs.h) / TS); y++) for (let x = Math.floor(hs.x / TS); x < Math.ceil((hs.x + hs.w) / TS); x++) if ((x + y) % 2 === 0 && !water(x, y)) D.set(x, y, 'flowerbed');
  D.labels.push({ text: 'HILLSIDE GARDENS', x: hs.cx, y: hs.cy, kind: 'landmark' });
  // the Jamie Bell Adventure Playground (the big wooden castle playground)
  const jb = zone(0.88, 0.75, 112, 80);
  D.prop('adventure', jb.cx, jb.y + jb.h - 6, { solidBox: [-46, -16, 92, 14], landmark: 'JAMIE BELL ADVENTURE PLAYGROUND' });
  D.landmarks.push({ id: 'jamiebell', x: jb.cx, y: jb.y + jb.h + 6, label: 'JAMIE BELL', fact: 'ADVENTURE PLAYGROUND.\nREBUILT BY THE COMMUNITY\nAFTER A 2012 FIRE.' });
  // Colborne Lodge (the Howards' house)
  const cl = zone(0.62, 0.89, 64, 56);
  D.addBuilding(cl.x + 8, 48, { w: 48, d: 32, floors: 2, brick: 'cream', seed: 1837, kind: 'baygable' }, { base: cl.y + 50 }, { graffiti: null });
  D.landmarks.push({ id: 'colborne', x: cl.cx, y: cl.y + 58, label: 'COLBORNE LODGE', fact: 'JOHN + JEMIMA HOWARD\nAGREED IN 1873 TO PASS\nTHEIR LAND TO THE CITY' });
  // the HIGH PARK sign at the Bloor gate
  const [sgx] = P(0.58, 0);
  D.prop('hpsign', sgx + 40, (BLOOR + 7) * TS + 4, { solidBox: [-22, -4, 44, 4], landmark: 'HIGH PARK' });
  zones.push([sgx - 40, (BLOOR + 6) * TS, 120, 32]);
  // picnic areas (the map's table icons)
  const picnics = [[0.45, 0.06], [0.64, 0.07], [0.40, 0.12], [0.30, 0.17], [0.60, 0.33], [0.26, 0.38], [0.50, 0.21], [0.45, 0.56], [0.70, 0.67], [0.68, 0.79], [0.71, 0.86], [0.76, 0.34], [0.20, 0.66], [0.60, 0.95]];
  for (const [u, v] of picnics) { const [x, y] = P(u, v); D.prop('picnic', x - 12, y, { solid: 6 }); D.prop('picnic_l', x + 14, y + 6, { solid: 6 }); D.prop('bin_green', x + 1, y - 12); zones.push([x - 26, y - 18, 52, 32]); }

  // ---------- trees: cherry blossoms on the pond shore + Hillside, black oak savanna everywhere else ----------
  const blocked = (px, py) => nearRoad(px, py, 14) || zones.some(([x, y, w, h]) => px > x - 8 && px < x + w + 8 && py > y - 8 && py < y + h + 12) || water(Math.floor(px / TS), Math.floor(py / TS)) || water(Math.floor(px / TS) + 1, Math.floor(py / TS)) || water(Math.floor(px / TS) - 1, Math.floor(py / TS));
  const trees = [];
  const plant = (key, px, py) => { if (blocked(px, py) || trees.some(([x, y]) => Math.hypot(x - px, y - py) < 24)) return; trees.push([px, py]); D.prop(key, px, py, { solid: 5 }); };
  // the cherry walk: just east of the pond, v 0.30 -> 0.70
  for (let v = 0.30; v < 0.72; v += 0.025) {
    let edge = 0; const ty = Math.round(V(v)); for (let x = 0; x < PARK.x1; x++) if (water(x, ty)) edge = x;
    plant('tree_cherry', (edge + 2.2) * TS + r.int(-4, 6), ty * TS + r.int(0, 8));
    plant('tree_cherry', (edge + 4) * TS + r.int(-4, 6), ty * TS + r.int(4, 12));
  }
  for (let i = 0; i < 18; i++) plant('tree_cherry', hs.x + r.int(-30, hs.w + 30), hs.y + r.int(-30, hs.h + 30));
  for (let i = 0; i < 2600 && trees.length < 190; i++) {
    const px = r.int(PARK.x0 * TS + 8, PARK.x1 * TS), py = r.int((PARK.y0 + 1) * TS, (PARK.y1 + 1) * TS);
    plant(r.chance(0.55) ? 'tree_oak' : r.chance(0.5) ? 'tree_a' : 'tree_c', px, py);
  }
  // benches + bins along the trails
  trails.forEach((pts) => { for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const mx = (ax + bx) / 2, my = (ay + by) / 2; if (!water(Math.floor(mx / TS), Math.floor(my / TS))) { D.prop('bench', mx + 14, my + 4); D.prop('bin_green', mx + 28, my + 4); } } });
  for (let y = PARK.y0; y < PARK.y1; y += 7) D.tprop('parklamp', PS - 1, y, 8, 8);

  // ---------- Parkside Drive: the school zone (east side), the camera (park side) ----------
  const SCHOOL = { x0: PS + 5, x1: PS + 17, base: 44 };
  D.addBuilding(SCHOOL.x0 * TS, (SCHOOL.x1 - SCHOOL.x0) * TS, { w: (SCHOOL.x1 - SCHOOL.x0) * TS, d: 48, floors: 2, brick: 'red', seed: 77, kind: 'school' }, { base: SCHOOL.base * TS }, { graffiti: null });
  D.fill(SCHOOL.x0, SCHOOL.base, SCHOOL.x1 - 1, SCHOOL.base + 1, (x) => `sidewalk${x % 3}`);
  D.fill(PS + 4, SCHOOL.base + 2, SCHOOL.x1 + 1, SCHOOL.base + 7, 'plaza_warm'); // schoolyard
  D.prop('playground', (PS + 13) * TS, (SCHOOL.base + 6) * TS);
  D.tprop('schoolsign', PS - 1, 34, 8, 14); D.tprop('schoolsign', PS + 4, 52, 8, 14);
  // the speed camera, cut down, on the PARK side of Parkside (Ivan: left side of the road)
  const CAMY = 39;
  D.tprop('speedcam_cut', PS - 1, CAMY, 10, 14, { tag: 'camstump' });
  D.landmarks.push({ id: 'speedcam', x: (PS - 1) * TS + 10, y: CAMY * TS - 6, label: 'PARKSIDE SPEED CAMERA', fact: 'CUT DOWN 7 TIMES IN\nLESS THAN A YEAR. ONCE\nDUMPED IN A PARK POND.' });
  D.markers.push({ id: 'slow_down_dog', x: (PS + 4) * TS + 8, y: 42 * TS, label: 'SLOW DOWN, DOG' });

  // ---------- buildings east of the park ----------
  const bricks = ['red', 'buff', 'darkred', 'red', 'cream', 'grey', 'lilac'];
  for (const [a, b] of [[0, Math.floor(U(0.54))], [Math.floor(U(0.54)) + 4, PS], [PS + 4, RX], [RX + 4, W]]) D.row(a, b, { base: (BLOOR - 3) * TS }, 'shop', [1, 2, 2], bricks);
  D.tprop('subway', Math.floor(U(0.54)) + 2, BLOOR - 3, 0, 12, { solidBox: [-12, -10, 24, 10] }); // High Park station
  D.tprop('subway', RX + 5, BLOOR - 3, 0, 12, { solidBox: [-12, -10, 24, 10] });                  // Dundas West station
  const houses = ['baygable', 'baygable', 'queenanne', 'secondempire', 'house'];
  D.row(PS + 4, RX, { top: (BLOOR + 7) * TS }, houses, [1, 2], bricks, 40);
  D.row(PS + 18, RX, { base: SCHOOL.base * TS }, houses, [2], bricks, 40);
  for (const by of [62, 76]) { D.row(PS + 4, RX, { base: by * TS }, houses, [2], bricks, 40); for (let y = by; y < by + 2; y++) for (let x = PS + 4; x < RX; x++) D.set(x, y, `sidewalk${x % 3}`); }
  for (let y = SCHOOL.base; y < SCHOOL.base + 2; y++) for (let x = PS + 18; x < RX; x++) D.set(x, y, `sidewalk${x % 3}`);
  D.row(RX + 4, W, { top: (BLOOR + 7) * TS }, houses, [1, 2], bricks, 40);
  const rev = D.row(RX + 4, RX + 8, { base: 40 * TS }, 'shop', [2], ['cream'], 40, { widths: [4] });
  D.prop('marquee', (RX + 6) * TS, rev[0].base - 19, { depth: rev[0].base + 0.3 });
  D.landmarks.push({ id: 'revue', x: (RX + 6) * TS, y: 40 * TS + 10, label: 'THE REVUE CINEMA', fact: 'RONCESVALLES AVE\nOPENED 1912' });
  D.row(RX + 8, W, { base: 40 * TS }, ['shop', 'baygable', 'house'], [2], bricks, 40);
  for (const by of [58, 74]) D.row(RX + 4, W, { base: by * TS }, houses, [2], bricks, 40);
  for (const y0 of [40, 58, 74]) for (let y = y0; y < y0 + 2; y++) for (let x = RX + 4; x < W; x++) D.set(x, y, `sidewalk${x % 3}`);
  for (const [a, b] of [[0, PS], [PS + 4, RX], [RX + 4, W]]) D.row(a, b, { top: (QUEEN + 7) * TS }, 'rear', [1, 1, 2], bricks, 48, { graffiti: [0, 1] });

  // ---------- street furniture, stops, parked cars ----------
  D.furnish(BLOOR, 'n', 0, W);
  D.furnish(BLOOR, 's', PS + 4, W);
  D.furnish(QUEEN, 'n', PS + 4, W);
  D.furnish(QUEEN, 's', 0, W);
  for (let x = 2; x < PS - 1; x += 7) D.tprop('streetlight', x, QUEEN - 1, 4, 8);
  const stops = { queen_wb: [(RX - 1) * TS, (PS - 1) * TS], queen_eb: [(RX + 5) * TS, (PS + 5) * TS], ronc_sb: [(BLOOR - 3) * TS - 40, (QUEEN - 3) * TS - 40], ronc_nb: [(QUEEN + 7) * TS + 40, (BLOOR + 7) * TS + 40] };
  for (const c of [PS, RX]) { D.tprop('ttcstop', c - 2, QUEEN - 1, 8, 8); D.tprop('ttcstop', c + 5, QUEEN + 4, 8, 6); }
  const stopZone = (xs) => xs.map((s) => [s - 112, s + 24]);
  D.parkCars(QUEEN, 'W', undefined, stopZone(stops.queen_wb), PS + 4);
  D.parkCars(QUEEN + 3, 'E', undefined, stopZone(stops.queen_eb), PS + 4);

  // ---------- the civic upgrade: Parkside slowed by design ----------
  const calm = { tiles: [], addProps: [], removeTag: 'camstump' };
  for (const y of [24, 32, 50, 58, 70, 80]) for (const x of [PS + 1, PS + 2]) calm.tiles.push([x, y, 'hump_ns']);
  for (const y of [40, 41]) for (let x = PS; x <= PS + 3; x++) calm.tiles.push([x, y, 'raised_ns']); // raised school crosswalk
  for (const y of [28, 46, 64]) calm.tiles.push([PS + 1, y, 'slow_stencil']);
  for (const y of [38, 43]) { calm.addProps.push({ type: 'prop', key: 'planter', x: (PS + 1) * TS + 2, y: y * TS + 12, solid: 6 }); calm.addProps.push({ type: 'prop', key: 'planter', x: (PS + 3) * TS - 2, y: y * TS + 12, solid: 6 }); }
  calm.addProps.push({ type: 'prop', key: 'speedcam', x: (PS - 1) * TS + 10, y: CAMY * TS + 14 });
  D.improvements = { parkside_calming: calm };

  // ---------- traffic + walkers ----------
  D.ewLanes('bloor', BLOOR, {});
  D.lanes.push({ id: 'bloor_bike_wb', axis: 'x', dir: -1, pos: BLOOR * TS + 7, bikeOnly: true }, { id: 'bloor_bike_eb', axis: 'x', dir: 1, pos: (BLOOR + 3) * TS + 9, bikeOnly: true });
  D.ewLanes('queen', QUEEN, { streetcar: true, stopsWB: stops.queen_wb, stopsEB: stops.queen_eb, cyclists: 'mixed' });
  D.nsLanes('parkside', PS, { calm: 'parkside_calming', speedy: true });
  D.nsLanes('ronc', RX, { streetcar: true });
  D.lanes.find((l) => l.id === 'ronc_sb').stops = stops.ronc_sb;
  D.lanes.find((l) => l.id === 'ronc_nb').stops = stops.ronc_nb;
  D.walkways.push(...trails, ...roads); // the car-free roads are full of walkers

  D.labels.push(
    { text: 'BLOOR ST W', x: 28 * TS, y: (BLOOR + 2) * TS },
    { text: 'DUNDAS ST W', x: 101 * TS, y: (BLOOR + 2) * TS },
    { text: 'THE QUEENSWAY', x: 30 * TS, y: (QUEEN + 2) * TS },
    { text: 'QUEEN ST W', x: 101 * TS, y: (QUEEN + 2) * TS },
    { text: 'PARKSIDE DR', x: (PS + 2) * TS, y: 50 * TS, vertical: true },
    { text: 'RONCESVALLES', x: (RX + 2) * TS, y: 50 * TS, vertical: true },
    { text: 'HIGH PARK', x: U(0.62) * TS, y: V(0.14) * TS, kind: 'landmark' },
    { text: 'GRENADIER POND', x: U(0.24) * TS, y: V(0.85) * TS, kind: 'landmark' },
    { text: 'SCHOOL', x: (SCHOOL.x0 + 6) * TS, y: (SCHOOL.base - 4) * TS, kind: 'landmark' },
    { text: 'QUEEN WEST >', x: (W - 4) * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
  );
  // hidden extra lives: behind the greenhouse, and in the north woods above the pond
  const lifeTokens = [{ x: gh.x + 100, y: gh.y + 10 }, { x: P(0.10, 0.20)[0], y: P(0.10, 0.20)[1] }];
  return D.out({ spawn: { x: (W - 3) * TS, y: (QUEEN - 2) * TS + 8 }, lifeTokens });
}
