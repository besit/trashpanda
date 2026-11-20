# Painter, round 08: low-risk items, everything else frozen

Base: round 07. These are the critic's 5 items. Source: `variants/r08.mjs` = `tools/sprites/portraits_next.mjs`.

1. **The shock's eyes are seated in the head.**
   - A band of the brow's and lid's shadow (`7`, or `8` at small sizes) lies over the top of each white.
   - A thin dark upper-lid line (`@`, pixel-perfect `line1`) runs on the top arc only, with no full ring.
   - The whites stay `W` below that. The pupils and 1-px catchlight are unchanged.
   - At 112 the "wide eyes" read survives, and they no longer look like stickers.
2. **The laugh's near cheek is one crease.** The near jowl dome is no longer pushed up with the smile crease; its edge
   was the second lit lip. The crease still rises 3 units, and the cheek-ball domes under the eyes stay, so the squint
   and the pushed-up cheeks are kept.
3. **No cream sliver under the paw.** The bib's tufted lower edge now stops at x 121, and its bottom point was raised
   from 156 to 153.
4. **pixelcheck.**
   - New light2d options: `dejag(keep, { thick, fill })` also catches doubled corners in components that are not 1-px
     lines, and never opens a hole (it takes the figure's colour instead of the background). `deorphan(keep, on)` can
     be limited to parts.
   - **Dog:** clean in all three expressions. The hair-outline jaggy at (106,82), there since round 02, is gone, and so
     are the laugh's tooth-light orphans on the lip line.
   - **Raccoon:**
     - jaggies 4 → 1, at (173,41) on the far ear's rim;
     - 1 "orphan" at (255,109): the eye's secondary catchlight, kept on purpose;
     - 1 hole at (307,143): the whisker, acceptable.
5. **The VERSUS pairing check** (`iter_08_versus_1x.png` and `_2x.png`, on purple and red poster colours, and
   `iter_08_versus_values.png`). The raccoon and Dog grin at k = 1.5, side by side:
   - **Light direction:** both are lit from the upper left, with shadow planes on the right of each figure.
   - **Darkest darks:** the raccoon's mask and nose and Dog's nose and brows are the same deep `@`.
   - **Outline weight:** both have a 1-px line outside the figure, dark on the shadow side and softer on the lit side.
   - **Contrast peaks:** in greys, the raccoon's mask and brows and Dog's nose, eyes and teeth are the peaks of the pair.
   - **Poster colours:** Dog's pink reads against the red VERSUS half, the raccoon against the purple.
   - Nothing jumps out, so I made no art change for this item.

## Frozen
- Everything else on both characters: the raccoon's head, body light, arm, paw grip, tail, scarf and pump; Dog's grin;
  the laugh's cavity, tongue, lip and cheeks; the shock's O, teeth sliver, brows and pupils.

## Checks
- Game: portraits.mjs, `src/` and draw2d are untouched, and the game portraits render. The light2d test image has the
  same md5.
- Palette: no new keys.
- Annotate PNGs re-exported.
