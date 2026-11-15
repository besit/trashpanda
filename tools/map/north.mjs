// North district (M4): Don Mills Rd + Eglinton Ave E, above Queen West and Downtown in the game's folded city.
// Fictionalized but faithful in its parts:
// - the Ontario Science Centre (Raymond Moriyama, 1969) on the east side of Don Mills just south of Eglinton,
//   its pods stepping down into the ravine behind it; closed since June 2024, boarded up here until mission 6
// - the Don's East Branch ravine (E. T. Seton Park) running north-south east of the centre, with a trail; the
//   streets cross it on bridges
// - Flemingdon Park's apartment slabs east of the ravine; Don Mills' postwar houses west of it; Line 5 Eglinton's
//   Science Centre station entrances; the Ontario Line's northern terminus arrives with mission 9's payoff
// Exits: south on Leslie -> Queen West (Ossington / Bellwoods come up to it), south on Don Mills -> Downtown
// (Spadina / University / Bay come up to it).
import { District, TS, nearPolyline } from './common.mjs';

export const W = 112, H = 88;
export const EG = 28, WY = 60;    // Eglinton Ave E rows 28..31, Wynford Dr rows 60..63
export const LS = 16, DM = 58;    // Leslie St cols 16..19, Don Mills Rd cols 58..61
const RAV = { x0: 80, x1: 96 };   // the ravine
const CREEK = { x0: 86, x1: 88 };

export function generateNorth() {
  const D = new District('north', W, H, 1969);
  const r = D.r;
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  D.fill(0, 0, W - 1, 2, 'laneway');

  // ---------- the ravine: lawns, the creek, the trail ----------
  const trailX = [];
  for (let y = 0; y < H; y++) {
    const wob = Math.round(Math.sin(y / 9) * 1.5);
    for (let x = RAV.x0; x <= RAV.x1; x++) D.set(x, y, `lawn${(x * 5 + y) % 3}`);
    for (let x = CREEK.x0 + wob; x <= CREEK.x1 + wob; x++) D.set(x, y, x === CREEK.x0 + wob ? 'shore_w' : x === CREEK.x1 + wob ? 'shore_e' : `water${(x + y) % 3}`);
    D.set(RAV.x0 + 2, y, 'trail'); trailX.push(RAV.x0 + 2);
  }
  // trees down both slopes
  for (let i = 0; i < 220; i++) {
    const x = r.int(RAV.x0, RAV.x1), y = r.int(1, H - 2);
    if (x >= CREEK.x0 - 2 && x <= CREEK.x1 + 2) continue;
    if (x === RAV.x0 + 2 || x === RAV.x0 + 1 || x === RAV.x0 + 3) continue;
    if ([EG, WY].some((row) => y >= row - 4 && y <= row + 7)) continue;
    if (r.chance(0.3)) D.tprop(r.pick(['tree_a', 'tree_c', 'tree_oak']), x, y, r.int(2, 14), 12, { solid: 5 });
  }
  // the creek is solid; the slopes are rideable (M4: the ravine is a place to ride, not a wall)
  for (let y = 0; y < H; y++) {
    if ([EG, WY].some((row) => y >= row - 3 && y <= row + 6)) continue;
    const wob = Math.round(Math.sin(y / 9) * 1.5);
    D.prop('blank', (CREEK.x0 + wob) * TS, (y + 1) * TS, { solidBox: [0, -TS, 3 * TS, TS], invisible: true });
  }
  for (const [u, v, k] of [[CREEK.x0 + 1, 12, 'woodduck'], [CREEK.x0 + 1, 44, 'woodduck'], [CREEK.x0 + 1, 76, 'swan']]) D.critters.push({ kind: k, x: u * TS + 8, y: v * TS });

  // ---------- streets (the E-W ones cross the ravine on bridges) ----------
  D.ewStreet(EG, { tracks: false }); D.ewStreet(WY, { tracks: false });
  for (const row of [EG, WY]) for (let x = RAV.x0; x <= RAV.x1; x++) { D.set(x, row - 3, 'bridge_rail_n'); D.set(x, row + 6, 'bridge_rail_s'); }
  D.nsStreet(LS, 0, H - 1); D.nsStreet(DM, 0, H - 1);
  for (const row of [EG, WY]) { D.cross(LS, row, { ewTracks: false }); D.cross(DM, row, { ewTracks: false }); }
  D.exitNS('s', LS, 'queenwest', 'leslie', 'ossington');
  D.exitNS('s', DM, 'downtown', 'donmills', 'university');
  const bricks = ['red', 'buff', 'cream', 'grey', 'darkred'];
  const houses = ['house', 'house', 'baygable'];

  // ---------- the Science Centre: east of Don Mills, south of Eglinton, its pods toward the ravine ----------
  const SCX = DM + 5, SCW = 14;
  D.fill(SCX - 1, EG + 7, SCX + SCW, EG + 12, (x, y) => `plaza${(x + y) % 2}`);
  const sc = D.addBuilding(SCX * TS, SCW * TS, { w: SCW * TS, d: 64, floors: 1, seed: 1969, kind: 'sciencecentre' }, { base: (EG + 13) * TS }, { graffiti: null });
  D.landmarks.push({ id: 'sciencecentre', x: (SCX + 4) * TS, y: sc.base + 10, label: 'ONTARIO SCIENCE CENTRE', fact: 'RAYMOND MORIYAMA, 1969.\nBUILT DOWN THE RAVINE\nAROUND THE TREES.\nCLOSED SINCE JUNE 2024.' });
  // boarded up (mission 6 takes the boards down)
  for (let i = 0; i < 3; i++) D.prop('plywood', (SCX + 2.6) * TS + i * 26, sc.base + 1, { tag: 'boards', depth: sc.base + 1 });
  D.prop('closedsign', (SCX + 5) * TS, sc.base - 30, { tag: 'boards', depth: sc.base + 2 });
  D.markers.push({ id: 'save_the_science', x: (SCX + 8) * TS, y: (EG + 11) * TS, label: 'SAVE THE SCIENCE' });
  D.labels.push({ text: 'SCIENCE CENTRE', x: (SCX + 7) * TS, y: (EG + 15) * TS, kind: 'landmark' });
  for (const x of [SCX - 1, SCX + SCW]) D.tprop('tree_b', x, EG + 10, 8, 10, { solid: 4 });
  // Line 5's Science Centre station entrances at Don Mills + Eglinton
  D.tprop('subway', DM - 2, EG + 6, 8, 12, { solid: 6 }); D.tprop('subway', DM + 5, EG - 3, 8, 2, { solid: 6 });
  D.labels.push({ text: 'LINE 5 EGLINTON', x: (DM - 8) * TS, y: (EG - 5) * TS, kind: 'landmark' });

  // ---------- west of the ravine: Don Mills' houses, Eglinton's shops ----------
  for (const [a, b] of [[0, LS], [LS + 4, DM], [DM + 4, RAV.x0 - 1]]) {
    D.row(a, b, { base: (EG - 3) * TS }, 'shop', [1, 2], bricks);
    D.row(a, b, { top: 4 * TS }, houses, [1], bricks, 40);
  }
  for (const [a, b] of [[0, LS], [LS + 4, DM]]) {
    D.row(a, b, { top: (EG + 7) * TS }, houses, [1, 1, 2], bricks, 40);
    D.row(a, b, { base: (WY - 3) * TS }, houses, [1], bricks, 40);
    D.row(a, b, { top: (WY + 7) * TS }, houses, [1, 2], bricks, 40);
  }
  D.row(DM + 4, RAV.x0 - 1, { top: (WY + 7) * TS }, houses, [1], bricks, 40);
  for (const [a, b] of [[0, LS], [LS + 4, DM], [DM + 4, RAV.x0 - 1]]) D.row(a, b, { base: (H - 3) * TS }, houses, [1, 2], bricks, 40);
  // a parkette between the house rows west of Don Mills: lawn, a playground, benches
  const PK = { x0: 26, x1: 46, y0: EG + 15, y1: WY - 9 };
  D.fill(PK.x0, PK.y0, PK.x1, PK.y1, (x, y) => `lawn${(x * 5 + y) % 3}`);
  D.prop('playground', (PK.x0 + 6) * TS, (PK.y0 + 7) * TS);
  for (const x of [PK.x0 + 12, PK.x0 + 16]) D.prop('bench', x * TS, (PK.y0 + 4) * TS);
  for (let i = 0; i < 8; i++) D.tprop(r.pick(['tree_a', 'tree_b', 'tree_c']), r.int(PK.x0 + 1, PK.x1 - 1), r.int(PK.y0 + 1, PK.y1 - 1), 8, 10, { solid: 4 });
  // backyard trees
  for (let i = 0; i < 90; i++) { const x = r.int(1, DM - 2), y = r.pick([r.int(12, 16), r.int(42, 48), r.int(74, 80)]); if (!D.isNS(x) && r.chance(0.5)) D.tprop(r.chance(0.5) ? 'tree_a' : 'tree_c', x, y, r.int(2, 14), 12, { solid: 5 }); }

  // ---------- east of the ravine: Flemingdon Park's slabs on their lawns ----------
  for (let y = 3; y < H - 3; y++) for (let x = RAV.x1 + 1; x < W; x++) D.set(x, y, `lawn${(x * 5 + y) % 3}`);
  const slabs = (y0, y1) => {
    let x = RAV.x1 + 2;
    while (x + 4 < W) { const w = r.pick([4, 5, 6]); if (x + w >= W) break; D.addBuilding(x * TS, w * TS, { w: w * TS, d: 40, floors: r.int(10, 15), seed: 1960 + D.bid, kind: 'slab' }, { base: y1 * TS }, { graffiti: null }); x += w + r.int(1, 2); }
    for (let i = 0; i < 10; i++) D.tprop(r.pick(['tree_a', 'tree_b']), r.int(RAV.x1 + 1, W - 2), r.int(y0, y1 - 1), 8, 10, { solid: 4 });
  };
  slabs(6, EG - 4); slabs(EG + 8, WY - 4); slabs(WY + 8, H - 4);
  D.labels.push({ text: 'FLEMINGDON PARK', x: (RAV.x1 + 8) * TS, y: (EG + 20) * TS, kind: 'landmark' });

  // ---------- the ravine trail + the park ----------
  const trail = trailX.map((x, y) => [x * TS + 8, y * TS + 8]).filter((_, y) => y % 4 === 0);
  D.landmarks.push({ id: 'seton', x: (RAV.x0 + 3) * TS, y: (EG + 18) * TS, label: 'E. T. SETON PARK', fact: 'THE DON\'S EAST BRANCH.\nTHE SCIENCE CENTRE\'S PODS\nSTEP DOWN INTO THIS RAVINE.' });
  D.labels.push({ text: 'THE RAVINE', x: (RAV.x0 + 8) * TS, y: 44 * TS, kind: 'landmark' }, { text: 'DON RIVER (EAST)', x: (CREEK.x0 + 1) * TS, y: 70 * TS, vertical: true, kind: 'landmark' });
  for (let y = 6; y < H - 6; y += 14) if (![EG, WY].some((row) => Math.abs(y - row) < 8)) { D.prop('bench', (RAV.x0 + 4) * TS, y * TS); D.prop('bin_green', (RAV.x0 + 4) * TS + 14, y * TS); }
  // the ravine is solid at its banks only where the streets' bridge rails run (you ride down into it elsewhere)

  // ---------- mission 6's payoff: the boards come down, the centre reopens ----------
  const reopen = { tiles: [], addProps: [{ type: 'prop', key: 'openbanner', x: (SCX + 5) * TS, y: sc.base - 30, depth: sc.base + 2 }, { type: 'prop', key: 'bikering', x: (SCX + 1) * TS, y: (EG + 11) * TS }, { type: 'prop', key: 'bikering', x: (SCX + 12) * TS, y: (EG + 11) * TS }, { type: 'prop', key: 'bench', x: (SCX + 3) * TS, y: (EG + 12) * TS }], removeTag: 'boards' };
  // mission 9's payoff: the Ontario Line's northern terminus opens beside the Science Centre
  const ol = { tiles: [], addProps: [{ type: 'prop', key: 'subway', x: (SCX + 10) * TS + 8, y: (EG + 12) * TS, solid: 6 }, { type: 'prop', key: 'subway', x: (DM - 3) * TS + 8, y: (EG + 7) * TS + 12, solid: 6 }] };
  D.improvements = { science_reopened: reopen, ontario_line: ol };

  // ---------- furniture, traffic, walkers ----------
  for (const row of [EG, WY]) { D.furnish(row, 'n', 0, RAV.x0 - 1); D.furnish(row, 's', 0, RAV.x0 - 1); D.furnish(row, 'n', RAV.x1 + 1, W); D.furnish(row, 's', RAV.x1 + 1, W); }
  for (const c of [LS, DM]) for (const row of [EG, WY]) { D.tprop('ttcstop', c - 2, row - 1, 8, 8); D.tprop('ttcstop', c + 5, row + 4, 8, 6); }
  D.parkCars(EG, 'W', undefined, [[(DM - 8) * TS, (DM + 6) * TS]]); D.parkCars(EG + 3, 'E', undefined, [[(DM - 8) * TS, (DM + 6) * TS]]);
  D.ewLanes('eglinton', EG, {}); D.ewLanes('wynford', WY, { light: true });
  D.nsLanes('leslie', LS, {}); D.nsLanes('donmills', DM, {});
  D.walkways.push(trail, [[(SCX - 1) * TS, (EG + 8) * TS], [(SCX + SCW) * TS, (EG + 8) * TS]]);

  D.labels.push(
    { text: 'EGLINTON AVE E', x: 36 * TS, y: (EG + 2) * TS }, { text: 'WYNFORD DR', x: 36 * TS, y: (WY + 2) * TS },
    { text: 'LESLIE', x: (LS + 2) * TS, y: 46 * TS, vertical: true }, { text: 'DON MILLS', x: (DM + 2) * TS, y: 46 * TS, vertical: true },
    { text: 'V QUEEN WEST', x: (LS + 2) * TS, y: (H - 2) * TS, kind: 'exit' }, { text: 'V DOWNTOWN', x: (DM + 2) * TS, y: (H - 2) * TS, kind: 'exit' },
  );
  // hearts: one on the ravine trail, one behind a house
  const lifeTokens = [{ x: (RAV.x0 + 2) * TS + 8, y: 44 * TS }, D.hiddenHeart(30 * TS, 46 * TS, { x: (RAV.x1 + 4) * TS, y: 5 * TS })];
  const eggs = [{ id: 'ravine', x: (RAV.x0 + 1) * TS, y: (EG + 14) * TS, w: 4 * TS, h: 6 * TS, label: 'THE RAVINE BEHIND THE SCIENCE CENTRE', fact: 'MORIYAMA PUT THE PODS DOWN\nTHE SLOPE SO THE TREES\nCOULD STAY.' }];
  return D.out({ spawn: { x: (DM + 2) * TS, y: (H - 4) * TS }, lifeTokens, eggs });
}
