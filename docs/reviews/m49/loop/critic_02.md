# Critic, round 02 (lit volume + cel bands: a coat arms, b dark limbs, c chunky 2x2)

Looked at: `variants/r02_{a,b,c}{,_hero,_values}.png`, `iter_02.png` (= a; overview incl. 112 x 100), `painter_02.md`, a 4x
crop of a's arm, belly and tail, and pixelcheck on the pick (`pc02/`). Game check: `portraits.mjs`, `src/` and `draw2d.mjs`
are unchanged; `palette.mjs` has +2 lines (the `¥` key).

Art coordinates are in the k = 1.5 picture (348 x 312).

## Scores (fixed scale: ref 03 = 9.5. Baseline 4.5 / 4.5. Favourites: raccoon iter_02 5, dog iter_01 5.5. Round 01 a: 5 / 6)

| | raccoon | Dog Fjord |
|---|---|---|
| **a** (= iter_02) | **5.5** | **6.0** |
| b (dark limbs) | 5.0 | 6.0 (same as a) |
| c (chunky 2x2) | 5.0 | 6.0 |

## Overall

**Correct, but drifting toward soft and bland.** Round 02 solved the brief's mechanics:
- The near arm finally belongs to the body: it is coat-coloured, read by a lit top edge and a cast shadow on the
  bib, with no outline.
- Hard bands, no checker. pixelcheck is clean: raccoon 4 orphans and 5 jaggies, dog 3 and 2.

Both characters now beat Ivan's favourites on rendering. **But neither picture is striking yet.** "Professional, from
shades" means *designed* light: big, simple, confident light and shadow shapes, temperature, and a few sharp accents.
What we have is *computed* light: an even, soft volume whose bands follow the outline. Three concrete symptoms:

1. **The bands follow the silhouette (pillow shading).** The inflate-the-silhouette light gives rings parallel to the
   outline. In the crop, the lower body is a stack of horizontal tan stripes: forearm, its cast shadow, two belly
   bands, the tail bands. They all run parallel, so nothing turns. The tail does the same. On the dog, the near jowl
   and chin bands echo the head outline. In the values view, the raccoon's lower half is 4 to 5 mid-greys in
   concentric bands. There is no single light side / shadow side for the figure, and the face is the contrast peak
   only because the mask is black.
2. **Everything is in light; the shadows are thin crescents.** The dog's values view is the clearest case: the whole
   head sits in the top 2 values. Only a sliver at the right and the bottom turns, so the egg reads flat and pale.
   The pink went peach (`/`, `¢`, 30% of the pixels), so he looks washed out next to iter_01 and c.
3. **No temperature.** Every ramp darkens in its own hue and greys out: the coat shadow is grey-taupe, the dog's
   shadow is dusty pink. So the shadows look like dirt, not like shadow. There is also no bounce light or rim, so the
   figures don't sit in the poster's blue.

What lifts it from clean to striking (refs 03 / 05, and any good indie portrait):
- a designed terminator, one deliberate curve per mass, with about 35 to 45% of each mass in shadow;
- hue-shifted ramps: warm lights, cool violet-leaning shadows, and a saturated band at the terminator (skin and fur
  "glow" there);
- a cool rim or bounce light from the background along the shadow-side silhouette;
- a handful of purposeful fur clusters at the light edge, and sharp speculars on the eyes, nose, barrel and chrome.

## Raccoon (a)
- **The arm: a pass.** It belongs to the body. Keep that construction.
- **The paw is still a lumpy block** (art ~(150 to 185, 150 to 175)). It reads as a sock puppet. The thumb is a
  separate little block on top, and a dark line runs down its right edge against the barrel. Design the grip:
  - a smaller wrist;
  - 3 rounded knuckle bumps over the barrel;
  - the thumb merged into the paw mass;
  - the fingertips darkening only where they wrap the barrel's shadow side;
  - a 1 to 2 px shadow on the yellow below them.
- **The bib has a glossy white plastic highlight** (art ~(108 to 130, 160 to 180)). Fur is matte. The lightest coat
  tone should be cream, a flat plane, with the forearm's cast shadow crossing it crisply.
- **The lower body is mud:** ragged band edges and spikes, plus a "stalactite" patch (art ~(80 to 110, 255 to 290)).
  The bottom edge is a saw blade.
- **The tail tip is still a dark rounded blob that reads as a little hand or glove** (art ~(40 to 60, 135 to 155)).
- **The far paw behind the pump is mush** (art ~(235 to 265, 165 to 200)). Either one clear lit knuckle shape or hide
  it fully behind the barrel and scarf end.
- The face, mask, eyes, nose and smirk are good and readable. The white brow stripes and the dark forehead stripe
  frame the eyes well.

## Dog (a vs c)
- a: the cleanest and closest to iter_01's minimal plan. The forehead now has 2 folds, the jowl is smooth, the hair is
  calmer. But it is pale peach and low-contrast (see above).
- c: the pink is more saturated and closer to iter_01, and the far-cheek shadow plane is bolder and more graphic. It
  is the more striking dog. But the 2x2 clusters leave stray light blocks on the cheeks (around art (230 to 250, 120 to
  145)), and on the raccoon the blocks blur the fur and the eye area.
- **Take c's colour and shadow design, not its 2x2 quantization.** Big clusters should come from design, not from a
  `block` setting.

## THE direction for rounds 03 to 10

**r02_a at 1x (lit volume, cel bands, coat-coloured arms, no dither) as the base, plus a light-DESIGN pass.**
- Designed terminators instead of outline-following bands.
- Hue-shifted ramps (warm light, cool shadow, a saturated terminator).
- A cool background rim on the shadow side.
- The dog's colour and far-cheek plane from c.
- Purposeful fur clusters and speculars as the final accents.

No `block: 2`, no dark limbs (b proved them: they become the darkest shapes in the lower half and pull the eye from
the face).

## Top 6 fixes for round 03 (ranked)

1. **Replace the outline-parallel banding with designed light planes.**
   - Raccoon body: lit plane upper-left (2 tones). One hand-placed terminator curve runs from under the scarf end at
     the right shoulder down to the bottom centre (art ~(230, 175) to (170, 300)). Shadow plane to the right of it (1
     to 2 tones), with a reflected-light rim on its edge. The belly becomes 2 big shapes, not 5 stripes. Lower `R`
     (more planar) or a light-direction gradient, so the bands run across the form, not along its outline.
   - Tail: a cylinder with the terminator along its underside. The rings bow with the cylinder.
   - Dog: the far cheek and jowl as one big shadow plane (c's version). About 35 to 40% of the head in shadow, the
     terminator a clean curve from the right ear down past the patch to the right of the chin.
2. **Hue-shifted ramps** (use `tools/ramp.mjs`, new keys only).
   - Coat: shadows toward cool violet-brown (not grey), lights toward warm cream.
   - Dog skin: lit warm pink (back from peach toward `Q`); a 1 to 3 px saturated red-pink band at the terminator
     (`9`); the shadow plane a cooler mauve-violet; `§`/`¤` only in creases and cast shadows.
   - The suit's lit side slightly warmer, its shadow deep blue-violet.
3. **A cool rim or bounce on the shadow side.** Add a key around `#8fbcd6`. Use it as a broken 1 px rim along the
   shadow-side silhouette: the raccoon's right cheek fringe, the back of the head, the tail underside, the scarf end;
   the dog's right jowl and jaw, and the suit's right shoulder. 1 px, broken, never on the lit side. This sets both
   characters into the poster and pops the silhouettes.
4. **The near paw designed as a grip, and a matte bib** (see the raccoon notes). Hide or simplify the far paw.
5. **The lower body and the tail tip.**
   - Remove the spikes and the stalactite patch.
   - The bottom edge: 5 to 7 deliberate tufts pointing down and outward (the direction of the fur), not a saw.
   - The tail tip tapers to a point (a dark last ring, a pointed tip with 2 or 3 small lit strands), not a round blob.
6. **Accents with purpose, last.**
   - Raccoon: 6 to 10 lit fur clusters (2 to 4 px wedges) along the light edge of the head, the cheek ruff and the top
     of the near shoulder, pointing along the growth direction.
   - Sharper speculars: the nose glint, the eye glints, one bright streak along the barrel's light stripe and on the
     chrome collar.
   - Dog: one clean specular streak along the hair swoop; the nose glint; the cheek-top highlight as one designed
     shape on the near cheek.

Check after the round: the values view should show **one light side and one shadow side for each figure** at a squint,
with the face the peak. The colour view should show warm-lit, cool-shadowed figures with a blue edge on the right.

## Pixelcheck (pick)
- Raccoon: 4 orphans ((143,22) (114,169) (280,224) (235,239)) and 5 jaggies ((139,29) (132,49) (129,60) (100,126)
  (284,250)). The holes, nubs and strips at (292 to 326, 139 to 156) are the whiskers and chin tuft: acceptable.
  Near-duplicate `@` / `0`: merge or push them apart.
- Dog: 3 orphans ((219,48) (98,92) (143,265)) and 2 jaggies ((106,82) ear, (169,141)).

## Constraint checks (iter_02)

| check | result |
|---|---|
| Pump yellow, straight | pass |
| Face clear of the pump | pass (the barrel crosses below the mask; the eyes, nose and smirk are clear) |
| Raccoon faces right, smirk, mask, white brows | pass |
| Inside 232x208, finished bottom | pass, but the bottom edge needs design (fix 5) |
| Dog head shape, ears low at the upper sides, compact swept hair | pass |
| Dog traits (wink, heart patch, nose, grin, navy suit, white shirt, red tie) | pass |
| No real-person likeness | pass |
| 112 x 100 | pass. The wink, patch, nose and grin read. The paler pink lowers the contrast of the head against the shirt a little; fix 1 and 2 restore it |
| Game untouched | pass |

## Keep, don't touch
- The method: material map x one value map, hard bands, no internal outlines, no dither.
- The coat-coloured near arm: lit top edge, underside in the body's shadow, crisp cast shadow on the bib.
- The raccoon's face: eyes, mask, brow stripes, nose, smirk, whiskers; the head's brow ridge and socket.
- The pose: 3/4 bust, the yellow pump on the diagonal below the face, the scarf end over the far shoulder.
- The pump's cylinder light and the light-grey gauge face.
- Dog: the head outline, ears, compact hair with 3 ridges, 2 forehead folds, the smooth near jowl, the grin with the
  upper-lip shadow on the teeth, the nose, the heart patch, the wink, the red tie and plain suit.
