// M4.3: the map missions' guide arrow (from the Bike Bus, M4.2), shared with the Dock Drop.
// On screen: a big bouncing arrow and a pulsing ring over the target (below it, pointing up, when above would cover
// the HUD lines). Off screen: a big arrow at the screen's edge with a word saying what's there.
import Phaser from 'phaser';
import { GAME_W } from '../config';
import { text } from '../ui/fx';

/** M4.3: the map missions' status lines sit in a dark box under the livability HUD (they ran into it, and the map
 *  behind made them hard to read); nothing else may be drawn above HUD_BOTTOM */
export const HUD_Y = 60, HUD_BOTTOM = 86;
/** ...and the toast at the bottom starts here (GAME_H - this) */
const TOAST_GAP = 54;

export interface GuideTarget { x: number; y: number; color: number; word: string }

export function drawGuide(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, label: Phaser.GameObjects.BitmapText, s: GuideTarget | undefined) {
  g.clear();
  if (!s) { label.setVisible(false); return; }
  const cam = scene.cameras.main, v = cam.worldView;
  const now = scene.time.now, bob = Math.sin(now / 140) * 3, pulse = (now % 900) / 900, col = s.color;
  if (Phaser.Geom.Rectangle.Contains(v, s.x, s.y - 20)) {
    g.setScrollFactor(1);
    g.lineStyle(2, col, 1 - pulse).strokeCircle(s.x, s.y - 4, 10 + pulse * 18);
    const up = s.y - 58 - v.y < HUD_BOTTOM + 4, ty = up ? s.y + 26 - bob : s.y - 58 + bob, d = up ? -1 : 1;
    g.fillStyle(0x16121f).fillTriangle(s.x - 11, ty - d, s.x + 11, ty - d, s.x, ty + 14 * d);
    g.fillStyle(col).fillTriangle(s.x - 8, ty + d, s.x + 8, ty + d, s.x, ty + 11 * d);
    g.fillStyle(0x16121f).fillRect(s.x - 4, up ? ty : ty - 10, 8, 10); g.fillStyle(col).fillRect(s.x - 2, up ? ty + 1 : ty - 9, 4, 9);
    label.setVisible(false);
    return;
  }
  g.setScrollFactor(0);
  const cx = v.width / 2, cy = v.height / 2 + 10, a = Math.atan2(s.y - (v.y + cy), s.x - (v.x + cx));
  const ex = Phaser.Math.Clamp(cx + Math.cos(a) * 400, 22, v.width - 22), ey = Phaser.Math.Clamp(cy + Math.sin(a) * 400, HUD_BOTTOM + 14, v.height - TOAST_GAP);
  const k = 1 + 0.15 * Math.sin(now / 120);
  const tip = (r: number, da: number) => [ex + Math.cos(a + da) * r * k, ey + Math.sin(a + da) * r * k] as const;
  const [x1, y1] = tip(16, 0), [x2, y2] = tip(12, 2.5), [x3, y3] = tip(12, -2.5);
  g.fillStyle(0x16121f).fillTriangle(x1 + Math.cos(a) * 2, y1 + Math.sin(a) * 2, x2 - Math.cos(a) * 2, y2 - Math.sin(a) * 2, x3 - Math.cos(a) * 2, y3 - Math.sin(a) * 2);
  g.fillStyle(col).fillTriangle(x1, y1, x2, y2, x3, y3);
  label.setVisible(true).setText(s.word).setTint(col).setPosition(ex - Math.cos(a) * 22, ey - Math.sin(a) * 18);
  // M4.3: on a dark backing (the label landed on the TORONTO sign: text on text)
  const lw = label.width + 6, lh = label.height + 4;
  g.fillStyle(0x16121f, 0.85).fillRect(label.x - lw / 2, label.y - lh / 2, lw, lh);
}

/** what ExploreScene needs from a mission played on the map (the Bike Bus, the Dock Drop) */
export interface MapMission {
  state: 'ride' | 'won' | 'late';
  t: number;
  readonly solids?: Phaser.Physics.Arcade.StaticGroup;
  update(dtMs: number, px: number, py: number): void;
  bell(x: number, y: number): void;
  /** the city map's markers: what's still to do, the next one blinking */
  route(): { x: number; y: number; kind: string; next: boolean }[];
  /** the opening hint (2 lines) */
  intro(touch: boolean): string;
  /** the result cards: [headline, sub-line] */
  lateCard(): [string, string];
  winCard(): [string, string];
  hideHud(): void;
  destroy(): void;
}

/** the status lines of a map mission, in their own dark box */
export class MissionHud {
  private box: Phaser.GameObjects.Graphics;
  private t: Phaser.GameObjects.BitmapText;
  private last = '';
  constructor(scene: Phaser.Scene) {
    this.box = scene.add.graphics().setScrollFactor(0).setDepth(20009);
    this.t = text(scene, GAME_W / 2, HUD_Y + 3, '', 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(20010).setCenterAlign();
  }
  set(str: string, tint: number) {
    this.t.setTint(tint).setX(GAME_W / 2);
    if (str === this.last) return;
    this.last = str; this.t.setText(str);
    const w = this.t.width + 14, h = this.t.height + 7;
    this.box.clear().fillStyle(0x16121f, 0.88).fillRoundedRect(GAME_W / 2 - w / 2, HUD_Y, w, h, 3).lineStyle(1, 0x69657a).strokeRoundedRect(GAME_W / 2 - w / 2, HUD_Y, w, h, 3);
  }
  setVisible(v: boolean) { this.t.setVisible(v); this.box.setVisible(v); }
  destroy() { this.t.destroy(); this.box.destroy(); }
}
