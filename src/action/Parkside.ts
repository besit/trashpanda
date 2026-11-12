// Mission 4, "Slow Down, Dog" (Parkside Drive):
//  Chase: two rats run off with the cut-down speed camera toward the park pond (it really happened).
//         Catch up and pump them until they drop it (M2.1: they have a health bar now); cones knock your
//         speed down. Too slow and they leap over the sidewalk into the pond.
//  Build: in the school zone, pump the three labelled stake sets to raise a speed hump, a raised crosswalk
//         (across the road) and a curb extension while SUV Rats speed through. Finished pieces slow cars.
import Phaser from 'phaser';
import { sfx } from '../audio/sfx';
import { puff, floatText, shake } from '../ui/fx';
import { STREET_Y } from '../ui/sideLayout';
import type { Hitbox } from './SidePlayer';
import type { SuvRat } from './SuvRat';

export interface ChaseDef { lead: number; speed: number; pondAt: number; cones: number[]; hp?: number }
export interface BuildDef { at: number; spots: number[]; suvs: number }

export class Chase {
  private rats: Phaser.GameObjects.Sprite[] = [];
  private cam: Phaser.GameObjects.Image;
  private bar: Phaser.GameObjects.Graphics;
  x: number;
  hp: number;
  readonly maxHp: number;
  state: 'run' | 'caught' | 'splash' = 'run';
  private tauntT = 2;
  private staggerT = 0;
  private lastHit = -1;
  private cones: { img: Phaser.GameObjects.Image; x: number; hit: boolean }[] = [];

  constructor(private scene: Phaser.Scene, private def: ChaseDef, startX: number, private groundY: number) {
    this.x = startX + def.lead;
    this.maxHp = def.hp ?? 8; this.hp = this.maxHp;
    for (let i = 0; i < 2; i++) this.rats.push(scene.add.sprite(0, groundY, 'chars', 'rat_basic_0').setOrigin(15 / 32, 31 / 32).setDepth(92).play('rat_basic_walk'));
    // the real camera, tipped over on its side and carried (same sprite as on the map + in the vignette)
    this.cam = scene.add.image(0, 0, 'world', 'speedcam').setOrigin(0.5, 0.5).setScale(2).setAngle(90).setDepth(93);
    this.bar = scene.add.graphics().setDepth(210);
    this.place(); // positioned from the first frame (they used to sit at x = 0 during the title card)
    for (const cx of def.cones) this.cones.push({ img: scene.add.image(cx, groundY + 1, 'world', 'cone').setOrigin(0.5, 1).setScale(2).setDepth(91), x: cx, hit: false });
    // the pond is IN THE PARK, behind the sidewalk
    const py = STREET_Y - 10, pcx = def.pondAt + 110;
    const g = scene.add.graphics().setDepth(3);
    g.fillStyle(0x2a6e38).fillEllipse(pcx, py, 240, 30);
    g.fillStyle(0x25529b).fillEllipse(pcx, py, 220, 22).fillStyle(0x3a88cf).fillEllipse(pcx - 10, py - 2, 160, 10);
    for (let i = 0; i < 20; i++) g.fillStyle(i % 2 ? 0x2a6e38 : 0x55a144).fillRect(pcx - 118 + i * 12, py - 14 + (i % 3) * 2, 2, 10);
    scene.add.bitmapText(pcx, py - 24, 'font_outline', 'GRENADIER POND').setOrigin(0.5).setDepth(4).setTint(0xcdefff);
  }

  get rearX() { return this.x - 26; }
  get distance() { return this.x; }
  get camImage() { return this.cam; }

  private place() {
    this.rats[0].setPosition(Math.round(this.x - 26), this.groundY); this.rats[1].setPosition(Math.round(this.x + 26), this.groundY);
    this.cam.setPosition(Math.round(this.x), Math.round(this.groundY - 24 + Math.sin(this.scene.time.now / 70) * 1.5));
  }

  update(dtMs: number, player: { x: number; body: Phaser.Physics.Arcade.Body; onGround: boolean }, hits: Hitbox[]): 'run' | 'caught' | 'splash' {
    if (this.state !== 'run') return this.state;
    const dt = dtMs / 1000;
    this.staggerT -= dt;
    const gap = this.rearX - player.x;
    const sp = this.staggerT > 0 ? this.def.speed * 0.35 : this.def.speed * (gap < 70 ? 1.05 : gap > 260 ? 0.85 : 1);
    this.x += sp * dt;
    this.place();
    // pump them: each hit staggers the pair; enough hits and they drop the camera
    for (const h of hits) {
      if (h.id === this.lastHit || h.x > this.x + 40 || h.x + h.w < this.x - 40) continue;
      this.lastHit = h.id; this.hp -= h.dmg; this.staggerT = 0.35;
      sfx.hit(); sfx.squeak(); puff(this.scene, this.x - 20, this.groundY - 16, 0xfff08a, 5, 16, 95);
      this.rats.forEach((r) => { r.setTintFill(0xffffff); this.scene.time.delayedCall(70, () => r.clearTint()); });
      break;
    }
    this.bar.clear();
    const bx = Math.round(this.x - 22), by = this.groundY - 52;
    this.bar.fillStyle(0x16121f).fillRect(bx - 1, by - 1, 46, 5).fillStyle(0x443f54).fillRect(bx, by, 44, 3).fillStyle(0xff6347).fillRect(bx, by, (44 * this.hp) / this.maxHp, 3);
    this.tauntT -= dt;
    if (this.tauntT <= 0) { floatText(this.scene, this.x, this.groundY - 62, Phaser.Utils.Array.GetRandom(['TAX GRAB! TAX GRAB!', 'TO THE POND!', 'SQUEAK! FASTER!', 'BOSS SAYS SPEED IS FREEDOM!']), 'font', 0xff6347, 500); this.tauntT = 2.4; }
    for (const c of this.cones) {
      if (c.hit || Math.abs(player.x - c.x) > 10 || !player.onGround) continue;
      c.hit = true; sfx.clang(); player.body.setVelocityX(-60);
      puff(this.scene, c.x, this.groundY - 6, 0xff9a2e, 6, 16, 95);
      this.scene.tweens.add({ targets: c.img, x: c.x + 50, angle: 200, alpha: 0, duration: 500 });
      floatText(this.scene, c.x, this.groundY - 40, 'BONK! JUMP THE CONES', 'font', 0xfff08a, 400);
    }
    if (this.hp <= 0) {
      this.state = 'caught'; this.bar.clear();
      sfx.squeak(); shake(this.scene, 150, 0.008);
      floatText(this.scene, this.x, this.groundY - 56, 'THEY DROPPED IT!', 'font_big', 0xffffff, 700);
      this.scene.tweens.add({ targets: this.cam, y: this.groundY - 8, angle: 96, duration: 300, ease: 'Bounce.easeOut' });
      this.rats.forEach((r) => r.destroy());
    } else if (this.x + 30 > this.def.pondAt) {
      // they leap from the street, over the sidewalk, into the pond in the park
      this.state = 'splash'; this.bar.clear();
      const tx = this.def.pondAt + 110, ty = STREET_Y - 12;
      for (const o of [this.cam, ...this.rats]) {
        this.scene.tweens.add({ targets: o, x: tx + (o === this.cam ? 0 : o === this.rats[0] ? -20 : 20), duration: 700, ease: 'Linear' });
        this.scene.tweens.add({ targets: o, y: ty - 40, duration: 350, ease: 'Quad.easeOut', yoyo: false, onComplete: () => this.scene.tweens.add({ targets: o, y: ty, alpha: 0, duration: 350, ease: 'Quad.easeIn' }) });
        o.setDepth(4);
      }
      this.scene.time.delayedCall(700, () => { sfx.splash(); for (let i = 0; i < 3; i++) this.scene.time.delayedCall(i * 120, () => puff(this.scene, tx, ty - 4, 0xcdefff, 10, 30, 5)); });
    }
    return this.state;
  }
}

const PIECES = [
  { key: 'humpside', name: 'SPEED HUMP', what: 'cars slow down to roll over it' },
  { key: 'raisedside', name: 'RAISED CROSSWALK', what: 'kids cross at sidewalk height' },
  { key: 'curbextside', name: 'CURB EXTENSION', what: 'a shorter crossing, a narrower road' },
] as const;

export class BuildSpots {
  private spots: { x: number; img: Phaser.GameObjects.Image; bar: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.BitmapText; hits: number; done: boolean; lastHit: number; piece?: Phaser.GameObjects.Image }[] = [];
  readonly need = 4;
  built = 0;

  constructor(private scene: Phaser.Scene, def: BuildDef, left: number, private groundY: number) {
    def.spots.forEach((dx, i) => {
      const x = left + dx;
      const img = scene.add.image(x, groundY + 2, 'world', 'buildspot').setOrigin(0.5, 0.92).setDepth(85);
      const bar = scene.add.graphics().setDepth(210);
      // say what each set of stakes becomes (M2.1: "not sure what the brown thing is")
      const label = scene.add.bitmapText(x, groundY - 50, 'font', PIECES[i % PIECES.length].name).setOrigin(0.5).setDepth(211).setTint(0xfff08a);
      this.spots.push({ x, img, bar, label, hits: 0, done: false, lastHit: -1 });
    });
  }

  get allDone() { return this.built >= this.spots.length; }

  /** the arena is over: no progress bars left on screen */
  finish() { for (const s of this.spots) s.bar.clear(); }

  update(hits: Hitbox[], cars: SuvRat[], playerX: number) {
    for (const [i, s] of this.spots.entries()) {
      s.bar.clear();
      if (!s.done) {
        const near = Math.abs(playerX - s.x) < 40;
        s.bar.fillStyle(0x16121f).fillRect(s.x - 13, this.groundY - 42, 26, 5).fillStyle(0xf5c22e).fillRect(s.x - 12, this.groundY - 41, (24 * s.hits) / this.need, 3);
        if (near) s.bar.fillStyle(0xfff08a).fillTriangle(s.x - 3, this.groundY - 36, s.x + 3, this.groundY - 36, s.x, this.groundY - 32);
        for (const h of hits) {
          if (h.id === s.lastHit || h.x > s.x + 18 || h.x + h.w < s.x - 18) continue;
          s.lastHit = h.id; s.hits += h.dmg > 1 ? 2 : 1;
          sfx.hammer(); puff(this.scene, s.x, this.groundY - 8, 0xc9c5d1, 4, 14, 90);
          if (s.hits >= this.need) {
            s.done = true; this.built++;
            s.bar.clear();
            const p = PIECES[i % PIECES.length];
            s.img.destroy();
            // each piece in its real place: the hump and the crossing span the whole road (M3.1: the hump used to
            // show its cross-section),
            // the curb extension bulging out of the sidewalk
            if (p.key === 'raisedside' || p.key === 'humpside') s.piece = this.scene.add.image(s.x, STREET_Y + 16, 'world', p.key).setOrigin(0.5, 0).setDepth(30);
            else s.piece = this.scene.add.image(s.x, STREET_Y + 30, 'world', p.key).setOrigin(0.5, 60 / 62).setDepth(31); // curb extension
            s.piece.setScale(0, 1);
            this.scene.tweens.add({ targets: s.piece, scaleX: 1, duration: 250, ease: 'Back.easeOut' });
            s.label.setText(p.name).setTint(0x9bd35a).setY(STREET_Y - 6 - (i % 2) * 11);
            sfx.ding(); shake(this.scene, 100, 0.004);
            floatText(this.scene, s.x, this.groundY - 64, p.what.toUpperCase(), 'font', 0x9bd35a, 1100);
          }
          break;
        }
      }
      if (s.done) for (const c of cars) if (c.alive && Math.abs(c.x - s.x) < 14) c.bump();
    }
  }
}
