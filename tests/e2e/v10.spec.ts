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
  // Ivan: the raccoon is drawn on top of the Wrecker's truck (it got lost behind it); the ball stays in front
  const depths = await page.evaluate(() => { const tp = (window as unknown as W).__TP as any; const w = tp.wrecker(); return { truck: w.img.depth, ball: w.ball.depth, raccoon: tp.player.sprite.depth }; });
  expect(depths.truck).toBeLessThan(depths.raccoon);
  expect(depths.ball).toBeGreaterThan(depths.raccoon);
  expect(errors).toEqual([]);
});

test('1.0: SAVE THE SCIENCE: the hint box and PERMIT REVOKED! cover the warehouse sign, and a solid banner puts the hint away', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=save_the_science');
  await page.waitForFunction(() => typeof (window as unknown as W).__TP?.state === 'function' && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 20_000 });
  // the SCIENCE CENTRE EXHIBITS lettering is at y 56-69 on screen: the chase's two-line hint reaches down past it
  // (its letters showed under the box), and FIGHT! clears it (it landed right under it)
  const hint = await page.evaluate(() => {
    const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action');
    s.say('THEY\'VE GOT THE EXHIBITS!\nCATCH THEM BEFORE THE TRUCK!', 0xfff08a, 2400);
    const t = s.sayObj; const r = { top: t.y - 4, bottom: t.y + t.height + 4 };
    s.flashGo('FIGHT!');
    const cb = s.goBand.commandBuffer, i = cb.indexOf(0x16121f); // ...FILL_STYLE, colour, alpha...: the band is solid (the sign read through at 0.95)
    return { ...r, after: !!s.sayObj?.active, band: [cb[i], cb[i + 1]] };
  });
  expect(hint.band).toEqual([0x16121f, 1]);
  expect(hint.top).toBeGreaterThanOrEqual(30);
  expect(hint.bottom).toBeGreaterThanOrEqual(70);
  expect(hint.after).toBe(false);
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action'); if (s.lock) s.endArena(''); s.lock = null; s.patrols.forEach((pt: any) => pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 2 }, 0)); s.chaseDone = true; s.waveIdx = 9; (window as unknown as W).__TP!.player.invulnT = 99999; (window as unknown as W).__TP!.skipTo(2400); });
  await page.keyboard.down('d');
  await page.waitForFunction(() => !!(window as unknown as W).__TP!.wrecker(), null, { timeout: 15_000 });
  await page.keyboard.up('d');
  await page.evaluate(() => { const w = (window as unknown as W).__TP!.wrecker(); w.state = 'stuck'; w.t = 9; w.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 781 }, 'pump'); });
  await page.waitForTimeout(500); // past its little hop
  const panel = await page.evaluate(() => {
    const s = (window as unknown as W).__TP_GAME!.scene.getScene('Action');
    const c = s.children.list.find((o: any) => o.type === 'Container' && o.list?.some((x: any) => x.text === 'PERMIT REVOKED!'));
    if (!c) return null;
    const t = c.list.find((x: any) => typeof x.text === 'string');
    return { top: c.y - (t.height + 6) / 2, bottom: c.y + (t.height + 6) / 2 };
  });
  expect(panel).not.toBeNull();
  expect(panel!.top).toBeLessThanOrEqual(56);
  expect(panel!.bottom).toBeGreaterThanOrEqual(70);
  expect(errors).toEqual([]);
});

test('1.0: a long easter-egg message ends above the E: prompt, and reading a plaque puts it away', async ({ page }) => {
  test.slow(); // the East End is the heaviest district: under a full parallel run it needs more than 90 s
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Explore');
  await page.waitForFunction(() => (window as unknown as W).__TP?.scene === 'Explore', null, { timeout: 20_000 });
  await page.evaluate(() => (window as unknown as { __TP: { goto: (d: string) => void } }).__TP.goto('eastend'));
  await page.waitForFunction(() => { const tp = (window as unknown as W).__TP as any; return tp?.district === 'eastend' && !tp.busy(); }, null, { timeout: 20_000 });
  await page.waitForTimeout(800);
  // ride into the view from the hill (a four-line message), right beside Riverdale Park's plaque
  // toasts stay up while the test measures (on a busy machine the 4.5 s one could be gone before it was read)
  await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Explore'); const orig = s.toast; s.toast = (msg: string) => orig.call(s, msg, 60_000); });
  // (440, 130) is on the path, clear of the trees: a teleport into a tree gets pushed out of the spot on a slow frame
  const eggShown = () => page.evaluate(() => (window as unknown as W).__TP_GAME!.scene.getScene('Explore').toasts.some((x: any) => x.active && x.text.includes('EASTER EGG')));
  for (let i = 0; i < 20 && !(await eggShown()); i++) { await page.evaluate(() => (window as unknown as W).__TP!.teleport(440, 130)); await page.waitForTimeout(500); }
  expect(await eggShown()).toBe(true);
  await page.waitForTimeout(400);
  const box = await page.evaluate(() => {
    const s = (window as unknown as W).__TP_GAME!.scene.getScene('Explore');
    const t = s.toasts.find((x: any) => x.active), pr = s.hud.prompt;
    const tb = t.getBounds(), pb = pr.getBounds();
    return { toast: t.text, tBottom: tb.bottom, pTop: pb.y, prompt: pr.text };
  });
  expect(box.toast).toContain('EASTER EGG');
  expect(box.prompt).toContain('PLAQUE');
  expect(box.tBottom).toBeLessThanOrEqual(box.pTop);
  await page.screenshot({ path: 'test-results/v10-egg.png' });
  await page.keyboard.press('e');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => { const s = (window as unknown as W).__TP_GAME!.scene.getScene('Explore'); return { toasts: s.toasts.filter((x: any) => x.active).length, plaque: !!s.plaqueObj?.active }; });
  expect(after).toEqual({ toasts: 0, plaque: true });
  expect(errors).toEqual([]);
});
