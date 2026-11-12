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
 * The Don Jail (1864, William Thomas; now Bridgepoint's administration building), Gerrard St E: a long
 * pale-stone Italianate block. Rows of small barred windows, a projecting centre pavilion with a heavy
 * rusticated arched doorway, and a lantern on the hipped roof (3/4 facade). M3.1.
 */
export function donJailFacade(w = 192) {
  const h = 58, img = new Img(w, h + 12), r = rng(1864), top = 12;
  img.rect(0, top, w, h, 't');
  for (let y = top + 3; y < top + h; y += 4) img.hline(0, w - 1, y, 'S');           // stone courses
  for (let y = top; y < top + h; y += 4) for (let x = ((y / 4) % 2) * 6; x < w; x += 12) img.vline(x, y, y + 3, 'S');
  img.rect(0, top, w, 3, 'H'); img.hline(0, w - 1, top + 3, 'S');                  // cornice
  img.rect(0, top + h - 6, w, 6, 'S'); img.hline(0, w - 1, top + h - 6, 'h');       // plinth
  const cx = Math.round(w / 2), pw = 44;
  // wings: three storeys of small barred windows
  for (let f = 0; f < 3; f++) for (let x = 8; x < w - 8; x += 12) {
    if (Math.abs(x + 2 - cx) < pw / 2 + 4) continue;
    const y = top + 8 + f * 15;
    img.rect(x - 1, y - 1, 7, 10, 'S'); img.rect(x, y, 5, 8, 'k');
    for (let bx = x + 1; bx < x + 5; bx += 2) img.vline(bx, y, y + 7, 'G');
    if (r.chance(0.1)) img.rect(x + 1, y + 1, 1, 2, 'y');
  }
  // the centre pavilion: rusticated stone, a pediment, the big arched door
  img.rect(cx - pw / 2, top - 6, pw, h + 6, 'T');
  for (let y = top - 3; y < top + h; y += 4) img.hline(cx - pw / 2, cx + pw / 2 - 1, y, 't');
  img.vline(cx - pw / 2, top - 6, top + h - 1, 'S'); img.vline(cx + pw / 2 - 1, top - 6, top + h - 1, 'S');
  img.poly([[cx - pw / 2 - 2, top - 6], [cx, top - 12], [cx + pw / 2 + 1, top - 6]], 'H');
  img.hline(cx - pw / 2 - 2, cx + pw / 2 + 1, top - 6, 'S');
  for (const dx of [-14, 9]) for (let f = 0; f < 2; f++) { const y = top + 6 + f * 14; img.rect(cx + dx, y, 5, 9, 'k'); img.ellipse(cx + dx + 2, y, 2, 2, 'k'); img.vline(cx + dx + 2, y, y + 8, 'G'); }
  // the doorway: heavy voussoirs (the carved "Father Time" keystone is a dot of detail)
  img.ellipse(cx, top + h - 16, 10, 10, 't'); img.rect(cx - 10, top + h - 16, 21, 10, 't');
  img.ellipse(cx, top + h - 16, 7, 7, 'k'); img.rect(cx - 7, top + h - 16, 15, 10, 'k');
  img.rect(cx - 5, top + h - 14, 11, 8, 'w'); img.vline(cx, top + h - 14, top + h - 7, 'x');
  img.rect(cx - 1, top + h - 27, 3, 3, 'S');
  for (const dx of [-12, 11]) img.rect(cx + dx, top + h - 18, 2, 12, 'S');
  img.rect(cx - 12, top + h - 6, 25, 2, 'h'); img.rect(cx - 14, top + h - 4, 29, 2, 'H'); // steps
  return img;
}
/** its roof: grey slate hip with a little lantern over the centre */
export function donJailRoof(w, d) {
  const img = new Img(w, d);
  img.rect(0, 0, w, d, 'G');
  for (let y = 1; y < d; y += 3) img.hline(0, w - 1, y, 'g');
  img.rect(0, 0, w, 2, 'h'); img.rect(0, 0, 2, d, 'h'); img.rect(w - 2, 0, 2, d, 'g');
  const cx = Math.round(w / 2);
  img.rect(cx - 8, Math.round(d / 2) - 6, 16, 12, 'H'); img.rect(cx - 6, Math.round(d / 2) - 4, 12, 8, 'S');
  for (let x = cx - 5; x < cx + 6; x += 3) img.vline(x, Math.round(d / 2) - 4, Math.round(d / 2) + 3, 'k');
  img.rect(cx - 2, Math.round(d / 2) - 9, 4, 4, 'g');
  return img;
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
export function bigBoxStrip(W = 768) {
  const H = 120, img = new Img(W, H), r = rng(2021);
  img.rect(0, 30, W, 90, 'h');
  for (let x = 0; x < W; x += 16) img.vline(x, 30, H - 1, 'G');
  img.rect(0, 30, W, 4, 'G'); img.hline(0, W - 1, 34, 'g');
  // repeating MEGAMART sign + dock doors + a cart corral
  for (let s = 0; s < W; s += 384) {
    img.rect(s + 120, 44, 150, 24, 'R'); img.rect(s + 122, 46, 146, 20, 'q');
    pixelWord(img, 'MEGAMART', s + 195, 51, 'W', 2); // real letters (M3: the old blocks read as blank squares)
    for (const dx of [20, 300]) { img.rect(s + dx, 80, 48, 40, 'G'); for (let y = 82; y < H; y += 4) img.hline(s + dx + 2, s + dx + 45, y, 'h'); }
    img.rect(s + 170, 92, 50, 28, 'k'); img.rect(s + 172, 94, 46, 26, 'U');
  }
  for (let i = 0; i < 40; i++) img.set(r.int(0, W - 1), r.int(36, H - 1), 'H');
  return img;
}

const GLYPHS = {
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], E: ['####', '#...', '###.', '#...', '####'], G: ['.###', '#...', '#.##', '#..#', '.###'],
  A: ['.##.', '#..#', '####', '#..#', '#..#'], R: ['###.', '#..#', '###.', '#.#.', '#..#'], T: ['#####', '..#..', '..#..', '..#..', '..#..'],
};
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
  return { frames: [bigBoxFacade(), broadviewFacade(), donJailFacade(), cartShelter(), palletStack(), lotLight(), asphaltPatch(), soilSapling(), monsterSuv(0), monsterSuv(1)], cols: 4 };
}
