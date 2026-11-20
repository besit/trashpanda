// M4.6 (Ivan: "I would prefer a completely 2d approach please... let's do pure 2d pixel art"): a small 2D pixel-art
// toolkit. Shapes are flat polygons / smooth closed curves in DESIGN units, drawn at a scale S onto a palette-indexed
// Img: each part is a flat colour with its own outline (black against the background, a darker line where it lies
// over another part), shading is painted with more 2D shapes or by an offset copy of the part's own silhouette (the
// side away from the light), and details are placed pixel by pixel. No 3D anywhere.
import { Img } from './raster.mjs';

// ---------- shapes (in design units) -> point lists ----------

/** a closed smooth curve through the points (Catmull-Rom); a point [x, y, 1] is a sharp corner */
export function blob(pts, steps = 10) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (p1[2] && p2[2]) { out.push([p1[0], p1[1]]); continue; }
    // a sharp corner pulls its side of the curve straight
    const a = p1[2] ? p1 : p0, d = p2[2] ? p2 : p3;
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const f = (k) => 0.5 * (2 * p1[k] + (-a[k] + p2[k]) * t + (2 * a[k] - 5 * p1[k] + 4 * p2[k] - d[k]) * t2 + (-a[k] + 3 * p1[k] - 3 * p2[k] + d[k]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  return out;
}
/** an open smooth curve through the points (for strokes) */
export function curve(pts, steps = 10) {
  const out = [], n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const f = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  out.push(pts[n - 1].slice(0, 2));
  return out;
}
/**
 * a tapered tube along an open smooth curve (a tail, a limb): width w0 at the start to w1 at the end, round caps.
 * w0 may instead be a function of t (0 at the start, 1 at the end) giving the width, for a tube that swells
 */
export function tube(pts, w0, w1 = w0, steps = 10) {
  const wf = typeof w0 === 'function' ? w0 : (t) => w0 + (w1 - w0) * t;
  const c = curve(pts, steps), n = c.length, L = [], R = [], dir = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = wf(i / (n - 1)) / 2, nx = -dy / l, ny = dx / l;
    dir.push([dx / l, dy / l, nx, ny]);
    L.push([c[i][0] + nx * w, c[i][1] + ny * w]); R.push([c[i][0] - nx * w, c[i][1] - ny * w]);
  }
  const cap = (i, w, s) => { const [dx, dy, nx, ny] = dir[i], out = []; for (let k = 1; k < 8; k++) { const f = (k / 8) * Math.PI; out.push([c[i][0] + (nx * Math.cos(f) + dx * Math.sin(f)) * w * s, c[i][1] + (ny * Math.cos(f) + dy * Math.sin(f)) * w * s]); } return out; };
  return [...L, ...cap(n - 1, wf(1) / 2, 1), ...R.reverse(), ...cap(0, wf(0) / 2, -1)];
}
/** an ellipse (optionally turned by `rot` radians) as a polygon */
export function ell(cx, cy, rx, ry, rot = 0, n = 40) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; });
}
/** a thick bar from a to b (a rectangle, round = rounded ends) */
export function bar(a, b, w, round = false) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
  if (!round) return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
  const out = [], r = w / 2, ang = Math.atan2(dy, dx);
  for (let i = 0; i <= 10; i++) { const t = ang - Math.PI / 2 + (i / 10) * Math.PI; out.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  for (let i = 0; i <= 10; i++) { const t = ang + Math.PI / 2 + (i / 10) * Math.PI; out.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); }
  return out;
}

// ---------- M4.8: drawn-fur helpers (the craft of Ivan's ref 03: tufted edges, fur strokes, value ramps) ----------

/** a small deterministic hash -> [0, 1) (placement jitter that is the same on every build) */
export function hash(x, y, seed = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * a closed outline (a point list, e.g. from blob()) with fur tufts along it, like hand-drawn locks of fur: the outline
 * is walked in steps of about `period` design units (the spacing varies) and, where `where(x, y)` > 0, a curved lock
 * (`amp` * where long) is pushed out over each step, leaning along `flow` ([dx, dy] or (x, y) => [dx, dy]; `lean` how
 * far). The rhythm is irregular on purpose (a big lock, then smaller ones; `skip` leaves some steps smooth), so
 * the edge reads as fur, not as a saw blade. Deterministic from `seed`. For cheek ruffs, ear fringes, a chest
 * ruff, the tip of a tail.
 */
export function tufted(pts, { amp = 4, period = 6, where = () => 1, flow = [0, 1], lean = 0.6, jitter = 0.5, skip = 0.15, seed = 1 } = {}) {
  // resample by arc length, each step a little different
  const P = [], n = pts.length;
  let step = period, acc = 0, si = 0;
  P.push(pts[0]);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let t = step - acc;
    while (t <= L) {
      P.push([a[0] + ((b[0] - a[0]) * t) / L, a[1] + ((b[1] - a[1]) * t) / L]);
      step = period * (0.65 + 0.7 * hash(si++, 3, seed)); t += step;
    }
    acc = L - (t - step);
  }
  // orientation (outward normal sign)
  let area = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area > 0 ? 1 : -1;
  const RHYTHM = [1, 0.55, 0.8, 0.45, 0.95, 0.65];
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    out.push(a);
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, w = where(mx, my);
    if (!(w > 0) || hash(i, 11, seed) < skip) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const nx = (dy / L) * sgn, ny = (-dx / L) * sgn;
    const f = typeof flow === 'function' ? flow(mx, my) : flow;
    const rh = RHYTHM[(i + Math.floor(hash(1, 5, seed) * 6)) % RHYTHM.length];
    const r = amp * w * rh * (1 - jitter / 2 + jitter * hash(i, 7, seed));
    // which end of the step the lock leans toward (its tip skews that way, the other side is the lock's belly)
    const along = (f[0] * dx + f[1] * dy) / L >= 0 ? 1 : -1;
    const tx = (dx / L) * along, ty = (dy / L) * along;
    const bx = along > 0 ? a[0] + dx * 0.3 : a[0] + dx * 0.7, by = along > 0 ? a[1] + dy * 0.3 : a[1] + dy * 0.7;
    const belly = [bx + nx * r * 0.45 + f[0] * r * lean * 0.3, by + ny * r * 0.45 + f[1] * r * lean * 0.3];
    const tip = [mx + nx * r + f[0] * r * lean + tx * L * 0.25, my + ny * r + f[1] * r * lean + ty * L * 0.25];
    if (along > 0) out.push(belly, tip); else out.push(tip, belly);
  }
  return out;
}

// ---------- the canvas ----------

export class Canvas {
  /** w, h in pixels; S pixels per design unit; (ox, oy) the pixel position of the design origin */
  constructor(w, h, S = 1, ox = 0, oy = 0) {
    this.img = new Img(w, h); this.w = w; this.h = h; this.S = S; this.ox = ox; this.oy = oy;
    this.part = new Int16Array(w * h).fill(-1);   // which part owns each pixel
    this.line = new Uint8Array(w * h);            // 1 = an outline pixel
    this.ids = new Map(); this.next = 0;
  }
  /** design units -> pixels */
  X(x) { return this.ox + x * this.S; }
  Y(y) { return this.oy + y * this.S; }
  /** rasterize a design-unit polygon (or several, even-odd) to a pixel mask */
  mask(shapes) {
    const list = Array.isArray(shapes[0]?.[0]) ? shapes : [shapes];
    const m = new Uint8Array(this.w * this.h);
    for (const pts0 of list) {
      const pts = pts0.map(([x, y]) => [this.X(x), this.Y(y)]);
      const ys = pts.map((p) => p[1]);
      const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(this.h - 1, Math.ceil(Math.max(...ys)));
      for (let y = y0; y <= y1; y++) {
        const xs = [], yc = y + 0.5;
        for (let i = 0; i < pts.length; i++) {
          const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) * (bx - ax)) / (by - ay));
        }
        xs.sort((a, b) => a - b);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          for (let x = Math.max(0, Math.round(xs[i])); x < Math.min(this.w, Math.round(xs[i + 1])); x++) m[y * this.w + x] ^= 1;
        }
      }
    }
    return m;
  }
  id(name) { if (!this.ids.has(name)) this.ids.set(name, this.next++); return this.ids.get(name); }
  /**
   * a flat part: `fill` inside, outlined. The outline is `line` (default K) against the background and `inner`
   * where it lies over an earlier part; `lw` its width against the background. Returns the part's id.
   */
  shape(name, shapes, fill, { line = 'K', inner = line, lw = 1, clip = null, noline = false } = {}) {
    const id = this.id(name), m = this.mask(shapes), w = this.w, h = this.h;
    if (clip !== null) { const ci = [].concat(clip).map((c) => this.id(c)); for (let i = 0; i < m.length; i++) if (m[i] && !ci.includes(this.part[i])) m[i] = 0; }
    const inM = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
    // distance (in 4-steps) to the outside of the mask, up to lw
    const edge = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!m[i]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (inM(x + dx, y + dy)) continue;
        const nx = x + dx, ny = y + dy, out = nx < 0 || ny < 0 || nx >= w || ny >= h;
        const j = ny * w + nx;
        const bg = out || this.img.px[j] === null;
        if (out) continue; // the image's edge is not an outline (a part running off the frame)
        if (bg) edge[i] = 2; else if (!this.line[j] && edge[i] < 2) edge[i] = 1;
      }
    }
    if (lw > 1) { // thicken the background outline inward
      for (let pass = 1; pass < lw; pass++) {
        const prev = edge.slice();
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!m[i] || prev[i]) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (inM(x + dx, y + dy) && prev[(y + dy) * w + x + dx] === 2) { edge[i] = 3; break; } }
        for (let i = 0; i < edge.length; i++) if (edge[i] === 3) edge[i] = 2;
      }
    }
    for (let i = 0; i < m.length; i++) {
      if (!m[i]) continue;
      const e = noline ? 0 : edge[i];
      // M4.8: line / inner may be null = no line there (the part's own fill; selective outlining)
      const lc = e === 2 ? line : e === 1 ? inner : null;
      this.img.px[i] = lc ?? fill;
      this.part[i] = id; this.line[i] = lc ? 1 : 0;
    }
    return id;
  }
  /** paint `c` over part(s) `on` (not their outline) inside `shapes`; pattern 'checker' dithers it */
  paint(on, shapes, c, { pattern = null, phase = 0, only = null, lines = false } = {}) {
    const ids = [].concat(on).map((n) => this.id(n)), m = shapes ? this.mask(shapes) : null;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const i = y * this.w + x;
      if (m && !m[i]) continue;
      if (!ids.includes(this.part[i]) || (this.line[i] && !lines)) continue;
      if (only && !only.includes(this.img.px[i])) continue;
      if (pattern === 'checker' && (x + y + phase) % 2) continue;
      if (pattern === 'sparse' && !(((x + phase) % 4 === 0 && y % 4 === 0) || ((x + phase + 2) % 4 === 0 && y % 4 === 2))) continue;
      this.img.px[i] = c;
    }
  }
  /**
   * form shading from the part's own silhouette: pixels of `on` whose neighbour (dx, dy) design units away is
   * NOT the same part get `c` (dx, dy point away from the light: (1, 1) shades the lower right rim)
   */
  rim(on, dx, dy, c, opts = {}) {
    const id = this.id(on), ox = Math.round(dx * this.S), oy = Math.round(dy * this.S), w = this.w, h = this.h;
    const src = this.part;
    const hit = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (src[i] !== id || this.line[i]) continue;
      const nx = x + ox, ny = y + oy;
      const inside = nx >= 0 && ny >= 0 && nx < w && ny < h ? src[ny * w + nx] === id : opts.edgeIn ?? true;
      if (!inside) hit.push(i);
    }
    for (const i of hit) {
      const x = i % w, y = (i / w) | 0;
      if (opts.only && !opts.only.includes(this.img.px[i])) continue;
      if (opts.pattern === 'checker' && (x + y + (opts.phase ?? 0)) % 2) continue;
      this.img.px[i] = c;
    }
  }
  /** a stroke along a polyline (design units), `t` pixels thick, optionally only over part(s) `on` */
  stroke(pts, c, { t = 1, on = null, line = true } = {}) {
    const ids = on === null ? null : [].concat(on).map((n) => this.id(n));
    const P = pts.map(([x, y]) => [this.X(x), this.Y(y)]);
    const put = (x, y) => {
      for (let j = 0; j < t; j++) for (let k = 0; k < t; k++) {
        const X = Math.round(x - (t - 1) / 2) + k, Y = Math.round(y - (t - 1) / 2) + j;
        if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) continue;
        const i = Y * this.w + X;
        if (ids && !ids.includes(this.part[i])) continue;
        this.img.px[i] = c; if (line) this.line[i] = 1;
      }
    };
    for (let s = 0; s < P.length - 1; s++) {
      let [x0, y0] = P[s].map(Math.round), [x1, y1] = P[s + 1].map(Math.round);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        put(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
  }
  /** single pixels at design positions (`r` > 0: a small disc of radius r PIXELS) */
  dot(x, y, c, r = 0) {
    const X = Math.round(this.X(x)), Y = Math.round(this.Y(y));
    for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) if (k * k + j * j <= r * r + r) this.img.set(X + k, Y + j, c);
  }
  /** a final black outline around everything (the silhouette), outside it */
  outline(c = 'K') { this.img.outline(c); return this; }

  // ---------- M4.8: drawn fur, selective outlines, clean clusters ----------

  /** ids of part names (null = every part) */
  _ids(on) { return on === null ? null : [].concat(on).map((n) => this.id(n)); }

  /**
   * fur at a tone boundary: where colour `from` meets colour `into` (inside part(s) `on`), short strokes of `from`
   * poke into `into` along `dir` ([dx, dy] or (x, y) => [dx, dy], in any length). `len` and `gap` are in design units:
   * the stroke length (jittered down to 55%) and the spacing between strokes along the boundary. `w` 2 makes the first
   * third of each stroke 2 pixels wide (a wedge-shaped tuft). Run it both ways (light into dark, dark into light) and
   * the two tones interlock like fur instead of meeting in a smooth vector edge.
   */
  furBreak(on, from, into, { dir = [0, 1], len = 3, gap = 2.5, w = 1, seed = 1, shapes = null } = {}) {
    const ids = this._ids(on), W = this.w, H = this.h, px = this.img.px;
    const m = shapes ? this.mask(shapes) : null;
    const intoL = [].concat(into);
    const ok = (i) => (!ids || ids.includes(this.part[i])) && !this.line[i];
    const cand = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (px[i] !== from || !ok(i) || (m && !m[i])) continue;
      if (intoL.includes(px[i + 1]) || intoL.includes(px[i - 1]) || intoL.includes(px[i + W]) || intoL.includes(px[i - W])) cand.push(i);
    }
    // even spacing along the boundary (greedy, in a hashed order so it doesn't line up)
    cand.sort((a, b) => hash(a % W, (a / W) | 0, seed) - hash(b % W, (b / W) | 0, seed));
    const G = Math.max(1, gap * this.S), kept = [], grid = new Map();
    const cell = (x, y) => `${Math.floor(x / G)},${Math.floor(y / G)}`;
    for (const i of cand) {
      const x = i % W, y = (i / W) | 0;
      let close = false;
      for (let gy = -1; gy <= 1 && !close; gy++) for (let gx = -1; gx <= 1 && !close; gx++) {
        for (const [qx, qy] of grid.get(`${Math.floor(x / G) + gx},${Math.floor(y / G) + gy}`) ?? []) if ((qx - x) ** 2 + (qy - y) ** 2 < G * G) { close = true; break; }
      }
      if (close) continue;
      kept.push([x, y]);
      const key = cell(x, y); if (!grid.has(key)) grid.set(key, []); grid.get(key).push([x, y]);
    }
    const paints = [];
    for (const [x, y] of kept) {
      let [dx, dy] = typeof dir === 'function' ? dir((x - this.ox) / this.S, (y - this.oy) / this.S) : dir;
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const L = Math.max(1, Math.round(len * this.S * (0.55 + 0.45 * hash(x, y, seed + 3))));
      for (let s = 1; s <= L; s++) {
        const X = Math.round(x + dx * s), Y = Math.round(y + dy * s);
        if (X < 0 || Y < 0 || X >= W || Y >= H) break;
        const j = Y * W + X;
        if (!ok(j) || (!intoL.includes(px[j]) && px[j] !== from)) break;
        paints.push(j);
        if (w > 1 && s <= Math.ceil(L / 3)) {
          const X2 = Math.round(X - dy), Y2 = Math.round(Y + dx), j2 = Y2 * W + X2;
          if (X2 >= 0 && Y2 >= 0 && X2 < W && Y2 < H && ok(j2) && intoL.includes(px[j2])) paints.push(j2);
        }
      }
    }
    for (const j of paints) px[j] = from;
    return this;
  }

  /**
   * directional fur strokes inside a region: one short stroke of `color` per `gap` x `gap` cell (jittered), along
   * `dir` ([dx, dy] or (x, y) => [dx, dy]), `len` design units long, painted only over pixels whose colour is in
   * `only` (inside part(s) `on`, optionally inside `shapes`). Light strokes on the lit fur, dark ones in the shadows.
   */
  furStrokes(on, shapes, color, { only = null, dir = [0, 1], len = 3, gap = 4, seed = 1, prob = 1 } = {}) {
    const ids = this._ids(on), W = this.w, H = this.h, px = this.img.px;
    const m = shapes ? this.mask(shapes) : null;
    const G = Math.max(2, gap * this.S), paints = [];
    for (let cy = 0; cy < H; cy += G) for (let cx = 0; cx < W; cx += G) {
      const r = (cy / G) % 2 ? 0.5 : 0;   // stagger alternate rows
      const x0 = Math.round(cx + (r + 0.8 * hash(cx, cy, seed) - 0.4) * G), y0 = Math.round(cy + (0.8 * hash(cx, cy, seed + 1) - 0.4) * G);
      if (hash(cx, cy, seed + 2) >= prob) continue;
      let [dx, dy] = typeof dir === 'function' ? dir((x0 - this.ox) / this.S, (y0 - this.oy) / this.S) : dir;
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const L = Math.max(1, Math.round(len * this.S * (0.6 + 0.4 * hash(cx, cy, seed + 4))));
      for (let s = 0; s < L; s++) {
        const X = Math.round(x0 + dx * s), Y = Math.round(y0 + dy * s);
        if (X < 0 || Y < 0 || X >= W || Y >= H) break;
        const j = Y * W + X;
        if ((ids && !ids.includes(this.part[j])) || this.line[j] || (m && !m[j])) break;
        if (only && !only.includes(px[j])) break;
        paints.push(j);
      }
    }
    for (const j of paints) px[j] = color;
    return this;
  }

  /**
   * fur texture INSIDE a zone (ref 03's strands): clusters of 2 or 3 parallel strokes, then a gap, following `dir`
   * ([dx, dy] or (x, y) => [dx, dy], design units), painted in `color` only over pixels whose colour is in `only`
   * (inside part(s) `on`, optionally inside `shapes`). `gap` the spacing between clusters, `len` the stroke length (both
   * design units, jittered); `avoid` a list of [x, y, r] calm zones (design units) left untouched round the eyes and the
   * nose. `density` scales the number of clusters (callers pass less at small scales, none at the smallest). `ang`
   * varies each cluster's direction by up to that many radians, `lenVar` its strands' length (0.45 = -45% .. +18%).
   */
  furClusters(on, shapes, color, { only = null, dir = [0, 1], len = 4, gap = 6, per = 3, density = 1, avoid = [], seed = 1, ang = 0, lenVar = 0.45 } = {}) {
    if (density <= 0) return this;
    const ids = this._ids(on), W = this.w, H = this.h, px = this.img.px;
    const m = shapes ? this.mask(shapes) : null;
    const G = Math.max(3, (gap * this.S) / Math.sqrt(density)), paints = [];
    const toD = (X, Y) => [(X - this.ox) / this.S, (Y - this.oy) / this.S];
    const calm = (X, Y) => { const [x, y] = toD(X, Y); return avoid.some(([ax, ay, r]) => (x - ax) ** 2 + (y - ay) ** 2 < r * r); };
    for (let cy = 0; cy < H; cy += G) for (let cx = 0; cx < W; cx += G) {
      const r = (Math.round(cy / G) % 2) * 0.5;
      const x0 = cx + (r + 0.9 * hash(cx, cy, seed) - 0.45) * G, y0 = cy + (0.9 * hash(cx, cy, seed + 1) - 0.45) * G;
      const [d0x, d0y] = toD(x0, y0);
      let [dx, dy] = typeof dir === 'function' ? dir(d0x, d0y) : dir;
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      if (ang) { const a = (hash(cx, cy, seed + 9) - 0.5) * 2 * ang, ca = Math.cos(a), sa = Math.sin(a); [dx, dy] = [dx * ca - dy * sa, dx * sa + dy * ca]; }
      const n = per === 3 ? (hash(cx, cy, seed + 5) < 0.5 ? 2 : 3) : per;
      for (let k = 0; k < n; k++) {
        // the strands of a cluster sit side by side, a pixel or two apart, a little staggered along the flow
        const off = (k - (n - 1) / 2) * (1.6 + hash(cx + k, cy, seed + 6)), st = (hash(cx, cy + k, seed + 7) - 0.5) * 2;
        const sx = x0 - dy * off + dx * st, sy = y0 + dx * off + dy * st;
        const L = Math.max(2, Math.round(len * this.S * (1 - lenVar + lenVar * 1.4 * hash(cx + k, cy + k, seed + 8))));
        for (let s = 0; s < L; s++) {
          const X = Math.round(sx + dx * s), Y = Math.round(sy + dy * s);
          if (X < 0 || Y < 0 || X >= W || Y >= H) break;
          const j = Y * W + X;
          if ((ids && !ids.includes(this.part[j])) || this.line[j] || (m && !m[j])) break;
          if (only && !only.includes(px[j])) break;
          if (avoid.length && calm(X, Y)) break;
          paints.push(j);
        }
      }
    }
    for (const j of paints) px[j] = color;
    return this;
  }

  /**
   * the final silhouette line OUTSIDE everything drawn, chosen per pixel: `dark` on the shadow side, `lit` (a softer
   * tone, or null for no line at all) on the side facing the light `light` ([dx, dy] toward the light; default the
   * upper left). Selective outlining: lit edges soften, shadowed edges stay crisp. `pick(neighbourColour, lit)` may
   * return a colour for that pixel (a coloured line per material), or undefined for the default.
   */
  silhouette({ dark = 'K', lit, light = [-1, -1], litOnly = null, pick = null } = {}) {
    const W = this.w, H = this.h, src = this.img.px.slice();
    const op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] !== null;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (src[y * W + x] !== null) continue;
      if (!(op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1))) continue;
      let sx = 0, sy = 0, nb = null;
      for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) if ((j || k) && op(x + k, y + j)) { sx += k; sy += j; if (!nb && !(j && k)) nb = src[(y + j) * W + x + k]; }
      const facing = -(sx * light[0] + sy * light[1]) > 0.5;   // the figure lies away from the light: a lit edge
      const useLit = lit !== undefined && facing && (!litOnly || litOnly.includes(nb));
      let c = useLit ? lit : dark;
      if (pick) { const p = pick(nb, facing); if (p !== undefined) c = p; }
      if (c) this.img.px[y * W + x] = c;
    }
    return this;
  }

  /**
   * clean clusters: a pixel (inside part(s) `on`) none of whose 8 neighbours shares its colour is an orphan; it takes
   * its most common 4-neighbour colour. Colours in `keep` (eye glints, nose shine) are left alone.
   */
  despeckle(on = null, keep = []) {
    const ids = this._ids(on), W = this.w, H = this.h, src = this.img.px.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, c = src[i];
      if (c === null || keep.includes(c) || (ids && !ids.includes(this.part[i]))) continue;
      let same = false;
      for (let j = -1; j <= 1 && !same; j++) for (let k = -1; k <= 1; k++) if ((j || k) && src[i + j * W + k] === c) { same = true; break; }
      if (same) continue;
      const cnt = new Map();
      for (const d of [1, -1, W, -W]) { const n = src[i + d]; if (n !== null) cnt.set(n, (cnt.get(n) ?? 0) + 1); }
      let best = null, bn = 0; for (const [n, v] of cnt) if (v > bn) { best = n; bn = v; }
      if (best !== null && bn >= 2) this.img.px[i] = best;
    }
    return this;
  }
}
