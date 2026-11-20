// M4.9 round 01 (Ivan: "drawing from shades, not from shapes"; "they think about how light is scattered and reflected,
// where are shadows and where are highlights"): the two hero portraits PAINTED WITH LIGHT. Every figure is laid in as
// flat silhouettes holding MATERIALS (fur, white fur, mask, yellow plastic, skin, navy cloth...), with no outlines
// inside it; then ONE value map (0 dark .. 1 light, light from the upper left) is built for the whole picture, and only
// at the end each material is quantized onto its own ramp by that same light (light2d's paintLight). So the head's
// shadow falls across the scarf, the chest and the pump alike, an arm reads because it catches light and casts a
// shadow, a paw is one lit mass with a few dark creases, and the face details are a handful of accents.
// The styles differ in HOW the light is rendered (V):
//   a  VOLUME: each mass a lit volume (lightField: the silhouette inflated, lit, few flat bands; tubeField for the
//      pump), then designed shadow accents (cast shadows, creases, sockets).
//   b  CEL: no volume rendering. A flat lit base; hand-designed flat shadow shapes (a crescent on the side of each form
//      that turns away from the light, cast shadows, creases), a few highlight shapes; 3 tones + an accent per
//      material, hard edges, a dark outline (refs 04 / 05).
//   c  RICH: the volumes with longer hue-shifted ramps, dither strips, a rim of light, a reflected light on the shadow
//      side, and fur at the light's edge and the silhouette (ref 03).
// Raccoon: M4.8 iter_02's pose (the straight pump across the chest at port arms, the green scarf, the warm coat), the
// pump now yellow like the game's, lowered so the face is clear. Dog Fjord: M4.8 iter_01's minimal look on M4.7
// iter_04's head (a cartoon bulldog, never a real person's likeness).
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../lib/draw2d.mjs';
import '../lib/light2d.mjs';
import { dome, cap } from '../lib/light2d.mjs';

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const V = 'a';
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== LIGHT ==============================
// cel levels (style b): the accent, the shadow, the lit base, the highlight (the centres of a 4-tone ramp)
const DEEP = 0.02, SH = 0.34, LIT = 0.67, HI = 1.0;

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

/** the light of one picture: the value map and the style's ways of putting light and shadow into it */
function lighting(c) {
  const v = c.values(V === 'b' ? LIT : 0.6);
  return {
    v,
    /** one form lit as a whole: a volume (a, c) or a flat base with a shadow crescent and a light crescent (b) */
    form(on, o = {}) {
      // `front`: the parts lying in front of this form; they belong to its silhouette (no holes to turn round)
      const mass = o.front ? [].concat(on, o.front) : on;
      if (V === 'b') {
        const m = c.partMask(on); for (let i = 0; i < m.length; i++) if (m[i]) v[i] = o.base ?? LIT;
        const dir = o.dir ?? [1, 1.2];
        c.crescentValue(v, mass, o.cel ?? (o.R ?? 8) * 0.6, SH, { mode: 'min', dir, only: on });
        if (o.deep) c.crescentValue(v, mass, o.deep, DEEP, { mode: 'min', dir, only: on });
        if (o.hi) c.crescentValue(v, mass, o.hi, HI, { dir: [-dir[0], -dir[1]], mode: 'max', only: on });
        if (o.shadow) c.valueShape(v, o.shadow, SH, { mode: 'min', on });   // a hand-designed shadow shape
      } else {
        if (o.shadow) o.after = () => c.valueShape(v, o.shadow, 0.74, { mode: 'mul', on });
        c.lightField(v, on, { mass: o.front ?? null, R: o.R ?? 8, prims: o.prims, k: o.k, height: o.height, smooth: o.smooth ?? 0.3, curve: o.curve, gloss: o.gloss, shine: o.shine });
        if (o.after) o.after();
      }
    },
    /** a straight tube (pump parts): analytic cylinder light; in style b snapped to the cel levels */
    tube(on, a, b, r, o = {}) {
      const cel = (x) => (x > 0.86 ? HI : x > 0.5 ? LIT : x > 0.3 ? SH : DEEP);
      c.tubeField(v, on, a, b, r, { gloss: o.gloss ?? 0.35, shine: o.shine ?? 12, curve: V === 'b' ? cel : o.curve });
    },
    /** a cast shadow of `from` on `onto`, (dx, dy) away from the light; s 2 = a deep one */
    cast(from, onto, dx, dy, s = 1) {
      if (V === 'b') c.castValue(v, from, onto, dx, dy, { max: s > 1 ? DEEP : SH });
      else c.castValue(v, from, onto, dx, dy, { mul: s > 1 ? 0.38 : 0.6, soft: V === 'c' ? 0.5 : 0 });
    },
    /** a designed shadow ('sh', 'deep') or light ('hi') shape */
    shade(shapes, lvl, on = null) {
      if (V === 'b') c.valueShape(v, shapes, lvl === 'deep' ? DEEP : lvl === 'sh' ? SH : HI, { mode: lvl === 'hi' ? 'max' : 'min', on });
      else c.valueShape(v, shapes, lvl === 'deep' ? 0.4 : lvl === 'sh' ? 0.65 : 0.97, { mode: lvl === 'hi' ? 'max' : 'mul', on });
    },
    /** a 1-px crease (dark) */
    crease(pts, on, s = 1) {
      if (V === 'b') c.valueLine(v, pts, s > 1 ? DEEP : SH, { mode: 'min', on });
      else c.valueLine(v, pts, s > 1 ? 0.3 : 0.55, { mode: 'mul', on });
    },
    /** style c: a rim of light toward the light, a reflected light on the far edge */
    rimBounce(on) {
      if (V !== 'c') return;
      c.crescentValue(v, on, 1.1, 0.2, { dir: [-1, -1], mode: 'add' });
      c.crescentValue(v, on, 0.7, 0.1, { dir: [1, 1], mode: 'add' });
    },
    paint(mats) { c.paintLight(v, mats, { strip: V === 'a' ? 0.22 : V === 'b' ? 0 : 0.45 }); },
  };
}

// the ramps (palette keys, dark -> light) per style and material
const RAMPS = {
  a: {
    fur: ['#', '$', '%', '&', 'J'], furD: ['@', '#', '$', 'I', '%'], white: ['&', 'J', '*', '+', 'W'], mask: ['@', '@', '#', '$', 'I'],
    earIn: ['@', '#', "'", '-', '-'], paw: ['#', '$', 'I', '%', '&'], yel: ['|', 'o', '¥', 'y', 'Y'], chrome: ['1', '3', '5', '7', 'W'],
    rubber: ['0', '1', '2', '3', '4'], scarf: ['e', 'e', 'E', 'l', 'L'], black: ['0', '0', '1', '2', '3'],
    skin: ['§', '?', 'P', '^', 'm', '~'], patch: ['(', '(', ')', '!', '"'], hair: ['3', '4', '5', '6', '7', '8'], teeth: ['5', '6', '7', '8', 'W'],
    suit: [',', ',', 'u', 'U', '_'], shirt: ['5', '6', '7', '8', 'W'], tie: ['r', 'r', '[', 'R', 'q'], mouthIn: ['=', '=', '=', '¤', '¤'], tongue: ['p', '?', 'P', '^', 'm'],
  },
  b: {
    fur: ['#', '%', 'J', '*'], furD: ['@', '$', 'I', '%'], white: ['%', 'J', '+', 'W'], mask: ['@', '@', '#', 'I'],
    earIn: ['@', '#', "'", '-'], paw: ['@', '#', 'I', '%'], yel: ['|', 'o', 'y', 'Y'], chrome: ['1', '4', '7', 'W'],
    rubber: ['0', '1', '2', '4'], scarf: ['e', 'E', 'l', 'L'], black: ['0', '0', '1', '3'],
    skin: ['§', 'P', 'm', '~'], patch: ['(', ')', '!', '"'], hair: ['3', '5', '7', '8'], teeth: ['6', '7', 'W', 'W'],
    suit: [',', 'u', 'U', '_'], shirt: ['6', '7', 'W', 'W'], tie: ['r', '[', 'R', 'q'], mouthIn: ['=', '=', '¤', '¤'], tongue: ['p', '?', 'P', '^'],
  },
  c: {
    fur: ['@', '#', '$', 'I', '%', '&', 'J', '*', '+'], furD: ['@', '#', '$', 'I', '%', '&'], white: ['%', '&', 'J', '*', '+', 'W', '`'], mask: ['@', '@', '#', '$', 'I', '%'],
    earIn: ['@', '#', "'", "'", '-', '-'], paw: ['@', '#', '$', 'I', '%', '&', 'J'], yel: ['|', 'o', '¥', 'y', 'Y', '`'], chrome: ['0', '2', '4', '6', '7', '8', 'W'],
    rubber: ['0', '1', '2', '3', '4', '5'], scarf: ['e', 'e', 'E', 'l', 'L'], black: ['0', '0', '1', '2', '3', '5'],
    skin: ['¤', '§', '?', 'P', '^', 'm', '~', 'M'], patch: ['(', '(', ')', '!', '"', 'j'], hair: ['2', '3', '4', '5', '6', '7', '8', 'W'], teeth: ['5', '6', '7', '8', 'W', 'W'],
    suit: [',', ',', 'u', 'U', '_', 'c'], shirt: ['5', '6', '7', '8', 'W', 'W'], tie: ['r', 'r', '[', 'R', 'q'], mouthIn: ['=', '=', '=', '¤', '¤'], tongue: ['p', '?', 'P', '^', 'm'],
  },
}[V];

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
  const FOOT = [170, 170], TOP = [42, 62], PL = Math.hypot(TOP[0] - FOOT[0], TOP[1] - FOOT[1]);
  const sc = PL / 180, uX = (TOP[0] - FOOT[0]) / PL, uY = (TOP[1] - FOOT[1]) / PL;
  let nX = -uY, nY = uX; if (-nX - nY < 0) { nX = -nX; nY = -nY; }
  const at = (s, o = 0) => [FOOT[0] + uX * s * sc + nX * o, FOOT[1] + uY * s * sc + nY * o];
  const HF = 22, HN = 58;                      // the far paw low on the barrel, the near paw higher
  const wristN = at(HN, -15), wristF = at(HF, 15);

  // ---- the tail curling up beside the body at the lower left ----
  const tailC = [[104, 172], [80, 174], [62, 166], [52, 150], [54, 132]];
  const tailW = (t) => 15 + 9 * Math.sin(Math.PI * Math.min(1, t * 1.15)) - 6 * t;
  c.shape('tail', tufted(tube(tailC, tailW, undefined, 12), { amp: 3, period: 6.5, flow: (x, y) => norm(x - 90, y - 150), lean: 0.5, seed: 4 }), 'fur', nl);
  {
    const cc = curve(tailC, 12), n = cc.length;
    for (const f of [0.3, 0.56, 0.8]) {
      const i = Math.round(f * (n - 1)), a = cc[Math.max(0, i - 1)], b = cc[Math.min(n - 1, i + 1)];
      const [dx, dy] = norm(b[0] - a[0], b[1] - a[1]), px2 = -dy, py2 = dx, p = cc[i], u = 3.2, bow = 2.4;
      c.paint('tail', blob([[p[0] - px2 * 16 - dx * u, p[1] - py2 * 16 - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + px2 * 16 - dx * u, p[1] + py2 * 16 - dy * u],
        [p[0] + px2 * 16 + dx * u, p[1] + py2 * 16 + dy * u], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - px2 * 16 + dx * u, p[1] - py2 * 16 + dy * u]], 6), 'mask');
    }
    const tp = cc[n - 1];
    c.paint('tail', ell(tp[0], tp[1] - 2, 9, 9), 'mask');
  }

  // ---- the torso: one stout mass with a pale bib; the bottom finishes in a rounded, tufted belly ----
  c.shape('body', tufted(blob([[104, 108], [90, 118], [84, 134], [83, 152], [88, 168], [102, 178], [126, 182], [150, 178], [164, 168], [170, 150], [168, 130], [158, 116], [144, 108]]),
    { amp: 3, period: 7.5, where: (x, y) => (y > 132 ? 1 : 0), flow: [0, 1], lean: 0.9, seed: 2 }), 'fur', nl);
  c.paint('body', tufted(blob([[108, 118], [150, 118], [147, 134], [138, 146], [128, 150], [118, 146], [110, 134]]), { amp: 3, period: 5, where: (x, y) => (y > 132 ? 1 : 0), flow: [0, 1], lean: 0.6, seed: 52 }), 'white');

  // ---- arms (fur) from the shoulders to the wrists on the pump ----
  const armPath = (pts, w0, w1, seed, flow) => tufted(tube(pts, (t) => w0 + (w1 - w0) * t, undefined, 12), { amp: 2.2, period: 6, flow, lean: 0.7, seed, where: () => 0.8 });
  c.shape('armR', armPath([[160, 120], [186, 146], wristF], 19, 12, 60, [0.4, 1]), 'fur', nl);
  c.shape('armL', armPath([[98, 122], [83, 154], wristN], 20, 12, 70, [-0.3, 1]), 'fur', nl);
  // the forearms darken toward the paws (a raccoon's limbs are darker than its coat): local colour, so the forearm
  // reads against the lighter chest by value alone
  c.paint('armL', blob([[70, 150], [84, 140], [100, 142], [124, 136], [130, 152], [100, 168], [74, 168]]), 'furD');
  c.paint('armR', blob([[200, 140], [184, 132], [176, 136], [158, 138], [154, 156], [180, 160], [200, 158]]), 'furD');

  // ---- the green knit scarf: the band round the neck, the loose end flung back over the far shoulder ----
  c.shape('scarfEnd', blob([[160, 112], [174, 116], [182, 126], [187, 138], [180, 142], [172, 132], [164, 124]]), 'scarf', nl);
  for (const [x, y] of [[180, 141], [183, 141.5], [186, 140]]) c.shape('fringe' + x, bar([x, y], [x - 0.6, y + 5], 1.6), 'scarf', nl);
  c.shape('scarf', blob([[92, 110], [112, 115], [140, 115], [168, 106], [174, 114], [170, 126], [146, 133], [120, 135], [100, 131], [90, 121]]), 'scarf', nl);

  // ---- ears (behind the head): fur outside, a dark hollow with a dusty pink inside ----
  c.shape('earL', tufted(blob([[96, 56], [98, 38], [103, 26], [110, 22], [116, 30], [124, 46]]), { amp: 2.2, period: 5.5, where: (x) => (x < 106 ? 1 : 0), flow: [-1, 0], seed: 8 }), 'fur', nl);
  c.paint('earL', blob([[103, 52], [105, 38], [109, 31], [113, 32], [119, 47]]), 'mask');
  c.paint('earL', blob([[107, 50], [109, 40], [112, 36], [116, 47]]), 'earIn');
  c.shape('earR', tufted(blob([[148, 44], [156, 30], [163, 22], [170, 23], [174, 34], [176, 52]]), { amp: 2.2, period: 5.5, where: (x) => (x > 168 ? 1 : 0), flow: [1, 0], seed: 10 }), 'fur', nl);
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
  // the dark stripe from the crown down between the eyes
  c.paint('head', tufted(blob([[135, 39], [148, 40], [151, 52], [149, 65], [143, 70], [138, 56]]), { amp: 1.8, period: 4.5, where: () => 1, flow: (x, y) => (y < 54 ? [0, -1] : [0, 1]), lean: 0.6, seed: 16 }), 'furD');
  // the pale cheek ruffs below the mask
  c.paint('head', blob([[78, 90], [96, 93], [112, 99], [124, 104], [128, 112], [118, 120], [100, 118], [84, 110], [76, 98]]), 'white');
  c.paint('head', blob([[170, 98], [180, 96], [190, 104], [186, 114], [174, 110]]), 'white');
  // the white brows over each eye, breaking the outline at the outer end
  c.paint('head', tufted(blob([[92, 66], [98, 58], [110, 53], [124, 52], [134, 55], [136, 60], [124, 59], [110, 61], [98, 67]]), { amp: 2, period: 3.6, where: (x, y) => (y < 58 ? 1 : 0.4), flow: [-0.8, -0.6], lean: 0.7, seed: 13 }), 'white');
  c.paint('head', tufted(blob([[152, 58], [158, 52], [168, 50], [176, 52], [180, 57], [176, 60], [166, 57], [156, 61]]), { amp: 1.8, period: 3.6, where: (x, y) => (y < 56 ? 1 : 0.4), flow: [0.6, -0.8], lean: 0.6, seed: 14 }), 'white');
  // the bandit mask: a lobe round each eye, joined over the bridge; the near lobe sweeps back onto the cheek
  c.paint('head', tufted(blob([
    [80, 84], [84, 74], [94, 66], [108, 63], [122, 63], [132, 66], [140, 70], [146, 66], [156, 62], [168, 61], [178, 64], [182, 72],
    [178, 82], [168, 86], [158, 87], [150, 85], [144, 80], [138, 84], [132, 91], [120, 95], [106, 96], [92, 98], [82, 96],
  ]), { amp: 2.6, period: 4, where: (x, y) => (x < 100 ? 1 : y > 86 && x < 136 ? 0.6 : 0), flow: [-0.7, 0.7], lean: 0.7, seed: 15 }), 'mask');
  // the muzzle and the chin under the mask, white (iter_02's bright lower face)
  c.paint('head', blob([[100, 99], [118, 97], [132, 91], [142, 86], [152, 90], [158, 104], [168, 112], [150, 120], [128, 122], [108, 118]]), 'white');
  // the snout: a forward block of white fur, a grey bridge coming down from the stripe
  c.shape('snout', blob([[146, 84], [156, 80], [170, 80], [182, 84], [190, 90], [192, 97], [186, 103], [174, 106], [160, 106], [150, 101]]), 'white', nl);
  c.paint('snout', blob([[146, 84], [154, 80.5], [164, 80], [156, 84], [149, 90]]), 'fur');
  c.shape('nose', blob([[180, 88], [186, 85], [193, 86], [197, 91], [195, 97], [189, 99], [182, 97], [179, 92]]), 'black', nl);

  // ---- the pump across the chest, then the paws round it ----
  pumpParts(c, at, sc);
  const paw = (name, s0, q) => {
    const A = (s, o) => at(s0 + s, o * q);
    // one mass from the wrist across the barrel; the curled fingers only as a soft scallop where they turn over the edge
    c.shape(name, blob([A(-4.6, 14), A(-7.2, 6), A(-8, -2), A(-7.6, -7), A(-6.2, -9.6), A(-4, -10.4), A(-2, -9.6), A(0, -10.6), A(2, -9.8), A(4, -10.6), A(6.2, -9.6), A(7.8, -6.6), A(8.6, -1), A(8.8, 5), A(5.4, 14)]), 'paw', nl);
    return A;
  };
  const AF = paw('pawF', HF, 1), AN = paw('pawN', HN, -1);

  // ============ LIGHT ============
  const head = ['head', 'snout'];
  const pumpAll = ['barrel', 'cap7', 'cap137', 'rod', 'boss', 'gauge', 'foot', 'handle'];
  const paws = ['pawF', 'pawN'];
  L.form('tail', { R: 9, cel: 7, hi: 1.8 });
  L.form('body', { R: 22, cel: 5, hi: 2.2, curve: (x) => Math.min(1, x * 1.08 + 0.1), shadow: blob([[150, 110], [172, 124], [176, 156], [166, 180], [140, 192], [96, 192], [90, 178], [120, 180], [146, 172], [158, 150], [158, 128]]), prims: [dome(126, 150, 30, 26)], front: ['armL', 'armR', 'scarf', 'scarfEnd', ...head, ...pumpAll, ...paws] });
  // the arms come forward into the light (the torso behind them sits under the head and the scarf)
  const lift = (x) => Math.min(1.05, x * 1.1 + 0.05);
  L.form('armR', { R: 7, cel: 6, hi: 1.6, curve: lift, front: [...paws, ...pumpAll] });
  L.form('armL', { R: 7, cel: 6, hi: 1.6, curve: lift, front: [...paws, ...pumpAll] });
  L.form(['scarf', 'scarfEnd'], { R: 5, cel: 4, hi: 1.4, height: bumps([{ l: [[92, 124], [120, 128], [146, 126], [170, 118]], w: 3, a: -1.5 }]), front: [...head, ...pumpAll, ...paws] });
  L.form('earL', { R: 4, cel: 3, hi: 1.4 });
  L.form('earR', { R: 4, cel: 4.5 });
  L.form(head, {
    R: 16, cel: 10, hi: 2.2, k: 1.2, front: ['nose', ...pumpAll],
    prims: [dome(132, 74, 46, 36), cap(150, 95, 186, 93, 11, 8), dome(100, 106, 20, 13)],
    height: bumps([
      { l: [[96, 64], [112, 57], [132, 58]], w: 6, a: 2.6 }, { l: [[156, 58], [168, 54], [180, 58]], w: 5, a: 2 },   // brow ridges
      { e: [122, 78, 13, 9], a: -3 }, { e: [161, 76, 10, 7], a: -2.4 },                                                  // eye sockets
    ]),
  });
  L.form('nose', { R: 3, cel: 2.6, hi: 1.2, gloss: 0.5, shine: 14 });
  // the pump: straight tubes lit across their axis
  L.tube('barrel', at(11), at(140), 6.5);
  L.tube('cap7', at(7), at(14), 8.5); L.tube('cap137', at(137), at(144), 8.5);
  L.tube('rod', at(144), at(176), 2.2); L.tube('boss', at(173), at(183), 4.3);
  L.tube('handle', at(178, -25), at(178, 25), 4, { gloss: 0.2 });
  L.tube('foot', at(3.5, -23), at(3.5, 23), 3.5, { gloss: 0.2 });
  L.form(['hose', 'chuck'], { R: 2.2, smooth: 0, cel: 2, hi: 1 });
  L.form('gauge', { R: 3, cel: 3, hi: 1.4 });
  // the paws: one lit mass each, the knuckles of the curled fingers catching the light along the barrel's edge
  for (const [n, A] of [['pawF', AF], ['pawN', AN]]) {
    const kn = [-5.1, -1.7, 1.7, 5.1].map((s) => { const [x, y] = A(s, -7); return dome(x, y, 2.9, 2.9); });
    L.form(n, { R: 4, cel: 4, hi: 1.4, prims: kn, k: 0.5 });
  }
  // where the head turns under: the chin's own shadow (cel)
  if (V === 'b') L.shade(blob([[150, 118], [168, 114], [184, 106], [186, 114], [170, 122], [150, 124]]), 'sh', head);
  // the muzzle under the snout, the nose on the snout
  L.cast('snout', 'head', 1, 3.5);
  L.cast('nose', 'snout', 1, 2.2);
  // the head's shadow on the scarf, the chest and the arms; the scarf's on the chest
  L.cast(['head', 'snout'], ['scarf', 'scarfEnd', 'body', 'armL', 'armR'], 2, 6);
  L.cast(['scarf'], ['body', 'armL', 'armR'], 1.2, 3);
  L.cast(['earL'], ['head'], 1.5, 2.5);
  // the arms on the body
  L.cast('armL', 'body', 2.5, 3); L.cast('armR', 'body', 2.4, 3);
  // the pump on everything behind it (not the face), the paws on the pump
  L.cast(pumpAll, ['body', 'scarf', 'scarfEnd', 'armL', 'armR', 'tail'], 2.6, 3.2);
  L.cast(['pawF', 'pawN'], ['barrel', 'gauge', 'scarf', 'body', 'armR', 'armL'], 1.4, 2);
  // the wrist sinks into the paw: a contact shadow where the forearm meets the paw
  L.cast('pawN', 'armL', 1, 1.5, 2); L.cast('pawF', 'armR', 1, 1.5, 2);
  // fingers: three creases across the curl of each paw, no outlines
  for (const [A, n] of [[AF, 'pawF'], [AN, 'pawN']]) for (const s of [-3.4, 0, 3.4]) L.crease([A(s, -5.4), A(s, -10.4)], n, 2);
  L.rimBounce(['tail', 'body', 'armL', 'armR', 'earL', 'earR', 'head', 'snout', 'scarf', 'scarfEnd', 'pawF', 'pawN']);
  L.paint(RAMPS);

  // ---- fur only where it explains the form: at the edge of the light on the head (a), everywhere in c ----
  if (fine && V !== 'b') {
    const F = RAMPS.fur, Wh = RAMPS.white;
    for (let i = 0; i + 1 < F.length; i++) {
      c.furBreak(V === 'c' ? ['head', 'snout', 'body', 'armL', 'armR', 'tail'] : ['head', 'tail'], F[i + 1], F[i], { dir: headFlow, len: 2.6, gap: V === 'c' ? 2.6 : 4, seed: 20 + i, w: 2 });
      if (V === 'c') c.furBreak(['head', 'body', 'tail'], F[i], F[i + 1], { dir: (x, y) => headFlow(x, y).map((q) => -q), len: 2, gap: 3.2, seed: 40 + i });
    }
    for (let i = 0; i + 1 < Wh.length; i++) c.furBreak(V === 'c' ? ['head', 'snout', 'body'] : ['head'], Wh[i + 1], Wh[i], { dir: [-0.5, 1], len: 2.4, gap: V === 'c' ? 2.6 : 4, seed: 30 + i, w: 2 });
  }

  // ---- details last, and few: the eyes, the nose's shine, the smirk, the gauge, whiskers ----
  const eye = (cx, cy, rx, ry, n) => {
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.55, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.4], [cx + rx * 0.55, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.9]]), '*', nl);
    const ix = cx + rx * 0.28, iy = cy + 0.5, ir = ry * 1.02;
    c.paint(n, ell(ix, iy, ir, ir * 1.04), '>');
    c.paint(n, ell(ix + ir * 0.1, iy + ir * 0.42, ir * 0.7, ir * 0.5), '{');
    c.paint(n, ell(ix + ir * 0.2, iy + ir * 0.72, ir * 0.42, ir * 0.22), '}');
    c.paint(n, ell(ix + 0.3, iy, ir * 0.42, ir * 0.52), '@');
    // the heavy upper lid (the smirk) and its shadow across the top of the eye
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.3], [cx, cy - ry * 0.4], [cx - rx - 2, cy - ry * 0.15]]), '@');
    const lidSh = blob([[cx - rx, cy - ry * 0.3], [cx, cy - ry * 0.42], [cx + rx, cy - ry * 0.32], [cx + rx, cy + 0.6], [cx, cy + 0.2], [cx - rx, cy + 0.6]]);
    c.paint(n, lidSh, '#', { only: ['*'] });
    c.paint(n, lidSh, '<', { only: ['>', '{'] });
    const g = Math.max(1, Math.round(1.3 * k));
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(Math.round(c.X(ix - ir * 0.3)) + i, Math.round(c.Y(iy - ir * 0.05)) + j, 'W');
  };
  eye(122, 77, 9, 6.8, 'eyeN');
  eye(161, 75, 6.6, 5.4, 'eyeF');
  // the nose: its shine where the light hits the top
  c.dot(184.5, 88.6, 'W', fine ? 1 : 0);
  c.dot(191.5, 95.5, '0'); c.dot(185, 95.5, '0');
  // the smirk: a dark crease down from the nose sweeping back into a raised corner
  const mt = Math.max(1, Math.round(1.1 * k));
  c.stroke(curve([[188, 99.5], [186, 103], [180, 106], [172, 107.4], [165, 106.6], [159.5, 104], [156.5, 100.5]]), '#', { t: mt, line: false });
  c.stroke(curve([[158.6, 103.6], [156, 101.4], [156.4, 98.4]]), '$', { line: false });
  // the gauge's dial and needle; a glint on the top cap
  {
    const g = at(39 / sc);
    c.paint('gauge', ell(g[0], g[1], 6.4, 6.4), 'W');
    c.paint('gauge', ell(g[0] + 1.2, g[1] + 1.4, 5.4, 5.4).filter((_, i) => i > 4 && i < 16).concat([[g[0] + 5, g[1] - 2], [g[0] - 2, g[1] + 5]]), '7');
    c.stroke([g, [g[0] + 4, g[1] - 3]], 'R', { on: 'gauge', t: 1, line: false });
    c.dot(g[0], g[1], '1');
  }
  if (fine) { const p = at(140, 5); c.dot(p[0], p[1], 'W'); }
  c.despeckle(null, ['W', '`', '}', '{', '>', '<', '0', 'R', '1', '7']);
  // the silhouette: a dark line on the shadow side, softer on the lit side, coloured per material
  const fur = [...RAMPS.fur, ...RAMPS.white, ...RAMPS.mask, ...RAMPS.furD, ...RAMPS.earIn, ...RAMPS.paw];
  c.silhouette({
    dark: '@', light: [-1, -1],
    pick: (nb, lit) => (RAMPS.yel.includes(nb) ? '|' : RAMPS.scarf.includes(nb) ? 'e' : [...RAMPS.chrome, ...RAMPS.rubber].includes(nb) && !fur.includes(nb) ? '0'
      : V === 'b' ? '@' : lit ? (fur.includes(nb) ? '$' : null) : undefined),
  });
  c.cleanSilhouette();
  // whiskers: two fine light lines each side, past the outline
  if (fine) {
    for (const w of [[[178, 99], [194, 96], [208, 93]], [[180, 102], [195, 104], [209, 107]]]) {
      const m = c._line1Mask(curve(w, 16));
      for (let i = 0; i < m.length; i++) if (m[i] && (c.img.px[i] === null || ['@', '#', '$'].includes(c.img.px[i]))) c.img.px[i] = c.img.px[i] === null ? '+' : 'J';
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
  const g = at(39 / sc);
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
    c.shape('mouth', B([[61, 122, 1], [80, 131], [96, 135], [113, 133], [131, 127, 1], [128, 140], [115, 150], [96, 153], [78, 148], [66, 136]]), 'mouthIn', nl);
    c.paint('mouth', B([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [131, 133], [113, 139], [96, 141], [80, 137], [61, 129]]), 'teeth');
    c.paint('mouth', B([[76, 146], [88, 141], [104, 140], [116, 143], [122, 147], [108, 152], [90, 152]]), 'tongue');
  } else {
    c.shape('mouth', E(95, 140, 7.5, 8.5), 'mouthIn', nl);
    c.paint('mouth', E(95, 145, 5, 3), 'tongue');
  }

  // ============ LIGHT ============
  const strands = [
    [[86, 55], [85, 43], [92, 33], [104, 29], [120, 32]],
    [[93, 53], [95, 44], [104, 37], [120, 36], [138, 39]],
    [[103, 54], [109, 46], [122, 42], [142, 43]],
    [[116, 52], [126, 47], [144, 48], [151, 51]],
  ];
  L.form('suit', { R: 16, cel: 12, hi: 2, front: ['head', 'lapelL', 'lapelR', 'shirt', 'tie', 'knot'] });
  L.form('shirt', { R: 4, cel: 3, front: ['tie', 'knot', 'head'] });
  L.form('lapelL', { R: 3, cel: 2.5, hi: 1.6 });
  L.form('lapelR', { R: 3, cel: 4 });
  L.form(['tie', 'knot'], { R: 3, cel: 2.6, hi: 1.2 });
  L.form('earL', { R: 3, cel: 2.6, hi: 1.4 });
  L.form('earR', { R: 3, cel: 4 });
  const chinY = expr === 'laugh' ? 158 : 154;
  L.form(['head', 'patch', 'mouth'], {
    R: 30, cel: 16, hi: 3, k: 1.4, front: ['nose', 'hair'],
    prims: [TD(102, 72, 40, 26), TD(92, 122, 36, 17), TD(62, 140, 15, 15), TD(138, 132, 13, 15)],
    height: TB([
      { l: [[84, 66], [98, 63.5], [112, 66]], w: 3, a: -1.6 }, { l: [[87, 72], [100, 69.5], [114, 72]], w: 3, a: -1.4 },   // forehead folds
      { l: [[66, 117], [59, 128], [61, 140], [68, 149]], w: 4, a: -2.6 }, { l: [[131, 116], [137, 127], [135, 139], [128, 149]], w: 4, a: -2.6 },   // jowl creases
      { l: [[92, chinY], [110, chinY + 1.8], [128, chinY]], w: 3.4, a: -2 },                                              // the chin fold
    ]),
  });
  L.form('hair', { R: 7, cel: 6, hi: 1.6, height: TB(strands.map((l) => ({ l, w: 3.2, a: 1.6 }))) });
  L.form('nose', { R: 4, cel: 3.4, hi: 1.4, gloss: 0.5, shine: 14 });
  if (V === 'b') {   // the cel creases: hand-placed shadow lines for the folds the volume would have made
    for (const cr of [[[66, 117], [59, 128], [61, 140], [68, 149]], [[131, 116], [137, 127], [135, 139], [128, 149]]]) L.crease(Cv(cr), 'head', 2);
    L.crease(Cv([[92, chinY], [110, chinY + 1.8], [128, chinY]]), 'head');
    for (const [y, x0, x1] of [[66, 84, 112], [72, 87, 114]]) L.crease(Cv([[x0, y], [(x0 + x1) / 2, y - 2.5], [x1, y]]), 'head');
    for (const g of strands) L.crease(Cv(g), 'hair');
    // designed planes: the heavy jowls turn under, the cheek beyond the patch turns away; the brow and the muzzle top catch the light
    L.shade(B([[50, 140], [60, 150], [74, 157], [92, 161], [74, 165], [56, 159], [48, 148]]), 'sh', 'head');
    L.shade(B([[129, 150], [140, 142], [150, 128], [158, 142], [150, 156], [136, 160]]), 'sh', 'head');
    L.shade(B([[137, 92], [150, 86], [160, 102], [165, 122], [160, 138], [149, 126], [147, 106]]), 'sh', 'head');
    L.shade(B([[60, 92], [70, 70], [84, 56], [100, 50], [90, 60], [78, 74], [68, 96]]), 'hi', 'head');
    L.shade(B([[68, 109], [80, 105.5], [100, 105.5], [114, 109], [110, 111.5], [96, 109.5], [78, 111.5]]), 'hi', 'head');
  }
  // cast shadows: the hair on the forehead, the nose on the upper lip, the upper lip on the teeth, the head on the collar
  L.cast('hair', ['head', 'patch', 'earL', 'earR'], 1.4, 3);
  L.cast('nose', ['head'], 1.2, 3.4);
  if (expr !== 'shock') L.cast(['head'], ['mouth'], 0.6, 2.2);
  if (expr === 'shock') L.shade(E(95, 140, 7.5, 8.5).map(([x, y]) => [x, y - 2]), 'deep', 'mouth');
  L.cast(['head', 'patch', 'mouth'], ['suit', 'shirt', 'lapelL', 'lapelR', 'tie', 'knot'], 2, 6);
  L.cast('lapelL', ['suit', 'shirt'], 1.4, 1.6); L.cast('lapelR', ['shirt', 'suit'], 1.4, 1.6);
  L.cast('knot', ['tie', 'shirt'], 0.8, 1.6);
  if (expr === 'grin') {   // the mouth corners sink in; faint gaps between the teeth
    L.shade(E(64, 125, 3, 3), 'deep', 'mouth'); L.shade(E(127, 132, 3, 3), 'deep', 'mouth');
    if (!small) for (const x of [80, 96, 112]) L.crease(Cv([[x, 128], [x, 138 + 4 * (1 - ((x - 96) / 33) ** 2)]]), 'mouth');
  }
  L.rimBounce(['head', 'earL', 'earR', 'hair', 'suit', 'lapelL']);
  L.paint(RAMPS);
  if (fine && V !== 'b') {
    const sk = RAMPS.skin;
    if (V === 'c') for (let i = 0; i + 1 < sk.length; i++) c.furBreak('head', sk[i + 1], sk[i], { dir: (x, y) => norm(x - 95, y - 120), len: 2, gap: 3, seed: 61 + i });
    for (const p of RAMPS.patch) c.furBreak(['head', 'patch'], p, sk, { dir: (x, y) => norm(x - 118, y - 90), len: 1.8, gap: 2.4, seed: 70 });
  }

  // ---- details: brows, eyes, nostrils, the shine (small accents inside the lit form) ----
  const [NX, NY] = [84, 91], [FX, FY] = [117, 92];
  const bs = small ? 1.2 : 0, ny = NY - (small ? 2.5 : 0);
  const brow = (pts) => {
    const p = pts.map(([x, y]) => [x, y - bs]);
    c.stroke(Cv(p), '0', { t: px(4, 2), line: false });
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
    c.paint(n, E(ix, iy, ir * 0.48, ir * 0.55), '0');
    if (lid !== null) c.paint(n, B(lid), ')');
    c.dot(...T([ix - ir * 0.35, iy - ir * 0.3]), 'W', k >= 1.4 ? 1 : 0);
  };
  if (expr === 'shock') {
    brow([[NX - 8, ny - 15], [NX, ny - 20], [NX + 8, ny - 16]]);
    brow([[FX - 8, FY - 17], [FX, FY - 22], [FX + 8, FY - 17]]);
    for (const [ex, ey] of [[NX, ny], [FX, FY]]) {
      c.shape('eye' + ex, E(ex, ey, 5.5, 6.5), small ? 'W' : '8', { line: '0', inner: '0' });
      if (!small) c.paint('eye' + ex, E(ex, ey - 3, 5.5, 3), '6');
      c.paint('eye' + ex, E(ex - 0.5, ey + 0.5, 2.4, 2.8), '0');
      if (!small) c.dot(...T([ex - 1.3, ey - 0.6]), 'W', k >= 1.4 ? 1 : 0);
    }
  } else if (expr === 'laugh') {
    brow([[NX - 8, ny - 12], [NX, ny - 15], [NX + 8, ny - 12]]);
    brow([[FX - 8, FY - 14], [FX, FY - 18], [FX + 8, FY - 14]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX, ny - 4], [NX + 7, ny + 2]]), '0', { t: px(3, 2), line: false });
    c.shape('lid', B([[FX - 8, FY + 1], [FX - 4, FY - 3], [FX + 4, FY - 3], [FX + 8, FY + 1], [FX, FY + 2]]), '0', nl);
  } else {
    // the smug politician: a wink on the near side, the patch eye half open under a heavy lid with a glint
    brow([[NX - 9, ny - 11], [NX - 1, ny - 12], [NX + 8, ny - 8]]);
    brow([[FX - 8, FY - 13], [FX, FY - 17.5], [FX + 8, FY - 13.5]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 3, ny - 1.5], [NX + 3, ny - 1.5], [NX + 7, ny + 1]]), '0', { t: px(2.6, 2), line: false });
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 10, ny + 4]]), '0', { t: px(1.6), line: false });
    openEye(FX, FY, 7.4, 4.6, [FX - 1.6, FY + 1.2, 3.7], [[FX - 9, FY - 6], [FX + 9, FY - 6], [FX + 9, FY + 1.8], [FX + 4, FY + 0.6], [FX, FY + 0.2], [FX - 9, FY + 0.6]]);
    c.stroke(Cv([[FX - 6.5, FY + 0.9], [FX, FY + 0.5], [FX + 4.5, FY + 1.1], [FX + 6.5, FY + 2.1]]), '0', { t: px(2.2, 2), line: false });
  }
  // the nose's shine and nostrils, the philtrum
  c.dot(...T([82.5, 101]), 'W', k >= 1.4 ? 1 : 0);
  c.dot(...T([79, 111]), '0', Math.max(1, Math.round(1.2 * k))); c.dot(...T([99, 110]), '0', Math.max(1, Math.round(1.2 * k)));
  if (!small) c.stroke(Cv([[89, 117], [89, 122]]), RAMPS.skin[0], { t: px(1.2), line: false });
  if (expr === 'shock' && !small) c.paint('mouth', E(94, 146, 3, 1.4), RAMPS.tongue[3]);

  if (fine) c.despeckle(null, ['W', '6', '{', '<', '>', '0', '3']);
  const skinK = RAMPS.skin, hairK = RAMPS.hair;
  c.silhouette({
    dark: '0', light: [-1, -1],
    pick: (nb, lit) => (skinK.includes(nb) ? (V === 'b' ? '=' : lit ? '§' : '=') : hairK.includes(nb) ? (lit && V !== 'b' ? '3' : '1')
      : RAMPS.tie.includes(nb) ? 'r' : RAMPS.suit.includes(nb) ? (V === 'b' ? 'K' : ',') : undefined),
  });
  c.cleanSilhouette();
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
