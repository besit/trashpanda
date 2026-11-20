# Judge 06: iter_06 vs judge_05 (about 2-3 rounds left)

Same scale. Grid = 232x208 (k=1.5 render px / 1.5). 3D positions are mapped through the 1.1x `T()` about (110,100).

## 1. Scores (1-10; round 5 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 8 (8) | 7 (7) |
| Symmetry / structure | 8 (8) | 6.5 (7) |
| Silhouette / overall shape | 8 (8) | 6 (6) |
| 2D pixel-art craft | 7.5 (7.5) | 6.5 (7) |
| Face / expression appeal | 7.5 (7.5) | 7.5 (7) |
| Small-size readability | 7.5 (7.5) | 7 (7) |
| **Overall** | **8 (8)** | **7 (7)** |

**Dog:**
- The hair is fixed: a compact pompadour on the crown, no longer a bowl. That lifted face appeal.
- Two new problems cancel the gain: the face seam lowers structure and craft, and the hidden ears leave the silhouette at 6. **Without the seam this round would be ~7.5.**

**Raccoon:** frozen, no regression. One nit: the new fur notches read as small dark thorns at poster size, at the hip elbow (~205,155) and on the tail (~185,185). Either fill them in body grey (`h`/`G`) so that only their outline tips show, or delete them. They are invisible at k=1, so this is optional.

## Round-05 fixes: status
1. Compact pompadour, ~80 wide: **done**. Pink dome shows at both sides, and the ridges are back to full length. Keep it.
2. Ears at the top corners, folded forward and down: **partly, over-tucked**. They sit at the corners now, but entirely inside the outline, so they read as dark triangles painted on the skull. The silhouette has lost its ear cue and reads as an acorn or bucket. I agree with the art lead.
3. Muzzle volume:
   - **Cast shadow under the nose: done.** It works, keep it.
   - **Far muzzle edge: partly.** It merges into the crease clutter on the right.
   - **Upper-lip pad and bridge stripe: regression.** The near pad's straight vertical edge at the philtrum (x ~88) and the vertical bridge stripe (x ~98-104) make a hard seam down the face. It cuts through the grin and runs beside the shock's O mouth: a split face, not lighting.
4. Raccoon polish: **done**. The near-arm separation reads, and the shortening was correctly reverted. For the notches, see above.

## 2. Done: stop touching it (updated)
- **Raccoon: everything.** Frozen.
- **Dog:** the expression layer, heart patch, nose, nose cast shadow, forehead wrinkles, suit, lower outline (cheeks → U), ~138 width and ~148 height, the jowl crescents and chin fold, **and now the compact pompadour** (position, width, ridges).

## 3. What gets the dog to 8 (ranked; all three fit into 1-2 rounds)

1. **Ears as part of the silhouette at the top corners, about 45°.** The 3D ear base rises a little *above* the head's top corners. Its flap folds over and outward, so each ear adds a small notch-and-point to the outline at the top corner, not at the sides.
   - **Base:** an attachment rising to ~y 46-48 at x ~62-76 (left) and ~146-160 (right). That is ~6-8 above the skull corner, right beside the hair sides, so the corner gets a bump.
   - **Flap:** folds outward and down at ~45°. Tips at ~(50,62) and ~(170,62), so they stick ~6-8 *outside* the skull outline. Compare iter_05's ~20, out at mid-side height y ~75.
   - **Shape and colour:** a triangle ~22 long. A light `M` fold edge along its top. The visible underside in P/p. A K outline all round, including where it overlaps the head edge.
   - **Check:** the head's widest point must still be the cheeks (~138). The ear tips stay inside x 44..182. At 112 each ear is a ≥4-px readable point at each top corner.
   - This also rounds off the "bucket" shoulders of the skull beside the hair.
2. **Remove the split-face seam.** Make the light read as coming from the upper left across a round form, not as a half-and-half split.
   - **(a) Near upper-lip pad:** draw it as a *rounded lobe*, convex on all sides. Its inner edge curves away from the philtrum, ending ~3 units left of it, with a rounded bottom tucked under the flew line. There must be no straight vertical boundary anywhere. Alternatively, drop the `M` pad and leave both pads base `m`, defined only by their P lower edges. Prefer this if the lobe still reads as a seam at 112.
   - **(b) Bridge stripe:** make it a short *tapered* highlight, ~2 wide at the top between the brows and ~5 at the nose top, over y ~90-97 only. Or delete it. It must not line up vertically with the pad edge.
   - **(c) Lit plane:** the `M` area stays the outer-left wedge that follows the outline. Nothing lit should reach the face's centre line.
   - **Verify on all three expressions:** no tone change may cross the mouth (grin teeth, laugh mouth, shock O).
3. **Declutter the right side so the muzzle reads.** Right now the right half carries the muzzle far edge, the main jowl crease, a second outer fold, the crescent and the right-side shadow: five near-parallel curves. At 112 they become stripes. Merge the muzzle far edge and the main crease into **one** strong fold, running from under the patch tip, past the far grin corner, down into the jowl, as a 2-px `p` line with a P sliver outside. Delete the right outer second fold. Keep the crescent and the shadow side. On the left, keep the main crease plus at most one short outer fold. The snout then reads as the block in front of the jowls.

Optional, only if a round is spare: a 1-unit `M` highlight on the near cheek pad above the high grin corner, to give it puff. Stay at 3 tones.

## 4. Must not regress
- Everything in section 2.
- The compact pompadour. The nose's cast shadow. The U bottom with no flare.
- The cheeks stay the widest point.
- Signatures, sizes, the palette, flat 3 tones. The dog stays a cartoon bulldog.
