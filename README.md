# Trash Panda: Right of Way

A raccoon on a bicycle making Toronto a better place to live. It's a browser game: 2D pixel art, chiptune, satire, and real urban-planning evidence.

**Play:** https://besit.github.io/trashpanda/ (desktop keyboard, gamepad, or phone in landscape)

## Controls
| Action | Keyboard | Arrow-key layout | Gamepad | Touch |
|---|---|---|---|---|
| Ride | WASD | arrows | stick / d-pad | left-side stick |
| Boost (hold) | Shift | V | RB / RT | BOOST |
| Hop / jump | Space | Z | A | JUMP |
| Dash | Q | C | B | DASH |
| Bell / talk / bike pump | E (or R) | X | X | ACT |
| City map | M | M | Select | MAP |
| Pause / settings | Esc | Esc | Start | II |

## Develop
```bash
npm install            # project-local only
npm run e2e:install    # Playwright Chromium into node_modules
npm run dev            # builds generated art, starts Vite
npm test               # unit tests (Vitest)
npm run build && npx playwright test   # production build + end-to-end tests
```
Add `?debug` to the URL for debug keys:
- T on the map applies this district's upgrades
- V in a mission wins it
- the title menu gets DEBUG menus: SELECT MISSION (any mission, briefing first) and WATCH VIGNETTES

Jump straight to a scene:
- `?scene=Explore` continues your save
- `?scene=Action&mission=king_of_street`
- `?scene=Cutscene&cs=calm_before`

`?touch` forces touch controls.

Start a run with **NEW GAME**: pick EASY / NORMAL / HARD (7 / 5 / 3 hits per life, score ×1 / ×1.5 / ×2) and enter your initials. Full-scale images of every district are in [docs/maps/](docs/maps/) (regenerate with `node tools/mapshots.mjs` while the dev server runs).

The city is five districts so far: **High Park ← Queen West → Downtown → East End**, with the **Waterfront** south of Downtown. Ride off the map edge along a street that continues (Queen, Dundas/Bloor, or Spadina/University/Bay down to the lake) to cross.

## How the art is made
All art is authored as code. `tools/sprites/*` paints palette-indexed grids or models characters with a tiny SDF renderer (`tools/lib/sdf.mjs`), and `npm run assets` builds the atlases. Every art iteration is kept in [`art/history/`](art/history/INDEX.md). The process is documented in [`docs/DEVLOG.md`](docs/DEVLOG.md).

## Docs
[Game design](docs/GAME_DESIGN.md) · [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md) · [Urban research](docs/URBAN_RESEARCH.md) · [Performance](docs/PERFORMANCE.md) · [Art bible](docs/ART_BIBLE.md) · [Dev log](docs/DEVLOG.md)

No ads, no microtransactions, no login. Free to play.
