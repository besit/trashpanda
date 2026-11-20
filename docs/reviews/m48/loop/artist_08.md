# Artist, round 08 (refinement 5)

Files:
- `tools/sprites/portraits.mjs`. Rendered as `iter_08.png` / `iter_08_hero.png`; snapshot `portraits_2d/v18`.
- The edit scripts: `edit_r08_dog.cjs` and `edit_r08_racc.cjs`. Backup of round 07: `variants/r07_backup_portraits.mjs`.
- Side-by-side with round 05: `cmp58.png` (a scratch comparison, not kept).

## Dog Fjord
1. **The mouth area reverted to round 05.** The whole mouth section (the upper lip across, the wide white crescent, the jowl lobes, the laugh and the shock) is transplanted back from `variants/r05_backup_portraits.mjs`.
   - Kept on top: the round 06/07 pink palette (only the shadows mauve), the rosy terminator, no stipple, the eyes, nose, patch, folds, ears, hair and bust.
   - Removed: round 07's pouches, the thrust lower lip over the teeth, the maroon gaps and the blocks.
2. **Light-touch teeth:** one clean white field with the upper lip's shadow band across the top, and the teeth cooling toward BOTH corners (the near corner now too).
   - Three very soft one-value separations (painted only on white), and a clean even lower band.
   - Round 07's bigger fangs. The laugh keeps its upper row and tongue, and the shock its O with the fangs.
3. **Light-touch jowls:** the dark crease that closed their outline is gone.
   - Each lobe's outer lower edge sags about 3 to 4 units past the mouth corner, with a soft mauve rim melting into the jaw's shadow.
   - A thin dark lip edge runs only along the mouth line (upper and lower edges of the crescent, on the skin).
   - At 112 they read as cheeks with no lumps.

**Check against iter_05_hero:** the same striking wide grin and fangs, now on the clean pink, without the stubble. At least as strong: the side-by-side shows the same read and better colour.

## Raccoon
4. **Body light pass.**
   - The near side of the torso is a step brighter (5→6, 6→7, 7→8).
   - The far side and the belly's underside are a step darker; the warm ramp's darks lean violet, so they are also cooler.
   - The head's and bandana's cast shadow on the upper chest is a step deeper.
   - A dark wedge sits between the legs, and a contact shadow (the darkest coat tone) on the floor under each foot.
5. **A start on the face details:**
   - The mask's outer strands curve back and up toward the ears.
   - The eyes' square catchlight is bigger (1.6k instead of 1.3k); the secondary sparkle stays.
   - The nose's top plane is brighter, with a second white highlight pixel.

## Next (round 09)
- Sheen clusters on the mask's upper lobe edges.
- Check the ground shadows don't read as a black bar at k = 1.
- Check the dog's jowl sag at 1.5 for any band.
- Round 10 is polish only.
