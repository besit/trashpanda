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
      this.img.px[i] = e === 2 ? line : e === 1 ? inner : fill;
      this.part[i] = id; this.line[i] = e ? 1 : 0;
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
}
