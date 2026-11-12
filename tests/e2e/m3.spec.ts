// End-to-end for M3: the East End + the Waterfront, N/S district exits, missions 5, 7 and 8.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { isActive(k: string): boolean } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const sceneIs = (page: Page, s: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP?.scene === k, s, { timeout });
const active = (page: Page, key: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP_GAME?.scene.isActive(k), key, { timeout });

const PRE = {
  missions: ['bike_lane_war', 'king_of_street', 'slow_down_dog'],
  upgrades: ['queen_protected_lanes', 'king_transit_corridor', 'parkside_calming'],
};
async function seed(page: Page, district: string) {
  await page.goto('./');
  await page.evaluate(([district, pre]) => {
    localStorage.setItem('trashpanda.save.v1', JSON.stringify({ version: 2, upgrades: pre.upgrades, completedMissions: pre.missions, flags: { sawIntro: true, exploreHint: true }, ratsDefeated: 0, lanesAddedByDogFraud: 0, playTimeMs: 0, lives: 3, player: { scene: 'explore', district, x: -1, y: -1 } }));
  }, [district, PRE] as const);
}

test('N/S exits: University Ave rides from Downtown down to the Waterfront and back', async ({ page }) => {
  const errors = errorsOf(page);
  await seed(page, 'downtown');
  await page.goto('./?scene=Explore');
  await sceneIs(page, 'Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'downtown');
  await page.waitForTimeout(600);
  await page.evaluate(() => (window as unknown as W).__TP!.teleport(71.5 * 16, 98 * 16));
  await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 10_000 });
  await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(800);
  const p = await page.evaluate(() => (window as unknown as W).__TP!.player());
  expect(Math.abs(p.x - 71.5 * 16)).toBeLessThan(24); // same column: University lines up on both maps
  expect(p.y).toBeLessThan(60);                       // arrived at the north edge
  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'downtown', null, { timeout: 10_000 });
  await page.keyboard.up('ArrowUp');
  expect(errors).toEqual([]);
});

for (const [id, district, check] of [
  ['lane_eater', 'highpark', 'autoscroll'],
  ['great_parking_lot', 'eastend', 'depave'],
  ['waterfront_heist', 'waterfront', 'fences'],
] as const) {
  test(`mission ${id}: marker -> briefing -> action -> debrief -> the map changes`, async ({ page }) => {
    const errors = errorsOf(page);
    await seed(page, district);
    await page.goto('./?scene=Explore');
    await sceneIs(page, 'Explore');
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => (window as unknown as W).__TP!.markers())).toContain(id);
    await page.evaluate((m) => (window as unknown as W).__TP!.startMission(m), id);
    await active(page, 'Cutscene');
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await sceneIs(page, 'Action');
    await page.waitForFunction(() => !(window as unknown as W).__TP!.state().frozen, null, { timeout: 8000 });
    await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 999; });
    if (check === 'autoscroll') {
      // the camera pushes forward on its own (the Lane Eater is behind you)
      const x0 = await page.evaluate(() => (window as unknown as W).__TP!.state().camX);
      await page.waitForTimeout(1500);
      const x1 = await page.evaluate(() => (window as unknown as W).__TP!.state().camX);
      expect(x1).toBeGreaterThan(x0 + 40);
    } else {
      // jump to the locked arena: patches (M7) / fences (M8) to pump
      const at = check === 'depave' ? 1260 : 1360;
      await page.evaluate((x) => (window as unknown as W).__TP!.skipTo(x), at);
      await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === 'depave', null, { timeout: 8000 });
    }
    await page.evaluate(() => (window as unknown as W).__TP!.win());
    await active(page, 'Cutscene', 10_000); // debrief vignette
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await sceneIs(page, 'Explore');
    await page.waitForFunction((m) => (window as unknown as W).__TP!.state.completedMissions.includes(m), id, { timeout: 15_000 });
    for (let i = 0; i < 40 && (await page.evaluate(() => (window as unknown as W).__TP!.busy())); i++) { await page.waitForTimeout(700); await page.keyboard.press('e'); }
    expect(await page.evaluate(() => (window as unknown as W).__TP!.busy())).toBe(false);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1')!));
    expect(saved.completedMissions).toContain(id);
    expect(saved.upgrades.length).toBe(PRE.upgrades.length + 1);
    expect(errors).toEqual([]);
  });
}
