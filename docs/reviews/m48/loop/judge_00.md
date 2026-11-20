# Judge, round 00: the baseline (M4.7 iteration 09)

Scale for the whole loop: **ref 03's craft = 9 to 10.** Refs 04/05 are about 7.5 to 8 (strong clusters and value,
simpler fur). A clean, readable vector cartoon with flat 3-tone cel fills and black lines everywhere is about 4.

| Character | Score | One line |
|---|---|---|
| Trash Panda (raccoon) | **4.0 / 10** | A likeable face and a good smirk. Underneath it is a vector cartoon: flat fills, a sack body, tube arms, and a pump that is bent and steals the focus. |
| Dog Fjord | **3.5 / 10** | Readable and funny, but it is a flat salmon egg with lines drawn on it. Wrinkles, jowls and muzzle are drawn as lines, not modelled. The head is not iter_04's. |

These numbers are the yardstick. A round has to beat them in the image, not in the notes.

---

## 2. Craft gap against ref 03

### Value ramps and hue shift (the biggest gap)
- **Ref 03:** the grey fur alone uses about 7 values, from near-black blue-violet (#2a2a3a range) through mid slate to
  bright cool white. The lights lean cool-bright, the shadows lean blue-violet. The mask is not one colour: it goes from
  a soft charcoal sheen to black in its deepest corners next to the eyes.
- **Raccoon now:** fur is 3 tones of one lilac-grey (light #c8c6d6-ish belly, mid #9a98ac, dark #6a6880 forehead
  stripe and arm undersides). There is no hue shift: shadow is just the same hue made darker. The mask is **one flat
  navy-black** with a single slightly lighter rim band, so it reads as a hole, not as fur. The brows and muzzle are one
  flat cream each, with no shadow under the brow and no light on the top of the snout.
- **Dog now:** the head is about 4 pinks: a peach highlight crescent on the left, a salmon mid, a rose shadow crescent
  on the right, a darker rose band under the chin. That is cel shading that follows the outline (**pillow shading**),
  so the head reads as an inflated balloon. There are no purple-rose cool shadows and no warm yellow-peach lights. The
  brown patch is one muddy brown plus one flat light-brown chip at the top left.
- **Target:** 5 to 7 steps per material, shadows shifting toward blue-violet (fur) or mauve-purple (pink skin), lights
  toward warm (pink skin, pump) or bright cool (white fur). Add the ramps as new palette keys.

### Fur rendering and edge treatment
- **Ref 03:** every fur area is made of directional strokes 2 to 4 px long, following the flow: the brow tufts fan out,
  the cheek ruffs splay down and out, the ear fringes are pale strokes breaking over a dark inner ear. Edges are jagged
  and tufted, and white tufts **break the silhouette**.
- **Raccoon now:** no fur strokes anywhere on the head. The cheek ruffs are 3 or 4 **identical sawtooth triangles** (the
  left ruff at hero x≈480 to 520 looks cut with scissors). The chest bib is a regular zigzag. The ears are smooth
  triangles with a smooth dark inside: no fringe. The body has stray 2 px "V" ticks (on the belly at hero
  x≈455/y≈630 and x≈630/y≈620) that read as stitches or orphan pixels, not fur.
- **Dog now:** the hair is the best-rendered part (strand clusters in 3 greys, swept to the right). Everything else is
  smooth curves.

### Outline strategy
- **Now:** a uniform 1 to 2 px near-black (#1b1a26-ish) outline around **every** region on both characters. Examples:
  the mask edge, the muzzle, the inner ear, the arm-to-torso seams, the tail rings, the barrel caps, each grip, the
  gauge, and the dog's nose, brows, patch and teeth. Inner forms are separated by lines, not by value. That is the
  "vector" look Ivan is reacting to.
- **Target (ref 03):** a dark silhouette only, and coloured: a dark blue-grey on the fur, a dark mauve on the pink skin.
  Drop the outline on lit edges (the top of the head, the lit cheek). Separate the mask from the fur by value and
  ragged fur strokes, not a line. On the dog, show wrinkles and the nasolabial folds as **shadow shapes with a light
  edge above them**, not 1 px rose lines.

### Eyes
- **Raccoon:** this is the strongest area. The amber iris has a dark pupil, a heavy upper lid and a small highlight,
  and the half-lidded side-eye sells the smirk. Gaps: the iris is about 2 tones (amber plus a darker ring), and it
  needs 3 or 4 (dark top under the lid, bright amber-gold bottom). There is no lid-rim colour, and the highlight is a
  single small dot. The eyes are small for the head: in ref 03 the eye-to-face ratio is about twice as big. The eyes sit
  in a flat black mask with no darker socket around them, so they don't pop.
- **Dog:** the open eye (left) is only a black brow-shaped arc with a squint. The patch eye is a tiny red-irised slit
  inside flat brown (hero ≈1780 to 1860 by 440 to 480 in the hero image). At 112 that eye is a 1 to 2 px dark smudge
  that vanishes into the brown. A smug politician sells his look with the eyes; these have no white, no highlight, no
  wet sparkle.

### Form modelling
- **Raccoon:** the head is a flat plane with the muzzle stuck on. No brow ridge, no cheek falling into shadow, no
  snout volume (the muzzle cream is one flat tone up to the black nose). The body is a pear-shaped **sack** with a
  lighter oval for the belly. The arms are uniform-width **tubes**, the far hand-on-hip arm is a bent pipe, and the
  paws are black mitts with 3 grey finger lines.
- **Dog:** the egg-shaped head has no planes: no forehead plane catching light, no muzzle mass pushing forward, no
  jowls hanging over the collar (they are only two curved lines). The big black nose is an ellipse with one grey
  highlight and almost invisible nostrils, so it is not wet. The grin is a white crescent with tick lines: no gum, no
  upper-lip overhang, no cheek pushing up into the eye.

### Colour harmony
- **Raccoon:** cool lilac fur, near-black mask and paws, and a fully saturated cadmium-yellow pump. The yellow is the
  most saturated, highest-chroma thing in the picture, so the eye goes to the pump barrel, not the face. Nothing on the
  raccoon echoes the yellow or the amber eyes.
- **Dog:** a huge salmon-pink field (about 60% of the picture area) with nothing to balance it: a charcoal suit, a
  navy tie with dots that blends into the blue poster background, and a muddy brown patch. The pink reads "pig", not
  "bulldog".
- Neither character shares a light colour with the other. They don't feel lit by the same sun.

### Pose and attitude
- **Raccoon:** the head turn and side-eye smirk are good. The body has no attitude: it floats, sitting on nothing.
  The pump is held out at its side like a product display. The hand-on-hip is a right idea killed by the tube arm. The
  tail curls out of the lower right like an afterthought.
- **Dog:** dead frontal, no neck, no shoulder tilt, head pasted on a narrow suit. The smugness comes from the grin and
  the wink only, not from the posture.

### Silhouette appeal
- **Raccoon:** the pump (T-handle at the very top left, plus the hose J) is **taller than the raccoon** and dominates the
  left half. The body plus tail is a wide low blob. The ear pair is the only crisp silhouette feature of the head. Read
  as a black shape, it is "a pump next to a potato".
- **Dog:** an egg on a trapezoid. The ears are two small triangle flaps that read as pig ears. iter_04's broader top
  and lower, more horizontal ears gave a much stronger bulldog shape.

### Small-size readability
- **Raccoon at k = 1:** mask, eyes, nose and pump all read. The grip ribs and gauge marks become noise.
- **Dog at 112:** the nose, grin and shock "O" read well. The problems: (a) the patch eye in `grin` and `laugh` is a
  dark slit that merges into the brown heart; (b) the 1 px forehead and jowl lines become jagged scratches; (c) the
  whisker or freckle dots become orphan specks; (d) the laugh's teeth tick lines turn into a striped bar. Drop the
  line work below a threshold of `c.S` and keep only big value shapes there.

---

## 3. Constraint checks

| Check | Result |
|---|---|
| **Pump straight** | **FAIL: bent in two places** (details below) |
| Dog head = iter_04 shape | **FAIL**: the baseline uses iter_09's narrower egg/pear head with the ears high on the top corners pointing up-out and the hair sitting on top like a cap. iter_04 has the broad, flatter-crowned rounded head, the ears **lower** at the upper sides and sticking out more horizontally, and the hair as a compact swept mass leaning right. Port `variants/m47_v05.mjs`'s head outline, ear placement and hair mass. |
| Dog readable at 112 | Partial pass: the nose, mouth and shock eyes are distinct. The patch eye merges in grin and laugh. |
| Nothing cut off | Raccoon: pass, the bottom edge is finished (rounded torso + tail), and the hose loop comes within about 3 px of the bottom. Dog: the suit runs off the bottom edge. That is a normal bust crop, but Ivan dislikes "cut off" busts, so finish it (shoulders with a rounded or vignetted bottom, or a lectern edge). |
| No real-person likeness | Pass. A pink cartoon dog. Keep it doggy: the more human the hair or face gets, the riskier. |
| Raccoon faces right, smirk, mask, white brows, grey fur | Pass. |

### Pump measurement (from the code and confirmed on `iter_00_hero.png`)
- **Rod:** from the handle centre (38, 25) straight down to A = (38, 58). **Vertical, 0°.**
- **Barrel:** A = (38, 58) to B = (66, 194): 28 px right over 136 px down = **11.6° clockwise from vertical.** On the
  close-up the barrel axis goes from about (255, 310) to (415, 1095) in the crop (pump region, hero x 0 to 520), which
  is 160 across over 785 down, about 11.5°. So it confirms a **kink of about 11.6° where the rod enters the top cap**.
  Visually, the chrome rod drops vertically while the yellow tube leans right.
- **T-handle:** L = (8, 27) to R = (68, 19), tilted **7.6°** (right end up). A handle perpendicular to the rod would be
  level (0°), and one perpendicular to the barrel would be 11.6°. So the handle is perpendicular to **neither**: 7.6°
  off the rod and 4.0° off the barrel. The collar is drawn vertical (on the rod).
- **Fix:** define ONE axis (handle centre H to foot F) and put every part on it: the rod, both caps, the band, the
  ribs, the gauge mount and the foot all at `lerp(H, F, t)`. Draw the handle along the unit perpendicular of (F - H),
  and draw ribs and caps perpendicular to it as well. Only the hose curves. At a lean, use an angle whose pixel
  stepping is clean (vertical, or about 1:4 / 1:3 / 1:2) so the edges don't jaggy-wobble. Also replace the
  `checker` dither rim on the barrel's shadow side, which reads as noise at 4x.

---

## 4. Top 8 changes, ranked by quality gain

1. **Real value ramps with hue shift on every material** (5 to 7 steps, new palette keys). Raccoon fur: blue-violet
   deep shadow, slate, mid grey, light grey, cool white. Mask: black with a charcoal sheen across the brow and cheek.
   Dog skin: deep mauve, rose, salmon, warm peach, a pale yellow-peach highlight. Patch: chestnut ramp. Then **model
   the forms** with those values: the brow ridge, the snout top lit, the cheeks falling away, the jowl mass, the
   forehead plane. No outline-following pillow bands.
2. **Draw the fur.** Tufted, broken edges (cheek ruffs splaying in irregular 2 to 5 px tufts, an ear fringe, white
   brow tufts breaking the head outline, a ruffled crown) and directional 2 to 4 px stroke clusters inside the mask
   border, the forehead stripe, the cheeks and the chest. Kill the sawtooth ruffs and the zigzag bib.
3. **Selective, coloured outlines.** A dark silhouette only (blue-grey on the raccoon, dark mauve on the dog). Lose it
   on lit edges. Remove the internal black seams: mask edge, muzzle, ear insides, arm seams, the dog's wrinkles and
   jowls (render those as shadow shapes plus a lit lip).
4. **Make the eyes the focal point.** Raccoon: bigger eyes, a 4-tone iris (dark under the lid, gold below), a crisp
   2 px highlight plus a 1 px secondary sparkle, a dark socket inside the mask so the iris glows. Dog: give the patch
   eye a white, a pupil and a highlight that survive at 112 (or swap so the **patch eye is the open one** and the
   plain-skin eye winks).
5. **Fix the pump as one straight rigid object and render it as a material.** One axis. The handle perpendicular to
   it. A chrome rod with a specular line. The barrel as a 5-tone cylinder (dark edge, core shadow, mid, bright
   specular stripe, reflected light). No checker dither. Reconsider its **size and colour** so it supports the face
   instead of competing with it (smaller in frame, or a less dominant hue, or overlapped by the body).
6. **Dog Fjord: iter_04 head, then model a bulldog.** The broad iter_04 silhouette with low side ears. Jowls that
   actually hang (a heavy lower mass spilling over the collar). A muzzle that pushes forward. A wet nose (blue-grey
   specular, nostril shapes). A grin with gum, an upper-lip overhang and cheeks bunching up into the eyes. Maybe a
   bulldog underbite with two lower canines for `grin`.
7. **Rebuild the raccoon's body and pose.** No sack, no tube arms. Shoulders, a chest with a fur ruff, a scarf or
   bandana hiding the neck junction (as in refs 03 and 04), paws with knuckles and pads. A pose with attitude where the
   pump is part of the gesture (see section 5). Keep a finished bottom edge.
8. **Colour harmony and one accent per character.** Light both from the same warm key, upper left, with cool
   shadows. Raccoon: an accent that complements the amber eyes (a red or teal bandana, or recolour the pump to that
   accent). Dog: rebalance the pink (warmer, desaturated in the lights, mauve shadows) and give him one strong
   accent (a red power tie, a gold pin) that is not the poster blue. Then build a separate **small-size path**
   (`c.S` < about 0.6): no wrinkle or freckle lines, simplified eyes with guaranteed whites, value shapes only.

---

## 5. Bold directions for the exploration rounds (01 to 03)

The point is range: each variant in a round should differ in **at least two** of pose, palette, costume and rendering.

### Raccoon poses
- **A. "Ref 03 close-up":** a much tighter bust. The head fills about 55 to 60% of the frame, the eyes big. The pump is
  **shouldered diagonally behind the head like a baseball bat** (the T-handle over the shoulder, one paw on the
  barrel). The pump becomes a strong diagonal frame line, not a separate tower. Diagonal = a clean straight axis.
- **B. "Mid-pump":** both paws on the T-handle pushing down. The foot of the pump stands on the bottom edge (a
  natural finished bottom), the shoulders hunched, a determined grin, the hose whipping. Pure energy, very readable
  silhouette.
- **C. "Planted like a staff / standard":** the pump planted vertically like a wizard's staff or a protest flagpole,
  the raccoon leaning on it with one elbow, smug, legs crossed. Option: a small pennant ("BIKE LANE" chevrons, no text
  needed) tied under the handle.
- **D. "Swagger lean":** the raccoon leaning back with the pump across the chest like a guitar or a rifle at port
  arms, chin up, looking down the nose at Dog Fjord. Strong attitude, a clean diagonal.

### Dog Fjord poses
- **E.** Three-quarter turn toward screen-left (facing the raccoon on VERSUS), chin up, looking down the snout. A thumb
  pointing at himself, or a podium finger-jab.
- **F.** Head sunk into broad padded shoulders, the jowls overflowing the shirt collar (a very bulldog read), the suit
  shoulders forming a wide trapezoid that finishes in a rounded vignette at the bottom.

### Palettes
- **P1. Warm-earth raccoon:** fur greys with tawny undertones (ochre-tinged lights, brown-violet shadows), like a real
  raccoon. A forest-green scarf (the ref 03 nod) and a burnt-orange pump.
- **P2. Cool/teal:** a cool steel-blue raccoon, a **red bandana** (ref 04), a teal or mint pump. Complementary
  red/teal with the amber eyes as the warm focal point.
- **P3. Poster duotone punch:** a strong magenta-pink rim light from one side and a cyan bounce from the other on
  both characters: a VERSUS fight-poster look that ties the two together.
- **Dog palettes:** (a) warmer flesh-pink with lavender shadows and a chestnut patch; (b) a paler cream-pink bulldog
  with a darker brindle patch and a navy pinstripe suit plus a red tie; (c) a sunburnt red-faced "angry politician"
  version for `shock`/`laugh`.

### Costume and props
- **Raccoon:** a cycling cap with an upturned brim (cap colour = accent), fingerless cycling gloves with padded palms
  instead of black mitts, a bandana in a bike-chain or polka-dot pattern, a reflective vest strip across the chest, a
  tiny bike-lane pictogram pin, a bike-chain necklace, a band-aid on one ear (the street fighter).
- **Dog:** a flag lapel pin, an oversized red power tie with a gold tie bar shaped like a car, a car-key fob clipped
  to the lapel, pinstripes, a pocket square, a hair sheen highlight that sells the "combed" look. Keep it cartoon-dog,
  never person-like.

### Rendering approaches
- **R1. Hand-authored pixel maps for the hero faces:** write the eyes, nose and muzzle at k = 1.5 as character-grid
  strings (each char a palette key) and stamp them. This is the closest to how ref 03 was made. Keep the procedural
  shapes for the large masses and the small sizes.
- **R2. A fur-stroke brush helper** in draw2d: `c.tufts(shape, flowFn, keys, len 2 to 4)` that places short strokes
  along a hand-set flow direction per region, clipped to the shape, with jittered (seeded) lengths. Plus an
  `edgeTufts` helper that breaks a silhouette with tapered spikes of varying size.
- **R3. Shading as hand-drawn band shapes:** for each material, draw 5 to 6 blobs of decreasing size offset toward
  the light (not inset from the outline), so light and shadow follow the form, not the edge. No per-pixel lighting
  maths, just layered shapes.
- **R4. A "chunky refs 04/05" route:** fewer but bigger clusters, a tinted outline, a strong rim light on the shadow
  side. Less detail than ref 03 but a fast route to a 7, and robust at small sizes. Worth one variant to compare
  against an R1/R2 high-detail take.

---

## Keep, don't touch (for now)
- The raccoon's half-lidded amber side-eye and the smirk curve: the character's attitude lives there.
- The facing-right three-quarter head turn of the raccoon.
- The dog's hair strand-cluster approach (3 greys, swept right): extend it, don't replace it.
- The dog's three expressions as designed (the wink grin, the laugh, the shock "O" with the startled small eyes):
  the comedy works.
- The black dog nose as a big shape, and the heart-shaped patch as an idea.
