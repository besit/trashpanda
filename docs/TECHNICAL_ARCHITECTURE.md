# Technical Architecture

## Stack
- **Phaser 3.90** (the final, stable v3 line). Arcade physics only, WebGL with Canvas fallback.
- **TypeScript 5.9 (strict), Vite 8**, deployed as a static site.
- **Vitest 5** for unit tests; **Playwright 1.65** for end-to-end tests, screenshots and perf. Chromium is installed into `node_modules`.
- **GitHub Actions → GitHub Pages:** every push to `main` runs tests and the build, then deploys.
- All dependencies are project-local. Nothing is installed globally.

## Rendering
- Internal resolution: **height 216, width 384–480**, chosen from the window's aspect ratio (`config.viewWidthFor`). An 844×390 phone gets a 468px-wide view and no black bars. `GAME_W` is an ES-module live binding, so code must read it at use time.
- `main.ts:fit()` resizes the game (`scale.resize`) when the width changes, then scales the canvas by an **integer** factor when the window is at least 2× (crisp on desktop) and fits otherwise (phones). CSS uses `image-rendering: pixelated`.
- Scenes re-anchor their HUD on the scale manager's `resize` event (Title restarts; Explore and Action move centred and right-aligned HUD; the touch controls re-layout).
- Landscape only on touch devices. Portrait shows a translucent rotate overlay over the dimmed game, and gameplay scenes auto-pause.

## Scenes (states)
| Scene | Role |
|---|---|
| `Boot` | loads `gen/manifest.json`, then the shared atlases, images and fonts; builds RetroFonts and animations. District assets are **not** loaded here |
| `Title` | logo, menu (Continue / New Game / test entries), audio unlock |
| `Cutscene` | interprets timeline data (`data/cutscenes.ts`) |
| `Explore` | 3/4 city, one **district** at a time: `preload()` lazily loads the district's building atlas, map JSON and ground decals. Holds `CityMap` + `TopDownPlayer` + `Traffic` + `Crowd` + HUD, mission markers (filtered by `requires`), edge **exits** to neighbouring districts, and the transformation sequence (sweeps along x or y) |
| `Action` | side-view missions composed from **beats** in mission data: ride, arena waves (rats + `SuvRat`s), boss (`Bureaucrat`), streetcar `Escort`, camera `Chase`, `BuildSpots`. Arena lock and release never snap the camera |
| `Pause` | overlay launched over Explore, Action or Title: menu (volumes, shake, controls, save + quit) and the city map (rendered from the live tilemap plus decals) |

Shared state lives in `core/ctx.ts`, the single `GameState` all scenes read and write. Scenes communicate through `scene.start(key, data)`. URL parameters: `?scene=` jumps to a scene, `?debug` enables debug keys, and `?touch` forces touch controls.

## Modules
```
src/core      GameState (pure), Livability (pure), SaveSystem (localStorage, versioned + migration, export/import), ctx
src/data      upgrades, missions, cutscenes, districts            ← data-driven content
src/input     InputManager (keyboard/gamepad/touch → actions; sub-frame taps latched for keys AND touch buttons), TouchControls (released on scene pause/resume)
src/audio     Synth (WebAudio chip), Sequencer (lookahead tracker), songs, sfx
src/explore   CityMap (tilemap, decals, y-sorted objects, colliders, improvement patches incl. removal of tagged objects), TopDownPlayer,
              Traffic (data lanes + intersections, shared signal cycle, streetcar stops, cyclists), Crowd (pedestrians on walkways, white squirrel)
src/action    SidePlayer, Rat (incl. the support-only Lobbyist: `shielded` rats take half damage), SuvRat (vehicle enemy), Boss (Bureaucrat + Foreman),
              Escort (mission 2), Parkside: Chase + BuildSpots (mission 4), LaneEater: Peloton + machine boss (mission 5),
              ParkingLot: DepaveSpots (`asphalt` | `fence` style, missions 7 + 8) + MonsterSuv (mission 7)
src/ui        fx: bitmap text, iris and blinds wipes, shake, hit-stop, float text, particles
tools/        asset generators (never shipped): raster + SDF renderers, sprite modules, map generator, atlas packer
```

## M3.1 additions
- **Score** (`src/core/Score.ts`, pure logic): difficulty table, points, `award`/`awardOnce`, local `HighScores` (localStorage, one entry per run).
- **Leaderboard** (`src/core/Leaderboard.ts`): Firestore REST (`:commit` with a server `REQUEST_TIME` transform, `:runQuery` ordered by score). It's a no-op until `src/data/leaderboard.config.ts` has a projectId and apiKey.
- **Save v3:** `difficulty`, `score`, `name`, `runId`. v2 saves migrate to a NORMAL run with a score of 0.
- **CityMap:**
  - Buildings are solid only on their footprint, and they fade when you're behind them.
  - Buildings can carry a `tag`, so an improvement can remove them. `removeTag` accepts an array.
  - `overpasses` (tile rects) build a second tile layer at `UNDER_DEPTH + 0.5`, drawn above traffic with `lane.under` and walkers on `underWalks`.
- **Traffic:**
  - `lane.turns` lets a vehicle take a quarter-circle into another lane, decided when it spawns, using 45° frames (`car_*_NE`, `streetcar_SE`, ...).
  - `lane.noSpawn` lanes are fed only by turns.
  - `lane.elevated` lanes (the Gardiner) are drawn at `ELEVATED_DEPTH`, don't stop at signals or yield to the player, and have a 34 s jam cycle.
- **ActionScene:**
  - `say()` is the single hint slot.
  - `oneWay()` creates standable props.
  - `SpaDigger` is the M8 boss.
  - `autoX` keeps the auto-scroll as a float (Phaser floors `scrollX`).
- **Tools:** `tools/mapshots.mjs` renders full-scale district PNGs from the running game.

## M3.2 additions
- **Fullscreen** (`src/core/fullscreen.ts`): the Fullscreen API on the first tap of a touch device (a real DOM `pointerup`/`touchend`, which browsers require) plus a pause-menu toggle that acts on `pointerup`; a best-effort landscape lock. iPhone Safari has no page fullscreen, so `public/manifest.webmanifest` (`display: fullscreen`, landscape) and an apple-touch-icon make Add to Home Screen launch it bare.
- **Articulated streetcars** (`Traffic.placeParts`): a streetcar with a planned turn is drawn as three section sprites (`scsec_r|m|f_<facing>`) laid along its route: straight, quarter arc, straight (`routeAt`). Each section picks the 8-way facing of its own stretch; the hidden one-piece sprite keeps doing the traffic logic. After the turn it swaps back.
- **Exits around a corner:** an arriving exit is matched on the opposite side first, then on any side with the same street name and district (High Park's south edge -> the Waterfront's west end). Turned arrivals land mid-span.
- **Lane Eater** (`src/action/LaneEater.ts`): chase keeps the machine's front a set gap inside the view (92 px alone, 14 px less per rider, at least 30); the boss is a state machine `backoff -> enter -> charge -> bounce -> hot -> leave -> enter...`, weak points mirrored with the facing; `Peloton` riders have a `wait | clip | done` state.
- **High Park placement** (`tools/map/highpark.mjs`): park features are placed by an outward search for the nearest rect clear of roads, trails, ponds and other features (`place(u, v, w, h, lean)`); the paths decal is cut at the curbs so roads end square.

## M3.3 additions
- **8-bit PNGs** (`tools/lib/png8.mjs`): every generated image is written as an exact indexed PNG (palette + tRNS, adaptive filters, zlib 9) when it has at most 256 colours, which all of ours do. `TP_PNG_RGBA=1` forces the old RGBA output and `TP_GEN_OUT=<dir>` redirects the build, so the two can be diffed pixel for pixel (`tools/scratch/pngdiff.mjs`: 43 files, 0 differ). Generated art: 3.8 MB -> 0.7 MB.
- **Phaser Arcade-only build:** a Vite alias maps `phaser` to `phaser/dist/phaser-arcade-physics.js`. JS 384 -> ~350 KB gzipped.
- **Lazy map JSON:** Boot no longer loads every district's map; Explore loads its own in `preload`, and the city map loads a district's JSON the first time you page to it (`PauseScene.buildMap`, a LOADING line meanwhile). First load 2.38 -> 0.59 MB.
- **Exits with `arrive`:** an exit may name the street it lands on (`exit(side, row, to, street, arrive)`), so Queens Quay east lands on Leslie, and Leslie, Carlaw and Broadview south all land on Queens Quay. Such connections may arrive on any side.
- **Hidden hearts:** `District.hiddenHeart(nx, ny, fallback)` picks the building nearest a point whose back is open ground and returns the spot under its roof, just behind the footprint. The unit test requires two hearts per district.
- **Cutscenes:** `ids: string[]` plays several timelines back to back (a debrief, then an interstitial); `vars` substitutes `{LIV}`-style tokens in captions and dialogue.
- **Replays:** `ActionScene` takes `replay` (no points: `pts()`, rat rewards, the mission bonus and the stats are skipped) and `debug` (the end returns to `Title` with `{ replay: { kind, id } }`, which opens the replay menu).
- **Stomps:** `ActionScene.landingOn(pRect, roofY, x0, x1, target)`: falling, feet within [roof - 16, roof + 10], over the target, and at most once per 650 ms per target (a plain bounce lands again in about half a second, so a chain needs a second approach). `SidePlayer.bounce()` holds a 0.14 s grace before the variable-jump cut.
- **Music variants:** `music.play(song, { bpm, transpose })`; the sequencer keys the current song on both.
- **Articulated streetcars:** section spacing along the route is scaled by `hypot(cos h, 0.66 sin h)` of the car's heading (the N/S sprites are foreshortened), and the sections are drawn front over middle over rear.
- **ABOUT / SOURCES:** `src/data/villain.ts` holds the name, the notice and the credits; every `Upgrade` has a `source` string shown on the results card and under ABOUT.

## M3.4 additions
- **Rats:** `baggage` (ranged; `onThrow` rolls a suitcase: `ActionScene.rollCase(x, dir)`, a gravity-free physics image that hurts on contact, can be swatted, and expires after 3.2 s or outside the arena) and `barrier` (`shield`: `Rat.blocks(h)` is true for a hit whose centre is on its facing side while it isn't reeling; shielded rats turn only after 0.8 s facing the wrong way, `turnT`).
- **The Jet Tug** (`src/action/JetTug.ts`): `intro -> taxi -> refuel -> turn -> taxi`; `blast(pRect, body, dt)` adds velocity away from the tail; `tugRect` is pumpable only while refuelling; the cabin roof uses the shared `landingOn`. Left-facing frames (`jettugl_*`) are separate sprites so the jet's lettering never mirrors.
- **DepaveSpots** gains `style: 'stakes'` (survey stakes that pop out of the ground).
- **SDF:** `obliqueCam(zScale, far)` and `render({ maxT, steps })`, so a tall object (the CN Tower's full shaft) renders in one pass instead of a raster strip glued to a rendered base.
- **Debug:** `__TP.killAll()` knocks every rat out *and counts the kills*, so bots can clear arena waves; `__TP.tug()`, `__TP.cases()`, `__TP.ratObjs()`.

## M4 additions
- **North district** (removed in M4.1; see below).
- **Mission 6** (`src/action/Science.ts`): `Patrol` (a guard rat with `rat.patrol = true` stands still; its beam is a triangle drawn each frame; `hidden` = on the ground within 16 px of a crate) and `Wrecker` (a pendulum: amplitude 1.25 rad, period 2.4 s; five swings, then `park` -> `reload`). `ChaseDef` gains `startAt` and `goal: 'truck'`.
- **Mission 9:** `DepaveSpots` style `rail`; `Boss` kind `megarat` (72 px frames, a `pound` move that spawns two ground shockwaves).
- **Mission 10** (`src/action/Highway.ts`): `HighwayMech` (`wind -> stomp -> fling -> vent`), slabs dropped through `ActionScene.oneWay`. Lanes take `until` (an upgrade that removes them: the Gardiner's deck traffic). `gardiner` side background.
- **The ending** (`src/scenes/EndingScene.ts`): after the payoff of the last mission, `Explore` starts the `ending` cutscene, which hands over to `Ending` (report card, credits) and then `Title`. `endStats()` sums the upgrades' `stat`s.
- **Fix: stale scene data.** Phaser keeps a scene's last start data when `start()` gets none, so CONTINUE after a mission win replayed that mission's payoff. Every `scene.start` that can follow a mission now passes data (`{}` at least); a test covers it.

## Data formats
- **Map JSON** (`gen/<district>.json`, one per district; generators in `tools/map/`, sharing `common.mjs`):
  - `ground[y][x]` tile indices
  - `objects[]`: buildings `{key,x,y,w,d}` with footprint and image; props `{key,x,y,solid}`
  - `decals[]`: big ground images (park paths, dog bowl, courts, diamond)
  - `improvements{id: {tiles[[x,y,t]], addProps[], removeTag}}`
  - `spawn`, `markers`, `landmarks` (plaques), `labels` (minimap)
  - `lanes[]`: `{axis, dir, pos, streetcar, stops[], bikeOnly, requires, priority (TSP), noCars (corridor), calm, speedy, transitOnly, range}`. `priority`/`noCars`/`calm` name the upgrade that changes the lane's behaviour; `transitOnly` (M3, Queens Quay's median) spawns streetcars only
  - `exits[]`: `{side: 'w'|'e'|'n'|'s', y0, y1 | x0, x1, to, street}`: a street continuing into the neighbour, **matched by street name** (M2.1). W/E exits span rows, N/S exits (M3) span columns, and you arrive at the same distance along the span. A unit test checks every exit has a partner on the opposite edge
  - `intersections[]` (rects), `walkways[]` (polylines), `critters[]`
  - `tileColors` (average colour per tile, used by the minimap)
- **Upgrade:** `{id, livability, categories, mapPatches[], blurb (sourced), stat}`. Unlocking applies its map patches, live (animated sweep) or on load.
- **Mission:** `{id, title, district, upgrades[], requires[], briefing, debrief, focusX/Y, focusAxis, action:{bg, street, sky, length, groundY, intro, hint, waves[{at, rats[], suvs}], boss {at, kind: bureaucrat|foreman|laneeater|monstersuv}, escort, chase, caughtWave, build, autoscroll, depave {at, patches[], rats[], style}, noCombat}}`. `briefing` and `debrief` are cutscene ids played before the fight and before the map payoff.
- **Cutscene steps:** bg, side (side-view street with `bg` queen/king/parkside/bigbox/lake, `parked`, `patios`), **pan** (tracking-shot speed), caption, say, portrait, darken, music, sfx, shake, wait, title, dvp/dvpAdd (the highway shot), actor (`world` actors scroll with the street; `scale`), frame, move/wobble/bang (on a 384-wide stage, centred on wider screens).
- **Save:** `trashpanda.save.v1` → `{version: 2, upgrades, completedMissions, flags, ratsDefeated, lanesAddedByDogFjord, playTimeMs, player: {district, x, y}}`. `migrate()` sanitizes unknown or old data; v1 saves land in Queen West.

## Asset pipeline
`npm run assets` → `tools/build-assets.mjs` → `public/gen/` (gitignored, rebuilt in CI, about 2 s):
- **chars atlas:** side-view raccoon (17 frames, 56×44), 3/4 raccoon (8 directions × 4 frames), 3 rats × 7 frames, Dog Fjord portraits, pedestrians (9 variants × 4 directions × 4 frames), cyclists (4 variants × 4 directions × 4 frames, plus side views for vignettes).
- **world atlas (shared):** props (gates, bins, park lamps, white squirrel, capybaras, City Hall, the TORONTO sign, patios...), vehicles in 4 directions plus side views, back-view highway cars at 8 depth scales (hand-built, M2), side-view mission props (signal poles, the SUV Rat, the van, the desk...).
- **bld_<district> atlases:** one image per generated building, per district, loaded lazily by Explore. Every building kind goes through `sprites/anybuilding.mjs` (shops, Victorian houses, glass towers, warehouses, the school, Old City Hall).
- **Standalone images:** side-view layers, the intro highway backdrop, ground decals.
- **Tileset** with 1px extrusion (no seams); background layers; 4 RetroFont sheets; manifest with animations and pivots.

Art techniques:
1. **Palette grids + primitives** (`tools/lib/raster.mjs`): auto-outline, rim light, dithering.
2. **SDF renderer** (`tools/lib/sdf.mjs`): characters and vehicles modelled from primitives, ray-marched to the 48-colour palette with stepped and Bayer-dithered shading, rendered from a 32° character camera (3/4) or a side camera.

Snapshots go to `art/history/<asset>/vNN/` (`tools/snapshot.mjs`).

## Testing
- `npm test`: livability math and tiers, upgrade unlocks, mission completion idempotence, save round-trip, migration, corrupt-save safety, export/import.
- `npx playwright test` (production build), with every test failing on any page error:
  1. title → new game → cutscene → explore
  2. the full intro, including the highway scene
  3. ride → briefing → rats take damage and die → win → debrief → upgrade applied → saved
  4. **regression:** thrown cones that land on the ground don't stop the game loop (fails on the M0 code)
  5. pause menu and city map open and close
  6. phone viewport stretches the view width; desktop resize keeps the integer scale
  7. touch: the MAP button opens an overlay that stays open until X, and touch buttons don't stick afterwards
  8. **M2 districts:** ride Queen West → High Park → Queen West → Downtown along the streets; the district is saved
  9–11. **missions 2–4:** marker → briefing → a real taste of the mechanic (the streetcar moves / a wave locks / boosting closes the chase gap) → win → debrief → payoff → saved
- `tools/scratch/bot.mjs` (local only) is a playtest bot that plays missions 2–4 with real key input; it was used to tune the chase and the boss and found two rat-AI bugs.
- `tools/shots.mjs` captures scene screenshots; `tools/perf.mjs` samples FPS with CPU throttling.

## M4.1 additions
- **North removed:** `tools/map/north.mjs` deleted; `tools/sprites/north.mjs` renamed `science.mjs` (props + the warehouse strip only). `migrate()` sends a save standing in `north` to the Queen West spawn. A unit test checks every map exit leads to a known district.
- **Explore missions:** `MissionDef.action` is optional; `explore: { kind: 'bikebus', time }` marks a mission played on the map. `ExploreScene.startMission` (and the debug list) start such a mission as `Explore { district, bikebus: id }` after its briefing. `src/explore/BikeBus.ts` owns the route (`map.bikebus`: `start` + ordered `steps` of `stop` / `block` / `school`, generated in `tools/map/eastend.mjs` and written by `build-assets`): riders follow a 2-px resampled trail of the player; blocks are static zones in their own group, removed by the bell; `finishBus()` mirrors `ActionScene.win()` (award, save, debrief + Dog Fjord beat, then the payoff). `__TP.bus()` for bots.
- **Share** (`src/scenes/ShareScene.ts`): composes a poster in a `RenderTexture` at 384×216 or 216×384 from loaded textures (backgrounds, `chars`/`world` frames, bitmap text), `snapshot()`s it, upscales ×5 on a canvas with smoothing off and keeps a `File` ready, so the share or popup starts inside the tap. `navigator.share({ files })` when the browser can share files; otherwise save + the X intent / Facebook sharer URL. Launched from `infoBox` (S or tap) and the pause menu; it pauses its caller and resumes it on close. `__TP.share()` for bots.
- **Title:** ABOUT pages flip with keydown LEFT/RIGHT (and the stick); link rows are tappable rects (`window.open`, `noopener`). `showDisclaimer()` runs between the initials and the intro.
- **Camera:** the side-view follow runs in `postupdate` (after Arcade copies bodies to sprites) with integer scroll and a hysteresis on the lag, so the raccoon stays on the same screen pixel at a steady speed.
- **Moving platforms:** the Jet Tug's fuselage is a dynamic, immovable, one-way `Zone` whose velocity drives the rig; the image follows the body, so a rider is carried by Arcade's friction.
- **SDF in the map's projection:** `freedomArchMap` and `cityHallMap` render with `obliqueCam(1, far)`, so they sit on the ground the way the tiles do. A squashed SDF has to be scaled by its squash factor or rays overstep thin parts (the first arch drew as a stub).


## M4.2 additions
- **`missionOrder()`** (`src/data/missions.ts`): missions sorted by the depth of their prerequisite chain, then definition order.
- **City map** (`PauseScene.buildMap`): labels without a `kind` (streets) and `kind: 'park'` only, placed streets first and skipped if they'd overlap or leave the frame; neighbours from `md.exits` grouped by side + district, drawn outside the frame; `goMap(side)` picks the neighbour with the most exits on that side. Continuous scale. `MapInfo.route` carries the Bike Bus's remaining steps.
- **`ActionScene.enterFromRight(objs)`** slides objects created on screen in from beyond the right edge (physics bodies reset along the tween); `arenaLeftAt(at)` predicts where an arena will lock, so `DepaveSpots` / `BuildSpots` are created at mission start; `edgeX(x)` spawns mid-fight rats at the nearer screen edge; `clearSay()` on boss defeats, wins and losses.
- **`landingOn`** is a crossing test (previous-frame bottom above the roof line, current at or below it minus 3 px).
- **`ScrollLayer`**: layers slower than the camera move in 2-px steps (dither stability).
- **Streetcars:** turning cars keep their sections; section depth = its own screen y; the Spadina curves share the centre ((SP+4)·16, QQ·16), radii 40 and 24.

## M4.3 additions
- **The bike network:** `src/data/network.ts` (`NETWORK`: id, district, name, kind, `by` mission; `networkDone`, `networkPatches`, `missionNetwork`, `networkLabel`). The generators register streets with `District.netEW` (curb lanes become protected tiles + planters, parked cars tagged `park_<id>` removed, bikeOnly lanes `requires: net_<id>`), `netNS` (protected: `curb_w/e` -> `curb_w_bike`/`curb_e_bike` + bikeOnly lanes; slow: humps + `sharrow_ns_*`, and the street's lanes get `slow: net_<id>`), `netStreet` (a mission patch that already does it) and `paintNS` (painted lanes today: Strachan). Improvements `net_<id>` merge into `map.improvements` in `out()`; `map.network` (centre lines, px) feeds the city map overlay. `ExploreScene.unlocked()` = upgrades + network patches, for the map and `Traffic` (slow lanes: half the cars at half speed, half the spawns bikes riding mid-lane).
- **`CityMap.putTile`** also writes the bridge-deck overlay layer, so an improvement on a bridge shows above the traffic under it.
- **Map missions** implement `MapMission` (`src/explore/guide.ts`: update / bell / route / intro / lateCard / winCard / hideHud / destroy); `drawGuide` (the guide arrow) and `MissionHud` (status lines in a box at HUD_Y) are shared by `BikeBus` and the new `DockDrop`. `ExploreScene.em` runs either; scene data key `bikebus` names the mission (kind from `MISSIONS[id].explore.kind`).
- **Dock Drop data:** `map.docks` (Downtown): start + six spots, placed by `District.dockSpot` (a clear 3-tile stretch of sidewalk); every district's `bike_share_grows` improvement adds `sharedock` props (`District.bikeShare`). Sprites: `tools/sprites/m43.mjs` (dock, trailer), `ratTopFrame` (rats.mjs: the rat model through the map's character camera), share-bike cyclists `e`/`f` (`manifest.shareCyclists`).
- **Checkpoint:** `ActionScene` data `checkpoint` (and `hits` carried across restarts); `reachedBoss` is set by a boss arena lock; at the checkpoint the earlier beats are marked done and their triggers check `depaveDone` / `buildDone` / `chaseDone`.
- **Ranks:** `src/core/Rank.ts`; save v4 adds `ranks` (migrated from v3 as `{}`); `SidePlayer.hitsTaken`.
- **Feedback:** `impactStar` (fx.ts; animated on real time so it plays through hit-stop), `SidePlayer.drawSwoosh`, `ActionScene.cardBand` / `goBand` / `hudBand`.
- **Review fixes:** stale city-map links during LOADING; neighbour labels clamped by their own length; invulnerability blink kept while hidden; pre-placed arena spots lock where planned (camera eases over its lag); both backup rats from the edge; `say()` ignored once finished; slabs solid only after landing; the Jet Tug rolls in to its rev spot; the Wrecker's swing starts where the ball hangs; the Lane Eater's lane redraws only the stretch on screen.

## M4.4 additions
- **Posters:** `ShareScene.compose` draws on a 768 x 432 (tall 432 x 768) render texture: `lo*` helpers place game art at 2x (street bands, in-world sprites), `hi` places the `posters` atlas (and any sprite at a whole-number scale, with an optional crop anchored on the cropped part), `words` picks the first font + whole-number scale that fits (never a fractional scale) and can put a dark plate under the words. The export is x3 with hard pixels; the preview is that PNG in an `<img>` (`image-rendering: pixelated`) placed over the canvas and re-placed on resize. The `posters` atlas (`tools/sprites/posters.mjs`: raccoon bust, Dog Fjord re-rendered facing left, the raccoon riding away, the wheel emblem, ribbons) loads in `ShareScene.preload` the first time. `tools/posters.mjs` renders every poster through the game (`__TP.shareShow(i, tall)`).
- **Initials:** `TitleScene.onNameKey` (keyboard letters / Backspace; a typed letter's frame ignores CONFIRM, since E / Z / X are both); on touch, `nameField` puts a transparent `<input>` (16 px text, `autocapitalize=characters`) over the letters, disables Phaser's global key capture while it has focus, and a resize mid-naming re-places it instead of restarting the scene.
- **Save the Science:** `Patrol` walks a beat (`[crate - 60, start + 60]`, set in `ActionScene`), `Rat.patrolVX`; `Patrol.behind(px)` / `alarm()`; ActionScene turns a hit from behind into a takedown. `Wrecker` states: drive, hoist, drop, stuck (`vulnerable`), haul, windup, swing; one message slot over the crane (`say`).
- **Map:** `cnTowerBuilding(w, d, shaftH, full)`; the Waterfront's west exits for `lakeshore` and `queensquay` arrive on High Park's `trail` (the turned-corner lookup); the arches' depths run left over right.

## M4.5 additions
- **Names:** `NAME_MAX = 10` in `TitleScene`; `naming.letters` is the name typed so far and `pos` the cursor (0..10). Keyboard letters / digits go in at the cursor, Backspace takes the one before it out; CONFIRM from a keyboard starts the run, from a pad it steps to the next slot (on a blank it starts). `GameState` migration accepts `^[A-Z0-9]{1,10}$`. `submitRun` retries a 403 with the first three letters, for the rules as they were (`docs/LEADERBOARD.md` has the new rule).
- **Debug runs:** `ctx.save()` sets `flags.debugRun` in a `?debug` session; `HighScores.record`, `submitRun` and the SCORES poster skip such a run.
- **Art:** `cnTowerBuilding` (one taper curve, the stacked pod in `full` mode); `raccoonBust` (rounded-cone ears, torso + arms, the pump parts) rendered at scale 2.4 with the whole bust in frame; `dogPortraitHi` from the mirrored camera; Dog Fjord's laugh mouth. The arches' depth now rises left to right. ExploreScene's `__TP` gains `save()` (tests).

## M4.6 additions
- **2D portraits:** `tools/lib/draw2d.mjs` is a small 2D pixel-art toolkit (Catmull-Rom shapes, ellipses, bars rasterized in design units at a scale; parts with their own outline: `K` against the background, a darker line over another part; `paint` / `rim` / `stroke` / `dot` for shading and detail). `tools/sprites/portraits.mjs` draws `raccoonPortrait2d` and `dogPortrait2d` on the 232 x 208 poster grid at any scale: `pr_racc_*` / `pr_dog_*` (posters atlas) and `df_grin|laugh|shock` (112 x 100, chars atlas).
- **Drawn once, never stretched:** `src/ui/bake.ts` `baked()` / `bakedImage()` draw an atlas frame at a fractional scale into its own canvas texture once; the image then moves at scale 1 (vignette decor, hoardings, the Parkside van and generator). The planter has a native 1.5x frame, `planter_l`. Cutscene decor rows wrap on their own span.
- **Title:** menu taps need a visible menu (and no page, not leaving); `startNaming` refuses a second box. `go()` opens `openPause(this, 'controls', true)` once (`PauseData.first` swaps its footer to RIDE).
- **Touch:** `TOP_BTN_Y` (31) for MAP / pause, under the score; Explore's points pop moves under them on touch.

## M4.7 additions
- **Portraits:** `tools/sprites/portraits.mjs` was redrawn. Dog Fjord's points are written in the 3D render's coordinates and pass through one scale (`DSC`). His head outline's control points were traced from the 3D silhouette, which is a guide only, so no 3D pixels reach the output. Small sizes (k < 0.8) raise the near eye so it clears the nose at 112 x 100. `draw2d.mjs` gained `tube()`, a tapered curved limb with round ends and an optional width function.
- **Loop tooling** (gitignored, in `tools/scratch/piter/`): `render.mjs` draws the comparison sheet (`--sdf` adds the old 3D row), and `evolution.mjs` builds the strip of every `art/history/portraits_2d` version.
- **Controls page:** desktop rows at 12 px from y 42, the notes at 148 / 158 on a dark band.
- **Tall VERSUS poster:** Dog Fjord sits on the bottom bar (H - 110), so the VS badge clears his eyes.

## M4.8 additions
- **Portraits:** `tools/sprites/portraits.mjs` was redrawn again. `pumpAxis()` lays out every part of the pump along and across one axis, so it can't bend.
- **`draw2d.mjs` gained fur tools** (all backwards compatible; the M4.7 portraits render pixel-identical with the new toolkit):
  - `hash()`: a repeatable jitter
  - `tufted()`: tufted fur edges
  - `Canvas.furBreak()`: fur strokes interlocking where two tones meet
  - `Canvas.furStrokes()` and `Canvas.furClusters()`: fur strands that follow a direction field, painted only over chosen tones, with calm zones and density scaled to size (full at k = 1.5, less at k = 1, none at the 112 px dialogue portrait)
  - `Canvas.silhouette()`: one outer outline, coloured per material and per side
  - `Canvas.despeckle()`: removes stray single pixels
  - `shape()` accepts `line: null` for no outline.
- **Palette:** `tools/palette.mjs` gained portrait-only keys: a warm raccoon grey ramp, a chestnut ramp, a hue-shifted pink skin ramp, chrome and teal. They were added only; no existing key changed.
- **Loop tooling** (gitignored, in `tools/scratch/piter2/`):
  - `render.mjs`: the sheet plus a 4x close-up, `_hero.png`. `--module` renders a variant copy.
  - `evolution.mjs`: `FROM=<n>` limits the strip to versions from n on.
  - `posters48.mjs`: saves every poster at full size, with an optional poster-name filter.
- **ShareScene:**
  - Tall VERSUS: the raccoon sits at (-30, H/2 + 64) and THE RACCOON is right-aligned.
  - Tall TAKE BACK THE STREETS: Dog Fjord's bottom is at 420 and the raccoon at x -34.
  - The bosses grid's hero crop starts at y 6.

## M4.9 additions (tools only; the game is unchanged)
- **`tools/lib/light2d.mjs`: light-first shading, adapted from codixel.** Importing it adds methods to draw2d's `Canvas`.
  - `shadeForm` inflates part masks into one volume with an exact distance transform, then softens it.
  - `lightValue` lights it from one direction, and `band` quantizes the light onto a ramp in flat bands with a 4x4 Bayer dither strip.
  - Shadows and light: `castShadow`, `occlude` (contact shadow), `rimLight`, and `stepper` (steps a colour along its ramp).
  - Lines and ramps: `line1` (pixel-perfect lines) and `hueRamp`.
  - The painter agent added a value-map pipeline: `values`, `lightField`, `valueShape`, `crescentValue`, `castValue`, `paintLight`, `terminator`, `tones`, `tubeField`, `curveTubeField`, `rimPaint`, `cleanSilhouette`, `dejag`, `deorphan`.
- **`tools/lib/pixelcheck.mjs` and `tools/pixelcheck.mjs`: a pixel-art critic.**
  - pxl's lint rules: orphan, jaggy, pillow, near-duplicate.
  - codixel's silhouette check: nubs, strips, holes.
  - Views: colour usage, an ASCII view with rulers, a values (greyscale) PNG and a findings PNG with problems boxed.
- **`tools/annotate/`:** a local annotate page (`node tools/annotate/serve.mjs [dir] [port]`, 127.0.0.1 only). It writes `<name>.feedback.json` (comment, notes with pixel positions and the colour under each, marked pixels) and `<name>.annotated.png` next to the pictures.
- **`tools/ramp.mjs`:** prints a hue-shifted ramp to add as palette keys.
- **`tools/sprites/portraits_next.mjs`:** the M4.9 portraits, kept out of the build until Ivan's green light. Same exports as `portraits.mjs`.
- **Palette:** new portrait keys (`¥ µ ¶ © ® ² ³ ¹ ¼ ½ ª º »`), added only.
- **Third-party notices:** `tools/lib/THIRD_PARTY.md` has the MIT notices for codixel (commit 604a9dc) and pxl (commit c1bea5c).
