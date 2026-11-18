import { BASE_CATEGORIES, UPGRADES, type Category } from '../data/upgrades';

export const START_LIVABILITY = 60;

// M4.3 (Ivan): no tier names comparing Toronto to other cities ("Amsterdam/Copenhagen territory" oversold a city
// whose streets the game hadn't changed that much). The score is out of 100, and the HUD shows how much of the
// bike network is done (src/data/network.ts) beside it.

export function livability(upgrades: readonly string[]): number {
  const sum = upgrades.reduce((s, id) => s + (UPGRADES[id]?.livability ?? 0), START_LIVABILITY);
  return Math.max(0, Math.min(100, sum));
}


export function categories(upgrades: readonly string[]): Record<Category, number> {
  const out = { ...BASE_CATEGORIES };
  for (const id of upgrades) {
    const u = UPGRADES[id];
    if (!u) continue;
    for (const [k, v] of Object.entries(u.categories) as [Category, number][]) out[k] = Math.min(100, out[k] + v);
  }
  return out;
}

import type { EndStats } from '../data/upgrades';
/** M4: the ending's numbers, summed from each unlocked upgrade's `stat` */
export function endStats(upgrades: readonly string[]): EndStats {
  const out: EndStats = { bikeLanes: 0, protectedIntersections: 0, parksCreated: 0, transitUpgrades: 0, treesPlanted: 0, lanesRemoved: 0 };
  for (const id of upgrades) { const st = UPGRADES[id]?.stat; if (st) out[st.key] += st.amount; }
  return out;
}
