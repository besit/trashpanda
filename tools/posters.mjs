// M4.4 (Ivan: "Generate the posters in a separate folder for review"): renders every share poster, wide and tall,
// through the game itself (so they are exactly what a player gets) and saves the exported PNGs.
// usage: node tools/posters.mjs [outdir] [baseUrl]   (needs the dev server or a preview running)
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const [out = 'docs/reviews/m44/posters', base = 'http://localhost:5180/'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// a run partway through: a few missions done, a score, a couple of scores on this device
const done = ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'lane_eater', 'great_parking_lot', 'save_the_science'];
const save = {
  version: 4, upgrades: ['queen_protected_lanes', 'queen_tsp', 'king_transit_corridor', 'parkside_calming', 'bloor_lanes_kept', 'parking_to_park', 'science_reopened'],
  completedMissions: done, flags: { sawIntro: true, exploreHint: true, visited_queenwest: true, visited_downtown: true }, ratsDefeated: 61, playTimeMs: 0, lives: 3,
  ridersRallied: 9, difficulty: 'normal', score: 18450, name: 'IVN', runId: 'posters', ranks: {}, player: { scene: 'explore', district: 'downtown', x: -1, y: -1 },
};
const scores = [
  { name: 'IVN', score: 18450, difficulty: 'normal', runId: 'posters', missions: 7, date: '2026-11-18' },
  { name: 'RAC', score: 9200, difficulty: 'easy', runId: 'r2', missions: 4, date: '2026-11-10' },
  { name: 'BIK', score: 26900, difficulty: 'hard', runId: 'r3', missions: 11, date: '2026-11-12' },
];
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1152, height: 648 } });
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto(base);
await page.evaluate(([s, hs]) => { localStorage.setItem('trashpanda.save.v1', s); localStorage.setItem('trashpanda.highscores', hs); }, [JSON.stringify(save), JSON.stringify(scores.sort((a, b) => b.score - a.score))]);
await page.goto(base + '?debug&scene=Explore');
await page.waitForFunction(() => window.__TP?.scene === 'Explore', null, { timeout: 30000 });
await sleep(800);
await page.evaluate(() => { const e = window.__TP_GAME.scene.getScene('Explore'); e.scene.launch('Share', { from: 'Explore', mission: 'save_the_science' }); e.scene.pause(); });
await page.waitForFunction(() => window.__TP?.share?.()?.ready, null, { timeout: 20000 });
for (let i = 0; i < 64; i++) {
  for (const tall of [false, true]) {
    await page.evaluate(([i, tall]) => window.__TP.shareShow(i, tall), [i, tall]);
    await page.waitForFunction(() => window.__TP.share().ready, null, { timeout: 20000 });
    const info = await page.evaluate(() => window.__TP.share());
    if (i > 0 && info.poster === 'versus' && !tall) { i = 999; break; } // wrapped around
    const data = await page.evaluate(async (u) => { const r = await fetch(u); const buf = new Uint8Array(await r.arrayBuffer()); let s = ''; for (let k = 0; k < buf.length; k += 0x8000) s += String.fromCharCode(...buf.subarray(k, k + 0x8000)); return btoa(s); }, info.url);
    const file = path.join(out, `${String(i + 1).padStart(2, '0')}_${info.poster}_${tall ? 'tall' : 'wide'}.png`);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    if (process.env.SHOT) await page.screenshot({ path: file.replace('.png', '_screen.png') });
    console.log('saved', file, info.w, info.h);
  }
  if (i >= 999) break;
}
console.log('errors', JSON.stringify(errs));
await b.close();
