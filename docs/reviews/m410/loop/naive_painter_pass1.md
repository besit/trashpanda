# naive, pass 1

Images: `pass1_hero.png`, `pass1_1x.png`, `pass1_values.png`. Snapshot: `art/history/raccoon_style_naive/v01`.

## The style
The least rendering that still reads as this raccoon with his pump. I aimed for the look of a plush toy or a simple indie
sprite (ref 01): flat colour fields, one outline colour, one shadow tone. The charm should come from the silhouette, the
big mask and the half-closed amber eyes, not from rendering. I rewrote `raccoon.mjs` from scratch (about 190 lines, down
from 640). It keeps the old design coordinates, so the pose, the pump axis, the scarf, the tail and the bottom are the same.

## Recipe
- **Palette: 13 colours.** 10 are my own (а..й) plus the game's `y`, `o`, `Y`.
  - Each material gets two tones, a local colour and a cooler shadow: coat б/в, cream г/д, scarf ж/з, chrome и/й,
    yellow y/o.
  - The mask colour е has no shadow tone. It also serves for the paws, the nose, the ear insides, the tail rings, the
    T-handle, the foot plate and the hose.
  - Colours are re-used across parts: the eyes are the pump's yellow, the glints are the cream. No pure white or black
    anywhere.
- **Outlines.** One warm plum-brown line (а), 1 px, around every mass. It also runs where one mass overlaps another:
  head over scarf, arm over body, pump over everything. The markings (mask, brows, bib, forehead stripe, tail rings,
  snout) are colour only, never outlined. The snout has no inner line either, so the face stays one shape.
- **Light.** The light comes from the upper left.
  - Each mass has ONE hand-placed shadow polygon that swaps every local colour for its shadow tone: body plus far arm,
    head (far cheek and jaw), snout underside, scarf, the whole far ear, the barrel's far half.
  - The tail is a cylinder: a pixel is in shadow when it lies on the far side of the centre line.
  - Three cast shadows, made by offsetting the caster's mask: the head on the scarf and chest, the pump and paw on the
    chest, the forearm on the belly.
  - No gradients, no dither, no rim light, no reflected light.
- **Texture: none.** No fur strands and no tufted edges. A few deliberate sharp points carry the "fur": the ear tips, the
  cheek ruff, the tail tip and three tufts on the bottom.
- **Accents, kept few.**
  - A 2x2 glint in each eye and on the nose.
  - One light stripe (Y) on the barrel.
  - A 1-px gauge needle.
  - The smirk is one pixel-perfect line that curls up at the cheek.
  - The eyes are amber ovals with a dark pupil looking right. A flat mask-coloured lid covers the top 40%, which gives
    the smug look.
- **Deliberately left out:** whiskers, fur texture, ear pink, the iris rings and wet highlights, the chrome specular
  glints, the pump caps' detail, the light falloff toward the bottom.

## Inside the pass
- v0, the first render: the tail shadow polygon crossed itself, so the shading made shards; the near arm's own shadow
  polygon cut it into a mess; the scarf knot's outline looked like a sticker; the eyes looked sleepy.
- Fixes:
  - The tail is now shaded per pixel against its centre line.
  - The arm is lit and flat, separated from the body by its line and a cast shadow below.
  - The elbow bend is softer, so the arm's tube no longer folds over on itself (that fold made the notch).
  - The knot has no inner line.
  - The lid is raised a little.
  - The bottom tufts are smaller.
  - One despeckle pass at the end.
- pixelcheck: clean except 1 jaggy and 1 nub on the outline, and 2 "holes". The holes are real gaps of background
  between the foot plate and the body.

## What I'd do next (pass 2)
- The lower body is still the weakest area. Three shadows meet there (the forearm's cast, the body terminator, the
  pump's cast), so it reads busy for a naive style. I would merge them into one simple shadow shape.
- The cream lower face is a large flat field. A slightly smaller cream area, or a stronger jaw shadow, would give the
  head more shape.
- The cheek ruff points are hidden behind the barrel. I would move a tuft to where it shows (the near cheek below the
  pump, or the jaw).
- Try cutting further, to about 10 colours: drop the chrome shadow and the cream shadow, or merge the scarf shadow into
  the outline. This would test how few colours still read.
- The scarf end is a big dark flat flap. It needs a clearer shape (a fringe cut, a fold line).
