# Judge, round 10: the final verdict (M4.8 portrait loop)

Scale: ref 03's craft = 9 to 10 (ref 04/05 about 7.5 to 8).

## Final scores

| | Start (M4.7 iter 09) | Final (iter_10) |
|---|---|---|
| **Raccoon (Trash Panda)** | 4.0 | **7.0** |
| **Dog Fjord** | 3.5 | **6.5** |

Round 10 is round 09 plus polish:
- the near-cheek highlight's hard edge is softened;
- the hose is lifted off the bottom row so its outline is no longer clipped;
- the code is cleaned up with 0 pixel change.

The regression grid (05 | 07 / 08 | 10) shows no loss. The dog keeps round 08's confident crescent, and the raccoon
keeps round 07/08's gains.

## Checks (all pass)
| Check | Result |
|---|---|
| Pump straight | One vertical axis, the T-bar perpendicular, the rod, caps, barrel, gauge and foot plate collinear; only the hose curves. It reads as a real floor pump mid-stroke. |
| Dog head = iter_04 | The broad outline, the low folded triangular ears, the compact swept hair |
| Dog at 112 x 100 | The grin, laugh and shock all distinct at 1x and 2x: the wink, the smug patch eye, the nose, the crescent with fangs, the shock "O!" |
| k = 1.5 / k = 1 | Clean at both sizes. The texture is scaled down at k = 1, and the whiskers stay connected. |
| Nothing cut off | The raccoon ends 2 px (k = 1.5) / 1 px (k = 1) above the bottom edge. Only the dog's bust reaches the bottom, which is intended. |
| Transparent background | No floor shadows and nothing dark outside the silhouettes |
| No real-person likeness | A cartoon bulldog with canine cues (underbite fangs, dog nose, folded ears) |
| Raccoon | Faces right, smirk, mask, white brows, grey fur, face fully clear |
| Code | Exports and signatures intact. `palette.mjs` vs HEAD: only additions. `draw2d.mjs` backwards compatible (the M4.7 drawing renders 0 pixels different with the new toolkit). |

## What the loop achieved against ref 03
- **From vector cartoon to pixel art.** The flat 3-tone fills with black lines between every region became 5 to 9
  step hue-shifted ramps (cool violet shadows, warm lights) with selective, colour-tinted silhouettes and no interior
  linework.
- **The raccoon's head is close to ref 04/05 craft and has ref 03's vocabulary:**
  - a 4-tone mask with a sheen;
  - eyes as the focal point (gradient iris, glint, sparkle, lid rim);
  - interlocking fur breaks plus flow-directed strand clusters;
  - fringed ears with dusty-pink insides;
  - a bright clean muzzle top, whiskers, a wet nose.
- **A real character design for the raccoon,** after exploring 9 variants (3 rounds × 3): a standing "cane" pose with
  a planted mid-stroke pump, a cycling cap, a red bandana and a teal pump in a harmonious red/teal palette on a warm
  taupe coat. It also has the ringed tail, drawn feet and paws, and a finished bottom edge.
- **Dog Fjord became a bulldog villain with presence:** the iter_04 head, a wide confident crescent grin with
  underbite fangs, the smug low lid, a furry chestnut patch, a wet nose, modelled planes instead of pillow shading,
  and a clean pink palette with mauve shadows. The laugh is the strongest expression of the set.
- **The pump is straight,** built by construction (`pumpAxis`) so it can never bend again.

## What still separates them from ref 03 (for a future pass)
- **Rendering density below the head.** Ref 03 textures every surface. Our raccoon body, arms and legs are still
  mostly broad clusters with sparse strands, and the dog's skin is clean planes. The next step is the head's
  strand-and-break language applied to the body at full quality, plus fine skin modelling (pores, fold
  micro-shadows) on the dog's forehead and muzzle.
- **The cohesion of the light.** Ref 03 has one unified light that carves every form with strong local contrast,
  reflected light and occlusion. Ours is correct but timid below the head and on the dog's lower face: the value
  range there is narrow (mid taupes, a broad mauve jaw band).
- **The eyes and focal contrast.** Ref 03's eyes are larger relative to the face and sit in the brightest-against-
  darkest contrast in the picture. Ours are good but smaller, and the dog's patch eye is a sliver. A future pass
  could enlarge the eyes slightly and concentrate contrast there.
- **Hand-placed finish.** Ref 03 is clearly hand-pixelled at its focal points. Ours is procedural shapes with
  generated texture. A hand-authored pixel map for the two faces' focal area (eyes, nose, mouth) at k = 1.5 would
  close much of the remaining gap.
- **Dog Fjord's lower face** is still the least resolved area: a large smooth pink and mauve mass under the grin. The
  jowls remain a cartoon compromise (cheeks, not true flews); round 07 showed that pushing anatomy hurt the appeal.
  Any future work there should be judged on appeal first.
