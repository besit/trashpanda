// M4.10: (re)build every hero image from its master in one go: node tools/heroes-build.mjs
// The masters are private (reference/gemini/ from Gemini, reference/comfy/ from ComfyUI + Qwen-Image-Edit); the
// converted pixel art is committed in art/heroes/. Each entry: [character, name, master, height in art pixels, match?]
// (match: a reference image of the same character whose tones this generation is matched to before palette mapping).
//   poster images: 1 art pixel = 1 poster pixel (the posters are drawn at twice the game's resolution)
//   dialogue portraits (df_, rc_): 1 art pixel = 1 game pixel, shown at 1x (M4.12, Ivan: the high-resolution ones)
// Sizes are figure heights, so the two characters always come out at matching sizes.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const G = 'reference/gemini/Gemini_Generated_Image_', C = 'reference/comfy/';
export const HEROES = [
  // ----- posters -----
  ['raccoon', 'stand', `${C}raccoon_stand.png`, 250],
  ['dog', 'stand', `${C}dog_full.png`, 250],
  ['raccoon', 'vs', `${C}raccoon_vs.png`, 250, `${C}raccoon_stand.png`], // a warmer generation: tones matched to the standing pose
  ['dog', 'vs', `${C}dog_vs.png`, 250],
  ['raccoon', 'bust', `${G}15qpmo15qpmo15qp.jpg`, 220],
  ['raccoon', 'angry_bust', `${C}raccoon_angry_bust.png`, 220],
  ['dog', 'bust', `${G}x9yb3zx9yb3zx9yb.jpg`, 220],
  ['dog', 'laugh_bust', `${G}bhrm7rbhrm7rbhrm.jpg`, 220],
  ['dog', 'angry_bust', `${C}dog_angry.png`, 220],
  ['raccoon', 'bust_sm', `${G}15qpmo15qpmo15qp.jpg`, 132], // M4.12 (Ivan): smaller, so more of him fits the bosses poster's cell
  ['raccoon', 'bike', `${G}fthwv8fthwv8fthw.jpg`, 220],
  // ----- dialogue portraits (cutscenes) -----
  ['dog', 'df_grin', `${G}x9yb3zx9yb3zx9yb.jpg`, 200],
  ['dog', 'df_laugh', `${G}bhrm7rbhrm7rbhrm.jpg`, 200],
  ['dog', 'df_shock', `${G}kmbf1rkmbf1rkmbf.jpg`, 200],
  ['dog', 'df_angry', `${C}dog_angry.png`, 200],
  ['raccoon', 'rc_rest', `${C}raccoon_face_rest.png`, 72],
  ['raccoon', 'rc_happy', `${C}raccoon_face_happy.png`, 72],
  ['raccoon', 'rc_angry', `${C}raccoon_face_angry.png`, 72],
  ['raccoon', 'rc_shock', `${C}raccoon_face_shock.png`, 72],
  // the same faces at twice the size: kept for later (Ivan: too big beside the dialogue box), not in the game
  ['raccoon', 'rc_rest_lg', `${C}raccoon_face_rest.png`, 144],
  ['raccoon', 'rc_happy_lg', `${C}raccoon_face_happy.png`, 144],
  ['raccoon', 'rc_angry_lg', `${C}raccoon_face_angry.png`, 144],
  ['raccoon', 'rc_shock_lg', `${C}raccoon_face_shock.png`, 144],
];
if (process.argv[1] && process.argv[1].endsWith('heroes-build.mjs')) {
  const only = process.argv[2];
  for (const [character, name, master, height, match] of HEROES) {
    if (only && !name.includes(only)) continue;
    if (!fs.existsSync(master)) { console.log(`skip ${character}_${name}: no master (${master})`); continue; }
    const r = spawnSync(process.execPath, ['tools/hero.mjs', master, character, name, '--height', String(height), ...(match ? ['--match', match] : [])], { encoding: 'utf8' });
    process.stdout.write(r.stdout || ''); if (r.status !== 0) { process.stderr.write(r.stderr); process.exit(1); }
  }
}
