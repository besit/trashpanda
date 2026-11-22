// M4.10: make (and lock) a hero character's palette from SEVERAL masters at once, so every pose's colours are covered
// (one master alone missed colours that only other poses have: dark warm browns came out as the bandana's dark reds).
// usage: node tools/hero-palette.mjs <character> <colours> <master> [master ...] [--force]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { sampleToHeight, keyGreen, makePalette, toHex } from './lib/hero.mjs';
const args = process.argv.slice(2), force = args.includes('--force'), [character, n, ...masters] = args.filter((a) => a !== '--force');
if (!character || !masters.length) { console.error('usage: node tools/hero-palette.mjs <character> <colours> <master> [master ...] [--force]'); process.exit(1); }
const file = path.resolve('tools/palettes', `${character}.json`);
if (fs.existsSync(file) && !force) { console.error(`${file} exists (locked). Pass --force to remake it on purpose.`); process.exit(1); }
const decode = (f) => { if (/\.png$/i.test(f)) return PNG.sync.read(fs.readFileSync(f)); const t = path.join(os.tmpdir(), `hp_${process.pid}_${path.basename(f)}.png`); if (spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', f, t]).status) throw new Error('ffmpeg failed on ' + f); return PNG.sync.read(fs.readFileSync(t)); };
const all = { rgb: [] };
for (const m of masters) { const g = keyGreen(sampleToHeight(decode(m), 200)); all.rgb.push(...g.rgb.filter(Boolean)); }
const palette = makePalette(all, Number(n));
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ character, made_from: masters.map((m) => path.basename(m)), colours: palette.map(toHex) }, null, 1) + '\n');
console.log(`locked ${palette.length} colours from ${masters.length} masters -> ${path.relative(process.cwd(), file)}`);
