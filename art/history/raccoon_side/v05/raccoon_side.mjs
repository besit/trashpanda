// Side-view raccoon on bicycle (facing right). Frames are composed from layers.
import { Img } from '../lib/raster.mjs';

export const FW = 56, FH = 44;
const SHIFT = 8; // room for the tail (and, mirrored, for the pump swing)
const TOP = 8;   // headroom for the raised pump
export const PIVOT_Y = (34 + TOP) / FH;
const GROUND = 34;

// Head painted without outline (outline added for whole body later). Faces right.
const HEAD = `
.h....h.......
hGg..hGg......
GGGGGGGGG.....
GGGGWWWWWW....
GkkkkWWkkkW...
GkkkkWKkkWWW..
GkkkkkkkWWWWKK
GGWWWWWWWWWWK.
.GhWWWWWWWWh..
..GhhhhhhhG...
`;

// Head when hit: eyes squeezed (> <)
const HEAD_HURT = `
.h....h.......
hGg..hGg......
GGGGGGGGG.....
GGGGGWWWWW....
GkkkkkkkkkW...
GkkkWWkkkWWW..
GkkkkWkkWWWWKK
GGWWWWWWWWWWK.
.GhWWkkkWWWh..
..GhhhhhhhG...
`;

function ik(hx, hy, fx, fy, l1, l2, bend = 1) {
  const dx = fx - hx, dy = fy - hy;
  let d = Math.hypot(dx, dy);
  d = Math.min(d, l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const cos = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const b = Math.acos(Math.max(-1, Math.min(1, cos)));
  const ang = a - b * bend;
  return [hx + Math.cos(ang) * l1, hy + Math.sin(ang) * l1];
}

function wheel(img, cx, cy, phase) {
  img.circle(cx, cy, 7, 'K');
  img.circle(cx, cy, 6, 'k');
  img.circle(cx, cy, 5, 'H', false);
  img.circle(cx, cy, 4, null); // clear interior handled below
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17) img.set(cx + x, cy + y, null);
  // spokes
  for (let s = 0; s < 3; s++) {
    const ang = phase * (Math.PI / 6) + (s * Math.PI) / 3;
    img.line(cx - Math.cos(ang) * 4, cy - Math.sin(ang) * 4, cx + Math.cos(ang) * 4, cy + Math.sin(ang) * 4, 'G');
  }
  img.set(cx, cy, 'h');
  img.set(cx, cy - 6, 'g'); // tread highlight
}

function bike(img, phase, pedal, { lift = 0 } = {}) {
  const R = [10, GROUND - 7], F = [33, GROUND - 7 - lift];
  const BB = [20, GROUND - 6];
  const S = [16, 18], HT = [29, 17], HB = [30, 21 - lift / 2];
  wheel(img, R[0], R[1], phase);
  wheel(img, F[0], F[1], phase);
  // chain + chainring
  img.line(R[0], R[1] + 1, BB[0], BB[1] + 2, 'g');
  img.line(R[0], R[1] - 1, BB[0], BB[1] - 2, 'g');
  // frame (dark underside then bright)
  const tube = (a, b) => { img.thick(a[0], a[1] + 1, b[0], b[1] + 1, 'r', 2); img.thick(a[0], a[1], b[0], b[1], 'R', 2); };
  tube(R, S); tube(R, BB); tube(BB, S); tube(S, HT); tube(BB, HB);
  img.line(S[0] + 1, S[1], HT[0] - 1, HT[1], 'q');
  // fork
  img.thick(HT[0], HT[1], F[0], F[1], 'G', 2);
  img.line(HT[0] + 1, HT[1], F[0] + 1, F[1], 'H');
  // chainring
  img.circle(BB[0], BB[1], 3, 'K');
  img.circle(BB[0], BB[1], 2, 'h');
  img.set(BB[0], BB[1], 'g');
  // saddle + post
  img.vline(S[0] - 1, S[1] - 2, S[1], 'g');
  img.rect(S[0] - 4, S[1] - 3, 6, 2, 'k');
  img.hline(S[0] - 4, S[0] + 1, S[1] - 4, 'K');
  img.set(S[0] - 5, S[1] - 2, 'K'); img.set(S[0] + 2, S[1] - 3, 'K');
  // stem + swept-back cruiser bars + bell
  img.line(HT[0], HT[1], HT[0] - 1, HT[1] - 4, 'H');
  img.line(HT[0] - 1, HT[1] - 4, HT[0] - 4, HT[1] - 5, 'H');
  img.set(HT[0] - 5, HT[1] - 5, 'k'); img.set(HT[0] - 6, HT[1] - 5, 'k');
  img.set(HT[0] + 1, HT[1] - 5, 'y'); img.set(HT[0] + 1, HT[1] - 6, 'Y');
  // front basket with pizza slice
  const bx = HT[0] + 2, by = HT[1] - 4;
  img.rect(bx, by, 8, 6, 'X');
  for (let i = 0; i < 8; i += 2) img.vline(bx + i, by + 1, by + 5, 'x');
  img.hline(bx, bx + 7, by + 3, 'x');
  img.hline(bx - 1, bx + 8, by, 'j');
  img.poly([[bx + 2, by], [bx + 6, by - 4], [bx + 7, by]], 'y');
  img.hline(bx + 5, bx + 7, by - 3, 'X'); img.set(bx + 6, by - 4, 'X');
  img.set(bx + 4, by - 1, 'R'); img.set(bx + 6, by - 2, 'R');
  img.line(bx - 1, by, bx - 1, by + 6, 'K'); img.line(bx + 8, by, bx + 8, by + 6, 'K'); img.hline(bx - 1, bx + 8, by + 6, 'K');
  // pedals
  const ang = (pedal * Math.PI) / 2;
  const p1 = [BB[0] + Math.cos(ang) * 4, BB[1] + Math.sin(ang) * 4];
  const p2 = [BB[0] - Math.cos(ang) * 4, BB[1] - Math.sin(ang) * 4];
  return { BB, S, HT, p1, p2 };
}

function tail(img, sway, flare = 0) {
  // bushy tail behind the rider, striped rings
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 0.07) {
    const x = 13 - t * 12 - flare * t * 2;
    const y = 15 - t * 7 - Math.sin(t * Math.PI) * 2 + sway * t * t;
    pts.push([x, y, 3.4 - t * 1.0 + Math.sin(t * Math.PI) * 0.8]);
  }
  pts.forEach(([x, y, r], i) => {
    const band = Math.floor(i / 2.2) % 2 === 0 ? 'h' : 'g';
    img.circle(Math.round(x), Math.round(y), Math.round(r), i >= pts.length - 2 ? 'k' : band);
  });
}

function leg(img, hip, foot, near) {
  const knee = ik(hip[0], hip[1], foot[0], foot[1], 7, 7, -1);
  const c1 = near ? 'G' : 'g', c2 = near ? 'G' : 'g';
  img.thick(hip[0], hip[1], knee[0], knee[1], c1, near ? 3 : 2);
  img.thick(knee[0], knee[1], foot[0], foot[1], c2, 2);
  img.rect(Math.round(foot[0]) - 1, Math.round(foot[1]), 3, 1, 'k');
  img.set(Math.round(foot[0]), Math.round(foot[1]) - 1, 'k');
}

/**
 * pose: { phase, pedal, sway, lean, lift, hurt, attack (0..3: bike-pump swing), tuck }
 */
export function raccoonFrame(pose = {}) {
  const { phase = 0, pedal = 0, sway = 0, lean = 0, lift = 0, hurt = false, attack = 0, tuck = false, bob = 0 } = pose;
  const swoosh = [];
  const back = new Img(FW, FH); // far leg (behind bike)
  const bikeL = new Img(FW, FH);
  const body = new Img(FW, FH); // tail + torso + head + near limbs, outlined together
  back.tx = bikeL.tx = body.tx = SHIFT;
  back.ty = bikeL.ty = body.ty = TOP;

  const geo = bike(bikeL, phase, pedal, { lift });
  const hip = [16 + lean * 0.3, 15 + bob];

  // far leg
  leg(back, hip, tuck ? [geo.BB[0] + 2, geo.BB[1] - 4] : geo.p2, false);
  back.outline('K');

  tail(body, sway, lean > 1 ? 1 : 0);
  // torso
  const sx = 23 + lean, sy = 9 + bob;
  body.poly([[hip[0] - 4, hip[1] + 2], [hip[0] - 2, hip[1] - 4], [sx - 3, sy - 2], [sx + 2, sy - 1], [sx + 2, sy + 3], [hip[0] + 4, hip[1] + 2]], 'G');
  body.poly([[hip[0] + 1, hip[1] + 1], [sx - 1, sy + 3], [sx + 2, sy + 3], [hip[0] + 4, hip[1] + 2]], 'h');
  // head
  const head = Img.fromGrid(hurt ? HEAD_HURT : HEAD);
  body.blit(head, sx - 4, sy - 9);
  // near arm to grips (or swinging the bike pump)
  if (attack === 0) {
    body.thick(sx, sy + 2, geo.HT[0] - 5, geo.HT[1] - 5, 'G', 2);
    body.rect(geo.HT[0] - 6, geo.HT[1] - 6, 2, 2, 'k');
  } else {
    // bike pump swung like a bat (v03, per Ivan: reads better than the lid at this scale).
    // Bright red barrel, black T-handle at the striking end, hose loop at the grip, white swoosh on the swing.
    const poses = [null, { h: [-1, -1], d: [-0.75, -0.66] }, { h: [5, -2], d: [0.55, -0.83] }, { h: [6, 3], d: [0.92, 0.38] }];
    const { h, d } = poses[attack];
    const hx = sx + h[0], hy = sy + h[1];
    body.thick(sx, sy + 2, hx, hy, 'G', 2);
    const dl = Math.hypot(d[0], d[1]), dx = d[0] / dl, dy = d[1] / dl, px = -dy, py = dx;
    const L = 11;
    for (let i = 0; i <= L; i++) {
      const x = hx + dx * i, y = hy + dy * i;
      body.set(Math.round(x + px), Math.round(y + py), 'o');
      body.set(Math.round(x), Math.round(y), i === 0 ? 'k' : 'y');
      body.set(Math.round(x - px), Math.round(y - py), i === 0 ? 'k' : 'Y');
    }
    // T-handle across the far end
    const tx = hx + dx * (L + 1), ty = hy + dy * (L + 1);
    for (let k = -3; k <= 3; k++) body.set(Math.round(tx + px * k), Math.round(ty + py * k), 'K');
    body.set(Math.round(tx - dx), Math.round(ty - dy), 'g');
    // hose loop hanging from the grip end
    for (let a = 0; a < Math.PI * 1.4; a += 0.35) body.set(Math.round(hx - dx * 2 + Math.cos(a + 1) * 2.5), Math.round(hy - dy * 2 + 2 + Math.sin(a + 1) * 2), 'K');
    // swoosh arc on the big swing
    if (attack === 2) for (let a = -1.9; a < 0.2; a += 0.1) { const r = L + 3; swoosh.push([Math.round(hx + Math.cos(a) * r), Math.round(hy + Math.sin(a) * r), a > -0.4 ? 'H' : 'W']); swoosh.push([Math.round(hx + Math.cos(a) * (r - 1)), Math.round(hy + Math.sin(a) * (r - 1)), a > -1 ? 'H' : 'W']); }
  }
  // near leg
  leg(body, [hip[0] + 1, hip[1] + 1], tuck ? [geo.BB[0] + 4, geo.BB[1] - 5] : geo.p1, true);
  body.outline('K');
  body.rim('G', 'h', 'up');

  const out = new Img(FW, FH);
  out.blit(back, 0, 0);
  out.blit(bikeL, 0, 0);
  out.blit(body, 0, 0);
  out.tx = SHIFT; out.ty = TOP;
  for (const [x, y, c] of swoosh) out.set(x, y, c);
  out.tx = 0; out.ty = 0;
  return out;
}

export function raccoonSideFrames() {
  const anims = {};
  const frames = [];
  const add = (name, list, rate, loop = true) => { anims[name] = { start: frames.length, count: list.length, rate, loop }; frames.push(...list); };
  add('idle', [0, 1].map((i) => raccoonFrame({ pedal: 1, sway: i, bob: i === 1 ? 0 : 0 })), 3);
  // M3.1 (Ivan: "more of this movement"): the tail swings through -2..+4 px at the tip instead of 0..1
  add('ride', [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i, pedal: i, sway: [-2, 1, 4, 1][i] })), 10);
  add('boost', [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i * 2, pedal: i, sway: [0, 3, 5, 3][i], lean: 2 })), 16);
  add('jump', [raccoonFrame({ tuck: true, lift: 3, sway: -1 }), raccoonFrame({ tuck: true, lift: 1, sway: 2 })], 6, false);
  add('dash', [raccoonFrame({ phase: 1, pedal: 1, lean: 3, sway: 3 })], 1, false);
  add('attack', [1, 2, 3].map((a) => raccoonFrame({ pedal: 1, attack: a, sway: 1 })), 18, false);
  add('hurt', [raccoonFrame({ hurt: true, pedal: 2, sway: -2, lean: -1 })], 1, false);
  return { frames, anims, fw: FW, fh: FH };
}
export function attackPreview() {
  return { frames: [0, 1, 2, 3].map((a) => raccoonFrame({ pedal: 1, attack: a, sway: 1 })), cols: 4 };
}

/** M3.1: the ride cycle with the bigger tail swing */
export function ridePreview() { return { frames: [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i, pedal: i, sway: [-2, 1, 4, 1][i] })), cols: 4 }; }

/** M3.2: the home-screen / manifest icon (64x64 art, saved at 3x and 8x) */
export function appIcon() {
  const ic = new Img(64, 64);
  ic.rect(0, 0, 64, 64, 'v');
  ic.blit(raccoonFrame({ phase: 1, pedal: 1, sway: 1 }), 4, 12);
  return ic;
}
export function appIconPreview() { return { frames: [appIcon()], cols: 1 }; }
