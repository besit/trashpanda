// Maps keyboard, gamepad and touch onto abstract actions. One instance shared via the registry.
import Phaser from 'phaser';

export type Action = 'jump' | 'dash' | 'act' | 'boost' | 'pause' | 'map' | 'confirm' | 'back';
const ACTIONS: Action[] = ['jump', 'dash', 'act', 'boost', 'pause', 'map', 'confirm', 'back'];

// Left-hand layout around WASD (E act, Q dash, Space jump, Shift boost) + an arrow-key layout (Z X C V).
export const KEYMAP: Record<Action, string[]> = {
  jump: ['SPACE', 'Z'],
  dash: ['Q', 'C'],
  act: ['E', 'R', 'X'],
  boost: ['SHIFT', 'V'],
  pause: ['ESC', 'P'],
  map: ['M', 'TAB'],
  confirm: ['ENTER', 'SPACE', 'E', 'Z', 'X'],
  back: ['ESC', 'BACKSPACE'],
};
// Standard gamepad mapping: 0=A 1=B 2=X 3=Y 4=LB 5=RB 6=LT 7=RT 8=Select 9=Start
const PADMAP: Record<Action, number[]> = { jump: [0], dash: [1], act: [2], boost: [5, 7], pause: [9], map: [8, 3], confirm: [0, 9], back: [1] };

/** Human-readable control list (pause menu, title, mission cards). */
export const CONTROLS_KEYS: [string, string][] = [
  ['WASD / ARROWS', 'RIDE'],
  ['SHIFT (HOLD)', 'BOOST'],
  ['SPACE', 'HOP / JUMP'],
  ['Q', 'DASH'],
  ['E', 'BELL / TALK / PUMP'],
  ['M', 'MAP'],
  ['ESC', 'PAUSE'],
];
export const CONTROLS_ALT = 'ARROWS + Z JUMP  X ACT  C DASH  V BOOST';
export const CONTROLS_PAD = 'PAD: A JUMP  X ACT  B DASH  RT BOOST  SELECT MAP';

/** Touch state written by TouchControls */
export const touchState = { x: 0, y: 0, buttons: { jump: false, dash: false, act: false, boost: false, pause: false, map: false } as Record<string, boolean>, active: false,
  /** buttons pressed since the last read: quick taps (down+up inside one frame) are never lost */ taps: new Set<string>() };

export class InputManager {
  private keys = new Map<string, Phaser.Input.Keyboard.Key>();
  private held = new Set<Action>();
  private pressed = new Set<Action>();
  private prevHeld = new Set<Action>();
  moveX = 0;
  moveY = 0;
  lastDevice: 'keyboard' | 'pad' | 'touch' = 'keyboard';

  /** keyCodes pressed since last update (event-based, so sub-frame taps are never lost) */
  private taps = new Set<number>();
  private codeOf = new Map<string, number>();

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (kb) {
      const names = new Set(['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT', ...Object.values(KEYMAP).flat()]);
      for (const n of names) { this.keys.set(n, kb.addKey(n, true, false)); this.codeOf.set(n, Phaser.Input.Keyboard.KeyCodes[n as keyof typeof Phaser.Input.Keyboard.KeyCodes]); }
      const onDown = (e: KeyboardEvent) => { if (e.keyCode === 9) e.preventDefault(); if (!e.repeat) this.taps.add(e.keyCode); };
      kb.on('keydown', onDown);
      scene.events.once('shutdown', () => kb.off('keydown', onDown));
    }
  }

  private k(n: string) { return this.keys.get(n)?.isDown ?? false; }

  /** Call once per frame before reading. */
  update() {
    let x = 0, y = 0;
    if (this.k('A') || this.k('LEFT')) x -= 1;
    if (this.k('D') || this.k('RIGHT')) x += 1;
    if (this.k('W') || this.k('UP')) y -= 1;
    if (this.k('S') || this.k('DOWN')) y += 1;
    const now = new Set<Action>();
    const jd = new Set<string>();
    for (const [n, code] of this.codeOf) if (this.taps.has(code)) jd.add(n);
    this.taps.clear();
    const tapped = new Set<Action>();
    for (const a of ACTIONS) {
      if (KEYMAP[a].some((n) => this.k(n))) now.add(a);
      if (KEYMAP[a].some((n) => jd.has(n))) tapped.add(a);
    }
    if (x || y || now.size || tapped.size) this.lastDevice = 'keyboard';

    const pads = this.scene.input.gamepad?.gamepads ?? [];
    for (const pad of pads) {
      if (!pad || !pad.connected) continue;
      const ax = pad.axes.length ? pad.axes[0].getValue() : 0, ay = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
      const px = (pad.left ? -1 : 0) + (pad.right ? 1 : 0) + (Math.abs(ax) > 0.25 ? ax : 0);
      const py = (pad.up ? -1 : 0) + (pad.down ? 1 : 0) + (Math.abs(ay) > 0.25 ? ay : 0);
      let any = false;
      for (const a of ACTIONS) if (PADMAP[a].some((b) => pad.buttons[b]?.pressed)) { now.add(a); any = true; }
      if (px || py || any) { x = px; y = py; this.lastDevice = 'pad'; }
    }

    if (touchState.active) {
      if (touchState.x || touchState.y) { x = touchState.x; y = touchState.y; this.lastDevice = 'touch'; }
      for (const [b, v] of Object.entries(touchState.buttons)) if (v) { now.add(b as Action); if (b === 'act' || b === 'jump') now.add('confirm'); this.lastDevice = 'touch'; }
      for (const b of touchState.taps) { tapped.add(b as Action); if (b === 'act' || b === 'jump') tapped.add('confirm'); this.lastDevice = 'touch'; }
      touchState.taps.clear();
    }

    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    this.moveX = x; this.moveY = y;
    this.prevHeld = this.held;
    this.held = now;
    this.pressed = new Set([...[...now].filter((a) => !this.prevHeld.has(a)), ...tapped]);
    if (this.skipNext) { this.skipNext = false; this.pressed.clear(); this.held.forEach((a) => this.prevHeld.add(a)); }
  }

  /** Ignore presses on the next update (e.g. the key that closed a menu is still held). */
  swallow() { this.skipNext = true; }
  private skipNext = false;

  isDown(a: Action) { return this.held.has(a); }
  justPressed(a: Action) { return this.pressed.has(a); }
  /** Consume a press so other systems in the same frame don't also react. */
  consume(a: Action) { this.pressed.delete(a); }
}
