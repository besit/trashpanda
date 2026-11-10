// Drives the game in headless Chromium and captures screenshots of each scene.
// usage: PLAYWRIGHT_BROWSERS_PATH=0 node tools/shots.mjs [baseUrl] [outDir] [only-prefix]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] ?? 'http://localhost:5173/';
const out = path.resolve(process.argv[3] ?? 'test-results/shots');
const only = process.argv[4] ?? '';
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const errors = [];
async function page(viewport, query = '', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}\n${e.stack}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await p.goto(base + query);
  await p.waitForFunction(() => window.__TP_GAME?.scene?.getScenes(true)?.length > 0, null, { timeout: 15000 });
  return p;
}
const shot = async (p, name) => { await p.screenshot({ path: path.join(out, `${name}.png`) }); console.log('shot', name); };
const hold = async (p, key, ms) => { await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); };
const want = (k) => !only || k.startsWith(only);
const tp = (p, x, y) => p.evaluate(([x, y]) => window.__TP.teleport(x, y), [x, y]);
const T = 16;

const p = await page({ width: 1152, height: 648 }, '?debug');
if (want('title')) {
  await sleep(1200); await shot(p, '01_title');
  await p.keyboard.press('Enter'); await sleep(400); await shot(p, '02_title_menu');
}
if (want('intro')) {
  await p.goto(base + '?debug&scene=Cutscene');
  await sleep(4200); await shot(p, '03_intro_captions');
  await sleep(4200); await shot(p, '04_intro_dogfraud');
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Enter'); await sleep(700); await p.keyboard.press('Enter'); await sleep(500); }
  await sleep(1800); await shot(p, '05_intro_dvp');
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Enter'); await sleep(700); await p.keyboard.press('Enter'); await sleep(500); }
  await sleep(1500); await shot(p, '06_intro_dvp_lane');
  await sleep(2600); await shot(p, '07_intro_sixlanes');
  await sleep(3200); await shot(p, '08_intro_title');
  await sleep(6500); await shot(p, '09_intro_raccoon');
}
if (want('explore')) {
  await p.goto(base + '?debug&scene=Explore');
  await sleep(1800); await shot(p, '10_explore_spawn');
  await hold(p, 'd', 900); await shot(p, '11_explore_ride');
  await tp(p, 52 * T, 44 * T); await sleep(800); await shot(p, '12_explore_gates');
  await tp(p, 52 * T, 30 * T); await sleep(900); await shot(p, '13_explore_dogbowl');
  await tp(p, 70 * T, 36 * T); await sleep(900); await shot(p, '14_explore_courts');
  await tp(p, 40 * T, 9 * T + 8); await sleep(900); await shot(p, '15_explore_dundas');
  await tp(p, 10 * T, 56 * T); await sleep(900); await shot(p, '16_explore_ossington');
  await tp(p, 30 * T, 68 * T + 4); await sleep(900); await shot(p, '17_explore_graffiti_lane');
  await tp(p, 62 * T, 52 * T + 8); await sleep(800); await shot(p, '18_explore_marker');
  await p.keyboard.press('e'); await sleep(200);
  await tp(p, 62 * T, 52 * T + 8);
  await p.goto(base + '?debug&scene=Explore'); await sleep(1500);
  await p.keyboard.press('m'); await sleep(500); await shot(p, '19_map');
  await p.keyboard.press('m'); await sleep(300);
  await p.keyboard.press('Escape'); await sleep(400); await shot(p, '20_pause');
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await sleep(100); await p.keyboard.press('Enter'); await sleep(400); await shot(p, '21_controls');
  await p.keyboard.press('Escape'); await sleep(200); await p.keyboard.press('Escape'); await sleep(300);
  await tp(p, 40 * T, 52 * T + 8); await sleep(400);
  await p.keyboard.press('t'); await sleep(4000); await shot(p, '22_explore_improved');
}
if (want('brief')) {
  await p.goto(base + '?debug&scene=Cutscene&cs=bwl_before');
  await sleep(5200); await shot(p, '23_brief_squeeze');
  await sleep(6000); await shot(p, '24_brief_rats');
  await p.goto(base + '?debug&scene=Cutscene&cs=bwl_after');
  await sleep(6000); await shot(p, '25_after');
}
if (want('action')) {
  await p.goto(base + '?debug&scene=Action');
  await sleep(2800); await shot(p, '26_action_intro');
  await hold(p, 'd', 1700); await sleep(900); await shot(p, '27_action_rats');
  for (let i = 0; i < 6; i++) { await p.keyboard.press('e'); await sleep(130); }
  await shot(p, '28_action_combat');
  // stand in the construction-rat wave and let cones land (the M0 freeze)
  await p.evaluate(() => { const s = window.__TP_GAME.scene.getScene('Action'); s.player.sprite.x = 760; s.player.hp = 99; });
  await sleep(6000); await shot(p, '29_action_cones');
}
if (want('phone')) {
  const m = await page({ width: 844, height: 390 }, '?debug&scene=Explore', true);
  await sleep(1600); await shot(m, '30_phone_explore');
  await m.goto(base + '?debug&scene=Action'); await sleep(2800); await shot(m, '31_phone_action');
  await m.setViewportSize({ width: 390, height: 844 }); await sleep(600); await shot(m, '32_phone_portrait');
}
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
