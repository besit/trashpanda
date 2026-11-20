# Portrait loop 2 (M4.8): shared brief for the ARTIST and the JUDGE

Project: "Trash Panda: Right of Way", a Phaser pixel-art game. Repo root: c:\Users\besit\git\trashpanda (Windows; use the
Bash tool with POSIX syntax, `cd /c/Users/besit/git/trashpanda`). Work files live in `tools/scratch/piter2/` (gitignored).

## What Ivan (the project lead) asked for
After the first 9-round loop (M4.7) he said:

> "Ok, the characters look better, but I want you to run another 10 rounds. This time let's focus on getting quality
> closer to raccoon-ref_03.jpg. Dog's head from iter_04 looks the best, but other aspects from iter_09.
> I want the artist agent to be far more creative. No need to draw the same thing over and over again. Let there be
> more freedom for them to steer away, change colors, poses. And let's make sure the pump is straight. Right now it's
> bent. I want to achieve a far better artistic quality of the images."

So the goal of this loop is **artistic quality**, not small corrections. Treat the current art as a rough draft.

## The quality bar: `reference/raccoon-ref_03.jpg`
Open it and study it before anything else (also refs 04 and 05, which Ivan likes too). What makes ref 03 good:
- **Rich value ramps with hue shift.** Each material has 5 to 7 tones, not 3. Shadows go cool (blue-violet greys),
  lights go warm or bright. Form is modelled by value: the forehead and brow bands catch light, the muzzle has volume,
  the mask has a soft sheen, cheeks fall into shadow.
- **Fur is drawn, not filled.** Directional clusters of 2 to 4 pixel strokes follow the fur flow. Edges are tufted and
  jagged (cheek ruffs, ear fringes, white brow tufts breaking the outline), not smooth vector curves.
- **Selective outlining.** The silhouette has a dark edge, but inner forms are separated by colour and value, not by
  black lines everywhere. Lit edges can lose their outline.
- **The eyes are the focal point.** Iris with a light-to-dark gradient, a dark pupil, a crisp highlight, a dark lid
  rim, a little wet sparkle. They carry the character.
- **Clean clusters.** No orphan pixels, no noisy dithering, no banding (parallel stair-step bands), no pillow shading
  (shading that just follows the outline inward).
- **Small details that sell it:** whiskers, a wet nose highlight, the inside of the ears, light catching the fur tips.

The current art (`iter_00.png`, `iter_00_hero.png`) is flat vector shapes with 3 tones and black lines between
regions. That is what has to change.

## Creative freedom (Ivan explicitly wants this)
You are an illustrator here, not a technician applying fixes. Within the hard constraints below you may change:
- **Poses**: how the raccoon holds the pump (leaning on it, shouldering it like a bat, planting it like a staff, mid-
  pump...), the tilt of the head, the arms, the attitude. Dog Fjord's shoulders, posture and angle of the bust.
- **Colours**: palettes, accent colours, the colour of the pump (it doesn't have to stay yellow), the suit, the tie,
  fur temperature. You may add new colours to `tools/palette.mjs` under NEW single-character keys (digits, symbols,
  unused letters), for example a 6-step raccoon grey ramp. Additive only: never change or remove an existing key.
- **Costume and props**: a bandana or scarf (like refs 03 and 04), a cycling cap, gloves, a lapel pin, a flag pin,
  anything that adds character and fits the satire (a raccoon cyclist versus a car-loving bulldog politician).
- **Rendering approach**: hand-placed fur strokes, new toolkit helpers, a whole new way of building the drawing.
Don't redraw the same thing over and over. If a direction stalls, try something genuinely different.

## Hard constraints
1. **The pump is straight.** It is one rigid tube: the T-handle is perpendicular to the shaft, and the handle, rod,
   barrel and foot all lie on ONE straight axis (the current code has a vertical rod meeting a tilted barrel, so the
   pump looks bent). Only the hose may curve. Vertical, or a clean angle; check it on the close-up.
2. **Dog Fjord's head shape comes from M4.7 iteration 04** (Ivan: "Dog's head from iter_04 looks the best, but other
   aspects from iter_09"). See `ref_iter04.png` / `ref_iter04_hero.png`; its code is
   `variants/m47_v05.mjs` (iteration 09 = the current `tools/sprites/portraits.mjs`, also copied to
   `variants/m47_v10.mjs`). Keep iter_04's head silhouette: the broad rounded outline, the ears low at the upper
   sides, the compact swept hair. Take everything else from iter_09 as the starting point (the face features, the
   expressions, the small-size eye fix) and then push all of it to a far higher quality.
3. **Dog Fjord is a cartoon dog** and a satirical character. He must NOT resemble a real person. **Do not open
   `reference/DogFjord.jpg`.** His established traits: big pink bulldog head with jowls, grey combed hair, folded ears,
   a brown heart-shaped patch around one eye, thick brows, big black dog nose, a smug toothy grin, dark suit, white
   shirt, tie. Three expressions: `grin`, `laugh`, `shock`.
4. **The raccoon** faces RIGHT (toward Dog Fjord on the VERSUS posters), has a smirk, a bandit mask, white brows, grey
   fur, and holds a bike floor pump (T-handle, barrel, gauge, hose). The picture must stay inside the 232 x 208 frame
   with a finished bottom edge: Ivan said a bust that runs off the bottom "looks cut off". Transparent background (the
   posters place it over their own art); no background scene.
5. **Sizes.** Both are drawn on the 232 x 208 design grid at scale k: k = 1.5 (posters, 348 x 312; the hero size),
   k = 1 (posters), and Dog Fjord at k = 112/232 (his in-game dialogue portrait, 112 x 100, shown 2x in cutscenes).
   He must read clearly at 112: eyes, nose and mouth distinct, nothing merging. Fine texture can be dropped at small
   scales (check `c.S`) so small sizes stay clean rather than noisy.
6. **Pure 2D pixel art in code.** No 3D/SDF rendering, no per-pixel lighting maths, no image files as input. Shapes,
   strokes and hand-placed pixels. Nothing may be traced from a reference image (the refs teach craft, not content).
7. **Code boundaries.** The ARTIST edits `tools/sprites/portraits.mjs`, may extend `tools/lib/draw2d.mjs` (backwards
   compatible: other sprites use it) and may add keys to `tools/palette.mjs`, plus its own files in
   `tools/scratch/piter2/`. Keep the exports and signatures: `raccoonPortrait2d(expr = 'smirk', k)`,
   `dogPortrait2d(expr, k)`, `GW = 232`, `GH = 208`, `portraitsPreview()`. Don't touch `src/`, don't run
   `tools/build-assets.mjs`, don't git commit. The JUDGE edits no code.

## Rendering
- `node tools/scratch/piter2/render.mjs tools/scratch/piter2/iter_NN.png` renders the current
  `tools/sprites/portraits.mjs` into `iter_NN.png` (the overview: poster size, then small sizes and the in-game
  112 x 100 portraits at 1x and 2x) and `iter_NN_hero.png` (the close-up at k = 1.5, 4 screen pixels per art pixel).
  Open them with the Read tool; it shows images.
- `--module <path>` renders another copy of the module instead, for variants. A copy in
  `tools/scratch/piter2/variants/` must import `'../../../lib/draw2d.mjs'` instead of `'../lib/draw2d.mjs'`.

## Rounds
- **Rounds 01 to 03 are exploration.** The ARTIST makes 2 or 3 genuinely different takes per round as
  `variants/rNN_a.mjs`, `rNN_b.mjs`, ... (different poses, palettes, rendering approaches, costume), renders each
  (`variants/rNN_a.png` etc.), puts its favourite into `tools/sprites/portraits.mjs`, and renders that as `iter_NN`.
  The JUDGE ranks all variants and names the direction to pursue (or which parts to combine).
- **Rounds 04 to 10 refine** the chosen direction toward ref 03 quality. One bold "wildcard" variant per round is
  still welcome when something is stuck.

## Files per round NN
- ARTIST: `iter_NN.png` + `iter_NN_hero.png`, variant files in exploration rounds, and `artist_NN.md` (what you tried,
  why, what you would do next). Snapshot the art history every round (the history is never overwritten):
  `node tools/snapshot.mjs portraits_2d tools/sprites/portraits.mjs portraitsPreview "M4.8 round NN: <one line>" 3`
  and in exploration rounds also each variant:
  `node tools/snapshot.mjs portraits_2d_explore tools/scratch/piter2/variants/rNN_a.mjs portraitsPreview "M4.8 round NN variant a: <one line>" 3`
- JUDGE: `judge_NN.md`: a score out of 10 for each character on a fixed scale where **ref 03's craft = 9 to 10** and
  the M4.7 iteration 09 baseline is scored in `judge_00.md`; what improved; the ranked list of what still separates it
  from ref 03 (be specific: where, which pixels, which colours); the constraint checks (pump straight, iter_04 head,
  112 readability, nothing cut off, no real-person likeness); and a "keep, don't touch" list of what's working.
