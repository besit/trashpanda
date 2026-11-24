// How many people play, and for how long: reads the anonymous play counter (src/core/Telemetry.ts).
//   node tools/stats.mjs            all visits
//   node tools/stats.mjs 7          the last 7 days
// Only reads. Each visit is one document, so a run costs one Firestore read per visit (free tier: 50,000 a day).
import { readFileSync } from 'node:fs';

const cfg = readFileSync(new URL('../src/data/leaderboard.config.ts', import.meta.url), 'utf8');
const projectId = /projectId:\s*'([^']+)'/.exec(cfg)?.[1];
const apiKey = /apiKey:\s*'([^']+)'/.exec(cfg)?.[1];
if (!projectId) { console.log('No Firebase project in src/data/leaderboard.config.ts'); process.exit(1); }
const days = Number(process.argv[2]) || 0;
const since = days ? Date.now() - days * 864e5 : 0;

const rows = [];
let token = '';
do {
  const u = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/sessions?pageSize=300&key=${apiKey}${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
  const r = await fetch(u);
  if (!r.ok) { console.log(`Firestore said ${r.status}: ${(await r.text()).slice(0, 300)}`); console.log('Are the rules in docs/LEADERBOARD.md published?'); process.exit(1); }
  const j = await r.json();
  for (const d of j.documents ?? []) {
    const f = d.fields ?? {};
    const started = Date.parse(f.started?.timestampValue ?? d.createTime);
    if (started < since) continue;
    rows.push({ player: f.player?.stringValue ?? '?', seconds: Number(f.seconds?.integerValue ?? 0), missions: Number(f.missions?.integerValue ?? 0), touch: !!f.touch?.booleanValue, ver: f.ver?.stringValue ?? '?', started });
  }
  token = j.nextPageToken ?? '';
} while (token);

if (!rows.length) { console.log(days ? `No visits in the last ${days} days.` : 'No visits yet.'); process.exit(0); }
const min = (s) => (s / 60).toFixed(1);
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const players = new Map();
for (const r of rows) { const p = players.get(r.player) ?? { seconds: 0, missions: 0, visits: 0 }; p.seconds += r.seconds; p.missions = Math.max(p.missions, r.missions); p.visits++; players.set(r.player, p); }
const P = [...players.values()];
const total = rows.reduce((a, r) => a + r.seconds, 0);

console.log(`TRASH PANDA: play counter${days ? ` (last ${days} days)` : ''}\n`);
console.log(`Visits:            ${rows.length}  (phones ${rows.filter((r) => r.touch).length}, computers ${rows.filter((r) => !r.touch).length})`);
console.log(`Players:           ${P.length}  (came back another time: ${P.filter((p) => p.visits > 1).length})`);
console.log(`Played 1+ minute:  ${P.filter((p) => p.seconds >= 60).length} players`);
console.log(`Time played:       ${(total / 3600).toFixed(1)} hours in all`);
console.log(`Per visit:         median ${min(median(rows.map((r) => r.seconds)))} min`);
console.log(`Per player:        median ${min(median(P.map((p) => p.seconds)))} min, average ${min(total / P.length)} min`);
console.log('\nHow far players got (missions done in their best run; 13 = finished):');
const buckets = [[0, 0], [1, 1], [2, 4], [5, 8], [9, 12], [13, 13]];
for (const [a, b] of buckets) {
  const n = P.filter((p) => p.missions >= a && p.missions <= b).length;
  console.log(`  ${(a === b ? `${a}` : `${a}-${b}`).padEnd(6)} ${String(n).padStart(5)}  ${'#'.repeat(Math.round((40 * n) / P.length))}`);
}
console.log('\nVisits per day (Toronto time):');
const byDay = new Map();
for (const r of rows) { const d = new Date(r.started).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }); byDay.set(d, (byDay.get(d) ?? 0) + 1); }
for (const [d, n] of [...byDay].sort().slice(-14)) console.log(`  ${d} ${String(n).padStart(5)}`);
