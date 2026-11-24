// The promo shoots (1.0). Each one: ride the map past landmarks, start the mission, its briefing, some side-view
// fighting, the boss, the win, the debrief and the map payoff (the street changing).
//   node tools/promo/missions.mjs bwl|lot|sci|hw|title     (the dev server must be running: npx vite --port 5180)
import { Rec, save, brawl, BASE } from './rec.mjs';

const ALL = ['bike_lane_war', 'streetcar_through', 'king_of_street', 'slow_down_dog', 'lane_eater', 'great_parking_lot', 'waterfront_heist', 'island_airport', 'save_the_science', 'finish_the_line', 'bike_bus', 'dock_drop'];

const pos = (r) => r.js(() => window.__TP.player());
const isActive = (k) => window.__TP_GAME?.scene.isActive(k);
const actionReady = () => typeof window.__TP?.state === 'function' && window.__TP_GAME.scene.isActive('Action') && !window.__TP.state().frozen;

/** ride along a route of waypoints (map px), holding the keys toward each; boost on long straights */
async function ride(r, pts, boost = true) {
  for (const [tx, ty] of pts) {
    let last = null, still = 0, side = 0;
    for (let guard = 0; guard < 60 * 30; guard += 2) {
      const p = await pos(r);
      const dx = tx - p.x, dy = ty - p.y;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) break;
      // stuck on a pole or a tree: step aside for a moment
      still = last && Math.hypot(p.x - last.x, p.y - last.y) < 0.5 ? still + 1 : 0; last = p;
      if (still > 10) { side = side > 0 ? -1 : 1; still = 0; console.log('    (stuck, stepping aside)', Math.round(p.x), Math.round(p.y)); const k = Math.abs(dx) > Math.abs(dy) ? (side > 0 ? 's' : 'w') : (side > 0 ? 'd' : 'a'); for (const q of ['a', 'd', 'w', 's']) await r.page.keyboard.up(q); await r.hold([k], 0.25); continue; }
      const keys = [];
      if (Math.abs(dx) >= 6) keys.push(dx > 0 ? 'd' : 'a');
      if (Math.abs(dy) >= 6) keys.push(dy > 0 ? 's' : 'w');
      for (const k of ['a', 'd', 'w', 's']) if (!keys.includes(k)) await r.page.keyboard.up(k);
      for (const k of keys) await r.page.keyboard.down(k);
      if (boost && Math.hypot(dx, dy) > 90) await r.page.keyboard.down('Shift'); else await r.page.keyboard.up('Shift');
      await r.frames(2);
    }
  }
  for (const k of ['a', 'd', 'w', 's', 'Shift']) await r.page.keyboard.up(k);
}

/** jump ahead on the street (not filmed): clear the rats and any arena lock first */
async function skipTo(r, x) {
  await r.js((x) => {
    const tp = window.__TP, s = window.__TP_GAME.scene.getScene('Action'), a = s.mission.action;
    tp.killAll(); s.patrols?.forEach((pt) => pt.rat.alive && pt.rat.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 4242 }, 0));
    if (s.lock) s.endArena(''); s.lock = null;
    if (a.depave && x > a.depave.at) s.depaveDone = true;
    tp.skipTo(x);
  }, x);
  await r.sec(1.6);
}

/** the boss: real fighting for `fightS`, then it's worn down to its last hit and the brawler finishes it */
async function boss(r, fightS, finish) {
  await brawl(r, fightS);
  await r.js(finish.weaken);
  await brawl(r, 8, { until: finish.dead });
  if (!(await r.js(finish.dead))) { console.log('    (boss forced)'); await r.js(finish.force); }
}

/** after the win: the debrief cutscene and the map payoff, until the raccoon can ride again */
async function payoff(r, secs = 14) {
  await r.until(isActive, 'Cutscene', 30);
  await r.until(() => window.__TP_GAME.scene.isActive('Explore') && !window.__TP_GAME.scene.isActive('Cutscene'), null, 90);
  await r.sec(secs); // the camera sweeps along the changed street; the upgrade card waits for E
}

/** a whole mission: the ride, the briefing, some fighting, the boss, the payoff */
async function mission(name, o) {
  const r = await Rec.launch(name);
  await r.continueFrom(save({ completedMissions: o.done, player: { scene: 'explore', district: o.district, x: -1, y: -1 } }));
  await r.js(([x, y]) => window.__TP.teleport(x, y), o.route[0]);
  await r.sec(7);
  r.start('ride');
  await ride(r, o.route.slice(1));
  await r.sec(0.3);
  await r.press('e');
  await r.until(isActive, 'Cutscene');
  await r.until(actionReady, null, 120);
  r.stop();
  if (o.before) await o.before(r);
  r.start('action');
  await brawl(r, o.actionS ?? 10);
  r.stop();
  await skipTo(r, o.bossAt);
  r.start('boss');
  await boss(r, o.fightS ?? 10, o.finish);
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

  // 1. THE BIKE LANE WAR: Queen West, past the Trinity Bellwoods gates; the Foreman; Queen gets protected lanes
  async bwl() {
    const r = await Rec.launch('bwl');
    await r.continueFrom(save());
    await r.js(() => window.__TP.teleport(330, 840));
    await r.sec(7); // the district banner fades
    r.start('ride');
    await ride(r, [[985, 842]]);
    await r.sec(0.3);
    await r.press('e');
    await r.until(isActive, 'Cutscene');
    await r.until(actionReady, null, 90);
    r.stop();
    r.start('action');
    await brawl(r, 22, { until: () => window.__TP.state().wave >= 2 && window.__TP.state().rats.length === 0 });
    r.stop();
    await skipTo(r, 1380);
    r.start('boss');
    await boss(r, 9, {
      weaken: () => { const b = window.__TP.boss(); if (b) b.hp = Math.min(b.hp, 1); },
      dead: () => !window.__TP.boss()?.alive,
      force: () => { const b = window.__TP.boss(); b.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 9, kb: 0, id: 777 }, b.sprite.x - 10); },
    });
    await payoff(r);
    r.stop();
    await r.finish();
  },
};

// 2. THE GREAT PARKING LOT: Queen St E past the Broadview Hotel; the Monster SUV and its rats; the lot becomes a park
SHOOTS.lot = () => mission('lot', {
  district: 'eastend', done: ['bike_lane_war', 'king_of_street'],
  route: [[300, 1262], [1152, 1262], [1152, 1325]],
  actionS: 10, bossAt: 1700, fightS: 11,
  finish: {
    weaken: () => { const m = window.__TP.monster(); if (m) m.hp = Math.min(m.hp, 1); },
    dead: () => !window.__TP.monster()?.alive,
    force: () => window.__TP.monster().hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 778 }, 'stomp'),
  },
});
// 3. SAVE THE SCIENCE: down Spadina past the Rogers Centre, under the Gardiner, along Queens Quay; the chase; the Wrecker
SHOOTS.sci = () => mission('sci', {
  district: 'waterfront', done: ['bike_lane_war', 'king_of_street'],
  route: [[672, 230], [672, 862], [976, 862], [976, 812]],
  before: (r) => skipTo(r, 1300), actionS: 12, bossAt: 2470, fightS: 12,
  finish: {
    weaken: () => { const w = window.__TP.wrecker(); if (w) w.hp = Math.min(w.hp, 1); },
    dead: () => !window.__TP.wrecker()?.alive,
    force: () => { const w = window.__TP.wrecker(); w.state = 'stuck'; w.t = 9; w.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 5, kb: 0, id: 779 }, 'pump'); },
  },
});
// 4. DEATH BY HIGHWAY: past the CN Tower, down to Lake Shore under the Gardiner; the Highway Mech; a park in the sky
SHOOTS.hw = () => mission('hw', {
  district: 'waterfront', done: ALL,
  route: [[740, 240], [1376, 240], [1376, 470], [1472, 470], [1472, 548]],
  actionS: 12, bossAt: 2050, fightS: 14, payoffS: 18,
  finish: {
    weaken: () => { const m = window.__TP.mech(); if (m) m.hp = Math.min(m.hp, 1); },
    dead: () => !window.__TP.mech()?.alive,
    force: () => window.__TP.mech().hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 780 }, 'stomp'),
  },
});

const which = process.argv[2];
if (!SHOOTS[which]) { console.log('which shoot?', Object.keys(SHOOTS).join(' ')); process.exit(1); }
await SHOOTS[which]();
