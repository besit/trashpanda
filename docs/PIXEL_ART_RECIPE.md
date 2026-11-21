# The recipe for the best pixel art: what the raccoon study showed

Five painters redrew the same raccoon in five styles, got a critique, and drew it again:
- **ref03**: painterly fur
- **ref04**: a chunky cartoon sprite
- **naive**: as simple as possible
- **detailed**: as much detail as possible
- **free**: in pass 2 it became the synthesis of the lessons below

The pictures are in [compare_pass1.png](reviews/m410/compare_pass1.png) and [compare_pass2.png](reviews/m410/compare_pass2.png). The scores and the full critique
are in `docs/reviews/m410/loop/` (`critic_pass1.md`, `critic_pass2.md`).

**The one-sentence answer:** good pixel art is decided by the shapes and the light plan *before* any detail goes in.
Detail, texture and colour count can only add to a good drawing, never rescue a weak one.

The clearest proof in the study:
- The two painters who threw away the computed shading and **drew the shadow shapes by hand** (free and ref04) gained
  1 to 2.5 points.
- The two who kept the old pipeline and added better texture (ref03 and detailed) gained half a point.
- The most detailed picture (73 colours) scored second-lowest.

---

## 1. The order of work

Work from big to small, and don't move on until the current step reads.

1. **Silhouette.** Fill the figure with one flat colour. Is it still a raccoon holding a pump? The pump, the ears, the
   tail curl and the snout must read as a black shape alone.
2. **Big shapes and markings.** The mask, brows, bib, tail rings and scarf, in flat local colours. Check the design here:
   does the arm actually hold the pump? Is there a strange leftover shape between the arm and the body?
3. **The light plan, in greys.** Pick one light (upper left). Hand-draw ONE shadow shape per mass, then the cast
   shadows. Look at it in greys: one lit side, one shadow side, and the face as the brightest, highest-contrast spot.
4. **The face.** Eyes, nose and mouth, by hand, pixel by pixel.
5. **Palette and colour.** Ramps, hue shift, the shared shadow family (see section 4).
6. **Outline.** The outer line first, then decide each inner line one by one.
7. **Detail and texture last,** and only where the focal order allows it.
8. **Check at real size** on the actual backgrounds (the posters), then clean stray pixels.

The study's biggest mistake, made in every pass 1 version, was doing step 7 on top of a step 2 that was wrong. The arm
was a bent tube around a triangle of chest, and the paw sat on the pump instead of gripping it. No texture fixed that.

## 2. Shape and drawing

- **Design each shape on purpose.** Every shadow, every highlight and every marking edge should be a shape someone
  chose. In pass 1, most styles took their shadows from a smooth computed light field and cut it into tones. That
  produced:
  - stair-stepped bands and leftover slivers (ref04 pass 1)
  - straight "low-poly" facets on the snout (ref03, detailed and free pass 1)
  - checkerboard tail rings
  Hand-drawn shapes fixed all three.
- **Draw a form as one mass, not as parts glued together.** Ivan's "assembled from separate shapes" complaint is a
  drawing problem.
  - The fix in free pass 2: the arm, chest and body are one coat mass. The arm is told apart from the body by its
    light and the shadow it casts, not by a line around it or a different colour wedge inside its bend.
- **Make hands and props interact.** A hand grips when the object shows on both sides of it, the finger bumps break its
  edge, and it casts a shadow onto it. That is what free pass 2 and naive pass 2 did. A paw drawn as a blob on top of
  the barrel (naive pass 1) or as a set of grey cylinders (ref03 pass 2) looks pasted on.
- **Let one edge do two jobs.** Naive pass 2's best idea: the shadow under the snout has its top edge exactly where the
  mouth is. The mouth line then explains the snout's shape instead of floating on it.
- **Proportions are part of the style.** ref04 pass 2's rounder, bigger head with a short muzzle added more appeal than
  any rendering change did. But only the head was changed, and a chibi head on a realistic body looks like two styles
  stacked. Change the whole figure or not at all.

## 3. Light and value design

**Value** means how light or dark a colour is, ignoring its hue. Converting the picture to greys shows it.

- **One light, everywhere.** Upper left. Every form has a lit side and a shadow side that agree with it.
- **Plan the values in greys first.** The test every pass ran was the greys view. Good results show three or four big,
  clear value groups. Bad ones show grey soup.
- **The face is the peak.** The highest contrast (the darkest dark next to the lightest light) belongs at the face:
  - the solid black mask against the brightest cream (ref03 pass 2, free pass 2)
  - the white eye and the teeth (ref04)
  Everything else is a step down:
  - darken the lower body
  - hold the bib a tone lower than the muzzle
  - let the far third of the figure sit in one shadow
- **The shadow side is ONE connected shape** across all parts (the cheek, the scarf, the body). Don't shade each part
  separately. This is the biggest single step toward "drawn from shades".
- **Cylinders get one simple band rule:** lit edge, light, half-tone, core shadow, then a thin reflected light at the
  very bottom. The arm, tail, snout, hose and pump are all cylinders. One clean rule per form beats a computed gradient.
- **Cast shadows do the work that inner lines used to do.** For example: the head onto the scarf, the arm onto the
  chest, the paw onto the barrel.
- **Hard edges, no gradients.** A gradient (airbrush) turns into "blobby 3D", which Ivan rejected. Pixel-art light is
  bands with crisp edges.

## 4. Palette

- **Size: about 12 to 40 colours for a portrait like this.**

  | colours | style | what it did |
  |---------|-------|-------------|
  | 11 | naive | enough to read, with charm |
  | 28 | ref04 | clean and expressive |
  | 36 | free | the richest result that is still crisp |
  | 73 → 52 | detailed | read as felt or noise; cutting it helped |

  The count matters less than the next point.
- **Each step in a ramp must be visible at real size.** A **ramp** is the set of tones for one material, dark to light.
  If two neighbouring tones are too close, the eye blends them, and small shapes can't have edges.
  - Detailed's 15-tone coat ramp made mush.
  - Its 8-tone ramp made readable clumps.
  - Rough rule: 3 to 5 tones per material for a cartoon, 5 to 8 for painterly, never more than about 9.
- **Hue shift.** As a tone gets darker it moves toward violet or blue. As it gets lighter it moves toward warm yellow or
  cream. Every successful version did this. It makes shadows feel like shadows instead of dirt.
- **The shared shadow family (the best palette idea of the study, from free).**
  - Every material's two darkest tones come from the same small set of indigo-violets: the coat, the cream, the
    scarf, the yellow, the rubber.
  - Only the lit tones carry the material's own colour.
  - So the shadow side reads as one shape of shade crossing the parts, and the whole figure feels like one object under
    one light. ref03 pass 2 adopted it too.
- **Reuse colours across materials.** Naive's eyes are the pump's yellow, and its glints are the cream. Reuse keeps the
  count low and ties the picture together.
- **Keep one temperature.** ref03 pass 1 had a warm brown coat with a cold blue-white face, and the head looked like two
  materials glued together.

## 5. Outlines

- **Strong outside.** A dark outer line, 2 px on the shadow side at the poster size, is what keeps the figure readable
  on every background (blue, red, purple). ref04, free pass 2 and naive pass 2 all proved it.
- **On the lit side, soften it.** Use a darker tone of the fill instead of black ("selective outline"), so the lit edge
  glows instead of being cut.
- **Almost none inside.** Lines between body parts are what make art look "assembled". Decide each inner line on
  purpose:
  - **Yes:** around a hard object (the pump), around face features, and where two forms of the same value overlap and
    nothing else separates them.
  - **No:** where a cast shadow or a value change already separates the forms.
- **Remove a line only after the shape can stand without it.** ref04 pass 2 removed the arm's line before redrawing
  the arm, and the chest became a confusing set of beige shapes.
- **A rim light lives inside the outline.** Free pass 1 put a cyan edge outside the dark line, and it looked like a
  misprint. Pass 2 moved it inside, 1 to 2 px, on the far contour only.

## 6. Detail and focal order

**Detail must follow the order of what matters.** Spend detail in this order:

1. **The face:** eyes, nose, mouth.
2. **The edges where something changes:** where the mask meets the cream, where light turns into shadow (the
   terminator), and the tail ring edges.
3. **The prop.** Man-made objects may be crisp and detailed. The pump with chrome, ribbed rubber and a gauge was
   excellent in every version that rendered it.
4. **The broad planes:** a few marks at most.
5. **Deep shadow:** nothing.

How the study showed it:
- **Detailed pass 1 spread the same detail everywhere.** At real size the whole figure became grain, and the face had to
  compete with the belly.
- **ref03 pass 1 put 1-px strands on flat planes.** They read as scratches and wood grain.
- **Pass 2 added focal weighting,** and both improved.
- **The face is the focal point, but it must be the CLEAREST area, not the busiest.** Detailed pass 2 still covers its
  muzzle in marks, so its focal point is its noisiest area. That is backwards.

## 7. Texture (fur)

- **Fur is clumps, not lines.**
  - A lock is a wedge, 2 to 3 px wide at the root and tapering to a 1-px tip.
  - The tone change sits inside the lock.
  - 1-px lines scattered over a plane read as scratches (ref03 pass 1).
- **Put texture where the light or the colour changes,** not inside flat planes. Free pass 2's fur lives only at:
  - the mask and brow edges
  - the terminators
  - the tail ring edges
  The planes stay flat and calm.
- **Let the silhouette carry the fur.** A few chunky tufts on the cheek ruff, the tail and the bottom say "furry" more
  cheaply than any interior strands. ref04 and naive use nothing else.
- **Vary it.** Free pass 2's clumps are evenly spaced and evenly long, so the mask edge looks like a comb. Real locks
  vary in length (3 to 9 px) and spacing, and they come in pairs and triples with gaps.
- **No dither** (checkerboard mixing). None of the five needed it, and it reads as noise at this size.

## 8. Faces and eyes

- **Design the face for real size.** At the size the game shows it, a 1-px mouth line disappears. The expression must
  be made of shapes:
  - **ref04's open grin** (dark mouth, white teeth, pink tongue) is the only expression in the study that reads on every
    poster. That is why it wins on character.
  - **Free's and ref03's smirk** is a thin line. It vanishes at 1x.
  - **The fix:** an open corner of 2 to 3 px, plus a 1-px light cheek bulge above it.
- **Eyes, the ref03 recipe** (the best eyes of the study, reused by free and detailed):
  - a dark almond, no white showing
  - an amber iris in a darker brown ring
  - light glowing LOW in the iris, opposite the light (it makes the eye look wet and round)
  - a big pupil
  - one 2x2 catchlight toward the light
  - a 1-px wet rim on the lower edge
  - a heavy lid shadow across the top for the sly look
- **The cartoon alternative (ref04):** a white sclera, a big iris and pupil, a heavy flat lid. It reads from further
  away and is more expressive, but less refined.
- **The nose is planes:** a lit top plane, a near-black front, a 2x2 glint, a 1-px reflected light along the bottom.
  Never a gradient ball (detailed pass 1's "pillow" nose).
- **The mask is solid.** Streaks inside a black mask read as brushed metal (ref03 pass 1). Fur only at its edges.

## 9. What to avoid

- **Computed shading cut into tones without redrawing it.** It produces facets, slivers and checkers.
- **Detail spread evenly over everything.** It is grain, not quality.
- **Long ramps with tiny steps.** They are mush.
- **1-px strands on flat planes.** They are scratches.
- **Outlines around every part.** They are "assembled".
- **A rim or glow outside the outline.** It looks like a misprint.
- **Soft gradients, "pillow shading".** That is light in the middle of each shape with dark all round the edge,
  ignoring where the light comes from. It is the airbrushed 3D look.
- **A focal point that is the busiest area instead of the clearest.**
- **Changing proportions in one part only.**
- **Judging at 4x zoom only.** Always look at real size, on the real backgrounds.

## 10. How the five styles trade these off

| style | strength | price | final common score |
|-------|----------|-------|--------------------|
| **naive** (11 colours, 2 tones per material, 1 to 2 px line) | the cleanest file, reads instantly, charming lidded eyes; proves how little is needed | low ceiling: no room for richness; the expression lives only in the eyes | 5.5 |
| **ref04** (28 colours, 3 tones, 2-px black line, designed cel shapes) | the best at real size and the most character (round head, grin) | the most "cartoon", and the arm and chest are under-described once the lines are gone | 6.5 |
| **ref03** (37 colours, long cool ramps, fur clumps) | the best face rendering: solid mask, wet eyes, planar nose | built on the old construction: scratchy cream, a mechanical paw, a slab arm | 6.0 |
| **detailed** (52 colours, texture everywhere, rich materials) | the best prop (the pump) | the busiest focal point, greyish values; proof that detail ≠ quality | 5.0 |
| **free / synthesis** (36 colours, shared shadow family, designed shapes, 2-px outer line, no inner lines, ref03 eyes, fur only at edges) | the only one that is drawn from shades over the whole figure, with no tool artefacts | its smirk is too thin for 1x, its clumps are too regular, its scarf is plain | 7.0 |

**The recommended hero portrait is the synthesis** (free pass 2), finished with:
- ref04's open smirk corner
- a slightly rounder head
- a designed scarf knot
- varied fur clumps

It is the one that meets every rule above. Everything left to fix is local, not structural.
