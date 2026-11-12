// Mission 5 (M3): Dog Fraud's LANE EATER, a rat-driven paving machine that chews up Bloor's protected bike
// lane and lays "ANOTHER CAR LANE" paint behind it. Side view, faces right (it chases you).
// Three weak points for the boss: the CONVEYOR on top, the FOREMAN's cab (megaphone), the GRINDER drum.
import { Img } from '../lib/raster.mjs';

export const LE_W = 176, LE_H = 112;
/** weak-point boxes in image coords (the game turns them into hit zones) */
export const LE_ZONES = { conveyor: { x: 30, y: 10, w: 70, h: 14 }, cab: { x: 104, y: 20, w: 30, h: 30 }, grinder: { x: 136, y: 58, w: 38, h: 40 } };

/** frame: 0/1 animation; broken: list of zones already smashed */
export function laneEater(frame = 0, broken = []) {
  const img = new Img(LE_W, LE_H);
  const isB = (k) => broken.includes(k);
  // chassis: yellow construction-machine body with hazard stripes
  img.rect(8, 50, 132, 34, 'y'); img.rect(8, 50, 132, 3, 'Y'); img.rect(8, 80, 132, 4, 'o');
  for (let x = 10; x < 138; x += 10) img.poly([[x, 84], [x + 5, 84], [x + 10, 76], [x + 5, 76]], 'K');
  img.rect(8, 76, 132, 1, 'K');
  // DF branding on the side
  img.rect(26, 56, 74, 16, 'v'); img.rect(27, 57, 72, 14, 'V');
  const G = { A: ['.#.', '#.#', '###', '#.#'], N: ['#.#', '###', '###', '#.#'], O: ['###', '#.#', '#.#', '###'], T: ['###', '.#.', '.#.', '.#.'], H: ['#.#', '###', '#.#', '#.#'], E: ['###', '##.', '#..', '###'], R: ['##.', '###', '##.', '#.#'], C: ['###', '#..', '#..', '###'], L: ['#..', '#..', '#..', '###'] };
  let lx = 30;
  for (const ch of 'ANOTHER CAR LANE') { if (ch === ' ') { lx += 2; continue; } const g = G[ch]; for (let yy = 0; yy < 4; yy++) for (let i = 0; i < 3; i++) if (g[yy][i] === '#') img.set(lx + i, 62 + yy, 'Y'); lx += 4; if (lx > 96) break; }
  // tracks (caterpillar) under the chassis
  img.rect(4, 86, 140, 18, 'k'); img.rect(6, 88, 136, 14, 'g');
  for (let x = 8 + (frame % 2) * 3; x < 140; x += 6) img.rect(x, 88, 2, 14, 'k');
  for (const cx of [16, 46, 76, 106, 132]) { img.circle(cx, 95, 6, 'G'); img.circle(cx, 95, 3, 'h'); }
  // CONVEYOR on top: an angled belt carrying asphalt back (weak point 1)
  if (!isB('conveyor')) {
    img.poly([[28, 30], [100, 14], [104, 22], [32, 38]], 'g');
    for (let i = 0; i < 8; i++) { const t = (i + frame * 0.5) / 8; const x = 32 + t * 68, y = 34 - t * 16; img.rect(Math.round(x), Math.round(y) - 3, 5, 3, 'a'); }
    img.line(28, 30, 100, 14, 'K'); img.line(32, 38, 104, 22, 'K');
    img.rect(30, 38, 3, 14, 'G'); img.rect(94, 22, 3, 30, 'G');
  } else { img.poly([[28, 40], [70, 34], [72, 40], [30, 46]], 'g'); img.line(30, 46, 72, 40, 'K'); }
  // exhaust stack with "ANOTHER CAR LANE" puffs (drawn in game) + rotating beacon
  img.rect(16, 30, 6, 20, 'g'); img.rect(15, 28, 8, 3, 'k');
  img.circle(60, 46, 3, frame ? 'O' : 'o');
  // FOREMAN's CAB (weak point 2): glass cab with the rat foreman + megaphone
  img.rect(104, 22, 32, 30, 'y'); img.rect(106, 24, 28, 18, isB('cab') ? 'k' : 'U');
  if (!isB('cab')) {
    for (let i = 0; i < 18; i++) img.set(108 + i, 25 + Math.floor(i / 2), 'c');
    img.circle(120, 34, 5, 'x'); img.circle(116, 29, 2, 'P'); img.set(122, 33, 'K'); img.set(123, 33, 'W'); img.rect(116, 26, 9, 2, 'y'); // hard-hat rat
    img.poly([[124, 36], [134, 32], [134, 42]], 'R'); img.rect(122, 36, 3, 3, 'h'); // megaphone
  } else { img.line(106, 24, 134, 42, 'W'); img.line(134, 24, 110, 42, 'W'); }
  img.rect(104, 22, 32, 2, 'Y');
  // GRINDER drum at the front (weak point 3): a big toothed cylinder on arms
  img.rect(130, 56, 14, 6, 'g');
  if (!isB('grinder')) {
    img.circle(156, 78, 18, 'G'); img.circle(156, 78, 15, 'g');
    for (let a = 0; a < 12; a++) { const ang = (a / 12) * Math.PI * 2 + frame * 0.26; const x = 156 + Math.cos(ang) * 17, y = 78 + Math.sin(ang) * 17; img.rect(Math.round(x) - 1, Math.round(y) - 1, 3, 3, 'h'); }
    img.circle(156, 78, 5, 'k'); img.circle(156, 78, 2, 'h');
  } else { img.circle(156, 82, 12, 'k'); img.line(146, 76, 166, 88, 'g'); }
  img.outline('K');
  img.pivot = { x: 0.5, y: 103 / LE_H };
  return img;
}

/** a glob of wet asphalt / car-lane paint lobbed by the conveyor */
export function paintGob(frame = 0) {
  const img = Img.fromGrid(frame ? `
.KKK.
KaAaK
KAaAK
.KKK.` : `
..KK..
.KaAK.
KaAAaK
.KKKK.`);
  img.pivot = { x: 0.5, y: 0.5 };
  return img;
}

export function laneEaterPreview() {
  return { frames: [laneEater(0), laneEater(1), laneEater(0, ['conveyor']), laneEater(1, ['conveyor', 'cab', 'grinder']), paintGob(0), paintGob(1)], cols: 3 };
}
