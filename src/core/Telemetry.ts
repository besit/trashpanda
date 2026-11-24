// Anonymous play counter (1.0, Ivan: how many people play, and for how long). One Firestore document per visit,
// in the leaderboard's project: a random player number kept on this device, the seconds actually played, the
// missions done, phone or not, and the version. No names, no cookies, nothing about the person.
// Never sent from a ?debug session, an automated browser (the tests, the promo recorder) or with Do Not Track on.
// Best-effort like the leaderboard: any failure is ignored and the game carries on. Rules: docs/LEADERBOARD.md.
import { DEBUG, VERSION } from '../config';
import { LEADERBOARD } from '../data/leaderboard.config';
import { leaderboardEnabled } from './Leaderboard';

const PLAYER_KEY = 'trashpanda.player';
const TICK_S = 5;
/** counted as playing only while the tab is visible and there was input in the last 90 s (a paused, forgotten tab doesn't count) */
const IDLE_S = 90;
/** writes at these active minutes, then every 30 (about 10 writes for a whole game, inside the free tier) */
const CHECKPOINTS_MIN = [1, 2, 5, 10, 15, 20, 30, 45, 60];

export const telemetryAllowed = () => {
  if (!leaderboardEnabled() || DEBUG || typeof navigator === 'undefined' || navigator.webdriver) return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack !== '1' && n.globalPrivacyControl !== true;
};

const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function playerId(): string {
  try {
    const old = localStorage.getItem(PLAYER_KEY);
    if (old && /^[a-z0-9]{8,24}$/.test(old)) return old;
    const id = rid(); localStorage.setItem(PLAYER_KEY, id); return id;
  } catch { return rid(); } // storage blocked: count the visit, as a new player
}

/** start counting; `missions` reads how many missions the current run has done */
export function startTelemetry(missions: () => number, touch: boolean) {
  if (!telemetryAllowed()) return;
  const id = rid(), player = playerId();
  const doc = `projects/${LEADERBOARD.projectId}/databases/(default)/documents/sessions/${id}`;
  const url = `https://firestore.googleapis.com/v1/projects/${LEADERBOARD.projectId}/databases/(default)/documents:commit?key=${LEADERBOARD.apiKey}`;
  let active = 0, lastInput = performance.now(), created = false, sent = -1, lastWriteAt = 0, next = 0, busy = false;
  const m = () => Math.max(0, Math.min(13, Math.floor(missions() || 0)));

  const write = (keepalive = false) => {
    if (busy || active === sent) return;
    if (created && performance.now() - lastWriteAt < 21_000) return; // the rules take one update per 20 s
    const fields: Record<string, unknown> = { seconds: { integerValue: String(active) }, missions: { integerValue: String(m()) } };
    const transforms = [{ fieldPath: 'updated', setToServerValue: 'REQUEST_TIME' }];
    const w = created
      ? { update: { name: doc, fields }, updateMask: { fieldPaths: ['seconds', 'missions'] }, updateTransforms: transforms, currentDocument: { exists: true } }
      : { update: { name: doc, fields: { ...fields, player: { stringValue: player }, touch: { booleanValue: touch }, ver: { stringValue: VERSION } } },
        updateTransforms: [...transforms, { fieldPath: 'started', setToServerValue: 'REQUEST_TIME' }], currentDocument: { exists: false } };
    busy = true; lastWriteAt = performance.now();
    const at = active;
    fetch(url, { method: 'POST', keepalive, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ writes: [w] }) })
      .then((r) => { if (r.ok) { created = true; sent = at; } })
      .catch(() => undefined)
      .finally(() => { busy = false; });
  };

  const input = () => { lastInput = performance.now(); };
  for (const ev of ['keydown', 'pointerdown', 'touchstart']) window.addEventListener(ev, input, { passive: true, capture: true });
  const padActive = () => {
    try { return [...(navigator.getGamepads?.() ?? [])].some((p) => p && (p.buttons.some((b) => b.pressed) || p.axes.some((a) => Math.abs(a) > 0.3))); } catch { return false; }
  };

  // the first write after 5 s on the page counts the visit; then the checkpoints
  window.setTimeout(() => { if (document.visibilityState === 'visible') write(); }, 5000);
  window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (padActive()) input();
    if (performance.now() - lastInput > IDLE_S * 1000) return;
    active += TICK_S;
    const min = active / 60;
    const due = next < CHECKPOINTS_MIN.length ? CHECKPOINTS_MIN[next] : 60 + 30 * (next - CHECKPOINTS_MIN.length + 1);
    if (min >= due) { next++; write(); }
  }, TICK_S * 1000);
  // leaving or switching away: save the exact time (keepalive lets the request outlive the page)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') write(true); });
  window.addEventListener('pagehide', () => write(true));
}
