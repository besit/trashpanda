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
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../lib/draw2d.mjs';
import '../lib/light2d.mjs';
import { dome, cap } from '../lib/light2d.mjs';

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

// the ramps: value -> palette key by THRESHOLDS (key, upper bound, key, upper bound, ..., last key), so each band's
// width is a design decision. Hue-shifted: the shadows lean cool (violet), the lights warm, and a saturated key sits at
// the terminator value (0.46 to 0.55, where `terminator` puts its band) so skin and fur glow there.
const tones = (...a) => Array.from({ length: 81 }, (_, i) => { const t = i / 80; for (let j = 1; j < a.length; j += 2) if (t < a[j]) return a[j - 1]; return a[a.length - 1]; });
const RAMPS = {
  fur: tones('@', 0.12, 'º', 0.3, 'ª', 0.42, '%', 0.47, '©', 0.55, 'J', 0.8, '®', 0.97, '+'),
  furD: tones('@', 0.2, 'º', 0.46, '$', 0.62, 'I'),
  white: tones('&', 0.12, '²', 0.34, 'J', 0.47, '*', 0.6, '+'),
  mask: tones('@', 0.22, '#', 0.56, '$', 0.82, 'I'),
  earIn: tones('@', 0.3, '#', 0.5, "'", 0.75, '-'),
  yel: tones('|', 0.16, 'o', 0.4, '¥', 0.55, 'y', 0.9, 'Y'),
  chrome: tones('1', 0.25, '3', 0.45, '5', 0.7, '7', 0.9, 'W'),
  rubber: tones('1', 0.3, '2', 0.55, '3', 0.82, '4'),
  scarf: tones('e', 0.32, 'E', 0.56, 'l', 0.86, 'L'),
  black: tones('@', 0.42, '1', 0.72, '2', 0.92, '3'),
  skin: tones('¤', 0.12, '§', 0.26, '»', 0.37, '°', 0.44, '9', 0.53, 'Q', 0.88, '/'),
  patch: tones('(', 0.2, ')', 0.46, '!', 0.82, '"'),
  hair: tones('3', 0.3, '4', 0.5, '6', 0.76, '7', 0.93, '8'),
  teeth: tones('5', 0.3, '6', 0.44, '7', 0.6, '8', 0.78, 'W'),
  brow: tones('&', 0.12, '²', 0.34, '*', 0.5, '+', 0.66, 'W'),
  suit: tones(',', 0.15, '¹', 0.46, 'U', 0.78, '_', 0.94, '¼'),
  shirt: tones('6', 0.4, '7', 0.6, '8', 0.88, 'W'),
  tie: tones('r', 0.25, '[', 0.5, 'R', 0.86, 'q'),
  mouthIn: tones('=', 0.6, '¤'),
  tongue: tones('p', 0.4, '?', 0.62, 'P', 0.86, '^'),
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
    const H = ['head', 'earL', 'earR'], coat = uniq(RAMPS.fur), cream = uniq(RAMPS.white), mask = uniq(RAMPS.mask), stripe = uniq(RAMPS.furD);
    for (const R of [coat, cream, uniq(RAMPS.brow)]) for (let i = 0; i + 1 < R.length; i++) {
      c.furBreak(H, R[i + 1], R[i], { dir: headFlow, len: 2.8, gap, w: 2, seed: 300 + i, shapes: zone });           // light strands into the shadow
      c.furBreak(H, R[i], R[i + 1], { dir: headFlow, len: 2.4, gap: gap * 1.2, w: 2, seed: 340 + i, shapes: zone });   // dark strands into the light
    }
    // across the markings: the cream ruff and the brows break into the coat and the mask, the mask and the stripe into the coat
    for (const a of [...cream, ...uniq(RAMPS.brow)]) c.furBreak(H, a, [...coat, ...mask], { dir: headFlow, len: 2.8, gap, w: 2, seed: 360, shapes: zone });
    for (const a of coat) c.furBreak(H, a, [...cream, ...stripe], { dir: headFlow, len: 2.4, gap: gap * 1.2, w: 2, seed: 361, shapes: zone });
    for (const a of [...mask, ...stripe]) c.furBreak(H, a, [...coat, ...cream], { dir: headFlow, len: 2.4, gap: gap * 1.2, w: 2, seed: 362, shapes: zone });
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
  { // the gauge: a light grey face, the needle
    const g = at(30 / sc);
    c.paint('gauge', ell(g[0], g[1], 6.4, 6.4), '7');
    c.paint('gauge', ell(g[0] + 1.2, g[1] + 1.4, 5.4, 5.4).filter((_, i) => i > 4 && i < 16).concat([[g[0] + 5, g[1] - 2], [g[0] - 2, g[1] + 5]]), '6');
    c.stroke([g, [g[0] + 4, g[1] - 3]], 'R', { on: 'gauge', t: 1, line: false });
    c.dot(g[0], g[1], '1');
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
    for (const w of [[[178, 99], [194, 96], [208, 93]], [[180, 102], [195, 104], [209, 107]]]) {
      const m = c._line1Mask(curve(w, 16));
      for (let i = 0; i < m.length; i++) if (m[i] && (c.img.px[i] === null || ['@', '#', '$'].includes(c.img.px[i]))) c.img.px[i] = c.img.px[i] === null ? '+' : 'J';
    }
    c.despeckle(null, ['W', '`', '}', '{', '>', '<', 'R', '+', 'J', '%']);   // the last stray pixels (the whiskers are kept)
    c.cleanSilhouette({ nubs: false, passes: 1 });
    c.deorphan(['W', '`', '}', '{', '>', '<', 'R', '1', '6', '7']);   // single stray band pixels (pixelcheck's orphan rule)
    c.dejag(['W', '`', '}', '{', '>', '<', 'R', '+', 'J'], { thick: true, fill: true });   // the contour's doubled corners
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
}

// ============================== DOG FJORD ==============================
// A cartoon bulldog (never a real person's likeness): a big pink jowly head on a small suited body, grey combed hair,
// folded ears, a brown heart patch round the far eye, thick brows, a big black nose, a smug toothy grin. Three-quarter
// view facing LEFT. Expressions: grin, laugh, shock. Light from the upper left (his face side). The head silhouette,
// ears and hair outline are M4.7 iteration 04's; the minimal build is M4.8 iteration 01's.
const DSC = 1.1;
const T = ([x, y, s]) => (s ? [110 + (x - 110) * DSC, 100 + (y - 100) * DSC, 1] : [110 + (x - 110) * DSC, 100 + (y - 100) * DSC]);
const B = (pts) => blob(pts.map(T));
const Cv = (pts) => curve(pts).map(T);
const E = (x, y, rx, ry, rot = 0) => { const [X, Y] = T([x, y]); return ell(X, Y, rx * DSC, ry * DSC, rot); };
const TD = (x, y, rx, ry) => { const [X, Y] = T([x, y]); return dome(X, Y, rx * DSC, ry * DSC); };
const TB = (list) => bumps(list.map((b) => (b.l ? { ...b, l: b.l.map(T), w: b.w * DSC } : { ...b, e: [...T(b.e), b.e[2] * DSC, b.e[3] * DSC] })));
const HEAD04 = [
  [110, 42], [125, 44], [138, 50], [148, 60], [155, 72], [159, 85], [164, 97], [170, 109], [173, 122], [170, 136], [164, 150],
  [153, 160], [138, 165], [122, 165.5], [108, 165], [94, 164.5], [80, 163], [66, 160], [54, 152], [48, 139], [47, 124], [49, 110],
  [55, 98], [61, 86], [66, 74], [73, 62], [83, 51], [96, 45],
];

export function dogPortrait2d(expr = 'grin', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const fine = k >= 0.9, small = k < 0.8;
  const px = (u, min = 1) => Math.max(min, Math.round(u * k * DSC)); // a stroke `u` design units thick, in pixels
  const nl = { line: null };
  const L = lighting(c);

  // ---- the suit: navy shoulders under the jowls, lapels, a white shirt, a red tie ----
  c.shape('suit', B([[60, 214, 1], [63, 188], [74, 170], [94, 157], [130, 157], [150, 170], [162, 188], [166, 214, 1]]), 'suit', nl);
  c.shape('shirt', B([[93, 154, 1], [119, 154, 1], [107, 204, 1], [105, 204, 1]]), 'shirt', nl);
  c.shape('lapelL', B([[90, 156, 1], [105, 202, 1], [95, 188, 1], [84, 174, 1], [77, 165, 1]]), 'suit', nl);
  c.shape('lapelR', B([[122, 156, 1], [137, 164, 1], [130, 178, 1], [118, 192, 1], [107, 202, 1]]), 'suit', nl);
  c.shape('tie', B([[102, 166, 1], [110, 166, 1], [109, 176, 1], [114, 206, 1], [106, 213, 1], [98, 206, 1], [103, 176, 1]]), 'tie', nl);
  c.shape('knot', B([[100, 159, 1], [112, 159, 1], [111, 167, 1], [101, 167, 1]]), 'tie', nl);

  // ---- the head (iteration 04's outline), the ears, the hair: silhouettes holding materials ----
  c.shape('earL', B([[76, 61, 1], [50, 76, 1], [56, 80], [66, 80.5], [72, 74, 1]]), 'skin', nl);
  c.shape('earR', B([[146, 60, 1], [170, 76, 1], [164, 81], [156, 82.5], [151, 72, 1]]), 'skin', nl);
  c.shape('head', B(HEAD04), 'skin', nl);
  c.shape('patch', B([[104, 89], [104, 82], [110, 77.5], [117, 78.5], [124, 77], [131, 80.5], [132, 89], [127, 99], [118, 109, 1], [109, 99]]), 'patch', { line: null, clip: 'head' });
  const HAIRLINE = [[146, 52], [143.5, 58], [140, 52.5], [134, 51], [120, 52], [108, 55], [100, 52], [92, 52], [84, 56], [79, 65], [75.5, 59]];
  c.shape('hair', B([[73, 56], [73, 44], [77, 33], [84, 26], [94, 23], [104, 24], [112, 28], [126, 31], [140, 35], [148, 40], [151, 46], ...HAIRLINE]), 'hair', nl);
  c.shape('nose', B([[74, 104], [80, 98], [92, 97], [103, 101], [103, 110], [94, 116], [82, 115], [75, 110]]), 'black', nl);
  if (expr === 'grin') c.shape('mouth', B([[62, 123, 1], [80, 132], [96, 136], [113, 135], [129, 130, 1], [121, 139], [97, 147], [75, 138]]), 'teeth', nl);
  else if (expr === 'laugh') {
    // the open mouth: a dark cavity; the upper teeth as their own form (they cast into the mouth); the tongue a dome
    c.shape('mouth', B([[61, 122, 1], [80, 131], [96, 135], [113, 133], [131, 127, 1], [128, 140], [115, 150], [96, 153], [78, 148], [66, 136]]), 'mouthIn', nl);
    c.shape('teethU', B([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [131, 133], [113, 139], [96, 141], [80, 137], [61, 129]]), 'teeth', { line: null, clip: 'mouth' });
    c.shape('tongue', B([[76, 147], [86, 141.4], [104, 140.6], [117, 143.6], [123, 148], [108, 153], [90, 153]]), 'tongue', { line: null, clip: 'mouth' });
  } else {
    // the shock: a tall O, a dark interior, a sliver of the upper teeth lit at the top, the tongue low
    c.shape('mouth', E(95, 142, 9, 12.5), 'mouthIn', nl);
    c.shape('teethU', E(95, 131.6, 7.4, 3), 'teeth', { line: null, clip: 'mouth' });
    c.shape('tongue', E(95, 151, 6, 3.4), 'tongue', { line: null, clip: 'mouth' });
  }

  // ============ LIGHT ============
  const strands = [
    [[86, 55], [85, 43], [92, 33], [104, 29], [120, 32]],
    [[93, 53], [95, 44], [104, 37], [120, 36], [138, 39]],
    [[103, 54], [109, 46], [122, 42], [142, 43]],
    [[116, 52], [126, 47], [144, 48], [151, 51]],
  ];
  L.form('suit', { R: 16, front: ['head', 'lapelL', 'lapelR', 'shirt', 'tie', 'knot'] });
  L.form('shirt', { R: 4, front: ['tie', 'knot', 'head'] });
  L.form('lapelL', { R: 3 });
  L.form('lapelR', { R: 3 });
  L.form(['tie', 'knot'], { R: 3 });
  L.form('earL', { R: 3 });
  L.form('earR', { R: 3 });
  const up = expr === 'laugh' ? 3 : 0;   // laughing, the cheeks push up and the smile creases rise
  L.form(['head', 'patch', 'mouth'], {
    R: 30, k: 1.4, front: ['nose', 'hair', 'teethU', 'tongue'], curve: (x) => Math.min(1, x * 1.04 + 0.05),
    // the muzzle pads, ONE smooth near jowl (no pouches), the far jowl; laughing, the cheek balls pushed up under the eyes
    prims: [TD(92, 122, 36, 17), TD(64, 138, 22, 20), TD(138, 132 - up, 13, 15), ...(up ? [TD(78, 103, 11, 6), TD(118, 105, 10, 5.4)] : [])],
    height: TB([
      { l: [[85, 70], [99, 67], [113, 70]], w: 3, a: -1.6 },   // one forehead fold (with the hair's shadow line: 2 lines)
      { l: [[66, 117 - up], [60, 128 - up], [61, 138 - up], [64, 144 - up]], w: 3.4, a: -1.7 }, { l: [[137, 128 - up], [136.6, 134 - up], [134, 141 - up], [128, 149 - up]], w: 4, a: -2.4 },   // jowl creases
      // (no chin fold: the underside of the jowls is ONE shadow shape with one reflected band)
    ]),
  });
  L.form('hair', { R: 7, height: TB(strands.slice(0, 3).map((l) => ({ l, w: 3.6, a: 1.3 }))) });
  L.form('nose', { R: 4, gloss: 0.5, shine: 14 });
  {
    // designed planes: the heavy jowls turn under, the cheek beyond the patch turns away; the brow and the muzzle top catch the light
    // THE far-cheek plane: one terminator from the right ear down past the patch to the right of the chin (about a
    // third of the head in shadow, a saturated band where it turns)
    // tucked in under the brow and the patch, swelling round the cheek ball, sweeping under the jowls to the near side
    const FAR = [[150, 56], [143, 70], [137, 84], [135, 98], [140, 110], [146, 122], [147, 134], [143, 146], [134, 154], [118, 159], [98, 161], [78, 160], [62, 156], [50, 150], [40, 170], [200, 190], [200, 40]];
    L.term(['head', 'patch', 'mouth'], blob(FAR.map(T).map(([x, y], i) => (i >= FAR.length - 3 || i === 0 ? [x, y, 1] : [x, y]))), { squash: [0.3, 0.06], band: 0 });
    L.term(['earR'], [[140, 50], [200, 50], [200, 100], [140, 100]].map(T), { squash: [0.3, 0.06], band: 0 });
    // the red-pink glow only where the cheek turns gently: widest at the cheek ball, gone toward the brow and the jaw
    { const C = [[136, 100], [141, 111], [146.5, 123], [146, 136]], w = [0.2, 1.6, 2, 0.3], L2 = C.map(([x, y], i) => [x - w[i], y]).reverse();
      c.valueShape(L.v, blob([...C, ...L2].map(T)), 0.48, { mode: 'set', on: 'head' }); }
    // the suit's far side, the lapel on that side
    L.term(['suit', 'lapelR'], [[126, 150], [138, 158], [148, 172], [154, 214], [210, 214], [210, 140]].map(T), { band: 0 });
    // the near cheek's top catches the light: one designed highlight shape
    L.shade(B([[56, 104], [62, 94], [70, 92], [72, 98], [64, 106]].map(([x, y]) => [x, y - up * 1.2])), 'hi', 'head');
    L.shade(B([[60, 92], [70, 70], [84, 56], [100, 50], [90, 60], [78, 74], [68, 96]]), 'hi', 'head');
    L.shade(B([[68, 109], [80, 105.5], [100, 105.5], [114, 109], [110, 111.5], [96, 109.5], [78, 111.5]]), 'hi', 'head');
  }
  // cast shadows: the hair on the forehead, the nose on the upper lip, the upper lip on the teeth, the head on the collar
  L.cast('hair', ['head', 'patch', 'earL', 'earR'], 1.4, 3);
  L.cast('nose', ['head'], 1.2, 3.4);
  if (expr === 'grin') L.cast(['head'], ['mouth'], 0.6, 2.2);
  if (expr !== 'grin') {
    L.form('teethU', { R: 2.4 });
    L.form('tongue', { R: 4 });
    c.valueShape(L.v, [[0, 0], [400, 0], [400, 400], [0, 400]], 0.12, { mode: 'set', on: 'mouth' });   // the cavity: dark
    L.cast('teethU', ['mouth', 'tongue'], 0, 2.6, 2);                                                 // the teeth cast into the mouth
    if (expr === 'laugh') L.cast('head', ['teethU'], 0.4, 1.4);                                                           // the upper lip on the teeth
    c.valueLine(L.v, Cv(expr === 'laugh' ? [[100, 142], [100, 150]] : [[95, 149], [95, 152.6]]), 0.6, { mode: 'mul', on: 'tongue' });   // the tongue's midline
    // the lower lip: a lit edge one tone up along the bottom of the mouth
    const lip = expr === 'laugh' ? [[68, 138], [79, 149.6], [96, 155], [115, 152], [127, 142]] : E(95, 142, 10.6, 14).filter((_, i) => i > 4 && i < 16);
    c.valueLine(L.v, lip.map ? (expr === 'laugh' ? Cv(lip) : lip) : lip, 0.9, { mode: 'max', on: 'head' });
  }
  L.cast(['head', 'patch', 'mouth', 'teethU', 'tongue'], ['suit', 'shirt', 'lapelL', 'lapelR', 'tie', 'knot'], 2, 6);
  L.cast('lapelL', ['suit', 'shirt'], 1.4, 1.6); L.cast('lapelR', ['shirt', 'suit'], 1.4, 1.6);
  L.cast('knot', ['tie', 'shirt'], 0.8, 1.6);
  if (expr === 'laugh') c.valueShape(L.v, B([[80, 132], [96, 136], [112, 134], [110, 138.6], [96, 140], [82, 136.6]]), 0.84, { mode: 'max', on: 'teethU' });
  if (expr === 'grin') {   // the mouth corners sink in; faint gaps between the teeth
    L.shade(E(64, 125, 3, 3), 'deep', 'mouth'); L.shade(E(127, 132, 3, 3), 'deep', 'mouth');
    if (!small) for (const x of [80, 96, 112]) L.crease(Cv([[x, 128], [x, 138 + 4 * (1 - ((x - 96) / 33) ** 2)]]), 'mouth');
    // the teeth catch the same light: the middle lower teeth face it and go near-white; the corners stay in the cheeks' shade
    c.valueShape(L.v, B([[78, 136], [96, 139.6], [114, 137.6], [112, 143], [96, 145], [80, 140]]), 0.86, { mode: 'max', on: 'mouth' });
  }
  // the nose: the darkest dark; a faint reflected light along its underside
  c.crescentValue(L.v, 'nose', 1.4, 0.2, { dir: [0, 1], mode: 'add' });
  { // falloff: the suit's lower part a step darker (the eye goes to the face)
    const pm = c.partMask(['suit', 'lapelL', 'lapelR', 'shirt', 'tie']);
    for (let i = 0; i < pm.length; i++) if (pm[i]) { const y = ((i / c.w) | 0) / c.S; if (y > 184) L.v[i] *= 1 - 0.24 * Math.min(1, (y - 184) / 26); }
  }
  // reflected light: a band one step lighter inside the shadow along the underside of the jowls
  c.crescentValue(L.v, 'head', 2.4, 0.07, { dir: [0, 1], mode: 'add', maxV: 0.37 });
  L.paint(RAMPS);
  if (fine) {
    const sk = [...new Set(RAMPS.skin)];
    for (const p of new Set(RAMPS.patch)) c.furBreak(['head', 'patch'], p, sk, { dir: (x, y) => norm(x - 118, y - 90), len: 1.8, gap: 2.4, seed: 70 });
  }

  // ---- details: brows, eyes, nostrils, the shine (small accents inside the lit form) ----
  const [NX, NY] = [84, 91], [FX, FY] = [117, 92];
  const bs = small ? 1.2 : 0, ny = NY - (small ? 2.5 : 0);
  const brow = (pts) => {
    const p = pts.map(([x, y]) => [x, y - bs]);
    c.stroke(Cv(p), '@', { t: px(4, 2), line: false });
    if (fine) c.stroke(Cv(p.map(([x, y]) => [x - 0.2, y - 1.3])), '3', { t: px(1), line: false });
  };
  const openEye = (ex, ey, rx, ry, iris, lid) => {
    const n = 'eye' + ex;
    c.shape(n, B([[ex - rx, ey + 0.5], [ex - rx * 0.55, ey - ry], [ex + rx * 0.5, ey - ry], [ex + rx, ey], [ex + rx * 0.55, ey + ry], [ex - rx * 0.5, ey + ry]]), '8', nl);
    c.paint(n, B([[ex - rx, ey - ry], [ex + rx, ey - ry], [ex + rx, ey - ry * 0.3], [ex - rx, ey - ry * 0.4]]), '6');
    const [ix, iy, ir] = iris;
    c.paint(n, E(ix, iy, ir, ir * 1.05), '<');
    c.paint(n, E(ix + 0.2, iy + ir * 0.25, ir * 0.78, ir * 0.7), '>');
    c.paint(n, E(ix + 0.3, iy + ir * 0.55, ir * 0.5, ir * 0.32), '{');
    c.paint(n, E(ix + ir * 0.35, iy + ir * 0.62, ir * 0.3, ir * 0.18), '}');   // the iris glows opposite the catchlight
    c.paint(n, E(ix, iy, ir * 0.48, ir * 0.55), '@');
    if (lid !== null) c.paint(n, B(lid), ')');
    { const g = Math.max(1, Math.round(1.4 * k)), [X, Y] = T([ix - ir * 0.42, iy + ir * 0.02]); for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(Math.round(c.X(X)) + i, Math.round(c.Y(Y)) + j, 'W'); }
    if (k >= 0.9) c.dot(...T([ix + ir * 0.5, iy + ir * 0.1]), '`');
  };
  if (expr === 'shock') {
    brow([[NX - 8, ny - 16.5], [NX, ny - 24], [NX + 8, ny - 18.5]]);
    brow([[FX - 8, FY - 19], [FX, FY - 26], [FX + 8, FY - 19.5]]);
    for (const [ex, ey] of [[NX, ny], [FX, FY]]) {
      c.shape('eye' + ex, E(ex, ey, 5.6, 6.8), 'W', nl);                       // white at the top tone, defined by value alone
      c.paint('eye' + ex, E(ex, ey - 5.6, 6, 2.6), small ? '8' : '7');            // the brow and lid's shadow on the top of the eyeball
      c.line1(E(ex, ey, 5.6, 6.8).filter((_, i) => i >= 23 && i <= 37), '@', { on: 'eye' + ex });   // the upper lid: the top arc only, no ring
      c.paint('eye' + ex, E(ex - 0.4, ey + 0.6, small ? 1.6 : 2, small ? 1.9 : 2.3), '@');
      if (k >= 0.9) c.dot(...T([ex - 1.1, ey - 0.3]), 'W');
    }
  } else if (expr === 'laugh') {
    brow([[NX - 8, ny - 12], [NX, ny - 15], [NX + 8, ny - 12]]);
    brow([[FX - 8, FY - 14], [FX, FY - 18], [FX + 8, FY - 14]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX, ny - 4], [NX + 7, ny + 2]]), '@', { t: px(3, 2), line: false });
    c.shape('lid', B([[FX - 8, FY + 1], [FX - 4, FY - 3], [FX + 4, FY - 3], [FX + 8, FY + 1], [FX, FY + 2]]), '@', nl);
  } else {
    // the smug politician: a wink on the near side, the patch eye half open under a heavy lid with a glint
    brow([[NX - 9, ny - 11], [NX - 1, ny - 12], [NX + 8, ny - 8]]);
    brow([[FX - 8, FY - 13], [FX, FY - 17.5], [FX + 8, FY - 13.5]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 3, ny - 1.5], [NX + 3, ny - 1.5], [NX + 7, ny + 1]]), '@', { t: px(2.6, 2), line: false });
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 10, ny + 4]]), '@', { t: px(1.6), line: false });
    openEye(FX, FY, 8.4, 5.4, [FX - 1.6, FY + 1.2, 4.3], [[FX - 10, FY - 7], [FX + 10, FY - 7], [FX + 10, FY + 1.6], [FX + 4, FY + 0.2], [FX, FY - 0.2], [FX - 10, FY + 0.4]]);
    c.stroke(Cv([[FX - 6.5, FY + 0.9], [FX, FY + 0.5], [FX + 4.5, FY + 1.1], [FX + 6.5, FY + 2.1]]), '@', { t: px(2.2, 2), line: false });
  }
  // the nose's shine and nostrils, the philtrum
  { const g = Math.max(1, Math.round(1.6 * k)), [X, Y] = T([82, 100.4]); for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(Math.round(c.X(X)) + i, Math.round(c.Y(Y)) + j, 'W'); }   // one sharp highlight
  c.dot(...T([79, 111]), '@', Math.max(1, Math.round(1.2 * k))); c.dot(...T([99, 110]), '@', Math.max(1, Math.round(1.2 * k)));
  if (!small) c.stroke(Cv([[89, 117], [89, 122]]), RAMPS.skin[0], { t: px(1.2), line: false });


  if (fine) c.despeckle(null, ['W', '6', '{', '<', '>', '@', '3', '`', '}']);
  // one clean specular streak along the hair's swoop; the rim of cool reflected light on the shadow side
  if (fine) c.line1(Cv([[96, 41], [106, 35.5], [120, 34], [134, 36.5]]), 'W', { on: 'hair' });
  const skinK = RAMPS.skin, hairK = RAMPS.hair;
  c.silhouette({
    dark: '@', light: [-1, -1],
    pick: (nb, lit) => (skinK.includes(nb) || nb === '½' ? (lit ? '§' : '=') : hairK.includes(nb) ? '1'
      : RAMPS.tie.includes(nb) ? 'r' : RAMPS.suit.includes(nb) ? ',' : undefined),
  });
  c.cleanSilhouette();
  c.dejag(['W', '{', '<', '>']);
  c.cleanSilhouette({ nubs: false, passes: 1 });
  if (fine) c.despeckle(null, ['W', '{', '<', '>', '`', '}']);
  if (fine) c.deorphan(['W', '{', '<', '>', '`', '}']);   // pixelcheck's orphan rule
  if (fine) c.deorphan([], ['mouth', 'teethU', 'tongue']);   // stray single tooth-light pixels on the lip line
  if (fine) c.dejag(['W', '{', '<', '>', '`', '}'], { thick: true, fill: true });   // the hair outline's doubled corner
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
