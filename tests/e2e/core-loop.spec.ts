// End-to-end: boots the production build and plays the vertical-slice core loop.
import { test, expect, type Page } from '@playwright/test';

type TP = { scene: string; state?: { upgrades: string[]; completedMissions: string[] }; rats?: () => number; win?: () => void; player?: unknown; startMission?: (id: string) => void; teleport?: (x: number, y: number) => void; traffic?: () => number };
type G = { scene: { isActive(k: string): boolean; getScene(k: string): unknown } };
const tp = (page: Page) => page.evaluate(() => (window as unknown as { __TP?: TP }).__TP?.scene ?? '');
const active = (page: Page, key: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as { __TP_GAME?: G }).__TP_GAME?.scene.isActive(k), key, { timeout });
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const T = 16, QUEEN = 54;

test('title -> new game -> intro cutscene -> explore', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await active(page, 'Title');
  await page.keyboard.press('Enter'); // start
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); // NEW GAME (no save yet)
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); // M3.1: difficulty (NORMAL)
  await page.waitForTimeout(300);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(120); } // initials
  await active(page, 'Cutscene');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape'); // skip
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore', null, { timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('the intro plays through the highway scene without errors', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?scene=Cutscene');
  for (let i = 0; i < 40; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(450); if (!(await page.evaluate(() => (window as unknown as { __TP_GAME: G }).__TP_GAME.scene.isActive('Cutscene')))) break; }
  expect(errors).toEqual([]);
});

test('ride, briefing, defeat rats, debrief, city improves, progress saved', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?scene=Explore');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore');
  // the streets are alive
  expect(await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.traffic!())).toBeGreaterThan(5);
  // riding moves the player (along Queen's north sidewalk)
  await page.evaluate(([x, y]) => (window as unknown as { __TP: TP }).__TP.teleport!(x, y), [30 * T, (QUEEN - 2) * T + 8]);
  await page.waitForTimeout(100);
  const p0 = await page.evaluate(() => (window as unknown as { __TP: { player: () => { x: number } } }).__TP.player());
  await page.keyboard.down('d'); await page.waitForTimeout(800); await page.keyboard.up('d');
  const p1 = await page.evaluate(() => (window as unknown as { __TP: { player: () => { x: number } } }).__TP.player());
  expect(p1.x).toBeGreaterThan(p0.x + 30);

  await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.startMission!('bike_lane_war'));
  await active(page, 'Cutscene'); // briefing vignette
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Action', null, { timeout: 10_000 });
  await page.waitForTimeout(3200); // intro banner
  await page.keyboard.down('d'); await page.waitForTimeout(1500); await page.keyboard.up('d');
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.rats!());
  expect(before).toBeGreaterThan(0);
  for (let i = 0; i < 40; i++) {
    const n = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.rats!());
    if (n === 0) break;
    const dir = await page.evaluate(() => {
      const s = (window as unknown as { __TP_GAME: G }).__TP_GAME.scene.getScene('Action') as { rats: { alive: boolean; sprite: { x: number } }[]; player: { sprite: { x: number } } };
      const r = s.rats.filter((x) => x.alive).sort((a, b) => Math.abs(a.sprite.x - s.player.sprite.x) - Math.abs(b.sprite.x - s.player.sprite.x))[0];
      return r ? Math.sign(r.sprite.x - s.player.sprite.x) : 0;
    });
    const key = dir > 0 ? 'd' : 'a';
    await page.keyboard.down(key); await page.waitForTimeout(60); await page.keyboard.up(key);
    await page.keyboard.press('e'); await page.waitForTimeout(140);
  }
  const after = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.rats!());
  expect(after).toBeLessThan(before);

  await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.win!());
  await active(page, 'Cutscene', 15_000); // debrief vignette
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => (window as unknown as { __TP: TP }).__TP.state!);
  expect(state.upgrades).toContain('queen_protected_lanes');
  expect(state.completedMissions).toContain('bike_lane_war');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.save.v1') ?? '{}'));
  expect(saved.upgrades).toContain('queen_protected_lanes');
  expect(errors).toEqual([]);
});

test('regression: thrown cones landing never freeze the mission (M0 bug)', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?scene=Action');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Action');
  await page.waitForTimeout(2800);
  // throw cones that must land on the ground (an invulnerable player doesn't absorb them)
  await page.evaluate(() => {
    const s = (window as unknown as { __TP_GAME: G }).__TP_GAME.scene.getScene('Action') as { player: { sprite: { x: number }; invulnT: number }; throwCone: (r: unknown) => void; time: { delayedCall: (ms: number, f: () => void) => void } };
    s.player.invulnT = 999;
    for (let i = 0; i < 4; i++) s.time.delayedCall(i * 400, () => s.throwCone({ sprite: { x: s.player.sprite.x + 90 + i * 20, y: 194 } }));
  });
  const t0 = await page.evaluate(() => (window as unknown as { __TP_GAME: { loop: { frame: number } } }).__TP_GAME.loop.frame);
  await page.waitForTimeout(4000);
  const t1 = await page.evaluate(() => (window as unknown as { __TP_GAME: { loop: { frame: number } } }).__TP_GAME.loop.frame);
  expect(t1 - t0).toBeGreaterThan(200); // the loop is still running
  expect(errors).toEqual([]);
});

test('pause menu and city map open and close', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?scene=Explore');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore');
  await page.keyboard.press('m');
  await active(page, 'Pause');
  await page.keyboard.press('m');
  await page.waitForFunction(() => !(window as unknown as { __TP_GAME: G }).__TP_GAME.scene.isActive('Pause'));
  await page.keyboard.press('Escape');
  await active(page, 'Pause');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as { __TP_GAME: G }).__TP_GAME.scene.isActive('Explore'));
  expect(errors).toEqual([]);
});

test('phone viewport stretches the view width; desktop keeps integer scale', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = errorsOf(page);
  await page.goto('./?scene=Explore');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore');
  const size = await page.evaluate(() => { const c = document.querySelector('canvas')!; return { w: c.clientWidth, h: c.clientHeight, iw: c.width }; });
  expect(size.h).toBeLessThanOrEqual(390);
  expect(size.iw).toBeGreaterThan(384); // wide phone: more city, no black bars
  expect(size.w).toBeGreaterThan(830);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(400);
  const size2 = await page.evaluate(() => { const c = document.querySelector('canvas')!; return { w: c.clientWidth, iw: c.width }; });
  expect(size2.iw).toBe(384);
  expect(size2.w).toBe(384 * 3); // integer scale on desktop
  expect(errors).toEqual([]);
  expect(['Explore', '']).toContain(await tp(page));
  await ctx.close();
});

test('touch: MAP button opens an overlay that stays open until X is tapped (M1 flicker bug)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = errorsOf(page);
  await page.goto('./?scene=Explore&touch');
  await page.waitForFunction(() => (window as unknown as { __TP?: TP }).__TP?.scene === 'Explore');
  await page.waitForTimeout(500);
  // game coords -> page coords
  const toPage = (gx: number, gy: number) => page.evaluate(([gx, gy]) => { const c = document.querySelector('canvas')!; const r = c.getBoundingClientRect(); return { x: r.left + (gx * r.width) / c.width, y: r.top + (gy * r.height) / c.height }; }, [gx, gy]);
  const gw = await page.evaluate(() => document.querySelector('canvas')!.width);
  const map = await toPage(gw - 40, 14);
  await page.touchscreen.tap(map.x, map.y);
  await active(page, 'Pause');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as unknown as { __TP_GAME: G }).__TP_GAME.scene.isActive('Pause'))).toBe(true);
  const close = await toPage(gw - 14, 14);
  await page.touchscreen.tap(close.x, close.y);
  await page.waitForFunction(() => !(window as unknown as { __TP_GAME: G }).__TP_GAME.scene.isActive('Pause'));
  // and the pause button works again afterwards (no stuck touch state)
  const pause = await toPage(gw - 14, 14);
  await page.touchscreen.tap(pause.x, pause.y);
  await active(page, 'Pause');
  expect(errors).toEqual([]);
  await ctx.close();
});
