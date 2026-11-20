# Critic, round 05 (appeal and focus: faces, falloff, tufts, scarf, beats)

Looked at: `iter_05{,_hero,_values,_favs}.png`, `painter_05.md`, 4x crops of the raccoon's face and of its body, tail
and scarf, and of the dog's face; pixelcheck (`pc05/`). Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are
unchanged, and there are no new palette keys this round.

Coordinates are in the k = 1.5 picture (348 x 312), measured as hero pixel / 4 minus the layout offset.

## Scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | raccoon | Dog Fjord |
|---|---|---|
| baseline | 4.5 | 4.5 |
| Ivan's favourites | 5 | 5.5 |
| round 04 | 6.0 | 7.0 |
| **round 05** | **6.5** | **7.5** |

## Overall

**The faces now carry the pictures.**
- The raccoon's eyes are lit wet spheres: a larger amber iris, a dark ring, a 2x2 catchlight, and the glow crescent at
  the lower right.
- The asymmetric brows give the cocky read, the white brow stripe is the brightest value on the figure, and the muzzle
  top plane is crisp.
- The dog's grin finally pops: the middle lower teeth near-white, the corners grey in the cheeks' shadow. His patch
  eye has a catchlight.

The values view puts the contrast peak on both faces. It is still light-driven throughout. The dog is now at the level
of ref 04.

The raccoon gained in the face and lost some of it in the body. Four things in its lower half and silhouette now
read as odd shapes again, exactly the kind of thing Ivan flags:

1. **The falloff made the lower body too dark and flat** (yes, coordinator). Everything below the forearm (art ~(100 to
   245, 225 to 300)) has become one flat mauve-brown mass: `º` is now the most-used colour (14%). The light/shadow
   structure ends at the forearm, so even the lit (left) side of the belly is in "shadow". In greys the lower half is
   ONE mid-dark value, which reads like a dark skirt. Falloff should *dim* the light, not delete it.
2. **The scarf end is a limp ribbon** (agreed). It hangs from the far shoulder almost to the hose (art ~(280 to 310, 190
   to 250)): long, narrow, the same width all the way, with no knot where it starts. It reads as a green ribbon or
   leaf, not a knit scarf with weight.
3. **The tail reads as segmented**, like a caterpillar or stacked cups. Each ring segment is its own little bulge in
   the silhouette with its own highlight, and the hooks sit one per segment. The top end is still flat with spikes.
   The light should run along the whole tube.
4. **The far ear with the nick** (art ~(226 to 273, 15 to 69)) became a smooth, rounded, brightly lit tube: no tufts,
   unlike the near ear. In the values view it reads like a handle or a donut. The nick is lost in the roll, and the
   ear is lit as if it were on the light side.

Smaller:
- The "lit fur wedges" on the mask edge are 1-px white ticks (around (148,90) and (251,90)). They read as scratches or
  stuck-on eyelashes.
- The smirk is still a thin, even 1-px dark curve, the last *drawn* feature on the face. The cheek bulge barely shows.
- Dog: the underside of the near jowl has 3 thin stacked bands (lit, light, mauve: art ~(70 to 130, 225 to 240)). There
  are thin light strokes on the near cheek (around (77 to 102, 171 to 194)) and a small light dot near the jowl bottom
  (around (97,231)).

## Ranked fixes for round 06 (appeal first)

1. **Restore the light inside the falloff.**
   - Below the forearm, keep two value groups: a lit belly plane on the light side (left), one tone below the bib's
     light, and the shadow plane on the right, with the terminator continuing down from the chest to the bottom
     centre.
   - The forearm's cast shadow stays a crisp band at the top of that lit belly.
   - The falloff then darkens both groups gently toward the bottom edge and the tail's lower half, without merging
     them.
   - Values test: the lower half shows dim-light vs shadow, never one flat grey.
2. **Give the scarf weight.**
   - A bunched knot or fold at the far shoulder, where the end comes from.
   - The end shorter (it stops about at the gauge's height, about 35 to 40 px long instead of 60) and wider (10 to 12 px
     at the top, narrowing a little).
   - One fold crease, a slight outward kick at the bottom, and 3 or 4 short fringe strands.
   - It must not reach the hose.
   - Lit plane on the left edge of the end, shadow on the right, the same light as the loop.
3. **Light the tail as ONE tube.**
   - One continuous light band along the outer, upper-left side for the full length, and one shadow along the
     underside with the reflected band.
   - The rings are local colour only, taking the same light: lighter where they cross the light band. They are not
     separately shaded segments.
   - The silhouette is a smooth taper with no per-segment bulges, plus 4 to 6 hooks spaced irregularly (not one per
     ring).
   - The tip is a soft, rounded point with the dark last ring. No flat top, no spikes.
4. **Fix the far ear.**
   - The same shape language as the near ear: a rounded-point triangle with 2 or 3 fur tufts on the rim.
   - It sits in the head's shadow side: one group darker than the near ear, the rim only half-tone.
   - The nick is a clean V notch, 3 or 4 px deep, in the upper outer edge, readable as a missing bite.
   - Also: replace the 1-px white ticks on the mask edge with 3 or 4 tapered cream wedges, 2 to 3 px wide at the base,
     pointing along the fur growth (up and out). Or drop them.
5. **Faces, the last 10%.**
   - Raccoon smirk: make it a crease *shape*. Dark and 2 px thick where it tucks into the far corner, tapering to 1 px
     and fading at the near end, with a lit lip one tone up below it and the cheek bulge above the corner lit as a
     small dome.
   - Remove the dimple tick if it reads as a separate stroke.
   - Dog: merge the 3 bands under the near jowl into one shadow shape plus one reflected band. Remove the thin light
     strokes on the near cheek and the dot near the jowl bottom.

Five rounds remain. After round 06 the raccoon should be as calm in the body as the dog, so rounds 07 to 09 can
polish both faces and the edges.

## Pixelcheck (clean now)
- Raccoon: 5 orphans ((255,109), (109,167) (113,169) (114,169) at the bib bottom, (90,254)) and 3 jaggies ((134,32)
  (173,41) (100,126)). The holes, nubs and strips at (292 to 326, 139 to 156) are the whiskers and chin tuft.
- Dog: 1 orphan (98,92) and 1 jaggy (106,82).

## Constraint checks

| check | result |
|---|---|
| Pump yellow, straight | pass |
| Face clear of the pump | pass |
| Raccoon faces right, smirk, mask, white brows | pass (the brows are now asymmetric: good) |
| Inside 232x208, finished bottom | pass. The bottom tufts are hand-placed; keep them |
| Dog head shape, low ears, compact swept hair | pass |
| Dog traits (wink, heart patch, nose, grin, navy suit, white shirt, red tie) | pass |
| No real-person likeness | pass |
| 112 x 100 | pass. The patch eye, wink and grin read better than in round 04 |
| Game untouched; palette additions only | pass (no new keys) |

## Keep, don't touch
- **The raccoon's eyes:** iris size, limbal ring, glow crescent, the 2x2 catchlight and secondary, the lid shadow and
  the smug lid shape.
- **The rest of the raccoon's face:** the asymmetric brows topping at `W`, the crisp muzzle top plane, the nose glint.
- **The dog's patch eye**, the lit middle teeth with the grey corners and the lip shadow, the nose with its highlight
  and reflected underside, the one forehead fold.
- **The light design:** one light and one shadow side, no rim, reflected light only inside the shadows.
- **The arm, cast shadow and bib.** The paw grip; the dark belly behind it makes it read better, so keep that local
  contrast when the lit belly comes back (fix 1): the lit belly starts below the forearm's cast shadow.
- The hand-placed bottom-edge tufts, the tail's bulk and C-curl, the scarf loop's smooth top edge and designed chin
  shadow.
- Dog: the far-side shadow plane, the cheek lens, the hair specular, the wink, the heart patch, the red tie, the suit
  falloff.
- The yellow pump with its short streak; the method.
