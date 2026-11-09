// Renders a sprite module's frames, scaled up on a backdrop, for visual review.
// usage: node tools/preview.mjs <module> <exportFn> <outfile> [scale] [cols]
import { sheet, save } from './lib/raster.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const [mod, fn, out, scale = '6', cols = '0'] = process.argv.slice(2);
const m = await import(pathToFileURL(path.resolve(mod)).href);
const res = m[fn]();
const frames = res.frames ?? res;
save(sheet(frames, Number(cols) || frames.length), out, Number(scale), '#5a8fb0');
console.log(`wrote ${out} (${frames.length} frames)`);
