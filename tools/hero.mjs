// M4.10: turn an AI-generated master (pixel-art style, flat #00FF00 background) into a hero image on a locked palette.
// usage:
//   node tools/hero.mjs <master.png|jpg> <character> <image-name> [--new-palette 48] [--block 4]
//     --new-palette N   make the character's palette from THIS master (N colours) and lock it: writes
//                       tools/palettes/<character>.json. Only for the character's first master.
//     otherwise         map onto the character's locked palette (tools/palettes/<character>.json)
//   writes art/heroes/<character>_<image-name>.png (1x, cropped to the figure, palette colours only) and a 4x preview
//   in tools/scratch/heroes/. A .jpg master is decoded with ffmpeg.
//     --height N        resample so the figure is N art pixels tall (a chosen pixel size, the same for every image)
//     --block B         instead: keep the generator's own pixel grid (blocks of B screen pixels)
//     --match <image>   match this image's tones to a reference of the same character before palette mapping
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { sampleGrid, sampleToHeight, matchTones, keyGreen, makePalette, mapToPalette, bounds, indexPNG, toHex } from './lib/hero.mjs';

const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]); }
const [master, character, name] = pos;
if (!master || !character || !name) { console.error('usage: node tools/hero.mjs <master> <character> <image-name> [--new-palette 48] [--block 4]'); process.exit(1); }
let file = master;
if (!/\.png$/i.test(master)) {
  file = path.join(os.tmpdir(), `hero_${process.pid}.png`);
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', master, file]);
  if (r.status !== 0) { console.error('could not decode the master (needs ffmpeg for .jpg):', String(r.stderr)); process.exit(1); }
}
const decode = (f) => { if (/\.png$/i.test(f)) return PNG.sync.read(fs.readFileSync(f)); const t = path.join(os.tmpdir(), `hero_${process.pid}_${path.basename(f)}.png`); const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', f, t]); if (r.status !== 0) throw new Error('ffmpeg failed on ' + f); return PNG.sync.read(fs.readFileSync(t)); };
const sample = (png) => (opt.height ? sampleToHeight(png, Number(opt.height)) : sampleGrid(png, Number(opt.block || 4)));
const grid = keyGreen(sample(PNG.sync.read(fs.readFileSync(file))));
// colour consistency: match this generation's tones to a reference image of the same character (e.g. its master)
if (opt.match) { matchTones(grid, keyGreen(sample(decode(opt.match)))); console.log('tones matched to', path.basename(opt.match)); }
const palFile = path.resolve('tools/palettes', `${character}.json`);
let palette;
if (opt['new-palette']) {
  if (fs.existsSync(palFile)) { console.error(`${palFile} exists: the palette is locked. Delete it on purpose to remake it.`); process.exit(1); }
  palette = makePalette(grid, Number(opt['new-palette']));
  fs.mkdirSync(path.dirname(palFile), { recursive: true });
  fs.writeFileSync(palFile, JSON.stringify({ character, made_from: path.basename(master), colours: palette.map(toHex) }, null, 1) + '\n');
  console.log(`locked ${palette.length} colours -> ${path.relative(process.cwd(), palFile)}`);
} else {
  if (!fs.existsSync(palFile)) { console.error(`no locked palette for '${character}': run once with --new-palette 48`); process.exit(1); }
  palette = JSON.parse(fs.readFileSync(palFile, 'utf8')).colours.map((h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; });
}
const idx = mapToPalette(grid, palette), crop = bounds(idx, grid.w, grid.h);
const outFile = path.resolve('art/heroes', `${character}_${name}.png`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, indexPNG(idx, grid.w, grid.h, palette, { crop }));
const prev = path.resolve('tools/scratch/heroes', `${character}_${name}_4x.png`);
fs.mkdirSync(path.dirname(prev), { recursive: true });
fs.writeFileSync(prev, indexPNG(idx, grid.w, grid.h, palette, { crop, s: 4, bg: [0x5b, 0x8f, 0xb0] }));
const used = new Set(idx.filter((k) => k >= 0)).size;
console.log(`${path.relative(process.cwd(), outFile)}: ${crop[2] - crop[0] + 1} x ${crop[3] - crop[1] + 1} px, ${used} of ${palette.length} colours (grid ${grid.w} x ${grid.h}, phase ${grid.phase.join(', ')})`);
