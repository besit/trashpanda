# Critic, pass 2 (M4.10 raccoon style study)

What I looked at:
- `compare_pass2.png`
- each style's `pass2_hero.png`, `pass2_1x.png` and `painter_pass2.md`
- fresh zoomed crops of the face (k 1.5, x 110..320, y 85..185) and of the arm, paw and bib (x 90..250, y 175..265)
- the pass 1 crops, for comparison

The scales are the same as in pass 1:
- **Own** = how well the style hits its own target.
- **Common** = one quality scale where ref 03 = 9.5, ref 01 is about 7.5 and pass 0 is about 4.5.

| style    | own p1 → p2 | common p1 → p2 | colours p1 → p2 |
|----------|-------------|----------------|-----------------|
| ref03    | 5.5 → 6.0   | 5.5 → 6.0      | 38 → 37         |
| ref04    | 6.5 → 7.5   | 5.5 → 6.5      | 28 → 28         |
| naive    | 7.0 → 7.5   | 5.0 → 5.5      | 13 → 11         |
| detailed | 5.0 → 6.0   | 4.5 → 5.0      | 73 → 52         |
| free (the synthesis) | 5.0 → 7.0 | 4.5 → 7.0 | 38 → 36  |

**The big result: the two biggest gains came from the painters who threw away the computed light and drew the shadow
shapes by hand** (free and ref04). The painters who kept the old value-map pipeline and corrected it (ref03, detailed)
gained half a point to a point.

---

## ref03: own 6.0, common 6.0 (+0.5 each)

**What improved**
- **The mask is solid near-black now.** The horizontal streaks are gone. The mask, against the blue-white muzzle, is the
  strongest contrast in the study and the face wins at 1x.
- **The snout facet is gone.** The snout reads as one cylinder.
- **The nose is drawn as planes.** It has a slate top, a black front, nostrils, a reflected rim and a glint. This is a
  real improvement and now the tip of the face holds.
- **The fur is clumps, not scratches,** in most places. The shared violet dark ties the materials together.

**What still fails**
- **The near cheek and muzzle still look scratchy.** The white flecks on the cream (x 140..230, y 140..175) are 1 to 2 px
  marks, not 3-px locks. At 4x they still read as scratches on a white surface. Ref 03's whites are calmer.
- **The paw reads as a mechanism.** The four fingers are grey cylinders with dark splits (x 175..215, y 200..245). At
  4x it looks like a wrench gripping the barrel. At 1x it is a grey patch. It is drawn as parts again.
- **The arm is still pass 0's slab.** It is a big light L wrapped round the chest, with wood-grain light on it.
- **The scarf is still beaded,** and the ear hollows are hatched.

**Verdict:** the best *face rendering* of the study, on the weakest *construction*. The technique hit its limit
because the body underneath was not redrawn.

---

## ref04: own 7.5, common 6.5 (+1.0 each)

**What improved**
- **The head is redesigned.** It is rounder and 8% bigger, with a shorter, rounder muzzle and a big round nose. The ears
  are rounder with one dark hollow and a pink fold. This is now a likeable cartoon character, and the strongest
  silhouette of the five.
- **The shadow shapes are designed, not thresholded.**
  - The head has one shadow shape.
  - The muzzle has two tones.
  - The tail has one continuous underside band, so the checker is gone.
  - The far half of the body is one shadow.
  The stair-stepped slivers of pass 1 are gone.
- **Inner lines are chosen by a rule:**
  - black where the pump, face features or the head over the scarf need one
  - a 1-px dark coat tone where fur meets fur of the same value
  - nothing elsewhere
  The outlined tube arm and the outlined bib wedge are gone. pixelcheck is clean.
- **The grin is still the only real expression in the study,** and it reads at 1x on every poster.

**What still fails**
- **The body is now under-described.** With the arm lines removed, the forearm reads only by a colour change against
  the bib. At 4x the chest (x 120..190, y 200..250) is a confusing set of flat beige shapes with a shadow notch at the
  elbow. The arm has to be *drawn* as a shape before the lines can go.
- **Only the head is chibi.** The body and tail keep the semi-realistic M4.9 proportions, so the figure looks like two
  styles stacked.
- **The scarf is still a flat green strip.** The knot and fringe are too small to read.
- **The mask is one large solid dark shape.** That fits the style, but it is heavy.

**Verdict:** the most appealing and most game-ready sprite. Ivan may find it the most cartoon and least "drawn from
shades" of the top three.

---

## naive: own 7.5, common 5.5 (+0.5 each)

**What improved**
- **The arm is redrawn by hand** as one blob. The tube fold and its notch are gone.
- **The paw is now coat shadow,** with three knuckle bumps and two splits. It sits on the barrel and grips. It no longer
  outshouts the face.
- **The snout underside is the shadow, and its top edge is the mouth.** This is the neatest idea of the round: one edge
  does two jobs. The sticker patch is gone.
- **The lower face has one plane change** (the jaw and far cheek in cream shadow), so the head has form.
- **The 2-px shadow-side outline** fixes the purple-poster read.
- **11 colours,** reused across materials. This is still the cleanest file in the study.

**What still fails**
- **The cream pocket inside the arm's crook** (x 135..185, y 210..235) is still a separate bright shape: the
  "assembled" leftover.
- **The scarf end is a big dark flap,** and the far arm is a vague bump.
- **At 1x the expression lives only in the eyes.** The mouth is thin.
- **The ceiling of the style is lower.** With two tones per material there is no room for the "far better artistic
  quality" Ivan asks for. It is a fine game sprite, not a showpiece.

---

## detailed: own 6.0, common 5.0 (+1.0 own, +0.5 common)

**What improved**
- **52 colours, with wider bands.** The felt look has become readable clumps.
- **Focal order exists now:** clumps are full at the face and the marking edges, thin on the bib and lower body, and
  none in the mask interior.
- **The snout lilac facet is gone,** and the nose is four crisp planes instead of a pillow ball.
- **The forearm is a cylinder** with a core shadow and bounce light.
- **The pump is still the best prop rendering of the study:** chrome profile, ribbed rubber, pinstripes, a full gauge.

**What still fails**
- **The muzzle and near cheek are still busy.** Many small light and dark marks cover the cream (x 140..290,
  y 130..180), and at 1x it reads as mottled felt. The face is the focal point, but it is the *noisiest* area, not the
  *clearest*. A focal point should be the place with the highest contrast and the cleanest shapes, not the most marks.
- **The arm still wraps a triangle of bib.** The construction is pass 0's, as the painter says.
- **The scarf knit reads as mottling at 1x.**
- **The overall value range is narrow.** The coat, cream and brow ramps sit close together, so the figure reads greyish
  and flat on the posters, especially on red.

**Verdict:** the study's proof that detail is not quality. It is the most work and the second-lowest score.

---

## free, the synthesis: own 7.0, common 7.0 (+2.0 own, +2.5 common)

The target for this pass was the critic's hypothesis:
- ref04 and naive shape discipline
- ref03 eyes
- a shared shadow family
- detailed's pump
- about 36 colours
- fur only at edges

**What improved**
- **It looks drawn from shades, not assembled.** This is the first picture in four loops where that is true over the
  whole figure:
  - The arm, chest and body are one coat mass, separated by light and cast shadow, not by lines.
  - The cream triangle is gone.
  - The only inner lines are on the pump and the gripping paw.
  This is exactly Ivan's stated taste.
- **The paw finally grips.** Four finger bumps over the barrel's top edge, the thumb under it, the barrel showing above
  and below, and a cast shadow on the barrel and gauge. It reads as a hand at 4x and as a grip at 1x.
- **The face is the clear peak.**
  - A solid indigo mask against the brightest cream.
  - ref03-quality eyes with eyeshine glowing low in the iris.
  - The nose in planes.
  - The snout as one cylinder with a single terminator. No facets anywhere.
- **The shared indigo shadow family works.** The far third of the figure is one shadow shape across the coat, cream,
  scarf and body, and the colours feel like one light in one place.
- **The pump keeps detailed's materials,** in fewer tones. The chrome, ribbed grips and gauge all read.
- **The rim light is inside the outline** and limited to the far contour. The pass 1 misregistration halo is gone.
- **The 2-px outline** holds the figure on all three posters.

**What still fails**
- **The expression is a thin smirk.** At 1x it is a short dark line. The painter knows this. It needs ref04's lesson: an
  open corner of 2 to 3 px, or a stronger cheek bulge.
- **The fur clumps are too regular.** Along the bottom edge of the mask (x 120..230, y 140..148) and on the tail ring
  edges, the wedges sit at an even spacing with even lengths, so they read as a comb or a sawtooth. Ref 03's locks vary:
  - in length (3 to 9 px)
  - in spacing
  - in grouping (pairs and triples, then a gap)
- **The scarf is plain:** a green band with a top roll, no folds at the knot.
- **The lower body's half-light plane** (x 120..200, y 250..290) is a little large and flat.
- **The mask's indigo** is very saturated next to the warm coat. It reads a touch "night filter" on the blue poster. Pull
  it 10 to 15% toward neutral.

---

## Final ranking

**Best at real size on the posters**
1. **ref04.** Its 2-px warm-black line, three-tone cel shapes and white-sclera eyes plus open grin survive any
   background.
2. **free.** The 2-px outline, the solid mask on bright cream and the glowing amber eyes give it the strongest
   value read. It loses to ref04 only on the expression.
3. **naive.** It is clean and clear, but very quiet.

Then ref03 (its face reads, its body is grain) and detailed (mottled and greyish).

**Most appeal and character**
1. **ref04.** The round head, big sly eyes and grin make it the only one with a *personality you can name* at 1x.
2. **free.** The sly lid and the eyeshine give it a more grown-up, cool character.
3. **naive.** The smug lidded eyes are charming but quiet.

**Closest to professional pixel art**
1. **free.**
   - one designed light
   - a coherent shared palette
   - no inner lines
   - the face as the peak
   - designed shapes everywhere
   - crisp materials on the prop
   - clean clusters
   It is the only one where nothing reads as a tool artefact (no facets, no grain, no halo, no scratches).
2. **ref04.** It is a clean, consistent game sprite, but the arm and chest are under-described and its proportions are
   mixed.
3. **ref03.** It has the best rendering of the face, but its construction is still pass 0's.

**My recommendation for the game's hero portrait: free pass 2 (the synthesis), with three changes taken from ref04.**
- **Why free:** it is the only version that meets all of Ivan's taste rules at once:
  - drawn from shades, one light
  - not assembled
  - crisp, not airbrushed
  - minimal inside, rich at the face
  It also has the highest ceiling. Every remaining weakness is a local fix, not a construction problem.
- **The ref04 changes:**
  1. An open smirk corner (2 to 3 px of mouth, a hint of tooth) and a 1-px cheek bulge, so the character reads at 1x.
  2. A touch of ref04's rounder head: about 4 to 6% on the head and the muzzle tip, not the full chibi.
  3. A scarf with a designed knot: two folds and a notched fringe.
- **Plus two fixes of its own:** vary the fur clumps (length, spacing, grouping), and neutralise the mask indigo a
  little.

If Ivan prefers an outright cartoon look for the game, ref04 is the alternative. It needs its arm and chest redrawn as
one shape first.
