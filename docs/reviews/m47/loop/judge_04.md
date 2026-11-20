# Judge 04: iter_04 vs judge_03 (iteration 4 of ~8)

Same scale. Grid = 232x208 (k=1.5 render px / 1.5). To compare with the 3D row, I map 3D positions through the drawer's 1.1x `T()` about (110,100).

## 1. Scores (1-10; round 3 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 7.5 (7.5) | 6.5 (6.5) |
| Symmetry / structure | 7.5 (7) | 7 (6.5) |
| Silhouette / overall shape | 7.5 (7) | 6 (5) |
| 2D pixel-art craft | 7.5 (7.5) | 7 (7) |
| Face / expression appeal | 7.5 (7.5) | 7.5 (7.5) |
| Small-size readability | 7.5 (7) | 7.5 (7) |
| **Overall** | **7.5 (7.5)** | **7 (6.5)** |

## Round-03 fixes: status
**Dog:**
1. Rounded square with a U bottom: **partly**. The U bottom is done and the mushroom is gone, but the top is now narrow, giving an egg/pear (D1).
2. Helmet hair sides into sideburn wedges: **done**. The new problem is that the hair is stacked on the skull (D1).
3. Lit plane as a wedge: **done**.
4. Clean 112 stair steps: **done**.

**Raccoon:**
1. Hand-on-hip triangle: **done** in layout (shoulder, elbow, fist on the waist, background triangle). But the limbs are spindly (R1).
2. Shoulders lowered, head overlapping them: **done**. The head now sits naturally on the torso.
3. Bushy tapered tail: **done**.
4. Rounded elbow caps: **done**.

## 2. Done: stop touching it
These are finished. The next rounds should leave them alone, except for re-fitting them if a neighbouring shape moves.
- **Raccoon head, all of it:** ears, forehead stripe, white brows, mask lobes and bridge, amber eyes with lids, glints and lower-lid rims, nose position, snout line, smirk and dimple, grey jaw, cheek tufts.
- **Raccoon:** the pump and the paw gripping it, the ruff zig-zag, the chest patch, the in-frame rounded bust bottom, the tail's band count and colours.
- **Dog expression layer, all three expressions:** wink, pulled-down brow, cocked brow, heavy flat patch lid with glint, lopsided grin with flews, laugh mouth and tongue, shock eyes and mouth.
- **Dog:** the heart patch, the nose, the forehead wrinkles, the rose ears (shape), the suit, shirt and tie, the pompadour's *texture* (tapered ridges, highlight placement). Its position and height are *not* done.
- **Both:** flat cel shading with no dither, the palette, the outline weights, the 112 face readability.

## 3. Fixes, ranked

### Dog Fjord (what's left: the head+hair mass and the lower-face weight)
1. **The hair is a tall cap stacked on a narrow crown, and the head is too tall.** I agree with the art lead.
   - The combined head+hair runs y ~17→172 (155 tall). The 3D mapped through T() is y ~25→169 (~144). The extra height is all in the hair: the quiff lift plus a hair mass sitting *above* the skull, with the pink scalloped hairline step at y ~48 marking the join.
   - In the 3D the hair is the *top of the dome*. The skull's side curve continues straight into the hair outline, and the hair wraps down to the ear hinges.
   - **Hair top:** at y ~25, with the front quiff at most ~4 above the back, so a rounded dome, not a lifted pompadour.
   - **Hair base:** ~100 wide at y ~58 (x ~62..162), sitting *over* the skull's upper ~30 units.
   - **Silhouette:** the combined outline is one convex curve from the ear hinges up over the hair, with no step at the hairline.
   - **Skull:** widen its upper part to match, ~108 at y 66 (x ~56..164) and ~124 at y 90. The widest point stays ~138 at y ~122.
   - Keep the ridge texture, the sideburn wedges and the ears, re-hinged.
2. **The lower half is a big plain pink field.** It needs the 3D's jowl weight, built from flat cel shapes, not lines:
   - (a) A P shadow crescent under each cheek pad, following the sag, from beside the grin's corners down to the U: left x ~46-66, y ~132-162; right x ~150-178, y ~128-160 (merging with the existing right-side P).
   - (b) Make each jowl crease a *fold*: the dark 2-px `p` line, plus a 2-3-unit P sliver on its outer/lower side.
   - (c) A second short fold outside each main crease: ~(50,136)→(54,154) and ~(172,132)→(168,152).
   - (d) A chin fold under the lower lip: a shallow `p` curve at x ~92-128, y ~158-160, with P below it down to the outline.
   - (e) Puff the cheek pads *above* the grin corners slightly, so the corners tuck in.
   - Stay at 3 flat tones. At 112 the P crescents must be ≥2 px, so they read as weight and not noise.
3. **Re-fit after D1.** Re-hinge the ears on the wider skull (tips still out and down), and re-fit the lit-plane wedge and the right-side P shadow to the new outline. Check that the laugh's open mouth still clears the chin at 112 with the chin fold in.

### Raccoon (what's left: chunkier limbs)
1. **The arms are sticks.** I agree with the art lead. The upper arms are ~16-17 thick and the forearms ~12-13, against an 82-wide torso and a ~108 head. Ref 4's limbs are about 40% of the torso's width, tapered, ending in big paws. Spec:
   - **Hip arm:** upper arm **~24 at the shoulder → ~20 at the elbow**, with a round deltoid bulge overlapping the torso's top. Forearm **~19 → 16 at the wrist**. Move the elbow in to ~(188,150) and the fist to ~(168,176), so the forearm is ~28 long, not 35. The background triangle must stay open, ≥10 wide at y ~158.
   - **Near arm:** upper arm **~22 → 19**, forearm **~18 → 15**, elbow ~(84,168). Keep the V gap to the torso, even if only ~4 wide.
   - **Paws:** scale the hip fist ~1.2x (≈22x20) and keep its knuckle bumps. Make the pump paw's wrist as thick as the forearm end, so there is no neck between forearm and paw.
   - Keep one flat G shadow on each tube's underside and the K outline.
2. **The tail's tip reads as a hook.** The final dark section curls up sharply beside the elbow, like a cane. Soften the curl to a broader arc. The tip ends ~(220,158), pointing up-right, with a rounded end ~14 wide. Keep 4 bands and the dark tip. Once the arm is thicker, keep ≥4 units of background between the tail tip and the elbow cap.
3. **Shoulder mass.** With thicker arms, the shoulders should read as round masses under the cheek tufts at ~(92,130) and ~(160,130). Put a short G crease where each upper arm overlaps the torso, so the torso doesn't look pinched between two tubes.

## 4. Must not regress
- Everything in section 2.
- The raccoon's in-frame rule and its background triangle.
- The dog's ~138 width at 112, its U bottom with no flare or chin dips, the sideburn wedges.
- Signatures, sizes. The dog stays a cartoon bulldog.
