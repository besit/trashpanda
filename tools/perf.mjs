// FPS sampling with CPU throttling (approximates mid-range phones). Requires a running preview server.
// usage: PLAYWRIGHT_BROWSERS_PATH=0 node tools/perf.mjs [url]
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4173/trashpanda/';
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const settle = Number(process.env.SETTLE ?? 2500); // ms before sampling (M3.1: WF traffic builds for ~40 s)
const browser = await chromium.launch();
const results = [];
for (const throttle of [1, 4, 6]) {
  for (const [scene, q, go] of [['Explore QW', 'scene=Explore', null], ['Explore DT', 'scene=Explore', 'downtown'], ['Action M1', 'scene=Action', null], ['Action M3', 'scene=Action&mission=king_of_street', null], ['Action M2', 'scene=Action&mission=streetcar_through', null], ['Explore EE', 'scene=Explore', 'eastend'], ['Explore WF', 'scene=Explore', 'waterfront'], ['Action M5 (Lane Eater)', 'scene=Action&mission=lane_eater', null], ['Action M7 (Parking Lot)', 'scene=Action&mission=great_parking_lot', null], ['Action M8 (Waterfront)', 'scene=Action&mission=waterfront_heist', null]]) {
    if (only && !only.test(scene)) continue;
    const page = await browser.newPage({ viewport: { width: 1152, height: 648 } });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    await page.goto(`${base}?${q}`);
    await page.waitForFunction(() => window.__TP?.scene, null, { timeout: 30000 });
    if (go) { await page.evaluate((d) => window.__TP.goto(d), go); await page.waitForFunction((d) => window.__TP?.district === d, go, { timeout: 30000 }); }
    await page.waitForTimeout(settle);
    await page.keyboard.down('d');
    const fps = await page.evaluate(() => new Promise((res) => {
      const times = []; let last = performance.now();
      const tick = (t) => { times.push(t - last); last = t; if (times.length < 240) requestAnimationFrame(tick); else res(times); };
      requestAnimationFrame(tick);
    }));
    await page.keyboard.up('d');
    const sorted = [...fps].sort((a, b) => a - b);
    const avg = fps.reduce((a, b) => a + b, 0) / fps.length;
    const mem = await page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null));
    results.push({ scene, throttle: `${throttle}x`, avgFps: +(1000 / avg).toFixed(1), p95FrameMs: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), worstMs: +sorted[sorted.length - 1].toFixed(1), heapMB: mem });
    await page.close();
  }
}
console.table(results);
await browser.close();
