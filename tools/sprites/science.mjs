// Save the Science (mission 6). M4 drew it in a North district on Don Mills; M4.1 (Ivan: "drop North, move the
// mission") moved it to the Waterfront: a Harbourfront warehouse on Queens Quay where the closed Science Centre's
// exhibits sit in storage (the warehouse is the game's; the storage is real, URBAN_RESEARCH section 5).
// The plywood boards + CLOSED sign the mission removes, the crates, the Van de Graaff, the Wrecker, and a
// side-view strip of the warehouse.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { drawText } from './font.mjs';

export function plywood() {
  const img = new Img(26, 22);
  img.rect(0, 0, 26, 22, 'X'); for (let y = 0; y < 22; y += 5) img.hline(0, 25, y, 'x'); img.rect(1, 1, 24, 1, 'j');
  for (const [x, y] of [[2, 2], [22, 2], [2, 18], [22, 18]]) img.set(x, y, 'g');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
export function closedSign() {
  const img = new Img(44, 16);
  img.rect(0, 0, 44, 12, 'R'); img.rect(1, 1, 42, 10, 'r'); img.rect(20, 12, 4, 4, 'g');
  drawText(img, 'CLOSED', 22, 3, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
export function openBanner() {
  const img = new Img(60, 18);
  img.rect(0, 0, 60, 12, 'L'); img.rect(1, 1, 58, 10, 'l'); img.rect(2, 12, 2, 6, 'g'); img.rect(56, 12, 2, 6, 'g');
  drawText(img, 'OPEN!', 30, 3, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}

/** side-view strip for mission 6: a red-brick Harbourfront warehouse, its lettering, windows and loading bays */
export function scienceStrip(W = 768) {
  const H = 140, img = new Img(W, H);
  for (let seg = 0; seg < W; seg += 384) {
    const bx = seg + 24, bw = 336, by = 40;
    img.rect(bx, by, bw, H - by, 'B');
    for (let y = by + 3; y < H; y += 4) img.hline(bx, bx + bw - 1, y, 'b');                       // brick courses
    for (let y = by; y < H; y += 4) for (let x = bx + ((y >> 2) % 2 ? 2 : 6); x < bx + bw; x += 8) img.set(x, y + 1, 'b');
    img.rect(bx - 2, by - 4, bw + 4, 4, 'T'); img.hline(bx - 2, bx + bw + 1, by, 'g');          // the parapet
    img.rect(bx + 50, by + 6, bw - 100, 13, 'u'); img.rect(bx + 51, by + 7, bw - 102, 11, 'U');
    drawText(img, 'SCIENCE CENTRE EXHIBITS', bx + bw / 2, by + 9, 'W');
    for (let x = bx + 12; x < bx + bw - 20; x += 28) {                                           // tall factory windows
      img.rect(x, by + 25, 16, 20, 'k'); img.rect(x + 1, by + 26, 14, 18, 'c');
      img.vline(x + 8, by + 26, by + 43, 'k'); img.hline(x + 1, x + 14, by + 34, 'k'); img.rect(x - 1, by + 45, 18, 2, 'T');
    }
    for (let i = 0; i < 3; i++) {                                                                // three roll-up loading doors
      const dx = bx + 26 + i * 104, dw = 72, dy = by + 56;
      img.rect(dx - 3, dy - 3, dw + 6, 3, 'T'); img.rect(dx, dy, dw, H - dy - 2, 'S');
      for (let y = dy + 3; y < H - 2; y += 4) img.hline(dx, dx + dw - 1, y, 's');
    }
  }
  img.rect(0, H - 2, W, 2, 'T');
  return img;
}

export function sciencePreview() {
  return { frames: [plywood(), closedSign(), openBanner(), crate(), vandegraaff(), wrecker(), scienceStrip().crop(0, 0, 400, 140)], cols: 3 };
}

/** a crate of exhibits ("FRAGILE"), big enough to hide behind (side view, 40x34) */
export function crate() {
  const W = 40, H = 34, img = new Img(W, H);
  img.rect(0, 2, W, H - 2, 'X'); for (let y = 2; y < H; y += 6) img.hline(0, W - 1, y, 'x'); for (const x of [0, 19, W - 2]) img.rect(x, 2, 2, H - 2, 'j');
  img.rect(6, 12, 28, 9, 'W'); drawText(img, 'FRAGILE', 20, 14, 'R');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** the Van de Graaff generator, the Science Centre's hair-raising exhibit, carried off by rats (24x36) */
export function vandegraaff() {
  const W = 24, H = 36, img = new Img(W, H);
  img.rect(8, 16, 8, 18, 'g'); img.vline(8, 16, 33, 'h'); img.rect(4, 32, 16, 3, 'S');     // the column + base
  img.circle(12, 10, 9, 'H'); img.circle(10, 8, 4, 'W'); img.circle(14, 12, 3, 'h');       // the big polished sphere
  img.set(2, 4, 'Y'); img.set(21, 3, 'Y'); img.set(20, 15, 'Y'); img.set(3, 15, 'Y');     // sparks
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** the WRECKER: a crane truck on tracks with a lattice boom up to the left; the ball hangs from the game's chain (108 tall) */
export function wrecker() {
  const W = 120, H = 108, img = new Img(W, H);
  const gy = H - 4;
  // tracks
  img.rect(8, gy - 14, 104, 14, 'k'); img.rect(10, gy - 12, 100, 10, 'g'); for (let x = 12; x < 108; x += 8) img.rect(x, gy - 12, 3, 10, 'G'); img.hline(10, 109, gy - 7, 'K');
  // the deck, the engine housing (left), the cab (right)
  img.rect(4, gy - 22, 112, 8, 'y'); img.rect(4, gy - 22, 112, 2, 'Y');
  img.rect(8, gy - 52, 40, 30, 'y'); img.rect(8, gy - 52, 40, 2, 'Y'); for (let y = gy - 46; y < gy - 24; y += 5) img.hline(12, 42, y, 'o'); img.rect(14, gy - 60, 6, 8, 'g'); // engine + exhaust stack
  img.rect(66, gy - 58, 38, 36, 'y'); img.rect(66, gy - 58, 38, 2, 'Y'); img.rect(70, gy - 54, 30, 18, 'u'); for (let x = 72; x < 98; x += 8) img.vline(x, gy - 54, gy - 37, 'C'); // cab + glass
  img.circle(84, gy - 44, 5, 'x'); img.circle(81, gy - 49, 2, 'x'); img.circle(81, gy - 49, 1, 'P'); img.rect(87, gy - 45, 4, 2, 'x'); img.set(91, gy - 45, 'P'); img.set(85, gy - 45, 'W'); img.set(86, gy - 45, 'K'); img.rect(79, gy - 52, 10, 2, 'V'); // the rat driver, DF cap
  img.rect(60, gy - 40, 6, 18, 'G');  // a hydraulic ram
  // the lattice boom: from the deck at x~58 up-left to the tip at (28, 4) ... the chain's pivot is (x - 92, gy - 108) in game space
  const pts = []; for (let i = 0; i <= 40; i++) pts.push([Math.round(58 - i * 1.25), Math.round(gy - 30 - i * 2.0)]);
  for (const [x, y] of pts) { img.rect(x, y, 6, 2, 'o'); img.rect(x, y + 2, 1, 2, 'O'); img.rect(x + 5, y + 2, 1, 2, 'O'); }
  for (let i = 0; i < pts.length - 4; i += 4) { const [ax, ay] = pts[i], [bx, by] = pts[i + 4]; img.line(ax + 1, ay + 1, bx + 5, by + 1, 'y'); }
  img.rect(4, 0, 10, 6, 'g'); img.circle(8, 4, 3, 'G'); // the sheave at the tip
  img.outline('K'); img.pivot = { x: 0.5, y: gy / H };
  return img;
}
