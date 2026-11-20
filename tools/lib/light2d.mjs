// M4.9 (Ivan: "I want it to feel more professional with drawing from shades, not from shapes... When professional
// artists draw, they don't think about separate parts of the body or object, they think about how light is scattered
// and reflected, where are shadows and where are highlights"): LIGHT-FIRST shading for draw2d canvases.
//
// A part's silhouette (or several parts merged into ONE form) is inflated into a volume, lit from one direction, and
// the light is quantized onto a colour ramp in flat bands that mix only in a thin ordered-dither strip where two bands
// meet. Forms are separated by light (cast shadows, contact shadows, a rim of light), not by lines. Importing this file
// adds the methods below to draw2d's Canvas; nothing in draw2d changes.
//
// Methods adapted from codixel (core/pixel.js: band, hueRamp, solid's melted primitives and inflate, rimLight,
// pixelPerfect; MIT, Copyright (c) 2026 mankidev). See tools/lib/THIRD_PARTY.md.
import { Canvas } from './draw2d.mjs';

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

// ---------- banding: flat steps, dither only where two steps meet ----------

const BT = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
/** the 4x4 Bayer threshold at a pixel (0..1) */
export const bayer = (x, y) => BT[((y & 3) << 2) | (x & 3)];
/** value 0..1 -> a ramp index 0..n-1: flat bands, dithered only in a strip `strip` wide (0 = hard steps) */
export function band(v, n, x, y, strip = 1 / 3) {
  const f = clamp(v) * (n - 1), k = Math.floor(f), fr = f - k;
  if (strip <= 0) return Math.min(n - 1, Math.round(f));
  return Math.min(n - 1, k + (bayer(x, y) < clamp((fr - 0.5) / strip + 0.5) ? 1 : 0));
}

// ---------- hue-shifted ramps (for new palette keys) ----------

/** [r, g, b] 0..255 from hue (degrees), saturation and lightness (0..1) */
export function hsl(h, s, l) {
  h = (((h % 360) + 360) % 360) / 60;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255));
}
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
/** '#rrggbb' -> [h, s, l] */
export function toHsl(hx) {
  const n = parseInt(hx.slice(1), 16), [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m, l = (M + m) / 2;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
/**
 * a ramp of n hex colours, dark to light, whose hue shifts with lightness: the dark end turns toward blue-violet (240),
 * the light end toward yellow (60), by up to `shift` degrees; saturation is highest in the middle.
 */
export function hueRamp(n, { hue = 110, shift = 60, sat = 0.55, satDrop = 0.35, light = [0.12, 0.62] } = {}) {
  const toward = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  return Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 0.5, e = Math.abs(2 * t - 1);
    return hex(hsl(toward(hue, t < 0.5 ? 240 : 60, shift * e), sat * (1 - satDrop * e), light[0] + (light[1] - light[0]) * t));
  });
}

// ---------- height fields (pixel units) ----------

// exact squared euclidean distance transform of one line (Felzenszwalb & Huttenlocher)
function edt1(f, n, out, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s;
    for (;;) { const p = v[k]; s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p); if (s > z[k]) break; k--; }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const p = v[k]; out[q] = (q - p) * (q - p) + f[p]; }
}
/** exact euclidean distance in pixels from each pixel inside mask `m` to the nearest pixel outside it (0 outside) */
export function distanceIn(m, w, h) {
  const BIG = 1e12, n = Math.max(w, h) + 2, f = new Float64Array(n), o = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  const g = new Float64Array(w * h);
  // the frame's border counts as outside only where the mask is open there; a part running off the frame stays round
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = m[y * w + x] ? BIG : 0; edt1(f, h, o, v, z); for (let y = 0; y < h; y++) g[y * w + x] = o[y]; }
  const d = new Float32Array(w * h);
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = g[y * w + x]; edt1(f, w, o, v, z); for (let x = 0; x < w; x++) d[y * w + x] = m[y * w + x] ? Math.sqrt(o[x]) : 0; }
  return d;
}
/** box-blur a height grid `passes` times with radius r (only inside mask `m`, which keeps its edge at 0) */
export function soften(H, m, w, h, r, passes = 2) {
  if (r < 1) return H;
  let a = H, b = new Float32Array(w * h);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) { let s = 0, c = 0; for (let x = -r; x < w + r; x++) { const xi = x + r; if (xi < w) { s += a[y * w + xi]; c++; } const xo = x - r - 1; if (xo >= 0) { s -= a[y * w + xo]; c--; } if (x >= 0 && x < w) b[y * w + x] = m[y * w + x] ? s / Math.max(1, c) : 0; } }
    [a, b] = [b, a];
    for (let x = 0; x < w; x++) { let s = 0, c = 0; for (let y = -r; y < h + r; y++) { const yi = y + r; if (yi < h) { s += a[yi * w + x]; c++; } const yo = y - r - 1; if (yo >= 0) { s -= a[yo * w + x]; c--; } if (y >= 0 && y < h) b[y * w + x] = m[y * w + x] ? s / Math.max(1, c) : 0; } }
    [a, b] = [b, a];
  }
  return a;
}
/** a silhouette inflated into a volume: a quarter-round of radius R pixels at the edge, flat on top beyond R */
export function inflate(m, w, h, R) {
  const d = distanceIn(m, w, h), H = new Float32Array(w * h);
  for (let i = 0; i < H.length; i++) if (m[i]) { const t = Math.min(d[i], R); H[i] = Math.sqrt(Math.max(0, R * R - (R - t) * (R - t))); }
  return H;
}
/** a tube from (ax, ay) to (bx, by), radius ra -> rb (design units): a primitive for melt() */
export const cap = (ax, ay, bx, by, ra, rb = ra) => ({ ax, ay, bx, by, ra, rb });
/** an ellipse (design units): a primitive for melt() */
export const dome = (x, y, rx, ry, rot = 0) => ({ e: 1, x, y, rx, ry, rot });
function primHeight(p, x, y) {
  if (p.e) {
    const c = Math.cos(p.rot), s = Math.sin(p.rot), dx = x - p.x, dy = y - p.y, u = (dx * c + dy * s) / p.rx, v = (-dx * s + dy * c) / p.ry, q = u * u + v * v;
    return q < 1 ? Math.sqrt(1 - q) * Math.min(p.rx, p.ry) : 0;
  }
  const dx = p.bx - p.ax, dy = p.by - p.ay, l2 = dx * dx + dy * dy || 1, u = clamp(((x - p.ax) * dx + (y - p.ay) * dy) / l2);
  const r = p.ra + (p.rb - p.ra) * u, d = Math.hypot(x - p.ax - dx * u, y - p.ay - dy * u);
  return d < r ? Math.sqrt(r * r - d * d) : 0;
}

// ---------- the canvas methods ----------

const P = Canvas.prototype;
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** the union pixel mask of part(s) `on`; `lines: false` leaves out their outline pixels */
P.partMask = function (on, { lines = true } = {}) {
  const ids = this._ids(on), m = new Uint8Array(this.w * this.h);
  for (let i = 0; i < m.length; i++) if (ids.includes(this.part[i]) && (lines || !this.line[i])) m[i] = 1;
  return m;
};

/** height (pixels) of melted primitives (design units) over the canvas; `k` (design units) is how softly they melt */
P.meltHeight = function (prims, k = 0.8) {
  const W = this.w, H = this.h, out = new Float32Array(W * H), S = this.S, kp = k * S;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = (x + 0.5 - this.ox) / S, Y = (y + 0.5 - this.oy) / S;
    let s = 0, any = false;
    for (const q of prims) { const hgt = primHeight(q, X, Y) * S; if (hgt > 0) { s += Math.exp(hgt / kp); any = true; } }
    if (any) out[y * W + x] = kp * Math.log(s);
  }
  return out;
};

/**
 * lit value 0..1 from a height grid (pixels), lambert from the direction `light` = [x, y, z] (toward the light; the
 * default is upper left, a little in front), plus `ambient` and an optional `gloss` highlight (sharpness `shine`)
 */
P.lightValue = function (Hf, { light = [-0.55, -0.65, 0.52], ambient = 0.24, gloss = 0, shine = 10 } = {}) {
  const W = this.w, H = this.h, v = new Float32Array(W * H);
  const ll = Math.hypot(...light), lx = light[0] / ll, ly = light[1] / ll, lz = light[2] / ll;
  const hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
  const g = (x, y, i) => (x < 0 || y < 0 || x >= W || y >= H ? Hf[i] : Hf[y * W + x]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const nx = -(g(x + 1, y, i) - g(x - 1, y, i)) / 2, ny = -(g(x, y + 1, i) - g(x, y - 1, i)) / 2, nl = Math.hypot(nx, ny, 1);
    let val = ambient + (1 - ambient) * Math.max(0, (nx * lx + ny * ly + lz) / nl);
    if (gloss) val += Math.pow(Math.max(0, (nx * hx + ny * hy + hz) / nl), shine) * gloss;
    v[i] = val;
  }
  return v;
};

// the lit value grid of mask `m` as one form (shadeForm's volume): inflate, soften, melt prims, add height, light it
function formLight(c, m, { R = 10, prims = null, k = 0.8, height = null, light, ambient, gloss, shine, smooth = 0.3 } = {}) {
  const W = c.w, H = c.h, S = c.S;
  // `smooth` (fraction of R) softens the inflated volume so the form turns smoothly (no crease along its middle)
  let Hf = inflate(m, W, H, Math.max(1, R * S));
  Hf = soften(Hf, m, W, H, Math.round(R * S * smooth));
  if (prims) { const ph = c.meltHeight(prims, k); for (let i = 0; i < Hf.length; i++) if (m[i]) Hf[i] = Math.max(Hf[i], Hf[i] * 0.35 + ph[i]); }
  if (height) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (m[i]) Hf[i] += height((x + 0.5 - c.ox) / S, (y + 0.5 - c.oy) / S) * S; }
  return c.lightValue(Hf, { light, ambient, gloss, shine });
}

/**
 * LIGHT-FIRST SHADING. Paint part(s) `on` as ONE form lit from one direction, onto `ramp` (palette keys, dark ->
 * light) in flat bands with a dither strip `strip` wide where two bands meet.
 *   R        how round the form's edge is, in design units (the silhouette is inflated: a quarter-round of radius R,
 *            flat beyond it). Small R: a flat plane with turned edges; large R: a full round volume.
 *   prims    melted primitives (cap, dome) adding volume (a muzzle, a cheek, a belly); `k` how softly they melt
 *   height   (x, y) => extra height in design units (design coordinates): folds, ridges, a brow
 *   curve    v => v, reshapes the light (contrast; where the terminator falls)
 *   lines    true also repaints the parts' outline pixels
 *   only     repaint only pixels currently one of these colours
 *   shapes   clip to these design-unit shapes
 * Returns the value grid (reuse it for highlights or a second material).
 */
P.shadeForm = function (on, ramp, { R = 10, prims = null, k = 0.8, height = null, curve = null, light, ambient, gloss, shine, strip = 1 / 3, lines = false, only = null, shapes = null, keep = null, smooth = 0.3 } = {}) {
  const W = this.w, H = this.h, m = this.partMask(on), clip = shapes ? this.mask(shapes) : null;
  const v = formLight(this, m, { R, prims, k, height, light, ambient, gloss, shine, smooth });
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!m[i] || (clip && !clip[i]) || (!lines && this.line[i])) continue;
    if (only && !only.includes(this.img.px[i])) continue;
    if (keep && keep.includes(this.img.px[i])) continue;
    const val = curve ? curve(v[i]) : v[i];
    this.img.px[i] = ramp[band(val, ramp.length, x, y, strip)];
  }
  return v;
};

/** a lookup that steps colours along ramps: step(c, -1) one darker, step(c, +1) one lighter (unknown colours stay) */
export function stepper(...ramps) {
  const pos = new Map();
  for (const r of ramps) r.forEach((c, i) => { if (!pos.has(c)) pos.set(c, [r, i]); });
  return (c, n) => { const p = pos.get(c); if (!p) return c; const [r, i] = p; return r[clamp(i + n, 0, r.length - 1)]; };
}

/**
 * a cast shadow: where part(s) `from`, moved (dx, dy) design units away from the light, lands on part(s) `onto`, those
 * pixels step `steps` darker along the ramps of `step` (a stepper). The shadow edge can be dithered (`soft` 0..1).
 */
P.castShadow = function (from, onto, dx, dy, step, { steps = 1, soft = 0, lines = false } = {}) {
  const W = this.w, H = this.h, f = this.partMask(from), t = this.partMask(onto), ox = Math.round(dx * this.S), oy = Math.round(dy * this.S);
  const hit = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!t[i] || f[i] || (!lines && this.line[i])) continue;
    const sx = x - ox, sy = y - oy;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H || !f[sy * W + sx]) continue;
    if (soft) { // near the shadow's edge, dither it
      let edge = false; for (const [a, b] of N4) { const qx = sx + a, qy = sy + b; if (qx >= 0 && qy >= 0 && qx < W && qy < H && !f[qy * W + qx]) edge = true; }
      if (edge && bayer(x, y) < soft) continue;
    }
    hit.push(i);
  }
  for (const i of hit) this.img.px[i] = step(this.img.px[i], -steps);
};

/** a contact shadow: pixels of part(s) `onto` within `r` design units of part(s) `from` step darker (a crease) */
P.occlude = function (onto, from, r, step, { steps = 1, lines = false, dither = false } = {}) {
  const W = this.w, H = this.h, f = this.partMask(from), t = this.partMask(onto), inv = new Uint8Array(W * H);
  for (let i = 0; i < inv.length; i++) inv[i] = f[i] ? 0 : 1;
  const d = distanceIn(inv, W, H), R = r * this.S;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!t[i] || f[i] || d[i] > R || (!lines && this.line[i])) continue;
    if (dither && d[i] > R * 0.5 && bayer(x, y) < (d[i] / R - 0.5) * 2) continue;
    this.img.px[i] = step(this.img.px[i], -steps);
  }
};

/**
 * a rim of light: pixels of part(s) `on` whose neighbour toward the light ([dx, dy], default upper left) is outside
 * them step `steps` lighter, `width` pixels deep. Run it before silhouette() so the rim lands on the figure.
 */
P.rimLight = function (on, step, { dir = [-1, -1], steps = 1, width = 1, lines = false, only = null } = {}) {
  const W = this.w, H = this.h, m = this.partMask(on), hit = [];
  const inM = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!m[i] || (!lines && this.line[i])) continue;
    if (only && !only.includes(this.img.px[i])) continue;
    let rim = false;
    for (let s = 1; s <= width && !rim; s++) if ((dir[0] && !inM(x + dir[0] * s, y)) || (dir[1] && !inM(x, y + dir[1] * s))) rim = true;
    if (rim) hit.push(i);
  }
  for (const i of hit) this.img.px[i] = step(this.img.px[i], steps);
};

/**
 * a 1-pixel line along a polyline (design units) in colour `c`, PIXEL-PERFECT: every diagonal step goes corner to
 * corner, with no doubled L corners (whiskers, seams, hair strands). `on` limits it to part(s).
 */
P.line1 = function (pts, c, { on = null } = {}) {
  const ids = on === null ? null : this._ids(on), m = this._line1Mask(pts);
  for (let i = 0; i < m.length; i++) if (m[i] && (!ids || ids.includes(this.part[i]))) this.img.px[i] = c;
};
/** the pixel mask of a pixel-perfect 1-px polyline (design units) */
P._line1Mask = function (pts) {
  const W = this.w, H = this.h, m = new Uint8Array(W * H);
  const Q = pts.map(([x, y]) => [Math.round(this.X(x)), Math.round(this.Y(y))]);
  for (let s = 0; s < Q.length - 1; s++) {
    let [x0, y0] = Q[s]; const [x1, y1] = Q[s + 1];
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      if (x0 >= 0 && y0 >= 0 && x0 < W && y0 < H) m[y0 * W + x0] = 1;
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  const g = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : m[y * W + x]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!m[y * W + x]) continue;
    const l = g(x - 1, y), r = g(x + 1, y), u = g(x, y - 1), d = g(x, y + 1);
    if (l + r !== 1 || u + d !== 1) continue;
    const sx = l ? -1 : 1, sy = u ? -1 : 1;
    if (!g(x + sx, y + sy) && !g(x - sx, y) && !g(x, y - sy)) m[y * W + x] = 0;
  }
  return m;
};

// ---------- M4.9 round 01: paint with a VALUE MAP (light) times a MATERIAL MAP (local colour) ----------
// The figure is first laid in as flat parts whose pixels hold MATERIAL names ('fur', 'white', 'mask', any string),
// then one value grid (0 dark .. 1 light, a Float32Array of w*h) is built for the whole picture: forms lit as volumes
// (lightField), designed shadow shapes (valueShape, crescentValue, castValue, valueLine), and at the end every material
// pixel is quantized onto its own ramp by the same light (paintLight). So a cast shadow crosses fur, scarf and pump
// alike, and parts are separated by light rather than by lines.

/** a new value grid for this canvas, filled with `v0` */
P.values = function (v0 = 0.6) { return new Float32Array(this.w * this.h).fill(v0); };

/**
 * write the light of part(s) `on`, shaded as ONE form (shadeForm's options: R, prims, k, height, light, ambient,
 * gloss, shine, smooth; `curve` reshapes the value), into the value grid `v` (only inside the parts, `shapes` clips)
 */
P.lightField = function (v, on, { curve = null, shapes = null, lines = true, mass = null, ...o } = {}) {
  // `mass`: the part(s) whose union silhouette makes the volume (default `on`): pass the parts in front of the form
  // too (an arm, a pump), so they don't punch holes the volume would turn round; only `on` is written
  const m = this.partMask(on, { lines }), clip = shapes ? this.mask(shapes) : null;
  const L = formLight(this, mass ? this.partMask([].concat(on, mass), { lines }) : m, o);
  for (let i = 0; i < m.length; i++) if (m[i] && (!clip || clip[i])) v[i] = curve ? curve(L[i]) : L[i];
  return v;
};

const applyV = (v, i, val, mode) => {
  if (mode === 'set') v[i] = val; else if (mode === 'mul') v[i] *= val; else if (mode === 'add') v[i] += val;
  else if (mode === 'min') v[i] = Math.min(v[i], val); else if (mode === 'max') v[i] = Math.max(v[i], val);
};

/** change the values inside design shapes (on part(s) `on`, null = all): mode 'set' | 'mul' | 'add' | 'min' | 'max' */
P.valueShape = function (v, shapes, val, { mode = 'set', on = null, soft = 0 } = {}) {
  const ids = this._ids(on), m = this.mask(shapes), W = this.w;
  for (let i = 0; i < m.length; i++) {
    if (!m[i] || (ids && !ids.includes(this.part[i]))) continue;
    if (soft) { const x = i % W, y = (i / W) | 0; if ((!m[i - 1] || !m[i + 1] || !m[i - W] || !m[i + W]) && bayer(x, y) < soft) continue; }
    applyV(v, i, val, mode);
  }
  return v;
};

/**
 * a crescent of the form `on` (a union mask): pixels whose neighbour `d` design units along `dir` lies outside it.
 * dir pointing AWAY from the light ([1, 1]) gives the shadow side of a cel-shaded form (wide where the form turns
 * away, nothing on the lit side); dir TOWARD the light ([-1, -1]) with a small d gives a rim of light; a 1-px crescent
 * on the shadow side with mode 'add' gives a reflected (bounce) light. `only` restricts it to these part(s).
 */
P.crescentValue = function (v, on, d, val, { dir = [1, 1], mode = 'set', only = null, soft = 0, samples = 3, maxV = Infinity } = {}) {
  const W = this.w, H = this.h, m = this.partMask(on), ids = this._ids(only), l = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / l, uy = dir[1] / l, D = d * this.S, hit = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!m[i] || (ids && !ids.includes(this.part[i])) || v[i] >= maxV) continue;   // maxV: only in the shadow
    let out = false;
    for (let s = 1; s <= samples && !out; s++) {
      const X = Math.round(x + (ux * D * s) / samples), Y = Math.round(y + (uy * D * s) / samples);
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      if (!m[Y * W + X]) out = true;
    }
    if (!out) continue;
    if (soft) { // dither the inner edge of the crescent
      const X = Math.round(x + ux * D * 0.7), Y = Math.round(y + uy * D * 0.7);
      if (X >= 0 && Y >= 0 && X < W && Y < H && m[Y * W + X] && bayer(x, y) < soft) continue;
    }
    hit.push(i);
  }
  for (const i of hit) applyV(v, i, val, mode);
  return v;
};

/**
 * a cast shadow in the value grid: where part(s) `from`, moved (dx, dy) design units away from the light, lands on
 * part(s) `onto`, the value is multiplied by `mul` (or capped at `max`); `soft` dithers its edge
 */
P.castValue = function (v, from, onto, dx, dy, { mul = 0.55, max = null, soft = 0 } = {}) {
  const W = this.w, H = this.h, f = this.partMask(from), t = this.partMask(onto), ox = Math.round(dx * this.S), oy = Math.round(dy * this.S), hit = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!t[i] || f[i]) continue;
    const sx = x - ox, sy = y - oy;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H || !f[sy * W + sx]) continue;
    if (soft) { let edge = false; for (const [a, b] of N4) { const qx = sx + a, qy = sy + b; if (qx >= 0 && qy >= 0 && qx < W && qy < H && !f[qy * W + qx]) edge = true; } if (edge && bayer(x, y) < soft) continue; }
    hit.push(i);
  }
  for (const i of hit) v[i] = max === null ? v[i] * mul : Math.min(v[i], max);
  return v;
};

/** a pixel-perfect 1-px line (design units) in the value grid (a crease: mode 'mul' 0.4; a lit ridge: 'max' 1) */
P.valueLine = function (v, pts, val, { mode = 'set', on = null } = {}) {
  const m = this._line1Mask(pts), ids = this._ids(on);
  for (let i = 0; i < m.length; i++) if (m[i] && (!ids || ids.includes(this.part[i]))) applyV(v, i, val, mode);
  return v;
};

/**
 * the final paint: every pixel of part(s) `on` (null = all) whose colour is a MATERIAL key of `mats` takes that
 * material's ramp (palette keys, dark -> light) at the value `v` there, in flat bands with a dither strip `strip`
 * wide. A material may be { ramp, bias, gain, strip }: bias shifts its values, gain scales them about 0.5.
 */
P.paintLight = function (v, mats, { on = null, strip = 1 / 3, curve = null, block = 1 } = {}) {
  const ids = this._ids(on), px = this.img.px, src = px.slice(), W = this.w, H = this.h;
  // `block` > 1: the light is read in block x block clusters (the mean value of each cluster's pixels of one material),
  // so every tone patch is at least that chunky (ref 05's limited, chunky look) without upscaling anything
  let vb = v;
  if (block > 1) {
    vb = new Float32Array(v.length);
    for (let by = 0; by < H; by += block) for (let bx = 0; bx < W; bx += block) {
      const sum = new Map();
      for (let y = by; y < Math.min(H, by + block); y++) for (let x = bx; x < Math.min(W, bx + block); x++) { const i = y * W + x, m = src[i]; if (!mats[m]) continue; const s = sum.get(m) ?? [0, 0]; s[0] += v[i]; s[1]++; sum.set(m, s); }
      for (let y = by; y < Math.min(H, by + block); y++) for (let x = bx; x < Math.min(W, bx + block); x++) { const i = y * W + x, s = sum.get(src[i]); vb[i] = s ? s[0] / s[1] : v[i]; }
    }
  }
  for (let i = 0; i < px.length; i++) {
    const mat = mats[src[i]]; if (!mat || (ids && !ids.includes(this.part[i]))) continue;
    const ramp = Array.isArray(mat) ? mat : mat.ramp;
    let val = vb[i];
    if (mat.gain) val = 0.5 + (val - 0.5) * mat.gain;
    if (mat.bias) val += mat.bias;
    if (curve) val = curve(val);
    px[i] = ramp[band(val, ramp.length, i % W, (i / W) | 0, mat.strip ?? strip)];
  }
  return this;
};

/**
 * the light of a straight TUBE (a cylinder from a to b, radius r, design units) for part(s) `on`, into the value grid
 * `v`: analytic normals across the axis, so a long diagonal tube (a pump barrel, a rod, a handle) shades in clean
 * bands along its length (an inflated silhouette steps along a diagonal edge). Same light defaults as lightValue.
 */
P.tubeField = function (v, on, a, b, r, { light = [-0.55, -0.65, 0.52], ambient = 0.24, gloss = 0, shine = 10, curve = null } = {}) {
  const W = this.w, H = this.h, m = this.partMask(on);
  const ax = this.X(a[0]), ay = this.Y(a[1]), bx = this.X(b[0]), by = this.Y(b[1]), len = Math.hypot(bx - ax, by - ay) || 1;
  const px = -(by - ay) / len, py = (bx - ax) / len, R = Math.max(0.5, r * this.S);
  const ll = Math.hypot(...light), lx = light[0] / ll, ly = light[1] / ll, lz = light[2] / ll;
  const hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!m[i]) continue;
    const o = clamp(((x + 0.5 - ax) * px + (y + 0.5 - ay) * py) / R, -1, 1), nz = Math.sqrt(1 - o * o), nx = px * o, ny = py * o;
    let val = ambient + (1 - ambient) * Math.max(0, nx * lx + ny * ly + nz * lz);
    if (gloss) val += Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), shine) * gloss;
    v[i] = curve ? curve(val) : val;
  }
  return v;
};

/**
 * tidy the silhouette after silhouette(): fill 1-px holes and notches (an empty pixel with 3 or 4 filled 4-neighbours
 * takes their most common colour) and drop nubs (a filled pixel with at most one filled 4-neighbour). Run it before
 * adding deliberate thin strokes (whiskers) that should stick out.
 */
P.cleanSilhouette = function ({ holes = true, nubs = true, passes = 2 } = {}) {
  const W = this.w, H = this.h, px = this.img.px;
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : px[y * W + x]);
  for (let p = 0; p < passes; p++) {
    const src = px.slice(), set = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, nb = [src[i - 1], src[i + 1], src[i - W], src[i + W]].filter((_, k) => (k === 0 ? x > 0 : k === 1 ? x < W - 1 : k === 2 ? y > 0 : y < H - 1));
      const full = nb.filter((c) => c !== null && c !== undefined);
      if (holes && src[i] === null && full.length >= 3) {
        const cnt = new Map(); for (const c of full) cnt.set(c, (cnt.get(c) ?? 0) + 1);
        set.push([i, [...cnt].sort((a, b) => b[1] - a[1])[0][0]]);
      } else if (nubs && src[i] !== null && full.length <= 1 && x > 0 && y > 0 && x < W - 1 && y < H - 1) set.push([i, null]);
    }
    for (const [i, c] of set) px[i] = c;
    void get;
  }
  return this;
};

/**
 * pixel-perfect clean-up of thin 1-px runs of one colour (the outline, a crease, the smirk): an L-corner pixel that
 * doubles such a line (the rule tools/lib/pixelcheck.mjs calls `jaggy`) takes the most common colour of its other
 * 4-neighbours, so the line steps corner to corner. Colours in `keep` are left alone.
 */
P.dejag = function (keep = [], { thick = false, fill = false } = {}) {   // thick: also in components that are not 1-px lines; fill: never open a hole (take the figure colour)
  const W = this.w, H = this.h, px = this.img.px, src = px.slice();
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : src[y * W + x]);
  const N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const comp = new Int32Array(W * H).fill(-1), size = [], thin = [];
  for (let y0 = 0; y0 < H; y0++) for (let x0 = 0; x0 < W; x0++) {
    const c = get(x0, y0); if (c === null || comp[y0 * W + x0] >= 0) continue;
    const id = size.length, st = [y0 * W + x0]; comp[st[0]] = id; let n = 0, th = true;
    while (st.length) {
      const i = st.pop(), x = i % W, y = (i / W) | 0; n++;
      if (get(x + 1, y) === c && get(x, y + 1) === c && get(x + 1, y + 1) === c) th = false;
      for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy; if (get(nx, ny) !== c || comp[ny * W + nx] >= 0) continue; comp[ny * W + nx] = id; st.push(ny * W + nx); }
    }
    size.push(n); thin.push(th);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = get(x, y); if (c === null || keep.includes(c)) continue;
    const same = (dx, dy) => get(x + dx, y + dy) === c, id = comp[y * W + x];
    if (N8.filter(([dx, dy]) => same(dx, dy)).length !== 2 || size[id] < 6 || (!thin[id] && !thick)) continue;
    for (const [hx, vy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      if (!(same(hx, 0) && same(0, vy) && !same(hx, vy) && !same(2 * hx, 0) && !same(0, 2 * vy))) continue;
      let others = [get(-hx + x, y), get(x, y - vy)]; const cnt = new Map();
      if (fill && others.some((o) => o !== null)) others = others.filter((o) => o !== null);
      for (const o of others) cnt.set(o, (cnt.get(o) ?? 0) + 1);
      px[y * W + x] = [...cnt].sort((a, b) => b[1] - a[1])[0][0];
      break;
    }
  }
  return this;
};

// ---------- M4.9 round 03: DESIGNED light (the computed volume is only the starting value map) ----------

/**
 * a designed SHADOW PLANE with one hand-placed terminator: inside design shapes `shapes` (on part(s) `on`) the value is
 * squashed into the shadow range (squash[0] + squash[1] * v: the volume survives only as a faint reflected-light
 * turn), and a band `band` design units wide along the terminator (shadow pixels whose neighbour toward the light,
 * `dir`, is a lit pixel of the same form) is set to `bandValue`: give that value its own saturated tone in the ramp
 * and the form glows at the terminator, as skin and fur do. Returns the shadow mask.
 */
P.terminator = function (v, on, shapes, { squash = [0.18, 0.28], band = 1.4, bandValue = 0.5, dir = [-1, -1] } = {}) {
  const W = this.w, H = this.h, sm = this.mask(shapes), pm = this.partMask(on), m = new Uint8Array(W * H);
  for (let i = 0; i < m.length; i++) m[i] = sm[i] && pm[i] ? 1 : 0;
  const l = Math.hypot(dir[0], dir[1]) || 1, ux = dir[0] / l, uy = dir[1] / l, D = Math.max(1, band * this.S), hit = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!m[i]) continue;
    for (let s = 1; s <= Math.ceil(D); s++) {
      const X = Math.round(x + ux * s), Y = Math.round(y + uy * s); if (X < 0 || Y < 0 || X >= W || Y >= H) break;
      const j = Y * W + X; if (!pm[j]) break;
      if (!m[j]) { hit.push(i); break; }
    }
  }
  for (let i = 0; i < m.length; i++) if (m[i]) v[i] = squash[0] + squash[1] * clamp(v[i]);
  if (band > 0) for (const i of hit) v[i] = bandValue;
  return m;
};

/**
 * a broken 1-px RIM of reflected light along the shadow side of the silhouette, painted after paintLight: pixels of
 * part(s) `on` whose neighbour along `dir` (away from the light) is empty, where the value is below `maxV`, take `color`,
 * in runs of `run` pixels with gaps of `gap` (counted along the contour's direction), so it reads as light catching an
 * edge, never as an outline. Skip pixels whose colour is in `skip`.
 */
P.rimPaint = function (v, on, color, { dir = [1, 1], maxV = 0.5, run = 4, gap = 2, skip = [] } = {}) {
  const W = this.w, H = this.h, px = this.img.px, ids = this._ids(on), hit = [];
  const empty = (x, y) => x < 0 || y < 0 || x >= W || y >= H || px[y * W + x] === null;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (px[i] === null || (ids && !ids.includes(this.part[i])) || v[i] >= maxV || skip.includes(px[i])) continue;
    if (!((dir[0] && empty(x + dir[0], y)) || (dir[1] && empty(x, y + dir[1])))) continue;
    if ((Math.floor((x + 2 * y) / 1) % (run + gap)) >= run) continue;
    hit.push(i);
  }
  for (const i of hit) px[i] = color;
  return this;
};

/**
 * the light of a CURVED tube (a tail, a hose) as ONE form: for each pixel of part(s) `on`, the nearest point of the
 * centre line `pts` (design units, sampled densely) with its radius `radius(t)` (t 0..1 along the line) gives an
 * analytic normal across the tube, so one continuous light band runs along the whole length (no per-segment bulges).
 * Pixels beyond the radius (tufts) take the edge normal. Same light defaults as lightValue.
 */
P.curveTubeField = function (v, on, pts, radius, { light = [-0.55, -0.65, 0.52], ambient = 0.24, gloss = 0, shine = 10, curve = null } = {}) {
  const W = this.w, H = this.h, m = this.partMask(on), n = pts.length;
  const C = pts.map(([x, y]) => [this.X(x), this.Y(y)]);
  const T = C.map((p, i) => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; });
  const Rr = C.map((_, i) => Math.max(0.5, radius(i / (n - 1)) * this.S));
  const ll = Math.hypot(...light), lx = light[0] / ll, ly = light[1] / ll, lz = light[2] / ll;
  const hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!m[i]) continue;
    let best = Infinity, bi = 0;
    for (let j = 0; j < n; j++) { const d = (x + 0.5 - C[j][0]) ** 2 + (y + 0.5 - C[j][1]) ** 2; if (d < best) { best = d; bi = j; } }
    const [tx, ty] = T[bi], px = -ty, py = tx;
    const o = clamp(((x + 0.5 - C[bi][0]) * px + (y + 0.5 - C[bi][1]) * py) / Rr[bi], -1, 1), nz = Math.sqrt(1 - o * o), nx = px * o, ny = py * o;
    let val = ambient + (1 - ambient) * Math.max(0, nx * lx + ny * ly + nz * lz);
    if (gloss) val += Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), shine) * gloss;
    v[i] = curve ? curve(val) : val;
  }
  return v;
};

/**
 * the orphan rule of tools/lib/pixelcheck.mjs as a fixer: a pixel with no same-colour 8-neighbour, fully surrounded
 * (no empty 4-neighbour), takes the most common colour of its 8 neighbours. Colours in `keep` (glints) stay.
 */
P.deorphan = function (keep = [], on = null) {
  const W = this.w, H = this.h, px = this.img.px, src = px.slice(), ids = this._ids(on);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, c = src[i]; if (c === null || keep.includes(c) || (ids && !ids.includes(this.part[i]))) continue;
    const nb = [src[i - W - 1], src[i - W], src[i - W + 1], src[i - 1], src[i + 1], src[i + W - 1], src[i + W], src[i + W + 1]];
    if (nb.includes(c) || [src[i - 1], src[i + 1], src[i - W], src[i + W]].includes(null)) continue;
    const cnt = new Map(); for (const n of nb) if (n !== null) cnt.set(n, (cnt.get(n) ?? 0) + 1);
    px[i] = [...cnt].sort((a, b) => b[1] - a[1])[0][0];
  }
  return this;
};
