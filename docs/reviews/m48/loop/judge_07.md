# Judge, round 07 (refinement 4)

Scale: ref 03's craft = 9 to 10 (ref 04/05 about 7.5 to 8). Baseline 4.0 / 3.5. Round 06: raccoon 6.5, dog 6.0.

## Scores

| | Score | Change | One line |
|---|---|---|---|
| **Raccoon** | **7.0** | +0.5 | The fur texture is right now: re-flowed strands, a bright clean muzzle top, a calm body without corduroy, lit forearm ridges and lit tail-ring rims. It is at ref 04/05 level in the head and close to it overall. |
| **Dog Fjord** | **5.5** | −0.5 | Every individual instruction was carried out, but the whole got worse. The pouches and the ragged teeth make him lumpy and less striking than round 05. |

## Overall appeal verdict (before the fix list)

**Dog Fjord: yes, we have been optimising details into a worse whole.** I put round 05, 06 and 07 side by side
(`cmp567.png`):
- **Round 05 had the most striking, most confident face of the loop.** A wide, clean white crescent grin from jowl
  to jowl, big fangs, the smug lid. The grin was a single bold graphic shape, and that is what sells a smug villain
  from across the room and at 112. Its problems were the **colour** (tan/mauve, the olive "stubble"), and those were
  fixed in round 06.
- **Round 07:**
  - **The drapes overshot into outlined pouches.** Two big rounded bags hang below the mouth corners, each with a
    dark line round its whole lower edge (close-up ≈ x 30–190 and 600–760, y 160–390). They read as hamster cheek
    pouches or saddlebags. At 112 they are two lumps that widen the bottom of the head.
  - **The teeth read as rotten.** The blocky upper row's lower edge is ragged, with maroon gaps (≈ y 280–300 across
    the whole row), so it looks like broken or decayed teeth.
  - **The grin has shrunk.** The thrust lower lip and the pouches cover so much that the visible white is a shallow
    strip. The bold crescent is gone.
  - The net effect is lumpy and less confident. He has lost the striking quality that was round 05's real
    achievement.
- **I take my share of this:** my "make the drapes unambiguous" and "hide the lower teeth" notes in judge_05 and
  judge_06 pushed toward anatomical correctness at the cost of the graphic read. For a cartoon villain, the
  **convention** (big puffed jowls flanking a huge toothy crescent, as on classic cartoon bulldogs) beats anatomy.
  Round 05's "cheek pads" were in fact the right cartoon read.

**Recommendation: revert Dog Fjord's mouth area (the grin, teeth, lower lip, drapes or jowls) to round 05's geometry,
on top of round 06/07's pink palette and terminator,** and apply only light-touch fixes (below). Don't push the
drapes any further.

**Raccoon: steady, real gains, with no regression.** The muzzle is brighter than 06, the body calmer, and the arms
read.

## What still separates it from ref 03

### Dog Fjord (light touch only from here)
1. **The revert:** round 05's mouth layout, the white crescent, the jowl lobes beside it and the upper lip running
   across. Keep from 06/07: the pink palette, the rosy terminator (no olive), the forehead folds, the bigger fangs,
   the nostrils.
2. **The teeth on round 05's crescent, light touch:**
   - one clean white field;
   - the **upper lip's shadow band** across the top;
   - cooler grey toward both corners;
   - at most 3 or 4 **very soft one-value separations** on the upper teeth;
   - a **clean, even lower edge**: no gaps, no maroon, no beads, no lower-teeth row;
   - the fangs as in round 07.
3. **The jowls, light touch:** keep round 05's lobes as cartoon jowls.
   - No closed outline round them. Let their outer lower edge **sag 3 or 4 px** below the mouth-corner line and melt
     into the jaw shadow.
   - A thin dark lip margin only *along the mouth line*, not round the lobes.
   - At 112 they must not form separate lumps.
4. **The laugh and shock with the same language.**
   - The laugh is already good: keep its open crescent, upper teeth row, tongue and lower fangs, and swap the
     pouches for 05-style jowls.
   - The shock: 05-style jowls hanging a little longer (slack). The small O with fangs is fine.

### Raccoon (the last high-value moves)
1. **A body light pass: the biggest remaining gain.** From the bandana down, the figure is still a narrow band of
   mid taupes.
   - Push the light from the upper left: the near half of the chest, belly and near thigh **one step brighter**.
   - The far side and the belly's underside **a step darker and cooler**.
   - A stronger cast shadow from the head and bandana across the upper chest.
   - Occlusion between the legs and right under the feet (inside the feet, not a ground shadow).
   - This is what makes ref 03's forms pop.
2. **The mask's outer lobes:** the strands there are still near-horizontal. Curve them back and slightly up toward
   the ears along each lobe's long axis, and add one small soft sheen cluster on the upper edge of each lobe.
3. **Small focal polish:** a slightly larger primary catchlight (1 px more) and a 1 px secondary sparkle on the
   lower iris of the near eye, as in ref 03's wet look. A touch more light on the nose's top plane.
4. **Grips and paws:** fine. Leave them.

## Constraint checks
| Check | Result |
|---|---|
| Pump straight | **Pass.** Vertical axis, T-bar level, longer barrel, gauge lower, all collinear. |
| Dog head = iter_04 | Pass (outline, ears, hair) |
| Dog at 112 | Pass for readability, but the pouches become two heavy lumps and the teeth read as a broken strip. Fixed by the revert. |
| k = 1 | Pass. The raccoon's texture is calm now (mask and forehead only). |
| Nothing cut off | Pass |
| No real-person likeness | Pass |
| Raccoon faces right, smirk, mask, brows, face clear | Pass |

## Top 6 fixes for rounds 08 to 10 (ranked by impact; round 10 is polish only)
1. **Dog (round 08): revert the mouth area to round 05.** The wide white crescent, the jowl lobes, the upper lip
   across, on the 06/07 pink palette and terminator. Remove the 07 pouches, the thrust lower lip covering the teeth,
   and the maroon gaps.
2. **Dog (round 08): light-touch teeth on that crescent.** The lip-shadow band, cool corners, 3 or 4 soft one-value
   separations, a clean even lower edge, the 07 fangs. The same language in the laugh (keep its tongue and upper
   row) and the shock.
3. **Dog (round 08/09): light-touch jowls.** No closed outline, the outer lower edge sagging 3 or 4 px past the
   mouth corner into the jaw shadow, a thin lip margin only along the mouth line. Check at 112 for lumps.
4. **Raccoon (round 08): the body light pass.** The near side a step brighter, the far side and the belly underside a
   step darker and cooler, a stronger head and bandana cast shadow, occlusion between the legs and under the feet.
5. **Raccoon (round 09): the mask outer-lobe strands** curving back toward the ears, sheen clusters on the upper lobe
   edges, a slightly bigger catchlight plus a secondary sparkle, a brighter nose top.
6. **Round 10, polish only:**
   - orphan pixels and despeckle;
   - a banding check on the jowls and the belly;
   - every expression at 1.5, 1 and 112;
   - the side-by-side against round 05 for the dog, to make sure the appeal is at least round 05's.
   No new features.

## Keep, don't touch
- **Raccoon:** everything. Head, strands (07 tuning), cap, bandana, stance, arms with lit ridges, paws, feet, tail
  with lit rims, the pump.
- **Dog:** the 06/07 pink palette and rosy terminator, the eyes and smug lid, the patch, the nose and nostrils, the
  forehead folds, the iter_04 ears, the hair, the bust, the fangs, and the laugh's open mouth with its tongue.
