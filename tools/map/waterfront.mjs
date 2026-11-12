// Waterfront district (south of Downtown, M3). Fictionalized but faithful in its parts:
// - the elevated Gardiner Expressway overhead, Lake Shore Blvd underneath
// - the CN Tower and the domed stadium; condo towers along Queens Quay (streetcar in a grassy median)
// - the Martin Goodman Trail, the promenade and boardwalk, Sugar Beach's pink umbrellas
// - out west on their islands: the Cinesphere and the pods... and Dog Fraud's fictional MEGA SPA,
//   fenced off and private (mission 8 opens it up)
// Spadina, University and Bay come down from Downtown across the north edge (exits matched by name).
import { District, TS } from './common.mjs';

export const W = 120, H = 74;
export const LAKESHORE = 12, QQ = 40;
export const SP = 14, UN = 70, BY = 102; // same columns as Downtown: the streets line up
const LAKE_Y = 53;

export function generateWaterfront() {
  const D = new District('waterfront', W, H, 1972);
  const r = D.r;
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  // ---------- streets ----------
  D.ewStreet(LAKESHORE, { tracks: false });
  D.ewStreet(QQ, { tracks: false });
  for (let x = 0; x < W; x++) { D.set(x, QQ + 1, `tracks_grass${x % 2}`); D.set(x, QQ + 2, `tracks_grass${(x + 1) % 2}`); } // the streetcar median
  for (const c of [SP, UN, BY]) D.nsStreet(c, 0, QQ + 3, { tracks: c === SP });
  for (const c of [SP, UN, BY]) { D.cross(c, LAKESHORE, { ewTracks: false, nsTracks: c === SP }); D.cross(c, QQ, { tee: false, ewTracks: false, nsTracks: c === SP }); }
  D.exitNS('n', SP, 'downtown', 'spadina'); D.exitNS('n', UN, 'downtown', 'university'); D.exitNS('n', BY, 'downtown', 'bay');
  // the Gardiner, overhead: deck segments drawn above everything, piers on the north side of Lake Shore
  for (let x = 0; x < W * TS; x += 32) D.prop('gardiner', x, (LAKESHORE - 3) * TS + 2, { depth: 99999 });

  // ---------- the trail, the promenade, the boardwalk, the lake ----------
  for (let x = 0; x < W; x++) {
    D.set(x, QQ + 7, `mgt${x % 4 === 0 ? 0 : 1}`); D.set(x, QQ + 8, `mgt${(x + 2) % 4 === 0 ? 0 : 1}`);
    D.set(x, QQ + 9, `plaza${x % 2}`); D.set(x, QQ + 10, `plaza${(x + 1) % 2}`);
    D.set(x, QQ + 11, `deck${x % 2}`); D.set(x, QQ + 12, `deck${(x + 1) % 2}`);
    D.set(x, LAKE_Y, 'shore_n');
    for (let y = LAKE_Y + 1; y < H; y++) D.set(x, y, `water${(x * 3 + y) % 3}`);
  }
  for (let x = 3; x < W; x += 7) { D.tprop('bench', x, QQ + 9, 8, 13); if (x % 14 === 3) D.tprop('tree_b', x + 2, QQ + 10, 8, 10, { solid: 4 }); D.tprop('parklamp', x + 4, QQ + 11, 8, 8); }
  // sailboats + a ferry out on the lake
  for (const [x, y] of [[30, 60], [55, 64], [80, 58], [96, 66], [44, 70]]) D.critters.push({ kind: 'sailboat', x: x * TS, y: y * TS });

  // ---------- between Lake Shore and Queens Quay ----------
  // the CN Tower + the domed stadium (west of University)
  D.prop('cntower', 34 * TS, 34 * TS, { solidBox: [-14, -10, 28, 10], landmark: 'CN TOWER' });
  D.landmarks.push({ id: 'cntower', x: 34 * TS, y: 34 * TS + 12, label: 'THE CN TOWER', fact: 'OPENED 1976. 553 M TALL.\nTHE WORLD\'S TALLEST\nTOWER UNTIL 2007.' });
  D.prop('stadium', 52 * TS, 36 * TS, { solidBox: [-84, -40, 168, 38] });
  D.labels.push({ text: 'CN TOWER', x: 34 * TS, y: 22 * TS, kind: 'landmark' }, { text: 'STADIUM', x: 52 * TS, y: 30 * TS, kind: 'landmark' });
  // condo towers facing Queens Quay (east of University), low Harbourfront buildings by Spadina
  const glass = ['blue', 'teal', 'dark', 'sky'];
  for (const [a, b] of [[UN + 4, BY], [BY + 4, W]]) {
    let x = a;
    while (x < b) { let w = r.pick([3, 4, 5]); if (x + w > b) w = b - x; if (w < 3) break; D.addBuilding(x * TS, w * TS, { w: w * TS, d: 40, floors: r.int(10, 14), glass: r.pick(glass), seed: 300 + D.bid, kind: 'tower' }, { base: (QQ - 3) * TS }, { graffiti: null }); x += w; }
  }
  D.row(0, SP, { base: (QQ - 3) * TS }, 'shop', [1, 2], ['cream', 'grey', 'buff']);
  D.row(SP + 4, 26, { base: (QQ - 3) * TS }, 'shop', [1, 2], ['cream', 'grey', 'buff']);
  D.labels.push({ text: 'HARBOURFRONT', x: 8 * TS, y: (QQ - 6) * TS, kind: 'landmark' });
  // mid-rise blocks along the south side of Lake Shore (east of University), under the Gardiner's shadow
  for (const [a, b] of [[UN + 4, BY], [BY + 4, W]]) {
    let x = a;
    while (x < b) { let w = r.pick([3, 4]); if (x + w > b) w = b - x; if (w < 3) break; D.addBuilding(x * TS, w * TS, { w: w * TS, d: 40, floors: r.int(3, 4), brick: r.pick(['red', 'buff', 'darkred']), seed: 700 + D.bid, kind: 'warehouse' }, { top: (LAKESHORE + 7) * TS }, { graffiti: null }); x += w; }
  }
  // Roundhouse Park: lawn, a path and trees around the tower + the stadium; a green strip north of Harbourfront
  const parkTree = (x0, x1, y0, y1, n, skip) => { for (let i = 0; i < n; i++) { const x = r.int(x0, x1), y = r.int(y0, y1); if (!skip?.(x, y)) D.tprop(r.chance(0.3) ? 'tree_c' : r.chance(0.5) ? 'tree_a' : 'tree_b', x, y, 8, 10, { solid: 4 }); } };
  D.fill(SP + 4, LAKESHORE + 7, UN - 1, QQ - 4, (x, y) => `lawn${(x * 5 + y) % 3}`);
  for (let x = SP + 4; x < UN; x++) D.set(x, 28, 'path');
  parkTree(SP + 5, UN - 2, LAKESHORE + 7, 26, 26, (x, y) => (x > 29 && x < 39) || (x > 44 && x < 60 && y > 24));
  D.fill(0, LAKESHORE + 7, SP - 1, QQ - 8, (x, y) => `lawn${(x * 5 + y) % 3}`);
  parkTree(1, SP - 2, LAKESHORE + 8, QQ - 9, 6);
  D.prop('bench', 24 * TS, 28 * TS + 12); D.prop('bench', 42 * TS, 28 * TS + 12); D.prop('parklamp', 33 * TS, 28 * TS); D.prop('parklamp', 62 * TS, 28 * TS);

  // ---------- Sugar Beach (east) ----------
  for (let y = QQ + 9; y <= LAKE_Y; y++) for (let x = 106; x < 118; x++) D.set(x, y, y === LAKE_Y ? 'shore_n' : 'sand');
  for (let i = 0; i < 9; i++) D.prop('pinkumbrella', (107 + (i % 5) * 2.2) * TS, (QQ + 10 + Math.floor(i / 5) * 2) * TS + 4);
  D.landmarks.push({ id: 'sugarbeach', x: 112 * TS, y: (QQ + 13) * TS, label: 'SUGAR BEACH', fact: 'PINK UMBRELLAS NEXT TO\nA WORKING SUGAR REFINERY.' });
  D.labels.push({ text: 'SUGAR BEACH', x: 112 * TS, y: (QQ + 8) * TS, kind: 'landmark' });

  // ---------- the island (west): the Cinesphere, the pods... and the MEGA SPA ----------
  // a causeway leads out to it; Dog Fraud's fictional MEGA SPA has fenced it (and the boardwalk) off
  const isLand = (x, y) => Math.hypot((x - 16) / 15.5, (y - (LAKE_Y + 10)) / 6.5) < 1;
  for (let y = LAKE_Y + 2; y < H; y++) for (let x = 0; x < 34; x++) if (isLand(x, y)) D.set(x, y, `lawn${(x * 3 + y) % 3}`);
  for (let y = LAKE_Y; y < LAKE_Y + 5; y++) for (const x of [20, 21, 22]) D.set(x, y, `deck${(x + y) % 2}`);
  // shoreline edges: water tiles that touch land get the matching shore tile
  const land = (x, y) => { const t = D.get(x, y); return !!t && !t.startsWith('water') && !t.startsWith('shore'); };
  for (let y = LAKE_Y + 1; y < H; y++) for (let x = 0; x < 36; x++) {
    if (!D.get(x, y)?.startsWith('water')) continue;
    if (land(x, y + 1)) D.set(x, y, 'shore_s'); else if (land(x, y - 1) && y > LAKE_Y + 1) D.set(x, y, 'shore_n'); else if (land(x + 1, y)) D.set(x, y, 'shore_e'); else if (land(x - 1, y)) D.set(x, y, 'shore_w');
  }
  D.prop('cinesphere', 7 * TS, (LAKE_Y + 12) * TS);
  D.prop('pod', 4 * TS, (LAKE_Y + 6) * TS); D.prop('pod', 10 * TS, (LAKE_Y + 4) * TS + 8);
  D.addBuilding(17 * TS, 11 * TS, { w: 11 * TS, d: 40, floors: 1, seed: 95, kind: 'megaspa' }, { base: (LAKE_Y + 14) * TS }, { graffiti: null });
  // the fences: a locked gate across the causeway, and PRIVATE fencing along the boardwalk's edge
  for (const x of [20, 21, 22]) D.tprop('spafence', x, LAKE_Y, 0, 4, { solidBox: [0, -4, 16, 4], tag: 'spafence' });
  for (let x = 0; x < 34; x++) if (x < 20 || x > 22) D.tprop('spafence', x, LAKE_Y, 0, 2, { tag: 'spafence' });
  D.landmarks.push({ id: 'megaspa', x: 22 * TS, y: (QQ + 11) * TS, label: 'THE MEGA SPA (FICTIONAL)', fact: 'PRIVATE. PAID ENTRY.\nYOUR SHORELINE,\nTHEIR CHECKOUT.' });
  D.markers.push({ id: 'waterfront_heist', x: 26 * TS, y: (QQ + 11) * TS + 8, label: 'THE WATERFRONT HEIST' });
  D.labels.push({ text: 'MEGA SPA', x: 23 * TS, y: (LAKE_Y + 8) * TS, kind: 'landmark' }, { text: 'THE PODS', x: 8 * TS, y: (LAKE_Y + 17) * TS, kind: 'landmark' });

  // ---------- the lake is solid (runs of water per row; the island + causeway stay rideable) ----------
  for (let y = LAKE_Y; y < H; y++) {
    let x = 0;
    while (x < W) {
      if (land(x, y)) { x++; continue; }
      let e = x; while (e < W && !land(e, y)) e++;
      D.prop('blank', x * TS, (y + 1) * TS, { solidBox: [0, -TS + (y === LAKE_Y ? 6 : 0), (e - x) * TS, TS], invisible: true });
      x = e;
    }
  }

  // ---------- mission 8's payoff: the fences come down, the shore is public again ----------
  const pub = { tiles: [], addProps: [], removeTag: 'spafence' };
  for (let y = LAKE_Y + 4; y < LAKE_Y + 8; y++) for (let x = 4; x < 16; x++) if (isLand(x, y)) pub.tiles.push([x, y, 'sand']); // a public beach
  for (const [x, y] of [[13, LAKE_Y + 9], [15, LAKE_Y + 11], [29, LAKE_Y + 8], [30, LAKE_Y + 11], [2, LAKE_Y + 9]]) pub.addProps.push({ type: 'prop', key: 'tree_a', x: x * TS + 8, y: y * TS + 12, solid: 4 });
  for (const [x, y] of [[6, LAKE_Y + 5], [9, LAKE_Y + 6], [12, LAKE_Y + 5]]) pub.addProps.push({ type: 'prop', key: 'pinkumbrella', x: x * TS + 8, y: y * TS + 12 });
  for (const [x, y] of [[14, LAKE_Y + 8], [27, LAKE_Y + 4]]) pub.addProps.push({ type: 'prop', key: 'picnic', x: x * TS + 8, y: y * TS + 8, solid: 6 });
  pub.addProps.push({ type: 'prop', key: 'bikering', x: 24 * TS, y: (QQ + 10) * TS }, { type: 'prop', key: 'bench', x: 19 * TS, y: (LAKE_Y + 6) * TS });
  D.improvements = { public_waterfront: pub };

  // ---------- furniture, traffic ----------
  D.furnish(LAKESHORE, 's', 0, W, { trees: false }); D.furnish(QQ, 'n', 26, UN, {}); D.furnish(QQ, 's', 0, W, { trees: false });
  D.ewLanes('lakeshore', LAKESHORE, {});
  // Queens Quay: the streetcar in its own grassy median, one car lane each side
  D.lanes.push({ id: 'qqt_wb', axis: 'x', dir: -1, pos: (QQ + 1) * TS + 8, streetcar: true, transitOnly: true }, { id: 'qqt_eb', axis: 'x', dir: 1, pos: (QQ + 2) * TS + 8, streetcar: true, transitOnly: true });
  D.lanes.push({ id: 'qq_wb', axis: 'x', dir: -1, pos: QQ * TS + 8, light: true }, { id: 'qq_eb', axis: 'x', dir: 1, pos: (QQ + 3) * TS + 8, light: true });
  D.lanes.push({ id: 'mgt_wb', axis: 'x', dir: -1, pos: (QQ + 7) * TS + 8, bikeOnly: true }, { id: 'mgt_eb', axis: 'x', dir: 1, pos: (QQ + 8) * TS + 8, bikeOnly: true });
  D.walkways.push([[0, (QQ + 10) * TS], [W * TS, (QQ + 10) * TS]], [[0, (QQ + 12) * TS], [W * TS, (QQ + 12) * TS]], [[0, (QQ - 2) * TS + 6], [W * TS, (QQ - 2) * TS + 6]]);
  for (const [c, name] of [[SP, 'spadina'], [UN, 'university'], [BY, 'bay']]) D.nsLanes(name, c, c === SP ? { streetcar: true } : {}, 0, QQ);
  D.labels.push(
    { text: 'GARDINER EXPWY', x: 60 * TS, y: (LAKESHORE - 3) * TS }, { text: 'LAKE SHORE BLVD', x: 86 * TS, y: (LAKESHORE + 2) * TS },
    { text: 'QUEENS QUAY', x: 86 * TS, y: (QQ + 2) * TS }, { text: 'MARTIN GOODMAN TRAIL', x: 56 * TS, y: (QQ + 8) * TS },
    { text: 'LAKE ONTARIO', x: 70 * TS, y: 64 * TS, kind: 'landmark' },
    { text: 'SPADINA', x: (SP + 2) * TS, y: 26 * TS, vertical: true }, { text: 'UNIVERSITY', x: (UN + 2) * TS, y: 26 * TS, vertical: true }, { text: 'BAY', x: (BY + 2) * TS, y: 26 * TS, vertical: true },
    { text: '^ DOWNTOWN', x: (UN + 2) * TS, y: 2 * TS, kind: 'exit' },
  );
  // hidden extra lives: behind the stadium, and at the far end of Sugar Beach
  const lifeTokens = [{ x: 60 * TS, y: 20 * TS }, { x: 118 * TS, y: (QQ + 12) * TS }];
  return D.out({ spawn: { x: (UN + 2) * TS, y: 4 * TS }, lifeTokens });
}
