# Judge 01: iter_01 vs judge_00

Same scale as round 0. Grid = 232x208 (k=1.5 render px / 1.5).

## 1. Scores (1-10; round 0 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 7 (5) | 6 (3) |
| Symmetry / structure | 7 (5) | 6 (4) |
| Silhouette / overall shape | 6 (6) | 5 (4) |
| 2D pixel-art craft | 7 (6) | 7 (5) |
| Face / expression appeal | 7 (5) | 4 (6) |
| Small-size readability | 7 (6) | 6 (5) |
| **Overall** | **7 (5.5)** | **5.5 (4.5)** |

The dog's face score went *down*. It is cleaner, but it lost the character. See section 3.

## Earlier fixes: status
**Raccoon:**
1. Narrow head and short snout: **done**. The nose placement needs a tweak (R2).
2. Bigger, closer eyes: **done**. The lid still merges with the mask (R3).
3. Mask lobes and bridge: **done**.
4. Dither removed: **done**.
5. Abs removed: **done**.
6. Body/head balance and far arm: **partly**. The body is centred, but the torso is a shapeless sack and the arms are weak (R1).
7. Ears: **done**.

**Dog:**
1. Head size: **done**. I accept the drawer's ~136 wide (0.59-0.61 of the frame) for the 112x100 portrait.
2. Features clustered: **done**.
3. Ears: **partly**. They no longer read as horns, but the rounded cups now read as bear or pig ears.
4. Silhouette: **partly**. The notch is gone, but the head is now a round teddy pear.
5. Hair: **not done**. The drawer replaced it with a cap, and that is now the dog's worst problem.
6. Flat 3-tone shading: **done**. But the pale muzzle oval is a teddy-bear signal.
7. Eyes and brows: **partly**. The brows are good. The eyes are sleepy, not smug, and there is no wink. The patch cleft shows a pink notch under the brow.
8. Suit width: **done**.

## 2. What works (keep it)
- **Raccoon:** a real 3/4 head now. Compact skull, matching ears, a forehead stripe running into the mask bridge, two-lobe mask with drooping ends, amber eyes with a glint that read at k=1, a one-sided smirk with a dimple, spiky cheek tufts, and flat shading everywhere. The pump is untouched and still excellent.
- **Dog:** the size and clustering (eyes ~36 apart, nose under them, mouth x 60..129), the three flat tones, no dither, short thick brows that survive 112, the suit, the heart patch. All the plumbing is right. What is missing is the character layer.

## 3. Fixes, ranked

### Dog Fjord
I agree with both art-lead notes. They are the top two fixes.

1. **The hair is a cap, not a combed swoop.** It reads as a cap because of three things. First, a flat, straight bottom edge at y ~50 that runs across like a brim. Second, grooves that run *parallel* to that edge, horizontally. Third, a dome that is evenly high front to back. A combed-back pompadour needs the opposite of all three:
   - (a) **Silhouette:** the front-left (x ~76-100) is the highest point (y ~18), a lifted quiff, and the top slopes down toward the back-right (y ~34 at x 158). The sides tuck in *inside* the skull line above the ears. Nothing overhangs like a brim.
   - (b) **Hairline:** the bottom edge meets the forehead with a short dip/temple recess at x ~96 and a sideburn notch at each side. Put a darker pink `P` shadow on the skin under the hair instead of a hard outline across the forehead.
   - (c) **Ridges** run *front-to-back*: 4-5 tapered arcs starting at the front hairline and sweeping up and back to the right, converging toward the crown. Make them uneven in length. `W` highlight only on the front-left lit crests, `G` 2-px grooves between them. That is what the 3D row shows.
   - The beanie look the drawer saw came from even, uniform bands on a dome with a brim. Uneven, converging, tapered ridges on a pompadour silhouette avoid it.
2. **Bring back the smug, sleazy politician.** The 3D grin has a wink and a cocked brow. Grin spec:
   - **Near eye (82,91):** a closed wink, a K arc curving down at the outer end with a 1-px lash tick. The near brow is pulled down and angled toward the nose by ~3.
   - **Patch eye (118,91):** half-open, with a heavy K lid covering the top ~60%, a red-brown sliver and a 1-px glint. Its brow is cocked *up* ~4 and arched.
   - **Lopsided grin:** the near corner sits 3-4 higher and tucks into a deep crease. The upper lip (flews) drapes over both corners as a P/p lip line, the bulldog sag.
   - **Laugh:** keep the closed eyes, but make the patch eye's arc a heavy lid, not a cute ^.
3. **Kill the teddy muzzle oval and add the bulldog wrinkles.** The pale `M` oval (x ~57..125, y ~97..133) reads as a bear snout. Replace it with the 3D's light *left plane*: the left third of the face lighter, running to the outline. Add the strongest 3D features:
   - two jowl creases, 2 px at k=1.5, from beside the nose wings (~62,120) and (~133,118), curving down past the mouth corners to ~(64,152) and (~130,152);
   - two clear forehead wrinkles at the upper left (~x 86-114, y ~66 and ~72).
4. **Heavier, squarer jaw.** The bottom is a round bubble. Make the widest point low (y ~140), with jowl lobes sagging slightly at the lower corners (~(46,150), (174,150)), a flatter chin line at y ~164, and the jowls overlapping the collar a little. Narrow the skull top to ~84 at y 56 so the face reads top-light and jowl-heavy.
5. **Ears that say bulldog, not bear.** Use angular rose-ear flaps hinged under the hair sides (y ~56-66). Show a visible fold edge as a straight light line with a dark underside, tips pointing *out and slightly down* to ~(50,70) and (~172,68). Avoid rounded cup tips.
6. **Small-size fixes (112):** use one upper tooth row. The lower white band currently reads as braces. Fill the patch cleft under the brow, or shift the patch down 2.

### Raccoon
1. **The torso is a bean bag; give it shoulders and real arms.**
   - Make a flatter shoulder line from the neck (~x 100, y 118) out to the shoulders (~x 80 and ~x 186, y ~124), then sides that taper slightly to the waist.
   - The near upper arm is a pale pad pasted on the body. Make it a separate cylinder (~16 wide) with a dark `G` seam where it meets the body.
   - The near forearm is a thin dark wedge with a spike at the elbow (~84,180). Make it chunky, ~11 wide, with a rounded elbow.
   - Shape the pale front as a chest patch that is wider at the chest (x ~108..160) and narrows at the belly, rather than a long even oval.
2. **Snout and nose placement.** The nose (155-171, 80-92) sits at mask level, crowding the far eye. Move it to ~(160-174, 88-100) so the muzzle projects *below* the mask, as in 3D (nose ≈ 15 below the far eye). Add a short grey snout-bridge line from the mask bridge to the nose.
3. **Separate the eyes from the mask.** Put a 1-px `g`/`H` lower-lid line under each eye and a 1-px gap between the lid stroke and the mask. Make the near eye ~1-2 larger. Keep the amber, pupil and glint.
4. **The lower face is one big white bib.** It runs from the mask bottom to the chin and into the cheek tufts. Keep the white on the muzzle and the cheek patches. Add a flat `G`/`h` jaw shadow under the smirk (y ~108-118), and make the left cheek tufts' outer spikes grey so the head separates from the ruff.
5. **Forearms are grey, hands are dark** (refs 4/5). The far forearm reads as a black sleeve. Make it `g`/`G` with dark only from the wrist down. Do the same on the near arm.

## 4. Must not regress
- The raccoon's head proportions, mask lobes, amber glinting eyes, smirk, ears and pump.
- The dog's ~136 head size, the feature clustering, flat 3-tone shading with no dither, thick brows, the suit, the heart patch.
- Signatures, sizes, the palette, consistent outlines.
- The dog stays an obvious cartoon bulldog. "Sleazy" comes from the wink, lids, flews and jowls. It must never come from human features.
