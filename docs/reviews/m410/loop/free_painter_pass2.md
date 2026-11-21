# free, pass 2: the synthesis ("best recipe" test)

Snapshot: `art/history/raccoon_style_free/v02`. Renders: `free/pass2_hero.png`, `pass2_1x.png`, `pass2_values.png`.
Pixelcheck:
- k 1.5: 36 colours, orphan 6, jaggy 9, hole 2.
- k 1: 36 colours, orphan 7, jaggy 4.
- All nubs, strips and holes are the whiskers outside the silhouette (by design).

This pass is the critic's hypothesis, built on my pass 1 shared-shadow palette:
- ref04 and naive shape discipline
- ref03 eyes
- detailed's materials on the pump only
- fur clumps only at edges

I threw away the old value-map pipeline (lightField, terminators, ramps by threshold) and wrote `raccoon.mjs` from
scratch, shape-first. The night idea survives only as mood: a warm lamp key, indigo shadows, and a faint cool rim
INSIDE the outline on the far contour.

## What I redrew by hand first (the drawing is the ceiling)
- **The snout** is one rounded cylinder (a new outline, rounder tip), lit from above by one band rule down each column:
  a highlight ridge, the lit top and side, a half band, then the underside shadow. The terminator follows the snout's
  own curve. The pass 1 facets are gone.
- **The paw GRIPS the barrel.** It is moved up the barrel (HN 50 → 56) so the yellow shows above and below it.
  - The back of the hand rises from the wrist on the lower side.
  - Four fingers are stacked ALONG the barrel. Their bends show as four bumps over the top edge, with three short
    notches between them.
  - The thumb tucks under the barrel toward the handle, with a crease line.
  - Light: lit knuckle tops, the side toward the foot in shadow, the wrist and thumb in half light. The paw casts
    onto the barrel and the gauge.
- **The near arm** is one tube: shoulder, elbow at the side, forearm across the belly to the wrist. It is one
  cylinder rule: a lit top edge, a core shadow underneath. The chest inside the arm loop is now coat in half light,
  not a bright cream triangle. The bib is only a small cream area under the scarf, one step down (コ).
- **The tail** is one cylinder with one band rule along its centre line. That gives one continuous underside shadow
  through the rings (no checker). The rings have bowed edges that wrap the tube, a few chunky tufts on the outer
  curve, and clumps along the ring edges.

## Final recipe
1. **Palette: 36 colours, one shared shadow family.** Every material has 5 light levels (0 deep, 1 shadow, 2 half,
   3 lit, 4 highlight), plus a reflected tone where needed. Levels 0 and 1 of every material come from the same 4
   indigo-violets (ア イ ウ エ, plus lavender ケ for the cream). Only levels 2 to 4 carry local colour:
   - the coat: warm grey-brown pulled toward cream
   - the cream
   - the green scarf
   - the game's yellow o / y / Y / ¥, with ト as its deepest shadow
   - chrome and rubber
   - the amber iris
   One warm accent sits at the coat's terminator: オ, a 1-px glow where the coat turns into shadow.
2. **Light is designed, not computed.** Each part holds a MATERIAL and a LEVEL per pixel. Light comes from hand-placed
   shapes (`level` polygons in design units), each one a decision: the far third of the body, the far cheek and jaw,
   the bottom turning under, the scarf's lower half, the knot's far side. Cast shadows cross materials: the head on
   the scarf and chest, the scarf, the arm, the pump and the paw. A lit edge sits on the side facing the light. For
   the cylinders (tail, arm, snout, nose, hose, pump parts) there is exactly one band rule per form. `turn` adds a
   2-unit half-tone band where planes turn. Nothing is thresholded from a smooth field.
3. **Lines: strong outside, almost none inside.**
   - The outer silhouette is dark ア on the shadow side and softer イ on the lit side, doubled to 2 px on the shadow
     side at k 1.5.
   - Inner lines only where the man-made pump or the gripping paw lies over something. The line goes on the back
     form's side, so the thin rod keeps its width.
   - Everything else is separated by value and cast shadows: head over scarf, arm over chest, snout over face.
4. **The face is the peak, ref03-quality.** The near cheek under the mask is the brightest cream, and the mask is
   solid (no streaks). Eyes:
   - a dark almond and an amber iris ringed in brown
   - light glowing low through the iris, with an eyeshine crescent
   - a big pupil, a 2×2 catchlight and a secondary one
   - a heavy sly lid with its shadow across the iris
   - a lit lower lid, a wet rim
   The rest of the face:
   - the smirk is a tapered crease that thickens into a tucked corner, with a 1-px light cheek bulge over it
   - the nose has a lit top plane, a dark underside, a 2×2 glint and a cool reflected rim
5. **Materials on the pump only.** Each part has a designed profile across its axis:
   - **Yellow plastic:** a reflected-light edge (¥), a shadow, the lit body, and a solid specular streak.
   - **Chrome** as an environment profile: ground reflection, a dark horizon band, mid, light, a sharp white
     highlight, then mid at the lit edge.
   - **Rubber:** matte bands, with ribs across the T-handle grips at k 1.5.
   - **Gauge:** a chrome bezel lit at the top left, a pale face with a lower crescent, ticks on a 270° arc, a red
     zone, a dark needle, the pin, and a glass glare.
   - **The hose** is one cylinder with a reflected rim.
6. **Fur only as clumps at edges.** `furBreak` makes 2-px-rooted wedges run both ways, only where the colours change:
   - brows and ruff into the mask, and the mask into the cream
   - the coat into the mask's top and into the forehead stripe
   - the head's light/shadow terminator, the body's terminator, the bib edge
   - the tail ring edges
   At marking edges, which run with the flow, the clumps lean 55° off the head's flow so they actually cross the
   edge. Broad planes stay flat. Texture also lives in the silhouette: chunky tufts on the cheek ruff, the near
   ear, the tail and the body's bottom.
7. **The rim is inside the line and limited** to the far contour of the head, far ear, snout tip, far shoulder and
   scarf end, above y 150. It is 1 px of cool light (ム, or ツ on cream), plus at k 1.5 one dimmer px inside it. The
   dark outline stays the outermost pixel.

## What I deliberately left out
Dither, value-map lighting, terminator glow bands on the head, strands inside planes, texture on the bib or the lower
body, inner lines between body parts, whiskers inside the silhouette, the scarf's knit.

## What reads well
- **At 1x** the 2-px dark silhouette holds him on blue, red and purple. The solid mask and the bright cream lower face
  carry the face from across the room, and the amber eyes glow.
- **In the values view:** one light from the upper left, the face as the peak, the body and tail a step down, the far
  third of the figure in one shadow.
- **It looks drawn, not assembled:** the arm, chest and body merge into one coat mass separated by light. The only
  lines inside are on the hard object.

## Weaknesses and what I'd do next
1. **The expression is still a thin smirk.** At 1x it survives only as a short dark line. A slightly open corner (2 to
   3 px, ref04's lesson) or a bigger cheek bulge would carry the character better.
2. **The scarf is plain:** a green band with a lit top roll and the jaw's shadow, but no knit, folds or fringe
   detail beyond the hanging end. One or two folds at the knot would help.
3. **The fur clumps are subtle.** They sit where they should, but at k 1.5 a few more (gap 4.2 → about 3.5), each 1 px
   longer, on the crown and cheek ruff would bring in more of ref03's handmade feel without reaching the bib.
4. **Small things:**
   - The lower body's half-light plane is a little large and flat.
   - The far arm is a featureless shadow shape.
   - Six orphan pixels: catchlights, gauge ticks, clump tips.
