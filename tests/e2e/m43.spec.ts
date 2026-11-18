// End-to-end for M4.3 (Ivan's notes after M4.2): the bike network grows with every mission (and the Livability tier
// names are gone), Strachan's painted lanes, the Dock Drop (bike share), the boss checkpoint, mission ranks.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any; isActive(k: string): boolean } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const actionReady = (page: Page) => page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
const save = (extra: object) => JSON.stringify({ version: 4, upgrades: [], completedMissions: [], flags: { sawIntro: true, exploreHint: true, visited_queenwest: true, visited_downtown: true }, ratsDefeated: 0, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'TST', runId: 'tstm43e2e', ranks: {}, player: { scene: 'explore', district: 'downtown', x: -1, y: -1 }, ...extra });
const explore = async (page: Page, district: string, extra: object) => {
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('trashpanda.save.v1', s), save({ player: { scene: 'explore', district, x: -1, y: -1 }, ...extra }));
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction((d) => (window as unknown as W).__TP?.district === d, district, { timeout: 20_000 });
  await page.waitForTimeout(800);
};

test('the bike network: the Bike Lane War adds Queen across town; the HUD counts streets, no tier names', async ({ page }) => {
  const errors = errorsOf(page);
  await explore(page, 'downtown', {});
  expect(await page.evaluate(() => (window as unknown as W).__TP!.hudTier())).toBe('BIKE NETWORK 1/28');
  expect(await page.evaluate(() => (window as unknown as W).__TP!.applied('net_dt_queen'))).toBe(false);
  await explore(page, 'downtown', { completedMissions: ['bike_lane_war'], upgrades: ['queen_protected_lanes'] });
  expect(await page.evaluate(() => (window as unknown as W).__TP!.hudTier())).toBe('BIKE NETWORK 3/28');
  expect(await page.evaluate(() => (window as unknown as W).__TP!.applied('net_dt_queen'))).toBe(true);
  // the city map draws the network and says what the colours mean
  await page.keyboard.press('m'); await page.waitForTimeout(800);
  const texts: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').root.list.filter((o: any) => o.text).map((o: any) => o.text));
  expect(texts).toContain('PROTECTED');
  expect(texts).toContain('SLOW STREET');
  expect(texts.join(' ')).not.toContain('AMSTERDAM');
  expect(errors).toEqual([]);
});

test('Strachan has painted bike lanes from the start, with cyclists in them', async ({ page }) => {
  const errors = errorsOf(page);
  await explore(page, 'queenwest', {});
  const lanes = await page.evaluate(() => (window as unknown as W).__TP!.map.lanes.filter((l: any) => l.id.startsWith('qw_strachan_bike')).map((l: any) => ({ id: l.id, requires: l.requires ?? null })));
  expect(lanes).toEqual([{ id: 'qw_strachan_bike_sb', requires: null }, { id: 'qw_strachan_bike_nb', requires: null }]);
  expect(errors).toEqual([]);
});

test('the Dock Drop: set all six docks, ring the clutter crew off, win', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = errorsOf(page);
  await explore(page, 'downtown', { completedMissions: ['bike_lane_war', 'king_of_street'], upgrades: ['queen_protected_lanes', 'king_transit_corridor'] });
  expect(await page.evaluate(() => (window as unknown as W).__TP!.markers())).toContain('dock_drop');
  await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').scene.start('Explore', { district: 'downtown', bikebus: 'dock_drop' }));
  await page.waitForFunction(() => (window as unknown as W).__TP?.bus?.()?.gaps, null, { timeout: 20_000 });
  const gaps: { x: number; y: number }[] = await page.evaluate(() => (window as unknown as W).__TP!.bus().gaps);
  expect(gaps.length).toBe(6);
  let rung = 0;
  for (let round = 0; round < 3; round++) {
    for (const g of gaps) {
      const done = await page.evaluate((g) => { const b = (window as unknown as W).__TP!.bus?.(); return !b || b.state !== 'ride' || b.gaps.find((x: any) => x.x === g.x && x.y === g.y).set; }, g);
      if (done) continue;
      await page.evaluate((g) => (window as unknown as W).__TP!.teleport(g.x, g.y + 4), g);
      await page.waitForTimeout(900);
      // a crew rat coming for it: keep ringing until it runs
      for (let i = 0; i < 30 && await page.evaluate(() => ((window as unknown as W).__TP!.bus?.()?.crewCount ?? 0) > 0); i++) {
        await page.waitForTimeout(300); await page.keyboard.press('e'); rung++;
      }
    }
  }
  await page.waitForFunction(() => { const b = (window as unknown as W).__TP!.bus?.(); return !b || b.state === 'won'; }, null, { timeout: 10_000 });
  expect(rung).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('a lost life at the boss restarts at the boss (checkpoint), and the win card shows a rank that is saved', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=great_parking_lot');
  await actionReady(page);
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); s.depaveDone = true; s.depave = { update() {}, finish() {}, allDone: true, done: 5, total: 5 }; s.waveIdx = 9; (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(1840); });
  await page.keyboard.down('d'); await page.waitForTimeout(400); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.monster?.(), null, { timeout: 10_000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const p = (window as unknown as W).__TP!.player; p.invulnT = 0; p.hp = 1; p.hurt(p.sprite.x + 10); });
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').atCheckpoint === true && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 15_000 });
  const st = await page.evaluate(() => (window as unknown as W).__TP!.state());
  expect(st.x).toBeGreaterThan(1500); // at the boss, not the start of the street
  await page.evaluate(() => { void (window as unknown as W).__TP!.win(); });
  await page.waitForTimeout(600);
  const card: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').children.list.filter((o: any) => o.text).map((o: any) => o.text));
  expect(card.join(' ')).toMatch(/RANK A {2}\(1 HIT\)/); // the hit from the life lost counts
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('trashpanda.save.v1') ?? '{}').ranks?.great_parking_lot, null, { timeout: 10_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1')!).ranks.great_parking_lot.rank)).toBe('A');
  expect(errors).toEqual([]);
});
