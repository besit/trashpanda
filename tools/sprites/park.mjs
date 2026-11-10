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
// The Trinity Bellwoods gates (Queen St W at Strachan Ave). v02 matched to Ivan's reference photo:
// smooth white stone, domed inner piers, gabled outer piers, inscribed lintels, arched iron carriage gate.
// ------------------------------------------------------------------
export const GATE_W = 112, GATE_H = 68;
// Layout (left → right), matched to Ivan's reference photo: outer pier | pedestrian gate under a stone
// lintel | inner pier | arched carriage gate | inner pier | pedestrian gate | outer pier.
const LAYOUT = { outer: 10, ped: 18, inner: 11, carriage: 30 };
function xs() {
  const L = LAYOUT; let x = 2;
  const o1 = x; x += L.outer; const p1 = x; x += L.ped; const i1 = x; x += L.inner; const c = x; x += L.carriage;
  const i2 = x; x += L.inner; const p2 = x; x += L.ped; const o2 = x;
  return { o1, p1, i1, c, i2, p2, o2 };
}
export function tbGates() {
  const W = GATE_W, H = GATE_H, g = H - 1;
  const img = new Img(W, H);
  const X = xs(), L = LAYOUT;
  // smooth pale stone: lit left face, cream body, shaded right edge
  const shaft = (x, y, w, h) => { img.rect(x, y, w, h, 'W'); img.vline(x + w - 1, y, y + h - 1, 'H'); img.vline(x + w - 2, y, y + h - 1, 'T'); };
  const band = (x, y, w, h) => { img.rect(x, y, w, h, 'W'); img.hline(x, x + w - 1, y + h - 1, 'H'); };
  // ---- outer piers: plinth, shaft, cornice, gabled pinnacle with ball finial
  for (const ox of [X.o1, X.o2]) {
    const w = L.outer, top = g - 40;
    band(ox - 1, g - 5, w + 2, 6);
    shaft(ox, top, w, 36);
    band(ox - 1, top - 2, w + 2, 2);
    const cx = ox + (w - 1) / 2;
    for (let i = 0; i < 11; i++) { const hw = Math.max(0, Math.round((11 - i) / 11 * (w / 2 + 0.5))); img.hline(Math.round(cx - hw), Math.round(cx + hw), top - 3 - i, i % 4 === 3 ? 'T' : 'W'); img.set(Math.round(cx + hw), top - 3 - i, 'H'); }
    img.rect(Math.round(cx) - 1, top - 16, 2, 2, 'W'); // ball finial
  }
  // plaque on the left outer pier
  img.rect(X.o1 + 2, g - 22, 6, 4, 'x'); img.rect(X.o1 + 3, g - 21, 4, 2, 'X');
  // ---- stone lintels with inscriptions over the pedestrian gates
  for (const px of [X.p1, X.p2]) {
    band(px, g - 32, L.ped, 6);
    img.hline(px, px + L.ped - 1, g - 32, 'T');
    for (let i = px + 2; i < px + L.ped - 2; i++) if ((i * 7) % 5 < 3) img.set(i, g - 29, 'h'); // faux lettering
  }
  // ---- inner piers: tall plain shaft, cornice, panelled lantern stage, dome + finial
  for (const ix of [X.i1, X.i2]) {
    const w = L.inner;
    band(ix - 1, g - 6, w + 2, 7);
    shaft(ix, g - 46, w, 41);
    band(ix - 2, g - 48, w + 4, 2); img.hline(ix - 2, ix + w + 1, g - 49, 'T');
    shaft(ix + 1, g - 55, w - 2, 6);
    img.rect(ix + 2, g - 53, 2, 2, 'H'); img.rect(ix + w - 4, g - 53, 2, 2, 'H'); // panels
    band(ix, g - 56, w, 1);
    const cx = ix + (w - 1) / 2;
    // bell-shaped dome: narrower than the lantern, swelling then tapering to the finial
    for (let i = 0; i < 8; i++) { const t = i / 8; const hw = (w / 2 - 1.5) * Math.sin(Math.PI * (0.35 + t * 0.65)) + 0.5; img.hline(Math.round(cx - hw), Math.round(cx + hw), g - 57 - i, 'W'); img.set(Math.round(cx + hw), g - 57 - i, 'H'); }
    img.vline(Math.round(cx), g - 66, g - 63, 'W'); img.rect(Math.round(cx) - 1, g - 65, 3, 1, 'W'); img.set(Math.round(cx), g - 67, 'W');
  }
  img.outline('K');
  // ---- ironwork (after outlining so the gaps between bars stay open)
  const iron = (x0, x1, top, bottom) => {
    img.hline(x0, x1, top, 'K'); img.hline(x0, x1, bottom - 2, 'K'); img.hline(x0, x1, Math.round(top + (bottom - top) * 0.45), 'K');
    for (let x = x0; x <= x1; x += 2) img.vline(x, top, bottom, 'K');
    // scrollwork rows: little rings between the rails
    for (const yy of [top + 3, Math.round(top + (bottom - top) * 0.45) + 3]) for (let x = x0 + 1; x < x1; x += 4) { img.set(x, yy, 'g'); img.set(x + 1, yy - 1, 'K'); img.set(x + 1, yy + 1, 'K'); }
  };
  for (const px of [X.p1, X.p2]) iron(px + 1, px + L.ped - 2, g - 25, g);
  const c0 = X.c, c1 = X.c + L.carriage - 1, ccx = (c0 + c1) / 2, crx = (c1 - c0) / 2;
  iron(c0 + 1, c1 - 1, g - 36, g);
  // segmental arch frame over the carriage gate
  for (let x = c0; x <= c1; x++) {
    const t = (x - ccx) / crx, yy = Math.round(g - 37 - 7 * Math.sqrt(Math.max(0, 1 - t * t)));
    img.set(x, yy, 'K'); img.set(x, yy + 1, 'k'); img.set(x, yy - 1, 'K');
    if (x % 2 === 0) img.vline(x, yy + 1, g - 37, 'K');
  }
  for (let x = c0 + 3; x < c1 - 2; x += 4) { const t = (x - ccx) / crx; const yy = Math.round(g - 40 - 4 * Math.sqrt(Math.max(0, 1 - t * t))); img.set(x, yy, 'g'); }
  img.vline(Math.round(ccx), g - 36, g, 'K'); img.vline(Math.round(ccx) + 1, g - 36, g, 'k'); // the two leaves meet
  img.rect(Math.round(ccx) - 3, g - 22, 2, 2, 'g'); img.rect(Math.round(ccx) + 2, g - 22, 2, 2, 'g'); // crests
  img.hline(0, W - 1, g, 'k');
  img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** Collider boxes (relative to the gate's bottom-centre) for the piers only, so you can ride through every opening. */
export function tbGateSolids() {
  const X = xs(), L = LAYOUT, half = GATE_W / 2;
  return [[X.o1 - 1, L.outer + 2], [X.i1 - 1, L.inner + 2], [X.i2 - 1, L.inner + 2], [X.o2 - 1, L.outer + 2]].map(([x, w]) => [x - half, -8, w, 8]);
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
export function baseballDiamond(home = 'south') {
  // drawn with home at the bottom, then rotated losslessly; the standing backstop is added after rotating
  const S = 96;
  let img = new Img(S, S);
  const hx = S / 2, hy = S - 12; // home plate
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - hx, y - hy);
    const ang = Math.atan2(hx - x, hy - y);
    if (d < 70 && Math.abs(ang) < Math.PI / 4 + 0.12) img.set(x, y, (x + y) % 5 ? 'X' : 'j');
  }
  const s = 30;
  img.poly([[hx, hy - 6], [hx + s - 6, hy - s], [hx, hy - 2 * s + 6], [hx - s + 6, hy - s]], 'l');
  for (let i = 0; i < 40; i++) { const x = hx + ((i * 37) % 40) - 20, y = hy - s + ((i * 23) % 30) - 15; if (img.get(x, y) === 'l') img.set(x, y, 'L'); }
  img.line(hx, hy, hx + 46, hy - 46, 'W'); img.line(hx, hy, hx - 46, hy - 46, 'W');
  img.circle(hx, hy - s, 3, 'X'); img.rect(hx - 1, hy - s, 2, 1, 'W');
  for (const [bx, by] of [[hx + s, hy - s], [hx, hy - 2 * s], [hx - s, hy - s]]) img.rect(bx - 1, by - 1, 3, 3, 'W');
  img.poly([[hx - 2, hy], [hx + 2, hy], [hx + 2, hy + 2], [hx, hy + 3], [hx - 2, hy + 2]], 'W');
  let hp = [hx, hy];
  if (home === 'east') { // rotate 90° CCW: bottom edge -> right edge
    const r = new Img(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) r.set(y, S - 1 - x, img.get(x, y));
    img = r; hp = [hy, S - 1 - hx];
  }
  // backstop: a standing chain-link arc behind home plate
  const [px, py] = hp, dir = home === 'east' ? [1, 0] : [0, 1];
  for (let a = -0.9; a <= 0.9; a += 0.02) {
    const ox = dir[0] ? 2 + Math.cos(a) * 4 : Math.sin(a) * 12, oy = dir[0] ? Math.sin(a) * 12 : 4 + Math.cos(a) * 5;
    const x = Math.round(px + ox), y = Math.round(py + oy);
    img.vline(x, y - 8, y, (x + y) % 2 ? 'g' : 'G');
  }
  return img;
}

// ------------------------------------------------------------------
// Classic Toronto park picnic table: green slats, two attached benches, A-frame legs.
// ------------------------------------------------------------------
export function picnicTable() {
  // hand-painted: at this size the SDF legs vanish. Back bench peeks over the slatted top, front bench below.
  const img = new Img(28, 19);
  img.grid(0, 0, `
...KKKKKKKKKKKKKKKKKKKKKK...
...KllllllllllllllllllllK...
...KEEEEEEEEEEEEEEEEEEEEK...
..KKKKKKKKKKKKKKKKKKKKKKKK..
..KLLLLLLLLLLLLLLLLLLLLLLK..
..KllllllllllllllllllllllK..
..KEEEEEEEEEEEEEEEEEEEEEEK..
..KLLLLLLLLLLLLLLLLLLLLLLK..
..KllllllllllllllllllllllK..
..KEEEEEEEEEEEEEEEEEEEEEEK..
..KeeeeeeeeeeeeeeeeeeeeeeK..
..KKKKKKKKKKKKKKKKKKKKKKKK..
....KeK..............KeK....
KKKKKKKKKKKKKKKKKKKKKKKKKKKK
KLLLLLLLLLLLLLLLLLLLLLLLLLLK
KEEEEEEEEEEEEEEEEEEEEEEEEEEK
KKKKKKKKKKKKKKKKKKKKKKKKKKKK
..KeK..KeK..........KeK..KeK
..KKK..KKK..........KKK..KKK`);
  img.pivot = { x: 0.5, y: 0.95 };
  return img;
}

// ------------------------------------------------------------------
// Graffiti sheet: stand-alone pieces laid over existing walls at map-build time, so any building can
// carry them (more variety, and no graffiti pixels baked into building images).
// ------------------------------------------------------------------
export function graffitiPieces() {
  const out = [];
  const r = rng(808);
  const cols = ['y', 'O', 'q', 'L', 'C', 'Z', 'm', 'F', 'W', 'P'];
  // bubble-letter throw-ups of 2-4 letters
  for (let k = 0; k < 5; k++) {
    const n = r.int(2, 4), lw = r.int(5, 7), h = r.int(8, 11), w = n * (lw + 1) + 3;
    const img = new Img(w, h + 3);
    const fill = r.pick(cols), hi = 'W';
    let x = 1;
    for (let i = 0; i < n; i++) {
      img.rect(x, 1 + (i % 2), lw, h - 1, fill);
      img.hline(x + 1, x + lw - 2, 2 + (i % 2), hi);
      if (r.chance(0.6)) img.rect(x + 2, 3 + r.int(1, 3), lw - 4, 2, null); // letter counter
      if (r.chance(0.5)) img.vline(x + r.int(1, lw - 2), h + (i % 2), h + 1 + (i % 2) + r.int(0, 1), fill); // drip
      x += lw + 1;
    }
    img.outline('K');
    out.push(img);
  }
  // thin tags (scribbles)
  for (let k = 0; k < 4; k++) {
    const w = r.int(12, 20), img = new Img(w, 8), c = r.pick(['K', 'V', 'R', 'u', 'W']);
    let y = r.int(2, 5);
    for (let x = 0; x < w; x++) { img.set(x, y, c); if (r.chance(0.35)) y = Math.max(1, Math.min(6, y + r.pick([-2, -1, 1, 2]))); if (r.chance(0.15)) img.vline(x, y - 2, y, c); }
    img.hline(1, w - 2, 7, c);
    out.push(img);
  }
  // a raccoon stencil (of course) and a smiling face character
  { const img = new Img(11, 9); img.grid(0, 0, `
.K.....K...
.KK...KK...
.KKKKKKK...
KK.KKK.KK..
KKKKKKKKK..
.KK.K.KK..K
..KKKKK..KK
...KKK..KK.
....K..K...`); out.push(img); }
  { const img = new Img(11, 11); img.circle(5, 5, 5, 'Y'); img.rect(3, 3, 1, 2, 'K'); img.rect(7, 3, 1, 2, 'K'); img.hline(3, 7, 7, 'K'); img.set(2, 6, 'K'); img.set(8, 6, 'K'); img.outline('K'); out.push(img); }
  // hearts + stars
  { const img = new Img(9, 8); img.grid(0, 0, `
.qq.qq...
qqqqqqq..
qqqqqqq..
.qqqqq...
..qqq....
...q.....`); img.outline('K'); out.push(img); }
  out.forEach((im) => { im.pivot = { x: 0, y: 1 }; });
  return out;
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
  const frames = [tbGates(), picnicTable(), bin('green'), bin('blue'), bin('grey'), parkLamp(), ...whiteSquirrel(), ...graffitiPieces()];
  const H = Math.max(...frames.map((f) => f.h)) + 4;
  return { frames: frames.map((f) => { const o = new Img(f.w + 6, H); o.blit(f, 3, H - f.h - 2); return o; }), cols: frames.length };
}
export function parkDecalsPreview() {
  const frames = [dogBowl(224, 144), tennisCourts(), baseballDiamond('east')];
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
