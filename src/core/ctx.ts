// Process-wide game context: the single GameState shared by every scene + settings.
import { newGame, type GameState } from './GameState';
import { SaveSystem, type Settings } from './SaveSystem';
import { synth } from '../audio/Synth';

export const ctx = {
  state: newGame() as GameState,
  settings: SaveSystem.loadSettings() as Settings,
  sessionStart: 0,
  newGame() { this.state = newGame(); this.sessionStart = performance.now(); },
  continue(): boolean { const s = SaveSystem.load(); if (!s) return false; this.state = s; this.sessionStart = performance.now(); return true; },
  save() {
    const now = performance.now();
    if (this.sessionStart) { this.state.playTimeMs += now - this.sessionStart; this.sessionStart = now; }
    SaveSystem.save(this.state);
  },
  applySettings() { synth.setVolumes(this.settings.music, this.settings.sfx); SaveSystem.saveSettings(this.settings); },
};
