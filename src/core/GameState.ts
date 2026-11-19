import { livability } from './Livability';
import { UPGRADES } from '../data/upgrades';
import { DIFFICULTY, type Difficulty } from './Score';
import type { MissionRank } from './Rank';

export const SAVE_VERSION = 4;
export const START_LIVES = 3, MAX_LIVES = 9;

export interface GameState {
  version: number;
  upgrades: string[];
  completedMissions: string[];
  flags: Record<string, boolean>;
  ratsDefeated: number;
  playTimeMs: number;
  /** M2.1: lose all hearts in a mission = lose a life; extra lives are hidden on the maps */
  lives: number;
  /** M3: cyclists who joined the Bloor peloton (end-of-game stat) */
  ridersRallied: number;
  /** v3 (M3.1): chosen at NEW GAME, fixed for the run (hits per life + score multiplier) */
  difficulty: Difficulty;
  /** v3: points so far (see core/Score.ts) */
  score: number;
  /** v3: arcade initials for the high-score tables */
  name: string;
  /** v3: identifies this run in the high-score tables (one entry per run) */
  runId: string;
  /** v4 (M4.3): the best rank per mission */
  ranks: Record<string, MissionRank>;
  /** where the raccoon was on the map; district added in v2 (M2) */
  player: { scene: 'explore'; district: string; x: number; y: number };
}

const newRunId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function newGame(difficulty: Difficulty = 'normal', name = 'RAC'): GameState {
  return {
    difficulty, score: 0, name, runId: newRunId(),
    version: SAVE_VERSION,
    upgrades: [],
    completedMissions: [],
    flags: {},
    ratsDefeated: 0,
    playTimeMs: 0,
    lives: START_LIVES,
    ridersRallied: 0,
    ranks: {},
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
    // v2 saves: no difficulty or score yet -> a normal run that starts scoring now
    difficulty: typeof s.difficulty === 'string' && s.difficulty in DIFFICULTY ? s.difficulty : 'normal',
    score: typeof s.score === 'number' && s.score >= 0 ? Math.floor(s.score) : 0,
    name: typeof s.name === 'string' && /^[A-Z0-9]{1,10}$/.test(s.name) ? s.name : 'RAC',
    runId: typeof s.runId === 'string' && s.runId ? s.runId : base.runId,
    // v3 saves: no ranks yet
    ranks: s.ranks && typeof s.ranks === 'object' ? Object.fromEntries(Object.entries(s.ranks).filter(([, r]) => r && /^[SABC]$/.test((r as MissionRank).rank))) : {},
    // v1 saves had no district: they were always in Queen West
    // M4.1 dropped the North district: a save standing there starts again at the Queen West spawn
    player: s.player?.district === 'north' ? { ...base.player } : { ...base.player, ...(s.player ?? {}), district: typeof s.player?.district === 'string' ? s.player.district : 'queenwest' },
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
