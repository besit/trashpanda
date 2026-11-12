// Waterfront art, M3.1 pass (Ivan's M3 review: "I want this to be recognizable"):
// - the CN Tower as a 3/4 base (three tapering concrete legs + the entrance pavilion) with the shaft
//   rising off the top of the map; it's a building, so you can ride behind it and it fades
// - the Rogers Centre (SkyDome) west of the tower: a ribbed white roof in sliding panels on a concrete ring
// - Ripley's Aquarium south-east of the tower (wave roof), the Sundial Folly in Harbour Square Park,
//   the Jack Layton Ferry Terminal + an island ferry, marina docks
// - Ontario Place from Ivan's photos: the pods (glass boxes on stilts under cable masts) and the
//   Cinesphere (a triangulated geodesic sphere standing in the water)
// - the Gardiner as a deck (cars drive on it) with piers placed separately (never on a street below)
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { scene, render, obliqueCam, sd } from '../lib/sdf.mjs';
import { drawText } from './font.mjs';

const mat = (ramp, extra = {}) => ({ ramp, ...extra });
const CONC = ['g', 'G', 'h', 'H'];

/** a tapered blade between a and b (radius ra -> rb), flattened across its run (CN Tower legs) */
const blade = (a, b, ra, rb, flat = 0.55) => {
  const dir = [b[0] - a[0], b[1] - a[1]]; const L = Math.hypot(...dir) || 1;
  const nx = -dir[1] / L, ny = dir[0] / L; // horizontal normal to the leg
  const cap = sd.capsule(a, b, ra, rb);
  return (p) => {
    // squash across the leg: scale the normal component up so the cross-section is a blade
    const rel = [p[0] - a[0], p[1] - a[1]];
    const across = rel[0] * nx + rel[1] * ny;
    const q = [p[0] + nx * across * (1 / flat - 1), p[1] + ny * across * (1 / flat - 1), p[2]];
    return cap(q) * flat;
  };
};

/**
 * The CN Tower for the map, as a building image: base + shaft. footprint w x d (px) is the ground under
 * the legs; the shaft is tall enough to leave the top of the map from where it stands.
 */
export function cnTowerBuilding(w = 96, d = 48, shaftH = 300) {
  const Hb = 112, gy = Hb - 26; // ground centre row in the base render
  const legs = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 - (2 * Math.PI) / 3];
  const flute = (p) => (Math.abs(((Math.atan2(p[1], p[0]) * 6 / Math.PI) % 1 + 1) % 1 - 0.5) < 0.08 ? 'g' : null);
  const objs = [
    // the shaft's foot (the raster shaft continues it above z = 50)
    { d: sd.capsule([0, 0, -2], [0, 0, 70], 11, 8.6), m: mat(CONC, { fn: flute }) },
    // three legs: wide on the ground, merging into the shaft
    ...legs.map((a) => ({ d: blade([Math.cos(a) * 36, Math.sin(a) * 22, 1], [Math.cos(a) * 6, Math.sin(a) * 4, 58], 10, 5, 0.7), m: mat(CONC, { fn: (p) => (p[2] < 2.2 ? 'G' : null) }) })),
    // the glass entrance pavilion wrapped around the base
    { d: sd.box([0, 6, 4], [22, 10, 4], 1.5), m: mat(['u', 'U', 'c', 'C'], { fn: (p) => (p[2] > 7.2 ? 'h' : Math.abs(((p[0] % 5) + 5) % 5) < 0.6 ? 'H' : null) }) },
  ];
  const base = render(scene(objs), { w, h: Hb, cx: w / 2, cy: gy, cam: obliqueCam(), ambient: 0.22 });
  const top = shaftH;
  const img = new Img(w, top + Hb);
  // the shaft (raster): tapering, lit from the left, the elevator glass strip, joints every 24 px
  const cx = w / 2, shaftBottom = top + gy - 62;
  for (let y = 0; y <= shaftBottom; y++) {
    const t = y / shaftBottom, half = Math.round(7 + t * 2.6);
    for (let x = -half; x <= half; x++) {
      const k = (x + half) / (2 * half);
      img.set(cx + x, y, k < 0.22 ? 'h' : k < 0.55 ? 'H' : k < 0.82 ? 'h' : 'G');
    }
    img.set(cx + Math.round(half * 0.45), y, 'g'); // the glass elevator strip
    if (y % 24 === 0) img.hline(cx - half, cx + half, y, 'h');
  }
  img.blit(base, 0, top);
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: img.h - d };
}

/** the Rogers Centre (SkyDome, 1989): a white roof in sliding panels over a concrete ring with arches */
export function domeBuilding(w = 208, d = 120) {
  const rx = w / 2 - 6, ry = d / 2 - 4, wallH = 20, rise = 46;
  const ell = (p, z0, h) => Math.max((Math.hypot(p[0] / rx, p[1] / ry) - 1) * Math.min(rx, ry), Math.abs(p[2] - z0 - h / 2) - h / 2);
  const wall = { d: (p) => ell(p, 0, wallH), m: mat(['G', 'h', 'H', 'H'], { fn: (p) => {
    const a = Math.atan2(p[1] / ry, p[0] / rx);
    if (p[2] > 6 && p[2] < 15 && Math.abs(((a * 18 / Math.PI) % 1 + 1) % 1 - 0.5) < 0.22) return 'g'; // arched openings
    if (p[2] > 17) return 'H';
    if (p[2] < 2) return 'G';
    return null;
  } }) };
  const roof = { d: (p) => Math.max(sd.ellipsoid([0, 0, wallH - 2], [rx - 1, ry - 1, rise])(p), wallH - 1 - p[2]), m: mat(['G', 'h', 'H', 'W', 'W'], { fn: (p) => {
    // the panel seams run across the short axis; trusses ripple each panel
    const ax = Math.abs(p[0]);
    if ([rx * 0.18, rx * 0.5, rx * 0.78].some((s) => Math.abs(ax - s) < 1.1)) return 'G';
    if (((p[0] % 7) + 7) % 7 < 1) return ['g', 'G', 'h', 'H', 'H'];
    return null;
  } }) };
  const H = d + wallH + rise + 6;
  const img = render(scene([wall, roof]), { w, h: H, cx: w / 2, cy: H - ry - 4, cam: obliqueCam(), ambient: 0.12, light: [-0.75, 0.25, 0.62] });
  return { img, footprint: { w, d }, facadeH: H - d };
}

/** Ripley's Aquarium (2013): a low grey hall under a rolling blue wave roof (3/4) */
export function aquariumBuilding(w = 144, d = 64) {
  const fh = 30, img = new Img(w, d + fh);
  // the roof: rolling waves in blues and greys
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    const v = Math.sin(x / 9 + y / 14) + Math.sin(x / 23 - y / 9) * 0.6;
    img.set(x, y, v > 0.9 ? 'C' : v > 0.2 ? 'c' : v > -0.5 ? 'U' : 'h');
  }
  img.rect(0, 0, w, 1, 'H'); img.rect(0, d - 2, w, 2, 'G');
  // the hall: grey panels, a long glass front, the entrance
  img.rect(0, d, w, fh, 'h'); for (let x = 0; x < w; x += 12) img.vline(x, d, d + fh - 1, 'G');
  img.rect(4, d + 8, w - 8, 12, 'c'); for (let x = 4; x < w - 4; x += 8) img.vline(x, d + 8, d + 19, 'C');
  img.rect(w / 2 - 12, d + 12, 24, fh - 12, 'u'); img.rect(w / 2 - 10, d + 14, 20, fh - 14, 'U'); img.vline(w / 2, d + 14, d + fh - 1, 'C');
  img.hline(0, w - 1, d, 'K');
  return { img, footprint: { w, d }, facadeH: fh };
}

/** the Jack Layton Ferry Terminal: a long low pavilion with a teal roof and FERRY over the gates */
export function ferryTerminalBuilding(w = 112, d = 40) {
  const fh = 26, img = new Img(w, d + fh);
  img.rect(0, 0, w, d, 'F'); for (let y = 2; y < d; y += 4) img.hline(0, w - 1, y, 'f');
  img.rect(0, 0, w, 2, 'Z'.length ? 'L' : 'F');
  img.rect(0, d, w, fh, 'W'); img.rect(0, d, w, 3, 'H');
  for (let x = 6; x < w - 6; x += 16) { img.rect(x, d + 12, 10, fh - 12, 'g'); img.rect(x + 1, d + 13, 8, fh - 13, 'G'); img.vline(x + 5, d + 13, d + fh - 1, 'h'); }
  img.rect(w / 2 - 20, d + 4, 40, 9, 'u'); drawText(img, 'FERRY', w / 2, d + 5, 'W');
  img.hline(0, w - 1, d, 'K');
  return { img, footprint: { w, d }, facadeH: fh };
}

/** an island ferry, docked: a white double-decker with dark windows and a blue band (faces east) */
export function ferryBoat() {
  const W = 84, H = 40, img = new Img(W, H);
  img.poly([[2, 22], [W - 4, 22], [W - 1, 28], [W - 10, 34], [8, 34], [0, 28]], 'W');
  img.rect(2, 30, W - 8, 3, 'U');
  img.rect(10, 12, W - 26, 10, 'H'); for (let x = 12; x < W - 18; x += 6) img.rect(x, 14, 4, 5, 'u');
  img.rect(16, 5, W - 40, 7, 'W'); for (let x = 18; x < W - 26; x += 6) img.rect(x, 7, 4, 3, 'u');
  img.rect(W - 30, 1, 6, 5, 'R'); img.rect(W - 29, 1, 4, 1, 'K'); // the funnel
  img.rect(4, 20, W - 10, 2, 'G');
  img.hline(0, W - 1, 36, 'C'); img.hline(4, W - 8, 37, 'i');
  img.outline('K'); img.pivot = { x: 0.5, y: 34 / H };
  return img;
}

/** the Sundial Folly (1995, John Fung + Paul Figueiredo): a concrete sphere in a square pool */
export function sundialFolly() {
  const W = 60, H = 54, img = new Img(W, H);
  img.rect(4, 32, 52, 18, 'H'); img.rect(6, 34, 48, 14, 'c'); img.dither(6, 34, 48, 14, 'C', 'checker');
  for (let x = 8; x < 54; x += 9) img.hline(x, x + 3, 40, 'i');
  // the sphere: lit top-left, a steel equator band, the slot you can look into
  for (let y = -18; y <= 18; y++) for (let x = -18; x <= 18; x++) {
    if (x * x + y * y > 18 * 18) continue;
    const l = (-x - y) / 25;
    img.set(30 + x, 22 + y, l > 0.45 ? 'W' : l > 0 ? 'H' : l > -0.45 ? 'h' : 'G');
  }
  img.hline(12, 48, 24, 'S'); img.hline(13, 47, 25, 'g');
  img.rect(28, 6, 4, 18, 'k'); img.rect(29, 7, 2, 16, 'g');
  img.line(30, 4, 40, 10, 'S'); // the gnomon
  // the cascade into the lake (front edge)
  for (let x = 24; x < 36; x += 2) img.vline(x, 48, 52, x % 4 ? 'C' : 'i');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.96 };
  return img;
}

/** an Ontario Place pod (1971, from Ivan's photos): a glass box on two piers, cable masts on its roof */
export function podOP(seed = 1) {
  const W = 72, H = 78, img = new Img(W, H), r = rng(seed);
  // piers + their reflections
  for (const x of [22, 46]) { img.rect(x, 44, 6, 28, 'H'); img.vline(x, 44, 71, 'W'); img.vline(x + 5, 44, 71, 'h'); }
  img.hline(14, 58, 72, 'C'); img.hline(18, 54, 73, 'i');
  // the box: white frame, glass grid, a dark underside
  img.rect(4, 26, W - 8, 18, 'W'); img.rect(6, 29, W - 12, 12, 'c');
  for (let x = 6; x < W - 6; x += 6) img.vline(x, 29, 40, 'C');
  img.hline(6, W - 7, 35, 'C');
  for (let i = 0; i < 5; i++) img.rect(r.int(8, W - 12), 30, 3, 4, 'U');
  img.rect(4, 44, W - 8, 3, 'G');
  // masts + cables
  for (const x of [26, 36, 46]) img.vline(x, 4, 26, 'H');
  img.rect(24, 2, 25, 2, 'h');
  for (const [x0, x1] of [[26, 6], [36, 12], [36, 60], [46, 66]]) img.line(x0, 6, x1, 26, 'h');
  // the stair tower on the east end
  img.rect(W - 8, 18, 6, 36, 'h'); for (let y = 20; y < 54; y += 4) img.line(W - 8, y, W - 3, y + 3, 'W');
  img.outline('K'); img.pivot = { x: 0.5, y: 72 / H };
  return img;
}

/** the Cinesphere (1971, the first permanent IMAX theatre): a triangulated sphere standing in the water */
export function cinesphereOP() {
  const W = 72, H = 68, img = new Img(W, H), R = 30, cx = 36, cy = 32;
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    if (x * x + y * y > R * R || cy + y > 58) continue;
    const u = x + y * 0.58, v = x - y * 0.58;
    const line = ((u % 7) + 7) % 7 < 0.9 || ((v % 7) + 7) % 7 < 0.9 || ((y % 6) + 6) % 6 < 0.8;
    const l = (-x * 0.8 - y) / (R * 1.3);
    img.set(cx + x, cy + y, line ? (l > 0 ? 'h' : 'G') : l > 0.4 ? 'W' : l > -0.1 ? 'H' : l > -0.5 ? 'h' : 'G');
  }
  img.rect(cx - 26, 57, 52, 3, 'g'); // the ring it stands on
  img.hline(cx - 30, cx + 30, 60, 'C'); img.hline(cx - 24, cx + 24, 61, 'i'); img.hline(cx - 18, cx + 18, 63, 'C');
  // the walkway bridge in from the west
  img.rect(0, 50, cx - 24, 3, 'H'); img.hline(0, cx - 25, 49, 'S');
  img.outline('K'); img.pivot = { x: 0.5, y: 60 / H };
  return img;
}

/** a 32 px slice of the Gardiner deck (no piers: they stand on the ground between the streets) */
export function gardinerDeck() {
  const W = 32, H = 46, img = new Img(W, H);
  img.rect(0, 0, W, 40, 'A');
  img.rect(0, 0, W, 3, 'H'); img.hline(0, W - 1, 3, 'G');              // north parapet
  img.hline(0, W - 1, 19, 'y'); img.hline(0, W - 1, 20, 'y');          // the centre line
  for (let x = 0; x < W; x += 16) { img.rect(x + 2, 11, 7, 1, 'W'); img.rect(x + 10, 29, 7, 1, 'W'); }
  img.rect(0, 37, W, 3, 'H');                                          // south parapet
  img.rect(0, 40, W, 6, 'h'); img.hline(0, W - 1, 45, 'G');            // the deck's fascia
  img.pivot = { x: 0, y: (H - 1) / H };
  return img;
}
/** a Gardiner pier (bent): two columns + a cap beam, standing on the sidewalk between the streets */
export function gardinerPier() {
  const W = 30, H = 34, img = new Img(W, H);
  img.rect(0, 0, W, 5, 'h'); img.hline(0, W - 1, 0, 'H');
  for (const x of [4, 20]) { img.rect(x, 5, 6, 27, 'h'); img.vline(x, 5, 31, 'H'); img.vline(x + 5, 5, 31, 'G'); }
  img.ellipse(W / 2, 32, 13, 2, 'g');
  img.outline('K'); img.pivot = { x: 0.5, y: 32 / H };
  return img;
}

/**
 * Streetcar rails curving from Spadina onto Queens Quay (top-down decal): two concentric quarter arcs,
 * the outer one (r1) southbound -> eastbound, the inner one (r2) westbound -> northbound. Origin = the
 * arcs' centre at the decal's top-right corner.
 */
export function trackCurves(r1 = 32, r2 = 16) {
  const S = r1 + 6, img = new Img(S, S);
  for (const r of [r1, r2]) for (const g of [-3, 3]) {
    for (let a = 0; a <= 90; a += 0.5) {
      const t = (a * Math.PI) / 180, rr = r + g;
      const x = S - 1 - Math.cos(t) * rr, y = Math.sin(t) * rr;
      img.set(Math.round(x), Math.round(y), 'h'); img.set(Math.round(x), Math.round(y) + 1, 'g');
    }
  }
  img.pivot = { x: (S - 1) / S, y: 0 };
  return img;
}

/** a marina finger dock (top-down, 3/4 lip) with a sailboat moored at it */
export function marinaDock(len = 64) {
  const W = 12, img = new Img(W, len + 4);
  img.rect(3, 0, 6, len, 'x'); for (let y = 2; y < len; y += 3) img.hline(3, 8, y, 'w');
  img.rect(3, len, 6, 2, 'w');
  for (let y = 4; y < len; y += 16) { img.rect(2, y, 1, 2, 'G'); img.rect(9, y, 1, 2, 'G'); }
  img.pivot = { x: 0.5, y: 0 };
  return img;
}

// ---------------------------------------------------------------- side view (mission 8, M3.1)
// Ivan: "we see the lake and the skyline, which is weird, considering the city should be behind us. We
// should see parks on Toronto Islands and the airport with landing planes."

/**
 * The Toronto Islands across the harbour (a distant, slow parallax band): tree canopy, beaches, the
 * Gibraltar Point lighthouse, and Billy Bishop airport (terminal, control tower, runway, approach lights).
 * 768 x 60; water below y 44 meets the near lake strip.
 */
export function islandsStrip(W = 768) {
  const H = 60, img = new Img(W, H), r = rng(1833);
  for (let y = 44; y < H; y++) for (let x = 0; x < W; x++) img.set(x, y, (x * 7 + y * 5) % 29 === 0 ? 'C' : y < 50 ? 'f' : 'c');
  // canopy: rounded tree tops along the islands, gaps of beach
  for (let x = 0; x < W; x++) {
    const inAirport = x > 440 && x < 640;
    const h = inAirport ? 2 : Math.round(9 + Math.sin(x / 11) * 3 + Math.sin(x / 4.3) * 1.5 + Math.sin(x / 37) * 3);
    for (let y = 43 - h; y < 43; y++) img.set(x, y, inAirport ? 'E' : y < 43 - h + 2 ? 'l' : y < 43 - h + 5 ? 'E' : 'e');
    img.set(x, 43, inAirport ? 'G' : 'D');
  }
  // the Gibraltar Point lighthouse (stone tower, lantern on top)
  const lx = 150; img.rect(lx - 3, 14, 7, 29, 't'); img.vline(lx - 3, 14, 42, 'T'); img.vline(lx + 3, 14, 42, 'S');
  img.rect(lx - 4, 10, 9, 4, 'g'); img.rect(lx - 2, 7, 5, 3, 'y'); img.rect(lx - 1, 5, 3, 2, 'g');
  // Billy Bishop airport: the runway, the terminal, the control tower, a parked turboprop
  img.rect(440, 40, 200, 3, 'S'); for (let x = 444; x < 636; x += 8) img.set(x, 41, 'W');
  img.rect(470, 30, 64, 10, 'H'); img.rect(470, 30, 64, 2, 'W'); for (let x = 474; x < 530; x += 5) img.rect(x, 34, 3, 4, 'c');
  img.rect(552, 12, 6, 28, 'h'); img.vline(552, 12, 39, 'H'); img.rect(549, 6, 12, 6, 'k'); img.rect(550, 7, 10, 3, 'c'); img.rect(548, 5, 14, 1, 'g');
  img.rect(590, 35, 22, 3, 'W'); img.rect(598, 32, 6, 2, 'W'); img.rect(609, 30, 3, 5, 'U'); // a parked plane
  for (let x = 640; x < 700; x += 6) img.set(x, 46 + ((x / 6) % 2), 'Y'); // approach lights on the water
  for (let i = 0; i < 5; i++) { const bx = r.int(10, W - 20); if (bx > 430 && bx < 650) continue; img.poly([[bx, 52], [bx + 8, 52], [bx + 7, 54], [bx + 1, 54]], 'W'); img.vline(bx + 4, 45, 52, 'H'); }
  return img;
}

/** a regional turboprop on approach (high wing, T-tail, two props; side view, faces left) */
export function planeTurboprop(frame = 0) {
  const W = 76, H = 24, img = new Img(W, H);
  img.poly([[4, 13], [10, 10], [64, 10], [72, 12], [72, 16], [10, 17]], 'W'); // fuselage
  img.rect(10, 15, 60, 2, 'H'); img.hline(12, 64, 13, 'U');                 // belly shade + cheat line
  for (let x = 16; x < 60; x += 4) img.set(x, 12, 'u');                      // windows
  img.rect(5, 11, 4, 2, 'u');                                                 // cockpit
  img.poly([[60, 10], [66, 2], [72, 2], [72, 10]], 'U'); img.rect(62, 1, 14, 2, 'U'); // T-tail
  img.rect(26, 8, 26, 2, 'G'); img.hline(26, 51, 8, 'h');                    // the high wing
  for (const ex of [28, 42]) { img.rect(ex, 10, 8, 3, 'h'); img.vline(ex - 1, 6 + frame, 14 - frame, 'H'); } // nacelles + prop blur
  img.rect(30, 17, 2, 3, 'g'); img.rect(56, 17, 2, 3, 'g');                  // gear down: it's landing
  img.outline('K'); img.pivot = { x: 0.5, y: 0.5 };
  return img;
}
/** a little Cessna-like high-wing single-prop (faces right) */
export function planeCessna(frame = 0) {
  const W = 32, H = 14, img = new Img(W, H);
  img.poly([[2, 7], [6, 5], [26, 6], [29, 8], [26, 10], [6, 10]], 'W');
  img.hline(6, 26, 8, 'R'); img.rect(18, 6, 4, 2, 'c');
  img.rect(10, 4, 14, 2, 'W'); img.hline(10, 23, 3, 'H');                    // wing
  img.poly([[2, 7], [2, 2], [6, 5]], 'W'); img.hline(1, 6, 7, 'R');          // tail
  img.vline(30, 4 + frame, 12 - frame, 'H');                                  // prop blur
  img.rect(14, 10, 1, 2, 'g'); img.rect(22, 10, 1, 2, 'g');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.5 };
  return img;
}
/** a sand clod the digger flings */
export function sandClod() {
  const img = new Img(10, 9);
  img.ellipse(5, 4, 4, 3, 'X'); img.ellipse(4, 3, 2, 1, 'j'); img.set(6, 6, 'x');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.5 };
  return img;
}

/**
 * The PINK DIGGER (mission 8 boss): the MEGA SPA's excavator, a rat in a fluffy white bathrobe and
 * sunglasses at the controls. Faces left. Frames: 0 arm at rest, 1 bucket raised, 2 bucket slammed down
 * (on the ground 112 px in front of the origin). Origin: under the cab-side end of the tracks.
 */
export function pinkDigger(frame = 0) {
  const W = 220, H = 124, img = new Img(W, H), gy = H - 4, ox = 120;
  // tracks
  img.rect(ox - 16, gy - 18, 104, 18, 'k'); img.rect(ox - 14, gy - 16, 100, 14, 'g');
  for (let x = ox - 10; x < ox + 84; x += 13) { img.circle(x, gy - 9, 5, 'G'); img.circle(x, gy - 9, 2, 'k'); }
  for (let x = ox - 16; x < ox + 88; x += 4) img.set(x, gy - 18, 'G');
  // the house: pink, MEGA SPA on the side, a counterweight at the back
  img.rect(ox - 8, gy - 54, 90, 36, 'P'); img.rect(ox - 8, gy - 54, 90, 3, 'm'); img.rect(ox - 8, gy - 22, 90, 4, 'p');
  img.rect(ox + 70, gy - 50, 18, 30, 'p'); img.rect(ox + 72, gy - 48, 14, 4, 'P');
  img.rect(ox + 22, gy - 44, 52, 11, 'W'); drawText(img, 'MEGA', ox + 36, gy - 42, 'P'); drawText(img, 'SPA', ox + 63, gy - 42, 'P');
  img.rect(ox + 40, gy - 62, 5, 8, 'g'); // exhaust stack
  // the cab + the driver: grey fur, a white bathrobe, sunglasses, a sunburnt pink snout, a pink drink
  img.rect(ox - 10, gy - 88, 34, 36, 'p'); img.rect(ox - 8, gy - 86, 30, 32, 'C');
  img.rect(ox - 8, gy - 86, 30, 2, 'i');
  const rx = ox + 6, ry = gy - 66;
  img.rect(rx - 7, ry, 14, 12, 'W'); img.line(rx - 4, ry, rx, ry + 8, 'H'); img.line(rx + 4, ry, rx, ry + 8, 'H'); // robe + lapels
  img.circle(rx, ry - 6, 7, 'h'); img.circle(rx - 5, ry - 12, 3, 'h'); img.circle(rx + 5, ry - 12, 3, 'h'); img.set(rx - 5, ry - 12, 'P'); img.set(rx + 5, ry - 12, 'P');
  img.rect(rx - 6, ry - 8, 12, 3, 'K'); img.set(rx - 4, ry - 8, 'C');      // sunglasses
  img.rect(rx - 9, ry - 5, 4, 3, 'm'); img.set(rx - 10, ry - 4, 'P');      // the sunburnt snout
  img.rect(rx + 8, ry + 2, 3, 6, 'm'); img.set(rx + 9, ry + 1, 'y');       // the drink
  img.rect(ox - 10, gy - 90, 34, 3, 'p');
  // the boom, arm and bucket: three poses
  const P0 = [ox - 4, gy - 50];
  const pose = frame === 1 ? { elbow: [ox - 46, gy - 112], tip: [ox - 92, gy - 86] } : frame === 2 ? { elbow: [ox - 64, gy - 78], tip: [ox - 108, gy - 10] } : { elbow: [ox - 52, gy - 96], tip: [ox - 84, gy - 46] };
  img.thick(P0[0], P0[1], pose.elbow[0], pose.elbow[1], 'p', 9); img.thick(P0[0], P0[1] - 2, pose.elbow[0], pose.elbow[1] - 2, 'P', 5);
  img.thick(pose.elbow[0], pose.elbow[1], pose.tip[0], pose.tip[1], 'p', 7); img.thick(pose.elbow[0], pose.elbow[1] - 1, pose.tip[0], pose.tip[1] - 1, 'P', 3);
  img.thick(P0[0] - 4, P0[1] + 6, (P0[0] + pose.elbow[0]) / 2, (P0[1] + pose.elbow[1]) / 2 + 4, 'h', 3); // hydraulic ram
  const [bx, by] = pose.tip;
  img.poly([[bx - 12, by - 2], [bx + 8, by - 6], [bx + 6, by + 10], [bx - 10, by + 10]], 'g');
  img.poly([[bx - 10, by], [bx + 6, by - 3], [bx + 4, by + 8], [bx - 8, by + 8]], 'G');
  for (let k = 0; k < 4; k++) img.rect(bx - 10 + k * 4, by + 10, 2, 3, 'h'); // teeth
  img.outline('K'); img.pivot = { x: ox / W, y: gy / H };
  return img;
}

export function waterfrontSidePreview() {
  return { frames: [pinkDigger(0), pinkDigger(1), pinkDigger(2), islandsStrip().crop(380, 0, 330, 60), planeTurboprop(0), planeCessna(0), sandClod()], cols: 4 };
}
export function waterfront2Preview() {
  return { frames: [cnTowerBuilding().img, domeBuilding().img, aquariumBuilding().img, ferryTerminalBuilding().img, ferryBoat(), sundialFolly(), podOP(), cinesphereOP(), gardinerDeck(), gardinerPier(), trackCurves(), marinaDock()], cols: 4 };
}
