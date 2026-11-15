// M3.4: the island airport mission ("Grounded"). Side-view props: survey stakes to pull, the rolling suitcase
// the Baggage Rat throws, the JET TUG boss (a baggage tug towing Dog Fjord's private jet); map props for
// Little Norway Park (the Norwegian boulder + flagpole, top-down survey stakes).
import { Img } from '../lib/raster.mjs';
import { drawText } from './font.mjs';

/** a wooden survey stake with an orange ribbon, driven into the ground (side view, 14x40) */
export function surveyStake() {
  const W = 14, H = 40, img = new Img(W, H);
  img.rect(5, 6, 4, H - 8, 'X'); img.vline(5, 6, H - 3, 'j'); img.vline(8, 6, H - 3, 'x');
  img.poly([[5, 6], [9, 6], [7, 2]], 'X');                      // the pointed top... pointed end is in the ground; a chamfer up top
  img.rect(2, 10, 10, 4, 'O'); img.rect(2, 10, 10, 1, 'y');      // the ribbon
  img.poly([[12, 10], [14, 12], [12, 14]], 'O');                 // its tail flapping
  img.rect(4, H - 3, 6, 2, 'g');                                  // the ground it's driven into
  img.outline('K'); img.pivot = { x: 0.5, y: (H - 1) / H };
  return img;
}
/** the same stake seen from above on the map (6x12): the ribbon reads as an orange flag */
export function surveyStakeMap() {
  const img = new Img(10, 12);
  img.rect(4, 4, 2, 8, 'X'); img.rect(5, 0, 5, 4, 'O'); img.set(5, 1, 'y');
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}
/** a wheeled suitcase rolled along the ground (14x12, rolls to the right) */
export function suitcase() {
  const img = new Img(14, 12);
  img.rect(1, 1, 12, 8, 'U'); img.rect(1, 1, 12, 1, 'C'); img.rect(2, 3, 10, 1, 'u'); img.rect(2, 6, 10, 1, 'u');
  img.rect(5, 0, 4, 1, 'g'); img.rect(0, 4, 1, 2, 'h');          // handle + a side grip
  img.rect(2, 9, 3, 3, 'K'); img.rect(9, 9, 3, 3, 'K'); img.set(3, 10, 'G'); img.set(10, 10, 'G'); // wheels
  img.outline('K'); img.pivot = { x: 0.5, y: 1 };
  return img;
}

/**
 * The JET TUG (mission 11 boss): a small yellow baggage tug, a rat at the wheel, towing a white private jet
 * nose first. Faces right (the tug leads). Two frames: wheels and prop blur. 240x74, pivot at the bottom centre.
 */
export function jetTug(frame = 0) {
  const W = 240, H = 74, img = new Img(W, H);
  const gy = H - 4;
  // ---- the jet (x 0..178): T-tail, two rear engines, a cabin of oval windows, a pointed nose ----
  img.poly([[8, 34], [20, 26], [150, 26], [168, 30], [178, 40], [168, 50], [20, 52], [8, 46]], 'W');   // fuselage
  img.rect(20, 46, 140, 5, 'H'); img.hline(14, 160, 40, 'R'); img.hline(14, 160, 41, 'q');             // belly shade + the red cheat line
  img.poly([[8, 34], [2, 6], [20, 6], [30, 26]], 'W'); img.rect(0, 4, 32, 3, 'H'); img.rect(0, 3, 32, 1, 'W'); // T-tail
  img.hline(6, 18, 20, 'R');
  for (let x = 44; x < 140; x += 9) img.ellipse(x, 33, 2, 2, 'u');                                     // windows
  img.poly([[150, 30], [164, 31], [170, 36], [152, 36]], 'u'); img.hline(152, 164, 32, 'c');            // cockpit glass
  for (const [ex, ey] of [[26, 54], [34, 18]]) { img.ellipse(ex + 10, ey, 12, 5, 'h'); img.ellipse(ex + 10, ey, 12, 2, 'H'); img.ellipse(ex - 1, ey, 2, 4, 'K'); img.set(ex + 21, ey, 'G'); } // engines (lower one under the wing root, upper one on the tail cone)
  img.poly([[70, 48], [118, 48], [104, 60], [84, 60]], 'H'); img.hline(72, 116, 48, 'W');              // the wing root sweeping toward us
  drawText(img, 'AIR FJORD', 90, 28, 'V');
  // landing gear (nose gear under the cockpit, mains under the wing)
  for (const x of [92, 108, 158]) { img.rect(x - 1, 52, 2, 10, 'g'); img.circle(x, gy - 4, 4, 'K'); img.circle(x, gy - 4, 1, 'G'); }
  // ---- the tow bar ----
  img.rect(160, 60, 26, 2, 'G'); img.hline(160, 185, 60, 'h');
  // ---- the tug (x 184..238): yellow body, a stubby hood, a roll bar, the rat driver ----
  img.rect(186, 44, 50, 16, 'y'); img.rect(186, 44, 50, 2, 'Y'); img.rect(214, 36, 22, 10, 'y'); img.rect(214, 36, 22, 1, 'Y'); // body + hood
  img.rect(228, 40, 6, 4, 'u'); img.rect(188, 46, 24, 10, 'o');                                         // headlight, the open cab
  img.rect(188, 28, 2, 18, 'g'); img.rect(206, 28, 2, 18, 'g'); img.rect(188, 27, 20, 2, 'g');          // roll bar
  img.circle(198, 40, 5, 'x'); img.circle(195, 35, 2, 'x'); img.circle(195, 35, 1, 'P'); img.rect(201, 39, 4, 2, 'x'); img.set(205, 39, 'P'); // the rat: head, ear, snout
  img.set(199, 39, 'W'); img.set(200, 39, 'K'); img.rect(193, 33, 10, 2, 'V'); img.rect(202, 34, 3, 1, 'V'); // eye, DF cap
  img.rect(196, 46, 2, 6, 'x'); img.rect(206, 50, 8, 1, 'g');                                           // an arm on the wheel
  img.rect(236, 38, 2, 8, 'g');                                                                          // exhaust stack
  for (const x of [194, 228]) { img.circle(x, gy - 5, 6, 'K'); img.circle(x, gy - 5, 3, 'G'); img.set(x + (frame ? 2 : -2), gy - 5, 'H'); img.set(x, gy - (frame ? 3 : 7), 'H'); } // wheels
  if (frame) { img.rect(236, 32, 3, 3, 'h'); img.rect(238, 29, 2, 2, 'H'); }                           // a puff from the stack
  img.outline('K'); img.pivot = { x: 0.5, y: gy / H };
  return img;
}

/** Little Norway Park's boulder from Norway and the flagpole beside it (map prop, 3/4) */
export function norwayRock() {
  const W = 30, H = 34, img = new Img(W, H);
  img.ellipse(11, 26, 9, 6, 'G'); img.ellipse(10, 24, 8, 5, 'h'); img.ellipse(8, 22, 4, 2, 'H'); img.rect(4, 27, 14, 2, 'g'); // the boulder
  img.rect(24, 2, 2, 30, 'H'); img.vline(24, 2, 31, 'W'); img.rect(26, 3, 4, 3, 'R'); img.rect(27, 4, 2, 1, 'W'); img.set(28, 4, 'U'); // flagpole + a Norwegian flag
  img.rect(0, 31, 12, 2, 'j'); img.rect(1, 29, 10, 2, 'X');                                             // the plaque at its foot
  img.outline('K'); img.pivot = { x: 0.5, y: (H - 1) / H };
  return img;
}

export function airportPreview() {
  return { frames: [jetTug(0), jetTug(1), surveyStake(), suitcase(), surveyStakeMap(), norwayRock()], cols: 2 };
}
