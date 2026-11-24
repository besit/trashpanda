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

const actionReady = (page: Page) => page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });

test('M4.17: the exhibit haulers start off screen ahead, and bolt only once the raccoon catches up', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=save_the_science');
  await actionReady(page);
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); s.patrols.forEach((pt: any) => pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 2 }, 0)); (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(1300); });
  await page.waitForTimeout(400);
  await page.keyboard.down('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().chase !== null, null, { timeout: 10_000 });
  const first = await page.evaluate(() => { const st = (window as unknown as W).__TP!.state(); return { chase: st.chase, rear: st.haul, camRight: st.camX + 384 }; });
  expect(first.chase).toBe('wait');
  expect(first.rear).toBeGreaterThan(first.camRight - 30); // the rear rat is (nearly) off the right edge: the pair is off screen
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().chase === 'run', null, { timeout: 10_000 });
  await page.keyboard.up('d');
  expect(errors).toEqual([]);
});

test('M4.17: the Wrecker swings symmetrically and breaks down where it stands, its ball on the street', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=save_the_science');
  await actionReady(page);
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); if (s.lock) s.endArena(''); s.lock = null; s.patrols.forEach((pt: any) => pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 2 }, 0)); s.chaseDone = true; s.waveIdx = 9; (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(2570); });
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().wrecker?.phase === 'swing', null, { timeout: 25_000 });
  const angs: number[] = await page.evaluate(async () => { const w = (window as unknown as W).__TP!.wrecker(); const a: number[] = []; for (let i = 0; i < 90; i++) { await new Promise((r) => requestAnimationFrame(r)); if (w.state === 'swing') a.push(w.ang); } return a; });
  expect(Math.max(...angs)).toBeGreaterThan(0.6);
  expect(Math.abs(Math.max(...angs) + Math.min(...angs))).toBeLessThan(0.15); // as far right as left
  const before = await page.evaluate(() => { const w = (window as unknown as W).__TP!.wrecker(); const x = w.x; w.state = 'stuck'; w.t = 9; w.hp = 1; w.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 5, kb: 0, id: 99 }, 'pump'); return x; });
  await page.waitForTimeout(2500);
  const after = await page.evaluate(() => { const w = (window as unknown as W).__TP!.wrecker(); return { x: w.x, alpha: w.img.alpha, ballY: w.ballPos().y, gy: (window as unknown as W).__TP!.gy(), visible: w.ball.visible }; });
  expect(Math.abs(after.x - before)).toBeLessThan(3); // it didn't drive away
  expect(after.alpha).toBe(1);
  expect(after.visible).toBe(true);
  expect(Math.abs(after.ballY - (after.gy - 11))).toBeLessThan(3); // the ball lies on the street
  expect(errors).toEqual([]);
});

test('M4.17: after Death by Highway the Gardiner keeps its piers and its deck is a park', async ({ page }) => {
  const errors = errorsOf(page);
  const ALL = ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'lane_eater', 'great_parking_lot', 'waterfront_heist', 'island_airport', 'save_the_science', 'finish_the_line', 'bike_bus', 'dock_drop', 'death_by_highway'];
  await page.goto('./');
  await page.evaluate((done) => localStorage.setItem('trashpanda.save.v1', JSON.stringify({ version: 4, upgrades: ['gardiner_down'], completedMissions: done, flags: { sawIntro: true, exploreHint: true, visited_waterfront: true }, ratsDefeated: 0, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'TST', runId: 'tst417', ranks: {}, player: { scene: 'explore', district: 'waterfront', x: -1, y: -1 } })), ALL);
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 20_000 });
  await page.waitForTimeout(800);
  const keys: Record<string, number> = await page.evaluate(() => { const c: Record<string, number> = {}; for (const o of (window as unknown as W).__TP_GAME!.scene.getScene('Explore').children.list as any[]) { const k = o.frame?.name; if (typeof k === 'string' && k.startsWith('gardiner')) c[k] = (c[k] ?? 0) + 1; } return c; });
  expect(keys.gardinerdeck ?? 0).toBe(0);
  expect((keys.gardinerpark_0 ?? 0) + (keys.gardinerpark_1 ?? 0)).toBeGreaterThan(10);
  expect(keys.gardinerpier ?? 0).toBeGreaterThan(5);
  expect(errors).toEqual([]);
});
