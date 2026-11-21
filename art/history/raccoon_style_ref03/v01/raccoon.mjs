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
import { registerColors } from '../../../lib/raster.mjs';

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
// ref03 palette (Greek keys only): long hue-shifted ramps. Shadows lean violet-blue, lights warm, the terminator tone a
// touch more saturated; the cream ramp's highlights cool toward ref 03's blue-white; one near-black for the outline.
registerColors({
  // coat, dark -> light (9)
  'Α': '#1d1824', 'Β': '#342a3a', 'Γ': '#4b3f4e', 'Δ': '#64535c', 'Ε': '#82665c', 'Ζ': '#987f70', 'Η': '#b19b88', 'Θ': '#cab7a2', 'Ι': '#e2d4bf',
  // cream (5)
  'Κ': '#6c6680', 'Λ': '#958fa6', 'Μ': '#bcb6c6', 'Ν': '#dfdbdf', 'Ξ': '#fbf8f0',
  // mask blacks, the ear's dusty inside
  'Ο': '#121017', 'Π': '#231d29', 'Ρ': '#7c5c66',
  // scarf greens (ref 03's knit greens)
  'Σ': '#15301f', 'Τ': '#22502b', 'Υ': '#3d7e30', 'Φ': '#69a52c', 'Χ': '#a9cc3c',
  // the yellow pump's deep shadow and its specular
  'Ψ': '#7c3015', 'Ω': '#fffbe2',
  // chrome and rubber
  'β': '#252330', 'γ': '#454356', 'δ': '#737289', 'ε': '#a8a9bc', 'ζ': '#e0e3ef', 'η': '#33303f', 'θ': '#5b586d',
  // the amber eyes
  'ι': '#2c130a', 'κ': '#6e3912', 'λ': '#b0661a', 'μ': '#de982a', 'ν': '#ffd56c',
  // bounce light: yellow from the pump on the fur, green from the scarf on the cream
  'ξ': '#a8915e', 'ο': '#8f9a7c',
});
const RAMPS = {
  fur: tones('Α', 0.08, 'Β', 0.22, 'Γ', 0.34, 'Δ', 0.44, 'Ε', 0.52, 'Ζ', 0.62, 'Η', 0.73, 'Θ', 0.86, 'Ι'),
  furD: tones('Ο', 0.18, 'Α', 0.36, 'Β', 0.56, 'Γ', 0.72, 'Δ'),
  white: tones('Κ', 0.2, 'Λ', 0.38, 'Μ', 0.52, 'Ν', 0.68, 'Ξ'),
  mask: tones('Ο', 0.44, 'Α', 0.58, 'Β', 0.7, 'Γ', 0.82, 'Δ'),
  earIn: tones('Ο', 0.3, 'Α', 0.48, 'Δ', 0.66, 'Ρ'),
  yel: tones('Ψ', 0.16, 'o', 0.38, '¥', 0.55, 'y', 0.88, 'Y'),
  chrome: tones('Α', 0.22, 'γ', 0.42, 'δ', 0.62, 'ε', 0.86, 'ζ'),
  rubber: tones('Α', 0.3, 'γ', 0.56, 'θ', 0.82, 'δ'),
  scarf: tones('Σ', 0.26, 'Τ', 0.42, 'Υ', 0.58, 'Φ', 0.76, 'Χ'),
  black: tones('Ο', 0.48, 'Α', 0.7, 'γ', 0.88, 'δ'),
  skin: tones('¤', 0.12, '§', 0.26, '»', 0.37, '°', 0.44, '9', 0.53, 'Q', 0.88, '/'),
  patch: tones('(', 0.2, ')', 0.46, '!', 0.82, '"'),
  hair: tones('3', 0.3, '4', 0.5, '6', 0.76, '7', 0.93, '8'),
  teeth: tones('5', 0.3, '6', 0.44, '7', 0.6, '8', 0.78, 'W'),
  brow: tones('Κ', 0.14, 'Λ', 0.3, 'Μ', 0.46, 'Ν', 0.68, 'Ξ'),
  suit: tones(',', 0.15, '¹', 0.46, 'U', 0.78, '_', 0.94, '¼'),
  shirt: tones('6', 0.4, '7', 0.6, '8', 0.88, 'W'),
  tie: tones('r', 0.25, '[', 0.5, 'R', 0.86, 'q'),
  mouthIn: tones('=', 0.6, '¤'),
  tongue: tones('p', 0.4, '?', 0.62, 'P', 0.86, '^'),
};

// ============================== FUR STRANDS (ref 03) ==============================
const hash = (a, b, s) => { let h = (a * 374761393 + b * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
/**
 * ref 03's hand-clustered fur as a field: across the local fur flow the picture is cut into 1-px strands; along it
 * each strand is cut into segments 3 to 7 px long (each strand its own length and phase). Every segment gets a value
 * offset n in -1..1 (65% its own, 35% shared by a cluster of 3 neighbouring strands, so strands bunch into locks), and
 * about 1 segment in 12 an accent (acc +-1): a whole strand a full tone lighter or darker. Segments taper: the offset
 * fades over the first and last pixel, so strand ends point.
 */
function strandField(c, FLOW, ids, { seed = 1, len = [3, 7], accent = 0.085 } = {}) {
  const W = c.w, n = new Float32Array(W * c.h), acc = new Float32Array(W * c.h);
  for (let i = 0; i < n.length; i++) {
    if (!ids.has(c.part[i])) continue;
    const x = i % W, y = (i / W) | 0, fx = FLOW[2 * i], fy = FLOW[2 * i + 1];
    const u = -fy * x + fx * y, t = fx * x + fy * y;
    // the base: locks 2 strands wide (and a 4-wide grouping over them), each lock 4..9 px long, pointed at both ends
    const s2 = Math.floor(u / 2), L2 = len[0] + hash(s2, 1, seed) * (len[1] - len[0]), ph = hash(s2, 2, seed) * L2;
    const seg = Math.floor((t + ph) / L2), pos = (t + ph) / L2 - seg;
    const s4 = Math.floor(u / 4 + 0.5), L4 = 6 + hash(s4, 3, seed) * 6, seg4 = Math.floor((t + hash(s4, 4, seed) * L4) / L4);
    const taper = Math.min(1, Math.min(pos, 1 - pos) * L2 * 0.8);
    n[i] = (0.6 * (2 * hash(s2, seg, seed + 5) - 1) + 0.4 * (2 * hash(s4, seg4, seed + 9) - 1)) * taper;
    // accents: single 1-px strands, longer (6..11 px), a full tone off, pointed
    const s = Math.floor(u), La = 6 + hash(s, 6, seed) * 5, pa = (t + hash(s, 7, seed) * La) / La, sa = Math.floor(pa), qa = pa - sa;
    const r = hash(s, sa, seed + 13);
    if (r < accent && Math.abs(qa - 0.5) < 0.42) acc[i] = (r < accent / 2 ? 1 : -1);
  }
  return { n, acc };
}

// ============================== THE RACCOON ==============================
const RZ = 1.15, ROX = 132 - 134 * RZ, ROY = 78 - 80 * RZ;   // visible window in design units: x 19..221, y 12..193
const HEADC = [186, 92];   // fur flows away from the nose
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + (0.25 + 0.45 * Math.min(1, Math.max(0, (y - 70) / 25))) * Math.abs(x - HEADC[0]));   // away from the nose, curving down over the cheeks

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
  { // the knit (ref 03's scarf): chunky ribs across the band, each a little rounded roll, and the end's ribs across its length
    const ribs = [{ l: [[92, 124], [120, 128], [146, 126], [170, 118]], w: 4, a: -0.6 }];
    for (let x = 96; x < 172; x += 8.6) ribs.push({ l: [[x + 3, 104], [x - 3, 138]], w: 4.4, a: -1.5 });
    for (let f = 0.15; f < 1; f += 0.2) { const px = 165 + f * 19, py = 121 + f * 16; ribs.push({ l: [[px - 6, py + 6], [px + 6, py - 6]], w: 1.8, a: -1.4 }); }
    L.form(['scarf', 'scarfEnd'], { R: 5, height: bumps(ribs), front: [...head, ...front] });
  }
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
  { // falloff: below y 118 the light dims gradually, up to 20% at the bottom, so the face stays the brightest, sharpest
    //   place (the cream bib under the scarf must not compete with the muzzle)
    const pm = c.partMask(['body', 'tail', 'armL', 'armR', 'pawN']);
    for (let i = 0; i < pm.length; i++) if (pm[i]) { const y = ((i / c.w) | 0) / c.S - c.oy / c.S; if (y > 118) L.v[i] *= 1 - 0.2 * Math.min(1, (y - 118) / 70); }
  }
  // ---- ref 03's fur, done in the LIGHT before quantizing: (1) the marking edges (mask, brows, bib, tail rings) are
  //      warped along the fur flow by strand-shaped offsets, so markings interlock in strands; (2) a strand field
  //      (1 px across the flow, 3 to 7 px along it, grouped in clusters) is added to the value map, so every band edge
  //      breaks into strands and the flat planes carry a few lighter and darker strands, all pointing the way fur grows ----
  const flowAt = (name, x, y) => {
    if (name === 'head' || name === 'snout') return y > 104 ? norm(x < 140 ? -0.6 : 0.6, 1) : headFlow(x, y);
    if (name === 'earL') return norm(x - 116, y - 60);   // the ear's tufts fan out from its base
    if (name === 'earR') return norm(x - 160, y - 54);
    if (name === 'body') return norm((x - 127) / 45, 1);
    if (name === 'armL') return norm(-0.45, 1);
    if (name === 'armR') return norm(0.7, 1);
    if (name === 'pawN') return [-nX, -nY];
    if (name === 'tail') { let b = 0, bd = 1e9; for (let i = 0; i < tn; i++) { const d = (tcc[i][0] - x) ** 2 + (tcc[i][1] - y) ** 2; if (d < bd) { bd = d; b = i; } } const a = tcc[Math.max(0, b - 1)], e = tcc[Math.min(tn - 1, b + 1)]; return norm(e[0] - a[0], e[1] - a[1]); }
    return [0, 1];
  };
  const furParts = ['head', 'snout', 'earL', 'earR', 'body', 'armL', 'armR', 'pawN', 'tail'];
  const furIds = new Map(furParts.map((n) => [c.id(n), n]));
  const FLOW = new Float32Array(c.w * c.h * 2);
  for (let i = 0; i < c.w * c.h; i++) { const n = furIds.get(c.part[i]); if (!n) continue; const [fx, fy] = flowAt(n, (i % c.w - c.ox) / c.S, (((i / c.w) | 0) - c.oy) / c.S); FLOW[2 * i] = fx; FLOW[2 * i + 1] = fy; }
  const strand = strandField(c, FLOW, furIds, { seed: 7, len: [4, 9], accent: 0.1 });
  { // (1) the marking edges interlock: each fur pixel takes the material found a strand-offset away along the flow
    const src = c.img.px.slice(), W = c.w, D = 3 * k / 1.5 + 0.5, mats = new Set(['fur', 'white', 'mask', 'furD', 'brow', 'earIn']);
    for (let i = 0; i < src.length; i++) {
      if (!furIds.has(c.part[i]) || !mats.has(src[i])) continue;
      const o = Math.round(strand.n[i] * D), X = i % W + Math.round(FLOW[2 * i] * o), Y = ((i / W) | 0) + Math.round(FLOW[2 * i + 1] * o), j = Y * W + X;
      if (X < 0 || Y < 0 || X >= W || Y >= c.h || c.part[j] !== c.part[i] || !mats.has(src[j])) continue;
      c.img.px[i] = src[j];
    }
  }
  // (2) the strands in the light: a small offset everywhere (band edges break), a strong one on a few strands (accents)
  for (let i = 0; i < L.v.length; i++) if (furIds.has(c.part[i])) L.v[i] += 0.1 * strand.n[i] + strand.acc[i] * 0.17;
  { const bid = c.id('body'); for (let i = 0; i < L.v.length; i++) if (c.part[i] === bid && c.img.px[i] === 'white') L.v[i] *= 0.86; }   // the bib a step under the muzzle
  const MAT = c.img.px.slice();   // the materials before the light (for the touches after it)
  L.paint(RAMPS);


  // ---- colour picked up from neighbours (ref 03 lets the cookie's orange into the paw fur): strands of the coat near
  //      the yellow barrel turn yellow-warm, strands of the cream just under the scarf catch its green; and the ears'
  //      hollows grow ref 03's pale tufts (the accent strands that point up out of the dark) ----
  {
    const W = c.w, near = (mask, i, r) => { const x = i % W, y = (i / W) | 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < c.h && dx * dx + dy * dy <= r * r && mask[Y * W + X]) return true; } return false; };
    const bm = c.partMask(['barrel', 'cap7', 'cap137']), sm = c.partMask(['scarf', 'scarfEnd', 'scarfKnot']);
    const ears = new Set([c.id('earL'), c.id('earR')]), rr = Math.max(2, Math.round(3 * k));
    for (let i = 0; i < c.img.px.length; i++) {
      const p = c.img.px[i]; if (!furIds.has(c.part[i])) continue;
      if (ears.has(c.part[i]) && (MAT[i] === 'mask' || MAT[i] === 'earIn') && (strand.acc[i] > 0 || strand.n[i] > 0.6)) { c.img.px[i] = L.v[i] > 0.5 ? 'Μ' : 'Λ'; continue; }
      if (strand.n[i] > 0.25 && ['Δ', 'Ε', 'Ζ'].includes(p) && near(bm, i, rr)) c.img.px[i] = 'ξ';
      else if (strand.n[i] > 0.1 && ['Κ', 'Λ', 'Μ'].includes(p) && c.part[i] === c.id('body') && near(sm, i, rr + 1)) c.img.px[i] = 'ο';
    }
  }

  // ---- details last: ref 03's eyes (no white: a dark almond, an amber iris ringed in brown, a big pupil, one sharp
  //      catchlight, light glowing low through the iris, a wet rim catching the light), the nose, the smirk, the pump ----
  const eye = (cx, cy, rx, ry, n) => {
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.55, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.4], [cx + rx * 0.55, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.9]]), 'Ο', nl);
    const ix = cx + rx * 0.2, iy = cy + 0.5, ir = ry * 1.1;
    c.paint(n, ell(ix, iy, ir, ir * 1.04), 'ι');
    c.paint(n, ell(ix, iy, ir * 0.8, ir * 0.84), 'κ');
    c.paint(n, ell(ix + ir * 0.12, iy + ir * 0.24, ir * 0.62, ir * 0.56), 'λ');
    c.paint(n, ell(ix + ir * 0.22, iy + ir * 0.46, ir * 0.44, ir * 0.28, -0.3), 'μ');
    if (k >= 0.9) c.paint(n, ell(ix + ir * 0.3, iy + ir * 0.56, ir * 0.2, ir * 0.12, -0.3), 'ν');
    c.paint(n, ell(ix + 0.2, iy, ir * 0.4, ir * 0.48), 'Ο');
    // the heavy upper lid (the sly look) and its shadow across the top of the iris
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.3], [cx, cy - ry * 0.42], [cx - rx - 2, cy - ry * 0.15]]), 'Ο');
    const lidSh = blob([[cx - rx, cy - ry * 0.3], [cx, cy - ry * 0.42], [cx + rx, cy - ry * 0.32], [cx + rx, cy + 0.4], [cx, cy + 0.1], [cx - rx, cy + 0.5]]);
    c.paint(n, lidSh, 'ι', { only: ['κ'] });
    c.paint(n, lidSh, 'κ', { only: ['λ', 'μ'] });
    const g = Math.max(1, Math.round(1.4 * k));
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(Math.round(c.X(ix - ir * 0.42)) + i, Math.round(c.Y(iy - ir * 0.12)) + j, 'Ξ');
    if (k >= 0.9) c.dot(ix + ir * 0.5, iy + ir * 0.1, 'Μ');                                         // the secondary catchlight
    if (k >= 0.9) c.line1(curve([[cx - rx * 0.6, cy + ry * 1.02], [cx, cy + ry * 1.12], [cx + rx * 0.6, cy + ry * 0.98]]), 'Γ');   // the lit lower lid
    if (k >= 0.9) c.line1(curve([[cx + rx * 0.35, cy + ry * 0.82], [cx + rx * 0.62, cy + ry * 0.62], [cx + rx * 0.86, cy + ry * 0.12]]), 'Λ', { on: n });   // the wet rim
  };
  eye(122, 77, 9.4, 7, 'eyeN');
  eye(161, 75, 6.6, 5.4, 'eyeF');
  // the nose: a sharp glint where the light hits the top, a softer second one, the nostrils
  { const g = Math.max(1, Math.round(1.4 * k)), X = Math.round(c.X(184)), Y = Math.round(c.Y(88.2)); for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(X + i, Y + j, 'ζ'); if (fine) c.dot(188, 87.6, 'δ'); }
  c.dot(191.5, 95.5, 'Ο'); c.dot(185, 95.5, 'Ο');
  {
    const M = curve([[188, 99.5], [186, 103], [180, 106], [172, 107.4], [165, 106.6], [159.5, 104], [156, 100]], 8), nM = M.length;
    const th = (i) => 0.25 + 1.15 * Math.pow(i / (nM - 1), 1.4);                 // thin near the nose, thick at the tucked corner
    const nrm = (i) => { const a = M[Math.max(0, i - 1)], b = M[Math.min(nM - 1, i + 1)], [dx, dy] = norm(b[0] - a[0], b[1] - a[1]); return [-dy, dx]; };
    const top = M.map((p, i) => { const [nx, ny] = nrm(i); return [p[0] - nx * th(i) * 0.5, p[1] - ny * th(i) * 0.5]; });
    const bot = M.map((p, i) => { const [nx, ny] = nrm(i); return [p[0] + nx * th(i) * 0.5, p[1] + ny * th(i) * 0.5]; });
    const crease = c.mask([...top, ...bot.reverse()]);
    for (let i = 0; i < crease.length; i++) if (crease[i]) { const x = (i % c.w - c.ox) / c.S; c.img.px[i] = x > 182 ? 'Γ' : 'Α'; }   // it fades toward the nose
    if (fine) c.line1(M.slice(Math.round(nM * 0.25), Math.round(nM * 0.85)).map(([x, y], j) => { const i = j + Math.round(nM * 0.25), [nx, ny] = nrm(i); return [x + nx * (th(i) * 0.5 + 1.1), y + ny * (th(i) * 0.5 + 1.1)]; }), 'Ξ');   // the lit lip
  }
  { // the gauge: a light face, the needle
    const g = at(30 / sc);
    c.paint('gauge', ell(g[0], g[1], 6.4, 6.4), 'ζ');
    c.paint('gauge', ell(g[0] + 1.2, g[1] + 1.4, 5.4, 5.4).filter((_, i) => i > 4 && i < 16).concat([[g[0] + 5, g[1] - 2], [g[0] - 2, g[1] + 5]]), 'ε');
    c.stroke([g, [g[0] + 4, g[1] - 3]], 'R', { on: 'gauge', t: 1, line: false });
    c.dot(g[0], g[1], 'Α');
  }
  if (fine) {
    // one bright streak along the barrel's light stripe, a glint on the chrome collar
    const a = at(84), b = at(128), l0 = Math.hypot(-0.55, -0.65, 0.52), px2 = -(b[1] - a[1]), py2 = b[0] - a[0], pl = Math.hypot(px2, py2), q = ((px2 / pl) * -0.55 + (py2 / pl) * -0.65) / l0;
    const o = 6.5 * q * 0.62;
    const sm = c.mask(bar([a[0] + (px2 / pl) * o, a[1] + (py2 / pl) * o], [b[0] + (px2 / pl) * o, b[1] + (py2 / pl) * o], 1.4, true)), bid = c.id('barrel');
    for (let i = 0; i < sm.length; i++) if (sm[i] && c.part[i] === bid) c.img.px[i] = 'Ω';
    const p = at(140, 5); c.dot(p[0], p[1], 'ζ');
  }
  // the tip of the tail: two or three small lit strands
  if (fine) { const { p, dx, dy } = tailAt(1); for (const [ox, oy, l] of [[0, 0, 3], [-1.6, 1, 2.2]]) c.line1([[p[0] + ox, p[1] + oy], [p[0] + ox + dx * l, p[1] + oy + dy * l]], 'Θ'); }
  const KEEP = ['Ξ', 'Ω', 'ν', 'μ', 'λ', 'κ', 'ι', 'R', 'ζ', 'ε', 'Μ', 'Λ'];
  c.despeckle(null, KEEP);
  // the silhouette (ref 03): a near-black line on the shadow side; on the lit side a line only 3 steps darker than the
  // fill it wraps (it softens, it doesn't cut); coloured per material
  const allR = Object.values(RAMPS).map((r) => [...new Set(r)]);
  const down = (key, s) => { for (const r of allR) { const i = r.indexOf(key); if (i >= 0) return r[Math.max(0, i - s)]; } return 'Α'; };
  c.silhouette({
    dark: 'Α', light: [-1, -1],
    pick: (nb, lit) => (RAMPS.yel.includes(nb) ? 'Ψ' : RAMPS.scarf.includes(nb) ? 'Σ' : [...RAMPS.chrome, ...RAMPS.rubber].includes(nb) ? 'Α'
      : lit && nb ? down(nb, 3) : undefined),
  });
  c.cleanSilhouette();
  c.dejag(KEEP);
  c.cleanSilhouette({ nubs: false, passes: 1 });
  if (fine) c.despeckle(null, KEEP);
  // whiskers: two fine light lines, past the outline
  if (fine) {
    for (const w of [[[178, 99], [194, 96], [208, 93]], [[180, 102], [195, 104], [209, 107]]]) {
      const m = c._line1Mask(curve(w, 16));
      for (let i = 0; i < m.length; i++) if (m[i] && (c.img.px[i] === null || ['Α', 'Α', 'Γ', 'Ο', 'Β'].includes(c.img.px[i]))) c.img.px[i] = c.img.px[i] === null ? 'Ν' : 'Λ';
    }
    c.despeckle(null, [...KEEP, 'Ν']);
    c.cleanSilhouette({ nubs: false, passes: 1 });
    c.deorphan(KEEP);
    c.dejag([...KEEP, 'Ν'], { thick: true, fill: true });
    c.deorphan([...KEEP, 'Ν']);   // last: lone low-contrast pixels left by the strands
    c.deorphan(['Ν', 'ζ', 'Ω'], furParts);   // inside the fur the creams are not glints: lone ones merge
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

/** the art-history preview: the poster portrait at k = 1.5 and k = 1 */
export function portraitsPreview() {
  return { frames: [raccoonPortrait2d('smirk', 1.5), raccoonPortrait2d('smirk', 1)], cols: 2 };
}
