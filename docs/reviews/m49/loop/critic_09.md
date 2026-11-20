# Critic, round 09 (main line with the two polish items; wildcard: a ref-03 fur pass on the raccoon)

Looked at: `iter_09{,_hero,_values}.png`, `variants/r09_w{,_hero,_values}.png`, `painter_09.md`. I also built my own
side-by-side of the raccoon in the main line vs the wildcard: nearest-neighbour downsamples of the heroes to **1x** and
**2x** (poster size), in the scratchpad.

pixelcheck on both raccoons (`pc09/`, `pc09w/`): identical and clean. The only orphan is the eye's secondary
catchlight at (255,109), kept on purpose, and the only hole is the whisker at (307,143); there are no jaggies.

Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are unchanged; no new palette keys.

## Scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | raccoon | Dog grin / laugh / shock |
|---|---|---|
| baseline (round 00) | 4.5 | 4.5 |
| Ivan's favourites | 5 | 5.5 |
| **iter_09 (main line)** | **7.0** | **7.5 / 7.5 / 7.5** |
| **r09_w (wildcard, as is)** | **7.0 to 7.5** (head +0.5, arm edge -) | unchanged |
| r09_w, head only (expected) | **7.5** | unchanged |

Main line: both polish items landed. The barrel's specular is one solid round-ended streak (no more dots), the jaggy at
(173,41) is gone, and the two light specks on the barrel are gone. Nothing regressed; the dog changed 0 pixels.

## The fur pass: what it does at each scale
- **Values view:** the big structure is unchanged. There is one light side and one shadow side, and the face is still
  the peak. The fur only breaks existing boundaries, so it adds texture without new value shapes. This is the right
  way to do texture: "fur only where it explains the form" (brief, point 4).
- **Poster size (2x):**
  - **Head, a clear gain.** The crown's light edge, the lower edges of the white brow bands, the mask's upper and lower
    edges and the forehead stripe now break into fur strands that follow the growth. That is exactly what separates
    ref 03 from a vector cartoon. The raccoon reads as *furry* for the first time, and the eyes, nose and smirk stay
    clean (the calm zones work).
  - **Forearm, a loss.** The lit top edge and the lower edge of the forearm get a row of comb-like strands. That
    softens the crisp light/cast-shadow separation that makes the arm read as part of the body *and* readable. It
    took rounds 02 to 04 to get that right.
  - **The cheek right of the barrel gets busy** (the painter noticed it too): several boundaries meet beside the
    yellow, and strands there compete with the barrel's edge.
  - **The body and tail barely change.** It is a soft edge at most, with no gain worth the pixels.
- **1x:** the head still reads slightly furrier and richer; the arm and body difference disappears. So the gain is in
  the head, and the cost is in the arm at the poster size.

## Decision: adopt the fur pass for the HEAD ONLY
Apply it to the crown, the brow bands, the mask edges (upper and lower), the forehead stripe and the ears. Do not apply
it to the forearm, paw, body, tail or scarf. Add one extra calm zone along the pump barrel (its silhouette dilated by
about 4 px), so the busy cheek beside the yellow stays calm. Keep the eye, nose and smirk calm zones and the density
rule (100% at k = 1.5, 60% at k = 1, none below k = 0.9, so the in-game dog/raccoon small sizes are unaffected).

## Round 10: exactly this, nothing else
1. **Port the fur pass into `tools/sprites/portraits_next.mjs`, restricted to the head** as described above: the work
   area is the head and ears only, plus the barrel calm zone. It must be deterministic (fixed seed), so every render
   and the later game build are identical.
2. **Verify:**
   - pixelcheck on the raccoon at k = 1.5 and k = 1: still 0 jaggies, and no orphans except the catchlight;
   - no strand lands on the eye lids, the pump or the scarf;
   - `iter_10_values.png` shows the same structure as iter_09;
   - the VERSUS 1x and 2x pair still reads as one style.
3. **The dog: no change** (all three expressions frozen).
4. **Hand-off:** the snapshot (`portraits_2d`, "M4.9 round 10: head fur pass, final"), the annotate exports
   (`tools/scratch/annotate/raccoon.png`, `dog_grin.png`), and `painter_10.md` with a before/after crop of the head at 2x.

If the head-only port shows any problem that can't be fixed in one try, ship iter_09 as it is. It is final-quality on
its own.

## Constraint checks (iter_09 and the head-only plan)

| check | result |
|---|---|
| Pump yellow, straight; face clear | pass |
| Raccoon faces right, smirk, mask, white brows; inside 232x208, finished bottom | pass |
| Raccoon k = 1; dog 112 x 100 in grin, laugh and shock | pass (the fur pass is off below k = 0.9; check k = 1 at 60%) |
| Dog head shape and traits; no real-person likeness | pass |
| Game untouched; palette additions only; light2d backwards compatible | pass |

## Keep, don't touch
Everything in iter_09: the raccoon's light, arm, paw, tail, scarf, pump and its new solid streak; all three dog
expressions. The only change allowed in round 10 is the head-only fur pass.
