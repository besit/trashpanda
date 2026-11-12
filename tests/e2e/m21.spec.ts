// End-to-end for M2.1: lives, missions that end on their last beat, the mute shortcut.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { isActive(k: string): boolean } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const sceneIs = (page: Page, s: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP?.scene === k, s, { timeout });
const active = (page: Page, key: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP_GAME?.scene.isActive(k), key, { timeout });
const save = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1') ?? 'null'));

async function seed(page: Page, lives: number) {
  await page.goto('./');
  await page.evaluate((lives) => {
    localStorage.setItem('trashpanda.save.v1', JSON.stringify({ version: 2, upgrades: ['queen_protected_lanes'], completedMissions: ['bike_lane_war'], flags: { sawIntro: true, exploreHint: true }, ratsDefeated: 0, lanesAddedByDogFraud: 0, playTimeMs: 0, lives, player: { scene: 'explore', district: 'downtown', x: -1, y: -1 } }));
  }, lives);
}
const knockOut = (page: Page) => page.evaluate(() => { const p = (window as unknown as W).__TP!.player; p.hp = 0; p.dead = true; });

test('lives: a knock-out costs a life and restarts; out of lives sends you to the map with lives refilled', async ({ page }) => {
  const errors = errorsOf(page);
  await seed(page, 2);
  await page.goto('./?scene=Action&mission=king_of_street');
  await page.waitForFunction(() => (window as unknown as W).__TP?.state && !(window as unknown as W).__TP.state().frozen, null, { timeout: 15_000 });
  await knockOut(page);
  await page.waitForFunction(async () => JSON.parse(localStorage.getItem('trashpanda.save.v1')!).lives === 1, null, { timeout: 8000 });
  // the mission restarts (fresh hearts)
  await page.waitForFunction(() => { const s = (window as unknown as W).__TP?.state?.(); return s && !s.finished && s.hp === 5; }, null, { timeout: 15_000 });
  await page.waitForFunction(() => !(window as unknown as W).__TP.state().frozen, null, { timeout: 15_000 });
  await knockOut(page);
  await sceneIs(page, 'Explore', 15_000); // out of lives: back to the map
  expect((await save(page)).lives).toBe(3);
  expect(errors).toEqual([]);
});

test('King of the Street ends the moment the Bureaucrat Rat falls (no riding on)', async ({ page }) => {
  const errors = errorsOf(page);
  await seed(page, 3);
  await page.goto('./?scene=Action&mission=king_of_street');
  await page.waitForFunction(() => (window as unknown as W).__TP?.state && !(window as unknown as W).__TP.state().frozen, null, { timeout: 15_000 });
  await page.evaluate(() => { (window as unknown as W).__TP!.skipTo(2060); (window as unknown as W).__TP!.player.invulnT = 999; });
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === 'boss', null, { timeout: 8000 });
  await page.waitForTimeout(1600); // the boss intro
  const x0 = await page.evaluate(() => (window as unknown as W).__TP!.state().x);
  await page.evaluate(() => (window as unknown as W).__TP!.boss().takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 424242 }, 0));
  await active(page, 'Cutscene', 12_000); // straight to the debrief
  expect(x0).toBeLessThan(2300);
  expect(errors).toEqual([]);
});

test('Ctrl+M mutes and unmutes (and M alone still opens the map)', async ({ page }) => {
  await seed(page, 3);
  await page.goto('./?scene=Explore');
  await sceneIs(page, 'Explore');
  await page.keyboard.press('Control+m');
  const s1 = await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.settings')!));
  expect(s1.muted).toBe(true);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.isActive('Pause'))).toBe(false);
  await page.keyboard.press('Control+m');
  expect((await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.settings')!))).muted).toBe(false);
});
