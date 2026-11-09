import { describe, it, expect, beforeEach } from 'vitest';
import { livability, tierName, categories, START_LIVABILITY } from '../../src/core/Livability';
import { newGame, migrate, unlockUpgrade, completeMission, SAVE_VERSION } from '../../src/core/GameState';
import { SaveSystem } from '../../src/core/SaveSystem';
import { BASE_CATEGORIES } from '../../src/data/upgrades';

describe('livability', () => {
  it('starts at 60 (Toronto)', () => {
    expect(livability([])).toBe(START_LIVABILITY);
    expect(tierName(60)).toBe('TORONTO');
  });
  it('adds upgrade points and ignores unknown ids', () => {
    expect(livability(['queen_protected_lanes'])).toBe(64);
    expect(livability(['nope'])).toBe(60);
  });
  it('maps tiers at boundaries', () => {
    expect(tierName(64)).toBe('TORONTO');
    expect(tierName(65)).toBe('BETTER TORONTO');
    expect(tierName(90)).toBe('AMSTERDAM/COPENHAGEN TERRITORY');
    expect(tierName(100)).toBe('RACCOON UTOPIA');
  });
  it('applies category deltas capped at 100', () => {
    const c = categories(['queen_protected_lanes']);
    expect(c.cycling).toBe(BASE_CATEGORIES.cycling + 14);
    expect(Object.values(c).every((v) => v <= 100)).toBe(true);
  });
});

describe('game state', () => {
  it('unlocks an upgrade once and reports the change', () => {
    const s = newGame();
    expect(unlockUpgrade(s, 'queen_protected_lanes')).toEqual({ before: 60, after: 64 });
    expect(unlockUpgrade(s, 'queen_protected_lanes')).toBeNull();
  });
  it('completes a mission idempotently', () => {
    const s = newGame();
    completeMission(s, 'bike_lane_war', ['queen_protected_lanes']);
    completeMission(s, 'bike_lane_war', ['queen_protected_lanes']);
    expect(s.completedMissions).toEqual(['bike_lane_war']);
    expect(s.upgrades).toEqual(['queen_protected_lanes']);
  });
  it('migrates partial/old saves and rejects garbage', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate({ version: 999 })).toBeNull();
    const m = migrate({ version: 1, upgrades: ['queen_protected_lanes', 'bogus', 3] });
    expect(m?.upgrades).toEqual(['queen_protected_lanes']);
    expect(m?.version).toBe(SAVE_VERSION);
    expect(m?.flags).toEqual({});
  });
});

describe('save system', () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    SaveSystem.store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
  });
  it('round-trips state', () => {
    const s = newGame(); s.ratsDefeated = 12; unlockUpgrade(s, 'queen_protected_lanes');
    expect(SaveSystem.save(s)).toBe(true);
    expect(SaveSystem.load()).toEqual(s);
  });
  it('export/import string round-trips', () => {
    const s = newGame(); s.flags.metDogFraud = true;
    expect(SaveSystem.importString(SaveSystem.exportString(s))).toEqual(s);
    expect(SaveSystem.importString('not base64!!')).toBeNull();
  });
  it('survives a corrupt save', () => {
    SaveSystem.store!.setItem('trashpanda.save.v1', '{oops');
    expect(SaveSystem.load()).toBeNull();
  });
});
