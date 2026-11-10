// The intro's highway shot: a Don Valley Parkway-style expressway running down a wooded ravine
// beside the river, "into" the lake at sunset, with the skyline on the shore. The road itself is drawn
// at runtime (so a lane can be added on screen); this module bakes the backdrop + back-view cars.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { cnTower, CN_PAL } from './landmarks.mjs';

export const DVP_W = 480, DVP_H = 216, HZ = 92; // horizon line
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

/** Road geometry shared with the game (keep in sync with CutsceneScene.dvp*). */
export const ROAD = { vxFrac: 0.5, leftBottom: -170, laneBottom: 62 };

export function dvpBackdrop() {
  const W = DVP_W, H = DVP_H, img = new Img(W, H), r = rng(416);
  const vx = W * ROAD.vxFrac;
  // sky: dusk gradient, dithered bands
  const sky = ['v', 'V', 'p', 'P', 'z', 'd', 'D'];
  for (let y = 0; y < HZ; y++) {
    const t = Math.pow(y / HZ, 1.25) * (sky.length - 1), i = Math.floor(t), f = t - i;
    for (let x = 0; x < W; x++) img.set(x, y, sky[Math.min(sky.length - 1, i + (bay(x, y) < f ? 1 : 0))]);
  }
  // a few long clouds lit from below
  for (let k = 0; k < 6; k++) {
    const cy = 18 + k * 9 + r.int(-3, 3), cx = r.int(0, W), len = r.int(60, 140);
    for (let x = cx - len / 2; x < cx + len / 2; x++) { img.set(x, cy, k < 3 ? 'p' : 'z'); if ((x | 0) % 3) img.set(x, cy + 1, k < 3 ? 'P' : 'd'); }
  }
  // the sun, half sunk into the lake
  const sx = vx + 6, sy = HZ + 1;
  for (let y = sy - 24; y <= sy; y++) for (let x = sx - 24; x <= sx + 24; x++) {
    const d = Math.hypot(x - sx, y - sy);
    if (d < 23) img.set(x, y, d < 16 ? 'Y' : d < 20 ? 'D' : bay(x, y) < 0.5 ? 'd' : 'D');
    else if (d < 30 && bay(x, y) < 0.25) img.set(x, y, 'd');
  }
  // skyline on the shore (right of the vanishing point): CN Tower + towers in silhouette
  const base = HZ;
  for (let i = 0; i < 18; i++) { const x = vx + 34 + i * 7 + r.int(0, 3), h = r.int(6, 20); img.rect(x, base - h, r.int(4, 7), h, 'v'); if (r.chance(0.6)) img.set(x + 2, base - h + 3, 'y'); }
  const tx = vx + 76;
  cnTower(img, tx, base, 66, CN_PAL.silhouette);
  // the lake: a band at the horizon with the sun's glitter path
  for (let y = HZ; y < HZ + 12; y++) for (let x = 0; x < W; x++) {
    const glitter = Math.abs(x - sx) < 26 - (y - HZ) * 0.8 && (y + (x >> 1)) % 3 === 0;
    img.set(x, y, glitter ? (bay(x, y) < 0.5 ? 'D' : 'd') : y < HZ + 2 ? 'c' : bay(x, y) < (y - HZ) / 14 ? 'u' : 'U');
  }
  // ravine slopes: autumn woods on both sides, darker toward the camera
  const autumn = ['r', 'o', 'O', 'y', 'e', 'E', 'l'];
  for (let y = HZ + 6; y < H; y++) {
    const t = (y - HZ) / (H - HZ);
    for (let x = 0; x < W; x++) img.set(x, y, bay(x, y) < 0.35 + t * 0.3 ? 'e' : 'E');
  }
  // dense canopy, painted back-to-front; thicker further from the valley floor (the ravine walls)
  const crowns = [];
  for (let i = 0; i < 2600; i++) {
    const y = r.int(HZ + 3, H + 6), t = Math.max(0.02, (y - HZ) / (H - HZ)), x = r.int(-10, W + 10);
    const floor = (y - HZ) * 2.3 + 6; // half-width of the open valley floor at this depth
    const dx = Math.abs(x - vx) - floor;
    if (dx < 0) continue;
    if (r() > 0.25 + dx / 80) continue;
    crowns.push([x, y, 0.8 + t * 6.5 * (0.6 + r() * 0.6), r.pick(autumn)]);
  }
  crowns.sort((a, b) => a[1] - b[1]);
  const hi = { o: 'O', O: 'y', y: 'Y', E: 'l', l: 'L', r: 'R', e: 'E' };
  for (const [x, y, rad, c] of crowns) {
    img.ellipse(x, y + 1, rad + 1, rad * 0.8 + 1, c === 'r' || c === 'e' ? 'K' : 'w');
    img.ellipse(x, y, rad, rad * 0.8, c);
    if (rad > 1.6) img.ellipse(x - rad * 0.3, y - rad * 0.35, rad * 0.45, rad * 0.32, hi[c] ?? c);
  }
  // the river: a ribbon to the left of the highway, winding down to the lake
  for (let y = HZ + 6; y < H; y++) {
    const t = (y - HZ) / (H - HZ);
    const left = vx + ROAD.leftBottom * t;
    const cx = left - 34 - t * 110 + Math.sin(t * 9) * 8 * t, wdt = 3 + t * 60; // ~3x wider than v01
    for (let x = Math.round(cx - wdt); x <= Math.round(cx + wdt); x++) img.set(x, y, Math.abs(x - cx) > wdt - 1.5 ? 'x' : (x + y) % 7 === 0 ? 'C' : bay(x, y) < 0.3 ? 'c' : 'U');
  }
  return img;
}

/** Back-view cars at several depths (index 0 = nearest/biggest). */
export const DVP_SCALES = [2.8, 2.1, 1.6, 1.2, 0.9, 0.66, 0.48, 0.34];
// Body ramps per paint colour: [shadow, base, light]
const RAMP = { red: ['r', 'R', 'q'], blue: ['u', 'U', 'c'], white: ['h', 'H', 'W'], yellow: ['o', 'y', 'Y'], teal: ['f', 'F', 'C'], suv: ['g', 'G', 'h'] };
/**
 * Hand-built back view, painted natively at each scale (v03; the SDF version read as "all glass").
 * Reads as a car from behind: roof, tinted rear window with a third brake light, trunk lid,
 * glowing tail lights in dark housings, licence plate, bumper, tyres, mirrors.
 * Units: a sedan is 17 x 13 units, an SUV 17 x 16; s = pixels per unit.
 */
export function dvpCar(kind, s) {
  const suv = kind === 'suv';
  const UW = 17, UH = suv ? 16 : 13;
  const W = Math.max(5, Math.round(UW * s)), H = Math.max(4, Math.round(UH * s));
  const pad = 2, img = new Img(W + pad * 2 + 2, H + pad * 2);
  const [dk, base, lt] = RAMP[kind] ?? RAMP.red;
  const X = (u) => pad + 1 + Math.round(u * s), Y = (u) => pad + Math.round(u * s);
  const R = (x0, y0, x1, y1, c) => { const a = X(x0), b = Y(y0); img.rect(a, b, Math.max(1, X(x1) - a), Math.max(1, Y(y1) - b), c); };
  // vertical layout (units)
  const L = suv
    ? { roof: 0.4, win0: 1.6, win1: 6.6, trunk1: 8.2, tail1: 11.4, bump1: 13.6, tyre: 15.6 }
    : { roof: 0.6, win0: 2.0, win1: 5.4, trunk1: 7.2, tail1: 9.6, bump1: 11.4, tyre: 13 };
  if (s < 0.5) { // far away: a body blob with two red lights
    R(1, L.win0, 16, L.bump1, base); R(3, L.roof, 14, L.win0, lt); R(2.5, L.win0, 14.5, L.win1, 'u');
    img.outline('K');
    img.set(X(1.5), Y(L.trunk1 + 0.6), 'q'); img.set(X(15) , Y(L.trunk1 + 0.6), 'q');
    img.pivot = { x: 0.5, y: (Y(L.tyre)) / img.h };
    return img;
  }
  // tyres peek out under the bumper
  R(1.2, L.bump1 - 0.4, 4.2, L.tyre, 'k'); R(12.8, L.bump1 - 0.4, 15.8, L.tyre, 'k');
  // body shell: greenhouse narrower than the lower body
  img.poly([[X(3.6), Y(L.roof)], [X(13.4), Y(L.roof)], [X(15.6), Y(L.win1)], [X(1.4), Y(L.win1)]], base);
  R(0.4, L.win1, 16.6, L.bump1, base);
  // roof highlight
  R(4, L.roof, 13, L.roof + 0.7, lt);
  if (suv) { R(3.2, L.roof - 0.3, 4.2, L.roof + 0.4, 'G'); R(12.8, L.roof - 0.3, 13.8, L.roof + 0.4, 'G'); } // roof rails
  // rear window: dark tint with a diagonal reflection
  const w0 = L.win0, w1 = L.win1 - 0.5;
  img.poly([[X(4.4), Y(w0)], [X(12.6), Y(w0)], [X(14.3), Y(w1)], [X(2.7), Y(w1)]], 'u');
  for (let y = Y(w0); y < Y(w1); y++) { const t = (y - Y(w0)) / Math.max(1, Y(w1) - Y(w0)); const x = Math.round(X(5.5) + t * 3 * s); img.set(x, y, 'U'); if (s > 1.5) img.set(x + 1, y, 'U'); }
  R(4.6, w0, 12.4, w0 + 0.5, 'U'); // top glare band
  // third brake light
  R(7.2, w0 + 0.1, 9.8, w0 + 0.6, 'q');
  // trunk lid: shut line + lit top edge
  R(0.6, L.win1, 16.4, L.win1 + 0.5, lt);
  img.hline(X(1.2), X(15.8) - 1, Y(L.trunk1), dk);
  // tail lights: dark housings, red lenses with a hot core (brake lights on: stop-and-go)
  const tl0 = L.trunk1 + 0.2, tl1 = L.tail1 - 0.2;
  for (const [a, b] of [[0.4, 4.6], [12.4, 16.6]]) {
    R(a, tl0, b, tl1, 'K');
    R(a + 0.4, tl0 + 0.4, b - 0.4, tl1 - 0.4, 'R');
    R(a + 0.9, tl0 + 0.7, b - 0.9, tl1 - 0.9, 'q');
    if (s > 1.4) R(a + 1.4, tl0 + 0.9, a + 2.2, tl1 - 1.2, 'm');
  }
  // licence plate
  R(6.4, L.trunk1 + 0.6, 10.6, L.tail1 + 0.4, 'K');
  R(6.8, L.trunk1 + 0.9, 10.2, L.tail1 + 0.1, 'W');
  if (s > 1.4) R(7.4, L.trunk1 + 1.4, 9.6, L.trunk1 + 1.8, 'U');
  // bumper
  R(0.4, L.tail1, 16.6, L.bump1, dk);
  R(0.8, L.tail1, 16.2, L.tail1 + 0.35, base);
  if (s > 1.2) { R(3, L.bump1 - 0.8, 4.2, L.bump1 - 0.4, 'o'); R(12.8, L.bump1 - 0.8, 14, L.bump1 - 0.4, 'o'); } // reflectors
  // side mirrors
  R(-0.6, L.win1 - 1.4, 0.6, L.win1 - 0.4, base); R(16.4, L.win1 - 1.4, 17.6, L.win1 - 0.4, base);
  img.outline('K');
  // exhaust + shadow under the car
  if (s > 1) R(13.2, L.bump1, 14.4, L.bump1 + 0.6, 'g');
  img.hline(X(0.6), X(16.4), Math.min(img.h - 1, Y(L.tyre) + 1), 'a');
  img.pivot = { x: 0.5, y: Math.min(img.h - 1, Y(L.tyre) + 1) / img.h };
  return img;
}
export function dvpPreview() {
  return { frames: [dvpBackdrop(), ...DVP_SCALES.map((s) => dvpCar('red', s)), ...['blue', 'white', 'yellow', 'teal', 'suv'].map((k) => dvpCar(k, 2.8))], cols: 7 };
}
