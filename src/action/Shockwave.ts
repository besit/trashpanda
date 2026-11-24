// A ground shockwave (M4.1, Ivan: "what are the grey blocks that fly out after the stomp?"): a ripple of dust
// that runs along the street from a stomp. Drawn as two arcs and a trail of dust; jump it.
import Phaser from 'phaser';
import { puff } from '../ui/fx';

export class Shockwave {
  private g: Phaser.GameObjects.Graphics;
  private dustT = 0;
  x: number;
  /** depth: M4.17, the Wrecker's waves and their dust draw over everything in the world (Ivan) */
  constructor(private scene: Phaser.Scene, x: number, readonly dir: 1 | -1, private groundY: number, private speed = 180, private depth = 97) {
    this.x = x;
    this.g = scene.add.graphics().setDepth(depth);
  }
  /** the part that hurts a raccoon on the ground */
  hits(pRect: Phaser.Geom.Rectangle, onGround: boolean) { return onGround && Math.abs(pRect.centerX - this.x) < 12 && pRect.bottom > this.groundY - 10; }
  update(dt: number) {
    this.x += this.dir * this.speed * dt;
    const y = this.groundY, x = Math.round(this.x);
    const g = this.g.clear();
    // a forward-leaning ripple: the outer arc tall and pale, the inner one short and bright
    g.lineStyle(2, 0xd9c8a0, 0.85); g.beginPath(); g.arc(x - this.dir * 2, y, 11, Math.PI, 0, false); g.strokePath();
    g.lineStyle(2, 0xfff08a, 0.9); g.beginPath(); g.arc(x, y, 6, Math.PI, 0, false); g.strokePath();
    g.fillStyle(0xa39c8b, 0.7).fillRect(x - 14, y - 2, 28, 2);
    this.dustT -= dt;
    if (this.dustT <= 0) { this.dustT = 0.05; puff(this.scene, x - this.dir * 8, y - 3, 0xc9b88f, 2, 10, this.depth - 1); }
  }
  destroy() { this.g.destroy(); }
}
