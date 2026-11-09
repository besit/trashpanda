// End-to-end: boots the production build and plays the vertical-slice core loop.
import { test, expect, type Page } from '@playwright/test';

type TP = { scene: string; state?: { upgrades: string[]; completedMissions: string[] }; rats?: () => number; win?: () => void; player?: unknown; startMission?: (id: string) => void; teleport?: (x: number, y: number) => void };
const tp = (page: Page) => page.evaluate(() => (window as unknown as { __TP?: TP }).__TP?.scene ?? '');
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };

test('title -> new game -> intro cutscene -> explore', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await page.waitForFunction(() => (window as unknown as { __TP_GAME?: { scene: { isActive(k: string): boolean } } }).__TP_GAME?.scene.isActive('Title'));
  await page.keyboard.press('Enter'); // start
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); // NEW GAME (no save yet)
  await page.waitForFunction(() => (window as unknown as { __TP_GAME?: { scene: { isActive(k: string): boolean } } }).__TP_GAME?.scene.isActive('Cutscene'));
  await page.keyboard.press('Escape'); // skip
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore', null, { timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('ride, enter mission, defeat rats, city improves, progress saved', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?scene=Explore');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore');
  // riding moves the player
  await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.teleport!(23 * 16, 12 * 16 + 8));
  await page.waitForTimeout(100);
  const p0 = await page.evaluate(() => (window as unknown as { __TP: { player: () => { x: number } } }).__TP.player());
  await page.keyboard.down('d'); await page.waitForTimeout(800); await page.keyboard.up('d');
  const p1 = await page.evaluate(() => (window as unknown as { __TP: { player: () => { x: number } } }).__TP.player());
  expect(p1.x).toBeGreaterThan(p0.x + 30);

  await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.startMission!('bike_lane_war'));
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Action', null, { timeout: 10_000 });
  await page.waitForTimeout(2600); // intro banner
  // ride into the first wave and fight: rats must take damage and die
  await page.keyboard.down('d'); await page.waitForTimeout(1500); await page.keyboard.up('d');
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.rats!());
  expect(before).toBeGreaterThan(0);
  for (let i = 0; i < 40; i++) {
    const n = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.rats!());
    if (n === 0) break;
    // face toward the nearest rat and swing
    const dir = await page.evaluate(() => {
      const g = (window as unknown as { __TP_GAME: { scene: { getScene(k: string): { rats: { alive: boolean; sprite: { x: number } }[]; player: { sprite: { x: number } } } } } }).__TP_GAME;
      const s = g.scene.getScene('Action');
      const r = s.rats.filter((x) => x.alive).sort((a, b) => Math.abs(a.sprite.x - s.player.sprite.x) - Math.abs(b.sprite.x - s.player.sprite.x))[0];
      return r ? Math.sign(r.sprite.x - s.player.sprite.x) : 0;
    });
    const key = dir > 0 ? 'd' : 'a';
    await page.keyboard.down(key); await page.waitForTimeout(60); await page.keyboard.up(key);
    await page.keyboard.press('k'); await page.waitForTimeout(140);
  }
  const after = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.rats!());
  expect(after).toBeLessThan(before);

  // finish the mission (debug hook) and verify the civic improvement + save
  await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.win!());
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.state!);
  expect(state.upgrades).toContain('queen_protected_lanes');
  expect(state.completedMissions).toContain('bike_lane_war');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1') ?? '{}'));
  expect(saved.upgrades).toContain('queen_protected_lanes');
  expect(errors).toEqual([]);
});

test('survives resize and phone viewport with touch controls', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = errorsOf(page);
  await page.goto('./?scene=Explore');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore');
  const size = await page.evaluate(() => { const c = document.querySelector('canvas')!; return { w: c.clientWidth, h: c.clientHeight }; });
  expect(size.h).toBeLessThanOrEqual(390);
  expect(size.w / size.h).toBeCloseTo(384 / 216, 1);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(300);
  const size2 = await page.evaluate(() => { const c = document.querySelector('canvas')!; return { w: c.clientWidth, h: c.clientHeight }; });
  expect(size2.w).toBe(384 * 3); // integer scale on desktop
  expect(errors).toEqual([]);
  expect(await tp(page)).toBe('Explore');
  await ctx.close();
});
