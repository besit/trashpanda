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

describe('M2: districts, missions, saves', async () => {
  const fsMod = 'node:fs';
  const fs = await import(/* @vite-ignore */ fsMod);
  const { MISSIONS, missionAvailable } = await import('../../src/data/missions');
  const { UPGRADES } = await import('../../src/data/upgrades');
  const { DISTRICTS } = await import('../../src/data/districts');
  const load = (id: string) => JSON.parse(fs.readFileSync(`public/gen/${id}.json`, 'utf8'));

  it('v1 saves migrate into Queen West', () => {
    const m = migrate({ version: 1, player: { scene: 'explore', x: 100, y: 200 } });
    expect(m?.player.district).toBe('queenwest');
    expect(m?.player.x).toBe(100);
  });
  it('every mission references real upgrades, a real district and a marker on its map', () => {
    for (const m of Object.values(MISSIONS)) {
      for (const u of m.upgrades) expect(UPGRADES[u], u).toBeTruthy();
      expect(DISTRICTS[m.district], m.district).toBeTruthy();
      const map = load(m.district);
      expect(map.markers.some((k: { id: string }) => k.id === m.id), m.id).toBe(true);
      for (const u of m.upgrades) for (const p of UPGRADES[u].mapPatches) expect(map.improvements[p], p).toBeTruthy();
    }
  });
  it('missions 2-4 unlock after the Bike Lane War', () => {
    expect(missionAvailable('streetcar_through', [])).toBe(false);
    for (const id of ['streetcar_through', 'king_of_street', 'slow_down_dog']) expect(missionAvailable(id, ['bike_lane_war'])).toBe(true);
  });
  it('streets continue across district edges at the same rows', () => {
    for (const id of Object.keys(DISTRICTS)) {
      const map = load(id);
      for (const e of map.exits) {
        const other = load(e.to);
        const back = other.exits.find((o: { side: string; to: string; y0: number }) => o.to === id && o.side !== e.side && o.y0 === e.y0);
        expect(back, `${id} ${e.side} -> ${e.to} @${e.y0}`).toBeTruthy();
      }
    }
  });
});
