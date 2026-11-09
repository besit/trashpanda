# Trash Panda: Right of Way

A raccoon on a bicycle making Toronto a better place to live. It's a browser game: 2D pixel art, chiptune, satire, and real urban-planning evidence.

**Play:** https://besit.github.io/trashpanda/ (desktop keyboard, gamepad, or phone in landscape)

## Controls
| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Ride | WASD / arrows | stick / d-pad | left-side stick |
| Jump / hop | J (or Z) | A | JUMP |
| Dash | Space (or C) | B | DASH |
| Interact / attack | K (or X) | X | ACT / HIT |
| Boost | Shift (or L) | RB / RT | BOOST |

## Develop
```bash
npm install            # project-local only
npm run e2e:install    # Playwright Chromium into node_modules
npm run dev            # builds generated art, starts Vite
npm test               # unit tests (Vitest)
npm run build && npx playwright test   # production build + end-to-end tests
```
Add `?debug` to the URL for debug keys. `?scene=Explore` / `?scene=Action` / `?scene=Cutscene` jump straight to a scene, and `?touch` forces touch controls.

## How the art is made
All art is authored as code. `tools/sprites/*` paints palette-indexed grids or models characters with a tiny SDF renderer (`tools/lib/sdf.mjs`), and `npm run assets` builds the atlases. Every art iteration is kept in [`art/history/`](art/history/INDEX.md). The process is documented in [`docs/DEVLOG.md`](docs/DEVLOG.md).

## Docs
[Game design](docs/GAME_DESIGN.md) · [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md) · [Urban research](docs/URBAN_RESEARCH.md) · [Performance](docs/PERFORMANCE.md) · [Art bible](docs/ART_BIBLE.md) · [Dev log](docs/DEVLOG.md)

No ads, no microtransactions, no login. Free to play.
