# Painter, round 04: refinement

The base is round 03 (designed light). These are the critic's top 6 fixes. Source: `variants/r04.mjs` =
`tools/sprites/portraits_next.mjs`.

1. **The dashed rim is gone** on both characters (`rimPaint` is no longer called). Reflected light now appears only as a
   band inside a shadow, one step lighter, in the same hue family, with no gaps:
   - on the tail's underside: `ª` lifts to `%`;
   - under Dog's jowls: `»` lifts to `°`.

   A new `maxV` option on light2d `crescentValue` keeps the lift inside the shadow.
2. **The tail is thick and bushy again.** It uses round 02's C-curl:
   - width 20 to 27 design units (about 35 px at the base on the poster), tapering only to about 60%;
   - a soft point over the last 15%;
   - 4 rings that bow with the cylinder, plus a dark last ring at the tip;
   - tufts on the outer curve only, irregular (jitter 0.8, some skipped), with the inner curve smooth;
   - the terminator still runs along the underside.
3. **Arm and bib are separated again.**
   - The forearm and paw are coat tan: their light is capped at `J`, one group below the cream `+` bib.
   - The lit top edge is `®`, and the crisp cast shadow falls on the bib in `²`.
   - The paw (round 03's grip construction, unchanged) is tan with lit knuckle domes, 2 creases and its underside in
     shadow. It reads in the values view.
   - The far arm now ends at the elbow under the scarf end, so there is no second "pump rod". The scarf's fringe went
     with it, because it was left hanging in the air.
4. **The coat's shadow hue moved back toward the coat.** New keys: plane `ª` #7a5f66 and core `º` #584452, about a
   25-degree shift instead of 60. The belly reads as tan fur in shadow.
   - The body's shadow plane is flattened to one or two tones (squash 0.2 + 0.2v), with a thin glow band.
   - The edge is one designed curve, with 3 lit `J` wedges interlocking downward across it.
   - Arm tufts are off, so the bottom edge keeps only the 6 deliberate tufts.
5. **Dog's far side reads as SHADOW.**
   - New key `»` #c27585, a rose-mauve about 1.5 value groups below the lit `Q`. `³` is retired.
   - The edge follows the form: it tucks in under the brow and the patch, swells round the cheek ball, then sweeps under
     the jowls across to the near side. It is ONE shape wrapping the right side and the underside.
   - The plane is flat (squash 0.3 + 0.06v), so there is no lighter inner stripe and no uniform seam.
   - The red-pink `9` glow is a hand-drawn lens, widest (2 units) at the cheek ball and vanishing toward the brow and the
     jaw.
   - The far ear is in the same shadow.
   - The cheek "pimple" is gone: the far jowl crease now starts lower.
6. **Accents and clean-up.**
   - The barrel's specular is a short 2-px streak on the lit upper third, not a full-length scratch.
   - A final `despeckle` runs after the whiskers.
   - pixelcheck: raccoon 9 orphans and 4 jaggies (the jaggies are the lit-side `$` outline on the left ear and head
     contour); dog 1 orphan and 2 jaggies. The remaining nubs and strips are the whiskers, the hose and the chin tuft.

## Kept
- The head lighting: warm tan crown, dark stripe, fur wedges, cream lower-face light shape, mask, eyes, nose glint,
  smirk.
- The R 12 body planes and the hand-placed terminators.
- Dog's lit side, cheek-top highlight, hair specular, and grin.
- The yellow pump, the light-grey gauge, and the method: material map x value map, hard bands, no dither, no internal
  outlines.

## Compared with iter_02 and iter_03
- **Arm:** back to round 02's clean coat-tan forearm against the cream bib, with round 03's better paw grip.
- **Head:** round 03's head is kept.
- **Tail:** about round 02's bulk, with designed tufts and a soft pointed tip instead of round 03's twig.
- **Dog:** round 03's bold plane, now a real shadow with a form-following edge.

## Checks
- Game: portraits.mjs, `src/` and draw2d are untouched, and the game portraits render. The light2d test image has the
  same md5.
- Palette: new keys only (`ª º »`).

## Next
- The tail's outer tufts are still a little regular. Hand-placed tufts would beat the tufted() rhythm.
- The lower body under the paw has a few tan specks from the bib's tufted bottom edge.
- The 4 lit-side outline jaggies on the ear and head contour.
