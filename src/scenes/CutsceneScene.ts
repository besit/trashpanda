// Interprets cutscene timelines: captions, villain portraits, dialogue, title cards, wipes.
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { InputManager } from '../input/InputManager';
import { CUTSCENES, type Step } from '../data/cutscenes';
import { text, iris, shake, blinds } from '../ui/fx';
import { music } from '../audio/Sequencer';
import { SONG_MAIN, SONG_DOGFRAUD, SONG_ACTION } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { synth } from '../audio/Synth';
import { ctx } from '../core/ctx';

export class CutsceneScene extends Phaser.Scene {
  private input2!: InputManager;
  private portrait?: Phaser.GameObjects.Image;
  private dark!: Phaser.GameObjects.Rectangle;
  private captions: Phaser.GameObjects.GameObject[] = [];
  private skyline!: Phaser.GameObjects.TileSprite;
  private next = 'Explore';
  private skipping = false;
  private advance: (() => void) | null = null;

  constructor() { super('Cutscene'); }

  create(data: { id?: string; next?: string }) {
    this.input2 = new InputManager(this);
    this.next = data?.next ?? 'Explore';
    this.skipping = false;
    this.captions = [];
    this.portrait = undefined;
    synth.unlock();
    void this.run(CUTSCENES[data?.id ?? 'intro']);
    text(this, GAME_W - 4, GAME_H - 4, 'ESC: SKIP', 'font', 1).setTint(0x69657a).setDepth(50);
    this.input.on('pointerdown', () => this.advance?.());
  }

  private wait(ms: number) {
    return new Promise<void>((r) => {
      const ev = this.time.delayedCall(ms, () => { this.advance = null; r(); });
      this.advance = () => { ev.remove(); this.advance = null; r(); };
    });
  }

  private async run(steps: Step[]) {
    for (const s of steps) {
      if (this.skipping) break;
      await this.step(s);
    }
    await this.finish();
  }

  private async finish() {
    if (!this.scene.isActive()) return;
    this.skipping = true;
    ctx.state.flags.sawIntro = true;
    await iris(this, 'close');
    this.scene.start(this.next);
  }

  private async step(s: Step) {
    switch (s.t) {
      case 'bg': {
        this.add.image(0, 0, `sky_${s.sky}`).setOrigin(0);
        this.skyline = this.add.tileSprite(0, 46, GAME_W, 170, `skyline_${s.sky}`).setOrigin(0).setTilePosition(-40, 0);
        this.add.tileSprite(0, 136, GAME_W, 80, `backrow_${s.sky}`).setOrigin(0);
        this.dark = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x16121f, 0).setOrigin(0).setDepth(5);
        this.tweens.add({ targets: this.skyline, tilePositionX: 40, duration: 14000 });
        await iris(this, 'open', GAME_W / 2, GAME_H / 2, 700);
        break;
      }
      case 'caption': {
        const font = s.font ?? 'font_outline';
        const t = text(this, GAME_W / 2, s.y ?? 70 + this.captions.length * 16, '', font).setDepth(20);
        this.captions.push(t);
        await this.typewrite(t, s.text);
        await this.wait(s.hold ?? 1200);
        break;
      }
      case 'clear':
        this.captions.forEach((c) => c.destroy()); this.captions = [];
        break;
      case 'darken':
        this.tweens.add({ targets: this.dark, fillAlpha: s.to, duration: s.ms ?? 800 });
        await this.wait(s.ms ?? 800);
        break;
      case 'music':
        if (s.song === 'none') music.stop(); else music.play({ main: SONG_MAIN, dogfraud: SONG_DOGFRAUD, action: SONG_ACTION }[s.song]);
        break;
      case 'sfx':
        sfx[s.name]();
        break;
      case 'shake':
        shake(this, s.ms ?? 300, 0.012);
        break;
      case 'wait':
        await this.wait(s.ms);
        break;
      case 'portrait': {
        if (s.action === 'rise') {
          // giant villain close-up rising from the bottom of the frame
          this.portrait = this.add.image(GAME_W / 2, GAME_H + 220, 'chars', `df_${s.expr}`).setOrigin(0.5, 1).setScale(2).setDepth(10);
          this.tweens.add({ targets: this.portrait, y: GAME_H + 4, duration: 1100, ease: 'Cubic.easeOut' });
          await this.wait(1100);
        } else if (s.action === 'set') {
          this.portrait?.setFrame(`df_${s.expr}`);
        } else if (this.portrait) {
          this.tweens.add({ targets: this.portrait, y: GAME_H + 240, duration: 500, ease: 'Cubic.easeIn' });
          await this.wait(500);
        }
        break;
      }
      case 'say': {
        if (s.expr) this.portrait?.setFrame(`df_${s.expr}`);
        const box = this.add.graphics().setDepth(30);
        box.fillStyle(0x16121f, 0.92).fillRect(8, GAME_H - 52, GAME_W - 16, 44).lineStyle(1, 0xd9646f).strokeRect(8, GAME_H - 52, GAME_W - 16, 44);
        const name = text(this, 16, GAME_H - 48, s.who, 'font', 0).setDepth(31).setTint(0xff6347);
        const t = text(this, 16, GAME_H - 36, '', 'font_outline', 0).setDepth(31).setMaxWidth(GAME_W - 34);
        // the portrait "talks" by bouncing
        const bob = this.portrait ? this.tweens.add({ targets: this.portrait, scaleY: 2.04, duration: 90, yoyo: true, repeat: -1 }) : null;
        await this.typewrite(t, s.text, true);
        bob?.stop(); this.portrait?.setScale(2);
        const arrow = text(this, GAME_W - 18, GAME_H - 16, '>', 'font_outline').setDepth(31);
        this.tweens.add({ targets: arrow, x: GAME_W - 15, duration: 300, yoyo: true, repeat: -1 });
        await this.waitForConfirm(4500);
        box.destroy(); name.destroy(); t.destroy(); arrow.destroy();
        break;
      }
      case 'lanes': {
        // ROAD ROAD ROAD... the recurring joke, as a quick graphic
        const g = this.add.graphics().setDepth(40);
        g.fillStyle(0x363644).fillRect(0, 0, GAME_W, GAME_H);
        for (let i = 0; i < 8; i++) { g.fillStyle(0xf6f2e9).fillRect(0, 26 * i + 12, GAME_W, 1); }
        const labels = Array.from({ length: 8 }, (_, i) => text(this, GAME_W / 2, 26 * i + 6, 'ROAD', 'font_outline').setDepth(41).setAlpha(0));
        for (const l of labels) { this.tweens.add({ targets: l, alpha: 1, duration: 120 }); sfx.construction(); await this.wait(140); }
        await this.wait(500);
        g.destroy(); labels.forEach((l) => l.destroy());
        ctx.state.lanesAddedByDogFraud += s.count;
        break;
      }
      case 'title': {
        await blinds(this, 300);
        const t = text(this, GAME_W / 2, GAME_H / 2 - 10, s.text, 'font_big').setDepth(100001).setScale(2);
        const sub = s.sub ? text(this, GAME_W / 2, GAME_H / 2 + 20, s.sub, 'font_outline').setDepth(100001) : null;
        shake(this, 200, 0.01);
        sfx.ding();
        await this.wait(2200);
        t.destroy(); sub?.destroy();
        break;
      }
    }
  }

  private typewrite(t: Phaser.GameObjects.BitmapText, full: string, talk = false): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      const ev = this.time.addEvent({ delay: 32, loop: true, callback: () => {
        i++; t.setText(full.slice(0, i));
        if (full[i - 1] !== ' ' && i % 2 === 0) (talk ? sfx.blip : sfx.blip)();
        if (i >= full.length) { ev.remove(); this.advance = null; resolve(); }
      } });
      this.advance = () => { ev.remove(); t.setText(full); this.advance = null; resolve(); };
    });
  }

  private waitForConfirm(timeout: number) {
    return new Promise<void>((resolve) => {
      const ev = this.time.delayedCall(timeout, () => { this.advance = null; resolve(); });
      this.advance = () => { ev.remove(); this.advance = null; resolve(); };
    });
  }

  update() {
    this.input2.update();
    if (this.input2.justPressed('back') || this.input2.justPressed('pause')) { this.skipping = true; this.advance?.(); this.time.removeAllEvents(); void this.finish(); return; }
    if (this.input2.justPressed('confirm')) this.advance?.();
  }
}
