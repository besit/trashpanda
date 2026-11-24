// Cuts the recorded shots into the promo videos (1.0).
//   node tools/promo/cut.mjs bwl        -> promo/trashpanda_bwl.mp4 (1920x1080, 60 fps, H.264 + AAC)
// Each edit is [shoot/shot-folder-prefix, from s, to s] in that shot's own time. Frames are scaled 5x with nearest
// neighbour (crisp pixels), every piece gets a 40 ms audio fade against clicks, and the whole is loudness-levelled.
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const RAW = 'promo/raw', TMP = 'promo/tmp';
const CARD = ['title', '00', 0, 4.5];

// Times can be written from the shoot's marks (promo/raw/<shoot>/marks.txt), so a re-recorded take still cuts right:
// '>> heart-1.8' is 1.8 s before the heart; '+3' after a start means 3 s long.
export const EDITS = {
  // THE BIKE LANE WAR: Trinity Bellwoods (a heart, the white squirrel, the gates) -> Queen St W -> rats -> the Foreman
  // Rat's last hits -> STREET CLEARED -> "now a kid can ride it" -> Dog Fjord -> Queen gets protected lanes
  bwl: [
    ['bwl', '00', '>> heart-1.8', '>> squirrel+2.6'],          // a heart in the grass; THE WHITE SQUIRREL!
    ['bwl', '00', '>> plaque-1.8', '+4.4'],                    // the gates: the plaque
    ['bwl', '00', '>> START MISSION-1.6', '+1.3'],             // into THE BIKE LANE WAR's marker
    ['bwl', '00', 'Action hp+0.5', '+2.6'],                    // the mission card
    ['bwl', '01', 'Action hp 4-3.4', '+5.6'],                  // rats on Queen; two hits taken
    ['bwl', '02', 'Action hp 3 boss 7-1.2', '>> boss down+3.4'], // the Foreman Rat's last hits, in one take; STREET CLEARED!
    ['bwl', '02', 'Cutscene SAME STREET.-0.6', '+3.8'],        // same street, now a kid can ride it
    ['bwl', '02', 'Cutscene [DOG FJORD]-0.2', '+6.6'],         // Dog Fjord: a raccoon has been... fixing things
    ['bwl', '02', 'Explore+0.4', '+6.0'],                      // the map: Queen gets protected lanes
    CARD,
  ],
  // THE BIKE BUS (on the map): Riverdale Park (the view from the hill, the footbridge, a heart by the Don Jail) ->
  // Broadview -> the bike bus: kids join at every stop, the bell moves the SUVs -> ON TIME -> Dog Fjord -> the map
  bus: [
    ['bus', '00', '>> egg-1.0', '+3.4'],                       // the view from the hill (easter egg)
    ['bus', '00', '>> plaque-0.8', '+3.0'],                    // the footbridge's plaque
    ['bus', '00', '>> heart-1.6', '+2.6'],                     // a heart by the Don Jail
    ['bus', '00', '>> START MISSION-2.2', '+1.2'],             // down Broadview to THE BIKE BUS
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
    ['sci', '00', '>> plaque-2.0', '+4.0'],                    // the Rogers Centre's plaque
    ['sci', '00', '>> START MISSION-1.8', '+1.3'],             // Queens Quay, the marker
    ['sci', '00', 'Action hp+0.5', '+2.6'],                    // the mission card
    ['sci', '01', 'Action hp 4-3.6', '+5.6'],                  // after them! (hits taken)
    ['sci', '02', 'Action hp 1 boss 3-1.4', '>> boss down+3.6'], // the Wrecker's last drops, in one take; SAVED!
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
    ['hw', '00', '>> START MISSION-1.8', '+1.3'],              // Lake Shore under the Gardiner, the marker
    ['hw', '00', 'Cutscene [DOG FJORD] DOG FJORD | SO I-0.3', '+4.2'], // what does Toronto need?
    ['hw', '00', 'Cutscene [DOG FJORD] DOG FJORD | ...ANO-1.4', '+4.0'], // ...ANOTHER LANE?
    ['hw', '00', 'Action hp+0.5', '+2.6'],                     // DEATH BY HIGHWAY
    ['hw', '01', 'Action hp 4-3.0', '+5.4'],                   // rats under the Gardiner (hits taken)
    ['hw', '02', 'Action hp 2 boss 4-1.5', '>> boss down+4.4'], // the Highway Mech's end, in one take; THE GARDINER IS DOWN!
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

const shotDir = (shoot, prefix) => {
  const d = readdirSync(`${RAW}/${shoot}`).find((f) => f.startsWith(prefix + '_'));
  if (!d) throw new Error(`no shot ${shoot}/${prefix}`);
  return `${RAW}/${shoot}/${d}`;
};
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

export function cut(name, edits = EDITS[name]) {
  mkdirSync(TMP, { recursive: true });
  const parts = edits.map(([shoot, prefix, a0, b0], i) => {
    const a = Math.max(0, at(shoot, prefix, a0)), b = at(shoot, prefix, b0, a);
    const dir = shotDir(shoot, prefix), f0 = Math.round(a * 60), n = Math.round((b - a) * 60);
    console.log(`  ${String(i).padStart(2)} ${shoot}/${prefix} ${a.toFixed(2)}-${b.toFixed(2)}`);
    const out = `${TMP}/${name}_${String(i).padStart(2, '0')}.mkv`;
    const last = i === edits.length - 1, first = i === 0;
    const vf = ['scale=1920:1080:flags=neighbor', first ? 'fade=in:st=0:d=0.25' : null, last ? `fade=out:st=${(n / 60 - 0.6).toFixed(2)}:d=0.6` : null].filter(Boolean).join(',');
    const af = `afade=in:st=0:d=0.04,afade=out:st=${(n / 60 - 0.04).toFixed(3)}:d=0.04${last ? `,afade=out:st=${(n / 60 - 0.8).toFixed(2)}:d=0.8` : ''}`;
    ff(['-framerate', '60', '-start_number', String(f0), '-i', `${dir}/%05d.png`,
      '-f', 'f32le', '-ar', '48000', '-ac', '1', '-ss', (f0 / 60).toFixed(4), '-t', (n / 60).toFixed(4), '-i', `${dir}/audio.f32`,
      '-frames:v', String(n), '-vf', vf, '-af', af, '-ac', '2', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-shortest', out]);
    return out;
  });
  const list = `${TMP}/${name}.txt`;
  writeFileSync(list, parts.map((p) => `file '${p.split('/').pop()}'`).join('\n'));
  const out = `promo/trashpanda_${name}.mp4`;
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '60', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
  console.log(`${out}  ${(+dur).toFixed(1)} s`);
  return out;
}

if (process.argv[1]?.endsWith('cut.mjs')) for (const n of process.argv.slice(2)) cut(n);
