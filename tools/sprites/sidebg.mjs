// Side-view mission background layers (parallax). Reuses the facade generator from buildings.mjs.
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { facade } from './buildings.mjs';

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
  const body = kind === 'dusk' ? 'v' : 'h', edge = kind === 'dusk' ? 'V' : 'H', win = kind === 'dusk' ? 'd' : 'C', dark = kind === 'dusk' ? 'u' : 'G';
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
  // CN Tower: tapering shaft, main pod with ring, SkyPod, antenna
  const cx = 340, base = H;
  for (let y = 0; y < 120; y++) {
    const half = Math.round(4 - y / 40);
    img.hline(cx - half, cx + half, base - y, body);
    img.set(cx - half, base - y, edge);
  }
  img.rect(cx - 7, base - 128, 15, 4, edge); // ring deck
  img.ellipse(cx, base - 122, 9, 4, body);
  img.rect(cx - 6, base - 124, 13, 2, win);
  img.ellipse(cx, base - 117, 6, 2, dark);
  img.rect(cx - 1, base - 150, 3, 22, body);
  img.ellipse(cx, base - 150, 3, 2, edge); // SkyPod
  img.vline(cx, base - 169, base - 152, edge);
  img.set(cx, base - 169, 'R');
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
  const W = 64, H = 64;
  const img = new Img(W, H);
  const r = rng(protectedLane ? 9 : 8);
  img.rect(0, 0, W, 12, 't'); // sidewalk
  for (let x = 0; x < W; x += 16) img.vline(x, 0, 11, 'S');
  for (let i = 0; i < 30; i++) img.set(r.int(0, W - 1), r.int(0, 11), r.pick(['S', 'T']));
  img.hline(0, W - 1, 12, 'T'); img.rect(0, 13, W, 2, 'S'); img.hline(0, W - 1, 15, 'g'); // curb face
  img.rect(0, 16, W, H - 16, 'A'); // road
  for (let i = 0; i < 90; i++) img.set(r.int(0, W - 1), r.int(16, H - 1), r.pick(['a', 's', 'a']));
  if (protectedLane) {
    img.rect(0, 16, W, 12, 'E');
    for (let i = 0; i < 20; i++) img.set(r.int(0, W - 1), r.int(16, 27), 'l');
    img.rect(0, 28, W, 3, 'T'); img.hline(0, W - 1, 31, 'S');
  } else {
    img.hline(0, W - 1, 28, 'W'); img.hline(0, W - 1, 29, 'H');
  }
  for (let x = 0; x < W; x += 32) img.rect(x + 4, 50, 18, 2, 'H'); // lane dashes
  return img;
}

export function sideBgPreview() {
  const dusk = new Img(VW, VH); dusk.blit(sky('dusk'), 0, 0); dusk.blit(skyline('dusk'), -150, 30); dusk.blit(backRow('dusk'), 0, 90); dusk.blit(facadeStrip(), 0, 72 + 0); dusk.blit(streetStrip(), 0, 168); for (let x = 64; x < VW; x += 64) dusk.blit(streetStrip(), x, 168);
  const day = new Img(VW, VH); day.blit(sky('day'), 0, 0); day.blit(skyline('day'), -150, 30); day.blit(backRow('day'), 0, 90); day.blit(facadeStrip(), -400, 72); for (let x = 0; x < VW; x += 64) day.blit(streetStrip(true), x, 168);
  return { frames: [day, dusk], cols: 2 };
}
