# Painter, round 07: the dog's laugh and shock, the last "parts"

Base: round 06. These are the critic's top 5 fixes, kept low-risk: the raccoon's face and Dog's grin are not touched.
Source: `variants/r07.mjs` = `tools/sprites/portraits_next.mjs`.

1. **Laugh, lit like the grin.**
   - The open mouth is a dark cavity (its value set at 0.12). The upper teeth are now their own form (`teethU`, clipped
     to the mouth): they cast a deep shadow 2.6 units into the mouth and onto the back of the tongue, and the upper lip
     shades their top.
   - The teeth catch the light: near-white in the middle, grey toward the corners.
   - The tongue is a lit dome (`lightField` R 4): lighter at its front and top, darker where it goes back under the
     teeth's shadow, with a 1-px midline crease.
   - The lower lip is a lit edge one tone up along the bottom of the mouth.
   - The cheeks push up: the jowl domes and both smile creases rise 3 units, the cheek-top highlight rises, and two
     cheek-ball domes sit under the closed eyes, so the eyes squint into the cheeks.
2. **Shock, reading as shock at 112.**
   - The O is taller and wider (9 x 12.5, was 7.5 x 8.5), with a dark interior. A sliver of the upper teeth is lit at
     the top, the tongue sits low as a small dome, and the lower lip is lit.
   - The brows are higher and more arched (+2 to 4 units at the peak).
   - The eyes are defined by value: whites at the top tone `W` with no grey outline ring, the brow's shadow over their
     top, small pupils, and a 1-px catchlight.
   - At 112 x 100 the wide white eyes, high brows and tall O now read as shock.
3. **The raccoon's lower body.** The lit belly is one flat designed plane (value 0.68 set under the forearm, before the
   terminator and the casts). The forearm's cast shadow now sits directly on it: one crisp edge, no sliver or spike. The
   shadow plane and the gentle falloff stay. The bib's tufted bottom edge no longer pokes a cream spike out beside the
   paw.
4. **The paw's silhouette.** 3 rounded knuckle bumps with deeper valleys against the yellow barrel, the thumb tip
   overlapping over the top of the barrel, and the wrist slimmed by about 1 unit each side. The light is unchanged:
   lit knuckle tops, shadow where it wraps.
5. **Clean-up.** New `deorphan()` in light2d turns pixelcheck's orphan rule into a fixer. It runs last on both
   characters, leaving the glints alone.
   - Raccoon: orphans 6 → 1. The bib-bottom orphans (109,167), (113,169) and (114,169) and the far-ear ones are fixed.
     Jaggies: 4 left on the lit-side contour. Holes: 1 left, at (307,143), the whisker.
   - Dog grin: orphan (98,92) fixed; the jaggy (106,82) on the hair outline remains.
   - Dog shock: 0 orphans, 1 jaggy. Dog laugh: 3 orphans along the lip line, 1 jaggy.

## Kept
- The raccoon's whole head.
- The body light: the terminator, the lit belly against the shadow plane, the falloff, the forearm with its cast
  shadow.
- The tail (`curveTubeField`) and the scarf (the knot and the short end).
- The yellow pump.
- Dog's grin with its far-side plane, cheek lens, patch eye, teeth, nose, forehead fold, hair specular and suit falloff.

## Checks
- Game: portraits.mjs, `src/` and draw2d are untouched, and the game portraits render. The light2d test image has the
  same md5.
- Palette: no new keys.

## Next (final look at the faces, at 1x)
- Laugh: the cavity band under the teeth could be a pixel deeper at 112.
- The paw and forearm share one tan. A touch more shadow in the knuckle valleys would make the grip read faster.
- The last 4 raccoon jaggies, on the ear and head contour.
