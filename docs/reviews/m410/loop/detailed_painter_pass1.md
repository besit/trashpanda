# Detailed style, pass 1 (M4.10)

Snapshot: `art/history/raccoon_style_detailed/v01`. Renders: `pass1_hero.png`, `pass1_1x.png`, `pass1_values.png`.
Code: `detailed/raccoon.mjs` (the pose, pump, scarf, tail and bottom unchanged; the dog code removed) plus
`detailed/detail.mjs` (the palette and the texture passes). `detailed/crop.mjs` makes zoomed crops for checking.

## The style
"Every surface rendered": the M4.9 light-first value map is kept, and each material gets its own surface texture
written into the same value grid **before** quantization. Texture and light therefore go through the same ramps, so the
texture never fights the form: a lock of fur moves one tone up on its lit side and one tone down on its shadow edge.

## Recipe
- **Palette: long ramps, 73 colours at k = 1.5** (36 new Hiragana keys registered at run time, `hk()` in detail.mjs).
  8 to 15 tones per material, hue-shifted: violet shadows, warm lights, a saturated key at the terminator (0.46 to 0.55).
  Coat 15 tones, cream 10, brow 10, mask 7, stripe 6, ear 7, yellow paint 11, chrome 10, rubber 8, scarf 9, nose 5.
  Bands are narrow (about 0.07 in value), so a texture of about one band reads as fur, not as a change of form.
- **Fur = clusters of strands in value space** (`locks`): on a staggered grid (4.6 design units), 2 or 3 parallel 1-px
  strands along the part's flow field (+0.09; the middle strand longest), and one dark strand beside them on the side
  away from the light (-0.08). Later clusters overwrite earlier ones, so they tile instead of summing into grain.
  Flow fields: head away from the nose, cheeks down and outward, ears up, body down and away from the chest centre,
  arms down the limb, tail along its curve toward the tip, snout combed back, paw along the fingers. Calm zones: the
  eyes, the nose, the smirk.
- **Edges between markings interlock**: furBreak, after quantization, between every pair of neighbouring tones on the
  head, ears and snout (M4.9's pass, now on a longer ramp, so far more strands), and new on the tail: the dark rings and
  the coat poke strands into each other both ways along the tail.
- **Pump materials**: chrome (caps, rod, boss, chuck) as an environment PROFILE across the tube (sky, bright kick, dark
  horizon, ground, reflected rim), not as lit shading, with crimp rings on the caps; painted yellow metal keeps its smooth
  tube light and solid specular streak, with bowed pinstripe pairs near both ends (one ring per pair shows the barrel's
  roundness); rubber grips ribbed across the handle, a tread on the foot, ribbed hose; the gauge as a chrome bezel (outer
  slope lit upper left, inner lip lit lower right), a white face with the bezel's shadow crescent, 11 ticks on a
  270-degree dial, a red zone, the red needle, the centre pin, a 3-pixel glass glare.
- **Scarf knit**: a 3 x 4 stitch tile (columns run along the scarf, so the band follows its centreline; a dark gap row
  between columns, '>' shaped stitches), on its own axis for the hanging end.
- **Micro detail**: whisker pad dots, a third whisker, a bounce-light crescent under the nose; the eyes as in M4.9.
- **Outline**: unchanged (selective silhouette, dark on the shadow side, a per-material line).
- **Left out on purpose**: dither (all texture is clustered strands, not checkerboard), any texture on the eyes,
  the nose's leather (it would turn into noise at k = 1), labels or text on the pump.

## What I saw
- The fur now has direction everywhere at k = 1.5, and it still reads at 1x (the strands calm down into a tone).
  The values view keeps one light (upper left) and the face as the peak.
- The tail is the best part: its ring edges interlock like real fur.
- The pump reads as three materials (chrome, rubber, painted metal) and the gauge reads as a gauge.

## Weaknesses / next pass
1. The texture is still **uniform**: every area gets the same density, so the figure has no focal hierarchy. Ref 03
   puts its fine detail where light turns (terminators, edges, the face) and leaves broad lit and shadow planes calmer.
   Next: scale the strand amplitude and density by how close a pixel is to a terminator or marking edge, and by distance
   from the face.
2. The **forearm and paw** are still flat geometric planes (their light is clamped to one coat tone), so they look
   assembled next to the furry body. Give them real light ramps and strands, plus finger separations and claw tips.
3. The lower face's lilac shadow plane and the snout facets still show straight polygon edges in places.
4. Strands are 1 px wide everywhere; ref 03's clumps are 2 px at the root. Try 2-px roots on the larger masses.
5. The knit is a bit busy in the scarf's shadow; fade its amplitude in deep shadow.
6. k = 1 gets the same passes at 0.8 amplitude; check whether it needs a coarser grid.
