// Synthesized sound effects. Each is a few oscillator/noise bursts.
import { synth } from './Synth';

export const sfx = {
  bell() { // bicycle bell: two bright partials, ding-ding
    for (const d of [0, 0.14]) {
      synth.tone({ freq: 2637, start: synth.now + d, dur: 0.35, vol: 0.09, type: 'sine', release: 0.3 });
      synth.tone({ freq: 3520, start: synth.now + d, dur: 0.25, vol: 0.05, type: 'sine', release: 0.22 });
      synth.tone({ freq: 2637, start: synth.now + d, dur: 0.05, vol: 0.06, type: 0.125 });
    }
  },
  streetcarBell() {
    for (const d of [0, 0.22]) {
      synth.tone({ freq: 1175, start: synth.now + d, dur: 0.4, vol: 0.08, type: 'sine', release: 0.35 });
      synth.tone({ freq: 1568, start: synth.now + d, dur: 0.3, vol: 0.05, type: 'sine', release: 0.28 });
    }
  },
  chain() { synth.noise({ dur: 0.03, vol: 0.05, hp: 5000 }); },
  jump() { synth.tone({ freq: 220, slideTo: 660, dur: 0.14, vol: 0.12, type: 0.25 }); },
  land() { synth.noise({ dur: 0.06, vol: 0.08, lp: 900 }); },
  dash() { synth.noise({ dur: 0.18, vol: 0.12, hp: 800 }); synth.tone({ freq: 500, slideTo: 1400, dur: 0.12, vol: 0.06, type: 0.125 }); },
  boost() { synth.tone({ freq: 180, slideTo: 720, dur: 0.35, vol: 0.09, type: 0.5, vib: 0.02 }); },
  swing() { synth.noise({ dur: 0.07, vol: 0.07, hp: 2500 }); },
  hit() { synth.noise({ dur: 0.1, vol: 0.18, lp: 3000 }); synth.tone({ freq: 140, slideTo: 60, dur: 0.1, vol: 0.14, type: 0.5 }); },
  clang() { synth.tone({ freq: 880, dur: 0.12, vol: 0.08, type: 0.125, slideTo: 820 }); synth.noise({ dur: 0.05, vol: 0.1, hp: 3000 }); },
  hurt() { synth.tone({ freq: 400, slideTo: 120, dur: 0.25, vol: 0.14, type: 0.5 }); },
  squeak() { const f = 1400 + Math.random() * 500; synth.tone({ freq: f, slideTo: f * 1.6, dur: 0.09, vol: 0.07, type: 0.125, vib: 0.05 }); synth.tone({ freq: f * 1.3, slideTo: f * 1.1, start: synth.now + 0.09, dur: 0.06, vol: 0.05, type: 0.125 }); },
  poof() { synth.noise({ dur: 0.25, vol: 0.12, lp: 1500 }); synth.tone({ freq: 600, slideTo: 1800, dur: 0.18, vol: 0.05, type: 0.25 }); },
  throwIt() { synth.tone({ freq: 300, slideTo: 200, dur: 0.12, vol: 0.06, type: 0.25 }); },
  select() { synth.tone({ freq: 988, dur: 0.05, vol: 0.08, type: 0.25 }); synth.tone({ freq: 1319, start: synth.now + 0.05, dur: 0.08, vol: 0.08, type: 0.25 }); },
  move() { synth.tone({ freq: 660, dur: 0.03, vol: 0.05, type: 0.25 }); },
  blip() { synth.tone({ freq: 1200 + Math.random() * 200, dur: 0.02, vol: 0.025, type: 0.25 }); },
  carHonk() { synth.tone({ freq: 392, dur: 0.25, vol: 0.06, type: 0.5 }); synth.tone({ freq: 466, dur: 0.25, vol: 0.05, type: 0.5 }); },
  construction() { for (let i = 0; i < 6; i++) synth.noise({ start: synth.now + i * 0.06, dur: 0.04, vol: 0.08, lp: 2000 }); },
  /** FRA-HA-HA-HA-HA! A pulse "voice" with formant-ish noise on the FR. */
  laugh() {
    synth.noise({ dur: 0.12, vol: 0.12, hp: 1500, lp: 4000 });
    const t = synth.now + 0.1;
    [330, 300, 280, 262, 247].forEach((f, i) => {
      synth.tone({ freq: f, start: t + i * 0.16, dur: 0.12, vol: 0.13, type: 0.25, vib: 0.03, slideTo: f * 0.85 });
      synth.tone({ freq: f * 2, start: t + i * 0.16, dur: 0.1, vol: 0.05, type: 0.125, slideTo: f * 1.7 });
      synth.noise({ start: t + i * 0.16, dur: 0.04, vol: 0.06, hp: 2500 });
    });
  },
  rumble() { synth.tone({ freq: 55, slideTo: 40, dur: 0.8, vol: 0.2, type: 'tri' }); synth.noise({ dur: 0.8, vol: 0.1, lp: 300 }); },
  stamp() { synth.noise({ dur: 0.08, vol: 0.16, lp: 700 }); synth.tone({ freq: 90, slideTo: 50, dur: 0.12, vol: 0.14, type: 'tri' }); },
  splash() { synth.noise({ dur: 0.5, vol: 0.14, hp: 600, lp: 5000 }); synth.tone({ freq: 700, slideTo: 200, dur: 0.3, vol: 0.05, type: 'sine' }); },
  /** transit signal priority granted: a detector click + the white-bar chirp */
  signal() { synth.noise({ dur: 0.02, vol: 0.08, hp: 4000 }); synth.tone({ freq: 1760, start: synth.now + 0.04, dur: 0.06, vol: 0.06, type: 0.25 }); synth.tone({ freq: 2349, start: synth.now + 0.11, dur: 0.1, vol: 0.06, type: 0.25 }); },
  brake() { synth.tone({ freq: 2200, slideTo: 1700, dur: 0.35, vol: 0.035, type: 0.125, vib: 0.08 }); },
  hammer() { synth.tone({ freq: 520, dur: 0.05, vol: 0.09, type: 0.125 }); synth.noise({ dur: 0.05, vol: 0.12, lp: 2500 }); },
  ding() { synth.tone({ freq: 1568, dur: 0.15, vol: 0.08, type: 0.25 }); synth.tone({ freq: 2093, start: synth.now + 0.08, dur: 0.25, vol: 0.08, type: 0.25 }); },
};
