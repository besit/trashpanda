# ref04, pass 1: the raccoon as a chunky cartoon game sprite

Snapshot: `art/history/raccoon_style_ref04/v01`. Renders: `pass1_hero.png`, `pass1_1x.png`, `pass1_values.png`.
pixelcheck: k 1.5 orphan 3, hole 1; k 1 orphan 2, hole 1; 28 / 27 colours, no near-duplicates.

## The style (what I read in ref 04)
A sprite made of big readable shapes held together by a near-black warm line. Each form has a base colour, one flat shadow
shape on the side away from the light and a small light shape on the side toward it. Nothing is rendered inside a form
except those shapes. The face is the loudest part: white eyes, big pupils, a big grin with white teeth. Fur shows only as
a few chunky zigzags in the silhouette (cheeks, tail, feet), never as strands inside.

## The recipe I used
- **Palette: 28 colours, 3 tones per material** (Cyrillic keys А..Э): coat В/Г/Д, cream Ж/З/И, mask Й/К (2), scarf
  М/Н/О, chrome П/Р/С, rubber Т/У/Ф, the game's yellow o/y/Y, eye white and teeth Ц/Ч, iris Ш/Щ, mouth Ъ/Ы, needle Э.
  The shadows lean violet and the lights warm. No colour sits between two bands: the ramp is just a threshold.
- **Line: one colour А (#22141b) for everything**: the silhouette, the nose, the pupils, the lid. 2 px round the whole
  silhouette at both sizes. Between overlapping forms it is 2 px at k 1.5 and 1 px at k 1, always on the BACK form's
  side, so the front form keeps its full shape. It is computed from the part map: a pixel of part A gets the line where
  it touches a part drawn later, unless both are in one group. Markings (the mask, the brow bands, the tail rings,
  the forehead stripe) are colour inside one part, so they get no line. The groups are head+snout and the scarf+end+knot.
- **Light: the M4.9 value map, quantized hard.** One light from the upper left (lightField volumes, a hand-placed
  terminator per mass, cast shadows) is kept, but every terminator's glow band is turned off and each material's ramp
  has only 3 tones with wide bands (shadow below 0.47, light above 0.70 to 0.80). So the soft light becomes 2 or 3 flat
  shapes per form. No dither anywhere.
- **Texture: only in the silhouette.** I removed all the head fur strands, the lit fur wedges and the whiskers. The
  head's tufts are fewer and bigger (period 9, amp 6) and only on the near cheek and the crown. The chin and the ruff
  under the snout are smooth.
- **Face, drawn flat after the light**: eyes enlarged (near 11 x 9, far 7.6 x 7) with a white sclera, an amber iris with a
  dark top half where the lid shades it, a big pupil, one 2 to 3 px catchlight, and a heavy dark lid across the top for
  the sly look. The smirk is now an open one-sided grin: a dark mouth, a row of white teeth with two gaps, a pink tongue,
  the corner tucked up into a dimple. The nose has one big flat glint.
- **Pump**: yellow in 3 tones with one solid 2 px cream shine down the lit side, line-separated caps, rod, handle, foot and
  gauge (white face, grey lower crescent, red needle).

## What I left out on purpose
Fur strands, dithering, the terminator glow bands, reflected-light rims, whiskers, the knuckle detail, micro-highlights.

## What reads well
- At 1x it reads as a game sprite: the line holds the figure on all three poster colours, the eyes and grin carry the
  expression, and the pump stays straight and yellow.
- Values: one light side, the face (white eyes, cream muzzle, teeth, black nose) is the contrast peak.

## Weaknesses / next pass
1. The coat's cel shapes on the head and tail still come from a smooth light field. They are flat, but their edges are
   long stair-stepped curves with small leftover patches (crown, cheek planes, the light/shadow split across each tail
   ring makes a checker). Ref 04 designs each shadow as one deliberate shape. I would hand-draw the shadow shapes for the
   head, tail and body (valueShape polygons with 'set') instead of thresholding the volume.
2. Proportions are still the M4.9 semi-realistic raccoon. Ref 04 is chibi: a bigger, rounder head and a rounder, simpler
   muzzle. I could push the head and eyes 10 to 15% bigger and round the snout, within the frame.
3. The scarf reads as a flat green strip. It needs one clear shadow shape under the head and a bolder knot and fringe.
4. Small things: one cheek tuft pokes past the pump, a 1 px silhouette hole, a few orphans near the scarf end. The paw is
   still a little "sticker": its line and grip need simplifying into one mitten shape with one shadow.
5. The line is the same colour everywhere. Ref 04 sometimes lightens inner lines in lit areas. I could try a dark-brown inner
   line on the lit coat to soften it.
