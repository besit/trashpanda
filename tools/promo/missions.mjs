// The promo shoots (1.0, second cut). Each one: the raccoon wanders a neighbourhood (a landmark's plaque, a hidden
// heart, an easter egg), rides into a mission, fights rats (and takes hits), finishes the boss in one continuous
// take, then the debrief, one Dog Fjord moment and the map changing. The Bike Bus video is the on-map mission.
//   node tools/promo/missions.mjs bwl|bus|sci|hw|title     (the dev server must be running: npx vite --port 5180)
// Every change on screen is noted in promo/raw/<shoot>/marks.txt, with its time in the shot, for the edit.
import { Rec, save, brawl, SURVIVE, BASE } from './rec.mjs';

const ALL = ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'lane_eater', 'great_parking_lot', 'waterfront_heist', 'island_airport', 'save_the_science', 'finish_the_line', 'bike_bus', 'dock_drop'];

const pos = (r) => r.js(() => window.__TP.player());
const isActive = (k) => window.__TP_GAME?.scene.isActive(k);
const actionReady = () => typeof window.__TP?.state === 'function' && window.__TP_GAME.scene.isActive('Action') && !window.__TP.state().frozen;
const exploreFree = () => window.__TP?.scene === 'Explore' && window.__TP_GAME.scene.isActive('Explore') && !window.__TP_GAME.scene.isActive('Cutscene') && !window.__TP.busy();
const MOVE = ['a', 'd', 'w', 's', 'Shift'];
const release = async (r) => { for (const k of MOVE) await r.page.keyboard.up(k); };

/** ride toward one point (map px), keys held toward it; boost only when asked and still far */
async function rideTo(r, [tx, ty], o = {}) {
  const tol = o.tol ?? 8;
  let last = null, still = 0, side = 0;
  for (let i = 0; i < 60 * (o.maxS ?? 30); i += 2) {
    const p = typeof tx === 'function' ? null : await pos(r);
    const t = p ? [tx, ty] : await r.js(tx);
    const q = p ?? await pos(r);
    const dx = t[0] - q.x, dy = t[1] - q.y;
    if (Math.abs(dx) < tol && Math.abs(dy) < tol) return true;
    if (o.until && (await r.js(o.until, o.untilArg))) return true;
    // stuck on a pole or a tree: step aside for a moment
    still = last && Math.hypot(q.x - last.x, q.y - last.y) < 0.5 ? still + 1 : 0; last = q;
    if (still > 10) {
      side = side > 0 ? -1 : 1; still = 0;
      const k = Math.abs(dx) > Math.abs(dy) ? (side > 0 ? 's' : 'w') : (side > 0 ? 'd' : 'a');
      await release(r); await r.hold([k], 0.25); continue;
    }
    const keys = [];
    if (Math.abs(dx) >= 5) keys.push(dx > 0 ? 'd' : 'a');
    if (Math.abs(dy) >= 5) keys.push(dy > 0 ? 's' : 'w');
    for (const k of ['a', 'd', 'w', 's']) if (!keys.includes(k)) await r.page.keyboard.up(k);
    for (const k of keys) await r.page.keyboard.down(k);
    if (o.boost && Math.hypot(dx, dy) > 70) await r.page.keyboard.down('Shift'); else await r.page.keyboard.up('Shift');
    await r.frames(2);
  }
  console.log('    (gave up on a point)', tx, ty);
  return false;
}

/**
 * A wander: a list of steps.
 *   [x, y]                 ride there (keys held on to the next step: the raccoon curves through them)
 *   { boost: [[x,y],..] }  ride these with the boost
 *   { plaque: [x, y] }     stop there and read the landmark's plaque (E), then wait for it to fade
 *   { heart: [x, y] }      ride over a hidden heart
 *   { egg: [x, y] }        ride into an easter egg's spot (its toast stays a few seconds: wait it out)
 *   { squirrel: 1 }        ride after Trinity Bellwoods' white squirrel until it's spotted
 *   { exit: [x, y], to }   ride off the map's edge there, into the district `to`
 *   { bell: 1 }            ring the bell
 *   { wait: s }            stand still
 */
async function wander(r, steps) {
  for (const s of steps) {
    if (Array.isArray(s)) { await rideTo(r, s); continue; }
    if (s.boost) { for (const p of s.boost) await rideTo(r, p, { boost: true }); continue; }
    if (s.plaque) {
      await rideTo(r, s.plaque, { tol: 5 }); await release(r); await r.sec(0.5);
      r.mark('>> plaque'); await r.press('e'); await r.sec(s.hold ?? 5.2); continue;
    }
    if (s.heart) { await rideTo(r, s.heart, { tol: 5 }); r.mark('>> heart'); continue; }
    if (s.egg) { await rideTo(r, s.egg, { tol: 6 }); r.mark('>> egg'); continue; }
    if (s.squirrel) {
      await rideTo(r, [() => { const q = window.__TP_GAME.scene.getScene('Explore').crowd.squirrelPos; return [q.x, q.y]; }], { tol: 20, until: () => !!window.__TP.state.flags.whiteSquirrel });
      r.mark('>> squirrel'); continue;
    }
    if (s.exit) { // ride off the map's edge into the next district
      await rideTo(r, s.exit, { boost: true, until: (d) => window.__TP.district === d, untilArg: s.to, maxS: 20 });
      await r.until(() => window.__TP?.scene === 'Explore' && window.__TP.district && !window.__TP.busy(), null, 20);
      r.mark(`>> arrived ${s.to}`); continue;
    }
    if (s.bell) { await release(r); await r.press('e', 0.4); continue; }
    if (s.wait) { await release(r); await r.sec(s.wait); continue; }
  }
  await release(r);
}

/** jump ahead on the street (not filmed): clear the rats and any arena lock first */
async function skipTo(r, x) {
  await r.js((x) => {
    const tp = window.__TP, s = window.__TP_GAME.scene.getScene('Action'), a = s.mission.action;
    tp.killAll(); s.patrols?.forEach((pt) => pt.rat.alive && pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 4242 }, 0));
    if (s.lock) s.endArena(''); s.lock = null;
    if (a.depave && x > a.depave.at) s.depaveDone = true;
    tp.player.hp = tp.player.maxHp;
    tp.skipTo(x);
  }, x);
  await r.sec(1.6);
}

/** after the win: the debrief, Dog Fjord's reaction, the map payoff (the street changing) */
async function payoff(r, secs = 14) {
  await r.until(isActive, 'Cutscene', 40);
  await r.until(() => window.__TP_GAME.scene.isActive('Explore') && !window.__TP_GAME.scene.isActive('Cutscene'), null, 120);
  await r.sec(secs); // the camera sweeps along the changed street; the upgrade card waits for E
}

/**
 * The boss, in one take: a few seconds of the real fight, then (marked 'END STARTS') the boss is set to a few hits
 * from the end and the fight goes on for real until it falls. The edit uses the take from that mark on.
 */
async function bossFight(r, b) {
  await brawl(r, 20, { until: b.here }); // ride on until it shows up
  await (b.play ?? brawl)(r, b.warmS ?? 5, { until: b.dead });
  await r.js(b.weaken);
  if (b.heal !== false) await r.js(() => { const p = window.__TP.player; p.hp = p.maxHp; });
  r.mark('>> END STARTS');
  await (b.play ?? brawl)(r, b.maxS ?? 60, { until: b.dead });
  if (!(await r.js(b.dead))) { r.mark('>> FORCED'); console.log('    (boss forced)'); await r.js(b.force); }
  r.mark('>> boss down');
}

/** the Highway Mech is only hurt by a stomp on its deck (from a fallen slab) or a hit on its vent while it vents:
 *  get up on the slab, and jump onto the deck whenever it's over us, steering to stay on it; swing in the air */
async function playMech(r, maxS, opts = {}) {
  const page = r.page;
  let held = null;
  const setDir = async (k) => { if (held === k) return; if (held) await page.keyboard.up(held); held = k; if (k) await page.keyboard.down(k); };
  for (let t = 0; t < maxS * 60; t += 4) {
    if (opts.until && (await page.evaluate(opts.until))) break;
    const s = await page.evaluate(() => {
      const tp = window.__TP, sc = window.__TP_GAME.scene.getScene('Action'), m = tp.mech(), p = tp.player;
      if (!m || !m.alive) return null;
      const slabs = (sc.plats ?? sc.oneWays ?? []).map?.((o) => o) ?? [];
      const b = p.sprite.body;
      return { px: p.sprite.x, bottom: b.bottom, ground: p.onGround, gy: tp.gy(), mx: m.img.x, phase: m.phase, left: m.bounds.left, frozen: tp.state().frozen, n: slabs.length };
    });
    if (!s) break;
    if (s.frozen) { await setDir(null); await r.frames(4); continue; }
    const slabX = s.left + 60, onSlab = s.ground && Math.abs(s.bottom - (s.gy - 52)) < 6, onDeck = s.bottom < s.gy - 95;
    if (onDeck) { // ride the deck: keep over the middle, swing
      await setDir(s.mx > s.px + 6 ? 'd' : s.mx < s.px - 6 ? 'a' : null);
      await page.keyboard.down('e'); await r.frames(2); await page.keyboard.up('e');
    } else if (!onSlab) { // get to the slab and hop up (full jump)
      const dx = slabX - s.px;
      await setDir(Math.abs(dx) > 4 ? (dx > 0 ? 'd' : 'a') : null);
      if (s.ground && Math.abs(dx) < 34 && s.bottom > s.gy - 10) { await page.keyboard.down('Space'); await r.frames(20); await page.keyboard.up('Space'); }
    } else if (Math.abs(s.mx - s.px) < 60 || s.phase === 'vent') { // the deck is over us (or the vent is open): jump, swing on the way
      await setDir(s.mx > s.px + 8 ? 'd' : s.mx < s.px - 8 ? 'a' : null);
      await page.keyboard.down('Space'); await r.frames(10);
      await page.keyboard.down('e'); await r.frames(2); await page.keyboard.up('e');
      await r.frames(10); await page.keyboard.up('Space');
    } else { await setDir(Math.abs(slabX - s.px) > 10 ? (slabX > s.px ? 'd' : 'a') : null); }
    await r.frames(4);
  }
  await setDir(null);
}

/** the Wrecker only takes hits on its engine while the ball is stuck in the street. It parks with the boom over you
 *  and drops the ball where you stand: step out of the shadow, jump the drop's shockwave, pump the engine while it's
 *  stuck, and keep clear while it swings */
async function playWrecker(r, maxS, opts = {}) {
  const page = r.page;
  let held = null, last = '';
  const setDir = async (k) => { if (held === k) return; if (held) await page.keyboard.up(held); held = k; if (k) await page.keyboard.down(k); };
  const tap = async (k) => { await page.keyboard.down(k); await r.frames(2); await page.keyboard.up(k); };
  for (let t = 0; t < maxS * 60; t += 4) {
    if (opts.until && (await page.evaluate(opts.until))) break;
    const s = await page.evaluate(() => {
      const tp = window.__TP, w = tp.wrecker(), p = tp.player;
      if (!w || !w.alive) return null;
      const b = w.ballPos();
      return { px: p.sprite.x, wx: w.img.x, st: w.state, bx: b.x, left: w.bounds.left, frozen: tp.state().frozen, rats: tp.state().rats ?? [] };
    });
    if (!s) break;
    if (s.frozen) { await setDir(null); await r.frames(4); continue; }
    const go = async (x, tol = 5) => setDir(Math.abs(x - s.px) <= tol ? null : x > s.px ? 'd' : 'a');
    const near = s.rats.find((x) => Math.abs(x - s.px) < 26);
    if (s.st === 'hoist' || s.st === 'drop') { // out of the shadow (the ball falls where we were): back off left
      await go(Math.max(s.left + 16, s.bx - 62), 4);
      if (s.st === 'drop' && last !== 'drop') await tap('q');
    } else if (s.st === 'stuck') { // jump the shockwave as it lands, then pump the engine
      if (last === 'drop') { await tap('Space'); await r.frames(14); }
      const ex = s.wx - 24;
      await go(ex, 6);
      if (Math.abs(ex - s.px) <= 10) { await setDir('d'); await r.frames(1); await setDir(null); await tap('e'); }
    } else if (s.st === 'haul' || s.st === 'windup' || s.st === 'swing') { // clear of the swing: well left of it, or
      // when that's the arena's edge (cornered, the ball reaches you), past the cab on the far side of the truck
      await go(s.bx - 120 >= s.left + 30 ? s.bx - 120 : s.wx + 40, 8);
    } else if (near != null) { // a rat in the way: deal with it
      await setDir(near > s.px ? 'd' : 'a'); await r.frames(1); await setDir(null); await tap('e');
    } else { await setDir(null); }
    last = s.st;
    await r.frames(4);
  }
  await setDir(null);
}

/** a whole combat mission */
export const CFG = {};
async function mission(name, o) {
  const r = await Rec.launch(name);
  r.watch = true;
  await r.continueFrom(save({ completedMissions: o.done, player: { scene: 'explore', district: o.district, x: o.start[0], y: o.start[1] } }));
  await r.sec(4.5); // the district banner fades
  r.start('ride');
  await wander(r, o.wander);
  await rideTo(r, o.marker, { tol: 6 }); await release(r); await r.sec(0.3);
  r.mark('>> START MISSION'); await r.press('e');
  await r.until(isActive, 'Cutscene');
  await r.until(actionReady, null, 150);
  r.mark('>> action ready');
  r.stop();
  await r.js(SURVIVE);
  if (o.before) await o.before(r);
  r.start('action');
  if (o.extraRats) { // a busier fight for the video: more rats join the first wave, in on both sides
    await brawl(r, 8, { until: () => !!window.__TP.state().lock, sloppy: o.sloppy ?? 0.08 });
    await r.js((list) => { const s = window.__TP_GAME.scene.getScene('Action'); s.spawnRats(list, s.cameras.main.scrollX); }, o.extraRats);
    r.mark('>> extra rats');
  }
  await brawl(r, o.actionS ?? 14, { sloppy: o.sloppy ?? 0.08 });
  r.stop();
  await skipTo(r, o.bossAt);
  r.start('boss');
  await r.js(SURVIVE);
  await bossFight(r, o.boss);
  await payoff(r, o.payoffS ?? 16);
  r.stop();
  await r.finish();
}

const SHOOTS = {
  // the end card: the title screen, its music, the link
  async title() {
    const r = await Rec.launch('title');
    await r.page.goto(BASE);
    await r.until(() => window.__TP_GAME?.scene.isActive('Title'));
    await r.js(() => { window.__recArm = true; });
    await r.press('Enter', 0.2);
    await r.js(() => {
      const t = window.__TP_GAME.scene.getScene('Title');
      t.menu.setVisible(false); t.prompt.setVisible(false); t.footers.forEach((f) => f.setVisible(false)); t.menuBg?.setVisible(false);
      const W = t.scale.width;
      const add = (y, s, font, tint) => t.add.bitmapText(W / 2, y, font, s).setOrigin(0.5).setTint(tint).setDepth(50);
      t.add.graphics().setDepth(49).fillStyle(0x16121f, 0.85).fillRoundedRect(W / 2 - 180, 100, 360, 62, 5).lineStyle(1, 0x69657a).strokeRoundedRect(W / 2 - 180, 100, 360, 62, 5);
      add(110, 'FREE IN YOUR BROWSER', 'font_outline', 0xffffff);
      add(124, 'PHONE OR COMPUTER. NO ADS.', 'font_outline', 0xffffff);
      add(150, 'BESIT.GITHUB.IO/TRASHPANDA', 'font_big', 0xfff08a);
    });
    await r.sec(0.2);
    r.start('card');
    await r.sec(6);
    await r.finish();
  },
};

// 1. THE BIKE LANE WAR. Trinity Bellwoods: a heart in the grass, the white squirrel, the gates' plaque, Queen St W.
//    It's the second win, so Dog Fjord reacts after the debrief (fjord_1).
CFG.bwl = {
  district: 'queenwest', done: ['streetcar_through'], start: [520, 300], sloppy: 0,
  wander: [{ heart: [397, 312] }, [440, 380], [520, 470], { squirrel: 1 }, [660, 600], [690, 690], [760, 760], [832, 790], { plaque: [832, 836] }, [900, 842]],
  marker: [992, 840],
  actionS: 16, bossAt: 1380,
  boss: {
    here: () => !!window.__TP.boss(),
    heal: false, weaken: () => {}, // the Foreman goes down for real in a few seconds: the whole fight is one take
    dead: () => !window.__TP.boss()?.alive,
    force: () => { const b = window.__TP.boss(); b.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 9, kb: 0, id: 777 }, b.sprite.x - 10); },
  },
};
SHOOTS.bwl = () => mission('bwl', CFG.bwl);

// 3. SAVE THE SCIENCE. Downtown first: Graffiti Alley (the easter egg, and a heart at its end), then down Spadina
//    into the waterfront, the Rogers Centre's plaque, Queens Quay. The sixth win: Dog Fjord's highway (fjord_3).
CFG.sci = {
  district: 'downtown', done: ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'great_parking_lot'], start: [340, 948],
  wander: [[286, 950], [286, 1060], [230, 1088], { egg: [150, 1088] }, { heart: [32, 1092] }, { wait: 0.5 }, [150, 1088], [286, 1088], { boost: [[286, 1400]] },
    { exit: [266, 1700], to: 'waterfront' }, { boost: [[672, 120]] }, [700, 250], [700, 300], [740, 352], { plaque: [816, 356] }, [700, 380], { boost: [[680, 790]] }, [800, 810]],
  marker: [976, 808],
  before: (r) => skipTo(r, 1300), actionS: 14, bossAt: 2470,
  boss: {
    play: playWrecker, warmS: 8, maxS: 45,
    here: () => !!window.__TP.wrecker(),
    weaken: () => { const w = window.__TP.wrecker(); if (w) w.hp = Math.min(w.hp, 2); },
    dead: () => !window.__TP.wrecker()?.alive,
    force: () => { const w = window.__TP.wrecker(); w.state = 'stuck'; w.t = 9; w.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 5, kb: 0, id: 779 }, 'pump'); },
  },
};
SHOOTS.sci = () => mission('sci', CFG.sci);

// 4. DEATH BY HIGHWAY. A heart by the Rogers Centre, the CN Tower's plaque, down to Queens Quay and Sugar Beach (the
//    easter egg), back up to Lake Shore under the Gardiner. Dog Fjord's "...another lane?" is in the briefing.
CFG.hw = {
  district: 'waterfront', done: ALL, start: [690, 60],
  wander: [[705, 100], { heart: [720, 128] }, [700, 160], [700, 340], [880, 340], { plaque: [992, 338] }, { boost: [[1040, 372], [1200, 372], [1376, 380], [1376, 700], [1376, 960]] }, [1500, 985],
    { boost: [[1690, 985]] }, { egg: [1770, 1050] }, { wait: 0.6 }, { boost: [[1700, 990], [1700, 560]] }, [1560, 548]],
  marker: [1472, 550],
  actionS: 14, bossAt: 2050, payoffS: 18, extraRats: ['basic', 'construction', 'traffic', 'basic', 'barrier', 'basic'],
  boss: {
    play: playMech, warmS: 6, maxS: 70,
    // a few stomps from the end; the hit that takes it there drops the second slab, as in the game
    here: () => !!window.__TP.mech(),
    weaken: () => { const m = window.__TP.mech(); if (m && m.hp > 6) { m.hp = 6; m.lastHit = -1; m.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 990001 }, 'stomp'); } },
    dead: () => !window.__TP.mech()?.alive,
    force: () => window.__TP.mech().hit({ x: 0, y: 0, w: 0, h: 0, dmg: 9, kb: 0, id: 780 }, 'stomp'),
  },
};
SHOOTS.hw = () => mission('hw', CFG.hw);

// 2. THE BIKE BUS (the on-map mission). Riverdale Park: the view from the hill (the easter egg), the footbridge's
//    plaque, a heart by the Don Jail, down Broadview; then lead the bike bus to school. The fourth win: fjord_2.
SHOOTS.bus = async () => {
  const r = await Rec.launch('bus');
  r.watch = true;
  await r.continueFrom(save({ completedMissions: ['bike_lane_war', 'king_of_street', 'great_parking_lot'], player: { scene: 'explore', district: 'eastend', x: 520, y: 70 } }));
  await r.sec(4.5);
  r.start('ride');
  await wander(r, [[480, 100], { egg: [440, 130] }, [400, 175], [330, 200], { wait: 1.0 }, { plaque: [236, 216] }, [300, 250], { heart: [328, 288] }, [420, 300], [530, 300], [572, 330], { boost: [[572, 700], [572, 790]] }, [610, 800]]);
  await rideTo(r, [648, 808], { tol: 6 }); await release(r); await r.sec(0.3);
  r.mark('>> START MISSION'); await r.press('e');
  await r.until(() => !!window.__TP.bus?.(), null, 60);
  r.mark('>> bus on');
  // lead the bus: each stop (slow down beside the kids), each SUV (ring the bell), the school
  const legs = [
    { to: [[740, 806], [806, 806]], stop: 1 },
    { to: [[880, 806], [902, 808]], bell: 1 },
    { to: [[1000, 806], [1082, 806], [1084, 700], [1086, 666]], stop: 1 },
    { to: [[1080, 662]], bell: 1 },
    { to: [[1082, 600], [1086, 568], [1200, 568], [1318, 568]], stop: 1 },
    { to: [[1330, 566]], bell: 1 },
    { to: [[1420, 568], [1505, 572], [1505, 640], [1503, 680]], stop: 1 },
    { to: [[1505, 760], [1500, 806], [1410, 808]] },
  ];
  await r.until(() => window.__TP.bus().state === 'ride' && !window.__TP.busy?.(), null, 20).catch(() => {});
  const step = () => r.js(() => window.__TP.bus()?.step ?? -1);
  for (const [i, l] of legs.entries()) {
    for (const p of l.to) await rideTo(r, p, { tol: 6, maxS: 20 });
    await release(r);
    const at = await step();
    if (l.stop) { for (let k = 0; k < 40 && (await step()) === at; k++) await r.frames(6); await r.sec(0.4); r.mark(`>> stop ${i}${(await step()) === at ? ' MISSED' : ''}`); }
    if (l.bell) {
      for (let k = 0; k < 4 && (await step()) === at; k++) await r.press('e', 0.5);
      r.mark(`>> bell ${i}${(await step()) === at ? ' MISSED' : ''}`); await r.sec(0.4);
    }
  }
  await release(r);
  await r.until(() => window.__TP.bus()?.state !== 'ride' || !window.__TP.bus(), null, 15).catch(() => console.log('    (bus still riding)'));
  r.mark('>> bus done');
  await payoff(r, 16);
  r.stop();
  await r.finish();
};

export { SHOOTS, bossFight, playMech, brawl, skipTo, rideTo, release, isActive, actionReady };
if (process.argv[1]?.endsWith('missions.mjs')) {
  const which = process.argv[2];
  if (!SHOOTS[which]) { console.log('which shoot?', Object.keys(SHOOTS).join(' ')); process.exit(1); }
  try { await SHOOTS[which](); } catch (e) { console.log(e); Rec.current?.writeMarks(); process.exit(1); }
}
