// Full-scale district map images for review (M3.1, Ivan: "save all the maps as full scale images").
// Drives the running game: hides the HUD and the player, steps the camera over the whole map, snapshots
// each screen at 1x and stitches them into one PNG per district (traffic + people included).
//   PLAYWRIGHT_BROWSERS_PATH=0 node tools/mapshots.mjs [baseUrl] [outDir] [district,...] [improvements]
//   improvements: "all" applies every improvement patch first (the "after" city)
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const [base = 'http://localhost:5180/', out = 'docs/maps', only = '', imp = ''] = process.argv.slice(2);
const DISTRICTS = (only || 'queenwest,highpark,downtown,eastend,waterfront').split(',');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 768, height: 432 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(base + '?debug&scene=Explore');
await page.waitForFunction(() => window.__TP?.scene === 'Explore', null, { timeout: 30000 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const d of DISTRICTS) {
  await page.evaluate((d) => window.__TP.goto(d), d);
  await page.waitForFunction((d) => window.__TP?.district === d && !window.__TP.busy(), d, { timeout: 20000 });
  await sleep(1500);
  if (imp === 'all') { await page.evaluate(() => Object.keys(window.__TP.map.improvements).forEach((i) => window.__TP.improveNow(i))); await sleep(300); }
  const dataUrl = await page.evaluate(async () => {
    const s = window.__TP_GAME.scene.getScene('Explore');
    const cam = s.cameras.main, W = cam.width, H = cam.height;
    cam.stopFollow();
    s.player.frozen = true;
    s.player.sprite.setPosition(-9999, -9999); // off the map: nothing fades for it, and it isn't drawn
    s.children.list.forEach((o) => { if (o.scrollFactorX === 0) o.setVisible(false); });
    const mw = s.map.widthPx, mh = s.map.heightPx;
    const big = document.createElement('canvas'); big.width = mw; big.height = mh;
    const g = big.getContext('2d');
    const xs = []; for (let x = 0; x < mw; x += W) xs.push(Math.min(x, mw - W));
    const ys = []; for (let y = 0; y < mh; y += H) ys.push(Math.min(y, mh - H));
    const frame = () => new Promise((r) => s.events.once('postupdate', () => requestAnimationFrame(() => r())));
    for (const y of ys) for (const x of xs) {
      cam.setScroll(x, y);
      await frame(); await frame();
      const img = await new Promise((r) => s.game.renderer.snapshot((im) => r(im)));
      g.drawImage(img, 0, 0, img.width, img.height, x, y, W, H);
    }
    return big.toDataURL('image/png');
  });
  const file = `${out}/${d}${imp === 'all' ? '_after' : ''}.png`;
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', file);
}
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
await browser.close();
