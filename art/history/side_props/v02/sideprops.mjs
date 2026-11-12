// Side-view gameplay props for the M2 missions (drawn at the side-view scale, ~2x the map).
import { Img } from '../lib/raster.mjs';
import { suv, car } from './props.mjs';

/** Traffic signal pole facing the camera, with a big TSP call button. state: 'red' | 'green' | 'tsp' */
export function signalPole(state = 'red') {
  const W = 22, H = 84, img = new Img(W, H);
  img.rect(10, 20, 3, H - 22, 'g'); img.vline(10, 20, H - 3, 'G');
  img.rect(7, H - 3, 9, 3, 'k');
  // head: 3 lamps
  img.rect(5, 0, 13, 32, 'K'); img.rect(6, 1, 11, 30, 'k');
  const lamp = (cy, on, col, dim) => { img.circle(11, cy, 4, on ? col : dim); if (on) { img.set(10, cy - 2, 'W'); img.set(9, cy - 1, 'W'); } };
  lamp(6, state === 'red', 'R', 'r');
  lamp(16, false, 'O', 'w');
  lamp(26, state !== 'red', 'L', 'e');
  // transit bar head beside it (lit white bar when priority is granted)
  img.rect(15, 34, 7, 14, 'K'); img.rect(16, 35, 5, 12, 'k');
  img.rect(17, 36, 3, 10, state === 'tsp' ? 'W' : 'g');
  // the call box: yellow with a red button, at handlebar height
  img.rect(3, 54, 9, 12, 'K'); img.rect(4, 55, 7, 10, 'y'); img.rect(4, 55, 7, 2, 'Y');
  img.circle(7, 61, 2, state === 'red' ? 'R' : 'L'); img.set(6, 60, 'W');
  img.pivot = { x: 0.5, y: 1 };
  return img;
}

/** Double-parked delivery van ("RAT EXPRESS"), rat driver in the cab. Faces right. */
export function vanSide() {
  const W = 92, H = 52, img = new Img(W, H);
  const y0 = 6;
  img.rect(2, y0, 62, 36, 'W'); img.rect(2, y0, 62, 3, 'H'); img.rect(2, y0 + 30, 62, 6, 'h');
  img.poly([[64, y0 + 10], [76, y0 + 10], [88, y0 + 24], [88, y0 + 36], [64, y0 + 36]], 'W');
  img.poly([[66, y0 + 12], [75, y0 + 12], [84, y0 + 23], [66, y0 + 23]], 'u'); img.line(68, y0 + 13, 74, y0 + 21, 'U');
  // rat driver: ear, eye, cap
  img.circle(72, y0 + 19, 3, 'x'); img.circle(70, y0 + 16, 2, 'P'); img.set(73, y0 + 18, 'K'); img.rect(69, y0 + 14, 6, 2, 'V');
  img.rect(84, y0 + 27, 4, 3, 'Y'); img.rect(85, y0 + 34, 4, 2, 'G');
  img.rect(2, y0 + 30, 3, 3, 'R'); // tail light
  // livery
  img.rect(8, y0 + 8, 50, 14, 'V'); img.hline(8, 57, y0 + 8, 'Z');
  const G = { R: ['##.', '#.#', '##.', '#.#', '#.#'], A: ['.#.', '#.#', '###', '#.#', '#.#'], T: ['###', '.#.', '.#.', '.#.', '.#.'], E: ['###', '#..', '##.', '#..', '###'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'], P: ['##.', '#.#', '##.', '#..', '#..'], S: ['###', '#..', '###', '..#', '###'] };
  let x = 11;
  for (const ch of 'RAT EXPRESS') { if (ch === ' ') { x += 3; continue; } const g = G[ch]; for (let yy = 0; yy < 5; yy++) for (let i = 0; i < 3; i++) if (g[yy][i] === '#') img.set(x + i, y0 + 12 + yy, 'W'); x += 4; }
  // hazard lights blinking state drawn in game; wheels
  for (const wx of [18, 70]) { img.circle(wx, y0 + 37, 7, 'K'); img.circle(wx, y0 + 37, 4, 'g'); img.circle(wx, y0 + 37, 2, 'h'); }
  img.outline('K');
  img.pivot = { x: 0.5, y: (y0 + 44) / H };
  return img;
}

/** The SUV Rat: Dog Fraud's through-traffic, a dark SUV with a rat at the wheel (faces right; flipped in game). */
export function suvRatSide(frame = 0) {
  const base = suv(Math.PI, true);
  const img = base.clone(); img.pivot = base.pivot;
  // find the glass band so the driver sits behind the front (right-hand) side window
  let x0 = img.w, x1 = 0, y0 = img.h, y1 = 0;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (['c', 'U', 'C'].includes(img.get(x, y))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const hx = Math.round(x0 + (x1 - x0) * 0.72), hy = Math.round((y0 + y1) / 2) + 1;
  img.circle(hx, hy, 4, 'x'); img.circle(hx - 3, hy - 4, 2, 'x'); img.circle(hx - 3, hy - 4, 1, 'P');
  img.rect(hx + 3, hy, 3, 2, 'x'); img.set(hx + 6, hy, 'P'); // snout + nose
  img.set(hx + 1, hy - 1, 'W'); img.set(hx + 2, hy - 1, 'K'); img.line(hx, hy - 3, hx + 3, hy - 2, 'K'); // angry eye + brow
  img.rect(hx - 4, hy - 6, 8, 2, 'V'); img.rect(hx + 3, hy - 5, 3, 1, 'V'); // DF cap
  img.rect(hx + 5, hy + 3, 1, 3, 'K'); // steering wheel
  if (frame) for (let i = 0; i < 7; i++) img.set(img.w - 2 - i, Math.round(img.h * 0.55) + (i % 2), 'Y');
  return img;
}

/** A side-view hatchback in the streetcar's way (left-turner), facing right. */
export const turnerSide = () => { const c = car('blue', 0, 1, true); return c; };

/** The Bureaucrat Rat's desk: paper stacks, an IN tray and the big red DENIED stamp. */
export function desk() {
  const W = 56, H = 34, img = new Img(W, H);
  img.rect(2, 12, 52, 6, 'x'); img.hline(2, 53, 12, 'X');
  img.rect(4, 18, 6, 16, 'w'); img.rect(46, 18, 6, 16, 'w'); img.rect(10, 18, 36, 10, 'w'); img.rect(12, 20, 32, 6, 'x');
  for (let k = 0; k < 3; k++) { const px = 6 + k * 8; img.rect(px, 12 - 4 - k * 2, 7, 4 + k * 2, 'W'); for (let y = 12 - 4 - k * 2; y < 12; y += 2) img.hline(px, px + 6, y, 'H'); }
  img.rect(36, 6, 10, 6, 'R'); img.rect(39, 2, 4, 4, 'x'); img.hline(36, 45, 11, 'r');
  img.outline('K');
  img.pivot = { x: 0.5, y: 1 };
  return img;
}

/** A thrown paper stamp: red-inked "DENIED" sheet. */
export function stamp(frame = 0) {
  const img = new Img(12, 10);
  img.rect(1, 1, 10, 8, 'W'); img.rect(2, 3, 8, 3, 'R'); img.hline(3, 8, 4, 'W');
  if (frame) img.rect(1, 1, 10, 1, 'H');
  img.outline('K');
  img.pivot = { x: 0.5, y: 0.5 };
  return img;
}

/** The stolen speed camera, carried horizontally on its pole by two rats. */
export function camCarried() {
  const W = 64, H = 16, img = new Img(W, H);
  img.rect(2, 9, 60, 2, 'G'); img.hline(2, 61, 9, 'h');
  img.rect(40, 1, 14, 9, 'h'); img.rect(40, 1, 14, 2, 'H'); img.circle(44, 5, 2, 'k'); img.set(44, 5, 'c'); img.rect(48, 4, 4, 3, 'k'); img.set(50, 5, 'R');
  img.rect(26, 2, 10, 7, 'W'); img.hline(27, 34, 4, 'K'); img.hline(27, 34, 6, 'K');
  img.outline('K');
  img.pivot = { x: 0.5, y: 0.6 };
  return img;
}

/** Build spot (orange stakes + a hammer badge), and the finished calming pieces. */
export function buildSpot() {
  const img = new Img(40, 26);
  for (const x of [4, 34]) { img.rect(x, 6, 2, 18, 'X'); img.rect(x - 1, 4, 4, 4, 'O'); }
  img.hline(5, 34, 9, 'O'); img.hline(5, 34, 10, 'y');
  img.ellipse(20, 23, 16, 2, 'g');
  img.outline('K');
  img.pivot = { x: 0.5, y: 24 / 26 };
  return img;
}
export function humpSide() {
  const img = new Img(48, 10);
  for (let x = 0; x < 48; x++) { const h = Math.round(Math.sin((x / 47) * Math.PI) * 6); for (let y = 8 - h; y <= 8; y++) img.set(x, y, y === 8 - h ? 'S' : 's'); if (x % 8 < 3 && h > 2) img.set(x, 8 - h + 1, 'W'); }
  img.outline('K');
  img.pivot = { x: 0.5, y: 0.9 };
  return img;
}
/**
 * Raised crosswalk (v02, Ivan: "should go top-to-bottom across the road, with the lines along the road").
 * In the side view the crossing runs from the far curb down to the near edge of the road: a raised grey
 * table with ramps on both sides and zebra bars running along the road. Origin: top-left at the curb.
 */
export function raisedCrossSide(h = 54) {
  const W = 46, img = new Img(W, h);
  img.rect(6, 0, W - 12, h, 'S');
  for (let y = 3; y < h - 1; y += 6) img.rect(9, y, W - 18, 3, 'W');        // zebra bars, along the road
  img.poly([[0, h], [6, h], [6, 0], [3, 0]], 'g'); img.poly([[W, h], [W - 6, h], [W - 6, 0], [W - 3, 0]], 'g'); // ramps
  for (let y = 2; y < h; y += 5) { img.set(2 + (y % 2), y, 'y'); img.set(W - 3 - (y % 2), y, 'y'); }
  img.hline(6, W - 7, 0, 'H');
  img.pivot = { x: 0.5, y: 0 };
  return img;
}

/** Curb extension (v02): the sidewalk bulges into the curb lane, with a tree, planting and bollards. */
export function curbExtSide() {
  const W = 60, H = 62, img = new Img(W, H);
  const top = 30; // sidewalk level row in this image (aligned to the street strip's sidewalk)
  // the bulb-out: a rounded sidewalk tongue reaching ~14px into the road
  img.poly([[2, top + 16], [8, top + 30], [W - 8, top + 30], [W - 2, top + 16]], 't');
  img.hline(8, W - 9, top + 30, 'T'); img.hline(8, W - 9, top + 31, 'g');
  img.line(2, top + 16, 8, top + 30, 'T'); img.line(W - 2, top + 16, W - 8, top + 30, 'T');
  for (let x = 10; x < W - 10; x += 6) img.set(x, top + 22, 'S');
  // planting bed + a young tree
  img.ellipse(W / 2, top + 22, 14, 4, 'E'); img.ellipse(W / 2 - 4, top + 21, 6, 2, 'l'); img.set(W / 2 + 6, top + 21, 'P'); img.set(W / 2 - 8, top + 22, 'y');
  img.rect(W / 2 - 1, top - 2, 2, 24, 'w');
  img.ellipse(W / 2, top - 8, 12, 10, 'E'); img.ellipse(W / 2 - 3, top - 11, 7, 5, 'l'); img.ellipse(W / 2 + 4, top - 5, 4, 3, 'e');
  // bollards on the corner
  for (const bx of [8, W - 9]) { img.rect(bx, top + 18, 3, 9, 'W'); img.rect(bx, top + 20, 3, 2, 'R'); }
  img.outline('K');
  img.pivot = { x: 0.5, y: (top + 30) / H };
  return img;
}

/** Extra life: a golden raccoon token, hidden on the maps (2 frames: a glint). */
export function lifeToken(frame = 0) {
  const img = Img.fromGrid(`
...KKKKK...
..KyyyyyK..
.KyKKyKKyK.
KyKhKyKhKyK
KyKWKyKWKyK
KyyKKKKKyyK
KyyyKkKyyyK
.KyyyKyyyK.
..KyyyyyK..
...KKKKK...`);
  if (frame) { img.set(3, 2, 'Y'); img.set(2, 3, 'Y'); img.set(3, 3, 'W'); }
  img.pivot = { x: 0.5, y: 1 };
  return img;
}

export function sidePropsPreview() {
  const frames = [signalPole('red'), signalPole('green'), signalPole('tsp'), vanSide(), suvRatSide(1), desk(), stamp(), camCarried(), buildSpot(), humpSide(), raisedCrossSide(), curbExtSide(), lifeToken(0), lifeToken(1)];
  return { frames, cols: 12 };
}
