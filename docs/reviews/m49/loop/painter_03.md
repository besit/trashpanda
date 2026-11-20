# Painter, round 03: designing the light

The base is r02_a (lit volume, hard bands, coat-coloured arms). This round adds a light-design pass, one change per critic
fix. The computed volume is now only the starting value map; the shadow planes, light shapes and accents drawn on top are
the art. Source: `variants/r03.mjs` = `tools/sprites/portraits_next.mjs`.

## 1. Designed light planes (one hand-placed terminator per mass)
New `terminator(v, on, shapes, { squash, band })` in light2d. Inside a hand-drawn shape the value is squashed into the
shadow range (the volume survives only as a faint turn). A band 1 to 1.5 units wide along the terminator gets its own
value (0.5), which the ramps turn into a saturated glow tone.

**Raccoon:**
- **Body and far arm:** `R` dropped from 22 to 12, so the light makes planes instead of rings parallel to the outline.
  The terminator runs from under the scarf end at the far shoulder (152,108) down to the bottom centre (118,188), about
  40% in shadow. The belly is now 2 big shapes: lit tan and violet shadow.
- **Tail:** a real cylinder (`cap` prims along the curve). The terminator follows the underside of the curl (an offset
  of the centre line, built in code).
- **Head:** the far cheek behind the eye and the jaw under the snout turn away. The snout's underside is in shadow.
- **Scarf:** its lower edge and the end over the far shoulder are in shadow.
- **Paw:** the fingers turning over the barrel's edge and the paw's underside are in shadow.

**Dog:**
- **The far-cheek plane:** one terminator from the right ear, down past the patch, to the right of the chin, about a
  third of the head. A red-pink `9` band sits where it turns; the plane itself is cool mauve `³`, with `°` for the
  reflected light.
- **Suit:** the right side and the right lapel are in a shadow plane.
- **Highlight:** one designed light shape on the near cheek top.

## 2. Hue-shifted ramps by thresholds
Ramps are now `tones(key, upper, key, upper, ..., key)`, so every band's width is a decision.

New palette keys (additive only):

| key | colour | role |
|---|---|---|
| `µ` | #4f3c56 | coat shadow core, cool violet-brown |
| `¶` | #6e5272 | coat shadow plane |
| `©` | #a8765e | coat terminator glow, warm rust |
| `®` | #d2b08a | coat light, warm tan |
| `²` | #a49aae | cream fur in shadow, lilac |
| `³` | #b06a8c | Dog's mauve shadow plane |
| `¹` | #232566 | suit shadow, blue-violet |
| `¼` | #5a78b8 | suit light, warm blue |
| `½` | #b4b6d2 | the rim |

Ramps by material:
- **Dog's skin:** lit `Q` (saturated pink, as in variant c) and highlight `/`. `§` and `¤` appear only in creases and cast
  shadows.
- **Cream fur:** matte, tops out at `+`. No white, so the glossy plastic highlight on the bib is gone.

## 3. The rim
New `rimPaint`: a broken 1-px line of `½`, a neutral cool grey-lilac (not poster blue, so it also works on the red
VERSUS half). It runs on the shadow side only (value below 0.42, the silhouette facing down-right), in runs of 5 with
gaps of 4.
- Raccoon: back of the head, far ear, snout, tail underside, scarf end, far arm, body.
- Dog: right jowl and jaw, right ear, the suit's right shoulder.

## 4. The paw as a grip
- One mass: a small wrist, the back of the hand, three rounded knuckles over the barrel, and the thumb merged in as a
  bulge on the handle side (no separate block, no dark line beside the barrel).
- Two creases between the knuckles.
- A shadow on the yellow barrel below the paw.
- The far paw is gone: the far forearm runs behind the barrel.

## 5. Lower body, bottom edge, tail tip
- The bottom edge is 6 deliberate tufts pointing down and outward (sharp blob corners), not a saw. No spikes or patches.
- The tail tapers (to about 30% wide), ends pointing up, has a dark last ring, and two small lit strands at the tip.

## 6. Accents with purpose
- Raccoon:
  - 10 lit fur wedges along the light edge: crown, temple, the near shoulder top (in `®`), and the cheek ruff (in `+`).
  - A sharp 2x2 nose glint with a softer second one, and the eye glints.
  - One `` ` `` streak along the barrel's light stripe, computed from the light direction, and a glint on the chrome
    collar.
  - The cream lower face is held light by one designed light shape, so the face stays the contrast peak.
- Dog: one `W` specular streak along the hair's swoop, the nose glint, and the cheek-top highlight.

## Checks
- **Values view:** one light side and one shadow side for each figure. The raccoon's face (black mask, cream muzzle) is
  the peak. Dog reads as lit left and shadowed right, even at 112 x 100.
- **Against iter_02:** the arm integration did not regress (lit forearm top, crisp cast shadow on the bib). The lower body
  now turns.
- **pixelcheck:** raccoon 10 orphans and 5 jaggies (contour tufts at the ear, plus a few rim and wedge ends); dog 7
  orphans and 4 jaggies. The `@`/`0` near-duplicate is fixed: the dog uses `@` throughout and the raccoon no longer uses
  `0`.
- **Game:** portraits.mjs, `src/` and draw2d are untouched; the game portraits render. The light2d test image has the
  same md5.

## Next
- Dog's shadow plane edge on the forehead and ear is a little straight. Bend the terminator more round the brow.
- The tail tip still reads a bit like a hook at 1x.
- Clean up the last 10 raccoon orphans (rim run ends, wedge tips).
- Possibly a warmer `©` glow along the raccoon's head terminator.
