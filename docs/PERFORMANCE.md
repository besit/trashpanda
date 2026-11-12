# Performance

## Targets
- 60 fps on ordinary modern phones and low/mid laptops.
- Initial download under 2.5 MB; JS under 450 KB gzipped.
- No per-frame DOM work, no heavy shaders, pooled and short-lived particles.

## Measurements

### 2026-11-09 (M0)
Production build (`vite build`), measured with `tools/perf.mjs`: headless Chromium, 240-frame sample while riding, CPU throttled via the DevTools protocol.

| Scene | CPU throttle | Avg fps | p95 frame | Worst frame | JS heap |
|---|---|---|---|---|---|
| Explore | 1× | 60.1 | 16.8 ms | 16.8 ms | 15 MB |
| Action | 1× | 60.1 | 16.7 ms | 16.8 ms | 16 MB |
| Explore | 4× | 60.2 | 16.8 ms | 16.8 ms | 17 MB |
| Action | 4× | 60.1 | 16.7 ms | 16.8 ms | 16 MB |
| Explore | 6× | 60.2 | 16.8 ms | 16.8 ms | 16 MB |
| Action | 6× | 60.1 | 16.7 ms | 16.8 ms | 16 MB |

Caveat: headless Chromium uses a software or GPU path that differs from real phones, and CPU throttling doesn't model GPU limits. Real-device numbers come from Ivan's phone at each review.

### 2026-11-09 (M1)
The new Queen West map is 104×76 tiles (2.6× M0) and adds 34 pedestrians, lane-based traffic with streetcars and cyclists, decals, and the pause/map overlay.

| Scene | CPU throttle | Avg fps | p95 frame | Worst frame | JS heap |
|---|---|---|---|---|---|
| Explore | 1× | 60.1 | 16.8 ms | 16.8 ms | 17 MB |
| Action | 1× | 60.2 | 16.7 ms | 16.8 ms | 14 MB |
| Explore | 4× | 60.2 | 16.8 ms | 16.8 ms | 20 MB |
| Action | 4× | 60.2 | 16.7 ms | 16.8 ms | 14 MB |
| Explore | 6× | 60.2 | 16.7 ms | 16.8 ms | 21 MB |
| Action | 6× | 60.3 | 16.7 ms | 16.8 ms | 14 MB |

**Bundle (M1):** JS 1,285 KB raw / 349 KB gzipped. Generated art 1,053 KB raw. Total transfer is about 0.85 MB, well inside the 2.5 MB budget.

Biggest assets:
- world atlas: 358 KB
- chars atlas: 168 KB (pedestrians and cyclists)
- intro highway backdrop: 125 KB
- park-paths decal: 69 KB

Pedestrians off-camera skip animation and rendering (visibility culling in `Crowd`).

### 2026-11-10 (M2)
Three districts now. Downtown is the heaviest: 120×92 tiles, 836 objects, glass towers, and 44 pedestrians. Each district is its own scene load, so only one district's objects exist at a time.

| Scene | 1× | 4× | 6× | Heap (6×) |
|---|---|---|---|---|
| Explore, Queen West | 60.2 fps | 60.2 | 60.2 | 18 MB |
| Explore, Downtown | 60.2 | 60.2 | 60.2 | 38 MB |
| Action, M1 | 60.3 | 60.2 | 60.2 | 14 MB |
| Action, M3 (King, SUV Rats + boss) | 60.2 | 60.1 | 60.1 | 16 MB |
| Action, M2 (streetcar escort) | 60.1 | 60.1 | 60.2 | 14 MB |

The p95 frame time is 16.7–16.8 ms everywhere.

**Downloads (M2):**
- JS: 1,331 KB raw / 362 KB gzipped
- At boot: 875 KB of shared assets
- Per district, loaded on entry: Queen West 538 KB, High Park 482 KB, Downtown 930 KB

**First load for a new game: about 1.8 MB** (budget 2.5 MB).

The Downtown building atlas (2048×1024, 810 KB) dominates: dithered glass compresses poorly. If it grows, the options are flatter glass bands or quantizing the reflection dither to 2×2 blocks.

### 2026-11-12 (M3.1)
Same harness. The Waterfront was sampled after 40 s, once its traffic had built up (about 110 vehicles, including the Gardiner and turning traffic).

| Scene | 1× | 4× | 6× | Heap (6×) |
|---|---|---|---|---|
| Explore, Waterfront (after 40 s) | 60.2 | 60.2 | 60.3 | 40 MB |
| Explore, East End (re-laid, bridge overlay) | 60.3 | 60.2 | 60.2 | 21 MB |
| Action, M5 | 60.3 | 60.2 | 60.2 | 15 MB |
| Action, M7 (cart shelters) | 60.3 | 60.1 | 60.2 | 17 MB |
| Action, M8 (islands, planes, Pink Digger) | 60.0 | 60.3 | 60.2 | 17 MB |

p95 is 16.7–16.8 ms everywhere. `tools/perf.mjs` now takes `ONLY=<regex>` and `SETTLE=<ms>`.

**Downloads (M3.1):**
- Boot without JS: 1,542 KB (was 1,440). The shared world atlas gained the 45° vehicle frames, the planes and the digger.
- Queen West on entry: 466 KB. JS: 370 KB gzipped.
- **First load: about 2.38 MB** against the 2.5 MB budget. Lazy map JSON in M4 is now needed, not optional.

### 2026-11-12 (M3)
Five districts and three new missions. Same harness (`tools/perf.mjs`, production build, CPU-throttled Chromium). The 1× column is from a second run; a second run's 4× numbers matched the first within 0.2 fps.

| Scene | 1× | 4× | 6× | Heap (6×) |
|---|---|---|---|---|
| Explore, East End | 60.1 | 60.2 | 60.3 | 20 MB |
| Explore, Waterfront | 60.3 | 60.1 | 60.2 | 22 MB |
| Action, M5 (Lane Eater: auto-scroll, peloton, machine) | 60.1 | 60.1 | 60.2 | 17 MB |
| Action, M7 (Parking Lot: depave, Monster SUV) | 60.1 | 60.1 | 60.2 | 16 MB |
| Action, M8 (Waterfront: lobbyists, fences) | 60.2 | 60.2 | 60.2 | 16 MB |

The older scenes are unchanged (60.1–60.3 fps). The p95 frame time is 16.7–16.8 ms everywhere.

**Downloads (M3):**
- JS: 1,379 KB raw / 364 KB gzipped
- At boot: 1,440 KB. It was 875 KB at M2. The growth is mostly **every district's map JSON** (432 KB for five), loaded at boot so the City Map can page through districts, plus the new side-view strips.
- Per district on entry: Queen West 338 KB, High Park 404 KB, Downtown 807 KB, East End 489 KB, Waterfront 179 KB. Park decals add up to 274 KB.

**First load for a new game: about 2.3 MB** (boot + Queen West + its decals + JS), against a 2.5 MB budget. The fix is ready for M4: load the other districts' map JSON lazily the first time the City Map pages to them, or ship a pre-baked minimap image per district (~20 KB each) instead of the full map.

### Bundle (M0)
| Item | Raw | Gzipped |
|---|---|---|
| JS (Phaser + game) | 1,259 KB | 340 KB |
| Generated art (atlases, tiles, backgrounds, fonts, map JSON) | 483 KB | ~240 KB (PNG barely compresses) |
| Audio | 0 | 0 (synthesized at runtime) |
| **Total transfer** | **~1.8 MB** | **~575 KB** |

## Optimization decisions
- **Runtime chiptune synthesis:** zero audio downloads, and the music suits the retro identity.
- **Generated art in two atlases** (chars 1024×256, world 2048×256) plus a tileset, so there are few requests and few texture swaps.
- **Tilemap ground:** only visible tiles are drawn. Buildings and props are plain images, y-sorted with `depth = y`.
- **Simple collisions:** static zones for building footprints and props; no tile-level collision.
- **Particles:** a handful of 2×2 rectangles tweened and destroyed within about 0.5 s. To revisit with pooling if counts grow.
- **Traffic:** small vehicle lists with simple 1D lane logic and no pathfinding.

## Watch list
- Phaser is about 300 KB of the gzipped JS. A custom Phaser build that strips unused systems (Matter, Spine, etc.) could save about 100 KB. Deferred to M4.
- ~~The full city map (6 districts) is roughly 10× the tiles of this chunk.~~ Solved in M2 by loading districts as separate maps (one in memory at a time).
- Downtown's building atlas (810 KB): see M2 notes above.
- **M3: boot size 1.44 MB.** All five map JSONs load at boot for the City Map. Make them lazy, or use per-district minimap PNGs, before the North district lands in M4.
