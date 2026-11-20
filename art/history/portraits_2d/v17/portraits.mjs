// M4.8 (Ivan: "let's focus on getting quality closer to raccoon-ref_03.jpg ... I want the artist agent to be far more
// creative ... make sure the pump is straight"): the hero portraits, drawn as 2D pixel art on the posters' 232 x 208 grid
// at any scale (tools/lib/draw2d.mjs: tufted fur edges, fur strokes at tone boundaries, hue-shifted ramps, a selective
// coloured silhouette). Round 04 onward refines one direction:
// - Trash Panda stands on short legs behind its floor pump like a cane, both paws stacked on the T-handle, weight on one
//   leg, the ringed tail curling out behind; red bandana, teal pump, a cycling cap. The pump is straight by construction.
// - Dog Fjord, a cartoon bulldog (never a real person's likeness): M4.7 iteration 04's head and ears, chin up and
//   looking down his nose, the smug heavy-lidded patch eye, an underbite with two lower canines, soft heavy flews, sunk
//   into broad navy shoulders, the gold tie with little red cars, a flag pin.
import { Canvas, blob, curve, ell, bar, tube, tufted } from '../lib/draw2d.mjs';

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ============================== THE RACCOON ==============================
// Drawn in the cool fur keys 0..8 and moved to the warm taupe ramp at the end (fur parts only). Light from the upper
// left. The head keeps round 01's design units; the picture frames it at RZ about the head (the head stays as big as a
// bust portrait's: the body is short and stout, chibi-like, rather than the head smaller).
const RZ = 1.0, ROX = 126 - 134 * RZ, ROY = 68 - 80 * RZ;   // visible window in design units: x 8..240, y 12..220
const ACC = { pump: [':', 'f', 'F', ';', 'W'], head: 'cap' };

/**
 * a floor pump on ONE straight axis: `foot` the centre of the foot plate, `ang` the axis direction toward the handle,
 * `L` its length in design units. The parts are laid out in real units (foot, caps, barrel, rod, T-handle square to
 * the axis), so a short pump keeps its proportions instead of squashing; nothing can bend; only the hose curves.
 * The gauge is a round dial facing the viewer at `gaugeS` along the axis. Returns { at(s, o) }.
 */
function pumpAxis(c, foot, ang, L, { ramp, fine = true, gaugeS = 30, hose = null, bw = 13, rod = null, hw = 25, gr = 8.4 } = {}) {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  let nx = -uy, ny = ux;
  if (-nx - ny < 0) { nx = -nx; ny = -ny; }   // n points to the lit side
  const at = (s, o = 0) => [foot[0] + ux * s + nx * o, foot[1] + uy * s + ny * o];
  const strip = (s0, s1, o, w) => bar(at(s0, o), at(s1, o), w);
  const box = (s0, s1, w) => bar(at(s0), at(s1), w);
  const glint = (s, o) => { const [x, y] = at(s, o); c.dot(x, y, 'W'); };
  const RL = rod ?? Math.max(6, Math.min(30, 0.18 * L)), B1 = L - RL - 9;   // the rod showing, the barrel's top
  const q = bw / 13;   // the barrel's details scale with its width
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
  c.shape('barrel', box(12, B1, bw), base, { line: null });
  c.paint('barrel', strip(12, B1, 4.3 * q, 2.8 * q), lit);
  c.paint('barrel', strip(12, B1, 3.4 * q, 0.9), shine);
  c.paint('barrel', strip(12, B1, -2.8 * q, 3.2 * q), dark);
  c.paint('barrel', strip(12, B1, -5.0 * q, 1.8 * q), deep);
  c.paint('barrel', strip(12, B1, -6.2 * q, 0.7), dark);
  if (fine) for (let s = B1 - 26; s < B1 - 4; s += 4) if (s > 14 && Math.abs(s - gaugeS) > gr + 2.6) c.paint('barrel', box(s, s + 1.1, bw + 0.4), dark);
  // the caps (chrome): bright edge, dark core, reflected light, a glint
  for (const [s0, s1] of [[6, 13], [B1 - 2, B1 + 5]]) {
    const n = 'cap' + Math.round(s0);
    const cw = bw + 5, cq = cw / 18;
    c.shape(n, box(s0, s1, cw), '6', { line: null });
    c.paint(n, strip(s0, s1, -6 * cq, 6 * cq), '4');
    c.paint(n, strip(s0, s1, -8.2 * cq, 1.4), '6');
    c.paint(n, strip(s0, s1, 5.2 * cq, 2.6 * cq), '8');
    if (fine) glint((s0 + s1) / 2, 6 * cq);
  }
  // the rod and the T-handle square to the axis
  c.shape('rod', box(B1 + 5, L - 2, 4.2), '6', { line: null });
  c.paint('rod', strip(B1 + 5, L - 2, 1.1, 1.1), '8');
  c.paint('rod', strip(B1 + 5, L - 2, -1.4, 1.2), '3');
  if (fine && RL > 10) glint(B1 + 5 + RL * 0.5, 1.2);
  const hc = at(L);
  const hA = (o, d = 0) => [hc[0] + nx * o + ux * d, hc[1] + ny * o + uy * d];
  c.shape('handle', bar(hA(-hw), hA(hw), 7, true), '3', { line: null });
  for (const s of [-1, 1]) {
    const g = 'grip' + s;
    c.shape(g, bar(hA(s * 8), hA(s * hw), 8.6, true), '2', { line: null });
    c.paint(g, bar(hA(s * 8, 2.6), hA(s * (hw + 1), 2.6), 1.8), '4');
    c.paint(g, bar(hA(s * (hw - 7), 2.2), hA(s * (hw + 0.5), 2.2), 0.9), '6');   // the grip's highlight
    c.paint(g, bar(hA(s * 8, -2.8), hA(s * (hw + 1), -2.8), 2), '1');
    if (fine) for (let o = 11; o < hw - 1; o += 3) c.paint(g, bar(hA(s * o, -3.6), hA(s * o, 3.6), 0.9), '1');
  }
  c.shape('boss', bar(at(L - 5), at(L + 5), 8.4), '6', { line: null });
  c.paint('boss', strip(L - 5, L + 5, -2.6, 1.8), '3');
  c.paint('boss', strip(L - 5, L + 5, 2.4, 1.6), '8');
  if (fine) glint(L, 2.6);
  // the gauge: a round dial facing the viewer, a chrome bezel, ticks, a red needle
  const g = at(gaugeS);
  const gq = gr / 8.4;
  c.shape('gauge', ell(g[0], g[1], gr, gr), '4', { line: null });
  c.paint('gauge', ell(g[0] - 0.7 * gq, g[1] - 0.7 * gq, 7.5 * gq, 7.5 * gq), '7');
  c.paint('gauge', ell(g[0], g[1], 6.3 * gq, 6.3 * gq), 'W');
  c.paint('gauge', ell(g[0] + 1.5 * gq, g[1] + 1.7 * gq, 5.6 * gq, 5.6 * gq).filter((_, i) => i > 2 && i < 18), '8');
  if (fine) { for (let a = -3.8; a <= 0.7; a += 0.75) c.dot(g[0] + Math.cos(a) * 4.8 * gq, g[1] + Math.sin(a) * 4.8 * gq, '3'); c.dot(g[0] - 5.2 * gq, g[1] - 3.2 * gq, 'W'); }
  c.stroke([g, [g[0] + 3.6 * gq, g[1] - 2.8 * gq]], 'R', { on: 'gauge', t: 1, line: false });
  c.dot(g[0], g[1], '1');
  return { at, nx, ny, ux, uy };
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
    c.paint(n, ell(...P(9.4, b0), 1.6 * z, 1.3 * z), '5');                                                            // the knuckle
    c.dot(...P(9.2, b0 + litB * 0.6), '6'); if (fine) c.dot(...P(9, b0 + litB * 0.9), '7');
    const ct = P(9.6 + L + 1.3, b1 * 1.04 + curl * 1.8);
    c.dot(ct[0], ct[1], '7');
  }
  c.shape(name + 't', tube([P(2.6, thumb * 5.6), P(5.6, thumb * 8.6), P(8.6, thumb * 9.6)], (t) => (3.8 - 1 * t) * z), '2', { line: null, inner: '0' });
  c.paint(name + 't', ell(...P(4, thumb * 7), 1.4 * z, 1.1 * z), '4');
  c.dot(...P(9.8, thumb * 9.8), '7');
}

const HEADC = [186, 92];   // fur flows away from the nose
const headFlow = (x, y) => norm(x - HEADC[0], (y - HEADC[1]) + 0.25 * Math.abs(x - HEADC[0]));

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k * RZ, k * ROX, k * ROY);
  const fine = k >= 0.9;
  const nl = { line: null };
  const fur = (on, a, b, dir, len, gap, seed, w = 1, shapes = null) => { if (fine) c.furBreak(on, a, b, { dir, len, gap, seed, w, shapes }); };

  // ---- the pump's place: planted on the floor (the frame's bottom edge), the T-handle at chest height ----
  const FLOOR = 216, PX = 128, HY = 138;
  const AXP = { foot: [PX, FLOOR - 3], top: [PX, HY] };
  const ANG = -Math.PI / 2, PL = AXP.foot[1] - AXP.top[1];

  // ---- the ringed tail, out from behind the hips and curling to the lower right (well away from the paws) ----
  const tailC = [[146, 184], [172, 196], [198, 192], [213, 177], [216, 156]];
  const tailW = (t) => 13 + 12 * Math.sin(Math.PI * Math.min(1, t * 1.08)) - 8 * t * t;
  const tailFlow = (x, y) => norm(x - 186, y - 172);
  c.shape('tail', tufted(tube(tailC, tailW, undefined, 14), { amp: 2.2, period: 7, where: (x, y) => (x > 196 ? 1.2 : 0.5), flow: tailFlow, lean: 0.5, seed: 4 }), '5', nl);
  c.rim('tail', -1.8, -1.8, '6', { only: ['5'] });
  c.rim('tail', 2.4, 2.4, '4', { only: ['5', '6'] });
  {
    // rings that wrap the cylinder: each band bows along the tail, lit on its upper side, darkest on the shadow side
    const cc = curve(tailC, 14), n = cc.length;
    for (const f of [0.26, 0.45, 0.63, 0.79]) {
      const i = Math.round(f * (n - 1)), a = cc[Math.max(0, i - 2)], b = cc[Math.min(n - 1, i + 2)];
      const [dx, dy] = norm(b[0] - a[0], b[1] - a[1]), nx = -dy, ny = dx, p = cc[i], u = 3.2, bow = 2.4, R = 15;
      const ring = blob([[p[0] - nx * R - dx * u, p[1] - ny * R - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + nx * R - dx * u, p[1] + ny * R - dy * u],
        [p[0] + nx * R + dx * u, p[1] + ny * R + dy * u], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - nx * R + dx * u, p[1] - ny * R + dy * u]], 6);
      c.paint('tail', ring, '1');
      c.paint('tail', blob([[p[0] - nx * R - dx * u, p[1] - ny * R - dy * u], [p[0] - dx * (u - bow), p[1] - dy * (u - bow)], [p[0] + dx * (u + bow), p[1] + dy * (u + bow)], [p[0] - nx * R + dx * u, p[1] - ny * R + dy * u]], 6), '2', { only: ['1'] });
      // a lit fur rim along the ring's upper edge (toward the light): the ring lit, then the ring shifted away from the light re-darkened
      c.paint('tail', ring, '3', { only: ['1', '2'] });
      c.paint('tail', ring.map(([x, y]) => [x + 1.6, y + 1.6]), '1', { only: ['3'] });
    }
    // the tapered dark tip, broken by lit fur strokes
    const ti = Math.round(0.9 * (n - 1));
    c.paint('tail', blob([...cc.slice(ti).map(([x, y]) => [x - 14, y]), ...cc.slice(ti).reverse().map(([x, y]) => [x + 14, y])]), '1');
    c.paint('tail', ell(cc[n - 1][0], cc[n - 1][1] + 2, 9, 7), '1');
  }
  fur('tail', '1', ['5', '6', '4'], tailFlow, 2.8, 2.6, 48, 2);
  fur('tail', '5', '1', (x, y) => tailFlow(x, y).map((v) => -v), 2.6, 2.8, 49, 2);
  fur('tail', '6', '1', (x, y) => tailFlow(x, y).map((v) => -v), 2.2, 3, 50);
  if (fine) c.furStrokes('tail', blob([[200, 150], [226, 150], [226, 172], [200, 172]]), '3', { only: ['1', '2'], dir: [0.3, -1], len: 3, gap: 3.2, seed: 51 });
  if (fine) c.furStrokes('tail', null, '3', { only: ['1'], dir: (x, y) => tailFlow(x, y).map((v) => -v), len: 2.6, gap: 3.6, seed: 53, prob: 0.8 });   // light catching the ring fur
  if (fine) c.furStrokes('tail', null, '7', { only: ['6'], dir: tailFlow, len: 2.6, gap: 4, seed: 54, prob: 0.7 });

  // ---- the legs: short and stout; the weight on the far leg (its hip higher), the near leg relaxed and turned out ----
  const leg = (name, pts, w0, w1, seed) => {
    c.shape(name, tube(pts, (t) => w0 + (w1 - w0) * t, undefined, 10), '4', { line: null, inner: '2' });
    c.rim(name, -2.2, -1.6, '5', { only: ['4'] });
    c.rim(name, 2.4, 1.6, '3', { only: ['4', '5'] });
    fur(name, '5', '4', [0, 1], 2.8, 3, seed, 2); fur(name, '4', '3', [0.2, 1], 2.6, 3.2, seed + 1);
  };
  leg('legL', [[106, 178], [100, 196], [96, 207]], 22, 15, 90);
  leg('legR', [[152, 176], [156, 194], [158, 207]], 23, 16, 92);
  c.rim('legL', -1.4, -1.2, '6', { only: ['5'] });
  c.rim('legL', 2.4, 0, '2', { only: ['4', '3'] });   // occlusion between the legs
  c.rim('legR', -2.4, 0, '2', { only: ['4', '5', '3'] });
  c.paint('legL', blob([[97, 179], [107, 177], [109, 189], [102, 196], [96, 189]]), '6');   // the near thigh catches the light
  c.paint('legL', blob([[98, 180], [104, 179], [104, 186], [99, 186]]), '7');
  fur('legL', '6', ['4', '5'], [0.1, 1], 2.8, 2.4, 94, 2);
  if (fine) c.furClusters(['legL', 'legR'], null, '3', { only: ['4'], dir: [0.25, 1], len: 6.4, gap: 8, density: k >= 1.4 ? 1 : 0.35, seed: 95, ang: 0.2 });
  // the big dark hind feet, planted either side of the pump's foot plate; toes with light knuckles and claws
  const foot = (name, pts, toes) => {
    c.shape(name, blob(pts), '2', { line: null, inner: '1' });
    c.rim(name, -1.6, -1.8, '3', { only: ['2'] });                          // the lit top edge
    c.rim(name, -0.8, -1, '4', { only: ['3'] });
    c.paint(name, blob(pts.slice(0, 3).concat([[pts[2][0], pts[2][1] + 4], [pts[0][0], pts[0][1] + 4]])), '1', { only: ['2'] });   // the heel's shade
    toes.forEach(([x, y], i) => {
      c.paint(name, ell(x, y - 0.4, 3.4, 3), '2');                            // the toe lobe
      c.paint(name, ell(x - 0.6, y - 1.4, 2, 1.3), '3');
      c.dot(x - 0.8, y - 1.8, '4');
      if (i) c.paint(name, bar([x - 3.6, y - 2], [x - 3.4, y + 2.4], 0.9), '1');   // the gap between toes
      c.paint(name, ell(x + 0.2, y + 1.6, 1.6, 0.9), '5');                    // the lit pad under the toe
      c.dot(x, y + 3, '7');                                                   // the claw
    });
  };
  foot('footL', [[86, 202], [102, 201], [110, 206], [110, 212], [104, 216], [84, 216.5], [76, 213], [78, 206]], [[81, 212.6], [88, 213.4], [95, 213.4], [102, 212.6]]);
  foot('footR', [[150, 202], [166, 201], [176, 206], [178, 212], [172, 216.5], [152, 216.5], [147, 212]], [[154, 213.2], [161, 213.6], [168, 213.2], [174.4, 211.6]]);

  // ---- the torso, blocked in as masses first: round shoulders, the chest, a waist, hips shifted toward the weight leg ----
  // the silhouette stays calm; fur tufts only at the hip sides and the belly side
  const bodyPts = tufted(blob([[104, 110], [92, 117], [86, 130], [88, 146], [92, 158], [90, 170], [96, 182], [112, 189], [132, 191], [150, 189], [164, 181], [168, 168], [164, 157], [168, 143], [168, 128], [160, 116], [146, 110]]),
    { amp: 3, period: 7.5, where: (x, y) => (y > 164 && y < 188 && (x < 100 || x > 158) ? 1 : 0), flow: [0, 1], lean: 0.9, seed: 2 });
  c.shape('body', bodyPts, '5', nl);
  // the shadow side: a broad half-tone and a clear core shadow down the right of the chest, waist and hip
  c.paint('body', blob([[152, 113], [170, 126], [170, 146], [166, 158], [170, 176], [160, 190], [148, 192], [154, 172], [157, 152], [158, 132]]), '4');
  c.paint('body', blob([[163, 124], [172, 138], [168, 156], [172, 174], [163, 188], [160, 170], [163, 152]]), '3');
  // the hips and the belly turn under, toward the legs
  c.paint('body', blob([[92, 176], [112, 184], [132, 186], [152, 184], [168, 174], [166, 194], [92, 194]]), '4');
  // the lit near flank and shoulder
  c.paint('body', blob([[90, 122], [99, 115], [101, 134], [97, 150], [92, 146]]), '6');
  c.paint('body', blob([[93, 120], [99, 116], [98, 128], [94, 130]]), '7');
  // the pale bib following the chest, lit from the upper left, turning away on the right; its lower edge in fur
  c.paint('body', tufted(blob([[106, 112], [150, 112], [154, 128], [150, 146], [140, 160], [128, 166], [116, 160], [106, 146], [102, 128]]), { amp: 4, period: 8, where: (x, y) => (y > 146 ? 1 : 0), flow: [0, 1], lean: 0.6, seed: 52 }), '7');
  c.paint('body', blob([[110, 114], [138, 114], [141, 126], [133, 139], [121, 143], [110, 133]]), '8');
  c.paint('body', blob([[142, 116], [153, 128], [149, 146], [140, 160], [144, 144], [146, 130]]), '6');
  c.paint('body', blob([[100, 110], [128, 116], [156, 110], [150, 122], [128, 127], [106, 122]]), '4');   // the head's shadow on the chest
  fur('body', '7', '5', [0, 1], 3.4, 3, 40, 2); fur('body', '8', '7', [0, 1], 3, 2.8, 41, 2); fur('body', '7', '6', [0, 1], 3, 3, 46, 2);
  fur('body', '5', '4', [0.2, 1], 3.4, 3.2, 43, 2); fur('body', '4', '3', [0.3, 1], 3, 3.4, 44); fur('body', '6', '5', [0, 1], 3, 3, 45, 2);
  c.rim('body', -1.8, -1.4, '7', { only: ['5', '6'] });   // the lit rim down the near side
  // the bandana's cast shadow, the occlusion under the T-handle and the paws
  c.paint('body', blob([[94, 122], [126, 126], [166, 118], [170, 128], [158, 138], [148, 150], [138, 166], [126, 150], [110, 138], [96, 132]]), '3', { only: ['5', '6', '7', '8', '4'] });
  c.paint('body', blob([[100, 140], [128, 142], [158, 140], [156, 147], [128, 150], [102, 147]]), '4', { only: ['5', '6', '7', '8'] });
  // fur clusters following the form: the bib flowing down and out from the throat, the belly turning under
  if (fine) {
    const bibFlow = (x, y) => norm(x - 128, y - 100);
    const bellyFlow = (x, y) => { const v = norm(x - 128, y - 140); return norm(v[0] * 0.8, Math.abs(v[1]) + 0.6); };
    const bd = k >= 1.4 ? 1 : 0.35;
    const lowerBib = blob([[100, 138], [156, 138], [150, 160], [128, 172], [106, 160]]);
    c.furClusters('body', lowerBib, '6', { only: ['7'], dir: bibFlow, len: 7.4, gap: 9, density: bd, seed: 111, ang: 0.2 });
    c.furClusters('body', null, '8', { only: ['7'], dir: bibFlow, len: 6, gap: 13, density: bd, seed: 112, ang: 0.2 });
    c.furClusters('body', null, '4', { only: ['5'], dir: bellyFlow, len: 7.4, gap: 8.4, density: bd, seed: 113, ang: 0.22 });
    c.furClusters('body', null, '3', { only: ['4'], dir: bellyFlow, len: 7, gap: 8.6, density: bd, seed: 114, ang: 0.22 });
    c.despeckle('body', ['7', '8']);
  }
  // the belly turns under (one more shadow shape), highlight clusters on the near shoulder
  c.paint('body', blob([[100, 180], [128, 186], [156, 180], [152, 190], [128, 194], [104, 190]]), '3', { only: ['4', '5'] });
  c.paint('body', blob([[90, 120], [98, 115], [102, 122], [97, 132], [91, 130]]), '7');
  fur('body', '7', ['5', '6'], [0, 1], 2.8, 2.4, 115, 2);

  // ---- the arms, rooted at the shoulders: down to elbows that flare out, the forearms up to the T-handle ----
  const arm = (name, pts, w0, w1, flow, seed, elbow, side = 0) => {
    const path = tube(pts, (t) => w0 + (w1 - w0) * t * t, undefined, 12);
    c.paint('body', tube(pts.map(([x, y]) => [x + 2.2, y + 3]), (t) => w0 + 1 + (w1 - w0) * t * t, undefined, 12), '4');   // the contact shadow
    c.shape(name, tufted(path, { amp: 2.8, period: 6, where: (x, y) => (Math.hypot(x - elbow[0], y - elbow[1]) < 10 ? 1 : 0), flow, lean: 0.7, seed }), '4', { line: null, inner: '1' });
    c.rim(name, -2.6, -2.6, '5', { only: ['4'] });
    c.rim(name, -1.2, -1.2, '6', { only: ['5'] });
    c.rim(name, 3, 3, '3', { only: ['4', '5'] });
    fur(name, '5', '4', flow, 3.2, 3.2, seed + 1, 2); fur(name, '4', '3', flow, 3, 3.4, seed + 2, 2);
    if (side) {   // an upper arm: one value darker than the torso, a lit rim on its outer edge, an occlusion crease inside
      c.paint(name, null, '3', { only: ['4'] }); c.paint(name, null, '4', { only: ['5'] });
      c.rim(name, -2 * side, -0.6, side < 0 ? '6' : '4', { only: ['3', '4', '5'] });
      c.rim(name, 2.2 * side, 0, '1', { only: ['3', '4', '2'] });
      fur(name, '4', '3', flow, 3, 3, seed + 3, 2);
    }
  };
  // upper arms drop from the shoulders to a clear elbow bend (tucked in), the forearms rise to the paws on the grips
  c.paint('body', blob([[96, 126], [103, 130], [102, 144], [95, 141]]), '2');   // the near armpit
  c.paint('body', blob([[161, 126], [154, 130], [155, 144], [162, 141]]), '2');   // the far armpit
  arm('armL', [[100, 120], [83, 153]], 19, 15, [-0.3, 1], 70, [81, 155], -1);
  arm('armR', [[157, 120], [174, 152]], 18, 14, [0.3, 1], 60, [176, 154], 1);


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
  // the forearms rise in front of the bandana to the paws on the T-bar
  // (darker toward the paws, as a raccoon's are: a dark core, a lit edge on the side toward the light, a contact line)
  const fore = (name, pts, w0, w1, flow, seed) => {
    c.paint('body', tube(pts.map(([x, y]) => [x + 2, y + 2.6]), (t) => w0 + 1 - (w0 - w1) * t, undefined, 10), '3');
    c.shape(name, tufted(tube(pts, (t) => w0 - (w0 - w1) * t, undefined, 10), { amp: 2.4, period: 6, where: (x, y) => (Math.hypot(x - pts[0][0], y - pts[0][1]) < 7 ? 1 : 0), flow, lean: 0.7, seed }), '3', { line: null, inner: '1' });
    c.paint(name, tube(pts.map(([x, y]) => [x, y]), (t) => (w0 - (w0 - w1) * t) * 0.45, undefined, 10).map(([x, y]) => [x + 0.6, y + 0.6]), '2');
    c.rim(name, -1.8, -1.6, '4', { only: ['3', '2'] });
    c.rim(name, -0.9, -0.8, '5', { only: ['4'] });
    fur(name, '4', ['3', '2'], flow, 2.6, 2.6, seed + 1, 2); fur(name, '3', '2', flow, 2.2, 2.8, seed + 2);
  };
  fore('foreL', [[83, 153], [90, 136], [99, 119]], 14, 10, [0.5, 0.8], 74);
  fore('foreR', [[174, 152], [166, 135], [157, 118.6]], 13, 10, [-0.5, 0.8], 64);
  c.paint('foreL', tube([[82.4, 150], [88, 136], [96, 121.6]], (t) => 2.2 - 0.8 * t, undefined, 8).map(([x, y]) => [x - 2.6, y - 0.6]), '5');   // the lit ridge
  c.paint('foreL', tube([[82.4, 150], [88, 136], [96, 121.6]], (t) => 1 - 0.4 * t, undefined, 8).map(([x, y]) => [x - 3.2, y - 0.8]), '6');
  c.paint('foreR', tube([[172, 149], [165, 135], [158.6, 122]], (t) => 1.6 - 0.6 * t, undefined, 8).map(([x, y]) => [x - 2, y - 1]), '4');
  for (const [n, x, y, d] of [['foreL', 99, 121, -1], ['foreR', 157, 120.6, 1]]) c.shape(n + 'Tuft', tufted(ell(x, y + 1, 6, 4), { amp: 2.2, period: 3.6, flow: [d * 0.3, 1], lean: 0.6, seed: 120 + d }), '4', { line: null, inner: '2' });

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

  {   // the cycling cap: a round crown in panels, stripes front to back, a 3-tone brim flipped up; tilted for attitude
    const rot = ([x, y, s]) => { const a2 = -0.07, X = 140 + (x - 140) * Math.cos(a2) - (y - 44) * Math.sin(a2), Y = 44 + (x - 140) * Math.sin(a2) + (y - 44) * Math.cos(a2); return s ? [X, Y, 1] : [X, Y]; };
    const capB = (pts) => blob(pts.map(rot));
    const cap = capB([[108, 49], [110, 39], [118, 31], [130, 26], [145, 25.5], [158, 29], [167, 37], [172, 48], [160, 47], [140, 46], [122, 47]]);
    c.shape('cap', cap, '8', nl);
    c.paint('cap', capB([[108, 49], [110, 39], [118, 31], [128, 27], [122, 36], [118, 48]]), 'W');
    c.paint('cap', capB([[152, 28], [162, 33], [169, 41], [172, 48], [160, 47], [158, 38]]), '6');
    c.paint('cap', capB([[160, 34], [167, 38], [171, 46], [166, 47], [164, 40]]), '5');
    c.paint('cap', capB([[131, 47], [131, 37], [136, 28.5], [142, 26.5], [139, 36], [138, 46.5]]), 'F');
    c.paint('cap', capB([[136, 46.5], [136.5, 37], [140.5, 28], [142.5, 27], [140.4, 37], [139.6, 46.5]]), 'f');
    c.paint('cap', capB([[141, 46.5], [143, 37], [148, 28], [152, 29], [147, 37.5], [146, 46.5]]), 'R');
    c.paint('cap', capB([[145, 46.5], [147, 38], [151, 29], [152.5, 29.6], [148.6, 38], [148, 46.5]]), '[');
    if (fine) for (const sm of [[[121, 30], [116, 40], [114, 48]], [[157, 30], [162, 40], [164, 47]]]) c.stroke(curve(sm.map(rot)), '7', { on: 'cap', line: false });
    c.paint('cap', capB([[108, 46], [140, 44.5], [172, 46], [172, 50], [140, 48.6], [108, 50]]), 'r');   // the band
    c.paint('cap', capB([[108, 46], [124, 45.2], [124, 47], [108, 48]]), '[');
    c.dot(...rot([142, 26]), '6');
    // the brim, flipped up over the forehead's front: lit top face, body, shaded underside, a dark edge
    c.shape('brim', capB([[160, 47], [164, 40], [172, 34], [182, 31], [188, 33], [186, 38], [178, 44], [170, 50]]), 'R', nl);
    c.paint('brim', capB([[164, 42], [172, 35.5], [182, 32], [187, 33.4], [180, 36], [170, 41]]), 'q');
    c.paint('brim', capB([[166, 47], [176, 42], [184, 37.6], [186, 38], [178, 44], [170, 50]]), '[');
    c.paint('brim', capB([[170, 48.4], [178, 43.6], [185, 39], [178, 45], [171, 50]]), 'r');
    c.paint('head', capB([[110, 49], [140, 48], [170, 50], [167, 52.6], [140, 51.2], [112, 51.4]]), '3');   // its shadow on the brow
  }
  // ---- fur INSIDE the zones (ref 03): clustered strands in each zone's neighbouring tones, following the fur's flow;
  // calm zones round the eyes and the nose; half the density at k = 1 ----
  {
    const big = k >= 1.4, dens = big ? 1 : k >= 0.9 ? 0.3 : 0;
    const calm = [[122, 77, 12.5], [161, 75, 10], [188, 92, 9.5]];
    const fc = (on, color, only, dir, len, gap, seed, shapes = null, dmul = 1) => c.furClusters(on, shapes, color, { only, dir, len, gap, density: dens * dmul, avoid: calm, seed, ang: 0.26, lenVar: 0.5 });
    // the flows: the mask out of the eye corners and back toward the ears; the muzzle radiating from the nose and
    // curving down along the jaw; the forehead fanning upward; the brows combed outward
    const maskFlow = (x, y) => { const e = x < 142 ? [122, 77] : [161, 75], v = norm(x - e[0], y - e[1]); return norm(v[0] * 0.7 - 0.7, v[1] * 0.7 - 0.25); };
    const muzzleFlow = (x, y) => { const v = norm(x - 190, y - 92); return norm(v[0], v[1] + 0.6 * Math.min(1, Math.hypot(x - 190, y - 92) / 40)); };
    const foreFlow = (x, y) => norm(x - 140, y - 96);
    const browFlow = (x, y) => norm(x - 146, y - 72);
    const ruffs = [blob([[74, 90], [100, 94], [124, 104], [128, 116], [108, 126], [84, 120], [70, 106]]), blob([[168, 96], [194, 102], [190, 118], [172, 114]])];
    const muzzleShade = [blob([[148, 99], [176, 104], [192, 99], [188, 108], [170, 112], [150, 108]]), blob([[124, 98], [140, 96], [150, 106], [146, 116], [132, 118], [124, 110]]), blob([[140, 110], [176, 110], [170, 120], [146, 122]])];
    const brows = [blob([[90, 66], [98, 56], [112, 51], [126, 50], [138, 55], [136, 61], [122, 59], [108, 62], [96, 68]]), blob([[150, 59], [158, 51], [170, 49], [182, 56], [176, 61], [164, 57], [154, 62]])];
    if (big) {
      fc(['head', 'snout'], '8', ['W'], muzzleFlow, 4.6, 6.2, 201, muzzleShade, 0.45);   // the muzzle: only in the turning-away zones
      fc(['head', 'snout'], '7', ['8'], muzzleFlow, 4.2, 7, 202, muzzleShade, 0.45);
      fc('head', '8', ['W'], browFlow, 4.4, 6, 210, brows);                               // the brows: combed strokes
      fc('head', '7', ['8'], browFlow, 3.8, 8, 212, brows);
      fc('head', '7', ['8'], (x, y) => norm(x < 140 ? -0.6 : 0.6, 1), 6, 7, 211, ruffs);  // the cheek ruffs: longer strokes
      fc('head', '6', ['7'], (x, y) => norm(x < 140 ? -0.6 : 0.6, 1), 6, 8, 213, ruffs);
    }
    fc('head', '2', ['1'], maskFlow, 4.6, 6, 203);                                          // the mask: out of the eye corners
    fc('head', '1', ['0'], maskFlow, 3.6, 7, 205);
    if (big) fc('head', '3', ['2'], maskFlow, 3.8, 6.4, 204);
    fc('head', '6', ['5'], foreFlow, 4.8, 6, 206);                                          // the forehead and crown: fanning up
    fc('head', '4', ['5'], foreFlow, 4.4, 6.6, 207);
    if (big) { fc('head', '7', ['6'], foreFlow, 4, 6.6, 208); fc('head', '5', ['4'], foreFlow, 3.8, 7, 209); }
    c.despeckle(['head', 'snout'], ['W', String.fromCharCode(96), '}', '7', '8']);
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


  // ---- the pump, planted in front (full length: foot plate on the floor, T-handle at chest height) ----
  pumpAxis(c, AXP.foot, ANG, PL, { ramp: ACC.pump, fine, gaugeS: 17.6, bw: 8.6, rod: 16.4, hw: 37, gr: 6.8, hose: [[105, 212], [92, 216.4], [74, 216.6], [60, 213.4], [48, 215.6]] });
  // ---- both paws stacked on the T-handle: the far one on the boss, the near one over it, fingers curling over the bar ----
  flatPaw(c, 'pawR', 152, 121, Math.PI * 0.6, { z: 1.32, thumb: -1, fine });
  flatPaw(c, 'pawL', 103.4, 121.6, Math.PI * 0.39, { z: 1.36, thumb: 1, fine });
  for (const [a, p] of [['foreR', 'pawR'], ['foreL', 'pawL']]) {
    if (!fine) continue;
    c.furBreak([a, p], '4', ['2', '3'], { dir: [0, 1], len: 3, gap: 2.2, seed: 80, w: 2 });
    c.furBreak([a, p], '5', ['2', '3'], { dir: [0, 1], len: 2.6, gap: 2.4, seed: 81 });
  }

  // ---- the warm coat: every fur tone moves to the taupe ramp (the pump, neckwear and eyes keep theirs) ----
  {
    const map = { 0: '@', 1: '#', 2: '$', 3: 'I', 4: '%', 5: '&', 6: 'J', 7: '*', 8: '+' };
    const furParts = ['tail', 'body', 'armL', 'armR', 'foreL', 'foreR', 'foreLTuft', 'foreRTuft', 'legL', 'legR', 'footL', 'footR', 'earL', 'earR', 'head', 'snout', 'nose', 'eyeN', 'eyeF',
      ...['pawL', 'pawR'].flatMap((p) => [p, p + 't', p + 'f0', p + 'f1', p + 'f2', p + 'f3'])].map((n) => c.id(n));
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
// the face's layout: chin a touch up (offsets for the eyes and the nose); the wide bulldog mouth is laid out below in
// its own coordinates, low and wide (about 70% of the head's width, as iteration 04's grin)
const DOGV = { e: [1, -4], n: [1, -5], m: [0, 0] };

// the suit: broad shoulders hunched up round the jowls (he sinks into them), navy, the gold tie with little red cars,
// a red-and-white flag pin
function dogSuit(c, small, px) {
  const nl = { line: null };
  const [base, lit, dark, mid] = ['u', '_', ',', 'U'];
  c.shape('suit', B([[38, 214, 1], [38, 180], [44, 160], [60, 146], [84, 150], [130, 150], [154, 144], [172, 152], [180, 174], [182, 214, 1]]), base, nl);
  c.paint('suit', B([[30, 168], [64, 156], [86, 160], [70, 178], [60, 214], [30, 214]]), mid);
  c.paint('suit', B([[40, 178], [56, 164], [70, 162], [60, 178], [54, 200], [40, 200]]), lit);
  c.paint('suit', B([[124, 150], [164, 158], [184, 186], [186, 214], [138, 214], [136, 186]]), dark);
  c.shape('shirt', B([[93, 154, 1], [119, 154, 1], [107, 204, 1], [105, 204, 1]]), 'W', nl);
  c.paint('shirt', B([[107, 154], [119, 154], [107, 204]]), '7');
  c.paint('shirt', B([[93, 154], [100, 154], [106, 180], [105, 204]]), '8');
  c.shape('lapelL', B([[90, 156, 1], [105, 202, 1], [95, 188, 1], [80, 176, 1], [70, 166, 1]]), mid, { line: null, inner: dark });
  c.paint('lapelL', B([[90, 156, 1], [96, 172, 1], [80, 168, 1], [72, 166, 1]]), lit);
  c.shape('lapelR', B([[122, 156, 1], [142, 164, 1], [134, 180, 1], [118, 194, 1], [107, 202, 1]]), base, { line: null, inner: dark });
  c.paint('lapelR', B([[132, 170, 1], [142, 164, 1], [134, 180, 1], [118, 194, 1]]), dark);
  c.shape('tie', B([[102, 166, 1], [110, 166, 1], [109, 176, 1], [114, 206, 1], [106, 213, 1], [98, 206, 1], [103, 176, 1]]), 'y', { line: null, inner: '|' });
  c.paint('tie', B([[107, 166], [110, 166], [109, 176], [114, 206], [108, 210]]), 'o');
  c.paint('tie', B([[102, 168], [104, 168], [101, 200], [99, 204]]), 'Y');
  if (!small) for (const [x, y] of [[104, 180], [107, 192], [103, 202]]) { c.paint('tie', B([[x - 2.6, y + 1], [x - 2, y - 0.6], [x - 0.6, y - 1.6], [x + 1.4, y - 1.6], [x + 2.6, y - 0.4], [x + 2.6, y + 1]]), 'R'); c.dot(...T([x - 1.4, y + 1.4]), 'K'); c.dot(...T([x + 1.6, y + 1.4]), 'K'); }
  c.shape('knot', B([[100, 159, 1], [112, 159, 1], [111, 167, 1], [101, 167, 1]]), 'y', { line: null, inner: '|' });
  c.paint('knot', B([[107, 159], [112, 159], [111, 167], [107, 167]]), 'o');
  c.paint('knot', B([[101, 159], [105, 159], [104, 162], [101, 162]]), 'Y');
  if (!small) { c.shape('pin', B([[77, 176, 1], [83, 176, 1], [83, 180, 1], [77, 180, 1]]), 'W', nl); c.paint('pin', B([[77, 176], [78.6, 176], [78.6, 180], [77, 180]]), 'R'); c.paint('pin', B([[81.4, 176], [83, 176], [83, 180], [81.4, 180]]), 'R'); c.dot(...T([80, 178]), 'R'); }
}

export function dogPortrait2d(expr = 'grin', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const fine = k >= 0.9, small = k < 0.8;
  const px = (u, min = 1) => Math.max(min, Math.round(u * k * DSC)); // a stroke `u` design units thick, in pixels
  const nl = { line: null };
  const ofs = (o) => (pts) => pts.map(([x, y, s]) => (s ? [x + o[0], y + o[1], 1] : [x + o[0], y + o[1]]));
  const oe = ofs(DOGV.e), on = ofs(DOGV.n), om = ofs(DOGV.m);
  const [ex0, ey0] = DOGV.e, [mx0, my0] = DOGV.m, [nx0, ny0] = DOGV.n;

  dogSuit(c, small, px);

  // ---- the head (iteration 04's outline): planned volumes lit from the upper left ----
  c.shape('head', B(HEAD04), 'm', nl);
  // the planes (the skin keys are moved to the hue-shifted skin palette at the end): a broad lit front plane (forehead
  // dome, near cheek, muzzle top), the mid, a side plane turning away on the far cheek, ONE cool core shadow under the
  // drapes across the jaw with an ochre-olive half-tone along its upper edge, a thin bounce light at the collar
  c.paint('head', B([[150, 52], [200, 40], [200, 132], [172, 128], [163, 118], [158, 100], [154, 80]]), '^');
  c.paint('head', B([[60, 84], [66, 70], [76, 58], [92, 50], [112, 50], [126, 56], [116, 62], [100, 64], [86, 72], [74, 88], [66, 104], [60, 120], [54, 128], [50, 116], [53, 98]]), '~');
  if (!small) c.paint('head', B([[78, 62], [88, 55], [102, 54], [96, 60], [86, 64]]), 'M');
  c.paint('head', B([[54, 106], [58, 98], [63, 104], [61, 116], [56, 122]]), 'M');
  const CORE = [[42, 134], [56, 143], [72, 148], [96, 151], [120, 148], [142, 142], [158, 135], [170, 125], [180, 124], [180, 172], [40, 172]];
  const TW = [1, 2, 2.8, 2.4, 1.6, 2.6, 2, 1.4, 0.8];   // its width follows the form
  c.paint('head', B(CORE.map(([x, y], i) => (i < 9 ? [x, y - TW[i]] : [x, y]))), '9');
  c.paint('head', B(CORE), 'P');
  c.paint('head', B([[62, 159.4], [90, 163.6], [120, 164], [148, 160.4], [158, 153], [160, 156], [148, 163], [120, 166.4], [90, 166], [60, 162]]), '°');

  // ---- wrinkles as shadow shapes with a lit ridge above (never thin lines); dropped at the dialogue size ----
  // a fold: a crescent of shadow, thickest in the middle, tapering to points; its ridge a thinner light crescent above
  const fold = (cx, cy, w, h, sh, lt, bend = 2.4) => {
    c.paint('head', B([[cx - w / 2, cy], [cx - w / 4, cy - bend * 0.8], [cx, cy - bend], [cx + w / 4, cy - bend * 0.8], [cx + w / 2, cy], [cx + w / 4, cy - bend * 0.8 + h], [cx, cy - bend + h * 1.2], [cx - w / 4, cy - bend * 0.8 + h]]), sh);
    if (lt) c.paint('head', B([[cx - w * 0.42, cy - 0.8], [cx, cy - bend - 0.9], [cx + w * 0.42, cy - 0.8], [cx, cy - bend - 0.1]]), lt);
  };
  if (!small) {
    const fy = 68 + ey0;
    fold(98 + ex0, fy, 26, 2.6, 'P', 'M', 2.8);
    fold(100 + ex0, fy + 6.6, 30, 2.2, 'P', '~', 2.6);
    fold(80 + ex0, 100 + ey0, 12, 1.2, '^', '~', -1.4); fold(120 + ex0, 102 + ey0, 12, 1.2, 'P', null, -1.4);   // the bags under the eyes
  }
  // ---- the chestnut heart patch round the far eye: a 4-tone ramp, a fur edge into the pink, a socket shadow ----
  const PATCH = oe([[104, 89], [104, 82], [110, 77.5], [117, 78.5], [124, 77], [131, 80.5], [132, 89], [127, 99], [118, 109, 1], [109, 99]]);
  c.shape('patch', tufted(B(PATCH), { amp: small ? 0.01 : 2.2, period: 3.6, where: (x, y) => (y < T([0, 102 + ey0])[1] ? 1 : 0.4), flow: [0, -1], lean: 0.3, seed: 90 }), '!', { line: null, clip: 'head' });
  c.paint('patch', B(oe([[106, 84], [110, 79.5], [116, 80.5], [112, 86], [107, 89]])), '"');
  if (!small) c.paint('patch', B(oe([[107, 83], [110, 80.6], [113, 81], [109, 84]])), 'j');
  c.paint('patch', B(oe([[122, 90], [133, 85], [129, 100], [118, 110, 1], [121, 99]])), ')');
  c.paint('patch', B(oe([[110, 86], [124, 84], [128, 90], [124, 92], [112, 92]])), ')');   // the socket's shadow over the eye
  if (fine) { c.furBreak(['patch', 'head'], '!', ['m', '~', '^'], { dir: (x, y) => { const [px0, py0] = T([118 + ex0, 92 + ey0]); return norm(x - px0, y - py0); }, len: 2.4, gap: 2.2, seed: 91, w: 2 }); c.furBreak('patch', '"', '!', { dir: [-0.5, -1], len: 2, gap: 2.4, seed: 92 }); c.furBreak('patch', ')', '!', { dir: [0.6, 1], len: 2, gap: 2.4, seed: 93 }); }

  // ---- ears: iteration 04's folded flaps exactly (hinged under the hair at the skull's sides, a straight top edge,
  // angled out and a little down to a pointed tip); a lit upper plane, a maroon underside, no inner hole ----
  c.shape('earL', B([[76, 61, 1], [50, 76, 1], [56, 80], [66, 80.5], [72, 74, 1]]), 'm', nl);
  c.paint('earL', B([[76, 61, 1], [50, 76, 1], [62, 72], [73, 66]]), '~');
  if (!small) c.paint('earL', B([[74, 62.6], [56, 73], [64, 70.4], [73, 64.6]]), 'M');
  c.paint('earL', B([[51, 77, 1], [74, 66, 1], [73, 74, 1], [66, 82, 1], [55, 81, 1]]), 'P');
  c.paint('earL', B([[60, 80], [72, 70], [73, 74, 1], [66, 82, 1]]), '?');
  c.shape('earR', B([[146, 60, 1], [170, 76, 1], [164, 81], [156, 82.5], [151, 72, 1]]), 'P', nl);
  c.paint('earR', B([[146, 60, 1], [170, 76, 1], [158, 71.6], [149, 66]]), '^');
  c.paint('earR', B([[169, 77, 1], [148, 65, 1], [151, 73, 1], [157, 84, 1], [165, 82, 1]]), '?');
  c.paint('earR', B([[150, 70], [158, 76], [157, 84, 1], [152, 76]]), 'p');
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
  if (fine) {
    const out = (x, y) => norm(x - 95, y - 120), inn = (x, y) => norm(95 - x, 120 - y);
    c.furBreak('head', '~', 'm', { dir: out, len: 2.2, gap: 3, seed: 61 });
    c.furBreak('head', 'm', '^', { dir: out, len: 2.4, gap: 3, seed: 62 });
    c.furBreak('head', '^', 'm', { dir: inn, len: 1.8, gap: 3.4, seed: 63 });
    c.furBreak('head', 'M', '~', { dir: out, len: 1.8, gap: 3, seed: 66 });
  }
  if (fine) {
    c.furBreak('hair', '7', '6', { dir: [1, 0.2], len: 3, gap: 2.6, seed: 67 });
    c.furBreak('hair', '6', '5', { dir: [1, 0.3], len: 3.4, gap: 2.6, seed: 68 });
    c.furBreak('hair', '5', '4', { dir: [1, 0.4], len: 3, gap: 2.8, seed: 69 });
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
    const er = small ? 4.6 : 5.4, ir = small ? 3.4 : 4, iy = FY + 3, lidY = iy - (small ? 0.6 : 0.2);
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
  // chin up: the underside of the nose faces us: comma-slit nostrils curving out and up to the sides, a central groove
  c.paint('nose', B(on([[75, 106], [88, 105], [103, 105], [103, 110], [94, 116], [82, 115], [75, 110]])), '2');
  c.paint('nose', B(on([[75, 106], [88, 105], [103, 105], [100, 106.6], [88, 106.4], [78, 107.4]])), '2');
  c.paint('nose', B(on([[78, 113], [86, 115.6], [96, 115], [101, 111], [99, 114.6], [94, 117], [82, 116.6]])), '0');
  for (const d of [-1, 1]) {
    const cx = 89;
    c.paint('nose', tube(on([[cx + d * 2.6, 112.6], [cx + d * 6.6, 112.4], [cx + d * 10.4, 109.6], [cx + d * 11.4, 107.4]]).map(T), (t) => DSC * ((k < 1.4 ? 3.8 : 2.8) - 2 * t), undefined, 8), '0');
    if (!small) c.paint('nose', tube(on([[cx + d * 4, 110.6], [cx + d * 8, 110.2], [cx + d * 10.4, 107.6]]).map(T), (t) => DSC * (1.2 - 0.6 * t), undefined, 8), '4');
  }
  c.paint('nose', tube(on([[89, 116.4], [89, 112.8]]).map(T), DSC * 1.3, undefined, 4), '0');
  c.dot(...T(on([[83, 100.6]])[0]), 'W', k >= 1.4 ? 1 : 0);
  c.paint('head', B(on([[87.4, 116], [90.6, 116], [90, 124], [89, 126], [88, 124]])), 'P');   // the philtrum groove
  if (!small) c.paint('head', B(on([[85.6, 117], [87.4, 117], [87.6, 124], [86.4, 123]])), '~');
  // ---- the wide bulldog mouth: a crescent across most of the face, heavy drapes at its corners, the underbite ----
  const TOP = [[50, 117], [64, 121.6], [80, 124.4], [96, 125.4], [114, 123.2], [130, 117.6], [146, 110]];
  // the upper lip over the teeth, the mouth's whole width: lit on the near side, half shade on the far side
  const upperFlews = (open) => {
    const dr = open ? 2.4 : 0, T2 = TOP.map(([x, y]) => [x, y - dr]);
    c.paint('head', B(om([[48, 111], [62, 108], [80, 109.4], [96, 113], ...T2.slice(0, 4).reverse()])), 'm');
    c.paint('head', B(om([[96, 113], [112, 110], [128, 106.6], [144, 104], ...T2.slice(3).reverse()])), '^');
    c.paint('head', B(om([[52, 111.6], [64, 109], [80, 110], [88, 112.6], [76, 114], [62, 114.6]])), '~');
    if (!small) c.paint('head', B(om([[62, 109.6], [72, 109.6], [68, 111.6]])), 'M');
    c.paint('head', B(om([[100, 112.6], [114, 110.4], [128, 107.6], [116, 112.4], [102, 114]])), 'm');
    // the lip's lower edge rolls under, in core shadow
    c.paint('head', B(om([...T2.slice(0, 4).map(([x, y]) => [x, y - 2.6]), ...T2.slice(0, 4).reverse()])), 'P');
    c.paint('head', B(om([...T2.slice(3).map(([x, y]) => [x, y - 2.8]), ...T2.slice(3).reverse()])), '?');
    if (!small) for (const [x, y] of [[66, 114], [72, 116.4], [78, 114.4], [104, 116.4], [110, 118.4], [116, 115.6]]) { const [a, b2] = T(om([[x, y]])[0]); const X = Math.round(c.X(a)), Y = Math.round(c.Y(b2)); c.img.set(X, Y, 'P'); c.img.set(X + 1, Y, 'P'); c.img.set(X, Y - 1, x < 90 ? 'M' : 'm'); }
  };
  // the drapes: heavy curtains of lip at the two corners, sagging over the lower lip; a crease only along the top and
  // inner edge, the lower edge melting into the jaw's core shadow (no closed outline)
  const hangingFlews = (d = 0) => {
    const drape = (pts, inner, hem, base) => {
      const ON = ['head', 'mouth'], top = Math.min(...pts.map((p) => p[1])), lo = Math.max(...pts.map((p) => p[1]));
      c.paint(ON, B(om(pts)), base);                                                                  // the drape body, a step darker
      c.paint(ON, B(om(pts.filter(([, y]) => y < top + 7).concat(pts.filter(([, y]) => y < top + 7).reverse().map(([x, y]) => [x, y + 1])))), '§');
      c.paint(ON, B(om([...pts.filter(([, y]) => y < top + 6)])), '§');                              // the cheek's cast shadow over its top
      c.paint(ON, B(om(pts.filter(([, y]) => y > lo - 9))), '§');                                     // the lower bag turns under
      c.paint(ON, tube(om(hem.map(([x, y]) => [x, y - 2.2])).map(T), (t) => DSC * 1.6 * Math.sin(Math.PI * (0.1 + 0.8 * t)), undefined, 8), '°');   // a bounce just above the hem
      c.paint(ON, tube(om([...inner, ...hem.slice(1)]).map(T), (t) => DSC * (small ? 1.8 : 1.5), undefined, 8), '¤');   // the dark lip margin
    };
    const L = d < 0 ? d * 0.5 : 0;   // the laugh lifts them a little
    // narrow where they leave the lip at the corners, widening and rounding into a bag below the lower lip
    drape([[53, 115 + L], [61, 116 + L], [66, 122 + L], [70, 132 + L], [69.4, 142 + d], [64.6, 149.6 + d], [56, 152 + d], [48, 148.4 + d], [44.4, 140 + d], [45.6, 128 + L], [49, 120 + L]],
      [[61, 116.4 + L], [66.4, 122.4 + L], [70.4, 132 + L], [69.6, 142 + d]], [[69.6, 142 + d], [64.6, 150 + d], [56, 152.4 + d], [48, 148.8 + d], [44.6, 140.4 + d]], '£');
    drape([[139, 110 + L], [147.6, 108.4 + L], [151, 114 + L], [156, 124 + L], [157.4, 136 + d], [153.6, 146.4 + d], [145.4, 150.6 + d], [137.6, 147 + d], [133.4, 137 + d], [133.6, 124 + L], [136, 116 + L]],
      [[139, 110.6 + L], [135.6, 116.4 + L], [133.2, 124 + L], [133, 137 + d]], [[133, 137 + d], [137.4, 147.4 + d], [145.4, 151 + d], [153.8, 146.8 + d], [157.6, 136 + d]], '£');
    if (!small) {
    }
  };
  // two lower canines poking up past the upper lip at the inner edges of the drapes (the underbite)
  const canine = (n, bx, by, tx, ty) => {
    c.shape(n, B(om([[bx - 3.2, by], [bx + 3.2, by], [tx + 0.8, ty + 1.4], [tx, ty]])), 'W', nl);
    c.paint(n, B(om([[bx + 0.2, by], [bx + 2.8, by], [tx + 0.6, ty + 1.2], [tx + 0.1, ty + 1.6]])), '8');
    if (!small) c.paint(n, B(om([[bx - 2.8, by], [bx + 2.8, by], [bx + 2.4, by - 1.1], [bx - 2.4, by - 1.1]])), '7');
  };
  if (expr === 'grin') {
    const BOT = [[146, 110], [140, 122], [128, 132], [112, 139], [96, 141.4], [78, 139], [64, 132], [54, 124]];
    c.shape('mouth', B(om([[50, 117, 1], ...TOP.slice(1, -1), [146, 110, 1], ...BOT.slice(1)])), '=', nl);   // the mouth's dark interior
    const along = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]); if (x >= lo && x <= hi) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1); } return pts[0][1]; };
    // the upper teeth: six chunky blocks, uneven (one longer, one turned), each a flat lit face and a darker side
    // plane, separated by value; the far ones turn away into grey
    const UT = [[62, 73.6, 8.6], [73.6, 85, 9.6], [85, 96.6, 9.2], [96.6, 108.6, 11], [108.6, 119.6, 9.4, 1], [119.6, 130, 8, 0], [130, 139, 6.4, 0]];
    for (const [x0, x1, h, turned] of UT) {
      const y0 = along(TOP, x0) - 0.8, y1 = along(TOP, x1) - 0.8, far = x0 >= 119;
      const face = far ? '8' : 'W', side = far ? '7' : '8';
      const sx = turned ? x0 + (x1 - x0) * 0.45 : x0 + (x1 - x0) * 0.72;   // where the face meets the side plane
      c.paint('mouth', B(om([[x0, y0], [x1, y1], [x1 - 0.4, y1 + h * 0.94], [x0 + 0.6, y0 + h]])), face);
      c.paint('mouth', B(om([[sx, along(TOP, sx) - 0.8], [x1, y1], [x1 - 0.4, y1 + h * 0.94], [sx, along(TOP, sx) + h * 0.97]])), side);
      if (!small) c.paint('mouth', B(om([[x0 + 0.6, y0 + h - 1.4], [x1 - 0.4, y1 + h * 0.94 - 1.4], [x1 - 0.4, y1 + h * 0.94], [x0 + 0.6, y0 + h]])), side);   // the worn edge
    }
    // the upper lip's shadow band across the top of the teeth; the dark lip margin along the mouth line
    c.paint('mouth', B(om([...TOP, ...TOP.slice().reverse().map(([x, y]) => [x, y + 2.6])])), '7', { only: ['W', '8'] });
    c.paint('mouth', B(om([...TOP, ...TOP.slice().reverse().map(([x, y]) => [x, y + 1.1])])), '6');
    // the thrust lower lip covers the lower teeth: only a few small tips show between the fangs
    const LL = BOT.slice(1).map(([x, y]) => [x, y - 4.2]);
    for (const x of [86, 97, 108]) { const y = along(LL, x); c.paint('mouth', B(om([[x - 2.4, y + 0.6], [x + 2.4, y + 0.6], [x + 1.4, y - 2.2], [x - 1.2, y - 2.4]])), '8'); c.paint('mouth', B(om([[x - 1.6, y], [x - 0.4, y - 2.2], [x, y - 0.4]])), 'W'); }
    c.paint('mouth', B(om([...LL, ...BOT.slice(1).reverse()])), '£');                                        // the lower lip
    c.paint('mouth', B(om([...LL.slice(1, -1).map(([x, y]) => [x, y + 0.8]), ...LL.slice(1, -1).reverse().map(([x, y]) => [x, y + 2])])), 'Q');
    c.paint('mouth', B(om([...LL, ...LL.slice().reverse().map(([x, y]) => [x, y + 1.2])])), '¤');            // its dark margin
    c.paint('mouth', B(om([[50, 117], [60, 121], [66, 129], [58, 125]])), '=');
    c.paint('mouth', B(om([[146, 110], [140, 117], [136, 125], [140, 116]])), '=');
    // the lower lip, thrust forward under the teeth, and a small lit chin plane
    c.paint('head', B(om([...BOT.slice(1).map(([x, y]) => [x, y + 0.2]), ...BOT.slice(1).reverse().map(([x, y]) => [x, y + 3])])), 'P');
    c.paint('head', B(om([...BOT.slice(2, -1).map(([x, y]) => [x, y + 2.6]), ...BOT.slice(2, -1).reverse().map(([x, y]) => [x, y + 3.8])])), '^');
    c.paint('head', B(om([[72, 144], [96, 147], [112, 145], [100, 148.4], [80, 148]])), '~');
    upperFlews(false);
    hangingFlews();
    canine('fangN', 75, 136.6, 73.8, 117.6);
    canine('fangF', 127, 133.6, 128.8, 114.6);
  } else if (expr === 'laugh') {
    const BOT = [[146, 110], [142, 128], [130, 144], [112, 152], [96, 154], [78, 151], [64, 142], [54, 126]];
    c.shape('mouth', B(om([[50, 117, 1], ...TOP.slice(1, -1), [146, 110, 1], ...BOT.slice(1)])), '=', nl);
    const alongL = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]); if (x >= lo && x <= hi) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1); } return pts[0][1]; };
    for (const [x0, x1, h] of [[62, 74, 6.6], [74, 86, 7.4], [86, 98, 7], [98, 110, 8], [110, 121, 7], [121, 132, 6], [132, 141, 5]]) {
      const y0 = alongL(TOP, x0) - 2.4 - 0.8, y1 = alongL(TOP, x1) - 2.4 - 0.8, far = x0 >= 121, sx = x0 + (x1 - x0) * 0.72;
      c.paint('mouth', B(om([[x0, y0], [x1, y1], [x1 - 0.4, y1 + h], [x0 + 0.6, y0 + h]])), far ? '8' : 'W');
      c.paint('mouth', B(om([[sx, alongL(TOP, sx) - 3.2], [x1, y1], [x1 - 0.4, y1 + h], [sx, alongL(TOP, sx) - 3.2 + h]])), far ? '7' : '8');
    }
    c.paint('mouth', B(om([...TOP.map(([x, y]) => [x, y - 2.4]), ...TOP.slice().reverse().map(([x, y]) => [x, y])])), '7', { only: ['W', '8'] });
    c.paint('mouth', B(om([[76, 148], [90, 142], [106, 141.6], [120, 144], [126, 148], [110, 152.6], [90, 153]])), 'P');
    c.paint('mouth', B(om([[88, 148], [104, 146.4], [114, 148.4], [106, 151], [92, 151]])), '^');
    c.paint('mouth', B(om([...BOT.slice(1).map(([x, y]) => [x, y - 3.6]), ...BOT.slice(1).reverse()])), 'W');   // the lower teeth row
    c.paint('mouth', B(om([...BOT.slice(1).map(([x, y]) => [x, y - 1.4]), ...BOT.slice(1).reverse()])), '8');
    c.paint('head', B(om([...BOT.slice(1).map(([x, y]) => [x, y + 0.2]), ...BOT.slice(1).reverse().map(([x, y]) => [x, y + 3.2])])), 'P');
    upperFlews(true);
    hangingFlews(-4);
    canine('fangN', 73.6, 146.6, 72.6, 134);
    canine('fangF', 127, 144.4, 128.6, 131.6);
  } else {
    c.shape('mouth', E(97 + mx0, 132 + my0, 7, 9), '=', nl);
    c.paint('mouth', E(97 + mx0, 137 + my0, 5, 3), '?');
    c.paint('mouth', E(96 + mx0, 138 + my0, 3, 1.4), 'P');
    c.paint('mouth', E(97 + mx0, 125.6 + my0, 6, 1.8), '7');
    c.paint('head', B(om([[86, 140], [97, 142.4], [108, 140], [110, 143.4], [97, 146], [84, 143.4]])), 'P');
    upperFlews(false);
    hangingFlews(7);   // slack-jawed: the drapes hang longest
    canine('fangN', 91.6, 141.6, 92, 134.4);
    canine('fangF', 102.4, 141.6, 102, 134.4);
  }
  // ---- the skin in hue-shifted planes: the drawing's skin keys move to the skin palette (warm peach-ochre lights, a
  // desaturated mid, a darker side plane, cool mauve shadows); the mouth, the patch and the nose keep their colours ----
  {
    const map = { m: 'Q', '~': '/', M: '¢', '^': '£', P: '§', '?': '¤', p: '¤' };
    const ids = ['head', 'earL', 'earR'].map((n) => c.id(n));
    for (let i = 0; i < c.img.px.length; i++) if (ids.includes(c.part[i]) && map[c.img.px[i]]) c.img.px[i] = map[c.img.px[i]];
  }

  // ---- the silhouette: coloured lines per material; the lit side softer (b, c lose it on the skin) ----
  if (fine) c.despeckle(null, ['W', '6', 'j', 'M', '`', '}', 'P', 'm', '8', '7', '¢', '/', 'Q', '§']);
  const skin = ['m', 'M', '~', '^', 'P', '?', 'p', '=', '-', '/', '¢', 'Q', '£', '9', '§', '¤', '°'];
  c.silhouette({
    dark: '0', light: [-1, -1],
    pick: (nb, lit) => (skin.includes(nb) ? (lit ? '§' : '=') : ['3', '4', '5', '6', '7', '8', 'W'].includes(nb) ? (lit ? '3' : '1')
      : ['y', 'o', 'Y'].includes(nb) ? '|' : ['R', 'r', '[', 'q'].includes(nb) ? 'r' : ['a', 'A', 's', 'S'].includes(nb) ? 'K' : ['U', 'C', '_'].includes(nb) ? 'u' : undefined),
  });
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
