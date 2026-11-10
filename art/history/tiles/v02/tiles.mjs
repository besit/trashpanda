// Ground tiles (16x16), drawn top-down for the 3/4 exploration map.
// Exports an ordered list of named tiles; index in the list = tile id (+1 in the map; 0 = empty).
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';

export const TS = 16;
const BIKE = `
......WW..
.......W..
..WWWWWW..
.WW.W..WW.
W..WW.W..W
W..W..W..W
.WW....WW.
`;

function base(c) { return new Img(TS, TS).rect(0, 0, TS, TS, c); }
function speckle(img, c, n, seed, area = [0, 0, TS, TS]) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) img.set(area[0] + r.int(0, area[2] - 1), area[1] + r.int(0, area[3] - 1), c);
  return img;
}

function asphalt(seed) {
  const t = base('A');
  speckle(t, 'a', 14, seed); speckle(t, 's', 6, seed + 9);
  if (seed % 3 === 0) { const r = rng(seed); let x = r.int(2, 12), y = r.int(2, 6); for (let i = 0; i < 6; i++) { t.set(x, y, 'a'); x += r.int(0, 1); y += 1; } }
  return t;
}
function sidewalk(seed) {
  const t = base('t');
  speckle(t, 'S', 8, seed); speckle(t, 'T', 6, seed + 3);
  t.hline(0, 15, 0, 'S'); t.vline(0, 0, 15, 'S'); // slab seams
  if (seed % 2) t.vline(8, 0, 15, 'S');
  return t;
}
function grass(seed) {
  const t = base('E');
  speckle(t, 'l', 18, seed); speckle(t, 'e', 10, seed + 5); speckle(t, 'L', 3, seed + 7);
  return t;
}

export function buildTiles() {
  const tiles = [];
  const add = (name, img) => { tiles.push({ name, img }); };

  for (let s = 0; s < 4; s++) add(`asphalt${s}`, asphalt(s + 1));
  // lane markings (E-W road)
  { const t = asphalt(11); for (let x = 0; x < 16; x++) if (x % 8 < 5) t.set(x, 15, 'H'); add('lane_dash_s', t); }
  { const t = asphalt(12); t.hline(0, 15, 0, 'y'); t.hline(0, 15, 2, 'y'); add('centre_double', t); }
  // streetcar tracks embedded in asphalt (E-W). Rails at y=4 and y=11.
  for (let s = 0; s < 2; s++) {
    const t = asphalt(20 + s);
    t.rect(0, 3, 16, 3, 's'); t.rect(0, 10, 16, 3, 's');
    t.hline(0, 15, 4, 'h'); t.hline(0, 15, 11, 'h');
    t.hline(0, 15, 5, 'g'); t.hline(0, 15, 12, 'g');
    add(`tracks${s}`, t);
  }
  // N-S tracks (for cross streets)
  { const t = asphalt(23); t.rect(3, 0, 3, 16, 's'); t.rect(10, 0, 3, 16, 's'); t.vline(4, 0, 15, 'h'); t.vline(11, 0, 15, 'h'); t.vline(5, 0, 15, 'g'); t.vline(12, 0, 15, 'g'); add('tracks_ns', t); }
  // track crossing (both directions)
  { const t = asphalt(24); for (const y of [3, 10]) { t.rect(0, y, 16, 3, 's'); t.hline(0, 15, y + 1, 'h'); } for (const x of [3, 10]) { t.rect(x, 0, 3, 16, 's'); t.vline(x + 1, 0, 15, 'h'); } add('tracks_x', t); }
  // sidewalks
  for (let s = 0; s < 3; s++) add(`sidewalk${s}`, sidewalk(s + 1));
  // curb: sidewalk on top, road below (north curb of road)
  { const t = sidewalk(7); t.hline(0, 15, 13, 'T'); t.hline(0, 15, 14, 'S'); t.hline(0, 15, 15, 'g'); add('curb_n', t); }
  // curb: road above, sidewalk below (south curb) - curb face visible as lighter band
  { const t = sidewalk(8); t.hline(0, 15, 0, 'g'); t.hline(0, 15, 1, 'T'); t.hline(0, 15, 2, 'H'); add('curb_s', t); }
  // vertical curbs for N-S street
  { const t = sidewalk(9); t.vline(13, 0, 15, 'T'); t.vline(14, 0, 15, 'S'); t.vline(15, 0, 15, 'g'); add('curb_w', t); }
  { const t = sidewalk(10); t.vline(0, 0, 15, 'g'); t.vline(1, 0, 15, 'S'); t.vline(2, 0, 15, 'T'); add('curb_e', t); }
  // zebra crosswalk across an E-W road (stripes run N-S)
  { const t = asphalt(30); for (let x = 1; x < 16; x += 4) t.rect(x, 0, 2, 16, 'H'); add('zebra_ew', t); }
  { const t = asphalt(31); for (let y = 1; y < 16; y += 4) t.rect(0, y, 16, 2, 'H'); add('zebra_ns', t); }
  // painted bike lane (E-W): solid white line on the traffic side (north edge)
  { const t = asphalt(40); t.hline(0, 15, 0, 'W'); t.hline(0, 15, 1, 'H'); add('bikelane', t); }
  { const t = asphalt(41); t.hline(0, 15, 0, 'W'); t.hline(0, 15, 1, 'H');
    // bike stencil
    t.grid(3, 5, BIKE);
    add('bikelane_stencil', t); }
  // north-side painted lane: line on the south (traffic) edge, stencil upright
  { const t = asphalt(42); t.hline(0, 15, 15, 'W'); t.hline(0, 15, 14, 'H'); add('bikelane_n', t); }
  { const t = asphalt(43); t.hline(0, 15, 15, 'W'); t.hline(0, 15, 14, 'H'); t.grid(3, 4, BIKE); add('bikelane_n_stencil', t); }
  { const t = base('E'); speckle(t, 'l', 6, 52); t.rect(0, 13, 16, 3, 'T'); t.hline(0, 15, 12, 'S'); t.set(3, 14, 'R'); t.set(3, 13, 'q'); t.set(11, 14, 'R'); t.set(11, 13, 'q'); add('bikelane_protected_n', t); }
  { const t = base('E'); speckle(t, 'l', 6, 53); t.rect(0, 13, 16, 3, 'T'); t.hline(0, 15, 12, 'S'); t.grid(3, 3, BIKE); add('bikelane_protected_n_stencil', t); }
  // protected bike lane: green paint + concrete curb separator with bollards on the north edge
  { const t = base('E'); speckle(t, 'l', 6, 50); t.rect(0, 0, 16, 3, 'T'); t.hline(0, 15, 3, 'S'); t.set(3, 1, 'R'); t.set(3, 0, 'q'); t.set(11, 1, 'R'); t.set(11, 0, 'q'); add('bikelane_protected', t); }
  { const t = base('E'); speckle(t, 'l', 6, 51); t.rect(0, 0, 16, 3, 'T'); t.hline(0, 15, 3, 'S');
    t.grid(3, 6, BIKE);
    add('bikelane_protected_stencil', t); }
  // N-S two-lane street: west (southbound) lane carries the yellow centre line on its east edge
  { const t = asphalt(14); t.vline(14, 0, 15, 'y'); t.vline(15, 0, 15, 'A'); add('road_ns_w', t); }
  { const t = asphalt(15); t.vline(0, 0, 15, 'y'); add('road_ns_e', t); }
  // E-W plain lane with yellow centre line on top (for a road without tracks)
  { const t = asphalt(16); t.hline(0, 15, 0, 'y'); add('road_ew_s', t); }
  { const t = asphalt(17); t.hline(0, 15, 15, 'y'); add('road_ew_n', t); }
  // north-side parking lane (marks at the top edge)
  { const t = asphalt(61); t.vline(0, 0, 3, 'H'); t.hline(0, 2, 0, 'H'); add('parking_n', t); }
  // stop bars on the N-S street approaching an intersection
  { const t = asphalt(18); t.hline(0, 15, 14, 'W'); t.hline(0, 15, 15, 'W'); t.vline(15, 0, 13, 'y'); add('road_ns_w_stop', t); }
  { const t = asphalt(19); t.hline(0, 15, 0, 'W'); t.hline(0, 15, 1, 'W'); t.vline(0, 2, 15, 'y'); add('road_ns_e_stop', t); }
  // park lawn variants (slightly lighter than verge grass)
  for (let s = 0; s < 3; s++) { const t = base('l'); speckle(t, 'E', 12, 100 + s); speckle(t, 'L', 10, 110 + s); add(`lawn${s}`, t); }
  // parking lane (E-W): faint T marks
  { const t = asphalt(60); t.vline(0, 12, 15, 'H'); t.hline(0, 2, 15, 'H'); add('parking', t); }
  // grass + park path
  for (let s = 0; s < 3; s++) add(`grass${s}`, grass(70 + s));
  { const t = base('X'); speckle(t, 'j', 14, 80); speckle(t, 'x', 10, 81); add('path', t); }
  { const t = grass(82); t.rect(0, 0, 16, 2, 'x'); add('grass_edge_n', t); }
  // laneway (alley) concrete - darker, with oil stains
  { const t = base('s'); speckle(t, 'S', 10, 90); speckle(t, 'A', 6, 91); t.set(10, 9, 'A'); t.set(11, 9, 'A'); t.set(10, 10, 'A'); t.hline(0, 15, 15, 'A'); add('laneway', t); }
  // tree pit in sidewalk
  { const t = sidewalk(95); t.rect(3, 3, 10, 10, 'w'); t.rect(4, 4, 8, 8, 'x'); speckle(t, 'X', 6, 96, [4, 4, 8, 8]); add('treepit', t); }
  return tiles;
}

export function tilesPreview() {
  return { frames: buildTiles().map((t) => t.img), cols: 10 };
}
