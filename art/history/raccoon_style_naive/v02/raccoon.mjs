// M4.10 raccoon style study, style "naive": the most naive version that still reads as this raccoon with his pump.
// The recipe (see painter_pass1.md):
//   - ONE dark outline colour (a warm plum-brown, never black) around every mass, also where a mass overlaps another
//     (head over scarf, arm over bib, pump over everything); markings (mask, brows, bib, tail rings) are colour only,
//     never outlined.
//   - TWO tones per material: a flat local colour and one shadow, cut by ONE hand-placed shadow shape per mass (light
//     from the upper left), plus a couple of cast shadows (the head on the scarf, the pump on the chest). No gradients,
//     no dither, no fur strands, no rim light.
//   - Highlights only where they carry the read: a glint in each eye, on the nose, one stripe on the yellow barrel.
//   - Colours are re-used across materials (the eyes are the pump's yellow, the paws and nose are the mask colour), so
//     the whole picture is 13 colours.
//   - Simple shapes: smooth blobs with a few deliberate sharp points (the cheek ruff, the ear tips, the tail tip, three
//     tufts at the bottom), dark mitten paws like a plush toy.
import { Canvas, blob, curve, ell, bar, tube } from '../../../lib/draw2d.mjs';
import '../../../lib/light2d.mjs';
import { registerColors } from '../../../lib/raster.mjs';

registerColors({
  'а': '#36252f',   // outline (warm plum-brown)
  'б': '#a99486',   // coat
  'в': '#776271',   // coat shadow (cooler, violet)
  'г': '#f3e9d8',   // cream (also the glints)
  'д': '#c8b2b0',   // cream shadow (cool)
  'е': '#54404b',   // mask, paws, rings, nose, rubber
  'ж': '#5daf45',   // scarf
  'з': '#2f7a46',   // scarf shadow
  'и': '#c9cbd6',   // chrome (its shadow is the coat shadow)
});
const OL = 'а', COAT = 'б', COATS = 'в', CREAM = 'г', CREAMS = 'д', MASK = 'е', SCARF = 'ж', SCARFS = 'з', CHR = 'и';
// the shadow of each local colour (two tones per material; the mask and the outline have no shadow tone)
const SH = { [COAT]: COATS, [CREAM]: CREAMS, [SCARF]: SCARFS, [CHR]: COATS, y: 'o' };

export const GW = 232, GH = 208;
const RZ = 1.15, ROX = 132 - 134 * RZ, ROY = 78 - 80 * RZ;   // design window x 19..221, y 12..193
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

/** shade every pixel of part(s) `on` inside `shapes` (null = all of it) with its shadow tone */
function shade(c, on, shapes, map = SH) {
  const ids = [].concat(on).map((n) => c.id(n)), m = shapes ? c.mask(shapes) : null;
  for (let i = 0; i < c.part.length; i++) {
    if ((m && !m[i]) || !ids.includes(c.part[i]) || c.line[i]) continue;
    const s = map[c.img.px[i]]; if (s) c.img.px[i] = s;
  }
}
/** a cast shadow: pixels of `onto` that see part(s) `from` (dx, dy) design units toward the light */
function cast(c, from, onto, dx, dy) {
  const F = [].concat(from).map((n) => c.id(n)), O = [].concat(onto).map((n) => c.id(n));
  const ox = Math.round(dx * c.S), oy = Math.round(dy * c.S), hit = [];
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const i = y * c.w + x; if (!O.includes(c.part[i]) || c.line[i]) continue;
    const X = x - ox, Y = y - oy;
    if (X >= 0 && Y >= 0 && X < c.w && Y < c.h && F.includes(c.part[Y * c.w + X])) hit.push(i);
  }
  for (const i of hit) { const s = SH[c.img.px[i]]; if (s) c.img.px[i] = s; }
}

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k * RZ, k * ROX, k * ROY);
  const ln = { line: OL, inner: OL };

  // ---- the pump's one straight axis ----
  const FOOT = [170, 172], TOP = [42, 65], PL = Math.hypot(TOP[0] - FOOT[0], TOP[1] - FOOT[1]);
  const sc = PL / 180, uX = (TOP[0] - FOOT[0]) / PL, uY = (TOP[1] - FOOT[1]) / PL;
  let nX = -uY, nY = uX; if (-nX - nY < 0) { nX = -nX; nY = -nY; }   // n points to the upper left (the light)
  const at = (s, o = 0) => [FOOT[0] + uX * s * sc + nX * o, FOOT[1] + uY * s * sc + nY * o];
  const HN = 50;

  // ---- the tail: a fat tapering sausage curling up at the left, a pointed dark tip, 4 rings ----
  const tailC = [[108, 172], [82, 177], [63, 170], [53, 156], [51, 141], [53, 129], [57, 118]];
  const tailW = (t) => (22 + 6 * Math.sin(Math.PI * Math.min(1, t * 1.2))) * (1 - 0.3 * t * t) * (t > 0.82 ? 1 - 0.75 * ((t - 0.82) / 0.18) ** 1.6 : 1);
  c.shape('tail', tube(tailC, tailW, undefined, 12), COAT, ln);
  const tcc = curve(tailC, 12), tn = tcc.length;
  const tailAt = (f) => { const i = Math.round(f * (tn - 1)), a = tcc[Math.max(0, i - 1)], b = tcc[Math.min(tn - 1, i + 1)], [dx, dy] = norm(b[0] - a[0], b[1] - a[1]); return { p: tcc[i], dx, dy, px: -dy, py: dx }; };
  for (const [f, u] of [[0.27, 3.6], [0.47, 3.4], [0.67, 3.2], [0.93, 6]]) {
    const { p, dx, dy, px, py } = tailAt(f), bow = 2.4, R = 18;
    c.paint('tail', blob([[p[0] - px * R - dx * u, p[1] - py * R - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + px * R - dx * u, p[1] + py * R - dy * u],
      [p[0] + px * R + dx * u, p[1] + py * R + dy * u], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - px * R + dx * u, p[1] - py * R + dy * u]], 6), MASK);
  }

  // ---- the body: one stout pear with three tufts at the bottom, a cream bib ----
  c.shape('body', blob([[104, 108], [90, 118], [84, 134], [83, 152], [86, 166], [94, 177], [106, 182], [116, 184], [121, 188, 1], [125, 184], [138, 184],
    [146, 182], [151, 185, 1], [154, 179], [164, 168], [170, 150], [168, 130], [158, 116], [144, 108]]), COAT, ln);
  c.paint('body', blob([[100, 120], [150, 118], [152, 136], [142, 150], [126, 155], [108, 153], [99, 140]]), CREAM);

  // ---- the far arm, the near arm (from the shoulder down to the paw on the barrel) ----
  c.shape('armR', tube([[160, 120], [176, 137]], 19, 15, 12), COAT, ln);
  // the near arm, hand-drawn: the upper arm down the body's side, a round elbow, the forearm across to the paw
  c.shape('armL', blob([[108, 117], [100, 115], [91, 119], [85, 131], [81, 145], [82, 154], [89, 159], [102, 160], [116, 160], [127, 158], [129, 151], [124, 147], [112, 147], [101, 146], [97, 141], [101, 131], [107, 123]]), COAT, ln);

  // ---- the scarf: the band, the end flung over the far shoulder, the knot ----
  c.shape('scarfEnd', blob([[165, 121], [173, 120], [178, 126], [182, 133], [186, 140, 1], [181, 139], [179, 142, 1], [175, 137], [168, 129], [163, 122]]), SCARF, ln);
  c.shape('scarf', blob([[92, 110], [112, 115], [140, 115], [168, 106], [174, 114], [170, 126], [146, 133], [120, 135], [100, 131], [90, 121]]), SCARF, ln);
  c.shape('scarfKnot', ell(170, 120, 6.4, 5.6, -0.4), SCARF, { line: OL, inner: null });

  // ---- ears: coat with a dark inside ----
  c.shape('earL', blob([[95, 58], [98, 40], [104, 27], [110, 21, 1], [117, 30], [125, 47]]), COAT, ln);
  c.paint('earL', blob([[103, 54], [105, 40], [109, 31], [114, 33], [119, 49]]), MASK);
  c.shape('earR', blob([[148, 46], [155, 32], [162, 23], [168, 20, 1], [173, 32], [176, 52]]), COAT, ln);
  c.paint('earR', blob([[155, 46], [159, 35], [165, 28], [169, 33], [171, 47]]), MASK);

  // ---- the head: one round mass with a pointed cheek ruff; its markings are paint, never outlined ----
  c.shape('head', blob([
    [94, 58], [106, 45], [124, 38], [144, 38], [160, 44], [172, 54], [178, 66], [180, 78], [184, 92], [186, 102],
    [178, 112], [162, 119], [144, 122], [126, 121], [110, 119], [98, 115], [86, 113, 1], [90, 108], [79, 104, 1], [84, 99], [76, 92, 1], [83, 88], [87, 72],
  ]), COAT, ln);
  c.paint('head', blob([[135, 39], [148, 40], [150, 52], [148, 64], [143, 69], [139, 56]]), COATS);   // the forehead stripe
  // the cream: the brow bands, the cheek ruff and the lower face
  c.paint('head', blob([[90, 66], [98, 56], [110, 51], [124, 50], [134, 53], [136, 59], [124, 58], [110, 60], [98, 66]]), CREAM);
  c.paint('head', blob([[152, 60], [158, 54], [168, 52], [176, 54], [180, 59], [176, 61], [166, 59], [156, 62]]), CREAM);
  c.paint('head', blob([[74, 90], [96, 93], [112, 99], [124, 104], [128, 112], [118, 122], [100, 120], [84, 116], [72, 100]]), CREAM);
  c.paint('head', blob([[100, 99], [118, 97], [132, 91], [142, 86], [152, 90], [158, 104], [170, 112], [150, 121], [128, 123], [108, 119]]), CREAM);
  c.paint('head', blob([[170, 98], [180, 96], [190, 104], [186, 114], [174, 110]]), CREAM);
  // the mask: one bold band across both eyes
  c.paint('head', blob([
    [79, 86], [84, 75], [94, 67], [108, 64], [122, 64], [132, 67], [140, 71], [146, 66], [156, 63], [168, 62], [178, 65], [182, 72],
    [178, 82], [168, 86], [158, 87], [150, 85], [144, 81], [138, 85], [132, 91], [120, 95], [106, 96], [92, 98], [82, 95],
  ]), MASK);
  c.shape('snout', blob([[146, 85], [156, 80.5], [170, 80], [182, 83], [191, 88], [194, 95], [190, 101], [180, 106], [168, 108], [157, 106], [150, 101]]), CREAM, { line: OL, inner: null });
  c.paint('snout', blob([[146, 84], [154, 80.5], [164, 80], [156, 84], [149, 90]]), COAT);
  c.shape('nose', blob([[180, 88], [186, 85], [193, 86], [197, 91], [195, 97], [189, 99], [182, 97], [179, 92]]), MASK, ln);

  // ---- the pump: straight, flat yellow and grey with outlines ----
  const hose = [at(3, 18), [190, 166], [202, 167], [208, 156], [205, 145]];
  c.shape('hose', tube(hose, 4.4, 4.4, 12), MASK, ln);
  const hp = curve(hose), e = hp[hp.length - 1], d = hp[hp.length - 4], hl = Math.hypot(e[0] - d[0], e[1] - d[1]) || 1;
  c.shape('chuck', bar(e, [e[0] + ((e[0] - d[0]) / hl) * 8, e[1] + ((e[1] - d[1]) / hl) * 8], 6), CHR, ln);
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  c.shape('foot', box(0, 7, 46), MASK, ln);
  c.shape('barrel', box(11, 140, 13), 'y', ln);
  c.shape('cap7', box(7, 14, 17), CHR, ln);
  c.shape('cap137', box(137, 144, 17), CHR, ln);
  c.shape('rod', box(144, 176, 4.4), CHR, ln);
  c.shape('handle', bar(at(178, -25), at(178, 25), 8, true), MASK, ln);
  c.shape('boss', box(173, 183, 8.6), CHR, ln);
  const g = at(30 / sc);
  c.shape('gauge', ell(g[0], g[1], 8.6, 8.6), CHR, ln);

  // ---- the near paw: a dark mitten gripping the barrel ----
  const AN = (s, o) => at(HN + s, -o);
  c.shape('pawN', blob([AN(-5, 14), AN(-6.4, 6), AN(-7, 0), AN(-6.6, -5), AN(-5, -8.2), AN(-2.4, -7.2), AN(0, -8.8), AN(2.4, -7.2), AN(5, -8.2),
    AN(6.8, -5), AN(7.2, 0), AN(6.6, 6), AN(5, 14)]), COATS, ln);
  for (const sp of [-2.4, 2.4]) c.line1([AN(sp, -7), AN(sp, -3.2)], OL, { on: 'pawN' });   // the finger splits

  // ============ LIGHT: one shadow shape per mass, light from the upper left ============
  shade(c, ['body', 'armR'], [[152, 108], [230, 100], [230, 210], [118, 210], [122, 190], [129, 172], [139, 152], [148, 130]]);
  { // the tail: a cylinder; a pixel is in shadow when it lies on the far side of the centre line from the light
    const tid = c.id('tail');
    for (let i = 0; i < c.part.length; i++) {
      if (c.part[i] !== tid || c.line[i]) continue;
      const x = ((i % c.w) + 0.5 - c.ox) / c.S, y = (((i / c.w) | 0) + 0.5 - c.oy) / c.S;
      let best = 1e9, bx = 0, by = 0, bt = 0;
      for (let j = 0; j + 1 < tn; j++) {   // the nearest point on the centre line (projected onto each segment)
        const [ax, ay] = tcc[j], [cx2, cy2] = tcc[j + 1], dx = cx2 - ax, dy = cy2 - ay, l2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)), qx = ax + dx * t, qy = ay + dy * t, q = (x - qx) ** 2 + (y - qy) ** 2;
        if (q < best) { best = q; bx = qx; by = qy; bt = (j + t) / (tn - 1); }
      }
      const ox = x - bx, oy = y - by, hw = tailW(bt) / 2;
      if ((ox * 0.6 + oy * 0.8) / hw > 0.12) { const s = SH[c.img.px[i]]; if (s) c.img.px[i] = s; }
    }
  }
  // the head: the far cheek behind the far eye, and the jaw under the snout (one plane change on the cream face)
  shade(c, 'head', [[168, 40], [210, 40], [210, 132], [116, 132], [133, 124], [146, 117], [153, 109], [157, 101], [162, 92], [172, 86], [180, 72], [174, 54]]);
  // the snout's underside: its edge IS the mouth line
  const MOUTH = [[189, 100], [181, 104.4], [171, 106], [162, 104.6], [156.5, 101]];
  shade(c, 'snout', [[202, 97], ...MOUTH, [146, 104], [146, 116], [202, 116]]);
  shade(c, 'earR', null);
  shade(c, ['scarf', 'scarfEnd'], [[154, 100], [210, 100], [210, 170], [88, 170], [100, 129], [122, 131], [146, 128]]);
  shade(c, 'scarfKnot', [[168, 100], [190, 100], [190, 130], [160, 130], [167, 119]]);
  // cast shadows: the head on the scarf and chest, the pump and the arm on the bib
  cast(c, ['head', 'snout'], ['scarf', 'scarfEnd', 'body', 'armR'], 1.5, 4);
  cast(c, ['barrel', 'cap7', 'cap137', 'rod', 'boss'], ['scarf'], 2.4, 3);
  cast(c, 'pawN', ['barrel', 'gauge'], 1.2, 1.6);
  cast(c, 'armL', 'body', 2.4, 3.4);
  // the pump: the barrel's and the chrome's far half in shadow, one light stripe on the barrel
  const half = (s0, s1, o0, o1) => [at(s0, o0), at(s1, o0), at(s1, o1), at(s0, o1)];
  shade(c, ['barrel', 'cap7', 'cap137', 'rod', 'boss'], half(-5, 190, -1.2, -14));
  shade(c, ['handle', 'foot', 'gauge', 'chuck'], null, {});
  c.paint('barrel', bar(at(24, 3), at(128, 3), 1.6), CREAM);
  c.line1([g, [g[0] + 4.4, g[1] - 3]], OL, { on: 'gauge' });   // the gauge needle

  // ============ the face, last ============
  const eye = (cx, cy, rx, ry, n) => {
    c.shape(n, ell(cx, cy, rx, ry), 'y', ln);
    const ix = cx + rx * 0.3;
    c.paint(n, ell(ix, cy + ry * 0.15, ry * 0.62, ry * 0.85), OL);                                // the pupil, looking right
    c.paint(n, [[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.42], [cx - rx - 2, cy - ry * 0.22]], MASK);   // the half-closed lid (the smirk)
    c.line1([[cx - rx, cy - ry * 0.22], [cx + rx, cy - ry * 0.42]], OL, { on: n });
    const gs = Math.max(1, Math.round(1.4 * k));
    for (let j = 0; j < gs; j++) for (let i = 0; i < gs; i++) c.img.set(Math.round(c.X(ix - ry * 0.5)) + i, Math.round(c.Y(cy + ry * 0.05)) + j, CREAM);
  };
  eye(122, 78, 8.6, 6.6, 'eyeN');
  eye(161, 75.5, 6.2, 5.2, 'eyeF');
  c.paint('nose', ell(186.5, 88.6, 5.4, 2.6, -0.15), COATS);   // the nose's lit top plane
  { const gs = Math.max(1, Math.round(1.4 * k)), X = Math.round(c.X(184.6)), Y = Math.round(c.Y(88.2)); for (let j = 0; j < gs; j++) for (let i = 0; i < gs; i++) c.img.set(X + i, Y + j, CREAM); }
  // the smirk: one line from under the nose, curling up into the near cheek
  c.line1(curve(MOUTH, 10), OL);
  c.stroke(curve([[157.5, 101.6], [155.6, 99.6], [155, 97.6]], 4), OL, { t: k >= 1.4 ? 2 : 1 });   // the tucked corner, thicker
  c.despeckle(null, []);
  if (k >= 1.4) { // the outer line 2 px on the shadow side (right and bottom)
    const src = c.img.px.slice();
    for (let y = 1; y < c.h; y++) for (let x = 1; x < c.w; x++) { const i = y * c.w + x; if (src[i] === null && (src[i - 1] === OL || src[i - c.w] === OL)) c.img.px[i] = OL; }
  }
  c.cleanSilhouette({ nubs: true, passes: 1 });
  return c.img;
}

export function portraitsPreview() {
  return { frames: [raccoonPortrait2d('smirk', 1.5), raccoonPortrait2d('smirk', 1)], cols: 2 };
}
