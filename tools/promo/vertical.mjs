// Vertical versions of the promo videos (1.0), for phone feeds (Reels, Shorts, TikTok):
// the game's own "ROTATE YOUR DEVICE" screen first (rendered on a phone-sized page, its phone icon turning
// counter-clockwise), then the same landscape video turned a quarter clockwise: turn the phone the way the icon
// turns and the game is the right way up, filling the screen. The video's song starts under the rotate screen
// (which lasts a whole number of its bars or beats, close to 2.6 s), so the cuts stay on the beat (cut.mjs).
//   node tools/promo/vertical.mjs bwl bus sci hw    -> promo/trashpanda_<name>_vertical.mp4 (1080x1920, 60 fps)
// Needs the dev server (npx vite --port 5180) or PROMO_BASE, and the landscape videos from tools/promo/cut.mjs.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { BASE } from './rec.mjs';
import { plan, mixAudio, leadFor, AUDIO_IN, AUDIO_OUT } from './cut.mjs';

const TMP = 'promo/tmp', FPS = 60;
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

/** the rotate screen: the real page in portrait on a touch phone, its CSS animation stepped frame by frame */
export async function renderIntro(seconds) {
  const n = Math.round(seconds * FPS);
  const out = `${TMP}/rotate_intro_${n}.mkv`;
  if (existsSync(out)) return out;
  const dir = `${TMP}/rotate_${n}`;
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(BASE);
  await page.waitForFunction(() => window.__TP_GAME?.scene.isActive('Title'), null, { timeout: 30000 });
  // Ivan: the video turns the other way (a quarter clockwise), so the icon turns counter-clockwise to match
  await page.addStyleTag({ content: '#rotate .phone { animation-name: rotccw !important } @keyframes rotccw { 0%, 30% { transform: rotate(0) } 60%, 100% { transform: rotate(-90deg) } }' });
  await page.waitForTimeout(1500);
  for (let i = 0; i < n; i++) {
    // the icon waits upright for a moment, turns once (the page's own keyframes, 1.6 s a cycle) and stays sideways
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), Math.min(1.55, Math.max(0, i / FPS - 0.4)) * 1000);
    await page.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` });
  }
  await browser.close();
  ff(['-framerate', String(FPS), '-i', `${dir}/%04d.png`, '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', out]);
  return out;
}

export async function vertical(name) {
  mkdirSync(TMP, { recursive: true });
  const lead = Math.round(leadFor(name) * FPS) / FPS;
  const intro = await renderIntro(lead);
  const src = `promo/trashpanda_${name}.mp4`;
  const rot = `${TMP}/${name}_rot.mkv`;
  ff(['-i', src, '-vf', 'transpose=1,format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', rot]);
  const wav = mixAudio(plan(name, lead), `${TMP}/${name}_vertical.f32`);
  const out = `promo/trashpanda_${name}_vertical.mp4`;
  ff(['-i', intro, '-i', rot, ...AUDIO_IN(wav), '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-map', '2:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), ...AUDIO_OUT, '-movflags', '+faststart', out]);
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
  console.log(`${out}  ${(+dur).toFixed(1)} s`);
}

if (process.argv[1]?.endsWith('vertical.mjs')) for (const n of process.argv.slice(2)) await vertical(n);
