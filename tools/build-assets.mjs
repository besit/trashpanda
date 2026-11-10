// Builds all generated game assets into public/gen/ + a manifest the game loads.
import fs from 'node:fs';
import path from 'node:path';
import { Img, save } from './lib/raster.mjs';
import { packAtlas, packTileset } from './lib/pack.mjs';
import { raccoonSideFrames, PIVOT_Y as RS_PIVOT_Y } from './sprites/raccoon_side.mjs';
import { raccoonTopFrame, DIRS } from './sprites/raccoon_top.mjs';
import { ratAnims, RAT_VARIANTS } from './sprites/rats.mjs';
import { dogFraudPortrait } from './sprites/dogfraud.mjs';
import { PED_VARIANTS, CYC_VARIANTS, PED_DIRS, pedFrame, cycFrame, cycSideFrame, PED_FW, PED_FH, PED_OX, PED_OY } from './sprites/people.mjs';
import { buildTiles } from './sprites/tiles.mjs';
import { obliqueBuilding, BRICKS } from './sprites/buildings.mjs';
import * as PK from './sprites/park.mjs';
import { dvpBackdrop, dvpCar, DVP_SCALES } from './sprites/dvp.mjs';
import { PALETTE, hexToRgb } from './palette.mjs';
import * as P from './sprites/props.mjs';
import { sky, skyline, facadeStrip, backRow, streetStrip } from './sprites/sidebg.mjs';
import { fontSheet, CHARS } from './sprites/font.mjs';
import { generateQueenWest } from './map/queenwest.mjs';

const OUT = path.resolve('public/gen');
fs.mkdirSync(OUT, { recursive: true });
const t0 = Date.now();
const manifest = { atlases: {}, anims: {}, pivots: {}, images: {}, fonts: {}, maps: {} };

// ---------- characters atlas ----------
const chars = [];
{
  const rs = raccoonSideFrames();
  rs.frames.forEach((f, i) => chars.push({ name: `rs_${i}`, img: f }));
  for (const [k, a] of Object.entries(rs.anims)) manifest.anims[`rs_${k}`] = { frames: Array.from({ length: a.count }, (_, i) => `rs_${a.start + i}`), rate: a.rate, loop: a.loop };
  manifest.pivots.rs = { x: 0.5, y: RS_PIVOT_Y };
  DIRS.forEach((d, di) => {
    for (let f = 0; f < 4; f++) chars.push({ name: `rt_${d}_${f}`, img: raccoonTopFrame((di * Math.PI) / 4, f / 4) });
    manifest.anims[`rt_${d}`] = { frames: [0, 1, 2, 3].map((f) => `rt_${d}_${f}`), rate: 10, loop: true };
  });
  manifest.pivots.rt = { x: 16 / 32, y: 26 / 32 };
  for (const v of RAT_VARIANTS) {
    const ra = ratAnims(v);
    ra.frames.forEach((f, i) => chars.push({ name: `rat_${v}_${i}`, img: f }));
    for (const [k, a] of Object.entries(ra.anims)) manifest.anims[`rat_${v}_${k}`] = { frames: Array.from({ length: a.count }, (_, i) => `rat_${v}_${a.start + i}`), rate: a.rate, loop: a.loop };
  }
  manifest.pivots.rat = { x: 15 / 32, y: 31 / 32 };
  for (const e of ['grin', 'laugh', 'shock']) chars.push({ name: `df_${e}`, img: dogFraudPortrait(e) });
  for (const v of PED_VARIANTS) for (const d of PED_DIRS) {
    for (let f = 0; f < 4; f++) chars.push({ name: `ped_${v.id}_${d}_${f}`, img: pedFrame(v, d, f / 4) });
    manifest.anims[`ped_${v.id}_${d}`] = { frames: [0, 1, 2, 3].map((f) => `ped_${v.id}_${d}_${f}`), rate: 7, loop: true, atlas: 'chars' };
  }
  manifest.pivots.ped = { x: PED_OX / PED_FW, y: PED_OY / PED_FH };
  manifest.peds = PED_VARIANTS.map((v) => v.id);
  for (const v of CYC_VARIANTS) for (const d of PED_DIRS) {
    for (let f = 0; f < 4; f++) chars.push({ name: `cy_${v.id}_${d}_${f}`, img: cycFrame(v, d, f / 4) });
    manifest.anims[`cy_${v.id}_${d}`] = { frames: [0, 1, 2, 3].map((f) => `cy_${v.id}_${d}_${f}`), rate: 9, loop: true, atlas: 'chars' };
  }
  manifest.pivots.cy = { x: 0.5, y: 26 / 32 };
  manifest.cyclists = CYC_VARIANTS.map((v) => v.id);
  // side-view cyclists (vignettes): the parent with a kid seat + a bike-share rider
  for (const v of CYC_VARIANTS.filter((c) => c.id === 'a' || c.id === 'c')) {
    for (let f = 0; f < 4; f++) chars.push({ name: `cys_${v.id}_${f}`, img: cycSideFrame(v, f / 4) });
    manifest.anims[`cys_${v.id}`] = { frames: [0, 1, 2, 3].map((f) => `cys_${v.id}_${f}`), rate: 9, loop: true, atlas: 'chars' };
  }
}
manifest.atlases.chars = { ...packAtlas(chars, path.join(OUT, 'chars')), png: 'gen/chars.png', json: 'gen/chars.json' };

// ---------- map + world atlas ----------
const map = generateQueenWest();
const world = [];
const addProp = (name, img) => { world.push({ name, img }); manifest.pivots[name] = img.pivot ?? { x: 0.5, y: 1 }; };
addProp('tree_a', P.tree(1)); addProp('tree_b', P.tree(2, 0.85)); addProp('sapling', P.sapling());
addProp('streetlight', P.streetlight()); addProp('ttcstop', P.ttcStop()); addProp('bikering', P.bikeRing());
addProp('hydrant', P.hydrant()); addProp('bench', P.bench()); addProp('planter', P.planter()); addProp('bollard', P.bollard());
addProp('cone', P.cone()); addProp('signal', P.trafficSignal()); addProp('newsbox', P.newsBox());
addProp('tree_c', P.tree(3, 1.2));
addProp('tbgates', PK.tbGates()); addProp('parklamp', PK.parkLamp()); addProp('picnic', PK.picnicTable());
PK.graffitiPieces().forEach((g, i) => addProp(`graf_${i}`, g));
for (const k of ['green', 'blue', 'grey']) addProp(`bin_${k}`, PK.bin(k));
PK.whiteSquirrel().forEach((f, i) => addProp(`sq_${i}`, f));
manifest.anims.sq_run = { frames: ['sq_0', 'sq_1'], rate: 12, loop: true, atlas: 'world' };
manifest.anims.sq_sit = { frames: ['sq_2'], rate: 1, loop: true, atlas: 'world' };
const CAR_COLORS = ['blue', 'red', 'white', 'yellow', 'teal', 'orange'];
const VDIR = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
for (const c of CAR_COLORS) for (const [d, yaw] of Object.entries(VDIR)) addProp(`car_${c}_${d}`, P.car(c, yaw));
for (const [d, yaw] of Object.entries(VDIR)) addProp(`suv_${d}`, P.suv(yaw));
addProp('carside_red', P.car('red', 0, 1, true)); addProp('carside_blue', P.car('blue', Math.PI, 1, true)); addProp('suvside', P.suv(Math.PI, true));
addProp('streetcar_E', P.streetcar(0)); addProp('streetcar_W', P.streetcar(Math.PI));
addProp('streetcarside', P.streetcar(0, 96, true));
['red', 'blue', 'white', 'yellow', 'teal', 'suv'].forEach((k) => DVP_SCALES.forEach((sc, i) => addProp(`dvp_${k}_${i}`, dvpCar(k, sc))));
manifest.dvpScales = DVP_SCALES;
const hex = (k) => parseInt(PALETTE[k].slice(1), 16);
for (const o of map.objects) if (o.type === 'building') {
  const b = obliqueBuilding(o.gen);
  world.push({ name: o.key, img: b.img });
  o.imgH = b.img.h; o.facadeH = b.facadeH;
  o.mapColor = '#' + PALETTE[BRICKS[o.gen.brick].base].slice(1);
  delete o.gen;
}
manifest.atlases.world = { ...packAtlas(world, path.join(OUT, 'world'), 2048), png: 'gen/world.png', json: 'gen/world.json' };

// ---------- tileset ----------
const baseTiles = Object.fromEntries(buildTiles().map((t) => [t.name, t.img]));
const used = new Set();
map.ground.flat().forEach((n) => used.add(n));
Object.values(map.improvements).forEach((imp) => imp.tiles.forEach(([, , n]) => used.add(n)));
const names = [...used].sort();
const tileImgs = names.map((n) => {
  const [baseName, mod] = n.split(':');
  const img = baseTiles[baseName];
  if (!img) throw new Error(`unknown tile ${n}`);
  if (mod === 'fy') { const o = new Img(img.w, img.h); o.blit(img, 0, 0, { flipY: true }); return o; }
  return img;
});
const ts = packTileset(tileImgs, path.join(OUT, 'tiles.png'));
const idx = Object.fromEntries(names.map((n, i) => [n, i]));
// average colour per tile index (minimap)
const tileColors = tileImgs.map((im) => {
  let r = 0, g = 0, b = 0, n = 0;
  for (const c of im.px) if (c) { const [R, G, B] = hexToRgb(PALETTE[c]); r += R; g += G; b += B; n++; }
  return n ? (Math.round(r / n) << 16) | (Math.round(g / n) << 8) | Math.round(b / n) : 0;
});
const mapOut = {
  width: map.width, height: map.height, tileSize: map.tileSize,
  tileset: { png: 'gen/tiles.png', ...ts },
  ground: map.ground.map((row) => row.map((n) => idx[n])),
  objects: map.objects,
  improvements: Object.fromEntries(Object.entries(map.improvements).map(([k, v]) => [k, { ...v, tiles: v.tiles.map(([x, y, n]) => [x, y, idx[n]]) }])),
  spawn: map.spawn, markers: map.markers, lanes: map.lanes,
  intersections: map.intersections, walkways: map.walkways, labels: map.labels, critters: map.critters, landmarks: map.landmarks,
  decals: map.decals.map(({ gen, ...d }) => d),
  tileColors,
};
// ground decals: standalone images (big, mostly transparent: compress well, keep the atlas small)
const decalImgs = { dogbowl: PK.dogBowl(208, 128), diamond: PK.baseballDiamond('east'), tennis: PK.tennisCourts() };
for (const d of map.decals) if (d.gen?.kind === 'paths') decalImgs[d.key] = PK.parkPaths(d.gen);
for (const [k, im] of Object.entries(decalImgs)) { save(im, path.join(OUT, `${k}.png`)); manifest.images[k] = `gen/${k}.png`; }
fs.writeFileSync(path.join(OUT, 'queenwest.json'), JSON.stringify(mapOut));
manifest.maps.queenwest = 'gen/queenwest.json';

// ---------- side-view backgrounds ----------
const img = (name, im) => { save(im, path.join(OUT, `${name}.png`)); manifest.images[name] = `gen/${name}.png`; };
img('sky_day', sky('day')); img('sky_dusk', sky('dusk'));
img('skyline_day', skyline('day')); img('skyline_dusk', skyline('dusk'));
img('backrow_day', backRow('day')); img('backrow_dusk', backRow('dusk'));
img('facades_qw', facadeStrip(11));
img('street_paint', streetStrip(false)); img('street_protected', streetStrip(true)); img('street_plain', streetStrip('plain'));
img('dvp_bg', dvpBackdrop());

// ---------- fonts ----------
const font = (name, ...args) => { const f = fontSheet(...args); save(f.img, path.join(OUT, `${name}.png`)); manifest.fonts[name] = { png: `gen/${name}.png`, cw: f.cw, ch: f.ch, chars: CHARS }; };
font('font', 'W', 'plain');
font('font_outline', 'W', 'outline');
font('font_big', 'Y', 'outline', 'K', 2);
font('font_red', 'q', 'outline', 'K', 2);

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
const size = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`assets built in ${Date.now() - t0}ms -> ${OUT} (${(size / 1024).toFixed(0)} KB, chars ${manifest.atlases.chars.w}x${manifest.atlases.chars.h}, world ${manifest.atlases.world.w}x${manifest.atlases.world.h})`);
