# Painter, round 09: one contained fur experiment + the round-10 polish on the main line

## 1. Wildcard `variants/r09_w.mjs`: a ref-03 fur pass on the raccoon, done with light
This is the iter_09 main line plus one block in the raccoon, after the light is painted. Dog Fjord is untouched.
Renders: `variants/r09_w.png`, `_hero`, `_values`. Snapshot: `portraits_2d_explore/v16`.

How it works:
- It uses light2d's `furBreak` only at **tone boundaries**, which are by definition where light meets shadow: the
  terminators, the lit edge of the cheek ruff, the brow bands, the crown, the edges of the tail's light band, and the
  forearm's lit edge.
- **Within each ramp:** the lighter tone pokes 2 to 4 px strands (2 px wide at the root) into the shadow side, and the
  darker tone pokes strands into the lit side.
- **Across the markings on the head:** the cream ruff and the brows break into the coat and the mask, and the mask into
  the coat.
- **Flow:** strands follow the fur: `headFlow` on the head and ears, down on the body and arm, along the curl on the
  tail.
- **Calm zones** (even-odd holes in the work area): both eyes, the nose, and the smirk with its lip.
- **Flat lit areas get nothing,** because there is no boundary there.
- **Density:** full at k = 1.5, 60% at k = 1, none below k = 0.9 (so the 112 x 100 dialogue portraits are unaffected).
- **Footprint:** about 2,100 changed pixels on the k = 1.5 raccoon (2% of the frame).
- **Checks:** pixelcheck is as clean as the main line (1 orphan, which is the eye's secondary catchlight, kept on
  purpose; no jaggies; 1 hole, the whisker). The values view keeps the same big light/shadow structure, and the head is
  still the peak.

**Is it better? Honestly: a little, and only on the head.**
- **At 4x and 2x the head gains real craft.** The mask's lower edge, the brow bands and the crown's light edge now break
  into fur instead of meeting as clean vector edges, and that is exactly ref 03's quality.
- **At 1x on the poster the difference is small.**
- **The body and tail barely change.** Their boundaries are few and long, and there the strands mostly read as a soft
  edge.
- **One place gets slightly busier:** the cream cheek right of the barrel, where several boundaries meet.

**My recommendation:** adopt it for the head only (mask edge, brows, crown), at the current density, and let the critic
judge it at 1x and on the VERSUS 2x before it goes into the main line. I would not apply it to the body or tail.

## 2. The critic's round-10 polish, done on the MAIN line (`iter_09`)
Source: `variants/r09.mjs` = `tools/sprites/portraits_next.mjs`. Snapshot: `portraits_2d/v29`. Annotate PNGs
re-exported.
1. **The barrel's specular** is now one solid streak. It is a filled 1.4-unit round-ended bar on the lit upper third of
   the barrel, replacing the two pixel-perfect lines that broke into dots.
2. **The jaggy at (173,41)** on the far ear's rim is gone:
   - a fill-mode `dejag` pass;
   - then the one remaining doubled corner (a 1-px `ª` strip hugging the outline at the poster size) set by hand to
     `º`, guarded so it only fires on that exact pixel pattern.
3. Also: the lit fur wedges can no longer land on the pump. Two light specks on the barrel came from the mask-edge
   wedges.

The main line changed by 111 pixels on the raccoon and 0 on the dog. pixelcheck:
- raccoon: 1 orphan (the eye's secondary catchlight), 0 jaggies, 1 hole (the whisker);
- dog: clean in all three expressions.

## Checks
- Game: portraits.mjs, `src/` and draw2d are untouched, and the game portraits render. The light2d test image has the
  same md5.
- Palette: no new keys.
- light2d: no API changes this round.
