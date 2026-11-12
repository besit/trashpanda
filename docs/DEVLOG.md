# Trash Panda: Right of Way: Dev Log

A running record of the process: what was tried, what failed, what changed and why. Newest entries are at the bottom of each day. Art iterations are frozen in [`art/history/`](../art/history/INDEX.md).

---

## 2026-11-09: Day 1, M0 kickoff

### Planning decisions (with Ivan)
- **Attack input:** a context button. K/Interact becomes Attack inside missions, and Dash and jump-stomp also hurt rats. Mobile keeps a stick plus 4 big buttons.
- **Hosting:** a public repo at `besit/trashpanda`, auto-deployed to GitHub Pages.
- **Art:** I author all of it as code and data, with an art-direction review gate at M0.
- **Map camera:** 3/4 oblique top-down, so Toronto's brick facades are visible instead of just roofs.
- **Mission added at Ivan's request:** speed cameras. Ontario banned municipal automated speed enforcement and the cameras were removed. Facts are to be verified in `URBAN_RESEARCH.md` before any copy is written.
- **Process rules:** dependencies stay project-local only; every art version is kept; this devlog is kept up to date.

### Stack
Phaser 3.90 (final stable v3), TypeScript 5.9, Vite 8, Vitest 5 and Playwright 1.65. Playwright's Chromium is installed into `node_modules` (`PLAYWRIGHT_BROWSERS_PATH=0`), so nothing is installed globally.

I deliberately chose Phaser 3.90 over the newer Phaser 4.2: v3 is frozen, battle-tested and very well documented. Phaser 4's renderer gains don't matter for a 384×216 pixel game.

### Art pipeline v1: pixel art as code
I can't drive a GUI editor, so all art is authored in code with two techniques:

1. **Hand-painted grids + procedural parts** (`tools/lib/raster.mjs`): text grids where each character is a palette colour, plus primitives (lines, ellipses, polygons), an auto-outline pass and rim lighting. Used for the side-view hero sprites, where expressiveness matters most.
2. **A tiny SDF renderer** (`tools/lib/sdf.mjs`): characters and vehicles are modelled from spheres, capsules, tori and boxes, then ray-marched into the 48-colour palette with stepped shading, Bayer dithering and an auto-outline. One model renders in all 8 directions and every animation frame, consistently. It's the same idea as the 3D-to-pixel pipelines some indie games use, scaled down to a few hundred lines.

Master palette (`tools/palette.mjs`): TTC reds, Toronto brick, lake blues, concrete greys, park greens, Dog Fraud pinks, and sunset oranges and purples. Outlines use a near-black purple instead of flat black, for a warmer arcade look.

### Side-view raccoon v01
![raccoon side v01](../art/history/raccoon_side/v01/preview.png)

The head is a hand-painted 14×10 grid (bandit mask, white brow and muzzle, ears). The bike is procedural: a red steel cruiser, spoked wheels that rotate per frame, swept-back bars, a bell, and a wicker basket with a pizza slice. Legs use 2-bone IK, so the feet really follow the pedals. The attack is a **trash-can lid swing**, chosen for being on-brand and non-violent.

What works: the silhouette and striped tail read immediately, and the red bike pops.
Known issues: the tail clips the frame edge, the eye is too small to emote, and the legs are a bit spindly.

### Top-down raccoon: three failed passes, then v01–v02
- **Pass 1 (not preserved):** rendered with the same 45° oblique projection as the ground. Everything came out pale and the front/back views were long, thin sticks. A true oblique projection stretches anything pointing north-south.
- **Pass 2 (not preserved):** darker shading and a chubbier body. Better, but still stick-like front and back. The key insight: classic 3/4 games *cheat*. The ground is drawn top-down, but characters are drawn from a lower camera.
- **Pass 3:** moved characters to a 32° camera. The first render was upside down because of a sign error in the camera basis (`right = d × up` should have been `up × d`). Fixed.
- **v01:** 8 directions × 4 pedal frames, all from one model.
- **v02:** wider torso, head and mask so the front view shows the face and the back view shows the tail.

![raccoon top v02](../art/history/raccoon_top/v02/preview.png)

*Ivan asked to keep every version from here on. Passes 1–2 were overwritten in scratch before that.*

### Rats v01 → v03
- **v01:** SDF rats read as rats immediately, but they were too skinny, with 1px eyes, and the flagger's STOP paddle covered his face.
- **v02:** scaled up 1.18×, bigger heads and ears, white eyes with pupils and angry brows, paddle moved to the back hand. The new ears then covered the eyes and hats.
- **v03:** ears moved back and up.

![rats v03](../art/history/rats/v03/preview.png)

### Dog Fraud v01 → v05
Taken from Ivan's street-art reference as *shape language only*: flushed pear head, horn-ears, handlebar moustache, smug grin, tiny suit. He's built as a cartoon bulldog, not a likeness.
- **v01:** the framing bug put the head out of frame.
- **v02:** first real look. Characterful, but closer to a pig than a dog.
- **v03:** added a protruding muzzle with a split lip, droopy jowls over the collar, bigger horn-ears, smug arched brows (the first brows read as angry) and a smaller body. The muzzle now hid the moustache and nose.
- **v04:** nose and moustache brought forward.
- **v05:** the laugh frame gets a real open mouth (teeth and tongue) for FRA-HA-HA.

![dog fraud v05](../art/history/dogfraud/v05/preview.png)

### Environment
- **Tiles:** asphalt, embedded streetcar tracks (E-W, N-S, crossing), sidewalks with slab seams, curbs, zebras, painted and protected bike lanes (green paint, curb, bollards), parking, grass, park path, laneway, tree pits. The bike stencil first rendered as blobs, so it was replaced with a hand-painted glyph. The flipped north-lane tiles showed an upside-down bike, so proper north-side tiles were drawn.
- **Buildings:** a seeded Victorian storefront generator (sign bands, awnings, sash windows, cornices). Rear walls get fire escapes and graffiti. v02 calmed the noisy painted-brick texture.
- **Props and vehicles:** the TTC stop pole vanished because it was thinner than a pixel, so it was thickened. The streetcar roof read as a white slab and is now grey with a taller window band. Side-view cars looked tiny next to the side raccoon, so they got dedicated 2.2× side renders.
- **Side-view backgrounds:** a dithered day/dusk sky, a skyline with the CN Tower and the Dome, a back row of houses, the Queen West storefront strip, and a street strip with painted and protected variants.

![side bg](../art/history/side_bg/v01/preview.png)

### The game
- **Boot → Title → Cutscene → Explore ⇄ Action**, sharing one GameState.
- **Explore:**
  - tilemap ground; y-sorted buildings and props; building footprints as colliders
  - roofs fade when the raccoon rides behind them
  - traffic on lanes with a signal cycle; cars and streetcars yield and honk or ring
  - mission marker with a zoom + iris transition
  - the **transformation sequence:** the camera pans along Queen while protected lanes sweep in tile by tile with sparkles and planters pop up, then Livability ticks 60 → 64 with a sourced blurb.
- **Action:**
  - parallax layers; arena-lock waves; parked cars to hop on
  - coyote time, jump buffer, variable jump, air dash
  - 3-hit trash-can-lid combo; stomps; hit-stop and shake
  - rats with telegraphed windups; construction rats lob cones you can swat
- **Audio:** a WebAudio chip synth (pulse waves with 12.5/25/50% duty via PeriodicWave, triangle, LFSR noise) and a lookahead sequencer. Songs: *Queen St. Cruise*, *Historic Investment* (Dog Fraud), *Rat Rush*, plus an improvement sting.

### Bugs found by testing (and fixed)
1. **Quick key taps were ignored:** a key pressed and released within one frame cleared Phaser's just-down flag before the scene read it. The input manager now latches taps from keydown events. Headless tests found this, and it would also have bitten fast human tappers.
2. **Preview server served the wrong base path:** `vite preview` runs as "serve", so the `/trashpanda/` base wasn't applied.
3. **The raccoon spawned inside a street tree's collider.**
4. **The wave-clear check could never fire** once dead rats were filtered out of the list. Replaced with explicit per-wave counters.

### Research
Two entries are written in `URBAN_RESEARCH.md`, and the mission's framing changed because of the second one:
- **Speed cameras** (Ivan's request): Ontario's Bill 56 ban took effect November 14, 2025. The SickKids/TMU study found a 45% drop in speeding vehicles in school zones.
- **Protected bike lanes:** Bloor saw a 49% rise in cycling, and the TCAT economic study was positive. Teschke 2012 found cycle tracks had about 1/9 the injury risk. **News since planning:** the Court of Appeal overturned the Charter ruling (August 2026) and Bloor removal work began in October 2026. The in-game blurb now quotes only Teschke 2012.

### Numbers
- 60 fps even at 6× CPU throttle; about 16 MB JS heap; about 575 KB total gzipped download.
- 10 unit tests and 3 end-to-end tests, all passing. Deployed to https://besit.github.io/trashpanda/.

---

## 2026-11-09: Day 1 (evening), M1 pass from Ivan's M0 review

Ivan reviewed M0 on a phone and a desktop. The verdict: "I like the art!" He sent 8 issues, answered the 4 open questions, and left a pile of smaller notes. This pass works through all of it, plus the planned M1 items.

### The freeze (the review's worst bug)
*"The side-view scene hanged after the second wave, probably when the thing the rat throws hits the ground."* He was exactly right. `physics.add.collider(cones, ground, cb)` looks as if it calls `cb(cone, ground)`. But when a **group** collides with a single object, Phaser 3 internally swaps the arguments and calls `cb(ground, cone)` (World.js `collideHandler` → `collideSpriteVsGroup(object2, object1)`). My callback then called `setVelocity` on the ground's *static* body, which threw. An exception inside Phaser's game loop stops the loop, so the game froze.

The e2e test never let a cone land, which is why it slipped through. The fix resolves the cone explicitly. There's also a new regression test, and that test needed its own fix: my first version **passed even with the bug put back**, because the cones hit the (invulnerable-by-HP) player and were destroyed before touching the ground. Making the player truly invulnerable lets the cones fall through. Now the test fails on the old code and passes on the new.

### Smaller bugs from the review
- **"Weird non-moving buildings in the middle-ground"** on the title and cutscene: the back row of houses was the one parallax layer that never scrolled. All layers now drift.
- **"Transparent pixels in top-layer buildings":** arched sash windows rounded their corners by setting pixels to *transparent* instead of wall colour. A scan of 600 generated buildings now finds 0 holes.
- **Cars on the vertical street offset to the left:** the lane centre was computed from the curb column (`XS + 1.5`) instead of the road centre (`XS + 2`), so it was off by 8px. Vertical car sprites were also clipped by a too-short frame.
- **North-side flowerbeds in the wrong place:** the planters were on the sidewalk side of the north lane. They now sit on the separator, the traffic side, for both lanes.

### Decisions applied
| Ivan said | Done |
|---|---|
| K isn't natural; use E or R. What are the other controls? | Left hand on WASD: **E** act/attack (also R), **Q** dash, **Space** hop/jump, **Shift** boost, **M** map, **Esc** pause, plus an arrow-key layout (Z/X/C/V). Controls show in the first-run toast, on mission title cards, and on new Controls pages (pause and title). |
| Small street things shouldn't be obstacles; trees are fine | Only trees, buildings, the gate piers and parked cars are solid now. |
| "Another CAR lane" | The catchphrase, intro title and rat signs now say ANOTHER CAR LANE. |
| The park should be Trinity Bellwoods, north of Queen, with the white gates | The whole district was rebuilt (below). |
| Queen has no bike lanes; the mission should add them | Queen now starts with curb parking lanes. The mission turns them into protected lanes, and the parked cars drive away as the sweep passes. |
| Dog Fraud: no moustache, white hair, a bit more dog | Dog Fraud v06 (below). |
| Stretch to fill wide screens | The view width now adapts from 384 to 480px. An 844×390 phone gets 468px of city and no black bars. |
| A bike pump reads better than the lid | Raccoon side v03 (below). |
| Speed cameras: main mission | *Slow Down, Dog* is now main mission 4, in the High Park school zone. |
| The bell ring comes from his butt | A new ring effect comes from the handlebars, in the direction he faces. |
| Rotate-your-phone should overlay the darkened game | It's now a translucent, blurred overlay, and gameplay auto-pauses. |
| A small map? | **M** opens a district map built from the live tilemap, so improvements show up on it. It shows streets, landmarks, missions and your position. |
| Intro roads gag: DVP-style highway into the lake at sunset, then another lane, still jammed | New intro shot (below). |
| Add Dundas, since the removal happens there? | Researched: the 2026 removals target Bloor, Yonge, University, Queen's Park and Avenue Road, not Dundas. Dundas is on the map anyway (it really is the park's north edge), and the removal story will move to Bloor in the High Park district. |

### The new Queen West
Real geography first: Trinity Bellwoods sits *between* Queen and Dundas, with its gates on Queen facing Strachan Ave. The map is now 104×76 tiles:
- **Dundas St W** with the 505 and Little Portugal shops, including a new **azulejo** tiled-facade material.
- **The park:**
  - the **gates**, with a plaque you can read with E
  - the **dog bowl** (the hollow left by buried Garrison Creek)
  - tennis courts and a baseball diamond
  - smooth paved paths (one Catmull-Rom decal instead of blocky tiles)
  - park lamps and Toronto's raccoon-resistant **green bins** (of course)
  - the **white squirrel**, which flees when you ride up
- **Queen St W** with the 501.
- **Ossington** and **Bellwoods** at signalised intersections, and **Strachan** south from the gates.
- A **graffiti lane** behind Queen, with procedural murals: bubble letters, drips and little faces.

![gates](../art/history/park/v01/preview.png)
![decals](../art/history/park_decals/v01/preview.png)

Failed first passes:
- The gates' iron grilles came out as **solid black slabs**: the auto-outline pass filled every 1px gap between bars. The iron is now drawn *after* outlining.
- The dog bowl's shading had hard **pie-slice sectors**. It now uses a continuous slope term with Bayer dithering.

### Ambient life
- **Pedestrians:** 9 variants, including a kid, a dog walker and a senior in a coat. They walk sidewalks and park paths, stop for you, and sometimes answer the bell ("NICE BELL!").
- **Traffic** was rewritten around data-driven lanes and intersections:
  - streetcars stop at TTC stops
  - one signal cycle for all intersections
  - **cyclists**: before the upgrade, a few brave ones ride in the streetcar lane and cars queue behind them honking. After it, they get the protected lanes, and there are more of them. The map itself makes the argument.

![people](../art/history/people/v01/preview.png)
![cyclists](../art/history/cyclists/v01/preview.png)

### Dog Fraud v06
- Removed the moustache.
- Added a big **swept white coif**.
- More dog: a longer muzzle, a bigger nose with nostrils, whisker spots, flews, and folded dog ears (the horns now read as ears).
- Added an eye patch. The first one was dark pink and read as a **black eye**, so it became a tan fur patch.

![dog fraud v06](../art/history/dogfraud/v06/preview.png)

### Bike pump (raccoon side v03)
- **First try:** a grey tube thrust straight forward. It read as a **gun**. Rejected immediately.
- **Second try:** a red pump swung like a bat. It merged into the red bike, and the raised frame clipped out of the 48×36 frame.
- **Final:** a **yellow** barrel with a black T-handle, a hose loop and a white swoosh on the big swing. Frames grew to 56×44 for headroom.

![raccoon side v03](../art/history/raccoon_side/v03/preview.png)

### Intro: "ANOTHER CAR LANE"
The ROAD×8 gag is replaced by Ivan's idea. A baked backdrop shows a ravine of autumn woods, the river, the lake at sunset and the skyline with the CN Tower. The road is drawn live, so a lane can be added on screen.
- Five lanes of back-view cars (pre-rendered at 8 depth scales), crawling.
- Dog Fraud: "...ANOTHER CAR LANE!"
- A sixth lane paves in from the horizon. Cars pour in for a moment of hope, then gridlock. Caption: "SIX LANES. STILL NOT MOVING." (induced demand: URBAN_RESEARCH §14).

The first pass let the jam *drain* away from the camera over time, so the road emptied. Lanes now refill from behind the camera.

![dvp intro](reviews/m1/06_intro_dvp_lane.png)

### Before/after vignettes
- **Before:** Queen at 8:14 am. A parent with a kid seat rides between parked cars and an approaching 501, wobbles, and gets honked at. Rats with an ANOTHER CAR LANE sign claim the curb lane. The raccoon: "WHAT QUEEN NEEDS IS A BIKE LANE. A REAL ONE, WITH A CURB."
- **After:** the same street with green protected lanes and planters, the parent, a bike-share rider and the streetcar gliding by. Caption: "NOW A KID CAN RIDE IT."

The first passes overlapped captions and let the streetcar hide the cyclist entirely. Side-view scenes now put the dialogue box at the top, so it doesn't cover the actors.

### Also
- Pause menu: resume, city map, controls, music and sound volume, screen shake, save + quit.
- Rats no longer stack into one blob.
- A chunkier hydrant (it read as a red gem).
- Touch controls gained map and pause buttons.

### Numbers
- 60 fps at 1×/4×/6× CPU throttle, with a 21 MB heap (was 16 MB).
- JS 349 KB gzipped; generated art 1.05 MB raw.
- 10 unit tests and 6 end-to-end tests, all passing.

---

## 2026-11-10: Day 2, M1.1 pass from Ivan's M1 review

Ivan played M1 and sent notes on each area, plus three new references: a photo of the gates, the Friends of Trinity Bellwoods park map, and a CN Tower photo.

### Intro
- The parkway is no longer named on screen. Dog Fraud now says "STUCK IN TRAFFIC? I HAVE THE SOLUTION."
- The "FIVE LANES / SIX LANES" captions are gone (too direct).
- When the sixth lane appears, the cars no longer surge into it. The lane just fills with the same crawl as the others.
- The river is about 3× wider.

### Gates (photo reference)
The memory version was close, but the photo showed what was off:
- The stone is smooth white, not coursed ashlar.
- The inner piers end in a panelled lantern stage and a dome with a finial.
- The outer piers have gabled pinnacles.
- The pedestrian openings sit under stone **lintels carrying the Latin inscriptions**.
- The carriage gate has a segmental iron arch.

The plaque is now three short lines on a bronze plate that fits any screen: THE UNIVERSITY OF / TRINITY COLLEGE / 1852 - 1925. The old one was a long toast that got cut off.

![gates v02](../art/history/park/v02/preview.png)

### The park, re-laid from the real map
Everything that already existed was moved to where it actually is. The real park is tall and narrow and ours is wide, so `R(u, v)` maps the map's normalised coordinates into our rectangle:
- the dog bowl in the middle
- the **"Skydome" diamond** in the north-east, plus diamond #2 on the east side (home plates facing east, as on the map)
- the tennis courts by Queen on the east
- the **circle path**, the long diagonal, the west spine to Dundas, the Lobb Ave crossing, and the field-house path around the bowl
- **picnic tables** at numbered picnic areas 2–8
- the white squirrel, living where the map draws its squirrel

The SDF picnic table lost its legs at this size (thin parts vanish when sampled), so it's hand-painted instead.

### Buildings
- **Three Victorian house styles** for the blocks beside the park (`tools/sprites/houses.mjs`):
  - Gothic Revival **bay-and-gable** (Toronto's signature): a steep gable with white gingerbread bargeboard and a pointed-arch window over a two-storey bay.
  - **Queen Anne:** a round turret with a candle-snuffer cone, a fish-scale gable and a spindle porch.
  - **Second Empire:** a slate mansard with arched dormers, a bracketed cornice and hooded windows.

  The gable or mansard is drawn *in front of* the top-down roof, because in 3/4 view it's the front plane rising. The first pass drew hip-roof lines that looked like a **TV antenna** on every Queen Anne, so they were removed.
- **Graffiti is now a separate sheet** (bubble throw-ups, tags, a raccoon stencil, a smiley, a heart) laid over walls at map-build time, as Ivan suggested. Building images are graffiti-free again, and any wall can carry a piece.

![houses](../art/history/buildings/v04/preview.png)

### CN Tower (photo reference)
Redrawn as one shared scanline profile used by every skyline:
- a tapering shaft
- the banded main pod: glass, the widest white rim, a window band, the cap
- a thin upper shaft and the SkyPod
- a long white antenna

The proportions follow the real heights. The first pass tapered in 2px stair-steps; a quarter-pixel centre offset makes each side step separately.

![cn tower](../art/history/cn_tower/v01/preview.png)

### Feel
- **Traffic speeds:** cars 72–98 px/s, streetcars 52, cyclists 32–39, pedestrians 16–26. A cyclist in the streetcar lane now visibly holds the cars up.
- **Bell replies** from pedestrians now stay readable for 2 s.
- **Side view:** the front buildings scroll with the sidewalk; they used to drift at 0.7× and looked detached. Vignettes no longer pan, so parked cars and planters stay planted on the street.
- **Arena lock:** when rats appear, the arena locks exactly where the camera already is (no jump). After the wave, the camera catches up gently.
- **"Transparent pixels" in the side view:** no holes exist in any facade (all 600+ map buildings and the side strip were checked by script). My best guess is that the daytime skyline towers' windows were sky-blue, so they read as see-through. They're darker now, but this one is flagged for Ivan to confirm.

### Touch bugs (found by Ivan, then a second one found by the new test)
1. **The overlay flickered closed:** the finger that tapped MAP or II was still down when the overlay opened, so its first frame saw a fresh press and closed it again. The paused gameplay scene also never saw the finger lift, which left the button stuck. Now:
   - the overlay ignores input held at open
   - touch state is released whenever a scene pauses or resumes
   - map and controls stay open until the new **X** button (or M/Esc) closes them
2. **Quick taps were dropped:** the new e2e test taps MAP the way a headless browser does (down and up within one frame) and the overlay never opened. It's the same sub-frame problem the keyboard had in M0. Touch buttons now latch taps like keys do.

### Bloor
Per Ivan, the Bloor removals get their own main mission: **The Lane Eater** (GAME_DESIGN, mission 5). It's an auto-scrolling chase ahead of a lane-eating paving machine. Ring the bell at cyclists to grow a peloton that shields you and slows the machine, then break its three weak points.

### Numbers
- 60 fps at 1×/4×/6× throttle; 22 MB heap.
- 10 unit tests and 7 end-to-end tests, all passing.
- Art history: 37 versions.

---

## 2026-11-10: Day 2 (afternoon), M2: three districts, missions 2–4

Ivan's M1.1 notes came in with a screenshot of the "transparent pixels", and a go for M2.

### The "transparency" was a colour, not a hole
Ivan circled a spot right under a window on a teal building. A script had already shown there were no alpha holes anywhere, so I zoomed into his screenshot. Inside the teal wall were **single sky-blue pixels**. The teal brick's weathering speckle used palette `C` (#7cc6f2), which is *exactly* the daytime sky colour. Every speckle read as a pinhole through the building. It's a one-character fix (speckle → pale grey `H`), and it fixes every teal building in both views. New art-bible rule: no wall colour may equal a sky colour.

### The other M1.1 notes
- **Picnic tables:** Ivan suggested 3/4 at 45°. The flat sprite was replaced by a tiny 3D build: slatted top, two benches and A-frame legs as boxes and lines, projected with the map's own oblique (screen y = ground y − height) and painted back to front. Now the table can sit at any angle. Pairs alternate ±45°, with a dithered shadow.
  ![picnic](../art/history/park/v03/preview.png)
- **Cars from behind:** the SDF back view was mostly windshield. It's now a hand-built parametric back view, painted natively at each of the 8 depth scales: roof, tinted rear window with a third brake light, trunk shut line, glowing tail lights in dark housings, plate, bumper, reflectors, tyres, mirrors.
  ![cars](../art/history/dvp/v03/preview.png)
- **"Bikes and cars should move":** I had read the M1.1 note as "hold the camera still"; Ivan meant "move everything together". Vignettes are now tracking shots. Facades, sidewalk, parked cars, planters and anyone standing on the street scroll as one plane, while riders and the streetcar hold their place on screen. A new `pan` step eases the speed, so the shot can glide to a stop before the rats walk in.
- **The jump on unlock:** found in Phaser itself. `camera.startFollow()` **snaps** the camera onto the target the moment it's called; the lerp only applies afterwards. The fix keeps the current scroll after `startFollow` and tweens the lerp up from 0.01.

### Three districts, joined at their streets
- Queen West's generator was refactored into a shared toolkit (`tools/map/common.mjs`): streets, crossings, building rows, furniture, parked cars, lanes and exits. A byte-for-byte comparison caught exactly one difference: the old code placed a tree pit on **Strachan's curb** (its local "is this a N-S street?" check forgot Strachan). That's a fix.
- **Decision: separate district maps, not one giant tilemap.** Each district is its own generator and its own lazily loaded building atlas. Streets continue across the seam at the same rows, and a blinds wipe plays as you ride off the edge. Downtown's towers alone make an 810 KB atlas, so phones should only ever hold one district.
- **High Park:** Grenadier Pond (the shore is solid), cherry trees along its east shore, black oak savanna, car-free park roads, the zoo with **capybaras** (plaque: Bonnie + Clyde, 2016), the HIGH PARK sign, the Parkside school zone and its **speed camera stump**, Roncesvalles with the 504 and the **Revue**'s marquee, and Bloor with its bike lanes (mission 5 will fight for them).
- **Downtown:** **Nathan Phillips Square**, with City Hall's two curved towers cradling the saucer, the TORONTO sign, and the pool under the Freedom Arches. Also Osgoode Hall's fence, **Old City Hall**'s clock tower, **Chinatown**'s lanterns at Spadina, **Graffiti Alley** (moved here from Queen West, as Ivan noted), the **news van bursting out of 299 Queen**, and King West warehouses giving way to glass towers.

![downtown](../art/history/downtown/v01/preview.png)
![high park](../art/history/highpark/v01/preview.png)

Failures along the way:
- The capybaras v01 read as loaves until they got a head.
- The SUV Rat's driver sat on the roof; the fix locates the glass band in the image and puts the driver behind the front window.
- In-world Dog Fraud v01 wore two ties, because the portrait head already includes its shirt and tie.
- The SCHOOL stencil doesn't fit in 16 px, so the lane says SLOW.
- The font has no `[ ]`, and `*` looks like `#`.

### Missions 2–4 and a playtest bot
Research first (URBAN_RESEARCH §3, §4, §16):
- the 1991 TTC signal-priority demonstration (−35% streetcar delay at six intersections)
- the King St pilot (~4 minutes faster, 72k→84k weekday riders, made permanent in 2019)
- the real Parkside camera: cut down 7 times in under a year and once dumped in a park pond, which *is* mission 4's plot

The missions:
- **Let the Streetcar Through:** an escort with no combat. Pump call boxes for priority, move a double-parked van and a left-turner, swat the cones off the tracks. Delay drains the schedule.
- **King of the Street:** **SUV Rats** (stomp the roof or pump the bumper; "RIGHT TURN ONLY!"), then the **Bureaucrat Rat**: stamps, a shove, summoned clerks and red tape.
- **Slow Down, Dog:** chase the camera haulers before the pond, then build a hump, a raised crosswalk and a curb extension under traffic.

I wrote a **playtest bot** (`tools/scratch/bot.mjs`) that plays with real key presses. It earned its keep:
- The chase was caught in 3 s (too easy). After a retune it could never be caught: the rubber band made the rats faster than an average boosting player. It's now **140 px/s with a gentle 1.05× near band**, catchable only by boosting smartly, in about 7 s.
- The Bureaucrat died in 6 s, so its HP went from 18 to 32.
- SUVs killed the bot repeatedly: a pump hit only slowed the car, which then drove into you anyway. Hits now **stall** the car (no contact damage while stalled), so the combo can land.
- **Two rat AI bugs that M1 also had:** a ranged rat spawned off-screen could back away forever and snipe cones from outside the arena, and a rat stuck at the edge never entered. Rats now always walk in first and stay inside a locked arena.

### Numbers
- **Performance:** 60 fps everywhere at 1×/4×/6× CPU throttle, including Downtown (38 MB heap).
- **Downloads:** first load about 1.8 MB (budget 2.5 MB); Downtown's 930 KB loads only when you ride in.
- **Tests:** 14 unit tests (new: v1→v2 save migration, every mission's marker and patch exist, every district exit has its partner) and 11 end-to-end tests (new: crossing districts; missions 2–4 from marker to saved payoff), all passing.
- **Art history:** 47 versions.

---

## 2026-11-11: Day 3, M2.1 pass from Ivan's M2 review

Ivan played M2 and sent a long, precise list, plus five references: the City's High Park map, two City Hall photos, Old City Hall, and a Flexity streetcar.

### The one-pixel seam (round two)
His description: a single row under the 2nd-floor windows changes colour, from the left of the screen up to the CN Tower's left edge, and the border **moves with the skyline**. A seam that tracks a *different* parallax layer can't be in the facade art. A per-row frame-diff harness (two captures, compare each row against the expected scroll) found nothing at 1:1 on my GPU. So I removed the whole class of bug instead of chasing a driver: every side-view layer (missions, vignettes, the title) is now a `ScrollLayer` made of plain images placed on whole pixels, replacing Phaser `TileSprite`s, whose shader-side texture wrapping is the only thing that could tie one row to another layer's content. To be confirmed on Ivan's machine.

### Systems
- **Side view moved up 18px** (`ui/sideLayout.ts`, one place for all the lines). Streetcars now sit on their rails in every vignette and mission, and the street strip is taller so the road reaches the bottom.
- **District seams by street name**, not by row (Ivan: maps can differ in size). The Queensway continues as Queen, Bloor as Dundas. That let High Park grow taller (to match the real park's shape) and Downtown push King south.
- **Lives.** Lose all your hearts and you lose a life (raccoon tokens between the hearts and the stamina bar) and the mission restarts. At zero lives you go back to the map with 3 lives again. Failing an objective (late streetcar, splash) just restarts. Two hidden extra-life tokens per district glint on the map.
- **Missions end on their last beat**: the boss falls → debrief. No riding past the desk.
- **Text that fits**: titles scale down, end cards wrap, and the map payoff shows a headline and then the evidence in a **box at the bottom that waits for a key** and pages long text.
- **Debug menus** (`?debug`): SELECT MISSION (any mission, briefing included) and WATCH VIGNETTES.
- **City map paging**: A/D or arrows page through districts; the strip marks the one on screen and "(YOU)".
- **Ctrl+M** mutes (a tiny DOM toast, so it works over every scene; M alone still opens the map).
- Rats stop their walk cycle when they stand still. Lanes can have a range, so John St's cars no longer drive through the buildings north of Queen. SUV Rats rise in from below the frame, as if turning in from a side street.

### Art (from the references)
- **City Hall v02**: the two curved towers read right at last: white convex backs, dark ribbed concave faces, crescent roofs, the saucer between, the walkway ring.
- **Old City Hall v02**: banded sandstone, arched windows, brown roofs with conical turrets, the belfry and spire.
- **Freedom Arches** span the pool north-south. Seen straight from the south an N-S arch is just a vertical bar, and the photo shows exactly that sliver, so the camera turns 28° to the west to let the curve read.
- **Flexity streetcars** on the map and in the side view; the old 3-section car is gone.
- **High Park re-laid from the map**: Grenadier Pond (with swans and wood ducks), Spring Creek ponds, all five park roads, the Grenadier Cafe, the dog park, the zoo, the greenhouse, Hillside Gardens, the Jamie Bell Adventure Playground, Colborne Lodge, and cherry trees along the pond.
- Downtown: Graffiti Alley between Queen and King and **rideable** (King's buildings were covering it), murals on every wall, the news van out of the CHUM building's east wall onto John, Osgoode Hall dropped.
- Dog Fraud's standing body redrawn (the portrait's own shoulders are clipped off); the Foreman Rat; smaller picnic tables; a Hillside tulip-bed tile.

### Missions
- **M1** gets a boss: **the Foreman Rat** (cones, a jackhammer shove, a whistle, and a JACKHAMMER charge that leaves him dizzy).
- **M2**: a progress strip with every signal, blocker and cone, a LAST STOP with people who cheer, 4 signals and 3 blockers, 12 s of slack. The end vignette is now a tracking shot of the streetcar while each signal flips to the white transit bar as its nose arrives.
- **M3**: Dog Fraud watches the boss fight from his podium ("GET HIM, PAPERWORK!") and runs off when it ends. The end vignette has people at the patios and the streetcar fully on screen.
- **M4**:
  - The haulers have a health bar (8 pumps to drop the camera).
  - The pond is in the park, and they leap over the sidewalk into it.
  - The camera tips over (same sprite, rotated) instead of swapping art.
  - Build stakes say what they become, and the raised crosswalk runs across the road.
  - The last car rolls over the hump instead of shaking.

### Failures
- Vitest suddenly failed even a one-line test with "reading 'config'". The editor had reopened the project as `c:\...` instead of `C:\...`, and Vitest loaded its own module twice under two drive-letter casings. Running from the upper-case path fixes it.
- City Map paging ignored fast key taps: menus read held keys, and a quick tap is gone by the next frame. Menus now get the frame's taps too.
- My bot couldn't finish M4's build, because it assumed the stakes are built in order.

## 2026-11-12: Day 4, M3: the East End, the Waterfront, missions 5, 7 and 8

Ivan's M2 answers: district seams are fine; keep the speed camera ("maybe we even remove the ban as a mission result"); go straight on to M3 after the fixes and fold the M2 feedback into the M3 review. M2.1 shipped (tag `m2.1`); this entry is the M3 content on top of it.

### Two new districts
- **East End** (east of Downtown):
  - The Don Valley first: the river, the Lower Don trail and the DVP. The river and the highway are solid, so you cross on the **bridges** at Dundas, Gerrard and Queen. The Queen St bridge carries Eldon Garnet's inscription as a plaque.
  - Broadview (504 streetcar) and the **Broadview Hotel**, Riverdale Park East on its hill, East Chinatown's lanterns on Gerrard, and Leslieville.
  - South of Queen: **MEGAMART** and its sea of parking (fictional).
- **Waterfront** (south of Downtown), the first district reached by riding **south**:
  - **N/S exits are new.** Exits used to be rows on the west/east edges. Now an exit is a span along any edge, matched by street name, and you arrive at the same distance along the span. Spadina, University and Bay line up with Downtown's columns, so riding down University drops you onto University.
  - The **Gardiner** overhead (deck segments drawn above everything), Lake Shore beneath it, mid-rises in its shadow.
  - **Roundhouse Park** with the CN Tower and the domed stadium.
  - **Queens Quay** with the streetcar in its grassy median. Its lanes are `transitOnly`: streetcars only, no cars or bikes.
  - The **Martin Goodman Trail** (bike-only lanes), the promenade, the boardwalk, **Sugar Beach**'s pink umbrellas, sailboats drifting about their moorings.
  - Out west, an island with the **Cinesphere**, two pods and Dog Fraud's fictional **MEGA SPA**, fenced off behind a locked gate on the causeway.

### Three new missions
- **5. The Lane Eater** (High Park, Bloor West):
  - An auto-scrolling chase with a paving machine behind you that eats the bike lane.
  - Ring your bell at cyclists to grow a **peloton**. Every rider takes a hit for you and slows the machine.
  - At the end of Bloor the machine turns on you: a 3-weak-point boss (conveyor, cab, and a grinder that's only open while it's overheated).
  - The after-vignette is a protest ride. The payoff headline ("THE PELOTON FILLS BLOOR. THE BIKE LANES STAY.") is labelled as the game's fantasy outcome, since the real removals began in October 2026.
- **7. The Great Parking Lot** (East End):
  - Two waves, then a locked **depave** arena: pump five cracked asphalt patches into soil and saplings.
  - Then the **Monster SUV** boss: it charges, stalls at the arena edge, and while it's stalled you stomp its roof and pump its tyres.
  - The lot becomes a park. The blurb is sourced from Toronto's December 2021 parking-minimum repeal.
- **8. The Waterfront Heist** (Waterfront):
  - The new rat is **the Lobbyist** (navy suit, gold tie, a briefcase stuffed with cash). He never fights. He keeps 120–170 px away, backing off when you approach, and every rat near him glints gold and **takes half damage**. The lesson is the order: corner the lobbyist, then fight the rest.
  - The middle beat reuses the depave arena with a `fence` style: four MEGA SPA fence panels across the promenade topple when pumped down.
  - The map payoff removes the fences and opens the causeway; the island gets a public beach, trees and picnic tables.

### The Ontario Place question
The real story behind mission 8 is the 95-year Therme lease at Ontario Place. I kept the spa **fictional** (MEGA SPA, never "Therme") and let the upgrade blurb carry only what I could source today: the lease (CBC, October 2024) and roughly 850 trees cut. Sources say 850 to 865, so the blurb uses the conservative "about 850". The blurb ends on a question rather than a verdict. One line I wrote for the lobbyist quoted a day-pass price. I cut it: it was invented, and it would read as a fact about the real spa.

### Fixes found while building
- **Map strip overflow:** with five districts, the City Map's strip ran under the close button. The fix is short names when the full ones don't fit, and "YOU: <district>" moved to the footer. My first attempt used `[ ]` and `*`, which the bitmap font doesn't have (`*` drew as a `#`-like star).
- **Unreadable signs:** "MEGA SPA" read as **HECA SPA** in 3×3 glyphs, and MEGAMART's sign was eight white squares. Both now use 5-px-tall glyphs (art history `waterfront/v01`, `eastend/v02`).
- **The island:**
  - The first island was drawn with `shore_n` on every edge, so it looked shredded. Shore tiles are now chosen per side.
  - The whole lake was one solid box, so the island was unreachable. The lake is now solid per row of water, so the island and the causeway stay rideable.
  - The first MEGA SPA stood *on the trail*, and its fence ran across the bike path. Both moved out to the island.
- **Captions:** two lines in the after-vignettes stacked on top of each other (in `lot_after` too, since M3's first pass). Each now clears first.

### Failures
- **The bot "lost" two missions that were winnable.**
  - In the parking lot it hammered fixed offsets from the camera, not the patches. The debug state now lists the open spots and the bot walks to them.
  - On the Lane Eater it attacked the grinder from the wrong side.
  - I probed both directly: every patch, every fence and every weak point registers hits. With the fixes the bot wins M7 (with 2 deaths) and M8 (no damage taken). The Lane Eater's conveyor and cab sit high and need jump attacks, which the bot doesn't do. Those two zones are verified by direct hits instead.
- **The unit tests had silently stopped covering the East End.** The test's generator table listed only three districts. It now generates all five and requires every exit to pair on the **opposite** edge.

### Numbers
Unit tests 14/14, e2e 18/18 (4 new in `m3.spec.ts`: the N/S ride, and marker → briefing → action → debrief → payoff for missions 5, 7 and 8). All scenes hold 60 fps with a p95 of 16.8 ms up to 6× CPU throttle. First load is about 2.3 MB of the 2.5 MB budget (see PERFORMANCE).
