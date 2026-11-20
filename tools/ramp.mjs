// M4.9: print a hue-shifted colour ramp (dark -> light) to add to tools/palette.mjs under new keys.
// usage: node tools/ramp.mjs <n> [--hue 48] [--shift 50] [--sat 0.8] [--satDrop 0.35] [--light 0.15,0.85] [--keys abcdef]
//   the dark end turns toward blue-violet, the light end toward yellow (codixel's hueRamp; see tools/lib/light2d.mjs)
import { hueRamp } from './lib/light2d.mjs';
const a = process.argv.slice(2), o = {};
for (let i = 1; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[++i];
const n = Number(a[0] || 6);
const ramp = hueRamp(n, { hue: Number(o.hue ?? 110), shift: Number(o.shift ?? 60), sat: Number(o.sat ?? 0.55), satDrop: Number(o.satDrop ?? 0.35), light: (o.light ?? '0.12,0.62').split(',').map(Number) });
const keys = o.keys ? [...o.keys] : null;
console.log(ramp.map((c, i) => (keys ? `  '${keys[i]}': '${c}',` : c)).join('\n'));
