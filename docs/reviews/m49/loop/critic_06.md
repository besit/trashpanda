# Critic, round 06 (calming the raccoon's body)

Looked at: `iter_06{,_hero,_values,_favs}.png`, `painter_06.md`, 4x crops of the raccoon's body and tail, and the overview
crops of the small sizes (raccoon k = 1, dog k = 1, and the dog at 112 x 100 in grin, laugh and shock, at 1x and 2x) and
of the k = 1.5 laugh and shock. pixelcheck on the raccoon and on all three dog expressions (`pc06/`).

Game check: `portraits.mjs`, `src/` and `draw2d.mjs` are unchanged; no new palette keys.

Coordinates are in the k = 1.5 picture (348 x 312).

## Scores (fixed scale: ref 03 = 9.5, ref 04 = 7.5)

| | raccoon | Dog Fjord (grin) |
|---|---|---|
| baseline | 4.5 | 4.5 |
| Ivan's favourites | 5 | 5.5 |
| round 05 | 6.5 | 7.5 |
| **round 06** | **7.0** | **7.5** |

The dog's other expressions: laugh **7.0**, shock **6.5**.

## Overall

**The most coherent raccoon yet** (agreed with the coordinator). In the values view it is one lit figure from ear to
tail:
- the head is the contrast peak;
- the lower body has its dim lit belly and its shadow plane back;
- the tail is one striped tube with one light band along the outer side and a soft rounded tip;
- the scarf now has a knot and a short, weighted end;
- the far ear reads as an ear in shadow, with a clean nick;
- the smirk is a crease shape, no longer a drawn line.

Nothing reads as "assembled parts" any more. It now sits at about ref 04's level, with Ivan's iter_02 pose and vibe
intact. The dog grin is stable.

**Small sizes:**
- The raccoon at k = 1 reads well: the eyes, mask, smirk, yellow pump, scarf and tail are all clear.
- The dog at 112 x 100 reads in all three expressions. **But laugh and shock are visibly the least finished pictures
  in the set.** They are the only place where the old "parts" logic survives.
  - **Laugh:** the mouth is a flat cut-out. The top teeth are a white band and the tongue a flat light red, with no
    shadow from the teeth into the mouth, no lit lower lip, and the cheeks don't push up, so only the mouth laughs.
  - **Shock:** the eyes are white discs with a grey outline ring, a drawn sticker. The near eye's white is greyish and
    low in contrast. The "o" mouth is small and the brows barely rise, so at 112 it reads as mild surprise, not shock.

## Ranked fixes for round 07 (short, low-risk, appeal first)

1. **Dog laugh: light the mouth and make the face laugh.**
   - A dark cavity band directly under the upper teeth: the teeth cast shadow into the mouth.
   - The tongue as a lit dome: lighter at its front and top edge, a 1-px midline crease, darker where it goes back.
   - A lit lower lip edge, one tone up.
   - The cheeks pushed up: the cheek-top highlight and the smile creases 3 to 4 px higher, so the eyes squint into the
     cheeks.
   - Check at 112 x 100.
2. **Dog shock: make it read as shock at 112.**
   - The "O" mouth about 1.5x taller and a bit wider: a dark interior, a sliver of the upper teeth lit at the top, the
     lower lip lit.
   - The brows higher and more arched (+3 to 4 px).
   - The eyes defined by value, not by a ring: whites at the top tone (`W`), no grey outline. Keep the tiny pupils and
     add a 1-px catchlight.
   - Optional and cheap: one small lit sweat drop at the near temple, with a highlight.
3. **Raccoon lower body: remove the jagged thin light strip** between the forearm's cast shadow and the lit belly
   (around art (114 to 184, 268 to 282), with a spike at about (123,281)). The cast shadow should sit directly on the lit
   belly plane: one crisp edge, no sliver.
4. **Raccoon paw: refine the silhouette.** It is still the bulkiest, blockiest shape on the figure. Show 3 rounded
   knuckle bumps against the yellow barrel, overlap the thumb tip onto the top of the barrel, and slim the wrist by 1
   to 2 px. Keep the light (lit knuckle tops, shadow where it wraps). Silhouette only.
5. **Clean-up of the persistent pixelcheck items** (some have survived 3 rounds):
   - Raccoon orphans: (252,17) and (223,44) at the far ear's tufts and nick; (109,167) (113,169) (114,169) at the bib
     bottom (left since round 04); (255,109); (155,296).
   - Raccoon jaggies: (134,32) (173,41) (100,126) (61,289).
   - Raccoon holes: (290,156) and (290,158) are new, at the chin tuft: fill them. (306,143) is the whisker:
     acceptable.
   - Dog (all three expressions): orphan (98,92) and jaggy (106,82), there since round 02.

Round 08 can then go to a final look at both faces at 1x. Round 09 is a safety margin, and round 10 is polish only.

## Constraint checks

| check | result |
|---|---|
| Pump yellow, straight | pass |
| Face clear of the pump | pass |
| Raccoon faces right, smirk, mask, white brows | pass |
| Inside 232x208, finished bottom | pass (hand-placed bottom tufts, nothing cut) |
| Raccoon at k = 1 | pass |
| Dog head shape, low ears, compact swept hair | pass |
| Dog traits (wink, heart patch, nose, grin, navy suit, white shirt, red tie) | pass |
| Three expressions render; 112 x 100 readable | pass. Grin reads well, laugh reads, shock reads only as mild surprise (fix 2) |
| No real-person likeness | pass |
| Game untouched; palette additions only | pass |

## Keep, don't touch
- **The raccoon's whole head:** the eyes (iris, ring, glow, catchlights, lid), the asymmetric white brows, the mask
  wedges, the muzzle top plane, the nose, the crease-shape smirk with its lit lip and cheek dome, the near ear, the far
  ear with its nick in shadow.
- **The raccoon's body light:** the terminator from the far shoulder to the bottom centre, the dim lit belly against
  the shadow plane, the gentle falloff, the forearm with its lit edge and cast shadow on the cream bib.
- **The tail:** `curveTubeField`, one light band, colour-only rings, 5 irregular hooks, the rounded tip.
- **The scarf:** the knot, the short weighted end with its fold and fringe, the smooth loop with the chin shadow.
- **The yellow pump** with its short streak and the light-grey gauge.
- **Dog grin:** the far-side plane wrapping under the jowls with one reflected band, the cheek lens, the patch eye with
  its catchlight, the lit middle teeth, the nose, the one forehead fold, the hair specular, the suit falloff.
- The method.
