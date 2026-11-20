# Judge, round 04 (refinement 1)

Scale: ref 03's craft = 9 to 10. Baseline 4.0 / 3.5. Round 03: raccoon 5.5, dog 5.5 (b).

## Scores

| | Score | Change | One line |
|---|---|---|---|
| **Raccoon** | **6.0** | +0.5 | A real standing chibi figure: legs, feet, a ringed tail, and the face fully clear. The head is still about 7, and the body has gone from about 4 to about 5. Clean, but the body is plainly rendered and the pump reads as a small hydrant. |
| **Dog Fjord** | **5.5** | ±0 | The pieces got better (the iter_04 ears are back, dog nostrils, one chin). But the overall design got worse: the features crowd into the top of the head above a huge banded pink jowl mass, and he reads hamster or pig, less striking than iter_04. |

## What improved
- **Raccoon:** a standing figure with contrapposto (weight on the far leg, the hips shifted). Big hind feet with toes
  and claws either side of the pump foot give the finished bottom edge. The paws on the handle are readable.
- **The ringed tail is back and good:** 4 rings bowing round the cylinder, dark shadow sides, a tufted dark tip, well
  away from the paws.
- **The head kept as-is,** with the cap tilted about 4° and the white brow tufts showing under the brim. Good.
- **Dog:** the iter_04 triangular ears are back (straight top edge, pointed tip angled out and down, lit plane, maroon
  underside), and they match `ref_iter04_hero.png`. The nostrils are comma slits with a centre groove, with no pig
  holes. The stacked double chin is gone. The fangs and the smug low lid are intact.

## What still separates it from ref 03 (ranked)

### Dog Fjord: the layout and shading are the problem now, not the parts
1. **The features are crowded into the top ~45% of the head.** On the close-up, the eye line sits at about 25% of the
   head height, the nose at about 35% and the mouth at about 50%. Below that is a featureless pink mass about 50% of
   the head tall. The grin spans only about 40% of the head width (crop x ≈ 205–525 of a head about 820 wide).
   - iter_04 (the head Ivan liked) has its eyes at about 35%, its nose at about 45%, and a **wide crescent grin
     across about 70% of the face at 55–70% height**. That wide mouth is what makes a bulldog read, and it was the
     strongest graphic shape in his face.
   - **Dial the chin-up back by about half.** Move the features down and spread them out. Keep a *hint* of nose
     underside (the slits), the low smug lid and the pupils sliding left. The chin-up must not cost the wide grin.
2. **Pillow / banded shading has crept back into the lower half.** Under the mouth there are three soft concentric
   bands: the chin plane, a reflected-light band and the jowl band, each following the head outline. A darker
   crescent sits at the lower right. That is exactly the pillow shading judge_00 flagged. Replace it with **3 or 4
   clear planes**:
   - a lit front plane (forehead, muzzle top, the lit side of the chin);
   - a turning side plane on the far cheek (mid tone);
   - **one** strong cool core-shadow shape under the jowl drapes, running across the jaw, not a ring;
   - a thin bounce light only along the lowest edge where the head meets the collar.
3. **The drapes:**
   - The far (screen-right) drape is a small round lobe with a dark outline all the way round, which reads as a
     **hamster cheek pouch**.
   - The near drape is a thin pink wedge pointing out sideways, like a tongue.
   - Make both broad and heavy, at the *outer ends* of the now-wider mouth, sagging over the lip. Put the dark crease
     only on the top/inner side and let the lower edge melt into the core shadow, with no closed outline.
4. **The skin palette is one saturated salmon.** Yes, it's worth varying, and it is a big quality lever (ref 03's
   greys are full of hue shift). Add keys:
   - **warm lights**, peach with a touch of yellow ochre, on the forehead dome, the muzzle top, and the nose rope
     and brow ridges;
   - a **slightly desaturated mid** pink;
   - **cool mauve / rose-violet shadows** under the drapes, on the jaw and at the ear hinges;
   - a faint **ochre-olive** in the half-tone where light meets shadow (this is what keeps skin from looking like
     plastic).
   Lower the saturation of the large mid area by a step so the patch, nose and grin carry the colour.
5. **The grin itself:** a thin white strip with tick separations and two good fangs. Once it is wider, give it the
   upper lip's shadow on the teeth, darker corners and slightly larger fangs.

### Raccoon: from "clean" to "ref 03 craft"
1. **The pump reads as a small hydrant.**
   - The barrel is about 1:3.5 (width to height) and only about 30% of the figure's height, with the gauge filling
     its middle.
   - **The T-handle is hidden:** both paws cover the bar, so the "T" that makes it a pump is gone.
   - Fix: show the handle **pulled up mid-stroke**, so a long chrome rod is visible between the barrel cap and the
     handle. That adds length without moving the foot or shrinking the head, and it says "pump" instantly.
   - Make the barrel slimmer (1:5 or more), move the gauge lower or to the side, and make the T-bar **wider than the
     paws** with the black grips poking out on both sides. The paws hold the grips, one per side, not the centre.
2. **Values below the head are flat.** From the bandana down, the body lives in 2 or 3 mid taupes. Ref 03 has strong
   light against dark everywhere. Add:
   - a lit rim along the upper-left edges (the near shoulder, upper arm, thigh, top of the near foot);
   - the **cast shadow** of the head and bandana on the chest;
   - occlusion in the armpits and between the legs, and under the T-handle and paws;
   - lit fur tips on the bib.
3. **The arms read as wings.** The elbows flare out as flat triangles, and the near arm still has a torn-paper jagged
   edge (crop ≈ 240–330, 180–300). Draw upper arm, elbow, forearm: the upper arm drops from the shoulder, a clear
   elbow bend, and the forearm visible down to the paw. Tuck the elbows in a little. Put the tufts only at the
   elbow point.
4. **The body has no fur rendering.** The belly and legs are smooth fills with one shading band. Add directional fur
   clusters following the form (the bib flowing down and out, the belly fur turning under, a highlight cluster on
   the near thigh), the same `furBreak` language as the head, at a lower density.
5. **Feet and tail finish:**
   - The feet are flat dark ovals with 4 light dots for toes. Give them toe lobes, lit pads and a darker heel.
   - The tail rings need a lit fur rim on their upper edges and broken boundaries.
   - Where the tail leaves the hip, it should tuck clearly behind the far leg.

## Constraint checks
| Check | Result |
|---|---|
| Pump straight | **Pass.** Vertical axis, handle level, foot plate square, rod and barrel collinear on the close-up. |
| Pump as a real object | Partial: the right parts, but hydrant proportions and a hidden T-handle. |
| Dog head = iter_04 | **Pass.** The outline and the ears are restored. (The face layout is what drifted; see above.) |
| Dog at 112 | **Pass.** The wink, the patch eye with its low lid, the nose, the fangs (2 white pixels) and the shock mouth are all distinct. The lower face is one pink blob there; it is clean, but the narrow mouth makes him small-featured. |
| k = 1 | Pass. The raccoon reads (cap, mask, paws, gauge, tail). The dog's nostril slits are lost at k = 1 (the artist knows). |
| Nothing cut off | Pass. Feet and foot plate on the bottom edge, the tail and the hose chuck inside the frame. |
| No real-person likeness | Pass |
| Raccoon faces right, smirk, mask, white brows, face clear | Pass |

## Top 6 fixes for round 05
1. **Dog: re-lay out the face.**
   - Dial the chin-up back by about half: the eyes at about 33–35% of head height, the nose at about 45%, the mouth
     line at about 60–65%.
   - The mouth becomes a **wide bulldog crescent spanning about 70–75% of the head width**, as iter_04's did.
   - Keep the smug low lid, the iris sliding left, the arched patch brow, a hint of the nostril slits and the fangs
     at the mouth corners.
2. **Dog: break the pink into 3 or 4 planes with a hue-shifted skin palette.**
   - Warm peach-ochre lights and a desaturated mid.
   - One cool mauve core-shadow shape under the drapes and across the jaw.
   - A thin bounce at the collar.
   - Delete the concentric chin bands and the stray dark crescent at the lower right.
3. **Dog: the drapes as broad heavy curtains at the corners of the wide mouth.** No closed dark outline (no hamster
   pouch, no tongue wedge). Put the crease only on the upper/inner edge and let the lower edge melt into the core
   shadow. Add the upper lip's shadow across the teeth.
4. **Raccoon: the pump as a pump.** The handle pulled up with a long chrome rod showing, a slimmer barrel (1:5 or
   more), the gauge lower or to the side, a T-bar wider than the paws with grips sticking out, and one paw per grip.
5. **Raccoon: value structure and arm anatomy below the head.**
   - A lit rim on the upper-left edges, the head and bandana's cast shadow on the chest, occlusion in the armpits,
     between the legs and under the paws.
   - Upper arm, elbow and forearm instead of wings, with no torn edge on the near arm.
6. **Raccoon: fur rendering on the body, feet and tail.** Form-following clusters on the bib, belly and thighs (a
   thigh highlight), toe lobes with lit pads, lit rims on the tail rings, the tail tucked clearly behind the far leg.

## Keep, don't touch
- **The raccoon head** and the cap at its tilt; the bandana; the stance (contrapposto, big planted feet); the ringed
  tail's design and position; `pumpAxis()`; `flatPaw()`.
- **Dog:** the restored iter_04 ears, the comma nostrils, the smug lid and pupils, the arched patch brow, the furry
  chestnut patch, the nose sheen, the fangs, the hair, and the navy bust with the gold car tie and the flag pin.
