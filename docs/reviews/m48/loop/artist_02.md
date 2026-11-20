# Artist, round 02 (exploration 2)

Files: `variants/r02_a|b|c.mjs` + `.png` + `_hero.png`. Pick: **a** -> `tools/sprites/portraits.mjs`, rendered as
`iter_02.png` / `iter_02_hero.png`. Snapshots: `portraits_2d/v12`, `portraits_2d_explore/v04-v06`.
Source: `r02_src.mjs` (one file, `const V` switches the variant) + `build_r02.mjs` (splices in round 01's raccoon
head code, which the judge said to keep, with this round's head changes, and writes the three variant files).
They are standalone modules. The unused variant branches stay in portraits.mjs for now (prune once the direction is fixed).

## Dog Fjord (the priority): three angles, one new modelled face
All three share the new modelling, inside iteration 04's silhouette:
- **Flews:** two fat upper-lip lobes over the teeth. The near one is lit (lit top + hot spot), the far one in half shade. Each has a core shadow underneath, and the philtrum is a shadow groove with a lit side, not a line. A few 2-pixel pore clusters with a lit pixel replace the old orphan dots.
- **Grin:** gum strip, the lip's cast shadow on the teeth, teeth shading darker toward the corners, dark corners, a few tooth separations.
- **Jowls:** hanging lobes over the collar, lit on top, a dark crease under them, and a reflected-light band along the bottom edge of the head.
- **Wrinkles:** `fold()` paints each one as a shadow crescent with a lit ridge crescent above it. The forehead has 2 folds, 3 on b, plus bags under the eyes. The nasolabial folds are tapered shadow wedges with a lit bulge outside them. All of them are dropped at the 112 size except the two big nasolabial wedges.
- **Forehead:** a dome with a broad warm light, a hot spot on the upper left, and the hair's cast shadow as a soft band.
- **Patch:** a new chestnut ramp `( ) ! "` with a highlight. The edge is tufted with a `furBreak` fur edge into the pink, plus a socket shadow over the eye. The patch eye is bigger: white, a 4-tone amber iris, a glint and sparkle, a 2-tone heavy lid and a lit lower lid.
- **Nose:** blue-grey sheen on the top plane, a specular, and comma-shaped nostrils with lit rims.
- **Brows:** tapered hair tufts (thick in the middle), with a dark underside and lit strand edges. No more flat bars.

The three takes:
- **a, three-quarter (picked):** navy, broad square shoulders (C's bust), the gold tie with little red cars, a flag pin. Medium texture.
- **b, chin up:** the features are raised (looking down his nose) and a second chin shows. Charcoal pinstripe, red striped tie, pocket square. Densest skin texture and the most folds.
- **c, chin down, sunk into big raised royal-blue shoulders:** red/white striped tie, gold pin. Bold flat shapes with no skin texture, and a cool pink-grey rim light on the far edge.

## Raccoon: B's direction, closer, finished
- **Framing:** warm taupe coat, framed 1.15x about the head (1.2 put the belly and tail past the bottom of the frame). The whole figure is inside the frame, finished by a rounded tufted belly. The tail curls up beside the body at the lower left with rings that bow round the cylinder.
- **Pump:** stays on `pumpAxis` (straight by construction) at port arms. It is drawn in front of the cheek ruff, clear of the eyes, so it reads as one unbroken diagonal. The gauge is a round dial facing the viewer, between the hands. Chrome glints on the caps, rod and boss, a foot plate with two pegs, a smaller hose.
- **Hands:** `hand()` draws a real raccoon hand round the tube: the back of the hand, four long fingers fanning from a knuckle row and curling over the edge (tips going behind), knuckle lights, claws, a hooked thumb, and a palm pad on the far hand. Fur spills over the wrists. No mittens.
- **Arms:** tapered (shoulder -> elbow -> a thin wrist), darker than the chest, tufted silhouettes, and a contact shadow painted on the chest under each one.
- **Chest:** a ruff in three overlapping tufted tiers instead of the flat trapezoid.
- **Mask in 4 tones:** the deepest black round the sockets and at the inner corners, a sheen on the brow ridge and cheekbones with 3-tone peaks, and fur breaks between the tones.
- **Head details:** the forehead stripe ends in fur, not a V. Lit fur tips on the crown and ears, dusty pink-grey inner ears (new keys `'` `-`), a crisp highlight line down the snout bridge, and the muzzle highlight broken up with fur.
- **Accent sets:** (a) green knit scarf, its end flung back over the far shoulder, with a cherry-red pump (toned down to `= r [ R q`). (b) A's red bandana with the teal pump. (c) The cycling cap (rounder panelled crown, stripes, a 3-tone flipped brim, its shadow on the brow) with a chrome pump.

## Toolkit
- `furBreak` / `furStrokes` now pass true design coordinates to direction callbacks (they ignored the canvas origin offset; matters for zoomed drawings).
- Palette additions only: `( ) ! "` (chestnut), `'` `-` (dusty pink-grey).

## Pick and why
**a**: the judge's accent set (i), the most legible pump, and the dog's three-quarter angle is the most readable at 112. Dog b's chin-up attitude is the funniest of the three, and I'd like the judge to weigh it. Dog c shows the bold rendering option.

## Known weaknesses / next
1. The raccoon's near arm is still muddy where it crosses the chest (the forearm reads as a dark band). It needs a cleaner
   tapered silhouette, and the chest should be lighter right behind it. The far arm is mostly hidden: show its
   forearm reaching to the low hand.
2. The hands read as hands now, but they're small and dark. The near hand sits on the scarf; it could use a lighter palm
   tone or a bigger knuckle highlight.
3. The lower body and belly fur are still a bit even, and the tail-tip blob is flat.
4. Dog: the laugh's flews could lift more. The forehead folds are faint at k = 1. The far jowl crease could be one
   tone deeper. The chin in b is a little crowded under the mouth.
5. The pump covers the outer end of the mask. Acceptable, but maybe slide the axis a few units left.
