# Artist, round 06 (refinement 3)

Files:
- `tools/sprites/portraits.mjs` and `tools/palette.mjs`. Rendered as `iter_06.png` / `iter_06_hero.png`; snapshot `portraits_2d/v16`.
- The edit script: `edit_r06.cjs`.
- Backups of round 05: `variants/r05_backup_portraits.mjs`, `variants/r05_backup_palette.mjs`.

## Toolkit
- `Canvas.furClusters(on, shapes, color, { only, dir, len, gap, per, density, avoid, seed })` in draw2d.mjs:
  - Fur texture INSIDE a zone: clusters of 2 or 3 parallel strokes side by side (slightly staggered), then a gap, following a flow field.
  - It paints only over the given tones, skips calm zones (`avoid`: circles in design units), and scales its count by `density`.

## The fixes, in order
1. **Raccoon face, fur inside the zones.** Strands in each zone's neighbouring tones, following `headFlow`:
   - the muzzle and brows: grey `7` strands on the cream, plus a few `6`;
   - the mask: `2` on `1`, `3` on `2`, `1` on `0`, charcoal strands sweeping out and back;
   - the forehead and crown: `6`/`4` on `5`, `7` on `6`, `5` on `4`;
   - the cheek ruffs: longer `6` strokes, inside the ruff shapes only.
   - Calm zones of radius 12.5 / 10 / 9.5 round the two eyes and the nose.
   - Density 1 at k = 1.5, 0.5 at k = 1, none below. The head's shapes are untouched.
2. **Dog Fjord's pink back.**
   - Palette values changed for my round-05 keys: `/` is a clear warm pink-peach (#ffbaa4), `¢` a highlight with only a whisper of ochre, `Q` a clean pink one step under round 04's salmon, `£` a pink side plane.
   - Only `§`/`¤` are mauve.
   - **The olive is gone:** `9` is now a rosy red (#e86e78), drawn as a clean continuous terminator along the top of the jaw shadow whose width follows the form (0.8 to 2.8 units). Its stipple passes, and the `^`/`P` stipple passes, are deleted.
3. **The drapes hang.**
   - Each drape comes down from the upper lip at the corner, overlaps the mouth corner and the end of the tooth row, and has its lowest point (y ≈ 148) well below the lower lip line.
   - The lit top slopes down and out. The lower half is a step darker (`£`) and then melts into the jaw's core shadow (`§`).
   - A tapered dark crease runs only down the upper/inner edge, and the fangs poke up just inside it.
   - The laugh lifts them a little (`d = -4`); the shock hangs them longest (`d = 7`, slack-jawed).
4. **Raccoon arms.**
   - The upper arms are one value darker than the torso, with a lit rim on the outer edge (light on the near arm, softer on the far one) and a dark occlusion crease where the inner edge overlaps the chest.
   - The elbows sit further out (x 81 / 176) so they break the silhouette with their tufts.
   - The forearms reach higher than the wrists, so a sliver shows above each paw.
5. **Raccoon body.**
   - Strand clusters at half the head's density (`8` and `6` on the bib, `6` on the mid fur, `3` on the belly shadow).
   - One more turning-under belly shadow, a highlight cluster on the near shoulder, and a lit core on the near thigh.
   - The T-bar is wider (half width 37) with a lit highlight on each grip, so the grips stick out clearly past the paws.
   - The knuckles are one value lighter.
6. **Dog teeth and details.**
   - The grin is now dog teeth: uneven, blunt upper teeth hanging from under the lip, lit on their near side, and smaller lower teeth rising from the jaw, all on the mouth's grey shade (no white field, no ticks).
   - A clear lip-shadow band across the top of the teeth, cool grey toward both corners, dark corners, a hint of gum at the corners.
   - Bigger fangs.
   - Stronger forehead folds (thicker shadow crescents with lit ridges).
   - Bolder nostril commas below k = 1.4.

## Known weaknesses / next
1. **Drapes:** they now cover the corners, but they're still subtle in value against the near cheek. The near drape and the cheek share the lit pink.
   - Options: a cool reflected light just under the drape's U where it meets the jaw shadow, or a value step at the drape's outer edge only.
2. **Teeth:** the lower row reads a little like round beads. Make it flatter and more irregular, with one tooth missing or turned.
3. **Mask strands:** a little uniform in direction (mostly horizontal). The flow could curve out from the eye corners, using a per-zone flow instead of the nose-centred one.
4. **Arms:** better, but the forearms are still mostly hidden by the paws. The near forearm could show a lit ridge along its top.
5. **Body:** the bib's strand clusters could be longer and fewer. The belly side tufts are still a bit even.
