// High Park / Roncesvalles art + small street props added in M2 (map 3/4 view).
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { tree } from './props.mjs';
import { BRICKS, brickWall, sashWindow } from './buildings.mjs';

/** High Park's cherry trees (Sakura, by Grenadier Pond) and big black oaks (the oak savanna). */
export const cherryTree = (seed = 7) => tree(seed, 1.05, ['p', 'P', 'm', 'M']);
export const oakTree = (seed = 9) => tree(seed, 1.35, ['K', 'e', 'E', 'l']);

/** Capybara (3/4 view, facing right): 2 walk frames + a sitting loaf. ~18x12 */
export function capybaraFrames() {
  // v02: blunt square head with ear, eye and nose (v01 read as a loaf)
  const grids = [
    '..............KK....|....KKKKKKKKKKxxK...|...KxXXXXXXXXXXXKKK.|..KxXXXXXXXXXXXXXXXK|.KxXXXXXXXXXXXXKXXjK|.KxXXXXXXXXXXXXXXXXK|.KxxXXXXXXXXXXXXXwjK|.KxxxxxxxxxxxXXXKKK.|..KKxKKKKKKxKKKK....|...KK.....KK........',
    '..............KK....|....KKKKKKKKKKxxK...|...KxXXXXXXXXXXXKKK.|..KxXXXXXXXXXXXXXXXK|.KxXXXXXXXXXXXXKXXjK|.KxXXXXXXXXXXXXXXXXK|.KxxXXXXXXXXXXXXXwjK|.KxxxxxxxxxxxXXXKKK.|..KKKxKKKKKKxKKK....|....KK.....KK.......',
    '..............KK....|....KKKKKKKKKKxxK...|...KxXXXXXXXXXXXKKK.|..KxXXXXXXXXXXXXXXXK|.KxXXXXXXXXXXXXKXXjK|.KxXXXXXXXXXXXXXXXXK|.KxxXXXXXXXXXXXXXwjK|.KxxxxxxxxxxxXXXKKK.|..KKKKKKKKKKKKKK....',
  ];
  return grids.map((g) => { const im = Img.fromGrid(g.split('|').join(String.fromCharCode(10))); im.pivot = { x: 0.5, y: 1 }; return im; });
}

/** Zoo / park rail fence pieces (one tile long). */
export function fence(dir = 'h') {
  if (dir === 'h') {
    const im = Img.fromGrid(`
KK......KK......
KxKKKKKKxKKKKKKK
KXXXXXXXXXXXXXXX
KxKKKKKKxKKKKKKK
KXXXXXXXXXXXXXXX
KxK.....KxK.....
KKK.....KKK.....`);
    im.pivot = { x: 0, y: 1 };
    return im;
  }
  const im = Img.fromGrid(`
KK.
KxK
KXK
KxK
KXK
KxK
KXK
KxK
KXK
KxK
KXK
KxK
KXK
KxK
KXK
KxK
KXK
KKK`);
  im.pivot = { x: 0.5, y: 1 };
  return im;
}

/** The brown wooden HIGH PARK sign at the Bloor gate. */
export function highParkSign() {
  const im = new Img(48, 24);
  im.rect(6, 12, 2, 12, 'w'); im.rect(40, 12, 2, 12, 'w');
  im.rect(1, 2, 46, 13, 'x'); im.rect(2, 3, 44, 11, 'X'); im.hline(2, 45, 3, 'j');
  const G = { H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'], G: ['###', '#..', '#.#', '#.#', '###'], P: ['##.', '#.#', '##.', '#..', '#..'], A: ['.#.', '#.#', '###', '#.#', '#.#'], R: ['##.', '#.#', '##.', '#.#', '#.#'], K: ['#.#', '##.', '#..', '##.', '#.#'] };
  let x = 4;
  for (const ch of 'HIGH PARK') { if (ch === ' ') { x += 3; continue; } const g = G[ch]; for (let y = 0; y < 5; y++) for (let i = 0; i < 3; i++) if (g[y][i] === '#') im.set(x + i, 6 + y, 'W'); x += 4; }
  im.outline('K');
  im.pivot = { x: 0.5, y: 1 };
  return im;
}

/** TTC subway entrance pavilion (glass box, red TTC roundel on top). */
export function subwayEntrance() {
  const im = new Img(30, 30);
  im.rect(2, 8, 26, 4, 'H'); im.hline(2, 27, 8, 'W'); // roof slab
  im.rect(3, 12, 24, 16, 'u'); for (let x = 3; x < 27; x += 4) im.vline(x, 12, 27, 'g');
  for (let x = 4; x < 26; x++) if (x % 7 < 2) im.vline(x, 13, 26, 'U');
  im.rect(11, 16, 8, 12, 'k'); im.rect(12, 17, 6, 11, 'U');
  im.circle(15, 4, 4, 'R'); im.circle(15, 4, 4, 'K', false); im.hline(13, 17, 4, 'W'); im.vline(15, 2, 6, 'W');
  im.vline(15, 7, 8, 'G');
  im.outline('K');
  im.pivot = { x: 0.5, y: 28 / 30 };
  return im;
}

/** Speed camera on its pole (Parkside Drive) and the cut stump the rats leave behind. */
export function speedCam(cut = false) {
  const im = new Img(18, 40);
  if (cut) {
    im.rect(7, 30, 4, 8, 'G'); im.hline(7, 10, 30, 'h'); im.set(8, 29, 'h'); im.set(10, 29, 'H');
    im.ellipse(9, 38, 5, 1, 'g');
    im.outline('K'); im.pivot = { x: 0.5, y: 38 / 40 }; return im;
  }
  im.rect(8, 10, 2, 28, 'G'); im.vline(8, 10, 37, 'h');
  im.rect(3, 4, 12, 9, 'h'); im.rect(3, 4, 12, 2, 'H'); im.rect(3, 11, 12, 2, 'G');
  im.circle(6, 8, 2, 'k'); im.set(6, 8, 'c'); im.rect(10, 7, 4, 3, 'k'); im.set(12, 8, 'R');
  im.rect(4, 15, 10, 6, 'W'); im.rect(5, 16, 8, 1, 'K'); im.rect(5, 18, 8, 1, 'K'); // PHOTO ENFORCED sign
  im.ellipse(9, 38, 4, 1, 'g');
  im.outline('K');
  im.pivot = { x: 0.5, y: 38 / 40 };
  return im;
}

/** Yellow pentagon school-zone sign. */
export function schoolSign() {
  const im = Img.fromGrid(`
...KKK...
..KyyyK..
.KyyKyyK.
KyyKKKyyK
KyKyKyKyK
KyyKyKyyK
KyyyyyyyK
KKKKKKKKK
....g....
....g....
....g....
....g....
....g....`);
  im.pivot = { x: 0.5, y: 1 };
  return im;
}

/** Transit signal priority head: the white vertical bar signal TTC streetcars get. */
export function tspSignal() {
  const im = Img.fromGrid(`
.KKKK.
KkkkkK
KkWWkK
KkWWkK
KkWWkK
KkkkkK
KkggkK
KkkkkK
.KKKK.
..Kg..
..Kg..
..Kg..
..Kg..
..Kg..
..Kg..
..Kg..
..Kg..
..Kg..
..Kg..
.KKKK.`);
  im.pivot = { x: 0.5, y: 1 };
  return im;
}

/** Patio set for King St's parklets: table, two chairs, a striped umbrella. */
export function patioSet(col = 'R') {
  const im = new Img(22, 26);
  const c2 = col === 'R' ? 'W' : col === 'F' ? 'W' : 'Y';
  for (let x = 0; x < 22; x++) { const h = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 10.5) / 11) ** 2)) * 6); for (let y = 6 - h; y <= 7; y++) im.set(x, y + 1, Math.floor(x / 3) % 2 ? col : c2); }
  im.vline(10, 8, 20, 'g');
  im.ellipse(10, 19, 6, 2, 'H'); im.hline(5, 15, 21, 'G');
  im.rect(1, 18, 3, 5, 'x'); im.rect(17, 18, 3, 5, 'x'); im.vline(1, 14, 18, 'x'); im.vline(19, 14, 18, 'x');
  im.outline('K');
  im.pivot = { x: 0.5, y: 24 / 26 };
  return im;
}

/** Playground: climbing frame with a red slide and a yellow swing. */
export function playground() {
  const im = new Img(44, 32);
  im.rect(4, 8, 2, 22, 'U'); im.rect(18, 8, 2, 22, 'U'); im.rect(4, 8, 16, 3, 'c'); im.rect(5, 16, 14, 2, 'x');
  im.poly([[20, 16], [24, 16], [38, 28], [34, 28]], 'R'); im.line(20, 15, 36, 27, 'q');
  im.rect(26, 4, 2, 26, 'G'); im.rect(40, 4, 2, 26, 'G'); im.rect(26, 4, 16, 2, 'h');
  im.vline(31, 6, 20, 'g'); im.vline(36, 6, 20, 'g'); im.rect(30, 20, 8, 2, 'y');
  im.outline('K');
  im.pivot = { x: 0.5, y: 30 / 32 };
  return im;
}

/** The Revue Cinema's marquee (Roncesvalles, opened 1912), hung on a shop facade at map-build. */
export function revueMarquee() {
  const im = new Img(40, 14);
  im.rect(0, 2, 40, 9, 'W'); im.rect(1, 3, 38, 7, 'R');
  for (let x = 1; x < 39; x += 2) { im.set(x, 2, 'Y'); im.set(x + 1, 10, 'Y'); }
  const G = { R: ['##.', '#.#', '##.', '#.#'], E: ['###', '##.', '#..', '###'], V: ['#.#', '#.#', '#.#', '.#.'], U: ['#.#', '#.#', '#.#', '###'] };
  let x = 9;
  for (const ch of 'REVUE') { const g = G[ch]; for (let y = 0; y < 4; y++) for (let i = 0; i < 3; i++) if (g[y][i] === '#') im.set(x + i, 5 + y, 'W'); x += 5; }
  im.vline(6, 11, 13, 'g'); im.vline(33, 11, 13, 'g');
  im.outline('K');
  im.pivot = { x: 0.5, y: 1 };
  return im;
}

/** A red-brick public school: two storeys of big windows, stone entrance with a lintel, flagpole. */
export function schoolFacade({ w = 96, floors = 2, seed = 1 } = {}) {
  const r = rng(seed);
  const b = BRICKS.red;
  const floorH = 16, groundH = 22, cornice = 5;
  const h = cornice + floors * floorH + groundH;
  const img = new Img(w, h);
  brickWall(img, 0, 0, w, h, b, r, false);
  img.rect(0, 0, w, 4, 'T'); img.hline(0, w - 1, 4, 'k');
  const n = Math.round(w / 12);
  for (let f = 0; f < floors + 1; f++) {
    const fy = cornice + f * floorH + 3;
    for (let k = 0; k < n; k++) {
      const cx = Math.round(((k + 0.5) * w) / n - 4);
      if (f === floors && Math.abs(cx + 4 - w / 2) < 12) continue;
      sashWindow(img, cx, fy, 8, 10, { lit: false, curtain: r.chance(0.25) ? r.pick(['y', 'L', 'C', 'P']) : null });
      if (f < floors && r.chance(0.35)) img.rect(cx + 1, fy + 6, 6, 2, r.pick(['R', 'y', 'F', 'L'])); // kids' art in the windows
    }
  }
  // entrance block with stone surround and lintel
  const ex = Math.round(w / 2 - 10), ey = cornice + floors * floorH;
  img.rect(ex, ey - 4, 20, groundH + 4, 'T'); img.rect(ex + 2, ey - 2, 16, 4, 'H');
  for (let i = ex + 4; i < ex + 16; i += 2) img.set(i, ey, 'g'); // carved lettering
  img.rect(ex + 4, ey + 4, 12, groundH - 4, 'k'); img.rect(ex + 5, ey + 5, 4, groundH - 5, 'U'); img.rect(ex + 11, ey + 5, 4, groundH - 5, 'U');
  return img;
}

// ---------------------------------------------------------------- M2.1 additions

/** Mute swan on the water, 2 frames (a gentle paddle + ripple). ~16x13, facing right. */
export function swanFrames() {
  const g = [`
.........KK.....
........KWWK....
........KWOK....
........KWKyK...
........KWK.....
.......KWWK.....
..KKKKKWWK......
.KWWWWWWWWK.....
KWWHWWWWWWWK....
KHWHHWWWWWHK....
.KHHHHHHHHK.....
..KKKKKKKK......`, `
.........KK.....
........KWWK....
........KWOK....
........KWKyK...
........KWK.....
.......KWWK.....
..KKKKKWWK......
.KWWWWWWWWK.....
KWWHWWWWWWWK....
KHWHHWWWWWHK....
.KHHHHHHHHK.....
...KKKKKKKK.....`];
  return g.map((s, i) => { const im = Img.fromGrid(s); const o = new Img(im.w, im.h + 2); o.blit(im, 0, 0); o.hline(1 + i, 11 + i, im.h + 1, 'C'); o.pivot = { x: 0.5, y: (im.h) / (im.h + 2) }; return o; });
}

/** Wood duck drake: green crest, red eye, white face stripes, chestnut breast. 2 frames, ~11x8. */
export function woodDuckFrames() {
  const g = [`
.....KKK...
....KEEEKK.
...KEWRELyK
...KEKWEKK.
.KKKBBEEK..
KXXXBBBnK..
KxXXXXnnK..
.KKKKKKK...`, `
.....KKK...
....KEEEKK.
...KEWRELyK
...KEKWEKK.
.KKKBBEEK..
KXXXBBBnK..
KxXXXXnnK..
..KKKKKKK..`];
  return g.map((s, i) => { const im = Img.fromGrid(s); const o = new Img(im.w, im.h + 2); o.blit(im, 0, 0); o.hline(i, 8 + i, im.h + 1, 'C'); o.pivot = { x: 0.5, y: im.h / (im.h + 2) }; return o; });
}

/** The Jamie Bell Adventure Playground: a wooden castle of towers, ramps and bridges. ~100x62 */
export function adventurePlayground() {
  const W = 104, H = 64, img = new Img(W, H);
  const tower = (x, w, top, roof) => {
    img.rect(x, top, w, H - 4 - top, 'x');
    for (let y = top + 2; y < H - 4; y += 3) img.hline(x, x + w - 1, y, 'w');     // plank courses
    for (let xx = x + 2; xx < x + w - 1; xx += 5) img.vline(xx, top + 1, H - 5, 'X');
    img.rect(x + 2, top + 4, w - 4, 4, 'k');                                    // a lookout window
    img.poly([[x - 2, top], [x + w / 2, top - roof], [x + w + 2, top]], 'R');    // pointed turret roof
    img.poly([[x + w / 2, top - roof], [x + w + 2, top], [x + w / 2, top]], 'r');
    img.vline(Math.round(x + w / 2), top - roof - 4, top - roof, 'g'); img.rect(Math.round(x + w / 2), top - roof - 4, 4, 2, 'y'); // a flag
  };
  tower(4, 18, 20, 14); tower(40, 22, 12, 16); tower(80, 18, 24, 12);
  // rope bridges between the towers
  for (const [a, b, y0] of [[22, 40, 30], [62, 80, 32]]) for (let x = a; x <= b; x++) { const y = Math.round(y0 + Math.sin(((x - a) / (b - a)) * Math.PI) * 3); img.set(x, y, 'X'); img.set(x, y - 4, 'w'); if (x % 3 === 0) img.vline(x, y - 4, y, 'w'); }
  // a big yellow tube slide off the middle tower, a climbing net on the left
  for (let t = 0; t < 1; t += 0.02) { const x = Math.round(62 + t * 30), y = Math.round(20 + t * t * 38); img.rect(x, y, 4, 4, 'y'); img.set(x + 1, y, 'Y'); }
  for (let y = 30; y < H - 4; y += 4) img.hline(0, 6, y, 'G'); for (let x = 0; x < 7; x += 3) img.vline(x, 30, H - 5, 'G');
  img.rect(0, H - 4, W, 4, 'X'); // wood chips
  img.outline('K');
  img.pivot = { x: 0.5, y: (H - 2) / H };
  return img;
}

/** The Grenadier Cafe: a low lodge with a big window wall and a green roof sign. Facade only (3/4 via anyBuilding). */
export function cafeFacade(w = 80) {
  const h = 24, img = new Img(w, h);
  img.rect(0, 0, w, h, 'X'); for (let y = 2; y < h; y += 3) img.hline(0, w - 1, y, 'x'); // timber siding
  img.rect(0, 0, w, 5, 'E'); img.hline(0, w - 1, 5, 'e');
  for (let x = 6; x < w - 20; x += 4) img.set(x, 2, 'W'); // CAFE sign lettering
  img.rect(4, 8, w - 26, 13, 'u'); for (let x = 4; x < w - 22; x += 8) img.vline(x, 8, 20, 'K');
  for (let x = 6; x < w - 24; x++) if ((x + 9) % 9 < 2) img.vline(x, 9, 19, 'U');
  img.rect(w - 18, 9, 9, 15, 'K'); img.rect(w - 17, 10, 7, 14, 'x'); img.set(w - 11, 16, 'y');
  return img;
}

/** The High Park greenhouse: white frame + glass panes, a curved glass roof. Facade only. */
export function greenhouseFacade(w = 80) {
  const h = 26, img = new Img(w, h);
  img.rect(0, 0, w, h, 'C');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x + y) % 7 === 0) img.set(x, y, 'i');
  for (let x = 0; x < w; x += 6) img.vline(x, 0, h - 1, 'W');
  for (let y = 0; y < h; y += 8) img.hline(0, w - 1, y, 'W');
  for (let x = 2; x < w - 2; x += 5) img.rect(x, h - 6, 3, 5, 'l'); // plants inside
  img.rect(w / 2 - 5, h - 12, 10, 12, 'W'); img.rect(w / 2 - 4, h - 11, 8, 11, 'c');
  return img;
}

/** a flower bed tile pattern for Hillside Gardens is in tiles.mjs ('flowerbed') */

export function hpPreview() {
  const frames = [...swanFrames(), ...woodDuckFrames(), adventurePlayground(), cafeFacade(), greenhouseFacade(), cherryTree(), oakTree(), ...capybaraFrames(), fence('h'), fence('v'), highParkSign(), subwayEntrance(), speedCam(), speedCam(true), schoolSign(), tspSignal(), patioSet('R'), patioSet('F'), playground(), revueMarquee(), schoolFacade()];
  return { frames, cols: 9 };
}
