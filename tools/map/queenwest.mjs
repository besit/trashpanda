// Generates the Queen West map chunk (M0/M1). Output is data only; images built in build-assets.
import { rng } from '../lib/rng.mjs';

export const W = 72, H = 44, TS = 16;

export function generateQueenWest() {
  const r = rng(2026);
  const ground = Array.from({ length: H }, () => Array(W).fill('grass0'));
  const set = (x, y, name) => { if (x >= 0 && y >= 0 && x < W && y < H) ground[y][x] = name; };
  const objects = [];
  const prop = (key, tx, ty, ox = 8, oy = 12, extra = {}) => objects.push({ type: 'prop', key, x: tx * TS + ox, y: ty * TS + oy, ...extra });

  const XS = 34; // cross street: cols XS..XS+3 (sidewalk, lane, lane, sidewalk)
  const isCross = (x) => x >= XS && x <= XS + 3;

  // --- backyards + north laneway
  for (let y = 0; y < 6; y++) for (let x = 0; x < W; x++) set(x, y, `grass${(x * 7 + y * 3) % 3}`);
  for (let x = 0; x < W; x++) { set(x, 4, 'laneway'); set(x, 5, 'laneway'); }
  // --- north sidewalk rows 9..11
  for (let x = 0; x < W; x++) { set(x, 9, `sidewalk${x % 3}`); set(x, 10, `sidewalk${(x + 1) % 3}`); set(x, 11, 'curb_n'); }
  for (let y = 6; y < 9; y++) for (let x = 0; x < W; x++) set(x, y, 'laneway'); // under buildings (hidden)
  // --- Queen St: 12 bike lane (north, line at bottom), 13 WB tracks, 14 EB tracks, 15 bike lane (south)
  for (let x = 0; x < W; x++) {
    set(x, 12, x % 12 === 5 ? 'bikelane_n_stencil' : 'bikelane_n');
    set(x, 13, `tracks${x % 2}`);
    set(x, 14, `tracks${(x + 1) % 2}`);
    set(x, 15, x % 12 === 9 ? 'bikelane_stencil' : 'bikelane');
  }
  // --- south sidewalk rows 16..18 (+ forecourt 19..20)
  for (let x = 0; x < W; x++) { set(x, 16, 'curb_s'); set(x, 17, `sidewalk${x % 3}`); set(x, 18, `sidewalk${(x + 2) % 3}`); }
  // --- cross street (full height)
  for (let y = 0; y < H; y++) {
    if (y >= 12 && y <= 15) continue;
    set(XS, y, 'curb_w'); set(XS + 1, y, 'tracks_ns'); set(XS + 2, y, 'tracks_ns'); set(XS + 3, y, 'curb_e');
  }
  // intersection
  for (let y = 12; y <= 15; y++) { set(XS, y, 'zebra_ns'); set(XS + 3, y, 'zebra_ns'); set(XS + 1, y, 'tracks_x'); set(XS + 2, y, 'tracks_x'); }
  for (const y of [11, 16]) { set(XS + 1, y, 'zebra_ew'); set(XS + 2, y, 'zebra_ew'); }

  // --- south-west: park (Trinity-Bellwoods-inspired, fictionalized)
  for (let y = 19; y < H; y++) for (let x = 0; x < XS; x++) set(x, y, `grass${(x * 5 + y * 11) % 3}`);
  for (let x = 0; x < XS; x++) set(x, 19, 'grass_edge_n');
  // winding paths
  for (let y = 19; y < H; y++) { const px = Math.round(16 + Math.sin(y / 4) * 5); set(px, y, 'path'); set(px + 1, y, 'path'); }
  for (let x = 2; x < XS; x++) { const py = Math.round(32 + Math.sin(x / 5) * 2); set(x, py, 'path'); }
  // park trees + benches
  for (let i = 0; i < 26; i++) {
    const tx = r.int(1, XS - 2), ty = r.int(21, H - 2);
    if (ground[ty][tx] === 'path' || ground[ty][tx + 1] === 'path') continue;
    prop(r.chance(0.7) ? 'tree_a' : 'tree_b', tx, ty, 8, 12, { solid: 5 });
  }
  for (const [bx, by] of [[10, 31], [24, 33], [19, 24]]) prop('bench', bx, by, 8, 10);

  // --- south-east: laneway buildings (rears visible), then residential
  for (let y = 19; y < H; y++) for (let x = XS + 4; x < W; x++) set(x, y, y >= 25 && y <= 26 ? 'laneway' : `grass${(x + y) % 3}`);
  for (let y = 19; y < 21; y++) for (let x = XS + 4; x < W; x++) set(x, y, `sidewalk${(x + y) % 3}`);

  // --- buildings
  const bricks = ['red', 'buff', 'teal', 'darkred', 'red', 'lilac', 'buff', 'grey', 'mustard', 'cream'];
  let bid = 0;
  const row = (x0, x1, footY, d, kind, floorsPick) => {
    let x = x0;
    while (x < x1) {
      let w = r.pick([2, 3, 3, 4]);
      if (x + w > x1) w = x1 - x;
      if (w < 2) break;
      objects.push({ type: 'building', key: `bld_${bid}`, gen: { w: w * TS, d: d * TS, floors: r.pick(floorsPick), brick: r.pick(bricks), seed: 500 + bid, kind }, x: x * TS, y: footY * TS, w: w * TS, d: d * TS });
      bid++; x += w;
    }
  };
  row(0, XS, 6, 3, 'shop', [1, 2, 2, 3]);
  row(XS + 4, W, 6, 3, 'shop', [1, 2, 2, 3]);
  row(XS + 4, W, 21, 4, 'rear', [1, 1, 2]);
  // houses south of the laneway
  row(XS + 4, W, 28, 3, 'house', [1, 2]);

  // --- street furniture along Queen
  for (let x = 1; x < W; x++) {
    if (isCross(x) || isCross(x - 1) || isCross(x + 1)) continue;
    if (x % 6 === 2) { set(x, 10, 'treepit'); prop('tree_a', x, 10, 8, 10, { solid: 4 }); }
    if (x % 6 === 2) { set(x, 17, 'treepit'); prop('tree_b', x, 17, 8, 10, { solid: 4 }); }
    if (x % 8 === 5) prop('streetlight', x, 11, 4, 8, { solid: 2 });
    if (x % 8 === 1) prop('streetlight', x, 16, 4, 6, { solid: 2 });
    if (x % 5 === 0) prop('bikering', x, 9, 8, 14, { solid: 2 });
    if (x % 13 === 7) prop('bench', x, 9, 8, 13);
    if (x % 11 === 3) prop('newsbox', x, 10, 12, 6, { solid: 2 });
    if (x % 17 === 9) prop('hydrant', x, 11, 4, 6, { solid: 2 });
  }
  prop('ttcstop', XS - 2, 11, 8, 8, { solid: 2 });
  prop('ttcstop', XS + 5, 16, 8, 6, { solid: 2 });
  for (const [sx, sy] of [[XS - 1, 11], [XS + 4, 11], [XS - 1, 16], [XS + 4, 16]]) prop('signal', sx, sy, 8, sy === 11 ? 10 : 6, { solid: 2 });

  // --- improvement: protected bike lanes on Queen (the vertical-slice civic upgrade)
  const imp = { tiles: [], addProps: [], removeTag: 'parked' };
  for (let x = 0; x < W; x++) {
    if (x >= XS && x <= XS + 3) continue; // keep the intersection clear (protected intersection is a later upgrade)
    imp.tiles.push([x, 12, x % 12 === 5 ? 'bikelane_protected_n_stencil' : 'bikelane_protected_n']);
    imp.tiles.push([x, 15, x % 12 === 9 ? 'bikelane_protected_stencil' : 'bikelane_protected']);
    if (x % 6 === 4) { imp.addProps.push({ type: 'prop', key: 'planter', x: x * TS + 8, y: 12 * TS + 4, solid: 3 }); imp.addProps.push({ type: 'prop', key: 'planter', x: x * TS + 8, y: 15 * TS + 2, solid: 3 }); }
  }

  return {
    width: W, height: H, tileSize: TS, ground, objects,
    improvements: { queen_protected_lanes: imp },
    spawn: { x: 23 * TS + 8, y: 10 * TS + 4 },
    markers: [{ id: 'bike_lane_war', x: 50 * TS, y: 10 * TS + 8, label: 'THE BIKE LANE WAR' }],
    lanes: { wb: 13 * TS + 8, eb: 14 * TS + 8, crossX: (XS + 1.5) * TS },
  };
}
