# Game Design: Trash Panda: Right of Way

> You are a raccoon on a bicycle making Toronto a better place to live. The rats are just in the way.

Living document. The master prompt is the source of intent; this records what we've decided, and why where we deviate.

## Pillars
1. **Every mission visibly improves the city.** If an improvement can be shown, it is shown, in both views.
2. **Feels great on a bike.** Momentum, lean, dash and hop. Traversal is fun on its own.
3. **Satire with a sincere heart.** Dog Fraud is absurd; the before/after moments are earnest and mostly wordless.
4. **Evidence, not opinion.** Civic claims trace back to [URBAN_RESEARCH.md](URBAN_RESEARCH.md).
5. **Small, polished, fast.** 45–60 minutes total, 60 fps on phones, no scope creep.

## Core loop
RIDE → FIND PROBLEM → FIGHT RATS / CHALLENGE → SOLVE → CITY IMPROVES (sweep animation + Livability tick) → NEW MISSION / AREA

## Two modes, one game
| | Exploration | Action mission |
|---|---|---|
| Camera | 3/4 oblique top-down: ground top-down, facades face-on | Side view with parallax |
| Player | 8-direction bike, momentum, boost (stamina), dash, hop, bell | Platformer bike: run, jump (coyote time, buffer, variable height), air dash, bike-pump combo, stomp |
| Purpose | Navigation, discovery, landmarks, NPCs, mission markers | Combat and mission objectives |
| Transition | Camera zooms on the marker → iris close → before-vignette → side view opens on the raccoon | "STREET CLEARED!" → after-vignette → map → transformation sweep |

Assets are shared: Queen West facades come from one generator used for both the map buildings and the side-view backdrop.

## Controls
Revised after the M0 review: K felt unnatural, so the keyboard layout is now **left hand on WASD**, with an arrow-key alternative.

| Action | Keyboard | Arrow-key layout | Gamepad | Touch |
|---|---|---|---|---|
| Move | WASD | arrows | stick, d-pad | floating stick (left 55% of screen) |
| Boost (hold) | Shift | V | RB / RT | yellow BOOST |
| Hop / jump | Space | Z | A | green JUMP (largest) |
| Dash | Q | C | B | blue DASH |
| Interact (map) / Attack (missions) | **E** (or R) | X | X | red ACT, label changes: BELL / GO! / READ / PUMP |
| City map | M (or Tab) | M | Select / Y | MAP (top right) |
| Pause / settings | Esc (or P) | Esc | Start | II (top right) |

The controls appear in a first-run toast on the map and on every mission title card. They are also listed in full under **Pause → Controls** and **Title → Controls**.

**Decision (with Ivan):** Attack is the context use of Interact. Dash and stomp also damage rats, so mobile stays at 4 big buttons plus 2 small ones (map and pause).

## Map
One continuous city:
```
              NORTH
           /         \
HIGH PARK — QUEEN WEST — DOWNTOWN — EAST END
           \         /
            WATERFRONT
```
16px tiles. A district is about 160×90 tiles. Adjacent districts take 15–20 s to cross, end-to-end about 50 s with boost. Vertical links only through Queen West and Downtown.

**M1 slice: Queen West (104×76 tiles)**, rebuilt after Ivan's review to be recognisably Toronto:
- **Dundas St W** (north), with the 505 streetcar and Little Portugal's blue-and-white tiled facades.
- **Victorian house styles** on the blocks east and west of the park (Ivan's M1 note): Gothic Revival **bay-and-gables**, **Queen Anne** houses with turrets and **Second Empire** mansards.
- **Trinity Bellwoods Park** in the middle, matching the real park's position between Queen and Dundas:
  - the white stone-and-iron **gates** at Queen and Strachan, with a readable plaque
  - laid out from the Friends of Trinity Bellwoods park map (Ivan's reference): the **dog bowl** in the middle, the **Skydome diamond** and diamond #2 on the east side, the **tennis courts** by Queen, the **circle path**, the long diagonal, the west spine to Dundas, and **green picnic tables** at the numbered picnic areas
  - paved paths, park lamps and Toronto green bins
  - the **white squirrel**
- **Queen St W** (south), with the 501 streetcar, curb parking lanes and **no bike lanes** on this stretch (the mission adds them).
- **Ossington Ave** and **Bellwoods Ave** crossing the district at signalised intersections, and **Strachan Ave** running south from the gates.
- A **graffiti laneway** behind Queen's south side.
- Ambient life: pedestrians on sidewalks and paths (kids, dog walkers), traffic, streetcars that stop at TTC stops, and cyclists (more of them once the protected lanes exist).
- **City map:** press M for the district map, with streets, landmarks, mission markers and your position.

**Distinct artifacts per district (Ivan's direction):** every district gets landmarks you can't mistake for anywhere else. Queen West has the gates, the dog bowl, the white squirrel, azulejo facades and the graffiti lane. Later districts get the same treatment: High Park (Grenadier Pond, the High Park zoo's capybaras, Bloor West), Downtown (Union Station, the PATH, Nathan Phillips Square's TORONTO sign), the waterfront (the Gardiner, the Ontario Place pods), East End (Leslieville, the Don Valley, the Riverdale Farm silo), and North (the Science Centre's brutalism, the Don Mills ravine).

**Dundas question (M0 review):** the 2026 provincial removals target Bloor, Yonge, University, Queen's Park and Avenue Road, not Dundas (see URBAN_RESEARCH §1). Dundas is on the map as the park's north edge. The bike-lane *removal* story plays out on **Bloor, in the High Park district**, as main mission 5, *The Lane Eater* (below).

## Livability
- Headline score starts at **60 (TORONTO)**.
- Tiers: 65 Better · 70 Great · 75 Excellent · 80 World-Class · 90 Amsterdam/Copenhagen territory · 100 Raccoon Utopia.
- Six visible categories: Cycling, Transit, Walking, Green + Public Space, Safety, Less Car Dependence. The master prompt's other categories fold into these.
- Main missions (now 10) are worth about +3 each and side missions +1–2, so a complete run lands around 94–100.

## Characters
- **The raccoon:** grey, bandit mask, big ringed tail. Rides a red steel cruiser with swept bars, a bell, and a wicker basket holding a pizza slice. Attack: a **bike pump** swung like a bat (3-hit combo). It replaced the trash-can lid at the M0 review because the lid didn't read at this scale.
- **Dog Fraud:** a cartoon bulldog politician and fictional parody, not a likeness of anyone.
  - Huge flushed pink pear head, swept white hair, folded dog ears, big dog nose and muzzle, a tan eye patch, smug squint, tiny dark suit and dotted tie. The moustache was removed at the M0 review.
  - Laugh: "FRA-HA-HA-HA-HA!" Catchphrase: "**ANOTHER CAR LANE.**" ("car" added at the M0 review so the joke can't be misread as pro-bike-lane).
  - Expressions so far: grin, laugh, shock.
- **Rats** (minions; funny, not scary):

| Rat | Look | Behaviour |
|---|---|---|
| Basic | purple DF campaign cap | melee, telegraphed "!" windup |
| Construction | hard hat + hi-vis | keeps distance, lobs traffic cones (cones can be swatted) |
| Traffic | flagger with STOP paddle | slow, longer reach, tanky |
| SUV, Bureaucrat (summons), Lobbyist (buffs), Mega Rat (miniboss) | | planned for M2–M3 |

## Missions

| # | Mission | District | Upgrade | Type |
|---|---|---|---|---|
| 1 | The Bike Lane War | Queen West | Protected bike lanes (replace curb parking on Queen) | combat (vertical slice) |
| 2 | Let the Streetcar Through | Queen West | Transit signal priority | non-combat signal-timing escort |
| 3 | King of the Street | Downtown | Transit-priority corridor | combat + clearing cars |
| 4 | **Slow Down, Dog** *(added by Ivan, made a main mission at the M0 review)* | High Park (school zone) | School-zone safety: cameras + traffic calming | escort kids across, chase down the rats hauling the camera away |
| 5 | **The Lane Eater** *(Bloor; Ivan's call at the M1 review)* | High Park (Bloor West) | Keeping protected lanes (community pressure) | auto-scrolling chase + rally-a-peloton + 3-part machine boss |
| 6 | Save the Science | North | Adaptive reuse | stealth + combat |
| 7 | The Great Parking Lot | East End | Parking → park | combat + park-building, SUV Rat boss |
| 8 | The Waterfront Heist | Waterfront | Public waterfront | combat |
| 9 | Finish the Line | Downtown → East End | Ontario Line | Mega Rat miniboss |
| 10 | Death by Highway | Waterfront | Highway → boulevard + park | "...another lane?" scene, then Highway Mech final boss |
| side | Pedestrian Takeover | Queen West (Kensington-style) | Pedestrian street | crowd-gathering |
| side | Intersection Repair | High Park | Protected intersection | puzzle |
| side | Public Consultation | citywide | support | signature hunt (exploration) |
| side | Protest Delivery | Downtown | — | courier run avoiding Dog Fraud's PR rats (changed from "avoid police") |
| side | Tree Corridor | East End | Green corridor | planting run |
| bonus | GO Electrification, Rail Deck Park | | | if scope allows |

### Mission 5: The Lane Eater (Bloor West)
The real 2026 removals happen on Bloor (URBAN_RESEARCH §1), so this mission is about *defending* lanes rather than adding them. It must play differently from the Bike Lane War:
- **The threat:** Dog Fraud's "Lane Eater", a huge rat-driven asphalt grinder, crawls along Bloor chewing up the protected lane and spitting out fresh car-lane paint ("ANOTHER CAR LANE" in its exhaust).
- **The twist (auto-scroll + crowd):** the screen scrolls on its own, with the machine behind you. Riding ahead, you **ring your bell at cyclists, who join a growing peloton** behind you (a "critical mass"). Each rider in the peloton blocks one hit and slows the machine. Lose riders to rats and cones, and the machine catches up.
- **The boss:** three weak points, each with its own pattern, broken with the pump: the conveyor (jump over the paint gobs), the rat foreman's megaphone (it summons construction rats) and the grinder (dash through when it overheats).
- **The ending:** the peloton fills Bloor and the machine stalls. The payoff is public pressure, not a court win: the after-vignette shows a protest ride with signs.
- **Tone:** the real dispute is live, with a Supreme Court leave application pending. The game shows the evidence and the community, and makes no claims about real people.
- **Upgrade:** "Lanes kept + community ride". It gives a modest Livability gain plus a new stat, **Riders rallied**.

Each mission has 2–4 beats: a ride section (curbs, cones, parked cars to hop), arena waves (camera locks), a mission-specific twist, then the finale. Every mission gets one twist of its own so combat doesn't repeat.

## Cutscenes
- Data-driven timelines (`src/data/cutscenes.ts`): captions with typewriter text, darkening, villain close-up rising into frame, dialogue box with a talking bob, the ROAD ROAD ROAD gag, title cards with blinds wipes, and shake.
- Before/after: the same composition before and after a mission. In M0 this is the map-level transformation sweep; per-mission vignette scenes (parent and child at a crossing) come in M1.

## Audio
Runtime chip synth (2 pulse channels, triangle, noise) with three original songs:
- *Queen St. Cruise* (exploration)
- *Historic Investment* (Dog Fraud's minor-key villain march)
- *Rat Rush* (action)

Plus an improvement sting and about 25 synthesized SFX: bike bell, streetcar bell, chain ticks, squeaks, FRA-HA-HA laugh, construction rattle, and others.

## Monetization
None. No ads, purchases, energy or login.
