# Drawer 05: the dog's head+hair dome and jowl weight; the raccoon's chunky limbs

Sheet: `tools/scratch/piter/iter_05.png`. Snapshot: `art/history/portraits_2d/v06`. Only `tools/sprites/portraits.mjs`.
Everything on judge_04's "Done: stop touching it" list was left alone, except where a neighbouring shape moved and it had
to be re-fitted (noted below).

## Dog Fjord
1. **Head + hair as one dome.**
   - The traced lower outline (U bottom, cheeks, widest point ~138 at canvas y ~122) is kept. The upper skull is widened to the judge's numbers: ~108 at canvas y 66 and ~124 at y 90.
   - The hair is now a low rounded dome hugging the skull top. Its top is at 3D-grid y 31 (canvas ~24), the front only ~1 unit higher than the back, and its base is ~96-100 wide at canvas y ~58.
   - The hair's outer edge continues the skull's side curve, so there is one convex outline from the ear hinges up over the hair, with no step.
   - The sideburn wedges are kept and re-placed at the new sides.
   - Total height: canvas ~24 → ~172 = **~148** (was 155; the judge's 3D estimate is ~144).
   - The pompadour *texture* is unchanged: the same ridges and highlights, only remapped into the lower dome (`hy()` compresses their y by 0.75 toward the hairline).
2. **Jowl weight, from flat shapes (3 tones only):**
   - (a) a P crescent under each cheek pad, following the sag down to the U (≥2 px at 112);
   - (b) each jowl crease is now a fold: the 2-px p line plus a P sliver on its outer side;
   - (c) a short second p fold outside each main crease;
   - (d) a chin fold under the lower lip with P below it down to the outline. For the laugh it sits 4 units lower (y 158) so the open mouth still clears it. The old grin chin crease line was removed, because the fold replaces it.
   - (e) I skipped "puff the cheek pads". The flews plus the crease folds already tuck the corners in, and a 4th tone would break the 3-tone rule.
3. **Re-fits:**
   - Both ears are re-hinged on the wider skull under the hair's sides (tips ~(41,78) and (179,78), still out and down), with the same shape as before.
   - The lit-plane wedge and the right-side P shadow follow the new outline.

## Raccoon
1. **Chunky tapered limbs:**
   - Hip arm: the upper arm tapers **24 → 20** (shoulder (160,129) → elbow (194,151)), with a round deltoid mass at the shoulder. The forearm tapers **19 → 16** back to the fist.
   - I kept the elbow at x 194 rather than the judge's 188. With the thicker tubes, 188 would close the background triangle. I measured it at k = 1: **13 wide at y 154, 11 at y 158** (the target was ≥10).
   - Near arm: the upper arm tapers **22 → 19** (elbow (84,166)) and the forearm **18 → 15**. The pump paw's wrist area is widened, so there is no neck between the forearm and the paw. The V gap shows near the top of the V.
   - Each tube keeps its K outline and one flat G underside.
2. **Bigger fist:** 1.2x, ~27x26 with the knuckle bumps toward the body, pressed against the waist at ~(168,177).
3. **Tail:** a broader arc instead of the hook. The tip ends ~(222,160) pointing up-right with a ~14 rounded end, and it swells 14 → 22 → 14 along its length. It keeps 4 bands and the dark tip. Measured at k = 1, the gap to the elbow cap is ~16 units.
4. **Shoulder masses:** the arm tubes' round shoulder caps sit under the cheek tufts at ~(92,129) and (160,129). There is a short G crease on the torso where each upper arm overlaps it.

## Self-check (112 and posters)
- 112 dog: the jowl crescents read as weight rather than noise, the dome hair reads as combed grey hair, and the wink, lid and grin are intact. In the laugh the chin fold sits ~1 px under the open mouth. It is tight but clear.
- The dog's ears are a little wider-set now (because the skull is wider). If the judge sees horns again, the tips can drop 2-3 units.
- The raccoon's near upper arm and torso share the h tone. They are separated by the K outline and the cast shadow, and it reads at k = 1.
