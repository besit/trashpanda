// Takes for the videos' opening skims (1.0, Ivan: "make sure there is always some action in the centre of the
// screen"). The mission's takes keep the camera where the game puts it, so the fights often happen at an edge of the
// locked arena. These are short extra takes with the fight in the middle:
//   rats  the first arena: the raccoon starts in the middle of the screen, more rats come in from both sides, and it
//         fights them there (swinging, hopping over one now and then, getting clipped once in a while)
//   mech  the Highway Mech a little right of centre, the raccoon a little left: it stomps, the dust runs along the
//         street, the raccoon jumps it (a few tries, each its own shot: the edit takes the best)
//   node tools/promo/skim.mjs hw|bwl         (PROMO_BASE: a build served by vite preview, see the README)
// -> promo/raw/skim_<shoot>/ with marks, for tools/promo/cut.mjs
import { Rec, save, SURVIVE } from './rec.mjs';
import { CFG, brawl, skipTo, rideTo, release, isActive, actionReady } from './missions.mjs';

const W = 384;

/** from the mission's last waypoint into its marker, through the briefing (skipped: it isn't filmed) */
async function enter(r, o) {
  const s = o.wander.filter(Array.isArray).pop();
  await r.continueFrom(save({ completedMissions: o.done, player: { scene: 'explore', district: o.district, x: s[0], y: s[1] } }));
  await r.sec(4.5);
  await rideTo(r, o.marker, { tol: 6 }); await release(r); await r.sec(0.3);
  await r.press('e');
  await r.until(isActive, 'Cutscene');
  for (let i = 0; i < 60 && !(await r.js(actionReady)); i++) { await r.press('Escape', 0.4); }
  await r.until(actionReady, null, 150);
  await r.js(SURVIVE);
}

/** a fight held in the middle of the locked arena: swing at whatever comes within reach, go after a rat close to the
 *  middle, otherwise drift back to the middle; hop and dash now and then; once in a while ride on past a rat and get
 *  clipped (never below 2 hearts) */
async function centerBrawl(r, secs, sloppy = 0.04) {
  const page = r.page;
  let held = null, hes = 0;
  const setDir = async (k) => { if (held === k) return; if (held) await page.keyboard.up(held); held = k; if (k) await page.keyboard.down(k); };
  const tap = async (k, n = 2) => { await page.keyboard.down(k); await r.frames(n); await page.keyboard.up(k); };
  for (let t = 0; t < secs * 60; t += 5) {
    const s = await page.evaluate(() => { const st = window.__TP.state(); return { x: st.x, rats: st.rats ?? [], camX: st.camX, hp: st.hp, frozen: st.frozen }; });
    if (s.frozen) { await setDir(null); await r.frames(5); continue; }
    const C = s.camX + 192;
    const near = s.rats.length ? s.rats.reduce((a, b) => (Math.abs(b - s.x) < Math.abs(a - s.x) ? b : a)) : null;
    const d = near == null ? 999 : near - s.x;
    if (hes <= 0 && near != null && Math.abs(d) < 40 && s.hp > 2 && Math.random() < sloppy) hes = 30;
    if (hes > 0) { hes -= 5; await setDir(d > 0 ? 'd' : 'a'); await r.frames(4); continue; }
    if (near != null && Math.abs(d) < 28) {
      await setDir(d > 0 ? 'd' : 'a'); await r.frames(1); await setDir(null);
      await tap('e');
      if (Math.random() < 0.08) await tap('Space', 10); // a hop over it
    } else if (near != null && Math.abs(near - C) < 80) {
      await setDir(d > 0 ? 'd' : 'a');
      if (Math.abs(d) < 60 && Math.random() < 0.06) await tap('q');
    } else {
      await setDir(Math.abs(C - s.x) > 10 ? (C > s.x ? 'd' : 'a') : null);
    }
    await r.frames(4);
  }
  await setDir(null);
}

/** the first arena, from the middle: more rats from both sides (and the arena waits for them all) */
async function ratsTake(r, extra, secs = 9) {
  await brawl(r, 30, { until: () => !!window.__TP.state().lock });
  await r.js((extra) => {
    const s = window.__TP_GAME.scene.getScene('Action'), p = window.__TP.player, L = s.cameras.main.scrollX;
    p.body.reset(L + 192, s.groundY - 10); p.hp = p.maxHp;
    s.lock.total += extra.length;
    s.spawnRats(extra, L);
  }, extra);
  await r.sec(0.6);
  r.start('rats');
  await centerBrawl(r, secs);
  r.stop();
}

/** the Highway Mech, staged a little right of centre with the raccoon a little left: stomp, dust, jump. `tries` shots */
async function mechTake(r, o, tries = 5) {
  await skipTo(r, o.bossAt);
  await brawl(r, 20, { until: () => !!window.__TP.mech() });
  await r.sec(7); // FINAL BOSS!, the controls hint
  for (let i = 0; i < tries; i++) {
    await r.js(() => {
      const tp = window.__TP, m = tp.mech(), L = m.bounds.left, gy = tp.gy(), p = tp.player;
      m.waves.forEach((w) => w.destroy()); m.waves = []; m.cars.forEach((c) => c.destroy()); m.cars = []; m.clearWarn();
      m.hp = 14; m.img.setFrame('highwaymech_0').setPosition(L + 262, gy + 2); m.state = 'walk'; m.t = 0.05;
      p.body.reset(L + 140, gy - 10); p.hp = p.maxHp;
    });
    await r.page.keyboard.down('d'); await r.frames(2); await r.page.keyboard.up('d'); // face it
    r.start(`mech${i}`);
    let jumped = false;
    for (let t = 0; t < 2.6 * 60; t += 2) {
      const s = await r.js(() => { const tp = window.__TP, m = tp.mech(); return { px: tp.player.sprite.x, waves: m.waves.map((w) => [w.x, w.dir]), st: m.phase }; });
      const w = s.waves.find(([x, dir]) => dir < 0 && x > s.px);
      if (!jumped && w && w[0] - s.px < 30 + i * 4) { jumped = true; r.mark('>> jump'); await r.page.keyboard.down('Space'); await r.frames(14); await r.page.keyboard.up('Space'); }
      if (s.st === 'stomp' && !(r.shot.marks.some((k) => k.s === '>> stomp'))) r.mark('>> stomp');
      await r.frames(2);
    }
    r.stop();
  }
}

const SKIMS = {
  async hw() {
    const r = await Rec.launch('skim_hw');
    r.watch = true;
    await enter(r, CFG.hw);
    await ratsTake(r, ['basic', 'construction', 'basic', 'traffic', 'basic', 'barrier', 'basic', 'construction']);
    await mechTake(r, CFG.hw);
    await r.finish();
  },
  async bwl() {
    const r = await Rec.launch('skim_bwl');
    r.watch = true;
    await enter(r, CFG.bwl);
    await ratsTake(r, ['basic', 'construction', 'basic', 'basic', 'traffic', 'basic']);
    await r.finish();
  },
};

const which = process.argv[2];
if (!SKIMS[which]) { console.log('which?', Object.keys(SKIMS).join(' ')); process.exit(1); }
try { await SKIMS[which](); } catch (e) { console.log(e); Rec.current?.writeMarks(); process.exit(1); }
