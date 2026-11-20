# Judge, round 03 (the last exploration round): the final direction

Scale: ref 03's craft = 9 to 10. Baseline (judge_00): raccoon 4.0, Dog Fjord 3.5. Round 02: raccoon 5.5, dog 5.0.
Ivan asked for "far better artistic quality", so these scores are deliberately strict. A 6 means "good indie pixel
art". 7 to 8 means ref 04/05 level, and 9 means ref 03.

## Scores

| | Raccoon | Dog Fjord |
|---|---|---|
| **a**: "bat" + bandana + teal / sunk navy shoulders, gold car tie | **5.5** | **5.5** |
| **b**: cane + bandana + teal / chin up, pinstripe, red tie | **5.5** | **5.5** (the best expression) |
| **c**: lean + cap + bandana + teal / royal blue, cream chin blaze | **5.0** | **5.0** |

- **The raccoon head is still about 7** and still the best thing in the project. Everything below it is still about
  4, which is why the total hasn't moved: the bodies are shapeless fur sacks with torn-paper edges. The new poses
  fixed the face-covering problem but not the anatomy.
- **Dog Fjord now reads as a bulldog and as smug** (the underbite fangs, the low lid, the nose rope, the stop crease).
  That is a real gain in character. It is held back by three new drawing problems: the tusk-like flews, pig ears
  and, on b, pig nostrils and a stacked chin.

## Variant notes (strict)

### Raccoon
- **a, the "bat":** it doesn't read as a bat on the shoulder. The pump stands almost vertical beside the head
  (about 15° off vertical), so it reads as "holding a pump upright", which is round 01 A again.
  - The gripping hand (hero ≈ 330–560, 660–860) is pasted on the bandana knot with no forearm, so it floats.
  - The hip fist (≈ 910–1140, 990–1210) is a dark blob with 3 grey slots.
  - The foot pokes out under the belly as a short L-pipe with the hose, and doesn't read as the pump's foot.
  - The pose has the most attitude of the three, but only from the head.
- **b, the cane:** this is the most readable and appealing silhouette, and it has the best hands of the whole loop
  (the fingers curl over the bar, with lit knuckles and claws). But:
  - The pump is a toy. It is about 60 design px tall, and the raccoon dwarfs it.
  - The raccoon has **no legs or feet**, so a floating fur bust hovers behind a pump that stands on the floor. That
    contradiction is why it "looks small".
  - The torso sides are jagged torn-paper islands (hero ≈ 450–600 and 1000–1100 at y 820–960).
  - The attitude is neutral.
- **c, the lean:** it is fun, the cap is great, and leaning on the handle is a nice idea. But the pump only reaches
  the shoulder of a figure that floats beside it, the elbow carries no weight (no fur squash, no lean in the body),
  and the far paw lies on the belly like a sticker.
- **All three:** no shoulder structure, no chest or waist or hip, the arms come out of the fur at random heights, and
  the silhouette is tufted evenly *all the way round* (fur everywhere means fur nowhere). Ref 03 tufts only the
  cheek ruffs, the ear fringes and the brow, and keeps the rest of the silhouette calm.

### Dog Fjord
- **The flews read as tusks.** Both sides are long vertical pink drops that taper to a point, hanging at the jaw
  sides like walrus tusks (a: the left one from about crop (60,470) to (110,700), the right one from (530,470) to
  (610,760); b and c the same). Real flews are **soft, heavy drapes**: broader than they are long, a rounded U-shaped
  lower edge, the lowest point near the mouth corner, sagging over the lower lip and merging into the jowl. They are
  never a prong with a tip.
- **The ears drifted away from iter_04.** They are now rounded horizontal flaps with a dark oval "ear hole" inside,
  which reads as pig or teddy. iter_04 (`ref_iter04_hero.png`) has **triangular folded flaps**: a straight top edge
  coming out of the head side just under the hair, angled out and slightly down, ending in a **pointed tip**, with a
  lit upper plane and a darker maroon underside. There is no visible inner hole. Restore that shape exactly (position,
  angle, pointed tip) and keep only the shading upgrades.
- **b's nose from below has two round holes on a flat front face, which is a pig snout.** A dog nose seen from below
  has **comma-shaped slits curving out to the sides** and a central groove splitting the lower edge. Keep the
  chin-up angle, but fix the nostrils.
- **b's chin is 3 or 4 stacked parallel bands** (the double chin plus the chin plane plus the jowl creases) filling
  the bottom third. That is banding, and it is crowded. Use one chin mass with one crease.
- **c's cream chin blaze** reads as a beard band. Drop it.
- **The smugness is back.** b's lid is the best: it sits almost at the pupil, the iris is low and sliding left, and
  the brow is arched. The fangs survive at 112 as white pixels. Good.

## Constraint checks

| Check | a | b | c |
|---|---|---|---|
| Pump straight | **Pass.** `pumpAxis`, one axis from the foot (under the belly) to the T-handle (upper left), the handle on the normal. The foot is mostly hidden, but what shows sits on the axis. | **Pass.** Vertical, with the handle level. | **Pass.** Vertical, with the handle level. |
| Pump as a real object | Chrome glints, gauge dial facing the viewer, ferrule: good. The foot reads poorly. | Good parts, toy proportions | Good parts, short |
| Dog head = iter_04 | **Partial: the outline is fine but the ears drifted** (rounded flaps with a hole in place of triangular pointed flaps) | Partial (same ears) | Partial (same ears) |
| Dog at 112 | Pass (fangs, wink, patch eye, nose distinct) | Pass | Pass |
| Nothing cut off | Pass | Pass | Pass |
| No real-person likeness | Pass, and more canine than ever | Pass | Pass |
| Raccoon faces right, smirk, mask, brows, face clear | Pass, the face fully clear | Pass | Pass |

## THE FINAL DIRECTION for rounds 04 to 10

### Raccoon: the cane pose (b), rebuilt as a standing, short-legged full figure, with c's cap
- **Pose:** the pump planted on the bottom edge of the frame at **real length** (foot plate on the floor, T-handle at
  chest height, about 100 to 110 design px tall). The raccoon **stands** behind it on two short hind legs with big
  dark hind feet planted either side of the pump's foot plate. This gives the finished bottom edge and solves "it
  looks small". Both paws are stacked on the T-handle (keep b's `flatPaw()`, at a bigger scale).
- **Attitude:** weight on one leg with the hip shifted (contrapposto), the body leaning slightly forward onto the
  handle, the head tilted a few degrees with the chin a touch up, and the eyes sliding right toward Dog Fjord. One
  elbow can flare out. "The pump is my walking stick, and I own this bike lane."
- **Proportions:** short and stout (chibi-ish). Keep the head **at least** as big as in b. Shorten the torso and legs
  rather than shrinking the head.
- **The tail comes back.** It is iconic and the full figure has room for it. It curls out from behind the hips to the
  lower right, with 4 or 5 rings that **wrap the cylinder** (curved bands, darker on the shadow side, fur breaks
  between the rings), ending in a tapered dark tip broken by lit fur strokes. Keep it well away from the hands so it
  never reads as a paw again.
- **Accents:** the red bandana plus the teal pump plus **c's cycling cap**. The cap's teal and red stripes echo the
  pump and the bandana, so it ties the palette together, and it is the one costume piece that says "rider". It also
  gives a silhouette that contrasts with Dog Fjord's swept hair. Tilt it a few degrees for attitude. The white brow
  tufts must still show under the brim.

### Dog Fjord: b's face on a's bust
- **Face:** b's chin-up head, with the smug low lid, low pupils, arched patch brow, nose rope, stop crease and
  underbite fangs. Fix: the nostrils become dog commas, not pig holes; one chin mass; soft drapes in place of the
  tusk flews.
- **Ears:** restore iter_04's triangular folded flaps (pointed tips, angled out and down, no inner hole).
- **Bust:** a's **sunk broad navy shoulders** with the **gold tie with little red cars** and the flag pin. A navy suit
  with a gold tie plays blue/gold against the raccoon's red/teal, and the car tie is the satire. Drop c's chin blaze.

---

## Top 6 fixes for round 04
1. **Raccoon: the cane pose as a standing figure.** A full-length pump (foot on the bottom edge, handle at chest
   height), short legs and planted hind feet, contrapposto and a forward lean onto the handle, a head tilt, eyes on
   Dog Fjord. Head size at least as in b.
2. **Raccoon: anatomy under the fur.**
   - Block the body in simple masses first: shoulders, chest, a waist, hips, thighs. Then lay the fur on top, with the
     arms rooted at the shoulders.
   - Keep the silhouette **calm** except for chosen tuft spots: cheek ruffs, elbow, hip, belly side.
   - The torn-paper islands on the torso sides are gone. The bib and belly are form-following clusters lit from the
     upper left, with a clear core shadow down the shadow side.
3. **Raccoon: bring the ringed tail back, drawn properly.** Curved rings that wrap the form, a shadow side, fur
   breaks, a tapered dark tip with lit strokes, curling to the lower right behind the legs, nowhere near the paws.
4. **Dog Fjord: the flews as soft heavy drapes, never tusks.** Broad U-shaped lobes that sag over the lower lip with
   the lowest point near the mouth corner and a rounded edge that merges into the jowl. Also one chin mass instead of
   stacked bands, and comma-slit dog nostrils on the chin-up nose.
5. **Dog Fjord: restore the iter_04 ears.** Triangular folded flaps, pointed tips angled out and slightly down, a lit
   top plane, a maroon underside, no inner hole. Compare side by side with `ref_iter04_hero.png` before rendering.
6. **Assemble the combination and prune.** The raccoon gets the cap, bandana and teal pump. The dog gets b's face on
   a's sunk navy bust with the gold car tie and the flag pin. Remove the unused variant branches from
   `tools/sprites/portraits.mjs` so the refinement rounds work on one clean drawing.

## Keep, don't touch
- **The raccoon head** (mask, eyes, ears, fur breaks, snout, smirk, whiskers): move it, never redraw it.
- b's `flatPaw()` hands on the T-handle (enlarge them), and the red bandana drawing.
- The cycling cap drawing (rounded panelled crown, stripes, 3-tone flipped brim, its brow shadow).
- `pumpAxis()` in real units: the chrome glints, the foot plate with pegs, the ferrule, the gauge dial facing the viewer.
- **Dog Fjord:** the underbite fangs, the smug low lid with the iris sliding left, the arched patch brow, the nose
  rope and stop crease, the furry chestnut patch, the blue-grey nose sheen, the tufted brows, dropping the folds at
  112, the hair, and the iter_04 head outline.
