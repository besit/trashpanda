// Process-wide game context: the single GameState shared by every scene + settings.
import { newGame, type GameState } from './GameState';
import { HighScores, type Difficulty } from './Score';
import { SaveSystem, type Settings } from './SaveSystem';
import { synth } from '../audio/Synth';

export const ctx = {
  state: newGame() as GameState,
  settings: SaveSystem.loadSettings() as Settings,
  sessionStart: 0,
  newGame(difficulty: Difficulty = 'normal', name = 'RAC') { this.state = newGame(difficulty, name); this.sessionStart = performance.now(); },
  continue(): boolean { const s = SaveSystem.load(); if (!s) return false; this.state = s; this.sessionStart = performance.now(); return true; },
  save() {
    const now = performance.now();
    if (this.sessionStart) { this.state.playTimeMs += now - this.sessionStart; this.sessionStart = now; }
    SaveSystem.save(this.state);
    HighScores.record(this.state);
  },
  applySettings() { const m = this.settings.muted; synth.setVolumes(m ? 0 : this.settings.music, m ? 0 : this.settings.sfx); SaveSystem.saveSettings(this.settings); },
  /** Ctrl+M (M2.1): mute everything / restore the chosen volumes */
  toggleMute() { this.settings.muted = !this.settings.muted; this.applySettings(); return this.settings.muted; },
};
