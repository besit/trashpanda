// Every song the shoots played, rendered on its own from its first note (1.0). cut.mjs lays one of them under each
// whole video (its TRACKS), so the music runs on across the cuts instead of jumping with every clip.
//   node tools/promo/songs.mjs        (after the shoots; PROMO_BASE: a build served by vite preview, see the README)
// -> promo/raw/songs/<name>@<bpm>_<transpose>.f32 (48 kHz mono float), sample 0 = the song's first step
import { readdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { Rec, BASE, OUT } from './rec.mjs';

const LEN_S = 64;
export const songKey = (e) => `${e.name}@${e.bpm}_${e.transpose ?? 0}`;

const keys = new Map();
for (const d of readdirSync(OUT)) {
  const f = `${OUT}/${d}/shots.json`;
  if (d === 'songs' || !existsSync(f)) continue;
  for (const s of JSON.parse(readFileSync(f, 'utf8'))) for (const e of s.music ?? []) if (e.name) keys.set(songKey(e), e);
}
const only = process.argv.slice(2);
for (const [key, e] of keys) {
  if (only.length && !only.includes(key)) continue;
  const out = `${OUT}/songs/${key}.f32`;
  const r = await Rec.launch(`songs/_${key}`);
  await r.page.goto(BASE);
  await r.until(() => window.__TP_GAME?.scene.isActive('Title'));
  await r.js((len) => { window.__recArm = true; window.__recLenS = len; }, LEN_S + 8);
  await r.press('Enter', 0.3); // sound on (the title's own song starts)
  r.start(key, { frames: false });
  await r.js((e) => window.__TP_MUSIC(e.name, { bpm: e.bpm, transpose: e.transpose ?? 0 }), e);
  await r.sec(LEN_S + 1);
  await r.finish();
  const shot = JSON.parse(readFileSync(`${OUT}/songs/_${key}/shots.json`, 'utf8'))[0];
  const play = shot.music.filter((m) => m.name === e.name).pop();
  const b = readFileSync(`${shot.dir}/music.f32`), m = new Float32Array(new Uint8Array(b).buffer);
  const i0 = Math.round(play.t * 48000);
  writeFileSync(out, m.subarray(i0, i0 + LEN_S * 48000));
  rmSync(`${OUT}/songs/_${key}`, { recursive: true, force: true });
  console.log(`${out}  (${e.bpm} bpm)`);
}
