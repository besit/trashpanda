// Shared presentation helpers: text, transitions, screen shake, hit stop, floating labels.
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { ctx } from '../core/ctx';

export type FontKey = 'font' | 'font_outline' | 'font_big' | 'font_red';

export function text(scene: Phaser.Scene, x: number, y: number, str: string, font: FontKey = 'font_outline', origin = 0.5) {
  return scene.add.bitmapText(x, y, font, str.toUpperCase()).setOrigin(origin, origin);
}

/** Iris wipe. dir 'close' shrinks to black around (cx, cy); 'open' reveals. */
export function iris(scene: Phaser.Scene, dir: 'close' | 'open', cx = GAME_W / 2, cy = GAME_H / 2, ms = 550): Promise<void> {
  return new Promise((resolve) => {
    const g = scene.add.graphics().setScrollFactor(0).setDepth(100000);
    const maxR = Math.hypot(GAME_W, GAME_H);
    const o = { r: dir === 'close' ? maxR : 0 };
    const draw = () => {
      g.clear();
      const thick = maxR * 2;
      g.lineStyle(thick, 0x16121f, 1).strokeCircle(cx, cy, Math.max(0.5, o.r) + thick / 2);
      if (o.r < 1) g.fillStyle(0x16121f, 1).fillRect(0, 0, GAME_W, GAME_H);
    };
    draw();
    scene.tweens.add({ targets: o, r: dir === 'close' ? 0 : maxR, duration: ms, ease: dir === 'close' ? 'Cubic.easeIn' : 'Cubic.easeOut', onUpdate: draw, onComplete: () => { if (dir === 'open') g.destroy(); resolve(); } });
  });
}

/**
 * Word-wrap by the font's real glyph widths (M3.1: the payoff box wrapped by a guessed 6 px per character,
 * but font_outline is wider, so lines ran past the box).
 */
export function wrapLines(scene: Phaser.Scene, font: FontKey, str: string, maxW: number): string[] {
  const probe = scene.add.bitmapText(-999, -999, font, '').setVisible(false);
  const out: string[] = [];
  for (const para of str.toUpperCase().split(/\n/)) {
    let cur = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const cand = cur ? cur + ' ' + w : w;
      probe.setText(cand);
      if (probe.width > maxW && cur) { out.push(cur); cur = w; } else cur = cand;
    }
    out.push(cur);
  }
  probe.destroy();
  return out;
}

/** Horizontal Sega-style blinds wipe to black (or, with open, from black back to the scene). */
export function blinds(scene: Phaser.Scene, ms = 400, open = false): Promise<void> {
  return new Promise((resolve) => {
    const g = scene.add.graphics().setScrollFactor(0).setDepth(100000);
    const o = { t: open ? 1 : 0 };
    const draw = () => { g.clear().fillStyle(0x16121f, 1); for (let y = 0; y < GAME_H; y += 12) g.fillRect(0, y, GAME_W, Math.ceil(12 * o.t)); };
    draw();
    scene.tweens.add({ targets: o, t: open ? 0 : 1, duration: open ? Math.max(ms, 320) : ms, ease: open ? 'Quad.easeOut' : 'Quad.easeIn', onUpdate: draw, onComplete: () => { if (open) g.destroy(); resolve(); } });
  });
}

export function shake(scene: Phaser.Scene, ms = 120, intensity = 0.006) {
  if (ctx.settings.shake) scene.cameras.main.shake(ms, intensity);
}

/** Freeze the scene's physics/tweens for a few ms to sell impacts. */
export function hitStop(scene: Phaser.Scene, ms = 60) {
  const w = (scene.physics as Phaser.Physics.Arcade.ArcadePhysics | undefined)?.world;
  if (!w || w.isPaused) return;
  w.pause();
  scene.time.timeScale = 0.0001; scene.anims.globalTimeScale = 0.0001;
  setTimeout(() => { scene.time.timeScale = 1; scene.anims.globalTimeScale = 1; if (scene.scene.isActive()) w.resume(); }, ms);
}

export function floatText(scene: Phaser.Scene, x: number, y: number, str: string, font: FontKey = 'font_outline', tint = 0xffffff, hold = 0) {
  const t = text(scene, x, y, str, font).setDepth(9000).setTint(tint);
  scene.tweens.add({ targets: t, y: y - 18, alpha: 0, delay: hold, duration: 800, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  if (hold) scene.tweens.add({ targets: t, y: y - 6, duration: 300, ease: 'Cubic.easeOut' });
  return t;
}

/** Small pooled pixel particles (dust, sparks). */
export function puff(scene: Phaser.Scene, x: number, y: number, color: number, n = 6, spread = 30, depth = 5000) {
  for (let i = 0; i < n; i++) {
    const p = scene.add.rectangle(x, y, 2, 2, color).setDepth(depth);
    const a = Math.random() * Math.PI * 2, d = spread * (0.4 + Math.random() * 0.6);
    scene.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.6 - 6, alpha: 0, duration: 300 + Math.random() * 250, ease: 'Cubic.easeOut', onComplete: () => p.destroy() });
  }
}

/** Bell "ding" rings expanding from a point (used at the bike's handlebars). */
export function bellRing(scene: Phaser.Scene, x: number, y: number, depth = 5000) {
  for (let i = 0; i < 2; i++) {
    const g = scene.add.graphics().setDepth(depth);
    const o = { r: 2, a: 1 };
    scene.tweens.add({ targets: o, r: 11, a: 0, delay: i * 110, duration: 380, ease: 'Cubic.easeOut', onUpdate: () => {
      g.clear().lineStyle(1, 0xfff08a, o.a);
      g.beginPath(); g.arc(x, y, o.r, -Math.PI * 0.85, -Math.PI * 0.15); g.strokePath();
      g.fillStyle(0xfff08a, o.a).fillRect(x - 1, y - o.r - 3, 2, 2);
    }, onComplete: () => g.destroy() });
  }
}

/**
 * Make text fit the view (M2.1: titles and end cards were running off screen).
 * Without `wrap`: shrink a big title to fit and return the scale used.
 * With `wrap`: break into centred lines no wider than maxW and return the text.
 */
export function fitText(t: Phaser.GameObjects.BitmapText, maxW: number): number;
export function fitText(t: Phaser.GameObjects.BitmapText, maxW: number, wrap: true): Phaser.GameObjects.BitmapText;
export function fitText(t: Phaser.GameObjects.BitmapText, maxW: number, wrap = false): number | Phaser.GameObjects.BitmapText {
  if (wrap) { t.setMaxWidth(maxW).setCenterAlign(); return t; }
  t.setScale(1);
  const s = Math.min(1, maxW / Math.max(1, t.width));
  t.setScale(s);
  return s;
}
