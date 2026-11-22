// 3/4-view raccoon on bicycle for city exploration. Rendered from an SDF model in 8 directions.
import { sd, scene, render, yawInv, RAMP, orthoCam, smin } from '../lib/sdf.mjs';
import { heroKey } from '../palette.mjs';

// M4.12: the hero raccoon's colours (brown fur, cream markings, the red bandana, the yellow pump on his back)
const hk = (i) => heroKey('raccoon', i);
const FUR = [hk(8), hk(14), hk(19), hk(24), hk(32)], FUR_DARK = [hk(6), hk(8), hk(14), hk(19)], CREAM = [hk(32), hk(39), hk(42), hk(46)];

// Characters use a lower camera than the ground (classic 3/4 convention)
export const CHAR_ELEV = (32 * Math.PI) / 180;
export const charCam = () => orthoCam([0, -Math.cos(CHAR_ELEV), -Math.sin(CHAR_ELEV)]);

export const FW = 32, FH = 32;
const OX = 16, OY = 26; // where world origin (ground under bike centre) lands in the frame

const M = {
  tire: { ramp: RAMP.tire },
  red: { ramp: RAMP.red, spec: 1 },
  steel: { ramp: RAMP.steel },
  wood: { ramp: RAMP.wood },
  fur: { ramp: FUR },
  furDark: { ramp: FUR_DARK },
  white: { ramp: CREAM },
  bandana: { ramp: [hk(15), hk(21), hk(25), hk(30)] },
  pump: { ramp: ['o', 'y', 'y', 'Y'] },
  leather: { ramp: ['w', 'x', 'X'] },
  black: { flat: 'K' },
  pizza: { ramp: RAMP.yellow },
};

function head(hc) {
  return {
    ramp: FUR,
    fn: (p) => {
      const q = [p[0] - hc[0], p[1] - hc[1], p[2] - hc[2]];
      if (q[0] > 1.0 && q[2] > 1.2 && q[2] < 2.2) return CREAM;
      if (q[0] > 0.6 && q[2] > -0.4 && q[2] <= 1.2) return [hk(4), hk(6), hk(8), hk(9)]; // the dark mask across the eyes
      return null;
    },
  };
}

function model(t) {
  // t: animation phase 0..1 (pedal cycle)
  const ang = t * Math.PI * 2;
  const BB = [0, 0, 4.2];
  const pedR = [BB[0] + Math.cos(ang) * 2.2, 1.6, BB[2] + Math.sin(ang) * 2.2];
  const pedL = [BB[0] - Math.cos(ang) * 2.2, -1.6, BB[2] - Math.sin(ang) * 2.2];
  const hipR = [-2.2, 1.3, 10.5], hipL = [-2.2, -1.3, 10.5];
  const knee = (hip, ped) => [ (hip[0] + ped[0]) / 2 + 2.2, (hip[1] + ped[1]) / 2, (hip[2] + ped[2]) / 2 + 1.2 ];
  const kR = knee(hipR, pedR), kL = knee(hipL, pedL);
  const hc = [2.8, 0, 17.0];
  // M3.1 (Ivan: more tail bounce). sin(2*ang) was 0 on all 4 frames (t = 0, .25, .5, .75), so the tail
  // never swung in this view: swing once per pedal cycle, bob twice
  const tailSway = Math.sin(ang) * 1.6;
  const tailBob = Math.cos(ang * 2) * 1.0;
  const objs = [
    // wheels
    { d: sd.torusY([-6.5, 0, 3.6], 3.0, 0.9), m: M.tire },
    { d: sd.torusY([6.5, 0, 3.6], 3.0, 0.9), m: M.tire },
    { d: sd.cylY([-6.5, 0, 3.6], 0.6, 0.6), m: M.steel },
    { d: sd.cylY([6.5, 0, 3.6], 0.6, 0.6), m: M.steel },
    // frame
    { d: sd.capsule([-6.5, 0, 3.6], [-2.5, 0, 9], 0.55), m: M.red },
    { d: sd.capsule([-6.5, 0, 3.6], BB, 0.55), m: M.red },
    { d: sd.capsule(BB, [-2.5, 0, 9], 0.6), m: M.red },
    { d: sd.capsule([-2.5, 0, 9], [4.8, 0, 9.2], 0.6), m: M.red },
    { d: sd.capsule(BB, [5, 0, 8.2], 0.6), m: M.red },
    { d: sd.capsule([5, 0, 9.4], [6.5, 0, 3.6], 0.5), m: M.steel },
    { d: sd.capsule([5, 0, 9.4], [4.4, 0, 11.4], 0.4), m: M.steel },
    { d: sd.capsule([3.6, -3.4, 11.6], [3.6, 3.4, 11.6], 0.45), m: M.steel },
    // the pump on his back (barrel from the lower back up past the shoulder, T-handle on top) and the satchel at his hip
    { d: sd.capsule([-3.8, -2.0, 10.8], [-2.2, 2.2, 19.4], 1.0), m: M.pump },
    { d: sd.capsule([-1.6, -0.6, 20.4], [-2.8, 4.0, 19.8], 0.45), m: M.black },
    { d: sd.box([-1.6, 3.4, 10.8], [1.3, 0.6, 1.0], 0.2), m: M.leather },
    // saddle
    { d: sd.ellipsoid([-2.6, 0, 9.8], [1.6, 1.0, 0.5]), m: M.furDark },
    // legs (dark lower legs / paws)
    { d: sd.capsule(hipR, kR, 1.1, 0.9), m: M.fur },
    { d: sd.capsule(kR, pedR, 0.85, 0.7), m: M.furDark },
    { d: sd.capsule(hipL, kL, 1.1, 0.9), m: M.fur },
    { d: sd.capsule(kL, pedL, 0.85, 0.7), m: M.furDark },
    // torso leaning forward
    { d: (p) => smin(sd.ellipsoid([-1.2, 0, 11.6], [3.0, 3.7, 2.9])(p), sd.ellipsoid([1.2, 0, 13.8], [2.6, 3.3, 2.5])(p), 1.5), m: M.fur },
    // arms to the bars
    { d: sd.capsule([1.8, 2.6, 13.4], [3.6, 3.0, 11.8], 0.75), m: M.furDark },
    { d: sd.capsule([1.8, -2.6, 13.4], [3.6, -3.0, 11.8], 0.75), m: M.furDark },
    // the red bandana round his neck
    { d: sd.ellipsoid([1.9, 0, 14.6], [2.3, 3.0, 1.0]), m: M.bandana },
    { d: sd.ellipsoid([3.4, 0, 13.7], [1.2, 1.6, 1.2]), m: M.bandana },
    // head
    { d: sd.ellipsoid(hc, [3.0, 3.8, 3.0]), m: head(hc) },
    // bandit mask band + eyes
    { d: sd.capsule([hc[0] + 1.7, -3.1, hc[2] + 0.5], [hc[0] + 1.7, 3.1, hc[2] + 0.5], 1.25), m: { flat: hk(8) } },
    // (M4.12: small eye glints, so the dark mask reads at 32 px instead of two big eye whites)
    { d: sd.sphere([hc[0] + 2.55, 1.25, hc[2] + 0.7], 0.38), m: { flat: hk(44) } },
    { d: sd.sphere([hc[0] + 2.55, -1.25, hc[2] + 0.7], 0.38), m: { flat: hk(44) } },
    { d: sd.ellipsoid([hc[0] + 2.5, 0, hc[2] - 1.0], [1.8, 1.5, 1.2]), m: M.white },
    { d: sd.sphere([hc[0] + 4.2, 0, hc[2] - 0.8], 0.6), m: M.black },
    // ears
    { d: sd.cone([hc[0] - 0.8, 2.5, hc[2] + 1.8], 1.2, 2.2), m: M.furDark },
    { d: sd.cone([hc[0] - 0.8, -2.5, hc[2] + 1.8], 1.2, 2.2), m: M.furDark },
  ];
  // bushy ringed tail
  for (let i = 0; i <= 8; i++) {
    const s = i / 8;
    const c = [-3.5 - s * 7, tailSway * s * s * 2, 11.2 + Math.sin(s * Math.PI) * 2.2 + s * 1.2 + tailBob * s * s * 2];
    const r = 2.0 + Math.sin(s * Math.PI) * 0.8 - s * 0.6;
    const ring = i >= 7 ? M.furDark : Math.floor(i / 1.5) % 2 === 0 ? { ramp: [hk(19), hk(24), hk(32), hk(36)] } : M.furDark;
    objs.push({ d: sd.sphere(c, r), m: ring });
  }
  return objs;
}

export function raccoonTopFrame(yaw, t) {
  const objs = model(t);
  const sc = scene(objs);
  const rotated = (p) => sc(yawInv(p, yaw));
  return render(rotated, { w: FW, h: FH, cx: OX, cy: OY, cam: charCam(), ambient: 0.12 });
}

// 8 directions (E, SE, S, SW, W, NW, N, NE) x 4 pedal frames
export const DIRS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
export function raccoonTopFrames() {
  const frames = [];
  for (let d = 0; d < 8; d++) for (let f = 0; f < 4; f++) frames.push(raccoonTopFrame((d * Math.PI) / 4, f / 4));
  return { frames, fw: FW, fh: FH, cols: 4 };
}

/** M3.1: the pedal cycle facing east + south, the tail swinging now */
export function topRidePreview() { return { frames: [0, Math.PI / 2].flatMap((y) => [0, 1, 2, 3].map((f) => raccoonTopFrame(y, f / 4))), cols: 4 }; }
export { model as raccoonTopModel };
