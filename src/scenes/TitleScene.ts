import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { ScrollLayer, STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { openPause } from './PauseScene';
import { MISSIONS } from '../data/missions';
import { DISTRICTS } from '../data/districts';
import { CUTSCENES } from '../data/cutscenes';
import { InputManager } from '../input/InputManager';
import { text, iris } from '../ui/fx';
import { synth } from '../audio/Synth';
import { music } from '../audio/Sequencer';
import { SONG_MAIN } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { ctx } from '../core/ctx';
import { SaveSystem } from '../core/SaveSystem';
import { wantsTouch } from '../input/TouchControls';
import { DIFFICULTY, HighScores, fmtScore, type Difficulty } from '../core/Score';
import { fetchTop, leaderboardEnabled } from '../core/Leaderboard';

export class TitleScene extends Phaser.Scene {
  private input2!: InputManager;
  private items: { label: string; action: () => void; t?: Phaser.GameObjects.BitmapText }[] = [];
  private sel = 0;
  private started = false;
  private rider!: Phaser.GameObjects.Sprite;
  private layers: ScrollLayer[] = [];
  private scroll = 0;
  private prompt!: Phaser.GameObjects.BitmapText;
  private menu!: Phaser.GameObjects.Container;
  private leaving = false;
  private lastNY = 0;
  private lastNX = 0;

  constructor() { super('Title'); }

  create() {
    this.started = false; this.leaving = false; this.sel = 0;
    this.input2 = new InputManager(this);
    this.scroll = 0;
    this.layers = [
      new ScrollLayer(this, 'sky_dusk', 0, 0),
      new ScrollLayer(this, 'skyline_dusk', SKYLINE_Y + 22, 0.08, 60),
      new ScrollLayer(this, 'backrow_dusk', BACKROW_Y + 8, 0.25),
      new ScrollLayer(this, 'facades_qw', FRONT_Y.queen, 0.6, 0, 0, 0xc8a8d8),
      new ScrollLayer(this, 'street_paint', STREET_Y, 1, 0, 0, 0xd0b8d8),
    ];
    this.rider = this.add.sprite(-40, GROUND_Y + 4, 'chars', 'rs_2').setOrigin(0.5, 42 / 44).play('rs_ride');
    this.tweens.add({ targets: this.rider, x: GAME_W + 60, duration: 7000, repeat: -1, repeatDelay: 1500 });

    // logo
    const logo = this.add.container(GAME_W / 2, 44);
    this.logo = logo;
    const shadow = text(this, 2, 2, 'TRASH PANDA', 'font_big').setTint(0x16121f).setScale(2);
    const main = text(this, 0, 0, 'TRASH PANDA', 'font_big').setScale(2);
    const sub = text(this, 0, 26, 'RIGHT OF WAY', 'font_red').setScale(1);
    logo.add([shadow, main, sub]);
    this.tweens.add({ targets: logo, y: 48, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.prompt = text(this, GAME_W / 2, 128, wantsTouch() ? 'TAP TO START' : 'PRESS ENTER', 'font_outline');
    this.tweens.add({ targets: this.prompt, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    text(this, GAME_W - 4, GAME_H - 4, 'M3.2 PREVIEW', 'font', 1).setTint(0x9793a6);

    // menu (shown after first input)
    this.menu = this.add.container(GAME_W / 2, 118).setVisible(false);
    const hasSave = SaveSystem.hasSave();
    this.mainItems = [
      ...(hasSave ? [{ label: 'CONTINUE', action: () => this.go(true) }] : []),
      { label: 'NEW GAME', action: () => this.setItems(this.difficultyItems()) },
      { label: 'HIGH SCORES', action: () => this.showScores() },
      { label: 'CONTROLS', action: () => { this.leaving = false; openPause(this, 'controls'); } },
      // debug (?debug): pick ANY mission (with its briefing) or watch any vignette on its own (M2.1, Ivan)
      ...(DEBUG ? [
        { label: 'SELECT MISSION', action: () => this.setItems(this.missionItems()) },
        { label: 'WATCH VIGNETTES', action: () => this.setItems(this.vignetteItems()) },
      ] : []),
    ];
    this.setItems(this.mainItems);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.started) { this.begin(); return; }
      if (this.closeScores) { this.closeScores(); return; }
      if (this.naming) return; // the letters + START handle their own taps
      // tap a menu item
      this.items.forEach((it, i) => {
        const b = it.t!.getBounds();
        if (p.x > b.x - 10 && p.x < b.right + 10 && p.y > b.y - 3 && p.y < b.bottom + 3) { this.sel = i; this.refresh(); sfx.select(); it.action(); }
      });
    });
    void iris(this, 'open');
    // re-layout for a new view width (phone rotation, window resize)
    const onResize = () => { if (!this.leaving) this.scene.restart(); };
    this.scale.on('resize', onResize);
    this.events.once('shutdown', () => this.scale.off('resize', onResize));
    this.events.on('resume', () => this.input2.swallow());
    const kb = this.input.keyboard!;
    const menuKey = (d: number) => () => { if (this.started && !this.leaving && !this.naming && !this.closeScores && this.menu.visible) this.moveSel(d); };
    for (const k of ['UP', 'W']) kb.on(`keydown-${k}`, menuKey(-1));
    for (const k of ['DOWN', 'S']) kb.on(`keydown-${k}`, menuKey(1));
  }

  private begin() {
    synth.unlock();
    ctx.applySettings();
    music.play(SONG_MAIN);
    sfx.bell();
    this.started = true;
    this.prompt.setVisible(false);
    this.menu.setVisible(true);
    this.refresh();
  }

  private mainItems: { label: string; action: () => void; t?: Phaser.GameObjects.BitmapText }[] = [];
  private logo?: Phaser.GameObjects.Container;
  /** swap the menu's items (submenus); long lists scroll in a window of 8 */
  private setItems(list: { label: string; action: () => void }[]) {
    this.menu.removeAll(true);
    this.items = list.map((it) => ({ ...it }));
    this.items.forEach((it, i) => { it.t = text(this, 0, i * 11, it.label, 'font_outline'); this.menu.add(it.t); });
    const sub = list !== this.mainItems;
    this.logo?.setVisible(!sub);
    this.menu.setY(sub ? 30 : 118);
    this.sel = 0;
    if (this.started) this.refresh();
  }
  /** M3.1: pick a difficulty for the new run (hits per life + score multiplier), then your initials */
  private difficultyItems() {
    const back = { label: '< BACK', action: () => this.setItems(this.mainItems) };
    const pick = (d: Difficulty) => ({ label: `${DIFFICULTY[d].label}: ${DIFFICULTY[d].hits} HITS A LIFE, SCORE X${DIFFICULTY[d].mult}`, action: () => this.startNaming(d) });
    const list = [pick('easy'), pick('normal'), pick('hard'), back];
    this.time.delayedCall(0, () => { this.sel = 1; this.refresh(); });
    return list;
  }

  // ---- arcade initials: up/down change the letter, left/right move, ENTER moves on / starts ----
  private naming?: { d: Difficulty; letters: string[]; pos: number; objs: Phaser.GameObjects.BitmapText[]; title: Phaser.GameObjects.BitmapText; panel: Phaser.GameObjects.Graphics };
  private startNaming(d: Difficulty) {
    this.menu.setVisible(false);
    const panel = this.add.graphics().fillStyle(0x16121f, 0.7).fillRoundedRect(GAME_W / 2 - 110, 44, 220, 116, 6);
    const title = text(this, GAME_W / 2, 60, 'YOUR INITIALS', 'font_big');
    const letters = ['R', 'A', 'C'];
    const objs = letters.map((l, i) => {
      const t = text(this, GAME_W / 2 - 24 + i * 24, 100, l, 'font_big').setScale(1.5);
      t.setInteractive({ useHandCursor: true }).on('pointerdown', () => { if (!this.naming) return; this.naming.pos = i; this.bumpLetter(1); });
      return t;
    });
    const help = text(this, GAME_W / 2, 132, wantsTouch() ? 'TAP A LETTER TO CHANGE IT' : 'UP/DOWN: LETTER   LEFT/RIGHT: MOVE', 'font');
    const ok = text(this, GAME_W / 2, 150, wantsTouch() ? '> TAP HERE TO START <' : 'ENTER: START', 'font_outline').setTint(0xfff08a);
    ok.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.finishNaming());
    objs.push(help, ok);
    this.naming = { d, letters, pos: 0, objs, title, panel };
    this.drawNaming();
    // keyboard: real keydown events, so a quick tap is never missed between frames
    const kb = this.input.keyboard!;
    const on = (k: string, f: () => void) => kb.on(`keydown-${k}`, () => { if (this.naming) f(); });
    on('UP', () => this.bumpLetter(1)); on('W', () => this.bumpLetter(1));
    on('DOWN', () => this.bumpLetter(-1)); on('S', () => this.bumpLetter(-1));
    on('LEFT', () => this.moveCursor(-1)); on('A', () => this.moveCursor(-1));
    on('RIGHT', () => this.moveCursor(1)); on('D', () => this.moveCursor(1));
  }
  private bumpLetter(dir: number) {
    const n = this.naming!; const A = 'A'.charCodeAt(0);
    n.letters[n.pos] = String.fromCharCode(A + ((n.letters[n.pos].charCodeAt(0) - A + dir + 26) % 26));
    sfx.move(); this.drawNaming();
  }
  private moveCursor(dx: number) { const n = this.naming!; n.pos = (n.pos + dx + 3) % 3; sfx.move(); this.drawNaming(); }
  private drawNaming() {
    const n = this.naming!;
    n.letters.forEach((l, i) => n.objs[i].setText(l).setTint(i === n.pos ? 0xfff08a : 0xffffff));
  }
  private finishNaming() {
    const n = this.naming; if (!n) return;
    sfx.select();
    this.naming = undefined;
    ['UP', 'W', 'DOWN', 'S', 'LEFT', 'A', 'RIGHT', 'D'].forEach((k) => this.input.keyboard?.off(`keydown-${k}`));
    [...n.objs, n.title, n.panel].forEach((o) => o.destroy());
    void this.go(false, n.d, n.letters.join(''));
  }

  /** local top 10 (+ the online top 10 when the leaderboard is configured) */
  private scoreObjs: Phaser.GameObjects.GameObject[] = [];
  private showScores() {
    this.menu.setVisible(false); this.logo?.setVisible(false);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.scoreObjs.push(o); return o; };
    const online = leaderboardEnabled();
    const colX = online ? [GAME_W / 4 + 6, (GAME_W * 3) / 4 - 6] : [GAME_W / 2];
    const table = (x: number, head: string, rows: { name: string; score: number; difficulty: Difficulty }[]) => {
      add(text(this, x, 18, head, 'font_outline').setTint(0xfff08a));
      if (!rows.length) add(text(this, x, 40, 'NO SCORES YET', 'font'));
      rows.slice(0, 10).forEach((e, i) => add(text(this, x, 34 + i * 12, `${String(i + 1).padStart(2, ' ')}. ${e.name.padEnd(3, ' ')} ${fmtScore(e.score)} ${DIFFICULTY[e.difficulty]?.label[0] ?? '?'}`, 'font')));
    };
    table(colX[0], 'HIGH SCORES (THIS DEVICE)', HighScores.load());
    if (online) {
      const wait = add(text(this, colX[1], 40, 'LOADING...', 'font'));
      void fetchTop(10).then((rows) => { if (!this.scoreObjs.length) return; wait.destroy(); table(colX[1], 'WORLD TOP 10', rows); });
    }
    add(text(this, GAME_W / 2, GAME_H - 26, 'E = EASY  N = NORMAL  H = HARD', 'font').setTint(0x9793a6));
    add(text(this, GAME_W / 2, GAME_H - 14, wantsTouch() ? '> TAP TO GO BACK <' : '> ENTER: BACK <', 'font_outline').setTint(0xfff08a));
    this.time.delayedCall(250, () => { this.closeScores = () => { this.scoreObjs.forEach((o) => o.destroy()); this.scoreObjs = []; this.closeScores = undefined; this.menu.setVisible(true); this.logo?.setVisible(true); this.refresh(); }; });
  }
  private closeScores?: () => void;
  /** a movement key is held: keyboard input already went through the keydown handlers */
  private anyKeyDown() { const kb = this.input.keyboard; return !!kb && ['UP', 'DOWN', 'LEFT', 'RIGHT', 'W', 'A', 'S', 'D'].some((k) => kb.addKey(k).isDown); }

  private missionItems() {
    const back = { label: '< BACK', action: () => this.setItems(this.mainItems) };
    return [back, ...Object.values(MISSIONS).map((m) => ({ label: `${m.title} (${DISTRICTS[m.district]?.name ?? m.district})`, action: () => this.playMission(m.id) }))];
  }
  private vignetteItems() {
    const back = { label: '< BACK', action: () => this.setItems(this.mainItems) };
    return [back, ...Object.keys(CUTSCENES).map((id) => ({ label: id.toUpperCase().replace(/_/g, ' '), action: () => this.goScene('Cutscene', { id, next: 'Title' }) }))];
  }
  /** debug: a mission from the start, briefing vignette included, on your save (or a fresh one) */
  private async playMission(id: string) {
    if (this.leaving) return;
    this.leaving = true;
    if (!ctx.continue()) ctx.newGame();
    await iris(this, 'close');
    const m = MISSIONS[id];
    if (m.briefing) this.scene.start('Cutscene', { id: m.briefing, next: 'Action', nextData: { mission: id } });
    else this.scene.start('Action', { mission: id });
  }

  private moveSel(d: number) { this.sel = (this.sel + d + this.items.length) % this.items.length; sfx.move(); this.refresh(); }

  private refresh() {
    const win = 8, start = Math.max(0, Math.min(this.sel - 3, this.items.length - win));
    this.items.forEach((it, i) => {
      const vis = this.items.length <= win || (i >= start && i < start + win);
      it.t!.setVisible(vis).setY((i - (this.items.length <= win ? 0 : start)) * 11);
      it.t!.setText(i === this.sel ? `> ${it.label} <` : it.label).setTint(i === this.sel ? 0xfff08a : 0xffffff);
    });
  }

  private async go(cont: boolean, difficulty: Difficulty = 'normal', name = 'RAC') {
    if (this.leaving) return;
    this.leaving = true;
    if (cont && ctx.continue()) {
      await iris(this, 'close');
      this.scene.start('Explore');
    } else {
      ctx.newGame(difficulty, name);
      ctx.save(); // the run (difficulty, initials) exists from the first second: CONTINUE finds it
      await iris(this, 'close');
      this.scene.start('Cutscene', { id: 'intro', next: 'Explore' });
    }
  }
  private async goScene(key: string, data: object = { id: 'intro', next: 'Title' }) {
    if (this.leaving) return;
    this.leaving = true;
    if (!ctx.sessionStart) ctx.newGame();
    await iris(this, 'close');
    this.scene.start(key, data);
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.scroll += dt * 0.05;
    for (const l of this.layers) l.update(this.scroll);
    if (!this.started) { if (this.input2.justPressed('confirm')) this.begin(); return; }
    if (this.leaving) return;
    const up = this.input2.moveY < -0.5, down = this.input2.moveY > 0.5;
    const ny = up ? -1 : down ? 1 : 0;
    if (this.closeScores) { if (this.input2.justPressed('confirm') || this.input2.justPressed('pause')) { sfx.select(); this.closeScores(); } return; }
    if (this.naming) {
      // the touch stick / gamepad (keys are handled by keydown events in startNaming)
      const nx = this.input2.moveX < -0.5 ? -1 : this.input2.moveX > 0.5 ? 1 : 0;
      if (ny !== 0 && this.lastNY === 0 && !this.anyKeyDown()) this.bumpLetter(-ny);
      if (nx !== 0 && this.lastNX === 0 && !this.anyKeyDown()) this.moveCursor(nx);
      this.lastNY = ny; this.lastNX = nx;
      if (this.input2.justPressed('confirm')) { if (this.naming.pos < 2) { this.naming.pos++; sfx.move(); this.drawNaming(); } else this.finishNaming(); }
      return;
    }
    // the touch stick / gamepad (keyboard arrows go through keydown events: a quick tap is never missed)
    if (ny !== 0 && this.lastNY === 0 && !this.anyKeyDown()) this.moveSel(ny);
    this.lastNY = ny;
    if (this.input2.justPressed('confirm')) { sfx.select(); this.items[this.sel].action(); }
  }
}
