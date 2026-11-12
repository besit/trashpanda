// M3.1: the Lane Eater auto-scroll at an uncapped frame rate (Ivan's M5 report: "the screen didn't move").
import { test, expect, type Page } from '@playwright/test';

type W = { __TP?: Record<string, any> };
const errorsOf = (page: Page) => { const e: string[] = []; page.on('pageerror', (x) => e.push(x.message)); return e; };

// Ivan's M5 report: the screen didn't move. Phaser floors the camera scroll every frame, so at 120+ Hz
// the per-frame step (< 1 px) was lost. Chromium without vsync runs requestAnimationFrame as fast as it can.
test.use({ launchOptions: { args: ['--disable-frame-rate-limit', '--disable-gpu-vsync'] } });
test('the Lane Eater auto-scroll keeps moving', async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto('./?debug&scene=Action&mission=lane_eater');
  await page.waitForFunction(() => (window as unknown as W).__TP?.state && !(window as unknown as W).__TP!.state().frozen, null, { timeout: 15_000 });
  const fps = await page.evaluate(() => new Promise<number>((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); }));
  const x0 = await page.evaluate(() => (window as unknown as W).__TP!.state().camX);
  await page.waitForTimeout(3000);
  const x1 = await page.evaluate(() => (window as unknown as W).__TP!.state().camX);
  console.log(`rAF ${fps}/s, camera ${x0} -> ${x1}`);
  expect(x1 - x0).toBeGreaterThan(120); // 62 px/s for 3 s
  expect(errors).toEqual([]);
});
