# Artist, round 03 (last exploration round)

Files: `variants/r03_a|b|c.mjs` + `.png` + `_hero.png`. Pick: **a** -> `tools/sprites/portraits.mjs`, rendered as
`iter_03.png` / `iter_03_hero.png`. Snapshots: `portraits_2d/v13`, `portraits_2d_explore/v07-v09`.
Source pipeline: `r03_parts.mjs` (header, pump, hands, the poses' back and front layers, the bandana) +
`make_r03_src.mjs` (assembles `r03_src.mjs` from those plus the kept parts of r02: the raccoon finishing and Dog
Fjord with the bulldog rewrite) -> `build_r03.mjs` (splices in the kept raccoon head and writes the 3 variants).

## Raccoon: the head untouched, three new poses, the face 100% clear in all
Accent in all three: the red bandana (round 01 A's drawing) + the teal pump.
- **a, bat (picked):**
  - The pump runs up the near shoulder behind the figure to the T-handle at the upper left, clear of the ear (no tangent).
  - The near hand (`hand()` at 1.3x) grips the barrel at the shoulder.
  - The pump passes behind the body. Its foot and the slack hose show under the belly at the lower left, on the same axis.
  - The far arm ends in a big fist on the hip, with lit knuckle bumps.
  - The gauge sits on the upper barrel, facing the viewer, with no hand over it.
- **b, cane:**
  - The pump is planted in front, its foot on the bottom edge.
  - Both paws are stacked on the T-handle under the chin (new `flatPaw()`): long fingers curling over the bar, lit knuckles, claws, thumbs.
  - The hose lies slack along the bottom, and the gauge is on the barrel below the hands.
  - Framed at 1.0x so the pump has some length (it is still stubby).
- **c, lean:**
  - The pump is planted at screen-left with the T-handle at shoulder height.
  - The near elbow leans on the handle and the forearm hangs over it (behind the cheek ruff), the paw dangling with its palm pad showing.
  - The far paw rests on the belly, and the body tilts toward the pump.
  - The cycling cap is on this one.

Body (all poses):
- Rebuilt as two big tufted tiers (a pale bib over a shaded belly), plus a clean shadow side and a lit near flank. The torn-paper islands are gone.
- The arms are darker than the chest, with a soft contact shadow.
- No tail, so no dark knob.

Pump:
- `pumpAxis()` now lays its parts out in real units, so a short planted pump keeps its proportions instead of squashing.
- It has a foot plate with two pegs, a hose ferrule, chrome glints, and a gauge dial facing the viewer.

## Dog Fjord: a bulldog, smug again
Built on round 02 a's modelling (texture density 2 in all three, no speckle).

Bulldog cues:
- **Underbite:** the lower lip thrust forward, with two lower canines poking up over the upper lip in every expression (grin, laugh with a lower teeth row, shock).
- **Flews:** heavy lobes hanging past the mouth corners, below the jaw line. They break the lower silhouette on the far side, with tapered dark creases where they meet the cheek and chin.
- **Chin and nose:** a flat, wide lit chin plane. A nose rope (a lit wrinkle roll over the nose) and a stop crease between the eyes.
- **Ears:** rose ears in iteration 04's place, folded back: rounded tips, a lit fold ridge, a sliver of darker inner ear.

Smugness:
- The patch-eye lid comes down to the pupil, and the iris slides left toward the raccoon.
- The patch brow is arched high.
- The patch-side (screen-right) mouth corner is raised.
- The wink stays on the near eye.

The three takes:
- **a:** sunk into big navy shoulders, gold tie with little cars, flag pin.
- **b:** chin up. The underside of the nose faces the viewer with two round nostrils, the pupils sit low under the lid, the grin is flatter, and the double chin is a distinct mass. Charcoal pinstripe, red tie.
- **c:** sunk into royal blue, a cream chin blaze, a striped tie. I tried the blaze on the forehead first, but it read as a painted horn, so it moved to the chin.

All read at 112 x 100: the fangs survive as two white pixels, the folds are dropped.

## Why a
a pairs the pose with the most attitude and the biggest head (1.1x) with the most bulldog-and-smug dog. b's two hands
on the cane are the most readable hands in the set, and its chin-up dog is the boldest attitude. Worth combining: b's
dog face on a's sunk shoulders, or the cane pose at a closer crop.

## Known weaknesses / next (refinement rounds)
1. **Bat (a):**
   - The near forearm is hidden behind the bandana knot, so the gripping hand looks attached to the shoulder. Show a sliver of the forearm, or move the grip down a little.
   - The foot poking out under the belly reads, but only just.
2. **Cane (b):** the pump is stubby and the figure looks small. Either shrink the T-handle or let the pump run longer with the raccoon drawn as a fuller figure.
3. **Lean (c):** the elbow-on-handle contact could be clearer (a squash of fur on the grip).
4. **Body:** the bib tufts still repeat a little. The near flank has a few small jagged pieces left.
5. **Dog:**
   - The near hanging flew's highlight blob is a bit round.
   - The far flew's tip is pointy; round it.
   - The laugh's mouth interior could use a tongue highlight.
   - In b, the double chin plus the chin plane crowd the bottom of the head.
6. `tools/sprites/portraits.mjs` still carries the unused b/c branches. Prune them once the direction is fixed for round 04.
