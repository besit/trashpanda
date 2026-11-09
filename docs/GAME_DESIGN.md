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
| Player | 8-direction bike, momentum, boost (stamina), dash, hop, bell | Platformer bike: run, jump (coyote time, buffer, variable height), air dash, lid combo, stomp |
| Purpose | Navigation, discovery, landmarks, NPCs, mission markers | Combat and mission objectives |
| Transition | Camera zooms on the marker → iris close → side view opens on the raccoon | "STREET CLEARED!" → iris → map → transformation sweep |

Assets are shared: Queen West facades come from one generator used for both the map buildings and the side-view backdrop.

## Controls
| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | WASD / arrows | stick, d-pad | floating stick (left 55% of screen) |
| Jump / hop | J or Z | A | JUMP (largest) |
| Dash | Space or C | B | DASH |
| Interact (map) / Attack (missions) | K or X | X | ACT → label changes: BELL / GO! / HIT |
| Boost | Shift or L | RB / RT | BOOST |
| Pause / skip | Esc or P | Start | — |

**Decision (with Ivan):** Attack is the context use of Interact. Dash and stomp also damage rats, so mobile stays at 4 buttons.

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

**M0/M1 slice:** a Queen West chunk (72×44 tiles):
- Queen St with streetcar tracks and painted bike lanes
- a cross street with streetcar tracks and a signalized intersection
- north-side Victorian storefronts
- a Trinity-Bellwoods-inspired park (south-west)
- laneway rear walls and houses (south-east)

## Livability
- Headline score starts at **60 (TORONTO)**.
- Tiers: 65 Better · 70 Great · 75 Excellent · 80 World-Class · 90 Amsterdam/Copenhagen territory · 100 Raccoon Utopia.
- Six visible categories: Cycling, Transit, Walking, Green + Public Space, Safety, Less Car Dependence. The master prompt's other categories fold into these.
- Main missions are worth about +3.5 each and side missions +1–2, so a complete run lands around 94.

## Characters
- **The raccoon:** grey, bandit mask, big ringed tail. Rides a red steel cruiser with swept bars, a bell, and a wicker basket holding a pizza slice. Attack: a trash-can lid swing.
- **Dog Fraud:** a cartoon bulldog politician and fictional parody, not a likeness of anyone.
  - Huge flushed pink pear head, horn-like ear tufts, handlebar moustache, smug squint, tiny dark suit and dotted tie.
  - Laugh: "FRA-HA-HA-HA-HA!" Catchphrase: "ANOTHER LANE."
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
| 1 | The Bike Lane War | Queen West | Protected bike lanes | combat (vertical slice) |
| 2 | Let the Streetcar Through | Queen West | Transit signal priority | non-combat signal-timing escort |
| 3 | King of the Street | Downtown | Transit-priority corridor | combat + clearing cars |
| 4 | Save the Science | North | Adaptive reuse | stealth + combat |
| 5 | The Great Parking Lot | East End | Parking → park | combat + park-building, SUV Rat boss |
| 6 | The Waterfront Heist | Waterfront | Public waterfront | combat |
| 7 | Finish the Line | Downtown → East End | Ontario Line | Mega Rat miniboss |
| 8 | Death by Highway | Waterfront | Highway → boulevard + park | "...another lane?" scene, then Highway Mech final boss |
| side | **Slow Down, Dog** *(added by Ivan)* | North / Queen West | School-zone safety: cameras + traffic calming | escort kids / restore camera |
| side | Pedestrian Takeover | Queen West (Kensington-style) | Pedestrian street | crowd-gathering |
| side | Intersection Repair | High Park | Protected intersection | puzzle |
| side | Public Consultation | citywide | support | signature hunt (exploration) |
| side | Protest Delivery | Downtown | — | courier run avoiding Dog Fraud's PR rats (changed from "avoid police") |
| side | Tree Corridor | East End | Green corridor | planting run |
| bonus | GO Electrification, Rail Deck Park | | | if scope allows |

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
