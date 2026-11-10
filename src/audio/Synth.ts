// Tiny NES-style chip synth: 2 pulse channels (selectable duty), triangle, noise.
// Everything is synthesized at runtime: zero audio downloads.

export type Duty = 0.125 | 0.25 | 0.5;

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

export function noteFreq(note: string): number {
  const m = /^([A-G](?:#|b)?)(-?\d)$/.exec(note);
  if (!m) return 0;
  const n = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12; // MIDI number
  return 440 * Math.pow(2, (n - 69) / 12);
}

export class Synth {
  ctx: AudioContext | null = null;
  master!: GainNode;
  music!: GainNode;
  sfx!: GainNode;
  private waves = new Map<Duty, PeriodicWave>();
  private noiseBuf: AudioBuffer | null = null;
  private volumes = { music: 0.7, sfx: 0.8 };

  /** Must be called from a user gesture. Safe to call repeatedly. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.5;
      // gentle lowpass + compressor glue the channels together
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 3;
      this.master.connect(comp).connect(this.ctx.destination);
      this.music = this.ctx.createGain(); this.music.gain.value = this.volumes.music; this.music.connect(this.master);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = this.volumes.sfx; this.sfx.connect(this.master);
      for (const d of [0.125, 0.25, 0.5] as Duty[]) this.waves.set(d, this.pulseWave(d));
      const len = this.ctx.sampleRate * 1;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      let lfsr = 1;
      for (let i = 0; i < len; i++) { // NES-like LFSR noise, held for a few samples for grit
        if (i % 4 === 0) { const bit = (lfsr ^ (lfsr >> 1)) & 1; lfsr = (lfsr >> 1) | (bit << 14); }
        data[i] = (lfsr & 1) ? 0.8 : -0.8;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  get now() { return this.ctx?.currentTime ?? 0; }
  get ready() { return !!this.ctx && this.ctx.state === 'running'; }

  private ducked = false;
  setVolumes(music: number, sfx: number) {
    this.volumes = { music, sfx };
    this.applyGains();
  }
  /** Lower the music (pause menu) without touching the saved volume. */
  duck(on: boolean) { this.ducked = on; this.applyGains(); }
  private applyGains() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.music.gain.setTargetAtTime(this.volumes.music * (this.ducked ? 0.3 : 1), t, 0.05);
    this.sfx.gain.setTargetAtTime(this.volumes.sfx, t, 0.02);
  }

  private pulseWave(duty: number): PeriodicWave {
    const n = 32, real = new Float32Array(n), imag = new Float32Array(n);
    for (let k = 1; k < n; k++) { real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty); }
    return this.ctx!.createPeriodicWave(real, imag);
  }

  /** Play a tone. type: pulse duty or 'tri'. Optional pitch slide to `slideTo` Hz and vibrato. */
  tone(opts: { freq: number; start?: number; dur: number; vol?: number; type?: Duty | 'tri' | 'sine'; slideTo?: number; out?: 'music' | 'sfx'; vib?: number; attack?: number; release?: number }) {
    if (!this.ctx || opts.freq <= 0) return;
    const ctx = this.ctx;
    const t = opts.start ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const type = opts.type ?? 0.5;
    if (type === 'tri') osc.type = 'triangle';
    else if (type === 'sine') osc.type = 'sine';
    else osc.setPeriodicWave(this.waves.get(type)!);
    osc.frequency.setValueAtTime(opts.freq, t);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slideTo), t + opts.dur);
    if (opts.vib) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 6; lg.gain.value = opts.freq * opts.vib;
      lfo.connect(lg).connect(osc.frequency); lfo.start(t); lfo.stop(t + opts.dur + 0.05);
    }
    const g = ctx.createGain();
    const vol = (opts.vol ?? 0.3) * (type === 'tri' ? 1.6 : 1);
    const a = opts.attack ?? 0.004, rel = opts.release ?? 0.03;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.setValueAtTime(vol, t + Math.max(a, opts.dur - rel));
    g.gain.linearRampToValueAtTime(0, t + opts.dur);
    osc.connect(g).connect(opts.out === 'music' ? this.music : this.sfx);
    osc.start(t); osc.stop(t + opts.dur + 0.02);
  }

  noise(opts: { start?: number; dur: number; vol?: number; hp?: number; lp?: number; out?: 'music' | 'sfx'; decay?: boolean }) {
    if (!this.ctx || !this.noiseBuf) return;
    const ctx = this.ctx, t = opts.start ?? ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    src.playbackRate.value = 0.5 + Math.random();
    let node: AudioNode = src;
    if (opts.hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = opts.hp; node.connect(f); node = f; }
    if (opts.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.lp; node.connect(f); node = f; }
    const g = ctx.createGain(), vol = opts.vol ?? 0.2;
    g.gain.setValueAtTime(vol, t);
    if (opts.decay !== false) g.gain.exponentialRampToValueAtTime(0.001, t + opts.dur);
    else g.gain.setValueAtTime(0, t + opts.dur);
    node.connect(g).connect(opts.out === 'music' ? this.music : this.sfx);
    src.start(t, Math.random() * 0.5); src.stop(t + opts.dur + 0.02);
  }
}

export const synth = new Synth();
