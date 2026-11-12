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
- **Raccoon:** grey `G/h`, mask `k`, white brow and muzzle, ringed tail (alternating `h`/`g`). Red cruiser, wicker basket with pizza, yellow bell. Attack prop: a **yellow bike pump** with a black T-handle (v03). The lid didn't read; the first pump read as a gun. Rule: weapons must never look like firearms, so swing them, don't point them, and keep them bright.
- **Dog Fraud:** see GAME_DESIGN. The shape language comes from Ivan's reference: a street-art paste-up of a real politician with horns and a moustache. Only the *satirical shapes and tone* were taken. Since v06 (Ivan's review) he has a flushed pink pear head, a **swept white coif**, folded dog ears, a big dog nose and muzzle with whisker spots, a **tan eye patch** (dog marking; a darker one read as a black eye), a smug squint and a tiny suit. **No moustache.** The character is a cartoon bulldog, and no facial features of the real person were traced or matched. The reference image lives in the gitignored `reference/` folder and isn't redistributed.
- **Rats:** brown fur `w/x/X/j`, pink ears, nose, hands and tail, big white eyes with angry brows, buck teeth. Variants are distinguished by accessory colour: purple cap, yellow hard hat with orange vest, white cap with purple vest and red STOP paddle.

## Toronto artifacts (Ivan's direction: every district unmistakable)
Each district gets landmarks and textures you can't mistake for anywhere else. Queen West has:
- the Trinity Bellwoods gates (pale stone piers with pinnacles, black iron gates, lantern)
- the dog bowl
- the white squirrel
- the 501 and 505 streetcars and red-and-white TTC stop poles
- Little Portugal's azulejo tile facades
- a graffiti lane with murals
- raccoon-resistant green bins (blue and grey bins at the curb)
- classic green picnic tables
- the Victorian house mix beside the park: bay-and-gables, Queen Annes, Second Empires
- post-and-ring bike stands

**High Park (M2):**
- Grenadier Pond with cherry blossoms along its east shore, and black oak savanna
- the zoo's capybaras, the wooden HIGH PARK sign, car-free park roads
- the Parkside speed camera (and its stump), a red-brick school with its yard
- Roncesvalles' streetcar tracks and the Revue's red marquee

**Downtown (M2):**
- City Hall's two curved towers cradling the white saucer, and the multicolour TORONTO sign
- the pool with its three Freedom Arches, and Old City Hall's clock tower
- King West's brick-and-beam warehouses giving way to glass towers (sky reflections, mullion grids)
- Chinatown's red lanterns at Spadina, Graffiti Alley, the news van bursting out of 299 Queen W
- after mission 3, King's red TTC lanes and patio decks with striped umbrellas

**East End (M3):**
- the Don Valley: the river, the Lower Don trail, the DVP, and the bridges with concrete rails (the Queen St bridge inscription as a plaque)
- the Broadview Hotel's red brick corner, Riverdale Park East's hill, East Chinatown's lanterns on Gerrard
- MEGAMART (fictional): a ribbed grey big box, a red sign, and a parking lot of stalls, wheel stops and light poles

**Waterfront (M3):**
- the Gardiner deck overhead on its piers, with Lake Shore beneath
- the CN Tower's base and shaft in Roundhouse Park, the domed stadium's ribbed roof
- Queens Quay's streetcar in a grassy median, the Martin Goodman Trail's yellow centre dashes, granite promenade and boardwalk
- Sugar Beach's pink umbrellas and white chairs, sailboats, the Cinesphere's geodesic dome, the pods on stilts
- the MEGA SPA (fictional, pink and glass) and its chain-link PRIVATE fences

**Rules added in M3:**
- Lettering on signs is at least 5 px tall. 3×3 glyphs read as nonsense: "MEGA SPA" came out as "HECA SPA".
- An island is drawn with the shore tile that matches each side (water touching land to the south gets `shore_s`, and so on), never one edge tile all round.

**Rules added in M2:**
- No wall colour may equal a sky colour: the teal brick speckle was sky blue and read as holes (Ivan's circled screenshot).
- Vehicles seen from behind must show a trunk, a rear window and tail lights. The SDF back view read as all glass, so it's hand-built per scale now.
- 3/4 props can sit at any angle: picnic tables are tiny 3D builds projected with the map's own oblique.

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
| `reference/trinity-bellwoods_gates.png` | Trinity Bellwoods gates (v02) | proportions + details: smooth white stone, domed inner piers, gabled outer piers, inscribed lintels, arched carriage gate |
| `reference/TrinityBelwwods.jpg` | park layout | positions of paths, diamonds, courts, picnic areas, squirrel (squeezed into our wider park) |
| `reference/CN-tower.jpg` | CN Tower profile | pod bands, SkyPod, antenna proportions |
| `reference/glitch-transparency.png` | M1.1 bug report | Ivan circled 'transparent' pixels under a window: the teal brick's sky-blue speckle. Fixed at the palette level |
