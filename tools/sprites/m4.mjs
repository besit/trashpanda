// M4 art for missions 9 and 10: rail segments to lay (the Ontario Line), a construction hoarding, a station
// entrance (side view), the HIGHWAY MECH (a walking stretch of the Gardiner), the concrete slab it drops as a
// platform, and the side-view strip under the Gardiner's deck.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { drawText } from './font.mjs';

/** a pile of rails + ties waiting (0) and the laid track (1); 44x18, pivot at the bottom */
export function railSeg(frame = 0) {
  const W = 44, H = 18, img = new Img(W, H);
  if (frame === 0) {
    for (let i = 0; i < 4; i++) img.rect(4 + i * 2, H - 4 - i * 3, 36 - i * 4, 2, i % 2 ? 'h' : 'G'); // rails stacked
    img.rect(2, H - 3, 40, 3, 'x'); img.rect(8, H - 7, 6, 4, 'X'); img.rect(30, H - 7, 6, 4, 'X');   // ties
  } else {
    img.rect(0, H - 6, W, 6, 'g'); for (let x = 2; x < W; x += 7) img.rect(x, H - 6, 4, 6, 'x');   // ballast + ties
    img.rect(0, H - 8, W, 2, 'h'); img.hline(0, W - 1, H - 8, 'H'); img.rect(0, H - 13, W, 2, 'h'); img.hline(0, W - 1, H - 13, 'H'); // two rails
  }
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** a construction hoarding panel: blue with the project name; 64x40 */
export function hoarding(text = 'ONTARIO LINE') {
  const W = 64, H = 40, img = new Img(W, H);
  img.rect(0, 0, W, H - 2, 'U'); img.rect(0, 0, W, 2, 'C'); img.rect(0, H - 4, W, 2, 'u');
  for (const x of [2, W - 4]) img.rect(x, 0, 2, H, 'g');
  img.rect(6, 6, W - 12, 12, 'W'); drawText(img, text, W / 2, 9, 'u');
  drawText(img, 'OPENING', W / 2, 22, 'W'); drawText(img, 'SOON', W / 2, 30, 'Y');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** a subway station entrance, side view: a glass box with the TTC roundel on a post; 56x50 */
export function subwaySide() {
  const W = 56, H = 50, img = new Img(W, H);
  img.rect(2, 14, W - 4, H - 14, 'u'); for (let x = 4; x < W - 4; x += 6) img.vline(x, 14, H - 1, 'c');
  img.rect(0, 10, W, 5, 'H'); img.hline(0, W - 1, 10, 'W');                          // the roof slab
  img.rect(22, 26, 14, H - 26, 'k'); img.rect(23, 27, 5, H - 27, 'U'); img.rect(30, 27, 5, H - 27, 'U'); // doors
  img.rect(W - 8, 0, 2, 12, 'G'); img.circle(W - 7, 4, 4, 'R'); img.circle(W - 7, 4, 4, 'K', false); img.hline(W - 9, W - 5, 4, 'W'); // the roundel
  drawText(img, 'SUBWAY', 20, 17, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** a concrete slab the mech drops: a platform 70x12 */
export function slabPlatform() {
  const W = 70, H = 12, img = new Img(W, H);
  img.rect(0, 2, W, H - 2, 'S'); img.rect(0, 2, W, 2, 'T'); img.hline(0, W - 1, 4, 'h'); for (let x = 6; x < W; x += 12) img.rect(x, 6, 2, 4, 's');
  img.rect(0, 0, W, 2, 'y'); for (let x = 4; x < W; x += 10) img.rect(x, 0, 5, 1, 'K');            // a dashed lane line on top
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}

/**
 * The HIGHWAY MECH: a stretch of elevated expressway on two pier legs, a highway sign for a head
 * ("ANOTHER LANE"), a crane arm with a car in its claw. Frame 1 = the chest vent OPEN (its weak point).
 * 160x164, pivot at the feet.
 */
export function highwayMech(frame = 0) {
  const W = 160, H = 164, img = new Img(W, H);
  const gy = H - 2;
  // feet: road slabs; legs: concrete piers (tapered)
  for (const lx of [34, 106]) {
    img.rect(lx - 16, gy - 8, 34, 8, 'A'); img.rect(lx - 16, gy - 8, 34, 2, 's'); for (let x = lx - 12; x < lx + 16; x += 8) img.rect(x, gy - 5, 4, 1, 'y');
    for (let y = gy - 8; y > gy - 70; y--) { const hw = 7 + Math.round((gy - 8 - y) / 12); img.rect(lx - hw, y, hw * 2, 1, 'S'); img.set(lx - hw, y, 'T'); img.set(lx + hw - 1, y, 's'); }
    img.rect(lx - 14, gy - 74, 28, 6, 'S'); img.rect(lx - 14, gy - 74, 28, 2, 'T'); // the pier cap
  }
  // torso: a deck segment with guardrails, a lane line, and the chest vent
  const ty = gy - 104;
  img.rect(8, ty, 144, 30, 'S'); img.rect(8, ty, 144, 3, 'T'); img.rect(8, ty + 27, 144, 3, 's');
  for (let x = 14; x < 150; x += 12) img.rect(x, ty + 12, 7, 1, 'y');                              // the dashed centre line, seen face-on
  for (let x = 10; x < 152; x += 10) { img.rect(x, ty - 8, 2, 8, 'h'); } img.rect(8, ty - 6, 144, 2, 'H'); // guardrail
  const vx = 58, vy = ty + 8;
  if (frame === 0) { img.rect(vx, vy, 44, 16, 'o'); for (let y = vy + 2; y < vy + 16; y += 3) img.hline(vx + 2, vx + 41, y, 'K'); img.rect(vx, vy, 44, 1, 'O'); }
  else { img.rect(vx, vy, 44, 16, 'Y'); img.rect(vx + 4, vy + 3, 36, 10, 'O'); img.rect(vx + 10, vy + 5, 24, 6, 'R'); img.rect(vx, vy, 44, 1, 'W'); } // open: the glowing core
  // head: a green highway sign on two posts
  img.rect(44, ty - 38, 4, 30, 'G'); img.rect(112, ty - 38, 4, 30, 'G');
  img.rect(30, ty - 54, 100, 26, 'W'); img.rect(32, ty - 52, 96, 22, 'E'); img.hline(32, 127, ty - 52, 'l'); // a white border round the green sign
  drawText(img, 'ANOTHER LANE', 80, ty - 48, 'W'); drawText(img, '^ ^ ^', 80, ty - 38, 'W');
  // a pair of headlights under the sign (its eyes), angry
  img.rect(50, ty - 24, 10, 6, 'Y'); img.rect(100, ty - 24, 10, 6, 'Y'); img.rect(50, ty - 24, 10, 2, 'K'); img.rect(100, ty - 24, 10, 2, 'K');
  // the arm: a lattice boom out to the left, a claw holding a small red car
  for (let i = 0; i < 26; i++) { img.rect(8 - i * 0.3, ty + 6 - i * 1.4, 3, 3, i % 2 ? 'o' : 'O'); }
  img.rect(0, ty - 36, 10, 6, 'G'); img.rect(0, ty - 30, 2, 8, 'G'); img.rect(8, ty - 30, 2, 8, 'G');       // the claw
  img.poly([[0, ty - 22], [2, ty - 26], [10, ty - 26], [12, ty - 22], [12, ty - 18], [0, ty - 18]], 'R'); img.rect(2, ty - 25, 8, 3, 'C'); // the car
  // exhaust stacks on the deck
  for (const x of [20, 140]) { img.rect(x, ty - 14, 4, 10, 'g'); if (frame) img.rect(x - 1, ty - 18, 6, 3, 'h'); }
  img.outline('K'); img.pivot = { x: 0.5, y: gy / H };
  return img;
}

/** the side-view strip under the Gardiner: the deck overhead on its piers, the lake's towers beyond (768x140) */
export function gardinerStrip(W = 768) {
  const H = 140, img = new Img(W, H), r = rng(1955);
  // the far side: Southcore towers through the gaps
  for (let x = 0; x < W; x += 56) { const h = r.int(40, 70), w = r.int(34, 50); img.rect(x, 110 - h, w, h, 'u'); for (let y = 112 - h; y < 108; y += 6) for (let xx = x + 3; xx < x + w - 3; xx += 6) img.rect(xx, y, 3, 3, r.chance(0.3) ? 'D' : 'U'); }
  // the deck overhead: its underside is dark, a thick edge beam, a guardrail along the top
  img.rect(0, 0, W, 4, 'h'); for (let x = 0; x < W; x += 10) img.rect(x, 0, 2, 6, 'H');
  img.rect(0, 6, W, 26, 'S'); img.rect(0, 6, W, 3, 'T'); img.rect(0, 28, W, 4, 's'); img.rect(0, 32, W, 6, 'g');
  for (let x = 20; x < W; x += 40) img.rect(x, 12, 12, 10, 'A'); // the drain spouts + grime
  // piers every 192 px, down to the sidewalk
  for (let x = 96; x < W; x += 192) { img.rect(x - 11, 38, 22, 8, 'S'); for (let y = 46; y < H; y++) { const hw = 7 + Math.round((y - 46) / 20); img.rect(x - hw, y, hw * 2, 1, 'S'); img.set(x - hw, y, 'T'); img.set(x + hw - 1, y, 's'); } }
  // the shadow the deck throws
  for (let y = 38; y < 70; y++) if (y % 2) for (let x = 0; x < W; x += 2) if (!img.get(x, y)) img.set(x, y, 'k');
  img.rect(0, H - 2, W, 2, 'T');
  return img;
}

export function m4Preview() {
  return { frames: [railSeg(0), railSeg(1), hoarding(), subwaySide(), slabPlatform(), highwayMech(0), highwayMech(1), gardinerStrip().crop(0, 0, 384, 140)], cols: 4 };
}
