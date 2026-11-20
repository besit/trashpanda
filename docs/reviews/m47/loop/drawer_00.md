# Drawer 00: study of the 3D and 2D portraits, and the redraw plan

All numbers are in design-grid units (232 x 208, k = 1). The 3D numbers come from projecting the SDF models' key points
through the posters' cameras (`orthoCam`, cx/cy/scale from `raccoonPortrait` / `dogPortraitHi`) and from reading a
4x render with a 10-unit grid (scratchpad `r3.png`, `d3.png`, `grid.png`). The 2D numbers are read from the current
`portraits.mjs` (M4.6).

## Raccoon: 3D vs current 2D

| feature | 3D (SDF) | current 2D | what is wrong in the 2D |
|---|---|---|---|
| head (cranium) box | x 73-170, y 40-110 (~97 x 70); centre (120, 77) | x 68-210, y 31-119 (~142 x 88) | 1.5x too wide, mostly because of the snout |
| head centre vs torso centre | 120 / 120: head sits right on top of the body | head ~139, torso 137, but the snout pulls the mass right | the head reads as a long fox/wolf head on the side |
| eyes | near (125, 74), far (151, 72); gap **26** | near (112, 78) r 10.5, far (162, 76) r 8; gap **50** | eyes too far apart, the face spreads out |
| nose | (150, 89): **~30 from head centre**, inside the cheek line (head right edge 170) | (201, 85): ~62 from the cranium, past every other feature | the snout is twice too long |
| mouth | short smirk y 94-99, x 135-160, raised corner on the near (left) side | long sweep x 158-201 | too long; keep the near raised corner |
| white brow band | y 59-66, x 100-157, one band each eye, slanting down toward the nose | two short brow blobs y 51-64 | fine in idea, needs to be broader + tied to the mask |
| mask | y 66-88, two lobes joined over the bridge, swept back to the cheeks | one long band y 63-100 | OK; make it 2 lobes with a grey bridge stripe (refs 1, 3) |
| ears | **symmetric**: tips at (102, 32) and (130, 30); bases ~26 wide; triangles with round tips | near ear x 82-116, y 17-62 (tilted, huge); far ear x 146-174 tip (164, 11) | ears unequal and lopsided; the near one is a slab |
| cheek ruffs | flare out and down both sides to x ~72 (near) and ~170 (far) at y 100-108 | only on the near side (zig-zag at x 68-88) | asymmetric |
| neck | x 97-137, y 110-120 | the ruff zig-zag on the chest | ok |
| torso | x 70-172 (~**102 wide**), shoulders y ~135, bottom 205 rounded | x 76-198 (~122), a ball, pec + ab lines | head:torso width should be ~1:1; drop the bodybuilder lines |
| pale chest | x 110-140, y 120-200 | x 112-170 | narrower, centred under the chin |
| arms | capsules ~22 wide, hanging at both sides, forearms dark below y ~175 | near arm ok-ish; far arm thin, spindly, dark | chunky arms, same thickness both sides, dark forearms/paws |
| pump | handle x 21-75 y 26-39; barrel (50,55)-(75,150), ~10 wide; gauge (62,115); chuck (48,118) | handle x 8-68 y 19-27; barrel (38,58)-(66,194) 13 wide | 2D pump is fine (held in the paw per brief); keep, maybe a touch shorter |

## Dog Fjord: 3D vs current 2D

Head box: 3D x 47-172, y 33-158 = **125 x 125 (square)**. Current 2D x 28-207, y 8-174 = 179 x 166. Fractions are of the
head box (0 = left/top, 1 = right/bottom) so the 3D shape can be scaled up.

| feature | 3D (units) | 3D (fraction of head box) | current 2D (fraction) | what is wrong in the 2D |
|---|---|---|---|---|
| head width / frame width | 125 / 232 | 0.54 | 0.77 | too big; the poster then shows almost no suit |
| skull width at eye level vs jowl width | 81 vs 125 | **0.65**, sides nearly vertical | the top converges to a point at (126, 22) | the onion: a pointed crown; the 3D is a rounded square skull on wide jowls (a bell) |
| widest point | y 115-135 | 0.65-0.82 | 0.72-0.80 | ok |
| bottom | broad, round, jowls hanging slightly at both sides, lowest ~158 | 1.0 | ok | ok |
| hair | compact cap x 85-152, y 33-58, diagonal comb grooves, crest at the top | x .30-.84, y 0-.20 | x .23-.87, y 0-.31, huge swoop + quiff | hair 1.5x too big; should be a helmet on the skull |
| ears | small folded flaps at the upper corners, tips (58, 60) and (160, 63), pointing out and a little down | tips (.09, .22) and (.90, .24); ~26 x 20 | point UP and out from y .2 | read as horns; fold them down/out |
| eyes | (84, 93) and (117, 94); gap 33 | y .48; x .30 / .56; gap **.26** | y .42; gap .32 | too far apart, too high |
| brows | thick arcs, y ~82 | .39 | .33 | ok, follow the eyes |
| heart patch | round the far (image-right) eye, ~25 wide | .20 W | .19 | ok |
| nose | centre (89, 107), 30 wide x 16 tall | (.34, .59), .24 W | (.40, .58), .23 W | ok size; nudge closer under the eyes |
| mouth (grin) | x 66-126, y 128-140, a crescent of teeth | x .15-.63, y .76-.86 | .16-.68, .70-.85 | ok-ish; corners tuck into the jowl creases |
| jowl creases | (60,125)-(65,150) and (135,130)-(130,152) | x .14 and .70 | x .07 and .88 | creases should frame the mouth closely |
| suit | shoulders x 77-153 under the head, top ~158 | 0.61 W wide | 0.74 W | fine at the bigger head scale; shoulders sit right under the jowls |
| shading | pink with darker right side, a soft core shadow | | 4-5 dithered vertical bands on the right | reads as pillow stripes; use ONE flat shadow shape + one dither seam |

## Plan

### Dog Fjord: rebuild the head (the construction is the problem)
1. **Scale the 3D layout up 1.2x** (head ~150 x 150: x ~34-184, y ~22-172) so the in-game 112x100 portrait still reads,
   and lay every feature out by the 3D fractions above (I will write it as a little `F(fx, fy)` helper mapping
   head-box fractions to design units, so proportions are explicit and easy to tune).
2. **Head silhouette = one blob**: a rounded-square skull (sides near vertical, a broad flat-ish dome under the hair)
   flowing into wide low jowls (widest at .7-.8), a broad round bottom with the jowls hanging a touch at both sides.
   No pointed crown.
3. **Hair**: a compact grey cap/helmet on the skull (.30-.85 wide, top .0-.2), 4-5 diagonal comb grooves, a small
   quiff curling forward on the face side; light H/W on top, G under-edge. No big swoop.
4. **Ears**: small folded rose-ear flaps at the upper corners, folding outward and down (tip lower than the base's top),
   dark p underside of the fold.
5. **Face** by the fractions: eyes closer (.30/.56 at y .48), thick brows above, the heart patch round the far eye,
   the big black nose right under/between the eyes with a G/g shine, a philtrum line down to a wide crescent grin
   whose corners tuck into short jowl creases; whisker dots on the muzzle; two forehead wrinkles.
6. **Shading**: flat cel. Light upper left: one P shadow shape down the right side and under the jowls (a single
   checker seam where it meets m), the pale M muzzle, a small M highlight on the upper left of the skull. No stacked
   dither bands.
7. **Suit** keeps its parts (lapels, white shirt, blue patterned tie) but its shoulders are ~0.65 of the head width and
   tuck right under the jowls; the tie shows under the chin, slightly left of centre (face turned left).
8. Expressions: grin (∩ smug squint eyes, teeth crescent), laugh (∪ eyes, open D mouth with an upper teeth row,
   tongue), shock (round eyes with pupils, raised brows, small O mouth). Check all three at 112x100 1x and 2x.

### Raccoon: re-proportion to the 3D bust, keep the 2D pose (pump in the near paw, far fist on the hip)
1. **Head ~1.15x the 3D head**, centred over the torso: cranium x ~88-166, y ~40-110, centre ~(127, 76). **Short
   snout**: nose ~(162, 90), only slightly past the far cheek. Smirk under it (x ~140-164, y ~96-100) with the raised
   corner + dimple on the near (left) side.
2. **Ears symmetric**: two matching triangles with round tips on the crown (tips ~(104, 24) and (146, 22), bases ~28
   wide), grey outside, dark k inside with an H rim; the far one a touch narrower for the 3/4 turn, not a different shape.
3. **Markings** (refs 1, 3, 4): broad white brow bands slanting down toward the nose; a two-lobed black mask joined
   over the bridge, with the dark forehead stripe running down between the brows; white muzzle + cheeks under the mask
   flaring out into **cheek ruffs on both sides** (zig-zag tufts at x ~74 and ~174, y ~98-110).
4. **Eyes** closer (near ~(126, 74), far ~(155, 72), gap ~30), half-lidded smirk, **amber iris** (X/j with an o ring),
   K pupil, W glint (ref 3), heavy upper lid.
5. **Torso** ~104 wide (x ~76-180), shoulders y ~136, rounded bottom at ~205, the pale chest x ~112-144 centred under
   the chin, a soft ruff under the jaw. **Remove the pec/ab lines** (they read as a bodybuilder); one or two fur
   ticks on the belly at most. Flat cel shadow on the right + under the chest; one checker seam each.
6. **Arms**: both chunky (~22 wide), the same build; dark forearms + paws (k/g) like a real raccoon (the 3D did
   this). Near arm: shoulder -> elbow down at ~(80, 172) -> forearm up to the paw gripping the pump at ~(56, 140) with
   4 clear fingers + thumb wrapped round the barrel. Far arm: elbow out to ~(204, 162), fist on the hip at ~(182, 188)
   with knuckle lines.
7. **Pump**: keep the current construction (it reads well), slightly re-placed so the barrel passes the paw and the
   T-handle sits near head height (y ~22-30), hose loop at the bottom left.
8. Outline: K 2px at k 1.5, 1px at k 1; inner outlines k/g between parts.

### Toolkit (draw2d.mjs)
Probably nothing new is needed. If useful I will add (backwards compatible) a `rrect(x0, y0, x1, y1, r)` rounded-rect
point list for the dog's skull and maybe a `mirror(pts, cx)` helper for the raccoon's symmetric ears/ruffs.

### Process per iteration
Render `node tools/scratch/piter/render.mjs tools/scratch/piter/iter_NN.png --sdf`, plus my own grid overlay (3D vs 2D
at k = 1 side by side) to check the proportions numerically; snapshot with `tools/snapshot.mjs`.
