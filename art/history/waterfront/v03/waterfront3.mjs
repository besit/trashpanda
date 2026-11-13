// Waterfront art, M3.2 pass (Ivan's M3.1 review, with new reference photos):
// - the CN Tower's base as the real TREFOIL: three tapering concrete foils (hexagonal tips) meeting at a
//   core, glass elevator shafts in the corners where the foils meet, turned slightly off-axis
// - the Rogers Centre CLOSED, as seen from the air and the front: a ring of concrete levels with blue glass
//   bands and the diagonal ramps at the corners, under nested roof panels whose edges read as arcs
// - Ripley's Aquarium from its photos: a white angular hall, grey/white checker panels on the jutting
//   top band, a tall glass front under a raked canopy, and the two dark sharks laid into the white roof
// - the Power Plant gallery (a 1920s power station, a gallery since 1987) with its smokestack
// - HTO Park's yellow umbrellas, motor yachts moored in the slips
import { Img } from '../lib/raster.mjs';
import { scene, render, obliqueCam, sd } from '../lib/sdf.mjs';
import { drawText } from './font.mjs';

const mat = (ramp, extra = {}) => ({ ramp, ...extra });
const CONC = ['g', 'G', 'h', 'H'];
const rot = (x, y, a) => [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)];

/**
 * The CN Tower for the map: the trefoil base + the shaft leaving the top of the map. Footprint w x d (px).
 * Each foil is a tapering prism with a chamfered (hexagonal) tip, wide at the ground and merging into the
 * core as it rises; a glass elevator strip runs up each re-entrant corner (Ivan's references: the base
 * photo, the plan drawing). The whole thing is turned ~12 degrees so it doesn't sit square to the grid.
 */
export function cnTowerBuilding(w = 96, d = 48, shaftH = 300) {
  const Hb = 118, gy = Hb - 24; // ground centre row in the base render
  const turn = 0.21;
  const arms = [0, 1, 2].map((k) => -Math.PI / 2 + turn + (k * 2 * Math.PI) / 3);
  const ZT = 64; // above this the raster shaft takes over
  // one foil, in its own frame: u out along the arm, v across it. y is squashed in the plan (oblique map)
  const foil = (a) => (p) => {
    const [u, v] = rot(p[0], p[1] / 0.62, -a).map((c, i) => (i === 0 ? c : c));
    const z = Math.max(0, p[2]);
    const L = 10 + 19 * Math.max(0, 1 - z / 66);          // reach of the arm (tapers steadily, like a rib up the shaft)
    const hw = 6.4 - z * 0.02;                            // half-width across
    const tip = u + Math.abs(v) * 0.75 - L;               // chamfered hexagonal tip
    const dArm = Math.max(Math.abs(v) - hw, tip, -u - 2);
    return Math.max(dArm * 0.62, -p[2], p[2] - ZT);
  };
  const core = (p) => Math.max(Math.hypot(p[0], p[1] / 0.62) - (9 - p[2] * 0.02), -p[2], p[2] - ZT);
  // glass elevators in the corners between the foils
  const lift = (a) => (p) => {
    const [u, v] = rot(p[0], p[1] / 0.62, -a);
    return Math.max(Math.abs(v) - 2.1, Math.abs(u - 9.6) - 2.0, -p[2] + 1, p[2] - ZT);
  };
  const conc = mat(CONC, { fn: (p) => (p[2] < 2.2 ? 'G' : (Math.round(p[2]) % 11 === 0 ? 'g' : null)) });
  const glass = mat(['u', 'U', 'c', 'C'], { fn: (p) => (Math.round(p[2]) % 3 === 0 ? 'C' : null) });
  const objs = [
    { d: core, m: conc },
    ...arms.map((a) => ({ d: foil(a), m: conc })),
    ...arms.map((a) => ({ d: lift(a + Math.PI / 3), m: glass })),
  ];
  const base = render(scene(objs), { w, h: Hb, cx: w / 2, cy: gy, cam: obliqueCam(), ambient: 0.2, light: [-0.7, 0.35, 0.6] });
  const img = new Img(w, shaftH + Hb);
  // the shaft above the base: still Y-shaped (two lit faces + the shadowed one), an elevator strip, rings
  const cx = w / 2, shaftBottom = shaftH + gy - ZT + 2;
  for (let y = 0; y <= shaftBottom; y++) {
    const t = y / shaftBottom, half = Math.round(5 + t ** 1.6 * 9);
    for (let x = -half; x <= half; x++) {
      const k = (x + half) / (2 * half);
      img.set(cx + x, y, k < 0.18 ? 'h' : k < 0.47 ? 'H' : k < 0.53 ? 'g' : k < 0.82 ? 'h' : 'G');
    }
    img.set(cx + Math.round(half * 0.62), y, (y >> 1) % 2 ? 'c' : 'u'); // the glass elevator strip
    if (y % 22 === 0) img.hline(cx - half, cx + half, y, 'h');
  }
  img.blit(base, 0, shaftH);
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: img.h - d };
}

/**
 * The Rogers Centre (SkyDome, 1989), roof CLOSED. A ring of concrete levels (blue glass bands, the
 * diagonal ramp towers at the corners) under four roof panels. The panels nest front to back, each a little
 * higher than the one in front, so their edges read as arcs across the roof (Ivan's elevation drawings).
 */
export function domeBuilding(w = 208, d = 120) {
  const rx = w / 2 - 4, ry = d / 2 - 3, wallH = 26, rise = 40;
  const inEll = (p, s = 1) => Math.hypot(p[0] / (rx * s), p[1] / (ry * s)) - 1;
  const ring = { d: (p) => Math.max(inEll(p) * Math.min(rx, ry), -p[2], p[2] - wallH), m: mat(['G', 'h', 'H', 'W'], { fn: (p) => {
    const a = Math.atan2(p[1] / ry, p[0] / rx), z = p[2];
    // the four corner ramp towers: diagonal bracing
    const corner = [Math.PI / 4, (3 * Math.PI) / 4, -Math.PI / 4, (-3 * Math.PI) / 4].some((c) => Math.abs(Math.atan2(Math.sin(a - c), Math.cos(a - c))) < 0.13);
    if (corner) return Math.abs(((z + a * 30) % 6 + 6) % 6 - 3) < 0.8 ? 'G' : ['g', 'G', 'h', 'H'];
    if (z < 2) return 'G';
    if (z > 5 && z < 10) return Math.abs(((a * 40 / Math.PI) % 1 + 1) % 1 - 0.5) < 0.12 ? 'H' : ['u', 'U', 'c', 'C']; // lower glass band
    if (z > 14 && z < 19) return Math.abs(((a * 60 / Math.PI) % 1 + 1) % 1 - 0.5) < 0.1 ? 'H' : ['u', 'U', 'c']; // upper glass band
    if (z > 23) return 'W';
    return null;
  } }) };
  // the roof: four panels, front (south, +y) to back; each panel is an arched shell a little higher than
  // the one in front, so there's a step (a dark seam) where one rides over the next
  const cuts = [ry * 0.55, ry * 0.05, -ry * 0.5];             // panel boundaries along y (front -> back)
  const lift = [0, 3, 6, 4];                                    // height added per panel
  const panelOf = (y) => (y > cuts[0] ? 0 : y > cuts[1] ? 1 : y > cuts[2] ? 2 : 3);
  const roofZ = (x, y) => {
    const k = panelOf(y), e = 1 - (x / (rx - 2)) ** 2 - (y / (ry - 2)) ** 2;
    return e <= 0 ? -1 : wallH - 3 + Math.sqrt(e) * (rise + lift[k]) * (0.9 + 0.1 * Math.sqrt(e));
  };
  const roof = { d: (p) => {
    const e = inEll(p, 0.985);
    const top = roofZ(p[0], p[1]);
    return Math.max(e * Math.min(rx, ry), (p[2] - top) * 0.6, wallH - 4 - p[2]);
  }, m: mat(['G', 'h', 'H', 'W', 'W'], { fn: (p) => {
    const y = p[1], k = panelOf(y);
    // the seams: the front edge of each panel, where it rides over the one in front (an arc on screen)
    if (cuts.some((c) => Math.abs(y - c) < 1.4)) return 'g';
    // ribs across each panel, parallel to its edges
    if ((((y + k * 3) % 6) + 6) % 6 < 0.8) return ['G', 'h', 'H', 'H'];
    return k % 2 ? ['G', 'h', 'H', 'H', 'W'] : null;
  } }) };
  const H = d + wallH + rise + 10;
  const img = render(scene([ring, roof]), { w, h: H, cx: w / 2, cy: H - ry - 4, cam: obliqueCam(), ambient: 0.12, light: [-0.7, 0.3, 0.65] });
  return { img, footprint: { w, d }, facadeH: H - d };
}

/**
 * Ripley's Aquarium of Canada (2013), from Ivan's photos: a white angular hall. Roof: white tiles with the
 * two dark sharks swimming across it and a raised block to the west. Front: a band of grey/white checker
 * panels that juts out over a tall glass wall, a raked canopy, the entrance stairs.
 */
export function aquariumBuilding(w = 144, d = 64) {
  const fh = 34, img = new Img(w, d + fh);
  // ---- the roof (top-down) ----
  img.rect(0, 0, w, d, 'H');
  for (let y = 0; y < d; y += 4) img.hline(0, w - 1, y, 'h');
  for (let x = 0; x < w; x += 6) img.vline(x, 0, d - 1, (x / 6) % 2 ? 'h' : 'H');
  // the raised block (north-west), angled on its east side
  img.poly([[0, 0], [w * 0.36, 0], [w * 0.44, d * 0.32], [w * 0.36, d * 0.52], [0, d * 0.52]], 'W');
  img.line(w * 0.36, 0, w * 0.44, d * 0.32, 'G'); img.line(w * 0.44, d * 0.32, w * 0.36, d * 0.52, 'G'); img.hline(0, Math.round(w * 0.36), Math.round(d * 0.52), 'G');
  // two sharks in dark tiles (a body, a dorsal fin, a forked tail), swimming across the roof
  const shark = (cx, cy, s, flip) => {
    const f = flip ? -1 : 1;
    img.poly([[cx - 22 * s * f, cy], [cx - 8 * s * f, cy - 5 * s], [cx + 14 * s * f, cy - 3 * s], [cx + 24 * s * f, cy], [cx + 14 * s * f, cy + 3 * s], [cx - 8 * s * f, cy + 5 * s]], 'k');
    img.poly([[cx - 2 * s * f, cy - 4 * s], [cx + 4 * s * f, cy - 11 * s], [cx + 7 * s * f, cy - 3 * s]], 'k');   // dorsal fin
    img.poly([[cx - 20 * s * f, cy], [cx - 30 * s * f, cy - 8 * s], [cx - 27 * s * f, cy], [cx - 30 * s * f, cy + 7 * s]], 'k'); // tail
    img.poly([[cx + 2 * s * f, cy + 4 * s], [cx + 8 * s * f, cy + 10 * s], [cx + 10 * s * f, cy + 3 * s]], 'k');  // pectoral fin
  };
  shark(w * 0.30, d * 0.74, 0.9, false); shark(w * 0.74, d * 0.42, 1.0, true);
  // rooftop units
  for (const [x, y] of [[w * 0.82, d * 0.78], [w * 0.88, d * 0.78], [w * 0.94, d * 0.78]]) { img.rect(Math.round(x), Math.round(y), 5, 4, 'h'); img.hline(Math.round(x), Math.round(x) + 4, Math.round(y), 'W'); }
  img.rect(0, d - 2, w, 2, 'G');
  // ---- the front (south) ----
  const y0 = d;
  // the jutting checker band (grey + white panels), with a sign
  img.rect(0, y0, w, 9, 'W');
  for (let x = 0; x < w; x += 10) for (let r = 0; r < 2; r++) if (((x / 10) + r) % 2) img.rect(x, y0 + 1 + r * 4, 10, 4, 'h');
  img.hline(0, w - 1, y0 + 9, 'G');
  drawText(img, 'AQUARIUM', Math.round(w * 0.68), y0 + 1, 'R');
  // the raked canopy soffit: dark triangles under the band
  for (let x = 0; x < w; x += 12) img.poly([[x, y0 + 10], [x + 12, y0 + 10], [x + 6, y0 + 14]], 'G');
  // the tall glass wall
  img.rect(6, y0 + 12, w - 12, fh - 16, 'c');
  for (let x = 6; x < w - 6; x += 9) img.vline(x, y0 + 12, y0 + fh - 5, 'C');
  img.hline(6, w - 7, y0 + 20, 'C');
  for (let x = 8; x < w - 8; x += 2) if ((x * 7) % 5 === 0) img.set(x, y0 + 15, 'i'); // reflections
  // white end walls, angled
  img.poly([[0, y0 + 10], [6, y0 + 12], [6, y0 + fh - 4], [0, y0 + fh - 1]], 'W');
  img.poly([[w, y0 + 10], [w - 6, y0 + 12], [w - 6, y0 + fh - 4], [w, y0 + fh - 1]], 'H');
  // the entrance + stairs
  const ex = Math.round(w * 0.6);
  img.rect(ex - 14, y0 + fh - 12, 28, 8, 'u'); img.rect(ex - 13, y0 + fh - 11, 12, 7, 'U'); img.rect(ex + 1, y0 + fh - 11, 12, 7, 'U');
  for (let s = 0; s < 3; s++) img.hline(ex - 20 - s * 2, ex + 20 + s * 2, y0 + fh - 4 + s, s % 2 ? 'h' : 'H');
  img.hline(0, w - 1, y0, 'K');
  return { img, footprint: { w, d }, facadeH: fh };
}

/**
 * The Power Plant (Harbourfront Centre): a 1920s power station of buff brick with tall arched windows,
 * a contemporary art gallery since 1987; its smokestack still stands, lettered POWER PLANT.
 */
export function powerPlantBuilding(w = 112, d = 48) {
  const fh = 34, stackH = 96, img = new Img(w, stackH + d + fh);
  const top = stackH;
  // roof
  img.rect(0, top, w, d, 'g'); for (let x = 0; x < w; x += 8) img.vline(x, top, top + d - 1, 'G');
  img.rect(0, top, w, 2, 'h'); img.rect(Math.round(w * 0.55), top + 6, Math.round(w * 0.35), d - 14, 'G'); img.rect(Math.round(w * 0.55) + 2, top + 8, Math.round(w * 0.35) - 4, d - 18, 'g'); // skylight hall
  // facade: buff brick, pilasters, tall arched windows
  const fy = top + d;
  img.rect(0, fy, w, fh, 'j');
  for (let y = fy + 2; y < fy + fh; y += 3) for (let x = (y % 2) * 2; x < w; x += 5) img.set(x, y, 'X');
  img.rect(0, fy, w, 3, 'X'); img.rect(0, fy + fh - 3, w, 3, 'x');
  for (let x = 8; x < w - 8; x += 14) {
    img.rect(x, fy + 7, 8, fh - 12, 'u'); img.rect(x + 1, fy + 6, 6, 1, 'u'); img.set(x + 3, fy + 5, 'u'); img.set(x + 4, fy + 5, 'u');
    img.vline(x + 4, fy + 7, fy + fh - 6, 'c'); img.hline(x, x + 7, fy + 15, 'c');
    img.vline(x - 3, fy + 3, fy + fh - 4, 'X');
  }
  img.rect(Math.round(w / 2) - 9, fy + fh - 13, 18, 10, 'K'); img.rect(Math.round(w / 2) - 8, fy + fh - 12, 16, 9, 'U');
  drawText(img, 'GALLERY', Math.round(w / 2), fy + 2, 'W');
  // the smokestack, on the roof's north-west, lettered vertically
  const sx = Math.round(w * 0.2), sw = 14;
  for (let y = 0; y < top + 10; y++) {
    const half = Math.round(sw / 2 + (y / (top + 10)) * 2);
    for (let x = -half; x <= half; x++) { const k = (x + half) / (2 * half); img.set(sx + x, y, k < 0.25 ? 'X' : k < 0.75 ? 'j' : 'x'); }
  }
  img.rect(sx - 9, 0, 19, 3, 'x'); img.rect(sx - 8, 3, 17, 1, 'X');
  'POWER PLANT'.split('').forEach((ch, i) => { if (ch !== ' ') drawText(img, ch, sx + 1, 8 + i * 8, 'W'); });
  img.outline('K');
  return { img, footprint: { w, d }, facadeH: img.h - d };
}

/** HTO Park's fixed yellow umbrellas (the Seurat nod) */
export function yellowUmbrella() {
  const img = new Img(22, 26);
  for (let x = 0; x < 22; x++) { const h = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 10.5) / 11) ** 2)) * 6); for (let y = 6 - h; y <= 7; y++) img.set(x, y + 1, x % 4 < 2 ? 'Y' : 'y'); }
  img.vline(10, 8, 22, 'h');
  img.rect(13, 19, 7, 2, 'x'); img.rect(13, 21, 1, 3, 'x'); img.rect(19, 21, 1, 3, 'x'); img.rect(19, 15, 1, 4, 'x'); // a Muskoka chair
  img.outline('K'); img.pivot = { x: 0.5, y: 24 / 26 };
  return img;
}

/** a white motor yacht moored in a slip (seen from above at 3/4, bow north); 2 frames bob */
export function yacht(frame = 0) {
  const W = 22, H = 46, img = new Img(W, H), b = frame;
  img.poly([[11, 1 + b], [19, 12 + b], [19, 38 + b], [16, 42 + b], [6, 42 + b], [3, 38 + b], [3, 12 + b]], 'W'); // hull, deck
  img.poly([[11, 3 + b], [17, 13 + b], [5, 13 + b]], 'H');                                                      // foredeck
  img.rect(6, 16 + b, 10, 14, 'H'); img.rect(7, 17 + b, 8, 4, 'u'); img.rect(7, 22 + b, 8, 6, 'h');            // the cabin, windscreen
  img.rect(5, 32 + b, 12, 8, 'w'); img.hline(5, 16, 36 + b, 'x');                                               // teak aft deck
  img.vline(3, 14 + b, 38 + b, 'U'); img.vline(19, 14 + b, 38 + b, 'G');
  img.hline(2, 20, 43 + b, 'C'); img.hline(4, 18, 44 + b, 'i');
  img.outline('K'); img.pivot = { x: 0.5, y: 0.6 };
  return img;
}

export function waterfront3Preview() {
  const items = [cnTowerBuilding(96, 48, 60).img, domeBuilding().img, aquariumBuilding().img, powerPlantBuilding().img, yellowUmbrella(), yacht(0)];
  const fw = Math.max(...items.map((i) => i.w)), fh = Math.max(...items.map((i) => i.h));
  const frames = items.map((it) => { const f = new Img(fw, fh); f.blit(it, Math.round((fw - it.w) / 2), fh - it.h); return f; });
  return { frames, cols: 3 };
}
