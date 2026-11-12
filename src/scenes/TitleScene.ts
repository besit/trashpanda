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
    text(this, GAME_W - 4, GAME_H - 4, 'M3 PREVIEW', 'font', 1).setTint(0x9793a6);

    // menu (shown after first input)
    this.menu = this.add.container(GAME_W / 2, 118).setVisible(false);
    const hasSave = SaveSystem.hasSave();
    this.mainItems = [
      ...(hasSave ? [{ label: 'CONTINUE', action: () => this.go(true) }] : []),
      { label: 'NEW GAME', action: () => this.go(false) },
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

  private refresh() {
    const win = 8, start = Math.max(0, Math.min(this.sel - 3, this.items.length - win));
    this.items.forEach((it, i) => {
      const vis = this.items.length <= win || (i >= start && i < start + win);
      it.t!.setVisible(vis).setY((i - (this.items.length <= win ? 0 : start)) * 11);
      it.t!.setText(i === this.sel ? `> ${it.label} <` : it.label).setTint(i === this.sel ? 0xfff08a : 0xffffff);
    });
  }

  private async go(cont: boolean) {
    if (this.leaving) return;
    this.leaving = true;
    if (cont && ctx.continue()) {
      await iris(this, 'close');
      this.scene.start('Explore');
    } else {
      ctx.newGame();
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
    if (ny !== 0 && this.lastNY === 0) { this.sel = (this.sel + ny + this.items.length) % this.items.length; sfx.move(); this.refresh(); }
    this.lastNY = ny;
    if (this.input2.justPressed('confirm')) { sfx.select(); this.items[this.sel].action(); }
  }
}
