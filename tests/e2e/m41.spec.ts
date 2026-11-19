// End-to-end for M4.1 (Ivan's M3.3-M3.4 notes): the Bike Bus (the first mission on the map), the share
// posters, and the reworked Jet Tug (it leaves the screen before it turns; its jet is a platform to ride).
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any; isActive(k: string): boolean } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const explore = async (page: Page) => {
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
};
const startBus = async (page: Page) => {
  await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').scene.start('Explore', { district: 'eastend', bikebus: 'bike_bus' }));
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'eastend' && (window as unknown as W).__TP!.bus?.(), null, { timeout: 15_000 });
  await page.waitForTimeout(600);
};

test('the Bike Bus: board every stop, bell the SUVs out of the lane, reach the school -> the debrief', async ({ page }) => {
  const errors = errorsOf(page);
  await explore(page);
  await startBus(page);
  const steps: { kind: string; x: number; y: number; kids?: number }[] = await page.evaluate(() => (window as unknown as W).__TP!.bus().def.steps);
  expect(steps.filter((s) => s.kind === 'stop').reduce((n, s) => n + (s.kids ?? 0), 0)).toBe(9);
  // an SUV in the bike lane blocks the way until the bell: it doesn't advance the route by itself
  for (const s of steps) {
    if (s.kind === 'stop') {
      await page.evaluate(([x, y]) => (window as unknown as W).__TP!.teleport(x - 12, y + 6), [s.x, s.y]);
      await page.waitForTimeout(1100);
    } else if (s.kind === 'block') {
      const before = await page.evaluate(() => (window as unknown as W).__TP!.bus().step);
      await page.evaluate(([x, y]) => (window as unknown as W).__TP!.teleport(x - 40, y + 4), [s.x, s.y]);
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => (window as unknown as W).__TP!.bus().step)).toBe(before);
      await page.keyboard.press('e'); await page.waitForTimeout(300);
      expect(await page.evaluate(() => (window as unknown as W).__TP!.bus().step)).toBe(before + 1);
    } else {
      await page.evaluate(([x, y]) => (window as unknown as W).__TP!.teleport(x, y + 4), [s.x, s.y]);
    }
  }
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => { const b = (window as unknown as W).__TP!.bus(); return { state: b.state, kids: b.kids }; });
  expect(st).toEqual({ state: 'won', kids: 9 });
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.isActive('Cutscene'), null, { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test('the Bike Bus: late for the bell -> back to the first stop', async ({ page }) => {
  const errors = errorsOf(page);
  await explore(page);
  await startBus(page);
  const s0 = await page.evaluate(() => (window as unknown as W).__TP!.bus().def.steps[0]);
  await page.evaluate(([x, y]) => (window as unknown as W).__TP!.teleport(x - 12, y + 6), [s0.x, s0.y]);
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.bus().kids)).toBe(2);
  await page.evaluate(() => { (window as unknown as W).__TP!.bus().t = 0.3; });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.bus()?.state)).toBe('late');
  await page.waitForFunction(() => { const b = (window as unknown as W).__TP!.bus?.(); return b && b.state === 'ride' && b.step === 0 && b.kids === 0; }, null, { timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('share: SHARE YOUR CITY in the pause menu -> ten posters (M4.4), wide + tall, saved as a full-size PNG', async ({ page }) => {
  const errors = errorsOf(page);
  await explore(page);
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.isActive('Pause'), null, { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const p = (window as unknown as W).__TP_GAME!.scene.getScene('Pause'); p.sel = p.items.findIndex((i: any) => i.label() === 'SHARE YOUR CITY'); p.refresh(); });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window as unknown as W).__TP?.share?.().ready, null, { timeout: 10_000 });
  const seen = new Set<string>();
  for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 2; k++) {
      await page.waitForFunction(() => (window as unknown as W).__TP!.share().ready, null, { timeout: 10_000 });
      const s = await page.evaluate(() => (window as unknown as W).__TP!.share());
      expect([s.w, s.h]).toEqual(s.portrait ? [432, 768] : [768, 432]); // M4.4: twice the game's resolution
      expect(s.size).toBeGreaterThan(20_000);
      seen.add(`${s.poster}-${s.portrait}`);
      await page.keyboard.press('ArrowUp'); await page.waitForTimeout(250);
    }
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250);
  }
  expect(seen.size).toBe(20);
  await page.waitForFunction(() => (window as unknown as W).__TP!.share().ready, null, { timeout: 10_000 });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Share').shareTo('save'))]);
  expect(dl.suggestedFilename()).toMatch(/^trash-panda-[a-z]+-(wide|tall)\.png$/);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME!.scene.isActive('Pause'), null, { timeout: 5000 });
  expect(errors).toEqual([]);
});

test('the Jet Tug drives off screen before it turns, and its jet carries a raccoon riding on top', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=island_airport');
  await page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); if (s.lock) s.endArena(''); s.lock = null; s.rats.forEach((r: any) => r.alive && r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 1 }, 0)); s.depave = { update() {}, finish() {}, allDone: true, fence: true, done: 4, total: 4 }; s.depaveDone = true; s.waveIdx = 3; (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(2140); });
  await page.keyboard.down('d'); await page.waitForTimeout(300); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug, null, { timeout: 15_000 });
  // it turns round only while it's away (off screen), and comes back from the side it left
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug.phase === 'away', null, { timeout: 20_000 });
  const away = await page.evaluate(() => { const s = (window as unknown as W).__TP!.state(); return { x: s.tug.x, cam: s.camX, dir: s.tug.dir }; });
  expect(away.x < away.cam - 60 || away.x > away.cam + 384 + 60).toBe(true);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug.phase === 'drive', null, { timeout: 5000 });
  expect(await page.evaluate(() => (window as unknown as W).__TP!.state().tug.dir)).toBe(-away.dir);
  // ride: on the fuselage the raccoon moves with the jet and takes no damage
  await page.waitForFunction(() => { const s = (window as unknown as W).__TP!.state(); return Math.abs(s.tug.x - (s.camX + 192)) < 120; }, null, { timeout: 15_000 });
  const ride = await page.evaluate(async () => {
    const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const z = (window as unknown as W).__TP!.tug().platform;
    g.player.invulnT = 0; const hp0 = g.player.hp;
    g.player.body.reset(z.x, z.y - 14); g.player.body.setVelocity(0, 0);
    const x0 = g.player.sprite.x;
    await new Promise((r) => setTimeout(r, 700));
    return { hp0, hp1: g.player.hp, moved: Math.abs(g.player.sprite.x - x0), onTop: Math.abs(g.player.body.bottom - z.body.top) < 2 };
  });
  expect(ride.hp1).toBe(ride.hp0);
  expect(ride.moved).toBeGreaterThan(30);
  expect(ride.onTop).toBe(true);
  expect(errors).toEqual([]);
});
