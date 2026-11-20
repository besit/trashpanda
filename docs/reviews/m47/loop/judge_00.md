# Judge 00: baseline (M4.6 2D) vs the 3D row and refs 3/4/5

Measurements are on the 232x208 grid, taken from the k=1.5 renders (px / 1.5).

## 1. Scores (1-10)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 5 | 3 |
| Symmetry / structure | 5 | 4 |
| Silhouette / overall shape | 6 | 4 |
| 2D pixel-art craft | 6 | 5 |
| Face / expression appeal | 5 | 6 |
| Small-size readability | 6 | 5 |
| **Overall** | **5.5** | **4.5** |

## 2. What works (keep it)
- **Both:** clean dark outer outline, flat palette, the posters' blue reads well behind both. There is no SDF lighting left.
- **Raccoon:** the pump is the best thing on the sheet: T-handle, ribbed barrel, gauge, hose, crisp and readable at k=1. White brow bands, the zig-zag ruff, the dark paws with knuckle lines, the fist-on-hip pose, the smirk line with its dimple.
- **Dog:** the heart patch (shape and colour), the big shiny black nose, the toothy grin and the laugh's tongue, the freckle dots, the suit/shirt/tie stack, the shock's round eyes. All three expressions read at 2x.

## 3. Fixes, ranked

### Raccoon
1. **Head too wide, snout too long (profile snout on a front body).** The head spans x 68..210 (142 wide, 61% of canvas) and the nose sits at x 201, against the right edge. In 3D the head is x 67..170 (~103 wide, 44%), centred at x ~118 over the body, and the nose is at (151, 89), *inside* the head outline. Rebuild `head` at ~105-112 wide, centred at x ~122, cranium top at y ~40, chin y ~116. Shorten the muzzle so the nose tip reaches x ~165-172 at most. That makes a 3/4 view, not a side view.
2. **The eyes are slits lost in a "Zorro band".** The eyes sit at (112,78) and (162,76), 50 apart, and the whites are only ~5 px tall. In 3D they are ~29 apart at (122,73) and (151,72). Move them to ~(118,74) and (150,72). Make the whites ~12x9 (near) and ~10x8 (far), the heavy lid covering the top third, a dark pupil looking right, and a 2x2 white highlight as in refs 1/3. They must still read at k=1.
3. **Reshape the mask.** It is now one even band, x 84..186. Make two lobes round the eyes, joined by a narrower bridge, with the outer ends drooping onto the cheeks (refs 1/3/4). Carry the dark forehead stripe (now stopping at y 66) down between the lobes to the bridge. Add a 1-2 px grey gap between the mask and the white brows so they don't merge.
4. **Remove the dither bands.** Drop the checker rims on the head (`rim(9,5,'G',checker)`) and body, and the checker paints on the ears, body and muzzle. Keep one flat shadow shape per part, on the right/under side, as in ref 5. At k=1 the checker reads as grey noise.
5. **Drop the "abs".** Remove the pec/ab strokes and the three V marks (lines 83-86). They read as a muscled human torso, and the 3D body is a chubby barrel. If the belly needs anything, use 2-3 short fur notches at the pale front's edge.
6. **Body vs head balance.** In 3D the body is x 69..171, about as wide as the head, and centred under it. The 2D body is x 76..200 and the head is shoved right. After fix 1, centre the body at x ~125 and narrow it to ~110. Thicken the far arm (upper arm ~14 wide, not ~10) so it doesn't read as a thin black sleeve.
7. **Ears.** 3D tips are at (101,32) and (131,31), small and close. 2D tips at (88,17) and (166,11) are big and far apart because the head is wide. After fix 1, bring the tips to ~x 100 and ~145, y ~24, each ~20 tall.

### Dog Fjord
1. **The head is far too big.** It spans x 28..208 (180 wide, 77% of canvas) and the hair top is at y 8. In 3D: x 48..172 (~124 wide, 54%), centre x ~110, hair top y ~32, chin y ~163. Scale `head`, the hair and every face coordinate to ~70% around (110,100). In the 112x100 dialogue portrait the head currently touches both edges.
2. **The features are spread out.** The eyes at (93,78)/(150,78) are 57 apart, and the mouth runs x 56..150. In 3D the eyes are at (82,94)/(116,94), ~34 apart, the nose is at (89,108), ~27x16, and the mouth runs x 66..127, y 128..146. The face should cluster in the middle-upper part of the pear, with lots of jowl around it. That is the bulldog read.
3. **Ears read as horns or cat ears.** The code comment admits it. Replace them with folded rose-ear flaps hinged at the head's sides just under the hair (y ~58-72), tips pointing *out and down* at ~(58,66) and (162,66), rounded tips, with a lighter inner fold, as in 3D.
4. **Silhouette: an onion, not a pear.** The concave pinch at the bottom corners (~(50,164), (192,164)) and the very broad upper head make a gourd shape. Make it narrow at the brow (~70 wide at y 60), widening smoothly to the jowls (~124 at y ~135), and finish with a full round bottom just under the chin (y ~163). No inward notch.
5. **Hair: chunky comb bands, not thin lines.** Make the helmet x ~84..151, y ~32..60, with 4-5 alternating light/mid bands, each 4-5 grid wide, sweeping right as in 3D. The 1-px `G` strokes become noise at 112. Keep the quiff small so it doesn't overhang the left ear.
6. **Flatten the shading.** Use three tones: the light left plane plus muzzle, the base, and one shadow shape (right side plus under the jowls). Remove the `P` checker band, the suit checker and the extra `M`/`m` lit strips. Today they make ripples and pillow contours.
7. **Eyes and brows for small sizes.** The grin's ^ arcs at t2 and the faint 'p' under-lines vanish at 112, and the left eye becomes mush. Use 3D-style squints instead: a dark lid arc, a sliver of iris, a 1-px highlight. Brows: short and thick, ~18 long and ≥4 grid thick (≥2 px at 112). Today they are 32 long and thin. They must not merge with the patch edge.
8. **Suit width.** It runs x 56..188. In 3D the shoulders are x ~77..153. Narrow it to match the smaller head, keeping the bobble-head ratio.

## 4. Must not regress
- Signatures, canvas sizes, `portraitsPreview()`. Pure flat 2D, no gradients.
- The pump's detail and its readability. The raccoon's dark hands with clear fingers. The smirk, white brows and ruff.
- The dog's heart patch on the far (screen-right) eye, the shiny nose, the grin's teeth, the laugh's tongue, the shock's eyes and mouth.
- One consistent dark outline weight per scale. The palette as it is.
- Dog Fjord stays a cartoon bulldog: pink, jowly, with the dog nose. Never move toward a human likeness.
