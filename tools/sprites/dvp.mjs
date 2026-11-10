// The intro's highway shot: a Don Valley Parkway-style expressway running down a wooded ravine
// beside the river, "into" the lake at sunset, with the skyline on the shore. The road itself is drawn
// at runtime (so a lane can be added on screen); this module bakes the backdrop + back-view cars.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { scene, render, orthoCam } from '../lib/sdf.mjs';
import { carModel, suvModel } from './props.mjs';

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
  img.rect(tx, base - 52, 2, 52, 'v'); img.rect(tx - 2, base - 34, 6, 3, 'v'); img.rect(tx - 1, base - 41, 4, 2, 'v'); img.vline(tx, base - 62, base - 52, 'v');
  img.set(tx + 3, base - 33, 'O');
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
    const cx = left - 18 - t * 80 + Math.sin(t * 9) * 8 * t, wdt = 1 + t * 20;
    for (let x = Math.round(cx - wdt); x <= Math.round(cx + wdt); x++) img.set(x, y, Math.abs(x - cx) > wdt - 1.5 ? 'x' : (x + y) % 7 === 0 ? 'C' : bay(x, y) < 0.3 ? 'c' : 'U');
  }
  return img;
}

/** Back-view cars at several depths (index 0 = nearest/biggest). */
export const DVP_SCALES = [2.8, 2.1, 1.6, 1.2, 0.9, 0.66, 0.48, 0.34];
const backCam = () => orthoCam([1, 0, -0.42]);
export function dvpCar(kind, s) {
  const objs = kind === 'suv' ? suvModel() : carModel(kind);
  const w = Math.ceil(17 * s) + 4, h = Math.ceil((kind === 'suv' ? 16 : 13) * s) + 4;
  const img = render(scene(objs), { w, h, cx: w / 2, cy: h - 2, cam: backCam(), ambient: 0.2, scale: s });
  img.pivot = { x: 0.5, y: (h - 2) / h };
  return img;
}
export function dvpPreview() {
  return { frames: [dvpBackdrop(), ...DVP_SCALES.map((s) => dvpCar('red', s)), dvpCar('suv', 2.8)], cols: 10 };
}
