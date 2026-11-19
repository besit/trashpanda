// End-to-end for M4.6 (Ivan's notes on M4.5): the phone name box that stayed up (a tap on START also reached the hidden
// difficulty list), the controls page before the first ride, the touch buttons under the score, the planters drawn once.
import { test, expect, devices, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { canvas: HTMLCanvasElement; scene: { isActive(k: string): boolean; getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const title = (page: Page) => page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); return { naming: !!s.naming, inputs: document.querySelectorAll('input').length, page: s.pageObjs.length }; });
/** game coords -> page coords */
const toPage = (page: Page, gx: number, gy: number) => page.evaluate(([gx, gy]) => { const c = document.querySelector('canvas')!; const r = c.getBoundingClientRect(); return { x: r.left + (gx * r.width) / c.width, y: r.top + (gy * r.height) / c.height }; }, [gx, gy]);
const tapGame = async (page: Page, gx: number, gy: number) => { const q = await toPage(page, gx, gy); await page.touchscreen.tap(q.x, q.y); await page.waitForTimeout(400); };
const itemAt = (page: Page, label: string) => page.evaluate((label) => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); const b = s.items.find((i: any) => i.label.startsWith(label)).t.getBounds(); return [b.centerX, b.centerY] as [number, number]; }, label);

test.describe('phone', () => {
  const { defaultBrowserType: _d, ...phone } = devices['iPhone 13 landscape'];
  test.use(phone);
  test('name entry: tapping START closes the name box for good (no second box over the next screens)', async ({ page }) => {
    const errors = errorsOf(page);
    await page.goto('./?touch'); await page.evaluate(() => localStorage.clear()); await page.goto('./?touch');
    await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Title'));
    await page.waitForTimeout(800);
    await tapGame(page, 150, 100);
    if ((await title(page)).page) await tapGame(page, 150, 100); // the one-time iPhone hint
    await tapGame(page, ...(await itemAt(page, 'NEW GAME')));
    await tapGame(page, ...(await itemAt(page, 'NORMAL')));
    expect(await title(page)).toMatchObject({ naming: true, inputs: 1 });
    const field = page.locator('input[aria-label="Your name"]');
    await field.tap(); await page.keyboard.type('ivan', { delay: 40 });
    const start = await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); const b = s.naming.objs[s.naming.objs.length - 1].getBounds(); return [b.centerX, b.centerY] as [number, number]; });
    await tapGame(page, ...start);
    await page.waitForTimeout(400);
    // the disclaimer is up, and nothing of the name box is left (it used to open again under the same tap)
    expect(await title(page)).toMatchObject({ naming: false, inputs: 0 });
    expect((await title(page)).page).toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').children.list.filter((o: any) => o.text === 'YOUR NAME').length)).toBe(0);
    expect(errors).toEqual([]);
  });

  test('the MAP and pause buttons sit under the score', async ({ page }) => {
    const errors = errorsOf(page);
    await page.goto('./?touch&scene=Explore');
    await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore');
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const s = (window as unknown as W).__TP_GAME!.scene.getScene('Explore');
      const pts = s.hud.points.getBounds();
      const btns = s.touch.buttons.filter((b: any) => b.id === 'map' || b.id === 'pause').map((b: any) => b.y - b.r);
      return { scoreBottom: pts.bottom, btnTop: Math.min(...btns) };
    });
    expect(r.btnTop).toBeGreaterThanOrEqual(r.scoreBottom + 2);
    expect(errors).toEqual([]);
  });
});

test('the controls page shows before the first ride, and only the first time', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./'); await page.evaluate(() => localStorage.clear()); await page.goto('./');
  await page.waitForTimeout(1500);
  const newGame = async () => {
    for (let i = 0; i < 8 && !(await title(page)).naming; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); }
    await page.keyboard.press('Enter'); // a blank name plays as RAC
    await page.waitForTimeout(500); await page.keyboard.press('Enter'); // the disclaimer
    await page.waitForTimeout(600);
  };
  await newGame();
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.isActive('Pause'))).toBe(true);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').mode)).toBe('controls');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Cutscene'), null, { timeout: 10_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.settings') ?? '{}').controlsSeen)).toBe(true);
  // a second new game goes straight from the disclaimer to the intro
  await page.goto('./'); await page.waitForTimeout(1500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(400); // start (CONTINUE is first now: pick NEW GAME directly)
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); s.items.find((i: any) => i.label === 'NEW GAME').action(); });
  await page.waitForTimeout(400);
  await newGame();
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.isActive('Pause'))).toBe(false);
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Cutscene'), null, { timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('the protected-lane planters are drawn at their size (no stretched sprite shimmering as it scrolls)', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?scene=Cutscene&cs=bwl_after');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Cutscene'));
  await page.waitForTimeout(1200);
  const decor = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene').decor.map((d: any) => [d.img.frame.name, d.img.scaleX, d.img.x === Math.round(d.img.x)]));
  expect(decor.length).toBeGreaterThan(0);
  for (const [frame, scale, whole] of decor) { expect(frame).toBe('planter_l'); expect(scale).toBe(1); expect(whole).toBe(true); }
  expect(errors).toEqual([]);
});
