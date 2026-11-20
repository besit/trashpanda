// M4.6 (Ivan: "Let's redraw the portraits of Trash Panda and Dog Fjord... I would prefer completely 2d approach please.
// The raccoon looks much better, but that look of blobby face, hands and torso is just meh. Let's do pure 2d pixel
// art."): the hero portraits drawn in 2D: flat shapes, hard outlines, cel shading and pixels placed by hand
// (tools/lib/draw2d.mjs). One drawing per character, laid out on the posters' 232 x 208 grid and drawn at any scale
// (the in-game dialogue portrait is the same drawing, smaller), so every size is real pixel art, never a resample.
import { Canvas, blob, curve, ell, bar, tube } from '../lib/draw2d.mjs';

export const GW = 232, GH = 208; // the design grid (the posters' portrait size at k = 1)
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ============================== THE RACCOON ==============================
// Three-quarter view facing RIGHT (toward Dog Fjord on VERSUS); the pump held upright in its near paw, the other fist
// on its hip. Light from the upper left.

function pump(c) {
  const A = [38, 58], B = [66, 194];                    // the barrel, top to bottom
  const at = (t) => lerp(A, B, t);
  // the hose first (behind the barrel): out of the foot, a loop down and up to the chuck hanging at the left
  const hose = curve([[60, 190], [44, 203], [22, 196], [14, 176], [16, 156]]);
  c.stroke(hose, 'K', { t: Math.max(3, Math.round(6 * c.S)) });
  c.stroke(hose, 'k', { t: Math.max(1, Math.round(3.4 * c.S)) });
  c.stroke(hose.map(([x, y]) => [x - 0.8, y - 0.8]), 'g', { t: 1 });
  c.shape('chuck', bar([16, 158], [17, 144], 8), 'h', { inner: 'K' });
  c.paint('chuck', bar([19, 158], [20, 144], 3), 'G');
  c.paint('chuck', bar([14, 157], [15, 146], 1.4), 'H');
  // the T-handle: a wide bar with black grips at both ends
  const L = [8, 27], R = [68, 19], M = lerp(L, R, 0.5);
  c.shape('rod', bar([M[0], M[1] + 2], A, 4.4), 'H', { inner: 'K' });
  c.paint('rod', bar([M[0] + 1.6, M[1] + 2], [A[0] + 1.6, A[1]], 1.6), 'h');
  c.shape('handle', bar(L, R, 9, true), 'h', { inner: 'K' });
  c.paint('handle', bar(lerp(L, R, 0.36), lerp(L, R, 0.64), 9.5), 'H');
  c.paint('handle', bar([L[0], L[1] + 2.4], [R[0], R[1] + 2.4], 3), 'G');
  for (const [t0, t1] of [[0, 0.34], [0.66, 1]]) {
    c.shape('grip' + t0, bar(lerp(L, R, t0), lerp(L, R, t1), 10.5, true), 'k', { inner: 'K' });
    c.paint('grip' + t0, bar([...lerp(L, R, t0 + 0.04)].map((v, i) => v - (i ? 2.4 : 0)), [...lerp(L, R, t1 - 0.04)].map((v, i) => v - (i ? 2.4 : 0)), 2), 'g');
    for (let t = t0 + 0.06; t < t1 - 0.03; t += 0.06) { const p = lerp(L, R, t); c.stroke([[p[0] - 0.6, p[1] - 3.5], [p[0] + 0.6, p[1] + 3.5]], 'K', { on: 'grip' + t0 }); }
  }
  c.shape('collar', bar([M[0], M[1] - 2], [M[0], M[1] + 6], 7), 'G', { inner: 'K' });
  // the barrel: yellow, lit on the left, an end cap at each end, a band, grip ribs and the gauge
  c.shape('barrel', bar(A, B, 13), 'y', { inner: 'K' });
  c.rim('barrel', 4, 0, 'o', { pattern: 'checker' });
  c.rim('barrel', 2.2, 0, 'o');
  c.paint('barrel', bar(at(0.02).map((v, i) => v - (i ? 0 : 3.2)), at(0.98).map((v, i) => v - (i ? 0 : 3.2)), 2.2), 'Y');
  c.shape('capT', bar(at(-0.02), at(0.06), 15), 'H', { inner: 'K' });
  c.rim('capT', 3, 0, 'h');
  c.shape('capB', bar(at(0.93), at(1.02), 15), 'G', { inner: 'K' });
  c.rim('capB', 3, 0, 'g');
  c.shape('band', bar(at(0.3), at(0.335), 14), 'k', { inner: 'K' });
  for (let t = 0.1; t < 0.27; t += 0.035) { const p = at(t); c.stroke([[p[0] - 5.5, p[1] + 0.9], [p[0] + 5.5, p[1] - 0.9]], 'o', { on: 'barrel' }); }
  const g = at(0.8);
  c.shape('gauge', ell(g[0] + 2, g[1], 7.5, 7.5), 'W', { inner: 'K' });
  c.rim('gauge', 2, 2, 'H');
  for (let a = -2.4; a <= 0.8; a += 0.8) c.dot(g[0] + 2 + Math.cos(a) * 5, g[1] + Math.sin(a) * 5, 'G');
  c.stroke([[g[0] + 2, g[1]], [g[0] + 5.6, g[1] - 3.4]], 'R', { on: 'gauge', t: Math.max(1, Math.round(c.S)) });
  c.dot(g[0] + 2, g[1], 'K');
}

// M4.7 (Ivan: "proportions, symmetry, overall shapes were better [in the 3D version]... but I want the 2D style
// still"): re-proportioned to the old 3D bust. The head is about as wide as the torso and sits centred on it, a short
// snout (the nose stays inside the cheek line: a 3/4 view, not a profile), eyes ~32 apart, matching ears, ruffs on
// both cheeks, a two-lobed mask. Flat cel shading, no dither bands on the fur.
export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const lw = k >= 1.4 ? 2 : 1;
  pump(c);

  // ---- ears (behind the head): a matching pair of triangles with round tips, dark inside ----
  c.shape('earL', blob([[86, 52], [90, 36], [96, 27], [103, 24], [109, 30], [118, 44]]), 'h', { inner: 'g', lw });
  c.paint('earL', blob([[92, 48], [95, 36], [100, 30], [104, 31], [111, 44]]), 'k');
  c.rim('earL', -2, -2, 'H', { only: ['h'] });
  c.shape('earR', blob([[128, 42], [137, 29], [143, 23], [150, 25], [155, 36], [160, 50]]), 'h', { inner: 'g', lw });
  c.paint('earR', blob([[134, 42], [140, 32], [145, 28], [149, 31], [153, 44]]), 'k');
  c.rim('earR', 2, 0, 'G', { only: ['h'] });

  // ---- the ringed tail (behind the body): out from behind the lower right of the bust, bushy (swelling from the base,
  // tapering to the tip), curling up beside the elbow and framing the arm's triangle ----
  const tailC = [[146, 185], [170, 196], [194, 195], [210, 187], [219, 174], [222, 160]];
  const tailW = (t) => (t < 0.5 ? 14 + 16 * t : 22 - (t - 0.5) * 16);
  c.shape('tail', tube(tailC, tailW), 'h', { inner: 'g', lw });
  c.paint('tail', blob([[160, 202], [190, 206], [214, 194], [228, 172], [228, 150], [221, 152], [222, 168], [210, 186], [188, 197], [160, 196]]), 'G');
  {
    const cc = curve(tailC), n = cc.length;
    for (const f of [0.4, 0.6, 0.79, 0.99]) {
      const i = Math.round(f * (n - 1)), a = cc[Math.max(0, i - 1)], b = cc[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, p = cc[i];
      const u = f > 0.9 ? 9 : 3.2, ux = dx / l * u, uy = dy / l * u;
      c.paint('tail', [[p[0] - nx * 16 - ux, p[1] - ny * 16 - uy], [p[0] + nx * 16 - ux, p[1] + ny * 16 - uy], [p[0] + nx * 16 + ux, p[1] + ny * 16 + uy], [p[0] - nx * 16 + ux, p[1] - ny * 16 + uy]], 'k');
    }
  }

  // ---- the torso: a bust narrower than the head; the shoulders slope out from under the jaw (the head's cheek tufts
  // and ruff overlap them), the sides taper to a rounded bottom inside the frame; a pale chest patch, one flat shadow ----
  c.shape('body', blob([[104, 112], [92, 121], [86, 130], [83, 146], [84, 166], [90, 182], [102, 194], [124, 199], [146, 195], [158, 184], [164, 168], [166, 148], [164, 132], [158, 123], [146, 113]]), 'h', { inner: 'K', lw });
  c.paint('body', blob([[106, 116], [146, 116], [152, 128], [148, 148], [140, 168], [132, 182], [124, 188], [116, 182], [110, 168], [104, 148], [100, 128]]), 'H');
  c.paint('body', blob([[150, 114], [166, 120], [174, 150], [170, 180], [156, 200], [134, 206], [146, 186], [152, 166], [154, 136]]), 'G');
  c.paint('body', blob([[86, 180], [106, 190], [136, 190], [158, 182], [150, 204], [100, 204]]), 'G');
  // a few fur notches at the chest patch's edges (no muscles: it is a chubby raccoon)
  for (const [x, y, d] of [[104, 144, 1], [110, 164, 1], [149, 142, -1], [141, 162, -1]]) c.stroke([[x, y], [x + 4 * d, y + 2], [x, y + 4]], 'h', { on: 'body' });
  // the ruff: a zig-zag of fur under the jaw, in shadow
  c.paint('body', blob([[98, 108], [152, 108], [158, 118], [150, 116, 1], [144, 124, 1], [138, 117, 1], [132, 125, 1], [126, 117, 1], [120, 125, 1], [114, 117, 1], [108, 124, 1], [102, 117, 1], [94, 120]]), 'G');

  // ---- the far arm: a chunky hand-on-hip triangle (ref 4's limbs: ~40% of the torso's width, tapered, big paws). A
  // round deltoid mass at the shoulder, the upper arm down and out to a round elbow, the forearm back in to the big fist
  // pressed against the waist; background shows in the triangle between them and the torso ----
  c.shape('armR', tube([[160, 129], [194, 151]], 24, 20), 'h', { inner: 'K', lw });
  c.paint('armR', blob([[148, 138], [190, 164], [206, 156], [210, 172], [180, 172], [148, 148]]), 'G');
  c.stroke(curve([[151, 139], [154, 145], [153, 150]]), 'G', { on: 'body' });   // the crease where the arm overlaps the torso
  c.shape('foreR', tube([[194, 152], [171, 176]], 19, 16), 'G', { inner: 'K', lw });
  c.paint('foreR', blob([[208, 154], [184, 184], [172, 190], [176, 180], [200, 156]]), 'g');
  // the fist: one big chunky shape, three knuckle bumps on its silhouette pressing against the body, the thumb on top
  const fist = (pts) => pts.map(([x, y]) => [168 + (x - 167) * 1.2, 177 + (y - 177) * 1.2]);
  c.shape('fistR', blob(fist([[160, 168], [168, 166], [176, 170], [178, 178], [173, 186], [164, 188], [158, 185], [155.5, 182], [158, 179], [155.5, 175.5], [158, 172.5], [156, 169.5]])), 'k', { inner: 'K', lw });
  c.stroke(curve(fist([[161, 169], [169, 168], [175, 173]])), 'g', { on: 'fistR' });
  for (const y of [177, 183.5]) c.stroke(fist([[158, y], [164, y]]), 'K', { on: 'fistR' });
  for (const p of fist([[158, 174], [158, 180.5], [159, 186]])) c.dot(p[0], p[1], 'g');

  // ---- the near arm: a chunky upper arm from the round shoulder mass to a round elbow, the chunky grey forearm up to
  // the dark paw (its wrist as thick as the forearm), whose fingers wrap round the pump; a sliver of background in the V ----
  c.paint('body', blob([[98, 134], [106, 138], [104, 162], [98, 178], [93, 176], [96, 154]]), 'G');   // the arm's cast shadow
  c.shape('armL', tube([[92, 129], [84, 166]], 22, 19), 'h', { inner: 'K', lw });
  c.paint('armL', blob([[98, 128], [108, 128], [100, 168], [90, 182], [86, 176], [94, 160]]), 'G');
  c.paint('armL', blob([[78, 134], [84, 122], [83, 142], [79, 158], [75, 150]]), 'H');
  c.stroke(curve([[102, 137], [100, 143], [101, 148]]), 'G', { on: 'body' });   // the crease where the arm overlaps the torso
  c.shape('foreL', tube([[83, 169], [65, 144]], 18, 15), 'G', { inner: 'K', lw });
  c.paint('foreL', blob([[74, 146], [86, 164], [94, 172], [88, 182], [80, 174], [72, 156]]), 'g');
  c.paint('foreL', blob([[54, 146], [64, 136], [74, 142], [68, 152], [58, 154]]), 'k');
  // the back of the hand (right of the barrel), then four fingers across the front of it and the thumb over the top
  c.shape('paw', blob([[56, 130], [68, 129], [72, 138], [70, 148], [58, 150], [54, 140]]), 'k', { inner: 'K', lw });
  for (let i = 0; i < 4; i++) {
    const y = 133 + i * 4.4;
    c.shape('finger' + i, blob([[60, y - 2, 1], [48, y - 2.2], [45, y], [47.5, y + 2.2], [60, y + 2, 1]]), 'k', { inner: 'K', lw });
    c.stroke([[49, y - 1.2], [57, y - 1.2]], 'g', { on: 'finger' + i });
    c.dot(45.5, y, 'H');                                            // a claw tip
  }
  c.shape('thumb', blob([[58, 131, 1], [52, 127], [47, 128], [48, 131], [56, 134, 1]]), 'k', { inner: 'K', lw });
  c.stroke([[50, 129], [55, 130]], 'g', { on: 'thumb' });

  // ---- the head: a round cranium centred over the body, cheek ruffs flaring out on both sides ----
  c.shape('head', blob([
    [92, 50], [106, 41], [124, 37], [142, 39], [156, 46], [165, 57], [169, 70], [171, 82], [174, 90], [176, 98], [173, 104],
    [178, 110, 1], [166, 112], [170, 117, 1], [156, 117], [144, 119], [130, 120], [116, 118, 1], [108, 113], [98, 118, 1], [96, 110], [84, 113, 1], [85, 105],
    [70, 105, 1], [79, 97], [67, 90, 1], [79, 84], [80, 72], [84, 60],
  ]), 'h', { inner: 'g', lw });
  c.rim('head', 5, 3, 'G', { only: ['h'] });
  c.rim('head', -2, -2, 'H', { only: ['h'] });
  // the dark stripe down the middle of the forehead to the bridge of the nose
  c.paint('head', blob([[118, 38], [129, 38], [134, 52], [134, 70], [127, 70], [121, 54]]), 'G');
  // the white brows, a grey gap between them and the mask
  c.paint('head', blob([[86, 65], [91, 57], [103, 52], [117, 52], [127, 57], [127, 62], [114, 59], [100, 60], [90, 66]]), 'W');
  c.paint('head', blob([[137, 61], [142, 54], [153, 50], [164, 52], [169, 59], [167, 63], [157, 58], [147, 58], [139, 63]]), 'W');
  // the white muzzle and cheeks under the mask
  // (the near cheek's outer spikes stay grey so the head separates from the ruff)
  c.paint('head', blob([[84, 94], [92, 95], [106, 93], [120, 90], [130, 85], [137, 84], [148, 87], [162, 88], [173, 86], [180, 95], [178, 104], [170, 108], [158, 110], [146, 110], [138, 106], [126, 108], [112, 108], [98, 105], [88, 102]]), 'W');
  // the jaw under the smirk stays grey, with a jaw line, so the head ends clearly above the ruff (as in 3D)
  c.stroke(curve([[124, 114.5], [142, 116.5], [158, 114.5], [170, 110]]), 'G', { on: 'head' });
  // a grey line down the snout from the mask's bridge to the nose
  c.stroke(curve([[139, 84], [148, 88], [157, 92]]), 'h', { on: 'head' });
  // the bandit mask: a lobe round each eye, joined by a narrower bridge, the outer ends drooping onto the cheeks
  c.shape('mask', blob([
    [80, 80], [85, 70], [95, 65], [108, 63], [120, 64], [128, 67], [133, 73], [138, 68], [146, 63], [158, 62], [167, 65], [172, 74],
    [169, 83], [160, 87], [150, 88], [142, 86], [137, 80], [133, 79], [128, 86], [118, 91], [104, 93], [91, 94], [82, 90],
  ]), 'k', { inner: 'K', clip: 'head' });
  c.rim('mask', -2, -2, 'g', { only: ['k'] });
  // the eyes: half-lidded and pleased with itself, amber irises looking right, a white glint (refs 1, 3)
  const t1 = Math.max(1, Math.round(1.5 * k));
  const eye = (cx, cy, rx, ry) => {
    const n = 'eye' + cx;
    // a lighter rim under the eye (the lower lid) so the eye separates from the black mask
    c.paint('mask', blob([[cx - rx - 1.5, cy], [cx - rx * 0.5, cy + ry * 0.9 + 2], [cx + rx * 0.55, cy + ry * 0.9 + 2], [cx + rx + 1.5, cy - 0.6], [cx + rx * 0.55, cy + ry * 0.9 + 0.5], [cx - rx * 0.5, cy + ry * 0.9 + 0.5]]), 'g');
    c.shape(n, blob([[cx - rx, cy + 0.6], [cx - rx * 0.55, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy - 0.4], [cx + rx * 0.55, cy + ry * 0.9], [cx - rx * 0.5, cy + ry * 0.9]]), 'W', { inner: 'K' });
    const ix = cx + rx * 0.3, iy = cy + 0.6;
    c.paint(n, ell(ix, iy, ry * 0.95, ry * 1.05), 'X');
    c.paint(n, ell(ix + ry * 0.2, iy + ry * 0.35, ry * 0.7, ry * 0.5), 'j');
    c.paint(n, ell(ix + 0.3, iy, ry * 0.48, ry * 0.58), 'K');
    c.paint(n, ell(ix - ry * 0.35, iy - ry * 0.3, Math.max(0.9, 1.1 / k), Math.max(0.9, 1.1 / k)), 'W');
    // the heavy upper lid over the top third (the smirk's look)
    c.paint(n, blob([[cx - rx - 2, cy - ry - 3], [cx + rx + 2, cy - ry - 3], [cx + rx + 2, cy - ry * 0.45], [cx, cy - ry * 0.5], [cx - rx - 2, cy - ry * 0.3]]), 'k');
    c.stroke([[cx - rx - 1, cy - ry * 0.25], [cx, cy - ry * 0.5], [cx + rx + 1, cy - ry * 0.45]], 'K', { t: t1 });
  };
  eye(117, 76, 9, 6.6);
  eye(152, 74.5, 6.8, 5.4);
  // the nose: at the end of the muzzle, below the mask (~15 under the far eye, as in 3D)
  c.shape('nose', blob([[159, 92], [164, 88], [171, 89], [175, 93], [172, 98], [166, 100], [160, 97]]), 'K', { lw });
  c.paint('nose', ell(166, 91, 2.6, 1.2), 'g');
  c.dot(165, 91, 'G');
  // the smirk: a line down from the nose, then the mouth sweeping back into the raised near corner and its dimple
  c.stroke(curve([[167, 100], [166, 103], [160, 106], [153, 107.5], [147, 106.5], [143, 104], [140.5, 99.5]]), 'K', { t: Math.max(1, Math.round(1.3 * k)) });
  c.stroke(curve([[142.5, 102.5], [139, 100], [139.5, 96.5]]), 'K');
  c.stroke(curve([[166, 103], [170, 105], [173, 104]]), 'K');
  for (const [x, y] of [[152, 97], [148, 100], [155, 101]]) c.dot(x, y, 'h');
  // fur tufts on the cheek ruffs
  for (const [x, y, dx, dy] of [[84, 98, -7, 2], [90, 104, -5, 5], [104, 110, -3, 5], [168, 106, 5, 2], [160, 113, 4, 3]]) c.stroke([[x, y], [x + dx, y + dy]], 'G', { on: 'head' });

  return c.img;
}

// ============================== DOG FJORD ==============================
// A cartoon bulldog (never a real person's likeness): a big pink bell-shaped head on a small suited body, a grey combed
// hair cap, folded rose ears, a brown heart-shaped patch round the far eye, thick black brows, a big black nose, jowls.
// Three-quarter view facing LEFT. Expressions: grin, laugh, shock.
// M4.7: laid out on the old 3D version's coordinates (read off its render on this same grid) and drawn 1.1x larger
// about (110, 100), so the face clusters in the middle of a broad jowly head as in 3D, while the in-game 112 x 100
// dialogue portrait keeps the head ~61% of its width (what the old 3D dialogue portrait had).
const DSC = 1.1;
const T = ([x, y, s]) => (s ? [110 + (x - 110) * DSC, 100 + (y - 100) * DSC, 1] : [110 + (x - 110) * DSC, 100 + (y - 100) * DSC]);
const B = (pts) => blob(pts.map(T));
const Cv = (pts) => curve(pts).map(T);
const E = (x, y, rx, ry, rot = 0) => { const [X, Y] = T([x, y]); return ell(X, Y, rx * DSC, ry * DSC, rot); };

export function dogPortrait2d(expr = 'grin', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const lw = k >= 1.4 ? 2 : 1;
  const px = (u, min = 1) => Math.max(min, Math.round(u * k * DSC)); // a stroke `u` design units thick, in pixels

  // ---- the suit (behind the chin): shoulders tucked under the jowls, lapels, the white shirt and the blue tie ----
  c.shape('suit', B([[62, 214, 1], [66, 186], [78, 168], [96, 156], [130, 156], [148, 168], [160, 186], [164, 214, 1]]), 'g', { inner: 'k', lw });
  c.paint('suit', B([[124, 156], [148, 168], [160, 186], [166, 214], [136, 214], [134, 186]]), 'k');
  c.shape('shirt', B([[93, 154, 1], [119, 154, 1], [107, 204, 1], [105, 204, 1]]), 'W', { inner: 'K' });
  c.paint('shirt', B([[107, 154], [119, 154], [107, 204]]), 'H');
  c.shape('lapelL', B([[90, 156, 1], [105, 202, 1], [95, 188, 1], [84, 174, 1], [77, 165, 1]]), 'k', { inner: 'K' });
  c.shape('lapelR', B([[122, 156, 1], [137, 164, 1], [130, 178, 1], [118, 192, 1], [107, 202, 1]]), 'k', { inner: 'K' });
  c.shape('tie', B([[102, 166, 1], [110, 166, 1], [109, 176, 1], [114, 206, 1], [106, 213, 1], [98, 206, 1], [103, 176, 1]]), 'U', { inner: 'K' });
  for (let y = 174; y < 212; y += 5) for (let x = 98 + ((y / 5) % 2) * 2.5; x < 116; x += 5) c.paint('tie', E(x, y, 0.8, 0.8), 'c');
  c.paint('tie', B([[107, 166], [110, 166], [109, 176], [114, 206], [108, 210]]), 'u');
  c.shape('knot', B([[100, 159, 1], [112, 159, 1], [111, 167, 1], [101, 167, 1]]), 'U', { inner: 'K' });
  c.paint('knot', B([[107, 159], [112, 159], [111, 167], [107, 167]]), 'u');

  // ---- the head: a narrower skull on heavy low jowls (widest at ~136), the jowl lobes sagging at the lower corners,
  // a flatter chin line overlapping the collar ----
  // M4.7 iterations 04-05: the lower outline is TRACED from the 3D head's silhouette (the SDF skull + jowls rendered alone
  // with dogPortraitHi's camera, sampled at 28 angles round its centroid; the bottom's two small dips smoothed into one U).
  // The upper skull is wider than the bare 3D skull, as the 3D head reads with its hair on: the hair is the top of the
  // dome, so skull + hair make one convex outline from the ear hinges up over the hair
  c.shape('head', B([
    [106, 40], [120, 40], [134, 43], [146, 49], [154, 58], [159, 69], [163, 80], [166, 91], [169, 102], [173, 116], [172.5, 126],
    [170, 136], [164, 150], [153, 160], [138, 165], [122, 165.5], [108, 165], [94, 164.5], [80, 163], [66, 160], [54, 152], [48, 139],
    [47, 124], [48.5, 112], [51, 101], [54, 91], [57, 80], [61, 69], [67, 59], [78, 50], [92, 43],
  ]), 'm', { inner: 'p', lw });
  // three tones: the lit left plane (M), the base (m), one shadow shape down the right and under the jowls (P)
  c.paint('head', B([[146, 30], [200, 40], [200, 190], [60, 190], [40, 160], [56, 152], [82, 157], [108, 158], [134, 155], [150, 147], [157, 132], [158, 112], [156, 92], [152, 72], [146, 54]]), 'P');
  // the lit left plane: a wedge along the convex side, widest at the cheek, fading out above the brow and below the crease
  c.paint('head', B([[30, 56], [68, 60], [64, 72], [61, 86], [60, 100], [60, 114], [57, 128], [50, 140], [30, 142]]), 'M');
  // the jowls' weight in flat shapes: a shadow crescent under each cheek pad following the sag down to the U
  c.paint('head', B([[46, 128], [54, 138], [62, 147], [72, 154], [84, 158], [80, 170], [56, 166], [40, 150]]), 'P');
  c.paint('head', B([[150, 124], [156, 136], [152, 148], [142, 156], [160, 164], [180, 140], [178, 120]]), 'P');
  // forehead wrinkles (upper left)
  c.stroke(Cv([[86, 67], [97, 64.5], [110, 66.5]]), 'p', { on: 'head', t: px(1.2) });
  c.stroke(Cv([[89, 72.5], [99, 70.5], [112, 72.5]]), 'p', { on: 'head', t: px(1.2) });
  // the jowl creases as folds (a dark line with a shadow sliver on its outer side), a short second fold outside each,
  // and the chin fold under the lower lip with shadow below it
  const LCR = [[66, 117], [59, 128], [61, 140], [68, 149]], RCR = [[131, 116], [137, 127], [135, 139], [128, 149]];
  c.stroke(Cv(LCR.map(([x, y]) => [x - 1.8, y + 1])), 'P', { on: 'head', t: px(2.4, 2) });
  c.stroke(Cv(RCR.map(([x, y]) => [x + 1.8, y + 1])), 'P', { on: 'head', t: px(2.4, 2) });
  c.stroke(Cv(LCR), 'p', { on: 'head', t: px(1.4) });
  c.stroke(Cv(RCR), 'p', { on: 'head', t: px(1.4) });
  c.stroke(Cv([[55.5, 133], [56, 141], [59, 149]]), 'p', { on: 'head', t: px(1.2) });
  c.stroke(Cv([[165, 129], [165.5, 138], [162.5, 147]]), 'p', { on: 'head', t: px(1.2) });
  const chinY = expr === 'laugh' ? 158 : 154;
  c.paint('head', B([[90, chinY], [110, chinY + 1.8], [130, chinY], [136, 172], [84, 172]]), 'P');
  c.stroke(Cv([[92, chinY], [110, chinY + 1.8], [128, chinY]]), 'p', { on: 'head', t: px(1.4) });
  // the brown heart patch round the far eye
  c.shape('patch', B([[104, 89], [104, 82], [110, 77.5], [117, 78.5], [124, 77], [131, 80.5], [132, 89], [127, 99], [118, 109, 1], [109, 99]]), 'x', { inner: 'w', clip: 'head' });
  c.paint('patch', B([[106, 84], [110, 80], [115, 81], [110, 87], [107, 89]]), 'X');

  // ---- ears: angular rose-ear flaps hinged under the hair at the skull's sides, tips out and slightly down, a
  // straight light fold edge over a dark underside ----
  c.shape('earL', B([[67, 61, 1], [41, 78, 1], [47, 82], [57, 83], [62, 75, 1]]), 'm', { inner: 'p', lw });
  c.paint('earL', B([[42, 79, 1], [65, 66, 1], [63, 75, 1], [57, 85, 1], [46, 83, 1]]), 'P');
  c.stroke(Cv([[65, 63.5], [43, 77.5]]), 'M', { on: 'earL', t: px(1.2) });
  c.shape('earR', B([[154, 61, 1], [179, 78, 1], [173, 83], [164, 84], [159, 74, 1]]), 'P', { inner: 'p', lw });
  c.paint('earR', B([[178, 79, 1], [156, 65, 1], [159, 74, 1], [165, 86, 1], [174, 83, 1]]), 'p');
  c.stroke(Cv([[156, 63.5], [177, 77.5]]), 'm', { on: 'earR', t: px(1.2) });

  // ---- the hair: a combed-back pompadour as the top of the dome (a low rounded dome hugging the skull, the front only
  // a little higher than the back); tapered ridges sweep from the hairline up and back, converging to the crown; a
  // temple recess and short sideburn wedges at the hairline; a pink shadow on the skin under the front (no brim) ----
  const HAIRLINE = [[158, 63], [155, 67], [151, 58], [140, 53], [132, 51], [120, 52], [108, 55], [100, 52], [92, 52], [82, 57], [70, 67], [66, 61]];
  c.shape('hair', B([[63, 60], [67, 50], [76, 41], [89, 35], [104, 31.5], [120, 31], [134, 33], [146, 38], [154, 46], [158, 55], ...HAIRLINE]), 'H', { inner: 'P', lw });
  c.paint('hair', B([[118, 30], [166, 38], [166, 70], [140, 56], [124, 53], [132, 42]]), 'h');
  const hy = (pts) => pts.map(([x, y]) => [x, 55 - (55 - y) * 0.75]);   // the ridges, fitted to the lower dome
  for (const g of [
    [[86, 55], [85, 43], [92, 33], [104, 29], [120, 32]],
    [[93, 53], [95, 44], [104, 37], [120, 36], [138, 39]],
    [[103, 54], [109, 46], [122, 42], [142, 43]],
    [[116, 52], [126, 47], [144, 48], [151, 51]],
  ]) c.stroke(Cv(hy(g)), 'G', { on: 'hair', t: px(1.8) });
  for (const g of [[[80, 50], [79, 39], [85, 30], [96, 26]], [[89, 50], [90, 42], [97, 35], [108, 32]], [[99, 51], [102, 44], [112, 39]]]) c.stroke(Cv(hy(g)), 'W', { on: 'hair', t: px(1.4) });
  c.stroke(Cv([[122, 53.5], [108, 56.5], [100, 53.5], [92, 53.5], [82, 58.5]]), 'P', { on: 'head', t: px(1.6) });

  // ---- the face ----
  const [NX, NY] = [84, 91], [FX, FY] = [117, 92];   // the near eye, the far (patch) eye
  const bs = k < 0.8 ? 1.2 : 0;   // at the dialogue size the brows sit a unit higher, leaving a skin gap over the eyes
  const brow = (pts) => c.stroke(Cv(pts.map(([x, y]) => [x, y - bs])), 'K', { t: px(4, 2) });
  if (expr === 'shock') {
    brow([[NX - 8, NY - 15], [NX, NY - 20], [NX + 8, NY - 16]]);
    brow([[FX - 8, FY - 17], [FX, FY - 22], [FX + 8, FY - 17]]);
    for (const [ex, ey] of [[NX, NY], [FX, FY]]) {
      c.shape('eye' + ex, E(ex, ey, 5.5, 6.5), 'W', { inner: 'K' });
      c.paint('eye' + ex, E(ex - 0.5, ey + 0.5, 2.4, 2.8), 'K');
    }
  } else if (expr === 'laugh') {
    brow([[NX - 8, NY - 12], [NX, NY - 15], [NX + 8, NY - 12]]);
    brow([[FX - 8, FY - 14], [FX, FY - 18], [FX + 8, FY - 14]]);
    // the near eye squeezed shut; the patch eye shut under a heavy lid
    c.stroke(Cv([[NX - 7, NY + 2], [NX, NY - 4], [NX + 7, NY + 2]]), 'K', { t: px(3, 2) });
    c.shape('lid', B([[FX - 8, FY + 1], [FX - 4, FY - 3], [FX + 4, FY - 3], [FX + 8, FY + 1], [FX, FY + 2]]), 'K');
    c.stroke(Cv([[FX - 5, FY + 4], [FX, FY + 5], [FX + 5, FY + 4]]), 'w', { on: ['head', 'patch'] });
  } else {
    // the smug politician: a wink, the near brow pulled down toward the nose; the patch eye half open under a heavy
    // lid with a glint, its brow cocked up
    brow([[NX - 9, NY - 11], [NX - 1, NY - 12], [NX + 8, NY - 8]]);
    brow([[FX - 8, FY - 13], [FX, FY - 17.5], [FX + 8, FY - 13.5]]);
    c.stroke(Cv([[NX - 7, NY + 2], [NX - 3, NY - 1.5], [NX + 3, NY - 1.5], [NX + 7, NY + 1]]), 'K', { t: px(2.6, 2) });
    c.stroke(Cv([[NX - 7, NY + 2], [NX - 10, NY + 4]]), 'K', { t: px(1.6) });
    c.stroke(Cv([[NX - 4, NY + 5], [NX + 1, NY + 6], [NX + 5, NY + 5]]), 'p', { on: 'head' });
    c.shape('eyeF', B([[FX - 7, FY + 1], [FX - 4, FY - 3.5], [FX + 4, FY - 3.5], [FX + 7, FY + 1], [FX + 3, FY + 4], [FX - 3, FY + 4]]), 'W', { inner: 'K' });
    c.paint('eyeF', E(FX - 1.5, FY + 1.6, 3, 3), 'r');
    c.paint('eyeF', E(FX - 1.5, FY + 2, 1.4, 1.6), 'K');
    // the heavy flat lid, drooping a little at the outer end (no lash flicks)
    c.paint('eyeF', B([[FX - 9, FY - 6], [FX + 9, FY - 6], [FX + 9, FY + 1.8], [FX + 4, FY + 0.8], [FX, FY + 0.4], [FX - 9, FY + 0.8]]), 'x');
    c.stroke(Cv([[FX - 6.5, FY + 1], [FX, FY + 0.6], [FX + 4.5, FY + 1.2], [FX + 6.5, FY + 2.2]]), 'K', { on: 'eyeF', t: px(2.4, 2) });
    c.dot(...T([FX - 0.3, FY + 1.4]), 'W');
  }
  // the nose: big, black, shiny
  c.shape('nose', B([[74, 104], [80, 98], [92, 97], [103, 101], [103, 110], [94, 116], [82, 115], [75, 110]]), 'K', { lw });
  c.paint('nose', E(85, 102, 5, 2, -0.15), 'g');
  c.paint('nose', E(83, 101.5, 2, 1, -0.15), 'G');
  c.dot(...T([79, 111]), 'k', Math.max(1, Math.round(1.2 * k))); c.dot(...T([99, 110]), 'k', Math.max(1, Math.round(1.2 * k)));
  c.stroke(Cv([[89, 116], [89, 123]]), 'p', { t: px(1.4) });
  for (const [x, y] of [[73, 119], [77, 123], [71, 125], [104, 120], [108, 124], [101, 125]]) c.dot(...T([x, y]), 'p', k >= 1 ? 1 : 0);
  // the flews: the upper lip drapes over both mouth corners (the bulldog sag)
  const flews = () => {
    c.stroke(Cv([[82, 119], [72, 120], [63, 123]]), 'p', { on: 'head', t: px(1.3) });
    c.stroke(Cv([[97, 120], [112, 122], [124, 126], [130, 130]]), 'p', { on: 'head', t: px(1.3) });
  };
  // the mouth: lopsided, the near corner higher and tucked into a deep crease
  if (expr === 'grin') {
    c.shape('mouth', B([[62, 123, 1], [80, 132], [96, 136], [113, 135], [129, 130, 1], [121, 139], [97, 147], [75, 138]]), 'W', { inner: 'K', lw });
    for (let x = 72; x < 126; x += 8) c.stroke(Cv([[x, 124], [x, 133 + 5 * (1 - ((x - 96) / 33) ** 2)]]), 'H', { on: 'mouth' });
    c.paint('mouth', B([[66, 131], [97, 143], [124, 134], [121, 139], [97, 147], [75, 138]]), 'H');
    flews();
  } else if (expr === 'laugh') {
    c.shape('mouth', B([[61, 122, 1], [80, 131], [96, 135], [113, 133], [131, 127, 1], [128, 140], [115, 150], [96, 153], [78, 148], [66, 136]]), 'k', { inner: 'K', lw });
    c.paint('mouth', B([[59, 121], [80, 131], [96, 135], [113, 133], [133, 126], [131, 133], [113, 139], [96, 141], [80, 137], [61, 129]]), 'W');
    for (let x = 69; x < 128; x += 7) c.stroke(Cv([[x, 122], [x, 140 - 9 * ((x - 96) / 33) ** 2]]), 'H', { on: 'mouth', line: false });
    c.paint('mouth', B([[76, 146], [88, 141], [104, 140], [116, 143], [122, 147], [108, 152], [90, 152]]), 'P');
    c.paint('mouth', B([[88, 147], [104, 145], [113, 147], [106, 150], [92, 150]]), 'm');
    c.stroke(Cv([[101, 144], [101, 151]]), 'p', { on: 'mouth' });
    flews();
  } else {
    c.shape('mouth', E(95, 140, 7.5, 8.5), 'k', { inner: 'K', lw });
    c.paint('mouth', E(95, 145, 5, 3), 'P');
  }
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
