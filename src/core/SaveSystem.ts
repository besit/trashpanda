import { migrate, type GameState } from './GameState';

const KEY = 'trashpanda.save.v1';
const SETTINGS_KEY = 'trashpanda.settings';

export interface Settings { music: number; sfx: number; shake: boolean; touch: 'auto' | 'on' | 'off' }
export const DEFAULT_SETTINGS: Settings = { music: 0.7, sfx: 0.8, shake: true, touch: 'auto' };

interface StorageLike { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

function storage(): StorageLike | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}

export const SaveSystem = {
  store: storage() as StorageLike | null,
  load(): GameState | null {
    try { const raw = this.store?.getItem(KEY); return raw ? migrate(JSON.parse(raw)) : null; } catch { return null; }
  },
  save(state: GameState): boolean {
    try { this.store?.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
  },
  clear() { try { this.store?.removeItem(KEY); } catch { /* ignore */ } },
  hasSave(): boolean { return this.load() !== null; },
  exportString(state: GameState): string { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); },
  importString(s: string): GameState | null { try { return migrate(JSON.parse(decodeURIComponent(escape(atob(s.trim()))))); } catch { return null; } },
  loadSettings(): Settings {
    try { const raw = this.store?.getItem(SETTINGS_KEY); return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }; } catch { return { ...DEFAULT_SETTINGS }; }
  },
  saveSettings(s: Settings) { try { this.store?.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ } },
};
