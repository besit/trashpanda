# Audit, 2026-11-14: creative + technical

Ivan asked for a full look at the project before M3.3: what works, what doesn't, and what can be improved without his input. Method: read every gameplay module and the design docs, then captured 79 screenshots across the title, intro, all five districts, all seven missions and every vignette (`tools/scratch/survey.mjs`), and checked the build output.

## Creative

**What's strong**
- The pixel art is consistent and has a real identity: the 48-colour palette, the dusk skyline, the Victorian storefronts, the District landmarks. Nothing reads as generic.
- Every mission has its own mechanic (escort, chase + build, auto-scroll peloton, depave, fence arena). That is rare in a game this size.
- The before/after vignettes carry the argument wordlessly, as intended. The intro highway gag lands.
- The writing is short, in caps, and funny without being cruel. The satire targets policy, not a person.

**What's weak**
1. **The villain disappears.** Dog Fjord appears in the intro and in 5 of 7 briefings, then has no reaction to losing. There's no escalation between mission 1 and mission 7; the story is a flat list of fixes. Cheap fix: short interstitials after every second win where he reacts to the Livability score (3–4 lines each), so the player feels him losing ground.
2. **Text on text.** Vignette captions at nearby y values (18 and 20) are drawn over each other because there's no `clear` between them: `king_before`, `lot_before`, `wf_before`, `tsp_before`. Mission title cards sit directly on the art (the MEGAMART sign shows through the hint). The district name card overlaps the HUD box on phones.
3. **Things pop in.** In `calm_before`, `king_before`, `lot_before` and `tsp_before` the static actors (camera, parked cars, the signal) are added after the first caption, so they appear 1–2 s into the shot.
4. **Exploration has no tally.** Plaques, hearts and eggs exist but nothing shows what you've found; a per-district count in the pause menu gives exploring a purpose.
5. **One song for five districts** and the boss fights reuse the action loop. A boss theme and a life-lost sting are missing. A cheap variety trick: tempo/transposition variants of the explore song per district.
6. **No ending, no credits, no about screen.** The disclaimer needs a home (ABOUT on the title).
7. **Spawn points:** High Park's spawn is an empty lawn. Minor.

## Technical

**What's strong**
- 60 fps at 6× CPU throttle everywhere. Data-driven missions and cutscenes. Lazy district loading. Deterministic asset generation. Tests cover the core loop.

**Bugs found (with root causes)**
1. **Raccoon stuck on the pump frame** (Ivan's report). `SidePlayer.update` calls `anims.stop()` during a swing, then only calls `play('rs_idle')` if `currentAnim.key !== 'rs_idle'`. After `stop()`, `currentAnim` is still `rs_idle`, so the idle never restarts: the sprite stays on the last pump frame until you move. Fix: also check `!anims.isPlaying`.
2. **Stomps count while hovering** (Ivan's "it dies in one jump"). The stomp test is `velocity.y > 40 && player.bottom <= roof + 10`: true anywhere above the roof while falling. The bounce then lifts the player and the next fall counts again every 150 ms. Fix: require the feet within a band of the roof (landing), and a per-target stomp cooldown. The same code is copied for rats, SUV Rats, the Monster SUV, the digger and the bosses, so it becomes one helper.
3. **Planes dive into the lake.** The turboprop tween ends at 38 % of the screen width and hides. Fix: full crossings along the top-left to bottom-right line, landings left→right, take-offs right→left.
4. **Lane Eater hits:** `takeHits` returns unless `move === 'hot'`. Ivan wants the cab and conveyor always hittable and only the grinder protected while charging.

**Download size**
- First load is about 2.4 MB against a 2.5 MB budget. Boot assets are 1.1 MB plus 0.48 MB of district map JSON loaded at boot for the city map.
- **The PNGs are written as 32-bit RGBA by pngjs.** All art uses a palette of 48 colours, so every image can be an exact 8-bit indexed PNG at roughly half the bytes (the 790 KB Downtown atlas becomes about 300 KB). This is a pure win: no visual change (verified by decoding and comparing pixels), no runtime change.
- Phaser ships `phaser-arcade-physics` (no Matter, no Impact). A Vite alias swaps it in; the game uses Arcade only. Saves about 15 % of the JS.
- Map JSON for the city map can load on demand when the pause map pages to a district.

**Code health**
- `ActionScene.update` repeats the hit/stomp block for 5 enemy kinds. Worth one helper while fixing the stomp bug.
- `lobbyTip` isn't reset between missions (intentional: once per session).
- `Traffic.jammed` is `jamT % 34 > 22`: 12 s of jam in every 34. Ivan wants congestion more often.

## Prioritised plan

Ivan's order: most valuable for the least effort first; then cheap but less visible; then important and expensive; then polish.

### Tier 1: high value, low effort
- Rename Dog Fraud → **Dog Fjord** everywhere (one constant for dialogue, docs, README, song name, sprite labels).
- Disclaimer + ABOUT screen (title menu) with the satire notice, the AI notice, credits and sources.
- Fix the pump-frame freeze.
- Stomp only on landing, with a cooldown (one helper for every enemy).
- Text never on text: captions replace captions in the same slot; title cards and `say()` hints get a dark panel; the district card moves clear of the HUD.
- Static actors present from frame one in the four vignettes.
- Planes cross fully; none dives into the water.
- Lane Eater: cab and conveyor always hittable; grinder protected only while charging.
- Replay menu after debug missions and vignettes (REPLAY / BACK TO LIST / MAIN MENU).
- Boss theme + life-lost sting (original tracker data).
- Indexed 8-bit PNGs (exact) from the asset pipeline.
- Phaser arcade-only build.
- Collectibles tally (plaques, hearts, eggs per district) in the pause menu.
- Dog Fjord interstitials after every second win (if Ivan agrees).

### Tier 2: low effort, less visible
- Gardiner jams more often.
- Riverdale pedestrian bridge 2 tiles wide.
- High Park dirt paths stop before the sidewalk.
- Curved aquarium sharks.
- Skyline CN Tower perfectly symmetrical, with a rim light at night.
- Pink Digger: red mark → the bucket's shadow.
- Explore song variants per district (tempo/transposition).
- Second heart per district hidden behind a building (the roof already fades when you're behind it).
- Waterfront east ↔ East End south connection with an explicit exit table.
- Streetcar turns: section draw order when vertical; smooth spacing through the turn.
- Lazy map JSON for the city map.

### Tier 3: important, high effort
- New rats: Baggage Rat (ground attack) + Barrier Rat.
- The island airport mission (research, map, sprites, boss, vignettes).
- CN Tower in Explore: the shaft as a continuation of the trefoil base.
- Lane Eater: the whole asphalt arc on screen; more of the machine visible.
- Sources on the results card and a SOURCES page.

### Tier 4: polish
- Downtown's streetcar track tiles read as a railway with ties; flush rails would match Queen St.
- Mission rank (S/A/B/C) on the end card.
- High Park spawn somewhere with something to look at.
