// End-to-end for M3.2 (Ivan's M3.1 review): the Lane Eater redesign, the new district connections, the
// articulated streetcar.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const tp = (page: Page) => page.evaluate(() => (window as unknown as W).__TP!.state());
const actionReady = (page: Page) => page.waitForFunction(() => (window as unknown as W).__TP?.state && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 15_000 });

test('Lane Eater: the machine is on screen while it chases, and riders only join if you stay beside them', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=lane_eater');
  await actionReady(page);
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 999; });
  await page.waitForTimeout(2500);
  // "it was not shown to me until I went backwards": its front is inside the view
  const front = await page.evaluate(() => (window as unknown as W).__TP!.eaterObj().front);
  expect(front - (await tp(page)).camX).toBeGreaterThan(10);
  // the first rider: ring beside them, then race off -> they don't join
  const riderX = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').peloton.waiting[0].s.x);
  await page.evaluate((x) => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.autoX = x - 200; g.player.body.reset(x, (window as unknown as W).__TP!.gy() - 10); }, riderX);
  await page.waitForTimeout(80);
  await page.keyboard.press('e');
  await page.waitForTimeout(100);
  await page.evaluate((x) => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.body.reset(x + 120, (window as unknown as W).__TP!.gy() - 10); }, riderX);
  await page.waitForTimeout(500);
  expect((await tp(page)).peloton).toBe(0);
  // ring again and ride along with them -> they clip in
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const w = g.peloton.waiting[0]; g.player.body.reset(w.s.x, (window as unknown as W).__TP!.gy() - 10); });
    await page.waitForTimeout(150);
    await page.keyboard.press('e');
    await page.waitForTimeout(80);
    if (await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').peloton.waiting[0].state === 'clip')) break;
  }
  for (let i = 0; i < 30; i++) {
    const done = await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const w = g.peloton.waiting[0]; if (w.state !== 'clip') return true; g.player.body.reset(w.s.x + 6, (window as unknown as W).__TP!.gy() - 10); return false; });
    if (done) break;
    await page.waitForTimeout(60);
  }
  expect((await tp(page)).peloton).toBe(1);
  expect(errors).toEqual([]);
});

test('Lane Eater boss: charges across the whole screen, overheats at the edge, comes back from the other side', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=lane_eater');
  await actionReady(page);
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.invulnT = 99999; g.autoX = 2950 - 384 - 4; g.player.body.reset(2950 - 200, (window as unknown as W).__TP!.gy() - 10); });
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().eater?.boss, null, { timeout: 10_000 });
  const left = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').lock.left);
  const right = left + (await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').cameras.main.width));
  // first charge: left -> right, overheated with its front near the right edge
  await page.waitForFunction(() => (window as unknown as W).__TP!.eaterObj().state === 'hot', null, { timeout: 15_000 });
  const e1 = await page.evaluate(() => ({ front: (window as unknown as W).__TP!.eaterObj().front, dir: (window as unknown as W).__TP!.eaterObj().facing }));
  expect(e1.dir).toBe(1);
  expect(e1.front).toBeGreaterThan(right - 50);
  // it's hittable only now; then it leaves and comes back the other way
  await page.waitForFunction(() => { const o = (window as unknown as W).__TP!.eaterObj(); return o.state === 'hot' && o.facing === -1; }, null, { timeout: 20_000 });
  const e2 = await page.evaluate(() => (window as unknown as W).__TP!.eaterObj().front);
  expect(e2).toBeLessThan(left + 50);
  expect(errors).toEqual([]);
});

test('connections: Queen West south -> the Waterfront on Strachan; High Park south -> the trail; and back', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  const ride = async (from: string, x: number, y: number, key: string, to: string) => {
    await page.evaluate((d) => (window as unknown as W).__TP!.goto(d), from);
    await page.waitForFunction((d) => (window as unknown as W).__TP?.district === d, from);
    await page.waitForTimeout(900);
    await page.evaluate(([px, py]) => (window as unknown as W).__TP!.teleport(px, py), [x, y]);
    await page.keyboard.down(key);
    await page.waitForFunction((d) => (window as unknown as W).__TP?.district === d, to, { timeout: 10_000 });
    await page.keyboard.up(key);
    await page.waitForTimeout(900);
    return page.evaluate(() => { const p = (window as unknown as W).__TP_GAME!.scene.getScene('Explore').player; return { x: p.x, y: p.y }; });
  };
  const T = 16;
  // Ossington -> Strachan (cols 19..22 on the Waterfront)
  const a = await ride('queenwest', 9.5 * T, 74 * T, 's', 'waterfront');
  expect(a.x).toBeGreaterThan(18 * T); expect(a.x).toBeLessThan(24 * T);
  // High Park (Parkside, south) -> the west end of the trail
  const b = await ride('highpark', 65.5 * T, 100 * T, 's', 'waterfront');
  expect(b.x).toBeLessThan(3 * T); expect(b.y).toBeGreaterThan(56 * T); expect(b.y).toBeLessThan(62 * T);
  // and west along the trail -> back to High Park
  await ride('waterfront', 1 * T, 59.5 * T, 'a', 'highpark');
  expect(errors).toEqual([]);
});

test('a streetcar turning onto Queens Quay bends in three sections', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.evaluate(() => (window as unknown as W).__TP!.goto('waterfront'));
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').traffic.vehicles.some((v: any) => v.parts?.length === 3 && new Set(v.parts.map((q: any) => q.frame.name.split('_')[2])).size > 1), null, { timeout: 60_000 });
  expect(errors).toEqual([]);
});
