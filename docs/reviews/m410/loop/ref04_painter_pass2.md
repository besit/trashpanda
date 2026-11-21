# ref04, pass 2: designed cel shapes, fewer lines inside, rounder proportions

Snapshot: `art/history/raccoon_style_ref04/v02`. Renders: `pass2_hero.png`, `pass2_1x.png`, `pass2_values.png`.
pixelcheck is clean at both k 1.5 and k 1. 28 colours, no near-duplicates. The pass 1 code is kept as
`raccoon_pass1.mjs`.

## What changed, against the critique
1. **Designed shadow shapes, no thresholded light field.** The fur no longer uses lightField. The value map starts flat
   at 0.6 (the base tone) and I write shapes into it with 'set': 0.86 for lit, 0.3 for shadow. The 3-tone ramps cut at
   0.47 and 0.72, so each value lands on exactly one tone.
   - **Lit edges**: a crescent only where a form meets the AIR. crescentValue gets the whole figure as its mask and the
     form as `only`, so no lit band shows where one form overlaps another.
   - **Head**: one shadow shape. The terminator runs from the crown, right of the forehead stripe, past the far brow,
     left of the far eye, then under the muzzle along the jaw. The far brow turns cream-shadow and the far crown turns
     coat-shadow.
   - **Muzzle**: 2 tones on the cream (a lit top plane, a shadow under it), with nothing in between.
   - **Tail**: one continuous shadow band on the side away from the light. It starts a quarter of the tail's width off
     the centre line and splits every ring the same way, so the per-ring checker is gone.
   - **Body**: one shadow shape on the far half. The far arm is all shadow except a sliver on the shoulder.
   - **Forearm**: a shadow band only where it lies over air or the cream bib. It is a custom test that reads the material
     keys before painting, so the shoulder, where the arm grows out of the body, shows no edge. The paw has an underside
     band and two knuckle splits.
   - **Scarf**: a lime top roll, a shadow on the lower edge and the far half, a shaded knot with two folds, and a 3-notch
     fringe.
   - **Cast shadows** where forms overlap, mul 0.5: head on scarf and chest, snout on jaw, arm on bib, pump on body,
     paw on barrel, body on tail.
2. **Rounder proportions.** The whole head (markings, eyes, mouth, ears) goes through one transform: 1.08x about the
   neck. The muzzle is 15% shorter (x beyond 146 pulls in) with a rounder tip. The nose is bigger and round. The ears
   are 1.06x, rounder, and blunter at the tips. The eyes are 12.4 x 10 (near) and 8.4 x 7.6 (far). I shaved the
   sclera's bottom so he no longer looks up-and-away.
3. **Fewer lines inside.** A table `lineFor(back, front)` decides each internal edge:
   - 2-px black line (А): the pump as an object (also the paw over the pump), the eyes, the mouth, the nose, and the
     head over the scarf.
   - 1-px dark mask-tone line (Й): fur over fur of the same value (the ears behind the head, the body over the tail,
     the far arm and the paw over the body, the paw over the forearm).
   - No line: the lit forearm over the bib, the scarf over the chest, the arm into the shoulder. Cast shadows separate
     them instead.
4. **Small fixes.**
   - The cheek tuft no longer pokes past the pump (head tufts only from y 78 to 99).
   - The bib tufts are gone.
   - The ear insides are one dark hollow with a 2-px pink fold.
   - 1-px silhouette holes are closed with the line (12 passes, because the notches chain).
   - A stray `undefined` pixel is normalised to empty.

## The final recipe (ref04, chunky cartoon sprite)
- **Palette**: 28 colours, 3 tones per material (shadow, base, light), plus one near-black warm line. Shadows lean
  violet, lights warm. No dither, no in-between tones.
- **Values are designed, not computed**: base everywhere, then lit crescents only on the silhouette's upper-left edge,
  one hand-placed shadow shape per mass (head, muzzle underside, body far half, tail underside band, arm and paw
  undersides, scarf far half), then cast shadows. Pump parts are the exception: they keep analytic tube light, which is
  already a clean straight band.
- **Line**: 2 px warm black round the whole silhouette. Inside, only where it carries information: the 2-px black line
  for objects and face features, a 1-px dark coat line where fur meets fur of the same value, and nothing where a cast
  shadow can do the job.
- **Shapes**: a big round head, a short round muzzle, a big round nose, big white-sclera eyes with a heavy sly lid, and
  an open one-sided grin with teeth. Texture appears only as a few big tufts in the silhouette.
- **Order**: shapes, then the value plan, then paint, then flat details (eyes, mouth, gauge, shine), then selective inner
  lines, then the silhouette line, then cleanup.

## What reads well
- At 1x the face reads from across the room on all three posters. The far side of the head and body now sits in one
  shadow, and the values view shows one light side, with the face (eye whites, teeth, cream muzzle, black nose) as the
  peak.
- The arm and bib area looks less "assembled": no outlined tube, no outlined wedge.

## Remaining weaknesses
- The forearm and upper arm are still the old bent-tube construction. Without inner lines the forearm reads mostly by
  colour (coat against cream), and a small shadow notch is left at the elbow. A redesign would draw the arm as one
  silhouette shape with a single clear underside shadow.
- The scarf is still mostly a flat strip. The lime roll is mostly taken back by the head's cast shadow, and the knot and
  folds are small.
- Only the head is chibi. The body and tail keep the semi-realistic proportions of M4.9, so ref 04's squat, round
  silhouette is only half there.
- The mask is one big solid shape. That is right for ref 04, but it is the largest dark mass, a little heavy against the
  face.
