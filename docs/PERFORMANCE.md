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
- The full city map (6 districts) is roughly 10× the tiles of this chunk. Phaser culls tile rendering, so the risk is low, but object counts (props and buildings) need culling or chunking at that scale.
