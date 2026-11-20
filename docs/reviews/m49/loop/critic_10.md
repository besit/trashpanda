# Critic, round 10: final verdict (M4.9 portrait loop 3)

Looked at: `iter_10{,_hero,_values,_favs}.png`, `iter_10_head_compare.png`, `iter_10_versus_{1x,2x,values}.png`,
`painter_10.md`.

pixelcheck on the raccoon (k = 1.5 and k = 1) and on Dog Fjord in grin, laugh and shock (`pc10/`).

## Final scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | baseline (r00) | Ivan's favourites | **final (r10)** |
|---|---|---|---|
| Raccoon | 4.5 | 5.0 (M4.8 iter_02) | **7.5** |
| Dog Fjord grin | 4.5 | 5.5 (M4.8 iter_01) | **7.5** |
| Dog Fjord laugh / shock | - | - | **7.5 / 7.5** |

The head fur pass landed as planned. The crown, brow bands, mask edges and ear rims break into fur along the growth
direction, while the eyes, nose, smirk and the cheek beside the barrel stay calm. It adds about half a point to the
raccoon with no new value shapes. The dog is pixel-identical to iter_09.

## Checks

| check | result |
|---|---|
| Pump yellow (`y` / `Y` / `o` / `¥` ramp), straight (one axis) | pass |
| Face clear of the pump | pass |
| Raccoon faces right, smirk, bandit mask, white brows; inside 232x208, finished bottom | pass |
| Raccoon at k = 1 | pass. pixelcheck clean apart from whisker nubs and strips (acceptable) |
| Raccoon at k = 1.5 pixelcheck | 0 jaggies. 1 "orphan" = the eye's secondary catchlight (intentional), 1 hole = the whisker |
| Dog head shape (M4.7 iter_04: broad rounded head, low ears, compact swept hair) | pass |
| Dog traits (wink, heart-patch eye, big nose, grin, navy suit, white shirt, red tie) | pass |
| Dog grin / laugh / shock at 112 x 100 | pass, all three read. pixelcheck clean in all three |
| No real-person likeness | pass: a cartoon bulldog, no flag pin, a plain red tie |
| VERSUS pairing (1x, 2x, values) | pass: one light, one outline logic, the same darkest darks, both faces as the peaks |
| Game untouched; palette additions only; draw2d untouched; light2d backwards compatible | pass |
| Deterministic renders (fixed seeds); history snapshotted (`portraits_2d/v30`); annotate PNGs exported | pass |

## What the loop achieved against Ivan's critique ("drawing from shades, not from shapes")

- **From parts to light.** The baseline was a stack of separately outlined, separately shaded stickers: fingers, arms,
  nose, ears, tail rings. The final art has no internal outlines. Every part is a material inside ONE light map, so the
  same light and cast shadows cross fur, scarf and pump alike:
  - the arm reads by its lit top edge and its cast shadow on the bib;
  - the paw is a lit mass whose fingers darken only where they wrap the barrel;
  - the nose is the darkest dark with one highlight;
  - the tail is one tube with its markings in the light;
  - the dog's far side is one form-following shadow plane wrapping under the jowls.
- **The values view reads like a painting.** One light side and one shadow side per figure, 3 to 4 value groups, the
  face the contrast peak, the light falling off toward the bottom. Shadows are designed shapes in hue-shifted colour
  (warm light, cool shadow), not darkened local colour.
- **Ivan's anchors are kept and his specifics met:**
  - iter_02's swagger: 3/4 bust, the pump across the chest, scarf, smirk. The pump is now yellow and straight, and the
    face is clear.
  - iter_01's minimal dog: few, big shapes, now with real form and three expressions that read at 112.
  - Both characters share one rendering style for the VERSUS posters.

## What still separates these from ref 03 (honest)

- **Texture craft.** Ref 03's fur is hand-clustered almost everywhere it turns, with varied strand sizes and clumps
  that model the form on their own. Ours is fur only at the boundaries of flat bands, so the large planes (cheeks,
  belly, tail) still read as smooth graphic shapes. It is closer to a clean indie style (ref 04) than to ref 03's
  painterly density.
- **Colour richness inside a plane.** Ref 03 shifts hue and value subtly *within* each mass: reflected colour from
  the scarf and cookie, cool greys against warm. Our planes are flat single tones by design (3 to 4 per material), which
  is clean but less luminous. The skin and fur never pick up colour from their neighbours.
- **Drawing and appeal of the forms themselves.** Ref 03's silhouette, eye shapes and proportions are drawn by a hand
  with years of anatomy and gesture. Ours are built from code primitives. The paw, ears and dog's head are correct and
  readable, but they lack the small asymmetries, overlaps and squash that make a drawn form feel alive. The eyes are
  good, but not yet ref 03's wet, deep, slightly asymmetric eyes.

**Verdict: ship-ready for Ivan's review.** `tools/sprites/portraits_next.mjs` (iter_10) is the recommended
candidate. It should go into the game only after Ivan's green light.
