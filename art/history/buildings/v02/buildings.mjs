// Procedural Toronto (Queen West-style) buildings.
// facade(): front elevation, used directly in side-view mission backgrounds.
// obliqueBuilding(): roof (top-down) + facade, used on the 3/4 exploration map.
import { Img, sheet } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';

export const BRICKS = {
  red: { base: 'B', dark: 'b', light: 'n' },
  buff: { base: 'j', dark: 'X', light: 'D' },
  darkred: { base: 'b', dark: 'w', light: 'B' },
  teal: { base: 'F', dark: 'f', light: 'C' },
  lilac: { base: 'Z', dark: 'V', light: 'M' },
  grey: { base: 'h', dark: 'G', light: 'H' },
  cream: { base: 'T', dark: 't', light: 'W' },
  mustard: { base: 'y', dark: 'o', light: 'Y' },
};
const AWNINGS = [['R', 'W'], ['E', 'W'], ['U', 'W'], ['k', 'y'], ['V', 'Z'], ['f', 'F'], ['r', 'O']];
const SIGNS = [['k', 'Y'], ['u', 'W'], ['r', 'Y'], ['W', 'k'], ['E', 'Y'], ['v', 'Z'], ['g', 'O']];

const PAINTED = new Set(['teal', 'lilac', 'grey', 'cream', 'mustard']);
function brickWall(img, x, y, w, h, b, r, painted = false) {
  img.rect(x, y, w, h, b.base);
  for (let j = 0; j < h; j++) {
    const Y = y + j;
    if (painted) { if (j % 3 === 2) for (let i = 0; i < w; i++) if ((i + j) % 4 === 0) img.set(x + i, Y, b.dark); continue; }
    if (j % 3 === 2) { for (let i = 0; i < w; i++) if ((i + j) % 2 === 0) img.set(x + i, Y, b.dark); }
    else { const off = Math.floor(j / 3) % 2 ? 2 : 0; for (let i = off; i < w; i += 5) img.set(x + i, Y, b.dark); }
  }
  // weathering (sparser on painted brick)
  for (let i = 0; i < (w * h) / (painted ? 160 : 70); i++) img.set(x + r.int(0, w - 1), y + r.int(0, h - 1), b.light);
}

function sashWindow(img, x, y, w, h, { arch = false, lit = false, curtain = null, trim = 'T' } = {}) {
  img.rect(x - 1, y - 2, w + 2, 1, trim); // lintel
  img.rect(x - 1, y + h, w + 2, 1, trim); // sill
  img.rect(x - 1, y + h + 1, w + 2, 1, 'k');
  img.rect(x, y, w, h, 'W');
  const gx = x + 1, gy = y + 1, gw = w - 2, gh = h - 2;
  img.rect(gx, gy, gw, gh, lit ? 'd' : 'u');
  if (!lit) { for (let i = 0; i < gh; i++) img.set(gx + Math.min(gw - 1, Math.floor(i / 2)), gy + i, 'U'); img.set(gx + gw - 1, gy, 'c'); }
  if (curtain) { img.rect(gx, gy, 1, gh, curtain); img.rect(gx + gw - 1, gy, 1, gh, curtain); }
  img.hline(x, x + w - 1, y + Math.floor(h / 2), 'W'); // meeting rail
  if (arch) { img.set(x, y, null); img.set(x + w - 1, y, null); img.hline(x, x + w - 1, y - 1, trim); img.set(x - 1, y - 2, null); img.set(x + w, y - 2, null); }
}

function storefront(img, x, y, w, h, r) {
  // y = top of ground floor, h ~ 22
  const signH = 5, bulk = 3;
  const sign = r.pick(SIGNS);
  img.rect(x, y, w, signH, sign[0]);
  img.hline(x, x + w - 1, y, 'k');
  // pseudo lettering
  let cx = x + 3; const words = r.int(1, 2);
  for (let wd = 0; wd < words && cx < x + w - 6; wd++) { const len = r.int(3, 7); for (let i = 0; i < len && cx < x + w - 4; i++, cx += 2) { img.set(cx, y + 2, sign[1]); if (r.chance(0.6)) img.set(cx, y + 3, sign[1]); if (r.chance(0.4)) img.set(cx + 1, y + 2, sign[1]); } cx += 3; }
  const top = y + signH;
  const wallH = h - signH;
  img.rect(x, top, w, wallH, 'k');
  // awning (optional)
  const hasAwning = r.chance(0.65);
  // door position
  const doorW = 6, doorX = r.chance(0.5) ? x + 2 : x + w - 2 - doorW;
  // display glass
  img.rect(x + 1, top + 1, w - 2, wallH - bulk - 1, 'U');
  for (let i = 0; i < w - 2; i++) for (let j = 0; j < wallH - bulk - 1; j++) if ((i + j) % 9 < 2) img.set(x + 1 + i, top + 1 + j, 'c');
  // window mullions
  for (let i = x + 1; i < x + w - 1; i += 10) img.vline(i, top + 1, top + wallH - bulk, 'k');
  // interior hints: shelves / plants / people silhouettes
  for (let i = x + 3; i < x + w - 3; i += r.int(4, 7)) if (r.chance(0.5)) img.rect(i, top + wallH - bulk - 4, 2, 3, r.pick(['l', 'y', 'P', 'X', 'H']));
  // bulkhead
  img.rect(x, top + wallH - bulk, w, bulk, 'x');
  img.hline(x, x + w - 1, top + wallH - bulk, 'X');
  // recessed door
  img.rect(doorX, top + 2, doorW, wallH - 2, 'K');
  img.rect(doorX + 1, top + 3, doorW - 2, wallH - 4, 'u');
  img.vline(doorX + doorW - 2, top + Math.floor(wallH / 2), top + Math.floor(wallH / 2) + 1, 'y');
  if (hasAwning) {
    const aw = r.pick(AWNINGS), ah = 5;
    for (let i = 0; i < w; i++) for (let j = 0; j < ah; j++) img.set(x + i, top + j, Math.floor(i / 3) % 2 ? aw[0] : aw[1]);
    for (let i = 0; i < w; i++) { if (i % 3 === 1) img.set(x + i, top + ah, Math.floor(i / 3) % 2 ? aw[0] : aw[1]); }
    img.hline(x, x + w - 1, top + ah - 1, 'k');
    for (let i = 0; i < w; i++) if (Math.floor(i / 3) % 2) img.set(x + i, top, aw[0]);
  }
}

/**
 * Front elevation. opts: { w, floors (upper), brick, seed, kind: 'shop'|'house'|'rear' }
 */
export function facade({ w = 48, floors = 2, brick = 'red', seed = 1, kind = 'shop' } = {}) {
  const r = rng(seed);
  const b = BRICKS[brick];
  const groundH = kind === 'shop' ? 22 : 16, floorH = 15, cornice = kind === 'rear' ? 1 : 4;
  const h = cornice + floors * floorH + groundH;
  const img = new Img(w, h);
  brickWall(img, 0, 0, w, h, b, r, PAINTED.has(brick));
  // cornice
  if (cornice > 1) {
    img.rect(0, 0, w, 3, 'T'); img.hline(0, w - 1, 3, 'k');
    for (let i = 1; i < w; i += 3) img.set(i, 2, 't');
    img.rect(0, 0, 2, 5, 't'); img.rect(w - 2, 0, 2, 5, 't');
  } else img.hline(0, w - 1, 0, 'S');
  // upper floors
  const nWin = Math.max(2, Math.round(w / 15));
  const arch = r.chance(0.4), winW = kind === 'rear' ? 5 : 6, winH = kind === 'rear' ? 7 : 10;
  for (let f = 0; f < floors; f++) {
    const fy = cornice + f * floorH + 3;
    for (let k = 0; k < nWin; k++) {
      const cx = Math.round(((k + 0.5) * w) / nWin - winW / 2);
      sashWindow(img, cx, fy, winW, winH, { arch: arch && kind !== 'rear', lit: r.chance(0.12), curtain: r.chance(0.3) ? r.pick(['P', 'X', 'Z', 'y']) : null, trim: kind === 'rear' ? b.dark : 'T' });
    }
  }
  const gy = cornice + floors * floorH;
  if (kind === 'shop') storefront(img, 0, gy, w, groundH, r);
  else if (kind === 'house') {
    // porch + door
    img.rect(4, gy + 2, 8, groundH - 2, 'k'); img.rect(5, gy + 3, 6, groundH - 3, 'x');
    sashWindow(img, w - 14, gy + 4, 9, 8, {});
  } else {
    // rear: back door, AC unit, fire escape, graffiti tag
    const dx = r.int(3, w - 12);
    img.rect(dx, gy + 4, 7, groundH - 4, 'G'); img.rect(dx + 1, gy + 5, 5, groundH - 5, 'g'); img.set(dx + 5, gy + 10, 'y');
    img.rect(w - 10, gy + 6, 7, 5, 'H'); img.rect(w - 9, gy + 7, 5, 3, 'G'); img.hline(w - 9, w - 5, gy + 8, 'h');
    if (floors > 0) { const fx = r.int(2, w - 18); for (let f = 0; f < floors; f++) { const yy = cornice + f * floorH + 12; img.hline(fx, fx + 14, yy, 'K'); img.hline(fx, fx + 14, yy + 1, 'g'); for (let i = 0; i < 15; i += 3) img.set(fx + i, yy - 1, 'K'); img.line(fx + 2, yy + 1, fx + 12, yy + floorH - 1, 'K'); } }
    if (r.chance(0.6)) { const tx = r.int(2, w - 16), tc = r.pick(['V', 'F', 'O', 'q', 'L']); for (let i = 0; i < 12; i++) img.set(tx + i, gy + 6 + Math.round(Math.sin(i * 1.3) * 2), tc); img.set(tx + 3, gy + 4, tc); img.set(tx + 8, gy + 9, tc); }
  }
  return img;
}

function roof(w, d, r, kind) {
  const img = new Img(w, d);
  img.rect(0, 0, w, d, 'g');
  for (let i = 0; i < (w * d) / 14; i++) img.set(r.int(0, w - 1), r.int(0, d - 1), r.pick(['s', 's', 'k']));
  // parapet
  img.rect(0, 0, w, 1, 'h'); img.rect(0, 0, 1, d, 'G'); img.rect(w - 1, 0, 1, d, 'k'); img.rect(0, d - 1, w, 1, 'G');
  img.hline(1, w - 2, 1, 'k');
  // rooftop clutter
  if (r.chance(0.7)) { const ax = r.int(3, w - 12), ay = r.int(3, d - 10); img.rect(ax, ay, 9, 6, 'H'); img.rect(ax, ay + 6, 9, 2, 'G'); img.rect(ax + 2, ay + 1, 5, 3, 'h'); img.hline(ax, ax + 8, ay + 8, 'K'); }
  if (r.chance(0.5)) { const sx = r.int(3, w - 8), sy = r.int(3, d - 8); img.rect(sx, sy, 5, 4, 'C'); img.rect(sx, sy + 4, 5, 1, 'U'); img.set(sx + 1, sy + 1, 'i'); }
  if (r.chance(0.6)) { const cx = r.pick([2, w - 6]), cy = r.int(2, 6); img.rect(cx, cy, 4, 3, 'B'); img.rect(cx, cy + 3, 4, 3, 'b'); img.hline(cx, cx + 3, cy, 'n'); }
  if (kind === 'shop' && r.chance(0.3)) { // rooftop patio umbrella - Queen West life
    const ux = r.int(6, w - 10), uy = r.int(6, d - 8); img.circle(ux, uy, 3, r.pick(['R', 'y', 'F'])); img.set(ux, uy, 'W');
  }
  return img;
}

/** 3/4 building image: roof (depth d) on top, facade below. Origin = bottom-left (south-west corner on ground). */
export function obliqueBuilding({ w = 48, d = 32, floors = 2, brick = 'red', seed = 1, kind = 'shop' } = {}) {
  const r = rng(seed * 7 + 3);
  const fac = facade({ w, floors, brick, seed, kind });
  const rf = roof(w, d, r, kind);
  const img = new Img(w, d + fac.h);
  img.blit(rf, 0, 0);
  img.blit(fac, 0, d);
  img.hline(0, w - 1, d, 'K'); // roof edge shadow line
  img.vline(0, d, d + fac.h - 1, 'k');
  return { img, footprint: { w, d }, facadeH: fac.h };
}

export function buildingsPreview() {
  const list = [];
  const kinds = ['shop', 'shop', 'shop', 'house', 'rear', 'shop', 'rear', 'shop'];
  const bricks = ['red', 'buff', 'teal', 'darkred', 'red', 'lilac', 'buff', 'grey'];
  for (let i = 0; i < 8; i++) {
    const b = obliqueBuilding({ w: 48, d: 28, floors: i % 3 === 0 ? 1 : 2, brick: bricks[i], seed: 100 + i, kind: kinds[i] });
    const frame = new Img(52, 112); frame.blit(b.img, 2, 112 - b.img.h - 2); list.push(frame);
  }
  return { frames: list, cols: 8 };
}
