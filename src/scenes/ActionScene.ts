// Side-view missions. One host scene; each mission composes beats from data (src/data/missions.ts):
// ride sections, arena waves (rats + SUV Rats), a boss, the streetcar escort, the camera chase and the
// build-the-street arena. The arena lock never jumps the camera, and the release eases back into follow.
import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { InputManager } from '../input/InputManager';
import { TouchControls, wantsTouch } from '../input/TouchControls';
import { SidePlayer, SIDE, type Hitbox } from '../action/SidePlayer';
import { Rat, type RatKind } from '../action/Rat';
import { SuvRat } from '../action/SuvRat';
import { Boss } from '../action/Boss';
import { Escort } from '../action/Escort';
import { Peloton, LaneEater } from '../action/LaneEater';
import { DepaveSpots, MonsterSuv } from '../action/ParkingLot';
import { Chase, BuildSpots } from '../action/Parkside';
import { MISSIONS, type MissionDef } from '../data/missions';
import { ctx } from '../core/ctx';
import { START_LIVES } from '../core/GameState';
import { text, iris, shake, hitStop, puff, floatText, fitText } from '../ui/fx';
import { openPause } from './PauseScene';
import { ScrollLayer, STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { music } from '../audio/Sequencer';
import { SONG_ACTION } from '../audio/songs';
import { sfx } from '../audio/sfx';

const overlap = (a: { x: number; y: number; w: number; h: number }, b: Phaser.Geom.Rectangle) => a.x < b.right && a.x + a.w > b.x && a.y < b.bottom && a.y + a.h > b.y;

type Lock = { kind: 'wave' | 'boss' | 'build' | 'caught' | 'depave'; left: number; startKills: number; total: number; suvsLeft: number; suvT: number };

export class ActionScene extends Phaser.Scene {
  private input2!: InputManager;
  private touch?: TouchControls;
  private mission!: MissionDef;
  private player!: SidePlayer;
  private rats: Rat[] = [];
  private cars: SuvRat[] = [];
  private boss?: Boss;
  private dogFraud?: Phaser.GameObjects.Image;
  private peloton?: Peloton;
  private depave?: DepaveSpots;
  private lobbyTip = false;
  private depaveDone = false;
  private monster?: MonsterSuv;
  private eater?: LaneEater;
  private scrolling = false;
  private ambushIdx = 0;
  private lowHpT = 0;
  private escort?: Escort;
  private chase?: Chase;
  private build?: BuildSpots;
  private cones!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.Zone;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private layers: ScrollLayer[] = [];
  private waveIdx = 0;
  private lock: Lock | null = null;
  private bossDone = false;
  private buildDone = false;
  private chaseDone = false;
  private worldW = 0;
  private groundY = GROUND_Y;
  private hud!: { g: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.BitmapText; go: Phaser.GameObjects.BitmapText };
  private finished = false;
  private killed = 0;
  private usedHits = new Set<number>();

  constructor() { super('Action'); }

  create(data: { mission?: string }) {
    this.mission = MISSIONS[data?.mission ?? 'bike_lane_war'] ?? MISSIONS.bike_lane_war;
    this.rats = []; this.cars = []; this.boss = undefined; this.escort = undefined; this.chase = undefined; this.build = undefined;
    this.waveIdx = 0; this.lock = null; this.finished = false; this.killed = 0; this.layers = []; this.usedHits.clear();
    this.bossDone = false; this.buildDone = false; this.chaseDone = false;
    this.input2 = new InputManager(this);
    const a = this.mission.action;
    this.groundY = a.groundY ?? GROUND_Y;
    this.worldW = a.length + GAME_W;
    this.physics.world.gravity.y = SIDE.gravity;
    this.physics.world.setBounds(0, 0, this.worldW, GAME_H + 100);

    this.buildBackground();

    // ground + obstacles
    this.ground = this.add.zone(this.worldW / 2, this.groundY + 20, this.worldW, 40);
    this.physics.add.existing(this.ground, true);
    this.platforms = this.physics.add.staticGroup();
    if (a.bg === 'queen' && a.street === 'plain') this.queenDecor();

    this.player = new SidePlayer(this, 60, this.groundY - 10);
    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cones = this.physics.add.group();
    // NB: Phaser passes (sprite, groupChild) to the callback when a group collides with a single object,
    // regardless of argument order, so resolve the cone explicitly (the M0 freeze).
    this.physics.add.collider(this.cones, this.ground, (o1, o2) => {
      const cone = (o1 === this.ground ? o2 : o1) as Phaser.Physics.Arcade.Image;
      if (!cone.active || !cone.body) return;
      if (!cone.getData('landed')) { cone.setData('landed', true); (cone.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0); sfx.clang(); this.tweens.add({ targets: cone, alpha: 0, delay: 1200, duration: 300, onComplete: () => cone.destroy() }); }
    });

    if (a.escort) this.escort = new Escort(this, a.escort, -30);
    this.peloton = undefined; this.eater = undefined; this.scrolling = false; this.ambushIdx = 0;
    this.depave = undefined; this.depaveDone = false; this.monster = undefined;
    if (a.autoscroll) {
      this.peloton = new Peloton(this, a.autoscroll.riders, this.groundY);
      this.eater = new LaneEater(this, -180, this.groundY);
      this.scrolling = true;
    }
    if (a.chase) this.chase = new Chase(this, a.chase, 60, this.groundY);
    if (a.build) this.add.image(a.build.at + 60, STREET_Y, 'school_side').setOrigin(0, 1).setDepth(2);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, GAME_H).setRoundPixels(true);
    if (a.autoscroll) this.player.shield = () => !!this.peloton?.absorb();
    else cam.startFollow(this.player.sprite, true, 0.15, 0.1, -40, 0);

    this.buildHud();
    if (wantsTouch()) { this.touch = new TouchControls(this); this.touch.setLabel('act', 'PUMP'); }
    this.scale.on('resize', this.layoutHud, this);
    this.events.on('resume', () => this.input2.swallow());
    this.events.once('shutdown', () => this.scale.off('resize', this.layoutHud, this));
    music.play(SONG_ACTION);
    void this.intro();
    if (DEBUG) this.input.keyboard?.on('keydown-V', () => void this.win());
    const w = window as unknown as { __TP?: Record<string, unknown> };
    w.__TP = { ...(w.__TP ?? {}), scene: 'Action', mission: this.mission.id, player: this.player,
      /** debug: jump to a point on the street, marking the beats before it as done */
      skipTo: (x: number) => {
        const a2 = this.mission.action;
        while (this.waveIdx < a2.waves.length && a2.waves[this.waveIdx].at < x) this.waveIdx++;
        if (a2.chase && x > a2.chase.pondAt - 200) { this.chaseDone = true; this.chase?.camImage.setVisible(false); }
        this.player.body.reset(x, this.groundY - 10);
      }, rats: () => this.rats.filter((r) => r.alive).length, win: () => this.win(), boss: () => this.boss, eaterObj: () => this.eater, gy: () => this.groundY,
      state: () => (!this.sys.isActive() ? { finished: true } : { x: this.player.sprite.x, frozen: this.player.frozen, hp: this.player.hp,
        rats: this.rats.filter((r) => r.alive).map((r) => Math.round(r.sprite.x)), carsAt: this.cars.filter((c) => c.alive && !c.tame).map((c) => [Math.round(c.x), c.dir]), bossX: this.boss?.alive ? Math.round(this.boss.sprite.x) : this.monster?.alive ? Math.round(this.monster.x) : null, depaved: this.depave?.done ?? null, spots: this.depave?.openSpots ?? null, monsterStalled: this.monster?.stalled ?? null,
        front: this.escort ? Math.round(this.escort.front) : null, scrolling: this.scrolling, peloton: this.peloton?.size ?? null, eater: this.eater ? { x: Math.round(this.eater.x), boss: this.eater.boss, hp: this.eater.totalHp, hot: this.eater.hot } : null, haul: this.chase ? Math.round(this.chase.rearX) : null, lock: this.lock?.kind ?? null, wave: this.waveIdx, boss: this.boss ? this.boss.hp : null, escort: this.escort ? { car: Math.round(this.escort.car.x), delay: +this.escort.delay.toFixed(1), done: this.escort.done } : null, chase: this.chase?.state ?? null, built: this.build?.built ?? null, cars: this.cars.filter((c) => c.alive).length, finished: this.finished, camX: Math.round(this.cameras.main.scrollX) }) };
  }

  private buildBackground() {
    const a = this.mission.action, sky = a.sky;
    const layer = (key: string, y: number, f: number) => this.layers.push(new ScrollLayer(this, key, y, f));
    layer(`sky_${sky}`, 0, 0);
    layer(`skyline_${sky}`, SKYLINE_Y, 0.08);
    // the front row (buildings or park) and the sidewalk scroll together as one plane (Ivan, M1.1)
    if (a.bg === 'king') layer('facades_dt', FRONT_Y.king, 1.0);
    else if (a.bg === 'parkside') layer('park_hp', FRONT_Y.parkside, 1.0);
    else if (a.bg === 'bigbox') layer('bigbox_ee', STREET_Y - 120, 1.0);
    else if (a.bg === 'lake') layer('lake_wf', STREET_Y - 120, 1.0);
    else { layer(`backrow_${sky}`, BACKROW_Y, 0.3); layer('facades_qw', FRONT_Y.queen, 1.0); }
    layer(`street_${a.street}`, STREET_Y, 1.0);
  }

  private queenDecor() {
    // parked cars to hop on + Dog Fraud's "ANOTHER CAR LANE" cones (the ride beat)
    for (const [x, key] of [[480, 'carside_red'], [930, 'suvside']] as const) {
      const img = this.add.image(x, this.groundY + 2, 'world', key).setOrigin(0.5, 1).setDepth(50);
      const z = this.add.zone(x, this.groundY - img.height * 0.45, img.width - 10, 6);
      this.physics.add.existing(z, true);
      const b = z.body as Phaser.Physics.Arcade.StaticBody;
      b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false;
      this.platforms.add(z);
    }
    for (const x of [200, 640, 1080]) for (let i = 0; i < 3; i++) this.add.image(x + i * 14, this.groundY + 1, 'world', 'cone').setOrigin(0.5, 1).setDepth(40);
  }

  private async intro() {
    this.player.frozen = true;
    await iris(this, 'open', 80, this.groundY - 20, 500);
    const a = this.mission.action;
    const t1 = text(this, GAME_W / 2, 56, this.mission.title, 'font_big').setScrollFactor(0).setDepth(1000);
    const s1 = fitText(t1, GAME_W - 16); t1.setScale(0.1);
    this.tweens.add({ targets: t1, scale: s1, duration: 300, ease: 'Back.easeOut' });
    const t2 = fitText(text(this, GAME_W / 2, 80, a.intro, 'font_outline').setScrollFactor(0).setDepth(1000), GAME_W - 16, true);
    const hint = a.hint ? (wantsTouch() ? a.hint[1] : a.hint[0]) : wantsTouch() ? 'RED: PUMP   BLUE: DASH   GREEN: JUMP' : 'E: PUMP (3-HIT COMBO)   Q: DASH   SPACE: JUMP';
    const t3 = fitText(text(this, GAME_W / 2, 80 + t2.height + 8, hint, 'font').setScrollFactor(0).setDepth(1000).setTint(0xfff08a), GAME_W - 16, true);
    sfx.bell();
    await new Promise((r) => this.time.delayedCall(2600, r));
    t1.destroy(); t2.destroy(); t3.destroy();
    this.flashGo(this.chase ? 'AFTER THEM!' : 'RIDE!');
    this.player.frozen = false;
  }

  private flashGo(msg: string) {
    this.hud.go.setText(msg).setScale(1);
    const s = fitText(this.hud.go, GAME_W - 16);
    this.hud.go.setAlpha(1).setScale(s * 1.5);
    this.tweens.add({ targets: this.hud.go, scale: s, duration: 200 });
    this.tweens.add({ targets: this.hud.go, alpha: 0, delay: 900, duration: 300 });
  }

  private buildHud() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(2000);
    const label = text(this, GAME_W / 2, 6, '', 'font_outline', 0).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2000);
    const go = text(this, GAME_W / 2, 70, '', 'font_big').setScrollFactor(0).setDepth(2000).setAlpha(0);
    this.hud = { g, label, go };
  }

  private layoutHud() {
    this.hud.label.setX(GAME_W / 2); this.hud.go.setX(GAME_W / 2);
    for (const l of this.layers) l.refit();
    if (wantsTouch() && window.innerHeight > window.innerWidth && !this.finished) openPause(this);
  }

  private drawHud() {
    const g = this.hud.g;
    g.clear();
    const a = this.mission.action;
    if (!a.noCombat) {
      // hearts: the last one blinks when you're one hit from losing a life
      const blink = this.player.hp === 1 && Math.floor(this.time.now / 180) % 2 === 0;
      for (let i = 0; i < SIDE.maxHp; i++) {
        const x = 8 + i * 12, y = 8, full = i < this.player.hp;
        g.fillStyle(0x16121f).fillRect(x - 1, y - 1, 11, 10);
        g.fillStyle(full ? (blink ? 0xfff08a : 0xd42a24) : 0x443f54);
        g.fillRect(x, y + 1, 9, 4).fillRect(x + 1, y, 3, 1).fillRect(x + 5, y, 3, 1).fillRect(x + 1, y + 5, 7, 1).fillRect(x + 2, y + 6, 5, 1).fillRect(x + 3, y + 7, 3, 1);
        if (full) g.fillStyle(0xff6347).fillRect(x + 1, y + 1, 2, 1);
      }
      // lives: raccoon tokens (lose all hearts = lose a life and restart the mission)
      for (let i = 0; i < Math.min(ctx.state.lives, 9); i++) {
        const x = 9 + i * 8, y = 20;
        g.fillStyle(0x16121f).fillCircle(x + 3, y + 3, 4).fillStyle(0xf5c22e).fillCircle(x + 3, y + 3, 3).fillStyle(0x2a2536).fillRect(x + 1, y + 2, 5, 1).fillStyle(0xf6f2e9).fillRect(x + 2, y + 2, 1, 1).fillRect(x + 4, y + 2, 1, 1);
      }
    }
    // stamina
    const sy = a.noCombat ? 8 : 30;
    g.fillStyle(0x16121f).fillRect(7, sy, 52, 4).fillStyle(this.player.stamina > 35 ? 0xf5c22e : 0xd42a24).fillRect(8, sy + 1, (50 * this.player.stamina) / 100, 2);
    const alive = this.rats.filter((r) => r.alive).length + this.cars.filter((c) => c.alive).length;
    if (this.escort) {
      // the schedule: how much delay the 501 can still absorb
      const w = 120, x = GAME_W / 2 - w / 2, v = this.escort.onTime;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(v > 0.5 ? 0x9bd35a : v > 0.25 ? 0xf5c22e : 0xd42a24).fillRect(x, 18, w * v, 5);
      this.hud.label.setText(this.escort.v < 6 && this.escort.delay > 0 ? '501: DELAYED!' : '501 QUEEN: ON TIME');
      this.escort.drawStrip(g, this.player.sprite.x);
    } else if (this.monster?.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0xd42a24).fillRect(x, 18, (w * this.monster.hp) / this.monster.maxHp, 5);
      this.hud.label.setText(this.monster.title);
    } else if (this.lock?.kind === 'depave') {
      this.hud.label.setText(`${this.depave?.verb ?? 'DEPAVED'} ${this.depave?.done ?? 0}/${this.depave?.total ?? 0}   RATS ${this.rats.filter((r) => r.alive).length}`);
    } else if (this.eater?.boss && this.eater.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0xf5c22e).fillRect(x, 18, (w * this.eater.totalHp) / this.eater.maxHp, 5);
      this.hud.label.setText(`THE LANE EATER   PELOTON ${this.peloton?.size ?? 0}`);
    } else if (this.scrolling) {
      const togo = Math.max(0, Math.round((this.mission.action.autoscroll!.end - this.cameras.main.scrollX - GAME_W) / 10));
      this.hud.label.setText(`PELOTON ${this.peloton?.size ?? 0}   ${togo}M TO GO`);
    } else if (this.boss?.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0x7d47a8).fillRect(x, 18, (w * this.boss.hp) / this.boss.maxHp, 5);
      this.hud.label.setText(this.boss.title);
    } else if (this.chase && this.chase.state === 'run') {
      const gap = Math.max(0, Math.round((this.chase.rearX - this.player.sprite.x) / 10));
      const toPond = Math.max(0, Math.round((this.mission.action.chase!.pondAt - this.chase.x) / 10));
      this.hud.label.setText(`GAP ${gap}M   POND IN ${toPond}M`);
    } else if (this.lock?.kind === 'build') this.hud.label.setText(`BUILT ${this.build?.built ?? 0}/3   RATS ${alive}`);
    else this.hud.label.setText(this.lock ? `RATS ${alive}` : `RATS DEFEATED ${this.killed}`);
  }

  // ---------------- arena lock ----------------
  private lockArena(kind: Lock['kind'], total: number, suvs = 0): Lock {
    const cam = this.cameras.main;
    cam.stopFollow();
    // lock exactly where the camera already is: no jump
    const left = Phaser.Math.Clamp(Math.round(cam.scrollX), 0, this.worldW - GAME_W);
    cam.setScroll(left, cam.scrollY);
    cam.setBounds(left, 0, GAME_W, GAME_H);
    this.physics.world.setBounds(left, 0, GAME_W, GAME_H + 100);
    this.player.body.setCollideWorldBounds(true);
    this.lock = { kind, left, startKills: this.killed, total, suvsLeft: suvs, suvT: 0.8 };
    return this.lock;
  }

  /** an arena beat is over: the mission ends if it was the last one, otherwise ride on */
  private endArena(msg = 'GO! >>') {
    this.lock = null;
    if (this.allBeatsDone()) { this.time.delayedCall(700, () => void this.win()); return; }
    this.unlock(msg);
  }

  private unlock(msg = 'GO! >>') {
    this.lock = null;
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, GAME_H);
    this.physics.world.setBounds(0, 0, this.worldW, GAME_H + 100);
    // Phaser's startFollow snaps the camera onto the target immediately (the M1.1 "jump on unlock"),
    // so keep the current scroll and ease the lerp in from near-zero.
    const sx = cam.scrollX, sy = cam.scrollY;
    cam.startFollow(this.player.sprite, true, 0.01, 0.1, -40, 0);
    cam.setScroll(sx, sy);
    this.tweens.add({ targets: cam.lerp, x: 0.15, duration: 1400, ease: 'Sine.easeIn' });
    this.flashGo(msg);
    sfx.ding();
  }

  private spawnRats(list: RatKind[], left: number) {
    list.forEach((k, j) => {
      const fromRight = j % 2 === 0;
      this.time.delayedCall(j * 450, () => this.spawnRat(k, fromRight ? left + GAME_W + 10 : left - 10));
    });
  }

  private spawnWave(i: number) {
    const w = this.mission.action.waves[i];
    const l = this.lockArena('wave', w.rats.length + (w.suvs ?? 0), w.suvs ?? 0);
    this.spawnRats(w.rats, l.left);
    this.flashGo(w.suvs && !w.rats.length ? 'THROUGH TRAFFIC!' : 'RATS!');
    sfx.squeak();
  }

  private spawnRat(kind: RatKind, x: number) {
    const r = new Rat(this, x, this.groundY - 30, kind, (rat) => this.throwCone(rat));
    if (kind === 'lobbyist' && !this.lobbyTip) {
      this.lobbyTip = true;
      const t = floatText(this, this.cameras.main.scrollX + GAME_W / 2, 100, 'LOBBYIST! RATS NEAR HIM TAKE HALF DAMAGE.\nCORNER HIM FIRST!', 'font_outline', 0xf5c22e, 2600);
      t.setScrollFactor(0).setX(GAME_W / 2);
    }
    this.physics.add.collider(r.sprite, this.ground);
    this.rats.push(r);
  }

  private spawnCar(lock: Lock) {
    const fromRight = lock.suvsLeft % 2 === 1 || Math.random() < 0.5;
    const x = fromRight ? lock.left + GAME_W + 40 : lock.left - 40;
    const car = new SuvRat(this, x, this.groundY, fromRight ? -1 : 1, lock.kind === 'build' ? 175 : 150, lock.kind === 'build' ? 2 : 3);
    this.cars.push(car);
    lock.suvsLeft--;
    floatText(this, Phaser.Math.Clamp(x, lock.left + 40, lock.left + GAME_W - 40), this.groundY - 64, 'HONK!', 'font_red', 0xffffff, 300);
  }

  private throwCone(r: Rat) {
    const c = this.cones.create(r.sprite.x, r.sprite.y - 26, 'world', 'cone') as Phaser.Physics.Arcade.Image;
    c.setDepth(95);
    const dx = this.player.sprite.x - r.sprite.x;
    const tFlight = 0.75;
    (c.body as Phaser.Physics.Arcade.Body).setVelocity(dx / tFlight, -0.5 * SIDE.gravity * tFlight + 30).setSize(8, 8);
    this.tweens.add({ targets: c, angle: 360 * Math.sign(dx), duration: 600, repeat: 1 });
  }

  private startBoss() {
    const l = this.lockArena('boss', 0);
    const bk = this.mission.action.boss?.kind;
    const kind = bk === 'foreman' ? 'foreman' : 'bureaucrat';
    if (kind === 'bureaucrat') {
      // Dog Fraud watches from his podium on the sidewalk (Ivan: "where was Dog Fraud?")
      this.dogFraud = this.add.image(l.left + 70, STREET_Y + 10, 'chars', 'dfs_pod').setOrigin(0.5, 0.97).setDepth(20);
      this.time.delayedCall(400, () => { if (this.dogFraud) { floatText(this, l.left + GAME_W / 2, this.dogFraud.y - 84, 'GET HIM, PAPERWORK!', 'font_red', 0xffffff, 1400); sfx.laugh(); this.dogFraud.setFrame('dfs_podlaugh'); this.time.delayedCall(1500, () => this.dogFraud?.setFrame('dfs_pod')); } });
    }
    this.boss = new Boss(this, l.left + GAME_W - 90, this.groundY, {
      summon: (x) => { this.spawnRat('basic', Math.min(l.left + GAME_W + 10, x + 120)); this.time.delayedCall(400, () => this.spawnRat('basic', l.left - 10)); },
      clerksAlive: () => this.rats.filter((r) => r.alive).length,
      hurtPlayer: (fx) => { if (this.player.hurt(fx)) { shake(this, 140, 0.01); hitStop(this, 70); } },
    }, kind);
    this.physics.add.collider(this.boss.sprite, this.ground);
    this.flashGo('BOSS!');
    music.play(SONG_ACTION);
  }

  private startBuild() {
    const b = this.mission.action.build!;
    const l = this.lockArena('build', b.rats.length + b.suvs, b.suvs);
    this.build = new BuildSpots(this, b, l.left, this.groundY);
    this.spawnRats(b.rats, l.left);
    this.flashGo('BUILD IT!');
    floatText(this, l.left + GAME_W / 2, 110, 'PUMP THE STAKES TO BUILD', 'font_outline', 0xfff08a, 1600).setScrollFactor(0);
  }

  private async win() {
    if (this.finished) return;
    this.finished = true;
    this.player.frozen = true;
    music.stop();
    sfx.ding();
    const a = this.mission.action;
    const head = a.escort ? 'RIGHT ON TIME!' : a.build ? 'SCHOOL ZONE SLOWED!' : a.autoscroll ? 'BLOOR IS SAFE!' : a.depave?.style === 'fence' ? 'THE SHORE IS PUBLIC!' : a.depave ? 'THE LOT IS GREEN!' : 'STREET CLEARED!';
    const t = text(this, GAME_W / 2, 66, head, 'font_big').setScrollFactor(0).setDepth(3000);
    const ts = fitText(t, GAME_W - 16); t.setScale(0.1);
    this.tweens.add({ targets: t, scale: ts, duration: 300, ease: 'Back.easeOut' });
    const sub = this.escort ? `DELAY: ${this.escort.delay.toFixed(1)} S\nCLEARED: ${this.escort.cleared}` : this.peloton ? `RIDERS RALLIED: ${this.peloton.joinedTotal}\nRATS DEFEATED: ${this.killed}` : `RATS DEFEATED: ${this.killed}`;
    if (this.peloton) ctx.state.ridersRallied += this.peloton.joinedTotal;
    fitText(text(this, GAME_W / 2, 92, sub, 'font_outline').setScrollFactor(0).setDepth(3000).setCenterAlign(), GAME_W - 16, true);
    ctx.state.ratsDefeated += this.killed + (this.escort?.cleared ?? 0);
    await new Promise((r) => this.time.delayedCall(2000, r));
    await iris(this, 'close', this.player.sprite.x - this.cameras.main.scrollX, this.player.sprite.y - 16, 500);
    this.physics.world.gravity.y = 0;
    ctx.save();
    const next = { from: 'mission', missionId: this.mission.id, won: true, district: this.mission.district };
    if (this.mission.debrief) this.scene.start('Cutscene', { id: this.mission.debrief, next: 'Explore', nextData: next });
    else this.scene.start('Explore', next);
  }

  /**
   * M2.1 (Ivan): losing all hearts costs a LIFE and restarts the mission; out of lives sends you back to
   * the map (lives refilled). Failing an objective (the streetcar is late, the camera hits the pond)
   * just restarts, no life lost.
   */
  private async lose(msg = 'BONK!', costsLife = true) {
    if (this.finished) return;
    this.finished = true;
    music.stop();
    this.player.frozen = true;
    if (costsLife) ctx.state.lives = Math.max(0, ctx.state.lives - 1);
    const out = costsLife && ctx.state.lives <= 0;
    fitText(text(this, GAME_W / 2, 70, out ? 'OUT OF LIVES!' : msg, 'font_big').setScrollFactor(0).setDepth(3000).setTint(0xff6347), GAME_W - 16);
    const sub = out ? 'BACK TO THE MAP TO REGROUP' : costsLife ? `-1 LIFE   LIVES LEFT: ${ctx.state.lives}` : 'TRY AGAIN';
    fitText(text(this, GAME_W / 2, 96, sub, 'font_outline').setScrollFactor(0).setDepth(3000), GAME_W - 16, true);
    if (costsLife) { sfx.hurt(); shake(this, 300, 0.01); }
    if (out) ctx.state.lives = START_LIVES;
    ctx.save();
    await new Promise((r) => this.time.delayedCall(2200, r));
    await iris(this, 'close');
    if (out) { this.physics.world.gravity.y = 0; this.scene.start('Explore', { district: this.mission.district }); }
    else this.scene.restart({ mission: this.mission.id });
  }

  /** every beat of the mission is done: the mission ends right away (Ivan: no riding past the boss) */
  private allBeatsDone() {
    const a = this.mission.action;
    return this.waveIdx >= a.waves.length && (!a.boss || this.bossDone) && (!a.depave || this.depaveDone) && (!a.build || this.buildDone) && (!a.chase || this.chaseDone) && !a.escort && !this.lock;
  }

  update(_t: number, dt: number) {
    this.input2.update();
    if (!this.finished && this.input2.justPressed('pause')) { openPause(this); return; }
    this.player.update(this.input2, dt);
    const cam = this.cameras.main;
    for (const l of this.layers) l.update(cam.scrollX);
    const a = this.mission.action;
    const px = this.player.sprite.x;

    const pb = this.player.body;
    const pRect = new Phaser.Geom.Rectangle(pb.x, pb.y, pb.width, pb.height);
    const hits: Hitbox[] = [];
    const ab = this.player.attackBox(); if (ab) hits.push(ab);
    const db = this.player.dashBox(); if (db) hits.push(db);
    const newHit = (id: number) => { if (this.usedHits.has(id)) return false; this.usedHits.add(id); return true; };

    // ---- beats triggered by position ----
    if (!this.lock && !this.finished) {
      if (this.waveIdx < a.waves.length && px > a.waves[this.waveIdx].at) { this.spawnWave(this.waveIdx); this.waveIdx++; }
      else if (a.depave && !this.depave && px > a.depave.at) {
        const l = this.lockArena('depave', a.depave.rats.length);
        this.depave = new DepaveSpots(this, a.depave, l.left, this.groundY);
        this.spawnRats(a.depave.rats, l.left);
        this.flashGo(this.depave.fence ? 'TEAR IT DOWN!' : 'DEPAVE IT!');
        floatText(this, GAME_W / 2, 110, this.depave.fence ? 'PUMP THE FENCES DOWN' : 'PUMP THE CRACKED ASPHALT', 'font_outline', 0xfff08a, 1600).setScrollFactor(0);
      }
      else if (a.boss?.kind === 'monstersuv' && !this.monster && px > a.boss.at) {
        const l = this.lockArena('boss', 0);
        this.monster = new MonsterSuv(this, l.left + GAME_W - 70, this.groundY, { left: l.left, right: l.left + GAME_W });
        this.flashGo('BOSS!');
      }
      else if (a.boss && a.boss.kind !== 'laneeater' && a.boss.kind !== 'monstersuv' && !this.boss && px > a.boss.at) this.startBoss();
      else if (a.build && !this.build && this.chaseDone && px > a.build.at) this.startBuild();
    }

    // ---- the Lane Eater: auto-scroll, the peloton, the machine ----
    if (this.peloton && this.eater && !this.finished) {
      const as = a.autoscroll!;
      if (this.scrolling && !this.player.frozen) {
        const speed = as.speed;
        cam.scrollX = Math.min(cam.scrollX + speed * (dt / 1000), as.end - GAME_W);
        // keep the raccoon on screen: the left edge pushes
        const lo = cam.scrollX + 14, hi = cam.scrollX + GAME_W - 14;
        if (px < lo) { this.player.sprite.x = lo; if (pb.velocity.x < speed) pb.setVelocityX(speed); }
        if (px > hi) { this.player.sprite.x = hi; pb.setVelocityX(Math.min(pb.velocity.x, 0)); }
        if (this.input2.justPressed('act')) this.peloton.ring(px);
        this.eater.chase(dt, speed, this.peloton.size, px, cam.scrollX);
        if (this.eater.touching(pRect)) { if (this.player.hurt(this.eater.x)) shake(this, 150, 0.01); pb.setVelocityX(160); }
        // ambushes: rats step out ahead
        while (this.ambushIdx < (as.ambush?.length ?? 0) && cam.scrollX + GAME_W > as.ambush![this.ambushIdx].at) {
          const am = as.ambush![this.ambushIdx++];
          am.rats.forEach((k, j) => this.time.delayedCall(j * 500, () => this.spawnRat(k, cam.scrollX + GAME_W + 10)));
          sfx.squeak();
        }
        // end of the street: the machine turns on you
        if (cam.scrollX >= as.end - GAME_W - 0.5) {
          this.scrolling = false;
          const l = this.lockArena('boss', 0);
          this.eater.startBoss(l.left + 90);
          this.peloton.parkAt = l.left + GAME_W - 20;
          this.time.delayedCall(900, () => floatText(this, l.left + GAME_W / 2, 60, 'JUMP + PUMP THE CONVEYOR AND THE CAB.\nHIT THE GRINDER WHEN IT OVERHEATS!', 'font_outline', 0xfff08a, 2600).setScrollFactor(0));
          this.flashGo('BOSS!');
        }
      }
      this.peloton.update(dt, px, cam.scrollX);
      if (this.eater.boss) {
        this.eater.updateBoss(dt, px, pRect, this.player.onGround, (fx) => { if (this.player.hurt(fx)) { shake(this, 140, 0.01); hitStop(this, 70); } },
          () => { const L2 = this.lock; if (L2) for (let i = 0; i < 2; i++) this.time.delayedCall(i * 400, () => this.spawnRat('construction', L2.left + GAME_W + 10)); },
          this.rats.filter((r) => r.alive).length);
        this.eater.takeHits(hits, () => { hitStop(this, 120); });
        if (!this.eater.alive && !this.bossDone) {
          this.bossDone = true; this.killed++;
          for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99998 }, px);
          this.peloton.riders.forEach((r, i) => this.tweens.add({ targets: r, y: r.y - 8, duration: 160, yoyo: true, repeat: 3, delay: i * 50 }));
          this.time.delayedCall(1500, () => this.endArena());
        }
      }
    }

    // ---- the parking lot: depave + the Monster SUV ----
    if (this.depave && !this.depaveDone) this.depave.update(hits, px);
    if (this.monster) {
      const m = this.monster;
      m.update(dt, px);
      if (m.alive) {
        const mr = m.rect();
        if (pb.velocity.y > 40 && pRect.bottom <= m.roofY() + 12 && pRect.right > mr.x + 6 && pRect.x < mr.right - 6) {
          if (m.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 7700 + Math.floor(this.time.now / 150) }, 'stomp')) { this.player.bounce(); hitStop(this, 70); }
        } else {
          const tr = m.tyreRect();
          for (const h of hits) if (overlap(h, tr) && m.hit(h, 'pump')) { hitStop(this, 70); shake(this, 90, 0.005); }
          if (m.dangerous && Phaser.Geom.Rectangle.Overlaps(mr, pRect) && pRect.bottom > m.roofY() + 10 && this.player.hurt(m.x)) { shake(this, 160, 0.012); hitStop(this, 80); }
        }
      } else if (!this.bossDone) {
        this.bossDone = true; this.killed++;
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99997 }, px);
        this.time.delayedCall(1300, () => this.endArena());
      }
    }

    // ---- escort ----
    if (this.escort && !this.finished && !this.player.frozen) {
      this.escort.update(dt, px, hits, newHit);
      if (this.escort.done) void this.win();
      else if (this.escort.failed) void this.lose('THE 501 IS LATE AGAIN!', false);
    }

    // ---- chase ----
    if (this.chase && !this.chaseDone && !this.finished && !this.player.frozen) {
      const st = this.chase.update(dt, { x: px, body: pb, onGround: this.player.onGround }, hits);
      if (st === 'caught') {
        this.chaseDone = true;
        const l = this.lockArena('caught', a.caughtWave?.length ?? 0);
        this.spawnRats(a.caughtWave ?? [], l.left);
        this.flashGo('FIGHT!');
      } else if (st === 'splash') { this.chaseDone = true; void this.lose('SPLASH! IT\'S IN THE POND.', false); }
    }

    // ---- SUV Rats ----
    const L = this.lock;
    if (L && L.suvsLeft > 0) {
      L.suvT -= dt / 1000;
      const live = this.cars.filter((c) => c.alive).length;
      if (L.suvT <= 0 && live < 1) { this.spawnCar(L); L.suvT = L.kind === 'build' ? 1.6 : 1.4; }
    }
    const bounds = { left: L ? L.left : cam.scrollX, right: (L ? L.left : cam.scrollX) + GAME_W };
    for (const c of this.cars) {
      c.update(dt, bounds, px);
      if (!c.alive || c.tame) continue;
      const cr = c.rect();
      // stomp the roof
      if (pb.velocity.y > 40 && pRect.bottom <= c.roofY() + 10 && pRect.right > cr.x + 4 && pRect.x < cr.right - 4) {
        if (c.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 9000 + Math.floor(this.time.now / 150) })) { this.player.bounce(); hitStop(this, 60); if (!c.alive) this.killed++; }
        continue;
      }
      let wasHit = false;
      for (const h of hits) if (overlap(h, cr) && c.takeHit(h)) { wasHit = true; hitStop(this, 60); shake(this, 80, 0.005); if (!c.alive) this.killed++; }
      if (!wasHit && c.dangerous && Phaser.Geom.Rectangle.Overlaps(cr, pRect) && pRect.bottom > c.roofY() + 8 && this.player.hurt(c.x)) { shake(this, 150, 0.012); hitStop(this, 80); }
    }
    this.cars = this.cars.filter((c) => c.alive || c.img.active);

    // ---- build ----
    if (this.build && !this.buildDone) this.build.update(hits, this.cars, px);

    // ---- boss ----
    if (this.boss) {
      this.boss.update(dt, px, pRect, hits, this.player.onGround, bounds);
      if (this.boss.alive) {
        const bb = this.boss.body, bRect = new Phaser.Geom.Rectangle(bb.x, bb.y, bb.width, bb.height);
        for (const h of hits) if (overlap(h, bRect) && this.boss.takeHit(h, px)) { hitStop(this, h.dmg > 1 ? 100 : 55); shake(this, 90, h.dmg > 1 ? 0.01 : 0.004); }
        if (pb.velocity.y > 60 && pRect.bottom < bRect.y + 10 && overlap({ x: pRect.x, y: pRect.y, w: pRect.width, h: pRect.height }, bRect)) {
          if (this.boss.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 260, id: 8000 + Math.floor(this.time.now / 200) }, px)) this.player.bounce();
        }
        const bab = this.boss.attackBox();
        if (bab && overlap(bab, pRect) && this.player.hurt(this.boss.sprite.x)) { shake(this, 150, 0.01); hitStop(this, 80); }
      } else if (!this.bossDone) {
        this.bossDone = true;
        this.killed++;
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99999 }, px);
        if (this.dogFraud) {
          const df = this.dogFraud;
          floatText(this, df.x + 60, df.y - 84, 'THIS ISN\'T OVER!', 'font_red', 0xffffff, 900);
          this.tweens.add({ targets: df, x: df.x - 200, duration: 1400, delay: 500, ease: 'Quad.easeIn' });
        }
        this.time.delayedCall(1300, () => this.endArena(this.mission.action.boss?.kind === 'foreman' ? 'LANE OPEN! >>' : 'KING ST IS OPEN! >>'));
      }
    }

    // ---- rats ----
    const lobbyists = this.rats.filter((r) => r.alive && r.kind === 'lobbyist');
    for (const r of this.rats) r.shielded = r.kind !== 'lobbyist' && lobbyists.some((l) => Math.abs(l.sprite.x - r.sprite.x) < 120);
    for (const r of this.rats) {
      r.update(dt, px);
      if (!r.alive) continue;
      const rb = r.body, rRect = new Phaser.Geom.Rectangle(rb.x, rb.y, rb.width, rb.height);
      let wasHit = false;
      for (const h of hits) if (overlap(h, rRect) && r.takeHit(h, px)) {
        wasHit = true;
        hitStop(this, h.dmg > 1 ? 90 : 50); shake(this, 90, h.dmg > 1 ? 0.008 : 0.004);
        if (!r.alive) this.killed++;
      }
      if (!wasHit && pb.velocity.y > 60 && pRect.bottom < rRect.y + 10 && overlap({ x: pRect.x, y: pRect.y, w: pRect.width, h: pRect.height }, rRect)) {
        if (r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 60, id: 5000 + Math.floor(this.time.now / 200) }, px)) { this.player.bounce(); hitStop(this, 50); if (!r.alive) this.killed++; }
        continue;
      }
      const rab = r.attackBox();
      if (rab && overlap(rab, pRect) && this.player.hurt(r.sprite.x)) { shake(this, 150, 0.01); hitStop(this, 80); }
    }
    this.rats = this.rats.filter((r) => r.alive || r.sprite.active);
    const live = this.rats.filter((r) => r.alive);
    // once inside a locked arena, rats stay on screen (ranged rats used to back off-screen and snipe)
    if (L) for (const r of live) {
      const lo = L.left + 10, hi = L.left + GAME_W - 10;
      if (r.sprite.x > lo && r.sprite.x < hi) r.sprite.setData('in', true);
      if (r.sprite.getData('in')) r.sprite.x = Phaser.Math.Clamp(r.sprite.x, lo, hi);
      else r.sprite.x += Math.sign(L.left + GAME_W / 2 - r.sprite.x) * 70 * (dt / 1000); // walk in first, whatever the AI wants
    }
    for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
      const s1 = live[i].sprite, s2 = live[j].sprite, dx = s2.x - s1.x;
      if (Math.abs(dx) < 16) { const push = (16 - Math.abs(dx)) * 0.5 * (dx >= 0 ? 1 : -1); s1.x -= push * 0.5; s2.x += push * 0.5; }
    }

    // ---- thrown cones ----
    for (const c of [...this.cones.getChildren()] as Phaser.Physics.Arcade.Image[]) {
      if (c.getData('landed')) continue;
      const cb = c.body as Phaser.Physics.Arcade.Body, cRect = new Phaser.Geom.Rectangle(cb.x, cb.y, cb.width, cb.height);
      if (hits.some((h) => overlap(h, cRect))) { sfx.clang(); puff(this, c.x, c.y, 0xff9a2e, 6, 14, 96); c.destroy(); continue; }
      if (Phaser.Geom.Rectangle.Overlaps(cRect, pRect) && this.player.hurt(c.x)) { shake(this, 120, 0.008); c.destroy(); }
    }

    // ---- arena cleared? ----
    if (L && !this.finished) {
      const ratsDone = this.killed - L.startKills >= L.total - (L.kind === 'build' ? L.suvsLeft + this.cars.filter((c) => c.alive).length : 0) && L.suvsLeft <= 0 && !this.cars.some((c) => c.alive && !c.tame);
      if (L.kind === 'wave' && ratsDone) this.endArena();
      else if (L.kind === 'depave' && this.depave?.allDone && this.rats.every((r) => !r.alive)) { this.depaveDone = true; this.depave.finish(); this.endArena(this.depave.fence ? 'OPEN! >>' : 'GREEN! >>'); }
      else if (L.kind === 'caught' && this.rats.every((r) => !r.alive)) { floatText(this, px, this.groundY - 60, 'CAMERA RECOVERED!', 'font_outline', 0x9bd35a, 900); this.endArena('TO THE SCHOOL! >>'); }
      else if (L.kind === 'build' && this.build?.allDone && this.rats.every((r) => !r.alive)) {
        // calmed: any car still around now crawls through politely and leaves
        for (const c of this.cars) if (c.alive) c.tame = true;
        L.suvsLeft = 0;
        this.buildDone = true;
        this.build?.finish();
        this.endArena('SLOWED! >>');
      }
    }

    // ---- low health: a heartbeat beep ----
    if (!a.noCombat && this.player.hp === 1 && !this.finished) { this.lowHpT -= dt; if (this.lowHpT <= 0) { sfx.blip(); this.lowHpT = 900; } }
    if (this.player.dead) void this.lose();
    if (this.player.sprite.y > GAME_H + 40) { this.player.hp = 0; this.player.dead = true; }
    this.drawHud();
  }
}
