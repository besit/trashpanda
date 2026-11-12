// Waterfront art (M3): the CN Tower base + the domed stadium for the map, the Cinesphere + pods on their
// islands, Sugar Beach's pink umbrellas, sailboats, the elevated Gardiner deck, and Dog Fraud's fictional
// MEGA SPA (fences, its building, its parking garage) for mission 8. Plus the side-view lake strip.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { cnTower, CN_PAL } from './landmarks.mjs';

/** the CN Tower for the map (front view, tall; the base sits on the ground) */
export function cnTowerMap() {
  const W = 64, H = 300, img = new Img(W, H);
  cnTower(img, W / 2, H - 4, 290, CN_PAL.day);
  img.ellipse(W / 2, H - 4, 14, 3, 'G');
  img.outline('K');
  img.pivot = { x: 0.5, y: (H - 4) / H };
  return img;
}

/** the domed stadium (3/4): ribbed white roof segments over a grey bowl */
export function stadium() {
  const W = 176, H = 96, img = new Img(W, H);
  img.ellipse(W / 2, 70, 84, 22, 'G'); img.ellipse(W / 2, 66, 82, 20, 'h');
  for (let x = 10; x < W - 10; x += 6) img.vline(x, 60, 84, 'G');
  img.rect(8, 70, W - 16, 18, 'h'); for (let x = 12; x < W - 12; x += 8) img.rect(x, 74, 4, 10, 'g');
  img.ellipse(W / 2, 48, 80, 36, 'H');
  for (let k = -3; k <= 3; k++) { const x0 = W / 2 + k * 22; img.line(x0, 14, W / 2 + k * 26, 70, 'h'); }
  img.ellipse(W / 2, 44, 70, 28, 'W'); img.ellipse(W / 2 - 18, 36, 26, 10, 'W');
  for (let k = -2; k <= 2; k++) img.line(W / 2 + k * 18, 18, W / 2 + k * 24, 66, 'H');
  img.outline('K');
  img.pivot = { x: 0.5, y: 0.94 };
  return img;
}

/** the Cinesphere (a white geodesic dome) */
export function cinesphere() {
  const W = 52, H = 46, img = new Img(W, H);
  img.circle(W / 2, 24, 21, 'h'); img.circle(W / 2, 22, 20, 'H');
  for (let k = -3; k <= 3; k++) { img.line(W / 2 + k * 6, 4, W / 2 + k * 8, 42, 'h'); }
  for (let y = 10; y < 42; y += 6) img.hline(W / 2 - Math.round(Math.sqrt(Math.max(0, 400 - (y - 22) ** 2))), W / 2 + Math.round(Math.sqrt(Math.max(0, 400 - (y - 22) ** 2))), y, 'h');
  img.ellipse(W / 2 - 7, 14, 6, 4, 'W');
  img.rect(4, 40, W - 8, 4, 'S');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.95 };
  return img;
}
/** an Ontario Place pod: a white box on stilts over the water */
export function pod() {
  const img = new Img(36, 34);
  img.rect(2, 6, 32, 14, 'H'); img.rect(2, 6, 32, 3, 'W'); img.rect(5, 11, 26, 5, 'u');
  for (const x of [6, 28]) img.rect(x, 20, 2, 12, 'G');
  img.rect(15, 20, 6, 12, 'g');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.95 };
  return img;
}
/** Sugar Beach: a pink umbrella + an Adirondack chair */
export function pinkUmbrella() {
  const img = new Img(22, 26);
  for (let x = 0; x < 22; x++) { const h = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 10.5) / 11) ** 2)) * 6); for (let y = 6 - h; y <= 7; y++) img.set(x, y + 1, x % 4 < 2 ? 'P' : 'm'); }
  img.vline(10, 8, 22, 'W');
  img.rect(13, 18, 7, 3, 'W'); img.rect(13, 21, 2, 3, 'W'); img.rect(18, 21, 2, 3, 'W'); img.rect(18, 14, 2, 5, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 24 / 26 };
  return img;
}
/** a sailboat (2 frames: a little bob) */
export function sailboat(frame = 0) {
  const img = new Img(26, 30);
  img.poly([[13, 2], [13, 22], [24, 22]], 'W'); img.poly([[12, 6], [12, 22], [4, 22]], 'H');
  img.vline(12, 2, 23, 'x');
  img.poly([[2, 23 + frame], [24, 23 + frame], [21, 27 + frame], [5, 27 + frame]], 'R');
  img.hline(0, 25, 28, 'C');
  img.outline('K'); img.pivot = { x: 0.5, y: 28 / 30 };
  return img;
}
/** a segment of the elevated Gardiner deck (32 px wide), with its piers */
export function gardinerSeg() {
  const W = 32, H = 64, img = new Img(W, H);
  img.rect(0, 0, W, 40, 'A'); for (let x = 0; x < W; x += 8) img.set(x + 3, 20, 'W'); img.hline(0, W - 1, 19, 'y');
  img.rect(0, 0, W, 2, 'H'); img.rect(0, 38, W, 4, 'h'); img.hline(0, W - 1, 42, 'G');
  img.rect(12, 42, 8, 20, 'h'); img.vline(12, 42, 61, 'H'); img.vline(19, 42, 61, 'G');
  img.pivot = { x: 0, y: (H - 2) / H };
  return img;
}
/** MEGA SPA chain-link fence with a PRIVATE sign (one tile) */
export function spaFence() {
  const img = new Img(16, 18);
  for (let y = 2; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0) img.set(x, y, 'h');
  img.rect(0, 1, 16, 1, 'G'); img.rect(0, 0, 1, 18, 'g'); img.rect(15, 0, 1, 18, 'g');
  img.rect(4, 6, 8, 5, 'R'); img.hline(5, 10, 8, 'W');
  img.pivot = { x: 0, y: 1 };
  return img;
}
/** side view (mission 8): a MEGA SPA fence panel across the promenade, PRIVATE sign + barbed top. 34 x 48 */
export function spaFenceSide() {
  const W = 34, H = 48, img = new Img(W, H);
  for (let y = 8; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if ((x + y) % 4 === 0 || (x - y + 64) % 4 === 0) img.set(x, y, 'h');
  img.rect(0, 4, 3, H - 4, 'G'); img.rect(W - 3, 4, 3, H - 4, 'G'); img.vline(0, 4, H - 1, 'h'); img.vline(W - 3, 4, H - 1, 'h');
  img.rect(0, 6, W, 2, 'G'); img.hline(0, W - 1, 6, 'H'); img.rect(0, H - 4, W, 2, 'g');
  for (let x = 1; x < W; x += 4) { img.set(x, 3, 'g'); img.set(x + 1, 2, 'g'); img.set(x + 2, 3, 'g'); } // barbed wire
  img.rect(6, 16, 22, 11, 'R'); img.rect(7, 17, 20, 9, 'r');
  for (const x of [9, 13, 17, 21]) img.rect(x, 19, 2, 5, 'W'); // "PRIVATE" in pixels you can't quite read
  img.hline(7, 26, 27, 'K');
  img.outline('K'); img.pivot = { x: 0.5, y: (H - 1) / H };
  return img;
}
export function megaSpaFacade(w = 128) {
  const h = 40, img = new Img(w, h), r = rng(95);
  img.rect(0, 0, w, h, 'C'); for (let x = 0; x < w; x += 8) img.vline(x, 0, h - 1, 'i');
  img.rect(0, 0, w, 6, 'P'); img.rect(Math.round(w / 2 - 34), 8, 68, 10, 'm');
  // 5-tall pixel lettering (M2 review lesson: 3x3 glyphs read as "HECA")
  const G = {
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], E: ['####', '#...', '###.', '#...', '####'], G: ['.###', '#...', '#.##', '#..#', '.###'],
    A: ['.##.', '#..#', '####', '#..#', '#..#'], S: ['.###', '#...', '.##.', '...#', '###.'], P: ['###.', '#..#', '###.', '#...', '#...'],
  };
  const word = 'MEGA SPA', adv = (ch) => (ch === ' ' ? 4 : G[ch][0].length + 1);
  let x = Math.round(w / 2 - (word.split('').reduce((s, ch) => s + adv(ch), 0) - 1) / 2);
  for (const ch of word) { if (ch !== ' ') G[ch].forEach((row, yy) => [...row].forEach((c, i) => { if (c === '#') img.set(x + i, 11 + yy, 'W'); })); x += adv(ch); }
  for (let i = 0; i < 6; i++) img.circle(r.int(8, w - 8), r.int(24, 34), 2, 'Y'); // palm-tree-ish lights
  img.rect(Math.round(w / 2 - 10), h - 14, 20, 14, 'k'); img.rect(Math.round(w / 2 - 9), h - 13, 18, 13, 'P');
  return img;
}

// ---------------------------------------------------------------- side view (mission 8)
/** the lake from Queens Quay: water, the Toronto Islands, boats, and the MEGA SPA fence going up. 768 x 120 */
export function lakeStrip(W = 768) {
  const H = 120, img = new Img(W, H), r = rng(509);
  for (let y = 40; y < H; y++) for (let x = 0; x < W; x++) img.set(x, y, (x + y * 3) % 23 === 0 ? 'C' : y < 46 ? 'c' : 'U');
  // the islands on the horizon
  for (let x = 0; x < W; x++) { const h = Math.round(3 + Math.sin(x / 40) * 2 + Math.sin(x / 13)); img.vline(x, 40 - h, 40, 'e'); if (x % 17 === 0) img.vline(x, 40 - h - 4, 40 - h, 'E'); }
  // boats + a ferry
  for (let i = 0; i < 6; i++) { const bx = r.int(10, W - 30), by = r.int(52, 90); img.poly([[bx, by], [bx + 12, by], [bx + 10, by + 3], [bx + 2, by + 3]], 'W'); img.poly([[bx + 6, by - 12], [bx + 6, by], [bx + 12, by]], 'W'); }
  for (let s = 0; s < W; s += 384) { img.rect(s + 230, 66, 40, 8, 'W'); img.rect(s + 236, 60, 26, 6, 'H'); img.rect(s + 230, 74, 40, 2, 'u'); }
  // the dock edge: water right up to a low railing (posts + two rails) above the promenade's granite
  img.hline(0, W - 1, 104, 'g'); img.hline(0, W - 1, 105, 'h'); img.hline(0, W - 1, 111, 'g');
  for (let x = 0; x < W; x += 24) { img.rect(x, 102, 2, 16, 'K'); img.vline(x + 1, 103, 116, 'G'); }
  img.rect(0, 116, W, 4, 'h'); img.hline(0, W - 1, 116, 'H');
  return img;
}

export function waterfrontPreview() {
  return { frames: [cnTowerMap(), stadium(), cinesphere(), pod(), pinkUmbrella(), sailboat(0), gardinerSeg(), spaFence(), megaSpaFacade()], cols: 9 };
}
