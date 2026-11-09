// Original chiptune compositions (tracker-style data). 16 steps per bar.
import type { Song } from './Sequencer';

const CH: Record<string, string[]> = {
  C: ['C4', 'E4', 'G4', 'C5'], Am: ['A3', 'C4', 'E4', 'A4'], F: ['F3', 'A3', 'C4', 'F4'], G: ['G3', 'B3', 'D4', 'G4'],
  Cm: ['C4', 'Eb4', 'G4', 'C5'], Ab: ['Ab3', 'C4', 'Eb4', 'Ab4'], Gd: ['G3', 'B3', 'D4', 'F4'], Em: ['E4', 'G4', 'B4', 'E5'], Dm: ['D4', 'F4', 'A4', 'D5'],
};
const ROOT: Record<string, string> = { C: 'C', Am: 'A', F: 'F', G: 'G', Cm: 'C', Ab: 'Ab', Gd: 'G', Em: 'E', Dm: 'D' };

const arp = (chords: string[]) => chords.map((c) => { const [a, b, d, e] = CH[c]; return `${a} . ${b} . ${d} . ${e} . ${d} . ${b} . ${a} . ${b} .`; });
const driveBass = (chords: string[], oct = 2) => chords.map((c) => { const r = ROOT[c]; const lo = `${r}${oct}`, hi = `${r}${oct + 1}`; return `${lo} . ${lo} ${hi} . ${lo} ${hi} . ${lo} . ${lo} ${hi} . ${lo} ${hi} .`; });
const rep = (s: string, n: number) => Array(n).fill(s);

const A = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'];
const B = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'G'];

export const SONG_MAIN: Song = {
  name: 'queen-st-cruise', bpm: 150,
  tracks: [
    { ch: 'p1', duty: 0.25, vol: 0.15, vib: 0.004, bars: [
      'E5 . G5 . C6 - - . B5 . G5 . E5 . G5 .', 'A5 - - . G5 . E5 . C5 - - . E5 . A5 .',
      'F5 . A5 . C6 - - . A5 . F5 . A5 . C6 .', 'B5 - - . A5 . G5 . D5 - - . G5 - - .',
      'E5 . G5 . C6 - - . B5 . G5 . E5 . G5 .', 'A5 - - . G5 . E5 . C5 - - . E5 . A5 .',
      'F5 . A5 . C6 . D6 . E6 - - . D6 . C6 .', 'D6 - - . B5 . G5 . C6 - - - - - - .',
      'A5 . . A5 . . C6 . B5 . A5 . G5 - E5 .', 'F5 - - - A5 - C6 - - - A5 . G5 . F5 .',
      'E5 . . E5 . . G5 . A5 . G5 . E5 - C5 .', 'D5 - - - G5 - B5 - - - D6 - - - . .',
      'A5 . . A5 . . C6 . B5 . A5 . G5 - E5 .', 'F5 - - - A5 - C6 - - - F6 . E6 . D6 .',
      'D6 - - - B5 - G5 - - - B5 . C6 . D6 .', 'G5 - - - - - - - G5 . A5 . B5 . D6 .',
    ] },
    { ch: 'p2', duty: 0.5, vol: 0.055, bars: [...arp(A), ...arp(B)] },
    { ch: 'tri', vol: 0.2, bars: [...driveBass(A), ...driveBass(B)] },
    { ch: 'drums', vol: 0.22, bars: [...rep('k . h . s . h . k k h . s . h h', 8), ...rep('k . h k s . h . k . h k s . o .', 7), 'k . s . s . s s k . s s s s s s'] },
  ],
};

const DF = ['Cm', 'Cm', 'Ab', 'Gd'];
export const SONG_DOGFRAUD: Song = {
  name: 'historic-investment', bpm: 108,
  tracks: [
    { ch: 'p1', duty: 0.125, vol: 0.13, vib: 0.012, bars: [
      'C5 - - - Eb5 - - - G5 - - - F#5 - G5 -', 'C6 - - - - - - - B5 - Ab5 - G5 - - -',
      'Ab5 - - - G5 - - - F5 - - - Eb5 - D5 -', 'G4 - - - - - - - B4 - - - D5 - F5 -',
    ] },
    { ch: 'p2', duty: 0.25, vol: 0.06, bars: DF.map((c) => { const [, b, d] = CH[c]; return `. . ${b} ${d} . . ${b} ${d} . . ${b} ${d} . . ${b} ${d}`; }) },
    { ch: 'tri', vol: 0.22, bars: DF.map((c) => { const r = ROOT[c]; return `${r}2 . . . ${r === 'C' ? 'G' : r === 'Ab' ? 'Eb' : 'D'}2 . . . ${r}2 . . . ${r === 'C' ? 'G' : r === 'Ab' ? 'Eb' : 'D'}2 . . .`; }) },
    { ch: 'drums', vol: 0.2, bars: rep('k . . . s . . . k . k . s . . h', 4) },
  ],
};

const RR = ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'Dm', 'Em'];
export const SONG_ACTION: Song = {
  name: 'rat-rush', bpm: 168,
  tracks: [
    { ch: 'p1', duty: 0.25, vol: 0.14, bars: [
      'A5 . A5 . C6 . A5 . E6 - D6 . C6 . B5 .', 'C6 - A5 . . . A5 . G5 . A5 . C6 - . .',
      'F5 . A5 . C6 . F6 . E6 - C6 . A5 . F5 .', 'G5 - - . B5 - - . D6 - - . E6 - D6 -',
      'A5 . A5 . C6 . A5 . E6 - D6 . C6 . B5 .', 'C6 - A5 . . . E6 . D6 . C6 . A5 - . .',
      'D6 . F6 . A6 - - . G6 . F6 . E6 . D6 .', 'E6 - - - B5 - - - G#5 - - - E5 - - -',
    ] },
    { ch: 'p2', duty: 0.125, vol: 0.05, bars: arp(RR) },
    { ch: 'tri', vol: 0.21, bars: driveBass(RR) },
    { ch: 'drums', vol: 0.22, bars: [...rep('k . h k s . h . k k h . s . h k', 7), 'k . s . k s . s k s s s s s s s'] },
  ],
};

/** Short non-looping sting when the city improves. */
export const SONG_IMPROVE: Song = {
  name: 'city-improves', bpm: 140, loop: false,
  tracks: [
    { ch: 'p1', duty: 0.25, vol: 0.16, bars: ['C5 . E5 . G5 . C6 . E6 . G6 - - - - .', 'F6 - - - E6 - - - G6 - - - - - - .'] },
    { ch: 'p2', duty: 0.5, vol: 0.07, bars: ['C4 . . . E4 . . . G4 . . . C5 . . .', 'A4 - - - G4 - - - C5 - - - - - - .'] },
    { ch: 'tri', vol: 0.2, bars: ['C3 . . . C3 . . . C3 . . . C3 . . .', 'F2 - - - G2 - - - C3 - - - - - - .'] },
    { ch: 'drums', vol: 0.18, bars: ['k . . . s . . . k . k . s . s s', 'k . . . . . . . o . . . . . . .'] },
  ],
};
