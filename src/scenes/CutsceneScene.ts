// Interprets cutscene timelines: captions, villain portraits, dialogue, title cards, wipes,
// the highway ("another car lane") shot, and side-view vignettes with simple actors.
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { InputManager } from '../input/InputManager';
import { CUTSCENES, type Step } from '../data/cutscenes';
import { text, iris, shake, blinds } from '../ui/fx';
import { music } from '../audio/Sequencer';
import { SONG_MAIN, SONG_DOGFRAUD, SONG_ACTION, SONG_IMPROVE } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { synth } from '../audio/Synth';
import { ctx } from '../core/ctx';
import type { Manifest } from './BootScene';

const STAGE_W = 384;
// Highway geometry (matches tools/sprites/dvp.mjs)
const HZ = 92, LEFT_BOTTOM = -170, LANE_BOTTOM = 62;
const CAR_KINDS = ['red', 'blue', 'white', 'yellow', 'teal', 'suv', 'white', 'blue'];

interface DvpCar { s: Phaser.GameObjects.Image; lane: number; d: number; kind: string }

export class CutsceneScene extends Phaser.Scene {
  private input2!: InputManager;
  private portrait?: Phaser.GameObjects.Image;
  private dark!: Phaser.GameObjects.Rectangle;
  private captions: Phaser.GameObjects.GameObject[] = [];
  private layers: { ts: Phaser.GameObjects.TileSprite; f: number }[] = [];
  private bgGroup: Phaser.GameObjects.GameObject[] = [];
  private pan = 0;
  private panX = 0;
  private actors = new Map<string, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>();
  private followers: { g: Phaser.GameObjects.Container; a: Phaser.GameObjects.GameObject & { x: number; y: number; active: boolean } }[] = [];
  private boxTop = false;
  private next = 'Explore';
  private nextData: object | undefined;
  private skipping = false;
  private advance: (() => void) | null = null;
  // highway shot
  private dvp?: { g: Phaser.GameObjects.Graphics; lanes: number; reveal: number; cars: DvpCar[]; flow: number; t: number };

  constructor() { super('Cutscene'); }

  /** x offset that centres the 384-wide stage on wider screens */
  private get ox() { return Math.round((GAME_W - STAGE_W) / 2); }

  create(data: { id?: string; next?: string; nextData?: object }) {
    this.input2 = new InputManager(this);
    this.next = data?.next ?? 'Explore';
    this.nextData = data?.nextData;
    this.skipping = false;
    this.captions = []; this.layers = []; this.bgGroup = []; this.actors.clear(); this.followers = [];
    this.portrait = undefined; this.dvp = undefined; this.pan = 0; this.panX = 0; this.boxTop = false;
    synth.unlock();
    this.dark = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x16121f, 0).setOrigin(0).setDepth(5);
    void this.run(CUTSCENES[data?.id ?? 'intro'] ?? []);
    text(this, GAME_W - 4, GAME_H - 4, 'ESC: SKIP', 'font', 1).setTint(0x69657a).setDepth(100002);
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
    this.scene.start(this.next, this.nextData);
  }

  private clearBg() {
    this.bgGroup.forEach((o) => o.destroy()); this.bgGroup = []; this.layers = [];
    this.dvp?.g.destroy(); this.dvp?.cars.forEach((c) => c.s.destroy()); this.dvp = undefined;
    this.actors.forEach((a) => a.destroy()); this.actors.clear();
  }

  private layer(key: string, y: number, h: number, f: number, depth = 0) {
    const ts = this.add.tileSprite(0, y, GAME_W, h, key).setOrigin(0).setDepth(depth);
    this.layers.push({ ts, f }); this.bgGroup.push(ts);
    return ts;
  }

  private async step(s: Step) {
    const ox = this.ox;
    switch (s.t) {
      case 'bg': {
        this.clearBg();
        this.layer(`sky_${s.sky}`, 0, GAME_H, 0);
        this.layer(`skyline_${s.sky}`, 46, 170, 0.15).setTilePosition(-40, 0);
        this.layer(`backrow_${s.sky}`, 136, 80, 0.5);
        this.pan = 0.012; // slow drift so no layer looks frozen
        await iris(this, 'open', GAME_W / 2, GAME_H / 2, 700);
        break;
      }
      case 'side': {
        // side-view street, the same layers the missions use
        await blinds(this, 250);
        this.clearBg();
        this.layer(`sky_${s.sky}`, 0, GAME_H, 0);
        this.layer(`skyline_${s.sky}`, 30, 170, 0.08);
        this.layer(`backrow_${s.sky}`, 96, 80, 0.3);
        this.layer('facades_qw', 72, 96, 1.0).setTilePosition(300, 0);
        this.layer(`street_${s.street}`, 168, 64, 1.0);
        if (s.street === 'protected') for (let x = 20; x < GAME_W; x += 70) this.bgGroup.push(this.add.image(x, 201, 'world', 'planter').setOrigin(0.5, 1).setDepth(70).setScale(1.5));
        this.boxTop = true;
        // vignettes hold the camera still: actors, parked cars and planters stay planted on the street
        this.pan = s.pan ?? 0;
        this.children.list.filter((o) => o instanceof Phaser.GameObjects.Graphics && (o as Phaser.GameObjects.Graphics).depth === 100000).forEach((o) => o.destroy());
        break;
      }
      case 'caption': {
        const font = s.font ?? 'font_outline';
        const t = text(this, GAME_W / 2, s.y ?? 70 + this.captions.length * 16, '', font).setDepth(200);
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
        if (s.song === 'none') music.stop(); else music.play({ main: SONG_MAIN, dogfraud: SONG_DOGFRAUD, action: SONG_ACTION, improve: SONG_IMPROVE }[s.song]);
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
          this.portrait?.destroy();
          this.portrait = this.add.image(GAME_W / 2, GAME_H + 220, 'chars', `df_${s.expr}`).setOrigin(0.5, 1).setScale(2).setDepth(150);
          this.tweens.add({ targets: this.portrait, y: GAME_H + 4, duration: 1000, ease: 'Cubic.easeOut' });
          await this.wait(1000);
        } else if (s.action === 'set') {
          this.portrait?.setFrame(`df_${s.expr}`);
        } else if (this.portrait) {
          const p = this.portrait;
          this.tweens.add({ targets: p, y: GAME_H + 240, duration: 450, ease: 'Cubic.easeIn', onComplete: () => p.destroy() });
          this.portrait = undefined;
          await this.wait(450);
        }
        break;
      }
      case 'say': {
        if (s.expr) this.portrait?.setFrame(`df_${s.expr}`);
        const villain = s.who === 'DOG FRAUD' || s.who === 'RAT';
        const by = this.boxTop && !this.portrait ? 8 : GAME_H - 52;
        const box = this.add.graphics().setDepth(300);
        box.fillStyle(0x16121f, 0.92).fillRect(8, by, GAME_W - 16, 44).lineStyle(1, villain ? 0xd9646f : 0x9bd35a).strokeRect(8, by, GAME_W - 16, 44);
        const name = text(this, 16, by + 4, s.who, 'font', 0).setDepth(301).setTint(villain ? 0xff6347 : 0x9bd35a);
        const t = text(this, 16, by + 16, '', 'font_outline', 0).setDepth(301).setMaxWidth(GAME_W - 34);
        const bob = this.portrait && s.who === 'DOG FRAUD' ? this.tweens.add({ targets: this.portrait, scaleY: 2.04, duration: 90, yoyo: true, repeat: -1 }) : null;
        await this.typewrite(t, s.text, true);
        bob?.stop(); this.portrait?.setScale(2);
        const arrow = text(this, GAME_W - 18, by + 36, '>', 'font_outline').setDepth(301);
        this.tweens.add({ targets: arrow, x: GAME_W - 15, duration: 300, yoyo: true, repeat: -1 });
        await this.waitForConfirm(5000);
        box.destroy(); name.destroy(); t.destroy(); arrow.destroy();
        break;
      }
      case 'title': {
        await blinds(this, 300);
        const t = text(this, GAME_W / 2, GAME_H / 2 - 10, s.text, 'font_big').setDepth(100001).setScale(GAME_W >= 420 ? 2 : 1.6);
        const sub = s.sub ? text(this, GAME_W / 2, GAME_H / 2 + 20, s.sub, 'font_outline').setDepth(100001) : null;
        shake(this, 200, 0.01);
        sfx.ding();
        await this.wait(2300);
        t.destroy(); sub?.destroy();
        break;
      }
      case 'dvp': {
        this.boxTop = false;
        await blinds(this, 250);
        this.clearBg();
        this.dark.setFillStyle(0x16121f, 0);
        this.bgGroup.push(this.add.image(GAME_W / 2, 0, 'dvp_bg').setOrigin(0.5, 0).setDepth(0));
        this.children.list.filter((o) => o instanceof Phaser.GameObjects.Graphics && (o as Phaser.GameObjects.Graphics).depth === 100000).forEach((o) => o.destroy());
        this.startDvp(s.lanes);
        sfx.carHonk();
        await this.wait(900);
        break;
      }
      case 'dvpAdd': {
        if (!this.dvp) break;
        const d = this.dvp;
        // a new lane is paved in from the horizon down... and fills up instantly
        d.lanes++;
        d.reveal = 0;
        sfx.construction();
        this.tweens.add({ targets: d, reveal: 1, duration: 1200, ease: 'Sine.easeIn', onUpdate: () => { if (Math.random() < 0.08) sfx.construction(); } });
        await this.wait(1300);
        // the new lane fills with the same crawl as the rest: no relief
        for (let dd = 1.05 + Math.random() * 0.2; dd < 15; dd += 0.5 + Math.random() * 0.12) this.addDvpCar(d.lanes - 1, dd);
        sfx.carHonk(); this.time.delayedCall(400, () => sfx.carHonk());
        await this.wait(400);
        break;
      }
      case 'actor': {
        const atlas = s.atlas ?? 'chars';
        const a = s.anim ? this.add.sprite(ox + s.x, s.y, atlas, s.frame).play(s.anim) : this.add.image(ox + s.x, s.y, atlas, s.frame);
        const pv = (this.registry.get('manifest') as Manifest).pivots;
        const pk = s.frame.startsWith('rs_') ? 'rs' : s.frame.startsWith('rat_') ? 'rat' : s.frame;
        const p = pv[pk] ?? { x: 0.5, y: 1 };
        a.setOrigin(p.x, p.y).setDepth(s.depth ?? 60).setFlipX(!!s.flip);
        this.actors.get(s.id)?.destroy();
        this.actors.set(s.id, a);
        if (s.sign) { // a picket sign carried above the actor
          const g = this.add.container(a.x, a.y - 44).setDepth((s.depth ?? 60) + 1);
          const lines = s.sign.split('\n');
          const w = Math.max(...lines.map((l) => l.length)) * 6 + 8, h = lines.length * 9 + 6;
          const board = this.add.graphics();
          board.fillStyle(0x3f2719).fillRect(-1, h / 2, 2, 22);
          board.fillStyle(0x16121f).fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2).fillStyle(0xf6f2e9).fillRect(-w / 2, -h / 2, w, h);
          const tt = text(this, 0, 0, s.sign, 'font').setTint(0x7d47a8).setCenterAlign();
          g.add([board, tt]);
          this.bgGroup.push(g);
          this.followers.push({ g, a });
        }
        break;
      }
      case 'move': {
        const a = this.actors.get(s.id);
        if (!a) break;
        if (s.x !== undefined && a.x !== ox + s.x && a instanceof Phaser.GameObjects.Sprite && a.anims.currentAnim?.key.startsWith('rs_')) a.setFlipX(ox + s.x < a.x);
        const p = new Promise<void>((r) => this.tweens.add({ targets: a, x: ox + s.x, duration: s.ms, ease: s.ease ?? 'Linear', onComplete: () => { if (s.anim && a instanceof Phaser.GameObjects.Sprite) a.play(s.anim); r(); } }));
        if (s.wait) await p;
        break;
      }
      case 'wobble': {
        const a = this.actors.get(s.id);
        if (a) this.tweens.add({ targets: a, angle: { from: -8, to: 8 }, duration: 80, yoyo: true, repeat: 4, onComplete: () => a.setAngle(0) });
        break;
      }
      case 'bang': {
        const a = this.actors.get(s.id);
        if (a) { const t = text(this, a.x, a.y - 52, s.text ?? '!', 'font_big').setDepth(250).setTint(0xff6347); this.tweens.add({ targets: t, y: t.y - 6, alpha: 0, delay: 700, duration: 300, onComplete: () => t.destroy() }); }
        break;
      }
      case 'clearActors':
        this.actors.forEach((a) => a.destroy()); this.actors.clear();
        break;
    }
  }

  // ---------------- highway shot ----------------
  private startDvp(lanes: number) {
    const g = this.add.graphics().setDepth(1);
    this.dvp = { g, lanes, reveal: 1, cars: [], flow: 0.03, t: 0 };
    for (let l = 0; l < lanes; l++) for (let d = 1.05 + Math.random() * 0.2; d < 15; d += 0.5 + Math.random() * 0.12) this.addDvpCar(l, d);
  }

  private dvpT(d: number) { return 1.1 / d; }

  private addDvpCar(lane: number, d: number) {
    if (!this.dvp) return;
    const kind = CAR_KINDS[Math.floor(Math.random() * CAR_KINDS.length)];
    const s = this.add.image(0, 0, 'world', `dvp_${kind}_0`).setDepth(2);
    this.dvp.cars.push({ s, lane, d, kind });
  }

  private updateDvp(dtMs: number) {
    const D = this.dvp;
    if (!D) return;
    D.t += dtMs;
    const vx = GAME_W / 2, H = GAME_H, span = H - HZ;
    const scales = ((this.registry.get('manifest') as Manifest & { dvpScales?: number[] }).dvpScales) ?? [2.8];
    // road: shoulders, asphalt, lane lines (dashes scroll a tiny bit = crawling traffic)
    const g = D.g.clear();
    const phase = D.t * 0.0004 * (D.flow > 0.5 ? 6 : 1);
    for (let y = HZ + 1; y < H; y++) {
      const t = (y - HZ) / span;
      const xl = vx + LEFT_BOTTOM * t;
      const done = D.lanes - 1 + (D.reveal >= 1 ? 1 : (t < D.reveal * 1.05 ? 1 : 0));
      const xr = vx + (LEFT_BOTTOM + done * LANE_BOTTOM) * t;
      g.fillStyle(0x7b7889).fillRect(xl - 6 * t - 1, y, 6 * t + 1, 1); // left barrier
      g.fillStyle(0x363644).fillRect(xl, y, xr - xl, 1);
      g.fillStyle(0xa39c8b).fillRect(xr, y, 8 * t + 1, 1); // right shoulder
      const dash = Math.floor(1.1 / t * 2 + phase) % 2 === 0;
      for (let i = 1; i < done; i++) if (dash) g.fillStyle(0xf6f2e9).fillRect(Math.round(vx + (LEFT_BOTTOM + i * LANE_BOTTOM) * t), y, Math.max(1, Math.round(1.6 * t)), 1);
      g.fillStyle(0xf5c22e).fillRect(Math.round(xl + 2 * t), y, 1, 1);
    }
    // cars: stop-and-go creep; nearest depth drawn on top
    const dt = dtMs / 1000;
    for (const c of D.cars) {
      const creep = D.flow + (Math.sin(D.t / 700 + c.lane * 1.7) > 0.6 ? 0.06 : 0);
      c.d += creep * dt * (0.6 + c.lane * 0.05);
      const ahead = D.cars.filter((o) => o.lane === c.lane && o.d > c.d).reduce((m, o) => Math.min(m, o.d), 99);
      if (ahead - c.d < 0.48) c.d = ahead - 0.48;
      const t = this.dvpT(c.d);
      const y = HZ + t * span;
      const x = vx + (LEFT_BOTTOM + (c.lane + 0.5) * LANE_BOTTOM) * t;
      const want = t * 2.9;
      let idx = 0; for (let i = 0; i < scales.length; i++) if (Math.abs(scales[i] - want) < Math.abs(scales[idx] - want)) idx = i;
      c.s.setFrame(`dvp_${c.kind}_${idx}`).setPosition(Math.round(x), Math.round(y)).setOrigin(0.5, 0.9).setDepth(2 + y / 1000);
      c.s.setVisible(t > 0.06 && y < H + 30 && (c.lane < D.lanes - 1 || D.reveal >= 1 || t < D.reveal));
    }
    D.cars = D.cars.filter((c) => { if (c.d > 30) { c.s.destroy(); return false; } return true; });
    // the jam never clears: refill every lane from behind the camera
    for (let l = 0; l < D.lanes; l++) {
      if (l === D.lanes - 1 && D.reveal < 1) continue;
      const nearest = D.cars.filter((c) => c.lane === l).reduce((m, c) => Math.min(m, c.d), 99);
      if (nearest > 1.6) this.addDvpCar(l, nearest - 0.5 - Math.random() * 0.05);
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

  update(_t: number, dt: number) {
    this.input2.update();
    this.panX += dt * this.pan;
    for (const l of this.layers) l.ts.tilePositionX = this.panX * l.f * 10 + (l.f === 0 ? 0 : 0);
    this.updateDvp(dt);
    for (const f of this.followers) if (f.a.active && f.g.active) f.g.setPosition(f.a.x, f.a.y - 40 + Math.sin(this.time.now / 150));
    if (this.input2.justPressed('back') || this.input2.justPressed('pause')) { this.skipping = true; this.advance?.(); this.time.removeAllEvents(); void this.finish(); return; }
    if (this.input2.justPressed('confirm')) this.advance?.();
  }
}
