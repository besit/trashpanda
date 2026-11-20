# Artist, round 05 (refinement 2)

Files:
- `tools/sprites/portraits.mjs`, edited directly. Rendered as `iter_05.png` / `iter_05_hero.png`; snapshot `portraits_2d/v15`.
- The one-off edit scripts: `edit_r05_dog.cjs` and `edit_r05_racc.cjs`.
- A backup of round 04's file: `variants/r04_backup_portraits.mjs`.

## Dog Fjord (fixes 1 to 3: the biggest lever)
- **Layout:** the chin-up is dialled back by about half (offsets eyes [1, -4], nose [1, -5]). The features sit lower and further apart.
- **The mouth** is laid out on its own, low and wide: a bulldog crescent from x 50 to 146 (design units), about 76% of the head's width at the mouth, like iteration 04's grin.
  - The patch-side (far) corner is raised. The upper lip runs across the mouth's whole width (lit on the near side, half shade on the far side) and rolls under in shadow.
  - The upper lip casts a shadow band on the teeth, and the teeth turn darker toward the far corner. Dark corners, a few tooth separations, the lower lip thrust forward.
- **Drapes:** heavy curtains of lip over the two corners. The dark crease runs only down the top and inner edge, and the lower edge melts into the jaw's core shadow (no closed outline, no hamster pouch, no tongue wedge).
- **Fangs:** bigger lower canines, poking up past the upper lip at the drapes' inner edges.
- **Skin palette:** new keys `/` (peach-ochre light), `¢` (warm highlight), `Q` (desaturated mid), `£` (side plane), `9` (ochre-olive half-tone), `§` (mauve core shadow), `¤` (deep mauve crease), `°` (cool bounce).
  - The skin parts are drawn in the old keys and recoloured at the end (m→Q, ~→/, M→¢, ^→£, P→§, ?/p→¤). The mouth, patch and nose keep their own colours.
  - The large mid area is a step less saturated, so the patch, nose and grin carry the colour.
- **Planes, not bands:** a lit front plane (forehead dome, near cheek, upper lip), the mid, and a side plane on the far cheek.
  - ONE cool core shadow runs across the jaw under the drapes, with a thin ochre-olive half-tone along its top edge, broken by fur strokes.
  - A thin cool bounce sits only at the collar.
  - The old concentric jowl, chin and reflected-light bands and the stray dark crescent at the lower right are deleted.
- **Expressions:** laugh (a wide open crescent with an upper and lower teeth row, a tongue, the fangs) and shock (the O mouth with the fangs on the lower lip) share the drapes, ears, nostrils and palette.
- **Size check:** all three read at 112: the wink, the patch eye, the nose, the wide grin, the fangs as 2 white pixels.

## Raccoon (fixes 4 to 6)
- **Pump mid-stroke:**
  - `pumpAxis()` has new options: `bw` (barrel width), `rod` (how much rod shows), `hw` (the T-bar's half width), `gr` (gauge radius).
  - The barrel is slim (8.6 wide, about 1:4.5). A 19-unit chrome rod shows between the cap and the T-bar, the handle pulled up mid-stroke.
  - The T-bar is 66 wide with ribbed grips poking out past both paws, and each paw holds one grip.
  - The gauge is smaller and low on the barrel, facing the viewer, with no hand over it. The T-bar sits below the chin.
- **Arms:**
  - Upper arm, elbow and forearm instead of wings: the upper arms drop from the shoulders to elbows just outside the body, with a tuft only at the elbow point.
  - The forearms are separate shapes drawn in front of the bandana: darker toward the paws (as a raccoon's are), a lit edge toward the light, and a contact shadow on the chest.
  - Their angle reaches the wrists from outside the paws, so they're no longer hidden under them.
- **Values:** a lit rim down the near side of the body, the near thigh and the forearm.
  - The bandana's cast shadow lies on the chest under the kerchief, and there's occlusion under the T-bar and paws.
  - The armpits are dark, and the inner sides of the legs (between them) are in occlusion.
- **Fur clusters:** the bib flows down and out from the throat (lit fur tips `8` and a mid tone on the bib), the belly fur turns under (darker strokes downward), a highlight cluster sits on the near thigh, and there are strokes on both legs.
- **Feet:** a lit top edge, a darker heel, toe lobes with gaps between them, a lit spot on each toe, a lit pad under each toe, and claws.
- **Tail:** it now starts behind the far leg (tucked). Lit strands cross the dark rings and the light fur, besides the fur breaks at the ring edges.

## Known weaknesses / next
1. **The arms still read weakly at k = 1.5:** the forearms are short and partly behind the paws, and the elbows sit in the body's edge tufts.
   - A clearer lit edge on the upper arm, or a value step between arm and torso, would help.
   - Alternatively, bend the wrists so a sliver of forearm shows above each paw.
2. **The pump barrel is short** (the foot plate to the cap is about 40 units). A lower gauge or none, plus a little more barrel by moving the T-bar 2 to 3 units up, is the remaining lever; the chin limits it.
3. **Body:** the bib's furStrokes are a little regular in places, and the belly could take one more turning-under shadow shape.
4. **Dog:**
   - The drapes read a little like cheek pads. Their lower U could sag further and the inner crease could taper more.
   - The near drape's highlight is a bit round.
   - The jaw's half-tone strip is one line in places; break it more.
   - The forehead folds are faint.
5. **The nostril slits are still weak at k = 1.**
