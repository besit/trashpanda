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

  // ---- the torso: a chubby barrel as wide as the head, centred under it, a pale front, one flat shadow ----
  c.shape('body', blob([[104, 110], [84, 117], [74, 128], [70, 148], [71, 172], [76, 190], [90, 201], [110, 205], [142, 205], [162, 201], [176, 190], [181, 172], [182, 148], [178, 128], [168, 117], [148, 110]]), 'h', { inner: 'g', lw });
  c.paint('body', blob([[110, 114], [140, 114], [147, 134], [147, 166], [141, 190], [126, 200], [112, 192], [105, 166], [104, 134]]), 'H');
  c.paint('body', blob([[158, 114], [176, 126], [186, 150], [182, 180], [164, 202], [140, 212], [150, 192], [160, 168], [163, 140]]), 'G');
  c.paint('body', blob([[84, 186], [110, 198], [140, 198], [160, 192], [150, 212], [100, 212]]), 'G');
  // a few fur notches at the pale front's edges (no muscles: it is a chubby raccoon)
  for (const [x, y, d] of [[105, 150, 1], [106, 170, 1], [147, 148, -1], [146, 168, -1]]) c.stroke([[x, y], [x + 4 * d, y + 2], [x, y + 4]], 'h', { on: 'body' });
  // the ruff: a zig-zag of fur under the jaw, in shadow
  c.paint('body', blob([[98, 108], [152, 108], [158, 118], [150, 116, 1], [144, 124, 1], [138, 117, 1], [132, 125, 1], [126, 117, 1], [120, 125, 1], [114, 117, 1], [108, 124, 1], [102, 117, 1], [94, 120]]), 'G');

  // ---- the far arm: elbow out, fist on the hip; as chunky as the near one, the forearm dark ----
  c.shape('armR', blob([[162, 120], [178, 124], [194, 140], [204, 158, 1], [192, 167], [180, 150], [166, 140]]), 'G', { inner: 'g', lw });
  c.paint('armR', blob([[168, 136], [184, 148], [198, 168], [210, 160], [214, 176], [190, 176]]), 'g');
  c.stroke(curve([[166, 122], [180, 126], [195, 142]]), 'h', { on: 'armR' });
  c.shape('foreR', blob([[192, 154], [205, 160, 1], [199, 176], [190, 190], [179, 186], [187, 172]]), 'g', { inner: 'K', lw });
  c.paint('foreR', blob([[203, 166], [197, 180], [190, 190], [186, 186], [195, 172]]), 'k');
  // the fist: knuckles to the front, the thumb on top
  c.shape('fistR', blob([[172, 182, 1], [178, 178], [186, 180], [192, 186], [190, 196], [182, 200], [174, 198, 1], [170, 194, 1], [172, 190, 1], [170, 186, 1]]), 'k', { inner: 'K', lw });
  c.stroke([[172, 186], [180, 186]], 'K', { on: 'fistR' }); c.stroke([[171, 191], [180, 191]], 'K', { on: 'fistR' }); c.stroke([[173, 195], [180, 196]], 'K', { on: 'fistR' });
  c.stroke(curve([[176, 180], [184, 179], [190, 184]]), 'g', { on: 'fistR' });
  for (const [x, y] of [[174, 184], [173, 189], [174, 193]]) c.dot(x, y, 'g');

  // ---- the head: a round cranium centred over the body, cheek ruffs flaring out on both sides ----
  c.shape('head', blob([
    [92, 50], [106, 41], [124, 37], [142, 39], [156, 46], [165, 57], [169, 70], [171, 82], [171, 92], [177, 99, 1], [167, 103],
    [172, 110, 1], [158, 112], [146, 116], [130, 118], [116, 117, 1], [108, 112], [98, 118, 1], [96, 110], [84, 113, 1], [85, 105],
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
  c.paint('head', blob([[76, 93], [92, 94], [106, 93], [120, 90], [130, 85], [137, 84], [148, 86], [162, 86], [172, 83], [178, 92], [172, 101], [160, 107], [146, 113], [130, 116], [114, 114], [98, 109], [84, 103]]), 'W');
  c.paint('head', blob([[108, 108], [130, 111], [150, 107], [168, 99], [164, 108], [146, 115], [128, 119], [110, 115]]), 'H');
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
  eye(117, 76, 8, 6);
  eye(152, 74.5, 6.6, 5.2);
  // the nose: just inside the cheek line
  c.shape('nose', blob([[155, 84], [160, 80], [167, 81], [171, 85], [168, 90], [162, 92], [156, 89]]), 'K', { lw });
  c.paint('nose', ell(161, 83, 2.6, 1.2), 'g');
  c.dot(160, 83, 'G');
  // the smirk: a line down from the nose, then the mouth sweeping back into the raised near corner and its dimple
  c.stroke(curve([[162, 92], [161, 96], [155, 99], [148, 100.5], [142, 99.5], [138, 97], [135.5, 92.5]]), 'K', { t: Math.max(1, Math.round(1.3 * k)) });
  c.stroke(curve([[137.5, 95.5], [134, 93], [134.5, 89.5]]), 'K');
  c.stroke(curve([[161, 96], [165, 98], [168, 97]]), 'K');
  c.stroke(curve([[144, 104], [152, 106], [160, 103]]), 'H', { on: 'head' });   // the chin under the lip
  for (const [x, y] of [[148, 90], [144, 93], [151, 94]]) c.dot(x, y, 'h');
  // fur tufts on the cheek ruffs
  for (const [x, y, dx, dy] of [[84, 98, -7, 2], [90, 104, -5, 5], [104, 110, -3, 5], [166, 100, 5, 2], [158, 108, 4, 3]]) c.stroke([[x, y], [x + dx, y + dy]], 'H', { on: 'head' });

  // ---- the near arm: down to the elbow, the dark forearm up to the paw, whose fingers wrap round the pump ----
  c.shape('armL', blob([[86, 124], [104, 132], [100, 150], [92, 170], [84, 180, 1], [72, 176], [70, 156], [74, 138]]), 'h', { inner: 'g', lw });
  c.paint('armL', blob([[96, 138], [102, 134], [98, 154], [90, 172], [84, 178], [86, 166], [92, 150]]), 'G');
  c.paint('armL', blob([[76, 134], [84, 128], [82, 144], [76, 160], [72, 150]]), 'H');
  c.shape('foreL', blob([[72, 176], [84, 180, 1], [80, 166], [72, 152], [66, 142], [58, 144], [62, 156]]), 'g', { inner: 'K', lw });
  c.paint('foreL', blob([[66, 146], [74, 156], [80, 168], [82, 178], [76, 170], [68, 158], [62, 150]]), 'k');
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
  c.shape('suit', B([[62, 214, 1], [66, 186], [78, 170], [96, 160], [130, 160], [148, 170], [160, 186], [164, 214, 1]]), 'g', { inner: 'k', lw });
  c.paint('suit', B([[124, 160], [148, 170], [160, 186], [166, 214], [136, 214], [134, 186]]), 'k');
  c.shape('shirt', B([[93, 160, 1], [119, 160, 1], [107, 204, 1], [105, 204, 1]]), 'W', { inner: 'K' });
  c.paint('shirt', B([[107, 160], [119, 160], [107, 204]]), 'H');
  c.shape('lapelL', B([[90, 162, 1], [105, 202, 1], [95, 188, 1], [84, 175, 1], [78, 168, 1]]), 'k', { inner: 'K' });
  c.shape('lapelR', B([[122, 162, 1], [136, 167, 1], [130, 178, 1], [118, 192, 1], [107, 202, 1]]), 'k', { inner: 'K' });
  c.shape('tie', B([[102, 170, 1], [110, 170, 1], [109, 178, 1], [114, 206, 1], [106, 213, 1], [98, 206, 1], [103, 178, 1]]), 'U', { inner: 'K' });
  for (let y = 176; y < 212; y += 5) for (let x = 98 + ((y / 5) % 2) * 2.5; x < 116; x += 5) c.paint('tie', E(x, y, 0.8, 0.8), 'c');
  c.paint('tie', B([[107, 170], [110, 170], [109, 178], [114, 206], [108, 210]]), 'u');
  c.shape('knot', B([[100, 163, 1], [112, 163, 1], [111, 171, 1], [101, 171, 1]]), 'U', { inner: 'K' });
  c.paint('knot', B([[107, 163], [112, 163], [111, 171], [107, 171]]), 'u');

  // ---- the head: a broad rounded skull flowing into wide low jowls and a full round bottom (a bell, not an onion) ----
  c.shape('head', B([
    [84, 50], [110, 44], [140, 46], [152, 52], [157, 62], [158, 76], [161, 90], [168, 104], [174, 120], [173, 137], [164, 151],
    [147, 160], [124, 164], [100, 164], [78, 160], [61, 151], [50, 139], [46, 123], [50, 106], [56, 93], [59, 80], [62, 66], [70, 55],
  ]), 'm', { inner: 'p', lw });
  // three tones: the lit left plane + muzzle (M), the base (m), one shadow shape down the right and under the jowls (P)
  c.paint('head', B([[140, 30], [200, 40], [200, 190], [60, 190], [40, 150], [62, 148], [80, 154], [102, 157], [126, 155], [146, 148], [157, 134], [159, 114], [155, 94], [150, 72], [140, 52]]), 'P');
  c.paint('head', B([[40, 120], [44, 96], [52, 70], [66, 52], [74, 58], [66, 76], [60, 96], [58, 116], [56, 132]]), 'M');
  c.paint('head', B([[63, 112], [70, 101], [86, 95], [104, 96], [118, 104], [123, 116], [118, 126], [98, 129], [74, 127], [62, 121]]), 'M');
  // forehead wrinkles, jowl creases framing the mouth
  c.stroke(Cv([[86, 66], [96, 64], [106, 66]]), 'p', { on: 'head' });
  c.stroke(Cv([[89, 71], [99, 69], [109, 71]]), 'p', { on: 'head' });
  c.stroke(Cv([[59, 124], [61, 138], [66, 150]]), 'p', { on: 'head' });
  c.stroke(Cv([[137, 127], [136, 140], [130, 152]]), 'p', { on: 'head' });
  // the brown heart patch round the far eye
  c.shape('patch', B([[104, 89], [104, 83], [110, 79], [117, 83], [124, 79], [131, 82], [132, 89], [127, 99], [118, 109, 1], [109, 99]]), 'x', { inner: 'w', clip: 'head' });
  c.paint('patch', B([[106, 85], [110, 81], [115, 84], [110, 88], [107, 90]]), 'X');

  // ---- ears: folded rose-ear flaps at the upper corners, hinged under the hair, tips out and down ----
  c.shape('earL', B([[86, 52], [70, 52], [52, 59, 1], [55, 67], [64, 74], [76, 73], [84, 63]]), 'm', { inner: 'p', lw });
  c.paint('earL', B([[54, 62], [63, 71], [77, 71], [70, 64]]), 'P');
  c.stroke(Cv([[55, 61], [68, 63], [82, 62]]), 'p', { on: 'earL' });
  c.shape('earR', B([[136, 49], [152, 51], [167, 61, 1], [163, 69], [154, 77], [145, 72], [139, 61]]), 'P', { inner: 'p', lw });
  c.paint('earR', B([[165, 63], [154, 75], [146, 70], [154, 66]]), 'p');
  c.stroke(Cv([[164, 62], [152, 64], [141, 60]]), 'p', { on: 'earR' });

  // ---- the hair: a compact grey cap combed over to the right in chunky bands, a small curl at the front ----
  c.shape('hair', B([[79, 58], [76, 46], [80, 34], [90, 27], [104, 25], [120, 26], [136, 30], [148, 38], [154, 48], [154, 57], [142, 53], [122, 50], [100, 52]]), 'H', { inner: 'G', lw });
  // combed back over the dome in long grooves; the front lifts into a small quiff
  c.paint('hair', B([[110, 40], [132, 36], [150, 44], [156, 60], [140, 54], [118, 52], [100, 54]]), 'h');
  for (const g of [[[82, 44], [98, 36], [120, 33], [144, 40]], [[86, 52], [104, 44], [126, 41], [150, 49]], [[94, 31], [110, 29], [130, 32]]]) c.stroke(Cv(g), 'G', { on: 'hair', t: px(1.8) });
  c.rim('hair', 0, 3, 'G');
  c.rim('hair', -2, -2, 'W', { only: ['H'] });

  // ---- the face ----
  const EYES = [[84, 91], [117, 92]];
  const lift = expr === 'shock' ? 7 : expr === 'laugh' ? 3 : 0;
  for (const [ex, ey] of EYES) c.stroke(Cv([[ex - 8, ey - 11 - lift], [ex, ey - 15 - lift - (expr === 'shock' ? 2 : 0)], [ex + 8, ey - 12 - lift]]), 'K', { t: px(4, 2) });
  if (expr === 'shock') {
    for (const [ex, ey] of EYES) {
      c.shape('eye' + ex, E(ex, ey, 5.5, 6.5), 'W', { inner: 'K' });
      c.paint('eye' + ex, E(ex - 0.5, ey + 0.5, 2.4, 2.8), 'K');
    }
  } else if (expr === 'laugh') {
    // squeezed shut
    for (const [ex, ey] of EYES) c.stroke(Cv([[ex - 7, ey + 2], [ex, ey - 4], [ex + 7, ey + 2]]), 'K', { t: px(3, 2) });
  } else {
    // the smug squint: a heavy lid arc over a sliver of eye with a glint
    for (const [ex, ey] of EYES) {
      c.shape('eye' + ex, B([[ex - 7, ey + 1.5], [ex - 4, ey - 1.5], [ex + 4, ey - 1.5], [ex + 7, ey + 1.5], [ex, ey + 3]]), 'p', { inner: 'K' });
      c.stroke(Cv([[ex - 8, ey + 1.5], [ex, ey - 3.5], [ex + 8, ey + 1.5]]), 'K', { t: px(2.6, 2) });
      c.dot(...T([ex + 2, ey + 0.8]), 'W');
      c.stroke(Cv([[ex - 5, ey + 5.5], [ex, ey + 6.5], [ex + 5, ey + 5.5]]), 'p', { on: ['head', 'patch'] });
    }
  }
  // the nose: big, black, shiny
  c.shape('nose', B([[74, 104], [80, 98], [92, 97], [103, 101], [103, 110], [94, 116], [82, 115], [75, 110]]), 'K', { lw });
  c.paint('nose', E(85, 102, 5, 2, -0.15), 'g');
  c.paint('nose', E(83, 101.5, 2, 1, -0.15), 'G');
  c.dot(...T([79, 111]), 'k', Math.max(1, Math.round(1.2 * k))); c.dot(...T([99, 110]), 'k', Math.max(1, Math.round(1.2 * k)));
  c.stroke(Cv([[89, 116], [89, 124]]), 'p', { t: px(1.4) });
  for (const [x, y] of [[72, 118], [76, 123], [69, 125], [105, 119], [109, 124], [102, 125]]) c.dot(...T([x, y]), 'p', k >= 1 ? 1 : 0);
  // the mouth
  if (expr === 'grin') {
    c.shape('mouth', B([[64, 127, 1], [80, 134], [96, 137], [112, 135], [128, 129, 1], [120, 139], [96, 148], [74, 140]]), 'W', { inner: 'K', lw });
    c.paint('mouth', B([[66, 133], [96, 142], [126, 132], [120, 139], [96, 148], [74, 140]]), 'H');
    for (let x = 72; x < 126; x += 8) c.stroke(Cv([[x, 124], [x, 134 + 7 * (1 - ((x - 96) / 32) ** 2)]]), 'H', { on: 'mouth' });
    c.stroke(Cv([[66, 132], [96, 141.5], [126, 131]]), 'h', { on: 'mouth' });
    c.stroke(Cv([[60, 124], [64, 127], [64, 131]]), 'p', { on: 'head' });
    c.stroke(Cv([[132, 126], [128, 129], [129, 133]]), 'p', { on: 'head' });
    c.stroke(Cv([[86, 154], [96, 156], [106, 154]]), 'p', { on: 'head' });
  } else if (expr === 'laugh') {
    c.shape('mouth', B([[62, 125, 1], [80, 133], [96, 136], [112, 134], [130, 126, 1], [127, 142], [113, 156], [96, 160], [78, 155], [67, 141]]), 'k', { inner: 'K', lw });
    c.paint('mouth', B([[60, 124], [80, 133], [96, 136], [112, 134], [132, 125], [130, 133], [112, 140], [96, 142], [80, 139], [62, 132]]), 'W');
    for (let x = 69; x < 128; x += 7) { const yb = 142 - 10 * ((x - 96) / 33) ** 2; c.stroke(Cv([[x, 124], [x, yb - 0.6]]), 'H', { on: 'mouth', line: false }); }
    c.paint('mouth', B([[76, 153], [86, 146], [104, 145], [118, 148], [122, 152], [108, 159], [90, 159]]), 'P');
    c.paint('mouth', B([[88, 153], [104, 150], [114, 153], [106, 157], [92, 157]]), 'm');
    c.stroke(Cv([[101, 150], [101, 158]]), 'p', { on: 'mouth' });
  } else {
    c.shape('mouth', E(95, 141, 7.5, 8.5), 'k', { inner: 'K', lw });
    c.paint('mouth', E(95, 146, 5, 3), 'P');
  }
  return c.img;
}


/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
