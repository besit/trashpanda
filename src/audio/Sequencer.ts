// Lookahead step sequencer playing tracker-style song data on the chip synth.
import { synth, noteFreq, type Duty } from './Synth';

export interface Track {
  /** 'p1' | 'p2' pulse, 'tri' triangle (bass), 'drums' noise kit */
  ch: 'p1' | 'p2' | 'tri' | 'drums';
  duty?: Duty;
  vol?: number;
  /** Space-separated 16th-note steps. Note "C5", sustain "-", rest ".". Drums: k s h o(open hat) . */
  bars: string[];
  vib?: number;
}
export interface Song { name: string; bpm: number; tracks: Track[]; loop?: boolean }

interface Parsed { notes: { step: number; len: number; tok: string }[]; steps: number }

function parse(t: Track): Parsed {
  const toks = t.bars.join(' ').trim().split(/\s+/);
  const notes: Parsed['notes'] = [];
  toks.forEach((tok, i) => {
    if (tok === '-' || tok === '.') return;
    let len = 1;
    while (toks[i + len] === '-') len++;
    notes.push({ step: i, len, tok });
  });
  return { notes, steps: toks.length };
}

export class Sequencer {
  private song: Song | null = null;
  private parsed: Parsed[] = [];
  private startTime = 0;
  private nextStep = 0;
  private timer: number | null = null;
  private totalSteps = 0;
  private stepDur = 0.1;
  current = '';

  play(song: Song) {
    if (!synth.ctx) return;
    if (this.current === song.name && this.timer !== null) return;
    this.stop();
    this.song = song;
    this.current = song.name;
    this.parsed = song.tracks.map(parse);
    this.totalSteps = Math.max(...this.parsed.map((p) => p.steps));
    this.stepDur = 60 / song.bpm / 4;
    this.startTime = synth.now + 0.08;
    this.nextStep = 0;
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  duck(on: boolean) { synth.duck(on); }

  stop() {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.current = '';
  }

  private schedule() {
    if (!this.song) return;
    const ahead = synth.now + 0.15;
    while (this.startTime + this.nextStep * this.stepDur < ahead) {
      const loopStep = this.nextStep % this.totalSteps;
      if (this.nextStep > 0 && loopStep === 0 && this.song.loop === false) { this.stop(); return; }
      const t0 = this.startTime + this.nextStep * this.stepDur;
      this.song.tracks.forEach((tr, i) => {
        for (const n of this.parsed[i].notes) if (n.step === loopStep % this.parsed[i].steps) this.trigger(tr, n.tok, t0, n.len * this.stepDur);
      });
      this.nextStep++;
    }
  }

  private trigger(tr: Track, tok: string, t: number, dur: number) {
    const vol = tr.vol ?? 0.18;
    if (tr.ch === 'drums') {
      if (tok === 'k') { synth.tone({ freq: 160, slideTo: 40, start: t, dur: 0.12, vol: vol * 1.2, type: 'tri', out: 'music' }); }
      else if (tok === 's') synth.noise({ start: t, dur: 0.14, vol: vol * 0.9, hp: 1200, out: 'music' });
      else if (tok === 'h') synth.noise({ start: t, dur: 0.035, vol: vol * 0.5, hp: 7000, out: 'music' });
      else if (tok === 'o') synth.noise({ start: t, dur: 0.16, vol: vol * 0.4, hp: 6000, out: 'music' });
      return;
    }
    synth.tone({ freq: noteFreq(tok), start: t, dur: dur * 0.95, vol, type: tr.ch === 'tri' ? 'tri' : tr.duty ?? 0.5, out: 'music', vib: tr.vib, release: 0.02 });
  }
}

export const music = new Sequencer();
