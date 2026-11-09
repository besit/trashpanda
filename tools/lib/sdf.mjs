// Minimal signed-distance-field renderer that outputs palette-indexed pixel art.
// World axes: x east, y south, z up. Models are authored facing +x (east).
import { Img } from './raster.mjs';

// ---------- vector helpers ----------
export const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export { add, sub, mul, dot, len, norm };

// ---------- primitives (return signed distance) ----------
export const sd = {
  sphere: (c, r) => (p) => len(sub(p, c)) - r,
  ellipsoid: (c, r) => (p) => {
    const q = sub(p, c);
    const k0 = len([q[0] / r[0], q[1] / r[1], q[2] / r[2]]);
    const k1 = len([q[0] / (r[0] * r[0]), q[1] / (r[1] * r[1]), q[2] / (r[2] * r[2])]);
    return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
  },
  capsule: (a, b, r, r2 = r) => (p) => {
    const pa = sub(p, a), ba = sub(b, a);
    const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
    return len(sub(pa, mul(ba, h))) - (r + (r2 - r) * h);
  },
  box: (c, half, round = 0) => (p) => {
    const q = sub(p, c).map((x, i) => Math.abs(x) - half[i] + round);
    const outside = len(q.map((x) => Math.max(x, 0)));
    return outside + Math.min(Math.max(q[0], q[1], q[2]), 0) - round;
  },
  // torus whose axis is the y axis (wheel rolling along x), centred at c
  torusY: (c, R, r) => (p) => {
    const q = sub(p, c);
    const a = Math.hypot(q[0], q[2]) - R;
    return Math.hypot(a, q[1]) - r;
  },
  // cylinder along y axis (disc)
  cylY: (c, r, halfW) => (p) => {
    const q = sub(p, c);
    const dx = Math.hypot(q[0], q[2]) - r, dy = Math.abs(q[1]) - halfW;
    return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  },
  // cone pointing up from base centre c with base radius r and height h
  cone: (c, r, h) => (p) => {
    const q = sub(p, c);
    const t = clamp(q[2] / h, 0, 1);
    const rad = r * (1 - t);
    const dr = Math.hypot(q[0], q[1]) - rad;
    const dz = Math.max(-q[2], q[2] - h);
    return Math.max(dr * 0.8, dz);
  },
};

// Smooth union helper
export function smin(a, b, k) { const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1); return b * (1 - h) + a * h - k * h * (1 - h); }

// ---------- transforms ----------
// Rotate point p around z by -yaw about pivot (to move world points into model space)
export function yawInv(p, yaw, pivot = [0, 0, 0]) {
  const q = sub(p, pivot), c = Math.cos(-yaw), s = Math.sin(-yaw);
  return add([q[0] * c - q[1] * s, q[0] * s + q[1] * c, q[2]], pivot);
}
// Rotate around x (pitch-ish roll) inverse
export function rollInv(p, ang, pivot = [0, 0, 0]) {
  const q = sub(p, pivot), c = Math.cos(-ang), s = Math.sin(-ang);
  return add([q[0], q[1] * c - q[2] * s, q[1] * s + q[2] * c], pivot);
}
export function pitchInv(p, ang, pivot = [0, 0, 0]) {
  const q = sub(p, pivot), c = Math.cos(-ang), s = Math.sin(-ang);
  return add([q[0] * c + q[2] * s, q[1], -q[0] * s + q[2] * c], pivot);
}

// ---------- cameras ----------
// Oblique 3/4 (JRPG style): ground plane drawn top-down, vertical surfaces face-on.
// screen (sx, sy) = (x, y - z * zScale)
export function obliqueCam(zScale = 1) {
  const axis = norm([0, 1, zScale]);
  return {
    ray(sx, sy) { return { o: add([sx, sy, 0], mul([0, 1, 1 / zScale], 60)), d: mul([0, -1, -1 / zScale], 1 / len([0, 1, 1 / zScale])) }; },
    viewDir: mul(axis, -1),
  };
}
// Orthographic camera looking along direction `dir` with screen-up roughly +z.
export function orthoCam(dir, up = [0, 0, 1]) {
  const d = norm(dir);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const right = norm(cross(up, d));
  const down = cross(right, d);
  return {
    ray(sx, sy) { return { o: add(add(mul(right, sx), mul(down, sy)), mul(d, -80)), d }; },
    viewDir: d,
  };
}

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

/**
 * Render a scene.
 * scene: (p) => [dist, material]  where material = { ramp: [...keys dark→light], flat?: key, fn?: (p, n) => key|null }
 * opts: { w, h, cx, cy, cam, light, ambient, dither, outline, scale }
 */
export function render(scene, opts) {
  const { w, h, cx = w / 2, cy = h / 2, cam = obliqueCam(), light = norm([-0.55, 0.45, 1]), ambient = 0.28,
    dither = 0.6, outline = 'K', scale = 1, ss = 1 } = opts;
  const img = new Img(w, h);
  const depth = new Float32Array(w * h).fill(Infinity);
  const eps = 0.01;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const { o, d } = cam.ray((i + 0.5 - cx) / scale, (j + 0.5 - cy) / scale);
    let t = 0, hit = null;
    for (let s = 0; s < 160; s++) {
      const p = add(o, mul(d, t));
      const [dist, mat] = scene(p);
      if (dist < 0.02) { hit = { p, mat }; break; }
      t += Math.max(dist * 0.9, 0.02);
      if (t > 220) break;
    }
    if (!hit) continue;
    const p = hit.p;
    const n = norm([
      scene(add(p, [eps, 0, 0]))[0] - scene(add(p, [-eps, 0, 0]))[0],
      scene(add(p, [0, eps, 0]))[0] - scene(add(p, [0, -eps, 0]))[0],
      scene(add(p, [0, 0, eps]))[0] - scene(add(p, [0, 0, -eps]))[0],
    ]);
    const mat = hit.mat;
    let key = mat.fn ? mat.fn(p, n) : null;
    if (key && typeof key === 'object') { // fn may return a ramp override
      key = shade(key, n, light, ambient, dither, i, j);
    } else if (!key) {
      key = mat.flat ?? shade(mat.ramp, n, light, ambient, dither, i, j, mat.spec);
    }
    img.set(i, j, key);
    depth[j * w + i] = t;
  }
  if (outline) img.outline(outline);
  img.depth = depth;
  return img;
}

function shade(ramp, n, light, ambient, dither, i, j, spec = 0) {
  let I = ambient + (1 - ambient) * Math.max(0, dot(n, light));
  if (spec && dot(n, light) > 0.93) I = 1.2;
  const L = ramp.length;
  const f = clamp(I, 0, 0.999) * L;
  let idx = Math.floor(f);
  const frac = f - idx;
  if (dither && frac > 1 - dither * 0.5 && (BAYER[j % 4][i % 4] / 16) < (frac - (1 - dither * 0.5)) / (dither * 0.5) * 0.5) idx++;
  return ramp[clamp(idx, 0, L - 1)];
}

// Union of objects: each { d: sdfFn, m: material }
export function scene(objs) {
  return (p) => {
    let best = Infinity, mat = null;
    for (const o of objs) { const d = o.d(p); if (d < best) { best = d; mat = o.m; } }
    return [best, mat];
  };
}

// common ramps
export const RAMP = {
  fur: ['k', 'g', 'G', 'h', 'H'],
  furDark: ['K', 'k', 'g', 'G'],
  white: ['h', 'H', 'W'],
  red: ['r', 'R', 'R', 'q'],
  brick: ['b', 'B', 'n', 'N'],
  steel: ['g', 'G', 'h', 'H'],
  tire: ['K', 'k', 'g'],
  pink: ['p', 'P', 'm', 'M'],
  suit: ['K', 'k', 'v', 'g'],
  navy: ['K', 'u', 'U', 'c'],
  yellow: ['o', 'y', 'Y'],
  orange: ['r', 'o', 'O', 'Y'],
  wood: ['w', 'x', 'X', 'j'],
  green: ['e', 'E', 'l', 'L'],
  glass: ['u', 'U', 'c', 'C', 'i'],
  concrete: ['s', 'S', 't', 'T'],
  ratFur: ['K', 'k', 'g', 'G', 'h'],
  ratBrown: ['w', 'x', 'x', 'X', 'j'],
  teal: ['k', 'f', 'F', 'C'],
  skin: ['p', 'P', 'm'],
};
