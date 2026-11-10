// One entry point for every building kind used on the maps (keeps the generators free of import cycles).
import { Img } from '../lib/raster.mjs';
import { rng } from '../lib/rng.mjs';
import { obliqueBuilding, roof } from './buildings.mjs';
import { downtownBuilding, oldCityHall } from './downtown.mjs';
import { schoolFacade } from './highpark.mjs';

export function anyBuilding(gen) {
  if (gen.kind === 'tower' || gen.kind === 'warehouse') return downtownBuilding(gen);
  if (gen.kind === 'oldcityhall') return oldCityHall(gen.w, gen.d);
  if (gen.kind === 'school') {
    const fac = schoolFacade({ w: gen.w, floors: gen.floors, seed: gen.seed });
    const rf = roof(gen.w, gen.d, rng(gen.seed), 'school');
    const img = new Img(gen.w, gen.d + fac.h);
    img.blit(rf, 0, 0); img.blit(fac, 0, gen.d); img.hline(0, gen.w - 1, gen.d, 'K');
    return { img, footprint: { w: gen.w, d: gen.d }, facadeH: fac.h };
  }
  return obliqueBuilding(gen);
}
