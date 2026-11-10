// Shared skyline landmarks. The CN Tower profile follows Ivan's reference photo (heights are real
// proportions: main pod ~62-67%, SkyPod ~80%, antenna the top ~18%).
// Drawn as a scanline profile: each band is [from, to (fractions of height), half-width at 169px, colour role].

const PROFILE = [
  // y0,   y1,    hw0, hw1, role
  [0.000, 0.600, 5.0, 2.0, 'shaft'],
  [0.600, 0.614, 2.4, 8.6, 'under'],   // the pod's underside flares out
  [0.614, 0.626, 8.8, 8.8, 'glass'],   // lower observation glass
  [0.626, 0.637, 10.2, 10.2, 'rim'],   // the widest white ring
  [0.637, 0.650, 8.6, 8.6, 'glass'],   // upper window band
  [0.650, 0.659, 8.0, 7.4, 'pod'],
  [0.659, 0.667, 6.0, 2.6, 'pod'],     // cap
  [0.667, 0.792, 1.8, 1.4, 'shaft'],   // upper shaft
  [0.792, 0.800, 2.2, 3.4, 'pod'],     // SkyPod
  [0.800, 0.808, 3.4, 3.4, 'glass'],
  [0.808, 0.818, 3.2, 1.8, 'pod'],
  [0.818, 0.880, 1.3, 1.0, 'antenna'],
  [0.880, 0.886, 1.3, 1.3, 'band'],
  [0.886, 1.000, 0.9, 0.5, 'antenna'],
];

export const CN_PAL = {
  day: { shaft: 't', shaftHi: 'T', shaftLo: 'S', under: 'H', glass: 'g', rim: 'W', pod: 'W', podLo: 'H', antenna: 'W', band: 'h', tip: 'R' },
  dusk: { shaft: 'v', shaftHi: 'V', shaftLo: 'u', under: 'v', glass: 'd', rim: 'V', pod: 'v', podLo: 'u', antenna: 'V', band: 'v', tip: 'R' },
  silhouette: { shaft: 'v', shaftHi: 'v', shaftLo: 'v', under: 'v', glass: 'O', rim: 'v', pod: 'v', podLo: 'v', antenna: 'v', band: 'v', tip: 'O' },
};

/** Draw the CN Tower with its base centre at (cx, base), total height H px. */
export function cnTower(img, cx, base, H, pal = CN_PAL.day) {
  const k = H / 169;
  for (let y = 0; y < H; y++) {
    const f = y / H;
    const band = PROFILE.find((b) => f >= b[0] && f < b[1]) ?? PROFILE[PROFILE.length - 1];
    const t = (f - band[0]) / (band[1] - band[0]);
    const hw = Math.max(band[4] === 'antenna' ? 0.5 : 0.8, (band[2] + (band[3] - band[2]) * t) * Math.max(k, 0.42));
    // off-centre by a quarter pixel so the taper steps one side at a time (smooth, not 2px stairs)
    const x0 = Math.round(cx + 0.25 - hw), x1 = Math.round(cx + 0.25 + hw) - (hw < 1 ? 0 : 1);
    const role = band[4];
    const py = base - 1 - y;
    for (let x = x0; x <= Math.max(x0, x1); x++) {
      let c = pal[role];
      if (role === 'shaft') c = x === x0 ? pal.shaftHi : x === x1 && x1 > x0 ? pal.shaftLo : pal.shaft;
      else if (role === 'pod' || role === 'rim' || role === 'under') { if (x === x1 && x1 > x0 + 1) c = pal.podLo; }
      img.set(x, py, c);
    }
  }
  img.set(Math.round(cx), base - H, pal.tip);
}

import { Img } from '../lib/raster.mjs';
export function cnPreview() {
  const frames = [];
  for (const [pal, bg, H] of [[CN_PAL.day, 'C', 169], [CN_PAL.dusk, 'P', 169], [CN_PAL.silhouette, 'z', 66]]) {
    const im = new Img(40, 175); im.rect(0, 0, 40, 175, bg); cnTower(im, 20, 173, H, pal); frames.push(im);
  }
  return { frames, cols: 3 };
}
