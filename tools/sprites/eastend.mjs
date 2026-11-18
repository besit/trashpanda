// East End art (M3): the big-box store and its parking lot (mission 7), the Broadview Hotel,
// the Don Valley pieces, and the side-view parking-lot mission props (incl. the Monster SUV boss).
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { scene, render, orthoCam } from '../lib/sdf.mjs';
import { suvModel } from './props.mjs';
import { BRICKS, brickWall, sashWindow, storefront } from './buildings.mjs';

/** MEGAMART: a long windowless grey box with a garish sign + a loading dock (3/4 facade). */
export function bigBoxFacade(w = 192) {
  const h = 34, img = new Img(w, h);
  img.rect(0, 0, w, h, 'h'); for (let x = 0; x < w; x += 12) img.vline(x, 0, h - 1, 'G'); // ribbed metal
  img.rect(0, 0, w, 3, 'G');
  // the sign
  const sx = Math.round(w / 2 - 40);
  img.rect(sx, 5, 80, 12, 'R'); img.rect(sx + 1, 6, 78, 10, 'q');
  pixelWord(img, 'MEGAMART', w / 2, 8, 'W');
  // entrance + dock doors
  img.rect(sx + 24, h - 12, 32, 12, 'k'); img.rect(sx + 25, h - 11, 30, 11, 'U'); img.vline(sx + 40, h - 11, h - 1, 'k');
  for (const dx of [8, 40, w - 60, w - 30]) { img.rect(dx, h - 14, 20, 14, 'G'); for (let y = h - 13; y < h; y += 2) img.hline(dx + 1, dx + 18, y, 'h'); }
  return img;
}

/** The Broadview Hotel (Queen + Broadview): red-brick Romanesque corner block with its rooftop sign. */
export function broadviewFacade(w = 64) {
  const r = rng(1891);
  const b = BRICKS.red, h = 4 + 4 * 15 + 22;
  const img = new Img(w, h + 10);
  brickWall(img, 0, 10, w, h, b, r, false);
  img.rect(0, 10, w, 4, 'b'); img.hline(0, w - 1, 10, 'n');
  // the rooftop sign frame
  img.rect(6, 0, w - 12, 9, 'K'); img.rect(7, 1, w - 14, 7, 'k');
  for (let x = 10; x < w - 10; x += 3) img.set(x, 4, 'y');
  for (let f = 0; f < 4; f++) for (let k = 0; k < 4; k++) sashWindow(img, Math.round(((k + 0.5) * w) / 4 - 3), 14 + 4 + f * 15, 6, 10, { arch: true, lit: r.chance(0.2) });
  storefront(img, 0, 10 + 4 + 4 * 15, w, 22, r);
  return img;
}

/**
 * The Don Jail (1864, William Thomas; now Bridgepoint's administration building), Gerrard St E. M4.1 redraw from
 * Ivan's photo: a tall pale-limestone centre block, five bays, heavy rusticated quoins and banded columns, tall
 * arched windows upstairs, a dentilled cornice under a pediment, a rusticated porch over the arched door with a
 * wide flight of steps; lower wings of khaki stone with three rows of small arched windows under a grey slate
 * hip; and two square brick ventilation towers rising behind the wings beside the centre block.
 * Returns the whole building (roof + facades) for the map: { img, footprint, facadeH }.
 */
export function donJailBuilding(w = 224, d = 64) {
  const HF = 50, RISE = 30, PED = 12, TOP = 2;          // wing facade, centre rise above it, pediment, headroom
  const H = TOP + d + HF, front = TOP + d;              // front = the wings' cornice line on the image
  const img = new Img(w, H), r = rng(1864);
  const cx = Math.round(w / 2), pw = 86, px0 = cx - pw / 2, px1 = cx + pw / 2;
  // ---- the wings' slate hip roof (the whole footprint; the centre block stands in front of it) ----
  img.rect(0, TOP + 6, w, d - 6, 'G');
  for (let y = TOP + 8; y < front; y += 3) img.hline(0, w - 1, y, 'g');
  img.poly([[0, front - 1], [0, TOP + 6], [16, TOP + 6], [16, front - 1]], 'h');            // hip ends, lit + shaded
  for (let y = TOP + 8; y < front; y += 3) img.hline(0, 15, y, 'G');
  img.poly([[w - 16, TOP + 6], [w - 1, TOP + 6], [w - 1, front - 1], [w - 16, front - 1]], 'g');
  img.hline(0, w - 1, TOP + 6, 'H'); img.hline(0, w - 1, front - 1, 'k');
  // ---- two square brick ventilation towers behind the wings, beside the centre block ----
  for (const tx of [px0 - 26, px1 + 8]) {
    const tw = 18, ty1 = front - 18, ty0 = ty1 - 34;
    img.rect(tx, ty0 - 5, tw, 5, 'g');                                    // top face
    img.rect(tx - 1, ty0 - 1, tw + 2, 3, 'T');                            // cap cornice
    img.rect(tx, ty0 + 2, tw, ty1 - ty0 - 2, 'X');
    for (let y = ty0 + 4; y < ty1; y += 3) img.hline(tx, tx + tw - 1, y, 'x');
    img.vline(tx + tw - 1, ty0 + 2, ty1 - 1, 'x');
    for (const ox of [3, 10]) { img.rect(tx + ox, ty0 + 6, 4, 9, 'k'); img.set(tx + ox, ty0 + 6, 'X'); img.set(tx + ox + 3, ty0 + 6, 'X'); }
    img.hline(tx, tx + tw - 1, ty0 + 17, 'T');
  }
  // ---- the wings: khaki stone, three rows of small arched windows, basement lights ----
  const wingY = front;
  img.rect(0, wingY, w, HF, 't');
  for (let y = wingY + 2; y < H; y += 3) for (let x = (y % 2) * 3; x < w; x += 6) if (r.chance(0.5)) img.set(x, y, r.chance(0.5) ? 'S' : 'T');
  img.rect(0, wingY, w, 2, 'T'); img.hline(0, w - 1, wingY + 2, 'S');                         // eaves cornice
  img.rect(0, H - 6, w, 6, 'S'); img.hline(0, w - 1, H - 6, 'h');                            // plinth
  for (let x = 6; x < w - 6; x += 12) {
    if (x + 6 > px0 - 2 && x < px1 + 2) continue;
    for (let f = 0; f < 3; f++) {
      const y = wingY + 6 + f * 13;
      img.rect(x - 1, y - 1, 7, 10, 'T'); img.rect(x, y + 1, 5, 7, 'k'); img.hline(x + 1, x + 3, y, 'k');
      img.vline(x + 2, y + 1, y + 7, 'G'); img.hline(x, x + 4, y + 4, 'G');
      if (r.chance(0.08)) img.rect(x + 3, y + 5, 1, 2, 'y');
    }
    img.rect(x + 1, H - 4, 3, 2, 'k');
  }
  // ---- the centre block ----
  const cTop = front - RISE;
  img.rect(px0 - 2, cTop - 6, pw + 4, 6, 'G'); img.hline(px0 - 2, px1 + 1, cTop - 6, 'h');   // its own roof, seen over the cornice
  img.rect(px0, cTop, pw, H - cTop, 'T');
  for (let y = cTop + 3; y < H; y += 5) img.hline(px0, px1 - 1, y, 'H');                     // ashlar courses
  img.vline(px1 - 1, cTop, H - 1, 't');
  // rusticated quoins + banded pilasters: alternating long/short blocks
  const rustic = (x, wv, y0, y1) => {
    for (let y = y0, k = 0; y < y1; y += 4, k++) { const ww = k % 2 ? wv : wv - 2; img.rect(x + (k % 2 ? 0 : 1), y, ww, 3, 'h'); img.hline(x + (k % 2 ? 0 : 1), x + (k % 2 ? 0 : 1) + ww - 1, y + 3, 'S'); }
  };
  const bays = [6, 12, 6, 10, 4, 10, 4, 10, 6, 12, 6];   // quoin bay pilaster bay col bay col bay pilaster bay quoin
  let bx = px0; const slots = [];
  bays.forEach((bw, k) => { slots.push([bx, bw, k]); bx += bw; });
  const midY = cTop + 34;                                                                     // string course
  for (const [x, bw, k] of slots) {
    if (k === 0 || k === 10) rustic(x, bw, cTop + 2, H - 6);
    else if (k === 2 || k === 8) rustic(x, bw, cTop + 2, H - 6);
    else if (k === 4 || k === 6) { // banded columns between the upper windows
      for (let y = cTop + 8; y < midY - 2; y += 3) { img.rect(x, y, bw, 2, 'h'); img.hline(x, x + bw - 1, y + 2, 'S'); }
    }
  }
  // entablature: a dentilled cornice, then the pediment
  img.rect(px0 - 2, cTop, pw + 4, 4, 'H'); img.hline(px0 - 2, px1 + 1, cTop + 4, 'S');
  for (let x = px0; x < px1; x += 3) img.set(x, cTop + 5, 'S');
  img.poly([[px0 + 8, cTop], [cx, cTop - PED], [px1 - 9, cTop]], 'T');
  img.line(px0 + 8, cTop, cx, cTop - PED, 'H'); img.line(cx, cTop - PED, px1 - 9, cTop, 'S');
  img.rect(cx - 6, cTop - 4, 12, 2, 'h');                                                    // the carved tympanum
  // upper storey: five tall arched windows
  for (const [x, bw, k] of slots) if (k % 2 === 1) {
    const ww = 6, wx = x + Math.round((bw - ww) / 2), wy = cTop + 10;
    img.rect(wx - 1, wy - 1, ww + 2, 21, 'h'); img.rect(wx, wy + 2, ww, 17, 'k'); img.hline(wx + 1, wx + ww - 2, wy + 1, 'k');
    img.vline(wx + 3, wy + 2, wy + 18, 'G'); img.hline(wx, wx + ww - 1, wy + 10, 'G');
    img.rect(wx - 1, wy + 20, ww + 2, 1, 'S');
  }
  img.rect(px0, midY, pw, 2, 'H'); img.hline(px0, px1 - 1, midY + 2, 'S');
  // ground storey: arched windows in the outer bays, the porch in the middle
  for (const [x, bw, k] of slots) if (k === 1 || k === 9 || k === 3 || k === 7) {
    const ww = 5, wx = x + Math.round((bw - ww) / 2), wy = midY + 7;
    img.rect(wx - 1, wy - 1, ww + 2, 12, 'h'); img.rect(wx, wy + 1, ww, 9, 'k'); img.hline(wx + 1, wx + ww - 2, wy, 'k'); img.vline(wx + 2, wy + 1, wy + 9, 'G');
  }
  const doorY = H - 7;
  img.rect(cx - 13, midY + 3, 26, 3, 'H'); img.hline(cx - 13, cx + 12, midY + 6, 'S');        // porch entablature
  for (const dx of [-12, 8]) for (let y = midY + 7; y < doorY; y += 3) { img.rect(cx + dx, y, 4, 2, 'h'); img.hline(cx + dx, cx + dx + 3, y + 2, 'S'); }
  img.ellipse(cx, midY + 13, 5, 4, 'S'); img.rect(cx - 5, midY + 13, 11, doorY - midY - 13, 'S');
  img.ellipse(cx, midY + 13, 4, 3, 'k'); img.rect(cx - 4, midY + 13, 9, doorY - midY - 13, 'k');
  img.rect(cx - 3, midY + 15, 7, doorY - midY - 15, 'w'); img.vline(cx, midY + 15, doorY - 1, 'x');
  // the wide flight of steps
  for (let k = 0; k < 4; k++) { const sw = 14 + k * 5; img.rect(cx - sw, doorY + k * 2 - 1, sw * 2, 2, k % 2 ? 'H' : 'h'); }
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: HF };
}

/** M4.1: a School Street barrier: a white-and-red sawhorse with the sign (map prop) */
export function schoolStreetBarrier() {
  const im = new Img(30, 22);
  im.rect(1, 10, 28, 5, 'W'); for (let x = 2; x < 28; x += 6) im.rect(x, 10, 3, 5, 'R');
  im.rect(3, 15, 2, 6, 'g'); im.rect(25, 15, 2, 6, 'g');
  im.rect(6, 0, 18, 9, 'y'); im.rect(7, 1, 16, 7, 'Y'); im.rect(14, 8, 2, 2, 'g');
  for (const [x, y] of [[9, 3], [12, 2], [15, 3], [18, 2], [21, 3]]) im.rect(x, y, 2, 3, 'K'); // two kids walking (the school-zone figures)
  im.outline('K'); im.pivot = { x: 0.5, y: 21 / 22 };
  return im;
}
/** M4.1: kids' bikes in a rack, seen from above (map prop) */
export function kidBikes() {
  const im = new Img(30, 14), cols = ['R', 'c', 'y', 'L', 'P'];
  im.rect(0, 9, 30, 1, 'h');
  for (let i = 0; i < 5; i++) { const x = 2 + i * 6; im.rect(x, 2, 2, 10, 'k'); im.rect(x, 5, 2, 3, cols[i]); im.set(x, 1, 'g'); }
  im.outline('K'); im.pivot = { x: 0.5, y: 0.9 };
  return im;
}

/** a parking-lot light pole (map prop) */
export function lotLight() {
  const im = new Img(14, 40);
  im.rect(6, 6, 2, 32, 'g'); im.rect(1, 3, 12, 3, 'G'); im.rect(2, 6, 3, 1, 'Y'); im.rect(9, 6, 3, 1, 'Y');
  im.ellipse(7, 38, 4, 1, 'g');
  im.outline('K'); im.pivot = { x: 0.5, y: 38 / 40 };
  return im;
}

// ---------------------------------------------------------------- side view (mission 7)

/** the big-box wall behind the parking lot: tileable 768 x 120 */
/**
 * The Megamart wall behind mission 4 (scrolls with the street). M4.3 (game review: one sign every 384 px meant every
 * screen looked the same): three different 384-px bays - the store front, the garden centre, the pickup bay - with
 * rooftop units breaking the skyline and lamp posts along the lot.
 */
export function bigBoxStrip(W = 1152) {
  const H = 120, img = new Img(W, H), r = rng(2021);
  img.rect(0, 30, W, 90, 'h');
  for (let x = 0; x < W; x += 16) img.vline(x, 30, H - 1, 'G');
  img.rect(0, 30, W, 4, 'G'); img.hline(0, W - 1, 34, 'g');
  // rooftop units (silhouette variety)
  for (const [x, w, h] of [[40, 30, 8], [250, 22, 6], [470, 34, 9], [610, 18, 5], [860, 28, 8], [1040, 24, 7]]) {
    img.rect(x, 30 - h, w, h, 'G'); img.hline(x, x + w - 1, 30 - h, 'h'); for (let i = x + 3; i < x + w - 2; i += 4) img.vline(i, 32 - h, 28, 'g');
  }
  const dock = (x) => { img.rect(x, 80, 48, 40, 'G'); for (let y = 82; y < H; y += 4) img.hline(x + 2, x + 45, y, 'h'); };
  const banner = (cx, y, word, bg, fg, sc = 1) => {
    const w = pixelWidth(word) * sc + 10;
    img.rect(cx - w / 2 - 1, y - 1, w + 2, 5 * sc + 8, 'k'); img.rect(cx - w / 2, y, w, 5 * sc + 6, bg);
    pixelWord(img, word, cx, y + 3, fg, sc);
  };
  // bay 1: the store front: the big sign, dock doors, the entrance
  banner(195, 44, 'MEGAMART', 'R', 'W', 2);
  dock(20); dock(300);
  img.rect(170, 92, 50, 28, 'k'); img.rect(172, 94, 46, 26, 'U'); img.vline(195, 94, 119, 'k');
  // bay 2: the garden centre: a chain-link pen of potted shrubs, pallets of soil, a SALE tag
  const g0 = 384;
  banner(g0 + 120, 46, 'GARDEN CENTRE', 'E', 'W');
  img.rect(g0 + 30, 76, 190, 44, 'g');
  for (let x = g0 + 30; x < g0 + 220; x += 3) for (let y = 77; y < H; y += 3) img.set(x + ((y / 3) % 2), y, 'H');
  for (let x = g0 + 40; x < g0 + 214; x += 17) { img.rect(x, 108, 10, 8, 'w'); img.ellipse(x + 5, 103, 7, 6, 'e'); img.ellipse(x + 3, 101, 4, 3, 'l'); }
  for (let x = g0 + 30; x <= g0 + 220; x += 38) img.vline(x, 74, H - 1, 'k');
  img.hline(g0 + 30, g0 + 220, 74, 'k');
  for (const [x, n] of [[g0 + 250, 3], [g0 + 300, 2]]) for (let k = 0; k < n; k++) { img.rect(x, 112 - k * 8, 40, 8, 'X'); img.rect(x, 118 - k * 8, 40, 2, 'w'); img.hline(x, x + 39, 112 - k * 8, 'j'); }
  banner(g0 + 300, 50, 'SALE', 'o', 'K', 2);
  // bay 3: the pickup bay: an awning over two lanes, the "SUV DAYS" banner, bollards
  const p0 = 768;
  banner(p0 + 110, 42, 'SUV DAYS', 'U', 'W', 2);
  banner(p0 + 110, 64, 'FREE PARKING', 'y', 'K');
  for (let x = p0 + 20; x < p0 + 200; x++) img.vline(x, 84, 90, (Math.floor((x - p0) / 8) % 2) ? 'W' : 'R');
  img.hline(p0 + 20, p0 + 199, 91, 'k');
  img.rect(p0 + 34, 92, 64, 28, 'k'); img.rect(p0 + 36, 94, 60, 26, 'g'); img.rect(p0 + 120, 92, 64, 28, 'k'); img.rect(p0 + 122, 94, 60, 26, 'g');
  banner(p0 + 110, 98, 'PICKUP', 'R', 'W');
  for (const x of [p0 + 26, p0 + 194]) { img.rect(x, 104, 5, 16, 'y'); img.rect(x, 108, 5, 2, 'K'); img.rect(x, 114, 5, 2, 'K'); }
  dock(p0 + 250); dock(p0 + 310);
  // lamp posts along the lot, in the gaps between the bays' signs and doors
  for (const x of [96, 288, 384 + 235, 384 + 362, 768 + 225, 768 + 370]) { img.vline(x, 56, H - 1, 'k'); img.vline(x + 1, 56, H - 1, 'g'); img.rect(x - 6, 54, 14, 3, 'k'); img.rect(x - 5, 57, 12, 1, 'Y'); }
  for (let i = 0; i < 60; i++) img.set(r.int(0, W - 1), r.int(36, H - 1), 'H');
  return img;
}

/** M4.3: the Megamart strip's three bays, for the art history */
export function bigBoxPreview() { const s = bigBoxStrip(); return { frames: [s.crop(0, 0, 384, 120), s.crop(384, 0, 384, 120), s.crop(768, 0, 384, 120)], cols: 1 }; }

const GLYPHS = {
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], E: ['####', '#...', '###.', '#...', '####'], G: ['.###', '#...', '#.##', '#..#', '.###'],
  A: ['.##.', '#..#', '####', '#..#', '#..#'], R: ['###.', '#..#', '###.', '#.#.', '#..#'], T: ['#####', '..#..', '..#..', '..#..', '..#..'],

  S: ['.###', '#...', '.##.', '...#', '###.'], L: ['#...', '#...', '#...', '#...', '####'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  D: ['###.', '#..#', '#..#', '#..#', '###.'], C: ['.###', '#...', '#...', '#...', '.###'], U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  V: ['#...#', '#...#', '.#.#.', '.#.#.', '..#..'], Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'], F: ['####', '#...', '###.', '#...', '#...'],
  P: ['###.', '#..#', '###.', '#...', '#...'], K: ['#..#', '#.#.', '##..', '#.#.', '#..#'], I: ['###', '.#.', '.#.', '.#.', '###'],
};
const pixelWidth = (word) => word.split('').reduce((t, ch) => t + (ch === ' ' ? 3 : GLYPHS[ch][0].length + 1), 0) - 1;
/** 5-px-tall pixel lettering centred on cx, each pixel drawn as sc x sc */
function pixelWord(img, word, cx, y, col, sc = 1) {
  const adv = (ch) => (ch === ' ' ? 3 : GLYPHS[ch][0].length + 1);
  let x = Math.round(cx - ((word.split('').reduce((t, ch) => t + adv(ch), 0) - 1) * sc) / 2);
  for (const ch of word) { if (ch !== ' ') GLYPHS[ch].forEach((row, yy) => [...row].forEach((c, i) => { if (c === '#') img.rect(x + i * sc, y + yy * sc, sc, sc, col); })); x += adv(ch) * sc; }
}

/** cracked asphalt patch to DEPAVE (pump it), and what it becomes: soil + a sapling */
export function asphaltPatch() {
  const img = new Img(40, 10);
  img.ellipse(20, 5, 19, 4, 'a'); img.ellipse(20, 4, 17, 3, 'A');
  for (const [x0, y0, x1, y1] of [[8, 3, 15, 6], [15, 6, 22, 3], [22, 3, 30, 6], [18, 2, 20, 7]]) img.line(x0, y0, x1, y1, 'k');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.6 };
  return img;
}
export function soilSapling() {
  const img = new Img(40, 34);
  img.ellipse(20, 29, 19, 4, 'w'); img.ellipse(20, 28, 17, 3, 'x');
  img.vline(20, 12, 28, 'w');
  img.ellipse(20, 10, 9, 8, 'E'); img.ellipse(17, 8, 5, 4, 'l'); img.ellipse(23, 12, 3, 2, 'e');
  img.rect(19, 26, 3, 3, 'X');
  img.outline('K'); img.pivot = { x: 0.5, y: 30 / 34 };
  return img;
}

/** The Monster SUV (mission 7 boss): a lifted, oversized SUV with a rat king at the wheel. Faces right. */
export function monsterSuv(frame = 0) {
  const objs = suvModel().map((o, i) => (i >= 3 && i <= 6 ? { ...o, d: (p) => o.d([p[0], p[1], p[2] - 1.6]) } : o));
  const lifted = objs.map((o, i) => (i < 3 || i > 6 ? { ...o, d: (p) => o.d([p[0], p[1], p[2] - 3.2]) } : o));
  // huge tyres
  for (const x of [9.5, -9.5]) lifted.push({ d: (p) => { const q = [p[0] - x, p[1], p[2] - 3.4]; const r = Math.hypot(q[0], q[2]); return Math.max(Math.hypot(r - 2.6, 0) - 1.6, Math.abs(q[1]) - 2.4); }, m: { ramp: ['K', 'k', 'g'] } });
  const k = 3.0, w = 120, h = 86;
  const img = render(scene(lifted), { w, h, cx: w / 2, cy: h - 4, cam: orthoCam([0, -1, -0.22]), ambient: 0.18, scale: k });
  // rat king at the wheel: crown on the DF cap
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (['c', 'U', 'C'].includes(img.get(x, y))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const hx = Math.round(x0 + (x1 - x0) * 0.72), hy = Math.round((y0 + y1) / 2) + 2;
  img.circle(hx, hy, 6, 'x'); img.circle(hx - 4, hy - 6, 3, 'x'); img.circle(hx - 4, hy - 6, 2, 'P');
  img.rect(hx + 4, hy, 5, 3, 'x'); img.set(hx + 9, hy, 'P'); img.set(hx + 2, hy - 2, 'W'); img.set(hx + 3, hy - 2, 'K');
  img.rect(hx - 6, hy - 9, 12, 3, 'V'); img.poly([[hx - 6, hy - 9], [hx - 4, hy - 14], [hx - 1, hy - 10], [hx + 2, hy - 14], [hx + 5, hy - 10], [hx + 6, hy - 9]], 'y');
  if (frame) for (let i = 0; i < 8; i++) img.set(w - 4 - i, Math.round(h * 0.5) + (i % 2), 'Y');
  img.pivot = { x: 0.5, y: (h - 4) / h };
  return img;
}

/**
 * M3.1 (Ivan: "I can't jump over him, so he always strikes"): a cart shelter to climb onto. Its roof is
 * higher than the Monster SUV, so the charge passes underneath; drop onto the SUV's roof from it.
 * The roof is the top 6 px; it's 58 px tall. A stack of pallets beside it is the step up.
 */
export function cartShelter() {
  const W = 84, H = 60, img = new Img(W, H);
  img.rect(0, 0, W, 6, 'h'); img.rect(0, 0, W, 2, 'H'); img.rect(0, 5, W, 2, 'R'); // roof + its red edge
  for (const x of [3, 40, 77]) { img.rect(x, 7, 4, H - 9, 'G'); img.vline(x, 7, H - 3, 'h'); }
  // carts nested inside
  for (let k = 0; k < 4; k++) { const x = 10 + k * 7; img.rect(x, 38, 16, 12, null); for (let y = 38; y < 50; y += 3) img.hline(x, x + 15, y, 'S'); for (let xx = x; xx < x + 16; xx += 3) img.vline(xx, 38, 49, 'S'); img.circle(x + 3, 54, 2, 'k'); img.circle(x + 13, 54, 2, 'k'); }
  img.rect(46, 20, 26, 10, 'R'); img.rect(47, 21, 24, 8, 'q'); // a CARTS sign
  img.outline('K'); img.pivot = { x: 0.5, y: (H - 2) / H };
  return img;
}
export function palletStack() {
  const W = 34, H = 30, img = new Img(W, H);
  for (let k = 0; k < 4; k++) { const y = H - 2 - (k + 1) * 7; img.rect(1, y, W - 2, 3, 'X'); img.rect(1, y + 3, W - 2, 4, null); for (const x of [2, 15, 29]) img.rect(x, y + 3, 3, 4, 'x'); img.hline(1, W - 2, y, 'j'); }
  img.outline('K'); img.pivot = { x: 0.5, y: (H - 2) / H };
  return img;
}

export function eastEndPreview() {
  return { frames: [bigBoxFacade(), broadviewFacade(), donJailBuilding().img, cartShelter(), palletStack(), lotLight(), asphaltPatch(), soilSapling(), monsterSuv(0), monsterSuv(1)], cols: 4 };
}
