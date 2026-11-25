// Cuts the recorded shots into the promo videos (1.0).
//   node tools/promo/cut.mjs bwl        -> promo/trashpanda_bwl.mp4 (1920x1080, 60 fps, H.264 + AAC)
// Each edit is [shoot/shot-folder-prefix, from s, to s] in that shot's own time. Frames are scaled 5x with nearest
// neighbour (crisp pixels).
// The sound (Ivan: "make sure the cuts work well with the music"): the shoots record the music and the sound effects
// as two tracks, with a log of the songs (tools/promo/rec.mjs). Each clip keeps its own sound effects, but the music is
// laid under the whole video from clean renders of the game's songs (tools/promo/songs.mjs): it runs on across the
// cuts while the song stays the same, a new song starts on its first beat at the cut where the game's music changes
// (or exactly where the game started it, inside a clip), and every cut is moved to the nearest beat. The whole is
// then levelled the way the game does it (a gentle compressor) and loudness-normalised.
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const RAW = 'promo/raw', TMP = 'promo/tmp';
const CARD = ['title', '00', 0, 4.5]; // the end card, with the title screen's song

// Times can be written from the shoot's marks (promo/raw/<shoot>/marks.txt), so a re-recorded take still cuts right:
// '>> heart-1.8' is 1.8 s before the heart; '+3' after a start means 3 s long.
export const EDITS = {
  // THE BIKE LANE WAR: Trinity Bellwoods (a heart, the white squirrel, the gates) -> Queen St W -> rats -> the Foreman
  // Rat -> STREET CLEARED -> "now a kid can ride it" -> Dog Fjord -> Queen gets protected lanes
  bwl: [
    ['bwl', '00', '>> heart-1.8', '>> squirrel+2.6'],          // a heart in the grass; THE WHITE SQUIRREL!
    ['bwl', '00', '>> plaque-1.8', '+4.4'],                    // the gates: the plaque
    ['bwl', '00', '>> START MISSION-1.6', '>> START MISSION+0.85'],             // into THE BIKE LANE WAR's marker
    ['bwl', '01', 1.6, '+5.6'],                                // rats on Queen
    ['bwl', '02', 'Action hp 5 boss-0.8', '>> boss down+3.4'],   // the Foreman Rat, the whole fight in one take; STREET CLEARED!
    ['bwl', '02', 'Cutscene SAME STREET.-0.6', '+3.8'],        // same street, now a kid can ride it
    ['bwl', '02', 'Cutscene [DOG FJORD]', '+6.4'],              // Dog Fjord: a raccoon has been... fixing things
    ['bwl', '02', 'Explore+0.4', '+6.0'],                      // the map: Queen gets protected lanes
    CARD,
  ],
  // THE BIKE BUS (on the map): Riverdale Park (the view from the hill, the footbridge, a heart by the Don Jail) ->
  // Broadview -> the bike bus: kids join at every stop, the bell moves the SUVs -> ON TIME -> Dog Fjord -> the map
  bus: [
    ['bus', '00', '>> egg-1.0', '>> plaque+3.0'],              // the view from the hill (easter egg), on to the footbridge's plaque
    ['bus', '00', '>> heart-1.6', '+2.6'],                     // a heart by the Don Jail
    ['bus', '00', '>> START MISSION-1.8', '>> START MISSION+0.85'],             // down Broadview to THE BIKE BUS
    ['bus', '00', '>> bus on+0.2', '>> stop 0+0.6'],           // the first stop: two kids join
    ['bus', '00', '>> bell 1-0.8', '+2.6'],                    // ring: the SUV moves out of the bike lane
    ['bus', '00', '>> stop 4-2.6', '>> bell 5+1.4'],           // more kids, another SUV
    ['bus', '00', '>> stop 6-0.6', 'Cutscene THE NEXT MORNING-1.4'], // the last stop, the school, ON TIME!
    ['bus', '00', 'Cutscene NINE-0.4', '+3.6'],                // nine kids, no drop-off jam: a school street
    ['bus', '00', 'Cutscene [DOG FJORD]-0.2', '+5.8'],           // Dog Fjord: who approved these... improvements?
    ['bus', '00', 'Cutscene [DOG FJORD] DOG FJORD | NOBODY LIKES-0.2', '+4.0'], // NOBODY LIKES PATIOS!
    ['bus', '00', '@last:Explore+0.4', '+6.0'],                   // the map: a school street
    CARD,
  ],
  // SAVE THE SCIENCE: Graffiti Alley (easter egg + heart) -> down Spadina past the Rogers Centre -> Queens Quay ->
  // the chase -> the Wrecker's last drops -> THE SCIENCE IS SAVED -> Dog Fjord's highway -> the boards come down
  sci: [
    ['sci', '00', '>> egg-1.4', '>> heart+2.2'],               // Graffiti Alley (easter egg), a heart at its end
    ['sci', '00', '>> plaque-2.0', '+4.0', { music: 'continue' }], // the Rogers Centre's plaque (downtown's tune runs on)
    ['sci', '00', '>> START MISSION-1.6', '>> START MISSION+0.85', { music: 'continue' }], // Queens Quay, the marker
    ['sci', '01', 3.2, '+5.6'],                                 // after them!
    ['sci', '02', '>> END STARTS+0.3', '>> boss down+3.6'],    // the Wrecker's last drops, in one take; SAVED!
    ['sci', '02', 'Cutscene [DOG FJORD] DOG FJORD | FINE-0.05', '+3.8'], // Dog Fjord: fine. if this city won't take another car lane...
    ['sci', '02', 'Cutscene [DOG FJORD] DOG FJORD | ...IT-0.3', '+4.4'], // ...IT WILL TAKE A HIGHWAY. FRA-HA-HA!
    ['sci', '02', 'Explore+0.4', '+6.0'],                      // the map: the boards come down
    CARD,
  ],
  // DEATH BY HIGHWAY: a heart by the Rogers Centre, the CN Tower's plaque, Sugar Beach (easter egg) -> Lake Shore ->
  // Dog Fjord: "...another lane?" -> rats under the Gardiner -> the Highway Mech's end -> a park in the sky
  hw: [
    ['hw', '00', '>> heart-1.0', '+2.4'],                      // a heart by the Rogers Centre
    ['hw', '00', '>> plaque-1.6', '+3.8'],                     // the CN Tower's plaque
    ['hw', '00', '>> egg-1.6', '+3.6'],                        // Sugar Beach (easter egg)
    ['hw', '00', '>> START MISSION-1.6', '>> START MISSION+0.85'],              // Lake Shore under the Gardiner, the marker
    ['hw', '00', 'Cutscene [DOG FJORD] DOG FJORD | SO I-0.3', '+4.2'], // what does Toronto need?
    ['hw', '00', 'Cutscene [DOG FJORD] DOG FJORD | ...ANO-1.4', '+4.0'], // ...ANOTHER LANE?
    ['hw', '01', '>> extra rats-0.2', '+4.8'],                // a crowd of rats under the Gardiner
    ['hw', '02', '>> END STARTS+3.1', '>> boss down+4.4'],     // the Highway Mech's end, in one take; THE GARDINER IS DOWN!
    ['hw', '02', 'Cutscene THE PILLARS-0.4', '+4.0'],          // the pillars stayed, the cars didn't
    ['hw', '02', 'Explore+0.4', '+6.0'],                       // the map: a park in the sky
    CARD,
  ],
};

/** a time in a shot: a number (seconds), or 'mark text+offset' (the first mark that starts with that text, e.g.
 *  '>> heart-1.5'), or '@n:mark text' (its n-th match), or '@last:mark text'. For the end, '+3' means three seconds after the start. */
function at(shoot, prefix, spec, from) {
  if (typeof spec === 'number') return spec;
  if (/^\+[\d.]+$/.test(spec)) return from + parseFloat(spec);
  const m = /^(?:@(\d+|last):)?(.*?)([+-][\d.]+)?$/.exec(spec);
  const shots = JSON.parse(readFileSync(`${RAW}/${shoot}/shots.json`, 'utf8'));
  const shot = shots.find((x) => x.dir.split('/').pop().startsWith(prefix + '_'));
  const hits = shot.marks.filter((k) => k.s.startsWith(m[2]));
  const k = m[1] === 'last' ? hits[hits.length - 1] : hits[+(m[1] ?? 0)];
  if (!k) throw new Error(`no mark "${m[2]}" in ${shoot}/${prefix}`);
  return k.t + parseFloat(m[3] ?? '0');
}

// Ivan: "a fast skim through several screens with interesting stuff at the start, to catch the eye", and then
// "make sure there is always some action in the centre of the screen". Flashes over the video's fight (or bike bus)
// music, each a whole number of beats, four bars in all, and the video starts on the next downbeat. The fights come
// from tools/promo/skim.mjs's takes (skim_hw, skim_bwl), where the action is in the middle of the screen; the rest
// picks the busiest moment of a shot. A flash is [shoot, shot, from s, beats]; the bed is [song, from bar].
const BOSS = 'another-lane-of-trouble@172_0';
const SKIMS = {
  hw: {
    bed: [BOSS, 0],
    flashes: [
      ['skim_hw', '03', 0.55, 3],                                       // the Mech winds up, stomps; the raccoon jumps the dust
      ['skim_hw', '00', 6.2, 2],                                        // into a pack of rats, mid-screen
      ['hw', '00', 'Cutscene [DOG FJORD] DOG FJORD | ...ANO+1.4', 2],   // Dog Fjord: ...another lane?
      ['bus', '00', '>> stop 4', 2],                                    // the bike bus, kids in a line, an SUV moves
      ['sci', '02', '>> boss down-0.1', 2],                             // PERMIT REVOKED!
      ['hw', '02', 'Cutscene THE PILLARS+0.5', 2],                      // the streetcar through the middle, under the park
      ['hw', '02', 'Explore+1.0', 3],                                   // the camera pans, the Gardiner goes green
    ],
  },
  bwl: {
    bed: [BOSS, 4],
    flashes: [
      ['bwl', '02', 'Action hp 5 boss 14-0.1', 2],                      // the Foreman Rat, mid-screen
      ['skim_bwl', '00', 1.8, 2],                                       // rats on Queen, mid-screen
      ['bwl', '00', '>> squirrel-0.3', 2],                              // THE WHITE SQUIRREL!
      ['skim_hw', '03', 0.6, 3],                                        // later: the Highway Mech
      ['bwl', '02', 'Cutscene SAME STREET. | NOW A KID CAN RIDE IT.-0.2', 2], // the streetcar, kids on bikes
      ['bwl', '02', 'Cutscene [DOG FJORD] DOG FJORD | CITIZENS+0.5', 2],     // Dog Fjord
      ['bwl', '02', 'Explore+1.0', 3],                                  // the camera pans, Queen gets its bike lanes
    ],
  },
  sci: {
    bed: [BOSS, 8],
    flashes: [
      ['sci', '02', '>> END STARTS+3.4', 3],                            // the ball drops, the raccoon jumps the shockwave
      ['sci', '01', 4.6, 2],                                            // the chase: FIGHT! round the dropped exhibit
      ['sci', '00', '>> egg-0.3', 2],                                   // Graffiti Alley
      ['sci', '02', '>> boss down-0.1', 2],                             // PERMIT REVOKED!
      ['skim_hw', '00', 6.2, 2],                                        // later: rats under the Gardiner
      ['sci', '02', 'Cutscene [DOG FJORD] DOG FJORD | ...IT+1.0', 2],   // ...IT WILL TAKE A HIGHWAY. FRA-HA-HA!
      ['sci', '02', 'Explore+1.15', 3],                                 // the camera pans, the science centre opens
    ],
  },
  bus: {
    bed: ['bus', 0], // the bike bus's own song (whatever the shoot's log says played with the bus)
    flashes: [
      ['bus', '00', '>> stop 4', 3],                                    // the bike bus, kids in a line, an SUV moves
      ['bus', '00', '>> bell 3-0.3', 2],                                // ring: OOPS! MOVING!
      ['skim_bwl', '00', 1.8, 2],                                       // elsewhere: rats on Queen
      ['bus', '00', '>> egg-0.2', 2],                                   // the view from the hill
      ['bus', '00', 'Cutscene THE NEXT MORNING. THE BIKE BUS.+2.2', 2], // the bike bus down the street
      ['bus', '00', 'Cutscene [DOG FJORD] DOG FJORD | SIX LANES+0.4', 2], // Dog Fjord: six lanes wide
      ['bus', '00', '@last:Explore+1.1', 3],                            // the camera pans, a school street appears
    ],
  },
};
const skim = ({ bed, flashes }) => flashes.map(([shoot, prefix, a, beats], i) => [shoot, prefix, a, null, { beats, sfx: 0.8, ...(i === 0 ? { bed } : { music: 'continue' }) }]);
for (const [k, s] of Object.entries(SKIMS)) EDITS[`${k}_skim`] = [...skim(s), ...EDITS[k]];

const SR = 48000, SPF = SR / 60;
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const f32 = (p) => (existsSync(p) ? new Float32Array(new Uint8Array(readFileSync(p)).buffer) : null);
const memo = (fn) => { const m = new Map(); return (...k) => { const key = k.join('|'); if (!m.has(key)) m.set(key, fn(...k)); return m.get(key); }; };
const shotInfo = memo((shoot, prefix) => {
  const shots = JSON.parse(readFileSync(`${RAW}/${shoot}/shots.json`, 'utf8'));
  const shot = shots.find((x) => x.dir.split('/').pop().startsWith(prefix + '_'));
  if (!shot) throw new Error(`no shot ${shoot}/${prefix}`);
  return { dir: shot.dir, music: shot.music ?? [] };
});
const sfxOf = memo((shoot, prefix) => f32(`${shotInfo(shoot, prefix).dir}/sfx.f32`));
export const songKey = (e) => `${e.name}@${e.bpm}_${e.transpose ?? 0}`;
const bpmOf = (key) => +key.split('@')[1].split('_')[0];
const ONCE = ['city-improves', 'street-cleared', 'bonk']; // the jingles that don't loop: they keep the game's timing
const once = (key) => !!key && ONCE.includes(key.split('@')[0]);
/** how long a song sounds (a jingle's whole length), from its render */
const songLen = memo((key) => { const s = song(key); let i = s.length - 1; while (i > 0 && Math.abs(s[i]) < 1e-3) i--; return (i + 1) / SR; });
const song = memo((key) => { const s = f32(`${RAW}/songs/${key}.f32`); if (!s) throw new Error(`no render of ${key}: node tools/promo/songs.mjs`); return s; });
/** the song the bike bus rides to (the first one the bus shoot starts after the bus sets off) */
const busSong = () => songKey(shotInfo('bus', '00').music.find((e) => e.name && e.t > at('bus', '00', '>> bus on') - 3));

/** the edit worked out: each clip's frames, and the music under it as runs of songs ({T: video s, key, phase: s into
 *  the song}), with the cuts moved to the beat. `lead` starts the first song that many seconds early (the vertical
 *  version's rotate screen) */
export function plan(name, lead = 0) {
  const edits = EDITS[name]; if (!edits) throw new Error(`no edit ${name}`);
  const segs = [], runs = [];
  let F = 0; // the video so far, in frames
  let homeKey = null; const home = () => homeKey; // the video's own map tune: what plays at its first clip (after a skim)
  for (const [shoot, prefix, a0, b0, opt = {}] of edits) {
    const info = shotInfo(shoot, prefix);
    const a = Math.max(0, at(shoot, prefix, a0)), T = F / 60;
    const cur = runs[runs.length - 1];
    if (!homeKey && !opt.beats) { const st0 = info.music.filter((e) => e.t <= a + 1e-6).pop(); homeKey = st0?.name ? songKey(st0) : null; }
    // the music at the cut: the skim's bed; or the song the game plays here, if it's another one than before
    if (opt.bed) {
      const key = opt.bed[0] === 'bus' ? busSong() : opt.bed[0];
      runs.push({ T, key, phase: opt.bed[1] * 4 * 60 / bpmOf(key) });
    } else if (opt.music !== 'continue') {
      const st = info.music.filter((e) => e.t <= a + 1e-6).pop();
      const key = st?.name ? songKey(st) : null;
      // where the game has no music at the cut, what plays rings on (a jingle to its end)
      if (!cur || (cur.key !== key && key)) {
        const since = st ? a - st.t : 0; // a jingle, or a song that only just started: as in the game
        runs.push({ T, key, phase: key && (ONCE.includes(st.name) || since < 1) ? Math.max(0, since) : 0 });
      } else if (!key && once(cur.key) && home()) runs.push({ T, key: home(), phase: 0 }); // quiet after a jingle (the debrief's picture): the video's own map tune comes back
    }
    // the songs the game starts inside the clip, where it starts them
    const inner = (b) => (opt.music === 'continue' ? [] : info.music.filter((e) => e.t > a && e.t < b).map((e) => ({ T: T + e.t - a, key: e.name ? songKey(e) : null, phase: 0 })));
    // the clip's length: a number of beats, or up to its end moved to the nearest beat
    let E;
    const b = opt.beats ? null : at(shoot, prefix, b0, a);
    if (opt.beats) E = T + opt.beats * 60 / bpmOf(runs[runs.length - 1].key);
    else E = T + (b - a);
    {
      const r = [...runs, ...(opt.beats ? [] : inner(b))].filter((x) => x.T <= E).pop();
      if (r?.key && opt.snap !== false) {
        const beat = 60 / bpmOf(r.key), g0 = r.T - r.phase;
        const S = g0 + Math.round((E - g0) / beat) * beat;
        if (S >= r.T && S - T > 0.3) E = S;
      }
    }
    const n = Math.round(E * 60) - F;
    runs.push(...inner(a + n / 60));
    segs.push({ shoot, prefix, a, f0: Math.round(a * 60), n, F, opt });
    F += n;
  }
  // a song the game starts and stops again at once (going back to the map, before the city-improves jingle): out
  for (let i = runs.length - 2; i >= 0; i--) if (runs[i + 1].T - runs[i].T < 0.3 && runs[i].key) runs.splice(i, 1);
  // the game stops one song a moment before the next (a scene changing): the first plays on up to the second
  for (let i = runs.length - 2; i > 0; i--) if (!runs[i].key && runs[i + 1].key && runs[i + 1].T - runs[i].T < 1) runs.splice(i, 1);
  // a jingle plays to its end: a looping song after it waits for it, a quiet patch or another jingle's tail goes;
  // only a jingle the game starts on cue (inside a clip) cuts in
  for (let i = 0; i < runs.length - 1; i++) {
    const r = runs[i]; if (!once(r.key)) continue;
    const end = r.T - r.phase + songLen(r.key);
    while (i + 1 < runs.length && runs[i + 1].T < end) {
      const nx = runs[i + 1];
      if (once(nx.key) && nx.phase > 0 && home()) { nx.key = home(); nx.phase = 0; } // another jingle's tail: the map tune instead
      if (!nx.key) { runs.splice(i + 1, 1); continue; }
      if (once(nx.key)) break;
      // a looping song comes in on its next beat after the jingle (as if it had been playing under it): the cuts
      // after it stay on its beat
      const beat = 60 / bpmOf(nx.key), k = Math.ceil((end - nx.T) / beat - 1e-6);
      while (runs[i + 2] && !runs[i + 2].key && runs[i + 2].T <= end) runs.splice(i + 2, 1);
      if (runs[i + 2] && runs[i + 2].T <= end) { runs.splice(i + 1, 1); continue; } // replaced before the jingle ends
      nx.T += k * beat; nx.phase += k * beat;
      break;
    }
  }
  // the end card's song comes in early, by whole bars, where the music before it has gone quiet (after the map's
  // jingle): it still lands on its downbeat at the cut
  const last = runs[runs.length - 1], prev = runs[runs.length - 2];
  if (last?.key && prev) {
    const before = runs[runs.length - 3];
    const quietFrom = prev.key ? (once(prev.key) ? prev.T - prev.phase + songLen(prev.key) : last.T) : Math.max(prev.T, once(before?.key) ? before.T - before.phase + songLen(before.key) : prev.T);
    const bar = 4 * 60 / bpmOf(last.key), n = Math.floor((last.T - quietFrom) / bar + 1e-6);
    if (n > 0) { last.T -= n * bar; last.phase = 0; } // from its first beat, on the card's cut
  }
  if (lead && runs.length) runs[0].T -= lead;
  return { segs, runs, frames: F, lead };
}

/** the whole sound of a plan, as 48 kHz mono float: the music runs and each clip's own sound effects */
export function mixAudio(p, out) {
  const total = Math.round((p.lead + p.frames / 60) * SR), mix = new Float32Array(total);
  const at0 = (t) => Math.round((t + p.lead) * SR);
  p.runs.forEach((r, i) => {
    if (!r.key) return;
    const s = song(r.key), next = p.runs[i + 1];
    const i0 = Math.max(0, at0(r.T)), i1 = Math.min(total, next ? at0(next.T) : total), p0 = Math.round(r.phase * SR) + (i0 - at0(r.T));
    const fin = r.phase > 0 ? 0.004 * SR : 0, fout = next ? 0.012 * SR : 0;
    for (let i = i0; i < i1; i++) {
      const k = i - i0, g = Math.min(1, fin ? k / fin : 1, fout ? (i1 - i) / fout : 1);
      mix[i] += (s[p0 + k] ?? 0) * g;
    }
  });
  for (const sg of p.segs) {
    const x = sfxOf(sg.shoot, sg.prefix); if (!x) continue;
    const i0 = at0(sg.F / 60), s0 = sg.f0 * SPF, len = sg.n * SPF, fd = 0.005 * SR, g0 = sg.opt.sfx ?? 1;
    for (let k = 0; k < len && i0 + k < total; k++) mix[i0 + k] += (x[s0 + k] ?? 0) * g0 * Math.min(1, k / fd, (len - k) / fd);
  }
  const fo = 0.8 * SR, fi = 0.03 * SR;
  for (let i = 0; i < total; i++) mix[i] *= 0.5 * Math.min(1, i / fi, (total - i) / fo); // the game's master gain; in and out
  writeFileSync(out, mix);
  return out;
}
export const AUDIO_IN = (f) => ['-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', f];
export const AUDIO_OUT = ['-af', 'acompressor=threshold=-14dB:ratio=3:attack=5:release=60,loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', '-c:a', 'aac', '-b:a', '192k'];

/** the vertical version's lead-in (the rotate screen): close to 2.6 s, in whole bars of the video's first song (or
 *  else whole beats), so the song it starts keeps the cuts on the beat */
export function leadFor(name) {
  const k = plan(name).runs[0]?.key; if (!k) return 2.6;
  const beat = 60 / bpmOf(k), bars = Math.round(2.6 / (4 * beat));
  return bars >= 1 && Math.abs(bars * 4 * beat - 2.6) <= 0.5 ? bars * 4 * beat : Math.max(2, Math.round(2.6 / beat)) * beat;
}

const shotDir = (shoot, prefix) => {
  const d = readdirSync(`${RAW}/${shoot}`).find((f) => f.startsWith(prefix + '_'));
  if (!d) throw new Error(`no shot ${shoot}/${prefix}`);
  return `${RAW}/${shoot}/${d}`;
};

export function cut(name) {
  mkdirSync(TMP, { recursive: true });
  const p = plan(name);
  const parts = p.segs.map(({ shoot, prefix, a, f0, n }, i) => {
    console.log(`  ${String(i).padStart(2)} ${shoot}/${prefix} ${a.toFixed(2)}-${(a + n / 60).toFixed(2)}`);
    const out = `${TMP}/${name}_${String(i).padStart(2, '0')}.mkv`;
    const last = i === p.segs.length - 1, first = i === 0;
    const vf = ['scale=1920:1080:flags=neighbor', first ? 'fade=in:st=0:d=0.25' : null, last ? `fade=out:st=${(n / 60 - 0.6).toFixed(2)}:d=0.6` : null].filter(Boolean).join(',');
    ff(['-framerate', '60', '-start_number', String(f0), '-i', `${shotDir(shoot, prefix)}/%05d.png`, '-frames:v', String(n), '-vf', vf, '-an',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', '-pix_fmt', 'yuv420p', out]);
    return out;
  });
  for (const r of p.runs) console.log(`     ♪ ${r.T.toFixed(2)} ${r.key ?? '(none)'}${r.phase ? ` from ${r.phase.toFixed(2)}` : ''}`);
  const list = `${TMP}/${name}.txt`;
  writeFileSync(list, parts.map((x) => `file '${x.split('/').pop()}'`).join('\n'));
  const wav = mixAudio(p, `${TMP}/${name}.f32`);
  const out = `promo/trashpanda_${name}.mp4`;
  ff(['-f', 'concat', '-safe', '0', '-i', list, ...AUDIO_IN(wav), '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '60', ...AUDIO_OUT, '-movflags', '+faststart', out]);
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
  console.log(`${out}  ${(+dur).toFixed(1)} s`);
  return out;
}

if (process.argv[1]?.endsWith('cut.mjs')) for (const n of process.argv.slice(2)) cut(n);
