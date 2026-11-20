# Judge 03: iter_03 vs judge_02

Same scale. Grid = 232x208 (k=1.5 render px / 1.5). I accept the coordinator's override: the raccoon stays whole inside the frame. A rounded bottom plus the tail is a finished ending.

## 1. Scores (1-10; round 2 in brackets)

| | Raccoon | Dog Fjord |
|---|---|---|
| Proportions | 7.5 (7) | 6.5 (6.5) |
| Symmetry / structure | 7 (7) | 6.5 (6.5) |
| Silhouette / overall shape | 7 (6) | 5 (5.5) |
| 2D pixel-art craft | 7.5 (7) | 7 (7) |
| Face / expression appeal | 7.5 (7.5) | 7.5 (7) |
| Small-size readability | 7 (7) | 7 (7) |
| **Overall** | **7.5 (7)** | **6.5 (6.5)** |

## Round-02 fixes: status
**Dog:**
1. Bell-jar outline into curves: **partly, overcorrected**. It is now a mushroom or molar (D1).
2. No toupee ledge: **done**. But the hair sides now read as a helmet (D2).
3. Patch-eye flicks cut, pink hole filled: **done**. The heavy flat lid is right.
4. 112 brow gap: **done**.

**Raccoon:**
1. Smaller torso: **done**, kept inside the frame per the override. The torso is ~82 wide under a ~108 head.
2. Arms as outlined tubes with negative space: **partly**. They are outlined and readable, but the hip arm has the wrong proportions and gesture (R1).
3. Ringed tail: **done**. A dark tip is fine (true to life).
4. Grey jaw: **done**. The head now ends above the ruff.
5. Knuckle bumps on the fist: **done**.

## 2. What works (keep it)
- **Raccoon:** the head (unchanged and right), the narrower torso with the chest patch, the outlined tubes with a K edge, the near arm's V to the pump paw, the tail's bands reading at k=1, the grey jaw. It now reads as a chibi bust in the ref 4/5 family.
- **Dog:** the full expression layer. The patch eye's heavy flat lid is better than round 2. The pompadour's top, the front-left lift and the ridges. The face holds at 112.

## 3. Fixes, ranked

### Dog Fjord
1. **Mushroom → broad rounded square with a U bottom.** I agree with the art lead. The mushroom comes from three things. First, a concave temple pinch (x ~52/170, y 80-95). Second, a bulge to ~145 wide at y ~124 while the skull is ~102 at y 62, a ratio of 0.70. Third, jowl lobes that hang *below* the cheeks, with dips before the chin. The 3D is ~0.77 and convex all round. Spec:
   - **Skull top:** ~96 wide at y ~62, from (~64,62) to (~160,60).
   - **Sides:** convex and almost vertical, sloping out gently: (56,80), (49,100), (45,118).
   - **Widest point:** at the cheeks/mouth line, y ~118-128, at x ~44/180, so ~136 wide (not 145).
   - **Lower outline:** one full U: (46,140), (54,153), (70,161), (110,166), (150,162), (168,153), (178,140). No temple concavity, no lobe flare, no chin dips.
   - **Jowl sag:** show it *inside*, with the creases and the P shadow under the cheeks, plus at most a 1-unit outline step where each crease meets the edge.
2. **The hair sides read as a helmet.** The grey sides now drop as full-width bands straight down to the ear hinges, like a helmet's ear guards.
   - Taper them into short sideburn wedges, ~4-5 wide at y ~60-64, sitting *inside* the skull outline.
   - On the back-right side, leave ~5-6 units of pink skull visible between the hair and the ear, so the skull's roundness shows.
   - The side ridges run back and down, following the comb direction.
   - Keep the front-left quiff and the top as they are.
3. **The lit left plane is a separate stripe.** The pale `M` plane runs as a vertical band along the left edge (x ~40-56), which reads as a strip glued to the outline. After D1, shape it as a wedge that follows the new convex side, widest at the cheek (≥10 units) and fading into the base above the brow and below the jowl crease. Keep it flat, with no extra tone.
4. *(Check after D1)* At 112 the outline's lower right has uneven 1-px stair steps. Keep the U as one clean run of steps (1-2-3 pixel progressions) so it reads round, not lumpy.

### Raccoon
1. **The hip arm: from noodle to a chunky hand-on-hip triangle.** I agree with the art lead. The upper arm is now ~60 long and almost horizontal, out to the elbow at (213,150). The forearm comes back to a fist at ~(176,188) that rests on the *tail*, not the hip. Spec:
   - **Shoulder:** at ~(160,128).
   - **Upper arm:** ~30 long, ~17 thick, down and out to the elbow at ~(192,152).
   - **Forearm:** ~26 long, ~14 thick, back *in* to the fist at ~(164,176). The knuckles press against the torso's side, at the waist line.
   - **Negative space:** a clear background triangle of about (164,134), (188,152), (164,172). The tail then shows outside and below the arm (x ~196-224, y ~158-200) instead of under the fist.
2. **The head-to-torso join: shoulders start too high.** The flat shoulder line sits right at the jaw (y ~118), so both arms sprout from under the cheek tufts and the head looks perched on a barrel, with no neck depth.
   - Lower the shoulder tops to y ~126-130, sloping out from *under* the jaw.
   - Draw the head's cheek tufts and ruff *over* the shoulder tops (the head overlaps the body, as in refs 4/5).
   - Near shoulder at ~(90,128).
   - Shorten the near upper arm to match: elbow at ~(82,172), not ~184. The forearm then rises ~32 to the pump paw, which stays where it is.
3. **Tail form.** It is now an even-width tube, like a striped sock. Make it bushy: base ~14 coming out from behind the bust with a K edge that separates it, swelling to ~22 mid-length, ~16 before the tip. Keep the band count (4) and the ≥6-unit bands. Once the hip arm is fixed, let the tail's curl tip rise to ~y 156 beside the elbow, framing the triangle.
4. **Small polish:** with the shorter segments, give the elbow a rounded cap (not a point). Keep the fist one chunky shape with knuckle bumps toward the body.

## 4. Must not regress
- The raccoon's head and pump, the in-frame rounded bust, the outlined tubes, the tail's readable bands, the grey jaw.
- The dog's expression layer (wink, cocked brow, flat heavy patch lid, lopsided grin, flews, creases), the pompadour top, the ~136 width at 112, flat 3 tones, no dither.
- Signatures, sizes, the palette, consistent outlines. The dog stays a cartoon bulldog.
