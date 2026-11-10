import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { openPause } from './PauseScene';
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
  private skyline!: Phaser.GameObjects.TileSprite;
  private facades!: Phaser.GameObjects.TileSprite;
  private street!: Phaser.GameObjects.TileSprite;
  private backrow!: Phaser.GameObjects.TileSprite;
  private rider!: Phaser.GameObjects.Sprite;
  private prompt!: Phaser.GameObjects.BitmapText;
  private menu!: Phaser.GameObjects.Container;
  private leaving = false;
  private lastNY = 0;

  constructor() { super('Title'); }

  create() {
    this.started = false; this.leaving = false; this.sel = 0;
    this.input2 = new InputManager(this);
    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'sky_dusk').setOrigin(0);
    this.skyline = this.add.tileSprite(0, 40, GAME_W, 170, 'skyline_dusk').setOrigin(0).setTilePosition(-60, 0);
    this.backrow = this.add.tileSprite(0, 104, GAME_W, 80, 'backrow_dusk').setOrigin(0);
    this.facades = this.add.tileSprite(0, 72, GAME_W, 96, 'facades_qw').setOrigin(0).setTint(0xc8a8d8);
    this.street = this.add.tileSprite(0, 168, GAME_W, 64, 'street_paint').setOrigin(0).setTint(0xd0b8d8);
    this.rider = this.add.sprite(-40, 198, 'chars', 'rs_2').setOrigin(0.5, 42 / 44).play('rs_ride');
    this.tweens.add({ targets: this.rider, x: GAME_W + 60, duration: 7000, repeat: -1, repeatDelay: 1500 });

    // logo
    const logo = this.add.container(GAME_W / 2, 44);
    const shadow = text(this, 2, 2, 'TRASH PANDA', 'font_big').setTint(0x16121f).setScale(2);
    const main = text(this, 0, 0, 'TRASH PANDA', 'font_big').setScale(2);
    const sub = text(this, 0, 26, 'RIGHT OF WAY', 'font_red').setScale(1);
    logo.add([shadow, main, sub]);
    this.tweens.add({ targets: logo, y: 48, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.prompt = text(this, GAME_W / 2, 128, wantsTouch() ? 'TAP TO START' : 'PRESS ENTER', 'font_outline');
    this.tweens.add({ targets: this.prompt, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    text(this, GAME_W - 4, GAME_H - 4, 'M1 PREVIEW', 'font', 1).setTint(0x9793a6);

    // menu (shown after first input)
    this.menu = this.add.container(GAME_W / 2, 118).setVisible(false);
    const hasSave = SaveSystem.hasSave();
    this.items = [
      ...(hasSave ? [{ label: 'CONTINUE', action: () => this.go(true) }] : []),
      { label: 'NEW GAME', action: () => this.go(false) },
      { label: 'CONTROLS', action: () => { this.leaving = false; openPause(this, 'controls'); } },
      ...(DEBUG ? [{ label: 'SIDE-VIEW TEST', action: () => this.goScene('Action') }, { label: 'INTRO CUTSCENE', action: () => this.goScene('Cutscene') }] : []),
    ];
    this.items.forEach((it, i) => { it.t = text(this, 0, i * 11, it.label, 'font_outline'); this.menu.add(it.t); });

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

  private refresh() {
    this.items.forEach((it, i) => { it.t!.setText(i === this.sel ? `> ${it.label} <` : it.label).setTint(i === this.sel ? 0xfff08a : 0xffffff); });
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
  private async goScene(key: string) {
    if (this.leaving) return;
    this.leaving = true;
    if (!ctx.sessionStart) ctx.newGame();
    await iris(this, 'close');
    this.scene.start(key, { id: 'intro', next: 'Title' });
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.skyline.tilePositionX += dt * 0.004;
    this.backrow.tilePositionX += dt * 0.012;
    this.facades.tilePositionX += dt * 0.03;
    this.street.tilePositionX += dt * 0.05;
    if (!this.started) { if (this.input2.justPressed('confirm')) this.begin(); return; }
    if (this.leaving) return;
    const up = this.input2.moveY < -0.5, down = this.input2.moveY > 0.5;
    const ny = up ? -1 : down ? 1 : 0;
    if (ny !== 0 && this.lastNY === 0) { this.sel = (this.sel + ny + this.items.length) % this.items.length; sfx.move(); this.refresh(); }
    this.lastNY = ny;
    if (this.input2.justPressed('confirm')) { sfx.select(); this.items[this.sel].action(); }
  }
}
