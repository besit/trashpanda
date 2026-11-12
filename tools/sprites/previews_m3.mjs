// Art-history previews for M3's side views (East End lot, the waterfront promenade).
import { Img } from '../lib/raster.mjs';
import { sky, skyline, streetStrip } from './sidebg.mjs';
import { bigBoxStrip } from './eastend.mjs';
import { lakeStrip, spaFenceSide } from './waterfront.mjs';

const VW = 384, VH = 216, STREET_Y = 150;
export function sideBgM3Preview() {
  const lot = new Img(VW, VH); lot.blit(sky('day'), 0, 0); lot.blit(skyline('day'), -150, 12); lot.blit(bigBoxStrip(), 0, STREET_Y - 120); for (let x = 0; x < VW; x += 64) lot.blit(streetStrip('lot'), x, STREET_Y);
  const quay = new Img(VW, VH); quay.blit(sky('dusk'), 0, 0); quay.blit(skyline('dusk'), -150, 12); quay.blit(lakeStrip(), 0, STREET_Y - 120); for (let x = 0; x < VW; x += 64) quay.blit(streetStrip('quay'), x, STREET_Y);
  for (const x of [90, 200, 310]) { const f = spaFenceSide(); quay.blit(f, x - 17, STREET_Y + 20 - f.h); }
  return { frames: [lot, quay], cols: 2 };
}
