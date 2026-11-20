# Artist, round 10 (final polish)

Files:
- `tools/sprites/portraits.mjs`. Rendered as `iter_10.png` / `iter_10_hero.png`; snapshot `portraits_2d/v20` ("M4.8 round 10: polish").
- Backup of round 09: `variants/r09_backup_portraits.mjs`. The hygiene script: `edit_r10_hygiene.cjs`.
- Regression grid (05 | 07 / 08 | 10): `cmp57810.png` (a scratch comparison, not kept).

No new features, no shape changes, no palette changes.

## The polish list
1. **Orphans and specks:** the existing despeckle passes cover the raccoon (the head strands, the body, the final pass before the outline) and the dog's skin. I inspected the close-ups (the mask and forehead strand ends, the ruff tips, the tail tip, the flew pores): no single stray pixels found.
2. **Whiskers at k = 1:** connected 1 px stair-step lines past the snout, no floating pixels. Not shortened.
3. **Banding:** the dog's near-cheek peach highlight had a hard lower edge. It now softens into the lit plane through one intermediate tone (the existing `M`) on its lower edge only, at 1.5 and 1 (not at 112). The jaw core shadow, jowl sag rims, belly shadow, tail rings and cap brim show no stair-step bands.
4. **Every view at every size:** the raccoon at 1.5 and 1; the dog's grin, laugh and shock at 1.5, 1 and 112 (1x and the 2x cutscene view). The eyes, nose and mouth are distinct; nothing merges.
5. **Frame and transparency:** the bounding boxes were measured.
   - The raccoon's hose touched the bottom row, which clipped its outline there. I raised the hose 2.4 design units; the raccoon now ends 2 px (k = 1.5) / 1 px (k = 1) above the bottom edge.
   - Only the dog's suit reaches the bottom edge (the bust crop, as always). Nothing touches the sides or top.
   - Nothing dark lies outside the silhouettes (the floor shadows went in round 09); the whisker tips past the snout are intentional light pixels.
6. **The pump:** unchanged. One vertical axis, the T-bar perpendicular, only the hose curves.
7. **Regression side-by-side against 05, 07 and 08:** round 10 is round 09/08 plus the polish. The dog keeps 08's appeal (the confident crescent, round 05's read, on the clean pink). The raccoon keeps 07/08's gains.
8. **Code hygiene:**
   - **Exports and signatures intact:** `GW = 232`, `GH = 208`, `raccoonPortrait2d(expr = 'smirk', k = 1)`, `dogPortrait2d(expr = 'grin', k = 1)`, `portraitsPreview()`; the build-script import check prints `ok`.
   - **A new M4.8 header** with Ivan's notes and the drawing approach in a few lines.
   - **Variant-era comments removed** ("round 01 A's drawing", "b, c lose it", "round 01's design units").
   - **Dead code removed:** the unused `nx0`/`ny0`, `ACC.head`, and the scarf-green clause in the outline picker. No unused helpers remain: `lerp` is gone, and every `const f = (` and `function` is used.
   - **The hygiene edits change 0 pixels** across 9 views (round 09 vs round 10 before the two polish fixes).
   - **`tools/palette.mjs` vs git HEAD:** only added lines (0 removed or changed lines); no original key changed.
   - **`tools/lib/draw2d.mjs` is backwards compatible.** `tools/sprites/portraits.mjs` is the only file that imports draw2d (`grep` over `tools` and `src`). To prove compatibility I rendered **git HEAD's portraits.mjs** (the M4.7 drawing) twice: with HEAD's draw2d + raster + palette, and with today's draw2d + palette. Over 12 images (raccoon and the dog's three expressions at k = 1.5, 1 and 112/232; 672,128 pixels) **0 pixels differ** (compared by RGB). The check lives in `headcheck/`.
9. **The snapshot:** `portraits_2d/v20`, "M4.8 round 10: polish".

## The loop in one line
Raccoon 4.0 → 7.0, Dog Fjord 3.5 → 6.5 (judge scale: ref 03 = 9 to 10).
