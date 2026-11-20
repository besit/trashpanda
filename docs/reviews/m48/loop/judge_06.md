# Judge, round 06 (refinement 3)

Scale: ref 03's craft = 9 to 10 (ref 04/05 about 7.5 to 8). Baseline 4.0 / 3.5. Round 05: raccoon 6.5, dog 6.0.

## Scores

| | Score | Change | One line |
|---|---|---|---|
| **Raccoon** | **6.5** | ±0 | The interior fur texture is in, which is the right move, but it is executed as uniform, mostly horizontal hatching: it reads as scratchy pencil shading, not fur, and it greys the white muzzle. The arms read better. |
| **Dog Fjord** | **6.0** | ±0 | The pink is back and the stubble is gone (a real gain), but the teeth regressed into two rows of round beads (dentures, pearls), and the drapes still read as cheek bulges. |

## What improved
- **Dog:** clear warm pink-peach lights, a clean pink mid, mauve only in the shadows. The olive stipple is gone, and
  there is a continuous rosy terminator along the jaw shadow. Bigger fangs. Stronger forehead folds. He looks like
  himself again.
- **Raccoon:**
  - The upper arms are a value darker, with a lit outer rim and an occlusion crease, and the elbows now break the
    silhouette.
  - The T-bar grips stick out past the paws with a lit highlight, so the "T" reads.
  - The knuckles are lighter.
- `furClusters()` is a good, reusable tool. The problem is how it is tuned, not the tool.

## What still separates it from ref 03 (ranked by impact)

### 1. Dog teeth: beads → chunky bulldog teeth
- On the close-up, the grin is an upper row of about 10 small rounded bumps and a lower row of about 7 round white
  beads, each a separate rounded blob on a grey field. They read as a pearl necklace or dentures. That is worse than
  round 05's flat field, because the mouth is the dog's focal shape and now it is fussy.
- **Bulldog teeth are few, big and blocky:**
  - **Upper row:** about 5 or 6 chunky squarish teeth, slightly uneven in width and height (one a little longer, one
    slightly turned). They hang under a clear lip-shadow band. Each tooth has a flat lit face and a darker side, and
    they are separated by **value** (the side plane of the next tooth), not by gaps.
  - **Lower row: mostly hidden.** The underbite means the **thrust lower lip covers the lower teeth**. Only the two
    big lower fangs (already good) and perhaps 2 or 3 small tips between them show above the lower lip.
  - A darker mouth interior shows in the gaps at the corners.
  - Apply the same language to the laugh (a blocky upper row, the lower fangs, the tongue) and the shock.

### 2. Dog drapes: make them unambiguous with value and a lip margin
- Today the drapes hang lower (good), but they are lit in the same pink as the cheek above them and separated only by
  a thin crease, so the eye reads one continuous puffed cheek.
- **Use value and a lip margin:**
  - **The cheek overhangs the drape:** the lit cheek plane ends in a soft cast shadow across the **top** of the drape.
  - The drape body is a **clear step darker** (a mid rose), with only a narrow soft bounce light along its lowest hem.
  - **Add a dark pigmented lip margin** (dogs have dark lip edges): a deep mauve or charcoal-rose band, 1 to 2 px, that
    runs along the whole mouth line and continues **round the drape's hem and inner edge** where it overlaps the
    teeth. Nothing says "hanging dog lip" faster than that dark hem.
  - The shape is **pendulous**: narrower where it leaves the lip at the corner, widening and rounding at the bottom
    (a teardrop or bag), its lowest point clearly below the lower lip.
  - In the shock, longest and slack. In the laugh, lifted, but with the hem still visible.

### 3. Raccoon face strands: re-flow, thin out, keep the white bright
Compared closely with ref 03:
- **The direction is too uniform.** The mask strands are almost all horizontal, so they look like scanlines or
  hatching across the mask. The muzzle strands are also mostly horizontal.
  - In ref 03, the mask fur **curves out of the eye corners** and sweeps back toward the ears.
  - The muzzle fur **radiates from the nose and curves down along the jaw**.
  - The forehead fans upward.
  - Use **per-zone flow fields**, and vary the direction by ±15° and the length by ±40% inside a cluster family.
- **The muzzle is too busy.** Grey `7` strands cover the whole cream muzzle at the same density, which greys the
  brightest area of the face and kills its contrast with the mask.
  - In ref 03, the white muzzle stays **bright on its lit top**, with strands concentrated toward the shadow side,
    the edges and under the mouth.
  - Cut the muzzle density to about 40%, leave the lit top of the snout and the upper cheek nearly clean, and push the
    strands into the turning-away zones.
- **The contrast is a notch too high in places:** some strands jump 2 tones. Keep every strand ±1 tone from its
  ground, except the few lit tips on the crown.
- **At k = 1** the face texture turns to grain (the overview's raccoon reads speckled grey on the muzzle and the
  body). Drop k = 1 to about 0.3 density, on the mask and forehead only, and leave the muzzle clean.

### 4. Raccoon body texture reads as corduroy
- The bib and belly strands are short, near-vertical and evenly spread, so the body looks like corduroy or felt.
- Use **fewer, longer** strands **grouped into tufts that follow the form**: the bib flowing down and out from the
  throat, the belly fur curving round and under, the thigh fur sweeping down and back.
- Keep the lit planes calmer (the near shoulder, the upper bib) and put the texture density in the half-tones and the
  shadow side.

### 5. Raccoon forearms
- Still mostly hidden behind the paws: there is a dark wedge between the elbow and the paw, with no lit ridge.
- Give the near forearm a lit ridge along its top from elbow to wrist, bend the wrists so the forearm leads into the
  paw over the grip, and put a small fur tuft at the wrist.

### 6. Small finishing items
- The tail rings could use a lit fur rim on their upper edges (planned in round 04, still faint).
- The barrel could be a touch longer if the gauge drops 2 or 3 units.
- Check for orphan pixels after the strand passes (`despeckle` on the head with the strand tones).

## Constraint checks
| Check | Result |
|---|---|
| Pump straight | **Pass.** Vertical axis, T-bar level and wider, rod, caps, barrel, gauge and foot plate collinear. |
| Dog head = iter_04 | Pass |
| Dog at 112 | **Pass.** The grin reads as a white crescent (the beads mostly merge, luckily), the laugh and shock are distinct, and the fangs are 2 white pixels. |
| k = 1 | Pass for readability. The raccoon's muzzle and body texture turn grainy (see fix 3). |
| Nothing cut off | Pass |
| No real-person likeness | Pass. The stubble is gone. |
| Raccoon faces right, smirk, mask, brows, face clear | Pass |

## Top 6 fixes for round 07 (ranked by impact; four rounds remain)
1. **Dog teeth:** a chunky blocky upper row of 5 or 6 uneven teeth under the lip-shadow band, separated by value. The
   lower teeth hidden behind the thrust lower lip except the two big fangs (plus 2 or 3 tips at most). No beads.
   The same language in the laugh and the shock.
2. **Dog drapes made unambiguous:**
   - the cheek's cast shadow across the drape top;
   - the drape body a step darker, with a narrow bounce only at the hem;
   - a **dark pigmented lip margin** along the mouth line and round the drape hem;
   - a pendulous teardrop shape, lowest point below the lower lip.
3. **Raccoon face strands:**
   - per-zone flow (out of the eye corners on the mask, radiating and curving down on the muzzle, a fan on the
     forehead), with varied direction and length;
   - the muzzle density cut to about 40% and its lit top kept bright;
   - ±1 tone only;
   - k = 1 at about 0.3, on the mask and forehead only.
4. **Raccoon body strands:** fewer, longer, grouped into form-following tufts. Calm lit planes, texture in the half
   tones and the shadow side.
5. **Raccoon forearms:** a lit ridge from elbow to wrist, wrists bending over the grips, a wrist tuft.
6. **Finishing:** lit rims on the tail rings, a slightly longer barrel (the gauge lower), and a despeckle pass after
   the strands.

## Keep, don't touch
- **Dog:** the restored pink palette (`/` `¢` `Q` `£` with mauve only in `§` `¤`), the rosy terminator, the layout,
  the planes, the fangs, the forehead folds, the smug lid, the iter_04 ears, the hair and the bust.
- **Raccoon:** the head's shapes, the cap, the bandana, the stance, the feet, the tail, the pump with its visible rod
  and wide T-bar, the arm value step with its lit rim, and `furClusters()` (re-tune it, don't remove it).
