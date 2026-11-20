# Portrait iteration loop (M4.7) — shared brief for the DRAWER and the JUDGE

Project: "Trash Panda: Right of Way", a Phaser pixel-art game. Repo root: c:\Users\besit\git\trashpanda (Windows; use the Bash tool with POSIX syntax, `cd /c/Users/besit/git/trashpanda`).

## The task
Iterate on the two hero portraits, the raccoon (Trash Panda) and Dog Fjord (a cartoon bulldog politician), drawn as
**pure 2D pixel art in code**. The project lead (Ivan) said about the current 2D version:

> "it looks a little better, but I want you to take a look and iterate on them... I think that proportions, symmetry,
> overall shapes were better [in the old 3D/SDF version], if we don't consider the blobbiness, but I want the 2D style
> still, it has more character."

He saved raccoon pixel-art references and "especially likes 3, 4 and 5":
- `reference/raccoon-ref_03.jpg`: big detailed front-facing raccoon face, crisp mask, white brow bands, amber eyes with highlights, hands holding a cookie.
- `reference/raccoon-ref_04.jpg`: a chunky cartoon raccoon standing on a stump, big grin, red bandana, clear readable mask, game-sprite style with dark outlines.
- `reference/raccoon-ref_05.jpg`: two raccoons with simple flat shapes, cel shading, soft purple-grey palette, chunky readable forms.
- `reference/raccoon-ref_01.webp`: cute chibi raccoon, clean dark outline, simple flat shading (style reference, less preferred).
- `reference/raccoon-ref_2.webp`: one more (minor).

So the goal is: **the proportions, symmetry and overall silhouettes of the old 3D versions + the crisp 2D pixel-art style of refs 3/4/5** (clean outlines, flat cel shadows, strong readable shapes, expressive eyes with highlights, no pillow shading / no blobby soft gradients, hands with clear fingers).

## Hard constraints
- Dog Fjord is a **cartoon dog**, a satirical character. He must NOT resemble any real person. **Do not open `reference/DogFjord.jpg`.** The design target for him is the old 3D version (the top row of the sheet) plus his established traits: big pink bulldog head with jowls, grey combed hair (swoop + quiff), folded ears, a brown heart-shaped patch around one eye, thick brows, big black dog nose, wide toothy grin, dark suit, white shirt, blue patterned tie.
- The raccoon: smirk expression, bandit mask, white brows, holding a yellow bike floor pump (T-handle, barrel, gauge, hose) in one paw, other fist on hip, grey fur with pale chest/ruff.
- Pure 2D: flat colour regions, outlines, cel shadows, hand-placed details. No 3D/SDF rendering, no per-pixel lighting gradients.
- **The DRAWER edits only the two code files below** (plus its own files in tools/scratch/piter/). The JUDGE edits no code. Do not git commit, do not run `tools/build-assets.mjs`, do not touch `src/`.

## Code
- `tools/sprites/portraits.mjs`: `raccoonPortrait2d(expr='smirk', k)`, `dogPortrait2d(expr in 'grin'|'laugh'|'shock', k)`, drawn on a 232 x 208 design grid (`GW`, `GH`) at scale k. Used at k = 1.5 (posters, 348x312), k = 1 (posters, 232x208) and k = 112/232 (Dog Fjord's in-game dialogue portrait 112x100, shown 2x in cutscenes). Keep these signatures, the canvas sizes and `portraitsPreview()`. The raccoon has a `'smirk'` expression used in the game; you may also keep/accept other expr values but only smirk is required.
- `tools/lib/draw2d.mjs`: the small 2D toolkit (Catmull-Rom blobs, ellipses, bars; per-part outlines; paint/rim/stroke/dot). You may extend it (backwards compatible).
- The old 3D versions for proportion reference: `raccoonPortrait` and `dogPortraitHi` in `tools/sprites/posters.mjs` (and the SDF head in `tools/sprites/dogfjord.mjs`). Reading their geometry numbers is a good way to copy proportions.
- Palette: reuse the colours already used in portraits.mjs (from the project palette); keep it coherent with the game.

## The render sheet
`node tools/scratch/piter/render.mjs tools/scratch/piter/iter_NN.png --sdf`
- Row 0: the OLD 3D versions (raccoon smirk, dog grin, dog laugh) at poster size — the proportion/shape target.
- Row 1: the 2D versions at poster size k=1.5: raccoon smirk | dog grin | dog laugh | dog shock.
- Row 2: small sizes: raccoon k=1 | dog k=1 | in-game dialogue portraits grin/laugh/shock at 1x | the same at 2x.
The PNG is saved at 2x zoom on the posters' blue. Look at it with the Read tool (it shows images).
`tools/scratch/piter/iter_00.png` is the baseline (the current M4.6 2D version).

## Files per iteration NN (01, 02, ...)
- DRAWER writes `tools/scratch/piter/iter_NN.png` and `tools/scratch/piter/drawer_NN.md` (what changed, why, what it would do next), and snapshots the art history:
  `node tools/snapshot.mjs portraits_2d tools/sprites/portraits.mjs portraitsPreview "M4.7 iteration NN: <one line>" 3`
- JUDGE writes `tools/scratch/piter/judge_NN.md`.
