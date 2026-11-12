// Waterfront district (south of Downtown; M3, re-laid in M3.1 from Ivan's review). Fictionalized but
// faithful in its parts. North -> south:
// - Bremner Blvd's landmarks: the Rogers Centre (the dome) WEST of the CN Tower, Ripley's Aquarium just
//   south-east of the tower, Roundhouse Park; towers east of University
// - the elevated Gardiner over Lake Shore Blvd: piers on the sidewalk (never on a street below), its own
//   fast traffic that jams up now and then and clears again
// - Harbourfront condos, then Queens Quay with the streetcar in its grassy median (rails run straight
//   through the intersections); Spadina, University and Bay END at Queens Quay, and their traffic turns
//   (the 510 Spadina streetcar curves onto Queens Quay)
// - the Martin Goodman Trail, the promenade and boardwalk; marinas with moored sailboats; Harbour Square
//   Park West with the Sundial Folly at the foot of University (the real park is closer to Bay/York: the
//   game compresses); the Jack Layton Ferry Terminal at the foot of Bay with a ferry docked; Sugar Beach
// - out west: Ontario Place, the pods on their stilts and the Cinesphere in the water, and Dog Fraud's
//   fictional MEGA SPA on the island, fenced off (mission 8 opens it up and the spa goes)
import { District, TS } from './common.mjs';

export const W = 120, H = 96;
export const LAKESHORE = 28, QQ = 52;
export const SP = 14, UN = 70, BY = 102; // same columns as Downtown: the streets line up
const LAKE_Y = 65;
const DECK_Y = (LAKESHORE - 4) * TS + 6;   // the Gardiner deck's bottom edge (screen px)

export function generateWaterfront() {
  const D = new District('waterfront', W, H, 1972);
  const r = D.r;
  D.fill(0, 0, W - 1, H - 1, (x, y) => `grass${(x * 7 + y * 3) % 3}`);
  const glass = ['blue', 'teal', 'dark', 'sky'];
  const towers = (a, b, place, floors = [10, 14], d = 40) => {
    let x = a;
    while (x < b) { let w = r.pick([3, 4, 5]); if (x + w > b) w = b - x; if (w < 3) break; D.addBuilding(x * TS, w * TS, { w: w * TS, d, floors: r.int(floors[0], floors[1]), glass: r.pick(glass), seed: 300 + D.bid, kind: 'tower' }, place, { graffiti: null }); x += w; }
  };
  const parkTree = (x0, x1, y0, y1, n, skip) => { for (let i = 0; i < n; i++) { const x = r.int(x0, x1), y = r.int(y0, y1); if (!skip?.(x, y)) D.tprop(r.chance(0.3) ? 'tree_c' : r.chance(0.5) ? 'tree_a' : 'tree_b', x, y, 8, 10, { solid: 4 }); } };

  // ---------- streets ----------
  const streetCols = [SP, UN, BY].flatMap((c) => [c - 1, c, c + 1, c + 2, c + 3, c + 4]);
  D.ewStreet(LAKESHORE, { tracks: false });
  D.ewStreet(QQ, { tracks: false });
  for (let x = 0; x < W; x++) { D.set(x, QQ + 1, `tracks_grass${x % 2}`); D.set(x, QQ + 2, `tracks_grass${(x + 1) % 2}`); } // the streetcar median
  for (const c of [SP, UN, BY]) D.nsStreet(c, 0, QQ + 3, { tracks: c === SP });
  for (const c of [SP, UN, BY]) {
    D.cross(c, LAKESHORE, { ewTracks: false, nsTracks: c === SP });
    // the streets end at Queens Quay; its rails run straight through (M3.1, Ivan: tracks on the crossroads)
    D.cross(c, QQ, { teeS: true, ewTracks: true });
  }
  // the 510's rails: Spadina's southbound track curves east onto Queens Quay, the westbound one north
  // (concentric arcs; their centre is the decal's top-right corner)
  const xSB = (SP + 1) * TS + 8, yEB = (QQ + 2) * TS + 8;
  D.prop('trackcurves', xSB + 32, yEB - 32, { depth: -8.5 });
  D.exitNS('n', SP, 'downtown', 'spadina'); D.exitNS('n', UN, 'downtown', 'university'); D.exitNS('n', BY, 'downtown', 'bay');

  // ---------- the Gardiner: a deck above Lake Shore, piers on the north sidewalk between the streets ----------
  for (let x = 0; x < W * TS; x += 32) D.prop('gardinerdeck', x, DECK_Y, { depth: 10000 });
  for (let x = 2; x < W; x += 5) if (!streetCols.includes(x) && !streetCols.includes(x + 1)) D.tprop('gardinerpier', x, LAKESHORE - 3, 16, 8, { solidBox: [-12, -3, 24, 3] });

  // ---------- Bremner Blvd: the dome, the tower, the aquarium, Roundhouse Park ----------
  // the Union Station rail corridor along the top (the streets pass under it)
  for (let y = 0; y <= 4; y++) for (let x = 0; x < W; x++) if (!streetCols.slice(0).some((c) => c === x && [SP, UN, BY].some((s) => x >= s && x <= s + 3))) D.set(x, y, y === 0 || y === 4 ? `grass${x % 3}` : `rail${(x + y) % 2}`);
  D.labels.push({ text: 'RAIL CORRIDOR', x: 44 * TS, y: 2 * TS });
  D.fill(SP + 4, 5, UN - 1, LAKESHORE - 4, (x, y) => `plaza${(x + y) % 2}`);
  D.fill(55, 6, UN - 1, LAKESHORE - 5, (x, y) => `lawn${(x * 5 + y) % 3}`);
  // Bremner Blvd's plaza: trees in planters, lamps
  for (let x = SP + 5; x < 54; x += 4) { D.tprop('tree_b', x, 6, 8, 10, { solid: 4 }); D.tprop('parklamp', x + 2, 6, 8, 8); }
  D.addBuilding((SP + 5) * TS, 13 * TS, { w: 13 * TS, d: 120, floors: 1, seed: 1989, kind: 'dome' }, { base: (LAKESHORE - 7) * TS }, { graffiti: null });
  D.landmarks.push({ id: 'dome', x: (SP + 11) * TS, y: (LAKESHORE - 7) * TS + 4, label: 'ROGERS CENTRE (SKYDOME)', fact: 'OPENED IN 1989 WITH THE\nFIRST FULLY RETRACTABLE\nMOTORIZED ROOF.' });
  D.addBuilding(35 * TS, 6 * TS, { w: 6 * TS, d: 48, floors: 1, seed: 1976, kind: 'cntower', shaftH: 420 }, { base: (LAKESHORE - 9) * TS }, { graffiti: null });
  D.landmarks.push({ id: 'cntower', x: 38 * TS, y: (LAKESHORE - 9) * TS + 4, label: 'THE CN TOWER', fact: 'OPENED 1976. 553 M TALL.\nTHE WORLD\'S TALLEST\nTOWER UNTIL 2007.' });
  D.addBuilding(43 * TS, 9 * TS, { w: 9 * TS, d: 64, floors: 1, seed: 2013, kind: 'aquarium' }, { base: (LAKESHORE - 7) * TS }, { graffiti: null });
  D.landmarks.push({ id: 'aquarium', x: 47 * TS + 8, y: (LAKESHORE - 7) * TS + 4, label: 'RIPLEY\'S AQUARIUM', fact: 'OPENED IN 2013, AT THE\nFOOT OF THE CN TOWER.' });
  parkTree(56, UN - 2, 7, LAKESHORE - 6, 18);
  for (const x of [58, 63, 67]) D.tprop('bench', x, LAKESHORE - 6, 8, 12);
  D.labels.push({ text: 'ROGERS CENTRE', x: (SP + 11) * TS, y: 4 * TS, kind: 'landmark' }, { text: 'CN TOWER', x: 38 * TS, y: 11 * TS, kind: 'landmark' }, { text: 'AQUARIUM', x: 47 * TS, y: 15 * TS, kind: 'landmark' }, { text: 'ROUNDHOUSE PARK', x: 62 * TS, y: 9 * TS, kind: 'landmark' });
  // CityPlace west of Spadina, Southcore east of University
  towers(0, SP, { base: (LAKESHORE - 5) * TS }, [12, 16]);
  towers(UN + 4, BY, { base: (LAKESHORE - 5) * TS }, [14, 18]);
  towers(BY + 4, W, { base: (LAKESHORE - 5) * TS }, [14, 18]);

  // ---------- between Lake Shore and Queens Quay: Harbourfront ----------
  for (const [a, b] of [[UN + 4, BY], [BY + 4, W]]) towers(a, b, { base: (QQ - 3) * TS });
  for (const [a, b] of [[0, SP], [SP + 4, UN]]) D.row(a, b, { base: (QQ - 3) * TS }, 'shop', [1, 2], ['cream', 'grey', 'buff']);
  for (const [a, b] of [[0, SP], [SP + 4, UN], [UN + 4, BY], [BY + 4, W]]) {
    let x = a;
    while (x < b) { let w = r.pick([3, 4]); if (x + w > b) w = b - x; if (w < 3) break; D.addBuilding(x * TS, w * TS, { w: w * TS, d: 40, floors: r.int(2, 3), brick: r.pick(['red', 'buff', 'darkred']), seed: 700 + D.bid, kind: 'warehouse' }, { top: (LAKESHORE + 7) * TS }, { graffiti: null }); x += w; }
  }
  D.labels.push({ text: 'HARBOURFRONT', x: 40 * TS, y: (QQ - 6) * TS, kind: 'landmark' });

  // ---------- the trail, the promenade, the boardwalk, the lake ----------
  for (let x = 0; x < W; x++) {
    D.set(x, QQ + 7, `mgt${x % 4 === 0 ? 0 : 1}`); D.set(x, QQ + 8, `mgt${(x + 2) % 4 === 0 ? 0 : 1}`);
    D.set(x, QQ + 9, `plaza${x % 2}`); D.set(x, QQ + 10, `plaza${(x + 1) % 2}`);
    D.set(x, QQ + 11, `deck${x % 2}`); D.set(x, QQ + 12, `deck${(x + 1) % 2}`);
    D.set(x, LAKE_Y, 'shore_n');
    for (let y = LAKE_Y + 1; y < H; y++) D.set(x, y, `water${(x * 3 + y) % 3}`);
  }
  for (let x = 3; x < W; x += 7) { if (x > UN - 3 && x < UN + 9) continue; if (x > BY - 2 && x < BY + 9) continue; D.tprop('bench', x, QQ + 9, 8, 13); if (x % 14 === 3) D.tprop('tree_b', x + 2, QQ + 10, 8, 10, { solid: 4 }); D.tprop('parklamp', x + 4, QQ + 11, 8, 8); }

  // land that reaches into the lake (parks, the ferry docks, the Ontario Place island)
  const landRects = [];
  const landfill = (x0, y0, x1, y1, tile) => { landRects.push([x0, y0, x1, y1]); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) D.set(x, y, typeof tile === 'function' ? tile(x, y) : tile); };

  // Harbour Square Park West + the Sundial Folly, at the foot of University (Ivan's ask)
  landfill(UN - 2, QQ + 9, UN + 8, LAKE_Y + 4, (x, y) => `lawn${(x * 5 + y) % 3}`);
  for (let x = UN - 2; x <= UN + 8; x++) { D.set(x, QQ + 11, `deck${x % 2}`); D.set(x, QQ + 12, `deck${(x + 1) % 2}`); } // the boardwalk runs through
  D.prop('sundial', (UN + 3) * TS + 8, (LAKE_Y + 2) * TS + 8, { solidBox: [-26, -20, 52, 18] });
  for (const [x, y] of [[UN - 1, QQ + 10], [UN + 7, QQ + 10], [UN - 1, LAKE_Y + 3], [UN + 7, LAKE_Y + 3]]) D.tprop('tree_a', x, y, 8, 10, { solid: 4 });
  D.landmarks.push({ id: 'sundial', x: (UN + 3) * TS + 8, y: (QQ + 13) * TS, label: 'THE SUNDIAL FOLLY', fact: 'HARBOUR SQUARE PARK WEST.\nA CONCRETE SPHERE IN A POOL\n(J. FUNG + P. FIGUEIREDO, 1995)' });
  D.labels.push({ text: 'HARBOUR SQUARE PARK', x: (UN + 3) * TS, y: (QQ + 9) * TS, kind: 'landmark' });

  // the Jack Layton Ferry Terminal at the foot of Bay, a ferry at the dock
  landfill(BY - 1, QQ + 9, BY + 8, LAKE_Y, (x, y) => `plaza${(x + y) % 2}`);
  D.addBuilding(BY * TS, 7 * TS, { w: 7 * TS, d: 40, floors: 1, seed: 2013, kind: 'ferry' }, { base: (LAKE_Y + 1) * TS }, { graffiti: null });
  landfill(BY + 1, LAKE_Y + 1, BY + 2, LAKE_Y + 6, (x, y) => `deck${(x + y) % 2}`);
  D.prop('ferryboat', (BY + 6) * TS + 8, (LAKE_Y + 6) * TS + 4);
  D.landmarks.push({ id: 'ferry', x: (BY + 3) * TS, y: (QQ + 11) * TS, label: 'JACK LAYTON FERRY TERMINAL', fact: 'FERRIES TO THE TORONTO\nISLANDS LEAVE FROM THE\nFOOT OF BAY STREET.' });

  // marinas: finger docks with sailboats moored (Ivan: "marinas having sailing boats")
  for (const [x0, x1] of [[36, 54], [84, 98]]) for (let x = x0; x <= x1; x += 3) {
    D.prop('marinadock', x * TS + 8, (LAKE_Y + 1) * TS - 2, { depth: (LAKE_Y + 1) * TS - 4 });
    if (r.chance(0.75)) D.critters.push({ kind: 'moored', x: x * TS + 22, y: (LAKE_Y + 4) * TS });
  }
  D.labels.push({ text: 'MARINA', x: 45 * TS, y: (LAKE_Y + 6) * TS, kind: 'landmark' });
  // sailboats out on the lake
  for (const [x, y] of [[60, 76], [74, 84], [92, 78], [108, 88], [48, 90]]) D.critters.push({ kind: 'sailboat', x: x * TS, y: y * TS });

  // ---------- Sugar Beach (east) ----------
  landfill(106, QQ + 9, 118, LAKE_Y, (x, y) => (y === LAKE_Y ? 'shore_n' : 'sand'));
  for (let i = 0; i < 9; i++) D.prop('pinkumbrella', (107 + (i % 5) * 2.2) * TS, (QQ + 10 + Math.floor(i / 5) * 2) * TS + 4);
  D.landmarks.push({ id: 'sugarbeach', x: 112 * TS, y: (QQ + 12) * TS, label: 'SUGAR BEACH', fact: 'PINK UMBRELLAS NEXT TO\nA WORKING SUGAR REFINERY.' });
  D.labels.push({ text: 'SUGAR BEACH', x: 112 * TS, y: (QQ + 8) * TS, kind: 'landmark' });

  // ---------- Ontario Place (west): the island, the pods, the Cinesphere... and the MEGA SPA ----------
  const isLand = (x, y) => Math.hypot((x - 17) / 15.5, (y - (LAKE_Y + 14)) / 7) < 1;
  for (let y = LAKE_Y + 2; y < H; y++) for (let x = 0; x < 34; x++) if (isLand(x, y)) D.set(x, y, `lawn${(x * 3 + y) % 3}`);
  for (let y = LAKE_Y; y < LAKE_Y + 9; y++) for (const x of [20, 21, 22]) D.set(x, y, `deck${(x + y) % 2}`); // the causeway
  const land = (x, y) => { const t = D.get(x, y); return !!t && !t.startsWith('water') && !t.startsWith('shore'); };
  for (let y = LAKE_Y + 1; y < H; y++) for (let x = 0; x < 40; x++) {
    if (!D.get(x, y)?.startsWith('water')) continue;
    if (land(x, y + 1)) D.set(x, y, 'shore_s'); else if (land(x, y - 1) && y > LAKE_Y + 1) D.set(x, y, 'shore_n'); else if (land(x + 1, y)) D.set(x, y, 'shore_e'); else if (land(x - 1, y)) D.set(x, y, 'shore_w');
  }
  // the pods stand in the water north-west of the island; the Cinesphere on its own to the east
  D.prop('podop', 6 * TS, (LAKE_Y + 6) * TS); D.prop('podop', 13 * TS, (LAKE_Y + 4) * TS + 8);
  D.prop('cinesphereop', 36 * TS, (LAKE_Y + 13) * TS);
  for (let x = 31; x <= 33; x++) { D.set(x, LAKE_Y + 12, `deck${x % 2}`); D.set(x, LAKE_Y + 13, `deck${(x + 1) % 2}`); } // the walkway out to it
  D.landmarks.push({ id: 'cinesphere', x: 31 * TS, y: (LAKE_Y + 11) * TS, label: 'THE CINESPHERE', fact: 'ONTARIO PLACE, 1971: THE\nWORLD\'S FIRST PERMANENT\nIMAX THEATRE.' });
  D.landmarks.push({ id: 'pods', x: 10 * TS, y: (LAKE_Y + 7) * TS + 8, label: 'THE PODS', fact: 'GLASS ROOMS ON STILTS\nOVER THE LAKE. ONTARIO\nPLACE OPENED IN 1971.' });
  D.addBuilding(19 * TS, 10 * TS, { w: 10 * TS, d: 40, floors: 1, seed: 95, kind: 'megaspa' }, { base: (LAKE_Y + 17) * TS }, { graffiti: null, tag: 'megaspa' });
  // the fences: a locked gate across the causeway, and PRIVATE fencing along the boardwalk's edge
  for (const x of [20, 21, 22]) D.tprop('spafence', x, LAKE_Y, 0, 4, { solidBox: [0, -4, 16, 4], tag: 'spafence' });
  for (let x = 0; x < 34; x++) if (x < 20 || x > 22) D.tprop('spafence', x, LAKE_Y, 0, 2, { tag: 'spafence' });
  D.landmarks.push({ id: 'megaspa', x: 24 * TS, y: (QQ + 11) * TS, label: 'THE MEGA SPA (FICTIONAL)', fact: 'PRIVATE. PAID ENTRY.\nYOUR SHORELINE,\nTHEIR CHECKOUT.' });
  D.markers.push({ id: 'waterfront_heist', x: 27 * TS, y: (QQ + 11) * TS + 8, label: 'THE WATERFRONT HEIST' });
  D.labels.push({ text: 'ONTARIO PLACE', x: 17 * TS, y: (LAKE_Y + 20) * TS, kind: 'landmark' }, { text: 'THE PODS', x: 9 * TS, y: (LAKE_Y + 2) * TS, kind: 'landmark' }, { text: 'CINESPHERE', x: 36 * TS, y: (LAKE_Y + 16) * TS, kind: 'landmark' });

  // ---------- the lake is solid (runs of water per row; land stays rideable) ----------
  for (let y = LAKE_Y; y < H; y++) {
    let x = 0;
    while (x < W) {
      if (land(x, y)) { x++; continue; }
      let e = x; while (e < W && !land(e, y)) e++;
      D.prop('blank', x * TS, (y + 1) * TS, { solidBox: [0, -TS + (y === LAKE_Y ? 6 : 0), (e - x) * TS, TS], invisible: true });
      x = e;
    }
  }

  // ---------- mission 8's payoff: the fences AND the spa come down; the island is a public park ----------
  const pub = { tiles: [], addProps: [], removeTag: ['spafence', 'megaspa'] };
  for (let y = LAKE_Y + 7; y < LAKE_Y + 11; y++) for (let x = 5; x < 16; x++) if (isLand(x, y) && isLand(x, y + 2)) pub.tiles.push([x, y, 'sand']); // a public beach
  for (let y = LAKE_Y + 12; y < LAKE_Y + 18; y++) for (let x = 19; x < 29; x++) if (isLand(x, y)) pub.tiles.push([x, y, (x + y) % 7 === 0 ? 'flowerbed' : `lawn${(x + y) % 3}`]); // where the spa stood
  const onIsland = (x, y) => isLand(x, y) && isLand(x - 1, y) && isLand(x + 1, y) && isLand(x, y + 1);
  for (const [x, y] of [[13, LAKE_Y + 12], [16, LAKE_Y + 15], [27, LAKE_Y + 12], [29, LAKE_Y + 15], [4, LAKE_Y + 13], [23, LAKE_Y + 18]]) if (onIsland(x, y)) pub.addProps.push({ type: 'prop', key: 'tree_a', x: x * TS + 8, y: y * TS + 12, solid: 4 });
  for (const [x, y] of [[7, LAKE_Y + 8], [10, LAKE_Y + 9], [13, LAKE_Y + 8]]) if (onIsland(x, y)) pub.addProps.push({ type: 'prop', key: 'pinkumbrella', x: x * TS + 8, y: y * TS + 12 });
  // picnic tables only where there's island all round them (M3.1: one stood in the water)
  for (const [x, y] of [[18, LAKE_Y + 13], [24, LAKE_Y + 15], [8, LAKE_Y + 14]]) if (onIsland(x, y) && onIsland(x + 1, y)) pub.addProps.push({ type: 'prop', key: 'picnic', x: x * TS + 8, y: y * TS + 8, solid: 6 });
  pub.addProps.push({ type: 'prop', key: 'bikering', x: 24 * TS, y: (QQ + 10) * TS }, { type: 'prop', key: 'bench', x: 21 * TS, y: (LAKE_Y + 10) * TS });
  D.improvements = { public_waterfront: pub };

  // ---------- furniture, traffic ----------
  D.furnish(LAKESHORE, 's', 0, W, { trees: false }); D.furnish(QQ, 's', 0, W, { trees: false });
  D.ewLanes('lakeshore', LAKESHORE, {});
  // the Gardiner: one lane each way up on the deck (fast, with a jam that builds and clears)
  D.lanes.push({ id: 'gardiner_wb', axis: 'x', dir: -1, pos: DECK_Y - 34, elevated: true }, { id: 'gardiner_eb', axis: 'x', dir: 1, pos: DECK_Y - 15, elevated: true });
  // Queens Quay: the streetcar in its own grassy median, one car lane each side; cars turn up the streets
  const up = (dirWB) => [['spadina', SP], ['university', UN], ['bay', BY]].map(([n]) => n);
  D.lanes.push(
    { id: 'qqt_wb', axis: 'x', dir: -1, pos: (QQ + 1) * TS + 8, streetcar: true, transitOnly: true, turns: [{ to: 'spadina_nb', r: 16, p: 0.5, kinds: ['streetcar'] }] },
    { id: 'qqt_eb', axis: 'x', dir: 1, pos: (QQ + 2) * TS + 8, streetcar: true, transitOnly: true },
    { id: 'qq_wb', axis: 'x', dir: -1, pos: QQ * TS + 8, light: true, turns: [{ to: 'bay_nb', r: 8, p: 0.25, kinds: ['car'] }, { to: 'university_nb', r: 8, p: 0.3, kinds: ['car'] }, { to: 'spadina_nb', r: 8, p: 0.3, kinds: ['car'] }] },
    { id: 'qq_eb', axis: 'x', dir: 1, pos: (QQ + 3) * TS + 8, light: true, turns: [{ to: 'spadina_nb', r: 24, p: 0.25, kinds: ['car'] }, { to: 'university_nb', r: 24, p: 0.3, kinds: ['car'] }, { to: 'bay_nb', r: 24, p: 0.35, kinds: ['car'] }] },
  );
  void up;
  D.lanes.push({ id: 'mgt_wb', axis: 'x', dir: -1, pos: (QQ + 7) * TS + 8, bikeOnly: true }, { id: 'mgt_eb', axis: 'x', dir: 1, pos: (QQ + 8) * TS + 8, bikeOnly: true });
  D.walkways.push([[0, (QQ + 10) * TS], [W * TS, (QQ + 10) * TS]], [[0, (QQ + 12) * TS], [W * TS, (QQ + 12) * TS]], [[0, (QQ - 2) * TS + 6], [W * TS, (QQ - 2) * TS + 6]]);
  // the streets come down from Downtown and end at Queens Quay: everything southbound turns
  for (const [c, name] of [[SP, 'spadina'], [UN, 'university'], [BY, 'bay']]) {
    D.nsLanes(name, c, c === SP ? { streetcar: true } : {}, 0, QQ + 4);
    const sb = D.lanes.find((l) => l.id === `${name}_sb`), nb = D.lanes.find((l) => l.id === `${name}_nb`);
    sb.turns = [...(c === SP ? [{ to: 'qqt_eb', r: 32, p: 1, kinds: ['streetcar'] }] : []), { to: 'qq_wb', r: 8, p: 0.45, kinds: ['car', 'bike'] }, { to: 'qq_eb', r: 40, p: 1, kinds: ['car', 'bike'] }];
    nb.noSpawn = true; // fed by Queens Quay's turning traffic
  }
  D.labels.push(
    { text: 'GARDINER EXPWY', x: 60 * TS, y: (LAKESHORE - 5) * TS }, { text: 'LAKE SHORE BLVD', x: 86 * TS, y: (LAKESHORE + 2) * TS },
    { text: 'QUEENS QUAY', x: 86 * TS, y: (QQ + 2) * TS }, { text: 'MARTIN GOODMAN TRAIL', x: 56 * TS, y: (QQ + 8) * TS },
    { text: 'LAKE ONTARIO', x: 70 * TS, y: 80 * TS, kind: 'landmark' },
    { text: 'SPADINA', x: (SP + 2) * TS, y: 40 * TS, vertical: true }, { text: 'UNIVERSITY', x: (UN + 2) * TS, y: 40 * TS, vertical: true }, { text: 'BAY', x: (BY + 2) * TS, y: 40 * TS, vertical: true },
    { text: '^ DOWNTOWN', x: (UN + 2) * TS, y: 2 * TS, kind: 'exit' },
  );
  // hidden extra lives: behind the dome, and at the far end of Sugar Beach
  const lifeTokens = [{ x: (SP + 5) * TS, y: 8 * TS }, { x: 118 * TS, y: (QQ + 12) * TS }];
  // easter egg: ride onto the sand at Sugar Beach
  const eggs = [{ id: 'sugar_beach', x: 106 * TS, y: (QQ + 9) * TS, w: 12 * TS, h: 4 * TS, label: 'SUGAR BEACH', fact: 'A CANDY-PINK BEACH IN THE\nMIDDLE OF THE CITY.' }];
  void landRects;
  return D.out({ spawn: { x: (UN + 2) * TS, y: 4 * TS }, lifeTokens, eggs });
}
