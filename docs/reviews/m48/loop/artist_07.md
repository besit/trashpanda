# Artist, round 07 (refinement 4)

Files:
- `tools/sprites/portraits.mjs` and `tools/lib/draw2d.mjs`. Rendered as `iter_07.png` / `iter_07_hero.png`; snapshot `portraits_2d/v17`.
- The edit script: `edit_r07.cjs`. Backup of round 06: `variants/r06_backup_portraits.mjs`.
- Regression check: the three heroes stacked (05 / 06 / 07) at `cmp567.png` (a scratch comparison, not kept).

## Toolkit
`furClusters()` takes `ang` (each cluster's direction varied by up to that many radians) and `lenVar` (the strand
length spread).

## The 6 fixes
1. **Dog teeth, chunky and blocky.**
   - Seven blocks along the upper lip (the far two greyed as they turn away), uneven: one longer, one turned (its side plane wider).
   - Each block is a flat lit face and a darker side plane, so the teeth are separated by value with a worn lower edge, all under a clear lip-shadow band.
   - The mouth's interior is dark maroon and shows only in the gaps.
   - **The lower teeth are hidden by the thrust lower lip:** a pink lip with a lit middle and a dark margin, with three small tips between the fangs (they mostly vanish under the lip).
   - The laugh uses the same blocky upper row.
2. **Drapes, unambiguous.**
   - A pendulous teardrop shape: narrow where it leaves the lip at the corner, widening into a bag whose lowest point (about y 150) sits well below the lower lip.
   - The cheek casts a shadow across its top, the body is a step darker (the side-plane rose), the bag turns under in mauve, and a narrow cool bounce runs just above the hem.
   - **A dark pigmented lip margin** runs down the inner edge and round the hem; the outer side stays open into the jowl.
   - The laugh lifts them, the shock hangs them longest.
   - I tried a lit belly on each bag; it read as a pink blush circle, so I removed it.
3. **Raccoon face strands, re-flowed.**
   - A flow per zone:
     - the mask: out of each eye's corners, swept back toward the ears;
     - the muzzle: radiating from the nose and curving down along the jaw;
     - the forehead: fanning up from below the brow;
     - the brows: combed outward;
     - the cheek ruffs: longer strokes down and out.
   - Each cluster's direction varies by about ±15° and its strands' length by about ±50%.
   - **The muzzle is down to 45%** and only in its turning-away zones (under the snout, the muzzle's side under the mask, under the mouth); the lit top of the snout and the upper cheek stay clean.
   - Every strand is ±1 tone from its ground (the muzzle `8` on `W`, `7` on `8`; no more `7` on `W`).
   - At k = 1, only the mask and the forehead get strands, at 0.3 density.
   - A despeckle pass on the head runs after the strands.
4. **Raccoon body strands: fewer and longer, grouped into tufts that follow the form.** The short furStrokes are gone.
   - The lower bib flows down and out from the throat, with a few lit tips; the belly fur curves round and under.
   - The texture sits in the half-tones and the shadow side; the lit planes stay calmer.
   - Leg strands are longer and sparser. A body despeckle runs after.
5. **Forearms.** The near forearm has a lit ridge from elbow to wrist (two tones), the far one a subtler ridge, and there's a fur tuft at each wrist where the forearm meets the paw.
6. **Finishing.**
   - Each tail ring has a lit fur rim on its upper edge, toward the light (the ring lit, then re-darkened shifted away from the light).
   - The barrel is longer: the rod showing is 16.4 (from 19) and the gauge sits lower.

## Side-by-side check against iter_05 and iter_06
- **Raccoon:** the muzzle is cleaner and brighter than 06 (fixes 06's grey muzzle), and the body is calmer than 06 (no corduroy). Arms, pump, feet and tail are unchanged or better. **No regression found.**
- **Dog:**
  - The drapes now read as hanging bags, not cheeks (better than 05 and 06), and the teeth are blocks, not beads (better than 06).
  - **The one trade-off:** the visible white of the grin is shallower than in 05, because the drapes cover the corners and the lower lip covers the lower teeth (both asked for). It still reads as a wide grin at 1.5 and at 112.
  - The pink, the terminator, the planes, the fangs and the eyes are all unchanged.

## Known weaknesses / next
1. **The teeth's lower edge** is a little ragged against the dark interior. Even out the heights a touch, or soften the gap to a lip shadow instead of maroon.
2. **The drapes at 112** are two big lumps (they read, but they're heavy). The small-size drapes could be shorter.
3. **The mask strands** are still mostly near-horizontal on the outer lobes (the flow sweeps back there); the inner corners curve well.
4. **The near paw** still covers most of the forearm. The paws are fine; the arms read.
