# naive, pass 2

Images: `pass2_hero.png`, `pass2_1x.png`, `pass2_values.png`. Snapshot: `art/history/raccoon_style_naive/v02` (pass 1 is
v01).

## What changed after the critic
The critic's main point was that the drawing underneath limits every style. So I first redrew the shapes, then made the
four fixes. I added no rendering and cut colours from 13 to 11.

- **Arm: drawn by hand.** It is one blob polygon: the upper arm runs down the body's side, rounds at the elbow, and the
  forearm crosses to the paw. Before, it was a tube along a path. That tube folded over itself at the elbow, which made
  a notch and a tiny hole, and its crook read as a separate triangle of bib.
- **Paw: grips the barrel.**
  - The back of the hand sits on the front of the barrel. Three knuckle bumps sit just over the barrel's top edge, and
    two 1-px finger splits run down from them.
  - It is coat shadow (в) with the plum line. It is no longer a mask-dark mitten, so it sits below the face in value.
  - It casts a small shadow on the barrel and the gauge.
- **Snout and mouth: one shape.**
  - The snout is redrawn slightly longer and rounder, with a clear underside.
  - The underside is cream shadow, and its upper edge IS the mouth line. The smirk now explains the snout's cylinder
    instead of sitting on a pasted patch.
  - The mouth's tucked corner is 2 px thick at k 1.5, so it survives at 1x.
  - The nose got a lit top plane (coat shadow) with the cream glint on it.
- **Lower face: one plane change.** The head's shadow edge now starts under the far eye and curves down along the snout
  to the scarf. The jaw and the far cheek are cream shadow (about a third of the cream field). The near cheek stays flat.
- **Lower body: one shadow system.** I removed the pump's cast shadow on the belly, the arm and the tail. What is left:
  the body's shadow side (right), the forearm's cast shadow on the belly, the head's cast on the scarf, and the pump's
  cast on the scarf only.
- **Outline: 2 px on the shadow side at k 1.5.** It is thickened outward on the right and bottom (background pixels
  right of or below a line pixel). k 1 keeps 1 px.
- **11 colours.** The chrome's shadow tone is now the coat shadow. The barrel's light stripe is now the cream, so the
  separate Y is gone.
- I tried a "cheek bulge" tick above the mouth corner and removed it. It read as a stray mark, not a cheek.

pixelcheck: clean except the "holes" (real background gaps between the foot plate, the hose and the body) and 1 nub at
k 1.

## Final recipe (naive)
1. **Palette: 11 colours.**
   - Two tones per material: coat б/в, cream г/д, scarf ж/з, yellow y/o, chrome и/в.
   - One mask dark (е) with no shadow tone. It also serves for the ear insides, the tail rings, the T-handle, the foot
     plate and the hose.
   - One plum outline (а). Nothing is pure white or black.
   - Colours are re-used across materials (the eyes are the pump yellow, the glints and barrel stripe are the cream, the
     paw and nose top and chrome shadow are the coat shadow). Re-use is what keeps the count low, and it ties the
     picture together.
2. **Shapes first, drawn by hand.** Each mass is one smooth blob with a few deliberate sharp points: the ear tips, the
   cheek ruff, the tail tip, the bottom tufts and the scarf fringe. The arm and the paw are drawn as shapes, not built
   from tubes.
3. **Lines.**
   - One plum line around every mass, 2 px on the shadow side at the poster size.
   - The markings (mask, brows, bib, snout, rings) are colour only, never outlined.
   - A line inside the figure only where one mass overlaps another of the same value.
4. **Light from the upper left.**
   - ONE hand-placed shadow shape per mass swaps each local colour for its shadow tone. The tail is a cylinder shaded
     against its centre line.
   - Few cast shadows, each with a job: the head on the scarf, the forearm on the belly, the paw on the barrel.
   - A shadow edge doubles as a drawn line wherever it can (the mouth is the snout's terminator).
5. **Accents only where they carry the read.**
   - The eyes: half-lidded amber with a dark pupil and a 2x2 glint.
   - The nose: a lit top plane and a glint.
   - The pump: one barrel stripe and a gauge needle.
   - The mouth: a thick corner.
6. **Left out on purpose:** gradients, dither, fur texture, rim and reflected light, whiskers, material detail.

## What I'd do next
- The scarf end is still a large dark flap. It needs a fold or a clearer fringe.
- The bib's crook (between the arm and the barrel) is still a small separate cream pocket. Try coat there, or let the
  forearm's cast fill it.
- The far arm is a vague bump under the scarf end. Draw a small mitten for it, or hide it.
- At k 1 the expression lives almost entirely in the eyes. The mouth is still thin there.
