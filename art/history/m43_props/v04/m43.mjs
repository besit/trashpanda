// M4.3 art: bike share (unbranded) for the Dock Drop mission and the city after it. A docking station seen from the
// map's 3/4 camera (a kiosk with a solar panel and a row of docked step-through bikes), the empty station base you
// set down, and the little trailer of docks the raccoon tows (E-W and N-S views).
import { Img } from '../lib/raster.mjs';

/** one docked bike in side profile, front to the right (the rack is seen from the side): 15 x 10 */
function dockedBike(img, x, y) {
  img.circle(x + 3, y + 7, 3, 'K', false); img.circle(x + 11, y + 7, 3, 'K', false);   // wheels
  img.set(x + 3, y + 7, 'g'); img.set(x + 11, y + 7, 'g');
  // M4.4 (Ivan): orange share bikes
  img.line(x + 3, y + 7, x + 6, y + 3, 'o'); img.line(x + 6, y + 7, x + 10, y + 4, 'O');   // step-through frame
  img.line(x + 3, y + 7, x + 6, y + 7, 'o'); img.line(x + 10, y + 3, x + 11, y + 7, 'o');
  img.hline(x + 1, x + 5, y + 4, 'd'); img.hline(x + 9, x + 13, y + 4, 'd');                // fenders
  img.hline(x + 5, x + 7, y + 2, 'k');                                                     // saddle
  img.vline(x + 10, y + 1, y + 3, 'G'); img.rect(x + 11, y + 1, 4, 3, 'k'); img.hline(x + 11, x + 14, y + 1, 'g'); // bars + basket
}

/** a docking station: kiosk + a rack of three bikes on a concrete base; 48 x 24, anchored at its base. No global
 *  outline: it filled the gaps in the thin frames and turned the bikes into a black clump */
export function shareDock(bikes = 3) {
  const W = 48, H = 24, img = new Img(W, H);
  img.rect(0, H - 6, W, 6, 'K'); img.rect(1, H - 5, W - 2, 4, 'H'); img.hline(1, W - 2, H - 5, 'W'); img.hline(1, W - 2, H - 2, 'S'); // the base slab
  for (let i = 0; i < 3; i++) { const x = 12 + i * 12; img.rect(x + 11, H - 12, 2, 7, 'k'); img.set(x + 11, H - 12, 'G'); }        // dock posts
  for (let i = 0; i < Math.min(3, bikes); i++) dockedBike(img, 11 + i * 12, H - 15);
  // the kiosk: a dark pillar with a screen, a small solar panel on top
  img.rect(1, H - 22, 8, 18, 'K'); img.rect(2, H - 21, 6, 16, 'k'); img.rect(3, H - 20, 4, 15, 'g'); img.rect(3, H - 16, 4, 3, 'C'); img.set(4, H - 15, 'i');
  img.rect(0, H - 24, 10, 3, 'K'); img.rect(1, H - 24, 8, 2, 'u'); img.hline(1, 8, H - 24, 'c');
  img.pivot = { x: 0.5, y: (H - 2) / H };
  return img;
}

/** the trailer behind the raccoon: a two-wheeled cart with folded docks strapped on */
export function dockTrailer(view) {
  if (view === 'ew') { // seen from the side, hitch to the right (flipped for westbound)
    const W = 22, H = 14, img = new Img(W, H);
    img.rect(1, 4, 16, 6, 'G'); img.hline(1, 16, 4, 'h');
    for (let i = 0; i < 3; i++) { img.rect(2 + i * 5, 0, 4, 5, 'o'); img.hline(2 + i * 5, 5 + i * 5, 0, 'O'); }
    img.hline(1, 16, 2, 'y');                                   // the strap
    img.thick(17, 8, 21, 8, 'k', 1);                            // the hitch bar
    img.circle(5, 11, 2, 'K'); img.circle(13, 11, 2, 'K'); img.set(5, 11, 'g'); img.set(13, 11, 'g');
    img.outline('K'); img.pivot = { x: 0.5, y: 0.85 };
    return img;
  }
  const W = 16, H = 18, img = new Img(W, H); // seen end-on (hitch toward the top: flipped for southbound)
  img.rect(2, 5, 12, 9, 'G'); img.hline(2, 13, 5, 'h');
  for (let i = 0; i < 2; i++) { img.rect(3 + i * 5, 2, 4, 7, 'o'); img.hline(3 + i * 5, 6 + i * 5, 2, 'O'); }
  img.vline(8, 0, 4, 'k');                                      // the hitch bar
  img.rect(0, 12, 2, 5, 'K'); img.rect(14, 12, 2, 5, 'K');      // wheels
  img.outline('K'); img.pivot = { x: 0.5, y: 0.85 };
  return img;
}

export function m43Preview() {
  return { frames: [shareDock(3), shareDock(1), shareDock(0), dockTrailer('ew'), dockTrailer('ns')], cols: 5 };
}
