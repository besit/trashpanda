# Drawer 08 (final): two dog polish items and a tidy

Sheet: `tools/scratch/piter/iter_08.png`. Snapshot: `art/history/portraits_2d/v09`. Only `tools/sprites/portraits.mjs`.
Nothing else changed: the raccoon ships as is, and the dog's ears, hair, outline, expressions, jowl crescents and size are untouched.

## Dog Fjord
1. **No gum bar.** The far lip-pad edge was a straight 2-px P stroke right above the teeth. It is now a short tapered P
   sliver (3D-grid x 99-121.5), pointed at both ends, which bends to follow the flew line and rises toward the far corner. It is the same for the
   laugh, and is still skipped for the shock.
2. **Left side decluttered.**
   - The left outer fold is deleted, mirroring the right, so the left reads as one crease plus the light wedge.
   - The lit M wedge now starts from nothing at the brow line (3D-grid y ~81, canvas ~79). It widens to ~11 at the cheek and ends above the jowl crescent, so it no longer runs up the contour as a band.

## Checks
- All three expressions at k = 1.5: no tone crosses the mouth. The sliver reads as the lip's lower edge, not gum.
- 112 x 100 (1x and 2x): grin, laugh and shock read as before. The ears are points at the top corners and the face has no seam.
- `portraitsPreview()` runs: 6 frames (three 232x208, three 112x100).

## Tidy (no visual change)
- I checked every helper and constant in `portraits.mjs` for use (`lerp`, `T`/`B`/`Cv`/`E`, `px`, `hy`, `fist`, `tube`, ...). All are used, and there is no debug code.
- Comments updated to describe the final drawings: the raccoon's section header (bust inside the frame, tube arms, tail) and the dog's header (compact pompadour, corner ears). Two stale notes were fixed: the "second fold" in the crease comment and the old lip-pad description.
- `tools/lib/draw2d.mjs`: the only addition across the loop is `tube()` (backwards compatible, used by the tail and arms).
- The scratch scripts I used (trace, zoom, grid renders) live in my scratchpad, not in the repo.
