// A contact sheet of a recorded shot, to pick cut points by eye:
//   node tools/promo/sheet.mjs hw 02 11.9 20.4 [cols] [out.png]   -> every frame between, tiled, each stamped with its time
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync } from 'node:fs';

const [shoot, prefix, a, b, cols = '6', out0] = process.argv.slice(2);
const dir = `promo/raw/${shoot}/` + readdirSync(`promo/raw/${shoot}`).find((f) => f.startsWith(prefix + '_'));
const c = +cols, rows = c, n = c * rows; // a square grid
const f0 = Math.round(+a * 60), f1 = Math.round(+b * 60), step = Math.max(1, Math.round((f1 - f0) / n));
mkdirSync('promo/tmp', { recursive: true });
const out = out0 ?? `promo/tmp/sheet_${shoot}_${prefix}_${a}.png`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-start_number', String(f0), '-i', `${dir}/%05d.png`,
  '-vf', `select='not(mod(n\\,${step}))',drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='%{eif\\:(n*${step}+${f0})/60\\:d}.%{eif\\:mod((n*${step}+${f0})*100/60\\,100)\\:d\\:2}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=${c}x${rows}:padding=2`,
  '-frames:v', '1', out], { stdio: 'inherit' });
console.log(out, `step ${(step / 60).toFixed(3)} s`);
