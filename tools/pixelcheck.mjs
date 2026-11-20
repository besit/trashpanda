// M4.9: lint any sprite function and write its review views.
// usage: node tools/pixelcheck.mjs <module.mjs> <exportFn> [args...] [--out dir] [--name n] [--ascii x,y,w,h]
//   e.g. node tools/pixelcheck.mjs tools/sprites/portraits.mjs dogPortrait2d grin 1.5 --out tools/scratch/pc
// Prints the findings and the colour usage; writes <name>_findings.png (problems boxed) and <name>_values.png (the
// picture in greys) to --out. --ascii prints that region as palette keys with rulers.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { lint, colorUsage, ascii, valuesPNG, findingsPNG } from './lib/pixelcheck.mjs';

const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]); }
const [mod, fn, ...args] = pos;
if (!mod || !fn) { console.error('usage: pixelcheck <module.mjs> <exportFn> [args...] [--out dir] [--name n] [--ascii x,y,w,h]'); process.exit(1); }
const m = await import(pathToFileURL(path.resolve(mod)).href);
const img = m[fn](...args.map((a) => (a !== '' && !isNaN(Number(a)) ? Number(a) : a)));
const name = opt.name || [fn, ...args].join('_');
const findings = lint(img);
console.log(`${name}: ${img.w}x${img.h}`);
if (!findings.length) console.log('  clean');
for (const f of findings) console.log(`  [${f.rule}] ${f.message}${f.at.length ? ' at ' + f.at.slice(0, 8).map(([x, y]) => `(${x},${y})`).join(' ') + (f.at.length > 8 ? ' ...' : '') : ''}`);
const use = colorUsage(img);
console.log(`  ${use.length} colours; top: ${use.slice(0, 8).map((u) => `${u.c} ${(u.share * 100).toFixed(0)}%`).join(', ')}`);
if (opt.out) {
  fs.mkdirSync(opt.out, { recursive: true });
  fs.writeFileSync(path.join(opt.out, `${name}_findings.png`), findingsPNG(img, findings, 4));
  fs.writeFileSync(path.join(opt.out, `${name}_values.png`), valuesPNG(img, 2));
  console.log(`  wrote ${name}_findings.png, ${name}_values.png in ${opt.out}`);
}
if (opt.ascii) { const [x, y, w, h] = opt.ascii.split(',').map(Number); console.log(ascii(img, x, y, w, h)); }
