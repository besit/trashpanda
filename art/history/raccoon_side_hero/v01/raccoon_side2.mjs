// M4.13 (Ivan: "a pass over the side view raccoon, see if it would look better than the current sprites"): the mission
// sprite in the hero's proportions. The rider (head, bandana, pump, torso, the arm on the grips, the ringed tail) is
// the hero bike image brought down to 40 px on the raccoon's palette (art/heroes/raccoon_side_src.png, made by
// tools/heroes-build.mjs); everything that moves is drawn here: the bike (spinning wheels, red frame and fork), the
// pedalling legs, the tail's sway, and the pump swing. Coordinates below are the source image's (41 x 40); the frame
// puts its ground row on row 50 of a 56 x 52 frame (16 rows of headroom for the raised pump).
import { Img } from '../lib/raster.mjs';
import { heroKey } from '../palette.mjs';
import { heroImage } from './heroes.mjs';
import { ik, wheel, FUR } from './raccoon_side.mjs';

export const FW = 56, FH = 52;
const OX = 7, OY = 11; // source -> frame
export const PIVOT_Y = (39 + OY + 1) / FH; // the wheels' bottom row
const hk = (i) => heroKey('raccoon', i);
const BOOT = hk(14), BOOT_HI = hk(24);

const SRC = heroImage('raccoon', 'side_src');
// the bike's joints, read off the hero image
const R = [8, 32], F = [33, 32], BB = [19, 32], S = [17, 21], HT = [28, 20], HB = [30, 24], GRIP = [28, 15];
const HIP = [19, 21], SHOULDER = [22, 13], TAIL_X = 12;

const isYellow = (k) => { if (!k) return false; const n = parseInt(PAL[k].slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return r > 150 && g > 110 && b < 90 && r - b > 90; };
import { PALETTE as PAL } from '../palette.mjs';

/** the rider cut from the hero image: down to the saddle; at the front, down to the paw on the grips */
function rider({ swing = false, hurt = false, sway = 0 }) {
  const im = new Img(SRC.w, SRC.h);
  for (let y = 0; y < SRC.h; y++) for (let x = 0; x < SRC.w; x++) {
    const k = SRC.get(x, y); if (!k) continue;
    const keep = x >= 27 ? y <= 16 : y <= 20 || (y <= 22 && x >= 14 && x <= 21);
    if (!keep) continue;
    if (swing) {
      if (x >= 24 && y >= 12 && y <= 17) continue;           // the arm on the grips goes (it's drawn swinging)
      if (x < 18 && y < 13 && isYellow(k)) continue;          // and the pump leaves his back
      if (x >= 7 && x <= 10 && y >= 10 && y <= 12 && x + y > 18 && y < 12) continue;
    }
    // the tail sways: its tip moves up to ~3 px, its root stays
    let ty = y;
    if (x < TAIL_X && y >= 10) { const t = (TAIL_X - x) / TAIL_X; ty = y + Math.round(sway * t * t * 0.7); }
    im.set(x, ty, k);
  }
  im.outline('K'); // the game's black outline, like every sprite
  if (hurt) { for (const [x, y] of [[23, 7], [25, 7], [25, 6]]) im.set(x, y, FUR.mask); im.set(24, 6, hk(44)); im.set(26, 7, hk(44)); }
  return im;
}

function bike(img, phase, pedal, lift) {
  const f = [F[0], F[1] - lift];
  wheel(img, R[0], R[1], phase); wheel(img, f[0], f[1], phase);
  img.line(R[0], R[1] + 1, BB[0], BB[1] + 2, 'g'); img.line(R[0], R[1] - 1, BB[0], BB[1] - 2, 'g'); // chain
  const tube = (a, b) => { img.thick(a[0], a[1] + 1, b[0], b[1] + 1, 'r', 2); img.thick(a[0], a[1], b[0], b[1], 'R', 2); };
  tube(R, S); tube(R, BB); tube(BB, S); tube(S, HT); tube(BB, [HB[0], HB[1] - lift / 2]);
  img.thick(HT[0], HT[1] + 1, f[0], f[1] + 1, 'r', 2); img.thick(HT[0], HT[1], f[0], f[1], 'R', 2); // the red fork
  img.circle(BB[0], BB[1], 3, 'K'); img.circle(BB[0], BB[1], 2, 'h'); img.set(BB[0], BB[1], 'g');
  img.rect(S[0] - 3, S[1] - 1, 6, 2, 'k'); // saddle (under him)
  img.line(HT[0], HT[1], GRIP[0], GRIP[1] + 1, 'k'); img.set(GRIP[0] + 1, GRIP[1] + 1, 'k'); // stem + bars
  const a = (pedal * Math.PI) / 2;
  return { p1: [BB[0] + Math.cos(a) * 4, BB[1] + Math.sin(a) * 4], p2: [BB[0] - Math.cos(a) * 4, BB[1] - Math.sin(a) * 4] };
}

function leg(img, hip, foot, near) {
  // the hero's legs: a thick thigh, a shin, a boot
  const knee = ik(hip[0], hip[1], foot[0], foot[1], 7, 7, -1);
  const c = near ? FUR.mid : FUR.dark, cl = near ? FUR.light : FUR.mid2;
  img.thick(hip[0], hip[1], knee[0], knee[1], c, near ? 4 : 3); img.line(hip[0], hip[1] - 1, knee[0], knee[1] - 1, cl);
  img.thick(knee[0], knee[1], foot[0], foot[1], c, 2);
  img.rect(Math.round(foot[0]) - 1, Math.round(foot[1]) - 1, 4, 2, BOOT); img.hline(Math.round(foot[0]), Math.round(foot[0]) + 1, Math.round(foot[1]) - 1, BOOT_HI);
}

/** pose: { phase, pedal, sway, lean, lift, hurt, attack (0..3: the pump swing), tuck, bob } */
export function raccoonFrame(pose = {}) {
  const { phase = 0, pedal = 0, sway = 0, lean = 0, lift = 0, hurt = false, attack = 0, tuck = false, bob = 0 } = pose;
  const dx = Math.round(lean * 0.5) - (hurt ? 1 : 0), dy = bob + (lean > 1 ? 1 : 0);
  const L = () => { const i = new Img(FW, FH); i.tx = OX; i.ty = OY; return i; };
  const back = L(), bk = L(), body = L(), front = L(), fx = [];
  const g = bike(bk, phase, pedal, lift);
  bk.outline('K');
  const hip = [HIP[0] + dx, HIP[1] + dy];
  leg(back, hip, tuck ? [BB[0] + 2, BB[1] - 4] : g.p2, false); back.outline('K');
  body.blit(rider({ swing: attack > 0, hurt, sway }), dx, dy);
  leg(front, [hip[0] + 1, hip[1] + 1], tuck ? [BB[0] + 4, BB[1] - 5] : g.p1, true);
  if (attack > 0) {
    // the pump swung like a bat: wind-up behind the head, overhead, the strike forward (white swoosh on the big one)
    const poses = [null, { h: [-5, -3], d: [-0.75, -0.66] }, { h: [5, -3], d: [0.55, -0.83] }, { h: [7, 2], d: [0.92, 0.38] }];
    const { h, d } = poses[attack];
    const sx = SHOULDER[0] + dx, sy = SHOULDER[1] + dy, hx = sx + h[0], hy = sy + h[1];
    const dl = Math.hypot(d[0], d[1]), ux = d[0] / dl, uy = d[1] / dl, px = -uy, py = ux, PL = 11;
    for (let i = 0; i <= PL; i++) {
      const x = hx + ux * i, y = hy + uy * i;
      front.set(Math.round(x + px), Math.round(y + py), 'o');
      front.set(Math.round(x), Math.round(y), i === 0 ? 'k' : 'y');
      front.set(Math.round(x - px), Math.round(y - py), i === 0 ? 'k' : 'Y');
    }
    const tx = hx + ux * (PL + 1), ty = hy + uy * (PL + 1);
    for (let k = -3; k <= 3; k++) front.set(Math.round(tx + px * k), Math.round(ty + py * k), 'K');
    for (let a = 0; a < Math.PI * 1.4; a += 0.35) front.set(Math.round(hx - ux * 2 + Math.cos(a + 1) * 2.5), Math.round(hy - uy * 2 + 2 + Math.sin(a + 1) * 2), 'K');
    front.thick(sx, sy + 1, hx, hy + 1, FUR.mid2, 2); front.line(sx, sy, hx, hy, FUR.mid);
    front.rect(Math.round(hx) - 1, Math.round(hy) - 1, 2, 2, FUR.mask);
    if (attack === 2) for (let a = -1.9; a < 0.2; a += 0.1) { const r = PL + 3; fx.push([Math.round(hx + Math.cos(a) * r), Math.round(hy + Math.sin(a) * r), a > -0.4 ? 'H' : 'W']); fx.push([Math.round(hx + Math.cos(a) * (r - 1)), Math.round(hy + Math.sin(a) * (r - 1)), a > -1 ? 'H' : 'W']); }
  }
  front.outline('K');
  const out = new Img(FW, FH);
  for (const l of [back, bk, body, front]) { l.tx = 0; l.ty = 0; out.blit(l, 0, 0); }
  for (const [x, y, c] of fx) out.set(x + OX, y + OY, c);
  return out;
}

export function raccoonSideFrames() {
  const anims = {}, frames = [];
  const add = (name, list, rate, loop = true) => { anims[name] = { start: frames.length, count: list.length, rate, loop }; frames.push(...list); };
  add('idle', [0, 1].map((i) => raccoonFrame({ pedal: 1, sway: i * 2 })), 3);
  add('ride', [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i, pedal: i, sway: [-2, 1, 4, 1][i], bob: i % 2 })), 10);
  add('boost', [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i * 2, pedal: i, sway: [0, 3, 5, 3][i], lean: 2 })), 16);
  add('jump', [raccoonFrame({ tuck: true, lift: 3, sway: -1 }), raccoonFrame({ tuck: true, lift: 1, sway: 2 })], 6, false);
  add('dash', [raccoonFrame({ phase: 1, pedal: 1, lean: 3, sway: 3 })], 1, false);
  add('attack', [1, 2, 3].map((a) => raccoonFrame({ pedal: 1, attack: a, sway: 1 })), 18, false);
  add('hurt', [raccoonFrame({ hurt: true, pedal: 2, sway: -2 })], 1, false);
  return { frames, anims, fw: FW, fh: FH };
}
export function sidePreview() {
  return { frames: [0, 1, 2, 3].map((i) => raccoonFrame({ phase: i, pedal: i, sway: [-2, 1, 4, 1][i], bob: i % 2 })).concat([1, 2, 3].map((a) => raccoonFrame({ pedal: 1, attack: a, sway: 1 })), [raccoonFrame({ tuck: true, lift: 3, sway: -1 }), raccoonFrame({ hurt: true, pedal: 2, sway: -2 })]), cols: 9 };
}
export function appIcon() {
  const ic = new Img(64, 64);
  ic.rect(0, 0, 64, 64, 'v');
  ic.blit(raccoonFrame({ phase: 1, pedal: 1, sway: 1 }), 4, 6);
  return ic;
}
