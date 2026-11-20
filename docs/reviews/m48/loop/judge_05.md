# Judge, round 05 (refinement 2)

Scale: ref 03's craft = 9 to 10 (ref 04/05 about 7.5 to 8). Baseline 4.0 / 3.5. Round 04: raccoon 6.0, dog 5.5.

## Scores

| | Score | Change | One line |
|---|---|---|---|
| **Raccoon** | **6.5** | +0.5 | The pump finally reads as a pump (the chrome rod mid-stroke, the T-bar, a slim barrel), the feet are drawn, the body has values. The face's interior is still flat compared with ref 03, and the arms still don't read at the hero size. |
| **Dog Fjord** | **6.0** | +0.5 | He is now a bulldog: the wide crescent grin across the jaw, big fangs, the smug lid, planes instead of bands. But he lost his pink, the olive half-tone reads as **stubble**, and the drapes read as puffed cheeks. |

## What improved
- **Dog:**
  - The layout is right at last: the eyes at about a third of the head height, the nose below, and a wide grin from
    about x 50 to 146 (about 76% of the head width).
  - The shading is now planes: the lit front, a far side plane, and one core shadow across the jaw. The concentric
    bands are gone.
  - **The laugh is the best expression of the loop:** a wide open crescent, an upper teeth row, the lower fangs, a
    tongue, and a dark maroon interior that reads instantly.
  - The shock (round eyes with pupils, a small O, fangs on the lower lip) reads.
  - All three read at 112.
- **Raccoon:**
  - The mid-stroke pump: a 19-unit chrome rod between the cap and the bar now says "pump".
  - Toe lobes with lit pads, a lit rim down the near side, the bandana's cast shadow, occlusion between the legs.
  - The tail tucks behind the far leg.

## What still separates it from ref 03 (ranked by impact)

### 1. Raccoon face: the fur is drawn at the boundaries but the interiors are flat (the biggest gap left)
Put the close-up of the head beside ref 03:
- **Ref 03 has textured fur everywhere.** The white muzzle is full of 1 px grey strands 3 to 6 px long running from
  the nose out to the cheeks. The black mask carries lighter charcoal strands following the flow outward from the
  eyes, so it reads as fur, not paint. The forehead is streaked with alternating light and dark strands rising from
  the brow. The white brow bands are combed strokes, not a fill.
- **Ours:** `furBreak` makes nice interlocking edges *between* tones, but inside each tone the clusters are big flat
  areas.
  - The mask is 4 smooth bands (the deep socket black, two mid charcoals, the sheen) with no strands inside them.
  - The cream muzzle is a large flat field with 2 or 3 soft tone shapes (close-up ≈ 480–640, 280–420).
  - The forehead stripe and crown are smooth shapes.
  - The white brows are flat bands with a tufted edge.
- **Fix:** a strand-texture pass inside each zone, in the 2 neighbouring tones of that zone's ramp, following the
  existing flow field:
  - the muzzle: grey strands radiating from the nose;
  - the mask: lighter charcoal strands sweeping out and back from the eye corners, sparse, and denser on the sheen;
  - the forehead: strands rising and fanning from the brow;
  - the brow bands: combed strokes with a darker strand or two;
  - the cheek ruffs: longer strokes.
- **Keep it clean:** cluster the strands (2 or 3 parallel strokes together, then a gap), never uniform. Leave a calm
  zone of 2 to 3 px round each eye and the nose so the focal points stay crisp. Scale the density with `c.S`, so k = 1
  gets about half and 112 gets none.

### 2. Dog Fjord's skin lost his pink identity, and the half-tone reads as stubble
- **The palette went dusky.** The large mid tone is now a greyed salmon-tan, the lights are peach-ochre that reads as
  tan, and the shadows are mauve. Overall he reads as a tan or grey-mauve dog. "Big pink bulldog head" is part of his
  identity.
  - Keep the hue-shift *structure*, but: **the lights a clear warm pink-peach** (pink first, peach second); **the mid a
    clean pink** about one step less saturated than round 04's candy salmon, not two or three steps; only the shadows
    turning to mauve.
  - The ochre should be a whisper in the very highest light (the forehead dome hot spot, the nose rope top), not a
    whole light tone.
- **Yes, the olive half-tone reads as stubble.** The ochre-olive key `9` is placed as a stippled, broken 1 to 2 px
  band along the top edge of the jaw shadow (close-up ≈ y 590–640 across the whole jaw) and on the far cheek
  (≈ 700–860, 470–570). Stippled, darker-than-skin dots on a jaw line read as a five-o'clock shadow, and a human beard
  shadow also pushes him toward a human face, which we want to avoid.
  - **Remove the olive.** On pink skin the half-tone (the terminator) should go **warmer and slightly more saturated:
    a rosy red**, not olive. Make it a clean continuous cluster 1 to 3 px wide that varies in width with the form, not
    a stipple.
  - If fur texture is wanted on the jaw, use short strokes in the skin's own pink and mauve tones, never a darker
    off-hue speckle.

### 3. Dog Fjord's drapes read as puffed cheeks
- The two lobes are rounded C shapes at the **same height** as the mouth, beside its corners, with a dark crease
  around their inner edge. Each lobe's top bulges above the lip line. So they read as smiling cheek pads (as in a
  human grin), not as hanging lips.
- **Flews hang.** Each drape should come down from the upper lip at the corner and **overlap the mouth corner and
  the end of the tooth row**, its lowest point clearly *below* the lower lip line. The lit top slopes downward and
  outward, the crease tapers along the upper/inner side only, and the lower edge melts into the jaw shadow. The fang
  pokes up just inside the drape's edge. This applies to grin, laugh and shock alike. In shock the drapes should hang
  even longer: a slack jaw.
- In the laugh, the drapes can lift slightly (the mouth stretched open), but they should still hang over the corners.

### 4. Raccoon arms still don't read at the hero size
- On the close-up (≈ hero 400–1100, 600–1000), the upper arms are the same taupe as the torso. Their outer edge
  merges into the body's edge tufts, and the forearms are short and mostly behind the paws. The arms read as darker
  side panels of the body.
- **Fix:**
  - One value step between arm and torso (the arms darker, since the limbs are the darker fur on a raccoon).
  - A **lit rim along the upper arm's outer edge**, and a dark occlusion crease where the arm's inner edge overlaps
    the chest.
  - The **elbow breaking out of the body's silhouette** as a clear angle with its tuft.
  - A sliver of forearm visible above each paw (bend the wrists down over the grips).

### 5. Raccoon body still plainer than the head
- The bib and belly have some strokes now, but the body's value range is narrow and the fur density is a fraction of
  the head's.
- Use the same strand language as fix 1, at about half the head's density.
- One more turning-under shadow shape at the belly.
- Stronger highlight clusters on the near thigh and shoulder.
- The T-bar grips should poke out clearly past the paws, with a lit grip highlight, so the "T" reads. Knuckle
  highlights on the paws, one value lighter.

### 6. Dog: the smaller rendering items
- **Teeth:** the grin's teeth are a large flat white field with a pale grey lower band and tick separations, which
  reads as human, toothpaste-ad teeth. Add:
  - the upper lip's shadow as a clear band across the top of the teeth;
  - cooler grey toward both corners (the teeth turn away);
  - softer separations (one value, not dark ticks);
  - a hint of gum at the corners.
- The forehead folds are faint. Give them one stronger shadow-shape pair.
- Bolder comma nostrils at k = 1.

## Constraint checks
| Check | Result |
|---|---|
| Pump straight | **Pass.** Vertical axis: T-bar level, rod, caps, barrel, gauge and foot plate collinear on the close-up. |
| Pump as a real object | **Pass.** It reads as a floor pump mid-stroke (the barrel is still short, but acceptable). |
| Dog head = iter_04 | Pass (outline and ears) |
| Dog at 112 | **Pass, all three.** The wink, the patch eye, the nose, the wide grin, the fangs, the laugh's open mouth and the shock O are all distinct. |
| k = 1 | Pass. The raccoon reads. The dog's nostrils are faint. |
| Nothing cut off | Pass |
| No real-person likeness | Pass, **but** the stubble half-tone is a human cue: remove it. |
| Raccoon faces right, smirk, mask, brows, face clear | Pass |

## Top 6 fixes for round 06 (ranked by impact; five rounds remain)
1. **Raccoon face: interior fur-strand texture** (muzzle, mask, forehead, brow bands, ruffs) in the zone's neighbouring
   tones, following the flow and clustered. Keep calm zones round the eyes and nose, and scale the density by `c.S`.
   This is the biggest single step toward ref 03.
2. **Dog skin: bring the pink back.** Clear warm pink-peach lights, a clean pink mid one step less saturated than
   round 04, mauve only in the shadows. **Delete the olive stipple** and use a clean rosy-red terminator cluster
   instead (it is the stubble).
3. **Dog drapes that hang:** overlapping the mouth corners and the tooth-row ends, bottoms below the lower lip line,
   a downward-sloping lit top, the crease only on the upper/inner side. Apply to grin, laugh and shock (longest in
   shock).
4. **Raccoon arms that read:** a value step against the torso, a lit rim on the upper arm's outer edge, an occlusion
   crease at the inner edge, elbows breaking the silhouette, a sliver of forearm above each paw.
5. **Raccoon body to the head's standard:** strand texture at half density, a wider value range (thigh and shoulder
   highlight clusters, a belly turning-under shadow), the T-bar grips clearly visible past the paws, lighter knuckles.
6. **Dog teeth and details:** the upper lip's shadow band on the teeth, cooler corners, soft separations, a hint of
   gum, stronger forehead fold shapes, bolder nostrils at k = 1.

## Keep, don't touch
- **Dog:** the new layout (eye, nose and mouth positions, the wide crescent), the plane structure (the lit front, the
  far side plane, one jaw core shadow), the laugh, the shock eyes, the fangs, the smug lid, the iter_04 ears, the
  hair, and the bust.
- **Raccoon:** the head's drawing (strands are added *on top*; the shapes don't change), the cap, the bandana, the
  stance, the feet, the tail, and the mid-stroke pump with the visible rod.
