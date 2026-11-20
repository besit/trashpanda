// M4.8 round 02 (variant b). The raccoon: the warm taupe coat and the swagger (the straight pump held across the
// chest at port arms), framed about 1.2x closer so the head is the hero; real raccoon hands wrap the barrel, tapered
// furry arms, a modelled mask. Accent sets per variant: (a) green knit scarf + cherry-red pump, (b) red bandana + teal
// pump, (c) cycling cap + chrome pump. Dog Fjord: iteration 04's head silhouette with a modelled face (fat flews over
// the teeth, hanging jowls, wrinkles as shadow shapes with lit ridges, a forehead dome, a chestnut patch with a fur
// edge, a bigger patch eye); per variant a different angle and suit: (a) three-quarter, navy, gold car tie;
// (b) chin up, charcoal pinstripe, red tie; (c) chin down, sunk into big shoulders, royal blue, bold flat shapes.
import { Canvas, blob, curve, ell, bar, tube, tufted, hash } from '../../../lib/draw2d.mjs';

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const V = 'b';
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== THE RACCOON ==============================
// Drawn in the cool fur keys 0..8 and moved to the warm taupe ramp at the end (fur parts only). Light from the upper
// left. The whole figure is drawn 1.2x about the head (design units stay those of round 01).
const RZ = 1.15, ROX = 132 - 134 * RZ, ROY = 78 - 80 * RZ;   // visible window in design units: x 19..221, y 12..193

const ACC = {
  a: { pump: ['=', 'r', '[', 'R', 'q'], neck: 'scarf', head: null },
  b: { pump: [':', 'f', 'F', ';', 'W'], neck: 'bandana', head: null },
  c: { pump: ['3', '5', '6', '8', 'W'], neck: 'ruff', head: 'cap' },
}[V];

/**
 * a floor pump on ONE straight axis: `foot` the centre of the foot plate, `ang` the axis direction toward the handle,
 * `L` its length. Every part is placed in axis coordinates (s along, o across), so nothing can bend; only the hose
 * curves. The gauge is a round dial facing the viewer. Returns { at } for placing hands on it.
 */
function pumpAxis(c, foot, ang, L, { ramp, fine = true, gaugeS = 30, hose = null } = {}) {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  let nx = -uy, ny = ux;
  if (-nx - ny < 0) { nx = -nx; ny = -ny; }   // n points to the lit side
  const sc = L / 180;
  const at = (s, o = 0) => [foot[0] + ux * s * sc + nx * o, foot[1] + uy * s * sc + ny * o];
  const strip = (s0, s1, o, w) => bar(at(s0, o), at(s1, o), w);
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  const glint = (s, o) => { const [x, y] = at(s, o); c.dot(x, y, 'W'); };
  if (hose) {
    const hp = curve(hose);
    c.stroke(hp, '1', { t: Math.max(2, Math.round(4.6 * c.S)), line: false });
    c.stroke(hp.map(([x, y]) => [x - 0.9, y - 0.6]), '3', { t: 1, line: false });
    const e = hp[hp.length - 1], d = hp[hp.length - 5], l = Math.hypot(e[0] - d[0], e[1] - d[1]) || 1, ex = (e[0] - d[0]) / l, ey = (e[1] - d[1]) / l;
    c.shape('chuck', bar(e, [e[0] + ex * 9, e[1] + ey * 9], 6), '5', { line: null });
    c.paint('chuck', bar([e[0] - ey * 1.6, e[1] + ex * 1.6], [e[0] + ex * 9 - ey * 1.6, e[1] + ey * 9 + ex * 1.6], 1.4), '7');
    c.paint('chuck', bar([e[0] + ey * 1.8, e[1] - ex * 1.8], [e[0] + ex * 9 + ey * 1.8, e[1] + ey * 9 - ex * 1.8], 1.4), '3');
    if (fine) c.dot(e[0] + ex * 6 - ey * 1.6, e[1] + ey * 6 + ex * 1.6, 'W');
  }
  const [deep, dark, base, lit, shine] = ramp;
  // the foot plate, square to the axis, with a tread peg at each end and a ferrule where the hose leaves
  c.shape('foot', box(0, 7, 44), '2', { line: null });
  c.paint('foot', strip(4.6, 7, 0, 46), '4');
  c.paint('foot', strip(0, 1.8, 0, 46), '1');
  for (const o of [-24, 24]) { c.shape('peg' + o, bar(at(-1, o), at(8, o), 5, true), '1', { line: null }); c.paint('peg' + o, bar(at(1, o + 1.2), at(7, o + 1.2), 1.2), '3'); }
  // the barrel: a cylinder lit along one side, a core shadow, a thin reflected light on the far edge
  c.shape('barrel', box(11, 140, 13), base, { line: null });
  c.paint('barrel', strip(11, 140, 4.3, 2.8), lit);
  c.paint('barrel', strip(11, 140, 3.4, 0.9), shine);
  c.paint('barrel', strip(11, 140, -2.8, 3.2), dark);
  c.paint('barrel', strip(11, 140, -5.0, 1.8), deep);
  c.paint('barrel', strip(11, 140, -6.2, 0.7), dark);
  if (fine) for (let s = 92; s < 122; s += 4) c.paint('barrel', box(s, s + 1.1, 13.4), dark);
  // the caps (chrome): a bright edge, a dark core, a reflected light, a specular glint
  for (const [s0, s1] of [[7, 14], [137, 144]]) {
    const n = 'cap' + s0;
    c.shape(n, box(s0, s1, 18), '6', { line: null });
    c.paint(n, strip(s0, s1, -6, 6), '4');
    c.paint(n, strip(s0, s1, -8.2, 1.4), '6');
    c.paint(n, strip(s0, s1, 5.2, 2.6), '8');
    if (fine) glint((s0 + s1) / 2, 6);
  }
  // the rod and the T-handle (square to the axis): ribbed grips, a chrome boss with a glint
  c.shape('rod', box(144, 176, 4.2), '6', { line: null });
  c.paint('rod', strip(144, 176, 1.1, 1.1), '8');
  c.paint('rod', strip(144, 176, -1.4, 1.2), '3');
  if (fine) glint(160, 1.2);
  const hc = at(178);
  const hA = (o, d = 0) => [hc[0] + nx * o + ux * d, hc[1] + ny * o + uy * d];
  c.shape('handle', bar(hA(-25), hA(25), 7, true), '3', { line: null });
  for (const s of [-1, 1]) {
    const g = 'grip' + s;
    c.shape(g, bar(hA(s * 8), hA(s * 25), 8.6, true), '2', { line: null });
    c.paint(g, bar(hA(s * 8, -2.6), hA(s * 26, -2.6), 1.8), '4');
    c.paint(g, bar(hA(s * 8, 2.8), hA(s * 26, 2.8), 2), '1');
    if (fine) for (let o = 11; o < 24; o += 3) c.paint(g, bar(hA(s * o, -3.6), hA(s * o, 3.6), 0.9), '1');
  }
  c.shape('boss', bar(at(173), at(183), 8.4), '6', { line: null });
  c.paint('boss', strip(173, 183, -2.6, 1.8), '3');
  c.paint('boss', strip(173, 183, 2.4, 1.6), '8');
  if (fine) glint(178, 2.6);
  // the gauge: a round dial facing the viewer, chrome bezel, ticks, a red needle
  const g = at(gaugeS);
  c.shape('gauge', ell(g[0], g[1], 9, 9), '4', { line: null });
  c.paint('gauge', ell(g[0] - 0.7, g[1] - 0.7, 8, 8), '7');
  c.paint('gauge', ell(g[0], g[1], 6.8, 6.8), 'W');
  c.paint('gauge', ell(g[0] + 1.6, g[1] + 1.8, 6, 6).filter((_, i) => i > 2 && i < 18).concat([[g[0] + 6, g[1] - 2], [g[0] - 2, g[1] + 6]]), '8');
  if (fine) { for (let a = -3.8; a <= 0.7; a += 0.75) c.dot(g[0] + Math.cos(a) * 5.2, g[1] + Math.sin(a) * 5.2, '3'); c.dot(g[0] - 5.6, g[1] - 3.4, 'W'); }
  c.stroke([g, [g[0] + 4, g[1] - 3]], 'R', { on: 'gauge', t: 1, line: false });
  c.dot(g[0], g[1], '1');
  return { at, nx, ny };
}

/**
 * a raccoon hand round the pump's tube (axis coords from pumpAxis): the back of the hand over the tube, the wrist on
 * side `side` (+1 the o+ side), four long fingers fanning from a knuckle row and curling over the far edge, the
 * thumb hooked round the near edge; knuckle lights, claws, a lighter palm pad showing at the thumb (`palm`)
 */
function hand(c, ax, name, s0, side, { palm = false, fine = true } = {}) {
  const A = (s, o) => ax.at(s0 + s, o * side);
  // the back of the hand (from the wrist across the tube to the knuckles)
  c.shape(name, blob([A(-6.5, 13), A(-8, 5), A(-7.6, -3.5), A(-3, -5.6), A(3, -5.8), A(7.4, -3.6), A(8, 5), A(6.5, 13)]), '2', { line: null, inner: '1' });
  c.paint(name, blob([A(-6, 12), A(-6.8, 5), A(-2, 3), A(3, 4), A(6, 11)]), '3');           // the lit back of the hand
  c.paint(name, blob([A(-7.4, -1.5), A(-3, -4.4), A(3, -4.6), A(7, -2), A(3, -2.6), A(-3, -2.6)]), '1');   // shadow before the knuckles
  // four long fingers, fanning a little, curling over the edge (their tips go behind the tube)
  const fs = [-5.4, -1.8, 1.8, 5.4], len = [6.4, 7.6, 7.2, 5.8];
  for (let i = 0; i < 4; i++) {
    const n = name + 'f' + i, s = fs[i], fan = s * 0.08;
    c.shape(n, tube([A(s, -3.8), A(s + fan, -7.5), A(s + fan * 1.6, -3.8 - len[i])], (t) => 3.6 - 0.8 * t), '2', { line: null, inner: '0' });
    c.paint(n, tube([A(s + fan * 1.2, -8.6), A(s + fan * 1.6, -3.8 - len[i])], 2.4), '1');            // turning away
    c.dot(...A(s - 0.5, -4.6), fine ? '5' : '4');                                                       // the knuckle light
    if (fine) c.dot(...A(s - 0.2, -5.6), '4');
    const tip = A(s + fan * 1.6, -3.8 - len[i] - 1.2);
    c.dot(tip[0], tip[1], '7');                                                                          // a claw
  }
  // the thumb hooked round the near edge
  c.shape(name + 't', tube([A(8.2, 9), A(10.2, 4), A(9.2, -0.5)], (t) => 4.2 - 1.2 * t), '2', { line: null, inner: '0' });
  c.paint(name + 't', tube([A(8.6, 8), A(10, 4.4)], 1.4), '3');
  c.dot(...A(9, -1.4), '7');
  if (palm) { c.paint(name, blob([A(4.6, 12.6), A(6.2, 8), A(7.8, 6), A(7.8, 11)]), '4'); c.paint(name, blob([A(5.6, 11.6), A(6.8, 8.4), A(7.4, 10.2)]), '5'); }
}

const HEADC = [186, 92];   // fur flows away from the nose
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k * RZ, k * ROX, k * ROY);
  const fine = k >= 0.9;
  const nl = { line: null };
  const fur = (on, a, b, dir, len, gap, seed, w = 1, shapes = null) => { if (fine) c.furBreak(on, a, b, { dir, len, gap, seed, w, shapes }); };

  // ---- the pump's geometry first (it decides where the hands go) ----
  const FOOT = [164, 164], ANG = Math.atan2(40 - 164, 50 - 164), PL = Math.hypot(114, 124);
  const sc = PL / 180, uX = Math.cos(ANG), uY = Math.sin(ANG);
  let nX = -uY, nY = uX; if (-nX - nY < 0) { nX = -nX; nY = -nY; }
  const AX = { at: (s, o = 0) => [FOOT[0] + uX * s * sc + nX * o, FOOT[1] + uY * s * sc + nY * o] };
  const HF = 22, HN = 56;                       // the far hand low on the barrel, the near hand higher
  const hF = AX.at(HF), hN = AX.at(HN);

  // ---- the tail curling up beside the body at the lower left (inside the frame) ----
  const tailC = [[104, 172], [80, 174], [62, 166], [52, 150], [54, 132]];
  const tailW = (t) => 15 + 9 * Math.sin(Math.PI * Math.min(1, t * 1.15)) - 6 * t;
  c.shape('tail', tufted(tube(tailC, tailW, undefined, 12), { amp: 3, period: 6.5, flow: (x, y) => norm(x - 90, y - 150), lean: 0.5, seed: 4 }), '5', nl);
  {
    const cc = curve(tailC, 12), n = cc.length;
    for (const f of [0.3, 0.55, 0.78]) {
      const i = Math.round(f * (n - 1)), a = cc[Math.max(0, i - 1)], b = cc[Math.min(n - 1, i + 1)];
      const [dx, dy] = norm(b[0] - a[0], b[1] - a[1]), nx2 = -dy, ny2 = dx, p = cc[i], u = 3.4, bow = 2.6;
      // a ring that wraps the cylinder: its edges bow along the tail
      const ring = blob([[p[0] - nx2 * 16 - dx * u, p[1] - ny2 * 16 - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + nx2 * 16 - dx * u, p[1] + ny2 * 16 - dy * u],
        [p[0] + nx2 * 16 + dx * u, p[1] + ny2 * 16 + dy * u], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - nx2 * 16 + dx * u, p[1] - ny2 * 16 + dy * u]], 6);
      c.paint('tail', ring, '1');
    }
    const tipI = n - 1, tp = cc[tipI];
    c.paint('tail', ell(tp[0], tp[1] - 2, 9, 9), '1');
  }
  c.rim('tail', -1.6, -1.2, '7', { only: ['5'] });
  c.rim('tail', -1.6, -1.2, '3', { only: ['1'] });
  c.rim('tail', 2, 1.6, '4', { only: ['5'] });
  fur('tail', '1', ['5', '7', '4'], (x, y) => norm(x - 90, y - 150), 2.8, 2.6, 48, 2);
  fur('tail', '5', '1', (x, y) => norm(90 - x, 150 - y), 2.4, 2.8, 49, 2);

  // ---- the torso: a full chest with a modelled ruff; the bottom finishes in a rounded, tufted belly ----
  const bodyPts = tufted(blob([[104, 108], [90, 118], [84, 134], [83, 152], [88, 168], [102, 178], [126, 182], [150, 178], [164, 168], [170, 150], [168, 130], [158, 116], [144, 108]]),
    { amp: 3, period: 7.5, where: (x, y) => (y > 128 ? 1 : 0), flow: [0, 1], lean: 0.9, seed: 2 });
  c.shape('body', bodyPts, '5', nl);
  c.paint('body', blob([[152, 112], [172, 126], [176, 156], [166, 178], [150, 186], [154, 160], [158, 138]]), '4');
  c.paint('body', blob([[86, 168], [104, 178], [130, 182], [154, 176], [150, 190], [100, 190]]), '4');
  c.paint('body', blob([[162, 140], [176, 146], [170, 178], [156, 186], [162, 166]]), '3');
  // the chest ruff: a pale bib whose fur clumps overlap downward in three tiers
  for (const [y0, w0, col, sd] of [[116, 22, '6', 51], [126, 18, '7', 52], [138, 13, '8', 53]]) {
    c.paint('body', tufted(blob([[128 - w0, y0], [128 + w0, y0], [128 + w0 * 0.9, y0 + 18], [128, y0 + 30], [128 - w0 * 0.9, y0 + 18]]), { amp: 3.6, period: 5.5, where: (x, y) => (y > y0 + 8 ? 1 : 0), flow: [0, 1], lean: 0.6, seed: sd }), col);
  }
  c.paint('body', blob([[100, 110], [128, 116], [156, 110], [150, 122], [128, 128], [106, 122]]), '4');   // the head's shadow across the chest
  fur('body', '6', '5', [0, 1], 3.2, 2.8, 40, 2); fur('body', '7', '6', [0, 1], 3, 2.6, 41, 2); fur('body', '8', '7', [0, 1], 2.6, 2.6, 42);
  fur('body', '5', '4', [0.3, 1], 3.2, 2.8, 43, 2); fur('body', '4', '3', [0.3, 1], 3, 3, 44); fur('body', '4', '6', [0, -1], 2.4, 3.2, 45);

  // ---- arms: tapered, furry, with a contact shadow where each crosses the chest ----
  const arm = (name, pts, w0, w1, flow, seed) => {
    const path = tube(pts, (t) => w0 + (w1 - w0) * t * t, undefined, 12);
    c.paint('body', tube(pts.map(([x, y]) => [x + 2.4, y + 3.4]), (t) => w0 + 2 + (w1 - w0) * t * t, undefined, 12), '3');   // contact shadow
    c.shape(name, tufted(path, { amp: 2.6, period: 6, flow, lean: 0.7, seed }), '4', { line: null, inner: '1' });
    c.rim(name, -2.6, -2.6, '5', { only: ['4'] });
    c.rim(name, -1.2, -1.2, '6', { only: ['5'] });
    c.rim(name, 3, 3, '3', { only: ['4', '5'] });
    c.rim(name, 1.4, 1.4, '2', { only: ['3'] });
    fur(name, '5', '4', flow, 3.2, 3.2, seed + 1, 2); fur(name, '4', '3', flow, 3, 3.4, seed + 2, 2);
  };
  // far arm: from the far shoulder down to a pointed elbow, the forearm back in to the low hand
  arm('armR', [[160, 122], [176, 146], [hF[0] + 6, hF[1] + 3]], 20, 11, [0.4, 1], 60);
  // near arm: down from the near shoulder to the elbow, the forearm rising across the chest to the upper hand
  arm('armL', [[98, 122], [92, 154], [hN[0] - 5, hN[1] + 5]], 21, 11, [-0.3, 1], 70);

  // ---- the neckwear (variant) ----
  if (ACC.neck === 'scarf') {
    // the loose end flung back over the far shoulder, hanging down behind
    c.shape('scarfEnd', blob([[160, 112], [174, 116], [184, 132], [190, 150], [182, 156], [174, 140], [164, 126]]), 'E', { line: null, inner: 'e' });
    c.paint('scarfEnd', blob([[170, 118], [174, 116], [184, 132], [190, 150], [186, 153], [178, 134]]), 'l');
    c.paint('scarfEnd', blob([[160, 116], [166, 122], [176, 142], [182, 156], [178, 154], [168, 136]]), 'e');
    if (fine) for (let t = 0.15; t < 0.95; t += 0.14) { const p = lerp([166, 116], [186, 152], t); c.stroke([[p[0] - 6, p[1] + 3], [p[0] + 5, p[1] - 3]], 'e', { on: 'scarfEnd', line: false }); }
    for (const [x, y] of [[180, 155], [183, 156], [186, 156], [189, 154]]) c.stroke([[x, y], [x - 0.5, y + 5 + (x % 2)]], x % 2 ? 'l' : 'E', { line: false });
    c.shape('scarf', blob([[86, 108], [112, 115], [140, 115], [168, 106], [174, 114], [170, 126], [146, 133], [120, 135], [98, 131], [84, 120]]), 'l', { line: null, inner: 'e' });
    c.paint('scarf', blob([[88, 110], [140, 117], [170, 108], [150, 120], [120, 122], [92, 118]]), 'E');
    c.paint('scarf', blob([[96, 125], [120, 129], [146, 127], [170, 120], [170, 126], [146, 133], [120, 135], [98, 131]]), 'E');
    c.paint('scarf', blob([[132, 127], [152, 124], [170, 118], [170, 126], [146, 133], [130, 134]]), 'e');
    c.paint('scarf', blob([[88, 110], [128, 116], [170, 107], [128, 119], [92, 114]]), 'e');   // the chin's shadow on the knit
    if (fine) for (const [y0, ph] of [[121, 0], [127, 2.5]]) for (let x = 90 + ph; x < 168; x += 5) {
      const yy = y0 + (x - 128) * (x - 128) * -0.0007 + (x > 150 ? -2 : 0);
      c.stroke([[x, yy], [x + 2.5, yy + 2], [x + 5, yy]], x < 128 ? 'L' : x < 150 ? 'l' : 'E', { on: 'scarf', line: false });
    }
  } else if (ACC.neck === 'bandana') {
    c.shape('band', blob([[90, 112], [126, 116], [164, 110], [168, 120], [156, 130], [146, 142], [136, 158, 1], [124, 142], [108, 130], [92, 124]]), 'R', { line: null, inner: 'r' });
    c.paint('band', blob([[138, 118], [166, 112], [168, 120], [156, 130], [146, 142], [136, 158, 1], [140, 136]]), '[');
    c.paint('band', blob([[146, 132], [156, 128], [146, 142], [136, 158, 1], [142, 140]]), 'r');
    c.paint('band', blob([[90, 112], [126, 117], [164, 111], [140, 121], [118, 122], [96, 119]]), 'r');
    c.paint('band', blob([[100, 123], [116, 128], [128, 134], [120, 133], [104, 128]]), 'q');
    for (const fl of [[[108, 126], [122, 136], [132, 148]], [[122, 124], [134, 134], [138, 146]], [[140, 124], [144, 134]]]) c.stroke(curve(fl), '[', { on: 'band', line: false, t: Math.max(1, Math.round(k)) });
    for (const fl of [[[110, 125], [124, 135], [133, 146]], [[124, 123], [135, 132]]]) c.stroke(curve(fl.map(([x, y]) => [x - 1.4, y + 0.6])), 'q', { on: 'band', line: false });
    c.shape('knotT1', blob([[92, 122, 1], [80, 138], [84, 141], [90, 136], [98, 124, 1]]), 'R', { line: null, inner: 'r' });
    c.paint('knotT1', blob([[95, 125], [84, 141], [88, 139], [98, 125]]), '[');
    c.paint('knotT1', blob([[91, 124], [82, 136], [84, 136], [93, 124]]), 'q');
    c.shape('knotT2', blob([[96, 124, 1], [96, 142], [101, 144], [103, 128, 1]]), '[', { line: null, inner: 'r' });
    c.paint('knotT2', blob([[96, 126], [96, 140], [98, 141], [98, 126]]), 'R');
    c.shape('knot', ell(95, 120, 6.4, 5.4), 'R', { line: null, inner: 'r' });
    c.paint('knot', ell(93.6, 118.4, 3.6, 2.4), 'q');
    c.paint('knot', ell(97, 123, 4.4, 2), '[');
  }

  // ---- ears (behind the head): fur outside, dark inside with a pale fringe ----
  const earL = blob([[96, 56], [98, 38], [103, 26], [110, 22], [116, 30], [124, 46]]);
  c.shape('earL', tufted(earL, { amp: 2.2, period: 5.5, where: (x, y) => (x < 106 ? 1 : 0), flow: [-1, 0], seed: 8 }), '5', nl);
  c.paint('earL', blob([[102, 52], [104, 38], [108, 30], [112, 31], [119, 46]]), '1');
  c.paint('earL', blob([[106, 50], [108.5, 39], [111.5, 35], [117, 47]]), "'");
  c.paint('earL', blob([[109, 46], [111, 39], [114, 46]]), '-');
  c.rim('earL', -1.8, -1.2, '7', { only: ['5'] });
  if (fine) { c.furBreak('earL', '5', ['1', '0'], { dir: (x, y) => norm(x - 112, y - 54).map((v) => -v), len: 4, gap: 2.4, seed: 9, w: 2 }); c.furStrokes('earL', blob([[103, 50], [106, 36], [112, 33], [118, 46]]), '6', { only: ['1', '0'], dir: (x, y) => norm(x - 112, y - 56), len: 4, gap: 4, seed: 19, prob: 0.8 }); }
  const earR = blob([[148, 44], [156, 30], [163, 22], [170, 23], [174, 34], [176, 52]]);
  c.shape('earR', tufted(earR, { amp: 2.2, period: 5.5, where: (x, y) => (x > 168 ? 1 : 0), flow: [1, 0], seed: 10 }), '4', nl);
  c.paint('earR', blob([[154, 44], [160, 33], [165, 28], [169, 30], [171, 46]]), '1');
  c.paint('earR', blob([[158, 43], [163.5, 33.5], [167, 32.5], [168.5, 45]]), "'");
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
  c.paint('head', tufted(blob([[134, 38], [148, 39], [152, 52], [150, 66], [143, 71], [137, 56]]), { amp: 2, period: 4.5, where: () => 1, flow: (x, y) => (y < 54 ? [0, -1] : [0, 1]), lean: 0.6, seed: 16 }), '4');
  c.paint('head', tufted(blob([[137, 40], [146, 41], [149, 53], [146, 64], [142, 66], [139, 54]]), { amp: 1.6, period: 4, where: () => 1, flow: (x, y) => (y < 54 ? [0, -1] : [0, 1]), lean: 0.6, seed: 17 }), '3');
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
  c.paint('head', ell(122, 77.5, 13.5, 10.5), '0');
  c.paint('head', ell(161, 75.5, 10.5, 8.5), '0');
  c.paint('head', blob([[136, 72], [146, 68], [152, 72], [148, 82], [140, 84]]), '0');   // the inner corners meet over the bridge
  // the mask has form too: a soft sheen over the brow ridge and round the eye sockets, deepest at its lower outer edge
  c.paint('head', blob([[88, 74], [98, 67], [112, 64.5], [126, 65], [136, 69], [140, 74], [132, 72], [120, 69], [106, 69], [94, 73]]), '2');
  c.paint('head', blob([[100, 69], [112, 66.5], [124, 67], [116, 68.5], [106, 69.5]]), '3');
  c.paint('head', blob([[150, 66], [160, 63], [172, 63], [180, 67], [172, 66.5], [160, 66.5]]), '2');
  c.paint('head', blob([[104, 88], [116, 89.6], [130, 87], [136, 88], [126, 93], [110, 93]]), '2');   // the cheekbone under the near eye
  c.paint('head', blob([[112, 90], [122, 90.4], [128, 89.4], [120, 91.6]]), '3');
  c.paint('head', blob([[150, 84.6], [160, 86], [172, 83], [166, 88], [154, 88]]), '2');
  c.paint('head', blob([[80, 82], [88, 86], [100, 90], [114, 92], [128, 90], [120, 96], [104, 97], [88, 98], [78, 92]]), '0');   // its lower edge in deep shadow
  c.paint('head', blob([[80, 80], [86, 72], [92, 70], [88, 80], [86, 90], [80, 90]]), '0');
  // the snout: a forward block, white, its far side and underside in shade
  c.shape('snout', blob([[146, 84], [156, 80], [170, 80], [182, 84], [190, 90], [192, 97], [186, 103], [174, 106], [160, 106], [150, 101]]), '8', { line: null, inner: null });
  c.paint('snout', blob([[148, 96], [162, 100], [178, 100], [192, 95], [190, 104], [172, 108], [154, 106]]), '7');
  c.paint('snout', blob([[150, 101], [164, 104], [180, 103], [188, 101], [184, 106], [168, 108], [154, 106]]), '6');
  c.paint('snout', blob([[154, 86], [166, 82], [178, 84], [184, 88], [172, 88], [160, 90]]), 'W');
  c.paint('snout', blob([[146, 84], [154, 80.5], [164, 80], [156, 84], [149, 90]]), '6');   // the grey bridge coming down from the stripe
  c.paint('snout', blob([[146, 88], [150, 84], [154, 86], [150, 94]]), '5');
  c.stroke(curve([[156, 82.6], [168, 82], [180, 85]]), 'W', { on: 'snout', line: false });
  // the muzzle under the mask, white
  c.paint('head', blob([[128, 92], [140, 86], [150, 90], [152, 104], [146, 112], [134, 114], [124, 108]]), '8');
  c.paint('head', blob([[136, 108], [150, 106], [162, 110], [150, 116], [138, 116]]), '7');

  // ---- fur: the tone boundaries interlock in short strokes along the flow, a few strands on the lit crown ----
  if (fine) {
    const fur = (on, a, b, dir, len, gap, seed, w = 1, shapes = null) => c.furBreak(on, a, b, { dir, len, gap, seed, w, shapes });
    fur(['head', 'snout'], '6', '5', headFlow, 3.6, 2.6, 21, 2);
    fur('head', '2', '1', headFlow, 2.4, 2.4, 121, 2);
    fur('head', '1', '2', (x, y) => headFlow(x, y).map((v) => -v), 2, 2.8, 122);
    fur('head', '0', '1', headFlow, 2, 2.6, 123);
    fur(['head', 'snout'], 'W', '8', headFlow, 2.4, 2.4, 124);
    fur('head', '3', '5', [0.1, 1], 3, 2.4, 125, 2);
    c.furStrokes(['head', 'earL', 'earR'], blob([[92, 62], [100, 44], [116, 36], [140, 34], [162, 40], [176, 52], [168, 50], [150, 42], [130, 40], [110, 46], [98, 60]]), '8', { only: ['7', '6'], dir: headFlow, len: 2.6, gap: 3.4, seed: 126 });
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
  }

  if (ACC.head === 'cap') {
    const cap = blob([[108, 49], [110, 39], [118, 31], [130, 26], [145, 25.5], [158, 29], [167, 37], [172, 48], [160, 47], [140, 46], [122, 47]]);
    c.shape('cap', cap, '8', nl);
    c.paint('cap', blob([[108, 49], [110, 39], [118, 31], [128, 27], [122, 36], [118, 48]]), 'W');
    c.paint('cap', blob([[152, 28], [162, 33], [169, 41], [172, 48], [160, 47], [158, 38]]), '6');
    c.paint('cap', blob([[160, 34], [167, 38], [171, 46], [166, 47], [164, 40]]), '5');
    c.paint('cap', blob([[131, 47], [131, 37], [136, 28.5], [142, 26.5], [139, 36], [138, 46.5]]), 'F');
    c.paint('cap', blob([[136, 46.5], [136.5, 37], [140.5, 28], [142.5, 27], [140.4, 37], [139.6, 46.5]]), 'f');
    c.paint('cap', blob([[141, 46.5], [143, 37], [148, 28], [152, 29], [147, 37.5], [146, 46.5]]), 'R');
    c.paint('cap', blob([[145, 46.5], [147, 38], [151, 29], [152.5, 29.6], [148.6, 38], [148, 46.5]]), '[');
    if (fine) for (const sm of [[[121, 30], [116, 40], [114, 48]], [[157, 30], [162, 40], [164, 47]]]) c.stroke(curve(sm), '7', { on: 'cap', line: false });
    c.paint('cap', blob([[108, 46], [140, 44.5], [172, 46], [172, 50], [140, 48.6], [108, 50]]), 'r');   // the band
    c.paint('cap', blob([[108, 46], [124, 45.2], [124, 47], [108, 48]]), '[');
    c.dot(142, 26, '6');
    // the brim, flipped up over the forehead's front: lit top face, body, shaded underside, a dark edge
    c.shape('brim', blob([[160, 47], [164, 40], [172, 34], [182, 31], [188, 33], [186, 38], [178, 44], [170, 50]]), 'R', nl);
    c.paint('brim', blob([[164, 42], [172, 35.5], [182, 32], [187, 33.4], [180, 36], [170, 41]]), 'q');
    c.paint('brim', blob([[166, 47], [176, 42], [184, 37.6], [186, 38], [178, 44], [170, 50]]), '[');
    c.paint('brim', blob([[170, 48.4], [178, 43.6], [185, 39], [178, 45], [171, 50]]), 'r');
    c.paint('head', blob([[110, 49], [140, 48], [170, 50], [166, 55], [140, 52.6], [112, 53]]), '3');   // its shadow on the brow
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


  // ---- the pump across the chest (in front of the cheek ruff, clear of the face), then the hands round it ----
  pumpAxis(c, FOOT, ANG, PL, { ramp: ACC.pump, fine, gaugeS: 39 / sc, hose: [[176, 166], [186, 176], [198, 173], [201, 162], [198, 152]] });
  hand(c, AX, 'pawR', HF, -1, { palm: true, fine });
  hand(c, AX, 'pawL', HN, 1, { fine });
  // fur at the wrists: the arm's fur spills over the back of the hand
  for (const [a, p] of [['armR', 'pawR'], ['armL', 'pawL']]) {
    if (!fine) continue;
    const flow = a === 'armR' ? [-1, 0.1] : [0.6, -0.6];
    c.furBreak([a, p], '4', ['2', '3'], { dir: flow, len: 3.2, gap: 2, seed: 80, w: 2 });
    c.furBreak([a, p], '5', ['2', '3'], { dir: flow, len: 2.6, gap: 2.4, seed: 81 });
  }



  // ---- the warm coat: every fur tone moves to the taupe ramp (the pump, neckwear and eyes keep theirs) ----
  {
    const map = { 0: '@', 1: '#', 2: '$', 3: 'I', 4: '%', 5: '&', 6: 'J', 7: '*', 8: '+' };
    const furParts = ['tail', 'body', 'armL', 'armR', 'earL', 'earR', 'head', 'snout', 'nose', 'eyeN', 'eyeF',
      ...['pawL', 'pawR'].flatMap((p) => [p, p + 't', p + 'f0', p + 'f1', p + 'f2', p + 'f3'])].map((n) => c.id(n));
    for (let i = 0; i < c.img.px.length; i++) if (furParts.includes(c.part[i]) && map[c.img.px[i]]) c.img.px[i] = map[c.img.px[i]];
  }
  c.despeckle(null, ['W', '`', '*', '}', '7', '+']);
  const metal = ['1', '2', '3', '4', '5', '6', '7', '8', 'W'];
  c.silhouette({
    dark: '@', light: [-1, -1],
    pick: (nb, lit) => (ACC.pump.includes(nb) ? (V === 'c' ? '0' : ACC.pump[0]) : ['R', 'q', '[', 'r'].includes(nb) ? 'r' : ['l', 'L', 'E', 'e'].includes(nb) ? 'e' : metal.includes(nb) ? '0' : lit ? '$' : undefined),
  });
  // whiskers: fine light lines across the dark cheek and just past the outline
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
          if (cur !== null && !['@', '#', '$', 'I'].includes(cur)) continue;
          c.img.set(X, Y, cur === null ? '+' : 'J');
        }
      }
    }
  }
  return c.img;
}

// ============================== DOG FJORD ==============================
// A cartoon bulldog (never a real person's likeness): a big pink jowly head on a suited body, grey combed hair,
// folded ears, a chestnut heart patch round the far eye, thick brows, a big black nose, a smug toothy grin.
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
// per variant: the face's angle (offsets for the eyes, the nose and the muzzle/mouth), the suit, the rendering density
const DOGV = {
  a: { e: [0, 0], n: [0, 0], m: [0, 0], suit: 'navy', density: 2 },
  b: { e: [2, -6], n: [2, -7], m: [2, -8], suit: 'charcoal', density: 3 },
  c: { e: [-2, 4], n: [-2, 4], m: [-2, 3], suit: 'royal', density: 1 },
}[V];

function dogSuit(c, kind, small, px) {
  const nl = { line: null };
  const S = {
    navy: { pts: [[44, 214, 1], [46, 186], [54, 170], [76, 160], [96, 156], [130, 156], [150, 160], [170, 170], [176, 186], [178, 214, 1]], col: ['u', '_', ',', 'U'], tie: 'gold' },
    charcoal: { pts: [[54, 214, 1], [56, 188], [66, 170], [90, 157], [130, 157], [152, 168], [164, 188], [168, 214, 1]], col: ['A', 'S', 'a', 's'], tie: 'red', stripes: true },
    royal: { pts: [[38, 214, 1], [38, 180], [44, 160], [60, 146], [84, 150], [130, 150], [154, 144], [172, 152], [180, 174], [182, 214, 1]], col: ['U', '_', 'u', 'U'], tie: 'stripe' },
  }[kind];
  const [base, lit, dark, mid] = S.col;
  c.shape('suit', B(S.pts), base, nl);
  c.paint('suit', B([[30, 168], [64, 156], [86, 160], [70, 178], [60, 214], [30, 214]]), mid);
  c.paint('suit', B([[40, 178], [56, 164], [70, 162], [60, 178], [54, 200], [40, 200]]), lit);
  c.paint('suit', B([[124, 150], [164, 158], [184, 186], [186, 214], [138, 214], [136, 186]]), dark);
  if (S.stripes && !small) for (let x = 54; x < 172; x += 4.5) c.stroke(Cv([[x, 160], [x + 1.5, 214]]), 's', { on: 'suit', line: false, t: 1 });
  c.shape('shirt', B([[93, 154, 1], [119, 154, 1], [107, 204, 1], [105, 204, 1]]), 'W', nl);
  c.paint('shirt', B([[107, 154], [119, 154], [107, 204]]), '7');
  c.paint('shirt', B([[93, 154], [100, 154], [106, 180], [105, 204]]), '8');
  c.shape('lapelL', B([[90, 156, 1], [105, 202, 1], [95, 188, 1], [80, 176, 1], [70, 166, 1]]), mid, { line: null, inner: dark });
  c.paint('lapelL', B([[90, 156, 1], [96, 172, 1], [80, 168, 1], [72, 166, 1]]), lit);
  c.shape('lapelR', B([[122, 156, 1], [142, 164, 1], [134, 180, 1], [118, 194, 1], [107, 202, 1]]), base, { line: null, inner: dark });
  c.paint('lapelR', B([[132, 170, 1], [142, 164, 1], [134, 180, 1], [118, 194, 1]]), dark);
  const tieC = { gold: ['y', 'o', 'Y', '|'], red: ['R', '[', 'q', 'r'], stripe: ['R', '[', 'q', 'r'] }[S.tie];
  c.shape('tie', B([[102, 166, 1], [110, 166, 1], [109, 176, 1], [114, 206, 1], [106, 213, 1], [98, 206, 1], [103, 176, 1]]), tieC[0], { line: null, inner: tieC[3] });
  c.paint('tie', B([[107, 166], [110, 166], [109, 176], [114, 206], [108, 210]]), tieC[1]);
  c.paint('tie', B([[102, 168], [104, 168], [101, 200], [99, 204]]), tieC[2]);
  if (!small && S.tie === 'gold') for (const [x, y] of [[104, 180], [107, 192], [103, 202]]) { c.paint('tie', B([[x - 2.6, y + 1], [x - 2, y - 0.6], [x - 0.6, y - 1.6], [x + 1.4, y - 1.6], [x + 2.6, y - 0.4], [x + 2.6, y + 1]]), 'R'); c.dot(...T([x - 1.4, y + 1.4]), 'K'); c.dot(...T([x + 1.6, y + 1.4]), 'K'); }
  if (!small && S.tie === 'red') for (let y = 176; y < 210; y += 6) c.stroke(Cv([[99, y + 3], [113, y - 3]]), 'r', { on: 'tie', t: px(1.1), line: false });
  if (!small && S.tie === 'stripe') for (let y = 172; y < 212; y += 7) c.stroke(Cv([[98, y + 3.5], [114, y - 3]]), 'W', { on: 'tie', t: px(1.4), line: false });
  c.shape('knot', B([[100, 159, 1], [112, 159, 1], [111, 167, 1], [101, 167, 1]]), tieC[0], { line: null, inner: tieC[3] });
  c.paint('knot', B([[107, 159], [112, 159], [111, 167], [107, 167]]), tieC[1]);
  c.paint('knot', B([[101, 159], [105, 159], [104, 162], [101, 162]]), tieC[2]);
  if (!small) {
    if (kind === 'navy') { c.shape('pin', B([[77, 176, 1], [83, 176, 1], [83, 180, 1], [77, 180, 1]]), 'W', nl); c.paint('pin', B([[77, 176], [78.6, 176], [78.6, 180], [77, 180]]), 'R'); c.paint('pin', B([[81.4, 176], [83, 176], [83, 180], [81.4, 180]]), 'R'); c.dot(...T([80, 178]), 'R'); }
    if (kind === 'charcoal') { c.shape('square', B([[138, 182, 1], [141, 176, 1], [144, 179, 1], [148, 175, 1], [151, 182, 1]]), 'W', nl); c.paint('square', B([[145, 178, 1], [148, 175, 1], [151, 182, 1], [146, 182, 1]]), '7'); }
    if (kind === 'royal') { c.shape('pin', E(78, 172, 2.4, 2.4), 'y', nl); c.dot(...T([77.4, 171.3]), 'Y'); }
  }
}

export function dogPortrait2d(expr = 'grin', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const fine = k >= 0.9, small = k < 0.8, D = DOGV.density;
  const px = (u, min = 1) => Math.max(min, Math.round(u * k * DSC)); // a stroke `u` design units thick, in pixels
  const nl = { line: null };
  const ofs = (o) => (pts) => pts.map(([x, y, s]) => (s ? [x + o[0], y + o[1], 1] : [x + o[0], y + o[1]]));
  const oe = ofs(DOGV.e), on = ofs(DOGV.n), om = ofs(DOGV.m);
  const [ex0, ey0] = DOGV.e, [mx0, my0] = DOGV.m, [nx0, ny0] = DOGV.n;

  dogSuit(c, DOGV.suit, small, px);

  // ---- the head (iteration 04's outline): planned volumes lit from the upper left ----
  c.shape('head', B(HEAD04), 'm', nl);
  // the turning planes: a shadow side on the right, a core shadow, the deepest tone under the jowls
  c.paint('head', B([[150, 52], [200, 40], [200, 190], [40, 190], [44, 150], [60, 152], [84, 157], [110, 158], [134, 154], [148, 144], [156, 128], [158, 104], [154, 80]]), '^');
  c.paint('head', B([[160, 72], [200, 60], [200, 190], [40, 190], [44, 156], [64, 158], [90, 161], [116, 162], [140, 158], [156, 146], [164, 126], [165, 100]]), 'P');
  c.paint('head', B([[168, 112], [200, 100], [200, 190], [40, 190], [56, 161], [80, 164], [110, 166], [140, 163], [158, 152], [167, 134]]), '?');
  // the forehead dome: a broad warm light on the upper left, a hot spot, falling off to the right
  c.paint('head', B([[60, 84], [66, 70], [76, 58], [92, 50], [112, 50], [126, 56], [116, 62], [100, 64], [86, 72], [74, 88], [66, 104], [60, 120], [54, 128], [50, 116], [53, 98]]), '~');
  if (!small) c.paint('head', B([[78, 62], [88, 55], [102, 54], [96, 60], [86, 64]]), 'M');
  c.paint('head', B([[54, 106], [58, 98], [63, 104], [61, 116], [56, 122]]), 'M');   // the near cheek's light
  // ---- the jowls: heavy lobes hanging over the collar, lit on top, a dark crease under, a bounce light at the bottom ----
  c.paint('head', B(om([[48, 126], [56, 120], [64, 128], [66, 142], [76, 152], [90, 158], [72, 162], [56, 156], [48, 144]])), 'm');
  c.paint('head', B(om([[49, 124], [56, 119], [62, 126], [60, 134], [52, 136]])), '~');
  c.paint('head', B(om([[52, 146], [62, 154], [78, 159], [94, 162], [74, 165], [58, 160]])), 'P');
  c.paint('head', B(om([[56, 152], [66, 158], [82, 162], [70, 163], [60, 160]])), '?');
  c.paint('head', B(om([[134, 118], [144, 112], [154, 120], [158, 134], [152, 148], [140, 154], [138, 136]])), '^');
  c.paint('head', B(om([[137, 120], [144, 115], [150, 124], [148, 134], [142, 130]])), 'm');
  c.paint('head', B(om([[138, 157], [150, 152], [159, 143], [160, 148], [152, 156.6], [141, 160]])), 'p');
  // reflected light along the bottom of the jowls and the chin
  c.paint('head', B([[56, 154], [68, 160], [90, 163.4], [120, 164], [146, 161], [160, 152], [158, 156], [146, 163.6], [120, 166], [90, 165.6], [66, 162], [54, 156]]), '^');
  // the chin: a rounded mass under the mouth, its top lit, a crease under the lower lip
  const chinY = (expr === 'laugh' ? 158 : 154) + my0;
  c.paint('head', B([[90 + mx0, chinY - 2], [110 + mx0, chinY], [130 + mx0, chinY - 2], [126 + mx0, chinY + 5], [110 + mx0, chinY + 7], [94 + mx0, chinY + 5]]), '^');
  if (D >= 3) {   // chin up: a second chin shows under the first
    c.paint('head', B([[86 + mx0, chinY + 6], [110 + mx0, chinY + 9], [134 + mx0, chinY + 6], [130 + mx0, chinY + 10], [110 + mx0, chinY + 12], [90 + mx0, chinY + 10]]), 'P');
    c.paint('head', B([[92 + mx0, chinY + 4.6], [110 + mx0, chinY + 7], [128 + mx0, chinY + 4.6], [110 + mx0, chinY + 8.6]]), '~');
  }

  // ---- wrinkles as shadow shapes with a lit ridge above (never thin lines); dropped at the dialogue size ----
  // a fold: a crescent of shadow, thickest in the middle, tapering to points; its ridge a thinner light crescent above
  const fold = (cx, cy, w, h, sh, lt, bend = 2.4) => {
    c.paint('head', B([[cx - w / 2, cy], [cx - w / 4, cy - bend * 0.8], [cx, cy - bend], [cx + w / 4, cy - bend * 0.8], [cx + w / 2, cy], [cx + w / 4, cy - bend * 0.8 + h], [cx, cy - bend + h * 1.2], [cx - w / 4, cy - bend * 0.8 + h]]), sh);
    if (lt) c.paint('head', B([[cx - w * 0.42, cy - 0.8], [cx, cy - bend - 0.9], [cx + w * 0.42, cy - 0.8], [cx, cy - bend - 0.1]]), lt);
  };
  if (!small) {
    const fy = 68 + ey0;
    fold(98 + ex0, fy, 26, 1.8, 'P', 'M');
    fold(100 + ex0, fy + 6, 30, 1.6, '^', '~');
    if (D >= 3) fold(96 + ex0, fy - 5.5, 18, 1.3, '^', 'M', 1.8);
    if (D >= 2) { fold(80 + ex0, 100 + ey0, 12, 1.2, '^', '~', -1.4); fold(120 + ex0, 102 + ey0, 12, 1.2, 'P', null, -1.4); }   // the bags under the eyes
  }
  // the nasolabial folds: deep tapered shadow wedges from the nose wings down round the muzzle, a lit bulge outside
  const LCR = om([[67, 115], [60, 126], [61, 139], [68, 150]]), RCR = om([[130, 114], [137, 125], [136, 138], [129, 150]]);
  const wedge = (pts, w, col) => c.paint('head', tube(pts.map(T), (t) => (w * DSC) * Math.sin(Math.PI * (0.15 + 0.85 * t)), undefined, 10), col);
  if (!small) wedge(LCR.map(([x, y]) => [x - 2.6, y]), 2.6, '~');
  wedge(LCR, small ? 3.2 : 2.6, 'P');
  if (!small) wedge(LCR.map(([x, y]) => [x + 0.4, y]), 1.2, '?');
  wedge(RCR.map(([x, y]) => [x + 1.4, y]), small ? 3.4 : 3, '?');
  if (!small) { wedge(RCR, 1.3, '='); wedge(RCR.map(([x, y]) => [x - 2.4, y]), 1.6, 'm'); }

  // ---- the chestnut heart patch round the far eye: a 4-tone ramp, a fur edge into the pink, a socket shadow ----
  const PATCH = oe([[104, 89], [104, 82], [110, 77.5], [117, 78.5], [124, 77], [131, 80.5], [132, 89], [127, 99], [118, 109, 1], [109, 99]]);
  c.shape('patch', tufted(B(PATCH), { amp: small ? 0.01 : 2.2, period: 3.6, where: (x, y) => (y < T([0, 102 + ey0])[1] ? 1 : 0.4), flow: [0, -1], lean: 0.3, seed: 90 }), '!', { line: null, clip: 'head' });
  c.paint('patch', B(oe([[106, 84], [110, 79.5], [116, 80.5], [112, 86], [107, 89]])), '"');
  if (!small) c.paint('patch', B(oe([[107, 83], [110, 80.6], [113, 81], [109, 84]])), 'j');
  c.paint('patch', B(oe([[122, 90], [133, 85], [129, 100], [118, 110, 1], [121, 99]])), ')');
  c.paint('patch', B(oe([[110, 86], [124, 84], [128, 90], [124, 92], [112, 92]])), ')');   // the socket's shadow over the eye
  if (fine) { c.furBreak(['patch', 'head'], '!', ['m', '~', '^'], { dir: (x, y) => { const [px0, py0] = T([118 + ex0, 92 + ey0]); return norm(x - px0, y - py0); }, len: 2.4, gap: 2.2, seed: 91, w: 2 }); c.furBreak('patch', '"', '!', { dir: [-0.5, -1], len: 2, gap: 2.4, seed: 92 }); c.furBreak('patch', ')', '!', { dir: [0.6, 1], len: 2, gap: 2.4, seed: 93 }); }

  // ---- ears: iteration 04's flaps, hinged under the hair, tips out and down ----
  c.shape('earL', B([[76, 61, 1], [50, 76, 1], [56, 80], [66, 80.5], [72, 74, 1]]), 'm', nl);
  c.paint('earL', B([[51, 77, 1], [74, 66, 1], [73, 74, 1], [66, 82, 1], [55, 81, 1]]), 'P');
  c.paint('earL', B([[56, 79], [70, 70], [70, 76], [64, 81]]), '?');
  c.stroke(Cv([[74, 63], [52, 75.5]]), '~', { on: 'earL', t: px(1.6), line: false });
  c.shape('earR', B([[146, 60, 1], [170, 76, 1], [164, 81], [156, 82.5], [151, 72, 1]]), 'P', nl);
  c.paint('earR', B([[169, 77, 1], [148, 65, 1], [151, 73, 1], [157, 84, 1], [165, 82, 1]]), '?');
  c.stroke(Cv([[148, 63], [168, 75.5]]), '^', { on: 'earR', t: px(1.4), line: false });

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
  // the shadow the hair casts on the forehead (a soft band, not a line)
  c.paint('head', B([[84, 57], [92, 53], [100, 54], [108, 56.5], [122, 54], [140, 54], [140, 58], [122, 58], [108, 60], [96, 58], [86, 62]]), '^');
  c.paint('head', B([[86, 58], [92, 54.5], [100, 55.5], [108, 57.5], [122, 55.5], [138, 55.5], [122, 57], [108, 59], [96, 57], [88, 60]]), 'P');

  // ---- skin texture: tone boundaries soften in short clustered strokes (short bulldog fur); denser in b ----
  if (fine && D >= 2) {
    const out = (x, y) => norm(x - 95, y - 120), inn = (x, y) => norm(95 - x, 120 - y);
    c.furBreak('head', '~', 'm', { dir: out, len: 2.2, gap: D >= 3 ? 2.4 : 3, seed: 61 });
    c.furBreak('head', 'm', '^', { dir: out, len: 2.4, gap: 3, seed: 62 });
    c.furBreak('head', '^', 'm', { dir: inn, len: 1.8, gap: 3.4, seed: 63 });
    c.furBreak('head', '^', 'P', { dir: out, len: 2.2, gap: 3, seed: 64 });
    c.furBreak('head', 'P', '^', { dir: inn, len: 1.6, gap: 3.4, seed: 65 });
    c.furBreak('head', 'M', '~', { dir: out, len: 1.8, gap: 3, seed: 66 });
    if (D >= 3) c.furStrokes('head', null, '^', { only: ['m'], dir: out, len: 1.6, gap: 5.5, seed: 67, prob: 0.5 });
  }
  if (fine) {
    c.furBreak('hair', '7', '6', { dir: [1, 0.2], len: 3, gap: 2.6, seed: 67 });
    c.furBreak('hair', '6', '5', { dir: [1, 0.3], len: 3.4, gap: 2.6, seed: 68 });
    c.furBreak('hair', '5', '4', { dir: [1, 0.4], len: 3, gap: 2.8, seed: 69 });
  }
  if (D === 1 && !small) {   // the bold take: a cool rim light down the far side instead of texture
    c.paint('head', B([[166, 100], [172, 116], [171, 132], [166, 146], [163, 146], [168, 130], [168, 114], [163, 100]]), '-');
  }

  // ---- the face ----
  const NX = 84 + ex0, NY = 91 + ey0, FX = 117 + ex0, FY = 92 + ey0;   // the near eye, the far (patch) eye
  const bs = small ? 1.2 : 0;
  const ny = NY - (small ? 2.5 : 0);
  // the brows: thick tufts of black hair, thickest in the middle, a lit upper edge of strands
  const brow = (pts) => {
    const p = pts.map(([x, y]) => [x, y - bs]);
    c.shape('brow' + p[0][0], tube(p.map(T), (t) => DSC * (2.2 + 2.6 * Math.sin(Math.PI * (0.2 + 0.7 * t))), undefined, 10), '1', nl);
    if (!small) {
      c.paint('brow' + p[0][0], tube(p.map(([x, y]) => [x, y + 1.3]).map(T), (t) => DSC * (1 + 1.4 * Math.sin(Math.PI * t)), undefined, 10), '0');
      c.stroke(Cv(p.map(([x, y]) => [x - 0.4, y - 1.2])), '3', { on: 'brow' + p[0][0], line: false });
      if (fine) c.furBreak('brow' + p[0][0], '3', '1', { dir: [0.4, 1], len: 1.8, gap: 2.2, seed: 95 });
    }
  };
  const openEye = (ex, ey, rx, ry, iris, lid) => {
    const n = 'eye' + ex;
    c.shape(n, B([[ex - rx, ey + 0.5], [ex - rx * 0.55, ey - ry], [ex + rx * 0.5, ey - ry], [ex + rx, ey], [ex + rx * 0.55, ey + ry], [ex - rx * 0.5, ey + ry]]), 'W', { line: null });
    c.paint(n, B([[ex - rx, ey - ry], [ex + rx, ey - ry], [ex + rx, ey - ry * 0.25], [ex - rx, ey - ry * 0.35]]), '8');
    if (!small) c.paint(n, B([[ex + rx * 0.3, ey - ry], [ex + rx, ey - ry], [ex + rx, ey + ry], [ex + rx * 0.6, ey + ry]]), '7');
    const [ix, iy, ir] = iris;
    c.paint(n, E(ix, iy, ir, ir * 1.05), '<');
    c.paint(n, E(ix + 0.2, iy + ir * 0.25, ir * 0.8, ir * 0.72), '>');
    c.paint(n, E(ix + 0.3, iy + ir * 0.55, ir * 0.55, ir * 0.34), '{');
    if (!small) c.paint(n, E(ix + 0.4, iy + ir * 0.75, ir * 0.32, ir * 0.16), '}');
    c.paint(n, E(ix, iy, ir * 0.46, ir * 0.54), '0');
    if (lid !== null) { c.paint(n, B(lid), ')'); c.paint(n, B(lid.map(([x, y], i) => [x, y + (i > 1 ? -1.2 : 0)])), '('); }
    c.dot(...T([ix - ir * 0.35, iy - ir * 0.3]), 'W', k >= 1.4 ? 1 : 0);
    if (fine) c.dot(...T([ix + ir * 0.4, iy + ir * 0.45]), '`');
  };
  if (expr === 'shock') {
    brow([[NX - 8, ny - 15], [NX, ny - 20], [NX + 8, ny - 16]]);
    brow([[FX - 8, FY - 17], [FX, FY - 22], [FX + 8, FY - 17]]);
    for (const [ex, ey] of [[NX, ny], [FX, FY]]) {
      c.shape('eye' + ex, E(ex, ey, 5.8, 6.8), 'W', { line: '0', inner: '0' });
      if (!small) c.paint('eye' + ex, E(ex, ey - 3.4, 5.8, 3), '8');
      c.paint('eye' + ex, E(ex - 0.5, ey + 0.5, 2.4, 2.8), '0');
      if (!small) c.dot(...T([ex - 1.3, ey - 0.6]), 'W', k >= 1.4 ? 1 : 0);
    }
  } else if (expr === 'laugh') {
    brow([[NX - 8, ny - 12], [NX, ny - 15], [NX + 8, ny - 12]]);
    brow([[FX - 8, FY - 14], [FX, FY - 18], [FX + 8, FY - 14]]);
    c.stroke(Cv([[NX - 7, ny + 2], [NX, ny - 4], [NX + 7, ny + 2]]), '0', { t: px(3, 2), line: false });
    if (!small) fold(NX, ny + 6, 12, 1.2, 'P', '~', -1.6);
    c.shape('lid', B([[FX - 8, FY + 1], [FX - 4, FY - 3], [FX + 4, FY - 3], [FX + 8, FY + 1], [FX, FY + 2]]), '0', nl);
    c.stroke(Cv([[FX - 5, FY + 4], [FX, FY + 5], [FX + 5, FY + 4]]), '(', { on: ['head', 'patch'], line: false, t: px(1.2) });
  } else {
    // the smug politician: a wink on the near side, the patch eye half open under a heavy lid, looking at you
    brow([[NX - 9, ny - 11], [NX - 1, ny - 12.5], [NX + 8, ny - 8]]);
    brow([[FX - 8, FY - 13.5], [FX, FY - 18.5], [FX + 8, FY - 14]]);
    c.paint('head', B([[NX - 8, ny + 2], [NX - 3, ny - 3], [NX + 3, ny - 3], [NX + 8, ny + 1], [NX + 3, ny - 0.6], [NX - 3, ny - 0.6]]), '~');   // the lid's lit fold
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 3, ny - 1.5], [NX + 3, ny - 1.5], [NX + 7, ny + 1]]), '0', { t: px(2.6, 2), line: false });
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 10, ny + 4]]), '0', { t: px(1.6), line: false });
    if (!small) fold(NX + 0.5, ny + 6.4, 11, 1.1, 'P', null, -1.4);
    const er = small ? 4.6 : 5.6;
    openEye(FX, FY + 0.4, 8, er, [FX - 1.6, FY + 1.4, small ? 3.4 : 4.1], [[FX - 9.4, FY - 7], [FX + 9.4, FY - 7], [FX + 9.4, FY - 0.4], [FX + 4, FY - 1.6], [FX, FY - 1.8], [FX - 9.4, FY - 1.2]]);
    c.stroke(Cv([[FX - 7, FY - 1.2], [FX, FY - 1.8], [FX + 5, FY - 1.2], [FX + 7.4, FY + 0.6]]), '0', { t: px(2, 2), line: false });
    if (!small) c.stroke(Cv([[FX - 6, FY + er + 1.2], [FX, FY + er + 1.8], [FX + 6, FY + er + 0.8]]), '"', { on: ['patch', 'head'], line: false });
  }

  // ---- the muzzle: the nose, then two fat upper-lip lobes (flews) hanging over the teeth ----
  // the nose's cast shadow on the muzzle top
  c.paint('head', B(on([[82, 115], [96, 117], [106, 112], [112, 114], [106, 121], [93, 122.5], [82, 120]])), '^');
  // the nose: big, black and wet: a blue-grey sheen on the top plane, a specular, nostrils with lit rims
  c.shape('nose', B(on([[74, 104], [80, 98], [92, 97], [103, 101], [103, 110], [94, 116], [82, 115], [75, 110]])), '1', nl);
  c.paint('nose', B(on([[77, 101], [84, 98], [94, 98.4], [101, 102], [96, 104.6], [86, 104.6], [79, 105]])), '2');
  c.paint('nose', B(on([[79, 101], [85, 99], [92, 99.6], [88, 102], [82, 102.6]])), '4');
  if (!small) c.paint('nose', B(on([[81, 100.6], [85, 99.6], [88, 100.4], [84, 101.4]])), '6');
  c.paint('nose', B(on([[77, 112], [86, 115], [96, 114], [102, 109], [100, 113.6], [94, 116.6], [82, 116]])), '0');
  for (const [cx, cy, d] of [[79.5, 109.5, 1], [98.5, 109, -1]]) {
    c.paint('nose', B(on([[cx - 2.6 * d, cy - 1], [cx, cy - 2.2], [cx + 2.4 * d, cy - 0.4], [cx + 1.2 * d, cy + 1.8], [cx - 1.6 * d, cy + 1.6]])), '0');
    if (!small) c.paint('nose', B(on([[cx - 2.6 * d, cy - 1.6], [cx, cy - 3], [cx + 2.6 * d, cy - 1.2], [cx, cy - 2.2]])), '3');
  }
  c.dot(...T(on([[83, 100.6]])[0]), 'W', k >= 1.4 ? 1 : 0);
  // the philtrum: a groove between the flews (a shadow wedge with lit sides), not a line
  c.paint('head', B(on([[87.4, 116], [90.6, 116], [90, 124], [89, 126], [88, 124]])), 'P');
  if (!small) { c.paint('head', B(on([[85.6, 117], [87.4, 117], [87.6, 124], [86.4, 123]])), '~'); }
  // the mouth (expression) and the flews over it
  const flews = (open) => {
    // two fat lobes: left (near, lit) and right (far, in half shade); each a lit top, a body, a core shadow underneath
    const dropL = open ? 3 : 0, dropR = open ? 2 : 0;
    const L = om([[60, 120], [68, 117], [80, 117], [89, 120], [89, 125 - dropL * 0.3], [84, 129 - dropL], [74, 129.5 - dropL], [65, 126.5 - dropL]]);
    const R = om([[89, 120], [100, 118.6], [114, 119.6], [126, 123], [131, 128], [124, 131.5 - dropR], [110, 132 - dropR], [96, 130 - dropR], [89, 125]]);
    c.paint('head', B(L), 'm');
    c.paint('head', B(R), '^');
    c.paint('head', B(om([[62, 120.6], [70, 118], [80, 118], [86, 120.4], [78, 121.6], [68, 122.6]])), '~');
    if (!small) c.paint('head', B(om([[70, 118.6], [78, 118.4], [74, 120.2]])), 'M');
    c.paint('head', B(om([[92, 120.4], [104, 119.4], [116, 120.6], [104, 121.8], [94, 122.2]])), 'm');
    c.paint('head', B(om([[66, 126.5 - dropL], [74, 128.8 - dropL], [84, 128.4 - dropL], [88, 125], [84, 130.4 - dropL], [74, 131 - dropL], [65, 128 - dropL]])), 'P');
    c.paint('head', B(om([[92, 128 - dropR], [110, 130.6 - dropR], [124, 130 - dropR], [131, 128], [124, 133 - dropR], [110, 133.6 - dropR], [94, 131.2 - dropR]])), '?');
    if (!small) for (const [x, y] of [[71, 123], [76, 125], [81, 123], [100, 124], [106, 126], [112, 124]]) { const [a, b] = T(om([[x, y]])[0]); c.img.set(Math.round(c.X(a)), Math.round(c.Y(b)), 'P'); c.img.set(Math.round(c.X(a)) + 1, Math.round(c.Y(b)), 'P'); c.img.set(Math.round(c.X(a)), Math.round(c.Y(b)) - 1, x < 89 ? 'M' : 'm'); }
  };
  if (expr === 'grin') {
    // the opening: gum, teeth shaded toward the corners, the flews' cast shadow along the top, dark corners
    c.shape('mouth', B(om([[62, 124, 1], [80, 132], [96, 135.5], [113, 134.5], [129, 129, 1], [121, 139], [97, 147], [75, 138]])), 'W', { line: null });
    c.paint('mouth', B(om([[60, 122], [130, 122], [130, 133], [113, 136.6], [96, 137.6], [80, 134], [60, 127]])), '?');   // gum
    c.paint('mouth', B(om([[66, 130], [80, 136], [96, 139.4], [113, 138.4], [124, 134], [113, 140.4], [96, 141.4], [80, 138]])), '7');   // the lip's shadow on the teeth
    c.paint('mouth', B(om([[70, 136], [97, 145.4], [122, 136], [121, 139], [97, 147], [75, 138]])), '8');
    c.paint('mouth', B(om([[110, 134], [130, 128], [124, 138], [114, 142]])), '7');
    c.paint('mouth', B(om([[120, 132], [130, 128], [125, 136]])), '6');
    c.paint('mouth', B(om([[62, 124], [68, 128], [72, 134], [66, 131]])), '=');
    c.paint('mouth', B(om([[129, 129], [125, 133], [122, 138], [126, 132]])), '=');
    if (!small) for (const x of [86, 96, 106]) c.paint('mouth', B(om([[x - 0.5, 137.5], [x + 0.5, 137.5], [x + 0.4, 144], [x - 0.4, 144]])), '8');
    flews(false);
  } else if (expr === 'laugh') {
    c.shape('mouth', B(om([[61, 122, 1], [80, 131], [96, 135], [113, 133], [131, 127, 1], [128, 140], [115, 150], [96, 153], [78, 148], [66, 136]])), '=', { line: null });
    c.paint('mouth', B(om([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [131, 133], [113, 139], [96, 141], [80, 137], [61, 129]])), 'W');
    c.paint('mouth', B(om([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [113, 136.4], [96, 137.6], [80, 133.6]])), '7');
    c.paint('mouth', B(om([[110, 133], [133, 126], [131, 133], [113, 139]])), '8');
    c.paint('mouth', B(om([[76, 146], [88, 141], [104, 140], [116, 143], [122, 147], [108, 152], [90, 152]])), 'P');
    c.paint('mouth', B(om([[88, 147], [104, 145], [113, 147], [106, 150], [92, 150]])), '^');
    c.paint('mouth', B(om([[90, 146], [100, 144.6], [96, 146.4]])), 'm');
    flews(true);
  } else {
    c.shape('mouth', E(95 + mx0, 141 + my0, 7, 8.5), '=', { line: null });
    c.paint('mouth', E(95 + mx0, 146 + my0, 5, 3), '?');
    c.paint('mouth', E(94 + mx0, 147 + my0, 3, 1.4), 'P');
    c.paint('mouth', E(95 + mx0, 134.6 + my0, 6, 1.8), '7');
    flews(false);
  }

  // ---- the silhouette: coloured lines per material; the lit side softer (b, c lose it on the skin) ----
  if (fine) c.despeckle(null, ['W', '6', 'j', 'M', '`', '}', 'P', 'm']);
  const skin = ['m', 'M', '~', '^', 'P', '?', 'p', '=', '-'];
  c.silhouette({
    dark: '0', light: [-1, -1],
    pick: (nb, lit) => (skin.includes(nb) ? (lit ? (D === 2 ? 'p' : '?') : '=') : ['3', '4', '5', '6', '7', '8', 'W'].includes(nb) ? (lit ? '3' : '1')
      : ['y', 'o', 'Y'].includes(nb) ? '|' : ['R', 'r', '[', 'q'].includes(nb) ? 'r' : ['a', 'A', 's', 'S'].includes(nb) ? 'K' : ['U', 'C', '_'].includes(nb) ? 'u' : undefined),
  });
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
