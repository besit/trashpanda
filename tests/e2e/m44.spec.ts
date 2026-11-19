// End-to-end for M4.4 (Ivan's notes on M4.2/M4.3): typed initials (keyboard + a phone's own keyboard), the city map's
// side arrows, every road west from the Waterfront to High Park, the hi-res posters and their crisp preview.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { isActive(k: string): boolean; getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const sceneIs = (page: Page, s: string, timeout = 15_000) => page.waitForFunction((k) => (window as unknown as W).__TP?.scene === k, s, { timeout });

async function toInitials(page: Page, q = '') {
  await page.goto('./' + q);
  await page.evaluate(() => localStorage.clear());
  await page.goto('./' + q);
  await page.waitForTimeout(1500);
  // start -> NEW GAME -> NORMAL -> the initials (a touch title can show a hint first: one Enter more)
  for (let i = 0; i < 6 && !(await page.evaluate(() => !!(window as unknown as W).__TP_GAME!.scene.getScene('Title').naming)); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); }
  await page.waitForFunction(() => !!(window as unknown as W).__TP_GAME!.scene.getScene('Title').naming, null, { timeout: 5000 });
}
async function intoTheGame(page: Page) {
  await page.waitForTimeout(400); await page.keyboard.press('Enter'); // the disclaimer
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Cutscene'), null, { timeout: 10_000 });
  await page.keyboard.press('Escape');
  await sceneIs(page, 'Explore');
  return page.evaluate(() => (window as unknown as W).__TP!.state.name);
}

test('initials: typed on the keyboard (E is a letter here, not confirm); Backspace steps back', async ({ page }) => {
  const errors = errorsOf(page);
  await toInitials(page);
  await page.keyboard.type('bex', { delay: 80 });
  await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace'); await page.waitForTimeout(100);
  await page.keyboard.type('vn', { delay: 80 });
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').naming.letters.join(''))).toBe('BVN');
  await page.keyboard.press('Enter');
  expect(await intoTheGame(page)).toBe('BVN');
  expect(errors).toEqual([]);
});

test('M4.5: a name of up to 10 letters and digits; an empty name plays as RAC', async ({ page }) => {
  const errors = errorsOf(page);
  await toInitials(page);
  await page.keyboard.type('ivan2thegreat', { delay: 40 });
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').naming.letters.join(''))).toBe('IVAN2THEGR');
  await page.keyboard.press('Enter');
  expect(await intoTheGame(page)).toBe('IVAN2THEGR');
  await toInitials(page);
  await page.keyboard.press('Enter');
  expect(await intoTheGame(page)).toBe('RAC');
  expect(errors).toEqual([]);
});

test('M4.5: a run played with ?debug never reaches the high scores', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./?debug&scene=Explore');
  await sceneIs(page, 'Explore');
  await page.evaluate(() => { const tp = (window as unknown as W).__TP!; tp.state.score = 5000; tp.save(); });
  const debugged = await page.evaluate(() => ({ scores: JSON.parse(localStorage.getItem('trashpanda.highscores') ?? '[]').length, flag: (window as unknown as W).__TP!.state.flags.debugRun }));
  expect(debugged).toEqual({ scores: 0, flag: true });
  // the same run carried on without ?debug stays off the board
  await page.goto('./?scene=Explore');
  await sceneIs(page, 'Explore');
  await page.evaluate(() => { const tp = (window as unknown as W).__TP!; tp.state.score = 9000; tp.save(); });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('trashpanda.highscores') ?? '[]').length)).toBe(0);
});

test("initials on a phone: a text field over the letters (the phone's own keyboard); Go starts the run", async ({ page }) => {
  const errors = errorsOf(page);
  await toInitials(page, '?touch');
  const field = page.locator('input[aria-label="Your name"]');
  await expect(field).toHaveCount(1);
  await field.click();
  await field.fill('z3d!x');
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').naming.letters.join(''))).toBe('Z3DX');
  await field.press('Enter');
  await expect(field).toHaveCount(0);
  expect(await intoTheGame(page)).toBe('Z3DX');
  expect(errors).toEqual([]);
});

test('the city map: the neighbours on the left and right point out of the map with a turned ^', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await sceneIs(page, 'Explore');
  await page.waitForTimeout(600);
  await page.keyboard.press('m');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.isActive('Pause'), null, { timeout: 5000 });
  await page.waitForTimeout(500);
  const links = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').mapLinks.map((l: any) => [l.side, l.t.text, l.t.angle]));
  const sides = links.filter((l: any) => l[0] === 'w' || l[0] === 'e');
  expect(sides.length).toBeGreaterThan(0);
  for (const [side, label, angle] of sides) { expect(label.startsWith('^ ')).toBe(true); expect(angle).toBe(side === 'w' ? -90 : 90); }
  expect(errors).toEqual([]);
});

test('Waterfront: riding west on Lake Shore or Queens Quay leads to High Park', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await sceneIs(page, 'Explore');
  await page.evaluate(() => (window as unknown as W).__TP!.goto('waterfront'));
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  const west = await page.evaluate(() => (window as unknown as W).__TP!.map.exits.filter((e: any) => e.side === 'w').map((e: any) => [e.street, e.to]));
  expect(west).toEqual(expect.arrayContaining([['lakeshore', 'highpark'], ['queensquay', 'highpark'], ['trail', 'highpark']]));
  // ride off the west end of Lake Shore (row 28, the westbound lane)
  await page.evaluate(() => (window as unknown as W).__TP!.teleport(20, 28 * 16 + 20));
  await page.keyboard.down('a'); await page.waitForTimeout(1500); await page.keyboard.up('a');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'highpark', null, { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test('posters: ten of them, drawn at 768 x 432 (tall 432 x 768), exported at 3x, previewed as the crisp PNG', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await sceneIs(page, 'Explore');
  await page.waitForTimeout(600);
  await page.evaluate(() => { const e = (window as unknown as W).__TP_GAME!.scene.getScene('Explore'); e.scene.launch('Share', { from: 'Explore', mission: 'save_the_science' }); e.scene.pause(); });
  await page.waitForFunction(() => (window as unknown as W).__TP?.share?.().ready, null, { timeout: 15_000 });
  const seen = new Set<string>();
  for (let i = 0; i < 10; i++) {
    for (const tall of [false, true]) {
      await page.evaluate(([i, tall]) => (window as unknown as W).__TP!.shareShow(i, tall), [i, tall] as const);
      await page.waitForFunction(() => (window as unknown as W).__TP!.share().ready, null, { timeout: 15_000 });
      const s = await page.evaluate(() => (window as unknown as W).__TP!.share());
      expect([s.w, s.h]).toEqual(tall ? [432, 768] : [768, 432]);
      seen.add(`${s.poster}-${tall}`);
    }
  }
  expect(seen.size).toBe(20);
  // the exported PNG is 3x the poster, and it is what the preview shows (an <img>, pixelated, over the canvas)
  const dims = await page.evaluate(async () => {
    const img = document.querySelector('img[alt="Your poster"]') as HTMLImageElement;
    await img.decode();
    return { w: img.naturalWidth, h: img.naturalHeight, r: getComputedStyle(img).imageRendering, src: img.src === (window as unknown as W).__TP!.share().url };
  });
  expect(dims).toEqual({ w: 1296, h: 2304, r: 'pixelated', src: true });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  expect(await page.locator('img[alt="Your poster"]').count()).toBe(0);
  expect(errors).toEqual([]);
});
