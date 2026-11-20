// M4.8 round 01 variant B: "the swagger". A warm taupe raccoon (ref 04's coat) shoulders a straight teal bike-share
// pump like a bat, both paws round the barrel low down, a chunky green knit scarf (ref 03). Same drawn-fur toolkit as A.
// Dog Fjord: iteration 04's head; charcoal pinstripe suit, a gold tie with little cars on it, a flag pin; deeper,
// cooler shadows on the skin.
import { Canvas, blob, curve, ell, bar, tube, tufted, hash } from '../../../lib/draw2d.mjs';

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== THE RACCOON ==============================

/**
 * a floor pump on ONE straight axis at any angle: `foot` is the centre of the foot plate, `ang` the axis direction
 * (radians, toward the handle), `L` its length foot -> handle. Every part (foot plate, caps, barrel, rod, the T-handle
 * square to the axis, the gauge) is placed in axis coordinates (s along it, o across it), so the pump cannot bend.
 * `ramp` the barrel's colours [deep, dark, base, lit, shine]; only the hose curves.
 */
function pumpAxis(c, foot, ang, L, { ramp = [':', 'f', 'F', ';', 'W'], fine = true, gaugeS = 0.2, hose = null, ribs = null } = {}) {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  let nx = -uy, ny = ux;
  if (nx * -1 + ny * -1 < 0) { nx = -nx; ny = -ny; }   // n points to the lit side (upper left)
  const sc = L / 180;
  const at = (s, o = 0) => [foot[0] + ux * s * sc + nx * o, foot[1] + uy * s * sc + ny * o];
  const strip = (s0, s1, o, w) => bar(at(s0, o), at(s1, o), w);
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  if (hose) {
    const hp = curve(hose);
    c.stroke(hp, '1', { t: Math.max(2, Math.round(4.6 * c.S)), line: false });
    c.stroke(hp.map(([x, y]) => [x - 0.9, y - 0.5]), '3', { t: 1, line: false });
    const e = hp[hp.length - 1], d = hp[hp.length - 4], [cx, cy] = [e[0] - d[0], e[1] - d[1]], l = Math.hypot(cx, cy) || 1;
    c.shape('chuck', bar(e, [e[0] + (cx / l) * 9, e[1] + (cy / l) * 9], 5.6), '5', { line: null });
    c.paint('chuck', bar([e[0] - 1.6, e[1] - 1], [e[0] + (cx / l) * 9 - 1.6, e[1] + (cy / l) * 9 - 1], 1.6), '7');
  }
  // the foot plate, square to the axis
  c.shape('foot', box(0, 8, 46), '2', { line: null });
  c.paint('foot', strip(5.4, 8, 0, 48), '4');
  c.paint('foot', strip(0, 2.2, 0, 48), '1');
  // the barrel
  const [deep, dark, base, lit, shine] = ramp;
  c.shape('barrel', box(12, 140, 13), base, { line: null });
  c.paint('barrel', strip(12, 140, 4.4, 2.6), lit);
  c.paint('barrel', strip(12, 140, 3.0, 1), shine);
  c.paint('barrel', strip(12, 140, -3.2, 3), dark);
  c.paint('barrel', strip(12, 140, -5.4, 1.6), deep);
  c.paint('barrel', strip(12, 140, -6.3, 0.7), lit);
  if (fine && ribs) for (let s = ribs[0]; s < ribs[1]; s += 4) c.paint('barrel', box(s, s + 1.1, 13.5), dark);
  // the caps (chrome), square to the axis
  for (const [s0, s1] of [[8, 15], [137, 144]]) {
    const n = 'cap' + s0;
    c.shape(n, box(s0, s1, 18), '6', { line: null });
    c.paint(n, strip(s0, s1, -6.5, 5), '4');
    c.paint(n, strip(s0, s1, 5.5, 2), '8');
  }
  // the rod and the T-handle (perpendicular to the axis) with ribbed grips and a chrome boss
  c.shape('rod', box(144, 176, 4), '6', { line: null });
  c.paint('rod', strip(144, 176, 1, 1), '8');
  c.paint('rod', strip(144, 176, -1.4, 1.2), '3');
  const hc = at(178);
  const hA = (o, d = 0) => [hc[0] + nx * o + ux * d, hc[1] + ny * o + uy * d];
  c.shape('handle', bar(hA(-25), hA(25), 7, true), '3', { line: null });
  for (const s of [-1, 1]) {
    const g = 'grip' + s;
    c.shape(g, bar(hA(s * 8), hA(s * 25), 8.4, true), '2', { line: null });
    c.paint(g, bar(hA(s * 8, 2.6), hA(s * 26, 2.6), 1.8), '4');
    c.paint(g, bar(hA(s * 8, -2.8), hA(s * 26, -2.8), 2), '1');
    if (fine) for (let o = 11; o < 24; o += 3) c.paint(g, bar(hA(s * o, -3.4), hA(s * o, 3.4), 0.9), '1');
  }
  c.shape('boss', bar(at(173), at(183), 8), '6', { line: null });
  c.paint('boss', strip(173, 183, 2.2, 1.4), '8');
  c.paint('boss', strip(173, 183, -2.6, 1.6), '3');
  // the gauge, centred on the axis
  const g = at(gaugeS * 180 / 1);
  c.shape('gauge', ell(g[0], g[1], 8.6, 8.6), '4', { line: null });
  c.paint('gauge', ell(g[0] - 0.6, g[1] - 0.6, 7.6, 7.6), '7');
  c.paint('gauge', ell(g[0], g[1], 6.6, 6.6), 'W');
  c.paint('gauge', ell(g[0] + 1.2, g[1] + 1.4, 6, 6), '8');
  c.paint('gauge', ell(g[0], g[1], 6.6, 6.6).filter((_, i) => i > 4 && i < 22).concat([g]), 'W');
  if (fine) for (let a = -3.6; a <= 0.6; a += 0.7) c.dot(g[0] + Math.cos(a) * 5, g[1] + Math.sin(a) * 5, '3');
  c.stroke([g, [g[0] + 3.8, g[1] - 3]], 'R', { on: 'gauge', t: 1, line: false });
  c.dot(g[0], g[1], '1');
  return { at, nx, ny, ux, uy };
}

const HEADC = [186, 92];   // fur flows away from the nose
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const fine = k >= 0.9;
  const nl = { line: null };

  // ---- the ringed tail behind the body, curling up at the lower right ----
  const tailC = [[150, 186], [176, 196], [200, 192], [214, 178], [220, 160], [218, 144]];
  const tailW = (t) => (t < 0.45 ? 15 + 18 * t : 23 - (t - 0.45) * 22);
  const tailPts = tufted(tube(tailC, tailW, undefined, 12), { amp: 3.2, period: 6.5, flow: (x, y) => norm(x - 180, y - 150), lean: 0.5, seed: 4 });
  c.shape('tail', tailPts, '5', nl);
  c.paint('tail', blob([[156, 204], [190, 208], [222, 196], [232, 170], [230, 140], [222, 142], [222, 166], [208, 184], [184, 194], [158, 194]]), '4');
  {
    const cc = curve(tailC, 12), n = cc.length;
    for (const f of [0.34, 0.58, 0.8, 0.98]) {
      const i = Math.round(f * (n - 1)), a = cc[Math.max(0, i - 1)], b = cc[Math.min(n - 1, i + 1)];
      const [dx, dy] = norm(b[0] - a[0], b[1] - a[1]), nx = -dy, ny = dx, p = cc[i];
      const u = f > 0.9 ? 10 : 3.6, sk = 2.5;
      const ring = [[p[0] - nx * 18 - dx * u - dx * sk, p[1] - ny * 18 - dy * u - dy * sk], [p[0] + nx * 18 - dx * u + dx * sk, p[1] + ny * 18 - dy * u + dy * sk], [p[0] + nx * 18 + dx * u + dx * sk, p[1] + ny * 18 + dy * u + dy * sk], [p[0] - nx * 18 + dx * u - dx * sk, p[1] - ny * 18 + dy * u - dy * sk]];
      c.paint('tail', ring, '1');
    }
  }
  c.rim('tail', -1.5, -1.5, '7', { only: ['5'] });
  c.rim('tail', -1.5, -1.5, '3', { only: ['1'] });

  // ---- the torso: a round bust, a pale chest, ending in a rounded bottom inside the frame ----
  const bodyPts = tufted(blob([[104, 110], [92, 120], [85, 134], [83, 152], [86, 172], [94, 188], [108, 198], [128, 202], [148, 198], [160, 186], [166, 168], [167, 148], [164, 130], [156, 118], [144, 110]]),
    { amp: 3.2, period: 7, where: (x, y) => (y > 124 && y < 194 ? 1 : 0), flow: [0, 1], lean: 0.9, seed: 2 });
  c.shape('body', bodyPts, '5', nl);
  c.paint('body', blob([[150, 112], [170, 124], [174, 156], [168, 186], [150, 206], [140, 196], [152, 172], [156, 140]]), '4');
  c.paint('body', blob([[84, 178], [104, 192], [134, 194], [160, 184], [154, 206], [100, 206]]), '4');
  c.paint('body', blob([[160, 150], [174, 150], [170, 190], [150, 206], [156, 180]]), '3');
  c.paint('body', blob([[96, 130], [92, 150], [96, 170], [102, 160], [104, 138]]), '6');
  // the pale chest bib
  c.paint('body', tufted(blob([[108, 116], [144, 116], [150, 132], [146, 154], [138, 172], [126, 184], [114, 172], [106, 154], [102, 132]]), { amp: 3.6, period: 6, where: (x, y) => (y > 128 ? 1 : 0), flow: [0, 1], lean: 0.8, seed: 5 }), '7');
  c.paint('body', blob([[110, 120], [132, 118], [138, 134], [130, 156], [122, 168], [114, 154], [108, 134]]), '8');
  c.paint('body', blob([[140, 120], [150, 132], [146, 154], [138, 172], [130, 180], [136, 156], [142, 136]]), '6');


  // ---- the scarf: a chunky green knit wound round the neck, one end hanging down the far side of the chest ----
  c.shape('scarf', blob([[88, 110], [112, 116], [140, 116], [166, 108], [172, 116], [168, 126], [146, 132], [120, 134], [98, 130], [86, 120]]), 'l', { line: null, inner: 'e' });
  c.paint('scarf', blob([[90, 112], [140, 118], [168, 110], [150, 120], [120, 122], [94, 118]]), 'E');
  c.paint('scarf', blob([[96, 124], [120, 128], [146, 126], [168, 120], [168, 126], [146, 132], [120, 134], [98, 130]]), 'E');
  c.paint('scarf', blob([[130, 126], [150, 124], [168, 118], [168, 126], [146, 132], [128, 133]]), 'e');
  if (fine) for (const [y0, ph] of [[121, 0], [127, 2.5]]) for (let x = 92 + ph; x < 166; x += 5) {
    const yy = y0 + (x - 128) * (x - 128) * -0.0006 + (x > 150 ? -2 : 0);
    c.stroke([[x, yy], [x + 2.5, yy + 2], [x + 5, yy]], x < 132 ? 'L' : 'l', { on: 'scarf', line: false });
  }

  // ---- the arms (behind the pump): near arm down to the elbow and across the belly, far arm down and back in ----
  const ANG = Math.atan2(-0.804, -0.595), FOOT = [150, 191], PL = 180;
  const ax = { at: (s2, o = 0) => { const sc = PL / 180, ux = Math.cos(ANG), uy = Math.sin(ANG); let nx = -uy, ny = ux; if (-nx - ny < 0) { nx = -nx; ny = -ny; } return [FOOT[0] + ux * s2 * sc + nx * o, FOOT[1] + uy * s2 * sc + ny * o]; } };
  const pN = ax.at(30), pF = ax.at(60);
  c.paint('body', blob([[98, 128], [110, 132], [110, 152], [100, 160], [94, 150]]), '3');
  c.shape('armL', tufted(tube([[98, 128], [92, 164], [pN[0] - 6, pN[1] + 3]], (t) => 22 - 5 * t), { amp: 2.6, period: 6.5, where: (x, y) => (y > 152 ? 1 : 0), flow: [0, 1], seed: 7 }), '5', { line: null, inner: '3' });
  c.paint('armL', blob([[84, 136], [94, 124], [92, 146], [88, 156], [82, 150]]), '6');
  c.paint('armL', blob([[86, 132], [92, 126], [90, 140], [86, 146]]), '7');
  c.paint('armL', blob([[88, 166], [104, 172], [126, 172], [124, 178], [100, 180], [84, 172]]), '3');
  c.paint('armL', blob([[100, 156], [114, 160], [124, 162], [106, 164]]), '6');
  c.shape('armR', tufted(tube([[156, 128], [164, 152], [pF[0] + 6, pF[1] + 2]], (t) => 21 - 4 * t), { amp: 2.6, period: 6.5, where: (x, y) => (y > 150 ? 1 : 0), flow: [0, 1], seed: 6 }), '5', { line: null, inner: '3' });
  c.paint('armR', blob([[150, 150], [170, 154], [162, 164], [132, 160], [128, 152]]), '4');
  c.paint('armR', blob([[150, 120], [164, 126], [170, 142], [162, 138], [152, 128]]), '6');
  c.paint('armR', blob([[136, 140], [156, 144], [150, 146], [134, 146]]), '6');

  // the scarf's loose end, flung back over the near shoulder and hanging down the outside of the arm
  c.shape('scarfEnd', blob([[84, 116], [96, 118], [92, 134], [88, 150], [86, 162], [74, 162], [76, 146], [80, 128]]), 'E', { line: null, inner: 'e' });
  c.paint('scarfEnd', blob([[84, 116], [90, 117], [84, 134], [80, 150], [80, 162], [74, 162], [76, 146], [79, 128]]), 'l');
  c.paint('scarfEnd', blob([[92, 120], [96, 118], [92, 134], [88, 150], [86, 162], [83, 162], [86, 146], [89, 130]]), 'e');
  if (fine) for (let y = 126; y < 160; y += 5) c.stroke([[78, y], [92, y + 1.5]], 'e', { on: 'scarfEnd', line: false });
  for (const x of [75, 78, 81, 84]) c.stroke([[x, 162], [x - 0.5, 167 + (x % 3)]], x % 2 ? 'l' : 'E', { line: false });

  // ---- the pump, in front ----
  pumpAxis(c, FOOT, ANG, PL, { ramp: [':', 'f', 'F', ';', 'W'], fine, gaugeS: 0.62, hose: [[146, 197], [128, 203], [108, 200], [96, 190], [92, 178]], ribs: [96, 130] });

  // ---- the paws wrap the barrel: four fingers square across its front, the thumb hooked over from the far side ----
  const paw = (name, s0) => {
    c.shape(name, blob([ax.at(s0 - 8, -12), ax.at(s0 + 9, -12), ax.at(s0 + 10, -4), ax.at(s0 + 6, 1), ax.at(s0 - 7, 1), ax.at(s0 - 10, -5)]), '2', { line: null, inner: '1' });
    for (let i = 0; i < 4; i++) {
      const sm = s0 - 5.4 + i * 3.6, n = name + 'f' + i;
      c.shape(n, bar(ax.at(sm, -6), ax.at(sm, 8.2), 3.7, true), '2', { line: null, inner: '1' });
      c.paint(n, bar(ax.at(sm + 0.9, -6), ax.at(sm + 0.9, 7.6), 1.2), '3');
      c.dot(...ax.at(sm, 8.6), '7');
    }
    c.shape(name + 't', bar(ax.at(s0 + 9, -9), ax.at(s0 + 10.5, 3), 4, true), '2', { line: null, inner: '1' });
    c.paint(name + 't', bar(ax.at(s0 + 10, -8), ax.at(s0 + 11.2, 2), 1.2), '3');
  };
  paw('pawL', 30);
  paw('pawR', 60);

  // ---- ears (behind the head): fur outside, dark inside with a pale fringe ----
  const earL = blob([[96, 56], [98, 38], [103, 26], [110, 22], [116, 30], [124, 46]]);
  c.shape('earL', tufted(earL, { amp: 2.2, period: 5.5, where: (x, y) => (x < 106 ? 1 : 0), flow: [-1, 0], seed: 8 }), '5', nl);
  c.paint('earL', blob([[102, 52], [104, 38], [108, 30], [112, 31], [119, 46]]), '1');
  c.paint('earL', blob([[107, 50], [109, 40], [111, 36], [116, 46]]), '0');
  c.rim('earL', -1.8, -1.2, '7', { only: ['5'] });
  if (fine) { c.furBreak('earL', '5', ['1', '0'], { dir: (x, y) => norm(x - 112, y - 54).map((v) => -v), len: 4, gap: 2.4, seed: 9, w: 2 }); c.furStrokes('earL', blob([[103, 50], [106, 36], [112, 33], [118, 46]]), '6', { only: ['1', '0'], dir: (x, y) => norm(x - 112, y - 56), len: 4, gap: 4, seed: 19, prob: 0.8 }); }
  const earR = blob([[148, 44], [156, 30], [163, 22], [170, 23], [174, 34], [176, 52]]);
  c.shape('earR', tufted(earR, { amp: 2.2, period: 5.5, where: (x, y) => (x > 168 ? 1 : 0), flow: [1, 0], seed: 10 }), '4', nl);
  c.paint('earR', blob([[154, 44], [160, 33], [165, 28], [169, 30], [171, 46]]), '1');
  c.paint('earR', blob([[159, 42], [164, 34], [167, 33], [168, 44]]), '0');
  if (fine) { c.furBreak('earR', '4', ['1', '0'], { dir: (x, y) => norm(x - 162, y - 52).map((v) => -v), len: 3.4, gap: 2.6, seed: 11, w: 2 }); c.furStrokes('earR', blob([[156, 44], [162, 32], [168, 31], [170, 46]]), '5', { only: ['1', '0'], dir: (x, y) => norm(x - 163, y - 54), len: 3.4, gap: 4.2, seed: 18, prob: 0.8 }); }

  // ---- the head ----
  const headPts = tufted(blob([
    [94, 58], [106, 45], [124, 38], [144, 38], [160, 44], [172, 54], [178, 66], [180, 78], [184, 92], [186, 102],
    [178, 112], [162, 119], [144, 122], [126, 121], [108, 118], [92, 112], [82, 102], [82, 88], [87, 72],
  ]), {
    amp: 5.4, period: 6.5,
    where: (x, y) => (x < 100 && y > 78 ? 1.2 : x > 172 && y > 98 ? 0.8 : y > 112 ? 0.55 : y < 46 ? 0.3 : 0),
    flow: (x, y) => (y > 100 ? norm(x < 140 ? -0.6 : 0.6, 1) : headFlow(x, y)), lean: 0.6, seed: 12,
  });
  c.shape('head', headPts, '5', nl);
  // form: the crown and brow catch the light (upper left), the far side and the jaw turn into shadow
  c.paint('head', blob([[96, 60], [108, 46], [126, 40], [144, 40], [152, 46], [140, 50], [122, 52], [106, 60], [96, 70]]), '6');
  c.rim('head', -2.2, -2.2, '7');
  c.paint('head', blob([[168, 50], [182, 64], [188, 96], [186, 112], [176, 104], [174, 80], [166, 62]]), '4');
  c.paint('head', blob([[86, 98], [96, 108], [116, 116], [140, 118], [164, 114], [180, 106], [184, 116], [150, 126], [110, 124], [84, 112]]), '4');
  // the dark stripe from the crown down between the eyes to the bridge
  c.paint('head', tufted(blob([[134, 38], [148, 39], [152, 52], [150, 66], [143, 71], [137, 56]]), { amp: 2, period: 4.5, where: (x, y) => (y < 64 ? 1 : 0), flow: [0, -1], lean: 0.5, seed: 16 }), '4');
  c.paint('head', tufted(blob([[137, 40], [146, 41], [149, 53], [146, 64], [142, 66], [139, 54]]), { amp: 1.6, period: 4, where: (x, y) => (y < 62 ? 1 : 0), flow: [0, -1], lean: 0.5, seed: 17 }), '3');
  c.paint('head', blob([[140, 44], [144, 44], [145, 54], [143, 58], [141, 52]]), '2');
  // the cheek ruff below the mask: pale fur with white tips (near side), a smaller ruff on the far side
  c.paint('head', blob([[80, 88], [96, 92], [112, 98], [124, 104], [128, 112], [118, 120], [100, 118], [84, 110], [76, 98]]), '7');
  c.paint('head', blob([[78, 96], [92, 102], [106, 110], [116, 118], [100, 122], [84, 114], [74, 104]]), '8');
  c.paint('head', blob([[170, 98], [180, 96], [190, 104], [186, 114], [174, 110]]), '7');
  // the white brows: tufted bands over each eye, breaking the head's outline at the outer end
  const browN = tufted(blob([[92, 66], [98, 58], [110, 53], [124, 52], [134, 55], [136, 60], [124, 59], [110, 61], [98, 67]]), { amp: 2.2, period: 3.6, where: (x, y) => (y < 58 ? 1 : 0.4), flow: [-0.8, -0.6], lean: 0.7, seed: 13 });
  c.paint('head', browN, '8');
  c.paint('head', blob([[100, 59], [112, 54.5], [126, 54], [132, 56.5], [122, 57], [108, 59]]), 'W');
  const browF = tufted(blob([[152, 58], [158, 52], [168, 50], [176, 52], [180, 57], [176, 60], [166, 57], [156, 61]]), { amp: 1.8, period: 3.6, where: (x, y) => (y < 56 ? 1 : 0.4), flow: [0.6, -0.8], lean: 0.6, seed: 14 });
  c.paint('head', browF, '8');
  c.paint('head', blob([[158, 54], [168, 51.5], [176, 54], [168, 54.5]]), 'W');
  // the bandit mask: a lobe round each eye joined over the bridge; the near lobe sweeps down and back onto the cheek
  const maskPts = tufted(blob([
    [80, 84], [84, 74], [94, 66], [108, 63], [122, 63], [132, 66], [140, 70], [146, 66], [156, 62], [168, 61], [178, 64], [182, 72],
    [178, 82], [168, 86], [158, 87], [150, 85], [144, 80], [138, 84], [132, 91], [120, 95], [106, 96], [92, 98], [82, 96],
  ]), { amp: 2.8, period: 4, where: (x, y) => (x < 100 ? 1 : y > 86 && x < 136 ? 0.6 : 0), flow: [-0.7, 0.7], lean: 0.7, seed: 15 });
  c.paint('head', maskPts, '1');
  // the mask has form too: a soft sheen over the brow ridge and round the eye sockets, deepest at its lower outer edge
  c.paint('head', blob([[88, 74], [98, 67], [112, 64.5], [126, 65], [136, 69], [140, 74], [132, 72], [120, 69], [106, 69], [94, 73]]), '2');
  c.paint('head', blob([[100, 69], [112, 66.5], [124, 67], [116, 68.5], [106, 69.5]]), '3');
  c.paint('head', blob([[150, 66], [160, 63], [172, 63], [180, 67], [172, 66.5], [160, 66.5]]), '2');
  c.paint('head', blob([[110, 84], [122, 86], [134, 82], [138, 86], [126, 90], [112, 89]]), '2');   // the cheekbone under the near eye
  c.paint('head', blob([[150, 82], [160, 84], [170, 82], [164, 86], [154, 86]]), '2');
  c.paint('head', blob([[80, 82], [88, 86], [100, 90], [114, 92], [128, 90], [120, 96], [104, 97], [88, 98], [78, 92]]), '0');   // its lower edge in deep shadow
  c.paint('head', blob([[80, 80], [86, 72], [92, 70], [88, 80], [86, 90], [80, 90]]), '0');
  // the snout: a forward block, white, its far side and underside in shade
  c.shape('snout', blob([[146, 84], [156, 80], [170, 80], [182, 84], [190, 90], [192, 97], [186, 103], [174, 106], [160, 106], [150, 101]]), '8', { line: null, inner: null });
  c.paint('snout', blob([[148, 96], [162, 100], [178, 100], [192, 95], [190, 104], [172, 108], [154, 106]]), '7');
  c.paint('snout', blob([[150, 101], [164, 104], [180, 103], [188, 101], [184, 106], [168, 108], [154, 106]]), '6');
  c.paint('snout', blob([[154, 86], [166, 82], [178, 84], [184, 88], [172, 88], [160, 90]]), 'W');
  c.paint('snout', blob([[146, 84], [154, 80.5], [164, 80], [156, 84], [149, 90]]), '6');   // the grey bridge coming down from the stripe
  c.paint('snout', blob([[146, 88], [150, 84], [154, 86], [150, 94]]), '5');
  // the muzzle under the mask, white
  c.paint('head', blob([[128, 92], [140, 86], [150, 90], [152, 104], [146, 112], [134, 114], [124, 108]]), '8');
  c.paint('head', blob([[136, 108], [150, 106], [162, 110], [150, 116], [138, 116]]), '7');

  // ---- fur: the tone boundaries interlock in short strokes along the flow, a few strands on the lit crown ----
  if (fine) {
    const fur = (on, a, b, dir, len, gap, seed, w = 1, shapes = null) => c.furBreak(on, a, b, { dir, len, gap, seed, w, shapes });
    fur(['head', 'snout'], '6', '5', headFlow, 3.6, 2.6, 21, 2);
    fur(['head', 'snout'], '5', '6', (x, y) => headFlow(x, y).map((v) => -v), 2.6, 3.2, 22);
    fur(['head', 'snout'], '7', '6', headFlow, 2.4, 2.4, 23);
    fur(['head', 'snout'], '4', '5', (x, y) => headFlow(x, y).map((v) => -v), 3, 2.8, 24, 2);
    fur(['head', 'snout'], '5', '4', headFlow, 3.4, 2.6, 25, 2);
    fur(['head', 'snout'], '3', '5', [0, -1], 2.6, 2.4, 26);
    fur(['head', 'snout'], '8', '1', (x, y) => norm(x - 160, y - 30), 2.8, 2.2, 27, 2);   // brow tufts poke into the mask
    fur(['head', 'snout'], '8', '5', (x, y) => norm(x - 150, y - 110), 2.6, 2.4, 28, 2);  // ...and up into the forehead
    fur(['head', 'snout'], '1', '8', [-0.6, 1], 3.4, 2.6, 29, 2);                         // the mask's lower edge feathers into the cheek
    fur(['head', 'snout'], '7', '1', [0.2, -1], 2.4, 3, 30);
    fur(['head', 'snout'], '8', '7', [-0.7, 0.7], 3, 2.6, 31);
    fur(['head', 'snout'], '4', '7', [-0.4, -1], 2.6, 2.8, 32);
    fur(['head', 'snout'], '7', '4', [0.3, 1], 3, 2.6, 33, 2);
    c.furStrokes('head', blob([[98, 62], [112, 46], [134, 40], [150, 44], [130, 50], [110, 58]]), '7', { only: ['6'], dir: headFlow, len: 3.4, gap: 4.2, seed: 34 });
    c.furStrokes('head', null, '4', { only: ['5'], dir: headFlow, len: 3, gap: 5, seed: 35, prob: 0.7 });
    c.furStrokes('head', null, '3', { only: ['4'], dir: headFlow, len: 3, gap: 5, seed: 36, prob: 0.6 });
    // body + arms + tail
    for (const [on, f] of [['body', [0, 1]], ['armL', [-0.7, 0.4]], ['armR', [0.8, 0.6]], ['foreR', [-0.7, 0.7]], ['tail', (x, y) => norm(x - 160, y - 210)]]) {
      fur(on, '6', '5', f, 3.2, 2.8, 40, 2); fur(on, '5', '4', f, 3.2, 2.8, 41, 2); fur(on, '4', '3', f, 3, 3, 42); fur(on, '7', '6', f, 3, 2.6, 43, 2);
      fur(on, '8', '7', f, 2.6, 2.6, 44); fur(on, '3', '4', Array.isArray(f) ? f.map((v) => -v) : (x, y) => f(x, y).map((v) => -v), 2.4, 3, 45);
      c.furStrokes(on, null, '4', { only: ['5'], dir: f, len: 3, gap: 5, seed: 46, prob: 0.6 });
      c.furStrokes(on, null, '6', { only: ['7'], dir: f, len: 2.6, gap: 5, seed: 47, prob: 0.5 });
    }
    fur('tail', '1', '5', (x, y) => norm(x - 160, y - 210), 2.6, 2.6, 48, 2);
    fur('tail', '5', '1', (x, y) => norm(x - 160, y - 210), 2.6, 2.6, 49, 2);
  }

  // ---- the eyes: half-lidded and pleased with itself, amber irises looking right ----
  const eye = (cx, cy, rx, ry, n) => {
    // the eye opening: a pale lower rim separates it from the mask
    c.paint('head', blob([[cx - rx - 1.2, cy + 0.4], [cx - rx * 0.4, cy + ry + 1.6], [cx + rx * 0.5, cy + ry + 1.4], [cx + rx + 1.4, cy - 0.4], [cx + rx * 0.5, cy + ry * 0.9], [cx - rx * 0.4, cy + ry]]), '3');
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.55, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.4], [cx + rx * 0.55, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.9]]), '7', { line: null, inner: '0' });
    c.paint(n, blob([[cx - rx, cy + 1], [cx + rx, cy + 1], [cx + rx, cy + ry], [cx - rx, cy + ry]]), '8');
    const ix = cx + rx * 0.28, iy = cy + 0.5, ir = ry * 1.02;
    c.paint(n, ell(ix, iy, ir, ir * 1.04), '<');
    c.paint(n, ell(ix, iy + ir * 0.2, ir * 0.86, ir * 0.82), '>');
    c.paint(n, ell(ix + ir * 0.1, iy + ir * 0.45, ir * 0.66, ir * 0.48), '{');
    c.paint(n, ell(ix + ir * 0.2, iy + ir * 0.72, ir * 0.42, ir * 0.22), '}');
    c.paint(n, ell(ix + 0.3, iy, ir * 0.46, ir * 0.56), '0');
    // the heavy upper lid over the top third (the smirk), its rim a dark line, a glint and a wet sparkle
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.4], [cx, cy - ry * 0.48], [cx - rx - 2, cy - ry * 0.25]]), '1');
    c.stroke(curve([[cx - rx - 0.6, cy - ry * 0.2], [cx, cy - ry * 0.5], [cx + rx + 0.8, cy - ry * 0.42]]), '0', { t: Math.max(1, Math.round(1.4 * k)), line: false });
    c.stroke(curve([[cx - rx * 0.4, cy - ry * 0.9], [cx + rx * 0.3, cy - ry * 1.05], [cx + rx * 0.9, cy - ry * 0.8]]), '2', { on: n, line: false });   // the lid's crease catches a little light
    const g = Math.max(1, Math.round(1.3 * k));
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) c.img.set(Math.round(c.X(ix - ir * 0.32)) + i, Math.round(c.Y(iy - ir * 0.12)) + j, 'W');
    if (fine) c.dot(ix + ir * 0.42, iy + ir * 0.5, '`');
  };
  eye(122, 77, 9, 6.8, 'eyeN');
  eye(161, 75, 6.6, 5.4, 'eyeF');

  // ---- the nose: wet black, a soft top plane and a bright shine ----
  c.shape('nose', blob([[180, 88], [186, 85], [193, 86], [197, 91], [195, 97], [189, 99], [182, 97], [179, 92]]), '1', nl);
  c.paint('nose', blob([[182, 88], [188, 86], [194, 88], [190, 90], [184, 91]]), '3');
  c.paint('nose', blob([[181, 95], [186, 98], [192, 98], [186, 99.5]]), '0');
  c.dot(184.5, 88.5, '7'); c.dot(185.5, 88.5, 'W', fine ? 0 : 0);
  if (fine) { c.dot(192, 95, '0'); c.dot(185, 95, '0'); }
  // the smirk: down from the nose, sweeping back into the raised near corner and its dimple
  const mt = Math.max(1, Math.round(1.2 * k));
  c.stroke(curve([[188, 99], [187, 102.5], [181, 106], [173, 107.5], [166, 107], [160, 104.5], [156.5, 100.5]]), '1', { t: mt, line: false });
  c.stroke(curve([[158.5, 103.5], [155.5, 101], [156, 97.5]]), '2', { line: false });
  c.stroke(curve([[187, 102.5], [191, 104], [194, 103]]), '2', { line: false });
  c.paint('head', blob([[162, 107.5], [172, 109.5], [182, 108], [174, 112], [164, 111]]), '6');   // the lower lip's shadow


  // ---- the warm coat: every fur tone moves to the taupe ramp (the pump, scarf and eyes keep theirs) ----
  {
    const map = { 0: '@', 1: '#', 2: '$', 3: 'I', 4: '%', 5: '&', 6: 'J', 7: '*', 8: '+' };
    const fur = ['tail', 'body', 'armL', 'armR', 'pawL', 'pawR', ...['pawL', 'pawR'].flatMap((p) => [p + 't', p + 'f0', p + 'f1', p + 'f2', p + 'f3']), 'earL', 'earR', 'head', 'snout', 'nose', 'eyeN', 'eyeF'].map((n) => c.id(n));
    for (let i = 0; i < c.img.px.length; i++) if (fur.includes(c.part[i]) && map[c.img.px[i]]) c.img.px[i] = map[c.img.px[i]];
  }
  // ---- the silhouette: a dark line on the shadow side, a softer one on the lit side; clean up stray pixels ----
  c.despeckle(null, ['W', '`', '7', '}']);
  c.silhouette({ dark: '0', lit: '2', light: [-1, -1], pick: (nb) => (['y', 'Y', '`', 'o', '|', 'O'].includes(nb) ? '|' : ['R', 'q', '[', 'r'].includes(nb) ? 'r' : undefined) });
  // whiskers: fine light lines across the dark cheek, reaching just past the outline
  if (fine) {
    for (const w of [[[176, 99], [192, 96], [206, 93]], [[178, 102], [194, 104], [208, 107]], [[120, 96], [102, 98], [80, 102]], [[118, 99], [100, 104], [82, 110]]]) {
      const P = curve(w, 16).map(([x, y]) => [Math.round(c.X(x)), Math.round(c.Y(y))]);
      const seen = new Set();
      for (let i = 0; i < P.length - 1; i++) {
        const [x0, y0] = P[i], [x1, y1] = P[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
        for (let s2 = 0; s2 <= n; s2++) {
          const X = Math.round(x0 + ((x1 - x0) * s2) / n), Y = Math.round(y0 + ((y1 - y0) * s2) / n), key = X + ',' + Y;
          if (seen.has(key)) continue; seen.add(key);
          const cur = c.img.get(X, Y);
          if (cur !== null && !['0', '1', '2', '3', '4'].includes(cur)) continue;
          c.img.set(X, Y, cur === null ? '8' : '6');
        }
      }
    }
  }
  return c.img;
}

// ============================== DOG FJORD ==============================
// A cartoon bulldog (never a real person's likeness): a big pink jowly head on a small suited body, grey combed hair,
// folded ears, a brown heart patch round the far eye, thick brows, a big black nose, a smug grin.
// Three-quarter view facing LEFT. Expressions: grin, laugh, shock. Light from the upper left (his face side).
// The head silhouette, ears and hair outline are M4.7 iteration 04's (Ivan: "Dog's head from iter_04 looks the best").
const DSC = 1.1;
const T = ([x, y, s]) => (s ? [110 + (x - 110) * DSC, 100 + (y - 100) * DSC, 1] : [110 + (x - 110) * DSC, 100 + (y - 100) * DSC]);
const B = (pts) => blob(pts.map(T));
const Cv = (pts) => curve(pts).map(T);
const E = (x, y, rx, ry, rot = 0) => { const [X, Y] = T([x, y]); return ell(X, Y, rx * DSC, ry * DSC, rot); };
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

  // ---- the suit: charcoal pinstripe, a gold tie with little cars on it, a red-and-white flag pin ----
  c.shape('suit', B([[60, 214, 1], [63, 188], [74, 170], [94, 157], [130, 157], [150, 170], [162, 188], [166, 214, 1]]), 'A', nl);
  c.paint('suit', B([[60, 170], [80, 160], [90, 164], [76, 180], [68, 214], [56, 214]]), 's');
  c.paint('suit', B([[122, 156], [150, 170], [162, 188], [168, 214], [136, 214], [134, 186]]), 'a');
  c.paint('suit', B([[64, 186], [72, 172], [80, 166], [74, 180], [70, 200]]), 'S');
  if (!small) for (let x = 58; x < 170; x += 4.5) c.stroke(Cv([[x, 160], [x + 1.5, 214]]), 's', { on: 'suit', line: false, t: 1 });
  c.shape('shirt', B([[93, 154, 1], [119, 154, 1], [107, 204, 1], [105, 204, 1]]), 'W', nl);
  c.paint('shirt', B([[107, 154], [119, 154], [107, 204]]), '7');
  c.paint('shirt', B([[93, 154], [100, 154], [106, 180], [105, 204]]), '8');
  c.shape('lapelL', B([[90, 156, 1], [105, 202, 1], [95, 188, 1], [84, 174, 1], [77, 165, 1]]), 's', { line: null, inner: 'a' });
  c.paint('lapelL', B([[90, 156, 1], [96, 172, 1], [84, 166, 1], [78, 165, 1]]), 'S');
  c.shape('lapelR', B([[122, 156, 1], [137, 164, 1], [130, 178, 1], [118, 192, 1], [107, 202, 1]]), 'A', { line: null, inner: 'a' });
  c.paint('lapelR', B([[130, 170, 1], [137, 164, 1], [130, 178, 1], [118, 192, 1]]), 'a');
  c.shape('tie', B([[102, 166, 1], [110, 166, 1], [109, 176, 1], [114, 206, 1], [106, 213, 1], [98, 206, 1], [103, 176, 1]]), 'y', { line: null, inner: '|' });
  c.paint('tie', B([[107, 166], [110, 166], [109, 176], [114, 206], [108, 210]]), 'o');
  c.paint('tie', B([[102, 168], [104, 168], [101, 200], [99, 204]]), 'Y');
  if (!small) for (const [x, y] of [[104, 180], [107, 192], [103, 202]]) { c.paint('tie', B([[x - 2.6, y + 1], [x - 2, y - 0.6], [x - 0.6, y - 1.6], [x + 1.4, y - 1.6], [x + 2.6, y - 0.4], [x + 2.6, y + 1]]), 'R'); c.dot(...T([x - 1.4, y + 1.4]), 'K'); c.dot(...T([x + 1.6, y + 1.4]), 'K'); }
  c.shape('knot', B([[100, 159, 1], [112, 159, 1], [111, 167, 1], [101, 167, 1]]), 'y', { line: null, inner: '|' });
  c.paint('knot', B([[107, 159], [112, 159], [111, 167], [107, 167]]), 'o');
  c.paint('knot', B([[101, 159], [105, 159], [104, 162], [101, 162]]), 'Y');
  if (!small) { c.shape('pin', B([[79, 174, 1], [85, 174, 1], [85, 178, 1], [79, 178, 1]]), 'W', nl); c.paint('pin', B([[79, 174], [80.6, 174], [80.6, 178], [79, 178]]), 'R'); c.paint('pin', B([[83.4, 174], [85, 174], [85, 178], [83.4, 178]]), 'R'); c.dot(...T([82, 176]), 'R'); }

  // ---- the head (iteration 04's outline) ----
  c.shape('head', B(HEAD04), 'm', nl);
  // value, planned as volumes lit from the upper left: a broad lit plane over the forehead and near cheek, the base,
  // a shadow side turning away on the right, a core shadow, the deepest tone under the jowls; a bounce light on the
  // far edge so the dark side still reads round
  c.paint('head', B([[150, 52], [200, 40], [200, 190], [40, 190], [44, 150], [60, 152], [84, 157], [110, 158], [134, 154], [148, 144], [156, 128], [158, 104], [154, 80]]), '^');
  c.paint('head', B([[160, 72], [200, 60], [200, 190], [40, 190], [44, 156], [64, 158], [90, 161], [116, 162], [140, 158], [156, 146], [164, 126], [165, 100]]), 'P');
  c.paint('head', B([[166, 104], [200, 100], [200, 190], [40, 190], [54, 158], [80, 163], [110, 165], [140, 162], [158, 150], [165, 130]]), '?');
  c.paint('head', B([[170, 124], [200, 120], [200, 190], [60, 190], [90, 165], [130, 164], [156, 156], [168, 140]]), 'p');
  c.rim('head', 1.6, 0.4, '^', { only: ['?', 'P'] });
  c.paint('head', B([[56, 96], [62, 80], [72, 64], [86, 52], [104, 46], [120, 48], [104, 54], [90, 62], [80, 76], [72, 92], [66, 110], [62, 126], [56, 134], [50, 124], [51, 108]]), '~');
  c.paint('head', B([[70, 66], [82, 54], [98, 48], [88, 58], [78, 70]]), 'M');
  c.paint('head', B([[54, 108], [58, 98], [62, 104], [60, 116], [56, 122]]), 'M');
  // the jowls: two heavy lobes hanging below the creases, each lit on top and dark underneath
  c.paint('head', B([[47, 132], [52, 138], [60, 146], [70, 152], [84, 156], [70, 160], [56, 156], [48, 146]]), 'P');
  c.paint('head', B([[50, 146], [60, 154], [76, 159], [92, 162], [74, 165], [58, 160]]), '?');
  c.paint('head', B([[60, 122], [66, 124], [68, 134], [64, 138], [60, 132]]), '~');
  c.paint('head', B([[136, 118], [144, 112], [152, 120], [154, 134], [148, 146], [140, 150], [142, 134]]), '^');
  c.paint('head', B([[138, 120], [144, 116], [148, 124], [146, 132], [141, 128]]), 'm');
  // forehead folds: a dark crease with a lit lip below it
  for (const [y, x0, x1] of [[66, 84, 112], [72, 87, 114]]) {
    c.stroke(Cv([[x0, y + 1.4], [(x0 + x1) / 2, y - 1.1], [x1, y + 1.4]]), '~', { on: 'head', t: px(1), line: false });
    c.stroke(Cv([[x0, y], [(x0 + x1) / 2, y - 2.5], [x1, y]]), '?', { on: 'head', t: px(1.1), line: false });
  }
  // the jowl creases: deep folds from beside the nose down past the mouth corners, a lit bulge on the inner side
  const LCR = [[66, 117], [59, 128], [61, 140], [68, 149]], RCR = [[131, 116], [137, 127], [135, 139], [128, 149]];
  c.stroke(Cv(LCR.map(([x, y]) => [x + 1.8, y])), '~', { on: 'head', t: px(1.4), line: false });
  c.stroke(Cv(RCR.map(([x, y]) => [x + 2, y + 0.5])), '?', { on: 'head', t: px(2.2, 2), line: false });
  c.stroke(Cv(LCR), 'p', { on: 'head', t: px(1.4), line: false });
  c.stroke(Cv(RCR), 'p', { on: 'head', t: px(1.4), line: false });
  // the chin fold under the mouth
  const chinY = expr === 'laugh' ? 158 : 154;
  c.paint('head', B([[90, chinY], [110, chinY + 1.8], [130, chinY], [136, 172], [84, 172]]), 'P');
  c.paint('head', B([[94, chinY + 3], [110, chinY + 5], [126, chinY + 3], [126, 172], [94, 172]]), '?');
  c.stroke(Cv([[92, chinY], [110, chinY + 1.8], [128, chinY]]), 'p', { on: 'head', t: px(1.2), line: false });
  c.stroke(Cv([[96, chinY - 1.6], [110, chinY + 0.2], [124, chinY - 1.6]]), '~', { on: 'head', t: px(1), line: false });

  // ---- the brown heart patch round the far eye: warm brown with a lit lobe ----
  c.shape('patch', B([[104, 89], [104, 82], [110, 77.5], [117, 78.5], [124, 77], [131, 80.5], [132, 89], [127, 99], [118, 109, 1], [109, 99]]), 'x', { line: null, clip: 'head' });
  c.paint('patch', B([[106, 84], [110, 80], [115, 81], [110, 87], [107, 89]]), 'X');
  c.paint('patch', B([[106, 83], [109, 80.5], [112, 81], [108, 84]]), 'j');
  c.paint('patch', B([[124, 90], [132, 86], [128, 100], [118, 109, 1], [122, 98]]), 'w');

  // ---- ears: iteration 04's flaps, hinged under the hair, tips out and down ----
  c.shape('earL', B([[76, 61, 1], [50, 76, 1], [56, 80], [66, 80.5], [72, 74, 1]]), 'm', nl);
  c.paint('earL', B([[51, 77, 1], [74, 66, 1], [73, 74, 1], [66, 82, 1], [55, 81, 1]]), 'P');
  c.paint('earL', B([[56, 79], [70, 70], [70, 76], [64, 81]]), '?');
  c.stroke(Cv([[74, 63], [52, 75.5]]), '~', { on: 'earL', t: px(1.4), line: false });
  c.shape('earR', B([[146, 60, 1], [170, 76, 1], [164, 81], [156, 82.5], [151, 72, 1]]), 'P', nl);
  c.paint('earR', B([[169, 77, 1], [148, 65, 1], [151, 73, 1], [157, 84, 1], [165, 82, 1]]), '?');
  c.stroke(Cv([[148, 63], [168, 75.5]]), '^', { on: 'earR', t: px(1.2), line: false });

  // ---- the hair: iteration 04's compact pompadour; combed strands sweep up and back from the hairline ----
  const HAIRLINE = [[146, 52], [143.5, 58], [140, 52.5], [134, 51], [120, 52], [108, 55], [100, 52], [92, 52], [84, 56], [79, 65], [75.5, 59]];
  c.shape('hair', B([[73, 56], [73, 44], [77, 33], [84, 26], [94, 23], [104, 24], [112, 28], [126, 31], [140, 35], [148, 40], [151, 46], ...HAIRLINE]), '6', nl);
  c.paint('hair', B([[118, 30], [160, 38], [160, 64], [140, 56], [124, 53], [132, 42]]), '5');
  c.paint('hair', B([[134, 40], [160, 44], [160, 64], [142, 56], [140, 48]]), '4');
  c.paint('hair', B([[74, 50], [74, 40], [80, 30], [90, 25], [100, 25], [90, 30], [82, 40], [80, 52]]), '7');
  const strands = [
    [[86, 55], [85, 43], [92, 33], [104, 29], [120, 32]],
    [[93, 53], [95, 44], [104, 37], [120, 36], [138, 39]],
    [[103, 54], [109, 46], [122, 42], [142, 43]],
    [[116, 52], [126, 47], [144, 48], [151, 51]],
  ];
  for (const g of strands) c.stroke(Cv(g), '4', { on: 'hair', t: px(1.6), line: false });
  for (const g of strands) c.stroke(Cv(g.map(([x, y]) => [x - 1.2, y - 1.6])), '7', { on: 'hair', t: px(1), line: false });
  for (const g of [[[80, 50], [79, 39], [85, 30], [96, 26]], [[89, 50], [90, 42], [97, 35], [108, 32]], [[99, 51], [102, 44], [112, 39]]]) c.stroke(Cv(g), '8', { on: 'hair', t: px(1.2), line: false });
  if (fine) c.stroke(Cv([[82, 46], [83, 36], [90, 29]]), 'W', { on: 'hair', line: false });
  // the shadow the hair casts on the forehead
  c.stroke(Cv([[122, 53.5], [108, 56.5], [100, 53.5], [92, 53.5], [84, 59.5]]), '^', { on: 'head', t: px(2.2, 2), line: false });
  c.stroke(Cv([[122, 53], [108, 56], [100, 53], [92, 53], [84, 59]]), 'P', { on: 'head', t: px(1), line: false });

  // ---- skin texture: the tone boundaries soften in short clustered strokes (short bulldog fur) ----
  if (fine) {
    const out = (x, y) => norm(x - 95, y - 120);
    const inn = (x, y) => norm(95 - x, 120 - y);
    c.furBreak('head', '~', 'm', { dir: out, len: 2.2, gap: 3, seed: 61 });
    c.furBreak('head', 'm', '^', { dir: out, len: 2.4, gap: 3, seed: 62 });
    c.furBreak('head', '^', 'm', { dir: inn, len: 1.8, gap: 3.4, seed: 63 });
    c.furBreak('head', '^', 'P', { dir: out, len: 2.2, gap: 3, seed: 64 });
    c.furBreak('head', 'P', '^', { dir: inn, len: 1.6, gap: 3.4, seed: 65 });
    c.furBreak('head', 'M', '~', { dir: out, len: 1.8, gap: 3, seed: 66 });
    c.furBreak('hair', '7', '6', { dir: [1, 0.2], len: 3, gap: 2.6, seed: 67 });
    c.furBreak('hair', '6', '5', { dir: [1, 0.3], len: 3.4, gap: 2.6, seed: 68 });
    c.furBreak('hair', '5', '4', { dir: [1, 0.4], len: 3, gap: 2.8, seed: 69 });
  }

  // ---- the face ----
  const [NX, NY] = [84, 91], [FX, FY] = [117, 92];   // the near eye, the far (patch) eye
  const bs = small ? 1.2 : 0;
  const ny = NY - (small ? 2.5 : 0);
  // the brows: thick, dark, with a lit top edge so they read as tufts of hair, not lines
  const brow = (pts) => {
    const p = pts.map(([x, y]) => [x, y - bs]);
    c.stroke(Cv(p), '0', { t: px(4, 2), line: false });
    if (fine) c.stroke(Cv(p.map(([x, y]) => [x - 0.2, y - 1.3])), '3', { t: px(1), line: false });
  };
  const openEye = (ex, ey, rx, ry, iris, lid) => {
    const n = 'eye' + ex;
    c.shape(n, B([[ex - rx, ey + 0.5], [ex - rx * 0.55, ey - ry], [ex + rx * 0.5, ey - ry], [ex + rx, ey], [ex + rx * 0.55, ey + ry], [ex - rx * 0.5, ey + ry]]), '8', { line: null });
    c.paint(n, B([[ex - rx, ey - ry], [ex + rx, ey - ry], [ex + rx, ey - ry * 0.3], [ex - rx, ey - ry * 0.4]]), '7');
    const [ix, iy, ir] = iris;
    c.paint(n, E(ix, iy, ir, ir * 1.05), '<');
    c.paint(n, E(ix + 0.2, iy + ir * 0.25, ir * 0.78, ir * 0.7), '>');
    c.paint(n, E(ix + 0.3, iy + ir * 0.55, ir * 0.5, ir * 0.32), '{');
    c.paint(n, E(ix, iy, ir * 0.48, ir * 0.55), '0');
    if (lid !== null) c.paint(n, B(lid), 'x');
    c.dot(...T([ix - ir * 0.35, iy - ir * 0.3]), 'W', k >= 1.4 ? 1 : 0);
  };
  if (expr === 'shock') {
    brow([[NX - 8, ny - 15], [NX, ny - 20], [NX + 8, ny - 16]]);
    brow([[FX - 8, FY - 17], [FX, FY - 22], [FX + 8, FY - 17]]);
    for (const [ex, ey] of [[NX, ny], [FX, FY]]) {
      c.shape('eye' + ex, E(ex, ey, 5.5, 6.5), small ? 'W' : '8', { line: '0', inner: '0' });
      if (!small) c.paint('eye' + ex, E(ex, ey - 3, 5.5, 3), '7');
      c.paint('eye' + ex, E(ex - 0.5, ey + 0.5, 2.4, 2.8), '0');
      if (!small) c.dot(...T([ex - 1.3, ey - 0.6]), 'W', k >= 1.4 ? 1 : 0);
    }
  } else if (expr === 'laugh') {
    brow([[NX - 8, ny - 12], [NX, ny - 15], [NX + 8, ny - 12]]);
    brow([[FX - 8, FY - 14], [FX, FY - 18], [FX + 8, FY - 14]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX, ny - 4], [NX + 7, ny + 2]]), '0', { t: px(3, 2), line: false });
    c.stroke(Cv([[NX - 5, ny + 4.5], [NX, ny + 2], [NX + 5, ny + 4.5]]), '~', { on: 'head', t: px(1), line: false });
    c.shape('lid', B([[FX - 8, FY + 1], [FX - 4, FY - 3], [FX + 4, FY - 3], [FX + 8, FY + 1], [FX, FY + 2]]), '0', nl);
    c.stroke(Cv([[FX - 5, FY + 4], [FX, FY + 5], [FX + 5, FY + 4]]), 'w', { on: ['head', 'patch'], line: false });
  } else {
    // the smug politician: a wink on the near side, the patch eye half open under a heavy lid with a glint
    brow([[NX - 9, ny - 11], [NX - 1, ny - 12], [NX + 8, ny - 8]]);
    brow([[FX - 8, FY - 13], [FX, FY - 17.5], [FX + 8, FY - 13.5]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 3, ny - 1.5], [NX + 3, ny - 1.5], [NX + 7, ny + 1]]), '0', { t: px(2.6, 2), line: false });
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 10, ny + 4]]), '0', { t: px(1.6), line: false });
    c.stroke(Cv([[NX - 4, ny + 5], [NX + 1, ny + 6], [NX + 5, ny + 5]]), 'P', { on: 'head', line: false });
    if (fine) c.stroke(Cv([[NX - 5, ny - 3], [NX + 1, ny - 4.6], [NX + 5, ny - 3.4]]), '~', { on: 'head', line: false });
    openEye(FX, FY, 7.4, 4.6, [FX - 1.6, FY + 1.2, 3.7], [[FX - 9, FY - 6], [FX + 9, FY - 6], [FX + 9, FY + 1.8], [FX + 4, FY + 0.6], [FX, FY + 0.2], [FX - 9, FY + 0.6]]);
    c.stroke(Cv([[FX - 6.5, FY + 0.9], [FX, FY + 0.5], [FX + 4.5, FY + 1.1], [FX + 6.5, FY + 2.1]]), '0', { t: px(2.2, 2), line: false });
    if (fine) c.stroke(Cv([[FX - 5, FY - 2.4], [FX + 1, FY - 3.4], [FX + 6, FY - 1.6]]), 'X', { on: 'eyeF' + '', line: false });
  }
  // the muzzle: the upper-lip pads as a forward mass, lit on top, the nose's soft cast shadow below it
  c.paint('head', B([[66, 110], [80, 106], [100, 106], [116, 110], [126, 118], [112, 116], [96, 114], [76, 116], [64, 118]]), '~');
  if (expr !== 'shock') c.paint('head', B([[99, 134], [106, 132.8], [114, 131.4], [121.5, 128.6], [114, 133.2], [106, 134.4]]), 'P');
  c.paint('head', B([[82, 115], [96, 117], [106, 112], [112, 114], [106, 121], [93, 122.5], [82, 120]]), '^');
  c.paint('head', B([[86, 116], [96, 117.5], [104, 114], [100, 119], [92, 120]]), 'P');
  // the nose: big, black and wet: a cool top plane, a bright shine, dark nostrils
  c.shape('nose', B([[74, 104], [80, 98], [92, 97], [103, 101], [103, 110], [94, 116], [82, 115], [75, 110]]), '1', nl);
  c.paint('nose', B([[78, 100], [86, 98], [96, 99], [100, 103], [90, 103], [80, 104]]), '2');
  c.paint('nose', E(85, 101.6, 4.6, 1.6, -0.15), '3');
  c.paint('nose', B([[78, 112], [86, 115], [96, 114], [102, 109], [100, 113], [94, 116.5], [82, 116]]), '0');
  c.dot(...T([82.5, 101]), 'W', k >= 1.4 ? 1 : 0);
  if (fine) c.dot(...T([86.5, 100.8]), '6');
  c.dot(...T([79, 111]), '0', Math.max(1, Math.round(1.2 * k))); c.dot(...T([99, 110]), '0', Math.max(1, Math.round(1.2 * k)));
  c.stroke(Cv([[89, 116], [89, 123]]), 'p', { t: px(1.4), line: false });
  if (!small) for (const [x, y] of [[73, 119], [77, 123], [71, 125], [104, 120], [108, 124], [101, 125]]) c.dot(...T([x, y]), '?', k >= 1 ? 1 : 0);
  const flews = () => {
    c.stroke(Cv([[82, 119], [72, 120], [63, 123]]), 'p', { on: 'head', t: px(1.3), line: false });
    c.stroke(Cv([[97, 120], [112, 122], [124, 126], [130, 130]]), 'p', { on: 'head', t: px(1.3), line: false });
  };
  if (expr === 'grin') {
    c.shape('mouth', B([[62, 123, 1], [80, 132], [96, 136], [113, 135], [129, 130, 1], [121, 139], [97, 147], [75, 138]]), 'W', { line: 'p', inner: 'p' });
    c.paint('mouth', B([[62, 123], [80, 132], [96, 136], [113, 135], [129, 130], [113, 137.6], [96, 138.6], [80, 134.6]]), '8');
    for (let x = 72; x < 126; x += 8) c.stroke(Cv([[x, 124], [x, 133 + 5 * (1 - ((x - 96) / 33) ** 2)]]), '7', { on: 'mouth', line: false });
    c.paint('mouth', B([[66, 131], [97, 143], [124, 134], [121, 139], [97, 147], [75, 138]]), '7');
    c.paint('mouth', B([[108, 136], [128, 130], [124, 136], [116, 140]]), '6');
    c.paint('mouth', B([[62, 123], [68, 126], [70, 132], [64, 128]]), '=');
    c.paint('mouth', B([[129, 130], [124, 134], [122, 138], [126, 133]]), '=');
    flews();
  } else if (expr === 'laugh') {
    c.shape('mouth', B([[61, 122, 1], [80, 131], [96, 135], [113, 133], [131, 127, 1], [128, 140], [115, 150], [96, 153], [78, 148], [66, 136]]), '=', { line: '0', inner: 'p' });
    c.paint('mouth', B([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [131, 133], [113, 139], [96, 141], [80, 137], [61, 129]]), 'W');
    c.paint('mouth', B([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [113, 136], [96, 137.5], [80, 133.5]]), '8');
    for (let x = 69; x < 128; x += 7) c.stroke(Cv([[x, 122], [x, 140 - 9 * ((x - 96) / 33) ** 2]]), '7', { on: 'mouth', line: false });
    c.paint('mouth', B([[76, 146], [88, 141], [104, 140], [116, 143], [122, 147], [108, 152], [90, 152]]), 'P');
    c.paint('mouth', B([[88, 147], [104, 145], [113, 147], [106, 150], [92, 150]]), '^');
    c.paint('mouth', B([[90, 146], [100, 144.6], [96, 146.4]]), 'm');
    c.stroke(Cv([[101, 144], [101, 151]]), '?', { on: 'mouth', line: false });
    flews();
  } else {
    c.shape('mouth', E(95, 140, 7.5, 8.5), '=', { line: '0', inner: '0' });
    c.paint('mouth', E(95, 145, 5, 3), '?');
    c.paint('mouth', E(94, 146, 3, 1.4), 'P');
  }

  // ---- the silhouette: coloured lines per material, softer on the lit side ----
  if (fine) c.despeckle(null, ['W', '6', 'j', 'M']);
  const skin = ['m', 'M', '~', '^', 'P', '?', 'p', '='];
  c.silhouette({
    dark: '0', light: [-1, -1],
    pick: (nb, lit) => (skin.includes(nb) ? (lit ? 'p' : '=') : ['3', '4', '5', '6', '7', '8', 'W'].includes(nb) ? (lit ? '3' : '1') : ['y', 'o', 'Y'].includes(nb) ? '|' : ['a', 'A', 's', 'S'].includes(nb) ? 'K' : undefined),
  });
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
