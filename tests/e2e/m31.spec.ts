// End-to-end for M3.1 (Ivan's M3 review): difficulty + initials, the Lane Eater scrolling at ANY frame
// rate, turning traffic at the Waterfront, the score.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { isActive(k: string): boolean; getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const sceneIs = (page: Page, s: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP?.scene === k, s, { timeout });

test('new game: pick HARD, enter initials -> a hard run (3 hits a life) with those initials', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.waitForTimeout(1500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);      // NEW GAME -> difficulty (NORMAL selected)
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(150);  // HARD
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);      // -> initials
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(100);  // R -> Q
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(150); }
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Cutscene'), null, { timeout: 10_000 });
  await page.keyboard.press('Escape');
  await sceneIs(page, 'Explore');
  const s = await page.evaluate(() => (window as unknown as W).__TP!.state);
  expect(s.difficulty).toBe('hard');
  expect(s.name).toBe('QAC');
  // a mission on this run: the health bar has 3 segments
  await page.goto('./?debug&scene=Action&mission=bike_lane_war');
  await page.waitForFunction(() => (window as unknown as W).__TP?.state && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 15_000 });
  expect(await page.evaluate(() => (window as unknown as W).__TP!.player.maxHp)).toBe(3);
  expect(errors).toEqual([]);
});

test('Waterfront: traffic coming down Spadina/University/Bay turns onto Queens Quay', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await sceneIs(page, 'Explore');
  await page.evaluate(() => (window as unknown as W).__TP!.goto('waterfront'));
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront');
  // a vehicle mid-corner, drawn with a 45-degree frame
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').traffic.vehicles.some((v: any) => v.turning && /_(NE|NW|SE|SW)$/.test(v.s.frame.name)), null, { timeout: 30_000 });
  // and the Gardiner's cars sit above everything on the ground, below the HUD
  const d = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').traffic.vehicles.filter((v: any) => v.lane.elevated).map((v: any) => v.s.depth));
  expect(d.length).toBeGreaterThan(0);
  for (const x of d) { expect(x).toBeGreaterThan(10000); expect(x).toBeLessThan(20000); }
  expect(errors).toEqual([]);
});

test('reading a plaque scores once', async ({ page }) => {
  await page.goto('./?debug&scene=Explore');
  await sceneIs(page, 'Explore');
  await page.evaluate(() => (window as unknown as W).__TP!.goto('eastend'));
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'eastend');
  await page.waitForTimeout(800);
  const l = await page.evaluate(() => (window as unknown as W).__TP!.map.landmarks.find((x: any) => x.id === 'donjail'));
  await page.evaluate(([x, y]) => (window as unknown as W).__TP!.teleport(x, y), [l.x, l.y + 20]);
  await page.waitForTimeout(300);
  const s0 = await page.evaluate(() => (window as unknown as W).__TP!.state.score);
  await page.keyboard.press('e'); await page.waitForTimeout(400);
  const s1 = await page.evaluate(() => (window as unknown as W).__TP!.state.score);
  await page.keyboard.press('e'); await page.waitForTimeout(400);
  const s2 = await page.evaluate(() => (window as unknown as W).__TP!.state.score);
  expect(s1).toBeGreaterThan(s0);
  expect(s2).toBe(s1);
});
