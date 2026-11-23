// End-to-end for M3.3 (Ivan's M3.2 review + the audit): the pump freeze, landing stomps, planes, captions, the
// ABOUT pages, replays, the Waterfront <-> East End link, the lazy city map with its tally, and Dog Fjord's
// interstitials.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const actionReady = (page: Page) => page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
const save = (extra: object = {}) => JSON.stringify({ version: 3, upgrades: ['queen_protected_lanes'], completedMissions: ['bike_lane_war'], flags: { sawIntro: true, exploreHint: true }, ratsDefeated: 0, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'TST', runId: 'tst33', player: { scene: 'explore', district: 'queenwest', x: -1, y: -1 }, ...extra });

test('the raccoon goes back to idle after a pump swing (the stuck-frame bug)', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=bike_lane_war');
  await actionReady(page);
  await page.waitForTimeout(300);
  await page.keyboard.press('e');
  await page.waitForTimeout(700);
  const st = await page.evaluate(() => { const s = (window as unknown as W).__TP!.player.sprite; return { key: s.anims.currentAnim?.key, playing: s.anims.isPlaying }; });
  expect(st).toEqual({ key: 'rs_idle', playing: true });
  expect(errors).toEqual([]);
});

test('a stomp counts when landing on an SUV Rat, never while hovering above it', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=king_of_street');
  await actionReady(page);
  await page.evaluate(() => { (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(830); });
  await page.keyboard.down('d'); await page.waitForTimeout(600); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().carsAt?.length > 0, null, { timeout: 8000 });
  const hpOf = () => page.evaluate(() => { const c = (window as unknown as W).__TP_GAME!.scene.getScene('Action').cars.find((c: any) => c.alive); return c ? c.hp : null; });
  const h0 = await hpOf();
  // hover 40 px above the roof, "falling", for a second: no hit
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const c = g.cars.find((c: any) => c.alive); if (c) { g.player.body.reset(c.x, c.roofY() - 40); g.player.body.setVelocityY(60); } });
    await page.waitForTimeout(30);
  }
  expect(await hpOf()).toBe(h0);
  // one real drop onto the roof: exactly one hit (the bounce doesn't score again within the cooldown)
  await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const c = g.cars.find((c: any) => c.alive); c.stallT = 5; g.player.body.reset(c.x, c.roofY() - 50); g.player.body.setVelocity(0, 0); });
  await page.waitForTimeout(700);
  expect(await hpOf()).toBe(h0! - 1);
  expect(errors).toEqual([]);
});

test('planes cross the whole screen along the approach and never dip into the lake', async ({ page }) => {
  await page.goto('./?debug&scene=Action&mission=waterfront_heist');
  await actionReady(page);
  let maxY = -1, minX = 1e9, maxX = -1e9;
  for (let i = 0; i < 38; i++) { // ~19 s: long enough for a landing to restart from off screen left and the take-off to reach it
    const s = await page.evaluate(() => { const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); return g.children.list.filter((o: any) => o.texture?.key === 'world' && /^plane_/.test(o.frame.name) && o.visible).map((o: any) => [o.x, o.y]); });
    for (const [x, y] of s) { maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    await page.waitForTimeout(500);
  }
  expect(maxY).toBeLessThan(54);
  expect(minX).toBeLessThan(0); // they start off screen on one side...
  expect(maxX).toBeGreaterThan(300); // ...and reach the other
});

test('vignette captions never sit on top of each other', async ({ page }) => {
  for (const cs of ['king_before', 'lot_before', 'wf_before', 'calm_before']) {
    await page.goto(`./?debug&scene=Cutscene&cs=${cs}`);
    await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 15_000 });
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(300);
      const ys: number[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene').captions.map((c: any) => c.y));
      for (let a = 0; a < ys.length; a++) for (let b = a + 1; b < ys.length; b++) expect(Math.abs(ys[a] - ys[b]), `${cs}: captions at ${ys[a]} and ${ys[b]}`).toBeGreaterThanOrEqual(14);
    }
  }
});

test('ABOUT shows the satire notice, the credits and one SOURCES page per claim', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Title')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(600); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const items: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').items.map((i: any) => i.label));
  expect(items).toContain('ABOUT');
  await page.evaluate(() => { const t = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); t.sel = t.items.findIndex((i: any) => i.label === 'ABOUT'); t.refresh(); });
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const texts = async () => page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').pageObjs.filter((o: any) => o.text).map((o: any) => o.text as string));
  // M4.1: credits first (alias + clickable socials), LEFT/RIGHT flip the pages, ENTER goes back
  expect((await texts()).join(' ')).toContain('CREDITS');
  expect((await texts()).join(' ')).toContain('SEXWITHAWHALEINC');
  expect((await texts()).join(' ')).not.toContain('IVAN');
  const links: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').pageLinks.map((l: any) => l.url));
  expect(links).toContain('https://x.com/sexwithawhale');
  expect(links.some((u) => u.includes('instagram.com/sexwithawhaleinc'))).toBe(true);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450);
  expect((await texts()).join(' ')).toContain('SATIRE AND PARODY');
  expect((await texts()).join(' ')).toContain('AI CAN MAKE MISTAKES');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450);
  expect((await texts()).join(' ')).toContain('TESCHKE');
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(450);
  expect((await texts()).join(' ')).toContain('SATIRE AND PARODY');
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(450); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(450); // wraps to the last page
  expect((await texts()).join(' ')).toContain('SOURCES');
  await page.keyboard.press('Enter'); await page.waitForTimeout(450);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').menu.visible)).toBe(true);
  expect(errors).toEqual([]);
});

test('a debug mission ends at the REPLAY / BACK / MAIN MENU menu', async ({ page }) => {
  await page.goto('./?debug');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Title')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(600); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  // pick by label (arrow presses wrap around the list, which made the test order-dependent)
  const pick = (label: string) => page.evaluate((l) => { const t = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); t.sel = t.items.findIndex((i: any) => i.label.replace(/^\d+\. /, '').startsWith(l)); t.refresh(); }, label);
  await pick('SELECT MISSION'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await pick('LET THE STREETCAR THROUGH'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(400); await page.keyboard.press('Escape'); // skip the briefing
  await actionReady(page);
  await page.evaluate(() => (window as unknown as W).__TP!.win());
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); // skip the debrief
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Title')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  const menu: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').items.map((i: any) => i.label));
  expect(menu[0]).toContain('REPLAY');
  expect(menu).toContain('BACK TO MISSIONS');
  expect(menu).toContain('MAIN MENU');
});

test('a FIXED marker offers a replay that earns no points', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('trashpanda.save.v1', s), save());
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  const mk = await page.evaluate(() => (window as unknown as W).__TP!.map.markers.find((m: any) => m.id === 'bike_lane_war'));
  await page.evaluate((m) => (window as unknown as W).__TP!.teleport(m.x, m.y + 4), mk);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').hud.prompt.text)).toContain('REPLAY (NO POINTS)');
  const score0 = await page.evaluate(() => (window as unknown as W).__TP!.state.score);
  await page.keyboard.press('e');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 15_000 });
  await page.keyboard.press('Escape');
  await actionReady(page);
  expect(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Action').replay)).toBe(true);
  await page.evaluate(() => (window as unknown as W).__TP!.win());
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Cutscene')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(400); await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore' && !(window as unknown as W).__TP!.busy(), null, { timeout: 20_000 });
  expect(await page.evaluate(() => (window as unknown as W).__TP!.state.score)).toBe(score0);
});

test('east along Queens Quay reaches the East End at the bottom of Leslie, and south on Leslie comes back', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  // M4.15: districts open as their missions appear; these two missions open all five
  await page.evaluate(() => (window as unknown as W).__TP!.state.completedMissions.push('bike_lane_war', 'king_of_street'));
  const go = async (d: string) => { await page.evaluate((dd) => (window as unknown as W).__TP!.goto(dd), d); await page.waitForFunction((dd) => (window as unknown as W).__TP?.district === dd, d); await page.waitForTimeout(900); };
  await go('waterfront');
  await page.evaluate(() => (window as unknown as W).__TP!.teleport(117 * 16, 52 * 16 + 24));
  await page.keyboard.down('d');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'eastend', null, { timeout: 10_000 });
  await page.keyboard.up('d'); await page.waitForTimeout(900);
  const a = await page.evaluate(() => (window as unknown as W).__TP!.player());
  expect(Math.abs(a.x - 96 * 16)).toBeLessThan(2 * 16); expect(a.y).toBeGreaterThan(100 * 16);
  await page.keyboard.down('s');
  await page.waitForFunction(() => (window as unknown as W).__TP?.district === 'waterfront', null, { timeout: 10_000 });
  await page.keyboard.up('s'); await page.waitForTimeout(900);
  const b = await page.evaluate(() => (window as unknown as W).__TP!.player());
  expect(b.x).toBeGreaterThan(118 * 16); expect(Math.abs(b.y - 52 * 16)).toBeLessThan(4 * 16);
  expect(errors).toEqual([]);
});

test('the city map loads other districts on demand and shows the tally', async ({ page }) => {
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.waitForTimeout(700);
  await page.keyboard.press('m'); await page.waitForTimeout(400);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('d'); await page.waitForTimeout(200); }
  await page.waitForFunction(() => { const p = (window as unknown as W).__TP_GAME!.scene.getScene('Pause'); return p?.scene.isActive() && p.root.list.some((o: any) => o.text && /PLAQUES \d+\/\d+/.test(o.text)); }, null, { timeout: 10_000 });
  const texts: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').root.list.filter((o: any) => o.text).map((o: any) => o.text));
  expect(texts.some((t) => t.includes('WATERFRONT'))).toBe(true);
  expect(texts.some((t) => /HEARTS \d\/2/.test(t))).toBe(true);
});

test('after the second win, Dog Fjord reacts to the Livability score', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('trashpanda.save.v1', s), save({ player: { scene: 'explore', district: 'downtown', x: -1, y: -1 } }));
  await page.goto('./?debug&scene=Action&mission=king_of_street');
  await actionReady(page);
  await page.evaluate(() => (window as unknown as W).__TP!.win());
  await page.waitForFunction(() => { const c = (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene'); return c?.scene.isActive() && c.portrait; }, null, { timeout: 40_000 });
  const seen: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1500);
    seen.push(...(await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Cutscene').children.list.filter((o: any) => o.text).map((o: any) => o.text as string))));
    await page.keyboard.press('e');
  }
  const liv = seen.find((t) => t.includes('LIVABILITY'));
  expect(liv).toBeTruthy();
  expect(liv).not.toContain('{LIV}');
  expect(liv).toMatch(/LIVABILITY \d+/);
});
