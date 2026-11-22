// M4.12 (Ivan: "for the sunset version I would change the bg to Toronto skyline"): the skyline seen from the lake,
// backlit by the setting sun, drawn at the posters' grid (1 px = 1 poster px). West to east: the CityPlace condos,
// the Rogers Centre dome at the CN Tower's foot, the CN Tower, then the financial district (First Canadian Place,
// Scotia Plaza's stepped top, the black TD towers, Royal Bank Plaza's gold, condo towers with crowns).
// Two layers: far towers in dusty pink, the near skyline in dark purple with lit windows and a warm rim where it
// faces the sun. Heights follow the real ones relative to the CN Tower (553 m), squeezed together sideways.
import { Img } from '../lib/raster.mjs';
import { cnTower } from './landmarks.mjs';

const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/**
 * @param W image width (the poster's width)
 * @param cnX the CN Tower's x
 * @param cnH the CN Tower's height in px (the image is cnH + 2 tall; its bottom row is the waterline)
 * @param sunX where the sun is (rim light goes on the sides facing it)
 */
export function torontoSunset(W, cnX, cnH, sunX = W / 2, seed = 7) {
  const H = cnH + 2, base = H - 1, k = cnH / 553; // px per metre
  const far = new Img(W, H), near = new Img(W, H);
  const r = rng(seed);
  const BODY = 'v', FAR = 'p', LIT = ['d', 'd', 'O', 'Y'];
  // ---- the far layer: a low, dense band of towers across the whole width ----
  for (let x = -10; x < W;) {
    const w = 8 + Math.floor(r() * 14), h = Math.round((50 + r() * 110) * k);
    far.rect(x, base - h, w, h + 1, FAR);
    if (r() < 0.3) far.rect(x + Math.floor(w / 2) - 1, base - h - Math.round(12 * k), 2, Math.round(12 * k), FAR);
    x += w + Math.floor(r() * 4) - 1;
  }
  // ---- the near layer ----
  /** a tower: box with an optional top ('flat', 'step', 'chevron', 'crown', 'slant', 'mast') and lit windows */
  const tower = (cx, wM, hM, top = 'flat', windows = 0.22) => {
    const w = Math.max(4, Math.round(wM * k)), h = Math.round(hM * k), x0 = Math.round(cx - w / 2), y0 = base - h;
    near.rect(x0, y0, w, h + 1, BODY);
    near.vline(x0, y0 + 1, base, 'u'); // a dark edge, so towers in a clump stay apart
    if (top === 'step') { near.rect(x0 + 2, y0 - 3, w - 4, 3, BODY); near.rect(x0 + 4, y0 - 6, w - 8, 3, BODY); }
    if (top === 'chevron') for (let i = 0; i < Math.ceil(w / 2); i++) { near.vline(x0 + i, y0 - Math.min(i, 6), y0, BODY); near.vline(x0 + w - 1 - i, y0 - Math.min(i, 6), y0, BODY); }
    if (top === 'crown') { near.rect(x0 + 1, y0 - 4, w - 2, 4, BODY); for (let i = x0 + 1; i < x0 + w - 1; i += 2) near.vline(i, y0 - 7, y0 - 4, BODY); }
    if (top === 'slant') near.poly([[x0, y0], [x0 + w, y0 - Math.round(w * 0.5)], [x0 + w, y0]], BODY);
    if (top === 'mast') near.rect(Math.round(cx), y0 - Math.round(30 * k), 1, Math.round(30 * k), BODY);
    for (let y = y0 + 3; y < base - 2; y += 3) for (let x = x0 + 1; x < x0 + w - 1; x += 2) if (r() < windows) near.set(x, y, LIT[Math.floor(r() * LIT.length)]);
  };
  // stylised: towers drawn wider than life (a skyline of real proportions is a row of needles at this size)
  const WS = 1.7;
  // west of the tower: the waterfront condo wall (CityPlace, Liberty Village), lower and lower toward the west edge
  for (let i = 0, x = cnX - 230 * k; x > -40; i++) {
    const fall = Math.max(0.35, 1 - (cnX - x) / (W * 1.1));
    tower(x, (30 + r() * 18) * WS, (70 + r() * 120) * fall + 30, ['flat', 'slant', 'flat', 'step'][i % 4], 0.3);
    x -= (40 + r() * 34) * k * WS * (r() < 0.25 ? 1.8 : 1);
  }
  // the Rogers Centre: the big low dome at the tower's west foot (86 m tall, 210 m across), its ribs lit
  {
    const cx = cnX - Math.round(120 * k), rw = Math.round(110 * k), wall = Math.round(34 * k), rh = Math.round(86 * k);
    near.rect(cx - rw, base - wall, rw * 2, wall + 1, BODY);
    near.ellipse(cx, base - wall, rw - 1, rh - wall, BODY, true);
    for (let i = -3; i <= 3; i++) if (i) near.line(cx + i * Math.round(rw / 4), base - wall, cx + i * 2, base - rh + 2, 'V');
    for (let x = cx - rw + 2; x < cx + rw - 2; x += 3) near.set(x, base - Math.round(wall / 2), 'd');
  }
  // the financial district, a dense clump east of the tower (real heights: First Canadian Place 298 m with its mast,
  // Scotia Plaza 275 with its chevron top, Commerce Court West 239, TD 223, Bay Adelaide 218, Aura 272 with a crown,
  // the Royal Bank Plaza 180 slanted)
  const fd = cnX + Math.round(140 * k);
  const D = [[0, 40, 150, 'flat'], [45, 46, 223, 'flat'], [85, 44, 239, 'flat'], [130, 52, 298, 'mast'], [175, 42, 275, 'chevron'],
    [215, 38, 218, 'step'], [250, 34, 180, 'slant'], [290, 36, 272, 'crown'], [330, 40, 200, 'flat'], [375, 34, 150, 'slant'], [415, 40, 230, 'crown'], [460, 36, 140, 'flat'], [505, 46, 190, 'step']];
  for (const [dx, w, h, top] of D) { const x = fd + dx * k * WS; if (x < W + 30) tower(x, w * WS, h, top); }
  // and on past the cluster: lower condos to the east edge
  for (let x = fd + 560 * k * WS; x < W + 30; x += (40 + r() * 30) * k * WS) tower(x, (30 + r() * 14) * WS, 80 + r() * 90, r() < 0.3 ? 'slant' : 'flat', 0.3);
  // the CN Tower last (in front), with its pod's window band lit
  cnTower(near, cnX, base + 1, cnH, { shaft: BODY, shaftHi: BODY, shaftLo: BODY, under: BODY, glass: 'd', rim: BODY, pod: BODY, podLo: BODY, antenna: BODY, band: 'R', tip: 'R', donut: BODY, donutLo: BODY, deck: BODY, rib: BODY, red: 'O' });
  // the warm rim: near-layer edges that face the sun catch its light
  const rim = near.clone();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (near.get(x, y) !== BODY && near.get(x, y) !== 'u') continue;
    const dx = sunX > x ? 1 : -1, open = (c) => c === null;
    if (x + dx < 0 || x + dx >= W) continue;
    if (open(near.get(x + dx, y)) || open(near.get(x, y - 1))) rim.set(x, y, y < base - 4 ? 'P' : near.get(x, y));
  }
  const out = new Img(W, H); out.blit(far, 0, 0); out.blit(rim, 0, 0);
  return out;
}

export function torontoSunsetPreview() { return { frames: [torontoSunset(768, 560, 104)], cols: 1 }; }
export function torontoSunsetPreviewTall() { return { frames: [torontoSunset(432, 270, 210)], cols: 1 }; }
