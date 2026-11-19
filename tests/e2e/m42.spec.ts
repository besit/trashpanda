// End-to-end for M4.2 (Ivan's M4.1 notes): the numbered mission list, the city map's neighbours, bosses that
// slide in, the Monster SUV's roof, the Wrecker (only the ball hurts), the Jet Tug's rev.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any; isActive(k: string): boolean } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };
const actionReady = (page: Page) => page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
const toBoss = (page: Page, x: number) => page.evaluate((x) => {
  const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action');
  if (s.lock) s.endArena(''); s.lock = null;
  s.rats.forEach((r: any) => r.alive && r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 1 }, 0));
  if (s.mission.action.depave) { s.depave = { update() {}, finish() {}, allDone: true, fence: true, done: 4, total: 4 }; s.depaveDone = true; }
  s.patrols.forEach((pt: any) => pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 2 }, 0));
  s.chaseDone = true; s.waveIdx = 9; (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(x);
}, x);

test('SELECT MISSION is numbered in the order the missions open up', async ({ page }) => {
  await page.goto('./?debug');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.getScene('Title')?.scene.isActive(), null, { timeout: 15_000 });
  await page.waitForTimeout(600); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await page.evaluate(() => { const t = (window as unknown as W).__TP_GAME!.scene.getScene('Title'); t.items.find((i: any) => i.label === 'SELECT MISSION').action(); });
  await page.waitForTimeout(300);
  const labels: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').items.map((i: any) => i.label));
  expect(labels[1]).toMatch(/^1\. THE BIKE LANE WAR/);
  expect(labels[labels.length - 1]).toMatch(/^13\. DEATH BY HIGHWAY/);
  expect(labels.findIndex((l) => l.includes('THE BIKE BUS'))).toBeGreaterThan(labels.findIndex((l) => l.includes('THE GREAT PARKING LOT')));
});

test('the city map: street + park names only; DOWN from High Park, Downtown or the East End is the Waterfront', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 15_000 });
  await page.waitForTimeout(1000);
  await page.keyboard.press('m'); await page.waitForTimeout(800);
  const view = () => page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').viewDistrict);
  const press = async (k: string) => { await page.keyboard.press(k); await page.waitForTimeout(700); return view(); };
  expect(await view()).toBe('queenwest');
  expect(await press('ArrowLeft')).toBe('highpark');
  expect(await press('ArrowDown')).toBe('waterfront');
  expect(await press('ArrowRight')).toBe('eastend');
  expect(await press('ArrowDown')).toBe('waterfront');
  expect(await press('ArrowUp')).toBe('downtown');
  expect(await press('ArrowDown')).toBe('waterfront');
  // no plaque-style names on the map: Grenadier Pond, the dog bowl, the CN Tower...
  await press('ArrowLeft'); // High Park
  const texts: string[] = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Pause').root.list.filter((o: any) => o.text).map((o: any) => o.text));
  expect(texts.join(' ')).toContain('HIGH PARK');
  expect(texts.join(' ')).not.toContain('GRENADIER POND');
  expect(texts.join(' ')).not.toContain('DUNDAS ST W');
  expect(errors).toEqual([]);
});

test('a boss slides in from beyond the screen edge; the Monster SUV bounces you off its visible roof', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=great_parking_lot');
  await actionReady(page);
  // record where it is on the very first frame it exists
  await page.evaluate(() => { const w = window as any; w.__first = null; const tick = () => { const m = w.__TP?.monster?.(); if (m && !w.__first) w.__first = { x: m.x, cam: w.__TP.state().camX }; if (!w.__first) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await toBoss(page, 1980);
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as any).__first, null, { timeout: 15_000 });
  const m0 = await page.evaluate(() => (window as any).__first);
  expect(m0.x - 56).toBeGreaterThan(m0.cam + 384 - 30); // its body starts (nearly) off screen and drives in
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async () => {
    const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const m = (window as unknown as W).__TP!.monster(); const hp0 = m.hp;
    g.player.body.reset(m.x, (window as unknown as W).__TP!.gy() - 120); g.player.body.setVelocity(0, 0);
    let at: number | null = null;
    for (let i = 0; i < 80; i++) { await new Promise((r) => requestAnimationFrame(r)); if (g.player.body.velocity.y < -100 && at === null) at = g.player.body.bottom - m.roofY(); }
    return { hp0, hp1: m.hp, at };
  });
  expect(r.hp1).toBeLessThan(r.hp0);
  expect(r.at).not.toBeNull();
  expect(Math.abs(r.at!)).toBeLessThan(6);
  expect(errors).toEqual([]);
});

test('the Wrecker: drives, hoists, drops, gets stuck, hauls, winds up and swings; the truck is safe to stand by', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=save_the_science');
  await actionReady(page);
  await toBoss(page, 2570);
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.wrecker?.(), null, { timeout: 15_000 });
  const seen = new Set<string>();
  for (let i = 0; i < 600 && seen.size < 8; i++) { seen.add(await page.evaluate(() => (window as unknown as W).__TP!.state().wrecker.phase)); await page.waitForTimeout(40); }
  for (const ph of ['drive', 'hoist', 'drop', 'stuck', 'haul', 'windup', 'swing']) expect(seen.has(ph)).toBe(true);
  // stand at the truck through a whole swing: the ball never comes back through the cab
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().wrecker.phase === 'swing', null, { timeout: 20_000 });
  const r = await page.evaluate(async () => {
    const g = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); const w = (window as unknown as W).__TP!.wrecker();
    g.player.invulnT = 0; const hp0 = g.player.hp; g.player.body.reset(w.x + 24, (window as unknown as W).__TP!.gy() - 10);
    await new Promise((r) => setTimeout(r, 1500));
    const whp = w.hp; g.player.facing = -1;
    return { hp0, hp1: g.player.hp, whp };
  });
  expect(r.hp1).toBe(r.hp0);
  expect(errors).toEqual([]);
});

test('the Jet Tug revs at the edge (its jet off screen, not rideable), then crosses fast', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=island_airport');
  await actionReady(page);
  await toBoss(page, 2140);
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug?.phase === 'rev', null, { timeout: 15_000 });
  const rev = await page.evaluate(() => { const t = (window as unknown as W).__TP!.tug(); const pb = t.platform.body; const s = (window as unknown as W).__TP!.state(); return { rideable: pb.checkCollision.up, jetLeft: t.platform.x - pb.width / 2, right: s.camX + 384 }; });
  expect(rev.rideable).toBe(false);
  expect(rev.jetLeft).toBeGreaterThan(rev.right - 4);
  await page.waitForFunction(() => (window as unknown as W).__TP!.state().tug?.phase === 'drive', null, { timeout: 5000 });
  expect(await page.evaluate(() => (window as unknown as W).__TP!.tug().platform.body.checkCollision.up)).toBe(true);
  expect(errors).toEqual([]);
});
