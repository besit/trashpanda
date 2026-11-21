// M4.10 style study, ref04 (reference/raccoon-ref_04.jpg), PASS 2: the raccoon as a CHUNKY CARTOON GAME SPRITE.
// Same pose, pump, scarf and tail as M4.9; the technique changes:
//   - DESIGNED cel shapes: every form gets a base tone, one hand-placed shadow shape and one lit edge, written straight
//     into the value map with 'set' (no smooth light field thresholded into bands): lit crescents on the upper-left
//     edges, a shadow shape per mass (the body's far half, the far cheek and jaw, the snout's underside, a continuous
//     band along the tail's underside, the forearm's and the paw's undersides), then cast shadows that cross materials;
//   - 3 tones per material, hard edges, no dither, no fur strands; texture only as a few big tufts in the silhouette;
//   - a strong 2-px warm-black line round the silhouette; INSIDE, a line only where it is needed: the pump (an object)
//     and the face details in the black line; the head over the scarf in the black line; same-value fur over fur (the
//     ears behind the head, the body over the tail, the far arm, the paw over the forearm) in a 1-px dark coat line.
//     The lit forearm over the lit bib and the scarf over the chest have NO line: their cast shadows separate them;
//   - ref 04's proportions pushed: the head 8% bigger, the muzzle 15% shorter and rounder, rounder ears, bigger eyes.
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../../../lib/draw2d.mjs';
import '../../../lib/light2d.mjs';
import { registerColors } from '../../../lib/raster.mjs';

// ref04's own colour block (Cyrillic capitals): a warm near-black line, 3-tone ramps leaning violet in the shadows
registerColors({
  'А': '#22141b',                                   // the line, the nose, the pupils
  'В': '#6a5658', 'Г': '#998278', 'Д': '#c4ae9a',  // coat: shadow, base, light
  'Ж': '#bba590', 'З': '#e3d4ba', 'И': '#f7eedb',  // cream: shadow, base, light
  'Й': '#352530', 'К': '#4f3c46',                  // mask: base, light (Й is also the soft inner line)
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

// value -> key by thresholds: the designed values are 0.3 (shadow), 0.6 (base), 0.85 (light)
const tones = (...a) => Array.from({ length: 81 }, (_, i) => { const t = i / 80; for (let j = 1; j < a.length; j += 2) if (t < a[j]) return a[j - 1]; return a[a.length - 1]; });
const RAMPS = {
  fur: tones('В', 0.47, 'Г', 0.72, 'Д'),
  furD: tones('Й', 0.47, 'В', 0.72, 'Г'),
  white: tones('Ж', 0.47, 'З', 0.72, 'И'),
  brow: tones('Ж', 0.47, 'И'),
  mask: tones('Й', 0.72, 'К'),
  yel: tones('o', 0.45, 'y', 0.8, 'Y'),
  chrome: tones('П', 0.42, 'Р', 0.76, 'С'),
  rubber: tones('Т', 0.5, 'У', 0.84, 'Ф'),
  scarf: tones('М', 0.47, 'Н', 0.72, 'О'),
  black: tones('А', 0.8, 'Т'),
};

// ============================== THE RACCOON ==============================
const RZ = 1.15, ROX = 132 - 134 * RZ, ROY = 78 - 80 * RZ;   // visible window in design units: x 19..221, y 12..193
// ref 04's proportions: the head scales 8% about the neck; the muzzle is 15% shorter (x beyond 146 pulls in)
const HC = [134, 118], HSC = 1.08;
const H = ([x, y, s]) => (s ? [HC[0] + (x - HC[0]) * HSC, HC[1] + (y - HC[1]) * HSC, 1] : [HC[0] + (x - HC[0]) * HSC, HC[1] + (y - HC[1]) * HSC]);
const MZ = ([x, y, s]) => H([x > 146 ? 146 + (x - 146) * 0.85 : x, y, s]);
const Hs = (pts) => pts.map(H), Ms = (pts) => pts.map(MZ);
const about = (pts, cx, cy, s) => pts.map(([x, y, f]) => (f ? [cx + (x - cx) * s, cy + (y - cy) * s, 1] : [cx + (x - cx) * s, cy + (y - cy) * s]));
const HEADC = H([180, 92]);
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), Hh = Math.round(GH * k), c = new Canvas(W, Hh, k * RZ, k * ROX, k * ROY);
  const nl = { line: null };

  // ---- the pump's axis first (it decides where the paws go) ----
  const FOOT = [170, 172], TOP = [42, 65], PL = Math.hypot(TOP[0] - FOOT[0], TOP[1] - FOOT[1]);
  const sc = PL / 180, uX = (TOP[0] - FOOT[0]) / PL, uY = (TOP[1] - FOOT[1]) / PL;
  let nX = -uY, nY = uX; if (-nX - nY < 0) { nX = -nX; nY = -nY; }
  const at = (s, o = 0) => [FOOT[0] + uX * s * sc + nX * o, FOOT[1] + uY * s * sc + nY * o];
  const HN = 50, wristN = at(HN, -14);

  // ---- the tail ----
  const tailC = [[106, 172], [82, 176], [63, 169], [53, 155], [51, 141], [53, 130], [56, 120]];
  const tailW = (t) => (20 + 7 * Math.sin(Math.PI * Math.min(1, t * 1.2))) * (1 - 0.37 * t * t) * (t > 0.8 ? 1 - 0.58 * ((t - 0.8) / 0.2) ** 2 : 1);
  c.shape('tail', tube(tailC, tailW, undefined, 12), 'fur', nl);
  const tcc = curve(tailC, 12), tn = tcc.length;
  const tailAt = (f) => { const i = Math.round(f * (tn - 1)), a = tcc[Math.max(0, i - 1)], b = tcc[Math.min(tn - 1, i + 1)], [dx, dy] = norm(b[0] - a[0], b[1] - a[1]); return { p: tcc[i], dx, dy, px: -dy, py: dx }; };
  const hook = (p, n, t, len, w) => blob([[p[0] - t[0] * w / 2 - n[0], p[1] - t[1] * w / 2 - n[1]], [p[0] + n[0] * len * 0.55 + t[0] * len * 0.1, p[1] + n[1] * len * 0.55 + t[1] * len * 0.1],
    [p[0] + n[0] * len + t[0] * len * 0.75, p[1] + n[1] * len + t[1] * len * 0.75, 1], [p[0] + n[0] * len * 0.35 + t[0] * w * 0.7, p[1] + n[1] * len * 0.35 + t[1] * w * 0.7], [p[0] + t[0] * w / 2 - n[0], p[1] + t[1] * w / 2 - n[1]]]);
  for (const [fr, len, w] of [[0.07, 6, 7.6], [0.3, 4.6, 5.6], [0.5, 3.6, 4.6], [0.69, 4.2, 5]]) {
    const { p, dx, dy, px: a, py: b } = tailAt(fr), sgn = (p[0] - 82) * a + (p[1] - 148) * b > 0 ? 1 : -1, hw = tailW(fr) / 2;
    c.shape('tail', hook([p[0] + a * sgn * hw, p[1] + b * sgn * hw], [a * sgn, b * sgn], [dx, dy], len, w), 'fur', nl);
  }
  for (const [f, u] of [[0.2, 3.2], [0.38, 3.2], [0.56, 3], [0.74, 2.8], [0.93, 4.5]]) {
    const { p, dx, dy, px: px2, py: py2 } = tailAt(f), bow = 2.2;
    c.paint('tail', blob([[p[0] - px2 * 16 - dx * u, p[1] - py2 * 16 - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + px2 * 16 - dx * u, p[1] + py2 * 16 - dy * u],
      [p[0] + px2 * 16 + dx * u, p[1] + py2 * 16 + dy * u], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - px2 * 16 + dx * u, p[1] - py2 * 16 + dy * u]], 6), 'mask');
  }

  // ---- the torso, the bib, the arms ----
  c.shape('body', blob([[104, 108], [90, 118], [84, 134], [83, 152], [86, 166], [94, 176], [110, 181], [128, 183], [146, 180], [160, 174], [166, 164], [170, 150], [168, 130], [158, 116], [144, 108]]), 'fur', nl);
  for (const [x, y, nx, ny, tx, ty, len, w] of [[94, 176, -0.4, 1, -1, 0.2, 5, 6.6], [114, 181, 0, 1, -1, 0.1, 3.6, 5], [136, 182, 0.1, 1, 1, 0.1, 5.4, 6.6], [156, 176, 0.5, 1, 1, -0.1, 3.8, 5]]) {
    const [ax, ay] = norm(nx, ny), [bx, by] = norm(tx, ty);
    c.shape('body', hook([x, y], [ax, ay], [bx, by], len, w), 'fur', nl);
  }
  c.paint('body', tufted(blob([[98, 120], [150, 118], [152, 136], [142, 149], [126, 153], [108, 152], [98, 140]]), { amp: 3, period: 7, where: () => 0, flow: [0, 1], lean: 0.6, seed: 52 }), 'white');
  c.shape('armR', tube([[160, 120], [176, 136]], (t) => 19 - 4 * t, undefined, 12), 'fur', nl);
  c.shape('armL', tube([[98, 122], [82, 152], wristN], (t) => 20 - 9 * t, undefined, 12), 'fur', nl);

  // ---- the scarf: the band, the knot, the end flung back with a 3-notch fringe ----
  c.shape('scarfEnd', blob([[165, 121], [173, 120], [177, 125], [180, 130], [185, 137, 1], [179, 139.5], [174, 136], [168, 128], [163, 122]]), 'scarf', nl);
  for (const [x, y, l] of [[175.4, 137], [179, 138.6], [182.6, 138.6]].map(([x, y], i) => [x, y, [3.4, 3.8, 3][i]])) c.shape('scarfEnd', bar([x, y], [x + l * 0.4, y + l], 2.2), 'scarf', nl);
  c.shape('scarf', blob([[92, 110], [112, 115], [140, 115], [168, 106], [174, 114], [170, 126], [146, 133], [120, 135], [100, 131], [90, 121]]), 'scarf', nl);
  c.shape('scarfKnot', ell(170, 120, 6.4, 5.6, -0.4), 'scarf', nl);

  // ---- ears (behind the head), rounder and a little bigger: fur outside, a dark hollow, a pink fold ----
  const rot = (pts, cx, cy, a) => pts.map(([x, y, f]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a), f]);
  const EL = (pts) => Hs(about(rot(pts, 110, 50, -0.14), 110, 52, 1.06)), ER = (pts) => Hs(about(pts, 162, 50, 1.06));
  c.shape('earL', tufted(blob(EL([[95, 56], [97, 40], [102, 29], [109, 25], [116, 29], [121, 38], [125, 48]])), { amp: 2.4, period: 6, where: (x) => (x < 104 ? 1 : 0), flow: [-1, 0], seed: 8 }), 'fur', nl);
  c.paint('earL', blob(EL([[103, 52], [104, 40], [108, 33], [113, 33], [118, 41], [120, 48]])), 'Й');
  c.paint('earL', blob(EL([[106, 50], [107, 41], [110, 36.5], [112, 37], [110, 43], [109.5, 50]])), 'Л');
  c.shape('earR', blob(ER([[148, 46], [153, 33], [159, 26], [165, 24], [170, 27], [173.5, 34], [175, 42], [176, 52]])), 'fur', nl);
  c.paint('earR', blob(ER([[155, 45], [158, 35], [163, 30], [168, 31], [171, 38], [171.5, 46]])), 'Й');
  c.paint('earR', blob(ER([[158.4, 44], [160.6, 36], [163.6, 32.6], [165, 33.6], [162.6, 38], [161.6, 44]])), 'Л');

  // ---- the head: one round mass, bigger; its markings are local colour only ----
  c.shape('head', tufted(blob(Hs([
    [94, 58], [106, 45], [124, 38], [144, 38], [160, 44], [172, 54], [178, 66], [180, 78], [184, 92], [186, 102],
    [178, 112], [162, 119], [144, 122], [126, 121], [108, 118], [92, 112], [82, 102], [81, 88], [86, 72],
  ])), {
    amp: 6.5, period: 9.5,
    where: (x, y) => (x < 96 && y > 78 && y < 99 ? 1.2 : y < 40 ? 0.3 : 0),
    flow: (x, y) => (y > 100 ? norm(x < 140 ? -0.6 : 0.6, 1) : headFlow(x, y)), lean: 0.6, seed: 12,
  }), 'fur', nl);
  c.paint('head', blob(Hs([[135, 39], [148, 40], [151, 52], [149, 65], [143, 70], [138, 56]])), 'furD');
  c.paint('head', blob(Hs([[76, 90], [96, 93], [112, 99], [124, 104], [128, 112], [118, 122], [100, 120], [84, 112], [74, 98]])), 'white');
  c.paint('head', blob(Ms([[170, 98], [180, 96], [192, 104], [186, 114], [174, 110]])), 'white');
  c.paint('head', blob(Hs([[92, 64.6], [98, 56], [110, 50.6], [124, 49.6], [134, 52.8], [136, 58.6], [124, 57.4], [110, 59.4], [98, 65.6]])), 'brow');
  c.paint('head', blob(Hs([[152, 59.4], [158, 53.6], [168, 51.6], [176, 53.6], [180, 58.4], [176, 61], [166, 58.4], [156, 62]])), 'brow');
  c.paint('head', blob(Hs([
    [80, 84], [84, 74], [94, 66], [108, 63], [122, 63], [132, 66], [140, 70], [146, 66], [156, 62], [168, 61], [178, 64], [182, 72],
    [178, 82], [168, 86], [158, 87], [150, 85], [144, 80], [138, 84], [132, 91], [120, 95], [106, 96], [92, 98], [82, 96],
  ])), 'mask');
  c.paint('head', blob(Hs([[100, 99], [118, 97], [132, 91], [142, 86], [152, 90], [158, 104], [168, 112], [150, 122], [128, 124], [108, 120]])), 'white');
  // the muzzle: shorter, rounder at the tip, a big round nose
  c.shape('snout', blob(Ms([[146, 84], [156, 79], [170, 78.6], [182, 81.4], [190, 87], [193.4, 95], [189.6, 102], [178, 106.4], [162, 106.4], [150, 101]])), 'white', nl);
  c.paint('snout', blob(Ms([[146, 84], [154, 80.5], [164, 79.6], [156, 84], [149, 90]])), 'fur');
  c.shape('nose', blob(Ms([[178.6, 87.6], [185.6, 83.6], [194, 84.4], [199, 89.6], [197.4, 97], [190, 100], [182, 98.4], [178, 93]])), 'black', nl);

  // ---- the pump across the chest, then the near paw gripping it ----
  pumpParts(c, at, sc);
  const AN = (s, o) => at(HN + s, -o);
  c.shape('pawN', blob([AN(-2.8, 13), AN(-5.8, 6), AN(-7.2, -1), AN(-7, -5.6), AN(-6.4, -8.6), AN(-5.4, -10), AN(-3.8, -10.2), AN(-2.4, -8.1), AN(-1.2, -9.9), AN(0, -10.5),
    AN(1.2, -9.9), AN(2.4, -8.1), AN(3.8, -10.2), AN(5.4, -10), AN(6.6, -8.6), AN(7.6, -5.6), AN(9.6, -6.6), AN(11.4, -7.6), AN(12.4, -5), AN(11.6, -0.8), AN(9.6, 3.2), AN(6.6, 4.6), AN(3, 13)]), 'fur', nl);

  // ============ LIGHT, DESIGNED: base 0.6 everywhere, lit crescents 0.86, hand-placed shadow shapes 0.3 ============
  const v = c.values(0.6), S = 0.3, LIT = 0.86;
  const set = (shapes, val, on) => c.valueShape(v, shapes, val, { mode: 'set', on });
  const FIG = ['tail', 'body', 'armR', 'armL', 'scarfEnd', 'scarf', 'scarfKnot', 'earL', 'earR', 'head', 'snout', 'nose', 'hose', 'chuck', 'foot', 'barrel', 'cap7', 'cap137', 'rod', 'handle', 'boss', 'gauge', 'pawN'];
  // a lit edge only where the form meets the AIR (the silhouette), not where it meets another form
  const litEdge = (on, w, dir = [-1, -1]) => c.crescentValue(v, FIG, w, LIT, { dir, mode: 'set', only: on });
  const shEdge = (on, w, dir = [1, 1]) => c.crescentValue(v, on, w, S, { dir, mode: 'set' });
  const pumpAll = ['barrel', 'cap7', 'cap137', 'rod', 'boss', 'gauge', 'foot', 'handle'];
  // lit edges facing the upper left
  litEdge('head', 3); litEdge('earL', 2.2); litEdge('earR', 1.4); litEdge('body', 2.6); litEdge('armL', 1.8);
  litEdge('pawN', 1.4); c.crescentValue(v, ['scarf', 'scarfEnd'], 1.6, LIT, { dir: [-0.6, -1], mode: 'set' }); litEdge('scarfKnot', 1.2);   // the scarf's lime top roll (the head's cast shadow takes it back under the jaw) litEdge('tail', 3);
  // the head: ONE shadow shape on the far cheek and jaw (a curved terminator behind the far eye, down under the jaw)
  set(blob(Hs([[146, 30], [210, 30], [210, 134], [96, 134], [98, 114.4], [118, 113.6], [138, 111], [154, 107], [168, 103], [150, 90], [151, 76], [156, 60], [153, 45]])), S, 'head');
  // the muzzle: a lit top plane, one shadow under it (2 tones on the cream, nothing between)
  set(blob(Ms([[149, 84.4], [160, 80.6], [174, 80.4], [184, 84], [180, 87.4], [166, 88], [154, 90]])), LIT, 'snout');
  set(blob(Ms([[150, 99], [166, 101.4], [182, 101], [196, 96], [196, 112], [150, 112]])), S, 'snout');
  // the far ear: its lower half in the head's shadow side
  set(blob(ER([[160, 38], [190, 30], [190, 60], [150, 60]])), S, 'earR');
  // the body: the far half in one shadow (terminator from under the scarf knot down to the bottom centre), the far arm
  set([[152, 108], [230, 100], [230, 210], [116, 210], [120, 190], [127, 172], [138, 152], [147, 130]], S, 'body');
  set([[150, 100], [230, 100], [230, 200], [150, 200]], S, 'armR');
  set(blob([[160, 118], [167, 116], [172, 121], [166, 124]]), LIT, 'armR');   // the far shoulder catches a sliver of light
  // the tail: one continuous shadow band along its underside (the outer side of the curl), every ring split the same way
  {
    const edge = [], far = [];
    for (let f = 0; f <= 1.001; f += 0.04) {
      const t = Math.min(1, f), { p, px: a, py: b } = tailAt(t), s = a + b > 0 ? 1 : -1, hw = tailW(t) / 2;
      edge.push([p[0] + a * s * hw * 0.25, p[1] + b * s * hw * 0.25]); far.push([p[0] + a * s * 40, p[1] + b * s * 40]);
    }
    set([...edge, ...far.reverse()], S, 'tail');
  }
  // the forearm and the paw: a shadow under each (the side away from the light)
  { // the forearm's underside: a shadow band only where the arm lies over AIR or the cream BIB (not at the shoulder,
    // where the arm grows out of the body and no edge should show)
    const id = c.id('armL'), body = c.id('body'), px = c.img.px, D = 3.4 * c.S, [ux, uy] = norm(0.35, 1), hit = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (c.part[i] !== id) continue;
      for (let st = 1; st <= 4; st++) {
        const X = Math.round(x + ux * D * st / 4), Y = Math.round(y + uy * D * st / 4); if (X < 0 || Y < 0 || X >= W || Y >= Hh) break;
        const j = Y * W + X; if (c.part[j] === id) continue;
        if (px[j] === null || (c.part[j] === body && px[j] === 'white')) hit.push(i);
        break;
      }
    }
    for (const i of hit) v[i] = S;
  }
  shEdge('pawN', 3, [1, 1]);
  // the scarf: a lime top roll, a shadow on the lower edge and the far side, the knot's shadow side and two folds
  shEdge(['scarf', 'scarfEnd'], 2.2, [0.15, 1]);
  set([[160, 98], [210, 98], [210, 170], [150, 170]], S, ['scarf', 'scarfEnd']);
  set([[167, 100], [190, 100], [190, 132], [160, 132], [168, 119]], S, 'scarfKnot');
  c.valueLine(v, [[169, 121], [174.6, 129], [178.6, 136]], S, { mode: 'set', on: 'scarfEnd' });
  for (const pts of [[[165.4, 117], [170, 121.6], [172, 126]], [[169.6, 115], [174.4, 119]]]) c.valueLine(v, pts, S, { mode: 'set', on: 'scarfKnot' });
  // the pump: straight tubes (their light is a straight band along the axis), the hose, the gauge
  const tubeL = (on, a, b, r, o = {}) => c.tubeField(v, on, a, b, r, { gloss: o.gloss ?? 0.35, shine: 12 });
  tubeL('barrel', at(11), at(140), 6.5);
  tubeL('cap7', at(7), at(14), 8.5); tubeL('cap137', at(137), at(144), 8.5);
  tubeL('rod', at(144), at(176), 2.2); tubeL('boss', at(173), at(183), 4.3);
  tubeL('handle', at(178, -25), at(178, 25), 4, { gloss: 0.2 });
  tubeL('foot', at(3.5, -23), at(3.5, 23), 3.5, { gloss: 0.2 });
  c.lightField(v, ['hose', 'chuck'], { R: 2.2, smooth: 0 });
  c.lightField(v, 'gauge', { R: 3 });
  c.lightField(v, 'nose', { R: 3, gloss: 0.5, shine: 14 });
  // cast shadows (they cross materials and separate the forms where there is no line)
  const cast = (from, onto, dx, dy) => c.castValue(v, from, onto, dx, dy, { mul: 0.5 });
  cast(['head', 'snout'], ['scarf', 'scarfEnd', 'scarfKnot', 'body', 'armL', 'armR'], 1.6, 4.4);
  cast('snout', 'head', 0.6, 3.2);
  cast('earL', 'head', 1.5, 2.5);
  cast(['scarf', 'scarfKnot'], ['body', 'armL', 'armR'], 1.2, 3);
  cast('armL', 'body', 2.4, 3.8);
  cast(pumpAll, ['body', 'scarf', 'scarfEnd', 'armL', 'armR', 'tail'], 2.6, 3.2);
  cast('pawN', ['barrel', 'gauge', 'body', 'armL'], 1.4, 2);
  cast('body', 'tail', 2, 2);
  for (const s of [-2.3, 2.3]) c.valueLine(v, [AN(s, -3.6), AN(s, -7.8)], S, { mode: 'set', on: 'pawN' });   // two splits between the knuckles
  c.paintLight(v, RAMPS, { strip: 0 });

  // ============ the cartoon details: the face, the gauge, the shine (flat keys, painted after the light) ============
  const g2 = k >= 1.4 ? 2 : 1;
  const block = (x, y, n, col) => { const X = Math.round(c.X(x)), Y = Math.round(c.Y(y)); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) c.img.set(X + i, Y + j, col); };
  // the eyes: a big white sclera, a big amber iris with a big pupil, a heavy sly lid across the top
  const eye = (cx, cy, rx, ry, n, look) => {
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.6, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.6], [cx + rx * 0.6, cy + ry * 0.78], [cx - rx * 0.5, cy + ry * 0.82]]), 'Ц', nl);
    const ix = cx + look, iy = cy + ry * 0.16, ir = ry * 0.84;
    c.paint(n, ell(ix, iy, ir * 0.92, ir), 'Ш');
    c.paint(n, ell(ix, iy - ir * 0.55, ir * 1.1, ir * 0.62), 'Щ');
    c.paint(n, ell(ix + ir * 0.06, iy + ir * 0.05, ir * 0.5, ir * 0.58), 'А');
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.25], [cx, cy - ry * 0.38], [cx - rx - 2, cy - ry * 0.05]]), 'А');
    c.paint(n, blob([[cx - rx, cy - ry * 0.05], [cx, cy - ry * 0.38], [cx + rx, cy - ry * 0.25], [cx + rx, cy + ry * 0.1], [cx, cy - ry * 0.05], [cx - rx, cy + ry * 0.3]]), 'Ч', { only: ['Ц'] });
    block(ix - ir * 0.5, iy - ir * 0.3, Math.max(2, Math.round(2 * k)), 'Ц');
  };
  { const [x, y] = H([122, 77]); eye(x, y, 12.4, 10, 'eyeN', 3.2); }
  { const [x, y] = H([162, 75]); eye(x, y, 8.4, 7.6, 'eyeF', 2.6); }
  // the nose: one big flat glint on its lit top
  { const [x, y] = MZ([183, 87.4]); block(x, y, Math.max(2, Math.round(2 * k)), 'С'); }
  // the toothy one-sided grin: an open mouth under the nose, the corner tucked up into the cheek, a row of teeth
  {
    const U = [[188, 100.4], [179, 104.6], [168, 105.2], [159, 102.4], [153.4, 97.6]];
    const D = [[153.4, 97.6], [158.4, 105.4], [166, 110.4], [176, 110.8], [184, 106.6], [188, 100.4]];
    c.shape('mouth', Ms([...curve(U, 8), ...curve(D, 8)]), 'Ъ', nl);
    c.paint('mouth', Ms([...curve([[189, 99], [179, 103.4], [168, 104], [159, 101.2], [152, 96.2]], 8), ...curve([[152, 96.2], [159, 104], [168, 107], [179, 106.4], [189, 102.4]], 8)]), 'Ц');
    c.paint('mouth', Ms(ell(172, 111, 6.4, 2.8)), 'Ы');
    for (const tx of [163, 171.4]) c.stroke(Ms([[tx, 103.4], [tx, 106.2]]), 'Ч', { on: 'mouth', line: false });
    c.stroke(Ms([[153.4, 97.6], [151, 94.8]]), 'А', { t: g2, line: false });   // the dimple at the corner
  }
  { // the gauge: a white face, a grey lower crescent, the red needle
    const g = at(30 / sc);
    c.paint('gauge', ell(g[0], g[1], 6.2, 6.2), 'С');
    c.paint('gauge', ell(g[0] + 1.6, g[1] + 1.8, 5.4, 5.4), 'Р', { only: ['С'] });
    c.paint('gauge', ell(g[0] - 0.4, g[1] - 0.4, 5.2, 5.2), 'С');
    c.stroke([g, [g[0] + 4, g[1] - 3]], 'Э', { on: 'gauge', t: g2, line: false });
    c.dot(g[0], g[1], 'А');
  }
  { // one bold cartoon shine down the barrel's lit side
    const a = at(70), b = at(128), sm = c.mask(bar([a[0] - nX * 3, a[1] - nY * 3], [b[0] - nX * 3, b[1] - nY * 3], 1.6, true)), bid = c.id('barrel');
    for (let i = 0; i < sm.length; i++) if (sm[i] && c.part[i] === bid) c.img.px[i] = 'Ц';
  }

  // ============ the lines inside: only where they are needed (see the header) ============
  const name = new Map([...c.ids].map(([n, id]) => [id, n]));
  const pumpSet = new Set([...pumpAll, 'hose', 'chuck']), face = new Set(['eyeN', 'eyeF', 'mouth', 'nose']);
  const headSet = new Set(['head', 'snout']), scarfSet = new Set(['scarf', 'scarfEnd', 'scarfKnot']);
  const lineFor = (back, front) => {
    if (pumpSet.has(front) || front === 'pawN' && pumpSet.has(back)) return 'А';   // the pump is an object: always lined
    if (face.has(front)) return 'А';
    if (headSet.has(front) && scarfSet.has(back)) return 'А';
    if (headSet.has(front) && back.startsWith('ear')) return 'Й';
    if (back === 'tail') return 'Й';
    if (back === 'body' && (front === 'armR' || front === 'pawN')) return 'Й';
    if (back === 'armL' && front === 'pawN') return 'Й';
    return null;
  };
  {
    const P = c.part, px = c.img.px, hitA = [], hitS = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, a = P[i]; if (a < 0 || px[i] === null) continue;
      let col = null;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= Hh) continue;
        const b = P[Y * W + X]; if (b <= a || px[Y * W + X] === null) continue;
        const l = lineFor(name.get(a), name.get(b)); if (l === 'А') { col = 'А'; break; } if (l) col = l;
      }
      if (col === 'А') hitA.push(i); else if (col) hitS.push(i);
    }
    for (const i of hitS) px[i] = 'Й';
    for (const i of hitA) px[i] = 'А';
    if (k >= 1.4) { // the black lines are 2 px at k 1.5: thicken into the back form by one pixel
      const L1 = new Set(hitA), more = [];
      for (const i of hitA) {
        const x = i % W, y = (i / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= Hh) continue;
          const j = Y * W + X; if (!L1.has(j) && P[j] === P[i] && px[j] !== null && px[j] !== 'А') more.push(j);
        }
      }
      for (const j of more) px[j] = 'А';
    }
  }
  c.despeckle(null, ['Ц', 'С', 'Э', 'А']);
  for (let p = 0; p < 2; p++) { c.silhouette({ dark: 'А' }); if (p === 0) c.cleanSilhouette(); }
  c.cleanSilhouette({ nubs: false, passes: 1 });
  c.deorphan(['Ц', 'С', 'Э', 'А']);
  for (let i = 0; i < c.img.px.length; i++) if (c.img.px[i] === undefined) c.img.px[i] = null;   // a stray undefined reads as empty
  for (let pass = 0; pass < 12; pass++) { const px = c.img.px; for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (px[i] === null && (px[i - 1] !== null) + (px[i + 1] !== null) + (px[i - W] !== null) + (px[i + W] !== null) >= 3) px[i] = 'А'; } }   // 1-px holes close with the line
  return c.img;
}

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
