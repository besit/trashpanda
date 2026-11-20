# Judge 02: iter_02 vs judge_01

Same scale. Grid = 232x208 (k=1.5 render px / 1.5).

## 1. Scores (1-10; round 1 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 7 (7) | 6.5 (6) |
| Symmetry / structure | 7 (7) | 6.5 (6) |
| Silhouette / overall shape | 6 (6) | 5.5 (5) |
| 2D pixel-art craft | 7 (7) | 7 (7) |
| Face / expression appeal | 7.5 (7) | 7 (4) |
| Small-size readability | 7 (7) | 7 (6) |
| **Overall** | **7 (7)** | **6.5 (5.5)** |

## Round-01 fixes: status
**Dog:**
1. Pompadour: **done**. It reads as combed-back grey hair at every size and is no longer a cap. The new problem is the head's join under it (D2).
2. Smug grin (wink, cocked brow, lidded patch eye, lopsided grin, flews): **done**. This is the biggest gain of the loop so far.
3. Teddy muzzle removed, creases and wrinkles added: **done**.
4. Heavier jaw: **overdone**. Heavy, yes, but now a stiff trapezoid (D1).
5. Rose ears: **done**. They read as folded flaps.
6. 112 fixes: **done** (single tooth row). There is still a pink hole between the cocked brow and the patch cleft.

**Raccoon:**
1. Torso, shoulders, arms: **partly, weak**. The chest patch and grey forearms are in. The silhouette is unchanged: a wide sack sitting on the bottom edge, and the near upper arm is unreadable.
2. Nose lower, snout bridge: **done**.
3. Eyes off the mask: **done**. They read well at k=1.
4. Lower face: **partly**. Still a big white slab from the mask to the chin.
5. Grey forearms, dark hands: **done**.

## 2. What works (keep it)
- **Dog:** the expression set. The wink with lash tick, the pulled-down near brow, the cocked arched brow, the heavy-lidded patch eye with its glint, the lopsided grin with the flews, the jowl creases, the forehead wrinkles. Also the pompadour's front-left lift and tapered ridges. At 112 the wink, the glint, the grin and the hair all read. Keep the ears.
- **Raccoon:** the head is finished in principle: mask, amber eyes, lower nose, smirk, ears. The pump too.

## 3. Fixes, ranked

### Dog Fjord
1. **The head is a bell jar.** I agree with the art lead. Now each side is one straight slanted line, from ~(73,51) down to ~(41,133). The bottom corners are square at ~(45,152)/(178,152), and the chin is a flat line at y ~160. Rebuild the outline as a sequence of curves. Measure the 3D row by eye: it bulges at the mouth line, not at the bottom.
   - **Skull:** rounds over from the ear hinges (~58,66 / ~164,64) up under the hair (see D2).
   - **Temples:** a slight pinch at y ~80-95 (x ~52 / ~170).
   - **Cheeks/jowls:** bulge *outward* to the widest point at the mouth line, y ~120-135, x ~38 and ~184. That is 4-6 wider than the temple-to-jowl line today.
   - **Underside:** curve back *in* with a radius of ~16-20 at the bottom corners, into the jowl lobes at ~(56,154) and ~(166,152). Put a small concave dip where each lobe meets the chin (~x 80 and ~x 142, y ~158), then a **rounded chin** low at ~(108,165).
   - **Lumps:** add 2-3 deliberate bumps of 1-2 units: a notch where each jowl crease reaches the outline, and a slight cheek bump by the high grin corner. Organic, not polygonal.
   - Keep the narrow-top/heavy-jowl ratio. Only the line quality changes.
2. **The hair sits on a flat-topped head.** Under the hair there is a near-straight pink ledge with a light rim at y ~46-50, x 75..152, so the skull reads as cut off with the hair laid on top like a toupee.
   - Let the head outline continue up *into* the hair outline: the hair's sides come down over the skull edges to the ear hinges (y ~60-64), with no visible skin ledge.
   - Keep the P shadow under the front hairline only (x ~80-120), max 2 units. The art lead's worry about a band is real at 1x.
3. **Patch eye: cut the lash flicks.** The flicks at the outer lid end read as mascara, feminine, not sleazy. Use a heavy flat K lid with a slight droop at the outer end instead. Fill the pink hole between the cocked brow and the heart's cleft: either drop the brow 1-2 onto the patch edge, or paint the cleft brown.
4. **Small polish.** At 1x the wink arc and the wink brow merge into one blob. Leave a 1-px skin gap at 112 (raise the brow 1 unit at small k). Teeth: the grey lower half of the crescent is fine. Keep it.

### Raccoon
The head is at ref level. The body is what stops it looking like refs 4/5. Those read as **chunky, confident forms**: a big head over a *smaller* body, limbs as clearly outlined tubes overlapping the torso, and a pose with negative space. Concretely:

1. **Smaller torso, cropped like a bust.** It is now x ~71..207 (136 wide, 1.24x the head) with a rounded bottom resting on the frame, which is the sack read. Make the torso narrower than the head:
   - ~82 wide at the chest (x ~86..168), widening only a little to ~92 at the frame's bottom edge.
   - Its sides run straight *out of the frame*: no rounded bottom corners, the frame crops it as it crops the dog's suit.
   - A slight waist/hip line (one G stroke) at y ~185.
   - The ruff stays under the jaw, covering the neck join.
2. **Arms as outlined tubes in front, with negative space.**
   - **Far arm, fist on hip:** the elbow goes *out* to ~(212,150), leaving a clear background triangle between arm and torso (~14 wide at y 160). Upper arm ~16 thick, forearm ~13, both with a full K outline where they overlap the body. Today the inner line is grey, so the arms melt into the torso. The fist sits on the hip at ~(172,186).
   - **Near arm:** a visible upper arm from the shoulder (~88,124) down to a rounded elbow at ~(80,168), *outside* the torso edge, then the forearm up to the paw on the pump (~62,142). Leave background visible between forearm and torso. Same K outline and one flat G shadow on the underside.
   - Right now the near upper arm is a pale panel pasted on the body, and that is why it is unreadable.
3. **Add the ringed tail.** It is the raccoon's second identity mark (refs 1/4/5) and it breaks up the bottom mass. With the narrower torso there is room. A bushy tail comes from behind the lower right of the torso and curls up through the space under the far elbow: base ~(170,205), tip ~(222,160), ~22 thick. It has 3-4 dark `K`/`G` rings with a pale `H` tip and a full outline. (Alternative: lower left, between the torso and the hose, if the right side is too crowded.) At k=1 the tail must still read as rings, so make each band ≥4 units.
4. **Break up the white lower face.** It is one slab from the mask bottom to the chin and into the right-side ruff. Keep the white on the snout and the two cheek flares under the mask ends. Make the chin/jaw under the smirk `h` grey (y ~106-118) with a 1-unit G jaw line, so the head ends clearly above the ruff, as in the 3D, whose lower jaw is grey.
5. **The fist and the paw (polish).** Make the hip fist one chunky K-outlined shape with 3 clear knuckle bumps on its silhouette, not internal lines only. Same for the pump paw's finger ends. Refs 4/5 hands read by silhouette.

## 4. Must not regress
- The dog's whole expression layer: wink, brows, patch lid, lopsided grin, flews, creases. The pompadour's lift and ridges, the ears, the ~136 head size, flat 3 tones, the 112 readability.
- The raccoon's head as it stands, and the pump.
- Signatures, sizes, the palette, consistent outlines. The dog stays a cartoon bulldog.
