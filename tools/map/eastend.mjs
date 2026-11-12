// East End district (east of Downtown, M3; re-laid in M3.1). Fictionalized but faithful in its parts:
// - the Don Valley on the west edge: the river, the Lower Don trail and the Don Valley Parkway, crossed by
//   the Gerrard, Dundas and Queen St bridges (the Queen St bridge's inscription: "THIS RIVER I STEP IN IS
//   NOT THE RIVER I STAND IN", Eldon Garnet's 1996 artwork), plus the Riverdale Park footbridge
// - north -> south: Gerrard, Dundas, Queen (M3.1, Ivan: Gerrard is north of Dundas here)
// - Riverdale Park East (the hill with the skyline view) and the Don Jail (1864) on Gerrard just south of it
// - Broadview Ave (504 streetcar) with the Broadview Hotel at Queen; East Chinatown at Gerrard + Broadview
// - Queen St E through Riverside and Leslieville (501)
// - MEGAMART and its sea of parking south of Queen: mission 7 turns it into a park.
import { District, TS, nearPolyline } from './common.mjs';

export const W = 110, H = 104;
export const GERRARD = 30, DUNDAS = 51, QUEEN = 77;
export const BV = 34;    // Broadview Ave cols 34..37 (streetcar)
export const CW = 64;    // Carlaw Ave cols 64..67
export const LS = 94;    // Leslie St cols 94..97
const RIVER = { x0: 4, x1: 8 }, DVP = { x0: 11, x1: 16 };
const FB = 12;           // the Riverdale Park footbridge deck (rows 12..13)
const BRIDGES = [GERRARD, DUNDAS, QUEEN];

export function generateEastEnd() {
  const D = new District('eastend', W, H, 1996);
  const r = D.r;
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  D.fill(0, 0, W - 1, 2, 'laneway');

  // ---------- the Don Valley: river, trail, DVP ----------
  const trailX = [];
  for (let y = 0; y < H; y++) {
    const wob = Math.round(Math.sin(y / 7) * 1.2);
    for (let x = RIVER.x0 + wob; x <= RIVER.x1 + wob; x++) D.set(x, y, x === RIVER.x0 + wob ? 'shore_w' : x === RIVER.x1 + wob ? 'shore_e' : `water${(x + y) % 3}`);
    D.set(RIVER.x1 + wob + 1, y, 'trail'); D.set(RIVER.x1 + wob + 2, y, 'trail'); // the Lower Don trail
    trailX.push(RIVER.x1 + wob + 2);
    for (let x = 0; x < RIVER.x0 + wob; x++) D.set(x, y, `lawn${(x + y) % 3}`);
    D.set(DVP.x0, y, 'curb_w'); D.set(DVP.x0 + 1, y, 'road_ns_w'); D.set(DVP.x0 + 2, y, 'median_ns'); D.set(DVP.x0 + 3, y, 'road_ns_e'); D.set(DVP.x0 + 4, y, 'road_ns_e'); D.set(DVP.x1, y, 'curb_e');
    for (const x of [DVP.x0 - 1, DVP.x1 + 1, DVP.x1 + 2]) D.set(x, y, `lawn${(x * 3 + y) % 3}`);
  }
  // the valley is solid from the west edge through the DVP: you cross on the bridges (and can't drop off
  // them onto the trail or the highway below)
  const onDeck = (y) => BRIDGES.some((row) => y >= row - 3 && y <= row + 6) || (y >= FB - 1 && y <= FB + 2);
  for (let y = 0; y < H; y++) {
    if (onDeck(y)) continue;
    D.prop('blank', 0, (y + 1) * TS, { solidBox: [0, -TS, (DVP.x1 + 1) * TS, TS], invisible: true });
  }

  // ---------- streets (the E-W ones cross the valley on bridges) ----------
  for (const row of BRIDGES) {
    D.ewStreet(row, { tracks: true });
    for (let x = 0; x <= DVP.x1 + 2; x++) { D.set(x, row - 3, 'bridge_rail_n'); D.set(x, row + 6, 'bridge_rail_s'); }
  }
  D.nsStreet(BV, 0, H - 1, { tracks: true });
  D.nsStreet(CW, GERRARD - 3, H - 1);
  D.nsStreet(LS, 0, H - 1);
  for (const row of BRIDGES) { D.cross(BV, row, { nsTracks: true }); D.cross(CW, row, { tee: row === GERRARD }); D.cross(LS, row); }
  D.exit('w', QUEEN, 'downtown', 'queen'); D.exit('w', DUNDAS, 'downtown', 'dundas');
  // the bridge inscription
  D.landmarks.push({ id: 'riversign', x: 9 * TS, y: (QUEEN - 3) * TS - 4, label: 'THE QUEEN ST BRIDGE', fact: 'THIS RIVER I STEP IN IS\nNOT THE RIVER I STAND IN\n(ELDON GARNET, 1996)' });

  // ---------- the Riverdale Park footbridge: Riverdale Park West -> East over the river + the DVP ----------
  for (let x = 0; x <= DVP.x1 + 2; x++) { D.set(x, FB - 1, 'bridge_rail_n'); D.set(x, FB, `sidewalk${x % 2}`); D.set(x, FB + 1, `sidewalk${(x + 1) % 2}`); D.set(x, FB + 2, 'bridge_rail_s'); }
  D.landmarks.push({ id: 'footbridge', x: 13 * TS, y: FB * TS + 4, label: 'RIVERDALE PARK BRIDGE', fact: 'WALK + BIKE ONLY. IT JOINS\nRIVERDALE PARK WEST + EAST\nHIGH OVER THE DON + THE DVP.' });
  D.labels.push({ text: 'RIVERDALE PK WEST', x: 3 * TS, y: (FB - 3) * TS, kind: 'landmark' });

  const bricks = ['red', 'buff', 'darkred', 'red', 'cream', 'grey', 'teal', 'mustard', 'lilac'];
  const houses = ['baygable', 'baygable', 'house', 'queenanne', 'secondempire'];
  // ---------- Riverdale Park East: the hill with the skyline view (north of Gerrard, west of Broadview) ----------
  const RP = { x0: DVP.x1 + 3, x1: BV - 2, y0: 3, y1: 19 }; // the bridge's deck ends at RP.x0: the first path picks it up
  D.fill(RP.x0, RP.y0, RP.x1, RP.y1, (x, y) => `lawn${(x * 5 + y) % 3}`);
  const rpPaths = [
    [[RP.x0 * TS - 4, (FB + 1) * TS], [(RP.x0 + 3) * TS, (FB + 1) * TS], [(RP.x0 + 5) * TS, (FB - 2) * TS], [(RP.x0 + 9) * TS, (RP.y0 + 3) * TS], [(BV - 1) * TS, (RP.y0 + 2) * TS]],
    [[(RP.x0 + 5) * TS, (FB - 2) * TS], [(RP.x0 + 9) * TS, (RP.y1 - 3) * TS], [(BV - 1) * TS, (RP.y1 - 1) * TS]],
  ];
  D.decals.push({ key: 'ee_paths', x: RP.x0 * TS, y: RP.y0 * TS, gen: { kind: 'paths', w: (RP.x1 - RP.x0 + 2) * TS, h: (RP.y1 - RP.y0 + 1) * TS, paths: rpPaths, ox: RP.x0 * TS, oy: RP.y0 * TS } });
  for (let i = 0; i < 260; i++) {
    const px = r.int(RP.x0 * TS + 8, RP.x1 * TS), py = r.int(RP.y0 * TS + 8, RP.y1 * TS);
    if (!nearPolyline(rpPaths, px, py, 18) && Math.abs(py - (FB + 1) * TS) > 26 && r.chance(0.12)) D.prop(r.chance(0.5) ? 'tree_a' : 'tree_c', px, py, { solid: 5 });
  }
  // benches at the top of the hill, facing the skyline
  for (const dx of [0, 1.5, 3]) D.prop('bench', (RP.x0 + 7 + dx) * TS, (RP.y0 + 5) * TS);
  D.landmarks.push({ id: 'riverdale', x: (RP.x0 + 8) * TS, y: (RP.y0 + 5) * TS + 8, label: 'RIVERDALE PARK EAST', fact: 'THE HILL WITH THE BEST\nVIEW OF THE SKYLINE.\nSUNSET STARTS HERE.' });
  D.labels.push({ text: 'RIVERDALE PARK EAST', x: ((RP.x0 + RP.x1) / 2 + 1) * TS, y: (RP.y0 + 9) * TS, kind: 'landmark' });
  // the Don Jail, on Gerrard just south of the park
  D.addBuilding((DVP.x1 + 3) * TS, 14 * TS, { w: 14 * TS, d: 64, floors: 3, seed: 1864, kind: 'donjail' }, { base: (GERRARD - 3) * TS }, { graffiti: null });
  D.landmarks.push({ id: 'donjail', x: (DVP.x1 + 10) * TS, y: (GERRARD - 3) * TS + 10, label: 'THE DON JAIL', fact: 'OPENED IN 1864 WITH 184\nCELLS. CLOSED IN 1977. NOW\nTHE HOSPITAL NEXT DOOR\'S\nOFFICES.' });

  // ---------- buildings ----------
  // north of Gerrard (east of Broadview): houses, then Gerrard's shops
  for (const [a, b] of [[BV + 4, LS], [LS + 4, W]]) {
    D.row(a, b, { top: 4 * TS }, houses, [1, 2], bricks, 40);
    // backyards between the houses and Gerrard's shops: big old trees
    for (let x = a; x < b; x += 2) if (r.chance(0.7)) D.tprop(r.chance(0.6) ? 'tree_a' : 'tree_c', x, r.int(12, 17), r.int(2, 14), 12, { solid: 5 });
    D.row(a, b, { base: (GERRARD - 3) * TS }, 'shop', [1, 2, 2], bricks);
  }
  for (const [a, b] of [[BV + 4, CW], [CW + 4, LS], [LS + 4, W]]) {
    D.row(a, b, { top: (GERRARD + 7) * TS }, houses, [1, 2], bricks, 40);
    D.row(a, b, { base: (DUNDAS - 3) * TS }, 'shop', [1, 2], bricks);
    D.row(a, b, { top: (DUNDAS + 7) * TS }, houses, [1, 2], bricks, 40);
    D.row(a, b, { base: (QUEEN - 3) * TS }, 'shop', [1, 2, 2, 3], bricks);
  }
  // Gerrard: East Chinatown at Broadview
  for (const x of [BV + 5, BV + 8, BV + 11, BV + 14]) D.tprop('lanterns', x, GERRARD - 3, 8, 2, { depth: (GERRARD - 3) * TS + 1 });
  D.labels.push({ text: 'EAST CHINATOWN', x: (BV + 10) * TS, y: (GERRARD - 5) * TS, kind: 'landmark' });
  // the Broadview Hotel on the corner of Queen + Broadview
  D.addBuilding((BV - 4) * TS, 4 * TS, { w: 4 * TS, d: 48, floors: 4, seed: 1891, kind: 'broadview' }, { base: (QUEEN - 3) * TS }, { graffiti: null });
  D.landmarks.push({ id: 'broadview', x: (BV - 2) * TS, y: (QUEEN - 3) * TS + 10, label: 'THE BROADVIEW HOTEL', fact: 'QUEEN + BROADVIEW.\nA RED-BRICK LANDMARK\nSINCE THE 1890S.' });
  D.row(DVP.x1 + 3, BV - 4, { base: (QUEEN - 3) * TS }, 'shop', [1, 2], bricks);
  D.row(DVP.x1 + 3, BV, { top: (GERRARD + 7) * TS }, houses, [1, 2], bricks, 40);
  D.row(DVP.x1 + 3, BV, { base: (DUNDAS - 3) * TS }, 'shop', [1, 2], bricks);
  D.row(DVP.x1 + 3, BV, { top: (DUNDAS + 7) * TS }, houses, [1, 2], bricks, 40);
  // south of Queen: Leslieville shop backs... and MEGAMART's parking lot (the mission site)
  const LOT = { x0: CW + 5, x1: LS - 2, y0: QUEEN + 7, y1: H - 3 };
  for (const [a, b] of [[DVP.x1 + 3, BV], [BV + 4, CW], [LS + 4, W]]) D.row(a, b, { top: (QUEEN + 7) * TS }, 'rear', [1, 1, 2], bricks, 48, { graffiti: [0, 1] });
  D.fill(LOT.x0, LOT.y0, LOT.x1, LOT.y1, 'lot');
  for (let y = LOT.y0 + 1; y < LOT.y1 - 4; y += 4) for (let x = LOT.x0 + 1; x < LOT.x1; x++) { D.set(x, y, x % 2 ? 'lot_stall' : 'lot_stop'); D.set(x, y + 1, x % 2 ? 'lot_stall' : 'lot'); }
  D.addBuilding(LOT.x0 * TS + 32, (LOT.x1 - LOT.x0 - 3) * TS, { w: (LOT.x1 - LOT.x0 - 3) * TS, d: 48, floors: 1, seed: 4, kind: 'bigbox' }, { base: (LOT.y1 + 2) * TS }, { graffiti: null });
  const COLORS = ['blue', 'red', 'white', 'yellow', 'teal', 'orange'];
  for (let y = LOT.y0 + 1; y < LOT.y1 - 6; y += 4) for (let x = LOT.x0 + 1; x < LOT.x1 - 1; x += 2) if (r.chance(0.55)) D.prop(r.chance(0.2) ? 'suv_S' : `car_${r.pick(COLORS)}_S`, x * TS + 16, (y + 1) * TS + 10, { solidBox: [-8, -14, 16, 18], tag: 'lotcars' });
  for (let x = LOT.x0 + 2; x < LOT.x1; x += 6) D.tprop('lotlight', x, LOT.y0 + 4, 8, 4, { tag: 'lotlights' });
  D.markers.push({ id: 'great_parking_lot', x: (LOT.x0 + 3) * TS, y: (QUEEN + 6) * TS, label: 'THE GREAT PARKING LOT' });
  D.labels.push({ text: 'MEGAMART PARKING', x: ((LOT.x0 + LOT.x1) / 2) * TS, y: (LOT.y0 + 4) * TS, kind: 'landmark' });

  // ---------- mission 7's payoff: the lot becomes a park ----------
  const park = { tiles: [], addProps: [], removeTag: 'lotcars' };
  for (let y = LOT.y0; y <= LOT.y1 - 4; y++) for (let x = LOT.x0; x <= LOT.x1; x++) park.tiles.push([x, y, (x + y) % 9 === 0 ? 'flowerbed' : `lawn${(x * 5 + y) % 3}`]);
  for (let x = LOT.x0; x <= LOT.x1; x++) park.tiles.push([x, LOT.y0 + 6, 'path'], [x, LOT.y0 + 7, 'path']);
  for (let y = LOT.y0; y <= LOT.y1 - 4; y++) park.tiles.push([Math.floor((LOT.x0 + LOT.x1) / 2), y, 'path']);
  for (let i = 0; i < 26; i++) { const x = r.int(LOT.x0 + 1, LOT.x1 - 1), y = r.int(LOT.y0, LOT.y1 - 5); if (y !== LOT.y0 + 6 && y !== LOT.y0 + 7) park.addProps.push({ type: 'prop', key: r.chance(0.3) ? 'tree_cherry' : 'tree_a', x: x * TS + 8, y: y * TS + 12, solid: 5 }); }
  park.addProps.push({ type: 'prop', key: 'playground', x: (LOT.x0 + 4) * TS, y: (LOT.y0 + 11) * TS });
  park.addProps.push({ type: 'prop', key: 'picnic', x: (LOT.x1 - 4) * TS, y: (LOT.y0 + 3) * TS, solid: 6 }, { type: 'prop', key: 'picnic_l', x: (LOT.x1 - 2) * TS, y: (LOT.y0 + 4) * TS, solid: 6 });
  for (let x = LOT.x0 + 2; x < LOT.x1; x += 5) park.addProps.push({ type: 'prop', key: 'parklamp', x: x * TS + 8, y: (LOT.y0 + 6) * TS - 2 });
  D.improvements = { parking_to_park: park };

  // ---------- furniture, stops, traffic ----------
  for (const row of BRIDGES) { D.furnish(row, 'n', BV + 4, W); D.furnish(row, 's', BV + 4, W); }
  const st = () => ({ wb: [(BV - 1) * TS, (CW - 1) * TS, (LS - 1) * TS], eb: [(BV + 5) * TS, (CW + 5) * TS, (LS + 5) * TS] });
  for (const c of [BV, CW, LS]) for (const row of [GERRARD, QUEEN]) { D.tprop('ttcstop', c - 2, row - 1, 8, 8); D.tprop('ttcstop', c + 5, row + 4, 8, 6); }
  const zone = (xs) => xs.map((s) => [s - 112, s + 24]);
  for (const row of BRIDGES) { D.parkCars(row, 'W', undefined, zone(st().wb), BV + 4); D.parkCars(row + 3, 'E', undefined, zone(st().eb), BV + 4); }
  D.ewLanes('gerrard', GERRARD, { streetcar: true, stopsWB: st().wb, stopsEB: st().eb });
  D.ewLanes('dundas', DUNDAS, {});
  D.ewLanes('queen', QUEEN, { streetcar: true, stopsWB: st().wb, stopsEB: st().eb, cyclists: 'mixed' });
  D.nsLanes('broadview', BV, { streetcar: true });
  D.nsLanes('carlaw', CW, { light: true }, GERRARD);
  D.nsLanes('leslie', LS, {});
  // the DVP runs under every bridge
  D.lanes.push(
    { id: 'dvp_sb', axis: 'y', dir: 1, pos: (DVP.x0 + 1) * TS + 8, speedy: true, under: true },
    { id: 'dvp_nb', axis: 'y', dir: -1, pos: (DVP.x0 + 3) * TS + 8, speedy: true, under: true },
    { id: 'dvp_nb2', axis: 'y', dir: -1, pos: (DVP.x0 + 4) * TS + 8, speedy: true, under: true },
  );
  // the Lower Don trail follows the river's wiggle; walkers there pass under the bridges too
  const trailIdx = D.walkways.length;
  D.walkways.push(trailX.map((x, y) => [x * TS - 2, y * TS + 8]).filter((_, y) => y % 3 === 0), ...rpPaths);

  D.labels.push(
    { text: 'GERRARD ST E', x: 50 * TS, y: (GERRARD + 2) * TS }, { text: 'DUNDAS ST E', x: 50 * TS, y: (DUNDAS + 2) * TS }, { text: 'QUEEN ST E', x: 50 * TS, y: (QUEEN + 2) * TS },
    { text: 'BROADVIEW', x: (BV + 2) * TS, y: 64 * TS, vertical: true }, { text: 'CARLAW', x: (CW + 2) * TS, y: 64 * TS, vertical: true }, { text: 'LESLIE', x: (LS + 2) * TS, y: 64 * TS, vertical: true },
    { text: 'DON RIVER', x: 6 * TS, y: 64 * TS, vertical: true, kind: 'landmark' }, { text: 'DVP', x: 13 * TS, y: 92 * TS, vertical: true },
    { text: 'LESLIEVILLE', x: 80 * TS, y: (QUEEN - 5) * TS, kind: 'landmark' },
    { text: '< DOWNTOWN', x: 4 * TS, y: (QUEEN - 4) * TS, kind: 'exit' },
  );
  // hidden extra lives: in the trees on Riverdale hill, and behind MEGAMART
  const lifeTokens = [{ x: (RP.x0 + 1) * TS + 8, y: (RP.y1 - 1) * TS }, { x: (LOT.x1 - 1) * TS, y: (LOT.y1 + 1) * TS + 6 }];
  // the bridge decks are redrawn over the DVP traffic + trail walkers passing under them
  const overpasses = [...BRIDGES.map((row) => [0, row - 3, DVP.x1 + 2, row + 6]), [0, FB - 1, DVP.x1 + 2, FB + 2]];
  // easter egg: the benches at the top of Riverdale hill
  const eggs = [{ id: 'riverdale_view', x: (RP.x0 + 6) * TS, y: (RP.y0 + 4) * TS, w: 5 * TS, h: 3 * TS, label: 'THE VIEW FROM THE HILL', fact: 'THE WHOLE SKYLINE AT ONCE.\nPEOPLE COME UP HERE\nFOR THE SUNSET.' }];
  return D.out({ spawn: { x: 40 * TS, y: (QUEEN - 2) * TS + 8 }, lifeTokens, eggs, overpasses, underWalks: [trailIdx] });
}
