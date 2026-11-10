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

export function hpPreview() {
  const frames = [cherryTree(), oakTree(), ...capybaraFrames(), fence('h'), fence('v'), highParkSign(), subwayEntrance(), speedCam(), speedCam(true), schoolSign(), tspSignal(), patioSet('R'), patioSet('F'), playground(), revueMarquee(), schoolFacade()];
  return { frames, cols: 9 };
}
