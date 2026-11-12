// Mission 7, "The Great Parking Lot" (East End, M3):
//  Depave: pump the cracked asphalt patches until they break up; each becomes soil with a sapling.
//  Boss, the MONSTER SUV: it charges across the lot (jump onto its roof to stomp it, or get clear),
//  slams into the curb at the edge and stalls (pump its tyres while it smokes). Faster when hurt.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';

import type { RatKind } from './Rat';

/** a locked arena of spots to break: asphalt patches to depave (M7), or MEGA SPA fences to tear down (M8) */
export interface DepaveDef { at: number; patches: number[]; rats: RatKind[]; style?: 'asphalt' | 'fence' }

export class DepaveSpots {
  private spots: { x: number; img: Phaser.GameObjects.Image; bar: Phaser.GameObjects.Graphics; hits: number; done: boolean; lastHit: number }[] = [];
  readonly need = 3;
  done = 0;
  readonly fence: boolean;
  constructor(private scene: Phaser.Scene, def: DepaveDef, left: number, private groundY: number) {
    this.fence = def.style === 'fence';
    for (const dx of def.patches) {
      const x = left + dx;
      const img = this.fence ? scene.add.image(x, groundY - 8, 'world', 'spafence_side').setOrigin(0.5, 1).setDepth(38) : scene.add.image(x, groundY + 2, 'world', 'asphaltpatch').setDepth(40);
      this.spots.push({ x, img, bar: scene.add.graphics().setDepth(210), hits: 0, done: false, lastHit: -1 });
    }
  }
  get verb() { return this.fence ? 'FENCES DOWN' : 'DEPAVED'; }
  get total() { return this.spots.length; }
  get allDone() { return this.done >= this.spots.length; }
  finish() { this.spots.forEach((s) => s.bar.clear()); }
  update(hits: Hitbox[], px: number) {
    for (const s of this.spots) {
      s.bar.clear();
      if (s.done) continue;
      const by = this.fence ? this.groundY - 62 : this.groundY - 26;
      s.bar.fillStyle(0x16121f).fillRect(s.x - 11, by, 22, 4).fillStyle(0x9bd35a).fillRect(s.x - 10, by + 1, (20 * s.hits) / this.need, 2);
      if (Math.abs(px - s.x) < 34) s.bar.fillStyle(0xfff08a).fillTriangle(s.x - 3, by - 8, s.x + 3, by - 8, s.x, by - 4);
      for (const h of hits) {
        if (h.id === s.lastHit || h.x > s.x + 20 || h.x + h.w < s.x - 20) continue;
        s.lastHit = h.id; s.hits += h.dmg > 1 ? 2 : 1;
        sfx.hammer(); puff(this.scene, s.x, this.groundY - (this.fence ? 30 : 2), 0x363644, 5, 14, 90);
        if (!this.fence || s.hits < this.need) this.scene.tweens.add({ targets: s.img, x: s.x + (this.fence ? 2 : 0), duration: 40, yoyo: true, repeat: 1 });
        if (s.hits >= this.need && this.fence) {
          // the panel topples over backwards and is gone: the promenade is open again
          s.done = true; this.done++; s.bar.clear();
          this.scene.tweens.add({ targets: s.img, angle: px < s.x ? 80 : -80, alpha: 0, y: s.img.y + 6, duration: 520, ease: 'Quad.easeIn', onComplete: () => s.img.destroy() });
          shake(this.scene, 120, 0.006); sfx.ding(); puff(this.scene, s.x, this.groundY - 16, 0xf5c22e, 8, 20, 90);
          floatText(this.scene, s.x, this.groundY - 70, this.done === this.total ? 'PUBLIC!' : 'TORN DOWN!', 'font_outline', 0x9bd35a, 600);
        } else if (s.hits >= this.need) {
          s.done = true; this.done++; s.bar.clear();
          s.img.setTexture('world', 'soilsapling').setOrigin(0.5, 30 / 34).setScale(1, 0);
          this.scene.tweens.add({ targets: s.img, scaleY: 1, duration: 400, ease: 'Back.easeOut' });
          sfx.ding(); puff(this.scene, s.x, this.groundY - 6, 0x9bd35a, 8, 18, 90);
          floatText(this.scene, s.x, this.groundY - 40, this.done === this.total ? 'GREEN!' : 'DEPAVED!', 'font_outline', 0x9bd35a, 600);
        }
        break;
      }
    }
  }
}

export class MonsterSuv {
  readonly img: Phaser.GameObjects.Image;
  readonly maxHp = 14;
  hp = this.maxHp;
  dir: 1 | -1 = -1;
  private state: 'intro' | 'charge' | 'stall' | 'turn' | 'dead' = 'intro';
  private t = 1.2;
  private lastHit = -1;
  private honkCd = 0;
  constructor(private scene: Phaser.Scene, x: number, private groundY: number, private bounds: { left: number; right: number }) {
    this.img = scene.add.image(x, groundY + 4, 'world', 'monstersuv_0').setOrigin(0.5, 82 / 86).setDepth(105).setFlipX(true);
    floatText(scene, x, groundY - 96, 'THIS IS MY PARKING SPOT!', 'font_red', 0xffffff, 1200);
    sfx.carHonk();
  }
  get x() { return this.img.x; }
  get alive() { return this.state !== 'dead'; }
  get stalled() { return this.state === 'stall'; }
  get title() { return 'THE MONSTER SUV'; }
  private get rage() { return this.hp <= this.maxHp / 2 ? 1.4 : 1; }
  rect() { return new Phaser.Geom.Rectangle(this.img.x - 52, this.groundY - 62, 104, 58); }
  roofY() { return this.groundY - 64; }
  /** the tyres: only hittable while it's stalled */
  tyreRect() { return new Phaser.Geom.Rectangle(this.img.x - 56, this.groundY - 26, 112, 26); }
  get dangerous() { return this.state === 'charge'; }

  hit(h: Hitbox, kind: 'stomp' | 'pump'): boolean {
    if (!this.alive || h.id === this.lastHit) return false;
    if (kind === 'pump' && this.state !== 'stall') return false;
    this.lastHit = h.id;
    this.hp -= kind === 'stomp' ? 1 : h.dmg;
    this.img.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => this.img.clearTint());
    puff(this.scene, this.img.x, this.groundY - 30, 0xfff08a, 6, 22, 110); sfx.clang();
    if (this.hp <= 0) this.die();
    return true;
  }
  private die() {
    this.state = 'dead';
    sfx.carHonk(); sfx.squeak(); shake(this.scene, 400, 0.012);
    floatText(this.scene, this.img.x, this.groundY - 100, 'TOWED!', 'font_big', 0xffffff, 1400);
    this.scene.tweens.add({ targets: this.img, y: this.groundY + 80, angle: this.dir * 10, alpha: 0, duration: 1100, ease: 'Cubic.easeIn' });
  }
  update(dtMs: number, px: number) {
    if (!this.alive) return;
    const dt = dtMs / 1000;
    this.t -= dt;
    this.img.setFrame(Math.floor(this.scene.time.now / 140) % 2 ? 'monstersuv_1' : 'monstersuv_0');
    switch (this.state) {
      case 'intro': if (this.t <= 0) { this.state = 'charge'; sfx.carHonk(); } break;
      case 'charge': {
        this.img.x += this.dir * 150 * this.rage * dt;
        if (Math.random() < 0.3) puff(this.scene, this.img.x - this.dir * 56, this.groundY - 10, 0x69657a, 1, 8, 104);
        this.honkCd -= dt; if (this.honkCd <= 0 && Math.abs(px - this.img.x) < 160) { sfx.carHonk(); this.honkCd = 1.2; }
        const edge = this.dir === 1 ? this.bounds.right - 56 : this.bounds.left + 56;
        if ((this.dir === 1 && this.img.x >= edge) || (this.dir === -1 && this.img.x <= edge)) {
          this.img.x = edge; this.state = 'stall'; this.t = 1.8 / this.rage;
          shake(this.scene, 200, 0.01); sfx.hit();
          floatText(this.scene, this.img.x, this.groundY - 92, 'STALLED! PUMP THE TYRES!', 'font', 0xfff08a, 900);
        }
        break;
      }
      case 'stall':
        if (Math.random() < 0.4) puff(this.scene, this.img.x + (Math.random() - 0.5) * 80, this.groundY - 4, 0xc9c5d1, 1, 10, 104);
        if (this.t <= 0) { this.state = 'turn'; this.t = 0.5; }
        break;
      case 'turn':
        if (this.t <= 0) { this.dir = this.dir === 1 ? -1 : 1; this.img.setFlipX(this.dir === -1); this.state = 'charge'; sfx.carHonk(); }
        break;
    }
  }
}
