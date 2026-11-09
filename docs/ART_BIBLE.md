# Art Bible

## Direction
Late-80s and early-90s Sega arcade energy, modernized:
- saturated but grounded Toronto colour
- strong silhouettes and dark purple-black outlines
- stepped (cel) shading with ordered dithering
- warm light from the upper left
- cinematic compositions

It should look colourful and urban, never neon fantasy, and never generic modern pixel art.

## Palette (48 colours, `tools/palette.mjs`)
| Family | Use |
|---|---|
| Outline `K` #16121f, neutrals (cool purple-greys) | outlines, raccoon fur, asphalt |
| TTC reds | the raccoon's bike, streetcars, signage |
| Toronto brick (red + buff) | Victorian main streets |
| Lake blues | glass, lake, sky |
| Park greens | trees, grass, protected lanes |
| Pinks | Dog Fraud, dusk |
| Purples | dusk skyline, Dog Fraud's campaign colour (rat caps) |
| Yellows / oranges | signals, cones, hard hats, sunlight |
| Teal | bike share, painted facades |

Every sprite uses only palette keys, so consistency is guaranteed by construction.

## Scale and camera
- Internal 384×216; tiles 16px.
- **Exploration:** the ground is pure top-down. Building facades face south and are drawn face-on below their roofs. Characters, props and vehicles render from a **32° camera** so the raccoon reads in all 8 directions; classic 3/4 games cheat the same way.
- **Side view:** characters are about 36px tall (raccoon on bike, 48×36 frame) and rats about 27px. Side-view vehicles are rendered at 2.2× so they're in scale with the raccoon.

## Readability rules
1. Silhouette first: the raccoon's tail and bike, Dog Fraud's pear head and horns, the rats' ears and tail.
2. Faces need at least a 2px eye with a pupil.
3. Nothing thinner than about 1.3 world units in SDF models (or it vanishes in sampling).
4. Telegraph every enemy attack (windup pose plus a red "!").
5. Painted facades get calm textures; brick keeps a subtle running bond.

## Characters
- **Raccoon:** grey `G/h`, mask `k`, white brow and muzzle, ringed tail (alternating `h`/`g`). Red cruiser, wicker basket with pizza, yellow bell. Attack prop: a trash-can lid.
- **Dog Fraud:** see GAME_DESIGN. The shape language comes from Ivan's reference: a street-art paste-up of a real politician with horns and a moustache. Only the *satirical shapes and tone* were taken: flushed pink pear head, horn-ears, handlebar moustache, smug squint, tiny suit. The character is a cartoon bulldog, and no facial features of the real person were traced or matched. The reference image lives in the gitignored `reference/` folder and isn't redistributed.
- **Rats:** brown fur `w/x/X/j`, pink ears, nose, hands and tail, big white eyes with angry brows, buck teeth. Variants are distinguished by accessory colour: purple cap, yellow hard hat with orange vest, white cap with purple vest and red STOP paddle.

## Environment
- **Queen West buildings** are procedural Victorian storefronts:
  - sign band with pseudo-lettering
  - striped awnings in about 7 colourways
  - display glass with diagonal reflections, recessed doors, bulkheads
  - sash windows with stone lintels, sometimes arched, lit or curtained
  - cornices with dentils
- **Rear walls:** fire escapes, AC units, back doors, graffiti tags.
- **Roofs:** parapets, HVAC, skylights, chimneys, the occasional patio umbrella.
- **Street furniture:** Toronto's post-and-ring bike stands, a TTC stop pole, red-and-yellow hydrants, streetlights, signals, news boxes, benches, planters, bollards.
- **Skyline:** the CN Tower (shaft, ring deck, main pod, SkyPod, antenna) and the domed stadium, with towers carrying lit windows at dusk.

## Iterations
Every version is kept in `art/history/<asset>/vNN/` (preview, 1× sheet, frozen source, note). The gallery is [art/history/INDEX.md](../art/history/INDEX.md).

## References received
| File (gitignored) | Used for | How |
|---|---|---|
| `reference/DogFraud.jpg` | Dog Fraud | shape language and tone only (see above) |
