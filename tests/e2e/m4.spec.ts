// End-to-end for M4: Save the Science's warehouse (on the Waterfront since M4.1), mission 6 (guards + the Wrecker), mission 9 (rails +
// the Mega Rat), mission 10 (the Highway Mech) into the ending, and the stale-scene-data fix.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const tp = (page: Page) => page.evaluate(() => (window as unknown as W).__TP!.state());
const actionReady = (page: Page) => page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
const ride = async (page: Page, to: number) => { await page.evaluate((x) => (window as unknown as W).__TP!.skipTo(x), to - 30); await page.keyboard.down('d'); await page.waitForTimeout(500); await page.keyboard.up('d'); };
const ALL = ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'lane_eater', 'great_parking_lot', 'waterfront_heist', 'island_airport', 'save_the_science', 'finish_the_line', 'bike_bus'];
const UPS = ['queen_protected_lanes', 'queen_tsp', 'king_transit_corridor', 'parkside_calming', 'bloor_lanes_kept', 'parking_to_park', 'public_waterfront', 'quiet_airport', 'science_reopened', 'ontario_line', 'school_street'];
const save = (extra: object) => JSON.stringify({ version: 3, upgrades: [], completedMissions: [], flags: { sawIntro: true, exploreHint: true }, ratsDefeated: 0, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'TST', runId: 'tstm4e2e', player: { scene: 'explore', district: 'queenwest', x: -1, y: -1 }, ...extra });

test('M4.1: Save the Science\'s warehouse is on Queens Quay; its marker starts the mission', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('trashpanda.save.v1', s), save({ completedMissions: ['bike_lane_war', 'streetcar_through', 'king_of_street'], upgrades: ['queen_protected_lanes', 'queen_tsp', 'king_transit_corridor'], player: { scene: 'explore', district: 'waterfront', x: 57 * 16, y: 50 * 16 } }));
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.markers())).toContain('save_the_science');
  expect(await page.evaluate(() => (window as unknown as W).__TP!.map.landmarks.some((l: any) => l.id === 'sciencestore'))).toBe(true);
  expect(errors).toEqual([]);
});

test('Save the Science: a crate hides you from a flashlight; standing in it raises the alarm; the Wrecker reloads', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=save_the_science');
  await actionReady(page);
  // settle behind the crate while the guard looks the other way (a raccoon still in the air isn't hidden)
  await page.waitForFunction(() => (window as unknown as W).__TP!.patrols()[0].rat.facing === 1, null, { timeout: 8000 });
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 99999; const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.body.reset(400, (window as unknown as W).__TP!.gy() - 10); });
  await page.waitForTimeout(250);
  await page.waitForFunction(() => (window as unknown as W).__TP!.patrols()[0].rat.facing === -1, null, { timeout: 8000 });
  await page.waitForTimeout(500);
  expect((await tp(page)).alarms).toBe(0);
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.body.reset(430, (window as unknown as W).__TP!.gy() - 10); });
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().alarms > 0, null, { timeout: 8000 });
  await page.evaluate(() => (window as unknown as W).__TP!.killAll());
  await page.waitForTimeout(1500);
  await ride(page, 2560);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().wrecker?.phase === 'reload', null, { timeout: 25_000 });
  const hp0 = (await tp(page)).wrecker.hp;
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const er = (window as unknown as W).__TP!.wrecker().engineRect(); g.player.body.reset(er.x - 20, (window as unknown as W).__TP!.gy() - 10); g.player.facing = 1; });
  await page.waitForTimeout(100); await page.keyboard.press('e'); await page.waitForTimeout(300);
  expect((await tp(page)).wrecker.hp).toBeLessThan(hp0);
  expect(errors).toEqual([]);
});

test('Finish the Line: the rail piles become track; the Mega Rat pounds shockwaves', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=finish_the_line');
  await actionReady(page);
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 99999; });
  await ride(page, 300); await page.waitForTimeout(1200);
  await page.evaluate(() => (window as unknown as W).__TP!.killAll()); await page.waitForTimeout(1800);
  await ride(page, 860);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === 'depave', null, { timeout: 10_000 });
  for (let i = 0; i < 5; i++) {
    const spots: number[] = (await tp(page)).spots; if (!spots.length) break;
    await page.evaluate((x) => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.body.reset(x - 8, (window as unknown as W).__TP!.gy() - 10); g.player.facing = 1; }, spots[0]);
    for (let k = 0; k < 4; k++) { await page.keyboard.press('e'); await page.waitForTimeout(260); }
  }
  expect((await tp(page)).depaved).toBe(5);
  await page.evaluate(() => (window as unknown as W).__TP!.killAll()); await page.waitForTimeout(2200);
  await ride(page, 1550);
  // rats arrive 450 ms apart: keep clearing until the arena unlocks
  for (let i = 0; i < 10 && (await tp(page)).lock !== null; i++) { await page.waitForTimeout(500); await page.evaluate(() => (window as unknown as W).__TP!.killAll()); }
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === null, null, { timeout: 10_000 });
  await page.waitForTimeout(1200);
  await ride(page, 2150);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().bossMove === 'dizzy', null, { timeout: 30_000 });
  expect((await tp(page)).boss).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Death by Highway unlocks last; beating the Highway Mech leads to the ending and the credits', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = errorsOf(page);
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('trashpanda.save.v1', s), save({ upgrades: UPS, completedMissions: ALL, player: { scene: 'explore', district: 'waterfront', x: -1, y: -1 } }));
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 20_000 });
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.markers())).toContain('death_by_highway');
  await page.goto('./?debug&scene=Action&mission=death_by_highway');
  await actionReady(page);
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 99999; });
  await ride(page, 2150);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().mech?.phase === 'vent', null, { timeout: 20_000 });
  await page.evaluate(() => { const m = (window as unknown as W).__TP!.mech(); for (let i = 0; i < 9; i++) m.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 800 + i }, 'stomp'); });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').platforms.getLength())).toBeGreaterThan(0); // ANOTHER LANE: a slab to stand on
  // the arena's earlier beats are skipped by skipTo; win straight from the boss
  await page.evaluate(() => { const m = (window as unknown as W).__TP!.mech(); for (let i = 0; i < 40 && m.alive; i++) m.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 850 + i }, 'stomp'); });
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().finished, null, { timeout: 20_000 });
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 20_000 });
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); // skip the debrief
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 20_000 });
  // the payoff info box pages through, then the ending cutscene plays
  for (let i = 0; i < 40; i++) {
    if (await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene')?.scene.isActive())) break;
    await page.keyboard.press('e'); await page.waitForTimeout(500);
  }
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); // skip Dog Fjord's concession
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Ending')?.scene.isActive(), null, { timeout: 20_000 });
  await page.waitForTimeout(3800);
  const card: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Ending').children.list.flatMap((o: any) => (o.list ?? [o])).filter((o: any) => o.text).map((o: any) => o.text));
  expect(card.some((t) => t.includes('REPORT CARD'))).toBe(true);
  expect(card.some((t) => t === '12 / 12')).toBe(true); // M4.1: the Bike Bus
  await page.keyboard.press('Enter'); await page.waitForTimeout(600); await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title')?.scene.isActive(), null, { timeout: 20_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1')!).flags.ended)).toBe(true);
  expect(errors).toEqual([]);
});

test('CONTINUE after a mission does not replay its map payoff (stale scene data)', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('trashpanda.save.v1', s), save({ player: { scene: 'explore', district: 'queenwest', x: -1, y: -1 } }));
  await page.goto('./?debug&scene=Action&mission=bike_lane_war');
  await actionReady(page);
  await page.evaluate(() => (window as unknown as W).__TP!.win());
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 20_000 });
  await page.waitForTimeout(400); await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 20_000 });
  for (let i = 0; i < 20 && await page.evaluate(() => (window as unknown as W).__TP!.busy()); i++) { await page.keyboard.press('e'); await page.waitForTimeout(500); }
  // pause -> save + quit -> CONTINUE
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(() => { const p = (window as unknown as W).__TP_GAME!.scene.getScene('Pause'); p.items.find((i: any) => i.label().startsWith('SAVE')).act(); });
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(600); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await page.evaluate(() => { const t = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); t.items.find((i: any) => i.label === 'CONTINUE').action(); });
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.busy())).toBe(false); // no payoff sequence running
});
