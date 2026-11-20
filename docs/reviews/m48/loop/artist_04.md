# Artist, round 04 (refinement 1: the final direction)

Files:
- `tools/sprites/portraits.mjs`: now ONE pruned drawing, with no variant switches. Rendered as `iter_04.png` / `iter_04_hero.png`; snapshot `portraits_2d/v14`.
- `variants/r04.mjs`: the same file with the scratch import path, for rendering.

Pipeline:
- `r04_parts.mjs`: the new standing body.
- `make_r04_src.mjs`: assembles `r04_src.mjs` from those parts plus r03's pump, paws, bandana and dog code, with the fixes below.
- `build_r04.mjs`: splices in the kept raccoon head (cap tilt included) and writes portraits.mjs and the variant copy.

From round 05 I'll edit `tools/sprites/portraits.mjs` directly. The pipeline was only needed to merge the explorations.

## The 6 fixes
1. **The raccoon as a standing cane figure.**
   - The pump is planted on the floor (the frame's bottom edge) and the T-handle is at chest height.
   - The raccoon stands behind it on two short stout legs with big dark hind feet either side of the foot plate. Each foot has 4 toes with light knuckles and claws.
   - Both paws are stacked on the T-handle with the enlarged `flatPaw()` (1.45 to 1.5x), the fingers curling over the bar.
   - Contrapposto: the weight is on the far leg (its hip higher, the hips shifted right), the near leg relaxed and turned out. Both elbows flare out.
   - **The head is the same size as r03_b's** (RZ 1.0, same screen position). The figure is chibi: a short torso and legs, never a smaller head.
   - The cap is tilted about 4°, brim side up. Its brow shadow is thinner, so the white brow tufts show under the brim.
   - The pump is about 76 design units. That's shorter than the judge's 100 to 110, because the head size takes priority.
2. **Anatomy under the fur.**
   - The torso is blocked in as round shoulders, a chest, a waist and hips, with the arms rooted at the shoulders.
   - The silhouette is calm. Fur tufts sit only at the hip sides, the belly side and the elbows, plus the head's ruffs.
   - The pale bib follows the chest and turns away on the right. There's a broad half-tone and a clear core shadow down the shadow side, and the belly turns under at the hips.
   - The torn-paper islands are gone.
3. **The ringed tail is back.**
   - It curls out from behind the hips to the lower right, well away from the paws.
   - It has 4 rings that bow round the cylinder, each with a lighter upper half and a dark shadow side, and fur breaks between them.
   - The tip is a tapered dark end broken by lit fur strokes. The silhouette tufts only toward the tip.
4. **Dog Fjord's flews as soft drapes.**
   - The drapes are broad U-lobes with the lowest point near the mouth corner. They sag over the lower lip and the corners, merging into the jowl, with a soft crease under each U.
   - The fangs were moved inside the drape edges so they poke up past the upper lip.
   - One chin mass, plus one crease: the stacked second chin and the early chin band are gone. The jowl lobes now hang from the head's silhouette instead of travelling with the chin-up face.
   - The chin-up nose shows comma-slit nostrils curving out and up, with a lit rim above each, a central groove splitting the lower edge, and no round pig holes.
   - Laugh and shock share all of this: the drapes, the fangs, the ears, the chin and the nostrils.
5. **iter_04's ears restored.**
   - The exact M4.7 iteration 04 geometry: a straight top edge from the hinge under the hair, angled out and a little down to a pointed tip, no inner hole. I checked them against `ref_iter04_hero.png`.
   - The shading upgrades stay: a lit upper plane with a hot spot and a maroon underside that's deeper at the hinge.
6. **The combination, assembled and pruned.**
   - Raccoon: cap, bandana and teal pump.
   - Dog: b's chin-up face (low lid at the pupil, iris low and sliding left, arched patch brow, nose rope, stop crease, underbite) on a's sunk navy shoulders, with the gold car tie and the flag pin. No blaze.
   - Unused code removed: the variant switches, the other suits, the tube-wrapping hand, the fist and the old poses. Nothing references `V` any more.

## Known weaknesses / next
1. **Raccoon arms:** the elbow flares read a bit like wings. They need a clearer upper arm, elbow and forearm break, and more forearm showing before the paws.
2. **Pump:** it reads as a cane but is short next to the figure. Options: a narrower barrel, or pull the T-handle up a few units toward the chin, which only works if the paws stay below the chin.
3. **Legs and feet:** a bit plain. The relaxed leg needs more turn-out, and the thigh fur needs a highlight cluster.
4. **Tail:** the rings could use a lit fur rim on their upper edges, and the base where it leaves the hip could be clearer.
5. **Dog:**
   - The grin is still a little narrow at k = 1.5 between the drapes.
   - The near drape's lit top is a bit round.
   - The chin plane and the reflected-light band at the head's bottom still make two bands under the mouth; merge them into one gradient cluster.
   - The jowl at the lower right has a leftover dark crescent.
6. **Nostril slits:** they read at 1.5 but not at 1. Consider a bolder comma at k = 1.
