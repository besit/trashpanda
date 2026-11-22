// M4.14 (Ivan: the title poster "should be our hero poster for the game preview... not a lot of text. Just Trash Panda,
// Right of way and the link address"): renders the title poster's link-preview version in the running dev server and
// writes public/og.png (1536 x 864: the 768 x 432 poster at 2x, hard pixels), the image chats and socials show for a
// shared link (index.html: og:image / twitter:image).
// usage: (dev server on :5180) PLAYWRIGHT_BROWSERS_PATH=0 node tools/og.mjs [port]
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const port = process.argv[2] || '5180';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 768, height: 432 }, acceptDownloads: true });
await p.goto(`http://localhost:${port}/?debug&scene=Explore`);
await p.waitForFunction(() => window.__TP?.scene === 'Explore', null, { timeout: 30000 });
await p.evaluate(() => { const e = window.__TP_GAME.scene.getScene('Explore'); e.scene.launch('Share', { from: 'Explore', poster: 'title', preview: true }); e.scene.pause(); });
await p.waitForFunction(() => window.__TP?.share?.().ready, null, { timeout: 15000 });
const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => window.__TP_GAME.scene.getScene('Share').shareTo('save'))]);
const buf = fs.readFileSync(await dl.path());
await b.close();
// the export is the poster x3: take every third pixel (exact), then double it
const src = PNG.sync.read(buf), W = src.width / 3, H = src.height / 3, out = new PNG({ width: W * 2, height: H * 2 });
for (let y = 0; y < H * 2; y++) for (let x = 0; x < W * 2; x++) src.data.copy(out.data, (y * W * 2 + x) * 4, (((y >> 1) * 3 + 1) * src.width + (x >> 1) * 3 + 1) * 4, (((y >> 1) * 3 + 1) * src.width + (x >> 1) * 3 + 1) * 4 + 4);
fs.writeFileSync('public/og.png', PNG.sync.write(out));
console.log(`public/og.png: ${W * 2} x ${H * 2}, ${(fs.statSync('public/og.png').size / 1024).toFixed(0)} KB`);
