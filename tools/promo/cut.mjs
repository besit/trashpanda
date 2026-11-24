// Cuts the recorded shots into the promo videos (1.0).
//   node tools/promo/cut.mjs bwl        -> promo/trashpanda_bwl.mp4 (1920x1080, 60 fps, H.264 + AAC)
// Each edit is [shoot/shot-folder-prefix, from s, to s] in that shot's own time. Frames are scaled 5x with nearest
// neighbour (crisp pixels), every piece gets a 40 ms audio fade against clicks, and the whole is loudness-levelled.
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';

const RAW = 'promo/raw', TMP = 'promo/tmp';
const CARD = ['title', '00', 0, 4.5];

export const EDITS = {
  // THE BIKE LANE WAR: Queen West -> the briefing -> rats -> the Foreman -> "now a kid can ride it" -> the map changes
  bwl: [
    ['bwl', '00', 0.2, 6.0],     // riding Queen West past the Trinity Bellwoods gates, into the marker
    ['bwl', '00', 18.4, 23.0],   // the rat: "another car lane!"
    ['bwl', '00', 26.3, 30.2],   // the raccoon: "a real one. with a curb."
    ['bwl', '00', 41.0, 43.0],   // the mission card
    ['bwl', '01', 1.5, 6.5],     // rats
    ['bwl', '02', 1.0, 8.6],     // the Foreman Rat
    ['bwl', '02', 9.0, 10.8],    // STREET CLEARED
    ['bwl', '02', 14.5, 18.6],   // same street, now a kid can ride it
    ['bwl', '02', 19.6, 25.0],   // the city is changing: Queen gets protected lanes
    CARD,
  ],
  // THE GREAT PARKING LOT: Queen St E -> Megamart -> the Monster SUV and its rats -> a park for Leslieville
  lot: [
    ['lot', '00', 0.2, 5.8],     // Queen St E, past the Broadview Hotel
    ['lot', '00', 10.8, 12.6],   // the marker
    ['lot', '00', 14.6, 16.8],   // "acres of asphalt. half empty most days."
    ['lot', '00', 21.5, 25.5],   // the rat: "every square metre is a parking spot"
    ['lot', '00', 28.3, 31.8],   // the raccoon: "a whole park fits in here"
    ['lot', '00', 35.0, 37.0],   // the mission card
    ['lot', '01', 1.0, 6.5],     // rats in the lot
    ['lot', '02', 1.6, 10.6],    // the Monster SUV: TOWED!
    ['lot', '02', 11.0, 12.8],   // THE LOT IS GREEN!
    ['lot', '02', 19.2, 22.9],   // trees where the cars sat
    ['lot', '02', 23.3, 28.5],   // the map: Megamart's lot is a park now
    CARD,
  ],
  // SAVE THE SCIENCE: Spadina past the Rogers Centre -> Queens Quay -> the chase -> the Wrecker -> science by the lake
  sci: [
    ['sci', '00', 0.2, 4.2],     // the Rogers Centre, under the Gardiner, down Spadina
    ['sci', '00', 6.6, 8.9],     // Queens Quay, the marker
    ['sci', '00', 12.4, 15.2],   // "the Science Centre: closed in 2024"
    ['sci', '00', 26.6, 30.6],   // Dog Fjord: "sell it all!"
    ['sci', '00', 35.2, 38.6],   // the raccoon: "those exhibits belong to every kid"
    ['sci', '00', 48.3, 50.3],   // the mission card
    ['sci', '01', 1.8, 8.8],     // after them! they dropped it
    ['sci', '02', 0.8, 6.0],     // the Wrecker
    ['sci', '02', 13.4, 18.6],   // permit revoked, broken down, THE SCIENCE IS SAVED!
    ['sci', '02', 25.3, 28.8],   // science by the lake
    ['sci', '02', 30.2, 35.8],   // the map: the boards come down
    CARD,
  ],
  // DEATH BY HIGHWAY: the Rogers Centre and the CN Tower -> under the Gardiner -> "another lane?" -> the Highway
  // Mech -> a park in the sky
  hw: [
    ['hw', '00', 0.5, 4.5],      // past the Rogers Centre, the CN Tower and the aquarium
    ['hw', '00', 6.0, 9.8],      // Lake Shore under the Gardiner, the marker
    ['hw', '00', 28.0, 31.5],    // Dog Fjord: "what does Toronto need?"
    ['hw', '00', 36.3, 38.8],    // "...another lane?"
    ['hw', '00', 59.0, 61.0],    // DEATH BY HIGHWAY
    ['hw', '01', 1.5, 8.0],      // rats under the Gardiner
    ['hw', '02', 0.5, 6.5],      // FINAL BOSS: the Highway Mech
    ['hw', '02', 29.8, 35.6],    // it comes down; THE GARDINER IS DOWN!
    ['hw', '02', 41.2, 45.8],    // the pillars stayed, the cars didn't: a park in the sky
    ['hw', '02', 47.2, 52.5],    // the map: the deck is a park
    CARD,
  ],
};

const shotDir = (shoot, prefix) => {
  const d = readdirSync(`${RAW}/${shoot}`).find((f) => f.startsWith(prefix + '_'));
  if (!d) throw new Error(`no shot ${shoot}/${prefix}`);
  return `${RAW}/${shoot}/${d}`;
};
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

export function cut(name, edits = EDITS[name]) {
  mkdirSync(TMP, { recursive: true });
  const parts = edits.map(([shoot, prefix, a, b], i) => {
    const dir = shotDir(shoot, prefix), f0 = Math.round(a * 60), n = Math.round((b - a) * 60);
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
