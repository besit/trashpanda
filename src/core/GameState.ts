import { livability } from './Livability';
import { UPGRADES } from '../data/upgrades';

export const SAVE_VERSION = 2;
export const START_LIVES = 3, MAX_LIVES = 9;

export interface GameState {
  version: number;
  upgrades: string[];
  completedMissions: string[];
  flags: Record<string, boolean>;
  ratsDefeated: number;
  lanesAddedByDogFraud: number;
  playTimeMs: number;
  /** M2.1: lose all hearts in a mission = lose a life; extra lives are hidden on the maps */
  lives: number;
  /** M3: cyclists who joined the Bloor peloton (end-of-game stat) */
  ridersRallied: number;
  /** where the raccoon was on the map; district added in v2 (M2) */
  player: { scene: 'explore'; district: string; x: number; y: number };
}

export function newGame(): GameState {
  return {
    version: SAVE_VERSION,
    upgrades: [],
    completedMissions: [],
    flags: {},
    ratsDefeated: 0,
    lanesAddedByDogFraud: 0,
    playTimeMs: 0,
    lives: START_LIVES,
    ridersRallied: 0,
    player: { scene: 'explore', district: 'queenwest', x: -1, y: -1 },
  };
}

/** Upgrade old save shapes to the current version. Unknown/corrupt data -> null. */
export function migrate(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<GameState>;
  if (typeof s.version !== 'number' || s.version > SAVE_VERSION) return null;
  const base = newGame();
  return {
    ...base,
    ...s,
    upgrades: Array.isArray(s.upgrades) ? s.upgrades.filter((u) => typeof u === 'string' && u in UPGRADES) : [],
    completedMissions: Array.isArray(s.completedMissions) ? s.completedMissions.filter((m) => typeof m === 'string') : [],
    flags: s.flags && typeof s.flags === 'object' ? s.flags : {},
    lives: typeof s.lives === 'number' && s.lives > 0 ? Math.min(MAX_LIVES, Math.floor(s.lives)) : START_LIVES,
    // v1 saves had no district: they were always in Queen West
    player: { ...base.player, ...(s.player ?? {}), district: typeof s.player?.district === 'string' ? s.player.district : 'queenwest' },
    version: SAVE_VERSION,
  };
}

export function unlockUpgrade(state: GameState, id: string): { before: number; after: number } | null {
  if (!(id in UPGRADES) || state.upgrades.includes(id)) return null;
  const before = livability(state.upgrades);
  state.upgrades.push(id);
  return { before, after: livability(state.upgrades) };
}

export function completeMission(state: GameState, id: string, upgradeIds: string[]) {
  if (!state.completedMissions.includes(id)) state.completedMissions.push(id);
  return upgradeIds.map((u) => unlockUpgrade(state, u)).filter(Boolean);
}
