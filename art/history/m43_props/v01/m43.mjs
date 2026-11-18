// M4.3 art: bike share (unbranded) for the Dock Drop mission and the city after it. A docking station seen from the
// map's 3/4 camera (a kiosk with a solar panel and a row of docked step-through bikes), the empty station base you
// set down, and the little trailer of docks the raccoon tows (E-W and N-S views).
import { Img } from '../lib/raster.mjs';

/** one docked bike, end-on to the dock bar: rear wheel low, front wheel + basket up at the bar (6 x 15) */
function dockedBike(img, x, y) {
  img.ellipse(x + 2, y + 12, 2, 3, 'K'); img.ellipse(x + 2, y + 12, 1, 2, 'g');   // rear wheel
  img.vline(x + 2, y + 4, y + 11, 'E'); img.vline(x + 3, y + 4, y + 11, 'l');       // frame
  img.rect(x, y + 6, 5, 2, 'E'); img.hline(x, x + 4, y + 6, 'L');                   // the step-through + fender
  img.ellipse(x + 2, y + 3, 2, 3, 'K'); img.ellipse(x + 2, y + 3, 1, 2, 'g');      // front wheel
  img.rect(x, y, 5, 3, 'k'); img.hline(x, x + 4, y, 'g');                           // the basket
}

/** a docking station: kiosk + 4 bikes on a concrete base; 46 x 26, anchored at its base */
export function shareDock(bikes = 4) {
  const W = 46, H = 26, img = new Img(W, H);
  img.rect(0, H - 7, W, 7, 'H'); img.hline(0, W - 1, H - 7, 'W'); img.hline(0, W - 1, H - 1, 'S');   // the base slab
  img.rect(10, H - 18, W - 12, 2, 'g'); img.hline(10, W - 3, H - 18, 'G');                             // the dock bar
  for (let i = 0; i < 4; i++) { const x = 12 + i * 8; img.rect(x + 1, H - 16, 3, 3, 'k'); if (i < bikes) dockedBike(img, x, H - 21); }
  // the kiosk: a dark pillar with a screen, a small solar panel on top
  img.rect(2, H - 22, 6, 17, 'k'); img.rect(3, H - 21, 4, 15, 'g'); img.rect(3, H - 17, 4, 3, 'C'); img.set(4, H - 16, 'i');
  img.rect(0, H - 25, 10, 3, 'u'); img.hline(0, 9, H - 25, 'c'); img.vline(5, H - 23, H - 22, 'G');
  img.outline('K'); img.pivot = { x: 0.5, y: (H - 2) / H };
  return img;
}

/** the trailer behind the raccoon: a two-wheeled cart with folded docks strapped on */
export function dockTrailer(view) {
  if (view === 'ew') { // seen from the side, hitch to the right (flipped for westbound)
    const W = 22, H = 14, img = new Img(W, H);
    img.rect(1, 4, 16, 6, 'G'); img.hline(1, 16, 4, 'h');
    for (let i = 0; i < 3; i++) { img.rect(2 + i * 5, 0, 4, 5, 'E'); img.hline(2 + i * 5, 5 + i * 5, 0, 'L'); }
    img.hline(1, 16, 2, 'y');                                   // the strap
    img.thick(17, 8, 21, 8, 'k', 1);                            // the hitch bar
    img.circle(5, 11, 2, 'K'); img.circle(13, 11, 2, 'K'); img.set(5, 11, 'g'); img.set(13, 11, 'g');
    img.outline('K'); img.pivot = { x: 0.5, y: 0.85 };
    return img;
  }
  const W = 16, H = 18, img = new Img(W, H); // seen end-on (hitch toward the top: flipped for southbound)
  img.rect(2, 5, 12, 9, 'G'); img.hline(2, 13, 5, 'h');
  for (let i = 0; i < 2; i++) { img.rect(3 + i * 5, 2, 4, 7, 'E'); img.hline(3 + i * 5, 6 + i * 5, 2, 'L'); }
  img.vline(8, 0, 4, 'k');                                      // the hitch bar
  img.rect(0, 12, 2, 5, 'K'); img.rect(14, 12, 2, 5, 'K');      // wheels
  img.outline('K'); img.pivot = { x: 0.5, y: 0.85 };
  return img;
}

export function m43Preview() {
  return { frames: [shareDock(4), shareDock(2), shareDock(0), dockTrailer('ew'), dockTrailer('ns')], cols: 5 };
}
