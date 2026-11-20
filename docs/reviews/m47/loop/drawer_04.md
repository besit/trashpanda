# Drawer 04: the dog's outline traced from 3D; the raccoon's hand-on-hip triangle

Sheet: `tools/scratch/piter/iter_04.png`. Snapshot: `art/history/portraits_2d/v05`.
Changed: `tools/sprites/portraits.mjs`. `tools/lib/draw2d.mjs`: `tube()` now also accepts a width *function* of t, so a
tube can swell (backwards compatible).

## Dog Fjord: the head outline is traced, not guessed
- **Method** (scratch script `trace.mjs` in my scratchpad):
  - I took `dogFjordModel('grin')`, kept only the objects that contain the jowl centre or the muzzle centre (the skull+jowl blend and the muzzle), and rendered them alone with `dogPortraitHi`'s camera at k = 1.
  - I took the alpha silhouette, found its centroid (109.3, 108.8), and cast 28 rays at equal angles to find the outermost opaque pixel on each.
  - Those 28 points are in the 3D render's own coordinates, which are exactly the coordinates `B()` takes before the 1.1x `T()` mapping. They became the head blob's control points.
  - The 3D render was used only as a tracing guide. No 3D pixels reach the output.
- **Cleaning:**
  - The left side's slight concavity (the temple pinch) is filled out by 1-3 units, so the sides are convex.
  - At the bottom, the two small dips between the jowl lobes and the chin are smoothed into one U, which is what the judge asked for. The trace has them faintly because of the flews.
  - No symmetrising: the 3/4 view is genuinely lopsided, a little lower on the right.
- **Result:** the widest point is at 3D-grid y ~120 (canvas ~122), 125 wide in 3D = **~138 on the canvas**, matching the judge's ~136. The skull top is narrower and convex, with no mushroom cap and no bell jar. The U bottom is at 3D-grid y ~165 (canvas ~172) and overlaps the collar.
- **Hair sides:** short sideburn wedges (~4-5 wide) inside the skull line at the hairline, with the tips at (79,65) on the left and (143.5,58) on the right. Pink skull shows between the hair and the back ear. The quiff, the top and the ridges are unchanged.
- **Ears** re-hinged on the traced outline (left at (76,61)-(72,74), right at (146,60)-(151,72)), tips out and slightly down. The first try left the right ear floating off the head; I fixed it before handing over.
- **Lit plane:** the M is now a wedge along the convex left side, ~14 wide at the cheek, thinning out above the brow and below the crease, rather than a stripe glued to the edge.
- **Shadow:** P down the right side and under the jowls, re-fitted to the new outline.
- **112:** the new outline gives a clean run of steps; the U reads round at 1x and 2x. The expressions are unchanged.

## Raccoon
- **Hand-on-hip triangle:**
  - The shoulder is at (159,128). The upper arm is a tube ~30 long and 17→16 thick, ending at a round elbow cap at (192,152). The forearm is ~35 long and 14→13 thick, coming back in to the fist at ~(166,177), which presses against the waist with its three knuckle bumps toward the body.
  - There is a clear background triangle between the arm and the torso.
  - Everything has a K outline over the body.
- **Shoulders lowered:** they slope out from under the jaw to y ~121-130. Both arms are now drawn *before* the head, so the cheek tufts and ruff overlap the shoulder tops (head over body, as in refs 4/5).
- **Near arm shorter:** the shoulder is at (92,128) and the round elbow at (83,170). The forearm (12.5→11) rises ~30 to the pump paw, which is unchanged. The V gap shows, and there is a flat cast shadow on the body beside the arm.
- **Tail:**
  - Bushy and tapered: it comes out from behind the bust at ~14 wide, swells to ~22 at mid-length and narrows to ~15 before the tip. It shows outside and below the arm, with its tip rising to ~y 150 beside the elbow.
  - Four dark bands, each ≥6 units, and a dark tip.
  - The body now has a K edge where it overlaps the tail.
- The bust's rounded bottom, the head, the grey jaw and the pump are unchanged. Everything is inside the frame.

## Self-check / next
- The dog's lower right jowl is a big plain pink area. The traced shape is right, but a second, shorter crease or a slightly larger P shadow under the cheek could add the "sag" read.
- The raccoon's forearm is a bit longer than the judge's ~26, because the fist had to reach the torso side. Next round it could be tightened by moving the elbow in to ~(188,150).
- At k = 1 the raccoon's arm triangle and tail bands read. The tail tip sits close to the elbow cap but does not touch it.
