// Vertical versions of the promo videos (1.0), for phone feeds (Reels, Shorts, TikTok):
// the game's own "ROTATE YOUR DEVICE" screen first (rendered on a phone-sized page, its phone icon turning
// clockwise), then the same landscape video turned a quarter counter-clockwise: turn the phone the way the icon
// turns and the game is the right way up, filling the screen.
//   node tools/promo/vertical.mjs bwl bus sci hw    -> promo/trashpanda_<name>_vertical.mp4 (1080x1920, 60 fps)
// Needs the dev server (npx vite --port 5180) or PROMO_BASE, and the landscape videos from tools/promo/cut.mjs.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { BASE } from './rec.mjs';

const TMP = 'promo/tmp', FPS = 60, INTRO_S = 2.6;
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

/** the rotate screen: the real page in portrait on a touch phone, its CSS animation stepped frame by frame */
export async function renderIntro() {
  const out = `${TMP}/rotate_intro.mkv`;
  if (existsSync(out)) return out;
  const dir = `${TMP}/rotate`;
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(BASE);
  await page.waitForFunction(() => window.__TP_GAME?.scene.isActive('Title'), null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const n = Math.round(INTRO_S * FPS);
  for (let i = 0; i < n; i++) {
    // the icon waits upright for a moment, turns once (the page's own keyframes, 1.6 s a cycle) and stays sideways
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), Math.min(1.55, Math.max(0, i / FPS - 0.4)) * 1000);
    await page.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` });
  }
  await browser.close();
  ff(['-framerate', String(FPS), '-i', `${dir}/%04d.png`, '-f', 'lavfi', '-t', String(INTRO_S), '-i', 'anullsrc=r=48000:cl=stereo',
    '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', '-c:a', 'pcm_s16le', '-shortest', out]);
  return out;
}

export async function vertical(name) {
  mkdirSync(TMP, { recursive: true });
  const intro = await renderIntro();
  const src = `promo/trashpanda_${name}.mp4`;
  const rot = `${TMP}/${name}_rot.mkv`;
  ff(['-i', src, '-vf', 'transpose=2,format=yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', rot]);
  const out = `promo/trashpanda_${name}_vertical.mp4`;
  ff(['-i', intro, '-i', rot, '-filter_complex', '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]', '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
  console.log(`${out}  ${(+dur).toFixed(1)} s`);
}

if (process.argv[1]?.endsWith('vertical.mjs')) for (const n of process.argv.slice(2)) await vertical(n);
