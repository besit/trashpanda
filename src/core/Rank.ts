// M4.3 (game review: "replays earn nothing, so nothing pulls you back to a mission"): every mission gets a RANK when
// you win it, and the best one is kept. Fights rank on hits taken, the streetcar escort on its delay, the missions on
// the map on the time left. Replays still earn no points, but they can improve the rank.
import type { GameState } from './GameState';

export type Rank = 'S' | 'A' | 'B' | 'C';
export interface MissionRank { rank: Rank; detail: string }
const ORDER: Rank[] = ['S', 'A', 'B', 'C'];
export const RANK_COLOR: Record<Rank, number> = { S: 0xfff08a, A: 0x9bd35a, B: 0x7cc6f2, C: 0xc9c5d1 };

export const rankByHits = (hits: number): Rank => (hits === 0 ? 'S' : hits <= 2 ? 'A' : hits <= 5 ? 'B' : 'C');
export const rankByDelay = (sec: number): Rank => (sec <= 1 ? 'S' : sec <= 4 ? 'A' : sec <= 8 ? 'B' : 'C');
export const rankByTimeLeft = (frac: number): Rank => (frac >= 0.4 ? 'S' : frac >= 0.25 ? 'A' : frac >= 0.1 ? 'B' : 'C');
export const better = (a: Rank, b: Rank) => ORDER.indexOf(a) < ORDER.indexOf(b);

/** keep the best rank for a mission; reports what it was before */
export function recordRank(state: GameState, id: string, r: MissionRank): { best: MissionRank; prev?: MissionRank; newBest: boolean } {
  const prev = state.ranks[id];
  const newBest = !prev || better(r.rank, prev.rank);
  if (newBest) state.ranks[id] = r;
  return { best: state.ranks[id], prev, newBest };
}

/** the result card's rank line */
export function rankLine(r: MissionRank, rec: { prev?: MissionRank; newBest: boolean }): string {
  const tail = rec.prev ? (rec.newBest ? '  NEW BEST!' : `  BEST: ${rec.prev.rank}`) : '';
  return `RANK ${r.rank}  (${r.detail})${tail}`;
}
