# Game Design: Trash Panda: Right of Way

> You are a raccoon on a bicycle making Toronto a better place to live. The rats are just in the way.

Living document. The master prompt is the source of intent; this records what we've decided, and why where we deviate.

## Pillars
1. **Every mission visibly improves the city.** If an improvement can be shown, it is shown, in both views.
2. **Feels great on a bike.** Momentum, lean, dash and hop. Traversal is fun on its own.
3. **Satire with a sincere heart.** Dog Fjord is absurd; the before/after moments are earnest and mostly wordless. The game says so itself: ABOUT on the title screen carries the satire notice, the fiction label and the AI notice (M3.3).
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
HIGH PARK — QUEEN WEST — DOWNTOWN — EAST END
           \         /
            WATERFRONT
```
M4 added a NORTH district above Queen West and Downtown; M4.1 dropped it (Ivan's call) and moved its mission, Save the Science, to the Waterfront.
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

**M2: three districts, joined at their streets.** Each district is its own generated map. Queen St and Dundas/Bloor continue across the seams at the same rows: ride off the edge along a street, a blinds wipe plays, and you come out on the same street in the next district. Each district's building atlas loads when you first ride in.

**Decision (M2):** separate district maps rather than one giant tilemap.
- Each generator stays independent and readable.
- Phones only hold one district's buildings at a time; Downtown's towers alone are an 800 KB atlas.
- Each district gets its own street grid. Downtown is taller, to fit King St.

The cost is a 0.3 s wipe at the seam. The design target of "one city" is kept: streets line up, the minimap strip shows the districts west to east, and street signs at the edges name the next district.

| District | Size (tiles) | Streets | Artifacts |
|---|---|---|---|
| **High Park** (west) | 110 × 76 | Bloor St W (bike lanes; High Park + Dundas West stations), the Queensway (501), **Parkside Dr**, **Roncesvalles Ave** (504 streetcar) | Grenadier Pond with cherry trees along the east shore, black oak savanna, car-free park roads + trails, the zoo with **capybaras** (Bonnie + Clyde plaque), the wooden HIGH PARK sign, the playground, the **Parkside speed camera** (cut down; plaque), a school zone, the **Revue Cinema** marquee, Roncesvalles bay-and-gables |
| **Queen West** | 104 × 76 | Queen, Dundas, Ossington, Bellwoods, Strachan | (M1) + transit-priority signals after mission 2 |
| **Downtown** (east) | 120 × 92 | Dundas, Queen, **King St W**, **Spadina** (510 streetcar), John, University, Bay | **Nathan Phillips Square**: City Hall's curved towers + saucer, the TORONTO sign, the pool and Freedom Arches; Osgoode Hall's fence; **Old City Hall**'s clock tower; **Chinatown** lanterns at Spadina + Dundas; **Graffiti Alley** (Rush Lane, moved here from Queen West per Ivan); the **news van in the wall** at 299 Queen W; King West warehouses giving way to glass towers |

**Distinct artifacts per district (Ivan's direction):** every district gets landmarks you can't mistake for anywhere else. Queen West has the gates, the dog bowl, the white squirrel, azulejo facades and the graffiti lane. Later districts get the same treatment: High Park (Grenadier Pond, the High Park zoo's capybaras, Bloor West), Downtown (Union Station, the PATH, Nathan Phillips Square's TORONTO sign), the waterfront (the Gardiner, the Ontario Place pods), East End (Leslieville, the Don Valley, the Riverdale Farm silo), and North (the Science Centre's brutalism, the Don Mills ravine).

**Dundas question (M0 review):** the 2026 provincial removals target Bloor, Yonge, University, Queen's Park and Avenue Road, not Dundas (see URBAN_RESEARCH §1). Dundas is on the map as the park's north edge. The bike-lane *removal* story plays out on **Bloor, in the High Park district**, as main mission 5, *The Lane Eater* (below).

## Difficulty and score (M3.1)
- **Difficulty is chosen at NEW GAME** and fixed for the run.
  - EASY: 7 hits per life, score ×1
  - NORMAL: 5 hits per life, score ×1.5
  - HARD: 3 hits per life, score ×2
- **Lives:** a mission's health bar has that many segments. Losing the bar costs a life (lives are hearts, found hidden on the maps). M3.3 (Ivan): each district has two hearts, one in the open and one **behind a building**, under its roof, visible only once you ride behind it.
- **Replays (M3.3, Ivan):** a FIXED marker can be replayed. A replay earns **no points** and says so on the prompt, the title card, the score field and the end card. Debug missions and vignettes end at a REPLAY / BACK / MAIN MENU menu.
- **Collectibles tally (M3.3):** the city map shows plaques, hearts and eggs found per district.
- **Base points** (`src/core/Score.ts`):

  | Event | Points |
  |---|---|
  | rat | 10 |
  | SUV Rat | 25 |
  | piece built / depaved / fence torn down | 30 |
  | peloton rider | 20 |
  | boss | 500 |
  | mission (first win) | 1000 |
  | plaque (first read) | 50 |
  | heart | 100 |
  | easter egg | 250 |

  Plaques, hearts and eggs count once per run.
- **Easter eggs:** the white squirrel (Trinity Bellwoods), Graffiti Alley, the view from Riverdale hill, Sugar Beach.
- **Initials:** three arcade letters at NEW GAME.
- **High scores:** HIGH SCORES on the title screen shows this device's top 10, plus the online top 10 once the leaderboard is configured ([LEADERBOARD.md](LEADERBOARD.md)).

## Livability
- Headline score starts at **60 (TORONTO)**.
- ~~Tiers~~ (dropped in M4.3, Ivan: comparing Toronto to Amsterdam/Copenhagen oversold it): the score is shown out of 100, and beside it **BIKE NETWORK n/28**, the streets that are protected or slow (see M4.3 below). Thirteen missions add up to exactly 100.
- Six visible categories: Cycling, Transit, Walking, Green + Public Space, Safety, Less Car Dependence. The master prompt's other categories fold into these.
- Main missions (now 10) are worth about +3 each and side missions +1–2, so a complete run lands around 94–100. After M2: 60 → 64 (bike lanes) → 67 (TSP) → 71 (King corridor) → 74 (Parkside), in any order after mission 1.

## Characters
- **The raccoon:** grey, bandit mask, big ringed tail. Rides a red steel cruiser with swept bars, a bell, and a wicker basket holding a pizza slice. Attack: a **bike pump** swung like a bat (3-hit combo). It replaced the trash-can lid at the M0 review because the lid didn't read at this scale.
- **Dog Fjord** (M3.3: renamed from the working name; the name lives in `src/data/villain.ts`): a cartoon bulldog politician and fictional parody, not a likeness of anyone.
  - **He reacts to losing (M3.3):** after the 2nd, 4th and 6th mission win a short interstitial plays after the debrief (a press conference, behind closed doors, a very large office). He quotes the Livability score and goes from dismissive to rattled; the third sets up the highway finale. Once per run each, never on replays (`fjord_1..3` in `cutscenes.ts`).
  - Huge flushed pink pear head, swept white hair, folded dog ears, big dog nose and muzzle, a tan eye patch, smug squint, tiny dark suit and dotted tie. The moustache was removed at the M0 review.
  - Laugh: "FRA-HA-HA-HA-HA!" Catchphrase: "**ANOTHER CAR LANE.**" ("car" added at the M0 review so the joke can't be misread as pro-bike-lane).
  - Expressions so far: grin, laugh, shock.
- **Rats** (minions; funny, not scary):

| Rat | Look | Behaviour |
|---|---|---|
| Basic | purple DF campaign cap | melee, telegraphed "!" windup |
| Construction | hard hat + hi-vis | keeps distance, lobs traffic cones (cones can be swatted) |
| Traffic | flagger with STOP paddle | slow, longer reach, tanky |
| **SUV Rat** (M2) | a rat at the wheel of a dark SUV, purple DF cap | drives through your lane, honking; stomp the roof or pump the bumper (hits stall it); "RIGHT TURN ONLY!" |
| **Bureaucrat Rat** (M2 boss) | grey suit, red tie, ring glasses, rubber stamp, desk | stamp volleys, clipboard shove, summons clerks, red tape |
| **Lobbyist** (M3, buffed in M3.1) | navy suit, gold tie, briefcase of cash | keeps 120–170 px away; swings the briefcase when cornered; while he's on screen **every** rat on screen glints gold and takes **a third** of the damage. Take him out first |
| **Foreman Rat** (M2.1, M1 boss) | the construction rat at boss size | cones, jackhammer shove, whistle, a JACKHAMMER charge that leaves him dizzy |
| **The Lane Eater** (M3, M5 boss; reworked M3.2) | a yellow paving machine, rat foreman in the cab | charges edge to edge (jump the grinder), overheats against the edge (the only time it can be hit), comes back the other way; lobs asphalt; the foreman calls rats |
| **The Monster SUV** (M3, M7 boss) | a lifted SUV with a crowned rat at the wheel | charges across the lot and stalls at the edge; stomp the roof, pump the tyres while it's stalled |
| **Baggage Rat** (M3.4) | navy airline cap with a gold band, ramp vest, a wheeled suitcase | keeps its distance and **rolls a suitcase along the ground** at you (Ivan: "throwing but along the ground"): jump it, or swat it |
| **Barrier Rat** (M3.4) | hard hat, orange vest, a striped ROAD CLOSED board held in front | hits from the front bounce off the board (BLOCKED!); it turns slowly, so dash past and hit it from behind, or stomp it |
| **The Jet Tug** (M3.4, M11 boss) | a yellow baggage tug, a rat at the wheel, towing Dog Fjord's white private jet (AIR FJORD) | taxis across the park; its jet blast blows you back (no damage); hurts on contact while moving; stops to REFUEL at the edge, when the tug can be pumped; stomp the cabin any time; below half health it taxis faster and rolls a suitcase at you at every stop |
| **The Pink Digger** (M3.1, M8 boss) | the fictional MEGA SPA's pink excavator, a rat in a bathrobe + sunglasses at the controls | raises the bucket over a red ground mark, slams, gets STUCK (pump the arm), flings sand clods every third cycle; stomp the cab roof; faster below half health |
| **Guard Rat** (M4) | dark peaked cap with a badge, a flashlight | stands watch; the beam swings left and right. Caught in it (and not behind a crate) and it calls two rats, then chases |
| **The Wrecker** (M4, M6 boss) | a yellow crane truck on tracks, a rat in the cab, a wrecking ball on a chain | the ball swings across the arena (jump it, or keep clear); after five swings it hauls the ball up to RELOAD: pump the engine then; stomp the cab any time |
| **The Mega Rat** (M4, M9 boss) | the basic rat at 2.6× | hurls road chunks, shoves, and leaps to POUND the ground: shockwaves run both ways along the street (jump them) |
| **The Highway Mech** (M4, M10 final boss) | a walking stretch of the Gardiner: pier legs, a deck torso, a green ANOTHER LANE sign for a head, a claw holding a car | stomps (shockwaves both ways), flings cars, then VENTS (the chest grille glows: pump it); at 2/3 and 1/3 health it drops a slab; from a slab you can jump onto its deck and stomp it |

## Missions

| # | Mission | District | Upgrade | Type |
|---|---|---|---|---|
| 1 | The Bike Lane War | Queen West | Protected bike lanes (replace curb parking on Queen) | combat (vertical slice) |
| 2 | Let the Streetcar Through ✅ M2 | Queen West | Transit signal priority | non-combat streetcar escort |
| 3 | King of the Street ✅ M2 | Downtown | King St transit corridor | combat + SUV Rats + Bureaucrat boss |
| 4 | **Slow Down, Dog** ✅ M2 *(added by Ivan, made a main mission at the M0 review)* | High Park (Parkside school zone) | School zone, slowed by design | chase the camera haulers, then build humps / a raised crossing / a curb extension under traffic |
| 5 | **The Lane Eater** ✅ M3 *(Bloor; Ivan's call at the M1 review)* | High Park (Bloor West) | Keeping protected lanes (community pressure) | auto-scrolling chase + rally-a-peloton + 3-part machine boss |
| 6 | **Save the Science** ✅ M4, moved in M4.1 | Waterfront (a Queens Quay warehouse) | Science by the lake: the exhibits come out of storage | sneak past flashlights, catch the exhibit haulers, the Wrecker |
| 7 | The Great Parking Lot ✅ M3 | East End | Parking → park | combat + depave arena + Monster SUV boss |
| 8 | The Waterfront Heist ✅ M3 | Waterfront | Public waterfront | lobbyist waves + fence-tearing arena |
| 9 | **Finish the Line** ✅ M4 | Downtown | The Ontario Line opens | lay track under attack, the Mega Rat |
| 10 | **Death by Highway** ✅ M4 | Waterfront (under the Gardiner) | The Gardiner comes down | "...another lane?" scene, three waves, the Highway Mech; then the ending |
| 11 | **Grounded** ✅ M3.4 *(Ivan: "a mission about the airport war")* | Waterfront (Little Norway Park) | The park stays a park; no jets | Baggage + Barrier Rats, a stakes arena, the Jet Tug boss |
| 12 | **The Bike Bus** ✅ M4.1 *(Ivan's idea)* | East End (Dundas, Carlaw, Gerrard, Leslie) | A School Street | **on the map** (top-down): lead the bus, stop for nine kids at four stops, ring three SUVs out of the bike lane, beat the bell |
| side | Pedestrian Takeover | Queen West (Kensington-style) | Pedestrian street | crowd-gathering |
| side | Intersection Repair | High Park | Protected intersection | puzzle |
| side | Public Consultation | citywide | support | signature hunt (exploration) |
| side | Protest Delivery | Downtown | — | courier run avoiding Dog Fjord's PR rats (changed from "avoid police") |
| side | Tree Corridor | East End | Green corridor | planting run |
| bonus | GO Electrification, Rail Deck Park | | | if scope allows |

### Mission 2: Let the Streetcar Through (Queen West), built in M2
Non-combat escort. The 501 rolls along the far lane while you ride the near one. It stops for anything in its way:
- **Red signals:** pump the yellow call box for priority (green + the white transit bar).
- **A double-parked RAT EXPRESS van** (3 pumps) and **a left-turner** waiting across the tracks (2 pumps).
- **Cones that construction rats drop on the rails:** swat them, or bonk the rat.

Seconds the streetcar spends blocked fill a schedule meter. 15 s of delay and "THE 501 IS LATE AGAIN!" Scheduled stops don't count. An arrow tracks the streetcar when it's off-screen.

### Mission 3: King of the Street (Downtown), built in M2
- Arena wave of rats.
- **Through-traffic:** SUV Rats ping-pong across the arena. Stomp the roof or pump the bumper; a hit stalls the car, so the combo lands. It finally gives up: "RIGHT TURN ONLY!"
- A mixed wave.
- **The Bureaucrat Rat** boss at his desk, a readable 4-move loop:
  1. A stamp volley (paper arcs you can swat).
  2. A walk-up and clipboard shove.
  3. The desk bell, which summons two clerks.
  4. RED TAPE sweeping the floor (jump it).

  It gets faster at 2/3 and 1/3 health, and only finishers and stomps make it flinch.

### Mission 4: Slow Down, Dog (High Park / Parkside), built in M2
The story is the real Parkside camera (URBAN_RESEARCH §16).
- **Chase:** two rats carry the camera toward the pond. They run faster than you ride but slower than your boost, so you have to boost in bursts and jump the cones. Catch them and fight them; reach the pond too late and it's "SPLASH!".
- **Build:** in the school zone, pump three sets of stakes into a speed hump, a raised crosswalk and a curb extension while SUV Rats speed through. Each finished piece makes cars crossing it bounce and crawl.

The payoff is design that slows cars without needing a camera.

### Mission 5: The Lane Eater (Bloor West)
The real 2026 removals happen on Bloor (URBAN_RESEARCH §1), so this mission is about *defending* lanes rather than adding them. It must play differently from the Bike Lane War:
- **The threat:** Dog Fjord's "Lane Eater", a huge rat-driven asphalt grinder, crawls along Bloor chewing up the protected lane and spitting out fresh car-lane paint ("ANOTHER CAR LANE" in its exhaust).
- **The twist (auto-scroll + crowd):** the screen scrolls on its own, with the machine behind you, always on screen at the left edge (M3.2). Riding ahead, you **ring your bell at cyclists, who join a growing peloton** behind you (a "critical mass"). M3.2 (Ivan: "just pass them while ringing"): a rung rider **clips in**, pedalling up from a standstill, and joins only if you stay within 50 px of them until their bar fills. Each rider in the peloton blocks one hit and holds the machine back. Meanwhile the conveyor **lobs hot asphalt** ahead of you (a red shadow marks the landing spot; the puddles burn), more often further down the street.
- **The boss (M3.2, Ivan's pattern):** it **charges across the whole screen**, and only the grinder drum hurts, so jump it. It slams into the edge of the screen, rolls back and **overheats**. Only then can its three weak points be pumped: the conveyor, the foreman's cab and the grinder. Then it drives off that side and comes back from it, charging the other way. The foreman calls a rat each stall; the conveyor lobs gobs while it lines up off screen. Below half health it charges faster and cools quicker.
- **The ending:** the peloton fills Bloor and the machine stalls. The payoff is public pressure, not a court win: the after-vignette shows a protest ride with signs.
- **Tone:** the real dispute is live, with a Supreme Court leave application pending. The game shows the evidence and the community, and makes no claims about real people.
- **Upgrade:** "Lanes kept + community ride". It gives a modest Livability gain plus a new stat, **Riders rallied**.

### Mission 7: The Great Parking Lot (East End), built in M3
MEGAMART's lot south of Queen (URBAN_RESEARCH §6). Two rat waves, one with an SUV Rat. Then a locked **depave** arena: pump five cracked asphalt patches (3 hits each) into soil and saplings while rats defend them. The boss is the **Monster SUV**: it charges across the lot and stalls at the arena edge. Stomp its roof any time, and pump its tyres while it's stalled. At half health it charges faster. M3.1 (Ivan: "I can't avoid him"): two **cart shelters**, with pallets as the step up, have roofs above the SUV, so its charge passes under you. Payoff: the lot becomes a park.

### Mission 8: The Waterfront Heist (Waterfront), built in M3
The fictional MEGA SPA is fencing off the shore (URBAN_RESEARCH §7). Three waves include **Lobbyists**. M3.1: while one is on screen, **every** rat on screen takes a third of the damage, and a cornered lobbyist swings his briefcase. The middle beat is a locked arena with four fence panels across the promenade to pump down while rats and a lobbyist defend. The finale is **the Pink Digger**. The background looks out at the Toronto Islands and the island airport. Payoff: the fences, the gate and the spa are gone, and the island is a public park with a beach.

### Mission 11: Grounded (Waterfront), built in M3.4
Dog Fjord's rats stake a jet runway through Little Norway Park (URBAN_RESEARCH §23; the stakes are fiction, the outcome is real: in July 2026 Ottawa said no to jets). A wave of Baggage Rats, a locked arena of four survey stakes to pump out while Barrier Rats guard them, a mixed wave, then the **Jet Tug**. Payoff: the stakes are gone, the park gets its trees and a bench back.

**Monster SUV arena (M3.4, Ivan: "only leave the pallets"):** the cart shelters are gone. Three low pallet stacks stand in the lot; on one you're still in the SUV's way, but a jump from it clears the roof.

Each mission has 2–4 beats: a ride section (curbs, cones, parked cars to hop), arena waves (camera locks), a mission-specific twist, then the finale. Every mission gets one twist of its own so combat doesn't repeat.

## Cutscenes
- **Tracking shots (Ivan, M1.1 → M2):** side vignettes pan the whole street as one plane (facades, sidewalk, parked cars, planters, standing actors), so riders and streetcars hold their place on screen and visibly move. A `pan` step eases the speed, for example to stop before the rats walk in.
- Every main mission has a before/after pair. Dog Fjord appears in the world (at his podium) for the first time in *King of the Street*.
- Data-driven timelines (`src/data/cutscenes.ts`): captions with typewriter text, darkening, villain close-up rising into frame, dialogue box with a talking bob, the ROAD ROAD ROAD gag, title cards with blinds wipes, and shake.
- Before/after: the same composition before and after a mission. In M0 this is the map-level transformation sweep; per-mission vignette scenes (parent and child at a crossing) come in M1.

## Audio
Runtime chip synth (2 pulse channels, triangle, noise) with original songs:
- *Queen St. Cruise* (exploration). M3.3: each district plays it at its own tempo and key (`DISTRICTS[id].music`: High Park slower in D, Downtown faster in D, the East End in Ab, the Waterfront in Eb).
- *Historic Investment* (Dog Fjord's minor-key villain march)
- *Rat Rush* (action)
- *Another Lane of Trouble* (M3.3: every boss)
- *Street Cleared* (M3.3: the win fanfare) and *Bonk* (M3.3: a life lost), both short and unlooped

Plus an improvement sting and about 25 synthesized SFX: bike bell, streetcar bell, chain ticks, squeaks, FRA-HA-HA laugh, construction rattle, and others.

## Monetization
None. No ads, purchases, energy or login.

## M4: the North, the last three missions, the ending
- **The North district** (above Queen West + Downtown): Don Mills + Eglinton, the boarded-up Science Centre with its pods toward the ravine, the Don's East Branch ravine with its trail, Flemingdon Park's slabs, Line 5's Science Centre station. North on Ossington or Bellwoods leads to the bottom of Leslie; north on Spadina, University or Bay to the bottom of Don Mills; and back.
- **Mission 6, Save the Science:** a stealth beat (flashlights, crates), a chase (the exhibits to the truck), the Wrecker.
- **Mission 9, Finish the Line:** lay the track (five rail piles) while rats defend it; the Mega Rat.
- **Mission 10, Death by Highway:** unlocks only when every other mission is done. The intro's highway shot comes back with Dog Fjord adding lanes that never move; the Highway Mech; the Gardiner comes down.
- **The ending:** Dog Fjord concedes ("I'LL TAKE THE STREETCAR... IS THERE A FIRST-CLASS STREETCAR?"), the raccoon rides on, *TORONTO. A PRETTY GOOD CITY. STILL WITH A FEW PROBLEMS. BUT FEWER.*, then THE RACCOON'S REPORT CARD (missions, Livability, lanes, parks, transit, highway lanes removed, safer school zones, riders, rats, score) and the credits with the satire notice. The run is saved and sent to the leaderboard.

## M4.1: Ivan's M3.3–M3.4 notes
- **The North is gone** (Ivan's call: "drop North, move the mission"). Save the Science now happens in a Queens Quay warehouse that holds the closed Science Centre's exhibits; its payoff is SCIENCE BY THE LAKE. Saves standing in the North start again in Queen West.
- **The Bike Bus**, the first mission played on the map itself. A bike bus works like a school bus on bikes: a set route, stops along the way, grown-ups leading. Stop beside the kids at each stop (they join and ride in a line behind you), ring your bell at the SUVs parked in the bike lane, and reach the school before the bell. Late: back to the first stop. Payoff: a School Street. It now has to be done before Death by Highway, so the finale stays last.
- **Share posters:** after every mission the evidence box has a small SHARE button (S, or tap), and the pause menu has SHARE YOUR CITY. Four poster designs (Queen St, the face-off with Dog Fjord, the bike bus, the lake), wide (1920×1080) and tall (1080×1920), with your Livability, score and missions stamped on. X, Facebook, Instagram (the phone's share sheet when there is one), or save.
- **Credits:** the satire + AI notice shows once, before the intro on NEW GAME. ABOUT opens on the credits (the alias SEXWITHAWHALEINC, Instagram and X links you can click); pages flip with LEFT/RIGHT.
- **Bosses:** the Jet Tug drives off screen before it turns and comes back from the side it left; only the tug hurts; the jet is a platform you can ride. The Highway Mech walks between attacks; its slabs stand on piers at the height you land on. Stomps send visible dust shockwaves, and the Mega Rat throws barrels.


## M4.2: Ivan's M4.1 notes
- **City map:** street and park names only; neighbours marked outside the frame where they connect; arrows move by direction; every map fills the screen.
- **Nothing pops in:** bosses slide in from off screen, mid-fight rats come from the screen edge, arena spots are already on the street, slabs fall from above.
- **The Wrecker:** it drives its boom over you, then swings the ball (one-sided) or drops it where you stand (shadow, shockwaves). Only the ball hurts; pump the engine or stomp the cab any time, double damage while it lets off steam.
- **Save the Science:** crates stand in front of the raccoon; HIDDEN / HIDE HERE; the getaway truck drives off with the exhibit if the rats reach it.
- **The Jet Tug** revs at the edge (nothing to climb yet), then crosses fast. **The Monster SUV** bounces you off its drawn roof, and only its front hurts.
- **The mission list** (debug) is numbered in unlock order.

## M4.3: Ivan's notes after M4.2 + a code and game review
- **The bike network:** every street on the five maps (28) ends up PROTECTED (a curb-separated lane each way) or SLOW (humps, sharrows, cars at cycling speed and half as many, bikes take the lane). Each mission adds two or three streets anywhere in the city (`src/data/network.ts`); the payoff sweeps in the ones on the current map and a toast names them all. The city map draws the network (green protected, yellow slow, grey painted) with a legend. Fiction: RACCOON TRANSIT PLAN (URBAN_RESEARCH §26).
- **No tier names:** LIVABILITY n/100 and BIKE NETWORK n/28 on the HUD; the report card says EVERY STREET: SAFE TO RIDE at the end, and counts protected and slow streets.
- **Strachan** has painted bike lanes from the start (real, south of King); mission 7 makes them protected.
- **Dock Drop** (Downtown, after King of the Street): bike share, unbranded. Tow a trailer of docks to six gaps in 90 s; stop at each to set a station down (share bikes ride out of it); ring your bell at the clutter crew who cart new stations off. Payoff: stations on every map and share-bike riders in traffic (URBAN_RESEARCH §25).
- **Boss checkpoint:** once a boss fight starts, losing a life restarts at the boss (the Lane Eater, whose boss is the end of its autoscroll, still restarts at the start).
- **Ranks:** S/A/B/C per mission (hits taken; the escort: its delay; the map missions: time left), the best kept and shown on FIXED markers; replays can improve it (still no points). Hits from lives lost in the same attempt count.
- **Hit feedback:** an impact star where each hit lands (big for combo hit 3 and stomps), a swoosh showing the swing's reach.
- **Readability:** a dark band behind the action HUD's top line, the GO banners and the result cards; the map missions' status lines in their own box under the livability HUD; hint boxes more opaque.
- **The Megamart wall** is three different bays (store front, garden centre, pickup bay) instead of one sign per screen.

## M4.4: Ivan's notes on M4.2 / M4.3
- **Save the Science, the guards:** they walk their beat back and forth across a crate. Crouch behind it and the guard walks right past; hit it from behind for a one-hit TAKEDOWN. In its beam (not hidden), or hit from the front: the alarm (it chases and calls two rats).
- **The Wrecker:** only hittable while its ball is STUCK in the ground after a drop (3 s, with a GET CLEAR! warning at the end); a hit outside the window clangs off and says so. Each cycle: drive over you, hoist (a shadow), drop (shockwaves: jump them), stuck, haul the ball out, wind it up to the far end of its arc (always high over a standing raccoon), then two swings back and forth (jump the low point, or stand clear). 24 HP, so about three windows.
- **Initials:** typed on a keyboard (Backspace steps back); on a phone, tapping the letters opens the phone's own keyboard (a hidden text field over them). The arrows still work.
- **The city map:** the side neighbours' labels are turned with a `^`, so the arrow points out of the map.
- **Bike share bikes are orange** (docks, the trailer, the riders in traffic).
- **The Waterfront:** Lake Shore and Queens Quay lead west to High Park too (like the trail).
- **The CN Tower** on the map is the whole tower: trefoil base, shaft, main pod, SkyPod, antenna. **The Freedom Arches** overlap left over right.
- **Share posters (ten):** drawn at 768 x 432 (twice the game's resolution), exported x3 (2304 x 1296), previewed as the exported PNG itself. A hero portrait of the raccoon (an SDF bust like Dog Fjord's). Six new posters after classic game screens: VERSUS (a fighting game's VS screen), TITLE (a 16-bit title screen with an emblem), SUNSET (an arcade racer's road to the horizon), BOSSES (a boss-select grid: the beaten ones lit), STREETS (a beat-em-up cover), SCORES (an arcade high-score table). The four from M4.1 fixed per Ivan's notes. `tools/posters.mjs` renders all twenty into a folder for review.
- **The payoff's share button** is a boxed, blinking button (SHARE A POSTER). The share screen only comes up after a mission's first win (and from the pause menu): replays and the debug list skip the payoff.

## M4.5: Ivan's notes on M4.4
- **Your name:** up to 10 letters and digits (it was 3 initials). Typed on a keyboard, or with a phone's own keyboard; the arrows still work (UP / DOWN on the first blank starts a new letter). An empty name plays as RAC. The online board's rules take the longer names once they're republished; until then a long name posts its first three letters.
- **Debug runs never reach a scoreboard:** a run played in a `?debug` session is marked for good (`flags.debugRun`) and kept off the local high scores and the online board, even if it carries on without `?debug` later.
- **The CN Tower** narrows in one smooth curve from the ground to the pod. The top follows a close-up photo: the pod as a stack (rounded bowl, dark / light / dark window bands, a white rim, a narrower drum, the lift housings), the slim upper shaft, the ribbed SkyPod, the antenna thick and segmented with a red light band, then thin with a red tip.
- **The Freedom Arches** are painted left to right: each arch lies over the one to its left.
- **The raccoon's hero portrait:** no bandana; a neck, shoulders, a chest and arms, the whole bust inside the frame; fur-coloured triangular ears with round tips and dark insides; the pump in detail (end caps, a band, grip ribs, a gauge, the hose and its chuck, a wide T-handle with black grips). The smirk everywhere (the yell is retired).
- **VERSUS:** Dog Fjord faces left, toward the raccoon; his laugh is a proper open mouth with a full row of teeth. On the tall poster the slash cuts the raccoon off, not the picture's edge.
- **SCORES:** your run is a lit band behind its row; the name column fits the longest name shown.
