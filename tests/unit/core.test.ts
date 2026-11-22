import { describe, it, expect, beforeEach } from 'vitest';
import { livability, categories, START_LIVABILITY } from '../../src/core/Livability';
import { MISSIONS } from '../../src/data/missions';
import { NETWORK, NETWORK_TOTAL, networkDone, missionNetwork } from '../../src/data/network';
import { newGame, migrate, unlockUpgrade, completeMission, SAVE_VERSION } from '../../src/core/GameState';
import { SaveSystem } from '../../src/core/SaveSystem';
import { BASE_CATEGORIES } from '../../src/data/upgrades';

describe('livability', () => {
  it('starts at 60 (Toronto)', () => {
    expect(livability([])).toBe(START_LIVABILITY);
  });
  it('adds upgrade points and ignores unknown ids', () => {
    expect(livability(['queen_protected_lanes'])).toBe(64);
    expect(livability(['nope'])).toBe(60);
  });
  it('reaches exactly 100 with every mission done (M4.3: rebalanced for the Dock Drop)', () => {
    const all = Object.values(MISSIONS).flatMap((m) => m.upgrades);
    expect(START_LIVABILITY + all.reduce((t, u) => t + (livability([u]) - START_LIVABILITY), 0)).toBe(100);
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
    const s = newGame(); s.flags.metDogFjord = true;
    expect(SaveSystem.importString(SaveSystem.exportString(s))).toEqual(s);
    expect(SaveSystem.importString('not base64!!')).toBeNull();
  });
  it('survives a corrupt save', () => {
    SaveSystem.store!.setItem('trashpanda.save.v1', '{oops');
    expect(SaveSystem.load()).toBeNull();
  });
});

describe('M2: districts, missions, saves', async () => {
  // generate the maps directly (no dependency on `npm run assets` having run, e.g. in CI)
  const GEN: Record<string, string> = { queenwest: 'generateQueenWest', highpark: 'generateHighPark', downtown: 'generateDowntown', eastend: 'generateEastEnd', waterfront: 'generateWaterfront' };
  const maps: Record<string, any> = {};
  for (const id of Object.keys(GEN)) { const path = `../../tools/map/${id}.mjs`; const m = await import(/* @vite-ignore */ path); maps[id] = m[GEN[id]](); }
  const { MISSIONS, missionAvailable } = await import('../../src/data/missions');
  const { UPGRADES } = await import('../../src/data/upgrades');
  const { DISTRICTS } = await import('../../src/data/districts');
  const load = (id: string) => maps[id];

  it('M4.1: a save standing in the dropped North district starts again in Queen West', () => {
    const m = migrate({ version: 3, player: { scene: 'explore', district: 'north', x: 900, y: 500 } });
    expect(m?.player).toEqual({ scene: 'explore', district: 'queenwest', x: -1, y: -1 });
  });
  it('M4.1: Save the Science sits on the Waterfront; no district leads north', () => {
    expect(MISSIONS.save_the_science.district).toBe('waterfront');
    expect(DISTRICTS.north).toBeUndefined();
    expect(load('waterfront').markers.some((m: any) => m.id === 'save_the_science')).toBe(true);
    expect(load('waterfront').improvements.science_reopened.removeTag).toBe('boards');
    for (const id of Object.keys(maps)) expect(maps[id].exits.every((e: any) => e.to in DISTRICTS)).toBe(true);
  });
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
  it('M4.15: districts open as their missions appear, and every open district can be reached through open ones', async () => {
    const { districtOpen, missionOrder, START_DISTRICT } = await import('../../src/data/missions');
    const openAt = (done: string[]) => Object.keys(DISTRICTS).filter((d) => districtOpen(d, done)).sort();
    expect(openAt([])).toEqual([START_DISTRICT]);
    expect(openAt(['bike_lane_war'])).toEqual(['downtown', 'highpark', 'queenwest']);
    const done: string[] = [];
    for (const id of [...missionOrder(), '']) {
      const open = new Set(openAt(done)), seen = new Set([START_DISTRICT]), todo = [START_DISTRICT];
      while (todo.length) for (const e of load(todo.pop()!).exits ?? []) if (open.has(e.to) && !seen.has(e.to)) { seen.add(e.to); todo.push(e.to); }
      expect([...seen].sort(), `after ${done.length} missions`).toEqual([...open].sort());
      if (id) { expect(open.has(MISSIONS[id].district), id).toBe(true); done.push(id); }
    }
    expect(openAt(done)).toEqual(Object.keys(DISTRICTS).sort());
  });
  it('streets continue across district edges (matched by name, on the opposite edge, or around a corner)', () => {
    // M3.2: High Park's south edge meets the Waterfront's WEST end (the trail), so a connection may turn a
    // corner; it still has to come back by the same street name
    const CORNERS = new Set(['highpark s waterfront trail', 'waterfront w highpark trail']);
    for (const id of Object.keys(DISTRICTS)) {
      const map = load(id);
      expect(map.lifeTokens.length, `${id} hearts`).toBe(2); // M3.3: one in the open, one hidden behind a building
      for (const e of map.exits) {
        const other = load(e.to);
        // matched by street name: rows may differ between districts
        const opposite: Record<string, string> = { w: 'e', e: 'w', n: 's', s: 'n' };
        const corner = CORNERS.has(`${id} ${e.side} ${e.to} ${e.street}`);
        // M3.3: an exit may name the street it ARRIVES on (`arrive`); such connections may land on any side
        const want = e.arrive ?? e.street;
        const back = other.exits.find((o: { side: string; to: string; street: string }) => o.to === id && (corner || e.arrive || o.side === opposite[e.side]) && o.street === want);
        expect(back, `${id} ${e.side} -> ${e.to} (${e.street})`).toBeTruthy();
      }
    }
  });
});

describe('M3.1: difficulty + score', () => {
  it('difficulty sets hits per life and multiplies points', async () => {
    const { award, awardOnce, hitsPerLife, POINTS } = await import('../../src/core/Score');
    const easy = newGame('easy'), hard = newGame('hard'), normal = newGame();
    expect([hitsPerLife(easy), hitsPerLife(normal), hitsPerLife(hard)]).toEqual([7, 5, 3]);
    expect(award(easy, 'rat')).toBe(POINTS.rat);
    expect(award(normal, 'rat')).toBe(Math.round(POINTS.rat * 1.5));
    expect(award(hard, 'mission')).toBe(POINTS.mission * 2);
    expect(hard.score).toBe(POINTS.mission * 2);
    // plaques / hearts / eggs count once per run
    expect(awardOnce(normal, 'plaque_x', 'plaque')).toBeGreaterThan(0);
    expect(awardOnce(normal, 'plaque_x', 'plaque')).toBe(0);
  });
  it('v2 saves become a normal run with a score of 0', () => {
    const s = migrate({ version: 2, upgrades: [], completedMissions: ['bike_lane_war'], lives: 2 })!;
    expect(s.version).toBe(SAVE_VERSION);
    expect([s.difficulty, s.score, s.name]).toEqual(['normal', 0, 'RAC']);
    expect(s.runId).toBeTruthy();
    expect(migrate({ version: 3, difficulty: 'impossible', score: -5, name: 'toolong' })!.difficulty).toBe('normal');
  });
});

describe('the bike network (M4.3)', () => {
  it('starts with the Martin Goodman Trail and ends with every street', () => {
    expect(networkDone([]).map((s) => s.id)).toEqual(['wf_queensquay']);
    expect(networkDone(Object.keys(MISSIONS)).length).toBe(NETWORK_TOTAL);
  });
  it('every mission adds streets to it, and every street belongs to a real mission', () => {
    for (const id of Object.keys(MISSIONS)) expect(missionNetwork(id).length).toBeGreaterThan(0);
    for (const s of NETWORK) if (s.by) expect(MISSIONS[s.by]).toBeDefined();
    expect(new Set(NETWORK.map((s) => s.id)).size).toBe(NETWORK.length);
  });
  it("every street is on its districts map, with a patch that changes it", async () => {
    type Gen = () => { network: { id: string; patch?: string }[]; improvements: Record<string, { tiles: unknown[]; addProps: unknown[] }> };
    const mod = (n: string): Promise<Record<string, Gen>> => import(`../../tools/map/${n}.mjs`);
    const gens: Record<string, Gen> = {
      queenwest: (await mod('queenwest')).generateQueenWest, highpark: (await mod('highpark')).generateHighPark,
      downtown: (await mod('downtown')).generateDowntown, eastend: (await mod('eastend')).generateEastEnd, waterfront: (await mod('waterfront')).generateWaterfront,
    };
    const maps = Object.fromEntries(Object.entries(gens).map(([k, g]) => [k, g()]));
    for (const s of NETWORK) {
      const seg = maps[s.district].network.find((n) => n.id === s.id);
      expect(seg, s.id).toBeDefined();
      if (s.by === null) continue;
      const imp = maps[s.district].improvements[seg!.patch ?? `net_${s.id}`];
      expect(imp, s.id).toBeDefined();
      expect(imp.tiles.length + imp.addProps.length, s.id).toBeGreaterThan(0);
    }
  }, 60_000);
});
