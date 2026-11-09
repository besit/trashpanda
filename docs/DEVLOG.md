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
