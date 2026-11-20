# Artist, round 01 (exploration)

Files: `variants/r01_a.mjs|png` (+ `_hero.png`), `r01_b.*`, `r01_c.*`; favourite A copied to `tools/sprites/portraits.mjs`
-> `iter_01.png` / `iter_01_hero.png`. Snapshots: `art/history/portraits_2d/v11`, `art/history/portraits_2d_explore/v01-v03`.
Scratch tools: `zoom.mjs` (crop + enlarge any region of any variant), `build_b.mjs` / `build_c.mjs` (B and C are
generated from A's head code plus their own pose blocks, `b_parts.mjs` holds the generic pump + B's body).

## What changed in all three (the step toward ref 03)
- **Value ramps with hue shift.** New palette keys (additive): raccoon cool fur `0..8` (9 steps, shadows blue-violet),
  warm taupe coat `@ # $ I % & J * +` (9 steps), Dog Fjord skin steps `= ? ^ ~` slotted between the old `p P m M`
  (8 steps from violet-maroon to peach), amber iris `< > { }`, plus `[ | : ; , _ \``. The fur now uses 5 to 7 tones
  per area, the skin 6 to 8.
- **Drawn fur instead of filled shapes.** Every tone boundary on the fur is broken with `furBreak` (short strokes of
  one tone poking into the next along a flow field radiating from the nose), plus sparse `furStrokes` strands.
  Silhouettes are `tufted`: irregular curved locks (cheek ruffs, ear fringes, chest bib, body, tail), not smooth curves.
- **Selective outlines.** No per-part black lines any more (`line: null`); one final `silhouette()` outside the
  figure: near-black on the shadow side, a softer tone on the lit side, coloured per material (red on the
  bandana, deep ochre on the yellow pump, maroon on the dog's skin).
- **Eyes.** Amber iris in 4 tones (dark top under the lid -> bright lower crescent), pupil, a square glint, a wet
  sparkle, a dark lid rim, a lit lid crease, a pale lower rim separating the eye from the mask.
- **Pump straight.** A: everything on the vertical axis x = 34. B/C: `pumpAxis()` places every part in axis coordinates
  (along/across), so the T-handle is square to the shaft and nothing can bend; only the hose curves.
- **Dog Fjord's head** = iteration 04's outline, ears and hair outline (from `m47_v05.mjs`), face features from iter_09.
  The skin is now planned as volumes lit from the upper left (lit plane, base, shadow side, core shadow, deepest under
  the jowls, a bounce light on the far edge), jowl lobes lit on top / dark below, forehead folds as dark crease +
  lit lip, a wet nose (4 tones + shine), toothy grin shaded toward the corners.

## The three takes
- **A "planted staff"**: vertical yellow pump stood beside it like a staff, paw round the barrel, fist on hip, ringed
  tail, RED BANDANA (ref 04). Cool blue-grey fur. Dog: navy suit, red tie, gold pin. Most complete and coherent.
- **B "swagger"**: WARM TAUPE coat (ref 04's brown-grey), a TEAL bike-share pump held diagonally across the chest at
  port arms (both paws on it, handle up past the near ear), chunky GREEN KNIT SCARF (ref 03) with its end flung over
  the shoulder. Dog: charcoal pinstripe, gold tie with little red cars on it, flag pin, deeper skin shadows.
- **C "over the rail"**: a 1.22x close crop like ref 03: big head, forearms leaning on the pump lying LEVEL across
  the bottom (it's the finished bottom edge), a white/teal/red CYCLING CAP with the brim flipped up; denser strokes and
  the lit side loses its outline entirely. Dog: broad square shoulders, black suit, striped blue tie, pocket square.

## Pick: A
A is the best-drawn whole: clean read at k = 1.5 and k = 1, the pump plainly straight, the pose, bandana and tail
all hold together. B has my favourite palette (the warm coat looks closest to ref 04's charm) and the most attitude, but
its arms/body are muddy (the far arm doesn't separate from the chest, a stray dark notch, mitten paws). C has the
best head-to-frame ratio (closest to ref 03's composition) and the cap is a strong character note, but the paws read
as stamps and the belly below the rail is a weak fringe.
**Combination I'd like the judge to weigh:** C's crop + cap, or B's warm coat, on A's level of finish.

## Toolkit (tools/lib/draw2d.mjs, backwards compatible; the M4.7 module renders pixel-identical to iter_00)
- `hash(x, y, seed)` deterministic jitter.
- `tufted(pts, {amp, period, where, flow, lean, jitter, skip, seed})`: fur locks along an outline, irregular rhythm.
- `Canvas.furBreak(on, from, into, {dir, len, gap, w, seed, shapes})`: interlocking fur at a tone boundary.
- `Canvas.furStrokes(on, shapes, color, {only, dir, len, gap, prob, seed})`: directional strands in a region.
- `Canvas.silhouette({dark, lit, light, pick})`: selective outer outline (per side, per material).
- `Canvas.despeckle(on, keep)`: removes orphan pixels.
- `shape(..., { line: null, inner: null })` now means "no line there" (the part's own fill).

## Known weaknesses / next
1. Raccoon mask is still a large flat dark mass in the middle; needs more internal modelling (ref 03 has 3 tones and a
   sheen in it). The stripe on the forehead is still a bit vector-smooth at its lower end.
2. Paws are the weakest drawing in all three (gloves/mittens); need knuckles, pads, fur at the wrist.
3. Arms: tube shapes with too little form; the near forearm reads thin.
4. Body tufts still a little even in places; the tail rings are flat.
5. Dog: the forehead is mostly one flat tone (needs a dome); the patch eye is small; the grin's teeth could use
   more form; hair strands are good but could get one more value step.
6. If the judge prefers B or C: B needs the arms redrawn (separate value + a contact shadow line), C needs real paws
   draped over the barrel and a better finish below the rail.
