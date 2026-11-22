// M4.14 (Ivan: "I don't like the new side view... the old one was better... try another option from scratch...
// his proportions should not be the same or taken from the hero art. We can cheat here. Just wanted an alternative
// with slightly more interesting quality"): the M4.12 rider's chunky cartoon build (big head, big tail, short body)
// drawn again with more care: a bigger head with a visible eye inside the mask, cheek tufts and lit ears; fur in three
// tones (dark back, mid, light belly); dark gloves; a tail whose rings are lit on top; a bandana with folds and flying
// tails; and a bike with a tyre, a rim, a lit frame and a toothed chainring. Same frame (56 x 44), pivot and
// animations as raccoon_side.mjs, so it drops into the game unchanged.
import { Img } from '../lib/raster.mjs';
import { heroKey } from '../palette.mjs';
import { ik } from './raccoon_side.mjs';

export const FW = 56, FH = 44;
const SHIFT = 8, TOP = 8, GROUND = 34;
export const PIVOT_Y = (GROUND + TOP) / FH;

const hk = (i) => heroKey('raccoon', i);
const C = {
  mask: hk(8), dark: hk(14), mid2: hk(19), mid: hk(24), light: hk(32), pale: hk(36), creamLo: hk(42), cream: hk(46), white: hk(47),
  ear: hk(23), glove: hk(9), gloveHi: hk(18),
  bLo: hk(15), bMid: hk(25), bHi: hk(30), bTop: hk(33),
};
// the head, facing right (outline added with the body). 1 mask, 2 dark, 3 mid2, 4 mid, 5 light, 6 pale, 7 cream low,
// 8 cream, e eye white, k pupil, n nose, p inner ear
const MAP = { 1: C.mask, 2: C.dark, 3: C.mid2, 4: C.mid, 5: C.light, 6: C.pale, 7: C.creamLo, 8: C.cream, e: C.white, k: 'K', n: 'K', p: C.ear, h: 'H' };
const HEAD = `
...2.......2.....
..242.....242....
..2p42...2p42....
..2p444444p442...
.2444555555542...
244558888888542..
2445111111111888.
244111111eek18888
244111111eek18888n
244411111888888nn
.24448888888887..
..2444788887777..
...22444444442...
`;
const HEAD_HURT = `
...2.......2.....
..242.....242....
..2p42...2p42....
..2p444444p442...
.2444555555542...
244558888888542..
2445111111111888.
244111111k1k18888
2441111111k118888n
244411111888888nn
.24448888888887..
..2444711117777..
...22444444442...
`;

function wheel(img, cx, cy, phase) {
  // tyre (2 px, lit on top), pale rim, three spokes turning, hub
  img.circle(cx, cy, 7, 'K'); img.circle(cx, cy, 6, 'k');
  for (let a = -2.6; a < -0.5; a += 0.12) img.set(Math.round(cx + Math.cos(a) * 6), Math.round(cy + Math.sin(a) * 6), 'g');
  img.circle(cx, cy, 5, 'H', false);
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17) img.set(cx + x, cy + y, null);
  for (let s = 0; s < 3; s++) {
    const a = phase * (Math.PI / 6) + (s * Math.PI) / 3;
    img.line(cx - Math.cos(a) * 4, cy - Math.sin(a) * 4, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 'G');
  }
  img.set(cx, cy, 'H'); img.set(cx + 1, cy, 'h');
}

function bike(img, phase, pedal, lift) {
  const R = [10, GROUND - 7], F = [33, GROUND - 7 - lift], BB = [20, GROUND - 6];
  const S = [16, 18], HT = [29, 17], HB = [30, 21 - lift / 2];
  wheel(img, R[0], R[1], phase); wheel(img, F[0], F[1], phase);
  img.line(R[0], R[1] + 1, BB[0], BB[1] + 2, 'g'); img.line(R[0], R[1] - 1, BB[0], BB[1] - 2, 'g');
  // the frame: dark underside, red, a bright line along the top
  const tube = (a, b, hi = true) => { img.thick(a[0], a[1] + 1, b[0], b[1] + 1, 'r', 2); img.thick(a[0], a[1], b[0], b[1], 'R', 2); if (hi) img.line(a[0], a[1], b[0], b[1], 'q'); };
  tube(R, S, false); tube(R, BB, false); tube(BB, S); tube(S, HT); tube(BB, HB);
  img.thick(HT[0], HT[1] + 1, F[0], F[1] + 1, 'r', 2); img.thick(HT[0], HT[1], F[0], F[1], 'R', 2); img.line(HT[0], HT[1], F[0], F[1], 'q');
  // toothed chainring
  img.circle(BB[0], BB[1], 3, 'K'); img.circle(BB[0], BB[1], 2, 'H'); img.set(BB[0], BB[1], 'g');
  for (let t = 0; t < 8; t++) { const a = t * Math.PI / 4 + phase * 0.4; img.set(Math.round(BB[0] + Math.cos(a) * 3), Math.round(BB[1] + Math.sin(a) * 3), t % 2 ? 'G' : 'K'); }
  // saddle and post
  img.vline(S[0] - 1, S[1] - 2, S[1], 'g');
  img.rect(S[0] - 4, S[1] - 3, 6, 2, 'k'); img.hline(S[0] - 4, S[0] + 1, S[1] - 4, 'K'); img.hline(S[0] - 3, S[0], S[1] - 3, 'g');
  // stem, swept bars with a dark grip, the bell
  img.line(HT[0], HT[1], HT[0] - 1, HT[1] - 4, 'H');
  img.line(HT[0] - 1, HT[1] - 4, HT[0] - 4, HT[1] - 5, 'H');
  img.set(HT[0] - 5, HT[1] - 5, 'k'); img.set(HT[0] - 6, HT[1] - 5, 'k');
  img.set(HT[0] + 1, HT[1] - 5, 'y'); img.set(HT[0] + 1, HT[1] - 6, 'Y');
  const a = (pedal * Math.PI) / 2;
  return { BB, S, HT, p1: [BB[0] + Math.cos(a) * 4, BB[1] + Math.sin(a) * 4], p2: [BB[0] - Math.cos(a) * 4, BB[1] - Math.sin(a) * 4] };
}

function tail(img, sway, flare) {
  // a fat tail, slightly smaller than M4.12's: rings dark / light, each lit along its top edge, a dark tip
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 0.065) {
    const x = 12 - t * 11 - flare * t * 2;
    const y = 15 - t * 7 - Math.sin(t * Math.PI) * 2 + sway * t * t;
    pts.push([x, y, 3 - t * 0.6 + Math.sin(t * Math.PI) * 0.7]);
  }
  pts.forEach(([x, y, r], i) => {
    const t = i / (pts.length - 1), tip = t > 0.86, ringDark = Math.floor(t * 6) % 2 === 1;
    const base = tip ? C.mask : ringDark ? C.dark : C.pale;
    img.circle(Math.round(x), Math.round(y), Math.round(r), base);
    // the top edge catches the light
    const hi = tip ? C.dark : ringDark ? C.mid : C.cream;
    img.set(Math.round(x), Math.round(y - r), hi); img.set(Math.round(x) - 1, Math.round(y - r) + (r > 2.5 ? 0 : 1), hi);
  });
}

function leg(img, hip, foot, near) {
  const knee = ik(hip[0], hip[1], foot[0], foot[1], 7, 7, -1);
  const c = near ? C.mid : C.mid2;
  img.thick(hip[0], hip[1], knee[0], knee[1], c, near ? 3 : 2);
  if (near) img.line(hip[0], hip[1] - 1, knee[0], knee[1] - 1, C.light); // the thigh's lit top
  img.thick(knee[0], knee[1], foot[0], foot[1], c, 2);
  // boots: dark leather, a lit toe, a sole
  const fx = Math.round(foot[0]), fy = Math.round(foot[1]);
  img.rect(fx - 1, fy - 1, 4, 2, near ? 'x' : 'w'); if (near) img.set(fx + 2, fy - 1, 'X');
  img.hline(fx - 1, fx + 2, fy + 1, 'w');
}

/** pose: { phase, pedal, sway, lean, lift, hurt, attack (0..3: the pump swing), tuck, bob } */
export function raccoonFrame(pose = {}) {
  const { phase = 0, pedal = 0, sway = 0, lean = 0, lift = 0, hurt = false, attack = 0, tuck = false, bob = 0 } = pose;
  const swoosh = [];
  const L = () => { const i = new Img(FW, FH); i.tx = SHIFT; i.ty = TOP; return i; };
  const back = L(), bikeL = L(), body = L();
  const geo = bike(bikeL, phase, pedal, lift);
  const hip = [16 + lean * 0.3, 15 + bob];
  leg(back, hip, tuck ? [geo.BB[0] + 2, geo.BB[1] - 4] : geo.p2, false);
  back.outline('K');

  tail(body, sway, lean > 1 ? 1 : 0);
  const sx = 23 + lean, sy = 9 + bob;
  // the pump on his back: barrel, T-handle, a hose loop
  if (attack === 0) {
    const a = [hip[0] - 2, hip[1] + 1], b = [sx - 8, sy - 5];
    body.thick(a[0], a[1], b[0], b[1], 'o', 3); body.thick(a[0] - 1, a[1], b[0] - 1, b[1], 'y', 2); body.line(a[0] - 1, a[1], b[0] - 1, b[1], 'Y');
    body.line(b[0] - 3, b[1] + 1, b[0] + 1, b[1] - 3, 'K'); body.set(b[0] + 1, b[1] + 1, 'g');
    for (let t = 0; t < Math.PI * 1.2; t += 0.3) body.set(Math.round(a[0] - 2 - Math.sin(t) * 2), Math.round(a[1] + 1 + t * 1.2), 'K');
  }
  // the torso in three tones: a dark back, the mid side, a light belly
  body.poly([[hip[0] - 4, hip[1] + 2], [hip[0] - 2, hip[1] - 4], [sx - 3, sy - 2], [sx + 2, sy - 1], [sx + 3, sy + 3], [hip[0] + 4, hip[1] + 2]], C.mid);
  body.poly([[hip[0] - 4, hip[1] + 2], [hip[0] - 2, hip[1] - 4], [sx - 3, sy - 2], [sx - 2, sy], [hip[0] - 1, hip[1] - 1], [hip[0] - 2, hip[1] + 2]], C.mid2);
  body.poly([[hip[0] + 1, hip[1] + 1], [sx, sy + 2], [sx + 3, sy + 3], [hip[0] + 4, hip[1] + 2]], C.pale);
  body.line(hip[0] + 2, hip[1] + 1, sx + 1, sy + 3, C.light);
  // the satchel at the hip: a flap and a buckle
  body.rect(hip[0] - 5, hip[1] - 1, 6, 4, 'x'); body.hline(hip[0] - 5, hip[0], hip[1] - 1, 'X'); body.hline(hip[0] - 5, hip[0], hip[1], 'X'); body.set(hip[0] - 2, hip[1] + 1, 'j');
  // the head
  const head = Img.fromGrid(hurt ? HEAD_HURT : HEAD, MAP);
  body.blit(head, sx - 6, sy - 11);
  const bandana = () => {
    // a knotted bandana: the triangle under the chin with a fold, the knot behind the neck, two tails flying
    body.poly([[sx - 3, sy + 1], [sx + 7, sy + 1], [sx + 3, sy + 7]], C.bMid);
    body.hline(sx - 3, sx + 6, sy + 1, C.bHi); body.hline(sx - 1, sx + 3, sy + 2, C.bTop);
    body.line(sx + 5, sy + 3, sx + 3, sy + 6, C.bLo); body.set(sx + 1, sy + 4, C.bLo);
    const fl = [-1, 0, 1, 2, 1][Math.round(sway) + 2] ?? 0;
    body.set(sx - 4, sy + 1, C.bMid); body.set(sx - 4, sy + 2, C.bLo); // the knot, and its two tails streaming back
    body.set(sx - 5, sy + 1 + fl * 0.5, C.bHi); body.set(sx - 6, sy + 1 + fl, C.bMid);
    body.set(sx - 5, sy + 2 + fl * 0.5, C.bMid); body.set(sx - 6, sy + 3 + fl, C.bMid);
  };
  if (attack === 0) {
    // the near arm to the grips: lit on top, a dark glove on the bar
    body.thick(sx, sy + 2, geo.HT[0] - 5, geo.HT[1] - 5, C.mid, 2);
    body.line(sx, sy + 2, geo.HT[0] - 5, geo.HT[1] - 6, C.light);
    body.rect(geo.HT[0] - 6, geo.HT[1] - 6, 3, 2, C.glove); body.set(geo.HT[0] - 5, geo.HT[1] - 6, C.gloveHi);
  } else {
    // the pump swung like a bat: wind-up behind the head, overhead, the strike forward (a white swoosh on the big one)
    const poses = [null, { h: [-4, -2], d: [-0.75, -0.66] }, { h: [5, -2], d: [0.55, -0.83] }, { h: [6, 3], d: [0.92, 0.38] }];
    const { h, d } = poses[attack];
    const hx = sx + h[0], hy = sy + h[1];
    const dl = Math.hypot(d[0], d[1]), dx = d[0] / dl, dy = d[1] / dl, px = -dy, py = dx, PL = 11;
    for (let i = 0; i <= PL; i++) {
      const x = hx + dx * i, y = hy + dy * i;
      body.set(Math.round(x + px), Math.round(y + py), 'o');
      body.set(Math.round(x), Math.round(y), i === 0 ? 'k' : 'y');
      body.set(Math.round(x - px), Math.round(y - py), i === 0 ? 'k' : 'Y');
    }
    const tx = hx + dx * (PL + 1), ty = hy + dy * (PL + 1);
    for (let k = -3; k <= 3; k++) body.set(Math.round(tx + px * k), Math.round(ty + py * k), 'K');
    body.set(Math.round(tx - dx), Math.round(ty - dy), 'g');
    for (let a = 0; a < Math.PI * 1.4; a += 0.35) body.set(Math.round(hx - dx * 2 + Math.cos(a + 1) * 2.5), Math.round(hy - dy * 2 + 2 + Math.sin(a + 1) * 2), 'K');
    body.thick(sx, sy + 3, hx, hy + 1, C.mid2, 2); body.line(sx, sy + 2, hx, hy, C.light);
    body.rect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 2, C.glove); body.set(Math.round(hx), Math.round(hy) - 1, C.gloveHi);
    if (attack === 2) for (let a = -1.9; a < 0.2; a += 0.1) { const r = PL + 3; swoosh.push([Math.round(hx + Math.cos(a) * r), Math.round(hy + Math.sin(a) * r), a > -0.4 ? 'H' : 'W']); swoosh.push([Math.round(hx + Math.cos(a) * (r - 1)), Math.round(hy + Math.sin(a) * (r - 1)), a > -1 ? 'H' : 'W']); }
  }
  bandana();
  leg(body, [hip[0] + 1, hip[1] + 1], tuck ? [geo.BB[0] + 4, geo.BB[1] - 5] : geo.p1, true);
  body.outline('K');

  const out = new Img(FW, FH);
  out.blit(back, 0, 0); out.blit(bikeL, 0, 0); out.blit(body, 0, 0);
  out.tx = SHIFT; out.ty = TOP;
  for (const [x, y, c] of swoosh) out.set(x, y, c);
  out.tx = 0; out.ty = 0;
  return out;
}

export function raccoonSideFrames() {
  const anims = {}, frames = [];
  const add = (name, list, rate, loop = true) => { anims[name] = { start: frames.length, count: list.length, rate, loop }; frames.push(...list); };
  add('idle', [0, 1].map((i) => raccoonFrame({ pedal: 1, sway: i })), 3);
  add('ride', [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i, pedal: i, sway: [-2, 1, 4, 1][i] })), 10);
  add('boost', [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i * 2, pedal: i, sway: [0, 3, 5, 3][i], lean: 2 })), 16);
  add('jump', [raccoonFrame({ tuck: true, lift: 3, sway: -1 }), raccoonFrame({ tuck: true, lift: 1, sway: 2 })], 6, false);
  add('dash', [raccoonFrame({ phase: 1, pedal: 1, lean: 3, sway: 3 })], 1, false);
  add('attack', [1, 2, 3].map((a) => raccoonFrame({ pedal: 1, attack: a, sway: 1 })), 18, false);
  add('hurt', [raccoonFrame({ hurt: true, pedal: 2, sway: -2, lean: -1 })], 1, false);
  return { frames, anims, fw: FW, fh: FH };
}
export function appIcon() {
  const ic = new Img(64, 64);
  ic.rect(0, 0, 64, 64, 'v');
  ic.blit(raccoonFrame({ phase: 1, pedal: 1, sway: 1 }), 4, 12);
  return ic;
}
export function sidePreview() {
  return { frames: [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i, pedal: i, sway: [-2, 1, 4, 1][i] })).concat([1, 2, 3].map((a) => raccoonFrame({ pedal: 1, attack: a, sway: 1 })), [raccoonFrame({ tuck: true, lift: 3, sway: -1 }), raccoonFrame({ hurt: true, pedal: 2, sway: -2 })]), cols: 9 };
}
