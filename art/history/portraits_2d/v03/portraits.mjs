// M4.6 (Ivan: "Let's redraw the portraits of Trash Panda and Dog Fjord... I would prefer completely 2d approach please.
// The raccoon looks much better, but that look of blobby face, hands and torso is just meh. Let's do pure 2d pixel
// art."): the hero portraits drawn in 2D: flat shapes, hard outlines, cel shading and pixels placed by hand
// (tools/lib/draw2d.mjs). One drawing per character, laid out on the posters' 232 x 208 grid and drawn at any scale
// (the in-game dialogue portrait is the same drawing, smaller), so every size is real pixel art, never a resample.
import { Canvas, blob, curve, ell, bar } from '../lib/draw2d.mjs';

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

  // ---- the torso: a flat shoulder line out from the neck, sides tapering a little to the waist, a rounded bottom;
  // a pale chest patch, wide at the chest and narrowing down the belly; one flat shadow ----
  c.shape('body', blob([[100, 114], [84, 118], [76, 124], [72, 138], [73, 160], [78, 182], [90, 198], [110, 205], [142, 205], [162, 198], [174, 182], [179, 160], [181, 138], [178, 125], [168, 118], [150, 114]]), 'h', { inner: 'g', lw });
  c.paint('body', blob([[106, 116], [152, 116], [160, 128], [157, 148], [148, 170], [138, 190], [127, 197], [117, 189], [110, 170], [103, 148], [100, 128]]), 'H');
  c.paint('body', blob([[160, 116], [178, 124], [188, 150], [182, 180], [164, 202], [140, 212], [150, 192], [160, 170], [164, 140]]), 'G');
  c.paint('body', blob([[84, 186], [110, 198], [140, 198], [160, 192], [150, 212], [100, 212]]), 'G');
  // a few fur notches at the chest patch's edges (no muscles: it is a chubby raccoon)
  for (const [x, y, d] of [[104, 146, 1], [110, 168, 1], [156, 144, -1], [148, 166, -1]]) c.stroke([[x, y], [x + 4 * d, y + 2], [x, y + 4]], 'h', { on: 'body' });
  // the ruff: a zig-zag of fur under the jaw, in shadow
  c.paint('body', blob([[98, 108], [152, 108], [158, 118], [150, 116, 1], [144, 124, 1], [138, 117, 1], [132, 125, 1], [126, 117, 1], [120, 125, 1], [114, 117, 1], [108, 124, 1], [102, 117, 1], [94, 120]]), 'G');

  // ---- the far arm: elbow out, fist on the hip; as chunky as the near one, grey down to the wrist, the paw dark ----
  c.shape('armR', blob([[164, 120], [180, 123], [195, 139], [205, 157], [200, 167], [190, 166], [180, 150], [167, 140]]), 'G', { inner: 'g', lw });
  c.paint('armR', blob([[168, 138], [182, 150], [192, 168], [210, 162], [214, 176], [190, 176]]), 'g');
  c.stroke(curve([[168, 122], [181, 126], [196, 142]]), 'h', { on: 'armR' });
  c.shape('foreR', blob([[192, 156], [203, 157], [206, 166], [199, 178], [190, 190], [180, 186], [187, 172]]), 'G', { inner: 'g', lw });
  c.paint('foreR', blob([[204, 168], [197, 180], [190, 190], [186, 186], [196, 173]]), 'g');
  // the fist: knuckles to the front, the thumb on top
  c.shape('fistR', blob([[172, 182, 1], [178, 178], [186, 180], [192, 186], [190, 196], [182, 200], [174, 198, 1], [170, 194, 1], [172, 190, 1], [170, 186, 1]]), 'k', { inner: 'K', lw });
  c.stroke([[172, 186], [180, 186]], 'K', { on: 'fistR' }); c.stroke([[171, 191], [180, 191]], 'K', { on: 'fistR' }); c.stroke([[173, 195], [180, 196]], 'K', { on: 'fistR' });
  c.stroke(curve([[176, 180], [184, 179], [190, 184]]), 'g', { on: 'fistR' });
  for (const [x, y] of [[174, 184], [173, 189], [174, 193]]) c.dot(x, y, 'g');

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
  c.paint('head', blob([[84, 94], [92, 95], [106, 93], [120, 90], [130, 85], [137, 84], [148, 87], [162, 88], [173, 86], [180, 95], [176, 104], [164, 110], [148, 115], [130, 117], [114, 114], [100, 109], [88, 103]]), 'W');
  // the jaw under the smirk in flat shadow
  c.paint('head', blob([[112, 110], [132, 112], [150, 110], [168, 105], [172, 110], [160, 116], [140, 121], [118, 120]]), 'H');
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
  c.stroke(curve([[148, 111], [156, 113], [164, 110]]), 'h', { on: 'head' });   // the chin under the lip
  for (const [x, y] of [[152, 97], [148, 100], [155, 101]]) c.dot(x, y, 'h');
  // fur tufts on the cheek ruffs
  for (const [x, y, dx, dy] of [[84, 98, -7, 2], [90, 104, -5, 5], [104, 110, -3, 5], [168, 106, 5, 2], [160, 113, 4, 3]]) c.stroke([[x, y], [x + dx, y + dy]], 'G', { on: 'head' });

  // ---- the near arm: a separate upper arm (a dark seam against the body) down to a round elbow, the chunky grey
  // forearm up to the dark paw, whose fingers wrap round the pump ----
  c.shape('armL', blob([[80, 121], [94, 125], [96, 140], [92, 158], [86, 172], [74, 176], [67, 166], [68, 146], [72, 130]]), 'h', { inner: 'G', lw });
  c.paint('armL', blob([[90, 130], [97, 128], [94, 156], [86, 174], [80, 176], [84, 160], [89, 144]]), 'G');
  c.paint('armL', blob([[72, 132], [80, 125], [79, 142], [73, 158], [69, 150]]), 'H');
  c.shape('foreL', blob([[58, 147], [64, 141], [70, 142], [76, 154], [82, 166], [80, 175], [71, 178], [64, 167]]), 'G', { inner: 'g', lw });
  c.paint('foreL', blob([[70, 146], [77, 156], [82, 168], [80, 175], [76, 168], [70, 156], [66, 148]]), 'g');
  c.paint('foreL', blob([[56, 146], [64, 140], [70, 143], [66, 150], [60, 152]]), 'k');
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
  c.shape('head', B([
    [84, 48], [110, 43], [136, 46], [148, 54], [152, 64], [154, 78], [158, 92], [165, 106], [171, 120], [174, 134], [172, 146],
    [164, 153], [150, 155], [130, 158], [100, 158], [80, 156], [65, 153], [54, 148], [48, 136], [48, 120], [54, 104], [60, 92],
    [64, 78], [67, 64], [73, 54],
  ]), 'm', { inner: 'p', lw });
  // three tones: the lit left plane (M), the base (m), one shadow shape down the right and under the jowls (P)
  c.paint('head', B([[140, 30], [200, 40], [200, 190], [60, 190], [40, 150], [56, 144], [80, 149], [102, 151], [128, 150], [150, 145], [160, 132], [160, 112], [154, 92], [149, 70], [140, 52]]), 'P');
  c.paint('head', B([[20, 60], [70, 48], [76, 56], [70, 72], [66, 92], [62, 112], [60, 132], [58, 150], [20, 160]]), 'M');
  // forehead wrinkles (upper left), and the jowl creases from beside the nose down past the mouth corners
  c.stroke(Cv([[86, 67], [97, 64.5], [110, 66.5]]), 'p', { on: 'head', t: px(1.2) });
  c.stroke(Cv([[89, 72.5], [99, 70.5], [112, 72.5]]), 'p', { on: 'head', t: px(1.2) });
  c.stroke(Cv([[66, 117], [59, 128], [61, 140], [68, 149]]), 'p', { on: 'head', t: px(1.4) });
  c.stroke(Cv([[131, 116], [137, 127], [135, 139], [128, 149]]), 'p', { on: 'head', t: px(1.4) });
  // the brown heart patch round the far eye
  c.shape('patch', B([[104, 89], [104, 83], [110, 79], [117, 81.5], [124, 79], [131, 82], [132, 89], [127, 99], [118, 109, 1], [109, 99]]), 'x', { inner: 'w', clip: 'head' });
  c.paint('patch', B([[106, 85], [110, 81], [115, 83.5], [110, 88], [107, 90]]), 'X');

  // ---- ears: angular rose-ear flaps hinged under the hair at the skull's sides, tips out and slightly down, a
  // straight light fold edge over a dark underside ----
  c.shape('earL', B([[81, 56, 1], [55, 73, 1], [61, 77], [72, 77], [80, 69, 1]]), 'm', { inner: 'p', lw });
  c.paint('earL', B([[56, 74, 1], [80, 62, 1], [81, 70, 1], [72, 78, 1], [60, 78, 1]]), 'P');
  c.stroke(Cv([[79, 59], [57, 72.5]]), 'M', { on: 'earL', t: px(1.2) });
  c.shape('earR', B([[144, 55, 1], [167, 71, 1], [161, 76], [151, 77], [146, 68, 1]]), 'P', { inner: 'p', lw });
  c.paint('earR', B([[166, 72, 1], [145, 61, 1], [146, 69, 1], [151, 78, 1], [162, 77, 1]]), 'p');
  c.stroke(Cv([[146, 58], [165, 70.5]]), 'm', { on: 'earR', t: px(1.2) });

  // ---- the hair: a combed-back pompadour. The quiff at the front left is the highest point, the top slopes down to
  // the back right; tapered ridges sweep from the hairline up and back, converging to the crown; a temple recess and
  // sideburn notches at the hairline; a pink shadow on the skin under it (no brim) ----
  const HAIRLINE = [[152, 58], [146, 54], [134, 51], [120, 52], [108, 55], [100, 52], [92, 52], [86, 57], [82, 61]];
  c.shape('hair', B([[78, 56], [75, 44], [77, 33], [84, 26], [94, 23], [104, 24], [112, 28], [126, 31], [140, 35], [150, 41], [155, 49], ...HAIRLINE]), 'H', { inner: 'P', lw });
  c.paint('hair', B([[118, 30], [160, 38], [160, 64], [140, 56], [124, 53], [132, 42]]), 'h');
  for (const g of [
    [[86, 55], [85, 43], [92, 33], [104, 29], [120, 32]],
    [[93, 53], [95, 44], [104, 37], [120, 36], [138, 39]],
    [[103, 54], [109, 46], [122, 42], [142, 43]],
    [[116, 52], [126, 47], [144, 48], [151, 51]],
  ]) c.stroke(Cv(g), 'G', { on: 'hair', t: px(1.8) });
  for (const g of [[[80, 50], [79, 39], [85, 30], [96, 26]], [[89, 50], [90, 42], [97, 35], [108, 32]], [[99, 51], [102, 44], [112, 39]]]) c.stroke(Cv(g), 'W', { on: 'hair', t: px(1.4) });
  c.stroke(Cv(HAIRLINE.map(([x, y]) => [x, y + 1.6])), 'P', { on: 'head', t: px(1.8) });

  // ---- the face ----
  const [NX, NY] = [84, 91], [FX, FY] = [117, 92];   // the near eye, the far (patch) eye
  const brow = (pts) => c.stroke(Cv(pts), 'K', { t: px(4, 2) });
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
    brow([[FX - 8, FY - 14], [FX, FY - 19], [FX + 8, FY - 15]]);
    c.stroke(Cv([[NX - 7, NY + 2], [NX - 3, NY - 1.5], [NX + 3, NY - 1.5], [NX + 7, NY + 1]]), 'K', { t: px(2.6, 2) });
    c.stroke(Cv([[NX - 7, NY + 2], [NX - 10, NY + 4]]), 'K', { t: px(1.6) });
    c.stroke(Cv([[NX - 4, NY + 5], [NX + 1, NY + 6], [NX + 5, NY + 5]]), 'p', { on: 'head' });
    c.shape('eyeF', B([[FX - 7, FY + 1], [FX - 4, FY - 3.5], [FX + 4, FY - 3.5], [FX + 7, FY + 1], [FX + 3, FY + 4], [FX - 3, FY + 4]]), 'W', { inner: 'K' });
    c.paint('eyeF', E(FX - 1.5, FY + 1.6, 3, 3), 'r');
    c.paint('eyeF', E(FX - 1.5, FY + 2, 1.4, 1.6), 'K');
    c.paint('eyeF', B([[FX - 9, FY - 6], [FX + 9, FY - 6], [FX + 9, FY + 0.6], [FX, FY + 0.2], [FX - 9, FY + 0.6]]), 'x');
    c.stroke(Cv([[FX - 8, FY + 1.2], [FX, FY + 0.2], [FX + 8, FY + 1.2]]), 'K', { t: px(2.4, 2) });
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
    c.stroke(Cv([[88, 153], [97, 155], [108, 153]]), 'p', { on: 'head' });
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
