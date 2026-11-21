// M4.10 raccoon style study, style "free", PASS 2: the critic's SYNTHESIS on my shared-shadow palette.
//   - ref04 / naive shape discipline: every light and shadow is a DESIGNED shape (a polygon, or one analytic band rule per
//     form for the cylinders: the tail, the arm, the snout, the pump), quantized to 5 levels, never a thresholded field;
//   - one strong outer line (2 px on the shadow side at the poster size), almost no lines inside (only the pump and the
//     gripping paw, the man-made object and the hand over it); everything else is separated by light and cast shadows;
//   - ONE shared shadow family across materials: every material's levels 0 and 1 come from the same indigo-violet set,
//     only the lit levels carry local colour; a warm lamp-amber key from the upper left, a subtle cool rim INSIDE the
//     outline on the far contour (night mood, not a halo);
//   - ref03-quality eyes (an amber iris ringed in brown, light glowing low through it, a big pupil, a sharp catchlight,
//     a heavy sly lid, a wet rim) with eyeshine;
//   - detailed's material treatment on the pump only: glossy yellow plastic (reflected light, specular streak), chrome as
//     an environment profile, ribbed rubber grips, a gauge with a bezel, ticks, a red zone and a glass glare;
//   - fur only as 2 px clumps at marking edges and terminators; flat calm planes between.
// Hand-drawn again (the drawing is the ceiling): the snout as one rounded cylinder, the near arm and a paw that GRIPS the
// barrel (four fingers stacked along the barrel, curling over its top edge, a thumb under it, the barrel showing above
// and below), the tail as one cylinder with a continuous underside shadow.
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../../../lib/draw2d.mjs';
import '../../../lib/light2d.mjs';
import { registerColors } from '../../../lib/raster.mjs';

export const GW = 232, GH = 208;
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== PALETTE ==============================
registerColors({
  // the shared night shadows: every material ends in these
  'ア': '#1c1226', 'イ': '#2f2040', 'ウ': '#47355a', 'エ': '#655078',
  // the coat (lamp-lit warm grey-brown, pulled toward cream), its terminator glow
  'カ': '#9c8078', 'キ': '#c4ab92', 'ク': '#e6d4b6', 'オ': '#8a5f6c',
  // the cream
  'ケ': '#8f7f9f', 'コ': '#d2c2bf', 'サ': '#efe3cc', 'シ': '#fff8e8',
  // the ear's inner pink
  'ソ': '#8e5470', 'タ': '#c08490',
  // the scarf
  'ナ': '#1d3b40', 'ニ': '#2a6844', 'ヌ': '#47a03e', 'ネ': '#94d052',
  // the pump: the yellow's deepest shadow (the game's o, y, Y and ¥ are the rest); chrome and rubber
  'ト': '#7a2c34', 'ノ': '#4f4b6c', 'ハ': '#8c88a8', 'ヒ': '#d2d3e2', 'フ': '#665f84',
  // the eyes
  'ヘ': '#5a2412', 'ホ': '#c4681a', 'マ': '#f4a83a', 'ミ': '#ffe08e',
  // the nose's lit top, the cool rim inside the far contour
  'メ': '#6c6690', 'ム': '#7f8cb0', 'ツ': '#b4c8e0', 'ユ': '#3a4a78',
});
// levels: 0 deep, 1 shadow, 2 half (turning), 3 lit, 4 highlight, 5 reflected light; 7 rim (inner), 8 glow, 9 rim
const RAMP = {
  coat: ['イ', 'エ', 'カ', 'キ', 'ク', 'カ'],
  stripe: ['ア', 'イ', 'ウ', 'エ', 'カ', 'ウ'],
  cream: ['エ', 'ケ', 'コ', 'サ', 'シ', 'コ'],
  mask: ['ア', 'ア', 'イ', 'イ', 'ウ', 'イ'],
  earIn: ['ア', 'イ', 'ソ', 'タ', 'タ', 'ソ'],
  scarf: ['ナ', 'ナ', 'ニ', 'ヌ', 'ネ', 'ニ'],
  yel: ['ト', 'o', 'y', 'Y', 'Y', '¥'],
  chrome: ['ア', 'ノ', 'ハ', 'ヒ', 'W', 'ハ'],
  rubber: ['ア', 'イ', 'ウ', 'フ', 'ハ', 'ウ'],
  nose: ['ア', 'ア', 'イ', 'メ', 'ハ', 'ウ'],
  iris: ['ヘ', 'ヘ', 'ホ', 'マ', 'ミ', 'ホ'],
};
const RIM = { coat: 'ム', stripe: 'ユ', cream: 'ツ', mask: 'ユ', earIn: 'ユ', rubber: 'ユ', nose: 'ユ', scarf: 'ヌ', chrome: 'ハ', yel: '¥' };
const RIM2 = { coat: 'ユ', stripe: 'ユ', cream: 'ム', mask: 'ア', earIn: 'ア', rubber: 'ア', nose: 'ア', scarf: 'ナ', chrome: 'ノ', yel: 'o' };

// ============================== THE RACCOON ==============================
const RZ = 1.15, ROX = 132 - 134 * RZ, ROY = 78 - 80 * RZ;   // visible window in design units: x 19..221, y 12..193
const HEADC = [186, 92];
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), N = W * H, c = new Canvas(W, H, k * RZ, k * ROX, k * ROY);
  const big = k >= 1.4, fine = k >= 0.9, S = c.S;
  const nl = { line: null };
  const MAT = new Array(N).fill(null), LV = new Int8Array(N).fill(3);
  const ids = (on) => [].concat(on).map((n) => c.id(n));
  const dx = (i) => ((i % W) + 0.5 - c.ox) / S, dy = (i) => (((i / W) | 0) + 0.5 - c.oy) / S;   // pixel -> design units

  // ---- the drawing tools: parts hold a MATERIAL and a light LEVEL per pixel ----
  const part = (name, shapes, mat, lv = 3) => { const id = c.shape(name, shapes, 'ア', nl); for (let i = 0; i < N; i++) if (c.part[i] === id) { MAT[i] = mat; LV[i] = lv; } return id; };
  const mark = (on, shapes, mat) => { const I = ids(on), m = c.mask(shapes); for (let i = 0; i < N; i++) if (m[i] && I.includes(c.part[i])) MAT[i] = mat; };
  /** a designed light/shadow shape: set (or darken to 'min', lighten to 'max') the level of part(s) `on` inside shapes */
  const level = (on, shapes, lv, mode = 'set', only = null) => {
    const I = on ? ids(on) : null, m = shapes ? c.mask(shapes) : null;
    for (let i = 0; i < N; i++) {
      if ((m && !m[i]) || (I && !I.includes(c.part[i])) || !MAT[i] || (only && !only.includes(MAT[i]))) continue;
      LV[i] = mode === 'set' ? lv : mode === 'min' ? Math.min(LV[i], lv) : Math.max(LV[i], lv);
    }
  };
  /** a cast shadow: pixels of `onto` that see part(s) `from` (ox, oy) design units toward the light drop to level lv */
  const cast = (from, onto, ox, oy, lv = 1) => {
    const F = ids(from), O = ids(onto), X0 = Math.round(ox * S), Y0 = Math.round(oy * S), hit = [];
    for (let i = 0; i < N; i++) {
      if (!O.includes(c.part[i])) continue;
      const x = (i % W) - X0, y = ((i / W) | 0) - Y0;
      if (x >= 0 && y >= 0 && x < W && y < H && F.includes(c.part[y * W + x])) hit.push(i);
    }
    for (const i of hit) LV[i] = Math.min(LV[i], lv);
  };
  /** the edge of part(s) `on` facing the light: pixels whose neighbour (ox, oy) units toward the light is outside `group` */
  const litEdge = (on, group, ox, oy, lv, only = null) => {
    const I = ids(on), G = ids(group), X0 = Math.round(ox * S), Y0 = Math.round(oy * S), hit = [];
    for (let i = 0; i < N; i++) {
      if (!I.includes(c.part[i]) || (only && !only.includes(MAT[i]))) continue;
      const x = (i % W) - X0, y = ((i / W) | 0) - Y0;
      if (x < 0 || y < 0 || x >= W || y >= H || !G.includes(c.part[y * W + x])) hit.push(i);
    }
    for (const i of hit) if (LV[i] >= 3) LV[i] = lv;
  };
  /** a half-tone band `w` units wide on the lit side of every shadow edge inside part(s) `on` (the plane turning) */
  const turn = (on, w, only = null) => {
    const I = ids(on), r = Math.max(1, Math.round(w * S));
    let front = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (I.includes(c.part[i]) && LV[i] <= 1) front[i] = 1;
    for (let s = 0; s < r; s++) {
      const nx = front.slice();
      for (let i = W; i < N - W; i++) if (!front[i] && I.includes(c.part[i]) && (front[i - 1] || front[i + 1] || front[i - W] || front[i + W])) nx[i] = 1;
      front = nx;
    }
    for (let i = 0; i < N; i++) if (front[i] && LV[i] === 3 && I.includes(c.part[i]) && (!only || only.includes(MAT[i]))) LV[i] = 2;
  };
  /** one band rule across a curved tube (centre line pts, half-width hw(t)): t = offset across / half-width, -1 lit .. 1 dark */
  const tubeBands = (on, pts, hw, bands, dir = [0.6, 0.8]) => {
    const I = ids(on), P = curve(pts, 12), n = P.length;
    for (let i = 0; i < N; i++) {
      if (!I.includes(c.part[i])) continue;
      const x = dx(i), y = dy(i);
      let best = 1e9, bx = 0, by = 0, bt = 0;
      for (let j = 0; j + 1 < n; j++) {
        const [ax, ay] = P[j], [cx, cy] = P[j + 1], ex = cx - ax, ey = cy - ay, l2 = ex * ex + ey * ey || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / l2)), qx = ax + ex * t, qy = ay + ey * t, q = (x - qx) ** 2 + (y - qy) ** 2;
        if (q < best) { best = q; bx = qx; by = qy; bt = (j + t) / (n - 1); }
      }
      const t = ((x - bx) * dir[0] + (y - by) * dir[1]) / hw(bt);
      for (const [lim, lv] of bands) if (t < lim) { LV[i] = lv; break; }
    }
  };
  /** one band rule down each COLUMN of part(s) `on` (a form lit from above: the snout, the nose): t 0 top .. 1 bottom */
  const columnBands = (on, bands) => {
    const I = ids(on);
    for (let x = 0; x < W; x++) {
      let y0 = -1, y1 = -1;
      for (let y = 0; y < H; y++) if (I.includes(c.part[y * W + x])) { if (y0 < 0) y0 = y; y1 = y; }
      if (y0 < 0) continue;
      for (let y = y0; y <= y1; y++) {
        const i = y * W + x; if (!I.includes(c.part[i])) continue;
        const t = (y - y0 + 0.5) / (y1 - y0 + 1);
        for (const [lim, lv] of bands) if (t < lim) { LV[i] = lv; break; }
      }
    }
  };
  const hook = (p, n, t, len, w) => blob([[p[0] - t[0] * w / 2 - n[0], p[1] - t[1] * w / 2 - n[1]], [p[0] + n[0] * len * 0.55 + t[0] * len * 0.1, p[1] + n[1] * len * 0.55 + t[1] * len * 0.1],
    [p[0] + n[0] * len + t[0] * len * 0.75, p[1] + n[1] * len + t[1] * len * 0.75, 1], [p[0] + n[0] * len * 0.35 + t[0] * w * 0.7, p[1] + n[1] * len * 0.35 + t[1] * w * 0.7], [p[0] + t[0] * w / 2 - n[0], p[1] + t[1] * w / 2 - n[1]]]);

  // ---- the pump's one straight axis: foot at the lower right, the handle up beside the ear ----
  const FOOT = [170, 172], TOP = [42, 65], PL = Math.hypot(TOP[0] - FOOT[0], TOP[1] - FOOT[1]);
  const sc = PL / 180, uX = (TOP[0] - FOOT[0]) / PL, uY = (TOP[1] - FOOT[1]) / PL;
  let nX = -uY, nY = uX; if (-nX - nY < 0) { nX = -nX; nY = -nY; }   // n: across the barrel, the side toward the light
  const at = (s, o = 0) => [FOOT[0] + uX * s * sc + nX * o, FOOT[1] + uY * s * sc + nY * o];
  const alongS = (x, y) => ((x - FOOT[0]) * uX + (y - FOOT[1]) * uY) / sc, across = (x, y) => (x - FOOT[0]) * nX + (y - FOOT[1]) * nY;
  const HN = 56, P = (s, o) => at(HN + s, o);   // the paw's frame: s along the barrel (+ toward the handle), o across (+ the top edge)

  // ============ THE DRAWING ============
  // ---- the tail: one fat cylinder curling up at the left, a soft point, rings that wrap it ----
  const tailC = [[106, 172], [82, 176], [63, 169], [53, 155], [51, 141], [53, 130], [56, 120]];
  const tailW = (t) => (20 + 7 * Math.sin(Math.PI * Math.min(1, t * 1.2))) * (1 - 0.37 * t * t) * (t > 0.8 ? 1 - 0.6 * ((t - 0.8) / 0.2) ** 2 : 1);
  part('tail', tube(tailC, tailW, undefined, 12), 'coat');
  const tcc = curve(tailC, 12), tn = tcc.length;
  const tailAt = (f) => { const i = Math.round(f * (tn - 1)), a = tcc[Math.max(0, i - 1)], b = tcc[Math.min(tn - 1, i + 1)], [ex, ey] = norm(b[0] - a[0], b[1] - a[1]); return { p: tcc[i], dx: ex, dy: ey, px: -ey, py: ex }; };
  for (const [fr, len, w] of [[0.1, 5.5, 7], [0.32, 4.4, 5.6], [0.55, 3.6, 4.6], [0.74, 4, 5]]) {   // a few chunky tufts on the outer curve
    const { p, dx: ex, dy: ey, px: a, py: b } = tailAt(fr), sgn = (p[0] - 82) * a + (p[1] - 148) * b > 0 ? 1 : -1, hw = tailW(fr) / 2;
    c.shape('tail', hook([p[0] + a * sgn * hw, p[1] + b * sgn * hw], [a * sgn, b * sgn], [ex, ey], len, w), 'ア', nl);
  }
  for (let i = 0; i < N; i++) if (c.part[i] === c.id('tail') && !MAT[i]) MAT[i] = 'coat';
  for (const [f, u] of [[0.22, 3.2], [0.41, 3.1], [0.6, 2.9], [0.78, 2.7], [0.95, 5]]) {
    const { p, dx: ex, dy: ey, px: a, py: b } = tailAt(f), bow = 2.4;
    mark('tail', blob([[p[0] - a * 18 - ex * u, p[1] - b * 18 - ey * u], [p[0] - ex * (u - bow), p[1] - ey * (u - bow)], [p[0] + a * 18 - ex * u, p[1] + b * 18 - ey * u],
      [p[0] + a * 18 + ex * u, p[1] + b * 18 + ey * u], [p[0] + ex * (u + bow), p[1] + ey * (u + bow)], [p[0] - a * 18 + ex * u, p[1] - b * 18 + ey * u]], 6), 'mask');
  }

  // ---- the body: one stout mass, five tufts at the bottom, a cream bib only under the scarf ----
  part('body', blob([[104, 108], [90, 118], [84, 134], [83, 152], [86, 166], [94, 176], [110, 181], [128, 183], [146, 180], [160, 174], [166, 164], [170, 150], [168, 130], [158, 116], [144, 108]]), 'coat');
  for (const [x, y, ax, ay, tx, ty, len, w] of [[94, 176, -0.4, 1, -1, 0.2, 5, 6.4], [114, 181, 0, 1, -1, 0.1, 3.4, 4.6], [136, 182, 0.1, 1, 1, 0.1, 5.4, 6.6], [156, 176, 0.5, 1, 1, -0.1, 3.8, 4.8]]) {
    c.shape('body', hook([x, y], norm(ax, ay), norm(tx, ty), len, w), 'ア', nl);
  }
  for (let i = 0; i < N; i++) if (c.part[i] === c.id('body') && !MAT[i]) MAT[i] = 'coat';
  mark('body', blob([[101, 117], [150, 115], [151, 129], [138, 136], [120, 138], [104, 133]]), 'cream');

  // ---- the far arm (in shadow), the near arm: shoulder, elbow at the side, forearm across the belly to the paw ----
  part('armR', tube([[160, 120], [176, 136]], 19, 15, 12), 'coat');
  const wrist = P(0, -15);
  const armPts = [[100, 118], [89, 133], [85, 147], [94, 155], [110, 157], wrist];
  part('armL', tube(armPts, (t) => 19 - 8 * t, undefined, 12), 'coat');

  // ---- the green scarf: the band, the end flung over the far shoulder, the knot ----
  part('scarfEnd', blob([[165, 121], [173, 120], [177, 125], [180, 130], [184, 137, 1], [179, 139], [174, 136], [168, 128], [163, 122]]), 'scarf');
  for (const [x, y, l] of [[175, 137, 2.6], [178, 138.4, 3.2], [181, 139, 2.6]]) c.shape('scarfEnd', bar([x, y], [x + l * 0.4, y + l], 1.6), 'ア', nl);
  for (let i = 0; i < N; i++) if (c.part[i] === c.id('scarfEnd') && !MAT[i]) MAT[i] = 'scarf';
  part('scarf', blob([[92, 110], [112, 115], [140, 115], [168, 106], [174, 114], [170, 126], [146, 133], [120, 135], [100, 131], [90, 121]]), 'scarf');
  part('scarfKnot', ell(170, 120, 6, 5.2, -0.4), 'scarf');

  // ---- the ears: coat outside, a dark hollow, a dusty pink fold ----
  const rot = (pts, cx, cy, a) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
  part('earL', tufted(blob(rot([[96, 56], [98, 38], [103, 26], [110, 21], [116, 30], [124, 46]], 110, 50, -0.14)), { amp: 3, period: 7, where: (x) => (x < 104 ? 1 : 0), flow: [-1, 0], seed: 8 }), 'coat');
  mark('earL', blob(rot([[103, 52], [105, 38], [109, 30], [114, 32], [119, 47]], 110, 50, -0.14)), 'mask');
  mark('earL', blob(rot([[108, 50], [110, 40], [113, 35], [116, 47]], 110, 50, -0.14)), 'earIn');
  part('earR', blob([[148, 44], [156, 30], [163, 22], [168, 21, 1], [172, 30], [175, 40], [176, 52]]), 'coat');
  mark('earR', blob([[155, 44], [160, 34], [165, 28], [169, 31], [171, 46]]), 'mask');
  mark('earR', blob([[159, 43], [164, 35], [167, 34], [168.5, 45]]), 'earIn');

  // ---- the head: one round mass with a chunky cheek ruff; the markings are colour only ----
  part('head', tufted(blob([
    [94, 58], [106, 45], [124, 38], [144, 38], [160, 44], [172, 54], [178, 66], [180, 78], [184, 92], [186, 102],
    [178, 112], [162, 119], [144, 122], [126, 121], [108, 118], [92, 112], [82, 102], [82, 88], [87, 72],
  ]), { amp: 5.5, period: 8, where: (x, y) => (x < 100 && y > 78 ? 1.2 : y > 113 && x < 150 ? 0.6 : 0), flow: (x, y) => (y > 100 ? norm(x < 140 ? -0.6 : 0.6, 1) : headFlow(x, y)), lean: 0.6, seed: 12 }), 'coat');
  mark('head', blob([[135, 39], [148, 40], [151, 52], [149, 65], [143, 70], [138, 56]]), 'stripe');
  mark('head', blob([[78, 90], [96, 93], [112, 99], [124, 104], [128, 112], [118, 120], [100, 118], [84, 110], [76, 98]]), 'cream');   // the cheek ruff
  mark('head', blob([[170, 98], [180, 96], [190, 104], [186, 114], [174, 110]]), 'cream');
  mark('head', blob([[92, 64.6], [98, 56], [110, 50.6], [124, 49.6], [134, 52.8], [136, 58.6], [124, 57.4], [110, 59.4], [98, 65.6]]), 'cream');   // the brows
  mark('head', blob([[152, 59.4], [158, 53.6], [168, 51.6], [176, 53.6], [180, 58.4], [176, 61], [166, 58.4], [156, 62]]), 'cream');
  mark('head', blob([
    [80, 84], [84, 74], [94, 66], [108, 63], [122, 63], [132, 66], [140, 70], [146, 66], [156, 62], [168, 61], [178, 64], [182, 72],
    [178, 82], [168, 86], [158, 87], [150, 85], [144, 80], [138, 84], [132, 91], [120, 95], [106, 96], [92, 98], [82, 96],
  ]), 'mask');
  mark('head', blob([[100, 99], [118, 97], [132, 91], [142, 86], [152, 90], [158, 104], [168, 112], [150, 120], [128, 122], [108, 118]]), 'cream');   // the lower face
  // the snout: one rounded cylinder pointing right, a coat bridge on its top
  part('snout', blob([[146, 85], [155, 80.5], [168, 79.6], [180, 82], [189, 87], [193, 94], [189, 101], [178, 105], [164, 106], [152, 102], [146, 95]]), 'cream');
  mark('snout', blob([[146, 85], [154, 80.8], [164, 80], [156, 84], [149, 90]]), 'coat');
  part('nose', blob([[180, 88], [186, 85], [193, 85.6], [197.4, 90.4], [196, 96.6], [189.6, 99.2], [182, 97.4], [178.8, 92.4]]), 'nose');

  // ---- the pump: straight on one axis ----
  const hose = [at(3, 18), [190, 166], [202, 167], [208, 156], [205, 145]];
  part('hose', tube(hose, 4.4, 4.4, 12), 'rubber');
  const hp = curve(hose), he = hp[hp.length - 1], hd = hp[hp.length - 4], hl = Math.hypot(he[0] - hd[0], he[1] - hd[1]) || 1, hux = (he[0] - hd[0]) / hl, huy = (he[1] - hd[1]) / hl;
  part('chuck', bar(he, [he[0] + hux * 8, he[1] + huy * 8], 6), 'chrome');
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  part('foot', box(0, 7, 46), 'rubber');
  part('barrel', box(11, 140, 13), 'yel');
  part('cap7', box(7, 14, 17), 'chrome');
  part('cap137', box(137, 144, 17), 'chrome');
  part('rod', box(144, 176, 4.4), 'chrome');
  part('handle', bar(at(178, -25), at(178, 25), 8, true), 'rubber');
  part('boss', box(173, 183, 8.6), 'chrome');
  const g = at(30 / sc);
  part('gauge', ell(g[0], g[1], 8.6, 8.6), 'chrome');

  // ---- the near paw, GRIPPING the barrel: the back of the hand rises from the wrist below the barrel, four fingers
  //      stacked along the barrel curl over its top edge (their knuckle bumps show above it), the thumb tucks under ----
  part('pawN', blob([
    P(-5, -17), P(-7, -10), P(-8, -3), P(-7.8, 3.5), P(-7.2, 7.4),
    P(-5.4, 9.6), P(-3.5, 8.3), P(-1.75, 10), P(0, 8.5), P(1.75, 10), P(3.5, 8.3), P(5.3, 9.4),
    P(7, 7.2), P(7.8, 3), P(8.4, -1.6), P(12, -2.6), P(13.6, -5), P(12.4, -7.6), P(8.6, -8.2), P(6.2, -11), P(5, -17),
  ]), 'coat');
  const BG = ['barrel', 'cap7', 'cap137', 'rod', 'boss', 'gauge', 'foot', 'handle', 'hose', 'chuck'];
  const PUMP = [...BG];

  // ============ THE LIGHT: designed shapes, light from the upper left ============
  // tail: one continuous underside shadow, a half band, a lit top, a highlight strip along the lit edge
  tubeBands('tail', tailC, (t) => tailW(t) / 2, [[-0.62, 4], [0.12, 3], [0.42, 2], [99, 1]]);
  // body: the far third in shadow (one terminator), the bottom turning under, the bib second to the face
  level('body', null, 3);
  level('body', [[152, 108], [230, 100], [230, 210], [118, 210], [123, 190], [130, 172], [137, 152], [141, 136], [146, 126]], 1);
  level('body', [[60, 163], [230, 163], [230, 210], [60, 210]], 2, 'min');
  level('body', null, 2, 'min', ['cream']);
  level('body', blob([[98, 128], [132, 128], [130, 152], [100, 154]]), 2, 'min');   // the chest inside the arm sits back, in half light
  // arms: the near arm a cylinder (a lit top edge, a core shadow underneath); the far arm all shadow
  tubeBands('armL', armPts, (t) => (19 - 8 * t) / 2, [[-0.6, 4], [0.15, 3], [0.5, 2], [99, 1]]);
  level('armR', null, 1);
  // the paw: lit back of the hand; the side toward the foot turns away; the wrist and thumb underside in half light
  level('pawN', null, 3);
  level('pawN', [P(-9, -18), P(-5.6, -18), P(-6, 12), P(-9, 12)], 1);
  level('pawN', [P(-6, -18), P(6, -18), P(6, -9), P(-6, -11)], 2, 'min');
  level('pawN', [P(8, -1), P(15, -1), P(15, -9), P(8, -9)], 2, 'min');
  level('pawN', [P(-5, 6.5), P(6, 6.5), P(6, 11), P(-5, 11)], 4, 'max');   // the knuckle tops catch the light
  // scarf: a lit top roll, the lower half turning, the end and the knot's far side in shadow
  level(['scarf', 'scarfEnd', 'scarfKnot'], null, 3);
  level('scarf', [[88, 124], [120, 128.5], [146, 126.5], [172, 117], [180, 140], [86, 140]], 2);
  level('scarfEnd', null, 1);
  level('scarfEnd', [[164, 119], [172, 119], [176, 126], [170, 128]], 2);
  level('scarfKnot', [[167, 100], [190, 100], [190, 130], [160, 130], [166, 118]], 1);
  litEdge('scarf', ['scarf', 'scarfKnot'], -1.6, -1.6, 4);
  // ears: the near ear lit with a bright rim; the far ear in the head's shadow
  level('earL', null, 3);
  litEdge('earL', ['earL'], -1.6, -1.6, 4, ['coat']);
  level('earR', null, 1);
  // head: the far cheek and the jaw turn away (one shadow shape that swallows the far ear side of the mask), a half
  //       band where the planes turn, a lit crown, the cheek under the near eye catching the light
  level('head', null, 3);
  level('head', [[166, 40], [210, 40], [210, 132], [128, 132], [140, 121], [154, 115], [166, 109], [178, 100], [181, 86], [179, 70], [172, 54]], 1);
  turn('head', 2.2);
  litEdge('head', ['head', 'earL', 'earR'], -2.4, -2.4, 4, ['coat', 'cream', 'stripe']);
  level('head', blob([[96, 99], [112, 99], [126, 95], [138, 89], [146, 92], [146, 104], [132, 110], [114, 112], [100, 108]]), 4, 'max', ['cream']);
  level('head', blob([[102, 112], [128, 115], [148, 112], [162, 116], [150, 123], [126, 125], [104, 121]]), 2, 'min', ['cream']);   // the jaw turning under
  // snout: a cylinder lit from above: a highlight ridge, the lit top and side, a half band, the underside in shadow
  columnBands('snout', [[0.18, 4], [0.6, 3], [0.76, 2], [9, 1]]);
  columnBands('nose', [[0.3, 3], [0.72, 2], [9, 1]]);
  // cast shadows (they cross materials)
  cast('snout', 'head', 1, 3.2);
  cast('nose', 'snout', 1, 2.2);
  cast(['head', 'snout'], ['scarf', 'scarfEnd', 'scarfKnot'], 1, 3, 2);
  cast(['head', 'snout'], ['scarf', 'scarfKnot'], 0.6, 1.6, 1);
  cast(['head', 'snout'], ['body', 'armL', 'armR'], 1.6, 5);
  cast('scarfKnot', ['scarf', 'scarfEnd'], 1, 2);
  cast(['scarf', 'scarfEnd', 'scarfKnot'], ['body', 'armL', 'armR'], 1.2, 3);
  cast('earL', 'head', 1.4, 2.4);
  cast('armL', 'body', 2.4, 3.4);
  cast(PUMP.filter((n) => n !== 'hose' && n !== 'chuck'), ['body', 'scarf', 'scarfEnd', 'scarfKnot', 'armL', 'armR', 'tail'], 2.6, 3.2);
  cast('pawN', ['body', 'armL', 'scarf'], 1.6, 2.2);
  turn(['body', 'armL', 'tail'], 1.2, ['cream']);

  // ---- the pump's materials: one designed profile across each straight part (o: -1 the shadow edge .. 1 the lit edge) ----
  const prof = (o, bands) => { for (const [lim, lv] of bands) if (o < lim) return lv; return bands[bands.length - 1][1]; };
  const YEL = [[-0.76, 5], [-0.2, 1], [9, 2]];
  const CHR = [[-0.66, 5], [-0.22, 0], [0.2, 1], [0.5, 3], [0.74, 4], [9, 2]];
  const RUB = [[-0.36, 1], [0.42, 2], [0.8, 3], [9, 2]];
  const handS = 178 * sc, footS = 3.5 * sc;
  for (let i = 0; i < N; i++) {
    const pid = c.part[i]; if (pid < 0) continue;
    const x = dx(i), y = dy(i), a = across(x, y), d = alongS(x, y) * sc;
    if (pid === c.id('barrel')) LV[i] = prof(a / 6.5, YEL);
    else if (pid === c.id('cap7') || pid === c.id('cap137')) LV[i] = prof(a / 8.5, CHR);
    else if (pid === c.id('rod')) LV[i] = prof(a / 2.2, CHR);
    else if (pid === c.id('boss')) LV[i] = prof(a / 4.3, CHR);
    else if (pid === c.id('handle')) LV[i] = prof((d - handS) / 4, RUB);
    else if (pid === c.id('foot')) LV[i] = prof((d - footS) / 3.5, RUB);
  }
  tubeBands('hose', hose, () => 2.2, [[-0.4, 3], [0.3, 2], [0.75, 1], [99, 5]]);
  { // the chuck: chrome across its own axis
    const cid = c.id('chuck'), px2 = -huy, py2 = hux;
    for (let i = 0; i < N; i++) if (c.part[i] === cid) { const o = ((dx(i) - he[0]) * px2 + (dy(i) - he[1]) * py2) / 3; LV[i] = prof(o * (px2 + py2 < 0 ? 1 : -1), CHR); }
  }
  // the barrel's specular streak (the lamp reflected), solid, a third of the barrel long
  {
    const m = c.mask(bar(at(30, 2.6), at(126, 2.6), big ? 1.5 : 1.1)), bid = c.id('barrel');
    for (let i = 0; i < N; i++) if (m[i] && c.part[i] === bid) LV[i] = 3;
  }
  cast('pawN', ['barrel', 'gauge'], 1.4, 2.2, 1);
  cast('pawN', ['barrel'], 0.8, 1.2, 0);

  // ---- the terminator glow (a warm 1-px band where the coat turns into shadow) ----
  {
    const I = ids(['body', 'tail', 'armL', 'head']), hit = [];
    for (let i = W; i < N - W; i++) {
      if (!I.includes(c.part[i]) || MAT[i] !== 'coat' || LV[i] !== 1) continue;
      for (const j of [i - 1, i + 1, i - W, i + W]) if (I.includes(c.part[j]) && MAT[j] === 'coat' && LV[j] >= 2) { hit.push(i); break; }
    }
    for (const i of hit) LV[i] = 8;
  }

  // ---- the cool rim INSIDE the far contour (head, far ear, snout tip, far shoulder): the outermost px of the shadow
  //      side takes the rim tone, one px in a dimmer one (the poster size only); the outline stays outside it ----
  {
    const R = 3, [rx, ry] = norm(1, -0.15), I = ids(['head', 'earR', 'snout', 'nose', 'armR', 'body', 'scarfEnd']);
    const empty = (x, y) => x < 0 || y < 0 || x >= W || y >= H || c.part[y * W + x] < 0;
    const set = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (!I.includes(c.part[i]) || LV[i] > 2 && LV[i] !== 8) continue;
      if (!(empty(x + 1, y) || empty(x - 1, y) || empty(x, y + 1) || empty(x, y - 1))) continue;
      let nx = 0, ny = 0;
      for (let j = -R; j <= R; j++) for (let q = -R; q <= R; q++) if (empty(x + q, y + j)) { nx += q; ny += j; }
      const l = Math.hypot(nx, ny); if (!l || (nx * rx + ny * ry) / l < 0.6) continue;
      if (dy(i) > 150) continue;   // the lower body stays in the dark
      set.push([i, 9]);
      if (big) { const X = Math.round(x - nx / l), Y = Math.round(y - ny / l), j = Y * W + X; if (I.includes(c.part[j])) set.push([j, 7]); }
    }
    for (const [i, v] of set) if (LV[i] !== 9) LV[i] = v;
  }

  // ============ COLOUR: material x level ============
  const px = c.img.px;
  const col = (m, v) => (v === 9 ? RIM[m] : v === 7 ? RIM2[m] : v === 8 ? 'オ' : RAMP[m][Math.max(0, Math.min(5, v))]);
  for (let i = 0; i < N; i++) if (MAT[i]) px[i] = col(MAT[i], LV[i]);

  // ---- fur clumps, only at marking edges and terminators (2 px wide at the root, along the fur's flow) ----
  if (fine) {
    const gap = big ? 4.2 : 5.5, H0 = ['head'];
    // across a marking edge the fur leans off the flow (the brows and mask edges run WITH the flow, so a clump that only
    // followed it would never cross them): the flow turned 55 degrees
    const cross = (x, y) => { const [a, b] = headFlow(x, y), q = -0.96, cq = Math.cos(q), sq = Math.sin(q); return [a * cq - b * sq, a * sq + b * cq]; };
    const tailDir = (x, y) => norm(-(y - 150), x - 80);
    const tailDirR = (x, y) => norm(y - 150, -(x - 80));
    const neg = (d) => (typeof d === 'function' ? (x, y) => d(x, y).map((v) => -v) : d.map((v) => -v));
    // both ways along the flow, so a clump grows out of every edge whichever side it faces
    const clumps = (on, from, into, dir, seed, len = 2.8) => { for (const f of [].concat(from)) for (const [d, sd] of [[dir, seed], [neg(dir), seed + 50]]) c.furBreak(on, f, [].concat(into), { dir: d, len, gap, w: 2, seed: sd }); };
    clumps(H0, ['サ', 'シ'], ['イ', 'ア'], cross, 501);            // the brows and the ruff into the mask
    clumps(H0, ['イ'], ['サ', 'シ', 'コ'], cross, 502, 2.2);        // the mask into the cream below it
    clumps(H0, ['キ', 'ク'], ['エ', 'カ', 'オ'], headFlow, 503);        // light into shadow at the head's terminator
    clumps(H0, ['カ', 'キ'], ['ウ', 'エ'], headFlow, 504, 2.2);        // the coat into the forehead stripe
    clumps(H0, ['サ', 'シ'], ['キ', 'ク'], cross, 505, 2.2);
    clumps(H0, ['キ', 'カ'], ['イ'], cross, 510, 2.2);               // the coat into the mask's top edge        // the brows into the crown
    clumps(['tail'], ['キ', 'ク', 'カ'], ['イ', 'ア'], tailDir, 506, 2.4);   // ring edges, both ways along the tail
    clumps(['tail'], ['イ', 'ア'], ['キ', 'ク', 'カ'], tailDirR, 507, 2.4);
    clumps(['body', 'armL'], ['キ'], ['エ', 'オ', 'カ'], [0.3, 1], 508, 2.2);   // the body's terminator
    clumps(['body'], ['コ'], ['キ', 'カ'], [0, 1], 509, 2.2);              // the bib into the coat
  }

  // ============ THE FACE, last ============
  const eye = (cx, cy, rx, ry, n) => {
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.55, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.4], [cx + rx * 0.55, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.9]]), 'ア', nl);
    const ix = cx + rx * 0.2, iy = cy + 0.5, ir = ry * 1.1;
    c.paint(n, ell(ix, iy, ir, ir * 1.04), 'ヘ');                                                  // the brown ring
    c.paint(n, ell(ix, iy, ir * 0.8, ir * 0.84), 'ホ');
    c.paint(n, ell(ix + ir * 0.12, iy + ir * 0.26, ir * 0.62, ir * 0.54), 'マ');                    // light glowing low through the iris
    c.paint(n, ell(ix + ir * 0.24, iy + ir * 0.48, ir * 0.42, ir * 0.26, -0.3), 'ミ');             // eyeshine
    c.paint(n, ell(ix + 0.2, iy, ir * 0.4, ir * 0.48), 'ア');                                       // the pupil
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.3], [cx, cy - ry * 0.42], [cx - rx - 2, cy - ry * 0.15]]), 'ア');   // the heavy lid
    const lidSh = blob([[cx - rx, cy - ry * 0.3], [cx, cy - ry * 0.42], [cx + rx, cy - ry * 0.32], [cx + rx, cy + 0.4], [cx, cy + 0.1], [cx - rx, cy + 0.5]]);
    c.paint(n, lidSh, 'ヘ', { only: ['ホ'] });
    c.paint(n, lidSh, 'ホ', { only: ['マ', 'ミ'] });
    const gs = Math.max(1, Math.round(1.4 * k));
    for (let j = 0; j < gs; j++) for (let i = 0; i < gs; i++) c.img.set(Math.round(c.X(ix - ir * 0.42)) + i, Math.round(c.Y(iy - ir * 0.12)) + j, 'W');
    if (fine) c.dot(ix + ir * 0.5, iy + ir * 0.1, 'サ');                                           // the secondary catchlight
    if (fine) c.line1(curve([[cx - rx * 0.6, cy + ry * 1.02], [cx, cy + ry * 1.12], [cx + rx * 0.6, cy + ry * 0.98]]), 'ウ');   // the lit lower lid
    if (big) c.line1(curve([[cx + rx * 0.35, cy + ry * 0.82], [cx + rx * 0.62, cy + ry * 0.62], [cx + rx * 0.86, cy + ry * 0.12]]), 'Y', { on: n });   // the wet rim
  };
  eye(122, 77, 9.4, 7, 'eyeN');
  eye(161, 75, 6.6, 5.4, 'eyeF');
  // the nose: a hard 2x2 glint on the lit top, the nostrils
  { const gs = Math.max(1, Math.round(1.4 * k)), X = Math.round(c.X(184.6)), Y = Math.round(c.Y(87.8)); for (let j = 0; j < gs; j++) for (let i = 0; i < gs; i++) c.img.set(X + i, Y + j, 'W'); }
  c.dot(191.5, 95.4, 'ア'); c.dot(185, 95.4, 'ア');
  { // the smirk: a tapered crease from under the nose to a tucked corner, a lit lip below it, a cheek bulge above the corner
    const M = curve([[188, 99.5], [186, 103], [180, 106], [172, 107.4], [165, 106.6], [159.5, 104], [156, 100], [155.4, 98]], 8), nM = M.length;
    const th = (i) => 0.35 + 1.3 * Math.pow(i / (nM - 1), 1.3);
    const nrm = (i) => { const a = M[Math.max(0, i - 1)], b = M[Math.min(nM - 1, i + 1)], [ex, ey] = norm(b[0] - a[0], b[1] - a[1]); return [-ey, ex]; };
    const top = M.map((p, i) => { const [qx, qy] = nrm(i); return [p[0] - qx * th(i) * 0.5, p[1] - qy * th(i) * 0.5]; });
    const bot = M.map((p, i) => { const [qx, qy] = nrm(i); return [p[0] + qx * th(i) * 0.5, p[1] + qy * th(i) * 0.5]; });
    const crease = c.mask([...top, ...bot.reverse()]);
    for (let i = 0; i < N; i++) if (crease[i] && c.img.px[i] !== null) c.img.px[i] = dx(i) > 182 ? 'ウ' : 'ア';
    if (fine) c.line1(curve([[152.6, 99.4], [154.6, 96.6], [157.8, 95.6]]), 'シ', { on: ['head', 'snout'] });   // the cheek bulge over the corner
  }
  { // the gauge: a chrome bezel lit at the top left, a pale face, ticks, a red zone, the needle, a glare on the glass
    const gid = c.id('gauge'), [L0, L1] = norm(-0.55, -0.65);
    for (let i = 0; i < N; i++) {
      if (c.part[i] !== gid) continue;
      const ox = dx(i) - g[0], oy = dy(i) - g[1], r = Math.hypot(ox, oy);
      if (r > 6.4) { const d = (ox * L0 + oy * L1) / r; px[i] = d > 0.5 ? 'W' : d > 0 ? 'ヒ' : d > -0.6 ? 'ハ' : 'ノ'; }
      else px[i] = (ox * L0 + oy * L1) < -3.6 ? 'ハ' : 'ヒ';
      if (LV[i] <= 1 && r <= 6.4) px[i] = px[i] === 'ヒ' ? 'ハ' : 'ノ';   // the paw's cast shadow on the face
    }
    if (fine) {
      const nT = big ? 7 : 5;
      for (let t = 0; t < nT; t++) { const a = Math.PI * (0.75 + (1.5 * t) / (nT - 1)); c.dot(g[0] + Math.cos(a) * 5.1, g[1] + Math.sin(a) * 5.1, 'ノ'); }
      for (let a = -0.25; a <= 0.25; a += 0.04) c.dot(g[0] + Math.cos(a) * 5.1, g[1] + Math.sin(a) * 5.1, 'R');
      if (big) for (let a = 3.6; a <= 4.3; a += 0.12) c.dot(g[0] + Math.cos(a) * 4.4, g[1] + Math.sin(a) * 4.4, 'W');
    }
    c.line1([g, [g[0] - 2.2, g[1] - 4.4]], 'ア', { on: 'gauge' });   // the needle, pointing up
    c.dot(g[0], g[1], 'ア');
  }
  if (big) { // the rubber grips: ribs across the handle on both sides of the boss
    const hid = c.id('handle'), sp = 5;
    for (let i = 0; i < N; i++) if (c.part[i] === hid) { const q = across(dx(i), dy(i)); if (Math.abs(q) > 6 && Math.floor(q * S) % sp === 0) px[i] = 'イ'; }
  }

  // ============ LINES: inside only where the man-made pump or the gripping paw lies over something ============
  {
    const front = new Set(ids([...PUMP, 'pawN'])), group = (p) => (p === c.id('pawN') || p === c.id('armL') ? 'arm' : p), src = c.part, put = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const j = y * W + x, pj = src[j]; if (pj < 0 || px[j] === null) continue;
      for (const i of [j - 1, j + 1, j - W, j + W]) {
        const pi = src[i];
        if (pi < 0 || pi === pj || !front.has(pi) || pi < pj || group(pi) === group(pj)) continue;
        if (c.ids.get('eyeN') === pj || c.ids.get('eyeF') === pj) continue;
        put.push(j); break;
      }
    }
    for (const j of put) px[j] = 'ア';
    // the finger splits: two short notches from the valleys between the knuckles
    if (fine) for (const s of [-3.5, 0, 3.5]) c.line1([P(s, 8.2), P(s, s === 0 ? 5 : 5.6)], 'ア', { on: 'pawN' });
    if (fine) c.line1([P(7.8, -1.8), P(8.2, -5.4), P(7, -8)], 'ア', { on: 'pawN' });   // the thumb's crease
  }
  // the outer line: dark on the shadow side, a little softer on the lit side; 2 px on the shadow side at the poster size
  c.silhouette({ dark: 'ア', light: [-1, -1], pick: (nb, lit) => (lit ? 'イ' : 'ア') });
  if (big) c.silhouette({ dark: 'ア', light: [-1, -1], pick: (nb, lit) => (lit ? null : 'ア') });
  c.cleanSilhouette({ nubs: true, passes: 1 });
  const keep = ['W', 'R', 'ミ', 'マ', 'Y', 'シ', 'サ', 'ム', 'ツ', 'オ'];
  c.despeckle(null, keep);
  c.cleanSilhouette({ nubs: false, passes: 2 });
  // whiskers: two fine light lines each side, past the outline
  if (fine) {
    for (const w of [[[180, 99], [194, 96], [207, 93]], [[181, 102], [195, 104], [208, 107]]]) {
      const m = c._line1Mask(curve(w, 16));
      for (let i = 0; i < N; i++) if (m[i] && (px[i] === null || px[i] === 'ア' || px[i] === 'イ')) px[i] = px[i] === null ? 'サ' : 'コ';
    }
  }
  return c.img;
}

/** the art-history preview: the poster portrait at k = 1.5 and at k = 1 */
export function portraitsPreview() {
  return { frames: [raccoonPortrait2d('smirk', 1.5), raccoonPortrait2d('smirk', 1)], cols: 2 };
}
