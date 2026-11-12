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

  // ---------------- M2 ----------------
  // N-S streetcar lanes (Roncesvalles, Spadina): one track per lane, yellow centre line between the lanes
  for (const [name, cl] of [['tracks_ns_w', 15], ['tracks_ns_e', 0]]) {
    const t = asphalt(cl ? 125 : 126); t.rect(3, 0, 3, 16, 's'); t.rect(10, 0, 3, 16, 's'); t.vline(4, 0, 15, 'h'); t.vline(11, 0, 15, 'h'); t.vline(5, 0, 15, 'g'); t.vline(12, 0, 15, 'g');
    t.vline(cl, 0, 15, 'y'); add(name, t);
  }
  // E-W tracks with a transit-signal-priority detector loop cut into the asphalt
  for (let s = 0; s < 2; s++) {
    const t = asphalt(127 + s); t.rect(0, 3, 16, 3, 's'); t.rect(0, 10, 16, 3, 's'); t.hline(0, 15, 4, 'h'); t.hline(0, 15, 11, 'h'); t.hline(0, 15, 5, 'g'); t.hline(0, 15, 12, 'g');
    t.rect(2, 7, 12, 1, 'a'); t.rect(2, 9, 12, 1, 'a'); t.vline(2, 7, 9, 'a'); t.vline(13, 7, 9, 'a'); t.set(7, 8, 'W'); t.set(8, 8, 'W');
    add(`tracks_loop${s}`, t);
  }
  // pond water (Grenadier Pond): two frames of ripples + shore edges
  for (let s = 0; s < 3; s++) {
    const t = base('U'); speckle(t, 'c', 7, 130 + s); speckle(t, 'u', 5, 133 + s);
    const r = rng(136 + s); for (let i = 0; i < 2; i++) { const x = r.int(1, 10), y = r.int(2, 13); t.hline(x, x + 3, y, 'C'); }
    add(`water${s}`, t);
  }
  const shore = (name, side) => {
    const t = base('U'); speckle(t, 'c', 6, 140 + name.length);
    for (let i = 0; i < 16; i++) for (let j = 0; j < 5; j++) {
      const [x, y] = side === 'n' ? [i, j] : side === 's' ? [i, 15 - j] : side === 'w' ? [j, i] : [15 - j, i];
      const edge = j < 3 + ((i * 7) % 3 === 0 ? 1 : 0);
      if (edge) t.set(x, y, j === 0 ? 'E' : j === 1 ? 'x' : (i + j) % 3 ? 'X' : 'j');
      else if (j === 3 || j === 4) t.set(x, y, (i + j) % 2 ? 'c' : 'U');
    }
    add(name, t);
  };
  shore('shore_n', 'n'); shore('shore_s', 's'); shore('shore_w', 'w'); shore('shore_e', 'e');
  // reeds at the pond margin
  { const t = base('U'); speckle(t, 'c', 5, 150); for (let x = 1; x < 16; x += 2) { const h = 4 + ((x * 5) % 6); t.vline(x, 15 - h, 15, x % 4 === 1 ? 'l' : 'E'); t.set(x, 15 - h, 'x'); } add('reeds', t); }
  // plaza paving (Nathan Phillips Square): large pale slabs
  for (let s = 0; s < 2; s++) { const t = base('H'); speckle(t, 'h', 10, 160 + s); t.hline(0, 15, 0, 'h'); t.vline(0, 0, 15, 'h'); if (s) t.hline(0, 15, 8, 'h'); add(`plaza${s}`, t); }
  { const t = base('T'); speckle(t, 't', 10, 163); t.hline(0, 15, 0, 't'); t.vline(0, 0, 15, 't'); t.vline(8, 0, 15, 't'); add('plaza_warm', t); }
  // a speed hump across an E-W lane / N-S lane: raised asphalt with white chevrons
  { const t = asphalt(170); t.rect(0, 4, 16, 8, 's'); t.hline(0, 15, 4, 'S'); t.hline(0, 15, 11, 'a'); for (let x = 1; x < 16; x += 5) { t.set(x, 7, 'W'); t.set(x + 1, 8, 'W'); t.set(x, 9, 'W'); } add('hump_ns', t); }
  { const t = asphalt(171); t.rect(4, 0, 8, 16, 's'); t.vline(4, 0, 15, 'S'); t.vline(11, 0, 15, 'a'); for (let y = 1; y < 16; y += 5) { t.set(7, y, 'W'); t.set(8, y + 1, 'W'); t.set(9, y, 'W'); } add('hump_ew', t); }
  // raised crosswalk: red-brick table with white edge lines (pedestrians stay at sidewalk height)
  { const t = base('B'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((y % 4 === 0) || ((x + (Math.floor(y / 4) % 2) * 4) % 8 === 0)) t.set(x, y, 'b'); t.vline(0, 0, 15, 'W'); t.vline(15, 0, 15, 'W'); add('raised_ns', t); }
  { const t = base('B'); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x % 4 === 0) || ((y + (Math.floor(x / 4) % 2) * 4) % 8 === 0)) t.set(x, y, 'b'); t.hline(0, 15, 0, 'W'); t.hline(0, 15, 15, 'W'); add('raised_ew', t); }
  // "SLOW" stencil in a N-S lane (school zone on Parkside)
  { const t = asphalt(172); t.grid(0, 5, [
    'WWW.W...WWW.W.W',
    'W...W...W.W.W.W',
    'WWW.W...W.W.W.W',
    '..W.W...W.W.WWW',
    'WWW.WWW.WWW.W.W'].join('|').replace(/[|]/g, String.fromCharCode(10))); add('slow_stencil', t); }
  // King St: red "streetcar priority" lane paint at intersections
  { const t = base('r'); speckle(t, 'R', 10, 173); speckle(t, 'b', 6, 174); add('transit_red', t); }
  { const t = base('r'); speckle(t, 'R', 8, 175); t.grid(2, 5, [
    'WWW.WWW.WWW',
    '.W...W..W..',
    '.W...W..W..',
    '.W...W..W..',
    '.W...W..WWW'].join('|').replace(/[|]/g, String.fromCharCode(10))); add('transit_red_stencil', t); }
  // wooden patio / parklet deck (in a curb lane)
  for (let s = 0; s < 2; s++) { const t = base('x'); for (let y = 0; y < 16; y += 3) t.hline(0, 15, y, 'w'); speckle(t, 'X', 8, 176 + s); t.vline(s ? 15 : 0, 0, 15, 'w'); add(`deck${s}`, t); }
  // sand / dirt path for the park (High Park's trails)
  { const t = base('j'); speckle(t, 'X', 12, 180); speckle(t, 'D', 6, 181); add('trail', t); }
  // Hillside Gardens flower bed: dark soil with rows of tulips (red, yellow, pink, white)
  { const t = base('w'); speckle(t, 'x', 8, 185); for (let y = 2; y < 16; y += 4) for (let x = 1 + (y % 8 === 2 ? 0 : 2); x < 16; x += 4) { const c = ['R', 'y', 'P', 'W'][((x + y) >> 2) % 4]; t.set(x, y, c); t.set(x, y + 1, 'E'); } add('flowerbed', t); }
  // ---- M3: East End ----
  // parking lot: plain asphalt, a stall line, a wheel stop
  { const t = asphalt(190); speckle(t, 's', 4, 191); add('lot', t); }
  { const t = asphalt(192); t.vline(0, 0, 15, 'W'); t.vline(1, 0, 15, 'H'); add('lot_stall', t); }
  { const t = asphalt(193); t.vline(0, 0, 15, 'W'); t.rect(4, 12, 9, 2, 'T'); t.hline(4, 12, 14, 'S'); add('lot_stop', t); }
  // a bridge deck edge over the Don: concrete railing on the north / south side
  { const t = sidewalk(194); t.rect(0, 0, 16, 4, 'H'); t.hline(0, 15, 4, 'S'); for (let x = 1; x < 16; x += 4) t.rect(x, 1, 2, 2, 'g'); add('bridge_rail_n', t); }
  { const t = sidewalk(195); t.rect(0, 12, 16, 4, 'H'); t.hline(0, 15, 11, 'S'); for (let x = 1; x < 16; x += 4) t.rect(x, 13, 2, 2, 'g'); add('bridge_rail_s', t); }
  // the DVP's concrete median (jersey barrier) between the north- and southbound lanes
  { const t = asphalt(196); t.rect(5, 0, 6, 16, 'h'); t.vline(5, 0, 15, 'H'); t.vline(10, 0, 15, 'G'); add('median_ns', t); }
  // zoo pen ground (packed dirt + straw)
  { const t = base('X'); speckle(t, 'x', 10, 182); speckle(t, 'y', 6, 183); speckle(t, 'j', 6, 184); add('pen', t); }
  return tiles;
}

export function tilesPreview() {
  return { frames: buildTiles().map((t) => t.img), cols: 10 };
}
