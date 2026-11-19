// M4.4 art for the share posters (Ivan: "Can we also draw a hero portrait of the raccoon? Like we have for Dog Fjord?
// ...they need to be higher res"). Rendered from SDF models at twice the game's pixel density: the posters are
// composed at 768 x 432 with the street scenes drawn at 2x, so these are the only art on them at the finer grid.
//  - the raccoon's hero portrait (a bust, 3/4 view facing right): determined smirk, a fighting yell
//  - Dog Fjord's portrait re-rendered at the same density, facing LEFT (the other corner of a VS screen)
//  - the raccoon riding away from the camera (the "ride into the sunset" poster)
//  - a bike-wheel emblem with a ribbon for the title-screen poster
import { sd, scene, render, orthoCam, smin, norm, rollInv, yawInv } from '../lib/sdf.mjs';
import { Img } from '../lib/raster.mjs';
import { dogFjordModel } from './dogfjord.mjs';
import { raccoonTopModel, charCam } from './raccoon_top.mjs';

export const PW = 232, PH = 208; // a portrait at the posters' finer grid

const FUR = ['k', 'g', 'G', 'G', 'h'];
const FUR_DARK = ['K', 'k', 'g', 'G'];
const WHITE = ['h', 'H', 'W', 'W'];

/** the raccoon bust. Face toward +x, up is +z, its left side toward the camera (+y) */
function raccoonBust(expr) {
  const shout = expr === 'shout';
  const hc = [0, 0, 44];
  const eyeZ = 46.5, eyeY = 6.2;
  const objs = [];
  // the head: fur with the markings painted on (mask, white brow, nose-bridge stripe, white cheeks)
  const headMat = {
    ramp: FUR,
    fn: (p) => {
      const q = [p[0] - hc[0], p[1] - hc[1], p[2] - hc[2]];
      if (q[0] < -2) return null; // the back of the head: plain fur
      const ay = Math.abs(q[1]), dz = p[2] - eyeZ;
      // determined: the mask's top edge (and the white brow over it) slants down toward the nose
      const slant = (ay - 9) * 0.32;
      // the bandit mask: one patch around each eye, swept back toward the cheeks
      const mz = dz + (ay - eyeY) * 0.18;
      const inMask = ay > 1.6 && ay < 14.5 && mz < 2.8 + slant * 0.5 && mz > -5.2 - Math.max(0, ay - 8) * 0.35;
      if (inMask) return ['K', 'k', 'k', 'g'];
      // the white brow above the mask
      if (ay > 1.4 && ay < 13.5 && mz >= 2.8 + slant * 0.5 && mz < 6.2 + slant * 0.4 && q[0] > 0) return WHITE;
      // the dark stripe down the forehead and the bridge of the nose
      if (ay < 1.8 && dz > -6 && q[0] > 2) return FUR_DARK;
      // white cheeks under the mask, toward the front
      if (mz <= -5.2 - Math.max(0, ay - 8) * 0.35 && q[0] > 1 && dz > -14) return WHITE;
      return null;
    },
  };
  objs.push({ d: (p) => {
    let d = sd.ellipsoid(hc, [15, 17, 14])(p);
    // cheek ruffs: fluffy and wide, pointing out and down
    for (const s of [-1, 1]) d = smin(d, sd.ellipsoid([-1, 14.5 * s, 37], [9, 8.5, 7.5])(p), 4);
    for (const s of [-1, 1]) d = smin(d, sd.ellipsoid([-3, 19 * s, 33], [5, 5, 4])(p), 3);
    return d;
  }, m: headMat });
  // the muzzle: white, tapering to a black nose; the mouth on its underside
  const muzzleMat = {
    ramp: WHITE,
    fn: (p) => {
      const y = p[1], z = p[2];
      if (!shout) {
        // a one-sided smirk: the mouth line curls up on the near (+y) side
        const zc = 36.2 + 0.05 * y * y + y * 0.12;
        if (Math.abs(y) < 5.5 && p[0] > 12 && Math.abs(z - zc) < 0.55) return 'K';
        if (y > 3.6 && y < 5.4 && p[0] > 11 && Math.abs(z - zc - 0.9) < 0.5) return 'k';
      }
      if (Math.abs(y) < 0.55 && z > 36.4 && z < 39 && p[0] > 19) return 'g'; // the split under the nose
      return null;
    },
  };
  objs.push({ d: (p) => smin(sd.ellipsoid([12, 0, 39], [10, 7.5, 6])(p), sd.ellipsoid([19.5, 0, 39.3], [5.2, 4.4, 3.8])(p), 3), m: muzzleMat });
  objs.push({ d: sd.ellipsoid([24.2, 0, 40.4], [2.6, 3.3, 2.3]), m: { ramp: ['K', 'K', 'k', 'g'], spec: 1 } });
  objs.push({ d: sd.sphere([25.4, 1.4, 41.6], 0.8), m: { flat: 'G' } }); // nose shine
  if (shout) {
    // a fighting yell: an open mouth with a pink tongue and two little fangs
    objs.push({ d: sd.ellipsoid([17, 0, 34.4], [6.4, 5.2, 4.2]), m: { flat: 'K', fn: (p) => {
      if (p[2] < 32.6 && Math.abs(p[1]) < 3.8) return p[2] < 31.6 ? 'P' : 'p';
      if (p[2] > 36.6 && Math.abs(Math.abs(p[1]) - 2.6) < 0.8) return 'W';
      return 'k';
    } } });
  }
  // the eyes: dark-ringed, bright, determined (a lid cuts each one along the brow's slant)
  for (const s of [-1, 1]) {
    const ec = [12.2, eyeY * s, eyeZ];
    objs.push({ d: sd.ellipsoid(ec, [2.4, 2.9, 2.8]), m: { flat: 'W', fn: (p) => {
      const ay = Math.abs(p[1]), dz = p[2] - eyeZ;
      if (dz > 1.7 - (ay - eyeY) * 0.38) return 'K';                       // the lid
      // both pupils look ahead, to the right of the picture (toward -y)
      if (Math.hypot(p[1] - (eyeY * s - 1.0), dz + 0.1) < 1.55) return Math.hypot(p[1] - (eyeY * s - 1.5), dz - 0.45) < 0.5 ? 'W' : 'K'; // pupil + glint
      return 'W';
    } } });
  }
  // the ears: rounded, dark inside, rimmed white, tilted out
  for (const s of [-1, 1]) {
    const base = [-3, 11 * s, 54];
    objs.push({ d: (p) => sd.cone(base, 6.2, 9)(rollInv(p, 0.38 * s, base)), m: { ramp: FUR, fn: (p) => {
      const q = rollInv(p, 0.38 * s, base);
      const r = Math.hypot(q[0] - base[0], q[1] - base[1]), rmax = 6.2 * (1 - (q[2] - base[2]) / 9);
      if (r > rmax - 1.4 || q[2] > base[2] + 6.5) return WHITE;
      return q[0] > base[0] ? ['K', 'k', 'g'] : null;
    } } });
  }
  // the bust: grey fur, a white bib, a red bandana knotted at the throat
  objs.push({ d: (p) => smin(sd.ellipsoid([-4, 0, 10], [13, 26, 13])(p), sd.ellipsoid([-1, 0, 24], [10, 14, 8])(p), 6), m: { ramp: FUR, fn: (p) => (p[0] > 5 && Math.abs(p[1]) < 7 + (25 - p[2]) * 0.2 ? WHITE : null) } });
  objs.push({ d: sd.ellipsoid([0, 0, 28.5], [12.2, 14.2, 3.4]), m: { ramp: ['r', 'R', 'R', 'q'], spec: 1 } });
  objs.push({ d: (p) => smin(sd.ellipsoid([11.5, 0, 24], [3.2, 6.5, 5])(p), sd.sphere([12.6, 0, 28.4], 2.6)(p), 2), m: { ramp: ['r', 'R', 'R', 'q'], fn: (p) => (Math.abs(p[1]) < 0.5 && p[2] < 26 ? 'r' : null) } });
  // the yellow bike pump (its attack) over the far shoulder, T-handle up
  objs.push({ d: sd.capsule([-12, 15, 16], [-15, 25, 56], 2.4), m: { ramp: ['o', 'y', 'y', 'Y'], spec: 1 } });
  objs.push({ d: sd.capsule([-15.1, 25.3, 58], [-15.3, 25.8, 62], 1.1), m: { ramp: ['g', 'G', 'h'] } });
  objs.push({ d: sd.capsule([-15.3, 21.5, 63], [-15.3, 30, 63], 1.6), m: { ramp: ['K', 'k', 'g'] } });
  return objs;
}

const LIGHT = norm([0.7, 0.35, 0.8]);
/** the raccoon's hero portrait, facing right. expr: 'smirk' | 'shout' */
export function raccoonPortrait(expr = 'smirk', k = 1) {
  const sc = scene(raccoonBust(expr));
  const w = Math.round(PW * k), h = Math.round(PH * k);
  return render(sc, { w, h, cx: w / 2 + 4 * k, cy: h + 6 * k, cam: orthoCam([-1, -0.62, -0.12]), light: LIGHT, ambient: 0.2, scale: 2.75 * k });
}
/** Dog Fjord at the same density, facing LEFT (his portrait model seen from his right) */
export function dogPortraitHi(expr = 'grin', k = 1) {
  const sc = scene(dogFjordModel(expr));
  const w = Math.round(PW * k), h = Math.round(PH * k);
  return render(sc, { w, h, cx: w / 2 - 4 * k, cy: h - 4 * k, cam: orthoCam([0.36, -1, -0.12]), light: norm([0.5, 0.7, 0.75]), ambient: 0.2, scale: 2.05 * k });
}
/** the raccoon on its bike seen from behind and a little above, riding away (the sunset poster) */
export function raccoonRidingAway(t = 0) {
  const sc = scene(raccoonTopModel(t));
  // from behind and to its left, a little above: its back, the ringed tail, the red bike heading off
  const cam = orthoCam([0.72, 0.62, -0.36]);
  return render(sc, { w: 120, h: 112, cx: 60, cy: 92, cam, light: norm([-0.6, -0.3, 0.8]), ambient: 0.22, scale: 4.2 });
}

/** a bike wheel emblem (tyre, rim, spokes, hub): the title poster's badge. r = outer radius */
export function wheelEmblem(r = 92) {
  const S = r * 2 + 8, img = new Img(S, S), c = S / 2;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
    if (d > r + 2) continue;
    if (d > r - 1) img.set(x, y, 'K');
    else if (d > r - 11) img.set(x, y, d > r - 3 ? 'k' : d > r - 8 ? 'a' : 'g');        // the tyre
    else if (d > r - 15) img.set(x, y, d > r - 13 ? 'H' : 'h');                          // the rim
    else if (d > r - 17) img.set(x, y, 'K');
  }
  // spokes: 24, laced in pairs, from the hub flange to the rim
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2, a1 = a0 + (i % 2 ? 0.35 : -0.35);
    img.line(Math.round(c + Math.cos(a0) * 9), Math.round(c + Math.sin(a0) * 9), Math.round(c + Math.cos(a1) * (r - 16)), Math.round(c + Math.sin(a1) * (r - 16)), 'H');
  }
  img.circle(c, c, 11, 'K'); img.circle(c, c, 10, 'G'); img.circle(c, c, 6, 'H'); img.circle(c, c, 3, 'g');
  return img;
}
/** a ribbon banner for the title poster (the words go on it at runtime): W x 40 with folded tails */
export function ribbon(W = 520) {
  const H = 44, img = new Img(W, H);
  const band = (x0, x1, y0, y1, main, dark) => { img.rect(x0, y0, x1 - x0, y1 - y0, main); img.hline(x0, x1 - 1, y0, 'q'); img.hline(x0, x1 - 1, y1 - 1, dark); };
  // the tails, behind and lower, with a notch
  for (const s of [0, 1]) {
    const x0 = s ? W - 70 : 0, x1 = s ? W : 70;
    band(x0, x1, 10, H - 2, 'r', 'K');
    for (let y = 10; y < H - 2; y++) { const k = Math.abs(y - (H + 8) / 2); for (let x = 0; x < 16 - k; x++) img.set(s ? W - 1 - x : x, y, null); }
  }
  // the folds into the main band
  for (const x of [52, W - 64]) img.rect(x, 6, 12, H - 10, 'K');
  band(58, W - 58, 0, H - 10, 'R', 'r');
  img.outline('K');
  return img;
}

export function postersPreview() {
  return { frames: [raccoonPortrait('smirk'), raccoonPortrait('shout'), dogPortraitHi('grin'), dogPortraitHi('laugh')], cols: 4 };
}
export function postersPreview2() {
  return { frames: [raccoonRidingAway(0), raccoonRidingAway(0.5), wheelEmblem(60)], cols: 3 };
}
export function postersPreview3() {
  return { frames: [ribbon(300)], cols: 1 };
}
