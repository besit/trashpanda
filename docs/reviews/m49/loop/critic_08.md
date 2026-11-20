# Critic, round 08 (low-risk items + VERSUS pairing check)

Looked at: `iter_08{,_hero,_values}.png`, `iter_08_versus_1x.png` (purple), `iter_08_versus_2x.png` (red),
`iter_08_versus_values.png`, `painter_08.md`, crops of the k = 1.5 laugh and shock, of the small row (raccoon k = 1, the
dog at k = 1 and at 112 x 100 in all three expressions) and of the raccoon's paw. pixelcheck on the raccoon and on all
three dog expressions (`pc08/`).

Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are unchanged; no new palette keys.

## Scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | raccoon | Dog grin | Dog laugh | Dog shock |
|---|---|---|---|---|
| baseline (round 00) | 4.5 | 4.5 | | |
| Ivan's favourites | 5 (iter_02) | 5.5 (iter_01) | | |
| round 07 | 7.0 | 7.5 | 7.5 | 7.0 |
| **round 08** | **7.0** | **7.5** | **7.5** | **7.5** |

## Regressions
**None.** Everything frozen stayed frozen:
- the raccoon's face, eyes, glints, body light, tail, scarf and pump;
- the dog's grin;
- the laugh's cavity, tongue and cheeks.

The eye's secondary catchlight at (255,109) that pixelcheck lists as an "orphan" is correct: keep it.

## The 5 items
1. **The shock's eyes are seated.** The lid and brow shadow over the top of each white and a top-arc lid line take
   away the sticker read, and the wide-eyed shock survives at 112. The shock is now at the grin's level.
2. **The laugh's cheek** is down to one crease with its lit lip, and the squint and pushed-up cheeks are kept.
3. **The paw:** no cream sliver; the grip reads cleanly.
4. **pixelcheck:** the dog is clean in all three expressions (the jaggy at (106,82) from round 02 is finally gone). The
   raccoon has 1 jaggy at (173,41) on the far ear's rim, plus the whisker hole at (307,143): acceptable.
5. **The VERSUS pairing:**
   - In greys the pair reads as one style: one light from the upper left, shadow planes on the right of both, the same
     deep `@` for the darkest darks (the mask and nose vs the dog's nose and brows), the same outline logic, and both
     faces as the contrast peaks.
   - On purple both read well. On red the dog's lit pink reads clearly, and his rose-mauve shadow side sits closer to
     the red. But the dark outline holds the silhouette, so it is acceptable and not worth a change this late.

## Round 09: nothing, go straight to polish
The pictures are done for this loop. Any further "improvement" risks the coherence we now have. Round 09 can be
skipped or used as a no-change verification.

**Round 10, polish only (2 tiny items, no other changes):**
1. **The barrel's specular** reads as a broken, dashed white line (the stripe breaks into dots along the upper barrel,
   which shows on the VERSUS 2x). Make it one solid 1 to 2 px streak, about a third of the barrel long, on the lit upper
   part.
2. **The jaggy at (173,41)** on the far ear's rim: remove the corner pixel.

Then the final snapshot and the annotate exports (`raccoon.png`, `dog_grin.png`).

## Where the loop ends up
- Raccoon: 4.5 → 7.0. Dog: 4.5 → 7.5 in all three expressions.
- Both are now above Ivan's favourites (5 / 5.5), on the scale where ref 04 = 7.5.
- Ivan's main complaint is answered: nothing reads as assembled parts any more. The arms, paws, nose, ears, tail and
  pump are all separated by light, cast shadow and value, not by outlines. The values view shows one lit figure each,
  with the face as the peak.
- The iter_02 pose and vibe and the iter_01 minimal dog are kept.

The honest gap to ref 03 (9.5) is texture craft: ref 03's hand-clustered fur and its painterly richness. That is a
different, much more labour-intensive rendering, not a fix for this loop.

## Constraint checks (final)

| check | result |
|---|---|
| Pump yellow, straight (one axis); face clear | pass |
| Raccoon faces right, smirk, mask, white brows; inside 232x208, finished bottom | pass |
| Raccoon at k = 1 | pass |
| Dog head shape, low ears, compact swept hair | pass |
| Dog traits (wink, heart patch, big nose, grin, navy suit, white shirt, red tie) | pass |
| grin / laugh / shock at 112 x 100 | pass, all three read |
| No real-person likeness | pass (a cartoon bulldog; no flag pin, red tie) |
| Game untouched; palette additions only; draw2d untouched; light2d backwards compatible (same md5 test) | pass |

## Keep, don't touch
Everything, apart from the 2 polish items above.
