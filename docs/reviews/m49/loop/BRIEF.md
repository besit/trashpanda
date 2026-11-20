# Portrait loop 3 (M4.9): shared brief for the PAINTER and the CRITIC

Project: "Trash Panda: Right of Way", a Phaser pixel-art game. Repo root: c:\Users\besit\git\trashpanda (Windows; use the
Bash tool with POSIX syntax, `cd /c/Users/besit/git/trashpanda`). Work files live in `tools/scratch/piter3/` (gitignored).

## What Ivan (the project lead) said after the last loop (M4.8)

> "I liked the iter_02 of the raccoon. The pose and general vibe. Though I am not in love with the drawing style in
> general. It feels like a toddler drawing in terms of separate shapes like fingers, arms. I want it to feel more
> professional with drawing from shades, not from shapes if you understand what I mean. And iter_10 of the raccoon also
> seems nice, though again - separate shapes look awkward. The pump should be yellow as in the game.
> For the dog, honestly the iter_01 was the best in my opinion. It's pretty minimal and not overly detailed. You seem to
> design from details like you think "nose" and draw a shape. When professional artists draw, they don't think about
> separate parts of the body or object, they think about how light is scattered and reflected, where are shadows and
> where are highlights. This makes for a good drawing."

His favourites, at 1x: `tools/scratch/piter3/iter_00_favs.png` (left to right: raccoon M4.8 iter_02, raccoon M4.8
iter_10, Dog Fjord M4.8 iter_01, then the current art). Close-ups: `docs/reviews/m48/variants/r02_a_hero.png` (the raccoon
he likes most), `docs/reviews/m48/iterations/iter_10_hero.png`, `docs/reviews/m48/iterations/iter_01_hero.png` (the dog).
Their code: `variants/m48_v12.mjs` (raccoon iter_02), `variants/m48_v20.mjs` (iter_10), `variants/m48_v11.mjs` (dog
iter_01). The quality bar is still `reference/raccoon-ref_03.jpg` (also refs 04 and 05).

## The core change: paint with light, not with parts
Until now each body part was its own flat shape with its own shading and its own outline: an arm shape, a hand shape,
five finger shapes, a nose shape. That is what reads as "a toddler drawing". A painter works the other way round:

1. **Silhouette first.** The whole figure as one or two big readable masses. Get the gesture and the outline right
   before any detail.
2. **One light, big value masses.** Light from the upper left. Decide where the light hits the WHOLE form and where the
   form turns away: the big shadow side of head, body and arms together, then the half-tone, the light, the few
   highlights. A raccoon's head, chest and arms are one lit volume, not a stack of stickers.
3. **Separate parts with light, not lines.** An arm in front of the chest reads because it catches light and casts a
   shadow on the chest; a paw reads as a lit mass with two or three dark creases that suggest fingers; the head reads
   because it casts a shadow under the chin. No outline between parts inside the silhouette. No individually outlined
   fingers.
4. **Details last, and few.** Eyes, nose and mouth are small value accents inside an already lit form: the nose is the
   darkest dark with one highlight where the light hits it; it is not a separate designed shape with its own outline.
   Fur texture only where it explains the form (the edge of the light, the silhouette), never as all-over noise. Every
   tone patch must have a reason you can name (light, shadow, cast shadow, a marking, a crease); a patch with no reason
   is noise.
5. **Restraint.** Ivan liked Dog Fjord iter_01 because it is minimal. Fewer, bigger, cleaner value shapes beat many small
   ones. 3 to 5 tones per material, used as big flat areas, with dither only in a thin strip where two tones meet.

Check it the way a painter does: **look at the values view** (`iter_NN_values.png`, the picture in greys). It must read
as a lit 3D figure in greys alone: a clear light side and shadow side for the whole figure, 3 or 4 value groups, the face
the area of highest contrast.

## New tools (in this repo, use them)
- **`tools/lib/light2d.mjs`** (import it once; it adds methods to draw2d's Canvas). Read its header and comments.
  - `c.shadeForm(parts, ramp, { R, prims, height, curve, strip, ... })`: shades part(s) as ONE form lit from one direction
    (the silhouette inflated into a volume, lit, quantized onto `ramp` = palette keys dark -> light, in flat bands with a
    dither strip). Pass several parts together to merge them into one volume (head + body, arm + body). Small `R` = a
    flat plane with turned edges (graphic, pixel-art); large `R` = a round volume. `prims` (`cap`, `dome`) add volume
    (a muzzle, a cheek, a belly); `height(x, y)` adds folds or ridges; `curve` moves the terminator / contrast.
  - `c.castShadow(from, onto, dx, dy, step)`, `c.occlude(onto, from, r, step)` (a contact crease), `c.rimLight(parts, step)`,
    `stepper(...ramps)` (step a colour darker / lighter along its ramp), `c.line1(pts, c)` (pixel-perfect 1-px lines:
    whiskers, seams).
  - Warning: a full-volume render with smooth gradients is exactly the old 3D "blobby" look Ivan rejected (M4.5). Use
    `shadeForm` for the big light and shadow masses with few bands, then DESIGN the shapes of shadows and lights on top
    (a crisp shadow shape under the brow, a cast shadow of the arm, a sharp highlight). Graphic, not airbrushed.
- **`tools/pixelcheck.mjs`** and `tools/lib/pixelcheck.mjs`: a pixel-art critic. `node tools/pixelcheck.mjs
  tools/sprites/portraits_next.mjs dogPortrait2d grin 1.5 --out tools/scratch/piter3/pc` lists stray (orphan) pixels,
  doubled corners in 1-px lines (jaggy), pillow shading, near-duplicate colours, silhouette nubs / strips / holes, with
  coordinates, and writes a boxed findings PNG and a values PNG. `--ascii x,y,w,h` prints a region as palette keys with
  rulers for exact pixel edits. Nubs and strips are fine on whisker tips and the hose; holes and orphans are not.
- **`tools/ramp.mjs`**: prints a hue-shifted ramp (dark end toward blue-violet, light end toward yellow) to add as new
  palette keys: `node tools/ramp.mjs 6 --hue 46 --shift 40 --sat 0.85 --light 0.18,0.82 --keys abcdef`.

## Directions
- **Raccoon:** M4.8 iter_02's pose and vibe (the warm coat, the pump held across the chest, the scarf, the swagger).
  iter_10's elements (the cap, the planted stance) may come in if they help. **The pump is yellow, like the game's**
  (palette `y` #f5c22e, `Y` #fff08a, `o` #d9691c; build a ramp around them) and **straight** (one axis: `pumpAxis()` in
  the current code). Faces RIGHT (toward Dog Fjord on the VERSUS posters), smirk, bandit mask, white brows. The whole
  figure stays inside the 232 x 208 frame with a finished bottom (Ivan: a figure running off the bottom "looks cut off").
  Keep the face readable: in iter_02 the pump crosses close to the face; keep the pose but make sure the face is clear.
- **Dog Fjord:** M4.8 iter_01 is the target feel: minimal, not overly detailed. Keep its head shape (M4.7 iter_04's
  broad rounded head, ears low at the upper sides, the compact swept grey hair) and his traits: pink bulldog, the wink,
  the smug brown heart-shaped patch eye, big black nose, the wide toothy grin, navy suit, white shirt, red tie (iter_01).
  Three expressions `grin`, `laugh`, `shock`. He must read at 112 x 100 (his in-game dialogue portrait, shown 2x).
  He is a cartoon dog, a satirical character, and must NOT resemble a real person. **Do not open
  `reference/DogFjord.jpg`.**
- **Creative freedom stays:** colours, small pose changes, costume, rendering choices are yours. Ivan's favourites are
  the anchor, not a cage.

## Hard constraints
1. **Do not touch the game.** Work ONLY in `tools/sprites/portraits_next.mjs` (a copy of the game's portraits; the
   game's `tools/sprites/portraits.mjs` must not change). Don't run `tools/build-assets.mjs`, don't touch `src/`, don't
   git commit. Ivan will give the green light before anything goes into the game.
2. Keep the exports and signatures in `portraits_next.mjs`: `raccoonPortrait2d(expr = 'smirk', k)`, `dogPortrait2d(expr, k)`,
   `GW = 232`, `GH = 208`, `portraitsPreview()`. Sizes: k = 1.5 (348 x 312, the hero size), k = 1, and Dog Fjord at
   k = 112/232.
3. `tools/lib/draw2d.mjs` and `tools/lib/light2d.mjs` may be extended, backwards compatible (the game's portraits must
   still render pixel-identical; check with the render of `tools/sprites/portraits.mjs`). `tools/palette.mjs`: add new
   keys only, never change or remove one.
4. Pure 2D pixel art from code: no image files as input, nothing traced from a reference (refs teach craft only).

## Rendering
- `node tools/scratch/piter3/render.mjs tools/scratch/piter3/iter_NN.png` renders `portraits_next.mjs` into
  `iter_NN.png` (overview), `iter_NN_hero.png` (4x close-up), `iter_NN_values.png` (the close-up in greys) and
  `iter_NN_favs.png` (Ivan's favourites next to this round), and prints the pixelcheck summary.
- `--module <path>` renders a variant copy; a copy in `tools/scratch/piter3/variants/` imports
  `'../../../lib/draw2d.mjs'` and `'../../../lib/light2d.mjs'`.

## Rounds
- **Rounds 01 and 02 explore the rendering approach**: 2 or 3 genuinely different takes per round as
  `variants/rNN_a.mjs` ..., each rendered (`variants/rNN_a.png` + `_hero` + `_values`). For example: forms shaded with
  `shadeForm` and few bands; hand-designed shadow shapes over a flat base; a chunkier, fewer-colour version like refs
  04 / 05. The pick goes into `portraits_next.mjs` as `iter_NN`. The critic picks the direction.
- **Rounds 03 to 09 refine** it. A wildcard variant is welcome when something stalls.
- **Round 10 is polish only.**

## Files per round NN
- PAINTER: `iter_NN*.png`, variants in rounds 01 and 02, `painter_NN.md` (what you did, why, what's next). Snapshot every
  round (the history is never overwritten):
  `node tools/snapshot.mjs portraits_2d tools/sprites/portraits_next.mjs portraitsPreview "M4.9 round NN: <one line>" 3`
  and in rounds 01 and 02 each variant:
  `node tools/snapshot.mjs portraits_2d_explore tools/scratch/piter3/variants/rNN_a.mjs portraitsPreview "M4.9 round NN variant a: <one line>" 3`
  Also export the two hero pictures at 1x for Ivan's annotate tool, every round (overwrite):
  `tools/scratch/annotate/raccoon.png` (raccoon k = 1.5) and `tools/scratch/annotate/dog_grin.png` (dog grin k = 1.5).
- CRITIC: `critic_NN.md`: scores out of 10 for each character on a fixed scale (ref 03's craft = 9 to 10; the
  baseline is scored in `critic_00.md`); FIRST the overall appeal and whether it reads as light-driven painting or as
  assembled shapes (look at the values view), compared with Ivan's favourites and the previous round; then the ranked
  fixes (specific: where, which pixels, which colours); the pixelcheck findings that matter; the constraint checks
  (pump yellow and straight, dog head shape, 112 readability, nothing cut off, no real-person likeness); and a
  "keep, don't touch" list.
