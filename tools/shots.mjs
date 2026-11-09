// Drives the game in headless Chromium and captures screenshots of each scene.
// usage: PLAYWRIGHT_BROWSERS_PATH=0 node tools/shots.mjs [baseUrl] [outDir]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] ?? 'http://localhost:5173/';
const out = path.resolve(process.argv[3] ?? 'test-results/shots');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const errors = [];
async function page(viewport, query = '', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await p.goto(base + query);
  await p.waitForFunction(() => window.__TP_GAME?.scene?.getScenes(true)?.length > 0, null, { timeout: 15000 });
  return p;
}
const shot = async (p, name) => { await p.screenshot({ path: path.join(out, `${name}.png`) }); console.log('shot', name); };
const hold = async (p, key, ms) => { await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); };

// Desktop 1152x648 (3x)
const p = await page({ width: 1152, height: 648 }, '?debug');
await sleep(1200);
await shot(p, '01_title');
await p.keyboard.press('Enter');
await sleep(400);
await shot(p, '02_title_menu');

// Cutscene
await p.goto(base + '?debug&scene=Cutscene');
await sleep(4500); await shot(p, '03_cutscene_captions');
await sleep(4000); await shot(p, '04_cutscene_dogfraud');
for (let i = 0; i < 3; i++) { await p.keyboard.press('Enter'); await sleep(900); await p.keyboard.press('Enter'); await sleep(400); }
await shot(p, '05_cutscene_dialogue');
await sleep(2500); await shot(p, '06_cutscene_lanes');

// Explore
await p.goto(base + '?debug&scene=Explore');
await sleep(1500);
await shot(p, '07_explore_start');
await hold(p, 'd', 1200);
await shot(p, '08_explore_ride');
await p.keyboard.down('Shift'); await hold(p, 'd', 1500); await p.keyboard.up('Shift');
await shot(p, '09_explore_boost');
await hold(p, 's', 900); await hold(p, 'a', 600);
await shot(p, '10_explore_street');
await p.evaluate(() => window.__TP.teleport(50 * 16, 10 * 16 + 14));
await sleep(600);
await shot(p, '11_explore_marker');
await p.keyboard.press('t');
await sleep(2500);
await shot(p, '12_explore_improved');

// Action
await p.goto(base + '?debug&scene=Action');
await sleep(2600);
await shot(p, '13_action_intro');
await hold(p, 'd', 1600);
await shot(p, '14_action_ride');
await hold(p, 'd', 700);
await sleep(900);
await shot(p, '15_action_rats');
for (let i = 0; i < 6; i++) { await p.keyboard.press('k'); await sleep(130); }
await shot(p, '16_action_combat');
await p.keyboard.press('j'); await sleep(200);
await shot(p, '17_action_jump');

// Phone landscape w/ touch (844x390)
const m = await page({ width: 844, height: 390 }, '?debug&scene=Explore', true);
await sleep(1500);
await shot(m, '18_phone_explore');
await m.goto(base + '?debug&scene=Action');
await sleep(2800);
await shot(m, '19_phone_action');

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
