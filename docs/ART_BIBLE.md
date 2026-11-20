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
| Pinks | Dog Fjord, dusk |
| Purples | dusk skyline, Dog Fjord's campaign colour (rat caps) |
| Yellows / oranges | signals, cones, hard hats, sunlight |
| Teal | bike share, painted facades |

Every sprite uses only palette keys, so consistency is guaranteed by construction.

## Scale and camera
- Internal 384×216; tiles 16px.
- **Exploration:** the ground is pure top-down. Building facades face south and are drawn face-on below their roofs. Characters, props and vehicles render from a **32° camera** so the raccoon reads in all 8 directions; classic 3/4 games cheat the same way.
- **Side view:** characters are about 36px tall (raccoon on bike, 48×36 frame) and rats about 27px. Side-view vehicles are rendered at 2.2× so they're in scale with the raccoon.

## Readability rules
1. Silhouette first: the raccoon's tail and bike, Dog Fjord's pear head and horns, the rats' ears and tail.
2. Faces need at least a 2px eye with a pupil.
3. Nothing thinner than about 1.3 world units in SDF models (or it vanishes in sampling).
4. Telegraph every enemy attack (windup pose plus a red "!").
5. Painted facades get calm textures; brick keeps a subtle running bond.

## Characters
- **Raccoon:** grey `G/h`, mask `k`, white brow and muzzle, ringed tail (alternating `h`/`g`). Red cruiser, wicker basket with pizza, yellow bell. Attack prop: a **yellow bike pump** with a black T-handle (v03). The lid didn't read; the first pump read as a gun. Rule: weapons must never look like firearms, so swing them, don't point them, and keep them bright.
- **Dog Fjord:** see GAME_DESIGN. The shape language comes from Ivan's reference: a street-art paste-up of a real politician with horns and a moustache. Only the *satirical shapes and tone* were taken. Since v06 (Ivan's review) he has a flushed pink pear head, a **swept white coif**, folded dog ears, a big dog nose and muzzle with whisker spots, a **tan eye patch** (dog marking; a darker one read as a black eye), a smug squint and a tiny suit. **No moustache.** The character is a cartoon bulldog, and no facial features of the real person were traced or matched. The reference image lives in the gitignored `reference/` folder and isn't redistributed.
- **Rats:** brown fur `w/x/X/j`, pink ears, nose, hands and tail, big white eyes with angry brows, buck teeth. Variants are distinguished by accessory colour: purple cap, yellow hard hat with orange vest, white cap with purple vest and red STOP paddle.

- **Poster art (M4.4):** the raccoon's hero portrait is an SDF bust like Dog Fjord's portrait: grey fur, the bandit mask with a white brow slanting down (determined), white muzzle and cheeks, rounded white-rimmed ears, a red bandana, the yellow pump over the shoulder (T-handle up: never pointed). Two expressions: a smirk and a fighting yell. Dog Fjord is re-rendered from the same model facing LEFT for the VS layouts. Both are drawn at twice the game's pixel density, the only art on the posters at that grid; street scenes stay at the game's pixels (2x).
- **Poster art (M4.5, Ivan):** no bandana; the bust is whole (neck, shoulders, chest, arms ending in dark paws) and fits the frame with a rounded bottom, so it never looks cut off; ears are fur-coloured triangles with round tips and dark insides (never white, never square); the pump carries end caps, a band, grip ribs, a gauge, the hose and chuck, and a wide T-handle with black grips. The smirk is the hero face. Dog Fjord faces left on the posters; his laugh shows a full row of upper teeth.
- **Portraits are 2D (M4.6, Ivan: "I would prefer completely 2d approach... pure 2d pixel art"):** character portraits are drawn, not rendered: flat colour shapes, a 1-px black outline (2 px at the posters' 1.5x), darker inner lines where parts overlap, cel shadows as flat shapes on the side away from the upper-left light (no pillow shading), a little checker dither at shadow edges, and hand-placed eyes, claws, teeth and freckles. Hands have fingers. One drawing per character serves every size (`tools/sprites/portraits.mjs`). Never scale a sprite by a fraction on screen: draw it at that size (or bake it once).
- **Proportions from the 3D, style from the refs (M4.7, Ivan: the 3D versions' "proportions, symmetry, overall shapes were better... but I want the 2D style still, it has more character"):** a portrait's proportions and outline come from the old 3D model, traced or measured from its render. The finish is the 2D craft of Ivan's raccoon refs 3, 4 and 5: chunky readable shapes, eyes with a highlight, flat cel shadows, limbs as outlined tubes with background showing between them. Light only ever sits on the outer edge of a face; a colour change never crosses a mouth. Check the in-game 112 x 100 portrait in the real cutscene, not only on a sheet.
- **Ref 03 is the craft bar (M4.8, Ivan: "getting quality closer to raccoon-ref_03"):**
  - Every material gets a 5 to 9 step ramp with cool shadows and warm lights.
  - Fur is drawn as strands that follow the form, not filled. Edges are tufted.
  - One coloured outline goes round the silhouette, and there are no black lines inside it.
  - Eyes get a gradient iris, a highlight and a sparkle.
  - Texture thins out at small sizes, so the 112 px portrait stays clean.
- **Appeal beats correctness:** judge the whole character before the fix list. A cartoon convention (Dog Fjord's puffed jowls around a big crescent grin) can read better than anatomy (hanging bulldog lips), and anatomy pushed too far made him lumpy and unlikeable.
- **Paint with light, not with parts (M4.9, Ivan: "drawing from shades, not from shapes... professional artists... think about how light is scattered and reflected, where are shadows and where are highlights"):**
  - Silhouette first, then one light for the whole figure.
  - Separate parts by light, cast shadow and value, never by outlines inside the silhouette.
  - Add details last, and only a few.
  - 3 to 4 tones per material in hard bands. Shadows lean cool, lights warm.
  - Check every portrait in greys (`tools/pixelcheck.mjs` writes the values view): one light side, one shadow side, the face as the contrast peak.
- **The CN Tower (M4.5):** one smooth taper from the trefoil base to the pod (no kink); the top after the close-up reference: rounded bowl, dark/light/dark window bands, white rim, narrower drum, lift housings, ribbed SkyPod, antenna with a red light band and a red tip.

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

**Rules added in M4:**
- A boss is a piece of the thing the mission is about: the Highway Mech is a walking stretch of the Gardiner (pier legs, a deck torso, a highway sign for a head), the Wrecker is a demolition crane.
- Brutalism reads as ribbed concrete: the Science Centre's walls are vertical ribs every 3 px, lit from the left, with deep slit windows.
- A real place's text is drawn in the game font on the building itself (ONTARIO SCIENCE CENTRE), never as a floating label.

**Rules added in M3.4:**
- Lettering on a sprite that faces both ways gets its own left-facing frame; a flipped sprite mirrors its text ("AIR FJORD" read backwards on the first pass).
- A tall landmark is one model, rendered once. The CN Tower's shaft is the trefoil base continued (the foils merge into the core and carry on as thinning ribs), not a strip glued on top.
- New enemies telegraph their rule in their silhouette: the Barrier Rat's board is held angled so its stripes show from the side; the Baggage Rat's suitcase is at its feet, where it will roll.

**Rules added in M3.3:**
- Symmetry is read as intent: a tower, a mast or any upright landmark is drawn symmetric about one column, even if that costs a 2 px stair on both sides at once. A quarter-pixel offset "for smoothness" reads as a tilt.
- At dusk a landmark keeps a lit element (window band, red mast light) so it separates from the sky.
- Animals in a top-down view are drawn mid-motion: a swimming shark bends.
- Every PNG ships as an exact indexed PNG. The art is a palette, so nothing is lost; if an image ever needs more than 256 colours, the pipeline falls back to RGBA by itself.

**Rules added in M3.2:**
- Long vehicles bend where the real one bends: the Flexity turns as three sections, cut at its accordion joints.
- A landmark is drawn from the photos Ivan sends, in its real shape first (the CN Tower's trefoil, the dome's nested roof panels, the aquarium's sharks), then simplified.
- At skyline scale, a landmark keeps the one feature people recognize (the CN Tower pod's white donut), even if it has to be exaggerated.

**Rules added in M3.1:**
- A landmark too tall for the map (the CN Tower) is drawn as its base plus a shaft that leaves the top edge. It's a building, so its footprint is solid and you can ride behind it.
- Only a building's footprint is solid; everything above it fades when the player is behind.
- Vehicles that turn get 45° frames; a corner reads better than a snap from one facing to the next.
- Signs on sprites use the game font (`drawText` in `tools/sprites/font.mjs`), never ad-hoc glyphs.
- Looking out at the lake shows the islands, not the skyline. Backgrounds show what's really behind that view.

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
| `reference/DogFjord.jpg` | Dog Fjord | shape language and tone only (see above) |
| `reference/don-jail.jpg` | the Don Jail (M4.1 redraw) | the tall rusticated centre block, pediment, banded columns, porch + steps; khaki wings with small arched windows; the two brick ventilation towers |
| `reference/colborne-lodge.jpg` | Colborne Lodge (M4.1 redraw) | Regency cottage: verandah of thin white posts, low hip, small upper storey, three white chimney pots |
| `reference/city-hall.jpg` | City Hall from above (M4.1) + the Freedom Arches | crescent tower roofs, concave glass faces, the saucer on its podium; the arches seen from above as tall curves |
| `reference/trinity-bellwoods_gates.png` | Trinity Bellwoods gates (v02) | proportions + details: smooth white stone, domed inner piers, gabled outer piers, inscribed lintels, arched carriage gate |
| `reference/TrinityBelwwods.jpg` | park layout | positions of paths, diamonds, courts, picnic areas, squirrel (squeezed into our wider park) |
| `reference/CN-tower.jpg` | CN Tower profile | pod bands, SkyPod, antenna proportions |
| `reference/glitch-transparency.png` | M1.1 bug report | Ivan circled 'transparent' pixels under a window: the teal brick's sky-blue speckle. Fixed at the palette level |
