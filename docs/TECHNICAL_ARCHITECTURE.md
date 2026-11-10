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
src/action    SidePlayer, Rat, SuvRat (vehicle enemy), Bureaucrat (boss), Escort (mission 2), Parkside: Chase + BuildSpots (mission 4)
src/ui        fx: bitmap text, iris and blinds wipes, shake, hit-stop, float text, particles
tools/        asset generators (never shipped): raster + SDF renderers, sprite modules, map generator, atlas packer
```

## Data formats
- **Map JSON** (`gen/<district>.json`, one per district; generators in `tools/map/`, sharing `common.mjs`):
  - `ground[y][x]` tile indices
  - `objects[]`: buildings `{key,x,y,w,d}` with footprint and image; props `{key,x,y,solid}`
  - `decals[]`: big ground images (park paths, dog bowl, courts, diamond)
  - `improvements{id: {tiles[[x,y,t]], addProps[], removeTag}}`
  - `spawn`, `markers`, `landmarks` (plaques), `labels` (minimap)
  - `lanes[]`: `{axis, dir, pos, streetcar, stops[], bikeOnly, requires, priority (TSP), noCars (corridor), calm, speedy}`. The flags name the upgrade that changes the lane's behaviour
  - `exits[]`: `{side: 'w'|'e', y0, y1, to}`, a street continuing into the neighbour at the same rows (a unit test checks every exit has its partner)
  - `intersections[]` (rects), `walkways[]` (polylines), `critters[]`
  - `tileColors` (average colour per tile, used by the minimap)
- **Upgrade:** `{id, livability, categories, mapPatches[], blurb (sourced), stat}`. Unlocking applies its map patches, live (animated sweep) or on load.
- **Mission:** `{id, title, district, upgrades[], requires[], briefing, debrief, focusX/Y, focusAxis, action:{bg, street, sky, length, groundY, intro, hint, waves[{at, rats[], suvs}], boss, escort, chase, caughtWave, build, noCombat}}`. `briefing` and `debrief` are cutscene ids played before the fight and before the map payoff.
- **Cutscene steps:** bg, side (side-view street with `bg` queen/king/parkside, `parked`, `patios`), **pan** (tracking-shot speed), caption, say, portrait, darken, music, sfx, shake, wait, title, dvp/dvpAdd (the highway shot), actor (`world` actors scroll with the street; `scale`), frame, move/wobble/bang (on a 384-wide stage, centred on wider screens).
- **Save:** `trashpanda.save.v1` → `{version: 2, upgrades, completedMissions, flags, ratsDefeated, lanesAddedByDogFraud, playTimeMs, player: {district, x, y}}`. `migrate()` sanitizes unknown or old data; v1 saves land in Queen West.

## Asset pipeline
`npm run assets` → `tools/build-assets.mjs` → `public/gen/` (gitignored, rebuilt in CI, about 2 s):
- **chars atlas:** side-view raccoon (17 frames, 56×44), 3/4 raccoon (8 directions × 4 frames), 3 rats × 7 frames, Dog Fraud portraits, pedestrians (9 variants × 4 directions × 4 frames), cyclists (4 variants × 4 directions × 4 frames, plus side views for vignettes).
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
