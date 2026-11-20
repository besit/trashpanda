# Critic, round 04 (refinement: no rim, thick tail, arm vs bib, dog shadow plane)

Looked at: `iter_04{,_hero,_values,_favs}.png`, `painter_04.md`, 4x crops of the raccoon's face and of its body and
tail, and pixelcheck (`pc04/`). Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are unchanged; the palette only
adds keys (`ª º »`).

Art coordinates are in the k = 1.5 picture (348 x 312).

## Scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | raccoon | Dog Fjord |
|---|---|---|
| baseline | 4.5 | 4.5 |
| Ivan's favourites | 5 | 5.5 |
| round 03 | 5.5 | 6.5 |
| **round 04** | **6.0** | **7.0** |

## Overall

**A clean recovery. It reads as light, not as parts.** In the values view:
- the raccoon has one lit side and one shadow side through head, body and tail;
- the forearm reads by its lit top edge and its cast shadow on the bib, and the paw is visible again;
- the dog is one lit egg with a single shadow shape that wraps the far side and the underside of the jowls, with
  reflected light under the jaw.

The halo is gone. The dog's far side now reads as **shadow** (rose-mauve, about 1.5 groups down, with an edge that
tucks under the brow and swells round the cheek). The dog is at the level of a clean indie portrait (ref 04).

What is left between here and "striking" is no longer method. It is **appeal and focus**:
- the faces are correct but quiet;
- the eye has no special place to land;
- the lower raccoon is as bright and busy as the head;
- the silhouette has no character beats.

## What is still off
- **The tail and bottom-edge tufts form a regular sawtooth.** On the tail they are same-size triangles on every
  segment, so the tail reads like a pinecone or a saw. Its top end is a flat, cut-off cap with a dark band, not a
  soft point. The body's bottom edge is the same rhythm. It looks mechanical (agreed with the coordinator).
- **The lower body is still stacked strips under the forearm** (art ~(100 to 200, 220 to 260)): forearm, dark band,
  tan band, shadow plane. It reads better than round 03 but still busy, and it is as bright as the face.
- **The far scarf end is a green blob.** Since the fringe went, it hangs at the far shoulder (art ~(220 to 240, 150 to
  185)) like a bag. The scarf's loop under the pump has a jagged dark top edge.
- **The dog's lower-left jowl has 3 to 4 stacked thin light/dark strokes** (art ~(60 to 100, 185 to 240)): contour
  lines again, the busiest spot on his head. The forehead has 3 to 4 wavy lines: 2 are enough.
- **The dog's teeth are uniformly grey-lilac**, so the grin, his best feature, is a bit dull compared with iter_01's
  bright crescent.

## The 3 moves that would lift the art from "clean" to "striking" (ranked by impact, appeal first)

1. **Make the face a jewel: eyes and expression.** Ref 03 works because the eyes are the brightest, most finished
   thing in the picture. Ours are small, flat amber discs under a heavy lid.
   - **Raccoon eyes:**
     - The iris +15 to 20% larger.
     - A crisp 2x2 catchlight at the upper left, plus a 1-px secondary one.
     - A dark limbal ring.
     - The iris glowing on the side opposite the catchlight: a light-amber crescent at the lower right, where light
       passes through the cornea.
     - The lower lid a thin lit line.
     - The upper lid a thick, expressive dark shape that sets the smug half-lid.
   - **Raccoon brows and mouth:**
     - Asymmetric white brows: the near brow a touch higher (cocky), the far brow lower.
     - A real smirk: the far mouth corner tucked up into a small cheek bulge with a 1 to 2 px dimple shadow, and
       optionally a sliver of a fang at the corner.
     - Concentrate the finish around the eyes: 4 to 6 lit fur clusters breaking the mask edge, the white brow stripes
       the brightest value on the figure, and a crisp light/side plane break on the muzzle top.
   - **Dog:**
     - The patch eye larger and glossier, with a catchlight.
     - The middle lower teeth near-white, with the upper lip's shadow on the top row (contrast inside the grin).
     - The nose with a sharp specular plus a faint reflected-light edge on its underside.
2. **Light falloff toward the bottom: focus by value.** The brightest light and the highest saturation belong at the
   face. Let the light fall off down the figure:
   - the raccoon's lower body, the tail's lower half and the bottom tufts one tone darker and a little cooler;
   - the stacked strips under the forearm merged into one shadow shape;
   - on the dog, the suit's lower part and the bottom of the jowls a step darker.

   This is the single cheapest move toward ref 03's look (there, everything outside the face is subdued). It also
   calms the busy lower half without new detail.
3. **Silhouette character: a few story beats.** The raccoon's outline is a correct but generic bust. Cheap, strong
   beats:
   - a nick (notch) in the far ear: a street-raccoon cue;
   - the ears angled differently (the near one slightly back = attitude);
   - the scarf end designed as a shape with movement, a tapered end flicking out and down;
   - optionally a few degrees of head tilt toward the dog (the VERSUS posters: he squares up to Fjord).
   
   For the dog the hair swoop already gives character. Keep it.

## Ranked fixes for round 05

1. **The face-focal pass** (move 1) on both characters. Raccoon: eyes, asymmetric brows, smirk with a cheek bulge,
   lit mask-edge clusters. Dog: patch eye, grin contrast, nose.
2. **Light falloff** (move 2). Merge the lower-body strips into one shadow shape. Push the lower body, the tail's lower
   half and the bottom tufts one tone down and cooler; push the dog's suit bottom and jowl bottom a step down.
3. **Hand-placed tufts instead of a sawtooth.**
   - Tail: 5 to 6 tufts on the outer curve, of varied size (big, small, medium, a pair), each a curved hook pointing
     along the growth direction toward the tip, not symmetric triangles. The tip a soft tapered point, not a flat cap.
   - Bottom edge: 4 to 6 tufts of varied size, two of them clustered, curving outward.
4. **The scarf end and the scarf loop.**
   - The far end: a tapered hanging end with one fold and 3 or 4 short fringe strands, flicking slightly outward.
   - The loop under the pump: one lit top plane and one shadow under-fold, with a smooth top edge instead of a jagged
     one.
5. **Simplify the dog.** The lower-left jowl gets one groove (the smile line) with its lit lip; remove the other
   stacked strokes. The forehead gets 2 lines.
6. **Character beats (move 3) and clean-up.**
   - The far-ear nick, the ear angles, and the scarf flick from fix 4.
   - pixelcheck, raccoon: 9 orphans ((109,167) (113,169) (114,169) at the bib bottom, (53,197) (50,198) (43,223)
     (37,268) on the tail, (276,51)) and 4 jaggies on the lit-side contour ((139,29) (132,49) (129,60) (100,126)).
   - pixelcheck, dog: 1 orphan (98,92) and 2 jaggies ((106,82) (169,141)).

## Constraint checks

| check | result |
|---|---|
| Pump yellow, straight | pass. The barrel streak is now short; good |
| Face clear of the pump | pass |
| Raccoon faces right, smirk, mask, white brows | pass |
| Inside 232x208, finished bottom | pass |
| Dog head shape, low ears, compact swept hair | pass |
| Dog traits (wink, heart patch, nose, grin, navy suit, white shirt, red tie) | pass |
| No real-person likeness | pass |
| 112 x 100 | pass. The lit/shadow split, wink, patch and grin read at 1x |
| Game untouched; palette additions only | pass |

## Keep, don't touch
- The light design: one light and one shadow side per figure, hand-placed terminators, no rim, reflected light only
  inside the shadows (tail underside, under the jowls).
- The raccoon's arm: coat-tan forearm, lit top edge, crisp cast shadow on the cream bib; the paw grip.
- The tail's bulk, its C-curl and its bowed rings. Only the tufts and the tip change.
- The coat's shadow hues (`ª` / `º`). The warm tan crown and dark stripe, the cream muzzle with its lilac shadow.
- The dog's far-side shadow plane and its edge, the `9` lens at the cheek ball, the cheek-top highlight, the hair
  specular, the wink, the heart patch, the red tie.
- The yellow pump with its short specular, and the light-grey gauge.
- The method: material map x one value map, hard bands, no internal outlines, no dither.
