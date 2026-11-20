# Critic, round 00: the baseline and the scale

Looked at: refs 03 / 04 / 05, `iter_00*.png` (the baseline = the current game art = M4.8 iter_10), `iter_00_favs.png`,
`docs/reviews/m48/variants/r02_a_hero.png`, `docs/reviews/m48/iterations/iter_01_hero.png`, pixelcheck on both heroes
(`pc/`), and I rendered the values views of the two favourite modules (`m48_v12` = raccoon iter_02, `m48_v11` = dog
iter_01) to compare light, not colour.

## 1. Scores (fixed scale: ref 03 = 9.5)

| picture | appeal / character | rendering (light, craft) | **overall** |
|---|---|---|---|
| ref 03 (bar) | 9 | 10 | **9.5** |
| ref 05 (chunky, limited palette) | 8 | 8 | **8** |
| ref 04 (clean indie) | 7.5 | 7.5 | **7.5** |
| **Baseline raccoon** (= M4.8 iter_10, cap + floor pump) | 5 | 4 | **4.5** |
| **Baseline Dog Fjord** (grin) | 5 | 4 | **4.5** |
| Fav: raccoon iter_02 (red pump across the chest, scarf) | 6.5 | 4 | **5** |
| Fav: raccoon iter_10 | identical to the baseline | | **4.5** |
| Fav: Dog Fjord iter_01 (minimal) | 6 | 5 | **5.5** |

Honest read: all of these are clean vector-style cartoons translated to pixels. The gap to ref 03 is not polish, it
is method. Ref 03 has one head volume lit from above-left; the fur clusters run along the form, and the face is the
peak of contrast. Ours are stacks of separately outlined, separately shaded stickers. iter_02 scores higher than the
baseline only on pose and attitude. Dog iter_01 scores highest because it has the fewest stickers, and its values
view comes closest to "one lit egg".

## 2. Where it reads as assembled, part by part (use the values view)

The common root: **internal outlines plus local, per-part shading.** Every part has a dark 1-px contour and its own
little light-to-dark gradient that ignores the light on its neighbours. In greys, that shows up as a set of tiles
of equal weight instead of a light side and a shadow side.

### Raccoon (baseline and iter_02)
- **Fingers.** Baseline: 4 equal sausage capsules per paw draped over the handle bar. Each one is outlined and has its
  own light knuckle cap. In the values view each paw is 4 grey beads with a lighter dot on each. iter_02 is the same
  with 3 to 4 stubs, and the lower hand floats.
  *Light-driven:* one mitten mass. The top plane faces the light and is one step lighter. The front plane is the
  midtone, and the underside where it wraps the bar is the darkest. 2 short 1-px creases (dark, no outline around
  them) split the fingers on the lit top plane only. The fingertips curl under the bar into shadow, so they need no
  drawing. The paw casts a 1 to 2 px shadow onto the bar or barrel just below it.
- **Arms.** Baseline: two dark brown outlined tubes down each side of the torso. In greys they read as two long dark
  wedges, like suspenders, and the arm on the lit (left) side is as dark as the one in shadow. iter_02: the forearms
  are hidden behind the pump; the arm is implied only by the hands.
  *Light-driven:* the arm on the left (lit) side has its upper plane at the same value as the lit chest fur, or one
  step below. It turns into the body's shadow on its underside, flows into the shoulder with no line, and casts a
  crisp shadow shape (2 to 4 px) on the chest below the forearm. The arm on the right sits inside the body's shadow
  mass and is separated only by a half-tone rim along its top edge.
- **Head on body.** The biggest missing shadow: there is no cast shadow under the chin. The chin, cheek fur, bib and
  belly are all near-white, so in greys the head and chest merge into one light smear, separated only by a jagged
  white fringe that works like a collar sticker. *Light-driven:* a dark, designed shadow shape under the jaw that
  falls onto the chest, scarf or bandana. It is the strongest dark below the mask, and the chest below it is one
  step darker than the lit cheek.
- **Nose and muzzle.** A dark oval sticker with its own outline and a white blob, stuck on the end of a muzzle that is
  flat light all over. The mouth is a drawn line. *Light-driven:* the muzzle's top plane is the lightest, its
  underside is a shadow band that merges into the jaw, and the nose is the darkest dark with a 2 to 3 px highlight on
  its upper-left plane, defined by value, not by a contour. One small cast shadow under the nose and the mouth
  corner; the smirk is the edge where the lit cheek meets the shadowed lip, not a line.
- **Ears.** Separate triangles with a jagged fur fringe, an inner-ear triangle with hatching, both at the same value,
  and pixelcheck holes along their edges. *Light-driven:* the left ear catches light on its outer rim. The right ear
  turns away and is one value group darker. The inner ear is dark only where it is cupped, with no contour.
- **Pump.** Baseline: a chrome stick with a teal striped barrel (decorative noise). It is pasted in front: no shadow on
  the belly, no occlusion where the paws grip it. iter_02: a red barrel. In the values view it is a dark diagonal
  slab that cuts the figure in two and runs right past the mask on the left cheek. *Light-driven:* yellow ramp. A
  cylinder of 3 bands (light stripe on the upper-left side, midtone, shadow side) plus a thin reflected rim on the
  shadow edge and one specular streak. The parts (handle, collar, barrel, gauge, foot) are value changes along one
  axis. It casts a shadow on the body and is occluded where the paws wrap it.
- **Tail.** The rings are flat bands with outlines, and the tail has no cylinder shading, so in greys it is a stack of
  stripes. *Light-driven:* the rings curve with the tail's cylinder (the band edges bow), and the whole tail has a lit
  top and a dark underside, so the dark rings are lighter on the lit top edge. Add a contact shadow where the tail
  passes behind the leg or body.
- **Body fur.** Baseline: short hatching strokes across the whole belly and legs. In greys it is uniform mid-light
  texture with no terminator, so the body never turns. iter_02 adds random torn-patch shapes on the chest (patches
  with no reason). *Light-driven:* 3 flat bands on the body. Fur clusters only on the silhouette and in the dither
  strip at the terminator, aligned to the form.
- **Feet** (baseline): dark slabs with outlined toe beans, the same sticker logic as the fingers.
- **Value hierarchy.** Baseline whites compete: the cap, the cheek fur, the belly and the gauge all reach the top
  value. The darks compete too: the mask, the feet, the arms and the tail rings are near-equal. The face is not the
  peak of contrast.

### Dog Fjord (baseline and iter_01)
- **Head planes** (baseline): faceted, low-poly cheek planes with hard edges, pillow highlight blobs on both cheeks,
  4 stacked forehead folds, and a heavy dark jowl band. None of it follows one light. iter_01 is much better: in greys
  the head is one pale bell that darkens gently toward the jowls and the right side. Keep that.
- **Nose.** A black blob with its own outline and a big white highlight, a sticker in both versions. *Light-driven:*
  it is the darkest accent. The highlight is a small 2 to 3 px shape on the upper-left plane, and the nose's shadow
  side melts into the muzzle's cast shadow. The muzzle is one dome, lit top-left, that casts a shadow down onto the
  upper lip and grin.
- **Ears.** Flat folded triangles, outlined separately, inner part darker on both. *Light-driven:* the left ear's top
  edge is lit and the right ear sits in the head's shadow.
- **Patch.** A pasted heart with a contour and its own shading. *Light-driven:* it is a marking, a local colour
  change, so it takes the head's light: lighter brown at the upper left, darker at the lower right, no outline.
- **Grin.** A white crescent drawn as a shape. *Light-driven:* the teeth sit in the mouth, so the upper lip shades
  the top row of teeth (one step down from white) and only the lower middle teeth reach near-white. The lower lip
  catches the light.
- **Hair.** Horizontal streak strokes; it reads as a separate helmet. *Light-driven:* one swept mass, lit on top-left,
  with its underside dark and casting a crisp shadow on the forehead. Strands only at the lit edge and the tips.
- **Head on suit.** No cast shadow of the head on the collar or shirt. Add one; it seats the head.

## 3. What Ivan likes, so the painter keeps it

**Raccoon iter_02 (pose, vibe):**
- 3/4 bust, head big and high in the frame, facing right, slight tilt.
- The prop held across the chest on a strong diagonal (upper-left to lower-right), like a guitar or rifle over the
  shoulder: swagger and a dynamic composition. The tail curls up on the left and balances it. The whole figure
  packs into a compact triangle.
- Warm taupe / cream coat (not cold grey), the green scarf, half-lidded amber eyes, the closed-mouth smirk.
- Fix while keeping it: the pump goes yellow and stays one straight axis. Lower the diagonal or move it outward so
  that it passes below the mask and clear of the face: the top of the handle out past the left ear, the barrel
  crossing the chest or scarf, not the cheek. Drop the torn chest patches and the stitched zig-zag scarf pattern.
  iter_10's cap may come back if it helps.

**Dog iter_01 (minimal):**
- Few, big, flat value areas: one pale bell head, 2 long smile creases, 2 short forehead lines, flat lapels.
- The broad rounded head with the ears low at the upper sides, the compact swept grey hair, the heart patch, the big
  nose, the wink, the wide grin, the red striped tie, the small gold lapel button.
- Restraint: no facets, no pillow blobs, no tusks needed for the grin pose.

## 4. Constraint checks (baseline)

| check | baseline | note |
|---|---|---|
| Pump yellow (`y` / `Y` / `o`) | **FAIL** | chrome + teal (iter_02: red) |
| Pump straight, one axis | pass | vertical floor pump; keep `pumpAxis()` |
| Raccoon faces right, smirk, mask, white brows | pass | |
| Raccoon inside 232x208, finished bottom | pass | feet planted on the pump foot. iter_02's bottom is a ragged fur fringe: acceptable only if the frame finishes it cleanly |
| Face clear of the pump | pass (baseline) / **FAIL** (iter_02) | iter_02's barrel runs along the left cheek |
| Dog head shape (broad, round, low ears, swept hair) | pass | |
| Dog traits: wink, heart patch, nose, grin, navy suit, white shirt | pass | |
| Red tie (iter_01) | **FAIL** | the baseline tie is yellow with red spots |
| No real-person likeness | **at risk** | swept grey hair + pink face + suit + a national-flag lapel pin + a patterned tie stack up as cues for a specific politician. Go back to iter_01's red tie and plain gold button. Keep him a cartoon bulldog, defined by the dog traits |
| 112x100 readability | pass | nose, wink, patch and grin all read at 1x; the patch eye is small, so keep its value contrast high |

Pixelcheck (baseline):
- Raccoon: 16 holes, mostly on the ear and head fringe ((140,20) (223,22) (250,25) (134,36) (255,48) (127,58)) and one
  on the arm (110,139). 16 jaggies along the contours and 12 orphans in the fur hatching. All of these mostly go away
  when the hatching and internal outlines go.
- Dog: 35 orphans, almost all along the lower-lip / grin edge and the muzzle dots ((90 to 110, 89 to 96)). Holes at
  the ear (106,82) and the shoulders (258,227) (68,232). One near-duplicate pair `¢` / `M`.

## 5. Top 8 changes for a light-first redraw (ranked)

1. **No internal outlines.** No dark contour between any two parts inside the silhouette: arm/body, paw/arm,
   finger/finger, ear/head, nose, patch, muzzle. Outline only the outer silhouette, selectively: a dark local-colour
   line on the shadow side, a lighter line or none on the lit side.
2. **Values first, for the whole figure.** Block head + body + arms (+ tail) as ONE `shadeForm` volume (dog: head +
   jowls + muzzle as one) with 3 to 4 bands. One terminator runs down the right side of the head, chest and body. Check
   `_values.png` before any detail: it should read as a lit figure with no features drawn.
3. **Cast shadows that connect the parts:** chin onto chest or scarf (raccoon); forearm onto chest; pump onto body; paw
   onto pump; cap brim onto forehead; hair onto forehead (dog); muzzle onto lip; dog head onto collar. Crisp, designed
   shapes, 1 tone down, not gradients.
4. **Paws and feet as masses:** mitten silhouette, lit top plane, 2 to 3 one-px creases, fingertips curling into
   shadow. No per-finger shapes.
5. **Yellow, straight pump as a lit cylinder**, using a 5-tone ramp built around `y` / `Y` / `o` with the dark end
   toward warm brown or violet. Light stripe on the upper-left side, one specular, a reflected rim. It must not touch
   the face.
6. **Kill the all-over fur hatching** and the random patches. Fur clusters only on the silhouette and along the
   terminator, aligned to the form. Each tone patch needs a nameable reason.
7. **Value hierarchy:** the face is the peak of contrast. Demote the cap white, belly white and gauge white one step.
   The darkest darks go only in the mask, nose and pupils. Feet, arms and tail rings sit one value group above the mask.
8. **Dog back to iter_01's plan:** one egg volume, one shadow shape that wraps the jaw and the right side, 2 smile
   creases, at most 2 short forehead lines. No facets, no pillow blobs. The nose and patch are value accents inside the
   light. Red tie, gold button.

(9, cheap: the tail rings bow with the cylinder; clean the pixelcheck holes on the silhouette.)

## Rendering approaches to explore in rounds 01 and 02

- **A. `shadeForm` masses + designed accents.** Merge head+body+arms (dog: head+muzzle) in `shadeForm` with a small
  `R` (planar, graphic, turned edges) and 3 bands with a thin dither strip. Then paint designed shapes on top: the
  brow shadow, the chin cast shadow, the arm cast shadow, a sharp highlight or two. Risk: the M4.5 blobby, airbrushed
  look, so keep the band count low and the strip thin.
- **B. Flat local colour + hand-designed shadow shapes (cel / poster).** Each material is one flat midtone. Then ONE
  hard-edged shadow polygon per mass (right side of the head, under the brow, under the chin, under the arm), one
  light shape on the planes facing up-left, and a rim. 2 to 3 tones per material, no dither. This is the closest to
  dog iter_01 and ref 04, and the most "designed from light", since every shadow edge is a decision.
- **C. Chunky, limited palette (ref 05 style) at the same pixel size.** About 3 tones per material and a minimum
  cluster of 2x2 for any feature (no 1-px details except the eye glints and whiskers), with big silhouette-driven
  shapes. This forces you to drop the fingers, the hatching and the folds. Do NOT render at low k and upscale:
  mixed pixel sizes against the 1x dog and the game art would break consistency (and "never stretch").

Suggested test: in round 01 run A and B on both characters (B is my favourite to beat). C is the wildcard: if it
looks best in greys, it wins. Judge each one mainly on `_values.png` and on how the paws, the pump grip and the chin
read.
