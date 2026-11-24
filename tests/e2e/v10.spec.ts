// End-to-end for 1.0: the version, the anonymous play counter, the boss shouts on screen.
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any>; __TP_GAME?: { scene: { getScene(k: string): any; isActive(k: string): boolean } } };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };

test('1.0: the title says VERSION 1.0, and ABOUT says what the play counter sends', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./');
  await page.waitForFunction(() => (window as unknown as W).__TP_GAME?.scene.isActive('Title'), null, { timeout: 20_000 });
  await page.waitForTimeout(600);
  const texts = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').children.list.filter((o: any) => typeof o.text === 'string').map((o: any) => o.text));
  expect(texts).toContain('VERSION 1.0');
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  // ABOUT is the last item of the main menu (no save: NEW GAME, HIGH SCORES, CONTROLS, ABOUT)
  for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); }
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);
  const about = await page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Title').children.list.filter((o: any) => typeof o.text === 'string' && o.visible).map((o: any) => { const r = o.getBounds(); return { t: o.text, b: { x: r.x, right: r.right, bottom: r.bottom } }; }));
  expect(about.some((a: any) => a.t === 'ABOUT THIS GAME')).toBe(true);
  expect(about.map((a: any) => a.t).join(' ')).toContain('NO COOKIES');
  const w = await page.evaluate(() => (window as unknown as { __TP_GAME: { scale: { width: number } } }).__TP_GAME.scale.width);
  for (const a of about) { expect(a.b.x).toBeGreaterThanOrEqual(0); expect(a.b.right).toBeLessThanOrEqual(w); expect(a.b.bottom).toBeLessThanOrEqual(216); }
  await page.screenshot({ path: 'test-results/v10-about.png' });
  expect(errors).toEqual([]);
});

test('1.0: the play counter writes one anonymous visit, and never from an automated browser', async ({ page, browser }) => {
  // the normal test browser is automated (navigator.webdriver): nothing is sent
  const sent: string[] = [];
  await page.route('https://firestore.googleapis.com/**', (r) => { sent.push(r.request().postData() ?? ''); return r.fulfill({ status: 200, body: '{}' }); });
  await page.goto('./');
  await page.waitForTimeout(6500);
  expect(sent.filter((b) => b.includes('sessions'))).toEqual([]);

  // a browser that looks like a person's: the visit is written after 5 s, with only these fields
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
  const bodies: any[] = [];
  await p2.route('https://firestore.googleapis.com/**', (r) => { const b = r.request().postData(); if (b) bodies.push(JSON.parse(b)); return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  await p2.goto('./');
  await expect.poll(() => bodies.length, { timeout: 15_000 }).toBeGreaterThan(0);
  const w = bodies[0].writes[0];
  expect(w.update.name).toMatch(/\/documents\/sessions\/[a-z0-9]{8,24}$/);
  expect(Object.keys(w.update.fields).sort()).toEqual(['missions', 'player', 'seconds', 'touch', 'ver']);
  expect(w.update.fields.ver.stringValue).toBe('1.0');
  expect(w.update.fields.player.stringValue).toMatch(/^[a-z0-9]{8,24}$/);
  expect(w.currentDocument).toEqual({ exists: false });
  expect(w.updateTransforms.map((t: any) => t.fieldPath).sort()).toEqual(['started', 'updated']);
  // the same player number on the next visit
  const id1 = w.update.fields.player.stringValue;
  expect(await p2.evaluate(() => localStorage.getItem('trashpanda.player'))).toBe(id1);
  await ctx.close();
});

test('1.0: a boss\'s shout stays on screen, on its own panel', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=save_the_science');
  await page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); if (s.lock) s.endArena(''); s.lock = null; s.patrols.forEach((pt: any) => pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 2 }, 0)); s.chaseDone = true; s.waveIdx = 9; (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(2400); });
  await page.keyboard.down('d');
  await page.waitForFunction(() => !!(window as unknown as W).__TP!.wrecker(), null, { timeout: 15_000 });
  await page.keyboard.up('d');
  await page.waitForTimeout(300);
  const box = await page.evaluate(() => {
    const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action');
    const c = s.children.list.find((o: any) => o.type === 'Container' && o.list?.some((x: any) => typeof x.text === 'string' && x.text.startsWith('DEMOLITION PERMIT')));
    if (!c) return null;
    const t = c.list.find((x: any) => typeof x.text === 'string');
    return { x: c.x - s.cameras.main.scrollX, half: t.width / 2, w: s.scale.width, lines: t.text.split('\n').length };
  });
  expect(box).not.toBeNull();
  expect(box!.lines).toBe(2);
  expect(box!.x - box!.half).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.half).toBeLessThanOrEqual(box!.w);
  expect(errors).toEqual([]);
});
