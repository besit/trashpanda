# Critic, round 07 (the dog's laugh and shock, the paw, clean-up)

Looked at: `iter_07{,_hero,_values}.png`, `painter_07.md`, crops of the k = 1.5 laugh and shock, of the small row
(raccoon k = 1, the dog at k = 1 and at 112 x 100 in all three expressions, at 1x and 2x), and of the raccoon's body and
paw. pixelcheck on the raccoon and on all three dog expressions (`pc07/`).

Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are unchanged; no new palette keys.

Coordinates are in the k = 1.5 picture (348 x 312).

## Scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | raccoon | Dog grin | Dog laugh | Dog shock |
|---|---|---|---|---|
| round 06 | 7.0 | 7.5 | 7.0 | 6.5 |
| **round 07** | **7.0** | **7.5** | **7.5** | **7.0** |

(Baseline 4.5 / 4.5. Ivan's favourites: raccoon iter_02 5, dog iter_01 5.5.)

## Overall
**Nothing regressed.** The raccoon's face and the dog's grin are untouched. `deorphan()` kept every glint: the eye
catchlights and the nose highlights are all still there.

The two weak expressions are now lit the same way as the grin:
- **Laugh:** the teeth cast shadow into a dark cavity, the tongue is a lit dome with a midline crease, the lower lip
  is lit, and the cheeks push up so the eyes squint. It reads as a laugh at 112 x 100 and matches the grin's level.
- **Shock:** wide white eyes, high arched brows and a tall O with a lit sliver of teeth. It now reads as shock at 112
  (before, it read as mild surprise). Half a point below the grin, for one reason only: the whites are flat discs
  sitting *on* the face (see item 2).

**The raccoon's paw** now reads as a grip: 3 knuckle bumps against the yellow and the thumb over the barrel. The lower
body is clean: the cast shadow sits straight on the lit belly.

## Round 08: at most 5 low-risk items (everything else frozen)
1. **Shock eyes: seat them in the head.** Put 1 to 2 px of shadow at the top of each white, one tone down (`7`): the
   brow and lid shadow. Add a thin dark upper-lid line on the top arc only, with no full ring. The whites stay `W` at
   the bottom. At 112 that keeps the "wide eyes" read but stops them looking like stickers.
2. **Laugh: the near cheek beside the mouth** has 2 or 3 thin stacked light strokes (around art (84 to 109, 160 to
   200)). The raised smile crease's lit lips doubled. Make it one crease with one lit lip, exactly like the grin.
3. **Raccoon: a pale cream sliver** pokes out under the paw beside the barrel (around art (189,249)). Fill it with the
   belly or shadow tone.
4. **pixelcheck:**
   - Laugh: orphans along the lip line at (195,198) (193,199) (111,201).
   - Dog, all three expressions: the jaggy at (106,82) on the hair outline, which has survived since round 02.
   - Raccoon: orphan (255,109) and 4 jaggies on the lit-side contour ((134,32) (173,41) (100,126) (61,289)).
   - The hole at (307,143) is the whisker: acceptable.
5. **Final consistency check, no art change unless something jumps out:** put the raccoon (k = 1.5) next to Dog grin
   (k = 1.5) as on the VERSUS poster, once at 1x and once in greys. Check that the outline weight, the darkest darks
   (mask vs nose) and the light direction match, and that both faces are the contrast peaks of the pair. Re-export the
   annotate PNGs.

Round 09 is then a reserve for anything Ivan or the coordinator flags. Round 10 is polish only.

## Constraint checks

| check | result |
|---|---|
| Pump yellow, straight; face clear | pass |
| Raccoon faces right, smirk, mask, white brows; inside the frame, finished bottom | pass |
| Raccoon at k = 1 | pass |
| Dog head shape, low ears, compact swept hair | pass |
| Dog traits (wink, heart patch, nose, grin, navy suit, white shirt, red tie) | pass |
| Three expressions at 112 x 100 | pass: grin, laugh and shock all read |
| No real-person likeness | pass |
| Game untouched; palette additions only | pass |

## Keep, don't touch
- **Everything on the raccoon** except item 3: head, eyes, brows, smirk, ears, body light, arm, cast shadow, paw grip,
  tail, scarf, pump.
- **Dog grin** as it is.
- **The laugh's** cavity shadow, tongue dome, lit lower lip and pushed-up cheeks.
- **The shock's** tall O, teeth sliver, high brows and tiny pupils.
- The method.
