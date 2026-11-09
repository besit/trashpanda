# Technical Architecture

## Stack
- **Phaser 3.90** (the final, stable v3 line). Arcade physics only, WebGL with Canvas fallback.
- **TypeScript 5.9 (strict), Vite 8**, deployed as a static site.
- **Vitest 5** for unit tests; **Playwright 1.65** for end-to-end tests, screenshots and perf. Chromium is installed into `node_modules`.
- **GitHub Actions → GitHub Pages:** every push to `main` runs tests and the build, then deploys.
- All dependencies are project-local. Nothing is installed globally.

## Rendering
- Internal resolution **384×216**, `pixelArt: true`, `roundPixels`.
- `main.ts:fit()` scales the canvas by an **integer** factor when the window is at least 2× (crisp on desktop) and fits otherwise (phones). CSS uses `image-rendering: pixelated`.
- Landscape only on touch devices; portrait shows a rotate prompt.

## Scenes (states)
| Scene | Role |
|---|---|
| `Boot` | loads `gen/manifest.json`, then every atlas, image, font and map it lists; builds RetroFonts and animations |
| `Title` | logo, menu (Continue / New Game / test entries), audio unlock |
| `Cutscene` | interprets timeline data (`data/cutscenes.ts`) |
| `Explore` | 3/4 city: `CityMap` + `TopDownPlayer` + `Traffic` + HUD, mission markers, transformation sequence |
| `Action` | side-view missions: `SidePlayer` + `Rat`s, waves, parallax |

Shared state lives in `core/ctx.ts`, the single `GameState` all scenes read and write. Scenes communicate through `scene.start(key, data)`. URL parameters: `?scene=` jumps to a scene, `?debug` enables debug keys, and `?touch` forces touch controls.

## Modules
```
src/core      GameState (pure), Livability (pure), SaveSystem (localStorage, versioned + migration, export/import), ctx
src/data      upgrades, missions, cutscenes            ← data-driven content
src/input     InputManager (keyboard/gamepad/touch → actions, sub-frame taps latched via keydown events), TouchControls
src/audio     Synth (WebAudio chip), Sequencer (lookahead tracker), songs, sfx
src/explore   CityMap (tilemap, y-sorted objects, colliders, improvement patches, roof occlusion), TopDownPlayer, Traffic
src/action    SidePlayer, Rat
src/ui        fx: bitmap text, iris and blinds wipes, shake, hit-stop, float text, particles
tools/        asset generators (never shipped): raster + SDF renderers, sprite modules, map generator, atlas packer
```

## Data formats
- **Map JSON** (`gen/queenwest.json`):
  - `ground[y][x]` tile indices
  - `objects[]`: buildings `{key,x,y,w,d}` with footprint and image; props `{key,x,y,solid}`
  - `improvements{id: {tiles[[x,y,t]], addProps[]}}`
  - `spawn`, `markers`, `lanes`
- **Upgrade:** `{id, livability, categories, mapPatches[], blurb (sourced), stat}`. Unlocking applies its map patches, live (animated sweep) or on load.
- **Mission:** `{id, title, district, upgrades[], action:{sky, length, waves[{at, rats[]}], intro}}`.
- **Save:** `trashpanda.save.v1` → `{version, upgrades, completedMissions, flags, ratsDefeated, lanesAddedByDogFraud, playTimeMs, player}`. `migrate()` sanitizes unknown or old data.

## Asset pipeline
`npm run assets` → `tools/build-assets.mjs` → `public/gen/` (gitignored, rebuilt in CI, about 2 s):
- **chars atlas:** side-view raccoon (17 frames), 3/4 raccoon (8 directions × 4 frames), 3 rats × 7 frames, Dog Fraud portraits.
- **world atlas:** props, vehicles in 4 directions plus side-view renders, one image per generated building.
- **Tileset** with 1px extrusion (no seams); background layers; 4 RetroFont sheets; manifest with animations and pivots.

Art techniques:
1. **Palette grids + primitives** (`tools/lib/raster.mjs`): auto-outline, rim light, dithering.
2. **SDF renderer** (`tools/lib/sdf.mjs`): characters and vehicles modelled from primitives, ray-marched to the 48-colour palette with stepped and Bayer-dithered shading, rendered from a 32° character camera (3/4) or a side camera.

Snapshots go to `art/history/<asset>/vNN/` (`tools/snapshot.mjs`).

## Testing
- `npm test`: livability math and tiers, upgrade unlocks, mission completion idempotence, save round-trip, migration, corrupt-save safety, export/import.
- `npx playwright test` (production build):
  1. title → new game → cutscene → explore
  2. ride → mission → rats take damage and die → win → upgrade applied → saved to localStorage
  3. phone viewport with touch + resize to desktop integer scale
- `tools/shots.mjs` captures scene screenshots; `tools/perf.mjs` samples FPS with CPU throttling.
