import { BASE_CATEGORIES, UPGRADES, type Category } from '../data/upgrades';

export const START_LIVABILITY = 60;

export const TIERS: { min: number; name: string }[] = [
  { min: 100, name: 'RACCOON UTOPIA' },
  { min: 90, name: 'AMSTERDAM/COPENHAGEN TERRITORY' },
  { min: 80, name: 'WORLD-CLASS TORONTO' },
  { min: 75, name: 'EXCELLENT TORONTO' },
  { min: 70, name: 'GREAT TORONTO' },
  { min: 65, name: 'BETTER TORONTO' },
  { min: 0, name: 'TORONTO' },
];

export function livability(upgrades: readonly string[]): number {
  const sum = upgrades.reduce((s, id) => s + (UPGRADES[id]?.livability ?? 0), START_LIVABILITY);
  return Math.max(0, Math.min(100, sum));
}

export function tierName(score: number): string {
  return TIERS.find((t) => score >= t.min)!.name;
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
