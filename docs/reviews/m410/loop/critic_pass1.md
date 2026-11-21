# Critic, pass 1 (M4.10 raccoon style study)

What I looked at: the four references, pass 0 (hero, 1x), `compare_pass1.png`, and each style's hero, 1x, values and
painter notes. I also made zoomed crops of the face (k 1.5, x 110..320, y 85..185) and of the arm/paw/bib
(x 90..250, y 175..265) for all five, and ran pixelcheck on ref03 and naive.
**All pixel coordinates below are in the k = 1.5 frame (348 x 312).**

Scales:
- **Own**: how well the style hits its own target, out of 10.
- **Common**: one quality scale where ref 03 = 9.5, ref 01 (the plush raccoon) is about 7.5, and pass 0 is about 4.5.

| style    | own  | common | colours (k 1.5) |
|----------|------|--------|-----------------|
| pass 0   | -    | 4.5    | -               |
| ref03    | 5.5  | 5.5    | 38              |
| ref04    | 6.5  | 5.5    | 28              |
| naive    | 7.0  | 5.0    | 13              |
| detailed | 5.0  | 4.5    | 73              |
| free     | 5.0  | 4.5    | 38              |

Nobody is above 6 on the common scale. I explain why in the cross-style section: every style still has pass 0's
*drawing* under it. The arm is a bent tube around a triangle of bib, the paw is stuck on the barrel, and the snout is
made of value-map facets. The rendering changed, the construction did not.

---

## 1. ref03 (own 5.5, common 5.5)

**What works**
- **The face holds the contrast peak.** The near-black mask (Ο/Α) against the blue-white muzzle is the strongest value
  jump in the picture, so the eye goes to the face first, even at 1x. This is the closest of the five to ref 03's face.
- **The eyes are the best eyes in the study.**
  - amber iris in a brown ring, a big pupil, one catchlight
  - the wet lower-right rim and the heavy lid
  - they read as sly and alive
- **The tail ring edges interlock in strands.** It reads as fur and not as stripes painted on a tube.
- **The scarf finally reads as knit wool** (rolled ribs, lime tops).
- **The pump is kept smooth.** This is a good calm-versus-texture contrast against the fur.

**What fails**
- **The strands are scratches, not clumps.**
  - Ref 03's fur is *clusters*: 2 to 3 px wide locks, with the tone change inside the lock.
  - Here they are 1-px light lines scattered over flat planes. On the bib (x 150..185, y 210..235) and the arm they read
    as white scratches, or as wood grain on a plank (the forearm, x 95..185, y 230..255). At 1x they turn into grain.
- **The mask strands run horizontally across the whole mask** (x 115..260, y 85..145) and ignore the form. The mask
  reads as brushed black metal. In ref 03 the mask is almost solid black, with slate strands only at its edges.
- **A value-map facet shows on the muzzle.** A straight diagonal edge runs between two greys from about (260,132) down
  to (218,172). It is a polygon, not fur.
- **The nose is a dull slate blob** (x 275..305, y 125..150). It is lower in contrast than the mask, so the tip of the
  face is weak.
- **Temperature split.** The coat stays warm brown while the face went cold blue-white. The head reads as two
  materials glued together. Ref 03 is all one cool grey family.
- **The paw is still a tan lump** (x 180..215, y 200..245), and the strands on it make it worse.

**Top 4 fixes for pass 2**
1. **Turn strands into clumps.**
   - Base locks 2 to 3 px wide, a light root fading to a 1-px tip.
   - Accents at 1 in 30 (now 1 in 10), and only within ~4 px of a terminator or a marking edge.
   - Broad lit planes (the bib, the forearm top, the brow centre) stay one flat tone with at most 2 or 3 strands.
   - Shorten all strands by ~40% in the shadow planes.
2. **Make the mask solid.**
   - The mask interior is Ο (one tone), with no horizontal streaks inside x 125..250, y 95..140.
   - Strands of Β/Γ only along its top and bottom edges, pointing along the head flow: outward from the nose, curving
     down at the cheek.
3. **Kill the muzzle facet.** The edge from (260,132) to (218,172) should be one curved terminator that follows the
   snout's cylinder, with interlocking strands along it. While there:
   - Redo the nose: a lit top plane of 3 to 4 px in a light slate, a near-black underside, a 2x2 catchlight on the top
     left, and a 1-px reflected light along its lower edge.
4. **Unify the temperature.** Pick one direction:
   - either cool the coat ramp toward ref 03's greys (shift the coat lights from warm cream to grey-beige)
   - or warm the muzzle whites to a cream with violet-grey shadows.
   The face and the coat must share a shadow family. Hand-draw the paw as a 4-knuckle text grid.

---

## 2. ref04 (own 6.5, common 5.5)

**What works**
- **The best 1x read of the study.** The 2-px warm-black silhouette holds the figure on all three posters, and the face
  reads from across the room.
- **The most character.** The open one-sided grin (teeth, pink tongue, dimple) and the big white-sclera eyes under a
  heavy lid make him a personality: cocky, a little sneaky. This is the only style where the expression reads at 1x.
- **The paw is the best paw of the five.** Separate knuckles hug the barrel, and it looks like it grips.
- **Clean.** 28 colours, no near-duplicates, almost no orphans. Lights warm, shadows violet.
- **The gauge** (white face, grey crescent, red needle, black ring) is the clearest gauge of the five.

**What fails**
- **The cel shapes are thresholded from a smooth field, not designed.**
  - On the muzzle and cheek (x 218..277, y 118..140) they are long stair-stepped bands with leftover slivers.
  - Each tail ring is split light/shadow into checkerboard blocks (x 35..110, y 185..300).
  - Ref 04 draws each shadow as one confident shape.
- **The inner lines make the "assembled" look worse.** The arm is outlined all round as a tube, the bib triangle
  between the arm and the body (x 130..184, y 209..233) is a separately outlined wedge, and the scarf is an outlined
  strip. This is exactly what Ivan dislikes, even if it fits the style.
- **The proportions are not chibi.** It is still the semi-realistic M4.9 head on a cartoon line. Ref 04's head is rounder
  and bigger, and its muzzle shorter.
- **The scarf is a flat green strip** with one dark band and two stray pixels (y 180..200). The ears are flat with a
  pink sliver.

**Top 4 fixes for pass 2**
1. **Hand-draw the shadow shapes** with valueShape polygons using 'set', not thresholds:
   - Head: one shadow shape on the far cheek and jaw (right of x ~250, below the mask), plus one under-snout shadow.
   - Muzzle: remove the middle-tone slivers between y 118..140, so it has 2 tones only.
   - Tail: each ring takes the shadow on its lower-right third as one continuous band along the tail's underside. No
     per-ring checker.
2. **Reduce the inner lines.**
   - Keep the 2-px outer line.
   - Inside, keep lines only where the form in front is in SHADOW, or where both sides have the same value: the paw over
     the barrel, and the head over the scarf.
   - Drop the line between the lit arm and the lit bib, and let a cast shadow separate them. The lit-side inner lines
     can be a dark-brown coat tone (В darkened), not А.
3. **Design the scarf.** One shadow shape under the jaw (the head casts onto it), a lime highlight along the top roll,
   and a knot with 2 folds plus a 3-notch fringe on the hanging end (x 255..290, y 195..225).
4. **Push the chibi shapes**, within the frame:
   - head +10%, muzzle 15% shorter and rounder at the tip, ears a little bigger and rounder
   - fill the ear interior with one shadow tone plus a 2-px pink fold, instead of the sliver
   Check the near eye's sclera crescent: the lower white (x 160..195, y 118..127) is a little big and makes him look
   up-and-away. Shave 1 px off the bottom.

---

## 3. naive (own 7.0, common 5.0)

**What works**
- **It hits its target best.** 13 colours, two tones per material, one plum line, nothing rendered. It still reads
  instantly as this raccoon with his pump.
- **The half-lidded amber eyes are the smuggest of the five.** They reuse the pump's yellow, which ties the face to
  the prop. The colour reuse is smart: the eyes are the pump yellow, the glints the cream, and one dark covers the
  mask, rings, paws, handle and hose.
- **The tail shaded against its centre line** is clean and believable.
- **It is closest in spirit to the dog Ivan liked.**

**What fails**
- **The big empty cream face.** The lower face (x 127..227, y 132..185) is one flat cream field, the largest flat area
  in the picture, sitting right at the focal point. The head has no form there: no cheek plane, no jaw turn.
- **The mouth shadow is a sticker.** The grey-pink patch under the snout (x 227..293, y 148..163) reads as a separate
  shape pasted under the mouth line, not as the underside of the snout.
- **The paw is a mask-coloured blob** (x 182..216, y 203..245). It is the darkest, most solid shape on the body, so it
  draws the eye away from the face, and it reads as a mitten sticker. It does not grip.
- **The lower body is busy.** Three shadows meet there (the forearm cast, the body terminator, the pump cast at
  x 110..260, y 245..300). This is the one area that contradicts "naive".
- **The 1-px line is thin for this size.** At 1x the silhouette is fine on blue but softer on purple than ref04.

**Top 4 fixes for pass 2**
1. **Give the cream face one plane change.** A cream-shadow (д) shape on the far cheek and under the jaw: from below
   the far eye (~x 250, y 140) curving down to the scarf. It should reach ~35% of the cream field. Keep the near cheek
   flat cream.
2. **Make the mouth part of the snout.** Merge the grey-pink under-snout patch into the cream shadow tone (д) and
   extend it to the snout's whole underside, so the shadow explains the snout cylinder. The mouth line then curls into
   the shadow edge.
3. **Paw:**
   - Make it the coat shadow tone (в), with a 1-px dark line.
   - Add 2 short dark notches for the finger splits facing the viewer.
   - Wrap it over the barrel: the barrel shows above AND below the paw.
   Its value then sits under the face's, not above it.
4. **Lower body: one shadow.**
   - Use one shadow shape for the whole body below y ~255 on the right half, plus the forearm cast (keep it).
   - Drop the pump's cast on the belly.
   - Thicken the outer silhouette line to 2 px at k 1.5 on the shadow side only (right and bottom). The poster read gets
     stronger without losing the minimal look.

---

## 4. detailed (own 5.0, common 4.5)

**What works**
- **The pump is a showpiece.** Chrome as an environment profile, ribbed rubber grips and hose, crimp rings, and a
  gauge with a bezel, ticks, a red zone and glass glare. It reads as three materials. Ref 03's craft standard, applied
  to an object.
- **The tail rings interlocking both ways** are good fur.
- **The texture goes through the light ramps** instead of on top of them. This is the right architecture: the values
  view keeps one light.

**What fails**
- **No focal hierarchy.** The same strand density covers every square pixel of the coat, cream, scarf and mask. At 1x
  the whole figure turns into a grey-beige grain, and the face has to compete with the bib, the arm and the tail. This
  is "more detail" without "more information".
- **73 colours with narrow bands (~0.07).** The ramp steps are so close that the clusters cannot form clean edges. It
  reads as noise or dither even though there is no checkerboard. The muzzle and bib look like felt.
- **Polygons show through the fur.** The lilac shadow plane on the lower face has a straight diagonal edge from
  ~(263,132) to (220,172). The forearm is two flat planes with a hard seam (x 94..186, y 231..255).
- **The nose is pillow-shaded** (x 275..307, y 125..150): a slate gradient ball, light in the middle and darker toward
  the edge, the soft-3D look Ivan rejected.
- **The scarf knit is dense noise in its shadow half** (x 240..290, y 185..215).

**Top 4 fixes for pass 2**
1. **Detail by hierarchy.** Scale the strand amplitude by `max(near terminator or marking edge, near face)`:
   - full on the head and the ring edges
   - 50% on the arms and the tail planes
   - 20% on the bib and the lower body
   - zero in the deep shadow planes
   The pump keeps all its detail, because a man-made object is allowed to be crisp.
2. **Cut the ramps to 6 to 8 tones per fur material** (coat 15 → 8, cream 10 → 6, brow 10 → 5), so each band is ~0.12
   wide. This lands near 45 colours. Clusters then get 2 tones of contrast and real edges.
3. **Fix the forms under the texture.**
   - Lower-face lilac plane: replace the edge (263,132)–(220,172) with a curved terminator.
   - Forearm: one cylinder light (a core shadow ~3 px above the bottom edge, plus a reflected-light line).
   - Nose: a hard lit top plane and a hard dark underside, 3 tones plus a 2x2 glint. No gradient.
4. **Scarf: fade the knit amplitude to 30% in the shadow,** and make the stitches 4 x 5 so they survive at 1x. Give the
   paw finger splits and claw tips (the painter's own item 2): it is the flattest object next to the busiest one.

---

## 5. free, "Streetlamp & Neon" (own 5.0, common 4.5)

**What works**
- **The best palette idea of the study: one shared indigo shadow family for every material.** The far side of the head
  (the far ear, the cheek behind the far eye) melts into one dark graphic shape. This is literally "drawn from shades,
  not shapes", and it is what makes good pixel art feel like one place and one time.
- **The warm amber key against violet shadows** is attractive. The face stays the warmest and brightest spot. The red
  poster read is better than pass 0.
- **The far-side merge** is the most painterly passage in all five pictures.

**What fails**
- **The cyan rim reads as print misregistration, not light.**
  - It sits OUTSIDE or along the dark outline as a separate offset line (the head's right edge x ~270..282, the snout
    tip x ~300..310, the scarf end, the hose).
  - At 1x it looks like a chromatic-aberration halo or a cut-out sticker border.
  - A rim light belongs on the form's edge *inside* the silhouette, replacing the darkest tones there. It should not
    trace a line around the outline.
- **The facets are now louder.** The higher-contrast palette exposes the value-map polygons: the snout and cheek
  (x 218..277, y 123..165) are a low-poly mesh of lavender planes, and the lower tail rings are blocky rectangles
  (x 90..108, y 257..300). The painter says so: "a recolour of pass 0".
- **The body under the scarf is mud.** It is a dull mauve-purple (x 240..285, y 205..265) with no form, and the bib is a
  flat cream wedge.
- **The overall saturation of the coat** (orange-tan lights, purple shadows) drifts toward "filter" more than "night".

**Top 4 fixes for pass 2**
1. **Move the rim inside.**
   - It replaces the outermost 1 to 2 px of the shadow-side fill: チ next to the outline, ユ one px in.
   - The dark outline ア stays as the outermost pixel, or drops entirely where the rim is.
   - No rim pixel may sit outside the silhouette or next to the background without the outline.
   - Limit it to the head's far contour, the snout's underside and the far shoulder: ~40% of what it covers now.
2. **Redesign the shadow shapes for this light** (the painter's item 1 is right). One indigo mass for the right third
   of the head and body. One rounded snout terminator instead of the facets in x 218..277, y 123..165. Tail rings
   shaded as a continuous underside band, not rectangles.
3. **Body: drop the bib one step** (サ → コ under the scarf). Give the far body (x 240..285, y 205..265) one terminator
   with an オ glow band, so it turns instead of sitting flat.
4. **Eyeshine.** Brighten the iris's lower half to y/Y with a 1-px Y rim on the near eye. A raccoon at night should have
   glowing eyes, and it makes the face win the value contest. Pull the coat light ク 10% toward cream so it reads as
   lamp-lit fur, not orange.

---

## Cross-style comparison

**Best read at real size (1x) on the posters:** ref04, then naive, then ref03.
- **ref04** wins because of three things at once:
  - a continuous 2-px dark silhouette (it separates from blue, red and purple)
  - big value groups (each form has 2 or 3 tones in large shapes)
  - a face designed in shapes that survive downscaling (the white sclera, the teeth, the black nose)
- **naive** reads almost as well. It loses only on the purple poster, because of the 1-px line.
- **ref03** reads at 1x thanks to the black mask and white face, but its body becomes grain.
- **detailed** turns into mush at 1x.
- **free's** halo looks like a glitch at 1x.

**Most appeal and character:** ref04, clearly. It is the only one with an *expression* (the open grin) rather than a
thin smirk line that vanishes at 1x. naive's lidded eyes are second: smug and charming.

**Closest to "professional pixel art":** no single one. Each has one professional component:
- ref04 and naive: their cleanliness and clusters (pixelcheck almost clean, deliberate pixels, no noise). This is the
  baseline every professional sprite has, and ref03 and detailed don't have it.
- ref03: its face and eyes.
- free: its palette logic.
- detailed: its pump.

Overall, ref04 is closest to a shippable professional game sprite today. ref03 has the higher ceiling, if it gets
clumps instead of scratches.

## Early lessons about the recipe

1. **The drawing is the ceiling, not the rendering.** All five inherit pass 0's construction:
   - a tube arm wrapped round a triangle of bib
   - a paw that sits on the barrel instead of gripping it
   - snout and cheek planes that are value-map polygons
   No technique fixed this. Texture (ref03, detailed) hides it a little. Contrast (free) exposes it. Lines (ref04,
   naive) outline it.
   Professional pixel art starts from designed shapes: each shadow is a hand-drawn shape with an intent. It does not
   start from a thresholded smooth field. **Pass 2 for every style should redraw the shadow shapes of the snout, the
   arm/paw and the tail by hand** (valueShape 'set', or text grids), before touching texture.
2. **Detail needs a focal order.** Detail density should follow
   face > marking edges and terminators > props > broad planes > deep shadow.
   - Uniform detail (detailed) reads as noise, and 1-px strands on flat planes (ref03) read as scratches.
   - Ref 03 itself keeps its locks clustered, 2 to 3 px wide, with flat calm areas between them.
   - "More detail" only helps where it carries information: the eyes, the pump's materials, the fur where it turns.
3. **The palette size sweet spot is ~15 to 40, with coherent ramps.**
   - 13 colours (naive) is enough to read and charm.
   - 28 (ref04) is clean and expressive.
   - 38 is fine if the ramps are wide.
   - 73 (detailed) collapses into felt, because bands of ~0.07 cannot make cluster edges.
   - Each ramp step must be big enough to be *seen* as a step at 1x.
   - A **shared shadow family across materials** (free) is the single best palette idea here. It makes the figure one
     object under one light. Every style should adopt it.
4. **Outlines: strong outside, minimal inside.**
   - A dark outer silhouette (2 px at k 1.5, or at least on the shadow side) is what carries the 1x poster read.
   - Inner lines between parts create exactly the "assembled from shapes" look Ivan dislikes. Use them only where two
     same-value forms overlap, and use a cast shadow everywhere else.
   - Lit-side lines should be a darker tone of the fill (ref03's sel-out), not black.
   - A rim light must live inside the silhouette, not around it.
5. **Light design: one key, a value plan, and the face as the peak.** Every style passes the greys test now, which is
   progress over earlier loops.
   - The best versions also drop the lower body (falloff) and the bib, so the face wins.
   - Next is **reflected light and bounce placed deliberately**: a 1-px reflected rim on the shadow side of the arm and
     the barrel, plus scarf-green on the chin.
   - Keep the shadow side as ONE connected shape across parts.
6. **The face must be designed for 1x.** At k 1 a 1-px mouth line disappears. The expression needs shapes:
   - a mouth corner of 2 to 3 px with a cheek bulge above it
   - an eye with a lid shape, and either a sclera or a strong iris glow
   - a nose with a clear lit top plane
   ref04 proves the point.

**A hypothesis for the final recipe**, to test in pass 2:
- ref04's / naive's shape discipline (designed shadow shapes, clean clusters, a strong outer line)
- plus ref03's face and eyes
- plus free's shared shadow palette
- plus detailed's material treatment on the pump only
- about 30 to 40 colours
- fur clumps only at marking edges and terminators
