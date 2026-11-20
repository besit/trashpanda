// M4.9: a pixel-art critic for our palette-key images (raster.mjs Img), so an agent fixes exact pixels instead of
// guessing from a preview, plus two views a painter uses: VALUES (the picture in greys, to judge light and shadow
// without colour) and ASCII (palette keys with rulers, for exact pixel edits).
//
// The rules (orphan, jaggy, pillow, near-duplicate) are adapted from pxl's src/core/lint.ts (MIT, Copyright (c) 2026
// crsolver, Copyright (c) 2026 uilianks); the silhouette check (nubs, strips, holes) from codixel's edgeCheck (MIT,
// Copyright (c) 2026 mankidev). See tools/lib/THIRD_PARTY.md.
import { PNG } from 'pngjs';
import { PALETTE, hexToRgb } from '../palette.mjs';

const RGB = Object.fromEntries(Object.entries(PALETTE).map(([k, v]) => [k, hexToRgb(v)]));
const lumOf = (c) => { const v = RGB[c]; return v ? 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] : 0; };
const N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m, l = (M + m) / 2;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1)), h = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

/**
 * lint an Img. Returns [{ rule, message, at: [[x, y], ...] }]:
 *   orphan          a pixel with no same-colour neighbour, inside a shape, in low contrast: noise, not detail
 *   jaggy           an L corner doubling a 1-px line (a line should step corner to corner)
 *   pillow          brightness rising toward the middle on every side (light from nowhere) in a colour family
 *   near-duplicate  colour pairs so close they read as one
 *   nub / strip / hole   silhouette defects: a pixel sticking out, a 1-px wide strip, a 1-px hole
 */
export function lint(img) {
  const { w, h } = img, out = [];
  const get = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? null : img.px[y * w + x]);

  const orphans = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = get(x, y); if (c === null) continue;
    if (N8.some(([dx, dy]) => get(x + dx, y + dy) === c)) continue;
    if ([get(x - 1, y), get(x + 1, y), get(x, y - 1), get(x, y + 1)].some((n) => n === null)) continue;
    const around = N8.reduce((a, [dx, dy]) => a + lumOf(get(x + dx, y + dy)), 0) / 8;
    if (Math.abs(lumOf(c) - around) < 48) orphans.push([x, y]);
  }
  if (orphans.length) out.push({ rule: 'orphan', at: orphans, message: `${orphans.length} stray pixel(s) with no same-colour neighbour and little contrast: noise rather than detail. Merge into a neighbour colour or group into a shape.` });

  const comp = new Int32Array(w * h).fill(-1), size = [], thin = [];
  for (let y0 = 0; y0 < h; y0++) for (let x0 = 0; x0 < w; x0++) {
    const c = get(x0, y0); if (c === null || comp[y0 * w + x0] >= 0) continue;
    const id = size.length, st = [y0 * w + x0]; comp[st[0]] = id; let n = 0, th = true;
    while (st.length) {
      const i = st.pop(), x = i % w, y = (i / w) | 0; n++;
      if (get(x + 1, y) === c && get(x, y + 1) === c && get(x + 1, y + 1) === c) th = false;
      for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy; if (get(nx, ny) !== c || comp[ny * w + nx] >= 0) continue; comp[ny * w + nx] = id; st.push(ny * w + nx); }
    }
    size.push(n); thin.push(th);
  }
  const jag = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = get(x, y); if (c === null) continue;
    const same = (dx, dy) => get(x + dx, y + dy) === c, id = comp[y * w + x];
    if (N8.filter(([dx, dy]) => same(dx, dy)).length !== 2 || size[id] < 6 || !thin[id]) continue;
    for (const [hx, vy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
      if (same(hx, 0) && same(0, vy) && !same(hx, vy) && !same(2 * hx, 0) && !same(0, 2 * vy)) { jag.push([x, y]); break; }
  }
  if (jag.length) out.push({ rule: 'jaggy', at: jag, message: `${jag.length} doubled corner(s) in 1-px lines. Remove the corner pixel so the line steps cleanly (Canvas.line1 draws pixel-perfect lines).` });

  const family = (c) => { const [hu, sa, li] = rgbToHsl(RGB[c] || [0, 0, 0]); return sa < 0.15 || li < 0.1 || li > 0.88 ? -1 : Math.round(hu / 40) % 9; };
  const fam = new Int8Array(w * h).fill(-2);
  for (let i = 0; i < fam.length; i++) if (img.px[i] !== null) fam[i] = family(img.px[i]);
  const famAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -2 : fam[y * w + x]);
  const pillows = [];
  for (const f of new Set(fam)) {
    if (f < 0) continue;
    const dist = new Int32Array(w * h).fill(-1), q = [], inside = (x, y) => { const g = famAt(x, y); return g === f || g === -1; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (inside(x, y) && N8.some(([dx, dy]) => !inside(x + dx, y + dy))) { dist[y * w + x] = 0; q.push(y * w + x); }
    for (let k = 0; k < q.length; k++) { const i = q[k], x = i % w, y = (i / w) | 0; for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy, j = ny * w + nx; if (!inside(nx, ny) || dist[j] >= 0) continue; dist[j] = dist[i] + 1; q.push(j); } }
    let n = 0, sd = 0, sl = 0, sdd = 0, sll = 0, sdl = 0, cx = 0, cy = 0, lx = 0, ly = 0, lw = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = dist[y * w + x]; if (d < 1 || fam[y * w + x] !== f) continue;
      const l = lumOf(get(x, y)); n++; sd += d; sl += l; sdd += d * d; sll += l * l; sdl += d * l; cx += x; cy += y; lx += x * l; ly += y * l; lw += l;
    }
    if (n < 40 || !lw) continue;
    const corr = (n * sdl - sd * sl) / Math.sqrt(Math.max(1e-9, (n * sdd - sd * sd) * (n * sll - sl * sl)));
    const offset = Math.hypot(lx / lw - cx / n, ly / lw - cy / n) / Math.sqrt(n);
    if (corr > 0.55 && offset < 0.04) pillows.push(corr);
  }
  if (pillows.length) out.push({ rule: 'pillow', at: [], message: `pillow shading: brightness rises toward the middle on every side (correlation ${Math.max(...pillows).toFixed(2)}). Light from one direction; shade the far side.` });

  const counts = new Map(); for (const c of img.px) if (c !== null) counts.set(c, (counts.get(c) ?? 0) + 1);
  const cols = [...counts.keys()], pairs = [];
  for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
    const a = RGB[cols[i]], b = RGB[cols[j]]; if (!a || !b) continue;
    const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    if (d > 0 && d < 10) pairs.push(`${cols[i]}~${cols[j]}`);
  }
  if (pairs.length) out.push({ rule: 'near-duplicate', at: [], message: `${pairs.length} colour pair(s) so close they read as one (${pairs.slice(0, 6).join(' ')}): merge them or push them apart.` });

  const op = (x, y) => (get(x, y) !== null ? 1 : 0), nubs = [], strips = [], holes = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const l = op(x - 1, y), r = op(x + 1, y), u = op(x, y - 1), d = op(x, y + 1), n = l + r + u + d;
    if (op(x, y)) { if (n <= 1) nubs.push([x, y]); else if (n === 2 && ((l && r) || (u && d))) strips.push([x, y]); }
    else if (x > 0 && y > 0 && x < w - 1 && y < h - 1 && n >= 3) holes.push([x, y]);
  }
  if (nubs.length) out.push({ rule: 'nub', at: nubs, message: `${nubs.length} silhouette pixel(s) sticking out (one or no neighbour). Fine on whisker and hair tips; elsewhere they read as dirt.` });
  if (strips.length) out.push({ rule: 'strip', at: strips, message: `${strips.length} pixel(s) in 1-px wide strips of the silhouette. Fine for whiskers, hoses and hair; elsewhere thicken or remove.` });
  if (holes.length) out.push({ rule: 'hole', at: holes, message: `${holes.length} 1-px hole(s) in the silhouette. Fill them.` });
  return out;
}

/** colours by share of the opaque pixels: [{ c, n, share }] */
export function colorUsage(img) {
  const m = new Map(); let t = 0;
  for (const c of img.px) if (c !== null) { m.set(c, (m.get(c) ?? 0) + 1); t++; }
  return [...m].sort((a, b) => b[1] - a[1]).map(([c, n]) => ({ c, n, share: n / t }));
}

/** the picture as text: palette keys ('.' transparent) with x / y rulers, for exact pixel edits */
export function ascii(img, x0 = 0, y0 = 0, w = img.w, h = img.h) {
  const xs = []; for (let x = x0; x < x0 + w; x++) xs.push(x);
  const head = (d) => '     ' + xs.map((x) => (d === 0 ? (x % 10 === 0 ? String((x / 10) % 10) : ' ') : String(x % 10))).join('');
  const rows = [head(0), head(1)];
  for (let y = y0; y < y0 + h; y++) rows.push(String(y).padStart(4) + ' ' + xs.map((x) => img.get(x, y) ?? '.').join(''));
  return rows.join('\n');
}

/** a PNG of the picture in greys (luminance), scale s, on mid grey: how a painter checks light and shadow */
export function valuesPNG(img, s = 1, bg = 128) {
  const W = img.w * s, H = img.h * s, p = new PNG({ width: W, height: H });
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = img.px[((y / s) | 0) * img.w + ((x / s) | 0)], i = (y * W + x) * 4, v = c === null ? bg : Math.round(lumOf(c));
    p.data[i] = p.data[i + 1] = p.data[i + 2] = v; p.data[i + 3] = 255;
  }
  return PNG.sync.write(p);
}

const MARK = { orphan: [255, 40, 40], jaggy: [255, 220, 0], nub: [255, 0, 255], strip: [0, 200, 255], hole: [0, 255, 120] };
/** a PNG of the picture at scale s with every located finding boxed in its rule's colour */
export function findingsPNG(img, findings, s = 4, bg = [91, 143, 176]) {
  const W = img.w * s, H = img.h * s, p = new PNG({ width: W, height: H });
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = img.px[((y / s) | 0) * img.w + ((x / s) | 0)], i = (y * W + x) * 4, v = c === null ? bg : RGB[c] || [255, 0, 255];
    p.data[i] = v[0]; p.data[i + 1] = v[1]; p.data[i + 2] = v[2]; p.data[i + 3] = 255;
  }
  for (const f of findings) {
    const col = MARK[f.rule]; if (!col) continue;
    for (const [fx, fy] of f.at) for (let k = -1; k <= s; k++) for (const [x, y] of [[fx * s + k, fy * s - 1], [fx * s + k, fy * s + s], [fx * s - 1, fy * s + k], [fx * s + s, fy * s + k]]) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = (y * W + x) * 4; p.data[i] = col[0]; p.data[i + 1] = col[1]; p.data[i + 2] = col[2];
    }
  }
  return PNG.sync.write(p);
}
