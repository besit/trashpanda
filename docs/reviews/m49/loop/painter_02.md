# Painter, round 02: lit volume, cel bands

## The approach for both characters
The rendering is the critic's "a lit, b cut":
- **The value map is round 01 a's.** Each mass is lit as a volume (`lightField`), with `tubeField` for the pump and the
  designed cast shadows on top.
- **It is quantized the b way.** `paintLight` runs with `strip: 0`, so band edges are hard and there is no dither anywhere
  (skin, coat, cloth, suit, patch, scarf).
- **3 or 4 tones per material plus one accent**, the accent being the first tone of each ramp.
- **Designed shadow shapes on top**, applied as `mul` in the value map in every variant: the raccoon's body side and chin,
  and Dog's two jowl undersides and the far cheek plane. The highlight shapes are the brow and the muzzle top.

## The critic's top 6 fixes
1. **Unified render.** As above. The checker on the suit, patch and scarf is gone.
2. **Arms and paws (variant a).**
   - The near arm and both paws are the coat material. The forearm is the coat turning, not a new material.
   - Each arm is now a tube that bends at the elbow (`cap` prims along the bones), so the inner elbow no longer caves in.
   - The forearm reads through light alone: a lit top edge (`litEdge`, a new crescent toward the light), the underside in
     the body's shadow band, and a crisp cast shadow onto the cream bib below it.
   - The near paw is mostly lit fur: a knuckle row of domes, 2 creases on the back only, the finger band shaded where it
     turns over the barrel, and a thumb hooked over the barrel. The thumb is its own small form and casts onto the paw and
     the barrel.
   - The far paw now holds the barrel from behind. It is drawn before the pump, so it no longer reads as a second sticker.
   - Squint test on `r02_a_values.png`: the arm sinks into the body's light and shadow. It shows only as a lit edge on top
     and a shadow below.
3. **Torso.**
   - The coat is a ramp step lighter and warmer (`$ % & J *`).
   - A cream bib sits between the scarf and the forearm. The near paw moved down the barrel (HN 58 to 50) to make room.
   - No fur breaks on the torso; its tufts are only on the bottom edge. Fur breaks remain only on the head (gap 4.6, wide
     strokes).
4. **Dog.**
   - The forehead dome prim is gone; its hard bands drew contour rings across the forehead. Two folds remain.
   - Hair: 3 ridges instead of 4, lower and wider, with a single dark outline (the old lit/dark alternation along the top
     made orphans).
   - The near jowl is one smooth dome with one groove (no pouches).
   - The skin ramp is `§ £ Q / ¢`: lit is `/` and `Q`, the shadow is the pink side plane `£`, and the mauve `§` appears
     only in creases and cast shadows. He is back to a light salmon, no longer sunburnt.
5. **Value hierarchy.**
   - The gauge face is light grey (`7`) with a `6` arc; pure white is kept for glints.
   - The scarf's darkest tone `e` sits above the mask's `@`.
   - On Dog, the nose and the patch eye are the darkest darks.
6. **Tail and clean-up.**
   - The tail now tapers to about 45% and curls right at the top, with a dark oval tip (no stub "hand").
   - The pump axis is about 3 units lower. The gauge moved down the barrel to clear the near paw.
   - New `dejag()` in light2d: the pixelcheck jaggy rule turned into a fixer. It runs after `silhouette()` +
     `cleanSilhouette()`, then `despeckle`.
   - pixelcheck on the pick: raccoon 4 orphans (was 24) and 5 jaggies (was 14); dog 3 orphans (was 22) and 2 jaggies. The
     remaining 24 nubs and 33 strips are the whiskers, the hose and the chin tuft.

## The variants
| | what | read |
|---|---|---|
| **r02_a** (picked) | main candidate: coat-coloured arms and paws, cream bib, calm torso | the arms belong to the body; the raccoon is light and warm like iter_02; Dog is graphic, salmon, few grooves |
| **r02_b** | dark forearms and paws (`furD`, `paw`), separated by a stronger lit rim (2 units, +0.36), a deep cast shadow on the bib, the far paw behind the barrel | dark limbs do read in front of the bib, but they are still the darkest shapes in the lower half and pull the eye from the face |
| **r02_c** | chunky wildcard: the same value map read in 2x2 clusters (`paintLight` `block: 2`, never upscaled), 3 tones per material | very clean and poster-like (ref 05). Dog c is maybe the most "graphic, not sculpted" of all; the raccoon's fur detail softens into blocks |

**Why a:** it is the best answer to Ivan's complaint, because the arms appear only where light catches them. If the critic
likes c's chunk, `block: 2` is a one-line switch that works on a.

## Toolkit (light2d.mjs, backwards compatible)
New:
- `paintLight({ block })`: chunky light clusters.
- `dejag(keep)`: the pixel-perfect line fix.

Used, from round 01:
- `crescentValue` as `litEdge`.
- `lightField` with `mass` (front).

Checks:
- `shadeForm`'s output is unchanged: lighttest.png has the same md5.
- The game's portraits.mjs is untouched and renders. `src/` and draw2d are untouched.

## Next
- The near paw still has a "block" silhouette at its finger end; try a rounder scallop and a smaller wrist.
- The lower belly under the forearm has a few ragged band edges, inherited from the tufted outline in the cast shadow.
  Smooth the forearm's cast with a design-unit offset shape instead of the tufted part mask.
- Dog laugh: the tongue is a little light; one designed shadow under the upper teeth.
- Snapshots: `portraits_2d/v22` (iter_02), `portraits_2d_explore/v13` (a), `v14` (b), `v15` (c). The annotate PNGs are
  exported.
