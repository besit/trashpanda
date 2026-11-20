# Judge 05: iter_05 vs judge_04, plus a look back at iter_01..05

Same scale. Grid = 232x208 (k=1.5 render px / 1.5). 3D positions are mapped through the 1.1x `T()` about (110,100).

## 1. Scores (1-10; round 4 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 8 (7.5) | 7 (6.5) |
| Symmetry / structure | 8 (7.5) | 7 (7) |
| Silhouette / overall shape | 8 (7.5) | 6 (6) |
| 2D pixel-art craft | 7.5 (7.5) | 7 (7) |
| Face / expression appeal | 7.5 (7.5) | 7 (7.5) |
| Small-size readability | 7.5 (7.5) | 7 (7.5) |
| **Overall** | **8 (7.5)** | **7 (7)** |

## Honest trend call (iter_01 → 05)
- **Raccoon: still improving every round, with no regressions.** Iterations 01→02 were small, 03 added the tail and outlined arms, 04 the hip triangle, and 05 chunky limbs. iter_05 is the best raccoon. It is close to done.
- **Dog: plateaued at ~7 since iter_04, and two parts regressed.**
  - *Better than ever:* the head mass. A rounded square, the U bottom, the jowl weight, the height (~148).
  - *Regressed vs iter_02/04, the hair.* The swept pompadour with lift and long ridges had the politician's swagger. Now it is a wide, low grey bowl with compressed ridges, which reads as a helmet or bowl-cut at 112. **Part of this is my fault:** judge_04 asked for a ~100-wide hair base. The 3D hair is x 84..151, which maps to **~74-80 wide**. It sits on the crown with pink skull showing at its sides, and the ears sit in those top corners.
  - *Regressed vs iter_02/03, the ears.* They were folded flaps at the upper corners. Now they are horizontal sheep or goat ears at y ~75, tips at x ~35/185.
  - *Never solved:* the muzzle volume. Since the teddy oval was cut in iter_02, the face has been a flat panel with features on it.

## Round-04 fixes: status
**Dog:**
1. Head+hair as one dome, ~144 tall: **partly**. The height and the single convex outline are done, but the hair is too wide (my spec error) and the ridges are squashed.
2. Jowl weight from flat shapes: **done**. Skipping the cheek puff is acceptable.
3. Re-fits: **partly**. The lit wedge and the shadow are fine, but the ear re-hinge produced sideways ears.

**Raccoon:**
1. Chunky limbs: **done**. Keeping the elbow at x 194 to save the triangle was the right call.
2. Tail arc, no hook: **done**.
3. Shoulder masses and creases: **done**.

## 2. Done: stop touching it (updated)
- **Raccoon:** everything on the round-4 list, **plus** the arms (thickness, layout, background triangle), the fist, the tail and the shoulders. Only the polish below is left.
- **Dog:** everything on the round-4 list, **plus** the lower outline (cheeks to the U bottom), the overall head width (~138) and height (~148), and the jowl folds, crescents and chin fold.

## 3. Fixes, ranked

### Dog Fjord
1. **Hair: back to a compact pompadour on the crown.** Keep the head outline exactly as it is.
   - **Width:** narrow the hair to **~78 wide** at its base, x ~74..152 at y ~58, so ~10-14 units of pink skull dome show on each side between the hair and the ears.
   - **Height:** hair top at y ~22, with the front-left quiff ~5 above the back-right, a gentle lift, not iter_04's tall one.
   - **Ridges:** restore iter_04's ridge length and spacing. Drop the 0.75 squash and use 4 tapered ridges sweeping back.
   - **Outline:** the skull outline continues *under* the hair's sides. The hair overlaps the dome, with no step and no stack. It reads like iter_04's hair sitting on iter_05's wider skull.
2. **Ears: top corners, folded forward and down, overlapping the outline** (as in the 3D). I agree with the art lead.
   - **Hinge:** at the head's top corners, beside the hair sides: left ~(62-78, 52-58), right ~(146-162, 52-58). The fold line forms the head's top-corner silhouette.
   - **Flap:** a triangle drawn *in front of* the head edge, tip pointing down and slightly out, to ~(54,80) and ~(170,78).
   - **Colour:** light `M` on the fold edge, the visible underside in P, a K outline over the head.
   - Nothing sticks out horizontally. The widest point of the whole head stays the cheeks.
3. **Suggest the muzzle volume with flat shapes.** No oval, 3 tones only:
   - (a) **A cast shadow under the nose:** a P crescent below and to the right of the nose, ~22x4 (x ~84-110, y ~117-121), ≥2 px at 112.
   - (b) **Upper-lip pads:** two rounded pads between the nose and the grin, either side of the philtrum, bounded by the flews and the grin line, open at the top. The near pad in lit `M`, the far pad in base `m` with a P lower edge. The freckles sit on them.
   - (c) **The muzzle's far edge on the shadow side:** a P curve from just below the patch's tip (~140,104) down to the far grin corner (~146,128). It is the muzzle's silhouette against the cheek and makes the snout stand forward.
   - (d) **The bridge:** a short lit `M` stripe from between the eyes to the nose top (~x 98-104, y 88-96).
   - Together these make the snout read as a forward block, not a teddy oval.

### Raccoon (polish only, then stop)
1. **Near upper arm vs torso.** Both are `h`. Add a 2-unit H highlight on the arm's lit outer edge, and widen the torso's G cast shadow beside the arm to ≥3 units at k=1.5, so the arm separates without relying on the outline.
2. **A few fur accents.** Add 1-2 small fur notches (≤2 units) on the outline at each elbow cap and at the tail's widest band. Use the same notch language as the cheek tufts, so the tubes read as furry limbs rather than pipes. No more than ~6 notches in total.
3. **Hip-arm proportion check.** The upper arm (shoulder → elbow) reads a touch longer than the forearm and the big fist. If it can be shortened ~3 units (elbow ~(192,150)) without closing the triangle (keep ≥10 at y 158), do it. If not, leave it.

## 4. Must not regress
- Everything in section 2.
- The dog's expression layer, its ~148 height and ~138 width, its U bottom and jowl folds.
- The raccoon's in-frame rule and background triangle.
- Signatures, sizes, the palette, flat 3 tones. The dog stays a cartoon bulldog.
