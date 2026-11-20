# Drawer 09: a pixel of skin between the near eye and the nose at 112

Sheet: `tools/scratch/piter/iter_09.png`. Snapshot: `art/history/portraits_2d/v10`. Only `tools/sprites/portraits.mjs`.

## The bug (from the real game)
In the intro cutscene (`tools/scratch/m47/06_dialogue_portrait.png`, the 112x100 'laugh' portrait shown 2x), the near
eye's closed arc sat directly on the nose's top edge. At 0.53 px per design unit, the arc (2 px thick, its ends at NY+2) touched the
nose top (3D-grid y ~97). The eye and the nose fused into one black blob that read as a strange nose.

## The fix (small k only)
- At k < 0.8 the near eye and its brow are drawn 2.5 design units higher: `ny = NY - 2.5`, used for every near-eye mark (laugh's ^ arc, the grin's wink arc, its lash tick and squint crease, the shock's round eye) and for the near brow.
- The brows' existing small-k lift (`bs`) stays on top of that, so the gap between the wink and its brow is kept.
- k = 1.5 and k = 1 are unchanged (`ny === NY` there). The far (patch) eye didn't need it: it sits higher on the face and away from the nose.

## Checks at 112 (1x, zoomed crops and 2x)
- **laugh:** ~2 px of skin between the ^ arc and the nose. The eye reads as a squeezed-shut eye, not part of the nose.
- **grin:** the wink arc and its pink squint crease sit above the nose with ≥1 px of skin. The wink and its brow are 2 px apart.
- **shock:** the round eye's bottom outline is 1 px clear of the nose top.
- The k = 1.5 posters and the k = 1 row on the sheet look the same as iter_08.
