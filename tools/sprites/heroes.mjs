// M4.10: the hero images, made from AI-generated masters (Gemini) by tools/hero.mjs: true pixel art on each character's
// locked 48-colour palette (tools/palettes/<character>.json, registered in tools/palette.mjs). The masters stay out of
// the repo (reference/ is private); the converted pixels live in art/heroes/<character>_<name>.png.
// heroImage('raccoon', 'stand') returns an Img with palette keys, like every other sprite.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { Img } from '../lib/raster.mjs';
import { PALETTE } from '../palette.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../art/heroes');
const keyOf = new Map(Object.entries(PALETTE).map(([k, hex]) => [hex.toLowerCase(), k]));
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

export function heroImage(character, name, dir = root) {
  const p = PNG.sync.read(fs.readFileSync(path.join(dir, `${character}_${name}.png`)));
  const img = new Img(p.width, p.height);
  for (let i = 0; i < p.width * p.height; i++) {
    if (p.data[i * 4 + 3] < 128) continue;
    const k = keyOf.get(hex(p.data[i * 4], p.data[i * 4 + 1], p.data[i * 4 + 2]));
    if (!k) throw new Error(`${character}_${name}.png: a colour outside the palette at pixel ${i}`);
    img.px[i] = k;
  }
  return img;
}
/** M4.13: a whole scene made by tools/scene.mjs (art/scenes/<scene>_<name>.png), e.g. sceneImage('sunset', 'wide') */
export const sceneImage = (scene, name) => heroImage(scene, name, path.join(root, '../scenes'));
export function sunsetScenePreview() { return { frames: [sceneImage('sunset', 'wide'), sceneImage('sunset', 'tall')], cols: 2 }; }
/** M4.14: the title poster's skyline (Ivan's reference, emblem and words removed) */
export function titleScenePreview() { return { frames: [sceneImage('title', 'wide'), sceneImage('title', 'tall')], cols: 2 }; }
/** every hero image in art/heroes, for the art history */
export function heroesPreview() {
  const names = fs.readdirSync(root).filter((f) => /^(raccoon|dog)_.+\.png$/.test(f)).sort();
  return { frames: names.map((f) => { const [, c, n] = f.match(/^(raccoon|dog)_(.+)\.png$/); return heroImage(c, n); }), cols: 6 };
}
