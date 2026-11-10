// Torontonians: pedestrians (adults, kids, dog walkers) and cyclists, 3/4 view, 4 directions.
// Same SDF pipeline + 32° character camera as the raccoon, so everything shares one look.
import { sd, scene, render, yawInv, orthoCam, smin } from '../lib/sdf.mjs';

const ELEV = (32 * Math.PI) / 180;
const cam = () => orthoCam([0, -Math.cos(ELEV), -Math.sin(ELEV)]);

const SKIN = { light: ['p', 'm', 'M'], tan: ['x', 'X', 'j'], brown: ['w', 'x', 'X'], deep: ['K', 'w', 'x'], pale: ['P', 'm', 'M'] };
const CLOTH = {
  red: ['r', 'R', 'q'], blue: ['u', 'U', 'c'], teal: ['f', 'F', 'C'], yellow: ['o', 'y', 'Y'], green: ['e', 'E', 'l'],
  purple: ['v', 'V', 'Z'], white: ['G', 'H', 'W'], black: ['K', 'k', 'g'], grey: ['g', 'G', 'h'], denim: ['u', 'U', 'U'],
  khaki: ['x', 'X', 'j'], orange: ['r', 'o', 'O'], pink: ['p', 'P', 'm'],
};
const HAIR = { black: ['K', 'K', 'k'], brown: ['w', 'x', 'X'], blonde: ['o', 'y', 'Y'], grey: ['G', 'h', 'H'], red: ['r', 'o', 'O'], none: null };

export const PED_VARIANTS = [
  { id: 'a', skin: 'light', top: 'red', legs: 'denim', hair: 'brown' },
  { id: 'b', skin: 'brown', top: 'yellow', legs: 'black', hair: 'black', bag: 'teal' },
  { id: 'c', skin: 'tan', top: 'teal', legs: 'khaki', hair: 'black', toque: 'red' },
  { id: 'd', skin: 'deep', top: 'purple', legs: 'grey', hair: 'black', bag: 'yellow' },
  { id: 'e', skin: 'pale', top: 'green', legs: 'denim', hair: 'blonde' },
  { id: 'f', skin: 'light', top: 'grey', legs: 'black', hair: 'grey', coat: true },
  { id: 'g', skin: 'tan', top: 'orange', legs: 'denim', hair: 'red', bag: 'blue' },
  { id: 'kid', skin: 'brown', top: 'pink', legs: 'blue', hair: 'black', scale: 0.72, toque: 'yellow' },
  { id: 'dog', skin: 'light', top: 'blue', legs: 'khaki', hair: 'brown', dog: true },
];
export const CYC_VARIANTS = [
  { id: 'a', skin: 'tan', top: 'yellow', legs: 'black', helmet: 'red', bike: 'teal' },   // bike share
  { id: 'b', skin: 'deep', top: 'white', legs: 'denim', helmet: 'blue', bike: 'black' },
  { id: 'c', skin: 'light', top: 'green', legs: 'khaki', helmet: 'yellow', bike: 'red', kidSeat: true },
  { id: 'd', skin: 'brown', top: 'purple', legs: 'grey', helmet: 'white', bike: 'teal' },
];

const m = (ramp) => ({ ramp });

function pedModel(v, t) {
  const s = v.scale ?? 1, a = Math.sin(t * Math.PI * 2);
  const P = (x, y, z) => [x * s, y * s, z * s];
  const skin = m(SKIN[v.skin]), top = m(CLOTH[v.top]), legs = m(CLOTH[v.legs]);
  const stepF = a * 2.2, lift = Math.max(0, Math.cos(t * Math.PI * 2)) * 0.8;
  const objs = [
    // legs (swing in x = walking direction)
    { d: sd.capsule(P(0, 1.1, 8.6), P(stepF, 1.1, 0.9 + (a > 0 ? lift : 0)), 1.0 * s, 0.85 * s), m: legs },
    { d: sd.capsule(P(0, -1.1, 8.6), P(-stepF, -1.1, 0.9 + (a < 0 ? lift : 0)), 1.0 * s, 0.85 * s), m: legs },
    { d: sd.sphere(P(stepF + 0.5, 1.1, 0.7), 0.9 * s), m: m(['K', 'k', 'g']) },
    { d: sd.sphere(P(-stepF + 0.5, -1.1, 0.7), 0.9 * s), m: m(['K', 'k', 'g']) },
    // torso
    { d: (p) => smin(sd.ellipsoid(P(0, 0, 11.4), [2.0 * s, 2.7 * s, 3.4 * s])(p), sd.ellipsoid(P(0, 0, 9.2), [1.8 * s, 2.3 * s, 1.4 * s])(p), 1), m: v.coat ? m(CLOTH.khaki) : top },
    // arms (opposite to legs)
    { d: sd.capsule(P(0, 2.7, 13.4), P(-stepF * 0.7, 3.0, 9.4), 0.75 * s), m: v.coat ? m(CLOTH.khaki) : top },
    { d: sd.capsule(P(0, -2.7, 13.4), P(stepF * 0.7, -3.0, 9.4), 0.75 * s), m: v.coat ? m(CLOTH.khaki) : top },
    { d: sd.sphere(P(-stepF * 0.7, 3.0, 9.0), 0.7 * s), m: skin },
    { d: sd.sphere(P(stepF * 0.7, -3.0, 9.0), 0.7 * s), m: skin },
    // head + face
    { d: sd.ellipsoid(P(0.2, 0, 17.0), [2.3 * s, 2.3 * s, 2.5 * s]), m: skin },
    { d: sd.sphere(P(2.25, 0.85, 17.2), 0.42 * s), m: { flat: 'K' } },
    { d: sd.sphere(P(2.25, -0.85, 17.2), 0.42 * s), m: { flat: 'K' } },
  ];
  if (v.hair && HAIR[v.hair]) objs.push({ d: (p) => Math.max(sd.ellipsoid(P(-0.2, 0, 17.6), [2.55 * s, 2.5 * s, 2.5 * s])(p), -(p[0] - (-0.3 * s)) - (p[2] - 17.2 * s) * 0.6), m: m(HAIR[v.hair]) });
  if (v.toque) objs.push({ d: sd.ellipsoid(P(0, 0, 18.8), [2.4 * s, 2.4 * s, 1.6 * s]), m: m(CLOTH[v.toque]) }, { d: sd.sphere(P(0, 0, 20.4), 0.9 * s), m: m(CLOTH.white) });
  if (v.bag) objs.push({ d: sd.box(P(-2.2, 0, 12), [0.9 * s, 1.8 * s, 2.0 * s], 0.5 * s), m: m(CLOTH[v.bag]) });
  if (v.coat) objs.push({ d: sd.ellipsoid(P(0, 0, 8.4), [2.2 * s, 2.8 * s, 2.4 * s]), m: m(CLOTH.khaki) });
  if (v.dog) { // a small dog trotting ahead on a leash (Trinity Bellwoods: dog park capital)
    const db = a * 0.4;
    objs.push(
      { d: sd.ellipsoid([5.8, 3.4, 2.4 + db * 0.3], [2.2, 1.1, 1.2]), m: m(['x', 'X', 'j']) },
      { d: sd.sphere([8.0, 3.4, 3.4 + db * 0.3], 1.1), m: m(['x', 'X', 'j']) },
      { d: sd.capsule([4.4, 3.4, 2.6], [3.6, 3.4, 4.2 + db], 0.35), m: m(['x', 'X', 'j']) },
      { d: sd.capsule([6.6, 3.0, 1.6], [6.6 + db * 2, 3.0, 0.3], 0.38), m: m(['w', 'x', 'X']) },
      { d: sd.capsule([5.0, 3.8, 1.6], [5.0 - db * 2, 3.8, 0.3], 0.38), m: m(['w', 'x', 'X']) },
      { d: sd.capsule([-stepF * 0.7, 3.0, 9.0], [8.0, 3.4, 3.8], 0.18), m: { flat: 'R' } },
    );
  }
  return objs;
}

function cycModel(v, t) {
  const ang = t * Math.PI * 2;
  const skin = m(SKIN[v.skin]), top = m(CLOTH[v.top]), legs = m(CLOTH[v.legs]), frame = m(CLOTH[v.bike]);
  const BB = [0, 0, 4.2];
  const pedR = [Math.cos(ang) * 2.2, 1.6, BB[2] + Math.sin(ang) * 2.2];
  const pedL = [-Math.cos(ang) * 2.2, -1.6, BB[2] - Math.sin(ang) * 2.2];
  const hipR = [-2.6, 1.2, 11], hipL = [-2.6, -1.2, 11];
  const knee = (hip, ped) => [(hip[0] + ped[0]) / 2 + 2.4, (hip[1] + ped[1]) / 2, (hip[2] + ped[2]) / 2 + 1.4];
  const kR = knee(hipR, pedR), kL = knee(hipL, pedL);
  const objs = [
    { d: sd.torusY([-6.8, 0, 3.6], 3.1, 0.75), m: m(['K', 'K', 'k']) },
    { d: sd.torusY([6.8, 0, 3.6], 3.1, 0.75), m: m(['K', 'K', 'k']) },
    { d: sd.capsule([-6.8, 0, 3.6], [-2.6, 0, 9.6], 0.55), m: frame },
    { d: sd.capsule([-6.8, 0, 3.6], BB, 0.55), m: frame },
    { d: sd.capsule(BB, [-2.6, 0, 9.6], 0.6), m: frame },
    { d: sd.capsule([-2.6, 0, 9.6], [5, 0, 9.6], 0.6), m: frame },
    { d: sd.capsule(BB, [5, 0, 9], 0.6), m: frame },
    { d: sd.capsule([5, 0, 9.8], [6.8, 0, 3.6], 0.5), m: m(['g', 'G', 'h']) },
    { d: sd.capsule([4.2, -3.2, 12.2], [4.2, 3.2, 12.2], 0.45), m: m(['g', 'G', 'h']) },
    { d: sd.capsule(hipR, kR, 1.05), m: legs }, { d: sd.capsule(kR, pedR, 0.85), m: legs },
    { d: sd.capsule(hipL, kL, 1.05), m: legs }, { d: sd.capsule(kL, pedL, 0.85), m: legs },
    { d: (p) => smin(sd.ellipsoid([-1.6, 0, 13.4], [2.2, 2.6, 3.0])(p), sd.ellipsoid([0.4, 0, 15.6], [2.0, 2.5, 2.0])(p), 1), m: top },
    { d: sd.capsule([0.8, 2.5, 15.6], [4.0, 3.0, 12.4], 0.7), m: top },
    { d: sd.capsule([0.8, -2.5, 15.6], [4.0, -3.0, 12.4], 0.7), m: top },
    { d: sd.ellipsoid([1.8, 0, 19.2], [2.2, 2.2, 2.3]), m: skin },
    { d: (p) => Math.max(sd.ellipsoid([1.4, 0, 20.0], [2.7, 2.5, 2.2])(p), -(p[2] - 19.6)), m: m(CLOTH[v.helmet]) },
    { d: sd.sphere([3.8, 0.8, 19.2], 0.4), m: { flat: 'K' } },
    { d: sd.sphere([3.8, -0.8, 19.2], 0.4), m: { flat: 'K' } },
  ];
  if (v.kidSeat) objs.push(
    { d: sd.box([-6.4, 0, 9.4], [1.6, 1.8, 1.4], 0.5), m: m(CLOTH.black) },
    { d: sd.ellipsoid([-6.4, 0, 12.2], [1.4, 1.7, 1.8]), m: m(CLOTH.orange) },
    { d: sd.sphere([-6.2, 0, 14.6], 1.5), m: m(SKIN.brown) },
    { d: (p) => Math.max(sd.sphere([-6.3, 0, 15.0], 1.75)(p), -(p[2] - 14.8)), m: m(CLOTH.yellow) },
  );
  return objs;
}

const YAWS = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
export const PED_DIRS = ['E', 'S', 'W', 'N'];
export const PED_FW = 24, PED_FH = 28, PED_OX = 12, PED_OY = 25;
export function pedFrame(v, dir, t) {
  const sc = scene(pedModel(v, t)), yaw = YAWS[dir];
  return render((p) => sc(yawInv(p, yaw)), { w: PED_FW, h: PED_FH, cx: PED_OX, cy: PED_OY, cam: cam(), ambient: 0.14 });
}
export function cycFrame(v, dir, t) {
  const sc = scene(cycModel(v, t)), yaw = YAWS[dir];
  return render((p) => sc(yawInv(p, yaw)), { w: 32, h: 32, cx: 16, cy: 26, cam: cam(), ambient: 0.14 });
}
/** Side-view cyclist for action scenes + vignettes (faces right). */
export function cycSideFrame(v, t, k = 1.8) {
  const sc = scene(cycModel(v, t));
  const w = 52, h = 46;
  const img = render(sc, { w, h, cx: 26, cy: 42, cam: orthoCam([0, -1, -0.22]), ambient: 0.14, scale: k });
  img.pivot = { x: 0.5, y: 42 / 46 };
  return img;
}
export function peoplePreview() {
  const frames = [];
  for (const v of PED_VARIANTS) for (const d of PED_DIRS) frames.push(pedFrame(v, d, 0.25));
  return { frames, cols: 12 };
}
export function cyclistsPreview() {
  const frames = [];
  for (const v of CYC_VARIANTS) for (const d of PED_DIRS) frames.push(cycFrame(v, d, 0.1));
  return { frames, cols: 8 };
}
