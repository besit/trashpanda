# Trash Panda: Right of Way: Dev Log

A running record of the process: what was tried, what failed, what changed and why. Newest entries are at the bottom of each day. Art iterations are frozen in [`art/history/`](../art/history/INDEX.md).

---

## 2026-11-09: Day 1, M0 kickoff

### Planning decisions (with Ivan)
- **Attack input:** a context button. K/Interact becomes Attack inside missions, and Dash and jump-stomp also hurt rats. Mobile keeps a stick plus 4 big buttons.
- **Hosting:** a public repo at `besit/trashpanda`, auto-deployed to GitHub Pages.
- **Art:** I author all of it as code and data, with an art-direction review gate at M0.
- **Map camera:** 3/4 oblique top-down, so Toronto's brick facades are visible instead of just roofs.
- **Mission added at Ivan's request:** speed cameras. Ontario banned municipal automated speed enforcement and the cameras were removed. Facts are to be verified in `URBAN_RESEARCH.md` before any copy is written.
- **Process rules:** dependencies stay project-local only; every art version is kept; this devlog is kept up to date.

### Stack
Phaser 3.90 (final stable v3), TypeScript 5.9, Vite 8, Vitest 5 and Playwright 1.65. Playwright's Chromium is installed into `node_modules` (`PLAYWRIGHT_BROWSERS_PATH=0`), so nothing is installed globally.

I deliberately chose Phaser 3.90 over the newer Phaser 4.2: v3 is frozen, battle-tested and very well documented. Phaser 4's renderer gains don't matter for a 384×216 pixel game.

### Art pipeline v1: pixel art as code
I can't drive a GUI editor, so all art is authored in code with two techniques:

1. **Hand-painted grids + procedural parts** (`tools/lib/raster.mjs`): text grids where each character is a palette colour, plus primitives (lines, ellipses, polygons), an auto-outline pass and rim lighting. Used for the side-view hero sprites, where expressiveness matters most.
2. **A tiny SDF renderer** (`tools/lib/sdf.mjs`): characters and vehicles are modelled from spheres, capsules, tori and boxes, then ray-marched into the 48-colour palette with stepped shading, Bayer dithering and an auto-outline. One model renders in all 8 directions and every animation frame, consistently. It's the same idea as the 3D-to-pixel pipelines some indie games use, scaled down to a few hundred lines.

Master palette (`tools/palette.mjs`): TTC reds, Toronto brick, lake blues, concrete greys, park greens, Dog Fraud pinks, and sunset oranges and purples. Outlines use a near-black purple instead of flat black, for a warmer arcade look.

### Side-view raccoon v01
![raccoon side v01](../art/history/raccoon_side/v01/preview.png)

The head is a hand-painted 14×10 grid (bandit mask, white brow and muzzle, ears). The bike is procedural: a red steel cruiser, spoked wheels that rotate per frame, swept-back bars, a bell, and a wicker basket with a pizza slice. Legs use 2-bone IK, so the feet really follow the pedals. The attack is a **trash-can lid swing**, chosen for being on-brand and non-violent.

What works: the silhouette and striped tail read immediately, and the red bike pops.
Known issues: the tail clips the frame edge, the eye is too small to emote, and the legs are a bit spindly.

### Top-down raccoon: three failed passes, then v01–v02
- **Pass 1 (not preserved):** rendered with the same 45° oblique projection as the ground. Everything came out pale and the front/back views were long, thin sticks. A true oblique projection stretches anything pointing north-south.
- **Pass 2 (not preserved):** darker shading and a chubbier body. Better, but still stick-like front and back. The key insight: classic 3/4 games *cheat*. The ground is drawn top-down, but characters are drawn from a lower camera.
- **Pass 3:** moved characters to a 32° camera. The first render was upside down because of a sign error in the camera basis (`right = d × up` should have been `up × d`). Fixed.
- **v01:** 8 directions × 4 pedal frames, all from one model.
- **v02:** wider torso, head and mask so the front view shows the face and the back view shows the tail.

![raccoon top v02](../art/history/raccoon_top/v02/preview.png)

*Ivan asked to keep every version from here on. Passes 1–2 were overwritten in scratch before that.*

### Rats v01 → v03
- **v01:** SDF rats read as rats immediately, but they were too skinny, with 1px eyes, and the flagger's STOP paddle covered his face.
- **v02:** scaled up 1.18×, bigger heads and ears, white eyes with pupils and angry brows, paddle moved to the back hand. The new ears then covered the eyes and hats.
- **v03:** ears moved back and up.

![rats v03](../art/history/rats/v03/preview.png)

### Dog Fraud v01 → v05
Taken from Ivan's street-art reference as *shape language only*: flushed pear head, horn-ears, handlebar moustache, smug grin, tiny suit. He's built as a cartoon bulldog, not a likeness.
- **v01:** the framing bug put the head out of frame.
- **v02:** first real look. Characterful, but closer to a pig than a dog.
- **v03:** added a protruding muzzle with a split lip, droopy jowls over the collar, bigger horn-ears, smug arched brows (the first brows read as angry) and a smaller body. The muzzle now hid the moustache and nose.
- **v04:** nose and moustache brought forward.
- **v05:** the laugh frame gets a real open mouth (teeth and tongue) for FRA-HA-HA.

![dog fraud v05](../art/history/dogfraud/v05/preview.png)

### Environment
- **Tiles:** asphalt, embedded streetcar tracks (E-W, N-S, crossing), sidewalks with slab seams, curbs, zebras, painted and protected bike lanes (green paint, curb, bollards), parking, grass, park path, laneway, tree pits. The bike stencil first rendered as blobs, so it was replaced with a hand-painted glyph. The flipped north-lane tiles showed an upside-down bike, so proper north-side tiles were drawn.
- **Buildings:** a seeded Victorian storefront generator (sign bands, awnings, sash windows, cornices). Rear walls get fire escapes and graffiti. v02 calmed the noisy painted-brick texture.
- **Props and vehicles:** the TTC stop pole vanished because it was thinner than a pixel, so it was thickened. The streetcar roof read as a white slab and is now grey with a taller window band. Side-view cars looked tiny next to the side raccoon, so they got dedicated 2.2× side renders.
- **Side-view backgrounds:** a dithered day/dusk sky, a skyline with the CN Tower and the Dome, a back row of houses, the Queen West storefront strip, and a street strip with painted and protected variants.

![side bg](../art/history/side_bg/v01/preview.png)

### The game
- **Boot → Title → Cutscene → Explore ⇄ Action**, sharing one GameState.
- **Explore:**
  - tilemap ground; y-sorted buildings and props; building footprints as colliders
  - roofs fade when the raccoon rides behind them
  - traffic on lanes with a signal cycle; cars and streetcars yield and honk or ring
  - mission marker with a zoom + iris transition
  - the **transformation sequence:** the camera pans along Queen while protected lanes sweep in tile by tile with sparkles and planters pop up, then Livability ticks 60 → 64 with a sourced blurb.
- **Action:**
  - parallax layers; arena-lock waves; parked cars to hop on
  - coyote time, jump buffer, variable jump, air dash
  - 3-hit trash-can-lid combo; stomps; hit-stop and shake
  - rats with telegraphed windups; construction rats lob cones you can swat
- **Audio:** a WebAudio chip synth (pulse waves with 12.5/25/50% duty via PeriodicWave, triangle, LFSR noise) and a lookahead sequencer. Songs: *Queen St. Cruise*, *Historic Investment* (Dog Fraud), *Rat Rush*, plus an improvement sting.

### Bugs found by testing (and fixed)
1. **Quick key taps were ignored:** a key pressed and released within one frame cleared Phaser's just-down flag before the scene read it. The input manager now latches taps from keydown events. Headless tests found this, and it would also have bitten fast human tappers.
2. **Preview server served the wrong base path:** `vite preview` runs as "serve", so the `/trashpanda/` base wasn't applied.
3. **The raccoon spawned inside a street tree's collider.**
4. **The wave-clear check could never fire** once dead rats were filtered out of the list. Replaced with explicit per-wave counters.

### Research
Two entries are written in `URBAN_RESEARCH.md`, and the mission's framing changed because of the second one:
- **Speed cameras** (Ivan's request): Ontario's Bill 56 ban took effect November 14, 2025. The SickKids/TMU study found a 45% drop in speeding vehicles in school zones.
- **Protected bike lanes:** Bloor saw a 49% rise in cycling, and the TCAT economic study was positive. Teschke 2012 found cycle tracks had about 1/9 the injury risk. **News since planning:** the Court of Appeal overturned the Charter ruling (August 2026) and Bloor removal work began in October 2026. The in-game blurb now quotes only Teschke 2012.

### Numbers
- 60 fps even at 6× CPU throttle; about 16 MB JS heap; about 575 KB total gzipped download.
- 10 unit tests and 3 end-to-end tests, all passing. Deployed to https://besit.github.io/trashpanda/.
