// Trinity Bellwoods + Queen West landmarks and park pieces.
// Ground decals (dog bowl, courts, diamond) are drawn top-down; standing things (gates, bins) in 3/4.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { sd, scene, render, orthoCam } from '../lib/sdf.mjs';

const ELEV = (32 * Math.PI) / 180;
const cam = () => orthoCam([0, -Math.cos(ELEV), -Math.sin(ELEV)]);
function draw(objs, w, h, ox, oy, opts = {}) {
  const img = render(scene(objs), { w, h, cx: ox, cy: oy, cam: cam(), ambient: 0.16, ...opts });
  img.pivot = { x: ox / w, y: oy / h };
  return img;
}

// ------------------------------------------------------------------
// The Trinity Bellwoods gates (Queen St W at Strachan Ave): pale stone piers with
// pinnacle caps, black iron carriage gate with an arched overthrow + lantern,
// pedestrian gates either side. Front elevation with 3/4 tops (same cheat as facades).
// ------------------------------------------------------------------
export const GATE_W = 112, GATE_H = 60;
export function tbGates() {
  const W = GATE_W, H = GATE_H, g = H - 1; // ground line
  const img = new Img(W, H);
  const stone = (x, y, w, h) => {
    img.rect(x, y, w, h, 'H');
    img.rect(x, y, 1, h, 'W'); // lit left edge
    img.rect(x + w - 2, y, 2, h, 'h'); // shade right
    for (let yy = y + 3; yy < y + h; yy += 4) img.hline(x + 1, x + w - 3, yy, 't'); // ashlar courses
    for (let yy = y + 3, k = 0; yy < y + h; yy += 4, k++) img.vline(x + (k % 2 ? 3 : Math.floor(w / 2)), yy - 3, yy - 1, 't');
  };
  const cap = (x, w, top, peak) => { // stone cap + pyramid pinnacle
    img.rect(x - 1, top, w + 2, 2, 'W'); img.hline(x - 1, x + w, top + 2, 'h');
    const cx = x + (w - 1) / 2;
    for (let i = 0; i < peak; i++) { const half = Math.max(0, Math.round(((peak - i) / peak) * (w / 2 - 1))); img.hline(Math.round(cx - half), Math.round(cx + half), top - 1 - i, i % 3 === 0 ? 'T' : 'W'); img.set(Math.round(cx + half), top - 1 - i, 'h'); }
    img.set(Math.round(cx), top - peak - 1, 'H'); img.set(Math.round(cx), top - peak - 2, 'W'); // finial
  };
  const later = [];
  const iron = (x0, x1, top, bottom, spear = true) => later.push(() => ironNow(x0, x1, top, bottom, spear));
  const ironNow = (x0, x1, top, bottom, spear = true) => {
    img.hline(x0, x1, top + 2, 'K'); img.hline(x0, x1, bottom - 3, 'K'); img.hline(x0, x1, Math.round((top + bottom) / 2), 'K');
    for (let x = x0; x <= x1; x += 2) { img.vline(x, top, bottom, 'K'); if (spear) img.set(x, top - 1, 'g'); }
    for (let x = x0 + 1; x <= x1; x += 4) img.set(x, Math.round((top + bottom) / 2) - 1, 'k'); // scroll dots
  };
  // low walls + railings at the far ends
  for (const [x0, x1] of [[0, 9], [W - 10, W - 1]]) { img.rect(x0, g - 6, x1 - x0 + 1, 7, 'H'); img.hline(x0, x1, g - 6, 'W'); iron(x0, x1, g - 16, g - 7); }
  // outer piers
  const outer = [[10, 8], [W - 18, 8]];
  for (const [x, w] of outer) { stone(x, g - 26, w, 27); cap(x, w, g - 28, 5); }
  // pedestrian gates
  iron(18, 33, g - 20, g);
  iron(W - 34, W - 19, g - 20, g);
  for (const [x0, x1] of [[18, 33], [W - 34, W - 19]]) later.push(() => { // small arched overthrow
    const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2;
    for (let x = x0; x <= x1; x++) { const t = (x - cx) / rx; img.set(x, Math.round(g - 22 - 4 * Math.sqrt(Math.max(0, 1 - t * t))), 'K'); }
  });
  // inner piers: tall, buttressed, carved panel, pinnacles
  const inner = [[34, 12], [W - 46, 12]];
  for (const [x, w] of inner) {
    img.rect(x - 1, g - 10, w + 2, 11, 'h'); img.hline(x - 1, x + w, g - 10, 'W'); // plinth
    stone(x, g - 40, w, 31);
    img.rect(x + 3, g - 34, w - 6, 9, 't'); img.rect(x + 4, g - 33, w - 8, 7, 'T'); img.vline(x + Math.floor(w / 2), g - 33, g - 27, 't'); // carved panel
    for (let i = 0; i < 3; i++) img.set(x + 3 + i * 3, g - 22, 'h');
    cap(x, w, g - 42, 9);
  }
  // carriage gate (double leaves) + arched overthrow with lantern
  const c0 = 46, c1 = W - 47;
  iron(c0, c1, g - 26, g);
  later.push(() => {
  img.vline((c0 + c1) >> 1, g - 26, g, 'K'); img.vline(((c0 + c1) >> 1) + 1, g - 26, g, 'k');
  const ccx = (c0 + c1) / 2, crx = (c1 - c0) / 2 + 0.5;
  for (let x = c0; x <= c1; x++) { const t = (x - ccx) / crx; const yy = Math.round(g - 28 - 9 * Math.sqrt(Math.max(0, 1 - t * t))); img.set(x, yy, 'K'); img.set(x, yy + 1, 'k'); if (x % 3 === 0) img.vline(x, yy + 1, g - 28, 'K'); }
  img.hline(c0, c1, g - 28, 'K');
  // lantern
  const lx = Math.round(ccx);
  img.vline(lx, g - 41, g - 38, 'K'); img.rect(lx - 2, g - 46, 5, 5, 'K'); img.rect(lx - 1, g - 45, 3, 3, 'Y'); img.set(lx, g - 47, 'K');
  });
  img.outline('K');
  for (const f of later) f();
  // ground shadow
  img.hline(0, W - 1, g, 'k');
  img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** Collider boxes (relative to the gate's bottom-centre) for the piers + walls only, so you can ride through. */
export function tbGateSolids() {
  const W = GATE_W, half = W / 2;
  return [[-half, -8, 18, 8], [half - 18, -8, 18, 8], [34 - half - 1, -10, 14, 10], [W - 46 - half - 1, -10, 14, 10]];
}

// ------------------------------------------------------------------
// The Dog Bowl: the sunken hollow left by buried Garrison Creek. Top-down decal.
// ------------------------------------------------------------------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function dogBowl(w = 176, h = 112) {
  const img = new Img(w, h);
  const r = rng(77);
  const cx = w / 2, cy = h / 2, rx = w / 2 - 1, ry = h / 2 - 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = Math.hypot(dx, dy);
    if (d > 1) continue;
    const bay = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
    let c;
    if (d > 0.93) c = bay < 0.55 ? 'L' : 'l'; // sunlit lip
    else if (d > 0.45) {
      // inner slope: light from upper-left -> NW slope (facing SE) in shade, SE slope lit; deeper = darker
      const lit = (dx * 0.7 + dy * 0.7) / Math.max(0.001, d); // -1 (NW) .. 1 (SE)
      const depth = (0.93 - d) / 0.48; // 0 at lip .. 1 at floor
      const v = 0.55 + lit * 0.38 - depth * 0.12 + 0.08; // 0..1 brightness
      const ramp = ['e', 'E', 'l', 'L'];
      const f = Math.max(0, Math.min(2.999, v * 3));
      c = ramp[Math.floor(f) + (bay < f - Math.floor(f) ? 1 : 0)];
    } else c = 'E';
    img.set(x, y, c);
  }
  for (let i = 0; i < (w * h) / 26; i++) { const x = r.int(0, w - 1), y = r.int(0, h - 1); if (img.get(x, y) === 'E') img.set(x, y, r.chance(0.6) ? 'l' : 'e'); }
  // worn dog paths down the slope
  for (const [a, len] of [[-2.3, 0.55], [0.4, 0.5], [1.9, 0.6], [3.4, 0.45]]) {
    for (let t = 0.98; t > 1 - len; t -= 0.012) {
      const x = cx + Math.cos(a + (1 - t) * 0.6) * rx * t, y = cy + Math.sin(a + (1 - t) * 0.6) * ry * t;
      img.set(x, y, 'x'); img.set(x + 1, y, t > 0.9 ? 'X' : 'x');
    }
  }
  // a tennis ball and a frisbee
  img.set(cx - 14, cy + 6, 'L'); img.set(cx - 13, cy + 6, 'Y');
  img.ellipse(cx + 22, cy - 9, 2, 1, 'q');
  return img;
}

// ------------------------------------------------------------------
// Tennis courts (two, side by side) with chain-link fence; the south fence is drawn
// standing up (3/4) so the courts read as fenced.
// ------------------------------------------------------------------
export function tennisCourts() {
  const cw = 76, ch = 36, gap = 6, m = 5;
  const w = cw + m * 2, h = ch * 2 + gap + m * 2 + 10;
  const img = new Img(w, h);
  img.rect(0, 0, w, h - 10, 'f');
  for (let k = 0; k < 2; k++) {
    const x0 = m, y0 = m + k * (ch + gap);
    img.rect(x0, y0, cw, ch, 'E');
    img.rect(x0 + 6, y0 + 3, cw - 12, ch - 6, 'l');
    // lines
    const L = (x1, y1, x2, y2) => img.line(x1, y1, x2, y2, 'W');
    img.rect(x0 + 6, y0 + 3, cw - 12, 1, 'W'); img.rect(x0 + 6, y0 + ch - 4, cw - 12, 1, 'W');
    img.rect(x0 + 6, y0 + 3, 1, ch - 6, 'W'); img.rect(x0 + cw - 7, y0 + 3, 1, ch - 6, 'W');
    L(x0 + 6, y0 + 7, x0 + cw - 7, y0 + 7); L(x0 + 6, y0 + ch - 8, x0 + cw - 7, y0 + ch - 8);
    L(x0 + 22, y0 + 7, x0 + 22, y0 + ch - 8); L(x0 + cw - 23, y0 + 7, x0 + cw - 23, y0 + ch - 8);
    L(x0 + 22, y0 + ch / 2, x0 + cw - 23, y0 + ch / 2);
    // net
    img.rect(x0 + cw / 2, y0 + 1, 1, ch - 2, 'H'); img.set(x0 + cw / 2, y0 + 1, 'K'); img.set(x0 + cw / 2, y0 + ch - 2, 'K');
  }
  // fence: posts along the top/sides; chain link standing along the south edge
  const fy = h - 11;
  img.rect(0, 0, w, 1, 'g'); img.rect(0, 0, 1, fy, 'g'); img.rect(w - 1, 0, 1, fy, 'g');
  for (let x = 0; x < w; x += 9) { img.set(x, 0, 'K'); }
  for (let y = 0; y < fy; y += 9) { img.set(0, y, 'K'); img.set(w - 1, y, 'K'); }
  img.rect(0, fy, w, 11, null);
  img.dither(0, fy, w, 10, 'g', 'checker');
  img.hline(0, w - 1, fy, 'K'); img.hline(0, w - 1, fy + 10, 'k');
  for (let x = 0; x < w; x += 9) img.vline(x, fy, fy + 10, 'K');
  return img;
}

// ------------------------------------------------------------------
// Baseball diamond (top-down): skinned infield, bases, mound, backstop.
// ------------------------------------------------------------------
export function baseballDiamond() {
  const S = 96;
  const img = new Img(S, S);
  const hx = S / 2, hy = S - 12; // home plate
  // dirt arc
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - hx, y - hy);
    const ang = Math.atan2(hx - x, hy - y);
    if (d < 70 && Math.abs(ang) < Math.PI / 4 + 0.12) img.set(x, y, (x + y) % 5 ? 'X' : 'j');
  }
  // grass infield square (rotated 45°)
  const s = 30;
  img.poly([[hx, hy - 6], [hx + s - 6, hy - s], [hx, hy - 2 * s + 6], [hx - s + 6, hy - s]], 'l');
  for (let i = 0; i < 40; i++) { const x = hx + ((i * 37) % 40) - 20, y = hy - s + ((i * 23) % 30) - 15; if (img.get(x, y) === 'l') img.set(x, y, 'L'); }
  // foul lines
  img.line(hx, hy, hx + 46, hy - 46, 'W'); img.line(hx, hy, hx - 46, hy - 46, 'W');
  // mound + bases
  img.circle(hx, hy - s, 3, 'X'); img.rect(hx - 1, hy - s, 2, 1, 'W');
  for (const [bx, by] of [[hx + s, hy - s], [hx, hy - 2 * s], [hx - s, hy - s]]) img.rect(bx - 1, by - 1, 3, 3, 'W');
  img.poly([[hx - 2, hy], [hx + 2, hy], [hx + 2, hy + 2], [hx, hy + 3], [hx - 2, hy + 2]], 'W');
  // backstop (standing chain-link arc behind home)
  for (let a = -0.9; a <= 0.9; a += 0.02) {
    const x = hx + Math.sin(a) * 12, y = hy + 4 + Math.cos(a) * 5;
    img.vline(Math.round(x), Math.round(y) - 8, Math.round(y), (Math.round(x) + Math.round(y)) % 2 ? 'g' : 'G');
  }
  for (let a = -0.9; a <= 0.95; a += 0.45) { const x = hx + Math.sin(a) * 12, y = hy + 4 + Math.cos(a) * 5; img.vline(Math.round(x), Math.round(y) - 9, Math.round(y), 'K'); }
  return img;
}

// ------------------------------------------------------------------
// Toronto curbside bins: the raccoon-resistant green bin (organics), blue (recycling), grey (garbage).
// ------------------------------------------------------------------
export function bin(kind = 'green') {
  const ramp = { green: ['e', 'E', 'l', 'L'], blue: ['u', 'U', 'c', 'C'], grey: ['k', 'g', 'G', 'h'] }[kind];
  const lid = { green: ['e', 'E', 'E', 'l'], blue: ['u', 'U', 'U', 'c'], grey: ['K', 'k', 'g', 'G'] }[kind];
  const objs = [
    { d: sd.box([0, 0, 4.2], [2.9, 2.6, 4.2], 0.5), m: { ramp } },
    { d: sd.box([0, 0, 8.9], [3.2, 2.9, 0.5], 0.4), m: { ramp: lid } },
    { d: sd.box([0, 2.9, 7.4], [1.0, 0.4, 0.8], 0.2), m: { ramp: ['K', 'k', 'g', 'G'] } }, // the famous locking latch
    { d: sd.torusY([-2.4, 2.8, 0.8], 0.8, 0.45), m: { ramp: ['K', 'K', 'k'] } },
    { d: sd.torusY([2.4, 2.8, 0.8], 0.8, 0.45), m: { ramp: ['K', 'K', 'k'] } },
  ];
  return draw(objs, 12, 18, 6, 15);
}

/** Old-style park lamp (Trinity Bellwoods paths). */
export function parkLamp() {
  const objs = [
    { d: sd.capsule([0, 0, 0], [0, 0, 18], 0.75), m: { ramp: ['K', 'k', 'g', 'G'] } },
    { d: sd.cylY([0, 0, 0.8], 1.5, 1.6), m: { ramp: ['K', 'k', 'g'] } },
    { d: sd.ellipsoid([0, 0, 20], [1.9, 1.9, 2.2]), m: { ramp: ['o', 'y', 'Y', 'W'] } },
    { d: sd.cone([0, 0, 21.6], 2.4, 1.6), m: { ramp: ['K', 'k', 'g'] } },
  ];
  return draw(objs, 10, 30, 5, 27);
}

// ------------------------------------------------------------------
// The white squirrel of Trinity Bellwoods (side-view mini sprite, faces right).
// ------------------------------------------------------------------
const SQ = [
  // run 0
  `
.........HH.
.......WHWWH
..HW..WWWRWm
.HWWHWWWWWW.
.HWWWWWWWW..
..H.HWWWH...
....m...m...
`,
  // run 1
  `
............
..HW.....HH.
.HWWH..WHWWH
.HWWWWWWWRWm
..HWWWWWWWW.
....mHWHm...
............
`,
  // sit (tail up)
  `
.HH.....HH..
HWWH...HWWH.
HWWH...WWRWm
.HWH..WWWWW.
..HWWWWWWH..
...HWWWWH...
....m..m....
`,
];
export function whiteSquirrel() {
  return SQ.map((s) => { const i = new Img(12, 8); i.grid(0, 0, s); i.outline('K'); i.pivot = { x: 0.5, y: 1 }; return i; });
}

export function parkPreview() {
  const frames = [tbGates(), bin('green'), bin('blue'), bin('grey'), parkLamp(), ...whiteSquirrel()];
  const H = Math.max(...frames.map((f) => f.h)) + 4;
  return { frames: frames.map((f) => { const o = new Img(f.w + 6, H); o.blit(f, 3, H - f.h - 2); return o; }), cols: frames.length };
}
export function parkDecalsPreview() {
  const frames = [dogBowl(), tennisCourts(), baseballDiamond()];
  const H = Math.max(...frames.map((f) => f.h)) + 4;
  return { frames: frames.map((f) => { const o = new Img(f.w + 6, H); o.rect(0, 0, f.w + 6, H, 'E'); o.blit(f, 3, 2); return o; }), cols: 3 };
}

// ------------------------------------------------------------------
// Park paths: smooth paved walks drawn as one decal over the lawn (Catmull-Rom through the points).
// ------------------------------------------------------------------
function catmull(pts, step = 2) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
export function parkPaths({ w, h, paths, ox = 0, oy = 0, width = 6 }) {
  const img = new Img(w, h);
  const curves = paths.map((p) => catmull(p.map(([x, y]) => [x - ox, y - oy])));
  const stamp = (c, rad) => { for (const curve of curves) for (const [x, y] of curve) img.circle(Math.round(x), Math.round(y), rad, c); };
  stamp('E', width + 1.5); // worn grass edge
  stamp('G', width);       // kerb shadow
  stamp('S', width - 1);
  const r = rng(5);
  for (let i = 0; i < img.px.length; i++) if (img.px[i] === 'S' && r() < 0.12) img.px[i] = r() < 0.5 ? 's' : 'h';
  // the E edge is a soft blend: thin it out with a dither so it doesn't read as a stripe
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (img.get(x, y) === 'E' && (x + y) % 2) img.set(x, y, null);
  return img;
}
