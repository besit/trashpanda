# Artist, round 09 (refinement 6: low-risk finishing)

Files:
- `tools/sprites/portraits.mjs`. Rendered as `iter_09.png` / `iter_09_hero.png`; snapshot `portraits_2d/v19`.
- The edit script: `edit_r09.cjs`. Backup of round 08: `variants/r08_backup_portraits.mjs`.
- Comparison with iter_08: `cmp89.png` (a scratch comparison, not kept).

## The five items
1. **Foot contact shadows removed.** The floor ellipses that stuck out past the feet onto the transparent background are gone. In their place, each sole has a darker strip INSIDE the foot (`1` over `2`/`3` along the bottom edge, so the claws and pads survive). The pump's foot plate already has its dark lower strip. Nothing dark remains outside the figure, at k = 1.5 or k = 1.
2. **Mask lobe sheen:** a small 2-tone cluster (`3` with a `4` core, about 7 to 10 px at k = 1.5) on the upper edge of each mask lobe, painted only over the mask's darks, so it adds no outline and the eye surrounds are untouched.
3. **Dog teeth micro-touch:** the upper lip's shadow band now follows the lip's curve and fades out toward both corners (widths 0.6 → 3.6 → 0.6). Each fang has a 1 px cool side plane down its outer edge (a cone, not a flat wedge). Nothing else in the mouth changed.
4. **Near forearm:** a 1 px brighter ridge (`7`) from the elbow toward the paw, over the existing lit ridge. The shapes and paws are unchanged.
5. **The shock at 112:** it read slightly like buck teeth (a grey band over the O and two white wedges under it). At small sizes only, the O is a pixel bigger and dark all through (no grey band), and the fangs are single white pixels on the lower lip. It now reads as an open "O!" mouth. The 1.5 and 1 versions are unchanged.

## Comparison against iter_08_hero
Identical except the five micro changes. No regression. The "must not change" list was respected: no changes to the dog's crescent, jowls, palette or layout, nor to the raccoon's head shapes, strands, pose or pump.

## For round 10 (polish only)
Despeckle and inspect, check for banding, check every expression at every size, check the frame edges, the pump's final check, and the code hygiene below.
- **Dead code:** `hand()` and `fist()` were pruned in round 04. Still to check: unused helpers (`lerp`) and the variant-era comments in the header.
- **Palette:** check `tools/palette.mjs` against git HEAD shows only added keys.
