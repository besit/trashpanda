# Painter, round 06: calm the raccoon's body

Base: round 05. These are the critic's top 5 fixes. Source: `variants/r06.mjs` = `tools/sprites/portraits_next.mjs`.

1. **The light is back inside the falloff.**
   - The body's terminator again runs from the far shoulder down to the bottom centre (`L.term` on body and far arm),
     instead of swallowing everything below the forearm.
   - Below the forearm there are two value groups again: a lit belly plane on the left, under the forearm's crisp cast
     shadow, and the shadow plane on the right.
   - The falloff dims both groups gently (14% at the bottom instead of 22%) without merging them.
   - Values view: the lower half reads as dim light against shadow, not one flat grey.
2. **The scarf has weight.**
   - A bunched knot (`scarfKnot`) sits below the jaw at the far shoulder, its own small form with a shadow side and a
     cast shadow onto the scarf.
   - The end comes out of it, shorter (about 35 px) and wider, narrowing a little, with one fold crease, an outward
     kick at the bottom and 4 short fringe strands.
   - It stops at about the gauge's height, well clear of the hose. Its lit plane and its shadow come from the same light
     as the loop.
3. **The tail is lit as ONE tube.** New `curveTubeField` in light2d: for each pixel, the nearest point of the tail's
   centre line and its radius give an analytic normal across the tube.
   - One continuous light band runs along the outer, upper-left side for the full length, and the shadow runs along the
     underside, with the reflected band kept.
   - The rings are local colour only, in the same light, so they turn lighter where they cross the light band.
   - The per-segment `cap` volumes are gone, and with them the caterpillar bulges.
   - 5 hooks are spaced irregularly (0.07, 0.3, 0.47 + 0.52 as a pair, 0.69), not one per ring.
   - The tip is a soft rounded point that ends pointing up: a softer taper and a round end cap, with the dark last ring.
4. **The far ear and the mask edge.**
   - The far ear now uses the near ear's shape language: a rounded-point triangle with 2 or 3 fur tufts on its lower
     outer rim.
   - It has a clean V notch (sharp corners) in the upper outer edge.
   - It sits in the head's shadow side: its light is multiplied by 0.72, one group darker than the near ear.
   - The 1-px white ticks are replaced by 3 tapered cream wedges (3 px at the base, then 2, then 1). They push from the
     cheek up and out into the mask's lower edge.
5. **Faces, the last 10%.**
   - **The smirk is a crease shape:** a filled lens 2 px dark where it tucks into the far corner, tapering and fading
     to `$` toward the nose, with a lit lip line (`+`) one tone up below it. The separate dimple tick is gone. The cheek
     bulge dome sits just above the corner (moved to (154,99)) so it reads as a small lit dome.
   - **Dog:** the chin fold groove is removed, so the underside of the jowls is ONE shadow shape (the far-side plane
     wrapping under) with one reflected band at the bottom edge. The near smile groove is softer (a -1.7 lift) and
     stops at (64,144), so there are no light strokes on the near cheek and no dot at the jowl bottom.

## Kept
- **Raccoon face:** the eyes (iris, ring, glow, catchlights, lid shadow), the asymmetric brows topping at `W`, the
  muzzle top plane, and the nose glint.
- **Dog:** the patch eye, the lit middle teeth with grey corners, the nose, the one forehead fold, the far-side plane
  and its lens, the hair specular, and the suit falloff.
- **Raccoon body:** the arm with its cast shadow on the bib, the paw grip, the hand-placed bottom tufts, the tail's bulk
  and C-curl, and the scarf loop's smooth top.
- **The rest:** the yellow pump, and the method.

## Compared with iter_05_hero
- The face is unchanged except the smirk, which now reads as a shape.
- The lower body has its light back while staying subdued.
- The tail no longer looks segmented.
- The scarf end looks like knitted cloth with a knot.
- The far ear reads as an ear in shadow.

## Checks
- pixelcheck: raccoon 7 orphans and 4 jaggies; dog 1 and 1. The remaining nubs and strips are the whiskers, the hose,
  the chin tuft and the scarf fringe.
- Game: portraits.mjs, `src/` and draw2d are untouched, and the game portraits render. The light2d test image has the
  same md5.
- Palette: no new keys.

## Next
- The knot could use one lit fold crease.
- The far ear's notch is small at 1x. One more pixel of depth might help.
- A few orphans at the bib's tufted bottom edge.
