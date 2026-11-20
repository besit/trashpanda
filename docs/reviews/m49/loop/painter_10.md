# Painter, round 10 (final): the head fur pass, and the hand-off

`tools/sprites/portraits_next.mjs` is the final M4.9 version (source `variants/r10.mjs`). It renders as `iter_10*.png`.
Snapshot: `portraits_2d/v30`, "M4.9 round 10: final (head fur pass, done with light)". Annotate PNGs re-exported.

## 1. The fur pass, ported to the raccoon's head only
- **Where.** The work area is the `head` and both ears: the crown's light edge, the white brow bands, the mask's upper
  and lower edges, the forehead stripe, the ears. Nothing on the snout, forearm, paw, body, tail or scarf.
- **How, with light.** `furBreak` acts only at tone boundaries:
  - within each ramp (coat, cream, brow), the lighter tone pokes 2 to 4 px strands into the shadow side, and the darker
    tone into the lit side;
  - across the markings, the cream and brows break into the coat and mask, the coat into the cream and stripe, and the
    mask and stripe into the coat;
  - every strand follows `headFlow`.
- **Calm zones.** Both eyes with their lids, the nose and the smirk are even-odd holes in the work area. A ~4 px band
  round the pump's barrel, caps and rod is also calm: any strand that lands within it is reverted (scaled with k).
- **Density.** 100% at k = 1.5, 60% at k = 1, none below k = 0.9. The raccoon's small sizes are pixel-identical to
  iter_09.
- **Deterministic.** Fixed seeds (300 to 362), so every render and the later game build are identical.
- **Footprint.** 1,573 pixels on the k = 1.5 raccoon and 640 at k = 1.
- **One side effect.** The old hand fix on the far ear's corner was removed: the ear strands changed that spot, and the
  generic clean-up already leaves it clean.

**Before/after at 2x:** `iter_10_head_compare.png` (left iter_09, right iter_10). The crown, brow bands, mask edges and
ear rims now break into fur. The eyes, nose, smirk and the cheek beside the barrel stay calm.

## 2. Verification
- **pixelcheck, raccoon:**
  - k = 1.5: 0 jaggies. The 1 orphan at (255,109) is the eye's secondary catchlight (kept), and the 1 hole at (307,143)
    is the whisker.
  - k = 1: clean.
- **pixelcheck, dog:** clean in grin, laugh and shock.
- **Placement.**
  - No strand lands on the lids, which are inside the eye calm zones.
  - None lands on the pump: the calm band reverts them and furBreak never leaves the head's parts.
  - None lands on the scarf, which is not in the work area.
- **Values view** (`iter_10_values.png`): the same structure as iter_09. One light side and one shadow side, and the face
  is the peak. The fur only breaks existing boundaries.
- **VERSUS** (`iter_10_versus_1x.png`, `_2x.png`, `_values.png`): still one style. Both figures are lit from the upper
  left, with the same 1-px outline and the same darkest darks. The raccoon's head is a touch furrier, without new value
  shapes.

## 3. The dog
No change. All three expressions, at k = 1.5, 1 and 112/232, are pixel-identical to iter_09.

## 4. Header and dead code
- **Header.** A new comment at the top of `portraits_next.mjs` says it is the M4.9 version. It gives Ivan's notes
  ("drawing from shades, not from shapes"; raccoon iter_02's pose with the yellow straight pump; Dog Fjord iter_01's
  minimalism on iter_04's head) and the method (material silhouettes, ONE light map with designed terminators, cast
  shadows instead of outlines, materials quantized onto hue-shifted ramps, accents last).
- **Dead code removed:**
  - the variant switch `V` and its last use in the suit outline;
  - the unused `bounce` helper and the `shadow` option of `form`;
  - `HF` / `wristF` (the far paw is gone);
  - `outer`, `lift`, `tailPrims`, `mt` and `chinY`.
- **No pixel change, confirmed.** Before and after the clean-up I compared 12 renders: the raccoon at k 1.5, 1 and
  112/232, and the dog in grin, laugh and shock at the same three sizes. 0 pixels differ.

## Checks
- Game: `tools/sprites/portraits.mjs`, `src/` and draw2d are untouched, and the game portraits render. Nothing was
  built (no build-assets) and nothing committed.
- light2d: backwards compatible. The light test image has the same md5.
- Palette: additions only.
