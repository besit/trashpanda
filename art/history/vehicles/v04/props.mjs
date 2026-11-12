// Street props + vehicles, SDF-rendered with the character camera (3/4 view).
import { sd, scene, render, yawInv, orthoCam, smin } from '../lib/sdf.mjs';
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';

const ELEV = (32 * Math.PI) / 180;
const cam = () => orthoCam([0, -Math.cos(ELEV), -Math.sin(ELEV)]);
const R = {
  green: ['e', 'E', 'l', 'L'], greenDark: ['K', 'e', 'E', 'l'], trunk: ['w', 'x', 'X'],
  steel: ['g', 'G', 'h', 'H'], dark: ['K', 'k', 'g', 'G'], red: ['r', 'R', 'q'], white: ['h', 'H', 'W'],
  wood: ['w', 'x', 'X', 'j'], concrete: ['s', 'S', 't', 'T'], orange: ['r', 'o', 'O'], yellow: ['o', 'y', 'Y'],
  glass: ['K', 'u', 'U', 'c'], tire: ['K', 'K', 'k'], blue: ['u', 'U', 'c', 'C'], teal: ['k', 'f', 'F'],
};
const mat = (ramp, extra = {}) => ({ ramp, ...extra });

function draw(objs, w, h, ox, oy, yaw = 0, opts = {}) {
  const sc = scene(objs);
  const f = yaw ? (p) => sc(yawInv(p, yaw)) : sc;
  const img = render(f, { w, h, cx: ox, cy: oy, cam: cam(), ambient: 0.16, ...opts });
  img.pivot = { x: ox / w, y: oy / h };
  return img;
}

// ---------------- props ----------------
export function tree(seed = 1, size = 1, ramp = R.green) {
  const r = rng(seed);
  const objs = [{ d: sd.capsule([0, 0, 0], [0.5, 0, 14 * size], 1.6 * size, 1.1 * size), m: mat(R.trunk) }];
  const blobs = [[0, 0, 20, 8], [-5, 1, 17, 5.5], [5, -1, 17.5, 5.5], [0, 4, 16, 5], [0, -4, 18, 5], [2, 1, 25, 5.5], [-3, -2, 24, 5]];
  for (const [x, y, z, rad] of blobs) objs.push({ d: sd.sphere([(x + r() * 2 - 1) * size, (y + r() * 2 - 1) * size, z * size], rad * size * (0.9 + r() * 0.2)), m: mat(ramp) });
  return draw(objs, Math.round(36 * size), Math.round(44 * size), Math.round(18 * size), Math.round(40 * size));
}
export function sapling() {
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 8], 0.7), m: mat(R.trunk) },
    { d: sd.sphere([0, 0, 10], 3.4), m: mat(R.green) },
    { d: sd.capsule([2, 0, 0], [2, 0, 9], 0.3), m: mat(R.wood) },
  ];
  return draw(objs, 14, 20, 7, 17);
}
export function streetlight() {
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 30], 0.7), m: mat(R.dark) },
    { d: sd.capsule([0, 0, 30], [4, 0, 31], 0.5), m: mat(R.dark) },
    { d: sd.box([5, 0, 30.5], [2, 1.2, 0.6], 0.3), m: mat(R.dark, { fn: (p) => (p[2] < 30.2 ? 'Y' : null) }) },
    { d: sd.cylY([0, 0, 0.6], 1.4, 1.4), m: mat(R.dark) },
  ];
  return draw(objs, 14, 40, 5, 36);
}
export function ttcStop() {
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 18], 0.7), m: mat(R.steel) },
    { d: sd.box([0, 0.6, 17], [2.2, 0.25, 2.6], 0.2), m: mat(R.red, { fn: (p) => (p[2] > 18.2 || p[2] < 15.6 ? 'W' : null) }) },
  ];
  return draw(objs, 10, 28, 5, 25);
}
export function bikeRing() { // Toronto's iconic post-and-ring bike stand
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 8], 0.7), m: mat(R.steel) },
    { d: sd.torusY([0, 0, 7], 3.2, 0.65), m: mat(R.steel) },
  ];
  return draw(objs, 10, 16, 5, 14);
}
export function hydrant() { // Toronto hydrant: red barrel, yellow bonnet + caps, chunky enough to read at 3/4
  const objs = [
    { d: sd.cylY([0, 0, 0.5], 2.4, 0.5), m: mat(R.red) }, // base flange
    { d: sd.capsule([0, 0, 0.8], [0, 0, 6.2], 1.7), m: mat(R.red) },
    { d: sd.cylY([0, 0, 6.6], 2.1, 0.5), m: mat(R.yellow) },
    { d: sd.ellipsoid([0, 0, 7.6], [1.6, 1.6, 1.3]), m: mat(R.yellow) },
    { d: sd.capsule([0, 0, 8.6], [0, 0, 9.3], 0.6), m: mat(R.yellow) },
    { d: sd.capsule([-2.9, 0, 4.2], [2.9, 0, 4.2], 0.85), m: mat(R.yellow) },
    { d: sd.capsule([0, 0, 3.6], [0, 2.6, 3.6], 1.0), m: mat(R.yellow) },
  ];
  return draw(objs, 14, 18, 7, 15);
}
export function bench() {
  const objs = [
    { d: sd.box([0, 0, 3.2], [7, 1.6, 0.4], 0.2), m: mat(R.wood) },
    { d: sd.box([0, -1.8, 5.6], [7, 0.3, 1.4], 0.2), m: mat(R.wood) },
    { d: sd.box([-5.5, 0, 1.5], [0.4, 1.4, 1.5]), m: mat(R.dark) },
    { d: sd.box([5.5, 0, 1.5], [0.4, 1.4, 1.5]), m: mat(R.dark) },
  ];
  return draw(objs, 20, 14, 10, 11);
}
export function planter() {
  const objs = [
    { d: sd.box([0, 0, 2.5], [5, 2.5, 2.5], 0.4), m: mat(R.concrete) },
    { d: sd.ellipsoid([-2, 0, 6], [3, 2.4, 2]), m: mat(R.green) },
    { d: sd.ellipsoid([2.2, 0.4, 6.4], [2.8, 2.2, 2.2]), m: mat(R.green) },
    { d: sd.sphere([0, 1.5, 6.5], 0.8), m: mat(['o', 'O', 'Y']) },
  ];
  return draw(objs, 16, 14, 8, 12);
}
export function bollard() {
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 5], 0.9), m: mat(R.white, { fn: (p) => (p[2] > 3.4 && p[2] < 4.4 ? 'R' : null) }) },
  ];
  return draw(objs, 6, 10, 3, 8);
}
export function cone() {
  const objs = [
    { d: sd.cone([0, 0, 0.4], 2.2, 6), m: mat(R.orange, { fn: (p) => (p[2] > 2.4 && p[2] < 3.4 ? 'W' : null) }) },
    { d: sd.box([0, 0, 0.3], [2.6, 2.6, 0.3]), m: mat(R.orange) },
  ];
  return draw(objs, 10, 11, 5, 9);
}
export function trafficSignal() {
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 24], 0.7), m: mat(R.dark) },
    { d: sd.box([0, 0.9, 21], [1.4, 0.8, 3.6], 0.3), m: mat(['K', 'k', 'y'], { fn: (p) => {
      if (p[1] < 1.2) return null;
      if (Math.hypot(p[0], p[2] - 23.4) < 0.9) return 'R';
      if (Math.hypot(p[0], p[2] - 21) < 0.9) return 'k';
      if (Math.hypot(p[0], p[2] - 18.6) < 0.9) return 'L';
      return null;
    } }) },
  ];
  return draw(objs, 10, 32, 5, 29);
}
export function newsBox() {
  const objs = [{ d: sd.box([0, 0, 3.5], [2, 1.8, 3.5], 0.3), m: mat(R.blue, { fn: (p) => (p[1] > 1.5 && p[2] > 4 && p[2] < 6 ? 'C' : null) }) }];
  return draw(objs, 8, 14, 4, 11);
}

// ---------------- vehicles ----------------
export function carModel(color = 'blue') {
  const body = { blue: R.blue, red: R.red, white: R.white, yellow: R.yellow, teal: R.teal, dark: R.dark, orange: R.orange }[color] ?? R.blue;
  const objs = [
    { d: sd.box([0, 0, 3.6], [13, 5.8, 2.4], 1.6), m: mat(body, { spec: 1 }) },
    { d: sd.box([-1.5, 0, 7.2], [7, 5, 2.0], 1.6), m: mat(R.glass, { fn: (p) => (Math.abs(p[0] + 1.5) < 1.2 && p[2] > 6 ? body[1] : null) }) },
    { d: sd.torusY([8, 5.2, 2.2], 1.4, 0.9), m: mat(R.tire) }, { d: sd.torusY([8, -5.2, 2.2], 1.4, 0.9), m: mat(R.tire) },
    { d: sd.torusY([-8, 5.2, 2.2], 1.4, 0.9), m: mat(R.tire) }, { d: sd.torusY([-8, -5.2, 2.2], 1.4, 0.9), m: mat(R.tire) },
    { d: sd.box([13.2, 3.8, 3.8], [0.4, 1.0, 0.6]), m: { flat: 'Y' } }, { d: sd.box([13.2, -3.8, 3.8], [0.4, 1.0, 0.6]), m: { flat: 'Y' } },
    { d: sd.box([-13.2, 3.8, 4.2], [0.4, 1.0, 0.6]), m: { flat: 'R' } }, { d: sd.box([-13.2, -3.8, 4.2], [0.4, 1.0, 0.6]), m: { flat: 'R' } },
  ];
  return objs;
}
export function car(color = 'blue', yaw = 0, seed = 1, side = false) {
  const objs = carModel(color);
  if (side) return drawSide(objs, 68, 40, 34, 36);
  return draw(objs, 36, 36, 18, 26, yaw);
}
/** Side-view (action scenes): larger scale so vehicles match the side-view raccoon. */
function drawSide(objs, w, h, ox, oy) {
  const img = render(scene(objs), { w, h, cx: ox, cy: oy, cam: orthoCam([0, -1, -0.22]), ambient: 0.16, scale: 2.2 });
  img.pivot = { x: ox / w, y: oy / h };
  return img;
}
export function suv(yaw = 0, side = false) {
  const objs = suvModel();
  if (side) return drawSide(objs, 76, 50, 38, 46);
  return draw(objs, 42, 42, 21, 31, yaw);
}
export function suvModel() {
  return [
    { d: sd.box([0, 0, 5], [15, 6.6, 3.4], 1.6), m: mat(R.dark, { spec: 1 }) },
    { d: sd.box([-2, 0, 10], [10, 6, 2.4], 1.4), m: mat(R.glass, { fn: (p) => (Math.abs(p[0] + 1) < 1.2 && p[2] > 8.6 ? 'k' : null) }) },
    { d: sd.box([15.3, 0, 5], [0.5, 4, 1.4]), m: mat(R.steel) },
    { d: sd.torusY([9.5, 5.8, 2.8], 1.8, 1.1), m: mat(R.tire) }, { d: sd.torusY([9.5, -5.8, 2.8], 1.8, 1.1), m: mat(R.tire) },
    { d: sd.torusY([-9.5, 5.8, 2.8], 1.8, 1.1), m: mat(R.tire) }, { d: sd.torusY([-9.5, -5.8, 2.8], 1.8, 1.1), m: mat(R.tire) },
    { d: sd.box([15.5, 4.4, 6], [0.4, 1.2, 0.6]), m: { flat: 'Y' } }, { d: sd.box([15.5, -4.4, 6], [0.4, 1.2, 0.6]), m: { flat: 'Y' } },
    { d: sd.box([-15.5, 4.6, 6.4], [0.4, 1.0, 1.0]), m: { flat: 'R' } }, { d: sd.box([-15.5, -4.6, 6.4], [0.4, 1.0, 1.0]), m: { flat: 'R' } },
  ];
}
// TTC Flexity Outlook. M2.1 from Ivan's photo; v03 (M3.1, Ivan: "notice the skewed front", new line drawing
// reference): each cab end is RAKED: the end face leans back toward the roof (the bumper sticks out
// further than the roof line), with a big windshield on the slope and a red cap over it. Five modules,
// black accordion joints; a red roof edge, white bands framing the window strip, red body, white skirt
// line; the white swoosh rising from the front skirt; grey double doors; a pantograph on the middle module.
export function streetcarModel(length = 96) {
  const half = length / 2, segs = 5, segL = length / segs;
  const objs = [];
  const RAKE = 0.42; // how far the end face leans back per unit of height
  const livery = (cx, nose) => (p) => {
    const z = p[2], lx = p[0] - cx;
    if (nose) { // the raked cab face: windshield on the slope, a red cap above it, headlights low
      const fwd = (p[0] - cx) * nose - (segL / 2 - 0.4 - RAKE * (16.5 - z));
      if (fwd > -1.0) {
        if (z > 15.2) return ['r', 'R', 'R', 'q'];
        if (z > 7.2) return ['K', 'u', 'U', 'c'];
        if (z > 3 && z < 4.6 && Math.abs(p[1]) > 3.6) return 'Y';
        if (z < 2.6 && z > 1.6) return ['h', 'H', 'W'];
        return ['r', 'R', 'R', 'q'];
      }
    }
    if (z > 16.4) return ['g', 'G', 'h', 'h'];          // roof
    if (z > 15.4) return ['r', 'R', 'R', 'q'];          // red roof edge
    if (z > 14.4) return ['h', 'H', 'W', 'W'];          // white band over the windows
    const door = !nose && Math.abs(lx) < 2.4;          // double doors mid-module
    if (door && z > 1.8) return Math.abs(lx) < 0.25 ? 'g' : ['g', 'G', 'h', 'H'];
    if (z > 7.6) {                                      // windows + white pillars
      const pil = Math.abs(((lx % 8) + 8) % 8 - 4) < 0.55;
      if (pil) return ['h', 'H', 'W'];
      return p[1] > 0 ? ['K', 'k', 'u', 'U'] : ['K', 'k', 'u'];
    }
    if (z > 6.6) return ['h', 'H', 'W', 'W'];           // white band under the windows
    if (nose) { const along = (p[0] - (cx + nose * (segL / 2))) * -nose; if (along < 14 && Math.abs(z - (2.4 + along * 0.32)) < 0.9) return ['h', 'H', 'W']; }
    if (z > 2.6) return ['r', 'R', 'R', 'q'];           // red body
    if (z > 1.6) return ['h', 'H', 'W'];                // white skirt line
    return ['K', 'k', 'g'];                             // bogies
  };
  for (let s = 0; s < segs; s++) {
    const cx = -half + segL * (s + 0.5);
    const nose = s === segs - 1 ? 1 : s === 0 ? -1 : 0;
    const box = sd.box([cx, 0, 8.6], [segL / 2 - 0.9 + (nose ? 1.6 : 0), 6.3, 8.1], 1.2);
    // cab ends: cut the box with a plane that leans back toward the roof (the rake)
    const d = nose ? (p) => {
      const n = [nose, 0, RAKE], L = Math.hypot(1, RAKE);
      const x0 = cx + nose * (segL / 2 + 0.7);
      return Math.max(box(p), ((p[0] - x0) * nose + RAKE * (p[2] - 1.5)) / L);
    } : box;
    objs.push({ d, m: mat(R.red, { spec: 1, fn: livery(cx, nose) }) });
    if (s < segs - 1) objs.push({ d: sd.box([cx + segL / 2, 0, 8.4], [0.9, 5.6, 7.4], 0.4), m: mat(['K', 'k', 'k', 'g']) }); // accordion joint
  }
  // pantograph on the middle module
  objs.push({ d: sd.capsule([-5, 0, 17], [2, 0, 22], 0.4), m: mat(R.dark) });
  objs.push({ d: sd.capsule([2, -3, 22], [2, 3, 22], 0.4), m: mat(R.dark) });
  objs.push({ d: sd.box([0, 0, 17.2], [6, 3, 0.8]), m: mat(R.steel) });
  return objs;
}
export function streetcar(yaw = 0, length = 96, side = false, vertical = false) {
  const objs = streetcarModel(length);
  const w = length + 16;
  if (side) { const k = 2.0, sw = Math.ceil(w * k), sh = 96; const img = render(scene(objs), { w: sw, h: sh, cx: sw / 2, cy: sh - 6, cam: orthoCam([0, -1, -0.22]), ambient: 0.2, scale: k }); img.pivot = { x: 0.5, y: (sh - 6) / sh }; return img; }
  if (vertical) return draw(objs, 52, length + 48, 26, length / 2 + 30, yaw);
  return draw(objs, w, 48, w / 2, 36, yaw);
}
/** a streetcar mid-turn (M3.1): drawn at 45 degrees for the corners it takes */
export function streetcarDiag(yaw) { return draw(streetcarModel(96), 104, 104, 52, 56, yaw); }
/** a car / SUV at 45 degrees (turning) */
export function carDiag(color, yaw) { return draw(carModel(color), 36, 36, 18, 24, yaw); }
export function suvDiag(yaw) { return draw(suvModel(), 40, 40, 20, 27, yaw); }

export function propsPreview() {
  const items = [tree(1), tree(2, 0.8), sapling(), streetlight(), ttcStop(), bikeRing(), hydrant(), bench(), planter(), bollard(), cone(), trafficSignal(), newsBox()];
  const frames = items.map((it) => { const f = new Img(40, 48); f.blit(it, Math.round((40 - it.w) / 2), 48 - it.h); return f; });
  return { frames, cols: 13 };
}
/** M3.1: the raked Flexity (side) + the 45-degree turning frames */
export function streetcarPreviewM31() {
  const D = [Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4, -Math.PI / 4];
  return { frames: [streetcar(0, 96, true), ...D.map((y) => streetcarDiag(y)), ...D.map((y) => carDiag('red', y))], cols: 5 };
}
export function vehiclesPreview() {
  const items = [car('blue', 0), car('red', Math.PI), car('white', Math.PI / 2), car('yellow', -Math.PI / 2), suv(0), suv(Math.PI / 2), streetcar(0), streetcar(Math.PI)];
  const frames = items.map((it) => { const f = new Img(116, 52); f.blit(it, Math.round((116 - it.w) / 2), 52 - it.h); return f; });
  return { frames, cols: 4 };
}
