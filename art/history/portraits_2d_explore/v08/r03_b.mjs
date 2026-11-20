// M4.8 round 03 (variant b), the last exploration round. The raccoon's head is kept as it is; three new POSES with the
// face fully clear: (a) the bat: the pump on the near shoulder running up behind it, the other fist on the hip;
// (b) the cane: the pump planted in front, both paws stacked on the T-handle under the chin; (c) the lean: an elbow on
// a pump planted at screen-left, the paw dangling, the cycling cap. Red bandana + teal pump throughout. The body is
// two or three big fur tiers; bigger hands with light knuckles and pads; the hose hangs slack, the gauge faces you.
// Dog Fjord as a BULLDOG: an underbite with two lower canines over the lip, flews hanging past the jaw line, a nose
// rope, folded rose ears, a flat wide chin; the smug heavy-lidded patch eye sliding toward the raccoon, the patch brow
// arched, the patch-side mouth corner up. (a) sunk in big navy shoulders, gold car tie; (b) chin up (looking down his
// nose: nostrils from below, low pupils, a double chin), charcoal pinstripe, red tie; (c) sunk in royal blue, a cream
// blaze, striped tie.
import { Canvas, blob, curve, ell, bar, tube, tufted, hash } from '../../../lib/draw2d.mjs';

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const V = 'b';
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== THE RACCOON ==============================
// Drawn in the cool fur keys 0..8 and moved to the warm taupe ramp at the end (fur parts only). Light from the upper
// left. The figure is drawn RZ x about the head (design units stay those of round 01); each pose has its framing.
const FRAME = { a: [1.1, 128, 76], b: [1.0, 126, 70], c: [1.1, 132, 76] }[V];   // zoom, where the head centre lands
const RZ = FRAME[0], ROX = FRAME[1] - 134 * RZ, ROY = FRAME[2] - 80 * RZ;
const ACC = { pump: [':', 'f', 'F', ';', 'W'], neck: 'bandana', head: V === 'c' ? 'cap' : null };

/**
 * a floor pump on ONE straight axis: `foot` the centre of the foot plate, `ang` the axis direction toward the handle,
 * `L` its length in design units. The parts are laid out in real units (foot, caps, barrel, rod, T-handle square to
 * the axis), so a short pump keeps its proportions instead of squashing; nothing can bend; only the hose curves.
 * The gauge is a round dial facing the viewer at `gaugeS` along the axis. Returns { at(s, o) }.
 */
function pumpAxis(c, foot, ang, L, { ramp, fine = true, gaugeS = 30, hose = null } = {}) {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  let nx = -uy, ny = ux;
  if (-nx - ny < 0) { nx = -nx; ny = -ny; }   // n points to the lit side
  const at = (s, o = 0) => [foot[0] + ux * s + nx * o, foot[1] + uy * s + ny * o];
  const strip = (s0, s1, o, w) => bar(at(s0, o), at(s1, o), w);
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  const glint = (s, o) => { const [x, y] = at(s, o); c.dot(x, y, 'W'); };
  const RL = Math.max(6, Math.min(30, 0.18 * L)), B1 = L - RL - 9;   // the rod showing, the barrel's top
  if (hose) {
    const hp = curve(hose);
    c.stroke(hp, '1', { t: Math.max(2, Math.round(4.4 * c.S)), line: false });
    c.stroke(hp.map(([x, y]) => [x - 0.6, y - 0.9]), '3', { t: 1, line: false });
    const e = hp[hp.length - 1], d = hp[hp.length - 5], l = Math.hypot(e[0] - d[0], e[1] - d[1]) || 1, ex = (e[0] - d[0]) / l, ey = (e[1] - d[1]) / l;
    c.shape('chuck', bar(e, [e[0] + ex * 9, e[1] + ey * 9], 6), '5', { line: null });
    c.paint('chuck', bar([e[0] - ey * 1.6, e[1] + ex * 1.6], [e[0] + ex * 9 - ey * 1.6, e[1] + ey * 9 + ex * 1.6], 1.4), '7');
    c.paint('chuck', bar([e[0] + ey * 1.8, e[1] - ex * 1.8], [e[0] + ex * 9 + ey * 1.8, e[1] + ey * 9 - ex * 1.8], 1.4), '3');
    if (fine) c.dot(e[0] + ex * 6 - ey * 1.6, e[1] + ey * 6 + ex * 1.6, 'W');
    const f0 = hp[0];   // the ferrule where the hose leaves the foot
    c.shape('ferrule', ell(f0[0], f0[1], 3.4, 3.4), '6', { line: null }); c.paint('ferrule', ell(f0[0] - 0.8, f0[1] - 0.8, 1.6, 1.6), '8');
  }
  const [deep, dark, base, lit, shine] = ramp;
  // the foot plate, square to the axis, a tread peg at each end
  c.shape('foot', box(0, 6, 42), '2', { line: null });
  c.paint('foot', strip(3.8, 6, 0, 44), '4');
  c.paint('foot', strip(0, 1.6, 0, 44), '1');
  for (const o of [-22, 22]) { c.shape('peg' + o, bar(at(-1, o), at(7, o), 5.4, true), '1', { line: null }); c.paint('peg' + o, bar(at(1, o + 1.2), at(6, o + 1.2), 1.2), '3'); }
  // the barrel: lit along one side, a core shadow, a thin reflected light on the far edge
  c.shape('barrel', box(12, B1, 13), base, { line: null });
  c.paint('barrel', strip(12, B1, 4.3, 2.8), lit);
  c.paint('barrel', strip(12, B1, 3.4, 0.9), shine);
  c.paint('barrel', strip(12, B1, -2.8, 3.2), dark);
  c.paint('barrel', strip(12, B1, -5.0, 1.8), deep);
  c.paint('barrel', strip(12, B1, -6.2, 0.7), dark);
  if (fine) for (let s = B1 - 26; s < B1 - 4; s += 4) if (s > 14 && Math.abs(s - gaugeS) > 11) c.paint('barrel', box(s, s + 1.1, 13.4), dark);
  // the caps (chrome): bright edge, dark core, reflected light, a glint
  for (const [s0, s1] of [[6, 13], [B1 - 2, B1 + 5]]) {
    const n = 'cap' + Math.round(s0);
    c.shape(n, box(s0, s1, 18), '6', { line: null });
    c.paint(n, strip(s0, s1, -6, 6), '4');
    c.paint(n, strip(s0, s1, -8.2, 1.4), '6');
    c.paint(n, strip(s0, s1, 5.2, 2.6), '8');
    if (fine) glint((s0 + s1) / 2, 6);
  }
  // the rod and the T-handle square to the axis
  c.shape('rod', box(B1 + 5, L - 2, 4.2), '6', { line: null });
  c.paint('rod', strip(B1 + 5, L - 2, 1.1, 1.1), '8');
  c.paint('rod', strip(B1 + 5, L - 2, -1.4, 1.2), '3');
  if (fine && RL > 10) glint(B1 + 5 + RL * 0.5, 1.2);
  const hc = at(L);
  const hA = (o, d = 0) => [hc[0] + nx * o + ux * d, hc[1] + ny * o + uy * d];
  c.shape('handle', bar(hA(-25), hA(25), 7, true), '3', { line: null });
  for (const s of [-1, 1]) {
    const g = 'grip' + s;
    c.shape(g, bar(hA(s * 8), hA(s * 25), 8.6, true), '2', { line: null });
    c.paint(g, bar(hA(s * 8, 2.6), hA(s * 26, 2.6), 1.8), '4');
    c.paint(g, bar(hA(s * 8, -2.8), hA(s * 26, -2.8), 2), '1');
    if (fine) for (let o = 11; o < 24; o += 3) c.paint(g, bar(hA(s * o, -3.6), hA(s * o, 3.6), 0.9), '1');
  }
  c.shape('boss', bar(at(L - 5), at(L + 5), 8.4), '6', { line: null });
  c.paint('boss', strip(L - 5, L + 5, -2.6, 1.8), '3');
  c.paint('boss', strip(L - 5, L + 5, 2.4, 1.6), '8');
  if (fine) glint(L, 2.6);
  // the gauge: a round dial facing the viewer, a chrome bezel, ticks, a red needle
  const g = at(gaugeS);
  c.shape('gauge', ell(g[0], g[1], 8.4, 8.4), '4', { line: null });
  c.paint('gauge', ell(g[0] - 0.7, g[1] - 0.7, 7.5, 7.5), '7');
  c.paint('gauge', ell(g[0], g[1], 6.3, 6.3), 'W');
  c.paint('gauge', ell(g[0] + 1.5, g[1] + 1.7, 5.6, 5.6).filter((_, i) => i > 2 && i < 18), '8');
  if (fine) { for (let a = -3.8; a <= 0.7; a += 0.75) c.dot(g[0] + Math.cos(a) * 4.8, g[1] + Math.sin(a) * 4.8, '3'); c.dot(g[0] - 5.2, g[1] - 3.2, 'W'); }
  c.stroke([g, [g[0] + 3.6, g[1] - 2.8]], 'R', { on: 'gauge', t: 1, line: false });
  c.dot(g[0], g[1], '1');
  return { at, nx, ny, ux, uy };
}

/**
 * a raccoon hand round the pump's tube (axis coords): the back of the hand over the tube, the wrist on side `side`,
 * four long fingers fanning from a knuckle row and curling over the far edge, the thumb hooked round the near edge;
 * light knuckles, claws, a palm pad at the thumb (`palm`); `z` scales it
 */
function hand(c, ax, name, s0, side, { palm = false, fine = true, z = 1 } = {}) {
  const A = (s, o) => ax.at(s0 + s * z, o * side * z);
  c.shape(name, blob([A(-6.5, 13), A(-8, 5), A(-7.6, -3.5), A(-3, -5.6), A(3, -5.8), A(7.4, -3.6), A(8, 5), A(6.5, 13)]), '2', { line: null, inner: '1' });
  c.paint(name, blob([A(-6, 12), A(-6.8, 5), A(-2, 2.4), A(3, 3.4), A(6, 11)]), '3');
  c.paint(name, blob([A(-7.4, -1.5), A(-3, -4.4), A(3, -4.6), A(7, -2), A(3, -2.6), A(-3, -2.6)]), '1');
  const fs = [-5.4, -1.8, 1.8, 5.4], len = [6.4, 7.6, 7.2, 5.8];
  for (let i = 0; i < 4; i++) {
    const n = name + 'f' + i, s = fs[i], fan = s * 0.08;
    c.shape(n, tube([A(s, -3.8), A(s + fan, -7.5), A(s + fan * 1.6, -3.8 - len[i])], (t) => (3.6 - 0.8 * t) * z), '2', { line: null, inner: '0' });
    c.paint(n, tube([A(s + fan * 1.2, -8.8), A(s + fan * 1.6, -3.8 - len[i])], 2.4 * z), '1');
    c.paint(n, tube([A(s - 0.8, -3.6), A(s - 0.6, -6)], 1.3 * z), '4');                      // the light along the knuckle
    c.dot(...A(s - 0.6, -4.6), '5'); if (fine) c.dot(...A(s - 0.8, -5.2), '6');
    const tip = A(s + fan * 1.6, -3.8 - len[i] - 1.2);
    c.dot(tip[0], tip[1], '7');
  }
  c.shape(name + 't', tube([A(8.2, 9), A(10.2, 4), A(9.2, -0.5)], (t) => (4.2 - 1.2 * t) * z), '2', { line: null, inner: '0' });
  c.paint(name + 't', tube([A(8.6, 8), A(10, 4.4)], 1.4 * z), '4');
  c.dot(...A(9, -1.4), '7');
  if (palm) { c.paint(name, blob([A(4.2, 12.6), A(6, 8), A(7.8, 5.6), A(7.8, 11.4)]), '5'); c.paint(name, blob([A(5.4, 11.6), A(6.8, 8.4), A(7.4, 10.2)]), '6'); }
}

/**
 * a raccoon paw seen from the back: the wrist at (wx, wy), the fingers pointing along `ang` (radians); four long
 * fingers with light knuckles, claws, a thumb on side `thumb`; `palm` shows a light pad (the paw turned a little);
 * `z` scales it. Hands on a cane top, a paw dangling, a paw resting on the belly.
 */
function flatPaw(c, name, wx, wy, ang, { z = 1.25, thumb = 1, palm = false, fine = true, curl = 0 } = {}) {
  const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
  const P = (a, b) => [wx + dx * a * z + px * b * z, wy + dy * a * z + py * b * z];
  const litB = (px * -1 + py * -1) > 0 ? 1 : -1;   // which half faces the light
  c.shape(name, blob([P(-1.5, -4.8), P(4, -6.4), P(9, -6.8), P(10.8, -3), P(11, 2.6), P(9, 6.8), P(4, 6.4), P(-1.5, 4.8)]), '2', { line: null, inner: '1' });
  c.paint(name, blob([P(0, 0), P(0, litB * 4.2), P(5, litB * 5.6), P(9, litB * 5.2), P(8, litB * 1), P(4, -litB * 0.6)]), '3');
  if (palm) { c.paint(name, ell(...P(3.6, -litB * 2.4), 3 * z, 2.4 * z, ang), '5'); c.paint(name, ell(...P(3.2, -litB * 2.8), 1.6 * z, 1.2 * z, ang), '6'); }
  const fb = [-4.9, -1.65, 1.65, 4.9], fl = [6.2, 7.8, 7.4, 5.6];
  for (let i = 0; i < 4; i++) {
    const n = name + 'f' + i, b0 = fb[i], b1 = fb[i] * 1.12, L = fl[i];
    const mid = P(9.6 + L * 0.55, b0 * 1.06 + curl), tip = P(9.6 + L, b1 + curl * 1.6);
    c.shape(n, tube([P(9.2, b0), mid, tip], (t) => (3.5 - 0.9 * t) * z), '2', { line: null, inner: '0' });
    c.paint(n, tube([P(9.4, b0 + litB * 0.7), mid.map((v, j) => v + (j ? py : px) * litB * 0.7 * z)], 1.2 * z), '3');
    c.paint(n, ell(...P(9.4, b0), 1.6 * z, 1.3 * z), '4');                                                            // the knuckle
    c.dot(...P(9.2, b0 + litB * 0.6), '5'); if (fine) c.dot(...P(9, b0 + litB * 0.9), '6');
    const ct = P(9.6 + L + 1.3, b1 * 1.04 + curl * 1.8);
    c.dot(ct[0], ct[1], '7');
  }
  c.shape(name + 't', tube([P(2.6, thumb * 5.6), P(5.6, thumb * 8.6), P(8.6, thumb * 9.6)], (t) => (3.8 - 1 * t) * z), '2', { line: null, inner: '0' });
  c.paint(name + 't', ell(...P(4, thumb * 7), 1.4 * z, 1.1 * z), '4');
  c.dot(...P(9.8, thumb * 9.8), '7');
}

/** a big fist (the paw on the hip): rounded, the knuckle row lit, finger creases, the thumb wrapped over */
function fist(c, name, cx, cy, z = 1.5) {
  const F = (pts) => pts.map(([x, y]) => [cx + (x - 167) * z, cy + (y - 177) * z]);
  c.shape(name, blob(F([[160, 168], [168, 166], [176, 170], [178, 178], [173, 186], [164, 188], [158, 185], [155.5, 182], [158, 179], [155.5, 175.5], [158, 172.5], [156, 169.5]])), '2', { line: null, inner: '1' });
  c.paint(name, blob(F([[160, 167.4], [170, 166.4], [176, 171], [168, 172], [161, 171]])), '3');
  for (const y of [175.8, 179.4, 183]) c.paint(name, blob(F([[156, y - 0.5], [162, y - 0.6], [162, y + 0.5], [156.4, y + 0.6]])), '1');
  for (const y of [172.6, 177.6, 181.2, 184.6]) { c.paint(name, ell(...F([[157.4, y]])[0], 1.4 * z, 1.1 * z), '4'); c.dot(...F([[157, y - 0.4]])[0], '5'); }
  c.paint(name, blob(F([[164, 170], [174, 172], [176, 176], [168, 175]])), '4');   // the thumb over the fingers
  c.dot(...F([[156.4, 171.6]])[0], '6');
}

const HEADC = [186, 92];   // fur flows away from the nose
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k * RZ, k * ROX, k * ROY);
  const fine = k >= 0.9;
  const nl = { line: null };
  const fur = (on, a, b, dir, len, gap, seed, w = 1, shapes = null) => { if (fine) c.furBreak(on, a, b, { dir, len, gap, seed, w, shapes }); };

  const TILT = V === 'c' ? -7 : 0, LOW = V === 'b' ? 12 : 0;
  const tx = (pts) => pts.map(([x, y, s]) => { const X = x + (TILT * (186 - y)) / 76, Y = y + (y > 150 ? (LOW * (y - 150)) / 35 : 0); return s ? [X, Y, 1] : [X, Y]; });
  const bandOn = true;

  // ---- POSE geometry ----
  let AXP = null;
  if (V === 'a') {   // the bat: the pump behind, resting on the near shoulder, its foot showing under the body
    AXP = { foot: [100, 180], top: [48, 28] };
  } else if (V === 'b') {   // the cane: planted in front, the foot on the bottom edge, the T-handle under the chin
    AXP = { foot: [132, 212], top: [132, 141] };
  } else {   // the lean: planted at screen-left, the T-handle at shoulder height
    AXP = { foot: [46, 196], top: [46, 124] };
  }
  const ANG = Math.atan2(AXP.top[1] - AXP.foot[1], AXP.top[0] - AXP.foot[0]), PL = Math.hypot(AXP.top[0] - AXP.foot[0], AXP.top[1] - AXP.foot[1]);
  const pumpOpts = {
    a: { gaugeS: 104, hose: [[84, 186], [80, 193], [92, 198], [110, 197], [122, 193.6]] },
    b: { gaugeS: 30, hose: [[150, 211], [164, 216], [182, 215], [196, 210], [205, 212]] },
    c: { gaugeS: 26, hose: [[64, 196], [76, 199.6], [94, 198], [108, 199.4]] },
  }[V];
  let AX = null;
  if (V !== 'b') AX = pumpAxis(c, AXP.foot, ANG, PL, { ramp: ACC.pump, fine, ...pumpOpts });   // behind the figure (a) / beside it (c)

  // ---- the torso: two big fur tiers that follow the chest (a pale bib over a shaded belly), a shadow side ----
  const bodyPts = tufted(blob(tx([[104, 108], [90, 118], [84, 134], [83, 152], [88, 168], [102, 180], [126, 185], [150, 180], [164, 168], [170, 150], [168, 130], [158, 116], [144, 108]])),
    { amp: 3.2, period: 8, where: (x, y) => (y > 134 ? 1 : 0), flow: [0, 1], lean: 0.9, seed: 2 });
  c.shape('body', bodyPts, '5', nl);
  c.paint('body', blob(tx([[80, 160], [104, 172], [128, 176], [152, 172], [176, 160], [176, 200], [80, 200]])), '4');   // the belly turns under
  c.paint('body', blob(tx([[152, 112], [174, 126], [180, 158], [170, 184], [152, 194], [158, 160], [162, 138]])), '4');   // the shadow side
  c.paint('body', blob(tx([[166, 136], [180, 150], [176, 182], [160, 194], [166, 166]])), '3');
  c.paint('body', blob(tx([[88, 128], [96, 120], [98, 140], [94, 160], [88, 152]])), '6');   // the lit near flank
  c.paint('body', tufted(blob(tx([[104, 112], [152, 112], [158, 132], [152, 152], [140, 166], [128, 172], [116, 166], [104, 152], [98, 132]])), { amp: 4.4, period: 7.5, where: (x, y) => (y > 142 ? 1 : 0), flow: [0, 1], lean: 0.6, seed: 52 }), '7');
  c.paint('body', tufted(blob(tx([[110, 114], [142, 114], [146, 128], [140, 142], [128, 150], [116, 142], [110, 128]])), { amp: 3.6, period: 6.5, where: (x, y) => (y > 134 ? 1 : 0), flow: [0, 1], lean: 0.6, seed: 53 }), '8');
  c.paint('body', blob(tx([[142, 116], [154, 128], [150, 150], [140, 164], [146, 146], [148, 130]])), '6');   // the bib turning away
  c.paint('body', blob(tx([[100, 110], [128, 116], [156, 110], [150, 122], [128, 127], [106, 122]])), '4');   // the head's shadow across the chest
  fur('body', '7', '5', [0, 1], 3.4, 3, 40, 2); fur('body', '8', '7', [0, 1], 3, 2.8, 41, 2); fur('body', '7', '6', [0, 1], 3, 3, 46, 2);
  fur('body', '5', '4', [0.2, 1], 3.4, 3.2, 43, 2); fur('body', '4', '3', [0.3, 1], 3, 3.4, 44); fur('body', '6', '5', [0, 1], 3, 3, 45, 2);

  // ---- arms: tapered, furry, darker than the chest, a soft contact shadow where one crosses the body ----
  const arm = (name, pts, w0, w1, flow, seed, shadow = true) => {
    const path = tube(pts, (t) => w0 + (w1 - w0) * t * t, undefined, 12);
    if (shadow) c.paint('body', tube(pts.map(([x, y]) => [x + 2.2, y + 3]), (t) => w0 + 1 + (w1 - w0) * t * t, undefined, 12), '4');
    c.shape(name, tufted(path, { amp: 2.6, period: 6.5, flow, lean: 0.7, seed }), '4', { line: null, inner: '1' });
    c.rim(name, -2.6, -2.6, '5', { only: ['4'] });
    c.rim(name, -1.2, -1.2, '6', { only: ['5'] });
    c.rim(name, 3, 3, '3', { only: ['4', '5'] });
    fur(name, '5', '4', flow, 3.2, 3.2, seed + 1, 2); fur(name, '4', '3', flow, 3, 3.4, seed + 2, 2);
  };
  if (V === 'a') {
    arm('armR', tx([[160, 124], [194, 150], [172, 172]]), 20, 13, [0.5, 1], 60);
    arm('armL', [[100, 124], [90, 156], [95, 122]], 21, 12, [0, 1], 70);
  } else if (V === 'b') {
    arm('armL', tx([[100, 124], [90, 154], [118, 132]]), 21, 12, [-0.3, 1], 70);
    arm('armR', tx([[158, 124], [172, 154], [146, 132]]), 20, 12, [0.3, 1], 60);
  } else {
    arm('armR', tx([[156, 124], [168, 154], [150, 170]]), 20, 12, [0.3, 1], 60);
    // the near arm leans its elbow on the T-handle, the forearm hanging over it (behind the cheek ruff)
    arm('armL', [[100, 122], [70, 117], [46, 132]], 20, 12, [-0.6, 0.8], 70, false);
  }


  // ---- the red bandana (round 01 A's drawing): a kerchief round the neck, knotted on the near side ----
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


  // ---- the neckwear: the red bandana (round 01 A's drawing), under the chin ----
  // (drawn after the head would cover the chin, so it is drawn in the back layer: see BAND)
  if (V === 'a') {
    // the near paw grips the barrel at the shoulder (the face stays clear), the far fist on the hip
    hand(c, AX, 'pawL', 60, -1, { fine, z: 1.3 });
    fist(c, 'fistR', 170, 174, 1.55);
  } else if (V === 'b') {
    AX = pumpAxis(c, AXP.foot, ANG, PL, { ramp: ACC.pump, fine, ...pumpOpts });
    // both paws stacked on the T-handle: the far one on the boss, the near one over it, fingers curling over the front
    flatPaw(c, 'pawR', 148, 124, Math.PI * 0.62, { z: 1.3, thumb: -1, fine });
    flatPaw(c, 'pawL', 114, 125, Math.PI * 0.36, { z: 1.35, thumb: 1, fine, palm: false });
  } else {
    // the paw dangling loose from the arm leaning on the T-handle; the far paw resting on the belly
    flatPaw(c, 'pawL', 44, 133, Math.PI * 0.56, { z: 1.25, thumb: 1, palm: true, fine, curl: 0.8 });
    flatPaw(c, 'pawR', 150, 170, Math.PI * 0.9, { z: 1.2, thumb: -1, fine });
  }
  for (const [a, p] of [['armR', 'pawR'], ['armL', 'pawL'], ['armR', 'fistR']]) {
    if (!fine || !c.ids.has(a) || !c.ids.has(p)) continue;
    c.furBreak([a, p], '4', ['2', '3'], { dir: (x, y) => [0, 1], len: 3, gap: 2.2, seed: 80, w: 2 });
    c.furBreak([a, p], '5', ['2', '3'], { dir: (x, y) => [0, 1], len: 2.6, gap: 2.4, seed: 81 });
  }

  // ---- the warm coat: every fur tone moves to the taupe ramp (the pump, neckwear and eyes keep theirs) ----
  {
    const map = { 0: '@', 1: '#', 2: '$', 3: 'I', 4: '%', 5: '&', 6: 'J', 7: '*', 8: '+' };
    const furParts = ['tail', 'body', 'armL', 'armR', 'earL', 'earR', 'head', 'snout', 'nose', 'eyeN', 'eyeF',
      'fistR', ...['pawL', 'pawR'].flatMap((p) => [p, p + 't', p + 'f0', p + 'f1', p + 'f2', p + 'f3'])].map((n) => c.id(n));
    for (let i = 0; i < c.img.px.length; i++) if (furParts.includes(c.part[i]) && map[c.img.px[i]]) c.img.px[i] = map[c.img.px[i]];
  }
  c.despeckle(null, ['W', '`', '*', '}', '7', '+']);
  const metal = ['1', '2', '3', '4', '5', '6', '7', '8', 'W'];
  c.silhouette({
    dark: '@', light: [-1, -1],
    pick: (nb, lit) => (ACC.pump.includes(nb) ? ACC.pump[0] : ['R', 'q', '[', 'r'].includes(nb) ? 'r' : ['l', 'L', 'E', 'e'].includes(nb) ? 'e' : metal.includes(nb) ? '0' : lit ? '$' : undefined),
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
  a: { e: [0, 0], n: [0, 0], m: [0, 0], suit: 'navySunk', density: 2, up: false, blaze: false },
  b: { e: [2, -8], n: [2, -11], m: [2, -12], suit: 'charcoal', density: 2, up: true, blaze: false },
  c: { e: [-1, 2], n: [-1, 2], m: [-1, 2], suit: 'royal', density: 2, up: false, blaze: true },
}[V];

function dogSuit(c, kind, small, px) {
  const nl = { line: null };
  const S = {
    navySunk: { pts: [[38, 214, 1], [38, 180], [44, 160], [60, 146], [84, 150], [130, 150], [154, 144], [172, 152], [180, 174], [182, 214, 1]], col: ['u', '_', ',', 'U'], tie: 'gold' },
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
    if (kind === 'navy' || kind === 'navySunk') { c.shape('pin', B([[77, 176, 1], [83, 176, 1], [83, 180, 1], [77, 180, 1]]), 'W', nl); c.paint('pin', B([[77, 176], [78.6, 176], [78.6, 180], [77, 180]]), 'R'); c.paint('pin', B([[81.4, 176], [83, 176], [83, 180], [81.4, 180]]), 'R'); c.dot(...T([80, 178]), 'R'); }
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
  // ---- the chestnut heart patch round the far eye: a 4-tone ramp, a fur edge into the pink, a socket shadow ----
  const PATCH = oe([[104, 89], [104, 82], [110, 77.5], [117, 78.5], [124, 77], [131, 80.5], [132, 89], [127, 99], [118, 109, 1], [109, 99]]);
  c.shape('patch', tufted(B(PATCH), { amp: small ? 0.01 : 2.2, period: 3.6, where: (x, y) => (y < T([0, 102 + ey0])[1] ? 1 : 0.4), flow: [0, -1], lean: 0.3, seed: 90 }), '!', { line: null, clip: 'head' });
  c.paint('patch', B(oe([[106, 84], [110, 79.5], [116, 80.5], [112, 86], [107, 89]])), '"');
  if (!small) c.paint('patch', B(oe([[107, 83], [110, 80.6], [113, 81], [109, 84]])), 'j');
  c.paint('patch', B(oe([[122, 90], [133, 85], [129, 100], [118, 110, 1], [121, 99]])), ')');
  c.paint('patch', B(oe([[110, 86], [124, 84], [128, 90], [124, 92], [112, 92]])), ')');   // the socket's shadow over the eye
  if (fine) { c.furBreak(['patch', 'head'], '!', ['m', '~', '^'], { dir: (x, y) => { const [px0, py0] = T([118 + ex0, 92 + ey0]); return norm(x - px0, y - py0); }, len: 2.4, gap: 2.2, seed: 91, w: 2 }); c.furBreak('patch', '"', '!', { dir: [-0.5, -1], len: 2, gap: 2.4, seed: 92 }); c.furBreak('patch', ')', '!', { dir: [0.6, 1], len: 2, gap: 2.4, seed: 93 }); }

  // ---- ears: rose ears in iteration 04's place, folded back: rounded tips, the fold's lit ridge, a sliver of the
  // darker inner ear at the hinge ----
  c.shape('earL', B([[77, 60], [68, 63], [59, 67], [52, 72], [48.5, 77], [50, 80.5], [55, 81.5], [62, 80], [69, 77.5], [74, 73]]), 'm', nl);
  c.paint('earL', B([[50, 78], [56, 80], [64, 78.6], [71, 75], [68, 79.6], [58, 82], [50, 81]]), 'P');
  c.paint('earL', B([[74, 64], [67, 67.6], [61, 71.4], [65, 73], [71, 70.6]]), '?');
  if (!small) c.paint('earL', B([[73, 65], [68, 67.8], [70, 69]]), 'p');
  c.paint('earL', B([[77, 60], [64, 65], [52, 72], [50.6, 74], [64, 67], [76, 62.4]]), '~');
  c.shape('earR', B([[145, 59], [154, 62], [163, 66], [170, 71], [173, 76], [171.5, 79.5], [166, 80.5], [159, 79.5], [152, 77], [148, 72]]), 'P', nl);
  c.paint('earR', B([[172, 77], [166, 79.6], [158, 78.6], [151, 75], [154, 79.6], [164, 82], [172, 80]]), '?');
  c.paint('earR', B([[148, 63], [155, 66.6], [161, 70.4], [157, 72], [151, 69.6]]), 'p');
  c.paint('earR', B([[145, 59], [158, 64], [170, 71], [171.4, 73], [158, 66], [146, 61.4]]), '^');
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

  // ---- the nose rope: a thick wrinkle roll arching over the top of the nose; the stop crease between the eyes ----
  if (!small) {
    c.paint('head', B(on([[89, 95.2], [95, 92], [101, 92.4], [107, 96], [101, 94.4], [95, 94]])), 'P');
    c.paint('head', B(on([[88, 97.4], [94, 94.2], [100, 94.6], [106, 98], [100, 96.8], [94, 96.4]])), '~');
    c.paint('head', B(on([[92, 95.6], [96, 94.6], [100, 95.2], [96, 95.8]])), 'M');
    c.paint('head', B(oe([[99.6, 80], [102, 80], [102.6, 88], [101, 91], [100, 88]])), 'P');
    c.paint('head', B(oe([[98, 81], [99.6, 81], [99.4, 88], [98.4, 87]])), '~');
  } else {
    c.paint('head', B(on([[90, 96], [97, 93], [104, 96.6], [97, 95]])), 'P');
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
    brow([[FX - 8, FY - 15], [FX - 1, FY - 21.5], [FX + 8, FY - 16.5]]);
    c.paint('head', B([[NX - 8, ny + 2], [NX - 3, ny - 3], [NX + 3, ny - 3], [NX + 8, ny + 1], [NX + 3, ny - 0.6], [NX - 3, ny - 0.6]]), '~');   // the lid's lit fold
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 3, ny - 1.5], [NX + 3, ny - 1.5], [NX + 7, ny + 1]]), '0', { t: px(2.6, 2), line: false });
    c.stroke(Cv([[NX - 7, ny + 2], [NX - 10, ny + 4]]), '0', { t: px(1.6), line: false });
    if (!small) fold(NX + 0.5, ny + 6.4, 11, 1.1, 'P', null, -1.4);
    const er = small ? 4.6 : 5.4, ir = small ? 3.4 : 4, iy = FY + 1.2 + (DOGV.up ? 1.8 : 0), lidY = iy - (small ? 0.6 : 0.2);
    openEye(FX, FY + 0.4, 8, er, [FX - 3.4, iy, ir], [[FX - 9.4, FY - 7], [FX + 9.4, FY - 7], [FX + 9.4, lidY + 1.2], [FX + 4, lidY], [FX, lidY - 0.2], [FX - 9.4, lidY + 0.4]]);
    c.stroke(Cv([[FX - 7, lidY + 0.4], [FX, lidY - 0.2], [FX + 5, lidY + 0.2], [FX + 7.4, lidY + 1.6]]), '0', { t: px(2, 2), line: false });
    if (!small) c.stroke(Cv([[FX - 6, lidY - 2.6], [FX, lidY - 3.4], [FX + 6, lidY - 2.4]]), '!', { on: 'eyeF' + '', line: false });
    if (!small) c.stroke(Cv([[FX - 6, FY + er + 1.2], [FX, FY + er + 1.8], [FX + 6, FY + er + 0.8]]), '"', { on: ['patch', 'head'], line: false });
  }

  // ---- the muzzle: the nose (seen from below when the chin is up), the flews, the underbite ----
  c.paint('head', B(on([[82, 115], [96, 117], [106, 112], [112, 114], [106, 121], [93, 122.5], [82, 120]])), '^');   // the nose's cast shadow
  c.shape('nose', B(on([[74, 104], [80, 98], [92, 97], [103, 101], [103, 110], [94, 116], [82, 115], [75, 110]])), '1', nl);
  c.paint('nose', B(on([[77, 101], [84, 98], [94, 98.4], [101, 102], [96, 104.6], [86, 104.6], [79, 105]])), '2');
  c.paint('nose', B(on([[79, 101], [85, 99], [92, 99.6], [88, 102], [82, 102.6]])), '4');
  if (!small) c.paint('nose', B(on([[81, 100.6], [85, 99.6], [88, 100.4], [84, 101.4]])), '6');
  if (DOGV.up) {   // chin up: the underside of the nose faces us, two big round nostrils in it
    c.paint('nose', B(on([[75, 106], [88, 105], [103, 105], [103, 110], [94, 116], [82, 115], [75, 110]])), '0');
    c.paint('nose', B(on([[75, 106], [88, 105], [103, 105], [100, 106.6], [88, 106.4], [78, 107.4]])), '2');
    for (const cx of [81.5, 96.5]) { c.paint('nose', E(...on([[cx, 110.4]])[0], 3.4, 2.4, -0.1), '1'); c.paint('nose', E(...on([[cx + 0.4, 110.8]])[0], 2.4, 1.6, -0.1), '0'); if (!small) c.paint('nose', B(on([[cx - 3, 109], [cx, 107.6], [cx + 3, 108.6], [cx, 108.4]])), '3'); }
  } else {
    c.paint('nose', B(on([[77, 112], [86, 115], [96, 114], [102, 109], [100, 113.6], [94, 116.6], [82, 116]])), '0');
    for (const [cx, cy, d] of [[79.5, 109.5, 1], [98.5, 109, -1]]) {
      c.paint('nose', B(on([[cx - 2.6 * d, cy - 1], [cx, cy - 2.2], [cx + 2.4 * d, cy - 0.4], [cx + 1.2 * d, cy + 1.8], [cx - 1.6 * d, cy + 1.6]])), '0');
      if (!small) c.paint('nose', B(on([[cx - 2.6 * d, cy - 1.6], [cx, cy - 3], [cx + 2.6 * d, cy - 1.2], [cx, cy - 2.2]])), '3');
    }
  }
  c.dot(...T(on([[83, 100.6]])[0]), 'W', k >= 1.4 ? 1 : 0);
  c.paint('head', B(on([[87.4, 116], [90.6, 116], [90, 124], [89, 126], [88, 124]])), 'P');   // the philtrum groove
  if (!small) c.paint('head', B(on([[85.6, 117], [87.4, 117], [87.6, 124], [86.4, 123]])), '~');
  // the wide flat chin plane (the underbite's lower jaw, in front), lit on top
  const up = DOGV.up;
  c.paint('head', B(om([[74, 146], [96, 150], [120, 144], [128, 156], [112, 163], [84, 163], [70, 156]])), '^');
  c.paint('head', B(om([[80, 148.6], [96, 152], [114, 147.6], [108, 152.6], [88, 153.4]])), 'm');
  if (DOGV.blaze) {   // a cream blaze on the chin (many bulldogs have one)
    c.paint('head', B(om([[78, 147], [96, 151], [118, 145.6], [124, 155], [110, 161], [88, 161], [74, 155]])), '+');
    c.paint('head', B(om([[82, 148.6], [96, 152.4], [112, 148], [104, 153], [88, 153.6]])), 'W');
    c.paint('head', B(om([[108, 156], [122, 152], [120, 157], [110, 160.4]])), '*');
    if (fine) c.furBreak('head', '+', ['^', 'm', 'P'], { dir: [0, 1], len: 2, gap: 2.2, seed: 97 });
  }
  if (up) {   // looking down his nose: the double chin a distinct mass under the first
    c.paint('head', B(om([[72, 158], [96, 163], [124, 156], [134, 168], [110, 176], [84, 176], [70, 168]])), 'P');
    c.paint('head', B(om([[78, 160.6], [96, 165.4], [120, 159], [112, 164], [92, 166.4]])), '^');
    c.paint('head', B(om([[74, 157], [96, 162], [124, 155], [124, 157.6], [96, 164], [74, 159]])), '?');
  }
  // the upper flews over the teeth: the near one lit, the far one in half shade; core shadows underneath
  const upperFlews = (open) => {
    const dr = open ? 2.4 : 0;
    c.paint('head', B(om([[60, 120], [68, 117], [80, 117], [89, 120], [89, 125], [84, 129 - dr], [74, 129.5 - dr], [65, 126.5 - dr]])), 'm');
    c.paint('head', B(om([[89, 120], [100, 118.6], [114, 119], [124, 120], [128, 123], [122, 127.4 - dr], [110, 129 - dr], [96, 129 - dr], [89, 125]])), '^');
    c.paint('head', B(om([[62, 120.6], [70, 118], [80, 118], [86, 120.4], [78, 121.6], [68, 122.6]])), '~');
    if (!small) c.paint('head', B(om([[70, 118.6], [78, 118.4], [74, 120.2]])), 'M');
    c.paint('head', B(om([[92, 120.4], [104, 119.4], [116, 120], [104, 121.6], [94, 122.2]])), 'm');
    c.paint('head', B(om([[66, 126.5 - dr], [74, 128.8 - dr], [84, 128.4 - dr], [88, 125], [84, 130.4 - dr], [74, 131 - dr], [65, 128 - dr]])), 'P');
    c.paint('head', B(om([[92, 127.6 - dr], [110, 128.6 - dr], [122, 127 - dr], [128, 123], [122, 129.6 - dr], [110, 131 - dr], [94, 130.8 - dr]])), '?');
    if (!small) for (const [x, y] of [[71, 123], [76, 125], [81, 123], [100, 124], [106, 125.6], [112, 123.6]]) { const [a, b2] = T(om([[x, y]])[0]); const X = Math.round(c.X(a)), Y = Math.round(c.Y(b2)); c.img.set(X, Y, 'P'); c.img.set(X + 1, Y, 'P'); c.img.set(X, Y - 1, x < 89 ? 'M' : 'm'); }
  };
  // the hanging flews: heavy lobes past the mouth corners, below the jaw line (they break the silhouette), a crease under each
  const hangingFlews = () => {
    const HL = om([[57, 118], [65, 120], [70, 129], [71, 141], [67, 152], [60, 159.5], [53.4, 152], [52, 137], [53.6, 124]]);
    const HR = om([[123, 118], [132, 121], [138, 131], [140.6, 145], [138, 158], [135, 168], [129, 160], [125, 147], [124, 131]]);
    c.shape('flewL', B(HL), 'm', { line: null });
    c.paint('flewL', B(om([[56, 121], [64, 121.6], [67, 130], [62, 136], [55, 132]])), '~');
    if (!small) c.paint('flewL', B(om([[58, 123], [62, 123.4], [62, 128], [58, 127]])), 'M');
    c.paint('flewL', B(om([[52, 142], [62, 148], [69, 146], [66, 154], [60, 160], [53, 152]])), 'P');
    c.paint('flewL', B(om([[56, 152], [62, 155], [67, 152], [64, 157], [60, 160], [56, 156]])), '?');
    c.paint('flewL', B(om([[68, 126], [71, 130], [71, 142], [68, 148], [69, 138]])), '^');
    c.shape('flewR', B(HR), '^', { line: null });
    c.paint('flewR', B(om([[124, 120], [131, 122], [134, 130], [128, 133], [125, 127]])), 'm');
    c.paint('flewR', B(om([[126, 146], [136, 142], [140, 148], [138, 158], [135, 168], [129, 160]])), 'P');
    c.paint('flewR', B(om([[129, 156], [137, 154], [135, 168], [130, 162]])), '?');
    c.paint('flewR', B(om([[136, 128], [140, 138], [140, 148], [137, 140]])), 'P');
    // the creases where the lobes meet the cheek and the chin: dark, tapered
    const crease = (pts, w, col) => c.paint('head', tube(pts.map(T), (t) => (w * DSC) * Math.sin(Math.PI * (0.1 + 0.85 * t)), undefined, 10), col);
    crease(om([[52, 124], [50.6, 138], [52.6, 152], [60, 161.4]]), small ? 2.6 : 2.2, '?');
    crease(om([[72, 130], [73, 142], [69, 154]]), small ? 2 : 1.8, 'P');
    crease(om([[125, 132], [124, 146], [129, 161]]), small ? 2 : 1.8, '?');
    crease(om([[133, 120], [141, 132], [143, 148]]), small ? 2.6 : 2.2, '=');
  };
  // two lower canines poking up over the upper lip (the underbite)
  const canine = (n, bx, by, tx, ty) => {
    c.shape(n, B(om([[bx - 2.6, by], [bx + 2.6, by], [tx + 0.5, ty + 1], [tx, ty]])), 'W', nl);
    c.paint(n, B(om([[bx + 0.2, by], [bx + 2.6, by], [tx + 0.5, ty + 1], [tx + 0.1, ty + 1.4]])), '8');
    if (!small) c.paint(n, B(om([[bx - 2.6, by], [bx + 2.6, by], [bx + 2.2, by - 1], [bx - 2.2, by - 1]])), '7');
  };
  if (expr === 'grin') {
    // a lopsided grin, the patch-side (right) corner raised; upper teeth under the flews, the lower lip thrust forward
    const flat = up ? 0.6 : 1;
    c.shape('mouth', B(om([[66, 125, 1], [80, 131.6], [96, 134.6], [112, 131.6], [124, 122, 1], [120, 132 + 4 * flat], [97, 135 + 9 * flat], [76, 133 + 5 * flat]])), 'W', nl);
    c.paint('mouth', B(om([[60, 121], [130, 116], [130, 126], [112, 133.4], [96, 136.6], [80, 133.6], [60, 127]])), '?');
    c.paint('mouth', B(om([[68, 130], [80, 135.4], [96, 138.4], [112, 135.4], [122, 127], [112, 138], [96, 140.6], [80, 137.6]])), '7');
    c.paint('mouth', B(om([[72, 133 + 4 * flat], [97, 133 + 10 * flat], [120, 130 + 5 * flat], [120, 132 + 4 * flat], [97, 135 + 9 * flat], [76, 133 + 5 * flat]])), '8');
    c.paint('mouth', B(om([[112, 132], [124, 122], [121, 132], [114, 137]])), '7');
    c.paint('mouth', B(om([[118, 127], [124, 122], [121, 130]])), '6');
    c.paint('mouth', B(om([[66, 125], [71, 128], [74, 133], [68, 130]])), '=');
    c.paint('mouth', B(om([[124, 122], [122, 127], [120, 133], [122.6, 127]])), '=');
    if (!small) for (const x of [86, 96, 106]) c.paint('mouth', B(om([[x - 0.5, 136], [x + 0.5, 136], [x + 0.4, 141], [x - 0.4, 141]])), '8');
    // the lower lip, thrust forward under the teeth
    c.paint('head', B(om([[72, 136 + 3 * flat], [97, 136 + 10 * flat], [121, 131 + 5 * flat], [124, 135 + 5 * flat], [97, 140 + 10 * flat], [70, 139 + 3 * flat]])), 'P');
    c.paint('head', B(om([[74, 139 + 3 * flat], [97, 139.6 + 10 * flat], [120, 134.6 + 5 * flat], [97, 141.4 + 10 * flat], [73, 140.4 + 3 * flat]])), '^');
    upperFlews(false);
    hangingFlews();
    canine('fangN', 76.4, 136 + 3 * flat, 75.6, 128.4);
    canine('fangF', 117, 132 + 5 * flat, 118.4, 124.6);
  } else if (expr === 'laugh') {
    c.shape('mouth', B(om([[62, 122, 1], [80, 131], [96, 135], [113, 133], [130, 125, 1], [128, 140], [115, 152], [96, 156], [78, 150], [66, 137]])), '=', nl);
    c.paint('mouth', B(om([[59, 121], [80, 131], [96, 135], [113, 133], [133, 124], [131, 131], [113, 138], [96, 140], [80, 136.6], [61, 128]])), 'W');
    c.paint('mouth', B(om([[59, 121], [80, 131], [96, 135], [113, 133], [133, 124], [113, 135.6], [96, 137.4], [80, 133.4]])), '7');
    c.paint('mouth', B(om([[76, 147], [88, 142], [104, 141], [116, 144], [122, 148], [108, 153], [90, 153]])), 'P');
    c.paint('mouth', B(om([[88, 147.6], [104, 146], [113, 148], [106, 151], [92, 151]])), '^');
    // the lower teeth row along the thrust-forward jaw
    c.paint('mouth', B(om([[74, 147], [96, 152.6], [120, 145], [122, 148.6], [96, 156], [72, 150]])), 'W');
    c.paint('mouth', B(om([[96, 155], [122, 147.6], [122, 148.6], [96, 156], [72, 150], [74, 149]])), '8');
    c.paint('head', B(om([[70, 150], [96, 156.6], [124, 148], [126, 152], [96, 160], [68, 153]])), 'P');
    upperFlews(true);
    hangingFlews();
    canine('fangN', 77, 149, 76.4, 140.6);
    canine('fangF', 118, 147.6, 119, 139.4);
  } else {
    c.shape('mouth', E(95 + mx0, 141 + my0, 7, 8.5), '=', nl);
    c.paint('mouth', E(95 + mx0, 146 + my0, 5, 3), '?');
    c.paint('mouth', E(94 + mx0, 147 + my0, 3, 1.4), 'P');
    c.paint('mouth', E(95 + mx0, 134.6 + my0, 6, 1.8), '7');
    c.paint('head', B(om([[84, 149], [95, 151.4], [106, 149], [108, 152.4], [95, 155], [82, 152.4]])), 'P');
    upperFlews(false);
    hangingFlews();
    canine('fangN', 89.4, 150.6, 89.8, 143.4);
    canine('fangF', 100.6, 150.6, 100.2, 143.4);
  }

  // ---- the silhouette: coloured lines per material; the lit side softer (b, c lose it on the skin) ----
  if (fine) c.despeckle(null, ['W', '6', 'j', 'M', '`', '}', 'P', 'm', '8', '7']);
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
