# Trash Panda: Right of Way

A raccoon on a bicycle making Toronto a better place to live. It's a browser game: 2D pixel art, chiptune, satire, and real urban-planning evidence.

**Play:** https://besit.github.io/trashpanda/ (desktop keyboard, gamepad, or phone in landscape)

## Satire, fiction and AI

*Trash Panda: Right of Way* is a work of satire and parody. **Dog Fjord** and his rats are fictional cartoon characters; nothing they say or do is a statement of fact about any real person. We tried to back every fact about Toronto's streets and policies with a source ([docs/URBAN_RESEARCH.md](docs/URBAN_RESEARCH.md)) and to mark what we made up as fiction in the game; something that isn't marked isn't automatically true, so check the sources.

The game was made with the help of AI. **Claude** (Anthropic) wrote the code, drew most of the pixel art, composed the chiptune and did the research. The hero art (the posters and the big portraits) was generated with **Gemini** (Google) and **Qwen-Image-Edit** (Alibaba) and turned into pixel art in code. AI can make mistakes, so if you spot one, please open an issue.

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

On a phone, the first tap goes fullscreen (Android, iPad); on an iPhone use **Share > Add to Home Screen** for a fullscreen icon.

Start a run with **NEW GAME**: pick EASY / NORMAL / HARD (7 / 5 / 3 hits per life, score ×1 / ×1.5 / ×2) and enter your initials. Full-scale images of every district are in [docs/maps/](docs/maps/) (regenerate with `node tools/mapshots.mjs` while the dev server runs).

The city is five districts: **High Park ← Queen West → Downtown → East End**, with the **Waterfront** south of Downtown. Ride off the map edge along a street that continues (Queen, Dundas/Bloor, or Spadina/University/Bay down to the lake) to cross.

## How the art is made
All art is authored as code. `tools/sprites/*` paints palette-indexed grids or models characters with a tiny SDF renderer (`tools/lib/sdf.mjs`), and `npm run assets` builds the atlases. Every art iteration is kept in [`art/history/`](art/history/INDEX.md). The process is documented in [`docs/DEVLOG.md`](docs/DEVLOG.md).

## Docs
[Game design](docs/GAME_DESIGN.md) · [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md) · [Urban research](docs/URBAN_RESEARCH.md) · [Performance](docs/PERFORMANCE.md) · [Art bible](docs/ART_BIBLE.md) · [Dev log](docs/DEVLOG.md)

No ads, no microtransactions, no login. Free to play.

## Privacy
No cookies. Since 1.0 the game counts plays and minutes played, anonymously. Each visit sends:
- a random number made on your first visit, kept in your browser
- the minutes actually played and the missions done
- phone or computer, and the game version

No names and nothing typed. (The world leaderboard is separate: after each mission you win it gets the name you entered, your score, the difficulty and the missions done.) Browsers with Do Not Track or Global Privacy Control on aren't counted, nor are `?debug` sessions or automated browsers. Details and the database rules: [docs/LEADERBOARD.md](docs/LEADERBOARD.md).

## Promo videos
`tools/promo/` records the trailers by playing the game in a headless browser, one 1/60 s frame at a time, with the synth's audio rendered in step. `tools/promo/cut.mjs` edits them into 1080p clips. Output goes to `promo/` (not committed):

```bash
npx vite --port 5180                       # in another terminal
node tools/promo/missions.mjs bwl          # also: lot, sci, hw, title (the end card)
node tools/promo/cut.mjs bwl lot sci hw
```
