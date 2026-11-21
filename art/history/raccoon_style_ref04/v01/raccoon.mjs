// M4.10 style study, ref04 (reference/raccoon-ref_04.jpg): the raccoon as a CHUNKY CARTOON GAME SPRITE.
// Same pose, pump, scarf and tail as M4.9; the technique changes:
//   - a bold dark outline: 2 px round the silhouette at k 1.5, 1 px between overlapping forms (on the BACK form's side),
//     none between a form and its own markings (the mask, the brow bands, the tail rings are colour, not parts);
//   - flat cel shading: 3 tones per material (shadow, base, light), hard edges, no dither, no fur strands; the light
//     still comes from ONE value map (upper left), but it is quantized hard so each form reads as two or three shapes;
//   - a big, readable face: big white-sclera eyes with big pupils and a heavy sly lid, a toothy one-sided grin;
//   - texture only as a few bold tufts in the silhouette (cheeks, tail, bottom), never inside the forms.
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../../../lib/draw2d.mjs';
import '../../../lib/light2d.mjs';
import { dome, cap } from '../../../lib/light2d.mjs';
import { registerColors } from '../../../lib/raster.mjs';

// ref04's own colour block (Cyrillic capitals): warm near-black line, 3-tone ramps leaning violet in the shadows
registerColors({
  'А': '#22141b',                                   // the line
  'В': '#6a5658', 'Г': '#998278', 'Д': '#c4ae9a',  // coat: shadow, base, light
  'Ж': '#bba590', 'З': '#e3d4ba', 'И': '#f7eedb',  // cream: shadow, base, light
  'Й': '#352530', 'К': '#4f3c46',                  // mask: base, light
  'Л': '#b0727c',                                   // ear inside
  'М': '#2d6a3e', 'Н': '#47a14b', 'О': '#86d160',  // scarf
  'П': '#7d8798', 'Р': '#a8b2bf', 'С': '#e4e9ee',  // chrome
  'Т': '#2c303d', 'У': '#474e60', 'Ф': '#5d6578',  // rubber
  'Ц': '#fbf7ee', 'Ч': '#cbbfb8',                  // eye whites, teeth
  'Ш': '#e59a27', 'Щ': '#a2541a',                  // iris
  'Ъ': '#6b2231', 'Ы': '#cf5d68',                  // mouth, tongue
  'Э': '#d0352c',                                   // gauge needle
});

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== LIGHT ==============================

/** height bumps for lightField (design units): lines {l: points, w, a} (a ridge, a < 0 a groove) and ellipses {e: [x, y, rx, ry], a} */
function bumps(list) {
  const items = list.map((b) => (b.l ? { ...b, pts: curve(b.l, 8) } : b));
  return (x, y) => {
    let h = 0;
    for (const b of items) {
      if (b.e) { const [cx, cy, rx, ry] = b.e, q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (q < 1) h += b.a * (1 - q) ** 1.5; continue; }
      let best = 1e9; const P = b.pts;
      for (let i = 0; i < P.length - 1; i++) {
        const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)), d = Math.hypot(x - ax - dx * t, y - ay - dy * t);
        if (d < best) best = d;
      }
      if (best < b.w) h += b.a * 0.5 * (1 + Math.cos((Math.PI * best) / b.w));
    }
    return h;
  };
}

/** the light of one picture: the value map and the ways of putting light and shadow into it */
function lighting(c) {
  const v = c.values(0.6);
  return {
    v,
    /** one form lit as a whole volume; `front` = the parts in front of it (they join its silhouette, no holes) */
    form(on, o = {}) {
      c.lightField(v, on, { mass: o.front ?? null, R: o.R ?? 8, prims: o.prims, k: o.k, height: o.height, smooth: o.smooth ?? 0.3, curve: o.curve, gloss: o.gloss, shine: o.shine });
    },
    /** a straight tube (pump parts): analytic cylinder light */
    tube(on, a, b, r, o = {}) { c.tubeField(v, on, a, b, r, { gloss: o.gloss ?? 0.35, shine: o.shine ?? 12, curve: o.curve }); },
    /** a cast shadow of `from` on `onto`, (dx, dy) away from the light; s 2 = a deep one */
    cast(from, onto, dx, dy, s = 1) { c.castValue(v, from, onto, dx, dy, { mul: s > 1 ? 0.38 : 0.6 }); },
    /** a designed shadow ('sh', 'deep') or light ('hi') shape */
    shade(shapes, lvl, on = null) { c.valueShape(v, shapes, lvl === 'deep' ? 0.4 : lvl === 'sh' ? 0.68 : lvl === 'hi' ? 0.97 : lvl, { mode: lvl === 'hi' ? 'max' : 'mul', on }); },
    /** a 1-px crease (dark) */
    crease(pts, on, s = 1) { c.valueLine(v, pts, s > 1 ? 0.3 : 0.55, { mode: 'mul', on }); },
    /** a lit edge `w` design units wide on the side of part(s) `on` facing the light */
    litEdge(on, w, add = 0.25) { c.crescentValue(v, on, w, add, { dir: [-1, -1], mode: 'add' }); },
    /** a designed shadow plane with a hand-placed terminator and its glowing band (light2d terminator) */
    term(on, shapes, o = {}) { return c.terminator(v, on, shapes, { ...o, band: 0 }); },
    paint(mats) { c.paintLight(v, mats, { strip: 0 }); },
  };
}

// the ramps: value -> palette key by THRESHOLDS (key, upper bound, key, upper bound, ..., last key), so each band's
// width is a design decision. Hue-shifted: the shadows lean cool (violet), the lights warm, and a saturated key sits at
// the terminator value (0.46 to 0.55, where `terminator` puts its band) so skin and fur glow there.
const tones = (...a) => Array.from({ length: 81 }, (_, i) => { const t = i / 80; for (let j = 1; j < a.length; j += 2) if (t < a[j]) return a[j - 1]; return a[a.length - 1]; });
const RAMPS = {
  fur: tones('В', 0.47, 'Г', 0.7, 'Д'),
  furD: tones('Й', 0.47, 'В', 0.76, 'Г'),
  white: tones('Ж', 0.47, 'З', 0.76, 'И'),
  brow: tones('Ж', 0.4, 'З', 0.64, 'И'),
  mask: tones('Й', 0.62, 'К'),
  earIn: tones('Й', 0.5, 'Л'),
  yel: tones('o', 0.45, 'y', 0.8, 'Y'),
  chrome: tones('П', 0.42, 'Р', 0.76, 'С'),
  rubber: tones('Т', 0.5, 'У', 0.84, 'Ф'),
  scarf: tones('М', 0.47, 'Н', 0.8, 'О'),
  black: tones('А', 0.8, 'Т'),
};

// ============================== THE RACCOON ==============================
const RZ = 1.15, ROX = 132 - 134 * RZ, ROY = 78 - 80 * RZ;   // visible window in design units: x 19..221, y 12..193
const HEADC = [186, 92];   // fur flows away from the nose
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k * RZ, k * ROX, k * ROY);
  const fine = k >= 0.9;
  const nl = { line: null };
  const L = lighting(c);

  // ---- the pump's axis first (it decides where the paws go): foot at the lower right, the handle up beside the ear ----
  const FOOT = [170, 172], TOP = [42, 65], PL = Math.hypot(TOP[0] - FOOT[0], TOP[1] - FOOT[1]);
  const sc = PL / 180, uX = (TOP[0] - FOOT[0]) / PL, uY = (TOP[1] - FOOT[1]) / PL;
  let nX = -uY, nY = uX; if (-nX - nY < 0) { nX = -nX; nY = -nY; }
  const at = (s, o = 0) => [FOOT[0] + uX * s * sc + nX * o, FOOT[1] + uY * s * sc + nY * o];
  // the far hand holds the barrel from behind (hidden by it); the near paw grips it over the chest
  const HN = 50;
  const wristN = at(HN, -14);

  // ---- the tail curling up beside the body at the lower left, tapering to a point with a dark last ring ----
  const tailC = [[106, 172], [82, 176], [63, 169], [53, 155], [51, 141], [53, 130], [56, 120]];
  // thick (about 35 px at the base on the poster), tapering only to about 60%, then a soft point over the last 15%
  const tailW = (t) => (20 + 7 * Math.sin(Math.PI * Math.min(1, t * 1.2))) * (1 - 0.37 * t * t) * (t > 0.8 ? 1 - 0.58 * ((t - 0.8) / 0.2) ** 2 : 1);
  c.shape('tail', tube(tailC, tailW, undefined, 12), 'fur', nl);
  const tcc = curve(tailC, 12), tn = tcc.length;
  const tailAt = (f) => { const i = Math.round(f * (tn - 1)), a = tcc[Math.max(0, i - 1)], b = tcc[Math.min(tn - 1, i + 1)], [dx, dy] = norm(b[0] - a[0], b[1] - a[1]); return { p: tcc[i], dx, dy, px: -dy, py: dx }; };
  /** a hand-placed tuft: a curved hook leaving the edge at point p (outward normal n, growth direction t), len long, w wide at the root */
  const hook = (p, n, t, len, w) => blob([[p[0] - t[0] * w / 2 - n[0], p[1] - t[1] * w / 2 - n[1]], [p[0] + n[0] * len * 0.55 + t[0] * len * 0.1, p[1] + n[1] * len * 0.55 + t[1] * len * 0.1],
    [p[0] + n[0] * len + t[0] * len * 0.75, p[1] + n[1] * len + t[1] * len * 0.75, 1], [p[0] + n[0] * len * 0.35 + t[0] * w * 0.7, p[1] + n[1] * len * 0.35 + t[1] * w * 0.7], [p[0] + t[0] * w / 2 - n[0], p[1] + t[1] * w / 2 - n[1]]]);
  for (const [fr, len, w] of [[0.07, 6, 7.6], [0.3, 4.6, 5.6], [0.47, 3.2, 4.2], [0.52, 2.6, 3.4], [0.69, 4.2, 5]]) {
    const { p, dx, dy, px: a, py: b } = tailAt(fr), sgn = (p[0] - 82) * a + (p[1] - 148) * b > 0 ? 1 : -1, hw = tailW(fr) / 2;
    c.shape('tail', hook([p[0] + a * sgn * hw, p[1] + b * sgn * hw], [a * sgn, b * sgn], [dx, dy], len, w), 'fur', nl);
  }
  for (const [f, u] of [[0.2, 3.2], [0.38, 3.2], [0.56, 3], [0.74, 2.8], [0.93, 4.5]]) {
    const { p, dx, dy, px: px2, py: py2 } = tailAt(f), bow = 2.2;   // a ring that wraps the cylinder: its edges bow along it
    c.paint('tail', blob([[p[0] - px2 * 16 - dx * u, p[1] - py2 * 16 - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + px2 * 16 - dx * u, p[1] + py2 * 16 - dy * u],
      [p[0] + px2 * 16 + dx * u, p[1] + py2 * 16 + dy * u], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - px2 * 16 + dx * u, p[1] - py2 * 16 + dy * u]], 6), 'mask');
  }

  // ---- the torso: one stout mass, a cream bib between the scarf and the forearm, 6 deliberate tufts at the bottom
  //      (pointing down and outward, the way the fur grows) ----
  c.shape('body', blob([[104, 108], [90, 118], [84, 134], [83, 152], [86, 166], [94, 176], [110, 181], [128, 183], [146, 180], [160, 174], [166, 164], [170, 150], [168, 130], [158, 116], [144, 108]]), 'fur', nl);
  for (const [x, y, nx, ny, tx, ty, len, w] of [[94, 176, -0.4, 1, -1, 0.2, 4.6, 6], [112, 181, 0, 1, -1, 0.1, 3.4, 4.4], [118, 182, 0, 1, -1, 0.1, 2.6, 3.4], [136, 182, 0.1, 1, 1, 0.1, 5.4, 6.6], [156, 176, 0.5, 1, 1, -0.1, 3.6, 4.6]]) {
    const [ax, ay] = norm(nx, ny), [bx, by] = norm(tx, ty);
    c.shape('body', hook([x, y], [ax, ay], [bx, by], len, w), 'fur', nl);
  }
  c.paint('body', tufted(blob([[98, 120], [150, 118], [152, 136], [142, 149], [126, 153], [108, 152], [98, 140]]), { amp: 2.6, period: 5, where: (x, y) => (y > 142 && x < 121 ? 1 : 0), flow: [0, 1], lean: 0.6, seed: 52 }), 'white');

  // ---- arms from the shoulders: the coat turning. The far forearm goes behind the barrel ----
  const armPath = (pts, w0, w1, seed, flow) => tufted(tube(pts, (t) => w0 + (w1 - w0) * t, undefined, 12), { amp: 2, period: 6, flow, lean: 0.7, seed, where: () => 0 });
  c.shape('armR', armPath([[160, 120], [176, 136]], 19, 15, 60, [0.4, 1]), 'fur', nl);
  c.shape('armL', armPath([[98, 122], [82, 152], wristN], 20, 11, 70, [-0.3, 1]), 'fur', nl);

  // ---- the green knit scarf: the band round the neck, the loose end flung back over the far shoulder ----
  c.shape('scarfEnd', blob([[165, 121], [173, 120], [177, 125], [180, 130], [184, 137, 1], [179, 139], [174, 136], [168, 128], [163, 122]]), 'scarf', nl);
  for (const [x, y, l] of [[175, 137], [177.6, 138.2], [180.2, 139], [182.8, 138.6]].map(([x, y], i) => [x, y, [2.4, 3, 2.6, 2][i]])) c.shape('scarfEnd', bar([x, y], [x + l * 0.4, y + l], 1.5), 'scarf', nl);
  c.shape('scarf', blob([[92, 110], [112, 115], [140, 115], [168, 106], [174, 114], [170, 126], [146, 133], [120, 135], [100, 131], [90, 121]]), 'scarf', nl);
  c.shape('scarfKnot', ell(170, 120, 6, 5.2, -0.4), 'scarf', nl);   // the bunched knot the end comes from

  // ---- ears (behind the head): fur outside, a dark hollow with a dusty pink inside ----
  const rot = (pts, cx, cy, a) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
  c.shape('earL', tufted(blob(rot([[96, 56], [98, 38], [103, 26], [110, 22], [116, 30], [124, 46]], 110, 50, -0.14)), { amp: 2.2, period: 5.5, where: (x) => (x < 106 ? 1 : 0), flow: [-1, 0], seed: 8 }), 'fur', nl);
  c.paint('earL', blob(rot([[103, 52], [105, 38], [109, 31], [113, 32], [119, 47]], 110, 50, -0.14)), 'mask');
  c.paint('earL', blob(rot([[107, 50], [109, 40], [112, 36], [116, 47]], 110, 50, -0.14)), 'earIn');
  c.shape('earR', tufted(blob([[148, 44], [156, 30], [163, 22], [167.6, 22.4], [170.2, 25.2, 1], [168.2, 29.4, 1], [172.6, 30.4, 1], [174.6, 38], [176, 52]]), { amp: 2, period: 5, where: (x, y) => (x > 172 && y > 36 ? 1 : 0), flow: [1, 0.3], seed: 10 }), 'fur', nl);
  c.paint('earR', blob([[155, 44], [160, 34], [165, 29], [169, 31], [171, 46]]), 'mask');
  c.paint('earR', blob([[159, 43], [164, 34.5], [167, 33.5], [168.5, 45]]), 'earIn');

  // ---- the head: one mass; its markings are local colour only (the light comes later) ----
  c.shape('head', tufted(blob([
    [94, 58], [106, 45], [124, 38], [144, 38], [160, 44], [172, 54], [178, 66], [180, 78], [184, 92], [186, 102],
    [178, 112], [162, 119], [144, 122], [126, 121], [108, 118], [92, 112], [82, 102], [82, 88], [87, 72],
  ]), {
    amp: 6, period: 9,
    where: (x, y) => (x < 100 && y > 78 ? 1.2 : y < 46 ? 0.3 : 0),
    flow: (x, y) => (y > 100 ? norm(x < 140 ? -0.6 : 0.6, 1) : headFlow(x, y)), lean: 0.6, seed: 12,
  }), 'fur', nl);
  c.paint('head', tufted(blob([[135, 39], [148, 40], [151, 52], [149, 65], [143, 70], [138, 56]]), { amp: 1.8, period: 4.5, where: () => 1, flow: (x, y) => (y < 54 ? [0, -1] : [0, 1]), lean: 0.6, seed: 16 }), 'furD');
  c.paint('head', blob([[78, 90], [96, 93], [112, 99], [124, 104], [128, 112], [118, 120], [100, 118], [84, 110], [76, 98]]), 'white');
  c.paint('head', blob([[170, 98], [180, 96], [190, 104], [186, 114], [174, 110]]), 'white');
  c.paint('head', tufted(blob([[92, 64.6], [98, 56], [110, 50.6], [124, 49.6], [134, 52.8], [136, 58.6], [124, 57.4], [110, 59.4], [98, 65.6]]), { amp: 2, period: 3.6, where: (x, y) => (y < 56 ? 1 : 0.4), flow: [-0.8, -0.6], lean: 0.7, seed: 13 }), 'brow');
  c.paint('head', tufted(blob([[152, 59.4], [158, 53.6], [168, 51.6], [176, 53.6], [180, 58.4], [176, 61], [166, 58.4], [156, 62]]), { amp: 1.8, period: 3.6, where: (x, y) => (y < 57 ? 1 : 0.4), flow: [0.6, -0.8], lean: 0.6, seed: 14 }), 'brow');
  c.paint('head', tufted(blob([
    [80, 84], [84, 74], [94, 66], [108, 63], [122, 63], [132, 66], [140, 70], [146, 66], [156, 62], [168, 61], [178, 64], [182, 72],
    [178, 82], [168, 86], [158, 87], [150, 85], [144, 80], [138, 84], [132, 91], [120, 95], [106, 96], [92, 98], [82, 96],
  ]), { amp: 2.6, period: 4, where: (x, y) => (x < 100 ? 1 : y > 86 && x < 136 ? 0.6 : 0), flow: [-0.7, 0.7], lean: 0.7, seed: 15 }), 'mask');
  c.paint('head', blob([[100, 99], [118, 97], [132, 91], [142, 86], [152, 90], [158, 104], [168, 112], [150, 120], [128, 122], [108, 118]]), 'white');
  c.shape('snout', blob([[146, 84], [156, 80], [170, 80], [182, 84], [190, 90], [192, 97], [186, 103], [174, 106], [160, 106], [150, 101]]), 'white', nl);
  c.paint('snout', blob([[146, 84], [154, 80.5], [164, 80], [156, 84], [149, 90]]), 'fur');
  c.shape('nose', blob([[180, 88], [186, 85], [193, 86], [197, 91], [195, 97], [189, 99], [182, 97], [179, 92]]), 'black', nl);

  // ---- the pump across the chest, then the near paw gripping it: a small wrist, the back of the hand, three rounded
  //      knuckles over the barrel, the thumb merged into the mass on the handle side ----
  pumpParts(c, at, sc);
  const AN = (s, o) => at(HN + s, -o);
  c.shape('pawN', blob([AN(-2.8, 13), AN(-5.8, 6), AN(-7.2, -1), AN(-7, -5.6), AN(-6.4, -8.6), AN(-5.4, -10), AN(-3.8, -10.2), AN(-2.4, -8.1), AN(-1.2, -9.9), AN(0, -10.5),
    AN(1.2, -9.9), AN(2.4, -8.1), AN(3.8, -10.2), AN(5.4, -10), AN(6.6, -8.6), AN(7.6, -5.6), AN(9.6, -6.6), AN(11.4, -7.6), AN(12.4, -5), AN(11.6, -0.8), AN(9.6, 3.2), AN(6.6, 4.6), AN(3, 13)]), 'fur', nl);

  // ============ LIGHT: a starting value map from the volumes, then the light DESIGNED on top ============
  const head = ['head', 'snout'];
  const pumpAll = ['barrel', 'cap7', 'cap137', 'rod', 'boss', 'gauge', 'foot', 'handle'];
  const front = ['pawN', ...pumpAll];
  // the tail: a cylinder along its curve
  c.curveTubeField(L.v, 'tail', tcc, (t) => tailW(t) / 2);
  // the body: planar (a low R), so the light makes planes, not rings parallel to the outline
  L.form('body', { R: 12, curve: (x) => Math.min(1, x * 1.05 + 0.08), front: ['armL', 'armR', 'scarf', 'scarfEnd', 'scarfKnot', ...head, ...front] });
  c.valueShape(L.v, [[60, 146], [150, 146], [140, 166], [128, 196], [60, 200]], 0.68, { mode: 'set', on: 'body' });   // the lit belly plane
  const tan = (x) => Math.min(0.78, x);   // the forearm and paw stay coat tan (J): one group below the cream bib
  L.form('armR', { R: 7, front, k: 1, prims: [cap(160, 120, 176, 136, 9, 7.5)] });
  L.form('armL', { R: 7, curve: tan, front, k: 1, prims: [cap(98, 122, 82, 152, 10, 8), cap(82, 152, ...wristN, 8, 6)] });
  L.form('scarfKnot', { R: 3.4, front: ['head', 'snout'] });
  L.form(['scarf', 'scarfEnd'], { R: 5, height: bumps([{ l: [[92, 124], [120, 128], [146, 126], [170, 118]], w: 3, a: -0.6 }]), front: [...head, ...front] });
  L.form('earL', { R: 4 });
  L.form('earR', { R: 4 });
  c.valueShape(L.v, [[140, 10], [190, 10], [190, 60], [140, 60]], 0.72, { mode: 'mul', on: 'earR' });   // the far ear sits in the head's shadow side
  L.form(head, {
    R: 16, k: 1.2, front: ['nose', ...pumpAll],
    prims: [dome(132, 74, 46, 36), cap(150, 95, 186, 93, 11, 8), dome(100, 106, 20, 13), dome(154, 99, 5.4, 4.6)],
    height: bumps([
      { l: [[96, 64], [112, 57], [132, 58]], w: 6, a: 2.6 }, { l: [[156, 58], [168, 54], [180, 58]], w: 5, a: 2 },   // brow ridges
      { e: [122, 78, 13, 9], a: -3 }, { e: [161, 76, 10, 7], a: -2.4 },                                                  // eye sockets
    ]),
  });
  L.form('nose', { R: 3, gloss: 0.5, shine: 14 });
  L.tube('barrel', at(11), at(140), 6.5);
  L.tube('cap7', at(7), at(14), 8.5); L.tube('cap137', at(137), at(144), 8.5);
  L.tube('rod', at(144), at(176), 2.2); L.tube('boss', at(173), at(183), 4.3);
  L.tube('handle', at(178, -25), at(178, 25), 4, { gloss: 0.2 });
  L.tube('foot', at(3.5, -23), at(3.5, 23), 3.5, { gloss: 0.2 });
  L.form(['hose', 'chuck'], { R: 2.2, smooth: 0 });
  L.form('gauge', { R: 3 });
  { // the paw: mostly lit fur, the knuckle row catching the light
    const kn = [-4.6, 0, 4.6].map((s) => { const [x, y] = AN(s, -6.8); return dome(x, y, 3, 3); });
    kn.push((() => { const [x, y] = AN(8.8, 0); return dome(x, y, 3, 3.4); })());   // the thumb's ball
    L.form('pawN', { R: 5, prims: kn, k: 0.5, curve: tan });
  }

  // ---- the designed shadow planes, each with one hand-placed terminator (35 to 45% of each mass in shadow) ----
  // body + far arm: the terminator runs from under the scarf end at the far shoulder down to the bottom centre
  L.term(['body', 'armR'], [[152, 108], [230, 100], [230, 210], [116, 210], [120, 190], [127, 172], [138, 152], [147, 130]], { squash: [0.2, 0.2], band: 0.8 });
  // tail: a cylinder, its terminator along the underside (the side of the curve away from the light)
  {
    const edge = [], far = [];
    for (let f = 0; f <= 1.001; f += 0.05) { const { p, px: a, py: b } = tailAt(Math.min(1, f)), s = a + b > 0 ? 1 : -1; edge.push([p[0] + a * s * 1.5, p[1] + b * s * 1.5]); far.push([p[0] + a * s * 30, p[1] + b * s * 30]); }
    L.term('tail', [...edge, ...far.reverse()]);
  }
  // head: the far cheek behind the eye and the jaw under the snout turn away
  L.term('head', [[166, 40], [210, 40], [210, 132], [128, 132], [140, 121], [154, 115], [166, 109], [178, 100], [181, 86], [179, 70], [172, 54]], { squash: [0.2, 0.3] });
  L.term('snout', [[146, 100], [200, 94], [200, 112], [146, 112]], { squash: [0.26, 0.3], band: 0 });
  c.valueShape(L.v, blob([[150, 83.4], [162, 80.6], [176, 81.6], [186, 86], [176, 88], [160, 88.6]]), 0.7, { mode: 'max', on: 'snout' });
  // the scarf: its lower edge and the end over the far shoulder
  L.term(['scarf', 'scarfEnd'], [[154, 100], [210, 100], [210, 170], [88, 170], [100, 129], [122, 131], [146, 127]], { band: 0.8 });
  c.valueLine(L.v, [[169, 120], [174, 128], [178, 135]], 0.55, { mode: 'mul', on: 'scarfEnd' });   // the end's one fold
  L.term('scarfKnot', [[167, 100], [190, 100], [190, 130], [160, 130], [166, 118]], { band: 0 });   // the knot's shadow side
  L.cast('scarfKnot', ['scarf', 'scarfEnd'], 1, 2);
  // the near paw: the fingers turning over the barrel's edge
  L.term('pawN', [AN(-12, -8), AN(12, -8), AN(12, -14), AN(-12, -14)], { band: 0 });
  { const [cx, cy] = AN(0, 0); L.term('pawN', [[cx + 13, cy - 11], [cx + 33, cy + 9], [cx + 9, cy + 33], [cx - 11, cy + 13]], { band: 1 }); }   // its underside turns away
  // the cream lower face catches the light: one designed light shape under the mask (the face stays the contrast peak)
  c.valueShape(L.v, blob([[94, 97], [110, 98], [124, 95], [138, 88], [148, 90], [152, 104], [140, 112], [120, 114], [102, 112], [92, 105]]), 0.64, { mode: 'max', on: 'head' });

  // ---- cast shadows (they cross materials), creases, reflected light ----
  L.cast('snout', 'head', 1, 3.5);
  L.cast('nose', 'snout', 1, 2.2);
  L.cast(['head', 'snout'], ['body', 'armL', 'armR'], 2, 6);
  c.valueShape(L.v, blob([[90, 108], [120, 113], [150, 112], [176, 104], [176, 116], [150, 120], [120, 121], [92, 118]]), 0.6, { mode: 'mul', on: ['scarf', 'scarfEnd'] });
  L.cast(['scarf'], ['body', 'armL', 'armR'], 1.2, 3);
  L.cast(['earL'], ['head'], 1.5, 2.5);
  // the forearm: a lit top edge, a crisp cast shadow on the bib below it
  L.litEdge('armL', 1.4, 0.2);
  L.cast('armL', 'body', 2.4, 3.6);
  L.cast(pumpAll, ['body', 'scarf', 'scarfEnd', 'armL', 'armR', 'tail'], 2.6, 3.2);
  L.cast('pawN', ['barrel', 'gauge', 'scarf', 'body', 'armL'], 1.4, 2);
  L.cast('pawN', 'armL', 1, 1.5);
  for (const s of [-2.3, 2.3]) L.crease([AN(s, -3.6), AN(s, -7.8)], 'pawN', 2);   // two creases between the knuckles
  c.crescentValue(L.v, 'tail', 2.2, 0.08, { dir: [0.3, 1], mode: 'add', maxV: 0.42 });
  { // falloff: below y 132 the light dims gradually, up to 14% at the bottom: both groups darken, neither disappears
    const pm = c.partMask(['body', 'tail', 'armL', 'pawN']);
    for (let i = 0; i < pm.length; i++) if (pm[i]) { const y = ((i / c.w) | 0) / c.S - c.oy / c.S; if (y > 132) L.v[i] *= 1 - 0.14 * Math.min(1, (y - 132) / 58); }
  }
  L.paint(RAMPS);
  // ============ the cartoon details: the face, the gauge, the shine (flat keys, painted after the light) ============
  const px = Math.max(1, Math.round(k));             // a bold detail pixel: 1 at k 1, 2 at k 1.5 (rounded up below)
  const g2 = k >= 1.4 ? 2 : 1;
  const block = (x, y, n, col) => { const X = Math.round(c.X(x)), Y = Math.round(c.Y(y)); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) c.img.set(X + i, Y + j, col); };
  // the eyes: big white sclera, a big amber iris with a big pupil, a heavy sly lid across the top
  const eye = (cx, cy, rx, ry, n, look) => {
    c.shape(n, blob([[cx - rx, cy + 0.8], [cx - rx * 0.6, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.6], [cx + rx * 0.6, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.95]]), 'Ц', nl);
    const ix = cx + look, iy = cy + ry * 0.12, ir = ry * 0.86;
    c.paint(n, ell(ix, iy, ir * 0.92, ir), 'Ш');
    c.paint(n, ell(ix, iy - ir * 0.55, ir * 1.1, ir * 0.62), 'Щ');            // the lid's shadow on the iris
    c.paint(n, ell(ix + ir * 0.06, iy + ir * 0.05, ir * 0.5, ir * 0.58), 'А');  // the pupil
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.25], [cx, cy - ry * 0.38], [cx - rx - 2, cy - ry * 0.05]]), 'А');   // the heavy lid
    c.paint(n, blob([[cx - rx, cy - ry * 0.05], [cx, cy - ry * 0.38], [cx + rx, cy - ry * 0.25], [cx + rx, cy + ry * 0.1], [cx, cy - ry * 0.05], [cx - rx, cy + ry * 0.3]]), 'Ч', { only: ['Ц'] });   // the lid's shadow on the white
    block(ix - ir * 0.5, iy - ir * 0.3, Math.max(2, Math.round(2 * k)), 'Ц');   // one big catchlight
  };
  eye(122, 77, 11, 9, 'eyeN', 3);
  eye(162, 75, 7.6, 7, 'eyeF', 2.4);
  // the nose: one big flat glint on the top, the nostril
  block(183.5, 87.6, Math.max(2, Math.round(2 * k)), 'С');
  c.dot(185, 95.5, 'А'); c.dot(191.5, 95.5, 'А');
  // the toothy one-sided grin: an open mouth under the nose, the corner tucked up into the cheek, a row of teeth
  {
    const U = [[186, 100.4], [178, 104.2], [168, 104.8], [160, 102.2], [154.6, 98]];
    const D = [[154.6, 98], [159, 105], [166, 109.6], [175, 110.2], [182, 106.4], [186, 100.4]];
    c.shape('mouth', [...curve(U, 8), ...curve(D, 8)], 'Ъ', nl);
    c.paint('mouth', [...curve([[187, 99], [178, 103], [168, 103.6], [160, 101], [153, 96.6]], 8), ...curve([[153, 96.6], [160, 103.6], [168, 106.4], [178, 106], [187, 102.4]], 8)], 'Ц');   // the teeth
    c.paint('mouth', ell(172, 110.4, 6, 2.6), 'Ы');   // the tongue
    for (const tx of [163.5, 171]) c.stroke([[tx, 103], [tx, 105.6]], 'Ч', { on: 'mouth', line: false });   // tooth gaps
    c.stroke([[154.6, 98], [152.4, 95.6]], 'А', { t: g2, line: false });   // the dimple at the corner
  }
  { // the gauge: a white face, a grey lower crescent, the red needle
    const g = at(30 / sc);
    c.paint('gauge', ell(g[0], g[1], 6.2, 6.2), 'С');
    c.paint('gauge', ell(g[0] + 1.6, g[1] + 1.8, 5.4, 5.4), 'Р', { only: ['С'] });
    c.paint('gauge', ell(g[0] - 0.4, g[1] - 0.4, 5.2, 5.2), 'С');
    c.stroke([g, [g[0] + 4, g[1] - 3]], 'Э', { on: 'gauge', t: g2, line: false });
    c.dot(g[0], g[1], 'А');
  }
  { // one bold cartoon shine down the barrel's lit side, a glint on the collar
    const a = at(70), b = at(128), sm = c.mask(bar([a[0] - nX * 3, a[1] - nY * 3], [b[0] - nX * 3, b[1] - nY * 3], 1.6, true)), bid = c.id('barrel');
    for (let i = 0; i < sm.length; i++) if (sm[i] && c.part[i] === bid) c.img.px[i] = 'Ц';
  }

  // ============ the line: 1 px wherever a form lies over another (on the back form), 2 px round the silhouette ============
  const groups = [['head', 'snout'], ['scarf', 'scarfEnd', 'scarfKnot']];
  const grp = new Map(); groups.forEach((g, gi) => g.forEach((n) => grp.set(c.id(n), 'g' + gi)));
  const G = (id) => grp.get(id) ?? id;
  {
    const W = c.w, H = c.h, P = c.part, hit = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, a = P[i]; if (a < 0 || c.img.px[i] === null) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const b = P[Y * W + X]; if (b > a && G(b) !== G(a) && c.img.px[Y * W + X] !== null) { hit.push(i); break; }
      }
    }
    for (const i of hit) c.img.px[i] = 'А';
    if (k >= 1.4) { // thicken into the back form by one more pixel (a bold 2-px line), never into a detail
      const L1 = new Set(hit), more = [];
      for (const i of hit) { const x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (!L1.has(j) && P[j] === P[i] && c.img.px[j] !== null && c.img.px[j] !== 'А') more.push(j); } }
      for (const j of more) c.img.px[j] = 'А';
    }
  }
  c.despeckle(null, ['W', 'Ц', 'С', 'Э', 'А', 'А']);
  const outer = 2;
  for (let p = 0; p < outer; p++) { c.silhouette({ dark: 'А' }); if (p === 0) c.cleanSilhouette(); }
  c.cleanSilhouette({ nubs: false, passes: 1 });
  return c.img;
}

/** the floor pump on ONE straight axis (at(s, o): s along from the foot, o across): yellow barrel, chrome caps and rod,
 * a black T-handle and foot plate, a round gauge, the hose curling off the foot. Parts only: the light comes later. */
function pumpParts(c, at, sc) {
  const nl = { line: null };
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  // the hose leaves the foot and curls up on the right
  const hose = [at(3, 18), [190, 166], [202, 167], [208, 156], [205, 145]];
  c.shape('hose', tube(hose, 4.4, 4.4, 12), 'rubber', nl);
  const hp = curve(hose), e = hp[hp.length - 1], d = hp[hp.length - 4], l = Math.hypot(e[0] - d[0], e[1] - d[1]) || 1, ex = (e[0] - d[0]) / l, ey = (e[1] - d[1]) / l;
  c.shape('chuck', bar(e, [e[0] + ex * 8, e[1] + ey * 8], 6), 'chrome', nl);
  c.shape('foot', box(0, 7, 46), 'rubber', nl);
  c.shape('barrel', box(11, 140, 13), 'yel', nl);
  c.shape('cap7', box(7, 14, 17), 'chrome', nl);
  c.shape('cap137', box(137, 144, 17), 'chrome', nl);
  c.shape('rod', box(144, 176, 4.4), 'chrome', nl);
  c.shape('handle', bar(at(178, -25), at(178, 25), 8, true), 'rubber', nl);
  c.shape('boss', box(173, 183, 8.6), 'chrome', nl);
  const g = at(30 / sc);
  c.shape('gauge', ell(g[0], g[1], 8.6, 8.6), 'chrome', nl);
}

export function portraitsPreview() {
  return { frames: [raccoonPortrait2d('smirk', 1.5), raccoonPortrait2d('smirk', 1)], cols: 2 };
}
