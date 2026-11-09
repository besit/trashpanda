import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { InputManager } from '../input/InputManager';
import { TouchControls, wantsTouch } from '../input/TouchControls';
import { SidePlayer, SIDE, type Hitbox } from '../action/SidePlayer';
import { Rat, type RatKind } from '../action/Rat';
import { MISSIONS, type MissionDef } from '../data/missions';
import { ctx } from '../core/ctx';
import { text, iris, shake, hitStop, puff } from '../ui/fx';
import { music } from '../audio/Sequencer';
import { SONG_ACTION } from '../audio/songs';
import { sfx } from '../audio/sfx';

const GROUND_Y = 194;
const overlap = (a: { x: number; y: number; w: number; h: number }, b: Phaser.Geom.Rectangle) => a.x < b.right && a.x + a.w > b.x && a.y < b.bottom && a.y + a.h > b.y;

export class ActionScene extends Phaser.Scene {
  private input2!: InputManager;
  private touch?: TouchControls;
  private mission!: MissionDef;
  private player!: SidePlayer;
  private rats: Rat[] = [];
  private cones!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.Zone;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private layers: { ts: Phaser.GameObjects.TileSprite; f: number }[] = [];
  private waveIdx = 0;
  private locked = false;
  private worldW = 0;
  private hud!: { hearts: Phaser.GameObjects.Graphics; ratsLeft: Phaser.GameObjects.BitmapText; go: Phaser.GameObjects.BitmapText };
  private finished = false;
  private killed = 0;
  private waveStartKills = 0;
  private waveTotal = 0;

  constructor() { super('Action'); }

  create(data: { mission?: string }) {
    this.mission = MISSIONS[data?.mission ?? 'bike_lane_war'] ?? MISSIONS.bike_lane_war;
    this.rats = []; this.waveIdx = 0; this.locked = false; this.finished = false; this.killed = 0; this.layers = [];
    this.input2 = new InputManager(this);
    const a = this.mission.action;
    this.worldW = a.length + GAME_W;
    this.physics.world.gravity.y = SIDE.gravity;
    this.physics.world.setBounds(0, 0, this.worldW, GAME_H + 100);

    // parallax background
    const sky = a.sky;
    this.add.image(0, 0, `sky_${sky}`).setOrigin(0).setScrollFactor(0);
    const layer = (key: string, y: number, h: number, f: number, tint?: number) => {
      const ts = this.add.tileSprite(0, y, GAME_W, h, key).setOrigin(0).setScrollFactor(0);
      if (tint) ts.setTint(tint);
      this.layers.push({ ts, f });
    };
    layer(`skyline_${sky}`, 30, 170, 0.08);
    layer(`backrow_${sky}`, 96, 80, 0.3);
    layer('facades_qw', 72, 96, 0.7);
    layer('street_paint', 168, 64, 1.0);

    // ground + obstacles
    this.ground = this.add.zone(this.worldW / 2, GROUND_Y + 20, this.worldW, 40);
    this.physics.add.existing(this.ground, true);
    this.platforms = this.physics.add.staticGroup();
    // parked car to hop on + cones (the "ride" beat)
    const parked = [[480, 'carside_red'], [930, 'suvside']] as const;
    for (const [x, key] of parked) {
      const img = this.add.image(x, GROUND_Y + 2, 'world', key).setOrigin(0.5, 1).setDepth(50);
      const z = this.add.zone(x, GROUND_Y - img.height * 0.45, img.width - 10, 6);
      this.physics.add.existing(z, true);
      (z.body as Phaser.Physics.Arcade.StaticBody).checkCollision.down = false;
      (z.body as Phaser.Physics.Arcade.StaticBody).checkCollision.left = false;
      (z.body as Phaser.Physics.Arcade.StaticBody).checkCollision.right = false;
      this.platforms.add(z);
    }
    // "ANOTHER LANE" construction signage: Dog Fraud's work in progress
    for (const x of [200, 640, 1080]) {
      for (let i = 0; i < 3; i++) this.add.image(x + i * 14, GROUND_Y + 1, 'world', 'cone').setOrigin(0.5, 1).setDepth(40);
    }

    this.player = new SidePlayer(this, 60, GROUND_Y - 10);
    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cones = this.physics.add.group();
    this.physics.add.collider(this.cones, this.ground, (c) => {
      const cone = c as Phaser.Physics.Arcade.Image;
      if (!cone.getData('landed')) { cone.setData('landed', true); (cone.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0); sfx.clang(); this.tweens.add({ targets: cone, alpha: 0, delay: 1200, duration: 300, onComplete: () => cone.destroy() }); }
    });

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, GAME_H).setRoundPixels(true);
    cam.startFollow(this.player.sprite, true, 0.15, 0.1, -40, 0);

    this.buildHud();
    if (wantsTouch()) { this.touch = new TouchControls(this); this.touch.setLabel('act', 'HIT'); }
    music.play(SONG_ACTION);
    void this.intro();
    if (DEBUG) this.input.keyboard?.on('keydown-V', () => void this.win());
    (window as unknown as { __TP?: Record<string, unknown> }).__TP = { ...((window as unknown as { __TP?: Record<string, unknown> }).__TP ?? {}), scene: 'Action', player: this.player, rats: () => this.rats.filter((r) => r.alive).length, win: () => this.win() };
  }

  private async intro() {
    this.player.frozen = true;
    await iris(this, 'open', 80, GROUND_Y - 20, 500);
    const t1 = text(this, GAME_W / 2, 60, this.mission.title, 'font_big').setScrollFactor(0).setDepth(1000).setScale(0.1);
    this.tweens.add({ targets: t1, scale: 1, duration: 300, ease: 'Back.easeOut' });
    const t2 = text(this, GAME_W / 2, 84, this.mission.action.intro, 'font_outline').setScrollFactor(0).setDepth(1000);
    sfx.bell();
    await new Promise((r) => this.time.delayedCall(1700, r));
    t1.destroy(); t2.destroy();
    this.flashGo('RIDE!');
    this.player.frozen = false;
  }

  private flashGo(msg: string) {
    this.hud.go.setText(msg).setAlpha(1).setScale(1.5);
    this.tweens.add({ targets: this.hud.go, scale: 1, duration: 200 });
    this.tweens.add({ targets: this.hud.go, alpha: 0, delay: 900, duration: 300 });
  }

  private buildHud() {
    const hearts = this.add.graphics().setScrollFactor(0).setDepth(2000);
    const ratsLeft = text(this, GAME_W - 6, 6, '', 'font_outline', 0).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);
    const go = text(this, GAME_W / 2, 70, '', 'font_big').setScrollFactor(0).setDepth(2000).setAlpha(0);
    this.hud = { hearts, ratsLeft, go };
  }

  private drawHud() {
    const g = this.hud.hearts;
    g.clear();
    for (let i = 0; i < SIDE.maxHp; i++) {
      const x = 8 + i * 12, y = 8, full = i < this.player.hp;
      g.fillStyle(0x16121f).fillRect(x - 1, y - 1, 11, 10);
      g.fillStyle(full ? 0xd42a24 : 0x443f54);
      g.fillRect(x, y + 1, 9, 4).fillRect(x + 1, y, 3, 1).fillRect(x + 5, y, 3, 1).fillRect(x + 1, y + 5, 7, 1).fillRect(x + 2, y + 6, 5, 1).fillRect(x + 3, y + 7, 3, 1);
      if (full) g.fillStyle(0xff6347).fillRect(x + 1, y + 1, 2, 1);
    }
    // stamina
    g.fillStyle(0x16121f).fillRect(7, 20, 52, 4).fillStyle(this.player.stamina > 35 ? 0xf5c22e : 0xd42a24).fillRect(8, 21, (50 * this.player.stamina) / 100, 2);
    const alive = this.rats.filter((r) => r.alive).length;
    this.hud.ratsLeft.setText(this.locked ? `RATS ${alive}` : `RATS DEFEATED ${this.killed}`);
  }

  private spawnWave(i: number) {
    const w = this.mission.action.waves[i];
    const cam = this.cameras.main;
    this.locked = true;
    this.waveStartKills = this.killed;
    this.waveTotal = w.rats.length;
    cam.stopFollow();
    const left = Phaser.Math.Clamp(this.player.sprite.x - 120, 0, this.worldW - GAME_W);
    this.tweens.add({ targets: cam, scrollX: left, duration: 300, ease: 'Sine.easeOut' });
    cam.setBounds(left, 0, GAME_W, GAME_H);
    this.physics.world.setBounds(left, 0, GAME_W, GAME_H + 100);
    this.player.body.setCollideWorldBounds(true);
    w.rats.forEach((k, j) => {
      const fromRight = j % 2 === 0;
      this.time.delayedCall(j * 450, () => this.spawnRat(k, fromRight ? left + GAME_W + 10 : left - 10));
    });
    this.flashGo('RATS!');
    sfx.squeak();
  }

  private spawnRat(kind: RatKind, x: number) {
    const r = new Rat(this, x, GROUND_Y - 30, kind, (rat) => this.throwCone(rat));
    this.physics.add.collider(r.sprite, this.ground);
    this.rats.push(r);
  }

  private throwCone(r: Rat) {
    const c = this.cones.create(r.sprite.x, r.sprite.y - 26, 'world', 'cone') as Phaser.Physics.Arcade.Image;
    c.setDepth(95);
    const dx = this.player.sprite.x - r.sprite.x;
    const tFlight = 0.75;
    (c.body as Phaser.Physics.Arcade.Body).setVelocity(dx / tFlight, -0.5 * SIDE.gravity * tFlight + 30).setSize(8, 8);
    this.tweens.add({ targets: c, angle: 360 * Math.sign(dx), duration: 600, repeat: 1 });
  }

  private unlock() {
    this.locked = false;
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, GAME_H);
    this.physics.world.setBounds(0, 0, this.worldW, GAME_H + 100);
    cam.startFollow(this.player.sprite, true, 0.15, 0.1, -40, 0);
    this.flashGo('GO! >>');
    sfx.ding();
  }

  private async win() {
    if (this.finished) return;
    this.finished = true;
    this.player.frozen = true;
    music.stop();
    sfx.ding();
    const t = text(this, GAME_W / 2, 70, 'STREET CLEARED!', 'font_big').setScrollFactor(0).setDepth(3000).setScale(0.1);
    this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.easeOut' });
    text(this, GAME_W / 2, 92, `RATS DEFEATED: ${this.killed}`, 'font_outline').setScrollFactor(0).setDepth(3000);
    ctx.state.ratsDefeated += this.killed;
    await new Promise((r) => this.time.delayedCall(2000, r));
    await iris(this, 'close', this.player.sprite.x - this.cameras.main.scrollX, this.player.sprite.y - 16, 500);
    this.physics.world.gravity.y = 0;
    this.scene.start('Explore', { from: 'mission', missionId: this.mission.id, won: true });
  }

  private async lose() {
    if (this.finished) return;
    this.finished = true;
    music.stop();
    const t = text(this, GAME_W / 2, 80, 'BONK! TRY AGAIN', 'font_red').setScrollFactor(0).setDepth(3000);
    void t;
    await new Promise((r) => this.time.delayedCall(1600, r));
    await iris(this, 'close');
    this.scene.restart({ mission: this.mission.id });
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.player.update(this.input2, dt);
    const cam = this.cameras.main;
    for (const l of this.layers) l.ts.tilePositionX = cam.scrollX * l.f;

    // waves
    const waves = this.mission.action.waves;
    if (!this.locked && this.waveIdx < waves.length && this.player.sprite.x > waves[this.waveIdx].at) { this.spawnWave(this.waveIdx); this.waveIdx++; }

    const pb = this.player.body;
    const pRect = new Phaser.Geom.Rectangle(pb.x, pb.y, pb.width, pb.height);
    const hits: Hitbox[] = [];
    const ab = this.player.attackBox(); if (ab) hits.push(ab);
    const db = this.player.dashBox(); if (db) hits.push(db);

    for (const r of this.rats) {
      r.update(dt, this.player.sprite.x);
      if (!r.alive) continue;
      const rb = r.body, rRect = new Phaser.Geom.Rectangle(rb.x, rb.y, rb.width, rb.height);
      let wasHit = false;
      for (const h of hits) if (overlap(h, rRect) && r.takeHit(h, this.player.sprite.x)) {
        wasHit = true;
        hitStop(this, h.dmg > 1 ? 90 : 50); shake(this, 90, h.dmg > 1 ? 0.008 : 0.004);
        if (!r.alive) { this.killed++; }
      }
      // stomp
      if (!wasHit && pb.velocity.y > 60 && pRect.bottom < rRect.y + 10 && overlap({ x: pRect.x, y: pRect.y, w: pRect.width, h: pRect.height }, rRect)) {
        if (r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 60, id: 5000 + Math.floor(this.time.now / 200) }, this.player.sprite.x)) { this.player.bounce(); hitStop(this, 50); if (!r.alive) this.killed++; }
        continue;
      }
      const rab = r.attackBox();
      if (rab && overlap(rab, pRect) && this.player.hurt(r.sprite.x)) { shake(this, 150, 0.01); hitStop(this, 80); }
    }
    this.rats = this.rats.filter((r) => r.alive || r.sprite.active);

    // thrown cones
    for (const c of this.cones.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (c.getData('landed')) continue;
      const cb = c.body as Phaser.Physics.Arcade.Body, cRect = new Phaser.Geom.Rectangle(cb.x, cb.y, cb.width, cb.height);
      if (hits.some((h) => overlap(h, cRect))) { sfx.clang(); puff(this, c.x, c.y, 0xff9a2e, 6, 14, 96); c.destroy(); continue; }
      if (Phaser.Geom.Rectangle.Overlaps(cRect, pRect) && this.player.hurt(c.x)) { shake(this, 120, 0.008); c.destroy(); }
    }

    // wave cleared when every rat of the wave has spawned and been defeated
    if (this.locked && this.killed - this.waveStartKills >= this.waveTotal) this.unlock();
    if (!this.locked && this.waveIdx >= waves.length && this.player.sprite.x > this.worldW - GAME_W / 2 - 20) void this.win();
    if (this.player.dead) void this.lose();
    if (this.player.sprite.y > GAME_H + 40) { this.player.hp = 0; this.player.dead = true; }
    this.drawHud();
  }

}
