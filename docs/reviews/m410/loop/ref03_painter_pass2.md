# ref03, pass 2: the painter's notes

Snapshot: `art/history/raccoon_style_ref03/v02`. Renders: `pass2_hero.png`, `pass2_1x.png`, `pass2_values.png`.

pixelcheck at k=1.5:

| finding        | count |
|----------------|-------|
| orphan         | 2     |
| jaggy          | 4     |
| near-duplicate | 0     |
| colours        | 37    |

The 24 nubs and 33 strips are the tufted outline, the same as in pass 0.

## What changed, following critic_pass1.md

### 1. The drawing first (study-wide finding)
- **The snout facet is gone.**
  - Cause: the melted height volumes left the back half of the snout at ambient light. That made a dark wedge with a straight edge, the facet the critic flagged at (260,132)–(218,172).
  - Fix: the snout's light is now drawn as a cylinder lying along x, lit on top and falling off toward the nose. Its underside is a curved terminator that follows the cylinder.
  - The snout no longer casts a shadow on the cheek, because it grows out of the face. A soft jowl crescent sits under its back half instead.
  - The head's shadow shapes are smooth hand-placed curves (`blob`), not polygons: the far cheek, plus a crescent under the jaw.
- **The paw grips.** It is drawn as a hand:
  - the back of the hand rises from the wrist below the barrel
  - four fingers wrap across the barrel's face, each a small cylinder lit on its handle side, with a dark split between fingers
  - the tips darken where they curl over the barrel's far edge
  - a knuckle crease runs where the fingers leave the hand
  - the thumb's ball sits low on the near side
  - three 1-px finger splits are drawn by hand so the fingers still read at 1x
- **The forearm** gets a core shadow a few px above its lower edge, then a strip of light bounced up from the belly. It reads as a cylinder now, not a plank.
- **The bib** is now only the upper chest under the scarf. The forearm lies on coat, so no cream triangle is framed by the arm.
- **The tail rings** have their own ramp (`ring`, Ο to Δ). They turn with the tail's light, so they are no longer flat black stripes.

### 2. Fur as clumps, in focal order
- **The strand field makes locks, not scratches.**
  - Locks are 3 px wide at k 1.5 and 2 px at k 1, and 4 to 9 px long.
  - About 60% of the segments hold a lock. The rest is calm.
  - Each lock is a wedge: full width at its root, tapering to a 1-px tip downstream.
  - The tone change is at the root (lighter or darker), inside the lock.
  - 1-px accents are now 1 in 30 (was 1 in 10), and appear only near an edge.
- **Detail follows the focal order.** I compute the distance to the nearest band edge or marking edge: a terminator, a cast shadow, or a mask, brow or bib edge.
  - Within about 4 px of an edge, clumps are full strength, weighted by part:

    | part          | weight |
    |---------------|--------|
    | head, snout   | 1      |
    | ears          | 1–0.9  |
    | tail          | 0.6    |
    | arms          | ~0.5   |
    | body          | 0.5    |
    | paw           | 0.35   |

  - On broad planes the weights drop to: head 0.45, tail 0.35, arms and body ~0.2, paw 0.
  - In deep shadow (value < 0.32), clumps are half as strong and 40% shorter.
- **The mask is solid.** The ramp is Ο for almost all of it. The only slate strands come from the warped edges, which point along the head flow.

### 3. One temperature, one shadow family
- The coat's lights moved from warm cream to grey-beige.
- The cream's shadows are violet-grey.
- The coat's top light is now the cream's own Ν: the two were near-duplicates, so they are one key.
- The darkest step of every material leans into the same violet family:
  - scarf Σ #1d2b2c
  - yellow Ψ #6c2c2a
  - chrome and outline Α
  - the nose's reflected rim Γ
- **The nose is drawn as planes:** a light-slate top plane with a δ core, a near-black front, visible nostrils, a 1-px violet reflected rim along the lower edge, and a 2x2 glint.

## The final recipe (ref 03 technique, in code)
1. **Construction first.** Hand-design the shadow shape of every mass (snout, cheek and jaw, forearm, the fingers of the grip, the tail's underside) as smooth curves or analytic light. Never trust a thresholded volume where the form matters.
2. **One light, one value map.** Then threshold each material onto a long hue-shifted ramp:
   - coat 9 tones, cream 5, mask mostly one black, rings 5, scarf 5, yellow 5, chrome 5, amber eyes 5
   - every ramp ends in a shared violet dark
3. **Fur is clumps added to the value before thresholding.** Wedge-shaped locks 2–3 px wide follow a per-part flow field (away from the nose, down the cheeks, fanned in the ears, along the tail). Their strength follows the focal order: face > marking edges and terminators > planes > deep shadow.
4. **Marking edges interlock.** The material map is warped up to about 3 px along the flow, so the mask, brows, bib and rings meet in locks, never in a cut line.
5. **Hand touches last:**
   - the ref 03 eyes: no white, an amber iris in a brown ring, a big pupil, one catchlight, a wet rim
   - the nose planes
   - the finger splits
   - knit ribs from grooves in the scarf's height field
   - colour bounce: the pump's yellow on nearby coat clumps, the scarf's green on the bib
   - sel-out outline: Α in shadow, 3 steps down the fill's own ramp on the lit side
   - no dithering

## What's still weak
- **The arm.** The upper arm is still a big light slab that loops round to the paw. The silhouette under it is pass 0's bent tube. A real fix redraws the arm's outline: the elbow tucked against the body, the forearm thicker at the wrist.
- **The paw** reads as fingers on the hero, but at 1x it is a small grey patch. It is darker than the arm and slightly glove-like.
- **The scarf ribs** still look a little beaded. A wider, flatter roll with one lime top edge would be calmer.
- **The tail's underside** still has a few blotchy dark clumps where the rings meet the terminator.
- **The ear hollows** use clumps fanned from the base. They are better, but still a bit like hatching.
