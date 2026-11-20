# Drawer 03: the raccoon's bust and arms, the dog's organic outline

Sheet: `tools/scratch/piter/iter_03.png`. Snapshot: `art/history/portraits_2d/v04`.
Changed: `tools/sprites/portraits.mjs`. `tools/lib/draw2d.mjs` gained one backwards-compatible helper,
`tube(pts, w0, w1)`: a tapered tube along a smooth curve with round caps, used for the tail.

## Raccoon
- **Override kept: the whole raccoon stays inside the 232x208 frame.** Following the coordinator's note (Ivan, M4.5: a
  hard bottom edge looks "cut off" on the floating posters), I did *not* run the body out of the frame as judge_02
  suggested. The bust ends in a rounded bottom at y ~199, and the ringed tail curls across its lower right, giving it a
  finished ending.
- **Torso narrower than the head:** ~82 wide at the chest (x 82-166) against a ~108-wide head, with a flat shoulder line
  from the neck. It tapers to the rounded bottom, with a G hip line on the near side, the chest patch narrowing down the belly, and the ruff
  still covering the neck join.
- **Arms are outlined tubes in front:**
  - Far arm: the upper arm (h, ~18 thick, full K outline over the body) runs out to the elbow at ~(213,150). The forearm (G, ~14) comes back to the fist on the hip at ~(176,188). Background shows between the arm and the torso.
  - Near arm: the upper arm has a K outline and a flat cast shadow (G) on the body beside it, so it reads as a limb and not a panel. It runs to a rounded elbow at ~(83,184). The chunky grey forearm (K outline) goes up to the dark paw on the pump, with a sliver of background in the V between them.
- **Ringed tail:** it comes out from behind the lower right of the bust and curls up under the far elbow, ~20 to 17 thick. It has four dark `k` bands (each ≥6 units, so they read at k = 1) and a dark tip. Real raccoon tails end dark, so I chose a dark tip over the judge's pale one; this is easy to flip if the judge insists.
- **Grey jaw:** the white now stops just under the smirk. The chin and jaw under it are grey `h` with a G jaw line, so the head ends above the ruff. The white stays on the snout and the two cheek flares.
- **Fist:** one chunky K-outlined shape with three knuckle bumps on its silhouette toward the body, plus finger creases and the thumb on top.
- The head and the pump are unchanged.

## Dog Fjord
- **Organic outline, no bell jar.** The skull rounds from the ear hinges. There is a slight temple pinch, and the cheeks bulge outward to the widest point
  at the mouth line (3D-grid x 44.5 / 178, y ~120-130), with a small cheek bump by the high grin corner. The bottom corners
  curve in with a ~16-unit radius into sagging jowl lobes. A concave dip where each lobe meets the chin leads to a rounded chin low at the centre (3D-grid y 160, canvas ~166).
- **The head runs up into the hair, no toupee ledge.** The hair's sides come down over the skull edges to the ear hinges. The hairline P shadow is only under the front hairline (x ~84-122), ≤2 units. The ears were moved out a little to hinge under the hair's new sides (tips ~(51,74) and (170,72)).
- **Patch eye:** a heavy flat K lid drooping slightly at the outer end, drawn only inside the eye, so no flicks stick out.
  The heart's cleft was raised (77-78.5) and the cocked brow lowered by ~1.5, so the pink hole between them is gone.
- **112:** at k < 0.8 the brows sit 1.2 units higher, leaving a skin gap above the wink arc. The single tooth row, the laugh mouth clear of the chin, and the whole expression layer are kept.

## Self-check
- Poster size: the raccoon now reads as a chunky chibi bust (big head, smaller body, tubes, tail), closer to refs 4/5.
  The far arm is quite long (shoulder to elbow ~60); it could be 10% shorter if it reads lanky. The forearm overlaps the tail where they meet; the forearm sits in front, which reads correctly.
- 112 dog: the wink, the lid and the grin read at 1x and 2x. The shock's patch eye at 1x is small but it reads as an open eye.
- Dog hairline: the wavy P hairline still shows as a thin pink edge under the hair at 1x. It no longer forms a ledge.
- Next candidates: a slightly shorter far arm and a narrower tail base; for the dog, maybe one more lump on the right jowl crease where it meets the outline.
