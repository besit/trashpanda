// M4.13: turn a whole AI-generated scene (a poster background, no green screen) into pixel art on a locked palette.
// The hero pipeline's sibling (tools/hero.mjs): no keying (foliage greens would be keyed out), the full frame is kept.
// usage:
//   node tools/scene.mjs <master.png|jpg> <scene> <image-name> --size WxH [--crop x,y,w,h] [--new-palette 48]
//     --size W x H      the output size in art pixels (1 art pixel = 1 poster pixel)
//     --crop x,y,w,h    the part of the master to use (master pixels; default: all of it). Keep its aspect = W/H.
//     --new-palette N   make the scene's palette from THIS image and lock it (tools/palettes/<scene>.json)
//   writes art/scenes/<scene>_<image-name>.png
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { makePalette, mapToPalette, indexPNG, toHex } from './lib/hero.mjs';

const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]); }
const [master, scene, name] = pos;
if (!master || !scene || !name || !opt.size) { console.error('usage: node tools/scene.mjs <master> <scene> <image-name> --size WxH [--crop x,y,w,h] [--new-palette 48]'); process.exit(1); }
let file = master;
if (!/\.png$/i.test(master)) {
  file = path.join(os.tmpdir(), `scene_${process.pid}.png`);
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', master, file]);
  if (r.status !== 0) { console.error('could not decode the master (needs ffmpeg for .jpg)'); process.exit(1); }
}
const png = PNG.sync.read(fs.readFileSync(file));
const [W, H] = opt.size.split('x').map(Number);
const [cx, cy, cw, ch] = opt.crop ? opt.crop.split(',').map(Number) : [0, 0, png.width, png.height];
// each art pixel: the median colour of the middle 60% of its cell (keeps edges crisp, drops the generator's noise)
const kx = cw / W, ky = ch / H, rgb = [];
for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) {
  const sx = cx + gx * kx, sy = cy + gy * ky, cs = [];
  for (let y = Math.floor(sy + ky * 0.2); y < Math.max(Math.floor(sy + ky * 0.2) + 1, sy + ky * 0.8); y++)
    for (let x = Math.floor(sx + kx * 0.2); x < Math.max(Math.floor(sx + kx * 0.2) + 1, sx + kx * 0.8); x++) {
      const i = (Math.min(png.height - 1, y) * png.width + Math.min(png.width - 1, x)) * 4; cs.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
    }
  rgb.push([0, 1, 2].map((c) => cs.map((v) => v[c]).sort((p, q) => p - q)[cs.length >> 1]));
}
const grid = { w: W, h: H, rgb };
const palFile = path.resolve('tools/palettes', `${scene}.json`);
let palette;
if (opt['new-palette']) {
  if (fs.existsSync(palFile)) { console.error(`${palFile} exists: the palette is locked. Delete it on purpose to remake it.`); process.exit(1); }
  palette = makePalette(grid, Number(opt['new-palette']));
  fs.writeFileSync(palFile, JSON.stringify({ character: scene, made_from: path.basename(master), colours: palette.map(toHex) }, null, 1) + '\n');
  console.log(`locked ${palette.length} colours -> ${path.relative(process.cwd(), palFile)}`);
} else {
  if (!fs.existsSync(palFile)) { console.error(`no locked palette for '${scene}': run once with --new-palette 48`); process.exit(1); }
  palette = JSON.parse(fs.readFileSync(palFile, 'utf8')).colours.map((h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; });
}
const idx = mapToPalette(grid, palette);
const out = path.resolve('art/scenes', `${scene}_${name}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, indexPNG(idx, W, H, palette));
console.log(`${path.relative(process.cwd(), out)}: ${W} x ${H} px, ${new Set(idx).size} of ${palette.length} colours`);
