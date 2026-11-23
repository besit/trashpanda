// End-to-end for M4.15/M4.16 (Ivan's play-through notes): districts open as their missions appear; the map
// missions' status box sits at the bottom of the screen.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };

test('M4.15: at the start the streets end at Queen West\'s edge, and the city map shows High Park closed', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'queenwest', null, { timeout: 20_000 });
  await page.waitForTimeout(800);
  const e = await page.evaluate(() => (window as unknown as W).__TP!.map.exits.find((x: any) => x.side === 'w' && x.to === 'highpark'));
  await page.evaluate((y) => (window as unknown as W).__TP!.teleport(30, y), (e.y0 + e.y1) / 2);
  await page.keyboard.down('a'); await page.waitForTimeout(1500); await page.keyboard.up('a');
  expect(await page.evaluate(() => (window as unknown as W).__TP!.district)).toBe('queenwest');
  await page.keyboard.press('m'); await page.waitForTimeout(800);
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(1200);
  const texts: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').root.list.filter((o: any) => o.text).map((o: any) => o.text));
  expect(texts).toContain('HIGH PARK');
  expect(texts).toContain('CLOSED FOR NOW');
  await page.keyboard.press('m'); await page.waitForTimeout(500);
  // after the first mission High Park is open: the same edge leads there
  await page.evaluate(() => (window as unknown as W).__TP!.state.completedMissions.push('bike_lane_war'));
  await page.evaluate((y) => (window as unknown as W).__TP!.teleport(30, y), (e.y0 + e.y1) / 2);
  await page.keyboard.down('a');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'highpark', null, { timeout: 15_000 });
  await page.keyboard.up('a');
  expect(errors).toEqual([]);
});

test('M4.16: the Dock Drop\'s status box sits at the bottom of the screen', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('trashpanda.save.v1', JSON.stringify({ version: 4, upgrades: [], completedMissions: ['bike_lane_war', 'king_of_street'], flags: { sawIntro: true, exploreHint: true, visited_downtown: true }, ratsDefeated: 0, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'TST', runId: 'tst415', ranks: {}, player: { scene: 'explore', district: 'downtown', x: -1, y: -1 } })));
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'downtown', null, { timeout: 20_000 });
  await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').scene.start('Explore', { district: 'downtown', bikebus: 'dock_drop' }));
  await page.waitForFunction(() => (window as unknown as W).__TP?.bus?.(), null, { timeout: 20_000 });
  await page.waitForTimeout(600);
  const y = await page.evaluate(() => {
    const t = (window as unknown as W).__TP_GAME!.scene.getScene('Explore').children.list.find((o: any) => typeof o.text === 'string' && o.text.startsWith('DOCK DROP'));
    return t ? t.getBounds().y : null;
  });
  expect(y).not.toBeNull();
  expect(y!).toBeGreaterThan(216 - 40);
  expect(errors).toEqual([]);
});
