# free, pass 1: "Streetlamp & Neon"

Snapshot: `art/history/raccoon_style_free/v01`. Renders: `free/pass1_hero.png`, `pass1_1x.png`, `pass1_values.png`.

## The style
A night poster with two lights. The raccoon is a night animal and the game is set in the city, so I lit him like a
street at night. A warm sodium streetlamp comes from the upper left as the key light: the lights lean amber and cream.
A cool cyan neon rim comes from behind on the right: a thin bright edge on the shadow side that fades inward. The
warm/cool complement gives the poster its punch. The cyan edge also pulls him off all three poster backgrounds
(blue, red, purple), where pass 0's brown silhouette sank into the purple and red.

The main idea is **one shared palette**. Every material's shadows fall into the same indigo-violet family (ア イ ウ
エ): coat, mask, rubber, nose, and even the cream (lavender ケ) and the yellow (ト, a wine red). Only the lit tones
carry each material's local colour. So the shadow side reads as ONE shape of night that crosses the parts, not as
coloured parts that are each darkened. This is "drawing from shades, not shapes" taken to the palette level.

## Recipe
- **Palette: 40 colours, all mine (Katakana keys), plus the game's o / y / Y and W / R.**
  - Shared shadows: ア #160e1f (outline and deepest), イ #2b1b3a, ウ #3f2b50, エ #5a4268.
  - Coat: オ #86545c, a warm rust-mauve band at the terminator (the "glow" where light turns), then キ #c6996e and
    ク #f0cc8e in the lamp. The ramp went from 7 tones to 6. Hard bands, no dither.
  - Cream: ケ #7a6890 (shadow) and コ #b0a0b6 (the plane turning to the sky, cool) step up to サ #efdcbc and
    シ #fff4d6 (lamp-lit, warm).
  - Mask: ア and イ, plus ス and セ for a faint sheen. Ear inside: dusty pink ソ / タ.
  - Rim: チ #56c6dc cyan, ツ #b6f0fa ice (on cream), ヤ #3a8aa6 and ユ #2c4f72 for the fade inward.
  - Pump: ト → テ → o → y → Y. The scarf: ナ ニ ヌ ネ, teal-dark to lime. Chrome and rubber end in the shared darks.
- **Light (the value map):** pass 0's light-first pipeline (lightField / tubeField / terminators / cast shadows) is
  kept as the "form". I rebuilt the ramps so a bigger share of each mass falls into shadow: the coat is in shadow
  below a value of 0.44, up from 0.42. The falloff toward the bottom is stronger and starts higher (32% darker at
  the bottom, from y 122 instead of 14% from y 132). The bib under the scarf is held down (×0.84), so the face stays
  the clear contrast peak and the body sinks into the night.
- **Neon rim (new, `neonRim`):** for every pixel on the contour, the outward normal comes from the empty pixels in a
  7×7 window. Where it faces the rim light (right, slightly up), the pixel takes a rim colour. The rim is 3 px deep
  where it faces the light squarely at k 1.5 and 2 px at k 1, and 1 px at a glancing angle. It fades by depth:
  bright edge, then cyan, then dim teal. It is ice on cream and cyan on fur. It skips the yellow plastic and the
  lamp-lit tones. The dark violet outline stays outside it.
- **Outline:** selective. Dark violet ア on the shadow side and on hard materials. On the lamp side the fur's outline
  is the warm mid tone オ, so the lit edge stays soft and warm.
- **Texture:** less than pass 0. Fur strands only on the head, at 75% density (45% at k 1), and none on the ears,
  where the strands scribbled against the darker shadows. Flat areas stay flat. Texture is a light event at the
  terminators, not a pattern.
- **Deliberately left out:** dither, bounce light (at night the rim does that job), and per-part outlines.

## Why I chose this
Pass 0 was a daylight picture in brown and grey. It was competent but muddy, with no clear mood, and it read weakly
on the red and purple posters. The strongest pixel art usually has a value plan you can read from across the room, a
small coherent palette that feels like one place and one time, and one memorable lighting idea. A warm key with a
cool rim gives all three. It also fits the character (a raccoon in the city at night) without changing the pose,
the props or the design.

## What works
- At 1x the cyan edge separates him from every background, most of all the purple and the red.
- The far side of the head (the far ear, the cheek behind the far eye, the mask) merges into one dark graphic shape
  with the neon line on it. That is the most "poster" part of the picture.
- The amber lights against the indigo shadows read as night without the picture going dark: the face is still the
  brightest, warmest area.

## Weaknesses and what I'd do next (pass 2)
1. **It still reads as a recolour of pass 0.** The shapes come from the old light map: the faceted, low-poly planes on
   the snout and cheek, the blocky rectangles in the tail rings. The palette changed; the drawing did not change
   enough. Next: redesign the shadow shapes for this lighting. Make them bigger and more graphic (notan): the whole
   right third of the head and body in one indigo mass with the rim on it. Smooth the snout into one rounded plane
   with one terminator.
2. The rim stops at the scarf end and is thin on the lower body. It could wrap the shoulder, the scarf's loose end,
   the hose, and the tail's underside, so the neon light reads as one continuous light source.
3. The bib and the lit belly are still large flat cream areas: drop them one more step so the light pool sits on the face.
4. The eyes could catch the lamp more (eyeshine is a raccoon-at-night signature): a brighter amber glow in the iris.
5. Warm lamp spill: a 1 px warm amber edge on the lamp-side contour of the head and ears would echo the cyan rim on
   the other side.
