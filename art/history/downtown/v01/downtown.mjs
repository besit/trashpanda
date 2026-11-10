// Downtown art: glass towers, King West brick warehouses, and the landmarks of the core:
// Nathan Phillips Square (City Hall's two curved towers + council saucer, the TORONTO sign,
// the Freedom Arches over the pool), Old City Hall's clock tower, and the news van bursting
// out of the wall at Queen + John. All drawn for the 3/4 map (roof on top, facade below).
import { Img, sheet } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { BRICKS, brickWall, sashWindow, storefront, roof } from './buildings.mjs';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

// glass families: [mullion/dark, base glass, reflection, highlight]
export const GLASS = {
  blue: ['k', 'u', 'U', 'c'],
  teal: ['k', 'f', 'F', 'C'],
  dark: ['K', 'k', 'g', 'G'],
  bronze: ['w', 'x', 'X', 'j'],
  sky: ['g', 'U', 'c', 'C'],
};

/** Glass curtain-wall tower facade: mullion grid, spandrel bands, sky reflections, lobby + canopy. */
export function towerFacade({ w = 64, floors = 10, glass = 'blue', seed = 1 } = {}) {
  const r = rng(seed);
  const G = GLASS[glass] ?? GLASS.blue;
  const floorH = 8, lobbyH = 18, crown = 4;
  const h = crown + floors * floorH + lobbyH;
  const img = new Img(w, h);
  // crown / parapet
  img.rect(0, 0, w, crown, 'H'); img.hline(0, w - 1, crown - 1, G[0]); img.hline(0, w - 1, 0, 'W');
  // glass field: a diagonal sky reflection band + dithered gradient (lighter toward the top)
  const tilt = r.pick([-0.6, -0.4, 0.4, 0.6]), off = r.int(0, w);
  for (let y = crown; y < crown + floors * floorH; y++) {
    const t = (y - crown) / (floors * floorH);
    for (let x = 0; x < w; x++) {
      const band = Math.abs(((x + y * tilt + off) % 40 + 40) % 40 - 20) < 4;
      let c = bay(x, y) < 0.45 - t * 0.35 ? G[2] : G[1];
      if (band) c = bay(x, y) < 0.6 ? G[3] : G[2];
      img.set(x, y, c);
    }
  }
  // mullions every 6px, spandrels every floor
  const mull = r.pick([6, 6, 8]);
  for (let x = mull; x < w - 1; x += mull) img.vline(x, crown, crown + floors * floorH - 1, G[0]);
  for (let f = 0; f <= floors; f++) { const y = crown + f * floorH; img.hline(0, w - 1, y, G[0]); if (f < floors) img.hline(0, w - 1, y + 1, glass === 'dark' ? 'g' : 'h'); }
  // a few lit / blinds-down panes
  for (let i = 0; i < floors * 2; i++) { const fx = r.int(0, Math.floor(w / mull) - 1) * mull + 1, fy = crown + r.int(0, floors - 1) * floorH + 2; img.rect(fx, fy, mull - 1, floorH - 3, r.chance(0.5) ? 'H' : 'D'); }
  // corner fins
  img.vline(0, crown, h - 1, G[0]); img.vline(w - 1, crown, h - 1, G[0]);
  // lobby: double-height dark glass, stone columns, entrance canopy
  const ly = crown + floors * floorH;
  img.rect(0, ly, w, lobbyH, 'k');
  img.rect(1, ly + 2, w - 2, lobbyH - 3, 'u');
  for (let x = 1; x < w - 1; x++) if ((x + ly) % 7 < 2) img.vline(x, ly + 3, ly + lobbyH - 3, 'U');
  for (let x = 0; x < w; x += 12) img.rect(x, ly, 2, lobbyH, 'T');
  img.hline(0, w - 1, ly, 'H');
  const dx = Math.round(w / 2 - 6);
  img.rect(dx - 2, ly + 4, 16, 2, 'H'); img.hline(dx - 2, dx + 13, ly + 6, 'g'); // canopy
  img.rect(dx, ly + 7, 10, lobbyH - 7, 'K'); img.rect(dx + 1, ly + 8, 8, lobbyH - 8, 'U'); img.vline(dx + 5, ly + 8, ly + lobbyH - 1, 'K');
  return img;
}

/** King West brick-and-beam warehouse: pilaster bays, big segmental-arched windows, stone base. */
export function warehouseFacade({ w = 64, floors = 4, brick = 'red', seed = 1 } = {}) {
  const r = rng(seed);
  const b = BRICKS[brick] ?? BRICKS.red;
  const floorH = 14, groundH = 20, cornice = 6;
  const h = cornice + floors * floorH + groundH;
  const img = new Img(w, h);
  brickWall(img, 0, 0, w, h, b, r, false);
  // corbelled cornice
  img.rect(0, 0, w, 4, b.dark); img.hline(0, w - 1, 0, 'T');
  for (let x = 1; x < w; x += 3) { img.set(x, 4, b.dark); img.set(x, 5, 'k'); }
  // pilasters
  const bays = Math.max(2, Math.round(w / 16)), bw = w / bays;
  for (let k = 0; k <= bays; k++) { const x = Math.round(k * bw) - (k === bays ? 3 : 0); img.rect(x, cornice, 3, h - cornice - groundH, b.light); img.vline(x + 2, cornice, h - groundH - 1, b.dark); }
  // windows: big arched industrial sash, 2x3 panes
  for (let f = 0; f < floors; f++) for (let k = 0; k < bays; k++) {
    const x0 = Math.round(k * bw) + 5, ww = Math.round(bw) - 8, y0 = cornice + f * floorH + 3, wh = floorH - 5;
    img.rect(x0, y0, ww, wh, 'T'); // stone surround
    img.rect(x0 + 1, y0 + 1, ww - 2, wh - 1, r.chance(0.15) ? 'd' : 'u');
    img.hline(x0, x0 + ww - 1, y0 - 1, b.dark); // segmental arch brick header
    img.set(x0, y0, b.base); img.set(x0 + ww - 1, y0, b.base);
    for (let i = x0 + 1 + Math.floor((ww - 2) / 3); i < x0 + ww - 1; i += Math.max(2, Math.floor((ww - 2) / 3))) img.vline(i, y0 + 1, y0 + wh - 1, 'W');
    img.hline(x0 + 1, x0 + ww - 2, y0 + Math.floor(wh / 2), 'W');
    img.set(x0 + 1, y0 + 1, 'c');
  }
  // ground floor: converted to shops/cafes, under a stone band
  const gy = cornice + floors * floorH;
  img.rect(0, gy, w, 2, 'T');
  storefront(img, 0, gy + 2, w, groundH - 2, r);
  // painted ghost sign on some
  if (r.chance(0.4) && floors >= 3) { const sy = cornice + 2, sx = 4; img.rect(sx, sy, Math.min(30, w - 8), 7, b.dark); for (let i = sx + 2; i < sx + Math.min(28, w - 10); i += 2) img.set(i, sy + 3, 'T'); }
  return img;
}

/** Glass tower roof: grey membrane, mechanical penthouse, window-washer davits. */
function towerRoof(w, d, r) {
  const img = roof(w, d, r, 'tower');
  img.rect(0, 0, w, d, 'G');
  for (let i = 0; i < (w * d) / 18; i++) img.set(r.int(0, w - 1), r.int(0, d - 1), r.pick(['h', 'g']));
  img.rect(0, 0, w, 1, 'H'); img.rect(w - 1, 0, 1, d, 'k'); img.rect(0, d - 1, w, 1, 'g'); img.rect(0, 0, 1, d, 'h');
  const pw = Math.round(w * 0.45), pd = Math.round(d * 0.5), px = r.int(3, w - pw - 3), py = r.int(3, d - pd - 3);
  img.rect(px, py, pw, pd, 'h'); img.rect(px, py + pd, pw, 3, 'g'); img.hline(px, px + pw - 1, py, 'H');
  for (let x = px + 2; x < px + pw - 2; x += 3) img.vline(x, py + 2, py + pd - 2, 'G');
  for (let x = 2; x < w - 2; x += 8) img.set(x, 2, 'K');
  return img;
}

/** 3/4 image for the downtown kinds (tower | warehouse). */
export function downtownBuilding({ w = 64, d = 48, floors = 8, brick = 'red', glass = 'blue', seed = 1, kind = 'tower' } = {}) {
  const r = rng(seed * 13 + 5);
  const fac = kind === 'tower' ? towerFacade({ w, floors, glass, seed }) : warehouseFacade({ w, floors, brick, seed });
  const rf = kind === 'tower' ? towerRoof(w, d, r) : roof(w, d, r, 'shop');
  const img = new Img(w, d + fac.h);
  img.blit(rf, 0, 0);
  img.blit(fac, 0, d);
  img.hline(0, w - 1, d, 'K');
  return { img, footprint: { w, d }, facadeH: fac.h };
}

// ---------------------------------------------------------------- landmarks

/**
 * Toronto City Hall (Viljo Revell, 1965): two curved concrete towers of unequal height cradling the
 * white council-chamber saucer on its podium. Seen from the square (south) in 3/4.
 */
export function cityHall() {
  const W = 224, H = 172, img = new Img(W, H);
  const base = H - 4;
  // podium
  img.rect(10, base - 22, W - 20, 22, 'T'); img.hline(10, W - 11, base - 22, 'W');
  for (let x = 14; x < W - 14; x += 8) img.rect(x, base - 16, 4, 16, 'g');
  img.hline(10, W - 11, base - 1, 'S');
  // a curved tower: plan is a quarter-ellipse, so the south face shades from lit (outer) to dark (inner)
  const tower = (x0, x1, top, flip) => {
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0), u = flip ? 1 - t : t; // 0 = outer edge, 1 = inner (facing the saucer)
      const topY = top + Math.round(Math.pow(u, 2.2) * 10); // the curved back rises toward the outer edge
      for (let y = topY; y < base - 22; y++) {
        // vertical concrete fins every 3px with narrow glass between; shading follows the curve
        const fin = (x - x0) % 3 === 0;
        const shade = u < 0.35 ? 0 : u < 0.7 ? 1 : 2;
        let c = fin ? ['W', 'H', 'h'][shade] : ['h', 'G', 'g'][shade];
        if (!fin && (y - topY) % 6 === 0) c = ['H', 'h', 'G'][shade];
        if (!fin && bay(x, y) < 0.12 && shade < 2) c = 'U';
        img.set(x, y, c);
      }
      img.set(x, topY, 'W');
    }
    // the curved back's rim
    img.vline(flip ? x1 : x0, top, base - 23, 'h');
  };
  tower(14, 92, 6, false);    // east tower (taller), drawn on the left from the square looking north? -> keep classic view: taller on the right
  tower(132, 210, 36, true);
  // swap visual heights: the east (right) tower is taller in the classic view from the square
  const tmp = new Img(W, H); tmp.blit(img, 0, 0, { flipX: true }); img.px = tmp.px;
  // redraw podium edge after flip (symmetric anyway)
  // the saucer: white flattened dome on a slender stem, between the towers
  const cx = W / 2, cy = base - 44;
  img.rect(cx - 4, cy, 8, 22, 'h'); img.vline(cx - 4, cy, cy + 21, 'H');
  img.ellipse(cx, cy, 44, 12, 'H');
  img.ellipse(cx, cy - 3, 40, 10, 'W');
  img.ellipse(cx, cy - 8, 26, 6, 'W');
  img.hline(cx - 44, cx + 44, cy + 1, 'h');
  for (let x = cx - 40; x <= cx + 40; x++) if (bay(x, cy + 3) < 0.5) img.set(x, cy + 3, 'G');
  // ramp up to the podium roof garden
  img.line(16, base - 2, 40, base - 22, 'S'); img.line(17, base - 2, 41, base - 22, 'S');
  img.outline('K');
  img.pivot = { x: 0.5, y: base / H };
  return img;
}

/** The 3D TORONTO sign, letters lit in a colour sweep. */
export function torontoSign() {
  const word = 'TORONTO';
  const L = {
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    O: ['.###.', '##.##', '#...#', '#...#', '#...#', '##.##', '.###.'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  };
  const cols = [['R', 'q'], ['O', 'y'], ['y', 'Y'], ['l', 'L'], ['F', 'C'], ['c', 'C'], ['V', 'Z']];
  const s = 2, gap = 2, depth = 3;
  const W = word.length * (5 * s + gap) + depth + 4, H = 7 * s + depth + 6;
  const img = new Img(W, H);
  [...word].forEach((ch, i) => {
    const g = L[ch], ox = 2 + i * (5 * s + gap), oy = 2;
    const [side, face] = cols[i];
    for (let d = depth; d >= 1; d--) for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if (g[y][x] === '#') img.rect(ox + x * s + d, oy + y * s + d, s, s, d === 1 ? side : 'k');
    for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if (g[y][x] === '#') img.rect(ox + x * s, oy + y * s, s, s, face);
  });
  img.outline('K');
  img.pivot = { x: 0.5, y: (H - 1) / H };
  return img;
}

/** The three concrete Freedom Arches spanning the reflecting pool. */
export function freedomArches(w = 192) {
  const H = 44, img = new Img(w, H);
  for (let k = 0; k < 3; k++) {
    const x0 = 8 + k * ((w - 16) / 3), x1 = x0 + (w - 16) / 3 - 4;
    const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2;
    for (let x = Math.round(x0); x <= Math.round(x1); x++) {
      const t = (x - cx) / rx, y = Math.round(H - 4 - Math.sqrt(Math.max(0, 1 - t * t)) * (H - 10));
      img.rect(x, y, 1, 3, 'W'); img.set(x, y + 3, 'h');
    }
    img.rect(Math.round(x0) - 1, H - 6, 4, 6, 'H'); img.rect(Math.round(x1) - 2, H - 6, 4, 6, 'H');
  }
  img.outline('K');
  img.pivot = { x: 0.5, y: (H - 1) / H };
  return img;
}

/** Old City Hall (1899): Romanesque sandstone with the off-centre clock tower. Facade + roof, 3/4. */
export function oldCityHall(w = 160, d = 64) {
  const r = rng(1899);
  const facH = 58, towerW = 22, towerH = 96;
  const H = d + facH + towerH - 30, img = new Img(w, H);
  const top = towerH - 30; // roof starts here
  // roof: grey slate hips (a long ridge, sloped ends) with copper-green corner turrets + cresting
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    const toRidge = Math.abs(y - d / 2), endSlope = Math.min(x, w - 1 - x);
    const north = y < d / 2;
    let c = endSlope < toRidge ? (x < w / 2 ? 'G' : 'g') : north ? 'G' : 'g';
    if ((x * 3 + y * 5) % 11 === 0) c = 's';
    img.set(x, top + y, c);
  }
  img.hline(Math.round(d / 2), w - 1 - Math.round(d / 2), top + Math.round(d / 2), 'h');
  for (let x = Math.round(d / 2); x < w - d / 2; x += 3) img.set(x, top + Math.round(d / 2) - 1, 'K');
  for (const [cx, cy] of [[6, top + 6], [w - 7, top + 6], [6, top + d - 6], [w - 7, top + d - 6]]) { img.circle(cx, cy, 5, 'f'); img.circle(cx - 1, cy - 1, 3, 'F'); img.set(cx, cy - 1, 'C'); }
  img.hline(0, w - 1, top, 'h');
  // facade: sandstone with rusticated courses, round-arched windows
  const fy = top + d;
  const sand = { base: 'j', dark: 'X', light: 'D' };
  brickWall(img, 0, fy, w, facH, sand, r, true);
  for (let y = fy; y < fy + facH; y += 4) img.hline(0, w - 1, y, 'X');
  for (let f = 0; f < 3; f++) for (let x = 8; x < w - 8; x += 12) {
    const wy = fy + 6 + f * 16;
    img.rect(x, wy, 6, 10, 'u'); img.set(x, wy, 'j'); img.set(x + 5, wy, 'j'); img.hline(x, x + 5, wy - 1, 'X'); img.set(x + 1, wy + 1, 'c');
  }
  // grand entrance arches
  const ex = Math.round(w * 0.42);
  for (let k = 0; k < 3; k++) { const ax = ex + k * 10; img.rect(ax, fy + facH - 16, 8, 16, 'k'); img.ellipse(ax + 4, fy + facH - 16, 4, 3, 'k'); }
  // clock tower (right of centre)
  const tx = Math.round(w * 0.6);
  brickWall(img, tx, 0, towerW, top + d + 6, sand, r, true);
  for (let y = 4; y < top + d; y += 4) img.hline(tx, tx + towerW - 1, y, 'X');
  img.poly([[tx - 2, 8], [tx + towerW / 2, -18], [tx + towerW + 2, 8]], 'f'); // spire (clipped by the canvas top is fine)
  img.rect(tx - 2, 8, towerW + 4, 3, 'F');
  // clock faces
  const cy = 24; img.circle(tx + towerW / 2, cy, 6, 'W'); img.circle(tx + towerW / 2, cy, 6, 'K', false); img.vline(tx + towerW / 2, cy - 4, cy, 'K'); img.hline(tx + towerW / 2, tx + towerW / 2 + 3, cy, 'K');
  for (let y = cy + 12; y < top + d - 6; y += 10) img.rect(tx + towerW / 2 - 2, y, 4, 6, 'u');
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: facH };
}

/** The news van bursting out of the wall at Queen + John (299 Queen St W). */
export function newsVan() {
  const img = Img.fromGrid(`
.........KKKKKKKKKK....
........KWWWWWWWWWK....
.......KWccWWRRRWWK....
......KWcccWWRRRWWKKK..
.....KWWcccWWWWWWWWWHK.
....KKKKKKKKKKKKKKKKKK.
....KHHHHHHHHHHHHHHHHK.
....KHRRRRHHHHHHHHHYYK.
....KHHHHHHHHHHHHHHHHK.
....KKKKKKKKKKKKKKKKKK.
......KkkK......KkkK...
......KkgK......KkgK...
.......KK........KK....`);
  // broken bricks around the hole
  img.set(2, 3, 'B'); img.set(1, 6, 'b'); img.set(3, 9, 'B'); img.set(0, 4, 'n');
  img.pivot = { x: 0.5, y: 1 };
  return img;
}

/** A string of red paper lanterns (Chinatown, Spadina + Dundas), hung over the sidewalk. */
export function lanterns() {
  const img = new Img(34, 16);
  for (let x = 0; x < 34; x++) img.set(x, 2 + Math.round(Math.sin((x / 33) * Math.PI) * 3), 'k');
  for (const lx of [5, 13, 21, 29]) {
    const ly = 4 + Math.round(Math.sin((lx / 33) * Math.PI) * 3);
    img.vline(lx, ly - 1, ly, 'k'); img.ellipse(lx, ly + 4, 3, 4, 'R'); img.vline(lx - 1, ly + 1, ly + 7, 'q'); img.hline(lx - 2, lx + 2, ly + 1, 'y'); img.hline(lx - 2, lx + 2, ly + 8, 'y'); img.vline(lx, ly + 9, ly + 10, 'y');
  }
  img.pivot = { x: 0.5, y: 0 };
  return img;
}

export function downtownPreview() {
  const frames = [
    downtownBuilding({ w: 64, floors: 10, glass: 'blue', seed: 1 }).img,
    downtownBuilding({ w: 48, floors: 13, glass: 'teal', seed: 2 }).img,
    downtownBuilding({ w: 80, floors: 8, glass: 'dark', seed: 3 }).img,
    downtownBuilding({ w: 64, floors: 4, brick: 'red', seed: 4, kind: 'warehouse' }).img,
    downtownBuilding({ w: 48, floors: 5, brick: 'buff', seed: 5, kind: 'warehouse' }).img,
    oldCityHall().img, cityHall(), torontoSign(), freedomArches(), newsVan(),
  ];
  return { frames, cols: 5 };
}
