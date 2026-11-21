// M4.9: the hero portraits (VERSUS posters, Dog Fjord's dialogue portraits), redrawn over a 10-round painter/critic loop.
// Ivan's notes: "drawing from shades, not from shapes" (a painter thinks about how light falls, where the shadows and the
// highlights are, not about separate parts); keep raccoon M4.8 iter_02's pose and vibe with the pump YELLOW, as in the
// game, and straight; keep Dog Fjord M4.8 iter_01's minimalism on M4.7 iter_04's head.
// The method, pure 2D pixel art from code (tools/lib/draw2d.mjs + tools/lib/light2d.mjs):
//   1. every figure is laid in as flat silhouettes holding MATERIALS (coat, cream fur, mask, yellow plastic, skin, navy
//      cloth...), with no outlines inside the figure;
//   2. ONE light map is built for the whole picture, light from the upper left: lit volumes as a starting map (lightField,
//      tubeField for the pump, curveTubeField for the tail), then the light DESIGNED on top: one hand-placed terminator
//      per mass (a shadow plane with a warm glow where it turns), cast shadows instead of outlines (the head on the scarf
//      and chest, the forearm on the cream bib, the paw on the barrel, the jowls on the collar), a few designed light
//      shapes, the light falling off toward the bottom so the faces are the focus;
//   3. each material is quantized onto its own hue-shifted ramp by thresholds (cool violet shadows, warm lights), hard
//      band edges, no dither (paintLight);
//   4. accents last and few: the eyes as lit wet spheres, the nose's one sharp highlight, the raccoon's head fur only
//      where light meets shadow, reflected light only as a band inside a shadow.
// Raccoon: the near arm is the coat turning (a lit top edge, a cast shadow on the bib), the paw a grip on the barrel.
// Dog Fjord: a cartoon bulldog, never a real person's likeness; one far-side shadow plane wrapping under the jowls; grin,
// laugh and shock lit the same way.
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../../../lib/draw2d.mjs';
import '../../../lib/light2d.mjs';
import { dome, cap } from '../../../lib/light2d.mjs';
import { tones, hk, locks, knit, chromeTube, ribs } from './detail.mjs';

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
    term(on, shapes, o = {}) { return c.terminator(v, on, shapes, o); },
    paint(mats) { c.paintLight(v, mats, { strip: 0 }); },
  };
}

// "detailed": long ramps (8 to 11 tones per material, Hiragana keys from detail.mjs), so a lock of fur, a knit stitch or
// a reflection moves ONE tone and the texture stays inside the form's light. Hue-shifted: violet shadows, warm lights,
// a saturated key at the terminator (0.46 to 0.55).
const RAMPS = {
  fur: tones('@', 0.08, '#36283a', 0.17, '#4a3846', 0.25, 'º', 0.32, '#6a525b', 0.38, 'ª', 0.43, '#8d6b62', 0.48, '©', 0.55, '#a48d7f', 0.62, 'J', 0.69, '#c0aa96', 0.77, '#cdb89f', 0.86, '®', 0.95, '+'),
  furD: tones('@', 0.16, '#36283a', 0.3, '$', 0.44, 'º', 0.56, 'I', 0.7, '#76616a'),
  white: tones('#6b5a63', 0.1, '&', 0.2, '²', 0.3, '#aea0a6', 0.38, 'J', 0.46, '#c2ae9e', 0.53, '*', 0.61, '#d7c8b5', 0.71, '+', 0.85, '#efe7d8'),
  mask: tones('@', 0.14, '#2b2030', 0.25, '#', 0.37, '#3f3041', 0.49, '$', 0.62, '#594654', 0.76, 'I'),
  earIn: tones('@', 0.2, '#', 0.34, '#553844', 0.45, "'", 0.58, '#845b65', 0.72, '-', 0.86, '#b08890'),
  yel: tones('#5e2a10', 0.1, '|', 0.2, '#bf5c17', 0.3, 'o', 0.38, '#e27e22', 0.46, '¥', 0.53, '#f0ad2a', 0.62, 'y', 0.78, '#f9da55', 0.89, 'Y', 0.97, '#fffbe0'),
  chrome: tones('#17162a', 0.12, '1', 0.22, '#3a3b54', 0.32, '3', 0.42, '#6b6e88', 0.52, '5', 0.62, '6', 0.72, '7', 0.83, '#e3e4ec', 0.93, 'W'),
  rubber: tones('#151426', 0.16, '#1f1e33', 0.28, '1', 0.4, '#313048', 0.5, '2', 0.6, '#44455e', 0.7, '3', 0.83, '4'),
  scarf: tones('#0c2519', 0.14, 'e', 0.25, '#1e5531', 0.36, 'E', 0.47, '#3b8a3d', 0.57, 'l', 0.69, '#7cbd4f', 0.81, 'L', 0.92, '#c8ec82'),
  black: tones('@', 0.32, '1', 0.5, '2', 0.66, '3', 0.84, '#6c6f88'),
  brow: tones('#6b5a63', 0.1, '&', 0.2, '²', 0.32, '#c2ae9e', 0.44, '*', 0.54, '#d7c8b5', 0.64, '+', 0.78, '#efe7d8', 0.92, 'W'),
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
    amp: 5, period: 6.5,
    where: (x, y) => (x < 100 && y > 78 ? 1.2 : x > 172 && y > 98 ? 0.8 : y > 112 ? 0.55 : y < 46 ? 0.3 : 0),
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
  const PUMP = pumpParts(c, at, sc);
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
  L.form(['scarf', 'scarfEnd'], { R: 5, height: bumps([{ l: [[92, 124], [120, 128], [146, 126], [170, 118]], w: 3, a: -1.5 }]), front: [...head, ...front] });
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
  surfaceDetail(c, L.v, { at, tcc, wristN, PUMP, k, AN, sc });
  L.paint(RAMPS);

  // ---- accents with purpose, last: lit fur clusters along the light edge, pointing the way the fur grows ----
  if (fine) {
    const pumpIds = [...pumpAll, 'hose', 'chuck'].map((n) => c.id(n));
    const wedge = (x, y, dx, dy, len, col) => {
      const [ux, uy] = norm(dx, dy), n = Math.max(2, Math.round(len * c.S));
      for (let s = 0; s < n; s++) for (const w of s < n / 3 ? [-1, 0, 1] : s < (2 * n) / 3 ? [0, 1] : [0]) {
        const X = Math.round(c.X(x) + ux * s - uy * w), Y = Math.round(c.Y(y) + uy * s + ux * w);
        if (c.img.get(X, Y) !== null && !pumpIds.includes(c.part[Y * c.w + X])) c.img.set(X, Y, col);   // fur never lands on the pump
      }
    };
    for (const [x, y, dx, dy, l] of [[101, 50, -0.5, -0.9, 3], [113, 43, -0.3, -1, 3.4], [126, 40, -0.1, -1, 2.6], [92, 62, -0.9, -0.5, 3], [88, 76, -1, -0.2, 2.6], [95, 121, -0.7, -0.7, 3], [104, 116, -0.4, -1, 2.4]]) wedge(x, y, dx, dy, l, '®');
    for (const [x, y, dx, dy, l] of [[80, 96, -1, 0.3, 3], [84, 106, -0.9, 0.6, 3], [104, 120, -0.5, 1, 2.6]]) wedge(x, y, dx, dy, l, '+');
    // three lit wedges interlocking into the body's shadow plane along its terminator, pointing down the way the fur grows
    for (const [x, y, dx, dy, l] of [[95, 99, -0.6, -1, 3.6], [104, 98.6, -0.5, -1, 3], [114, 97.6, -0.4, -1, 2.6]]) wedge(x, y, dx, dy, l, '+');
  }

  // ---- the HEAD's fur (ref 03's hand-clustered strands), done WITH LIGHT: only where light meets shadow on the head
  //      and ears (the crown's light edge, the brow bands, the mask's edges, the forehead stripe, the ears), the lighter
  //      tone pokes 2 to 4 px strands into the shadow side and the darker into the lit side, along the fur's flow.
  //      Flat areas get nothing; the eyes (with their lids), the nose, the smirk and a band ~4 px round the pump are
  //      calm. 100% at k 1.5, 60% at k 1, none below k 0.9 (the small sizes are untouched). Fixed seeds: deterministic.
  if (k >= 0.9) {
    const before = c.img.px.slice();
    const dens = k >= 1.4 ? 1 : 0.6, gap = 2.2 / dens;
    const uniq = (r) => [...new Set(r)];
    const big = [[20, 0], [240, 0], [240, 220], [20, 220]];
    const zone = [big, ell(122, 77, 15, 11), ell(161, 75, 11, 9), ell(189, 92, 10, 9), [[148, 96], [176, 98], [176, 112], [148, 110]]];   // even-odd: the calm zones are holes
    const H = ['head', 'earL', 'earR', 'snout'], coat = uniq(RAMPS.fur), cream = uniq(RAMPS.white), mask = uniq(RAMPS.mask), stripe = uniq(RAMPS.furD);
    for (const R of [coat, cream, uniq(RAMPS.brow)]) for (let i = 0; i + 1 < R.length; i++) {
      c.furBreak(H, R[i + 1], R[i], { dir: headFlow, len: 2.8, gap, w: 2, seed: 300 + i, shapes: zone });           // light strands into the shadow
      c.furBreak(H, R[i], R[i + 1], { dir: headFlow, len: 2.4, gap: gap * 1.2, w: 2, seed: 340 + i, shapes: zone });   // dark strands into the light
    }
    // across the markings: the cream ruff and the brows break into the coat and the mask, the mask and the stripe into the coat
    for (const a of [...cream, ...uniq(RAMPS.brow)]) c.furBreak(H, a, [...coat, ...mask], { dir: headFlow, len: 2.8, gap, w: 2, seed: 360, shapes: zone });
    for (const a of coat) c.furBreak(H, a, [...cream, ...stripe], { dir: headFlow, len: 2.4, gap: gap * 1.2, w: 2, seed: 361, shapes: zone });
    for (const a of [...mask, ...stripe]) c.furBreak(H, a, [...coat, ...cream], { dir: headFlow, len: 2.4, gap: gap * 1.2, w: 2, seed: 362, shapes: zone });
    // the tail's rings: the dark rings and the coat interlock along the tail (strands both ways)
    const tdir = (x, y) => { let bi = 0, bd = 1e9; for (let i = 0; i < tcc.length; i++) { const d = (tcc[i][0] - x) ** 2 + (tcc[i][1] - y) ** 2; if (d < bd) { bd = d; bi = i; } } const a = tcc[Math.max(0, bi - 1)], b = tcc[Math.min(tcc.length - 1, bi + 1)]; return [b[0] - a[0], b[1] - a[1]]; };
    const tback = (x, y) => tdir(x, y).map((q) => -q);
    for (const a of mask) { c.furBreak('tail', a, coat, { dir: tdir, len: 3.2, gap: gap * 1.1, w: 2, seed: 370 }); c.furBreak('tail', a, coat, { dir: tback, len: 2.6, gap: gap * 1.3, w: 2, seed: 371 }); }
    for (const a of coat) { c.furBreak('tail', a, mask, { dir: tdir, len: 2.8, gap: gap * 1.2, w: 2, seed: 372 }); c.furBreak('tail', a, mask, { dir: tback, len: 2.4, gap: gap * 1.4, w: 2, seed: 373 }); }
    // the calm band round the pump: undo any strand within ~4 px of the barrel, caps and rod
    const pm = c.partMask(pumpAll), R4 = Math.max(1, Math.round(4 * (k / 1.5))), W2 = c.w, H2 = c.h;
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = y * W2 + x; if (c.img.px[i] === before[i]) continue;
      let near = false;
      for (let dy = -R4; dy <= R4 && !near; dy++) for (let dx = -R4; dx <= R4; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W2 && Y < H2 && dx * dx + dy * dy <= R4 * R4 && pm[Y * W2 + X]) { near = true; break; } }
      if (near) c.img.px[i] = before[i];
    }
  }

  // ---- details last, and few: the eyes, the nose's shine, the smirk, the gauge, the speculars, whiskers ----
  const eye = (cx, cy, rx, ry, n) => {
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.55, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.4], [cx + rx * 0.55, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.9]]), '*', nl);
    const ix = cx + rx * 0.26, iy = cy + 0.6, ir = ry * 1.2;
    c.paint(n, ell(ix, iy, ir, ir * 1.04), '<');                                                    // the limbal ring
    c.paint(n, ell(ix, iy, ir * 0.84, ir * 0.88), '>');
    c.paint(n, ell(ix + ir * 0.22, iy + ir * 0.36, ir * 0.58, ir * 0.46, -0.5), '{');              // light through the cornea...
    c.paint(n, ell(ix + ir * 0.36, iy + ir * 0.5, ir * 0.32, ir * 0.22, -0.5), '}');               // ...glows opposite the catchlight
    c.paint(n, ell(ix + 0.2, iy, ir * 0.38, ir * 0.46), '@');
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.3], [cx, cy - ry * 0.4], [cx - rx - 2, cy - ry * 0.15]]), '@');
    const lidSh = blob([[cx - rx, cy - ry * 0.3], [cx, cy - ry * 0.42], [cx + rx, cy - ry * 0.32], [cx + rx, cy + 0.6], [cx, cy + 0.2], [cx - rx, cy + 0.6]]);
    c.paint(n, lidSh, '#', { only: ['*'] });
    c.paint(n, lidSh, '<', { only: ['>', '{'] });
    const g = Math.max(1, Math.round(1.4 * k));
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(Math.round(c.X(ix - ir * 0.42)) + i, Math.round(c.Y(iy - ir * 0.16)) + j, 'W');
    if (k >= 0.9) c.dot(ix + ir * 0.5, iy + ir * 0.12, '`');                                         // the secondary catchlight
    if (k >= 0.9) c.line1(curve([[cx - rx * 0.6, cy + ry * 1.02], [cx, cy + ry * 1.12], [cx + rx * 0.6, cy + ry * 0.98]]), '%');   // the lit lower lid
  };
  eye(122, 77, 9.4, 7, 'eyeN');
  eye(161, 75, 6.6, 5.4, 'eyeF');
  // the nose: a sharp glint where the light hits the top, a softer second one, the nostrils
  { const g = Math.max(1, Math.round(1.4 * k)), X = Math.round(c.X(184)), Y = Math.round(c.Y(88.2)); for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(X + i, Y + j, 'W'); if (fine) c.dot(188, 87.6, '3'); }
  c.dot(191.5, 95.5, '@'); c.dot(185, 95.5, '@');
  {
    const M = curve([[188, 99.5], [186, 103], [180, 106], [172, 107.4], [165, 106.6], [159.5, 104], [156, 100]], 8), nM = M.length;
    const th = (i) => 0.25 + 1.15 * Math.pow(i / (nM - 1), 1.4);                 // thin near the nose, thick at the tucked corner
    const nrm = (i) => { const a = M[Math.max(0, i - 1)], b = M[Math.min(nM - 1, i + 1)], [dx, dy] = norm(b[0] - a[0], b[1] - a[1]); return [-dy, dx]; };
    const top = M.map((p, i) => { const [nx, ny] = nrm(i); return [p[0] - nx * th(i) * 0.5, p[1] - ny * th(i) * 0.5]; });
    const bot = M.map((p, i) => { const [nx, ny] = nrm(i); return [p[0] + nx * th(i) * 0.5, p[1] + ny * th(i) * 0.5]; });
    const crease = c.mask([...top, ...bot.reverse()]);
    for (let i = 0; i < crease.length; i++) if (crease[i]) { const x = (i % c.w - c.ox) / c.S; c.img.px[i] = x > 182 ? '$' : '#'; }   // it fades toward the nose
    if (fine) c.line1(M.slice(Math.round(nM * 0.25), Math.round(nM * 0.85)).map(([x, y], j, arr) => { const i = j + Math.round(nM * 0.25), [nx, ny] = nrm(i); return [x + nx * (th(i) * 0.5 + 1.1), y + ny * (th(i) * 0.5 + 1.1)]; }), '+');   // the lit lip
  }
  { // the gauge face: ticks round a 270-degree dial, a red zone, the needle, the pin, a glare on the glass
    const g = PUMP.gauge, gid = c.id('gauge'), P = (r, a) => [Math.round(c.X(g[0] + r * Math.cos(a))), Math.round(c.Y(g[1] + r * Math.sin(a)))];
    const setG = ([X, Y], col) => { if (c.part[Y * c.w + X] === gid) c.img.px[Y * c.w + X] = col; };
    const a0 = (135 * Math.PI) / 180, sweep = (270 * Math.PI) / 180;
    if (fine) {
      for (let i = 0; i <= 10; i++) { const a = a0 + (sweep * i) / 10; setG(P(5.3, a), i >= 8 ? 'R' : '3'); if (i % 5 === 0) setG(P(4.5, a), '3'); }
      for (let i = 0; i < 6; i++) setG(P(5.3, a0 + sweep * (0.8 + i * 0.04)), 'R');   // the red zone arc
    }
    const na = a0 + sweep * 0.62, tip = [g[0] + 4.6 * Math.cos(na), g[1] + 4.6 * Math.sin(na)], tail = [g[0] - 1.4 * Math.cos(na), g[1] - 1.4 * Math.sin(na)];
    c.line1([tail, tip], 'R', { on: 'gauge' });
    c.dot(g[0], g[1], '1');
    if (fine) { setG(P(4.4, (225 * Math.PI) / 180), 'W'); setG(P(4.0, (205 * Math.PI) / 180), 'W'); setG(P(4.0, (245 * Math.PI) / 180), 'W'); }   // the glass glare
  }
  if (fine) { // painted-metal pinstripes round the barrel: bowed rings (the cylinder's roundness), a darker tone of what is under them
    const Y = [...new Set(RAMPS.yel)], bid = c.id('barrel'), down = (key, n) => Y[Math.max(0, Y.indexOf(key) - n)];
    const [ux, uy] = norm(at(1)[0] - at(0)[0], at(1)[1] - at(0)[1]); let nx = -uy, ny = ux; if (-nx - ny < 0) { nx = -nx; ny = -ny; }
    const r = 6.5, unit = Math.hypot(at(1)[0] - at(0)[0], at(1)[1] - at(0)[1]);
    for (const s0 of [20, 23, 128, 131]) {
      for (let i = 0; i < c.img.px.length; i++) {
        if (c.part[i] !== bid || c.line[i]) continue;
        const x = (i % c.w + 0.5 - c.ox) / c.S - at(0)[0], y = (((i / c.w) | 0) + 0.5 - c.oy) / c.S - at(0)[1];
        const t = Math.max(-1, Math.min(1, (x * nx + y * ny) / r)), s = (x * ux + y * uy) / unit - 1.6 * Math.sqrt(1 - t * t) / unit;
        if (Math.abs((s - s0) * unit * c.S) < 0.5 && Y.includes(c.img.px[i])) c.img.px[i] = down(c.img.px[i], 2);
      }
    }
  }
  if (fine) {
    // one bright streak along the barrel's light stripe, a glint on the chrome collar
    const a = at(84), b = at(128), l0 = Math.hypot(-0.55, -0.65, 0.52), px2 = -(b[1] - a[1]), py2 = b[0] - a[0], pl = Math.hypot(px2, py2), q = ((px2 / pl) * -0.55 + (py2 / pl) * -0.65) / l0;
    const o = 6.5 * q * 0.62;
    // one SOLID streak (a filled 1.6-unit bar, not two pixel lines that break into dots), a third of the barrel long
    const sm = c.mask(bar([a[0] + (px2 / pl) * o, a[1] + (py2 / pl) * o], [b[0] + (px2 / pl) * o, b[1] + (py2 / pl) * o], 1.4, true)), bid = c.id('barrel');
    for (let i = 0; i < sm.length; i++) if (sm[i] && c.part[i] === bid) c.img.px[i] = '`';
    const p = at(140, 5); c.dot(p[0], p[1], 'W');
  }
  // the tip of the tail: two or three small lit strands
  if (fine) { const { p, dx, dy } = tailAt(1); for (const [ox, oy, l] of [[0, 0, 3], [-1.6, 1, 2.2]]) c.line1([[p[0] + ox, p[1] + oy], [p[0] + ox + dx * l, p[1] + oy + dy * l]], '%'); }
  c.despeckle(null, ['W', '`', '}', '{', '>', '<', 'R', '7', '6', '®', '+']);
  // the silhouette: a dark line on the shadow side, softer on the lit side, coloured per material
  const fur = [...RAMPS.fur, ...RAMPS.white, ...RAMPS.mask, ...RAMPS.furD, ...RAMPS.earIn, '½'];
  c.silhouette({
    dark: '@', light: [-1, -1],
    pick: (nb, lit) => (RAMPS.yel.includes(nb) ? '|' : RAMPS.scarf.includes(nb) ? 'e' : [...RAMPS.chrome, ...RAMPS.rubber].includes(nb) && !fur.includes(nb) ? '@'
      : lit ? (fur.includes(nb) ? '$' : null) : undefined),
  });
  c.cleanSilhouette();
  c.dejag(['W', '}', '{', '`']);
  c.cleanSilhouette({ nubs: false, passes: 1 });
  if (fine) c.despeckle(null, ['W', '`', '}', '{', '>', '<', 'R', '7', '6', '½', '®', '+']);
  // whiskers: two fine light lines each side, past the outline
  if (fine) {
    for (const w of [[[178, 99], [194, 96], [208, 93]], [[180, 102], [195, 104], [209, 107]], [[176, 101], [190, 106], [202, 112]]]) {
      const m = c._line1Mask(curve(w, 16));
      for (let i = 0; i < m.length; i++) if (m[i] && (c.img.px[i] === null || ['@', '#', '$'].includes(c.img.px[i]))) c.img.px[i] = c.img.px[i] === null ? '+' : 'J';
    }
    c.despeckle(null, ['W', '`', '}', '{', '>', '<', 'R', '+', 'J', '%']);   // the last stray pixels (the whiskers are kept)
    c.cleanSilhouette({ nubs: false, passes: 1 });
    c.deorphan(['W', '`', '}', '{', '>', '<', 'R', '1', '6', '7']);   // single stray band pixels (pixelcheck's orphan rule)
    c.dejag(['W', '`', '}', '{', '>', '<', 'R', '+', 'J'], { thick: true, fill: true });   // the contour's doubled corners
  }
  if (fine) { // the whisker pads: three rows of follicle dots on the muzzle, a darker tone of the fur under each
    const Wt = [...new Set(RAMPS.white)];
    for (const [x, y] of [[170, 96.4], [173.4, 95.8], [176.8, 95.6], [168.6, 99], [172, 98.6], [175.4, 98.6], [170.4, 101.4], [173.8, 101.4]]) {
      const X = Math.round(c.X(x)), Y = Math.round(c.Y(y)), i = Y * c.w + X, j = Wt.indexOf(c.img.px[i]);
      if (j > 1 && c.part[i] === c.id('snout')) c.img.px[i] = Wt[j - 3 < 0 ? 0 : j - 3];
    }
  }
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
  return { hose, chuck: [e, [e[0] + ex * 8, e[1] + ey * 8]], gauge: g };
}

/** the style study preview: the poster size and the k = 1 size */
export function portraitsPreview() {
  return { frames: [raccoonPortrait2d('smirk', 1.5), raccoonPortrait2d('smirk', 1)], cols: 2 };
}

// ============================== "DETAILED": every surface rendered in the value grid ==============================
/** fur locks along each part's flow, the scarf's knit, chrome reflections, rubber ribs: all before quantization */
function surfaceDetail(c, v, { at, tcc, wristN, PUMP, k, AN, sc }) {
  const calm = [[122, 77, 12.5, 9.5], [161, 75, 9.5, 8], [189, 92, 10, 9], [172, 104, 18, 5]];
  const okHead = (x, y) => !calm.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
  const hf = (x, y) => (y > 100 ? norm(x < 140 ? -0.6 : 0.6, 1) : headFlow(x, y));
  const A = k >= 1.4 ? 1 : 0.8;
  locks(c, v, ['head'], hf, { gap: 4.6, len: 5.2, amp: 0.091 * A, seed: 501, ok: okHead });
  locks(c, v, ['earL'], () => [-0.35, -1], { gap: 4.6, len: 5.2, amp: 0.084 * A, seed: 502 });
  locks(c, v, ['earR'], () => [0.4, -1], { gap: 4.6, len: 5.2, amp: 0.084 * A, seed: 503 });
  locks(c, v, ['body'], (x) => [(x - 127) / 45, 1], { gap: 4.6, len: 5.2, amp: 0.091 * A, seed: 504 });
  locks(c, v, ['armL'], (x, y) => (y < 148 ? [-0.5, 1] : [wristN[0] - 82, wristN[1] - 152]), { gap: 4.6, len: 5.2, amp: 0.084 * A, seed: 505 });
  locks(c, v, ['armR'], () => [0.6, 1], { gap: 4.6, len: 5.2, amp: 0.084 * A, seed: 506 });
  const tailDir = (x, y) => {
    let bi = 0, bd = 1e9; for (let i = 0; i < tcc.length; i++) { const d = (tcc[i][0] - x) ** 2 + (tcc[i][1] - y) ** 2; if (d < bd) { bd = d; bi = i; } }
    const a = tcc[Math.max(0, bi - 1)], b = tcc[Math.min(tcc.length - 1, bi + 1)]; return [b[0] - a[0], b[1] - a[1]];
  };
  locks(c, v, ['tail'], tailDir, { gap: 4.6, len: 5.2, amp: 0.105 * A, seed: 507 });
  // the knit: stitch columns run along the scarf
  const CL = curve([[88, 119], [120, 125], [146, 123], [174, 113]], 10);
  const clY = (x) => { for (let i = 1; i < CL.length; i++) if (CL[i][0] >= x) { const [ax, ay] = CL[i - 1], [bx, by] = CL[i], f = (x - ax) / (bx - ax || 1); return ay + f * (by - ay); } return CL[CL.length - 1][1]; };
  knit(c, v, ['scarf', 'scarfKnot'], (X, Y) => { const x = (X - c.ox) / c.S; return [X, Y - c.Y(clY(x))]; }, { amp: 0.085 });
  { const [ux, uy] = norm(0.5, 0.86), o = [c.X(165), c.Y(121)]; knit(c, v, ['scarfEnd'], (X, Y) => [(X - o[0]) * ux + (Y - o[1]) * uy, -(X - o[0]) * uy + (Y - o[1]) * ux], { amp: 0.085 }); }
  // chrome: caps (two crimp rings each), the rod, the handle boss, the hose chuck
  chromeTube(c, v, 'cap7', at(7), at(14), 8.5, { rings: [0.32, 0.68] });
  chromeTube(c, v, 'cap137', at(137), at(144), 8.5, { rings: [0.32, 0.68] });
  chromeTube(c, v, 'rod', at(144), at(176), 2.2);
  chromeTube(c, v, 'boss', at(173), at(183), 4.3, { rings: [0.5] });
  chromeTube(c, v, 'chuck', PUMP.chuck[0], PUMP.chuck[1], 3, { rings: [0.3, 0.55, 0.8] });
  // rubber: ribbed grips on the T-handle, a tread on the foot
  ribs(c, v, 'handle', at(178, -25), at(178, 25), 1.6, { k: 0.72, lit: 1.1 });
  ribs(c, v, 'foot', at(3.5, -23), at(3.5, 23), 2.6, { k: 0.75, lit: 1.06 });
  // the snout: short fur combed back from the nose; the paw: along the fingers
  const okSnout = (x, y) => ((x - 189) / 9.5) ** 2 + ((y - 92) / 8.5) ** 2 > 1 && !(y > 100 && y < 109 && x > 156);
  locks(c, v, ['snout'], (x, y) => headFlow(x, y), { gap: 3, len: 3.6, amp: 0.11 * A, seed: 508, ok: okSnout, per: 2 });
  { const [p0, p1] = [AN(0, 0), AN(0, -6)]; locks(c, v, ['pawN'], () => [p1[0] - p0[0], p1[1] - p0[1]], { gap: 3.2, len: 3.4, amp: 0.08 * A, seed: 509, per: 2 }); }
  // the hose: rubber ribs every 2 units along its curve
  {
    const P = curve(PUMP.hose, 12), cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const id = c.id('hose');
    for (let i = 0; i < v.length; i++) {
      if (c.part[i] !== id) continue;
      const x = (i % c.w + 0.5 - c.ox) / c.S, y = (((i / c.w) | 0) + 0.5 - c.oy) / c.S;
      let bi = 0, bd = 1e9; for (let j = 0; j < P.length; j++) { const d = (P[j][0] - x) ** 2 + (P[j][1] - y) ** 2; if (d < bd) { bd = d; bi = j; } }
      const ph = (cum[bi] * c.S) % (2.2 * c.S); if (ph < 1) v[i] *= 0.7; else if (ph < 2) v[i] *= 1.12;
    }
  }
  // the gauge: a chrome bezel (lit outside upper left, its inner lip lit lower right), a white face shaded by the bezel
  {
    const g = PUMP.gauge, id = c.id('gauge');
    for (let i = 0; i < v.length; i++) {
      if (c.part[i] !== id) continue;
      const x = (i % c.w + 0.5 - c.ox) / c.S - g[0], y = (((i / c.w) | 0) + 0.5 - c.oy) / c.S - g[1], d = Math.hypot(x, y), t = (-x - y) / (Math.SQRT2 * (d || 1));
      if (d > 7.7) v[i] = 0.52 + 0.42 * t;               // the bezel's outer slope
      else if (d > 6.5) v[i] = 0.5 - 0.36 * t;           // its inner lip
      else { const sh = Math.hypot(x + 1.1, y + 1.1) > 6.4; v[i] = sh ? 0.66 : 0.88 - 0.1 * Math.max(0, (x + y) / 9); }   // the face, the bezel's shadow crescent
    }
  }
  c.crescentValue(v, 'nose', 1.2, 0.16, { dir: [1, 1], mode: 'add', maxV: 0.6 });   // cream bounce light under the nose
}
