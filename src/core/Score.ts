// Difficulty + score (M3.1, Ivan's M3 notes). Difficulty is chosen at NEW GAME and fixed for the run:
// it sets how many hits one life takes and multiplies every point you earn, so the same play scores more
// on a harder setting. Pure logic (no Phaser) so it can be unit-tested.
import type { GameState } from './GameState';

export type Difficulty = 'easy' | 'normal' | 'hard';
export const DIFFICULTY: Record<Difficulty, { label: string; hits: number; mult: number }> = {
  easy: { label: 'EASY', hits: 7, mult: 1 },
  normal: { label: 'NORMAL', hits: 5, mult: 1.5 },
  hard: { label: 'HARD', hits: 3, mult: 2 },
};

/** base points (before the difficulty multiplier) */
export const POINTS = {
  rat: 10,          // any rat knocked out
  suv: 25,          // an SUV Rat turned away
  piece: 30,        // a calming piece built, an asphalt patch depaved, a fence panel torn down
  rider: 20,        // a cyclist who joined the peloton
  boss: 500,        // a boss beaten
  mission: 1000,    // a mission won (first time)
  plaque: 50,       // a plaque read (first time)
  heart: 100,       // a hidden extra life found
  egg: 250,         // an easter egg found (the white squirrel, Graffiti Alley, ...)
} as const;
export type ScoreKind = keyof typeof POINTS;

export const hitsPerLife = (s: Pick<GameState, 'difficulty'>) => DIFFICULTY[s.difficulty]?.hits ?? 5;

/** add points for `n` events of a kind; returns the points actually added */
export function award(s: GameState, kind: ScoreKind, n = 1): number {
  const pts = Math.round(POINTS[kind] * n * (DIFFICULTY[s.difficulty]?.mult ?? 1));
  s.score += pts;
  return pts;
}

/** award once per flag (plaques, hearts, easter eggs): 0 if this one was already counted */
export function awardOnce(s: GameState, flag: string, kind: ScoreKind): number {
  if (s.flags[`score_${flag}`]) return 0;
  s.flags[`score_${flag}`] = true;
  return award(s, kind);
}

export const fmtScore = (n: number) => String(Math.max(0, Math.floor(n))).padStart(6, '0');

// ---------------- local high scores ----------------
export interface ScoreEntry { name: string; score: number; difficulty: Difficulty; runId: string; missions: number; date: string }
const HS_KEY = 'trashpanda.highscores';
export const HighScores = {
  load(): ScoreEntry[] {
    try { const raw = localStorage.getItem(HS_KEY); const a = raw ? JSON.parse(raw) : []; return Array.isArray(a) ? a : []; } catch { return []; }
  },
  /** one entry per run (a run's entry rises as its score does); keeps the top 10 */
  record(s: GameState) {
    if (s.score <= 0) return;
    const list = this.load().filter((e) => e.runId !== s.runId);
    list.push({ name: s.name, score: s.score, difficulty: s.difficulty, runId: s.runId, missions: s.completedMissions.length, date: new Date().toISOString().slice(0, 10) });
    list.sort((a, b) => b.score - a.score);
    try { localStorage.setItem(HS_KEY, JSON.stringify(list.slice(0, 10))); } catch { /* storage full or blocked */ }
  },
};
