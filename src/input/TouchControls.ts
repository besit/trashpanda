// On-screen controls for phones, drawn in-game at native pixel resolution.
// Left half: floating stick (appears where the thumb lands). Right: 4 large buttons.
import Phaser from 'phaser';
import { touchState } from './InputManager';
import { GAME_W, GAME_H } from '../config';

interface Btn { id: 'jump' | 'dash' | 'act' | 'boost'; x: number; y: number; r: number; label: string; color: number; g?: Phaser.GameObjects.Graphics; t?: Phaser.GameObjects.BitmapText }

export function wantsTouch(): boolean {
  const q = new URLSearchParams(location.search);
  if (q.has('touch')) return true;
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0) && matchMedia('(pointer: coarse)').matches;
}

export class TouchControls {
  private stickBase: Phaser.GameObjects.Graphics;
  private stickKnob: Phaser.GameObjects.Graphics;
  private stickId: number | null = null;
  private stickOrigin = new Phaser.Math.Vector2();
  private btnPointers = new Map<number, Btn['id']>();
  private buttons: Btn[];
  private container: Phaser.GameObjects.Container;
  labels: Record<Btn['id'], string> = { jump: 'JUMP', dash: 'DASH', act: 'ACT', boost: 'BOOST' };

  constructor(private scene: Phaser.Scene) {
    touchState.active = true;
    scene.input.addPointer(3);
    const bx = GAME_W - 44, by = GAME_H - 46;
    this.buttons = [
      { id: 'jump', x: bx, y: by + 18, r: 17, label: 'JUMP', color: 0x55a144 },
      { id: 'act', x: bx - 30, y: by, r: 15, label: 'ACT', color: 0xd42a24 },
      { id: 'dash', x: bx + 26, y: by - 8, r: 15, label: 'DASH', color: 0x3a88cf },
      { id: 'boost', x: bx - 6, y: by - 30, r: 13, label: 'BOOST', color: 0xf5c22e },
    ];
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(10000);
    for (const b of this.buttons) {
      b.g = scene.add.graphics();
      b.t = scene.add.bitmapText(b.x, b.y, 'font', b.label).setOrigin(0.5).setTint(0xf6f2e9);
      this.container.add([b.g, b.t]);
    }
    this.stickBase = scene.add.graphics();
    this.stickKnob = scene.add.graphics();
    this.container.add([this.stickBase, this.stickKnob]);
    this.drawButtons();

    scene.input.on('pointerdown', this.down, this);
    scene.input.on('pointermove', this.move, this);
    scene.input.on('pointerup', this.up, this);
    scene.input.on('pointerupoutside', this.up, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  setLabel(id: Btn['id'], label: string) {
    const b = this.buttons.find((x) => x.id === id);
    if (b && b.t && this.labels[id] !== label) { this.labels[id] = label; b.t.setText(label); }
  }

  private drawButtons() {
    for (const b of this.buttons) {
      const on = touchState.buttons[b.id];
      const g = b.g!;
      g.clear();
      g.fillStyle(0x16121f, 0.45).fillCircle(b.x, b.y + 2, b.r);
      g.fillStyle(b.color, on ? 0.95 : 0.55).fillCircle(b.x, b.y + (on ? 1 : 0), b.r);
      g.lineStyle(1, 0xf6f2e9, on ? 1 : 0.6).strokeCircle(b.x, b.y + (on ? 1 : 0), b.r);
      b.t!.setY(b.y + (on ? 1 : 0));
    }
  }

  private hitButton(x: number, y: number): Btn | undefined {
    return this.buttons.find((b) => Phaser.Math.Distance.Between(x, y, b.x, b.y) <= b.r + 6);
  }

  private down(p: Phaser.Input.Pointer) {
    const b = this.hitButton(p.x, p.y);
    if (b) { this.btnPointers.set(p.id, b.id); touchState.buttons[b.id] = true; this.drawButtons(); return; }
    if (p.x < GAME_W * 0.55 && this.stickId === null) {
      this.stickId = p.id; this.stickOrigin.set(p.x, p.y); this.drawStick(p.x, p.y);
    }
  }
  private move(p: Phaser.Input.Pointer) {
    if (p.id === this.stickId) {
      const dx = p.x - this.stickOrigin.x, dy = p.y - this.stickOrigin.y, max = 18;
      const len = Math.hypot(dx, dy), k = len > max ? max / len : 1;
      touchState.x = Phaser.Math.Clamp(dx / max, -1, 1); touchState.y = Phaser.Math.Clamp(dy / max, -1, 1);
      if (len < 3) { touchState.x = 0; touchState.y = 0; }
      this.drawStick(this.stickOrigin.x + dx * k, this.stickOrigin.y + dy * k);
    } else if (this.btnPointers.has(p.id)) {
      // slide between buttons
      const b = this.hitButton(p.x, p.y), cur = this.btnPointers.get(p.id)!;
      if (b && b.id !== cur) { touchState.buttons[cur] = false; touchState.buttons[b.id] = true; this.btnPointers.set(p.id, b.id); this.drawButtons(); }
    }
  }
  private up(p: Phaser.Input.Pointer) {
    if (p.id === this.stickId) { this.stickId = null; touchState.x = 0; touchState.y = 0; this.stickBase.clear(); this.stickKnob.clear(); }
    const id = this.btnPointers.get(p.id);
    if (id) { touchState.buttons[id] = false; this.btnPointers.delete(p.id); this.drawButtons(); }
  }
  private drawStick(kx: number, ky: number) {
    const o = this.stickOrigin;
    this.stickBase.clear().fillStyle(0x16121f, 0.35).fillCircle(o.x, o.y, 22).lineStyle(1, 0xf6f2e9, 0.5).strokeCircle(o.x, o.y, 22);
    this.stickKnob.clear().fillStyle(0xf6f2e9, 0.7).fillCircle(kx, ky, 9);
  }
  destroy() {
    this.scene.input.off('pointerdown', this.down, this);
    this.scene.input.off('pointermove', this.move, this);
    this.scene.input.off('pointerup', this.up, this);
    this.scene.input.off('pointerupoutside', this.up, this);
    touchState.x = 0; touchState.y = 0;
    for (const k of Object.keys(touchState.buttons)) touchState.buttons[k] = false;
    this.container.destroy();
  }
}
