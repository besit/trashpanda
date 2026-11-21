# ref03, pass 1: the painter's notes

Snapshot: `art/history/raccoon_style_ref03/v01`. Renders: `pass1_hero.png`, `pass1_1x.png`, `pass1_values.png`.
pixelcheck at k=1.5: orphan 1, jaggy 5, nub 24, strip 33, hole 1 (the nubs and strips are the tufted outline, carried over from pass 0); 38 colours.

## What the style is
`reference/raccoon-ref_03.jpg`, studied zoomed in. It is about 100 x 100 art pixels, so one ref pixel is roughly two of ours at k = 1.5. What makes it work:
- **Fur is strands, not bands.** Every fur area is made of 1-px diagonal runs, 2 to 6 px long, one tone lighter or darker than the pixels next to them. At a band edge the two tones interlock in strands. Inside a flat plane a few lone strands still show.
- **Long cool ramps.** It uses 6 or 7 greys from a green-black up to blue-white and pure white. The mask is black, with slate strands only toward its edges. The whites carry blue-grey strands.
- **Markings interlock.** The mask, brows and cheeks are never cut with a clean edge. Strands of each one poke into its neighbour.
- **Eyes:** no white shows. A small amber iris sits in a brown ring, with a big black pupil and one white catchlight. Light pixels on the lower-right rim make the eye look wet.
- **Ears:** a dark hollow full of pale strands fanning up from the base, and a light rim.
- **Outline:** near-black on the shadow side. On the lit side it is only a few steps darker than the fill.
- **Scarf:** chunky knit rolls in 4 or 5 greens with a lime highlight on top.

## The recipe I used
1. **Palette (38 colours used, all Greek keys plus the game's yellows).**
   - Coat: 9 tones, violet-black up to warm cream. The terminator tone (Ε) is a little more saturated.
   - Cream: 5 tones, violet-grey up to warm white. It is used for the brows, cheeks, muzzle and bib.
   - Mask: Ο/Α black, with coat tones Β, Γ and Δ as its lit strands.
   - Scarf: 5 greens taken from ref 03.
   - Yellow pump: a deep orange-brown shadow (Ψ), `o ¥ y Y`, and a cream specular (Ω).
   - Chrome: 5 cool tones. Eyes: 5 ambers.
   - Two bounce colours: ξ, a yellow-warmed coat tone, and ο, a green-tinted cream.
   - I merged three near-duplicate darks so there is one outline black.
2. **Light first, kept from pass 0.** Each mass gets one value map, with a hand-placed terminator, cast shadows and falloff, and is then quantised by thresholds onto each material's ramp. The falloff is stronger now (20% from y 118 down), and the cream bib is lowered 14% so the muzzle stays the brightest spot.
3. **Fur is a strand field, built from a flow field:**
   - Each fur part has a flow direction. On the head it runs away from the nose and curves down over the cheeks. On the ears it fans out from the base. On the body it runs down and outward, on the arms along the arm, and on the tail along its curve.
   - Across the flow, the picture is cut into 1-px strands.
   - **Base:** locks 2 strands wide (with a 4-wide grouping over them), 4 to 9 px long, pointed at both ends. These add ±0.1 to the value before quantising. That breaks every band edge into interlocking strands.
   - **Accents:** 1 segment in 10 gets a 1-px strand 6 to 11 px long, a full tone lighter or darker (±0.17). That gives the lone strands inside flat planes.
4. **Marking edges are warped along the flow.** Before the light is applied, each fur pixel takes the material found up to about 3 px away along the flow, with the distance set by the strand field. So the mask, brows, bib, tail rings and ear hollows all interlock in strands.
5. **Touches after the light:**
   - Pale tufts (Μ/Λ) in the ear hollows, on the accent strands.
   - Coat strands within 3 px of the barrel turn ξ (the pump's yellow bounce).
   - Cream strands under the scarf turn ο (the scarf's green).
6. **Scarf knit:** slanted groove ridges every 8.6 design units in the scarf's height field, so the one light makes rolled ribs. The scarf end gets ribs across its length.
7. **Eyes redrawn as in ref 03:**
   - a dark almond, an amber iris in a brown ring, light glowing low in the iris
   - a big pupil and a heavy lid shadow (the sly look)
   - one 2x2 catchlight, a 1-px wet rim (Λ) and a lit lower lid
8. **Outline:** Α on the shadow side. On the lit side it is the fill's own ramp 3 steps down (it softens the edge instead of cutting it), coloured per material for the pump and scarf.
9. **Cleanup:** despeckle, then deorphan scoped to the fur, so lone cream pixels merge but the glints stay.

What I deliberately left out: dithering (strands do the mixing), any texture on the pump (it is smooth plastic and chrome, a calm contrast to the fur), and strands at k < 0.9. The k = 1 frame gets the same field; it reads as a finer grain.

## What I'd do next (pass 2)
- **The paw** is still a shapeless tan lump with strands on it. It needs knuckles hand-placed in shadow and light (a text grid), with fur strands pointing down the fingers.
- **The brows** are almost flat white. They need ref 03's blue-white (Ν/Μ) strands along their lower edge and a soft top.
- **The scarf** reads as a knit roll but a bit like a row of beads. Give it fewer, wider ribs with a lime top edge, and add a dark fold line under the pump.
- **The face:** hand-tune the pixels of the eyes, nose and mouth corner. Make the nose's planes darker and crisper (a lit top plane, a dark underside), and put a little more strand contrast on the near cheek.
- **The pump:** 1 or 2 more tones on the barrel (reflected light on the shadow side) and a crisper gauge face.
- **The tail and body:** check that the accent strands don't read as scratches at 1x. Shorten them in the shadow planes.
