# Judge, round 09 (refinement 6: low-risk finishing)

Scale: ref 03's craft = 9 to 10 (ref 04/05 about 7.5 to 8). Baseline (M4.7 iteration 09): raccoon 4.0, dog 3.5.

## Scores

| | Score | Change | One line |
|---|---|---|---|
| **Raccoon** | **7.0** | ±0 | All five micro-items landed cleanly: no shadow outside the feet, a subtle mask sheen, a readable near-forearm ridge. No regression. |
| **Dog Fjord** | **6.5** | ±0 | Round 08's confident crescent grin is intact. The lip shadow on the teeth now follows the curve and fades at the corners, the fangs read as cones, and the shock at 112 now reads as an open "O!" (no buck teeth). |

Across the loop: **raccoon 4.0 → 7.0, Dog Fjord 3.5 → 6.5.**

## Round 09 items checked
1. **Foot contact shadows:** removed. The soles have a darker strip *inside* the foot, the claws and pads survive,
   and nothing dark lies outside the silhouette at 1.5 or 1. ✔
2. **Mask sheen:** a small 2-tone cluster on each lobe's upper edge, inside the mask, with no outline and the eye
   surrounds clean. It is subtle; it reads on the close-up and doesn't distract. ✔
3. **Dog teeth:** the lip shadow is curved and tapered (0.6 → 3.6 → 0.6), the fangs have a 1 px cool outer side, and
   nothing else changed. ✔
4. **Near forearm:** the 1 px brighter ridge reads at 1.5. ✔
5. **The shock at 112:** the O is dark all through and a pixel bigger, with single white fang pixels. It reads as
   surprise in the 2x cutscene view, and the 1.5 and 1 versions are unchanged. ✔

## Constraint checks
| Check | Result |
|---|---|
| Pump straight | **Pass.** One vertical axis: the T-bar perpendicular, the rod, caps, barrel, gauge and foot plate collinear. Only the hose curves. |
| Dog head = iter_04 | Pass (outline, low folded triangular ears, swept hair) |
| Dog at 112 | **Pass, all three:** the wink, the patch eye, the nose, the crescent with fangs, the laugh's open mouth, the shock O. |
| k = 1 | Pass |
| Nothing cut off | Pass (the hose chuck at the left, the tail at the right and the feet at the bottom are all inside 232 x 208) |
| Transparent background, no scene | Pass (the floor shadows are gone) |
| No real-person likeness | Pass |
| Raccoon faces right, smirk, mask, white brows, face clear | Pass |

## Round 10: the final polish list (no new features, no shape or palette changes)
1. **Orphans and specks:** despeckle the raccoon head, body and tail and the dog's skin after all passes, then
   inspect every close-up for single pixels. In particular check:
   - the strand-cluster ends on the mask and forehead;
   - the cheek-ruff tips;
   - the tufted silhouette of the tail tip;
   - the dog's pore clusters on the flews.
2. **Whisker ends:** at k = 1, check the raccoon's whiskers stay as connected 1 px lines and don't break into
   floating single pixels past the snout. If they break, shorten them at k = 1 only.
3. **A banding check:** no parallel stair-step bands on:
   - the dog's jaw core shadow and the jowl sag rims;
   - the soft peach highlight on the near cheek (about hero x 1185–1240, y 470–540): if its edge reads as a hard
     blob, add one intermediate tone on its lower edge only;
   - the raccoon belly's turning-under shadow;
   - the tail rings;
   - the cap brim.
4. **Every view at every size:**
   - the raccoon at k = 1.5 and 1;
   - Dog Fjord grin, laugh and shock at 1.5, 1 and 112 x 100, at 1x and in the 2x cutscene view.
   The eyes, nose and mouth must stay distinct, with nothing merging.
5. **The frame and transparency:** nothing touching or clipped at the 232 x 208 edges, no stray semi-dark or
   background-coloured pixels outside the silhouettes, and the coloured outer silhouette continuous (no gaps on the
   shadow side).
6. **The pump's final check:** a single axis, the T-bar perpendicular, only the hose curving.
7. **The regression side-by-side:** the dog against iter_05 and iter_08 (appeal at least iter_08's), the raccoon
   against iter_07 and iter_08.
8. **Code hygiene:**
   - The exports and signatures are intact: `raccoonPortrait2d(expr = 'smirk', k)`, `dogPortrait2d(expr, k)`,
     `GW = 232`, `GH = 208`, `portraitsPreview()`.
   - Remove the unused helpers (check `lerp`) and the variant-era header comments; write a short accurate header for
     M4.8.
   - `tools/palette.mjs` diffed against git HEAD shows **only added keys**, with no original key's value changed or
     removed. The keys added *in this loop* whose values changed between rounds are fine.
   - `tools/lib/draw2d.mjs` is still backwards compatible: render the other sprites that use it and confirm they are
     unchanged.
9. **The snapshot:** `node tools/snapshot.mjs portraits_2d tools/sprites/portraits.mjs portraitsPreview "M4.8 round 10: polish" 3`.

## Keep, don't touch
Everything. Round 09 is the release candidate. Round 10 may only remove specks, soften a band edge, and tidy code.
