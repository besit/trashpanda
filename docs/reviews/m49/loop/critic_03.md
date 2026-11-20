# Critic, round 03 (light-design pass on r02_a)

Looked at: `iter_03{,_hero,_values,_favs}.png`, `painter_03.md`, 4x crops of the raccoon's arm, belly and tail and of
the dog's far side, and pixelcheck (`pc03/`).

Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are unchanged. `palette.mjs` only adds keys
(`¥ µ ¶ © ® ² ³ ¹ ¼ ½`).

Art coordinates are in the k = 1.5 picture (348 x 312).

## Scores (fixed scale: ref 03 = 9.5)

| | raccoon | Dog Fjord |
|---|---|---|
| baseline (r00) | 4.5 | 4.5 |
| Ivan's favourites | 5 (iter_02) | 5.5 (iter_01) |
| round 02 (a) | 5.5 | 6.0 |
| **round 03** | **5.5** | **6.5** |

## Overall: light-driven painting or assembled shapes?

**Light-driven, and for the first time it is designed.** In the values view each figure now has one light side and
one shadow side:
- the raccoon's head, body and tail all turn on the right;
- the dog's head is lit left and shadowed right as one graphic plane, and that still reads at 112 x 100.

The warm/cool palette works for the raccoon's head: the warm tan crown, the cool lilac on the cream in shadow. This is
the most "professional" the pair has looked.

The dog gains a full point. The raccoon gains in the head and loses in the body, so it nets zero. Four things now hold
the pair back. Three of them are new this round, so they are cheap to fix:

1. **The rim reads as a halo or cut-out.** The 1-px `½` (#b4b6d2) dashes run along the silhouette outside the dark
   line. They are much lighter than the shadow they sit on, so they read as a pale dotted outline: a sticker look. It
   shows on the raccoon's lower body, the tail, the scarf end, and on the dog's jowl, ear and suit shoulder. At 1x in
   the overview it is visible noise. Agreed with the coordinator: it has to go in its current form.
2. **The tail regressed.** Round 02's chunky tail became a thin, twiggy, ragged rod (it tapers to about 30%) with a
   hooked tip. Raccoon tails are thick and bushy, and the tail is a big part of the silhouette's appeal.
3. **The arm and the bib merged.** The forearm is now cream, the same as the bib, so in the values view the arm, the
   bib and the paw are one pale lump. The paw on the barrel (art ~(150 to 180, 150 to 170)) has disappeared. Round 02
   got the arm right because the forearm was *coat* tan against a *cream* bib. The far forearm (art ~(210 to 245, 170
   to 195)) is now a thin tan stick between the gauge and the hose, and reads as a second pump rod.
4. **The shadow hues jump too far, so the shadows read as a different material.**
   - The raccoon's coat shadow `¶` #6e5272 is a saturated purple next to a warm tan. The body reads as tan fur over
     purple cloth.
   - The dog's `³` #b06a8c is mauve-purple, close in value to the lit `Q`.

## The dog's far-side mauve: stain or shadow?

**Currently more stain than shadow.** Reasons, in order:
- **The hue changes more than the value.** Pink to purple at a small value step reads as local colour, a birthmark or
  side panel, not as light turning away.
- **The terminator is too straight and parallel to the silhouette.** It is a band of constant width from the ear to
  the chin and ignores the form: the brow, the cheek ball, the jowl.
- **There is a lighter stripe running parallel inside the plane** (the reflected-light band) **and a uniform red `9`
  seam along the edge.** Together they make it look like an applied panel with a border.
- **The shadow doesn't wrap underneath.** Light from the upper left means the underside of the jowls should be in the
  same shadow shape, joined to the right side.

The plane itself is the right idea. It needs value over hue, and a form-following edge.

## Ranked fixes for round 04

1. **Remove the dashed rim entirely.** Keep the dark silhouette line. If you want reflected light, make it a band
   *inside* the shadow plane: 2 to 3 px, exactly one step lighter than the shadow, in the same hue family, no gaps, no
   dashes. Use it only on the dog's lower jowl and the raccoon's tail underside. The poster colour already separates
   the silhouettes; the figures don't need a halo.
2. **Rebuild the tail thick and bushy.**
   - Round 02's C-curl behind the body and its width: about 34 to 40 px at the base, tapering only to about 60 to 65%.
   - A full bushy tip: the dark last ring, ending in a soft point. No hook.
   - 4 to 5 rings that bow with the cylinder.
   - 6 to 8 soft tufts on the outer curve only, with the inner curve smooth, not ragged on both sides.
   - Keep the terminator along the underside.
3. **Separate the arm from the bib again, by colour and light.**
   - The forearm and paw are coat tan (`J`), with a lit top edge in `®` 2 to 3 px wide, the underside turning into the
     shadow tone, and a crisp cast shadow on the cream bib in `²`, 3 to 5 px wide.
   - Value target: the forearm one group below the bib and one group above the shadow plane.
   - The paw: tan, with lit knuckle tops in `®`, 2 creases, and the fingertips darkening on the barrel's shadow side.
     It must be visible in the values view.
   - The far forearm: hide it behind the barrel and scarf end, or make it a shadow-plane mass at least 8 px thick with
     only a lit top edge. Not a tan stick.
4. **Pull the coat's shadow hue back toward the coat, and clean the lower body.**
   - Shift `¶` / `µ` (add new keys) toward a warmer violet-brown, roughly a plane ~#7a5f66 and a core ~#584452: a hue
     shift of 20 to 30 degrees, not 60.
   - Test: the shadowed belly must read as "tan fur in shadow".
   - Lower body: the tan streaks inside the shadow plane (art ~(95 to 210, 225 to 290)) make a torn-paper edge. Use one
     clean shadow shape and one lit belly shape. The edge between them is a single designed curve with at most 3 or 4
     interlocking fur wedges pointing down.
   - The bottom edge still has many small notches; keep only the 6 deliberate tufts.
5. **Make the dog's far side read as shadow:**
   - **Value:** the plane sits about 1.5 value groups below the lit `Q`, in a rose-mauve (roughly #c27585, new key) with
     less purple than `³`.
   - **The terminator follows the form:** it tucks in under the brow and the patch, swells out around the cheek ball,
     then sweeps under the jowl and joins the under-jaw shadow. ONE shape wrapping the right side and the underside.
   - **No lighter parallel stripe inside the plane, and no uniform seam.** The red-pink `9` appears only where the
     cheek turns gently: 1 to 2 px, widest at the cheek, fading out toward the forehead and ear.
   - Remove the stray mauve dot at art ~(197,174) on the cheek (it reads as a pimple).
   - The far ear sits in the shadow plane.
6. **Accents and clean-up.**
   - The barrel's specular is a 1-px white line running the full length of the barrel, so it reads as a scratch. Make
     it a short streak (about 1/3 of the barrel) on the lit upper part, 1 to 2 px.
   - pixelcheck, raccoon: 10 orphans ((276,51) (251,61) (109,167) (124,183) (211,189) (63,202) (183,217) (121,234)...)
     and 5 jaggies ((139,29) (132,49) (129,60) ear and head contour, (100,126), (45,263) tail).
   - pixelcheck, dog: 7 orphans ((192,39) (196,40) (230,55) (219,58) hair, (112,90) (98,92) (87,110)) and 4 jaggies
     ((225,81) (228,85) far ear, (106,82), (169,141)).

## Constraint checks

| check | result |
|---|---|
| Pump yellow, straight (one axis) | pass |
| Face clear of the pump | pass |
| Raccoon faces right, smirk, mask, white brows | pass |
| Inside 232x208, finished bottom | pass (the bottom edge is tufted, but see fix 4) |
| Dog head shape (broad round head, low ears, compact swept hair) | pass |
| Dog traits (wink, heart patch, nose, grin, navy suit, white shirt, red tie) | pass |
| No real-person likeness | pass |
| 112 x 100 | pass. The light/shadow split reads even at 1x; the rim dashes are the only noise there |
| Game untouched; palette additions only | pass |

## Keep, don't touch
- **The light design:** one light side and one shadow side per figure; hand-placed terminators; about 35 to 40% in
  shadow; R 12 planes on the body.
- **The dog's single far-side shadow plane** as a concept, with its colour and edge fixed per fix 5. Also: the cheek-top
  highlight shape, the hair's specular streak along the swoop, the nose glint, the grin with the lip shadow on the
  teeth.
- **The raccoon's head:** the warm tan crown with the dark stripe, the lit fur wedges on the crown and temple, the
  cream muzzle with its lilac shadow, the mask, eyes, nose glint, smirk, whiskers.
- **The paw construction** from this round (one mass, 3 knuckles, a merged thumb, a shadow on the barrel). Only its
  colour and value change (fix 3).
- The yellow pump, the light-grey gauge, the scarf with its end in shadow, the matte cream (no white) bib.
- The method: material map x one value map, hard bands, no internal outlines, no dither.
