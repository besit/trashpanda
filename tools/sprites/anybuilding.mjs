// One entry point for every building kind used on the maps (keeps the generators free of import cycles).
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { obliqueBuilding, roof } from './buildings.mjs';
import { downtownBuilding, oldCityHall } from './downtown.mjs';
import { schoolFacade, cafeFacade, greenhouseFacade } from './highpark.mjs';
import { bigBoxFacade, broadviewFacade } from './eastend.mjs';
import { megaSpaFacade } from './waterfront.mjs';

export function anyBuilding(gen) {
  if (gen.kind === 'tower' || gen.kind === 'warehouse') return downtownBuilding(gen);
  if (gen.kind === 'oldcityhall') return oldCityHall(gen.w, gen.d);
  if (['school', 'cafe', 'greenhouse', 'bigbox', 'broadview', 'megaspa'].includes(gen.kind)) {
    const fac = gen.kind === 'school' ? schoolFacade({ w: gen.w, floors: gen.floors, seed: gen.seed }) : gen.kind === 'cafe' ? cafeFacade(gen.w) : gen.kind === 'greenhouse' ? greenhouseFacade(gen.w) : gen.kind === 'bigbox' ? bigBoxFacade(gen.w) : gen.kind === 'megaspa' ? megaSpaFacade(gen.w) : broadviewFacade(gen.w);
    const rf = roof(gen.w, gen.d, rng(gen.seed), 'school');
    if (gen.kind === 'greenhouse') { // a glass roof: pale panes on a white grid
      rf.rect(0, 0, gen.w, gen.d, 'C');
      for (let x = 0; x < gen.w; x += 6) rf.vline(x, 0, gen.d - 1, 'W');
      for (let y = 0; y < gen.d; y += 5) rf.hline(0, gen.w - 1, y, 'i');
    } else if (gen.kind === 'megaspa') { rf.rect(0, 0, gen.w, gen.d, 'P'); for (let x = 4; x < gen.w; x += 10) rf.rect(x, 4, 6, gen.d - 8, 'C'); } // pink roof, rooftop pools
    else if (gen.kind === 'cafe') { rf.rect(0, 0, gen.w, gen.d, 'e'); for (let y = 0; y < gen.d; y += 3) rf.hline(0, gen.w - 1, y, 'E'); }
    const img = new Img(gen.w, gen.d + fac.h);
    img.blit(rf, 0, 0); img.blit(fac, 0, gen.d); img.hline(0, gen.w - 1, gen.d, 'K');
    return { img, footprint: { w: gen.w, d: gen.d }, facadeH: fac.h };
  }
  return obliqueBuilding(gen);
}
