// End-to-end for M2: districts joined at their street edges, and missions 2-4 from map marker to payoff.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { isActive(k: string): boolean } } };
const T = 16;
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const sceneIs = (page: Page, s: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP?.scene === k, s, { timeout });
const active = (page: Page, key: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP_GAME?.scene.isActive(k), key, { timeout });
const ev = <R>(page: Page, fn: () => R) => page.evaluate(fn);

/** a save where the Bike Lane War is done, so missions 2-4 are open */
async function seed(page: Page, district = 'queenwest') {
  await page.goto('./');
  await page.evaluate((d) => {
    const s = { version: 2, upgrades: ['queen_protected_lanes'], completedMissions: ['bike_lane_war'], flags: { sawIntro: true, exploreHint: true, visited_queenwest: true }, ratsDefeated: 7, lanesAddedByDogFraud: 0, playTimeMs: 0, player: { scene: 'explore', district: d, x: -1, y: -1 } };
    localStorage.setItem('trashpanda.save.v1', JSON.stringify(s));
  }, district);
}

test('districts: Queen West -> High Park -> Queen West -> Downtown along the streets', async ({ page }) => {
  const errors = errorsOf(page);
  await seed(page);
  const key = await page.evaluate(() => Object.keys(localStorage).find((k) => k.includes('save')));
  expect(key).toBeTruthy();
  await page.goto('./?scene=Explore');
  await sceneIs(page, 'Explore');
  const where = () => ev(page, () => (window as unknown as W).__TP!.district as string);
  expect(await where()).toBe('queenwest');
  // ride west off the map along Queen
  await page.evaluate(() => (window as unknown as W).__TP!.teleport(20, 52 * 16 + 8));
  await page.keyboard.down('a'); await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'highpark', null, { timeout: 8000 }); await page.keyboard.up('a');
  await page.waitForTimeout(800);
  const hp = await ev(page, () => (window as unknown as W).__TP!.player());
  expect(hp.x).toBeGreaterThan(100 * T); // arrived at High Park's east edge
  expect(Math.abs(hp.y - (52 * 16 + 8))).toBeLessThan(24); // on the same street
  // and back east
  await page.keyboard.down('d'); await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'queenwest', null, { timeout: 8000 }); await page.keyboard.up('d');
  await page.waitForTimeout(800);
  // ride east into Downtown
  const W0 = await ev(page, () => (window as unknown as W).__TP!.map.width * 16);
  await page.evaluate((x) => (window as unknown as W).__TP!.teleport(x - 20, 52 * 16 + 8), W0);
  await page.keyboard.down('d'); await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'downtown', null, { timeout: 8000 }); await page.keyboard.up('d');
  await page.waitForTimeout(800);
  // the district persists in the save
  expect(await ev(page, () => (window as unknown as W).__TP!.state.player.district)).toBe('downtown');
  // mission markers: King of the Street is offered downtown
  expect(await ev(page, () => (window as unknown as W).__TP!.markers())).toContain('king_of_street');
  expect(errors).toEqual([]);
});

for (const [id, district, check] of [
  ['streetcar_through', 'queenwest', 'escort'],
  ['king_of_street', 'downtown', 'combat'],
  ['slow_down_dog', 'highpark', 'chase'],
] as const) {
  test(`mission ${id}: marker -> briefing -> action -> debrief -> the map changes`, async ({ page }) => {
    const errors = errorsOf(page);
    await seed(page, district);
    await page.goto('./?scene=Explore');
    await sceneIs(page, 'Explore');
    await page.waitForTimeout(600);
    expect(await ev(page, () => (window as unknown as W).__TP!.markers())).toContain(id);
    await page.evaluate((m) => (window as unknown as W).__TP!.startMission(m), id);
    await active(page, 'Cutscene');
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await sceneIs(page, 'Action');
    await page.waitForFunction(() => !(window as unknown as W).__TP!.state().frozen, null, { timeout: 8000 });
    // a real taste of the mechanic before the debug win
    if (check === 'escort') {
      // the streetcar moves on its own; pumping the first signal's call box grants priority
      await page.keyboard.down('d'); await page.waitForTimeout(1200); await page.keyboard.up('d');
      const s1 = await ev(page, () => (window as unknown as W).__TP!.state());
      expect(s1.escort.car).toBeGreaterThan(-30);
    } else if (check === 'combat') {
      await page.keyboard.down('d'); await page.waitForTimeout(2600); await page.keyboard.up('d');
      await page.waitForTimeout(600);
      const s1 = await ev(page, () => (window as unknown as W).__TP!.state());
      expect(s1.wave).toBeGreaterThanOrEqual(1); // the first arena wave triggered
      expect(s1.lock).toBe('wave');
    } else {
      // boost after the haulers: the gap closes
      const g0 = await ev(page, () => { const s = (window as unknown as W).__TP!.state(); return s.haul - s.x; });
      await page.keyboard.down('d'); await page.keyboard.down('Shift'); await page.waitForTimeout(1500); await page.keyboard.up('Shift'); await page.keyboard.up('d');
      const g1 = await ev(page, () => { const s = (window as unknown as W).__TP!.state(); return s.haul - s.x; });
      expect(g1).toBeLessThan(g0);
    }
    await page.evaluate(() => (window as unknown as W).__TP!.win());
    await active(page, 'Cutscene', 10_000); // debrief vignette
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await sceneIs(page, 'Explore');
    await page.waitForFunction((m) => (window as unknown as W).__TP!.state.completedMissions.includes(m), id, { timeout: 15_000 });
    await page.waitForFunction(() => !(window as unknown as W).__TP!.busy(), null, { timeout: 25_000 }); // the payoff sweep finishes
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1')!));
    expect(saved.completedMissions).toContain(id);
    expect(saved.upgrades.length).toBe(2);
    expect(errors).toEqual([]);
  });
}
