// Dog Fraud's rat minions. One SDF base model + per-variant accessories. Side view (facing right).
import { sd, scene, render, RAMP, orthoCam, smin, yawInv } from '../lib/sdf.mjs';

export const FW = 32, FH = 32;
const OX = 15, OY = 31;
export const sideCam = () => orthoCam([0, -1, -0.22]);

const M = {
  fur: { ramp: ['K', 'w', 'x', 'x', 'X'] },
  furLight: { ramp: ['x', 'X', 'j'] },
  pink: { ramp: ['p', 'P', 'm'] },
  eye: { flat: 'K' },
  eyeShine: { flat: 'W' },
  teeth: { flat: 'W' },
  purple: { ramp: ['K', 'v', 'V', 'Z'] },
  hardhat: { ramp: ['o', 'y', 'y', 'Y'], spec: 1 },
  vest: { ramp: ['r', 'o', 'O', 'O'] },
  stripe: { ramp: ['h', 'H', 'W'] },
  cone: { ramp: ['r', 'o', 'O'] },
  white: { ramp: ['h', 'H', 'W'] },
  red: { ramp: ['r', 'R', 'q'] },
  steel: { ramp: ['g', 'G', 'h', 'H'] },
  wood: { ramp: ['w', 'x', 'X'] },
  suit: { ramp: ['K', 'g', 'G', 'h'] },
  hair: { ramp: ['g', 'h', 'H'] },
};

/**
 * Build a rat. pose: { walk (0..1), attack (0|1|2), hurt, bob }
 * variant: 'basic' | 'construction' | 'traffic'
 */
function ratModel(variant, pose) {
  const { walk = 0, attack = 0, hurt = false } = pose;
  const backHand = attack === 2 ? null : [-3.2, -2.9, 12.5];
  const sw = Math.sin(walk * Math.PI * 2);
  const bob = Math.abs(Math.cos(walk * Math.PI * 2)) * 0.6 + (hurt ? -0.5 : 0);
  const lean = hurt ? -0.35 : attack ? 0.25 : 0.1;
  const objs = [];
  const P = (x, z) => [x + z * lean * 0.4, 0, z + bob]; // simple lean by shear
  // legs
  objs.push({ d: sd.capsule(P(-1, 7), [-1 + sw * 2.2, 1.2, 1.0], 1.1, 0.9), m: M.fur });
  objs.push({ d: sd.capsule(P(1, 7), [1 - sw * 2.2, -1.2, 1.0], 1.1, 0.9), m: M.fur });
  objs.push({ d: sd.ellipsoid([-1 + sw * 2.2 + 0.8, 1.2, 0.6], [1.5, 0.8, 0.6]), m: M.pink });
  objs.push({ d: sd.ellipsoid([1 - sw * 2.2 + 0.8, -1.2, 0.6], [1.5, 0.8, 0.6]), m: M.pink });
  // pear body
  objs.push({ d: (p) => smin(sd.ellipsoid(P(0, 8.5), [3.6, 3.2, 3.8])(p), sd.ellipsoid(P(0.6, 12.5), [2.6, 2.5, 2.4])(p), 1.6), m: M.fur });
  objs.push({ d: sd.ellipsoid(P(1.6, 9), [2.2, 2.4, 3.0]), m: M.furLight });
  // head with long snout
  const hc = P(2.0, 16.2);
  objs.push({ d: (p) => smin(sd.ellipsoid(hc, [3.5, 3.3, 3.1])(p), sd.ellipsoid([hc[0] + 3.4, 0, hc[2] - 0.9], [2.6, 1.7, 1.5])(p), 1.2), m: M.fur });
  objs.push({ d: sd.sphere([hc[0] + 6.0, 0, hc[2] - 0.7], 0.95), m: M.pink }); // nose
  // big white eyes with pupils + angry brow
  objs.push({ d: sd.sphere([hc[0] + 1.9, 1.6, hc[2] + 0.7], 1.25), m: { flat: 'W' } });
  objs.push({ d: sd.sphere([hc[0] + 2.75, 2.1, hc[2] + 0.5], 0.6), m: M.eye });
  objs.push({ d: sd.capsule([hc[0] + 0.6, 2.4, hc[2] + 2.3], [hc[0] + 3.2, 2.4, hc[2] + 1.6], 0.45), m: M.eye });
  // buck teeth
  objs.push({ d: sd.box([hc[0] + 3.9, 0, hc[2] - 2.1], [0.45, 0.7, 0.6]), m: M.teeth });
  // big round ears
  const ear = (y) => [{ d: sd.cylY([hc[0] - 2.4, y, hc[2] + 3.4], 2.3, 0.35), m: M.fur }, { d: sd.cylY([hc[0] - 2.2, y * 1.12, hc[2] + 3.4], 1.4, 0.3), m: M.pink }];
  objs.push(...ear(1.6), ...ear(-1.6));
  // arms
  const armA = attack === 1 ? [hc[0] - 2.5, 0, hc[2] + 1] : attack === 2 ? [hc[0] + 6, 0, hc[2] - 3] : [3.6 + sw, 0, 8.0];
  objs.push({ d: sd.capsule(P(1.2, 12), [armA[0], 2.9, armA[2]], 0.8, 0.7), m: M.fur });
  objs.push({ d: sd.sphere([armA[0], 2.9, armA[2]], 0.9), m: M.pink });
  objs.push({ d: sd.capsule(P(0, 12), variant === 'traffic' && backHand ? backHand : [-2.4 - sw, -2.8, 8.6], 0.8, 0.7), m: M.fur });
  // long pink tail curling behind
  for (let i = 0; i <= 10; i++) {
    const s = i / 10;
    objs.push({ d: sd.sphere([-3.2 - s * 7, -0.5, 6 - Math.sin(s * Math.PI) * 3.5 + s * 5 + sw * s * 0.8], 0.75 - s * 0.35), m: M.pink });
  }

  if (variant === 'basic') {
    // purple Dog Fraud campaign cap
    objs.push({ d: (p) => Math.max(sd.sphere([hc[0] - 0.2, 0, hc[2] + 0.9], 2.9)(p), -(p[2] - (hc[2] + 1.4))), m: M.purple });
    objs.push({ d: sd.box([hc[0] + 2.6, 0, hc[2] + 1.5], [1.6, 1.8, 0.25]), m: M.purple });
  } else if (variant === 'construction') {
    // yellow hard hat + hi-vis vest, carries a traffic cone to throw
    objs.push({ d: (p) => Math.max(sd.sphere([hc[0] - 0.2, 0, hc[2] + 1.0], 3.2)(p), -(p[2] - (hc[2] + 1.3))), m: M.hardhat });
    objs.push({ d: sd.cylY([hc[0] - 0.2, 0, hc[2] + 1.3], 0, 0) , m: M.hardhat });
    objs.push({ d: (p) => Math.max(sd.ellipsoid([hc[0] - 0.2, 0, hc[2] + 1.4], [4.2, 3.8, 0.4])(p), 0), m: M.hardhat });
    objs.push({ d: (p) => Math.max(sd.ellipsoid(P(0, 9), [3.9, 3.5, 3.4])(p), -sd.ellipsoid(P(2.4, 9), [1.6, 1.8, 2.8])(p)), m: M.vest });
    objs.push({ d: sd.box(P(0, 8.6), [3.95, 3.55, 0.45]), m: M.stripe });
    if (attack !== 1 && attack !== 2) objs.push({ d: sd.cone([armA[0] + 1.2, 2.9, armA[2] - 2.8], 1.8, 4.5), m: M.cone });
  } else if (variant === 'bureaucrat') {
    // Dog Fraud's permit office: grey suit, red tie, round glasses, a comb-over, rubber stamp in hand
    objs.push({ d: (p) => Math.max(smin(sd.ellipsoid(P(0, 8.6), [3.9, 3.6, 4.0])(p), sd.ellipsoid(P(0.6, 12.5), [2.9, 2.8, 2.6])(p), 1.6), -sd.ellipsoid(P(2.9, 11.5), [1.2, 1.5, 2.6])(p)), m: M.suit });
    objs.push({ d: sd.box(P(2.5, 10.4), [0.5, 0.5, 2.2]), m: M.red });
    objs.push({ d: sd.ellipsoid(P(2.2, 12.6), [0.8, 1.0, 0.5]), m: M.white });
    objs.push({ d: sd.torusY([hc[0] + 1.9, 2.9, hc[2] + 0.7], 1.35, 0.32), m: { flat: 'W' } });
    objs.push({ d: sd.capsule([hc[0] + 0.5, 2.9, hc[2] + 0.9], [hc[0] - 1.6, 2.6, hc[2] + 1.2], 0.25), m: { flat: 'W' } });
    objs.push({ d: sd.capsule([hc[0] - 1.5, 0, hc[2] + 3.0], [hc[0] + 1.5, 0, hc[2] + 3.3], 0.6), m: M.hair });
    objs.push({ d: sd.capsule(P(1.2, 12), [armA[0], 2.9, armA[2]], 0.85, 0.75), m: M.suit });
    objs.push({ d: sd.box([armA[0] + 0.6, 2.9, armA[2] + 1.6], [1.0, 1.0, 1.4]), m: M.wood });
    objs.push({ d: sd.box([armA[0] + 0.6, 2.9, armA[2] - 0.2], [1.6, 1.4, 0.5]), m: M.red });
  } else if (variant === 'traffic') {
    // flagger: white cap, purple vest, STOP paddle
    objs.push({ d: (p) => Math.max(sd.sphere([hc[0] - 0.2, 0, hc[2] + 0.9], 2.9)(p), -(p[2] - (hc[2] + 1.4))), m: M.white });
    objs.push({ d: sd.box([hc[0] + 2.6, 0, hc[2] + 1.5], [1.6, 1.8, 0.25]), m: M.purple });
    objs.push({ d: (p) => Math.max(sd.ellipsoid(P(0, 9), [3.9, 3.5, 3.4])(p), -sd.ellipsoid(P(2.4, 9), [1.6, 1.8, 2.8])(p)), m: M.purple });
    objs.push({ d: sd.box(P(0, 8.6), [3.95, 3.55, 0.45]), m: M.cone });
    const pole = backHand ? [backHand[0], -3.2, backHand[2]] : [armA[0], 3.4, armA[2]];
    objs.push({ d: sd.capsule([pole[0], pole[1], pole[2] - 2], [pole[0], pole[1], pole[2] + 7], 0.35), m: M.wood });
    objs.push({ d: sd.cylY([pole[0], pole[1] + 0.2, pole[2] + 8.5], 2.6, 0.3), m: M.red });
    objs.push({ d: sd.cylY([pole[0], pole[1] + 0.45, pole[2] + 8.5], 1.4, 0.1), m: M.white });
  }
  return objs;
}

export function ratFrame(variant, pose = {}, S = 1.18, w = FW, h = FH) {
  const raw = scene(ratModel(variant, pose));
  const sc = (p) => { const r = raw([p[0] / S, p[1] / S, p[2] / S]); return [r[0] * S, r[1]]; };
  return render(sc, { w, h, cx: Math.round((OX * w) / FW), cy: h - 1, cam: sideCam(), ambient: 0.15 });
}

/** The Bureaucrat Rat (mission 3 boss): the same rat, bigger (48x48 frames). */
export const BOSS_FW = 48, BOSS_FH = 48;
export function bureaucratAnims() {
  const frames = [], anims = {};
  const f = (pose) => ratFrame('bureaucrat', pose, 1.75, BOSS_FW, BOSS_FH);
  const add = (name, list, rate, loop = true) => { anims[name] = { start: frames.length, count: list.length, rate, loop }; frames.push(...list); };
  add('walk', [0, 0.25, 0.5, 0.75].map((w) => f({ walk: w })), 7);
  add('windup', [f({ attack: 1 })], 1, false);
  add('attack', [f({ attack: 2 })], 1, false);
  add('hurt', [f({ hurt: true })], 1, false);
  return { frames, anims };
}

export const RAT_VARIANTS = ['basic', 'construction', 'traffic'];
export function ratAnims(variant) {
  const frames = [], anims = {};
  const add = (name, list, rate, loop = true) => { anims[name] = { start: frames.length, count: list.length, rate, loop }; frames.push(...list); };
  add('walk', [0, 0.25, 0.5, 0.75].map((w) => ratFrame(variant, { walk: w })), 8);
  add('windup', [ratFrame(variant, { attack: 1 })], 1, false);
  add('attack', [ratFrame(variant, { attack: 2 })], 1, false);
  add('hurt', [ratFrame(variant, { hurt: true })], 1, false);
  return { frames, anims, fw: FW, fh: FH };
}
export function allRatsPreview() {
  return { frames: RAT_VARIANTS.flatMap((v) => ratAnims(v).frames), cols: 7 };
}

export function bureaucratPreview() { return { frames: bureaucratAnims().frames, cols: 7 }; }
