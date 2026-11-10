// Mission 4, "Slow Down, Dog" (Parkside Drive):
//  Chase: two rats run off with the cut-down speed camera toward the park pond (it really happened).
//         Catch them before they get there; cones in the road knock your speed down.
//  Build: in the school zone, pump the three build spots to raise a speed hump, a raised crosswalk and
//         a curb extension while SUV Rats speed through. Every finished piece slows the cars that cross it.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import type { Hitbox } from './SidePlayer';
import type { SuvRat } from './SuvRat';

export interface ChaseDef { lead: number; speed: number; pondAt: number; cones: number[] }
export interface BuildDef { at: number; spots: number[]; suvs: number }

export class Chase {
  private rats: Phaser.GameObjects.Sprite[] = [];
  private cam: Phaser.GameObjects.Image;
  x: number;
  state: 'run' | 'caught' | 'splash' = 'run';
  private tauntT = 2;
  private cones: { img: Phaser.GameObjects.Image; x: number; hit: boolean }[] = [];

  constructor(private scene: Phaser.Scene, private def: ChaseDef, startX: number, private groundY: number) {
    this.x = startX + def.lead;
    for (let i = 0; i < 2; i++) this.rats.push(scene.add.sprite(0, groundY, 'chars', 'rat_basic_0').setOrigin(15 / 32, 31 / 32).setDepth(92).play('rat_basic_walk'));
    this.cam = scene.add.image(0, groundY - 22, 'world', 'camcarried').setDepth(93);
    for (const cx of def.cones) this.cones.push({ img: scene.add.image(cx, groundY + 1, 'world', 'cone').setOrigin(0.5, 1).setScale(2).setDepth(91), x: cx, hit: false });
    // the pond at the end of the run (with a little reed fringe)
    const g = scene.add.graphics().setDepth(40);
    g.fillStyle(0x25529b).fillEllipse(def.pondAt + 80, groundY - 8, 220, 22).fillStyle(0x3a88cf).fillEllipse(def.pondAt + 70, groundY - 10, 160, 10);
    for (let i = 0; i < 18; i++) g.fillStyle(i % 2 ? 0x2a6e38 : 0x55a144).fillRect(def.pondAt - 30 + i * 12, groundY - 26 + (i % 3) * 2, 2, 12);
    scene.add.bitmapText(def.pondAt + 80, groundY - 36, 'font_outline', 'POND').setOrigin(0.5).setDepth(41).setTint(0xcdefff);
  }

  get rearX() { return this.x - 26; }
  get distance() { return this.x; }

  /** returns true the frame the raccoon catches them */
  update(dtMs: number, player: { x: number; body: Phaser.Physics.Arcade.Body; onGround: boolean }): 'run' | 'caught' | 'splash' {
    if (this.state !== 'run') return this.state;
    const dt = dtMs / 1000;
    // rubber band: they jog when far ahead, sprint when you close in
    const gap = this.rearX - player.x;
    const sp = this.def.speed * (gap < 70 ? 1.05 : gap > 260 ? 0.85 : 1);
    this.x += sp * dt;
    this.rats[0].setPosition(this.x - 26, this.groundY); this.rats[1].setPosition(this.x + 26, this.groundY);
    this.cam.setPosition(this.x, this.groundY - 22 + Math.sin(this.scene.time.now / 70) * 1.5);
    this.tauntT -= dt;
    if (this.tauntT <= 0) { floatText(this.scene, this.x, this.groundY - 46, Phaser.Utils.Array.GetRandom(['TAX GRAB! TAX GRAB!', 'TO THE POND!', 'SQUEAK! FASTER!', 'BOSS SAYS SPEED IS FREEDOM!']), 'font', 0xff6347, 500); this.tauntT = 2.4; }
    // cones: riding into one knocks you back (jump them)
    for (const c of this.cones) {
      if (c.hit || Math.abs(player.x - c.x) > 10 || !player.onGround) continue;
      c.hit = true; sfx.clang(); player.body.setVelocityX(-60);
      puff(this.scene, c.x, this.groundY - 6, 0xff9a2e, 6, 16, 95);
      this.scene.tweens.add({ targets: c.img, x: c.x + 50, angle: 200, alpha: 0, duration: 500 });
      floatText(this.scene, c.x, this.groundY - 40, 'BONK! JUMP THE CONES', 'font', 0xfff08a, 400);
    }
    if (player.x > this.rearX - 6) {
      this.state = 'caught';
      sfx.squeak(); shake(this.scene, 150, 0.008);
      floatText(this.scene, this.x, this.groundY - 50, 'GOT YOU!', 'font_big', 0xffffff, 700);
      this.scene.tweens.add({ targets: this.cam, y: this.groundY - 4, angle: 8, duration: 300, ease: 'Bounce.easeOut' });
      this.rats.forEach((r) => r.destroy());
    } else if (this.x + 30 > this.def.pondAt) {
      this.state = 'splash';
      sfx.splash();
      this.scene.tweens.add({ targets: [this.cam, ...this.rats], x: this.def.pondAt + 70, y: this.groundY - 4, alpha: 0, duration: 500 });
      for (let i = 0; i < 3; i++) this.scene.time.delayedCall(i * 120, () => puff(this.scene, this.def.pondAt + 70, this.groundY - 10, 0xcdefff, 10, 30, 95));
    }
    return this.state;
  }

  /** where the rescued camera lies (for the "recovered" pickup) */
  get camImage() { return this.cam; }
}

const PIECES = [
  { key: 'humpside', name: 'SPEED HUMP!' },
  { key: 'raisedside', name: 'RAISED CROSSWALK!' },
  { key: 'curbextside', name: 'CURB EXTENSION!' },
] as const;

export class BuildSpots {
  private spots: { x: number; img: Phaser.GameObjects.Image; bar: Phaser.GameObjects.Graphics; hits: number; done: boolean; lastHit: number; piece?: Phaser.GameObjects.Image }[] = [];
  readonly need = 4;
  built = 0;

  constructor(private scene: Phaser.Scene, def: BuildDef, left: number, private groundY: number) {
    def.spots.forEach((dx, i) => {
      const x = left + dx;
      const img = scene.add.image(x, groundY + 2, 'world', 'buildspot').setOrigin(0.5, 0.92).setDepth(85);
      const bar = scene.add.graphics().setDepth(210);
      this.spots.push({ x, img, bar, hits: 0, done: false, lastHit: -1 });
      void i;
    });
  }

  get allDone() { return this.built >= this.spots.length; }

  update(hits: Hitbox[], cars: SuvRat[], playerX: number) {
    for (const [i, s] of this.spots.entries()) {
      // progress bar + "PUMP!" hint
      s.bar.clear();
      if (!s.done) {
        const near = Math.abs(playerX - s.x) < 40;
        s.bar.fillStyle(0x16121f).fillRect(s.x - 13, this.groundY - 40, 26, 5).fillStyle(0xf5c22e).fillRect(s.x - 12, this.groundY - 39, (24 * s.hits) / this.need, 3);
        if (near) s.bar.fillStyle(0xfff08a).fillTriangle(s.x - 3, this.groundY - 48, s.x + 3, this.groundY - 48, s.x, this.groundY - 44);
        for (const h of hits) {
          if (h.id === s.lastHit || h.x > s.x + 18 || h.x + h.w < s.x - 18) continue;
          s.lastHit = h.id; s.hits += h.dmg > 1 ? 2 : 1;
          sfx.hammer(); puff(this.scene, s.x, this.groundY - 8, 0xc9c5d1, 4, 14, 90);
          if (s.hits >= this.need) {
            s.done = true; this.built++;
            const p = PIECES[i % PIECES.length];
            s.img.destroy();
            s.piece = this.scene.add.image(s.x, this.groundY + 3, 'world', p.key).setOrigin(0.5, 0.95).setDepth(80).setScale(0, 1);
            this.scene.tweens.add({ targets: s.piece, scaleX: 1, duration: 250, ease: 'Back.easeOut' });
            sfx.ding(); shake(this.scene, 100, 0.004);
            floatText(this.scene, s.x, this.groundY - 56, p.name, 'font_outline', 0x9bd35a, 900);
          }
          break;
        }
      }
      // finished pieces slow every car that crosses them
      if (s.done) for (const c of cars) if (c.alive && Math.abs(c.x - s.x) < 14) c.bump();
    }
  }
}
