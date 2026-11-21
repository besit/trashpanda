// M4.10: the hero images, made from AI-generated masters (Gemini) by tools/hero.mjs: true pixel art on each character's
// locked 48-colour palette (tools/palettes/<character>.json, registered in tools/palette.mjs). The masters stay out of
// the repo (reference/ is private); the converted pixels live in art/heroes/<character>_<name>.png.
// heroImage('raccoon', 'master') returns an Img with palette keys, like every other sprite.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { Img } from '../lib/raster.mjs';
import { PALETTE } from '../palette.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../art/heroes');
const keyOf = new Map(Object.entries(PALETTE).map(([k, hex]) => [hex.toLowerCase(), k]));
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

export function heroImage(character, name) {
  const p = PNG.sync.read(fs.readFileSync(path.join(root, `${character}_${name}.png`)));
  const img = new Img(p.width, p.height);
  for (let i = 0; i < p.width * p.height; i++) {
    if (p.data[i * 4 + 3] < 128) continue;
    const k = keyOf.get(hex(p.data[i * 4], p.data[i * 4 + 1], p.data[i * 4 + 2]));
    if (!k) throw new Error(`${character}_${name}.png: a colour outside the palette at pixel ${i}`);
    img.px[i] = k;
  }
  return img;
}
export const raccoonHero = () => heroImage('raccoon', 'master');
export const dogHero = () => heroImage('dog', 'master');
export function heroesPreview() { return { frames: [raccoonHero(), dogHero()], cols: 2 }; }
