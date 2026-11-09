// Tiny palette-indexed raster library used to author all pixel art as code.
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';
import { PALETTE, hexToRgb } from '../palette.mjs';

const RGB = Object.fromEntries(Object.entries(PALETTE).map(([k, v]) => [k, hexToRgb(v)]));
const T = null; // transparent

function splitRows(str) {
  return str.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
}

export class Img {
  constructor(w, h) { this.w = w; this.h = h; this.px = new Array(w * h).fill(T); this.tx = 0; this.ty = 0; }
  static fromGrid(str, map = {}) {
    const rows = splitRows(str);
    const img = new Img(Math.max(...rows.map((r) => r.length)), rows.length);
    img.grid(0, 0, str, map);
    return img;
  }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { x |= 0; y |= 0; return this.in(x, y) ? this.px[y * this.w + x] : T; }
  set(x, y, c) { x = Math.round(x) + this.tx; y = Math.round(y) + this.ty; if (c !== undefined && this.in(x, y)) this.px[y * this.w + x] = c; return this; }
  clone() { const o = new Img(this.w, this.h); o.px = this.px.slice(); return o; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); return this; }
  hline(x0, x1, y, c) { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, c); return this; }
  vline(x, y0, y1, c) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) this.set(x, y, c); return this; }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }
  thick(x0, y0, x1, y1, c, t = 2) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= n; s++) {
      const x = x0 + ((x1 - x0) * s) / n, y = y0 + ((y1 - y0) * s) / n;
      this.rect(Math.round(x - (t - 1) / 2), Math.round(y - (t - 1) / 2), t, t, c);
    }
    return this;
  }
  ellipse(cx, cy, rx, ry, c, fill = true) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / ((rx + 0.5) ** 2) + (y * y) / ((ry + 0.5) ** 2);
      if (fill ? d <= 1 : d <= 1 && d > 1 - 2.2 / Math.max(rx, ry, 1)) this.set(cx + x, cy + y, c);
    }
    return this;
  }
  circle(cx, cy, r, c, fill = true) { return this.ellipse(cx, cy, r, r, c, fill); }
  poly(pts, c) {
    const ys = pts.map((p) => p[1]);
    const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) xs.push(ax + ((y + 0.5 - ay) * (bx - ax)) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) this.set(x, y, c);
    }
    return this;
  }
  /** Draw a text grid. Each char is a palette key; '.' or ' ' transparent; map can alias chars. */
  grid(ox, oy, str, map = {}) {
    splitRows(str).forEach((row, y) => [...row].forEach((ch, x) => {
      const k = map[ch] ?? ch;
      if (k && k !== '.' && k !== ' ') {
        if (!RGB[k]) throw new Error(`bad colour '${k}'`);
        this.set(ox + x, oy + y, k);
      }
    }));
    return this;
  }
  dither(x, y, w, h, c, pattern = 'checker', phase = 0) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x + i, Y = y + j;
      let on = false;
      if (pattern === 'checker') on = (X + Y + phase) % 2 === 0;
      else if (pattern === 'quarter') on = (X + phase) % 2 === 0 && Y % 2 === 0;
      else if (pattern === 'sparse') on = (X + phase) % 4 === 0 && Y % 4 === 0 || (X + phase + 2) % 4 === 0 && Y % 4 === 2;
      else if (pattern === 'lines') on = (Y + phase) % 2 === 0;
      if (on) this.set(X, Y, c);
    }
    return this;
  }
  /** Dither only over pixels that are already a given colour */
  ditherOver(from, to, pattern = 'checker', phase = 0) {
    const tmp = new Img(this.w, this.h); tmp.dither(0, 0, this.w, this.h, 'K', pattern, phase);
    for (let i = 0; i < this.px.length; i++) if (this.px[i] === from && tmp.px[i]) this.px[i] = to;
    return this;
  }
  recolor(map) { this.px = this.px.map((c) => (c !== T && map[c] !== undefined ? map[c] : c)); return this; }
  outline(c = 'K', diag = false) {
    const src = this.px.slice(), w = this.w, h = this.h;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[y * w + x] !== T;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (src[y * w + x] !== T) continue;
      if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1) ||
        (diag && (op(x - 1, y - 1) || op(x + 1, y - 1) || op(x - 1, y + 1) || op(x + 1, y + 1)))) this.px[y * w + x] = c;
    }
    return this;
  }
  /** Repaint pixels of `from` that border transparency/outline on `side` with `to` (rim light/shadow) */
  rim(from, to, side = 'up', depth = 1) {
    for (let d = 0; d < depth; d++) {
      const src = this.px.slice(), w = this.w;
      const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[side];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < w; x++) {
        if (src[y * w + x] !== from) continue;
        const nx = x + dx * (d + 1), ny = y + dy * (d + 1);
        const n = nx >= 0 && ny >= 0 && nx < w && ny < this.h ? src[ny * w + nx] : T;
        if (n === T || n === 'K') this.px[y * w + x] = to;
      }
    }
    return this;
  }
  blit(src, ox, oy, { flipX = false, flipY = false, only = null } = {}) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.px[y * src.w + x];
      if (c === T || (only && !only.includes(c))) continue;
      this.set(ox + (flipX ? src.w - 1 - x : x), oy + (flipY ? src.h - 1 - y : y), c);
    }
    return this;
  }
  flipX() { const o = new Img(this.w, this.h); o.blit(this, 0, 0, { flipX: true }); return o; }
  crop(x, y, w, h) { const o = new Img(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) o.px[j * w + i] = this.get(x + i, y + j); return o; }
  shift(dx, dy) { const o = new Img(this.w, this.h); o.blit(this, dx, dy); return o; }
}

/** Compose frames into a strip (or grid with `cols`). */
export function sheet(frames, cols = frames.length) {
  const fw = frames[0].w, fh = frames[0].h, rows = Math.ceil(frames.length / cols);
  const out = new Img(fw * cols, fh * rows);
  frames.forEach((f, i) => out.blit(f, (i % cols) * fw, Math.floor(i / cols) * fh));
  return out;
}

export function toPNG(img, scale = 1, bg = null) {
  const W = img.w * scale, H = img.h * scale;
  const png = new PNG({ width: W, height: H });
  const bgc = bg ? hexToRgb(bg) : null;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = img.px[Math.floor(y / scale) * img.w + Math.floor(x / scale)];
    const i = (y * W + x) * 4;
    const rgb = c === T ? bgc : RGB[c];
    if (rgb) { png.data[i] = rgb[0]; png.data[i + 1] = rgb[1]; png.data[i + 2] = rgb[2]; png.data[i + 3] = 255; }
    else png.data[i + 3] = 0;
  }
  return PNG.sync.write(png);
}

export function save(img, file, scale = 1, bg = null) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, toPNG(img, scale, bg));
}
