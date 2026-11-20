# Critic, round 01 (exploration: a VOLUME, b CEL, c RICH)

Looked at: `variants/r01_{a,b,c}{,_hero,_values}.png`, `iter_01*.png` (= a), `painter_01.md`, close crops of the arms and
paws of a and b, and pixelcheck on the pick (`pc01/`). Game check: `tools/sprites/portraits.mjs` and `src/` are
unchanged. `tools/palette.mjs` only gains `'¥'` (allowed).

Art coordinates below are in the k = 1.5 hero picture (348 x 312).

## Scores (same scale: ref 03 = 9.5, baseline 4.5 / 4.5, favourites: raccoon iter_02 5, dog iter_01 5.5)

| | raccoon | Dog Fjord |
|---|---|---|
| a VOLUME (= iter_01) | **5.0** | **6.0** |
| b CEL | **5.5** | **5.5** |
| c RICH | 4.5 | 5.0 |

## Overall: does it read as light or as parts?

This is the right turn. For the first time the method is right: one value map, materials quantized onto it,
no internal outlines, and cast shadows doing the separating. In the values view, every variant's raccoon head now
reads as one lit volume (brow ridge, socket, muzzle top plane, a shadow under the jaw), and the dog's head reads as
one lit egg. Both characters beat the baseline and sit at or above Ivan's favourites. **But the raccoon's arms and paws
are still the "toddler" stickers Ivan named**, so the raccoon gains less than the dog.

- **Dog:** a is the best. The jowl and smile grooves come out of the light (dark crease, lit lip below), and the upper
  lip shades the top teeth. It keeps iter_01's minimal plan. Two warnings for a:
  - The forehead has about 5 wavy dithered ridges (art x ~150 to 260, y ~55 to 80), and the lower-left jowl has lumpy
    cheek pouches (art x ~62 to 105, y ~190 to 245). Both read as a sculpted 3D render, the bump-map look. Graphic and
    few is the goal.
  - The pink drifted redder and darker than iter_01 (more `9`/`§`, less `/`/`Q`); he looks sunburnt.
  
  b is clean and very close to iter_01's flat look, but its smile and forehead folds are thin drawn mauve lines again.
  c's wide dither reads as airbrushed, the M4.5 look Ivan rejected. Drop it.
- **Raccoon:** b reads the cleanest: the clear light cheek, a flat calm coat, and a pump with a crisp light stripe. a
  has the better head (real brow ridge and socket) but a muddy, mid-dark, busy lower torso: fur breaks and torn
  patches everywhere around art x 100 to 225, y 225 to 300. c is grain.
- **In all three, the forearms and paws read as dark mittens pasted on the chest.** The cause is visible in the crop:
  the forearm and paw are a darker local colour (`furD`) than the coat, they have their own little volume, and they
  sit on a chest that is itself mid-dark. Two dark shapes on a mid-dark ground can only read as stickers. The three
  1-px creases do nothing at this size: in b the paws read like boxing gloves.

## The chosen approach for both characters: lit volume, cel bands ("a lit, b cut")

The VERSUS posters need one look. Use a's value map (`lightField` volumes with prims, designed cast shadows, `tubeField`
for the pump) and quantize it the b way:
- **strip 0** (hard band edges) on skin, coat, cloth, suit and the patch; at most a 1-px broken edge on fur
  silhouettes only;
- **3 to 4 tones per material**, plus 1 accent (the darkest crease or the specular);
- b's designed big shadow shapes on top (raccoon body side, dog far cheek plane and jowls), with edges you choose,
  not the edges the field gives you.

This keeps a's form (the brow ridge, the jowl grooves from the light) with b's clarity, and kills the checker and
airbrush look.

## How to do the arms so they belong to the body's light (the answer to the coordinator's question)

1. **Same local colour as the coat for the near arm**, at least up to the wrist. The forearm is not a new material. It
   is the coat, turning. Keep `furD` (if at all) only for the fingers' shadow side and the claws. A raccoon's dark
   hands are a nice true detail, but here they are exactly what makes the stickers.
2. **The arm reads through three light events, no line:**
   - a lit top edge: a 2 to 3 px band of the coat's top light along the upper contour of the forearm, where it faces
     up-left;
   - the underside turns into the coat's shadow band, merging with the body's shadow;
   - a crisp cast shadow on the chest below the forearm: 1 to 2 tones down, 3 to 5 px wide, offset down-right (light
     from the upper left), following the arm's lower contour. This shape does 80% of the separation.
3. **The chest under the arm must be light**, or the cast shadow has nothing to fall on. Bring back iter_02's cream bib
   between the scarf and the forearm (around art x 115 to 175, y 150 to 200) and lift the whole coat a ramp step
   toward iter_02's warmer, lighter taupe.
4. **The paw is mostly lit fur:**
   - The back of the paw (the knuckle row facing up-left) is in the coat's light or half-tone.
   - 2 short dark creases sit on the back only.
   - The fingertips wrap around the barrel into the barrel's shadow side and darken there; that is the only place
     the paw goes dark.
   - A thumb notch over the top of the barrel reads as a grip.
   - The paw casts 1 to 2 px of shadow onto the yellow barrel just below and right of it, and the barrel is occluded
     where the fingers wrap it.
5. **The elbow and upper arm come out of the body mass.** The elbow sits on the body's silhouette or on its terminator,
   and the light runs continuously from shoulder to elbow to forearm. No seam where the arm starts.
6. If the far (lower) paw still reads as a sticker, show less of it: tuck it behind the barrel or the scarf end so
   only the lit knuckles and 2 creases show.

## Pump position: OK

The barrel enters below the mask, crosses the lower-left cheek fringe and the scarf, and leaves the eyes, nose and
smirk completely clear. The 3/4 bust and diagonal swagger of iter_02 are kept. Yellow, with a 4-step ramp including
`¥`: good. One straight axis: good. Small things:
- The gauge face is the brightest white in the lower half and competes with the face. Drop it one step (a light grey
  face) and keep pure white for the glint only.
- Optional: lower the axis by about 4 px so the collar (art ~(60 to 75, 95 to 100)) clears the cheek tuft completely.

## Ranked fixes for round 02 (still exploration)

1. **Unify both characters on "lit volume, cel bands"** (see above): strip 0, 3 to 4 tones per material, designed
   shadow shapes on top. No checker dither on the dog's suit or patch (it shows as noise at 112 x 100), and none on
   the scarf.
2. **Arms and paws per the 6 points above**: coat-coloured near arm, lit top edge, cast shadow on a light chest, the
   paw mostly lit with the darks only where it wraps the barrel.
3. **Raccoon torso calm and lighter.** Remove the torn fur breaks and patches on the lower torso (art x 100 to 225,
   y 225 to 300): 2 to 3 flat bands with fur breaks only on the silhouette and the bottom edge. Bring back the cream
   bib. Warm and lighten the coat toward iter_02.
4. **Dog: graphic, not sculpted.**
   - Forehead: 2 (max 3) short crisp grooves (dark line + lit lip), no dither.
   - Lower-left jowl: one smooth jowl mass with a single groove; remove the pouch lumps.
   - Pink back to iter_01's light salmon: lit band `/` and `Q`, `9` only on the terminator, `§` only in the core
     shadow and crease.
5. **Value hierarchy and the gauge.**
   - Raccoon: the face (white brows, cream muzzle, mask) has the highest contrast. The gauge white comes down a step.
     The scarf's dark sits above the mask's dark.
   - Dog: the nose and the patch eye are the darkest darks. The suit's shadow is a flat navy, not a checker.
6. **Tail tip and silhouette clean-up.**
   - The raised tail tip at the upper left (art ~(35 to 50, 140 to 160)) reads as a little dark hand or stub, one
     more separate shape. Taper it into a curl with the dark ring at the tip.
   - pixelcheck, raccoon: 24 orphans (head fur breaks at (143,22) (202,41) (194,72) (194,74), plus the tail and fur
     edges) and 14 jaggies on the contour ((139,29) (261,43) (132,49) (129,60) (107,127)...). The holes and the
     strips at (306 to 326, 139 to 156) are the whisker and chin: acceptable.
   - pixelcheck, dog: 22 orphans, nearly all hair-ridge dither at (149 to 188, 23 to 35), which strip 0 fixes.

## What the variants in round 02 should try (all on the unified approach)

- **r02_a: the main candidate.** The unified render for both characters. Raccoon arms in coat colour (points 1 to 5),
  cream bib, calm torso. Dog per fix 4.
- **r02_b: the dark-limb alternative.** The same, but keep the raccoon's dark limbs (true to the animal) and separate
  them by light alone: a strong lit rim on the forearm's top edge, a light cream bib behind, a bold cast shadow, and
  the far paw mostly hidden. This tests whether dark arms can belong to the body.
- **r02_c (wildcard): chunky, limited palette, ref 05 style**, at the same pixel size (never upscaled): the same value
  map, but about 3 tones per material and a minimum cluster of 2x2 for everything except the eye glints and whiskers.
  This forces simple paws and kills the busy torso and forehead. It has not been tried yet: round 01's c went the
  opposite way.

Judge all three on the values view first, then on the crop of the paws and pump grip, then on the dog at 112 x 100.

## Constraint checks (iter_01 = a)

| check | result |
|---|---|
| Pump yellow, straight (one axis) | pass |
| Face clear of the pump | pass |
| Raccoon faces right, smirk, mask, white brows | pass |
| Inside 232x208, finished bottom | pass (tufted bottom edge, nothing cut) |
| Dog head shape (broad round head, low ears, compact swept hair) | pass |
| Dog traits: wink, heart patch, big nose, grin, navy suit, white shirt, red tie | pass. The flag pin is gone, good |
| No real-person likeness | pass. Keep the hair compact and keep the dog traits dominant |
| 112 x 100 readability | pass for the nose, wink and grin. The patch and suit dither turn to noise at 1x, so remove the dither (fix 1) |
| Game untouched | pass (`portraits.mjs` / `src/` unchanged; palette: one key added) |

## Keep, don't touch
- The method: material map x one value map, no internal outlines, cast shadows that cross materials.
- The raccoon's face: half-lidded amber eyes, mask shape, white brow stripes, the nose with its small upper-left
  highlight, the smirk; the shadow under the jaw.
- iter_02's pose: 3/4 bust, the yellow pump on the diagonal, the scarf end flung over the far shoulder.
- `tubeField` cylinder on the barrel (b's crisp light stripe is the target look).
- Dog: the head outline and ears, the crescent grin with the upper-lip shadow on the teeth (a), the nose, the
  heart-patch shape, the wink, the red tie and the plain suit, the shadow of the jowls on the collar.
