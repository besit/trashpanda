# Detailed style, pass 2 (M4.10)

Snapshot: `art/history/raccoon_style_detailed/v02` (pass 1 is v01). Renders: `pass2_hero.png`, `pass2_1x.png`,
`pass2_values.png`. Code: `detailed/raccoon.mjs` and `detailed/detail.mjs`. The pass-1 code is kept as
`pass1_raccoon.mjs.txt` and `pass1_detail.mjs.txt`.
Pixelcheck at k = 1.5: 52 colours (73 in pass 1). Orphan 9: the whisker-pad dots, on purpose.

## What changed after the critique
The critic scored pass 1 at 5.0 on its own target and 4.5 on the common scale. The texture was the same density
everywhere, 73 colours in narrow bands turned it into felt, polygons showed through, and the nose was pillow-shaded.
1. **Hand-drawn shadow shapes first.**
   - **Snout**: a cylinder pointing right, set with valueShape. A lit top plane (0.74), the side in half light (0.55),
     and the underside in shadow from the mouth line down. That shadow is one curved terminator with a glow band. The
     straight lilac facet across the lower face is gone.
   - **Terminators are curves now**: the head, snout, body and scarf terminators are `blob()` curves; the points outside
     the form are marked as corners. In pass 1 they were straight-edged polygons, which made the facets.
   - **Forearm**: one cylinder along its bend (curveTubeField), with a core shadow above the lower edge and a bounce
     light from the bib along that edge. It used to be two flat planes clamped to one tone.
   - **Paw**: designed in values.
     - the back of the hand in half light, with its lit plane toward the handle (toward the light)
     - three knuckles, each with a lit cap
     - dark grooves between the fingers
     - the fingertips curling over the barrel's far edge in shadow
     - no fur clusters (it is too small for texture)
   - **The chest inside the elbow's crook** is dimmed by 16%, so the arm reads in front of it.
2. **Focal order** (`focalMap`). It is a weight per pixel, read from the materials and the light BEFORE any texture.
   - Full weight within 5 px of any tone edge or marking edge (terminators, the mask's edges, the tail's rings), and on
     the face (a radius round the eyes and muzzle).
   - Low base weight on broad planes: head 0.3, tail 0.25, arms 0.15, body 0.1.
   - Edge strength is capped by part: the body 0.5, the arms 0.55.
   - The mask interior gets almost nothing (it is near-solid now). Deep shadow (value under 0.3) gets 15%.
   - The weight decides how many clusters there are (by hash), how strong they are, and how long they are.
3. **Fewer, wider tone steps.** Coat 15 → 8 tones, cream 10 → 6, brow 10 → 6, mask 7 → 4, rubber 8 → 6. Fur bands are
   now about 0.12 wide. The clusters were raised to about +0.12, so every clump is one clean step and survives 1x.
4. **The nose is crisp.** Four designed planes:
   - a dark leather mass (0.24)
   - a lit top plane (0.63)
   - a lighter top-left facet (0.8)
   - a 1-px reflected line along the underside
   The 2x2 glint is kept. There is no gloss gradient.
5. **The pump showpiece is kept as it was** (chrome profile, ribs, pinstripes, gauge dial).
6. **Scarf knit**: stitches are now 4 x 5, and the knit fades to 30% in the shadow.

## Final recipe for "the most detail that reads"
1. **Draw the light first, by hand.** One curved, hand-placed shadow shape per mass, set as values: snout, paw,
   forearm, head, body. Never take a threshold of a smooth field as the drawing. Texture comes after and cannot rescue
   the construction.
2. **Texture goes into the value grid, before quantization.** Fur is clumps of 2 or 3 adjacent strands along a flow
   field, with a dark strand on the side away from the light. Clusters tile (later ones overwrite), so the texture is
   always inside the form's light.
3. **Focal order decides where the detail goes.** Full at the face and within ~5 px of terminators and marking edges.
   Thin on broad lit planes. Almost none inside the mask and in deep shadow.
4. **Wide tone steps.** About 6 to 8 tones per organic material (bands ~0.12), so every clump is one visible step at 1x.
   Man-made objects (the pump) may keep long ramps and full detail, because crisp detail is what makes a material.
5. **Material rules on props.**
   - Chrome is a fixed pattern of light and dark reflections across the tube, not normal lit shading.
   - Rubber gets ribs; painted metal keeps a smooth tube, one streak and pinstripes.
   - The gauge is built like a dial: bezel, face, ticks, red zone, needle, glare.
   - Knit is a stitch tile, faded in the shadow.
6. **Accents last, few and designed**: eye glints, the nose's planes and glint, claw tips, whisker pads.

## Remaining weaknesses
- The construction under the body is still pass 0's: the arm still wraps round a triangle of bib, and the paw is
  better shaded but its silhouette is still the old blob.
- The lower body and bib are now calm but a bit empty. They could take one designed fold or tuft group in the light.
- The scarf knit reads more as wool mottling than as stitches at 1x.
- The tail's shadow side is flat between the rings.
- Pixelcheck still flags nubs and strips along the silhouette. These come from the shared silhouette clean-up, and the
  fur tufts make them worse.
