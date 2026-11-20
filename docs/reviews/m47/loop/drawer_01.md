# Drawer 01: re-proportioned to the 3D busts

Sheet: `tools/scratch/piter/iter_01.png`. Snapshot: `art/history/portraits_2d/v02`. Only `tools/sprites/portraits.mjs` was
changed; draw2d.mjs needed nothing new. A copy of the M4.6 file is in my scratchpad.

## Head-size decision (dog): 1.1x the 3D (~136 wide), not 1.0x (124) and not my planned 1.2x (150)
The old 3D *dialogue* portrait (dogfjord.mjs, 112x100, scale 1.1) showed the head at ~68 px, **0.61 of the frame
width**. The 3D *poster* render was smaller, 0.54. In the 112x100 portrait a 0.54 head makes the eyes 7 px wide and
the brows/teeth start to mush. A 0.65 head (1.2x) pushes the ears to within ~4 px of the frame edges. At 1.1x the head is
~0.59-0.61 of the width, as in the old in-game portrait. It keeps ~8-10 px of air at each side at 112, and the suit still shows ~40
units under the chin on the poster. All dog coordinates are written in the 3D render's own grid positions and mapped
through `T()` (scale 1.1 about (110, 100)), so the proportions are the 3D ones by construction and the scale is one constant (`DSC`).

## Raccoon: what changed (judge items)
1. **Head**: rebuilt at ~106 wide (x 67-177 with the ruffs), cranium top y 37, chin y 118, centred at x ~122 over the
   body. **Short snout**: the nose (155-171, 80-92) sits inside the cheek line, so this is a 3/4 view, not a profile.
2. **Eyes**: (117, 76) 16x12 and (152, 74.5) 13x10, 35 apart (was 50). Amber iris (X with a j lower half), K pupil
   looking right, 2x2 W glint, the heavy lid over the top third.
3. **Mask**: two lobes with a narrow bridge (~7 tall at x 128-138), the outer ends drooping onto the cheeks, the grey
   forehead stripe running down to the bridge, a 3-4 unit grey gap between the white brows and the mask.
4. **Dither removed** from the head, ears and body (the pump keeps its own, which the judge liked).
5. **Abs/pecs removed**: a chubby barrel torso (x 70-182, bottom y 205, squarer than a ball) with 4 small fur
   notches at the pale front's edges.
6. **Balance**: body centred under the head. The far arm is thicker (~16) and shorter (elbow x 204), with a
   light top edge and a dark forearm.
7. **Ears**: a matching pair, tips (103, 24) and (144, 23), ~22 tall, dark inside.
- The smirk is now one-sided: flatter on the nose side, rising into the near corner and its dimple. There are
  ruff tufts on both cheeks.

## Dog Fjord: what changed (judge items)
1. **Size**: see above (x ~40-180 incl. the ears at k = 1; head top ~26 incl. the hair, chin ~171).
2. **Features clustered** as in 3D: eyes (84, 91)/(117, 92) in 3D units (~36 apart after scaling, was 57). The nose
   is right under them and the mouth x 64-128 tucks into close jowl creases.
3. **Rose ears**: folded flaps hinged under the hair at the upper corners, tips out and slightly down, a darker
   underside fold. They no longer read as horns.
4. **Silhouette**: a bell. The skull narrows a little at the temples (y 76-90), the jowls bulge out to the widest
   point at y ~120-137, then a full round bottom. No pointed crown, no notch.
5. **Hair**: I first tried the judge's chunky diagonal bands. At every size they read as a knit beanie, so I
   replaced them with a compact domed cap combed back. It has three long G grooves following the dome, a mid-grey shadow on the back half,
   a W rim on the top-left and a slight lift at the front. It reads as combed grey hair at 112.
6. **Shading**: three flat tones: one P shadow shape down the right side and under the jowls, the m base, and the M lit left
   plane + muzzle. No dither on the head or suit.
7. **Eyes**: the grin is a heavy K lid arc over a pink sliver with a 1 px glint, a faint lower squint line, and brows ~18 long
   and 4 units thick (2 px at 112). Laugh: shut ^ arcs. Shock: round whites with pupils, brows up.
8. **Suit**: shoulders x ~62-164 under the jowls, the tie under the chin left of centre, flat k shadow on the right.

## Self-check (what I still see)
- Dog: the head reads a little "bear/pig" because the lit muzzle is a big oval; the 3D is more wrinkled and droopy.
  Next: a stronger hanging flews line under the nose (the upper lip draping over the grin's corners), slightly
  heavier jowl creases, maybe a narrower skull top so the hair cap dominates more.
- Dog at 112: the lower teeth row still looks a bit like braces, and the near eye sits very close to the nose. Next:
  a single tooth row (or fewer gaps) at small k, and the nose 1-2 units lower or narrower.
- Dog laugh/shock: the brow over the heart patch touches the patch's top cleft (pink notch shows between the
  lobes). Next: shift the patch down 2 or fill the cleft.
- Raccoon: the eyes are still smallish inside the mask at k = 1, and the lid paint merges with the mask. Next: a
  thin H or g line along the lower lid so the eye shape separates from the mask, and a slightly larger near eye.
- Raccoon torso still a bit round. Next: a hint of shoulders (a flatter top line from the neck to the arms) and a
  stronger shadow seam under the near arm so the upper arm separates from the body.
