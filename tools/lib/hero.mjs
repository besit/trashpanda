// M4.10: hero images from AI-generated masters (Gemini). A master is drawn in a pixel-art style but is not true pixel
// art: its "pixels" are soft blocks of about 4 x 4 screen pixels, with JPEG smudges. This rebuilds it on a clean grid
// and puts it on a locked palette, pixel to pixel (no smoothing, no cleanup: the source grid is already clean).
//   1 grid    find the block size's phase (where block edges fall), then take the median of each block's inner pixels
//   2 key     the flat green background (#00FF00 in the prompt) becomes transparent; green spill on edges is removed
//   3 palette the character's palette is made ONCE from its first master (k-means in OKLab, a perceptual colour space)
//             and locked; every later image of that character is mapped onto the same colours
import { PNG } from 'pngjs';

// ---------- colour ----------
const toLin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const toSrgb = (v) => { v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(v * 255))); };
export function oklab([r, g, b]) {
  r = toLin(r); g = toLin(g); b = toLin(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
export function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)];
}
const d2 = (u, v) => (u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2 + (u[2] - v[2]) ** 2;
export const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

// ---------- 1 grid ----------
/** the median colour of each block's inner pixels; returns { w, h, rgb: [[r,g,b]...], phase } */
export function sampleGrid(png, block = 4, phase = null) {
  const W = png.width, H = png.height;
  const px = (x, y) => { const i = (Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const findPhase = (axis) => { // the offset that puts block edges on the strongest brightness steps
    let best = -1, bp = 0;
    for (let ph = 0; ph < block; ph += 0.25) {
      let s = 0;
      for (let k = 0; k < 4000; k++) {
        const a = 150 + ((k * 7919) % (Math.min(W, H) - 300)), b = 150 + ((k * 104729) % (Math.min(W, H) - 300));
        const e = Math.floor(Math.round((a - ph) / block) * block + ph);
        s += axis === 'x' ? Math.abs(lum(px(e, b)) - lum(px(e - 1, b))) : Math.abs(lum(px(b, e)) - lum(px(b, e - 1)));
      }
      if (s > best) { best = s; bp = ph; }
    }
    return bp;
  };
  const phx = phase ? phase[0] : findPhase('x'), phy = phase ? phase[1] : findPhase('y');
  const w = Math.floor((W - phx) / block), h = Math.floor((H - phy) / block), rgb = [];
  for (let gy = 0; gy < h; gy++) for (let gx = 0; gx < w; gx++) {
    const x0 = phx + gx * block, y0 = phy + gy * block, cs = [];
    for (let y = Math.ceil(y0 + block * 0.25); y < y0 + block * 0.75; y++) for (let x = Math.ceil(x0 + block * 0.25); x < x0 + block * 0.75; x++) cs.push(px(x, y));
    if (!cs.length) cs.push(px(Math.round(x0 + block / 2), Math.round(y0 + block / 2)));
    rgb.push([0, 1, 2].map((c) => cs.map((v) => v[c]).sort((p, q) => p - q)[cs.length >> 1]));
  }
  return { w, h, rgb, phase: [phx, phy] };
}

/**
 * resample at a CHOSEN pixel size: the figure (the non-green pixels) becomes `height` art pixels tall, whatever pixel
 * size the generator happened to draw at. Each art pixel takes the median of the central part of its source cell, so
 * edges stay crisp (no blur). Returns the same shape as sampleGrid.
 */
export function sampleToHeight(png, height, margin = 2) {
  const W = png.width, H = png.height, at = (x, y) => (y * W + x) * 4;
  const green = (i) => { const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2]; return g > 120 && g > r * 1.45 && g > b * 1.45; };
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!green(at(x, y))) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const cell = (y1 - y0 + 1) / height;
  const w = Math.ceil((x1 - x0 + 1) / cell) + 2 * margin, h = height + 2 * margin, rgb = [];
  for (let gy = 0; gy < h; gy++) for (let gx = 0; gx < w; gx++) {
    const sx = x0 + (gx - margin) * cell, sy = y0 + (gy - margin) * cell, cs = [];
    for (let y = Math.floor(sy + cell * 0.2); y < sy + cell * 0.8; y++) for (let x = Math.floor(sx + cell * 0.2); x < sx + cell * 0.8; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) { cs.push([0, 255, 0]); continue; }
      const i = at(x, y); cs.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
    }
    if (!cs.length) cs.push([0, 255, 0]);
    // the most common kind wins: if most of the cell is background it stays background
    const bg = cs.filter(([r, g, b]) => g > 120 && g > r * 1.45 && g > b * 1.45).length;
    if (bg * 2 > cs.length) { rgb.push([0, 255, 0]); continue; }
    const fg = cs.filter(([r, g, b]) => !(g > 120 && g > r * 1.45 && g > b * 1.45));
    rgb.push([0, 1, 2].map((c) => fg.map((v) => v[c]).sort((p, q) => p - q)[fg.length >> 1]));
  }
  return { w, h, rgb, phase: [x0, y0], cell };
}

/**
 * colour consistency: shift a new generation's tones to match a reference (the character's master): per OKLab channel,
 * the new image's mean and spread are moved onto the reference's. Then palette mapping uses the palette the same way.
 */
export function matchTones(grid, refGrid) {
  const stats = (g) => { const ls = g.rgb.filter(Boolean).map(oklab), n = ls.length, m = [0, 1, 2].map((c) => ls.reduce((s, l) => s + l[c], 0) / n); return { m, sd: [0, 1, 2].map((c) => Math.sqrt(ls.reduce((s, l) => s + (l[c] - m[c]) ** 2, 0) / n) || 1e-6) }; };
  const a = stats(grid), b = stats(refGrid);
  grid.rgb = grid.rgb.map((c) => { if (!c) return null; const l = oklab(c); return fromOklab(l.map((v, k) => (v - a.m[k]) * Math.min(1.5, b.sd[k] / a.sd[k]) + b.m[k])); }); // mean and spread per channel (a too-saturated image is calmed down)
  return grid;
}

// ---------- 2 key ----------
/** marks the green background transparent (null) and removes green spill from the edge pixels; in place */
export function keyGreen(grid) {
  const { w, h } = grid;
  grid.rgb = grid.rgb.map(([r, g, b]) => (g > 120 && g > r * 1.45 && g > b * 1.45 ? null : [r, g, b]));
  // spill: pixels within 2 of the background (the outline and its neighbours) lose any green dominance, so no green
  // tint survives on the edges (and no palette slots are wasted on it)
  const near = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (grid.rgb[y * w + x]) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h) near[ny * w + nx] = 1; }
  }
  grid.rgb = grid.rgb.map((c, i) => {
    if (!c) return null;
    const [r, g, b] = c, m = Math.max(r, b);
    if (near[i] && g > m) return [r, m, b];
    return g > m + 12 ? [r, m + 12, b] : c;
  });
  return grid;
}

// ---------- 3 palette ----------
/** n representative colours of the opaque pixels (k-means in OKLab, deterministic), darkest first */
export function makePalette(grid, n = 48) {
  const labs = grid.rgb.filter(Boolean).map(oklab);
  let cent = [labs[0]];
  while (cent.length < n) { let best = 0, bd = -1; for (let t = 0; t < labs.length; t += 2) { const d = Math.min(...cent.map((c) => d2(labs[t], c))); if (d > bd) { bd = d; best = t; } } cent.push(labs[best]); }
  for (let it = 0; it < 25; it++) {
    const s = cent.map(() => [0, 0, 0, 0]);
    for (const l of labs) { let b = 0, bd = Infinity; cent.forEach((c, k) => { const d = d2(l, c); if (d < bd) { bd = d; b = k; } }); s[b][0] += l[0]; s[b][1] += l[1]; s[b][2] += l[2]; s[b][3]++; }
    cent = cent.map((c, k) => (s[k][3] ? [s[k][0] / s[k][3], s[k][1] / s[k][3], s[k][2] / s[k][3]] : c));
  }
  return cent.sort((a, b) => a[0] - b[0]).map(fromOklab);
}
/** each opaque pixel -> the nearest colour of `palette` ([[r,g,b]...]); returns indices (-1 = transparent) */
export function mapToPalette(grid, palette) {
  const pl = palette.map(oklab);
  return grid.rgb.map((c) => { if (!c) return -1; const l = oklab(c); let b = 0, bd = Infinity; pl.forEach((q, k) => { const d = d2(l, q); if (d < bd) { bd = d; b = k; } }); return b; });
}
/** the opaque bounds of an index image: [x0, y0, x1, y1] */
export function bounds(idx, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (idx[y * w + x] >= 0) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}
/** an index image -> PNG buffer (cropped to `crop` = [x0, y0, x1, y1] if given), scale s, optional background */
export function indexPNG(idx, w, h, palette, { crop = null, s = 1, bg = null } = {}) {
  const [x0, y0, x1, y1] = crop ?? [0, 0, w - 1, h - 1], cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const o = new PNG({ width: cw * s, height: ch * s });
  for (let y = 0; y < ch * s; y++) for (let x = 0; x < cw * s; x++) {
    const k = idx[(y0 + ((y / s) | 0)) * w + x0 + ((x / s) | 0)], c = k >= 0 ? palette[k] : bg, j = (y * cw * s + x) * 4;
    if (c) { o.data[j] = c[0]; o.data[j + 1] = c[1]; o.data[j + 2] = c[2]; o.data[j + 3] = 255; }
  }
  return PNG.sync.write(o);
}
