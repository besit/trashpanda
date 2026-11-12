// Downtown art: glass towers, King West brick warehouses, and the landmarks of the core:
// Nathan Phillips Square (City Hall's two curved towers + council saucer, the TORONTO sign,
// the Freedom Arches over the pool), Old City Hall's clock tower, and the news van bursting
// out of the wall at Queen + John. All drawn for the 3/4 map (roof on top, facade below).
import { Img, sheet } from '../lib/raster.mjs';
import { scene, render, orthoCam } from '../lib/sdf.mjs';
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

/** Toronto City Hall (Viljo Revell, 1965). */
export function cityHall() {
  // v02 (Ivan's ref: city-hall.jpg). Two curved towers of unequal height facing each other: each shows its
  // smooth white convex back on the outside and its dark, finely ribbed concave face on the inside; the
  // roofs read as crescents. The white council saucer sits between them on the podium, with the
  // elevated walkway ring sweeping across the front.
  const W = 240, H = 214, img = new Img(W, H);
  const base = H - 4, podTop = base - 30;
  const tower = (x0, w, top, west) => {
    const crown = 9; // the crescent roof band
    for (let i = 0; i < w; i++) {
      const t = i / (w - 1), u = west ? t : 1 - t; // u: 0 = outer edge -> 1 = inner (concave) edge
      const outer = u < 0.5;
      // the convex back curves away: brightest facing the light (west-ish), darkening toward the inner edge
      for (let y = top + crown; y < podTop; y++) {
        let c;
        if (outer) {
          const shade = west ? u : 0.5 - u + 0.2; // the west tower's back faces the sun
          c = shade < 0.18 ? 'W' : shade < 0.36 ? 'H' : 'h';
          if ((i + (west ? 0 : 1)) % 4 === 0) c = c === 'W' ? 'H' : c === 'H' ? 'h' : 'G'; // thin vertical ribs
        } else {
          // the concave face: dark glass between closely spaced pale fins, floor bands every 5px
          const k = (u - 0.5) / 0.5;
          c = i % 2 === 0 ? (k < 0.5 ? 'G' : 'g') : (k < 0.4 ? 'g' : 'k');
          if ((y - top) % 5 === 0) c = k < 0.5 ? 'h' : 'G';
          if (bay(i, y) < 0.06) c = 'U';
        }
        img.set(x0 + i, y, c);
      }
      // the crescent roof: a curved band whose height follows the plan's curve
      const curve = Math.sin(u * Math.PI) * 0.8 + 0.2;
      const ry = Math.round(top + crown - curve * crown);
      for (let y = ry; y < top + crown; y++) img.set(x0 + i, y, y === ry ? 'W' : outer ? 'H' : 'h');
      img.set(x0 + i, top + crown, 'G');
    }
    // outer silhouette edge + the concave lip
    img.vline(west ? x0 : x0 + w - 1, top + 2, podTop, 'h');
  };
  tower(22, 66, 52, true);    // west tower (20 storeys)
  tower(150, 70, 14, false);  // east tower (27 storeys)
  // podium: a long low block with a dark glazed band and columns
  img.rect(8, podTop, W - 16, base - podTop, 'H'); img.hline(8, W - 9, podTop, 'W');
  img.rect(12, podTop + 8, W - 24, 12, 'k');
  for (let x = 14; x < W - 14; x += 7) img.rect(x, podTop + 8, 2, 12, 'h');
  img.hline(8, W - 9, base - 1, 'S');
  // the saucer: a flattened white dome on a dark drum, between the towers
  const cx = 118, cy = podTop - 2;
  img.rect(cx - 30, cy - 4, 60, 6, 'g');
  img.ellipse(cx, cy - 6, 50, 9, 'h');
  img.ellipse(cx, cy - 9, 47, 8, 'H');
  img.ellipse(cx, cy - 12, 38, 7, 'W');
  img.ellipse(cx - 8, cy - 14, 18, 3, 'W');
  for (let x = cx - 50; x <= cx + 50; x++) if (bay(x, cy - 3) < 0.5) img.set(x, cy - 3, 'G');
  // the elevated walkway ring across the front (a pale band on thin legs)
  for (let x = 4; x < W - 4; x++) {
    const t = (x - 4) / (W - 8), y = Math.round(base - 22 + Math.sin(t * Math.PI) * 9);
    img.rect(x, y, 1, 3, 'T'); img.set(x, y - 1, 'W'); if (x % 14 === 0) img.vline(x, y + 3, base - 1, 'h');
  }
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
  // v02 (Ivan's photo): banded sandstone with red-brown string courses, rows of round-arched windows,
  // steep brown metal roofs with conical corner turrets, a front gable with a rose window, and the
  // clock tower (right of centre) with an arcaded belfry, four clocks and a tall pyramid spire.
  const r = rng(1899);
  const facH = 62, towerW = 26, spire = 46, towerAbove = 78;
  const top = towerAbove + spire;                  // roof starts here
  const H = top + d + facH, img = new Img(w, H);
  const STONE = 'j', BAND = 'x', DARK = 'X';
  // ---- roof: steep brown hips seen from above, with ridge, turrets and dormers ----
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    const toRidge = Math.abs(y - d / 2), endSlope = Math.min(x, w - 1 - x);
    let c = endSlope < toRidge ? (x < w / 2 ? 'x' : 'w') : y < d / 2 ? 'x' : 'w';
    if ((x + y * 2) % 6 === 0) c = c === 'x' ? 'X' : 'x'; // standing-seam metal lines
    img.set(x, top + y, c);
  }
  img.hline(Math.round(d / 2), w - 1 - Math.round(d / 2), top + Math.round(d / 2), 'j');
  // corner turrets (conical, seen from above as rings) + small chimneys
  for (const [cx, cy] of [[7, top + 7], [w - 8, top + 7], [7, top + d - 7], [w - 8, top + d - 7]]) { img.circle(cx, cy, 6, 'w'); img.circle(cx, cy, 4, 'x'); img.circle(cx - 1, cy - 1, 2, 'X'); img.set(cx, cy, 'j'); }
  for (const cx of [40, 72, 112]) { img.rect(cx, top + 10, 4, 6, STONE); img.hline(cx, cx + 3, top + 10, 'D'); }
  // ---- facade ----
  const fy = top + d;
  img.rect(0, fy, w, facH, STONE);
  for (let y = fy; y < fy + facH; y++) for (let x = 0; x < w; x++) if ((x * 7 + y * 3) % 23 === 0) img.set(x, y, 'D'); // stone texture
  for (let y = fy + 3; y < fy + facH; y += 8) img.hline(0, w - 1, y, BAND);   // red-brown string courses
  img.rect(0, fy + facH - 8, w, 8, BAND); img.hline(0, w - 1, fy + facH - 8, DARK); // rusticated base
  // three rows of round-arched windows in pairs
  for (let row = 0; row < 3; row++) {
    const wy = fy + 6 + row * 16, wh = row === 0 ? 8 : 10;
    for (let x = 6; x < w - 8; x += 9) {
      if (x > w * 0.62 - 4 && x < w * 0.62 + towerW + 2) continue; // the tower base
      img.rect(x, wy + 2, 5, wh - 2, 'u'); img.hline(x + 1, x + 3, wy + 1, 'u'); img.set(x + 2, wy, 'u');
      img.hline(x - 1, x + 5, wy - 1, BAND); img.set(x + 1, wy + 3, 'c');
      if (row === 2) img.vline(x + 2, wy + 2, wy + wh - 1, STONE);
    }
  }
  // front gable with a rose window, left of the tower
  const gx = Math.round(w * 0.28);
  img.poly([[gx - 18, fy + 2], [gx, fy - 20], [gx + 18, fy + 2]], STONE);
  img.poly([[gx - 20, fy + 2], [gx, fy - 22], [gx + 20, fy + 2], [gx + 18, fy + 2], [gx, fy - 19], [gx - 18, fy + 2]], 'x');
  img.circle(gx, fy - 6, 4, 'u'); img.circle(gx, fy - 6, 4, BAND, false); img.set(gx, fy - 6, 'c');
  // the grand entrance arches (centre-left)
  const ex = Math.round(w * 0.42);
  for (let k = 0; k < 3; k++) { const ax = ex + k * 9; img.rect(ax, fy + facH - 18, 7, 18, 'k'); img.ellipse(ax + 3, fy + facH - 18, 3, 3, 'k'); img.hline(ax - 1, ax + 7, fy + facH - 22, BAND); }
  // ---- the clock tower ----
  const tx = Math.round(w * 0.62), tTop = spire; // tower shaft top (below the spire)
  img.rect(tx, tTop, towerW, fy + facH - tTop, STONE);
  for (let y = tTop + 4; y < fy + facH; y += 7) img.hline(tx, tx + towerW - 1, y, BAND);
  img.vline(tx, tTop, fy + facH - 1, 'X'); img.vline(tx + towerW - 1, tTop, fy + facH - 1, 'w');
  // corner gargoyles / pinnacles at the clock stage
  img.rect(tx - 2, tTop + 18, 3, 3, 'X'); img.rect(tx + towerW - 1, tTop + 18, 3, 3, 'X');
  // clock faces
  const cy = tTop + 10, ccx = tx + Math.round(towerW / 2);
  img.circle(ccx, cy, 7, 'K'); img.circle(ccx, cy, 6, 'k'); img.circle(ccx, cy, 6, 'D', false);
  img.vline(ccx, cy - 4, cy, 'W'); img.hline(ccx, ccx + 3, cy, 'W');
  // arcaded belfry: tall paired round arches
  for (let k = 0; k < 3; k++) { const ax = tx + 4 + k * 7; img.rect(ax, tTop + 24, 4, 16, 'k'); img.hline(ax + 1, ax + 2, tTop + 23, 'k'); img.vline(ax + 2, tTop + 25, tTop + 39, STONE); }
  for (let k = 0; k < 3; k++) { const ax = tx + 4 + k * 7; img.rect(ax, tTop + 46, 4, 8, 'u'); img.hline(ax + 1, ax + 2, tTop + 45, 'u'); }
  // the pyramid spire with a finial
  img.poly([[tx - 2, tTop + 1], [ccx, 2], [tx + towerW + 2, tTop + 1]], 'x');
  img.poly([[ccx, 2], [tx + towerW + 2, tTop + 1], [ccx, tTop + 1]], 'w');
  for (let y = 8; y < tTop; y += 4) { const hw = ((y - 2) / (tTop - 1)) * (towerW / 2 + 2); img.hline(Math.round(ccx - hw), Math.round(ccx + hw), y, 'X'); }
  img.rect(tx - 3, tTop, towerW + 6, 3, BAND);
  img.vline(ccx, 0, 3, 'g');
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: facH };
}

/**
 * The news van bursting out of the east wall of 299 Queen W (v02: brighter, bigger, facing east).
 * Its rear is buried in a ragged brick hole on the left; the front hangs out over John St.
 */
export function newsVan() {
  const img = Img.fromGrid(`
..bnB...............................
.nBbB.KKKKKKKKKKKKKKKKKKKKK.........
BbnB.KWWWWWWWWWWWWWWWWWWWWWK........
.bBbKWRRRRRRRRRRRRRWWKKKKKKWK.......
nBb.KWRWWWWRWWWWRRRWWKccccUUWK......
.bBnKWRWRRRRWRRRWRRWWKcccUUUUWK.....
BbB.KWRWWWWRWWWWRRRWWKccUUUUUUWK....
.nbBKWWWWWWWWWWWWWWWWWWWWWWWWWWWKK..
bB.nKUUUUUUUUUUUUUUUUUUUUUUUUUUUWYK.
.BbbKWWWWWWWWWWWWWWWWWWWWWWWWWWWWYK.
nB.BKhhhhhhhhhhhhhhhhhhhhhhhhhhhhhK.
.bBnKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.
bBn.....KKKK...............KKKK.....
.B......KggK...............KggK.....
........KKKK...............KKKK.....`);
  img.pivot = { x: 0.15, y: 1 };
  return img;
}

/**
 * One Freedom Arch (M2.1, Ivan: the arches span the pool top to bottom). A concrete half-ring standing
 * in the north-south plane, rendered with the 3/4 props camera so the far leg rises behind the near one.
 * Pivot = the arch's centre on the water.
 */
export function freedomArch(span = 60, rise = 34) {
  const R = span / 2, tube = 2.4;
  const ELEV = (32 * Math.PI) / 180;
  // seen slightly from the west (like the reference photo) so the curve of each arch reads
  const YAW = (28 * Math.PI) / 180;
  const cam = orthoCam([Math.sin(YAW) * Math.cos(ELEV), -Math.cos(YAW) * Math.cos(ELEV), -Math.sin(ELEV)]);
  // a half torus: ring in the y-z plane (axis x), only above the water; squashed vertically to `rise`
  const sq = rise / R;
  const d = (p) => {
    const y = p[1], z = p[2] / sq;
    const q = Math.hypot(Math.hypot(y, z) - R, p[0]) - tube;
    return p[2] < 0 ? Math.max(q, -p[2]) : q;
  };
  const w = Math.ceil(R * 2 * Math.sin(YAW)) + 12, h = Math.ceil(rise * Math.cos(ELEV) + R * Math.sin(ELEV) * 2 + 12);
  const oy = Math.round(h - 4 - R * Math.sin(ELEV));
  const img = render(scene([{ d, m: { ramp: ['h', 'H', 'W', 'W'] } }]), { w, h, cx: w / 2, cy: oy, cam, ambient: 0.35 });
  img.pivot = { x: 0.5, y: oy / h };
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
    oldCityHall().img, cityHall(), torontoSign(), freedomArch(), newsVan(),
  ];
  return { frames, cols: 5 };
}
