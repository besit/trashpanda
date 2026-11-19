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

export function raccoonPortrait2d(expr = 'smirk', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const lw = k >= 1.4 ? 2 : 1;
  pump(c);

  // ---- ears (behind the head): triangles with round tips, fur outside, dark inside ----
  c.shape('earR', blob([[146, 40], [154, 20], [162, 11], [170, 14], [174, 28], [174, 46]]), 'h', { inner: 'g', lw });
  c.paint('earR', blob([[154, 38], [159, 24], [164, 18], [169, 22], [170, 40]]), 'k');
  c.paint('earR', blob([[156, 36], [160, 26], [164, 22], [167, 26], [167, 38]]), 'g', { pattern: 'checker' });
  c.shape('earL', blob([[86, 62], [82, 40], [82, 24], [88, 17], [96, 20], [116, 38], [112, 50]]), 'h', { inner: 'g', lw });
  c.paint('earL', blob([[92, 54], [88, 36], [89, 27], [94, 25], [104, 36], [106, 46]]), 'k');
  c.paint('earL', blob([[94, 50], [91, 36], [92, 30], [96, 30], [102, 40]]), 'g', { pattern: 'checker' });
  c.rim('earL', -2, -2, 'H');

  // ---- the torso: broad shoulders tapering to the waist, a fur ruff under the chin, a pale front; it ends in a
  // rounded bottom inside the frame. Cel-shaded from the upper left (flat shadow shapes, no pillow shading) ----
  c.shape('body', blob([[104, 108], [90, 122], [78, 130, 1], [76, 146], [84, 172], [98, 192], [120, 203], [150, 204], [172, 194], [186, 176], [196, 150], [198, 134], [188, 124, 1], [176, 112]]), 'h', { inner: 'g', lw });
  // the pale front: from under the chin down the chest and belly
  c.paint('body', blob([[120, 116], [158, 114], [170, 132], [170, 160], [162, 188], [144, 202], [126, 196], [116, 170], [112, 140]]), 'H');
  // the shadow side (right) and under the chest, as flat shapes
  c.paint('body', blob([[168, 112], [190, 124], [200, 140], [196, 170], [184, 192], [160, 204], [150, 206], [164, 186], [174, 160], [174, 134]]), 'G');
  c.paint('body', blob([[176, 120], [196, 132], [198, 160], [188, 184], [172, 198], [180, 176], [184, 150], [182, 132]]), 'g', { pattern: 'checker' });
  c.paint('body', blob([[96, 192], [120, 200], [150, 200], [170, 194], [160, 206], [116, 206]]), 'G');
  c.paint('body', blob([[100, 186], [124, 194], [152, 194], [172, 186], [166, 196], [140, 202], [112, 198]]), 'G', { pattern: 'checker' });
  // the chest's line (where the pecs meet) and the belly fur
  c.stroke(curve([[120, 146], [130, 153], [140, 151]]), 'h', { on: 'body' });
  c.stroke(curve([[164, 144], [154, 153], [144, 151]]), 'h', { on: 'body' });
  c.stroke(curve([[142, 156], [142, 164]]), 'h', { on: 'body' });
  for (const [x, y] of [[132, 176], [146, 180], [138, 190]]) c.stroke([[x, y], [x + 2, y + 3], [x + 4, y]], 'h', { on: 'body' });
  // the ruff: a zig-zag of fur under the jaw, in shadow
  c.paint('body', blob([[100, 108], [176, 110], [180, 122], [170, 118, 1], [164, 126, 1], [156, 119, 1], [148, 128, 1], [140, 120, 1], [132, 129, 1], [124, 120, 1], [116, 127, 1], [110, 119, 1], [100, 124, 1], [96, 116]]), 'G');

  // ---- the far arm: elbow out, fist on the hip ----
  c.shape('armR', blob([[184, 126], [198, 130], [214, 152], [218, 166, 1], [206, 170], [194, 150], [182, 140]]), 'G', { inner: 'g', lw });
  c.paint('armR', blob([[198, 136], [214, 154], [216, 164], [208, 166], [200, 150]]), 'g');
  c.shape('foreR', blob([[206, 158], [218, 166, 1], [206, 182], [194, 194], [184, 188], [196, 174]]), 'g', { inner: 'K', lw });
  c.paint('foreR', blob([[212, 170], [204, 184], [194, 192], [192, 188], [204, 176]]), 'k');
  // the fist: knuckles to the front, the thumb on top
  c.shape('fistR', blob([[176, 182, 1], [182, 178], [190, 180], [196, 186], [194, 196], [186, 200], [178, 198, 1], [174, 194, 1], [176, 190, 1], [174, 186, 1]]), 'k', { inner: 'K', lw });
  c.stroke([[176, 186], [184, 186]], 'K', { on: 'fistR' }); c.stroke([[175, 191], [184, 191]], 'K', { on: 'fistR' }); c.stroke([[177, 195], [184, 196]], 'K', { on: 'fistR' });
  c.stroke(curve([[180, 180], [188, 179], [194, 184]]), 'g', { on: 'fistR' });
  for (const [x, y] of [[178, 184], [177, 189], [178, 193]]) c.dot(x, y, 'g');

  // ---- the head ----
  c.shape('head', blob([
    [96, 46], [112, 35], [136, 31], [158, 35], [172, 45], [180, 58], [188, 68], [200, 75], [208, 84], [206, 94], [194, 101],
    [178, 106], [164, 112], [146, 117], [124, 117, 1], [116, 114], [104, 119, 1], [102, 110], [88, 112, 1], [88, 104], [72, 104, 1],
    [80, 95], [68, 86, 1], [80, 80], [80, 66], [88, 54],
  ]), 'h', { inner: 'g', lw });
  c.rim('head', 9, 5, 'G', { pattern: 'checker' });
  c.rim('head', 5, 3, 'G');
  c.rim('head', -3, -3, 'H', { only: ['h'] });
  // the dark stripe up the middle of the forehead
  c.paint('head', blob([[132, 66], [136, 44], [140, 33], [146, 34], [150, 46], [146, 66]]), 'G', { pattern: 'checker' });
  c.paint('head', blob([[134, 64], [139, 44], [143, 38], [147, 48], [144, 64]]), 'G');
  // the white muzzle (lower face, around the snout) with the cheeks below the mask
  c.paint('head', blob([[118, 96], [140, 90], [160, 84], [182, 76], [200, 78], [208, 88], [202, 99], [186, 106], [164, 113], [140, 116], [116, 112], [106, 104]]), 'W');
  c.paint('head', blob([[150, 104], [178, 100], [196, 100], [186, 107], [164, 113], [140, 116], [128, 112]]), 'H');
  c.paint('head', blob([[110, 106], [124, 108], [140, 113], [124, 116], [108, 112]]), 'H', { pattern: 'checker' });
  // the white brows above each eye
  c.paint('head', blob([[94, 60], [104, 52], [118, 51], [130, 56], [132, 62], [116, 59], [100, 64]]), 'W');
  c.paint('head', blob([[150, 58], [160, 51], [172, 53], [180, 60], [178, 64], [166, 59], [152, 62]]), 'W');
  // the bandit mask: across both eyes, narrow over the bridge of the nose, down onto the cheeks
  c.shape('mask', blob([
    [84, 72], [92, 64], [104, 63], [118, 63], [130, 67], [140, 66], [152, 64], [166, 63], [178, 66], [186, 73], [182, 79],
    [172, 82], [162, 84], [152, 86], [144, 92], [134, 98], [120, 100], [104, 98], [92, 94], [84, 86],
  ]), 'k', { inner: 'K', clip: 'head' });
  c.rim('mask', -2, -2, 'g', { only: ['k'] });
  // eyes: half-lidded and pleased with itself, looking right
  const eye = (cx, cy, w, hgt) => {
    c.shape('eye' + cx, blob([[cx - w, cy + 1], [cx - w * 0.5, cy - hgt * 0.4], [cx + w * 0.5, cy - hgt * 0.45], [cx + w, cy], [cx + w * 0.4, cy + hgt * 0.55], [cx - w * 0.5, cy + hgt * 0.55]]), 'W', { inner: 'K' });
    c.paint('eye' + cx, ell(cx + w * 0.38, cy + 0.6, Math.max(1.6, w * 0.38), Math.max(1.6, hgt * 0.5)), 'K');
    c.paint('eye' + cx, ell(cx + w * 0.38, cy + 0.6, Math.max(1, w * 0.2), Math.max(1, hgt * 0.28)), 'w');
    c.dot(cx + w * 0.22, cy - hgt * 0.05, 'W');
    // the heavy upper lid: a flat line over the top third (the smirk's look)
    c.stroke([[cx - w - 1, cy - 0.5], [cx - w * 0.4, cy - hgt * 0.32], [cx + w * 0.5, cy - hgt * 0.36], [cx + w + 1, cy - 0.8]], 'K', { t: Math.max(1, Math.round(1.6 * k)) });
    c.paint('eye' + cx, blob([[cx - w, cy], [cx - w * 0.4, cy - hgt * 0.6], [cx + w * 0.5, cy - hgt * 0.6], [cx + w, cy - 1], [cx, cy - hgt * 0.15]]), 'k');
  };
  eye(112, 78, 10.5, 10.5);
  eye(162, 76, 8, 9.5);
  // the brows' expression: the near one level, the far one raised a touch
  c.stroke(curve([[100, 61], [112, 57], [124, 59]]), 'H', { on: 'head' });
  c.stroke(curve([[154, 58], [164, 53], [174, 56]]), 'H', { on: 'head' });
  // the nose
  c.shape('nose', blob([[192, 79], [202, 77], [210, 82], [209, 90], [201, 93], [193, 89]]), 'K', { lw });
  c.paint('nose', ell(200, 81, 3, 1.5), 'g');
  c.dot(199, 81, 'G');
  // the smirk: a line down from the nose, then the mouth sweeping back and up into one raised corner
  const mouth = curve([[201, 93], [200, 98], [193, 102], [182, 104], [171, 103], [162, 99], [158, 94]]);
  c.stroke(mouth, 'K', { t: Math.max(1, Math.round(1.4 * k)) });
  c.stroke(curve([[160, 97], [156, 93], [157, 90]]), 'K');                      // the corner's dimple
  c.stroke(curve([[186, 106], [178, 108], [170, 107]]), 'G', { on: 'head' });   // the chin under the lip
  for (const [x, y] of [[178, 92], [184, 90], [181, 96], [173, 94]]) c.dot(x, y, 'G');
  // fur tufts on the cheeks: short strokes along the flare
  for (const [x, y, dx, dy] of [[86, 100, -8, 2], [92, 106, -6, 5], [104, 112, -3, 5], [84, 88, -8, -2]]) c.stroke([[x, y], [x + dx, y + dy]], 'G', { on: 'head' });

  // ---- the near arm: down to the elbow, up to the paw, whose fingers wrap round the pump ----
  c.shape('armL', blob([[86, 124], [104, 132], [100, 150], [92, 170], [84, 180, 1], [72, 176], [72, 156], [76, 138]]), 'h', { inner: 'g', lw });
  c.paint('armL', blob([[96, 138], [102, 134], [98, 154], [90, 172], [84, 178], [86, 166], [92, 150]]), 'G');
  c.paint('armL', blob([[78, 134], [84, 128], [82, 144], [76, 160], [74, 150]]), 'H');
  c.shape('foreL', blob([[72, 176], [84, 180, 1], [80, 166], [72, 152], [66, 142], [58, 144], [62, 156]]), 'G', { inner: 'g', lw });
  c.paint('foreL', blob([[66, 146], [74, 156], [80, 168], [82, 178], [76, 170], [68, 158], [62, 150]]), 'g');
  c.paint('foreL', blob([[58, 144], [66, 142], [70, 148], [62, 152]]), 'k');
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
// A cartoon bulldog (never a real person's likeness): a huge pink pear-shaped head on a small suited body, a grey hair
// swoop, pointed ears, a brown heart-shaped patch round one eye, thick black brows, a big black nose, jowls.
// Three-quarter view facing LEFT. Expressions: grin, laugh, shock.

export function dogPortrait2d(expr = 'grin', k = 1) {
  const W = Math.round(GW * k), H = Math.round(GH * k), c = new Canvas(W, H, k);
  const lw = k >= 1.4 ? 2 : 1, t2 = Math.max(1, Math.round(2 * k)), t3 = Math.max(1, Math.round(3.4 * k));
  // ---- the suit (behind the chin): shoulders, lapels, the white shirt and the blue tie ----
  c.shape('suit', blob([[56, 210, 1], [60, 184], [74, 166], [96, 158], [146, 158], [168, 166], [182, 184], [188, 210, 1]]), 'g', { inner: 'k', lw });
  c.paint('suit', blob([[140, 160], [168, 168], [182, 186], [188, 210], [150, 210], [150, 180]]), 'k');
  c.paint('suit', blob([[64, 186], [76, 170], [92, 162], [80, 180], [72, 210], [60, 210]]), 'G', { pattern: 'checker' });
  c.shape('shirt', blob([[100, 158, 1], [140, 158, 1], [124, 206, 1], [118, 206, 1]]), 'W', { inner: 'K' });
  c.paint('shirt', blob([[124, 160], [140, 158], [124, 204]]), 'H');
  c.shape('lapelL', blob([[96, 158, 1], [116, 200, 1], [104, 186, 1], [92, 172, 1], [84, 164, 1]]), 'k', { inner: 'K' });
  c.shape('lapelR', blob([[144, 158, 1], [158, 164, 1], [150, 172, 1], [138, 186, 1], [126, 200, 1]]), 'k', { inner: 'K' });
  c.shape('tie', blob([[114, 166, 1], [126, 166, 1], [124, 176, 1], [130, 206, 1], [120, 212, 1], [110, 206, 1], [116, 176, 1]]), 'U', { inner: 'K' });
  for (let y = 172; y < 210; y += 5) for (let x = 110 + ((y / 5) % 2) * 2.5; x < 132; x += 5) c.paint('tie', ell(x, y, 0.8, 0.8), 'c');
  c.paint('tie', blob([[121, 166], [126, 166], [124, 176], [130, 206], [124, 210]]), 'u', { pattern: 'checker' });
  c.shape('knot', blob([[113, 160, 1], [127, 160, 1], [125, 170, 1], [115, 170, 1]]), 'U', { inner: 'K' });
  c.paint('knot', blob([[121, 160], [127, 160], [125, 170], [121, 170]]), 'u');

  // ---- ears: pointed flaps up and out (dog ears that read as little horns) ----
  // M4.6: short folded flaps (a bulldog's rose ears), the fold's underside dark
  c.shape('earL', blob([[74, 56], [58, 48], [40, 44, 1], [46, 56], [56, 70], [66, 74]]), 'P', { inner: 'p', lw });
  c.paint('earL', blob([[62, 52], [44, 46], [48, 54], [60, 60]]), 'p');
  c.stroke(curve([[44, 47], [56, 54], [68, 58]]), 'p', { on: 'earL' });
  c.shape('earR', blob([[166, 50], [184, 42], [204, 38, 1], [198, 52], [188, 64], [178, 70]]), 'P', { inner: 'p', lw });
  c.paint('earR', blob([[180, 46], [200, 40], [194, 50], [182, 56]]), 'p');
  c.stroke(curve([[200, 41], [186, 49], [174, 54]]), 'p', { on: 'earR' });

  // ---- the head: narrow at the top, wide jowls at the bottom ----
  c.shape('head', blob([
    [100, 30], [126, 22], [152, 26], [172, 40], [182, 62], [190, 86], [202, 108], [208, 130], [204, 150], [192, 164], [172, 166],
    [150, 172], [120, 174], [92, 172], [70, 166], [50, 164], [34, 152], [28, 130], [32, 106], [48, 82], [62, 58], [80, 38],
  ]), 'm', { inner: 'p', lw });
  // shade: the right side and under the jowls (light from the upper left), a lit band on the left
  c.paint('head', blob([[160, 40], [180, 56], [190, 84], [204, 110], [208, 132], [198, 152], [176, 164], [150, 170], [168, 150], [180, 128], [176, 96], [168, 66]]), 'P');
  c.paint('head', blob([[150, 44], [168, 60], [174, 90], [178, 120], [168, 146], [150, 166], [158, 140], [166, 112], [160, 80]]), 'P', { pattern: 'checker' });
  c.paint('head', blob([[44, 140], [70, 156], [100, 164], [130, 166], [160, 160], [150, 172], [100, 172], [60, 162]]), 'P');
  c.paint('head', blob([[40, 104], [52, 84], [64, 62], [60, 84], [50, 104], [44, 124]]), 'M');
  // the muzzle (paler) round the nose and mouth
  c.paint('head', blob([[46, 116], [64, 98], [96, 92], [128, 98], [152, 112], [158, 134], [142, 152], [108, 158], [72, 154], [48, 138]]), 'M');
  c.paint('head', blob([[128, 102], [152, 112], [158, 134], [144, 150], [148, 128]]), 'm');
  // forehead wrinkles
  for (const [y, x0, x1] of [[50, 106, 152], [57, 112, 148]]) c.stroke(curve([[x0, y + 2], [(x0 + x1) / 2, y - 1], [x1, y + 2]]), 'p', { on: 'head' });
  // jowl folds and the chin
  c.stroke(curve([[40, 118], [46, 138], [62, 154]]), 'p', { on: 'head' });
  c.stroke(curve([[184, 112], [188, 134], [178, 152]]), 'p', { on: 'head' });
  c.stroke(curve([[96, 166], [118, 170], [138, 166]]), 'p', { on: 'head' });
  // the brown heart patch round the far eye
  c.shape('patch', blob([[134, 72], [134, 62], [142, 57], [150, 62], [157, 57], [166, 60], [168, 70], [162, 82], [151, 93, 1], [140, 82]]), 'x', { inner: 'w', clip: 'head' });
  c.paint('patch', blob([[136, 64], [142, 59], [148, 63], [142, 68], [137, 71]]), 'X');

  // ---- the hair: a grey swoop, a big quiff at the front combed back over to the right ----
  c.shape('hair', blob([[84, 52], [82, 36], [94, 22], [116, 14], [142, 12], [164, 18], [180, 32], [184, 48], [176, 46], [164, 40], [146, 38], [126, 40], [108, 44], [96, 50]]), 'h', { inner: 'G', lw });
  c.paint('hair', blob([[112, 18], [142, 14], [164, 20], [178, 34], [182, 46], [170, 40], [150, 30], [128, 24]]), 'H');
  c.paint('hair', blob([[150, 34], [170, 38], [182, 46], [176, 46], [164, 42]]), 'G', { pattern: 'checker' });
  for (const pts of [[[100, 40], [122, 28], [150, 24], [176, 36]], [[104, 46], [128, 36], [156, 34], [180, 44]], [[118, 22], [142, 18], [166, 24]]]) c.stroke(curve(pts), 'G', { on: 'hair' });
  c.shape('quiff', blob([[72, 52], [70, 36], [80, 20], [98, 10], [118, 8], [132, 12], [116, 16], [102, 24], [94, 36], [90, 50], [80, 60]]), 'H', { inner: 'h', lw });
  c.paint('quiff', blob([[80, 26], [96, 14], [116, 10], [104, 18], [90, 28], [84, 40]]), 'W');
  c.stroke(curve([[78, 50], [80, 36], [90, 24], [106, 16]]), 'h', { on: 'quiff' });
  c.stroke(curve([[84, 54], [86, 40], [96, 28], [114, 20]]), 'h', { on: 'quiff' });

  // ---- the face ----
  const brows = expr === 'shock' ? [[[76, 60], [92, 52], [108, 56]], [[134, 56], [150, 50], [164, 56]]]
    : expr === 'laugh' ? [[[76, 64], [92, 58], [108, 62]], [[134, 62], [150, 57], [164, 62]]]
      : [[[76, 68], [92, 62], [110, 62]], [[132, 62], [150, 60], [164, 66]]];
  for (const b of brows) c.stroke(curve(b), 'K', { t: t3 });
  if (expr === 'shock') {
    for (const [x, y, r] of [[93, 76, 8], [150, 76, 7]]) {
      c.shape('eye' + x, ell(x, y, r, r + 1), 'W', { inner: 'K' });
      c.dot(x - 1, y + 1, 'K', Math.max(1, Math.round(1.6 * k)));
    }
  } else {
    // grin: happy squints; laugh: shut tight
    const up = expr === 'laugh' ? 7 : 6;
    for (const [x, y] of [[93, 78], [150, 78]]) c.stroke(curve([[x - 10, y + 2], [x, y - up], [x + 10, y + 2]]), 'K', { t: t2 });
    if (expr === 'grin') for (const [x, y] of [[93, 78], [150, 78]]) c.stroke(curve([[x - 7, y + 4], [x, y + 2], [x + 7, y + 4]]), 'p', { on: ['head', 'patch'] });
  }
  // the nose: big, black, shiny
  c.shape('nose', blob([[70, 104], [82, 94], [100, 93], [112, 101], [108, 113], [92, 118], [76, 114]]), 'K', { lw });
  c.paint('nose', ell(86, 100, 7, 3, -0.15), 'g');
  c.paint('nose', ell(84, 99, 3, 1.4, -0.15), 'G');
  c.dot(80, 110, 'k', Math.max(1, Math.round(1.4 * k))); c.dot(102, 109, 'k', Math.max(1, Math.round(1.4 * k)));
  c.stroke([[92, 118], [93, 126]], 'p', { t: t2 > 1 ? 2 : 1 });
  // freckle / whisker spots
  for (const [x, y] of [[62, 120], [68, 126], [58, 128], [126, 116], [134, 122], [128, 126]]) c.dot(x, y, 'p', k >= 1 ? 1 : 0);
  // the mouth
  if (expr === 'grin') {
    c.shape('mouth', blob([[56, 126, 1], [94, 132], [150, 122, 1], [140, 136], [96, 150], [64, 136]]), 'W', { inner: 'K', lw });
    c.paint('mouth', blob([[60, 132], [96, 144], [142, 132], [136, 138], [96, 150], [66, 138]]), 'H');
    for (let x = 66; x < 146; x += 9) c.stroke([[x, 124], [x, 152]], 'H', { on: 'mouth' });
    c.stroke(curve([[60, 132], [96, 141], [144, 129]]), 'h', { on: 'mouth' });
    c.stroke(curve([[52, 124], [56, 126], [58, 130]]), 'p', { on: 'head' });
    c.stroke(curve([[154, 120], [150, 122], [149, 126]]), 'p', { on: 'head' });
  } else if (expr === 'laugh') {
    c.shape('mouth', blob([[54, 124, 1], [96, 132], [152, 120, 1], [146, 142], [124, 162], [96, 168], [72, 158], [60, 142]]), 'k', { inner: 'K', lw });
    // a full row of upper teeth and the tongue
    c.paint('mouth', blob([[56, 125], [96, 133], [150, 121], [148, 128], [96, 140], [58, 132]]), 'W');
    for (let x = 64; x < 148; x += 8) c.stroke([[x, 124], [x, 138]], 'H', { on: 'mouth', line: false });
    c.paint('mouth', blob([[74, 156], [86, 146], [104, 144], [122, 148], [132, 156], [112, 166], [90, 166]]), 'P');
    c.paint('mouth', blob([[86, 154], [104, 150], [118, 154], [108, 162], [92, 162]]), 'm');
    c.stroke([[103, 150], [103, 162]], 'p', { on: 'mouth' });
  } else {
    // shock: a small round open mouth
    c.shape('mouth', ell(100, 140, 11, 10), 'k', { inner: 'K', lw });
    c.paint('mouth', ell(100, 146, 7, 4), 'P');
  }
  return c.img;
}

/** the art-history preview: the poster portraits at k = 1, then the in-game dialogue portraits */
export function portraitsPreview() {
  const g = 112 / GW;
  return { frames: [raccoonPortrait2d('smirk', 1), dogPortrait2d('grin', 1), dogPortrait2d('laugh', 1), dogPortrait2d('grin', g), dogPortrait2d('laugh', g), dogPortrait2d('shock', g)], cols: 6 };
}
