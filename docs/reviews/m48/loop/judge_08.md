# Judge, round 08 (refinement 5)

Scale: ref 03's craft = 9 to 10 (ref 04/05 about 7.5 to 8). Baseline 4.0 / 3.5. Round 07: raccoon 7.0, dog 5.5.

## Scores

| | Score | Change | One line |
|---|---|---|---|
| **Raccoon** | **7.0** | ±0 | The body light pass helps (the near side lifted, the far side and belly underside darker, a deeper chest cast shadow) and the eye catchlight is crisper. It is a consolidation round, not a jump. |
| **Dog Fjord** | **6.5** | +1.0 | **The revert worked.** Round 05's bold crescent grin and confident smug read are back, now on clean pink with no stubble. On the side-by-side (`cmp58.png`) he beats round 05: the same graphic punch, better colour, cleaner teeth. |

## Appeal check
- **Dog:** I agree with the lead: he is confident and striking again. The single wide white crescent with the big
  fangs is the dominant shape, and the jowls flank it as cartoon cheeks with no outline and no lumps (also at 112).
  The teeth are a clean white field with a lip-shadow band, cooling toward both corners, with 3 faint separations
  and an even lower edge. That is exactly the light touch asked for. This is the best Dog Fjord of the loop.
- **Raccoon:** no regression. The face strands, the bright muzzle and the calm body hold. The near side reads
  lighter and the forms turn more.

## Constraint checks
| Check | Result |
|---|---|
| Pump straight | **Pass.** Vertical axis, T-bar level, rod, caps, barrel, gauge and foot plate collinear. |
| Dog head = iter_04 | Pass |
| Dog at 112 | Pass: the wink, the patch eye, the nose, the crescent, the fangs, the laugh and the shock are all distinct. |
| k = 1 | Pass. One item to watch: the new foot contact shadows (see fix 1). |
| Nothing cut off | Pass |
| No real-person likeness | Pass |
| Raccoon faces right, smirk, mask, brows, face clear | Pass |
| Transparent background, no scene | **Watch:** the floor contact shadows under the feet stick out past the feet as dark slivers (close-up ≈ under both feet, about 2 px tall, wider than the foot on the outer sides). On a poster's own art they will read as a dark bar floating under the figure. |

## Round 09: last improvements (5 items, all low-risk, ranked)
1. **Clip the foot contact shadows** to the feet's own footprint, as a darker underside *inside* the foot and the
   foot plate, or remove them. Nothing dark should extend outside the figure onto the transparent background. Check
   at k = 1 that no dark bar remains.
2. **Raccoon mask sheen:** one small soft sheen cluster (2 tones, about 6 to 10 px) on the upper edge of each mask
   lobe, as planned. Keep it inside the mask with no new outline, and leave the eye surrounds untouched.
3. **Dog teeth micro-touch:**
   - Let the upper lip's shadow band follow the lip's curve and fade out toward both corners, rather than staying an
     even-width strip.
   - Give each fang a 1 px cool side plane so it reads as a cone, not a flat white wedge.
   - Nothing else in the mouth changes.
4. **Raccoon near forearm:** a 1 px brighter lit ridge segment from the elbow toward the paw so the near forearm reads
   at k = 1.5. Don't change the shapes or the paws.
5. **The shock at 112:** check that the small O with the two fangs doesn't read as buck teeth. If it does, darken
   and enlarge the O interior by 1 px at small `c.S` only, and drop the fangs to 1 px each there.

Explicitly **not** for round 09: no changes to the dog's crescent geometry, jowls, palette or layout, and no changes
to the raccoon's head shapes, strand tuning, pose or pump.

## Round 10 polish checklist (no new features)
1. **Orphans and specks:** run despeckle on the raccoon head and body and the dog's skin after all passes, then
   inspect the close-ups for single pixels.
2. **A banding check:** the dog's jaw core shadow and the jowl sag rims, the raccoon belly's turning-under shadow,
   the tail rings, the cap brim. No parallel stair-step bands.
3. **Every view at every size:** the raccoon at k = 1.5 and 1; Dog Fjord grin, laugh and shock at 1.5, 1 and
   112 x 100 (1x and the 2x cutscene view). Nothing merging, the eyes, nose and mouth distinct.
4. **The frame and transparency:** nothing touching or clipped at the 232 x 208 edges (the hose chuck on the left,
   the tail on the right, the feet at the bottom). No stray background-coloured or semi-dark pixels outside the
   silhouette. The outer silhouette outline continuous.
5. **The pump's final check:** a single axis, the T-bar perpendicular, only the hose curving.
6. **A regression side-by-side:** the dog against iter_05 and iter_08 (appeal at least iter_08's), the raccoon
   against iter_07 and iter_08.
7. **Code hygiene:**
   - The exports and signatures are intact (`raccoonPortrait2d(expr = 'smirk', k)`, `dogPortrait2d(expr, k)`,
     `GW`, `GH`, `portraitsPreview()`).
   - `tools/palette.mjs` diffed against git HEAD shows **only added keys** (no original key changed or removed).
   - `tools/lib/draw2d.mjs` is still backwards compatible (the other sprites render unchanged).
   - Dead code removed.
8. **The snapshot** into `art/history/portraits_2d/` with the round-10 note.

## Keep, don't touch
- **Dog:** the whole round 08 mouth (the crescent, jowls, teeth, lip edge, laugh, shock), the pink palette and rosy
  terminator, the eyes and smug lid, the patch, the nose, the forehead folds, the iter_04 ears, the hair, and the bust.
- **Raccoon:** everything, including the round 08 body light pass and the bigger catchlight.
