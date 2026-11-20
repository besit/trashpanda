# Painter, round 05: appeal and focus

Base: round 04. These are the critic's top 6 fixes. As the coordinator asked, the face pass is done **with light**: no new
outlined parts. Source: `variants/r05.mjs` = `tools/sprites/portraits_next.mjs`.

## 1. The faces, done with light
- **The raccoon's eye is a lit wet sphere.**
  - The iris is about 18% larger, with a dark limbal ring (`<`).
  - The iris glows on the side away from the catchlight: a `{` / `}` crescent at the lower right, light passing through
    the cornea.
  - The upper lid casts its shadow across the top of the eye (kept). The heavy lid shape still sets the smug half-lid.
  - A crisp 2x2 catchlight sits at the upper left where the light hits, with a 1-px secondary (`` ` ``) and a thin lit
    lower lid (`%`).
- **Brows.** Asymmetric: the near brow 2.6 units higher (cocky), the far brow 1.5 lower. They have their own material
  ramp topping at `W`, so the white brow stripes are the brightest value on the figure.
- **The smirk.** A small cheek-bulge dome in the head's light field where the smirk tucks up, and a 1 to 2 px dimple
  crease at the corner.
- **Mask edge.** 6 lit cream fur wedges break the edge round the eyes.
- **The muzzle top.** A crisp lit plane (a designed light shape) against the side plane.
- **Dog.**
  - The patch eye is larger (8.4 x 5.4, iris 4.3), with the same glow crescent, a 2x2 catchlight and a secondary.
  - The teeth are lit by the same light: a new top tone `W`, and a designed light shape on the middle lower teeth, which
    face the light. The corners stay grey in the cheeks' shadow, and the upper lip's shadow stays on the top row.
  - The nose stays the darkest dark, with one sharp 2x2 highlight and a faint reflected light along its underside.

## 2. Light falls off toward the bottom
- **Raccoon.**
  - Below y 132, the value of the body, tail, forearm and paw drops gradually, up to 22% at the bottom.
  - The stacked strips under the forearm are merged into ONE shadow shape: the body's shadow plane now takes everything
    below the forearm.
  - Result: the face is the peak, and the lower half is subdued and cooler (ref 03's lesson).
- **Dog.** The suit's lower part drops up to 24%. The jowl underside was already in the far-side shadow.

## 3. Hand-placed tufts instead of a sawtooth
- **Tail.** A smooth tube plus 6 hand-placed hooks on the outer curve, of varied size (big, small, medium, a pair,
  medium). Each one curves along the growth direction toward the tip. A new `hook()` helper builds them.
- **The bottom edge.** A smooth belly plus 5 hooks: a pair clustered at the middle-left, and the outer ones curving
  outward.

## 4. The scarf
- **The far end** is a tapered hanging end that flicks outward, with one fold (a designed crease) and 4 fringe strands
  slanting out.
- **The loop under the pump.** The head's ragged cast shadow no longer falls on it. Instead it gets one smooth designed
  shadow shape under the chin, its lit top plane above that, and the lower edge in shadow, so the top edge is smooth.

## 5. Dog simplified
- **Near jowl.** The extra near-jowl shadow shape is gone, so the jowl has one groove (the smile line) with its lit lip.
- **Forehead.** One fold; together with the hair's shadow line that makes 2 lines.
- **Far jowl.** Its crease now starts lower, so no "pimple" dot.

## 6. Character beats and clean-up
- **Silhouette beats.** A nick in the far ear (a street raccoon), whose tufts are off so the notch stays crisp. The near
  ear is angled back 8 degrees (attitude). The scarf end flicks outward.
- **pixelcheck.** Raccoon 5 orphans and 3 jaggies; dog 1 and 1. The remaining nubs and strips are the whiskers, the hose
  and the chin tuft.

## Kept
- The light design: one light side and one shadow side, the terminators, no rim.
- The coat-tan forearm with its lit edge and cast shadow on the cream bib, and the paw grip.
- The tail's bulk and C-curl, and its bowed rings.
- The coat's shadow hues.
- Dog's far-side plane with its form-following edge, the cheek lens, the hair specular, the wink, the heart patch, the
  red tie.
- The yellow pump with its short streak.

## Checks
- Game: portraits.mjs, `src/` and draw2d are untouched, and the game portraits render. The light2d test image has the
  same md5.
- Palette: no new keys this round.

## Next
- Dog's patch-eye catchlight is small at k = 1.5 under the heavy lid. It could sit a pixel lower, or the lid open a
  touch.
- The raccoon's lower body is now quite dark and flat. One soft lit shape on the near belly edge might give it form
  without competing with the face.
- The mask-edge wedges read a little like stitches at 4x. Vary their length more.
