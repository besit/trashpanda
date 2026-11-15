// End-to-end for M3.4: the island airport mission ("Grounded"), the Baggage Rat's rolling suitcase, the Barrier
// Rat's board, the Jet Tug boss, and Little Norway Park on the Waterfront map.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const tp = (page: Page) => page.evaluate(() => (window as unknown as W).__TP!.state());
const actionReady = (page: Page) => page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
const ride = async (page: Page, to: number) => { await page.evaluate((x) => (window as unknown as W).__TP!.skipTo(x), to - 30); await page.keyboard.down('d'); await page.waitForTimeout(600); await page.keyboard.up('d'); };

test('Grounded: suitcases roll along the ground and can be jumped; the stakes arena; the Jet Tug', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=island_airport');
  await actionReady(page);
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 99999; });
  await ride(page, 300);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().cases > 0, null, { timeout: 15_000 });
  const gy = await page.evaluate(() => (window as unknown as W).__TP!.gy());
  const c = await page.evaluate(() => { const c = (window as unknown as W).__TP!.cases()[0]; return { y: c.y, vx: c.body.velocity.x }; });
  expect(Math.abs(c.y - gy)).toBeLessThan(10); // on the ground, not lobbed
  expect(Math.abs(c.vx)).toBeGreaterThan(100);
  await page.evaluate(() => (window as unknown as W).__TP!.killAll());
  await page.waitForTimeout(1800);
  // the stakes arena
  await ride(page, 900);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === 'depave', null, { timeout: 10_000 });
  expect((await tp(page)).spots).toHaveLength(4);
  for (let i = 0; i < 4; i++) {
    const spots: number[] = (await tp(page)).spots;
    if (!spots.length) break;
    await page.evaluate((x) => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.body.reset(x - 8, (window as unknown as W).__TP!.gy() - 10); g.player.facing = 1; }, spots[0]);
    for (let k = 0; k < 4; k++) { await page.keyboard.press('e'); await page.waitForTimeout(260); }
  }
  expect((await tp(page)).depaved).toBe(4);
  await page.evaluate(() => (window as unknown as W).__TP!.killAll());
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === null, null, { timeout: 10_000 });
  // wave 2, then the boss
  await ride(page, 1500);
  await page.waitForTimeout(1200);
  await page.evaluate(() => (window as unknown as W).__TP!.killAll());
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().lock === null, null, { timeout: 10_000 });
  await ride(page, 2100);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug?.phase === 'taxi', null, { timeout: 15_000 });
  // the jet blast pushes you away from the tail
  const t0 = (await tp(page)).tug;
  await page.evaluate((t) => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); g.player.body.reset(t.x - t.dir * 150, (window as unknown as W).__TP!.gy() - 10); g.player.body.setVelocityX(0); }, t0);
  await page.waitForTimeout(150);
  const vx = await page.evaluate(() => (window as unknown as W).__TP!.player.body.velocity.x);
  expect(Math.sign(vx)).toBe(-t0.dir);
  // the tug is pumpable only while refuelling
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug?.phase === 'refuel', null, { timeout: 20_000 });
  const hpA = (await tp(page)).tug.hp;
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const t = (window as unknown as W).__TP!.tug(); const tr = t.tugRect(); const side = tr.centerX < t.x ? -1 : 1; g.player.body.reset(tr.centerX + side * 36, (window as unknown as W).__TP!.gy() - 10); g.player.facing = -side; });
  await page.waitForTimeout(150); await page.keyboard.press('e'); await page.waitForTimeout(300);
  expect((await tp(page)).tug.hp).toBeLessThan(hpA);
  // finish it: the mission ends
  await page.evaluate(() => { const t = (window as unknown as W).__TP!.tug(); for (let i = 0; i < 30 && t.alive; i++) t.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 500 + i }, 'stomp'); });
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().finished, null, { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test('a Barrier Rat blocks hits from the front and turns slowly, so a hit from behind lands', async ({ page }) => {
  await page.goto('./?debug&scene=Action&mission=island_airport');
  await actionReady(page);
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 99999; });
  await ride(page, 1500);
  await page.waitForFunction(() => (window as unknown as W).__TP!.ratObjs().some((r: any) => r.kind === 'barrier'), null, { timeout: 15_000 });
  await page.waitForTimeout(900); // past its walk-in, when it turns freely
  const hp0 = await page.evaluate(() => (window as unknown as W).__TP!.ratObjs().find((r: any) => r.kind === 'barrier').hp);
  // from the front
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const r = (window as unknown as W).__TP!.ratObjs().find((r: any) => r.kind === 'barrier'); g.player.body.reset(r.sprite.x + r.facing * 26, (window as unknown as W).__TP!.gy() - 10); g.player.facing = -r.facing; });
  await page.waitForTimeout(250); await page.keyboard.press('e'); await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.ratObjs().find((r: any) => r.kind === 'barrier').hp)).toBe(hp0);
  // from behind, inside its turn delay
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const r = (window as unknown as W).__TP!.ratObjs().find((r: any) => r.kind === 'barrier'); g.player.body.reset(r.sprite.x - r.facing * 24, (window as unknown as W).__TP!.gy() - 10); g.player.facing = r.facing; });
  await page.waitForTimeout(120); await page.keyboard.press('e'); await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.ratObjs().find((r: any) => r.kind === 'barrier')?.hp ?? 0)).toBeLessThan(hp0);
});

test('Little Norway Park is on the Waterfront map with its plaque and the GROUNDED marker after the heist', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('trashpanda.save.v1', JSON.stringify({ version: 3, upgrades: ['queen_protected_lanes', 'king_transit_corridor', 'public_waterfront'], completedMissions: ['bike_lane_war', 'king_of_street', 'waterfront_heist'], flags: { sawIntro: true, exploreHint: true }, ratsDefeated: 0, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'TST', runId: 'tst34', player: { scene: 'explore', district: 'waterfront', x: -1, y: -1 } })));
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 20_000 });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as unknown as W).__TP!.markers())).toContain('island_airport');
  const lm = await page.evaluate(() => (window as unknown as W).__TP!.map.landmarks.find((l: any) => l.id === 'littlenorway'));
  expect(lm).toBeTruthy();
  await page.evaluate((l) => (window as unknown as W).__TP!.teleport(l.x, l.y + 20), lm);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').hud.prompt.text)).toContain('PLAQUE');
});
