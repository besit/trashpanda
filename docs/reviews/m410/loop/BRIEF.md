# Raccoon style study (M4.10): shared brief for the five PAINTERS and the CRITIC

Project: "Trash Panda: Right of Way", a Phaser pixel-art game. Repo root: c:\Users\besit\git\trashpanda (Windows; use the
Bash tool with POSIX syntax, `cd /c/Users/besit/git/trashpanda`). Work files live in `tools/scratch/piter4/` (gitignored).

## What Ivan (the project lead) asked
After the last loop (M4.9, "paint with light, not with parts"): "ok, I am not in love with how it looks, but it seems
better. Can we do another 5 round polish on the raccoon? I want to understand what is the recipe for the best
pixel-art possible. Can you try and redraw the current state of him in a couple of techniques / styles? First one would
be to just polish to the max trying to achieve ref_03 style. Another one would be trying to achieve ref_04 style. Then
one that is the most naive, one that is the most detailed and one freestyle. For each do a try and then run a critique
agent to give feedback and then do another pass."

So: **the same raccoon, five techniques**, each drawn, critiqued, and drawn again. The goal is as much to LEARN what
makes the best pixel art (and to show Ivan the difference side by side) as to produce a final picture.

## The subject (keep it in every style)
The current raccoon: `tools/scratch/piter4/pass0_hero.png` (4x), `pass0_1x.png` (how it is seen), `pass0_values.png`.
- three-quarter view facing RIGHT, a smirk, bandit mask, white brow bands, warm grey-brown coat, cream muzzle and bib
- a green scarf, the yellow bike floor pump (the game's yellow: palette `y` #f5c22e, `Y` #fff08a, `o` #d9691c) held
  diagonally across the chest, STRAIGHT on one axis (T-handle, rod, barrel, gauge, foot; only the hose curves)
- the ringed tail curling up at the left; the whole figure inside the 232 x 208 design frame with a finished bottom
- the pose, the props and the character stay. The TECHNIQUE changes. Small design changes that a style needs are fine.

## The five styles (one painter each)
1. **ref03**: `reference/raccoon-ref_03.jpg` polished to the max. Hand-clustered fur on every turning surface, rich
   hue-shifted ramps, colour picked up from neighbours, wet detailed eyes, soft light, a painterly pixel finish.
2. **ref04**: `reference/raccoon-ref_04.jpg`. A chunky cartoon game sprite: bold dark outlines, big simple readable
   shapes, flat cel shading in few tones, a big expressive face, strong silhouette.
3. **naive**: the most naive possible. Very few colours, very simple shapes, the least rendering that still reads as
   this raccoon with his pump. Charm through simplicity (think the simplest good indie sprite, not a bad drawing).
4. **detailed**: the most detailed possible. Every surface rendered: fur direction everywhere, material detail on the
   pump (chrome, rubber, painted metal, the gauge face), the scarf's knit, micro-highlights, many tones. Push detail as
   far as it can go while it still reads.
5. **free**: freestyle. Your own best idea of great pixel art for this character: a style, palette, lighting or
   rendering approach of your choice. Surprise us.

## Shared craft knowledge (from earlier loops; Ivan's taste)
- Ivan dislikes art that looks "assembled from separate shapes" (fingers, arms, a nose drawn as stickers). He wants it
  drawn "from shades": one light, form explained by light and shadow. Even the naive and ref04 styles should feel
  drawn, not assembled (in those styles a bold outline is part of the style, which is fine).
- He rejected soft airbrushed 3D renders ("blobby"). Pixel art is crisp: clusters, deliberate pixels, hard bands.
- The light comes from the upper left. Check every pass in greys (the values view): one light side, one shadow side,
  the face as the contrast peak.
- Keep the native pixel grid: one art pixel = one screen pixel at the size the game shows it (k = 1.5 and k = 1). No
  drawing small and upscaling (mixed pixel sizes next to the game's other art), unless your style is built around a
  deliberate 2x2 cluster grid (then say so).

## Tools (read their headers)
- `tools/lib/draw2d.mjs`: shapes, part masks, outlines, fur helpers. `tools/lib/light2d.mjs`: light-first shading
  (shadeForm, the value-map pipeline used by the current raccoon, castShadow, rimLight, line1 pixel-perfect lines,
  hueRamp, band). `tools/lib/raster.mjs`: the Img (palette-key pixels; you can also set pixels directly:
  `img.px[y * img.w + x] = key`, or `Img.fromGrid` for hand-drawn text grids).
- `tools/pixelcheck.mjs`: the pixel critic (stray pixels, jaggies, pillow shading, near-duplicate colours, silhouette
  defects) plus the values view and an ASCII view with rulers for exact pixel edits.
- `tools/ramp.mjs`: hue-shifted ramps.
- **Colours: do NOT edit `tools/palette.mjs`** (five painters work at once). Register your own colours at run time in
  your module: `import { registerColors } from '../../../lib/raster.mjs'; registerColors({ 'Α': '#7a5f66', ... })`.
  Use ONLY the keys of your block (existing palette keys may be used freely too):
  - ref03: Greek capitals U+0391 to U+03A9 and Greek lowercase U+03B1 to U+03C9 (Α..Ω, α..ω)
  - ref04: Cyrillic capitals U+0410 to U+042F (А..Я)
  - naive: Cyrillic lowercase U+0430 to U+044F (а..я)
  - detailed: Hiragana U+3041 to U+3096 (ぁ..ゖ)
  - free: Katakana U+30A1 to U+30FA (ァ..ヺ)

## Hard constraints
1. Each painter edits ONLY its own folder `tools/scratch/piter4/<style>/` (its `raccoon.mjs`, which starts as a copy of
   the current art, plus helper files there). Do not edit `tools/lib/*`, `tools/palette.mjs`, `tools/sprites/*`, `src/`;
   copy any helper you want to change into your own folder. No git commits, no `tools/build-assets.mjs`.
2. `raccoon.mjs` must export `raccoonPortrait2d(expr = 'smirk', k)` (k = 1.5 and k = 1, on the 232 x 208 design grid:
   348 x 312 and 232 x 208 pixels) and `portraitsPreview()` returning `{ frames: [raccoonPortrait2d('smirk', 1.5),
   raccoonPortrait2d('smirk', 1)], cols: 2 }`. The dog code may be deleted.
3. Pure pixel art from code: no image files as input, nothing traced from the references (they teach craft only).

## Render and record
- `node tools/scratch/piter4/render.mjs <style> <pass>` writes `<style>/pass<N>_hero.png`, `_1x.png`, `_values.png` and
  prints the pixelcheck summary. Look at all three with the Read tool and iterate inside the pass.
- Snapshot each pass: `node tools/snapshot.mjs raccoon_style_<style> tools/scratch/piter4/<style>/raccoon.mjs
  portraitsPreview "M4.10 <style> pass <N>: <one line>" 3`
- Write `<style>/painter_pass<N>.md`: what the style is, the recipe you used (palette size and ramps, outline strategy,
  how light and form are rendered, how texture is made, what you deliberately left out), and what you'd do next.
- CRITIC writes `tools/scratch/piter4/critic_pass<N>.md` covering all five styles (a score out of 10 each against its
  own target and on one common scale where ref 03 = 9.5, the top fixes per style for the next pass), and after pass 2
  `tools/scratch/piter4/RECIPE.md`: what the study showed about the recipe for the best pixel art.
