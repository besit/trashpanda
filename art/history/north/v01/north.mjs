// M4: the North district (Don Mills + Eglinton). The Ontario Science Centre (Raymond Moriyama, 1969): a long
// brutalist entrance pavilion of ribbed concrete on Don Mills, with the exhibit pods stepping down the ravine
// behind it under glass bridges. Flemingdon Park's concrete apartment slabs with their balconies. The plywood
// boards + CLOSED sign that mission 6 removes. A side-view strip of the pavilion for the mission.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { drawText } from './font.mjs';

/** ribbed (fluted) concrete: vertical ribs every 3 px, lit from the left */
function ribbed(img, x, y, w, h) {
  img.rect(x, y, w, h, 'S');
  for (let xx = x; xx < x + w; xx += 3) { img.vline(xx, y, y + h - 1, 'T'); img.vline(xx + 2, y, y + h - 1, 's'); }
}

/**
 * The Science Centre for the map: footprint w x d (the pavilion on Don Mills); the roof area shows the pods
 * stepping down toward the ravine (east), joined by glass bridges.
 */
export function scienceCentreBuilding(w = 224, d = 64) {
  const fh = 46, img = new Img(w, d + fh);
  // ---- roof (top-down): the pavilion's flat concrete roof with skylight strips, then the pods to the east ----
  img.rect(0, 0, w, d, 'S'); for (let y = 0; y < d; y += 5) img.hline(0, w - 1, y, 's');
  for (let x = 12; x < w * 0.55; x += 22) { img.rect(x, 8, 12, d - 16, 'g'); img.rect(x + 1, 9, 10, d - 18, 'c'); img.rect(x + 1, 9, 10, 2, 'C'); } // skylights
  for (const [x, y] of [[6, 6], [6, d - 12], [w * 0.5, 6]]) { img.rect(Math.round(x), y, 8, 6, 'h'); img.hline(Math.round(x), Math.round(x) + 7, y, 'H'); }
  // the pods: two lower concrete blocks (darker = lower) with a glass bridge between, the lowest at the far east
  const px = Math.round(w * 0.6);
  img.rect(px, 4, Math.round(w * 0.18), d - 8, 's'); img.rect(px + 2, 6, Math.round(w * 0.18) - 4, d - 12, 'S'); ribbed(img, px + 4, 10, 6, d - 20);
  img.rect(px + Math.round(w * 0.18), d / 2 - 4, 10, 8, 'u'); for (let x = px + Math.round(w * 0.18); x < px + Math.round(w * 0.18) + 10; x += 2) img.vline(x, d / 2 - 4, d / 2 + 3, 'C'); // glass bridge
  const qx = px + Math.round(w * 0.18) + 10;
  img.rect(qx, 10, w - qx, d - 20, 'g'); img.rect(qx + 2, 12, w - qx - 4, d - 24, 's'); img.rect(qx + 4, 14, 6, d - 28, 'h');
  img.rect(0, d - 2, w, 2, 'g');
  // ---- facade (south): the entrance pavilion ----
  const y0 = d;
  ribbed(img, 0, y0, w, fh);
  img.rect(0, y0, w, 3, 'T'); img.hline(0, w - 1, y0 + 3, 'g');                      // the parapet
  for (let x = 6; x < w - 6; x += 14) img.rect(x, y0 + 14, 3, 18, 'u');               // slit windows
  // the entrance: a long canopy, glass doors, lettering above
  const ex = Math.round(w * 0.12), ew = Math.round(w * 0.36);
  img.rect(ex - 4, y0 + 22, ew + 8, 3, 'H'); img.hline(ex - 4, ex + ew + 3, y0 + 25, 'g');
  img.rect(ex, y0 + 26, ew, fh - 26, 'k'); for (let x = ex + 2; x < ex + ew; x += 6) img.rect(x, y0 + 27, 4, fh - 28, 'U');
  for (let x = ex + 8; x < ex + ew - 8; x += 12) img.rect(x, y0 + 28, 2, fh - 29, 'K');
  drawText(img, 'ONTARIO SCIENCE CENTRE', ex + ew / 2, y0 + 8, 'W');
  // the glass bridge leaving the pavilion's east end for the pods
  img.rect(w - 30, y0 + 10, 30, 14, 'u'); for (let x = w - 30; x < w; x += 3) img.vline(x, y0 + 10, y0 + 23, 'C'); img.hline(w - 30, w - 1, y0 + 10, 'H');
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: fh };
}

/** a Flemingdon Park apartment slab: concrete frame, a dark window band and a balcony on every floor */
export function slabFacade({ w = 80, floors = 12, seed = 1 } = {}) {
  const r = rng(seed);
  const floorH = 8, baseH = 12, h = floors * floorH + baseH + 2;
  const img = new Img(w, h);
  img.rect(0, 0, w, h, 'S'); img.rect(0, 0, w, 2, 'T');
  const bays = Math.max(2, Math.floor(w / 16));
  for (let f = 0; f < floors; f++) {
    const y = 2 + f * floorH;
    for (let b = 0; b < bays; b++) {
      const x = Math.round((b * w) / bays) + 2, bw = Math.round(w / bays) - 4;
      const lit = r.chance(0.3);
      img.rect(x, y + 1, bw, 4, lit ? 'D' : 'u');                                   // the window band
      if (b % 2 === (f % 2)) { img.rect(x, y + 5, bw, 2, 'H'); img.hline(x, x + bw - 1, y + 4, 'h'); if (r.chance(0.3)) img.rect(x + 2, y + 3, 2, 2, r.pick(['R', 'L', 'y'])); } // balcony slab + railing, a chair
      else img.rect(x, y + 5, bw, 2, 's');
    }
  }
  const ly = 2 + floors * floorH;
  img.rect(0, ly, w, baseH, 's'); img.rect(Math.round(w / 2) - 7, ly + 3, 14, baseH - 3, 'k'); img.rect(Math.round(w / 2) - 5, ly + 4, 10, baseH - 4, 'U');
  for (let x = 4; x < w - 8; x += 10) if (Math.abs(x - w / 2) > 12) img.rect(x, ly + 3, 6, 5, 'u');
  return img;
}
export function slabRoof(w, d) {
  const img = new Img(w, d);
  img.rect(0, 0, w, d, 'h'); for (let y = 0; y < d; y += 4) img.hline(0, w - 1, y, 'G');
  img.rect(Math.round(w / 2) - 8, Math.round(d / 2) - 5, 16, 10, 'S'); img.rect(Math.round(w / 2) - 8, Math.round(d / 2) - 5, 16, 2, 'T'); // penthouse
  img.rect(0, d - 2, w, 2, 'g');
  return img;
}

/** plywood boards over the entrance (the closed Science Centre); removed when it reopens */
export function plywood() {
  const img = new Img(26, 22);
  img.rect(0, 0, 26, 22, 'X'); for (let y = 0; y < 22; y += 5) img.hline(0, 25, y, 'x'); img.rect(1, 1, 24, 1, 'j');
  for (const [x, y] of [[2, 2], [22, 2], [2, 18], [22, 18]]) img.set(x, y, 'g');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
export function closedSign() {
  const img = new Img(44, 16);
  img.rect(0, 0, 44, 12, 'R'); img.rect(1, 1, 42, 10, 'r'); img.rect(20, 12, 4, 4, 'g');
  drawText(img, 'CLOSED', 22, 3, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
export function openBanner() {
  const img = new Img(60, 18);
  img.rect(0, 0, 60, 12, 'L'); img.rect(1, 1, 58, 10, 'l'); img.rect(2, 12, 2, 6, 'g'); img.rect(56, 12, 2, 6, 'g');
  drawText(img, 'OPEN!', 30, 3, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}

/** side-view strip for mission 6: the pavilion's ribbed concrete, slit windows and lettering, ravine trees behind */
export function scienceStrip(W = 768) {
  const H = 140, img = new Img(W, H), r = rng(1969);
  // a dark ravine canopy behind the building
  for (let x = -20; x < W + 20; x += 11) { const cx = x + r.int(-3, 3), cy = 60 + r.int(-8, 8); img.ellipse(cx, cy, r.int(10, 16), r.int(9, 13), 'e'); img.ellipse(cx - 3, cy - 3, r.int(6, 9), r.int(5, 7), 'E'); }
  // the pavilion: a long ribbed box with a parapet, slits, the lettering, the glass entrance; a gap of trees every 384 px
  for (let seg = 0; seg < W; seg += 384) {
    const bx = seg + 40, bw = 300, by = 54;
    ribbed(img, bx, by, bw, H - by);
    img.rect(bx, by, bw, 3, 'T'); img.hline(bx, bx + bw - 1, by + 3, 'g');
    for (let x = bx + 8; x < bx + bw - 8; x += 14) img.rect(x, by + 18, 3, 26, 'u');
    drawText(img, 'ONTARIO SCIENCE CENTRE', bx + bw / 2, by + 8, 'W');
    const ex = bx + 60, ew = 120;
    img.rect(ex - 6, by + 50, ew + 12, 4, 'H'); img.hline(ex - 6, ex + ew + 5, by + 54, 'g');
    img.rect(ex, by + 55, ew, H - by - 55, 'k'); for (let x = ex + 2; x < ex + ew; x += 7) img.rect(x, by + 56, 5, H - by - 57, 'U');
    // the glass bridge off the east end, sloping down into the trees
    for (let i = 0; i < 40; i++) { const x = bx + bw + i, y = by + 16 + Math.round(i * 0.6); img.rect(x, y, 1, 12, i % 3 ? 'u' : 'C'); img.set(x, y, 'H'); }
  }
  // the sidewalk line at the bottom
  img.rect(0, H - 2, W, 2, 'T');
  return img;
}

export function northPreview() {
  return { frames: [scienceCentreBuilding().img, slabFacade(), slabRoof(80, 40), plywood(), closedSign(), openBanner(), scienceStrip().crop(0, 0, 400, 140)], cols: 3 };
}
