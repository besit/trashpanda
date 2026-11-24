// Promo recorder (1.0). Plays the game in a headless browser one frame at a time: the page's clock
// (requestAnimationFrame, performance.now, setTimeout/setInterval) only moves when we step it, exactly 1/60 s
// a frame, so the video is a perfect 60 fps however long a frame takes to draw and save. The game's synth renders
// into an OfflineAudioContext that is advanced in the same steps, so the music and sound effects stay in sync.
// Frames are saved at the canvas's real 384x216 pixels; tools/promo/cut.mjs scales them up crisply and edits.
// The page is an automated browser, so it never posts scores or play counts.
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';

export const BASE = process.env.PROMO_BASE ?? 'http://localhost:5180/';
export const OUT = 'promo/raw';
const RATE = 48000, SPF = RATE / 60; // 800 samples a frame

const INIT = `(() => {
  // --- the clock: only __recFrame moves it ---
  const realNow = performance.now.bind(performance);
  let now = realNow(), frames = 0, nextId = 1;
  const timers = new Map(); // id -> {due, cb, args, every}
  const rafs = new Map();
  performance.now = () => now;
  // Phaser's tweens smooth lag with Date.now(): it must follow the same clock
  const realDate = Date.now.bind(Date), date0 = realDate() - now;
  Date.now = () => Math.round(date0 + now);
  window.requestAnimationFrame = (cb) => { const id = nextId++; rafs.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => { rafs.delete(id); };
  window.setTimeout = (cb, ms = 0, ...args) => { const id = nextId++; timers.set(id, { due: now + Math.max(0, +ms || 0), cb, args, every: 0 }); return id; };
  window.setInterval = (cb, ms = 0, ...args) => { const id = nextId++; const e = Math.max(4, +ms || 0); timers.set(id, { due: now + e, cb, args, every: e }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  const runTimers = () => {
    for (let guard = 0; guard < 1000; guard++) {
      let best = null;
      for (const [id, t] of timers) if (t.due <= now && (!best || t.due < best[1].due)) best = [id, t];
      if (!best) return;
      const [id, t] = best;
      if (t.every) t.due += t.every; else timers.delete(id);
      try { if (typeof t.cb === 'function') t.cb(...t.args); } catch (e) { console.error(e); }
    }
  };
  // --- the audio: the game's AudioContext is an OfflineAudioContext we render frame by frame ---
  const OAC = window.OfflineAudioContext;
  let ac = null, aFrames = 0, started = false;
  class RecAC extends OAC {
    constructor() {
      const big = !!window.__recArm;
      super(1, ${RATE} * (big ? (window.__recLenS || 300) : 1), ${RATE});
      if (big && !ac) ac = this;
    }
    get state() { return 'running'; }
    resume() { return Promise.resolve(); }
    suspend() { return Promise.resolve(); }
  }
  window.AudioContext = RecAC; window.webkitAudioContext = RecAC;
  // keep the WebGL picture after it's shown, so the frame can be read back
  const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (/webgl/.test(type)) attrs = Object.assign({}, attrs || {}, { preserveDrawingBuffer: true });
    return gc.call(this, type, attrs);
  };
  window.__recFrame = async () => {
    if (ac) {
      aFrames++;
      const p = OAC.prototype.suspend.call(ac, aFrames / 60);
      if (!started) { started = true; window.__recRender = ac.startRendering(); } else OAC.prototype.resume.call(ac);
      await p;
    }
    frames++; now += 1000 / 60;
    runTimers();
    const cbs = [...rafs.values()]; rafs.clear();
    for (const cb of cbs) { try { cb(now); } catch (e) { console.error(e); } }
    return aFrames;
  };
  window.__recPng = () => document.querySelector('canvas').toDataURL('image/png').split(';base64,')[1];
  // the samples of audio frames [a, b), as base64 float32
  window.__recAudio = async (a, b) => {
    if (!ac) return '';
    if (!window.__recBuf) { OAC.prototype.resume.call(ac); window.__recBuf = await window.__recRender; }
    const d = window.__recBuf.getChannelData(0).slice(a * ${SPF}, b * ${SPF});
    const u8 = new Uint8Array(d.buffer); let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  };
})();`;

// what's happening, in a line: the scenes, Dog Fjord's portrait, the words on screen, the raccoon's health and the
// boss's. Every change is marked in the shot (marks.txt), so the edit can find the moments.
const SNAP = () => {
  const g = window.__TP_GAME; if (!g) return '';
  const on = ['Explore', 'Action', 'Cutscene'].filter((k) => g.scene.isActive(k));
  const words = (sc) => sc.children.list.filter((o) => typeof o.text === 'string' && o.visible && o.alpha > 0.05 && o.text.length > 2 && o.text !== 'ESC: SKIP').map((o) => o.text.replace(/\n/g, ' / ')).join(' | ');
  const cs = g.scene.getScene('Cutscene'), ex = g.scene.getScene('Explore'), ac = g.scene.getScene('Action');
  let out = on.join('+');
  if (on.includes('Cutscene')) out += (cs.portrait ? ' [DOG FJORD]' : '') + ' ' + words(cs).slice(0, 120);
  else if (on.includes('Explore')) out += (ex.plaqueObj?.active ? ' [PLAQUE]' : '') + ' ' + (ex.toasts ?? []).filter((t) => t.active).map((t) => t.text.replace(/\n/g, ' / ')).join(' ').slice(0, 90);
  if (on.includes('Action') && ac.player) {
    const b = ac.boss ?? ac.monster ?? ac.wrecker ?? ac.mech;
    out += ` hp ${ac.player.hp}` + (b ? ` boss ${Math.max(0, b.hp)}` : '');
  }
  return out;
};

export class Rec {
  constructor(page, name) { this.page = page; this.name = name; this.shots = []; this.shot = null; this.n = 0; }

  static async launch(name) {
    const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    const page = await browser.newPage({ viewport: { width: 1152, height: 648 } });
    page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 200)); });
    await page.addInitScript(INIT);
    const r = new Rec(page, name);
    r.browser = browser; Rec.current = r;
    rmSync(`${OUT}/${name}`, { recursive: true, force: true });
    mkdirSync(`${OUT}/${name}`, { recursive: true });
    return r;
  }

  /** one frame (saved if a shot is open) */
  async frame() {
    let a;
    try { a = await this.page.evaluate(() => window.__recFrame()); } catch (e) {
      if (this.shot || !/context was destroyed|navigation/.test(String(e))) throw e;
      await new Promise((res) => setTimeout(res, 200)); return; // the page reloaded (the dev server): keep stepping
    }
    if (this.shot && this.watch && this.n % 6 === 0) {
      const w = await this.page.evaluate(SNAP).catch(() => '');
      if (w !== this.lastSnap) { this.lastSnap = w; this.mark(w); }
    }
    if (this.shot) {
      const png = await this.page.evaluate(() => window.__recPng());
      writeFileSync(`${this.shot.dir}/${String(this.shot.frames).padStart(5, '0')}.png`, Buffer.from(png, 'base64'));
      if (this.shot.frames === 0) this.shot.a0 = a;
      this.shot.frames++; this.shot.a1 = a + 1;
    }
    this.n++;
  }
  async frames(n) { for (let i = 0; i < n; i++) await this.frame(); }
  async sec(s) { await this.frames(Math.round(s * 60)); }
  /** step until fn() is true in the page (checked every few frames) */
  async until(fn, arg, maxS = 60) {
    for (let i = 0; i < maxS * 60; i += 3) {
      if (await this.page.evaluate(fn, arg).catch(() => false)) return true;
      await this.frames(3);
    }
    throw new Error(`timed out waiting: ${String(fn).slice(0, 120)}`);
  }
  async hold(keys, s) {
    for (const k of keys) await this.page.keyboard.down(k);
    await this.sec(s);
    for (const k of keys) await this.page.keyboard.up(k);
  }
  async press(k, s = 0.1) { await this.page.keyboard.down(k); await this.frames(3); await this.page.keyboard.up(k); await this.sec(s); }
  js(fn, arg) { return this.page.evaluate(fn, arg); }

  start(name) { const dir = `${OUT}/${this.name}/${String(this.shots.length).padStart(2, '0')}_${name}`; mkdirSync(dir, { recursive: true }); this.shot = { name, dir, frames: 0, a0: 0, a1: 0, marks: [] }; this.lastSnap = null; console.log(`  shot ${name}`); }
  /** a note at this frame of the shot (what happened when: for picking the cuts) */
  mark(s) { if (!this.shot) return; this.shot.marks.push({ t: +(this.shot.frames / 60).toFixed(2), s }); }
  stop() { if (this.shot) { this.shots.push(this.shot); console.log(`    ${this.shot.frames} frames`); } this.shot = null; }

  /** the title screen with a save; ENTER twice = start (sound on) + CONTINUE */
  async continueFrom(save) {
    await this.page.goto(BASE);
    await this.page.evaluate((s) => { localStorage.clear(); localStorage.setItem('trashpanda.save.v1', JSON.stringify(s)); }, save);
    await this.page.goto(BASE + '?debug');
    await this.until(() => window.__TP_GAME?.scene.isActive('Title'));
    await this.sec(1);
    await this.js(() => { window.__recArm = true; });
    await this.press('Enter', 0.6);
    await this.press('Enter');
    await this.until(() => window.__TP?.scene === 'Explore' && window.__TP_GAME.scene.isActive('Explore') && !window.__TP_GAME.scene.isActive('Cutscene'));
    // the cutscenes' "ESC: SKIP" hint stays out of the promo
    await this.js(() => window.setInterval(() => { const c = window.__TP_GAME.scene.getScene('Cutscene'); if (c?.sys.isActive()) c.children.list.forEach((x) => { if (x.text === 'ESC: SKIP') x.setVisible(false); }); }, 30));
  }

  /** the shot list and every shot's marks (also written when a shoot fails, to see where) */
  writeMarks() {
    if (this.shot) { this.shots.push(this.shot); this.shot = null; }
    writeFileSync(`${OUT}/${this.name}/shots.json`, JSON.stringify(this.shots.map(({ name, dir, frames, marks }) => ({ name, dir, frames, marks })), null, 1));
    writeFileSync(`${OUT}/${this.name}/marks.txt`, this.shots.map((s) => `== ${s.name} (${(s.frames / 60).toFixed(1)} s)\n` + s.marks.map((m) => `${m.t.toFixed(2).padStart(7)}  ${m.s}`).join('\n')).join('\n'));
  }

  /** save the shots' audio and the shot list */
  async finish() {
    this.stop();
    for (const s of this.shots) {
      const b64 = await this.page.evaluate(([a, b]) => window.__recAudio(a, b), [s.a0, s.a1]);
      writeFileSync(`${s.dir}/audio.f32`, Buffer.from(b64, 'base64'));
    }
    this.writeMarks();
    await this.browser.close();
  }
}

export const save = (o = {}) => ({ version: 4, upgrades: [], completedMissions: [], flags: { sawIntro: true, exploreHint: true, visited_downtown: true, visited_highpark: true, visited_eastend: true, visited_waterfront: true }, ratsDefeated: 40, playTimeMs: 0, lives: 3, ridersRallied: 0, difficulty: 'normal', score: 0, name: 'RAC', runId: 'promo', ranks: {}, player: { scene: 'explore', district: 'queenwest', x: -1, y: -1 }, ...o });

/** the raccoon takes its hits (knocked back, flashing, health down) but a hit that would cost a life leaves it on its
 *  last heart instead: the promo bot mustn't lose a life and restart the mission */
export const SURVIVE = () => {
  const p = window.__TP?.player;
  if (!p || p.__safe) return;
  p.__safe = true;
  const h = p.hurt.bind(p);
  p.hurt = (x, d) => { const r = h(x, d); if (p.hp <= 0) { p.hp = 1; p.dead = false; } return r; };
};

/** side view: ride right, face and swing at the nearest enemy, hop now and then. It takes hits (see SURVIVE). */
export async function brawl(r, maxS, opts = {}) {
  const page = r.page;
  let held = null, hes = 0, boosting = false;
  const setDir = async (k) => { if (held === k) return; if (held) await page.keyboard.up(held); held = k; if (k) await page.keyboard.down(k); };
  for (let t = 0; t < maxS * 60; t += 5) {
    const s = await page.evaluate(() => {
      const tp = window.__TP; if (!tp || typeof tp.state !== 'function') return null;
      const p = tp.player; if (p && !p.__safe) { p.__safe = true; const h = p.hurt.bind(p); p.hurt = (x, d) => { const r = h(x, d); if (p.hp <= 0) { p.hp = 1; p.dead = false; } return r; }; }
      const st = tp.state(); if (st.finished) return { done: true };
      const all = [...(st.rats ?? [])];
      for (const k of ['bossX']) if (st[k] != null) all.push(st[k]);
      for (const k of ['mech', 'eater', 'tug']) if (st[k]) all.push(st[k].x);
      if (st.wrecker) all.push(Math.round(st.wrecker.ball.x) - 14); // the Wrecker is hit at its ball, from the left (not hiding behind the crane)
      if (st.chase === 'run' && st.haul != null) all.push(st.haul); // the exhibit haulers
      // only what's on screen: a rat stuck off the edge mustn't hold the raccoon back
      const vw = window.__TP_GAME.scale.width;
      const targets = all.filter((x) => x > st.camX - 4 && x < st.camX + vw + 4);
      return { x: st.x, targets, frozen: st.frozen, lock: st.lock, hp: p?.hp ?? 5, chase: st.chase === 'run' };
    });
    if (s?.done) break;
    if (opts.until && (await page.evaluate(opts.until))) break;
    if (!s || s.frozen) { await setDir(null); await r.frames(5); continue; }
    // the exhibit haulers run for their truck: boost after them
    if (s.chase !== boosting) { boosting = s.chase; if (boosting) await page.keyboard.down('Shift'); else await page.keyboard.up('Shift'); }
    const near = s.targets.length ? s.targets.reduce((a, b) => (Math.abs(b - s.x) < Math.abs(a - s.x) ? b : a)) : null;
    const d = near == null ? 999 : near - s.x;
    // sloppy: now and then the raccoon hesitates next to an enemy and takes the hit (never below 2 hearts)
    if (opts.sloppy && !s.chase && hes <= 0 && near != null && Math.abs(d) < 40 && s.hp > 2 && Math.random() < opts.sloppy) hes = 40 + Math.floor(Math.random() * 30);
    if (hes > 0) { hes -= 5; await setDir(null); await r.frames(4); continue; }
    if (near != null && Math.abs(d) < (opts.reach ?? 30)) {
      await setDir(d > 0 ? 'd' : 'a'); await r.frames(1); await setDir(null);
      await page.keyboard.down('e'); await r.frames(2); await page.keyboard.up('e');
      if (Math.random() < 0.1) { await page.keyboard.down('Space'); await r.frames(2); await page.keyboard.up('Space'); }
    } else if (near != null && (s.lock || Math.abs(d) < 180)) { // in an arena: go after whatever's on screen
      await setDir(d > 0 ? 'd' : 'a');
      if (Math.random() < 0.05) { await page.keyboard.down('q'); await r.frames(2); await page.keyboard.up('q'); }
    } else {
      await setDir(opts.right === false ? null : 'd');
      if (Math.random() < 0.03) { await page.keyboard.down('Space'); await r.frames(2); await page.keyboard.up('Space'); }
    }
    await r.frames(4);
  }
  await setDir(null);
  await page.keyboard.up('Shift');
}
