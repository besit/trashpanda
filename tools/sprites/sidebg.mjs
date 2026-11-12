// Side-view mission background layers (parallax). Reuses the facade generator from buildings.mjs.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { facade } from './buildings.mjs';
import { towerFacade, warehouseFacade } from './downtown.mjs';
import { schoolFacade } from './highpark.mjs';
import { cnTower, CN_PAL } from './landmarks.mjs';

export const VW = 384, VH = 216;

const SKIES = {
  day: ['U', 'c', 'c', 'C', 'C', 'i', 'i'],
  dusk: ['u', 'v', 'V', 'P', 'z', 'd', 'D'],
};
export function sky(kind = 'day') {
  const bands = SKIES[kind];
  const img = new Img(VW, VH);
  const bh = VH / bands.length;
  for (let y = 0; y < VH; y++) {
    const f = y / bh, i = Math.min(bands.length - 1, Math.floor(f)), frac = f - i;
    for (let x = 0; x < VW; x++) {
      let c = bands[i];
      // ordered dither into the next band in the lower part of each band
      if (i < bands.length - 1 && frac > 0.7 && ((x + y) % 2 === 0 || (frac > 0.85 && (x % 2 === 0)))) c = bands[i + 1];
      img.set(x, y, c);
    }
  }
  if (kind === 'dusk') { // low sun
    img.circle(300, 168, 16, 'D'); img.circle(300, 168, 12, 'Y');
  } else { // puffy clouds
    const r = rng(5);
    for (let k = 0; k < 6; k++) { const cx = r.int(10, VW - 40), cy = r.int(20, 90); for (let j = 0; j < 4; j++) img.ellipse(cx + j * 7, cy - (j % 2) * 3, 8, 4, 'W'); img.ellipse(cx + 10, cy + 3, 16, 2, 'i'); }
  }
  return img;
}

/** City skyline silhouette with CN Tower + domed stadium. Width 768, height 170. */
export function skyline(kind = 'day') {
  const W = 768, H = 170;
  const img = new Img(W, H);
  const body = kind === 'dusk' ? 'v' : 'h', edge = kind === 'dusk' ? 'V' : 'H', win = kind === 'dusk' ? 'd' : 'G', dark = kind === 'dusk' ? 'u' : 'G'; // day windows darker than the sky, never sky-blue "holes"
  const r = rng(77);
  // generic towers
  let x = 0;
  while (x < W) {
    const w = r.int(14, 34), h = r.int(40, 120);
    if (x > 300 && x < 380) { x += w; continue; } // keep space around CN tower
    img.rect(x, H - h, w, h, body);
    img.vline(x, H - h, H - 1, edge);
    for (let wy = H - h + 4; wy < H - 4; wy += 5) for (let wx = x + 3; wx < x + w - 2; wx += 4) if (r.chance(kind === 'dusk' ? 0.35 : 0.5)) img.set(wx, wy, win);
    if (r.chance(0.3)) img.rect(x + Math.floor(w / 2) - 1, H - h - 6, 2, 6, body);
    x += w + r.int(0, 6);
  }
  // domed stadium
  const sx = 400, sw = 70;
  img.rect(sx, H - 22, sw, 22, dark);
  for (let i = 0; i < 4; i++) img.ellipse(sx + sw / 2, H - 22, sw / 2 - i * 2, 14 - i * 3, i % 2 ? body : edge, true);
  for (let i = sx + 4; i < sx + sw - 4; i += 9) img.line(i, H - 22, sx + sw / 2, H - 36, dark);
  // CN Tower (profile matched to the reference photo)
  cnTower(img, 340, H, 169, kind === 'dusk' ? CN_PAL.dusk : CN_PAL.day);
  return img;
}

/** Row of Queen West facades, bottom-aligned. */
export function facadeStrip(seed = 11, W = 1536) {
  const H = 96;
  const img = new Img(W, H);
  const r = rng(seed);
  const bricks = ['red', 'buff', 'teal', 'darkred', 'red', 'lilac', 'buff', 'grey', 'mustard', 'cream', 'red'];
  let x = 0, i = 0;
  while (x < W) {
    const w = r.pick([32, 40, 48, 48, 56, 64]);
    const f = facade({ w, floors: r.pick([1, 2, 2, 2, 3]), brick: r.pick(bricks), seed: seed * 100 + i, kind: r.chance(0.85) ? 'shop' : 'house' });
    img.blit(f, x, H - f.h);
    img.vline(x, H - f.h, H - 1, 'k');
    x += w; i++;
  }
  return img;
}

/** Darker, smaller back row for depth (parallax). */
export function backRow(kind = 'day', W = 768) {
  const H = 80;
  const img = new Img(W, H);
  const r = rng(31);
  const body = kind === 'dusk' ? 'v' : 'S', roof = kind === 'dusk' ? 'u' : 'G', win = kind === 'dusk' ? 'd' : 'h';
  let x = 0;
  while (x < W) {
    const w = r.int(20, 44), h = r.int(30, 70);
    img.rect(x, H - h, w, h, body);
    if (r.chance(0.5)) img.poly([[x, H - h], [x + w / 2, H - h - 10], [x + w, H - h]], roof);
    else img.hline(x, x + w - 1, H - h, roof);
    for (let wy = H - h + 5; wy < H - 6; wy += 9) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (r.chance(0.6)) img.rect(wx, wy, 3, 4, win);
    x += w;
  }
  return img;
}

/** Tileable street strip: sidewalk, curb, bike lane, road. 64 x 64 */
export function streetStrip(protectedLane = false) {
  const W = 64, H = 70; // M2.1: 70 tall so the road reaches the bottom after the side view moved up
  const img = new Img(W, H);
  const r = rng(protectedLane === true ? 9 : 8);
  img.rect(0, 0, W, 12, 't'); // sidewalk
  for (let x = 0; x < W; x += 16) img.vline(x, 0, 11, 'S');
  for (let i = 0; i < 30; i++) img.set(r.int(0, W - 1), r.int(0, 11), r.pick(['S', 'T']));
  img.hline(0, W - 1, 12, 'T'); img.rect(0, 13, W, 2, 'S'); img.hline(0, W - 1, 15, 'g'); // curb face
  img.rect(0, 16, W, H - 16, 'A'); // road
  for (let i = 0; i < 90; i++) img.set(r.int(0, W - 1), r.int(16, H - 1), r.pick(['a', 's', 'a']));
  if (protectedLane === true) {
    img.rect(0, 16, W, 12, 'E');
    for (let i = 0; i < 20; i++) img.set(r.int(0, W - 1), r.int(16, 27), 'l');
    img.rect(0, 28, W, 3, 'T'); img.hline(0, W - 1, 31, 'S');
    for (const y of [40, 48]) { img.hline(0, W - 1, y, 'h'); img.hline(0, W - 1, y + 1, 'g'); } // Queen's streetcar tracks
  } else if (protectedLane === 'escort') {
    // mission 2 (side view): the streetcar's tracks in the far lane, the raccoon rides the near lane
    for (let x = 0; x < W; x += 16) img.rect(x + 2, 17, 1, 3, 'H');
    for (const y of [24, 31]) { img.hline(0, W - 1, y, 'h'); img.hline(0, W - 1, y + 1, 'g'); }
    img.hline(0, W - 1, 37, 'y'); img.hline(0, W - 1, 39, 'y');
  } else if (protectedLane === 'king') {
    // King St: tracks in the far lane with red transit paint
    img.rect(0, 20, W, 14, 'r'); for (let i = 0; i < 24; i++) img.set(r.int(0, W - 1), r.int(20, 33), r.pick(['R', 'b']));
    for (const y of [24, 30]) { img.hline(0, W - 1, y, 'h'); img.hline(0, W - 1, y + 1, 'g'); }
  } else if (protectedLane === 'lot') {
    // MEGAMART's parking lot: no curb lane, painted stalls + wheel stops
    img.rect(0, 12, W, 4, 'S');
    for (let x = 0; x < W; x += 32) { img.vline(x, 18, 40, 'W'); img.vline(x + 1, 18, 40, 'H'); img.rect(x + 10, 42, 12, 3, 'T'); }
  } else if (protectedLane === 'parkside') {
    // Parkside Dr: two plain lanes, a SLOW stencil, no tracks
    img.hline(0, W - 1, 36, 'y'); img.hline(0, W - 1, 38, 'y');
  } else if (protectedLane === 'plain') {
    // Queen as it is: curb lane (parking) + streetcar rails, no bike lane
    for (let x = 0; x < W; x += 16) img.rect(x + 2, 17, 1, 3, 'H');
    for (const y of [36, 44]) { img.hline(0, W - 1, y, 'h'); img.hline(0, W - 1, y + 1, 'g'); }
  } else {
    img.hline(0, W - 1, 28, 'W'); img.hline(0, W - 1, 29, 'H');
  }
  for (let x = 0; x < W; x += 32) img.rect(x + 4, 60, 18, 2, 'H'); // lane dashes (near lane)
  return img;
}

/** King St W: King West brick warehouses mixed with glass tower bases. Tall strip (140px). */
export function facadeStripDT(seed = 21, W = 1536) {
  const H = 140, img = new Img(W, H), r = rng(seed);
  let x = 0, i = 0;
  while (x < W) {
    const tower = r.chance(0.4);
    const w = tower ? r.pick([48, 64, 80]) : r.pick([48, 56, 64]);
    const f = tower ? towerFacade({ w, floors: r.int(12, 16), glass: r.pick(['blue', 'teal', 'dark', 'sky']), seed: seed * 100 + i }) : warehouseFacade({ w, floors: r.int(3, 5), brick: r.pick(['red', 'buff', 'darkred', 'red']), seed: seed * 100 + i });
    img.blit(f, x, H - f.h);
    img.vline(x, Math.max(0, H - f.h), H - 1, 'k');
    x += w; i++;
  }
  return img;
}

/** High Park from Parkside Drive: rolling hill, black oaks, cherry trees, a school at one end. 120px tall, tileable. */
export function parkStripHP(W = 768) {
  const H = 120, img = new Img(W, H), r = rng(1873);
  // hill line
  const hill = (x) => H - 34 - Math.round(Math.sin((x / W) * Math.PI * 4) * 8 + Math.sin((x / W) * Math.PI * 10) * 3);
  for (let x = 0; x < W; x++) { const hy = hill(x); for (let y = hy; y < H; y++) img.set(x, y, y < hy + 2 ? 'l' : (x + y) % 9 === 0 ? 'l' : y > H - 10 ? 'e' : 'E'); }
  // back tree line (silhouette, darker)
  for (let x = -20; x < W + 20; x += 9) { const cx = x + r.int(-3, 3), cy = hill(Math.max(0, Math.min(W - 1, x))) - r.int(10, 22); img.ellipse(cx, cy, r.int(8, 13), r.int(7, 11), 'e'); }
  // trees, wrapped so the strip tiles
  const crown = (cx, cy, rad, ramp) => {
    for (const dx of [-W, 0, W]) {
      img.ellipse(cx + dx, cy + 1, rad + 1, rad * 0.85 + 1, 'K');
      img.ellipse(cx + dx, cy, rad, rad * 0.85, ramp[1]);
      img.ellipse(cx + dx - rad * 0.3, cy - rad * 0.3, rad * 0.55, rad * 0.45, ramp[2]);
      img.ellipse(cx + dx + rad * 0.35, cy + rad * 0.25, rad * 0.4, rad * 0.3, ramp[0]);
    }
  };
  for (let k = 0; k < 16; k++) {
    const cx = Math.round((k + 0.5) * (W / 16) + r.int(-10, 10)), base = hill(Math.max(0, Math.min(W - 1, cx))) + 2;
    const cherry = k % 4 === 1, rad = cherry ? r.int(9, 12) : r.int(13, 19);
    for (const dx of [-W, 0, W]) { img.rect(cx + dx - 1, base - rad - 6, 3, rad + 6, 'w'); img.vline(cx + dx - 1, base - rad - 6, base, 'x'); }
    crown(cx, base - rad - 10, rad, cherry ? ['p', 'P', 'm'] : ['e', 'E', 'l']);
  }
  // a park path + bench
  for (let x = 0; x < W; x++) img.set(x, H - 6, 'j'), img.set(x, H - 5, 'X');
  return img;
}

/** A school facade for the side view (Parkside school zone). */
export function schoolSide() { return schoolFacade({ w: 128, floors: 2, seed: 7 }); }

export function sideBgPreview() {
  const dusk = new Img(VW, VH); dusk.blit(sky('dusk'), 0, 0); dusk.blit(skyline('dusk'), -150, 30); dusk.blit(backRow('dusk'), 0, 90); dusk.blit(facadeStrip(), 0, 72 + 0); dusk.blit(streetStrip(), 0, 168); for (let x = 64; x < VW; x += 64) dusk.blit(streetStrip(), x, 168);
  const day = new Img(VW, VH); day.blit(sky('day'), 0, 0); day.blit(skyline('day'), -150, 30); day.blit(backRow('day'), 0, 90); day.blit(facadeStrip(), -400, 72); for (let x = 0; x < VW; x += 64) day.blit(streetStrip(true), x, 168);
  return { frames: [day, dusk], cols: 2 };
}

export function sideBgM2Preview() {
  const king = new Img(VW, VH); king.blit(sky('day'), 0, 0); king.blit(skyline('day'), -150, 30); king.blit(facadeStripDT(), -200, 28); for (let x = 0; x < VW; x += 64) king.blit(streetStrip('king'), x, 168);
  const park = new Img(VW, VH); park.blit(sky('day'), 0, 0); park.blit(skyline('day'), -150, 30); park.blit(parkStripHP(), 0, 48); park.blit(schoolSide(), 220, 168 - schoolSide().h); for (let x = 0; x < VW; x += 64) park.blit(streetStrip('parkside'), x, 168);
  const esc = new Img(VW, VH); esc.blit(sky('day'), 0, 0); esc.blit(skyline('day'), -150, 30); esc.blit(backRow('day'), 0, 96); esc.blit(facadeStrip(), -300, 72); for (let x = 0; x < VW; x += 64) esc.blit(streetStrip('escort'), x, 168);
  return { frames: [king, park, esc], cols: 3 };
}
