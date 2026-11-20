# Judge 09: targeted fix, near eye vs nose at 112

I checked iter_09 plus my own crops of all three 112x100 portraits at 1x and at 5x zoom.

## Scores (round 8 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 8 (8) | 7.5 (7.5) |
| Symmetry / structure | 8 (8) | 7.5 (7.5) |
| Silhouette / overall shape | 8 (8) | 7.5 (7.5) |
| 2D pixel-art craft | 8 (8) | 8 (8) |
| Face / expression appeal | 7.5 (7.5) | 7.5 (7.5) |
| Small-size readability | 7.5 (7.5) | 8 (7.5) |
| **Overall** | **8** | **7.5** |

## The fix
The fix is clean in all three expressions.
- **Laugh:** this is the bug case. The ^ arc now has ~2 px of skin above the nose and reads as a squeezed-shut eye at 1x, no longer as part of a strange nose.
- **Grin:** the wink arc and its squint crease clear the nose by ≥1 px, and the wink stays separate from its brow. This also settles the known limit I noted in round 8 (the wink brow and arc nearly touching).
- **Shock:** the round near eye is fully clear of the nose top and reads as an open eye with a pupil.

The 2.5-unit lift does not put the near eye visibly out of line with the patch eye. The 3/4 tilt hides it, and the brows still sit clear of the forehead wrinkles.

**No regression.** The k=1.5 and k=1 portraits match iter_08, and the raccoon is untouched. Small-size readability for the dog goes up half a point, because the real cutscene case now reads.

## Scores by round (overall)

| Round | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 |
|---|---|---|---|---|---|---|---|---|---|---|
| Raccoon | 5.5 | 7 | 7 | 7.5 | 7.5 | 8 | 8 | 8 | 8 | **8** |
| Dog Fjord | 4.5 | 5.5 | 6.5 | 6.5 | 7 | 7 | 7 | 7.5 | 7.5 | **7.5** |

Verdict unchanged: ship both.
