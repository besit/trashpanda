// Online leaderboard over Firestore's REST API (M3.1). No Firebase SDK: two fetch calls keep the bundle
// small. Every call is best-effort: offline, unconfigured or rejected by the rules -> it quietly does
// nothing and the game carries on with local high scores.
import { LEADERBOARD } from '../data/leaderboard.config';
import type { GameState } from './GameState';
import type { Difficulty } from './Score';

export interface OnlineEntry { name: string; score: number; difficulty: Difficulty; missions: number }

const base = () => `https://firestore.googleapis.com/v1/projects/${LEADERBOARD.projectId}/databases/(default)/documents`;
export const leaderboardEnabled = () => !!(LEADERBOARD.projectId && LEADERBOARD.apiKey);

/**
 * Write this run's entry (one document per run, id = runId). The server stamps `updated`, which the rules
 * use to rate-limit updates; the rules also only let a run's score go up.
 */
export async function submitRun(s: GameState): Promise<boolean> {
  if (!leaderboardEnabled() || s.score <= 0) return false;
  const doc = `projects/${LEADERBOARD.projectId}/databases/(default)/documents/${LEADERBOARD.collection}/${s.runId}`;
  const body = {
    writes: [{
      update: {
        name: doc,
        fields: {
          name: { stringValue: s.name },
          score: { integerValue: String(Math.floor(s.score)) },
          difficulty: { stringValue: s.difficulty },
          missions: { integerValue: String(s.completedMissions.length) },
        },
      },
      updateTransforms: [{ fieldPath: 'updated', setToServerValue: 'REQUEST_TIME' }],
    }],
  };
  try {
    const r = await fetch(`${base()}:commit?key=${LEADERBOARD.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.ok;
  } catch { return false; }
}

/** the top `n` runs, best first ([] when offline / unconfigured) */
export async function fetchTop(n = 10): Promise<OnlineEntry[]> {
  if (!leaderboardEnabled()) return [];
  const body = { structuredQuery: { from: [{ collectionId: LEADERBOARD.collection }], orderBy: [{ field: { fieldPath: 'score' }, direction: 'DESCENDING' }], limit: n } };
  try {
    const r = await fetch(`${base()}:runQuery?key=${LEADERBOARD.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return [];
    const rows = (await r.json()) as { document?: { fields: Record<string, { stringValue?: string; integerValue?: string }> } }[];
    return rows.filter((x) => x.document).map(({ document: d }) => ({
      name: d!.fields.name?.stringValue ?? '???',
      score: Number(d!.fields.score?.integerValue ?? 0),
      difficulty: (d!.fields.difficulty?.stringValue ?? 'normal') as Difficulty,
      missions: Number(d!.fields.missions?.integerValue ?? 0),
    }));
  } catch { return []; }
}
