# Painter, round 01: painting with light (exploration)

## The change in method
The old code built every part as its own flat shape and shaded each one separately. All three variants now share one pipeline:

1. **Lay in silhouettes that hold MATERIALS.** Each part's pixels hold a material name (`fur`, `white`, `mask`, `furD`, `paw`,
   `yel`, `chrome`, `rubber`, `scarf`, `black`, `skin`, `patch`, `hair`, `teeth`, `suit`, `shirt`, `tie`...), not a colour. No outlines inside
   the figure. Markings like the mask, brows, stripe, tail rings and Dog's patch are just local colour.
2. **Build ONE value map for the whole picture** (0 dark .. 1 light, light from the upper left). It contains the lit forms, the
   designed cast shadows (head on scarf, chest and arms; scarf on chest; arms on body; pump on body; paws on pump; snout on
   chin; nose on muzzle; hair on forehead; jowls on collar; upper lip on teeth), the creases (three per paw, Dog's jowl and brow
   folds) and the sockets.
3. **Quantize at the end.** `paintLight` puts every material onto its own ramp using that same light. A shadow therefore
   crosses fur, scarf and pump consistently, and parts are separated by light and cast shadow, not by lines.
4. **Details last**: eyes, the nose shine, the smirk crease, the gauge face, whiskers. Then one silhouette line outside the
   figure (dark on the shadow side, soft or none on the lit side).

The variants differ only in how step 2 renders the light.

| | how the light is rendered | read |
|---|---|---|
| **a VOLUME** (picked) | each mass is a lit volume (`lightField` inflates the silhouette, with prims for snout, cheeks, cranium, muzzle and jowls, and height bumps for brow ridges, sockets and grooves); 5 flat bands with a thin dither strip; `tubeField` for the pump; designed cast shadows on top | the dog is a convincing lit volume (jowl grooves come from the light, not from drawn lines); the raccoon's head has a real brow ridge and socket |
| **b CEL** | no volume at all: a flat lit base, a shadow crescent on the side of each form that turns away from the light, hand-drawn shadow shapes (raccoon's body side, Dog's jowls and far cheek plane), hard edges, 3 tones + an accent | the cleanest and most "pixel-art game" look (refs 04 and 05); the raccoon is very readable; the dog is flatter and its folds are drawn lines again |
| **c RICH** | a's volumes with 6 to 9-step ramps, wide dither strips, a rim light and a bounce light, fur breaks at every tone edge | more texture, but grainy (145 orphans on the dog) and closest to the airbrushed "blobby" look Ivan rejected |

**Why a:** it is the only variant where both characters read as lit 3D forms in the values view and still stay flat-banded and
graphic. Dog Fjord in a keeps iter_01's minimal look (big pink volume, few accents) and adds real form. b's raccoon is a strong
runner-up. If the critic prefers its clarity, the cel route is one constant away (`V = 'b'`), and a's raccoon could borrow b's
hard edges (strip 0) and designed body shadow.

## Raccoon (all variants)
- iter_02's pose and vibe: the green scarf with the end flung over the far shoulder, the warm taupe coat, the smirk and the
  bandit mask, facing right.
- The pump is **yellow** (`|  o  ¥  y  Y`) and **straight** (one axis, `at(s, o)`). It is lowered and less steep (foot (170,170),
  top (42,62)) so the barrel crosses the lower cheek and chin, not the mask or the face.
- Paws: each is one lit mass (with knuckle domes) wrapping the barrel, plus three dark creases. No outlined fingers.
- Forearms are a darker local colour (`furD`), like a real raccoon's limbs. That is what makes the near arm read against the
  chest by value alone.
- The figure stays inside the frame with a tufted, finished bottom.

## Dog Fjord (all variants)
- M4.7 iter_04's head outline, ears and swept hair, and M4.8 iter_01's build (navy suit, white shirt, red tie, wink, heart
  patch eye, big black nose, crescent grin).
- Grooves (forehead folds, jowl creases, chin fold) are height in the light field: "a dark crease with a lit lip below" comes
  for free. Hair strands are ridges that catch the light.
- grin, laugh and shock all render. The 112 x 100 portraits read (overview row 2).

## Toolkit additions (backwards compatible; the game's portraits.mjs is untouched and still renders)
`tools/lib/light2d.mjs`:
- `values`, `lightField(v, on, {mass, ...})`, `valueShape`, `crescentValue`, `castValue`, `valueLine`, `paintLight`: the
  value-map x material-map pipeline.
- `tubeField`: analytic cylinder light for straight tubes. Inflating a long diagonal silhouette made a staircase ladder of
  bands on the barrel.
- `mass` / `front`: the parts in front of a form join its silhouette, so a pump or paw no longer punches a hole the volume
  turns round, or that a cel crescent wraps.
- `cleanSilhouette`: fills 1-px holes and drops nubs after `silhouette()`. Raccoon holes went from 34 to 2.
- `shadeForm` was refactored onto a shared `formLight`; its output is verified pixel-identical (lighttest.png has the same md5).

`tools/palette.mjs`: one new key, `'¥': '#ea9526'`, a warm ochre step between `o` and `y` for the yellow pump.

## Known issues / next
- The raccoon is darker overall than iter_02. The lower torso is still mid-dark and busy, and the bib is mostly hidden by the
  near paw. Lift the torso, and maybe bring back a clear cream chest between the scarf and the forearm.
- The paws still read a bit like mittens: try a visible thumb mass on the near paw and a stronger knuckle light.
- Raccoon: 24 orphans and 13 jaggies, mostly the fur breaks on the head and tail and the smirk stroke. Clean them once the
  direction is fixed. The remaining nubs and strips are the whiskers and the hose.
- Dog (a): the laugh mouth interior and tongue could use one more designed shadow under the upper teeth. The navy suit's
  dither strip shows as a checker in the shadow, so consider strip 0 on cloth.
- The scarf has no knit texture yet (restraint); a few stitch accents only where the light hits might help.

Files: `variants/r01_{a,b,c}.mjs` + `.png/_hero/_values/_favs`, `iter_01*.png`, snapshots `portraits_2d/v21` and
`portraits_2d_explore/v10` (a), `v11` (b), `v12` (c), annotate PNGs exported.
