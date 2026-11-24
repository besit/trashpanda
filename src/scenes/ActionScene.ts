// Side-view missions. One host scene; each mission composes beats from data (src/data/missions.ts):
// ride sections, arena waves (rats + SUV Rats), a boss, the streetcar escort, the camera chase and the
// build-the-street arena. The arena lock never jumps the camera, and the release eases back into follow.
import { bakedImage } from '../ui/bake';
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
import { SpaDigger } from '../action/SpaDigger';
import { JetTug } from '../action/JetTug';
import { Chase, BuildSpots } from '../action/Parkside';
import { Patrol, Wrecker } from '../action/Science';
import { HighwayMech } from '../action/Highway';
import { MISSIONS, type MissionDef } from '../data/missions';
import { ctx } from '../core/ctx';
import { START_LIVES } from '../core/GameState';
import { award, hitsPerLife, fmtScore, type ScoreKind } from '../core/Score';
const POINTS_OF = (label: string) => Number(label.slice(1)) || 0;
import { text, iris, shake, hitStop, puff, floatText, floatTextInView, fitText, impactStar } from '../ui/fx';
import { rankByHits, rankByDelay, recordRank, rankLine, RANK_COLOR, type MissionRank } from '../core/Rank';
import { openPause } from './PauseScene';
import { ScrollLayer, STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { music } from '../audio/Sequencer';
import { SONG_ACTION, SONG_BOSS, SONG_WIN, SONG_LOSE } from '../audio/songs';
import { livability } from '../core/Livability';
import { sfx } from '../audio/sfx';

const overlap = (a: { x: number; y: number; w: number; h: number }, b: Phaser.Geom.Rectangle) => a.x < b.right && a.x + a.w > b.x && a.y < b.bottom && a.y + a.h > b.y;

type Lock = { kind: 'wave' | 'boss' | 'build' | 'caught' | 'depave'; left: number; startKills: number; total: number; suvsLeft: number; suvT: number };

export class ActionScene extends Phaser.Scene {
  private input2!: InputManager;
  private touch?: TouchControls;
  private mission!: MissionDef & { action: NonNullable<MissionDef['action']> };
  private player!: SidePlayer;
  private rats: Rat[] = [];
  private cars: SuvRat[] = [];
  private boss?: Boss;
  private dogFjord?: Phaser.GameObjects.Image;
  private peloton?: Peloton;
  private depave?: DepaveSpots;
  private lobbyTip = false;
  private depaveDone = false;
  private monster?: MonsterSuv;
  /** M4.16 (Ivan: the Megamart boss "feels a little too easy"): rat waves sent so far in the Monster SUV fight */
  private monsterWaves = 0;
  private digger?: SpaDigger;
  /** M3.4: mission 11's boss, and the suitcases Baggage Rats (and the tug) roll along the ground */
  private tug?: JetTug;
  private depavePre?: DepaveSpots;
  private hideTag?: Phaser.GameObjects.BitmapText;
  private buildPre?: BuildSpots;
  /** M4, mission 6: guards on watch, crates to hide behind, the Wrecker */
  private patrols: Patrol[] = [];
  private crates: number[] = [];
  private wrecker?: Wrecker;
  private mech?: HighwayMech;
  private cases: Phaser.Physics.Arcade.Image[] = [];
  private eater?: LaneEater;
  private scrolling = false;
  /** the auto-scroll position as a float: Phaser floors cam.scrollX every frame (roundPixels), so at
   *  120+ Hz a 0.5 px step was lost each frame and the screen never moved (M3.1, Ivan's M5 report) */
  private autoX = 0;
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
  private hud!: { g: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.BitmapText; go: Phaser.GameObjects.BitmapText; score: Phaser.GameObjects.BitmapText };
  /** points earned in this attempt (shown on the end card) */
  private earned = 0;
  private finished = false;
  private killed = 0;
  private usedHits = new Set<number>();
  /**
   * M4.1 (Ivan: "the raccoon pixels jump between 2 positions" when riding right at a steady speed): our own
   * camera follow. Phaser floors the camera scroll and rounds the sprite separately, so their fractions beat
   * against each other and the raccoon jittered by a pixel. Here the scroll is derived from the raccoon's
   * ROUNDED x plus a rounded lag, so at a steady speed the raccoon sits on one screen pixel.
   */
  private follow = { on: false, lerp: 0.15, x: 0, lag: 0 };

  constructor() { super('Action'); }

  /** started from the debug SELECT MISSION list: the end of the mission returns to a replay menu (M3.3) */
  private debugRun = false;

  /** M3.3 (Ivan): a finished mission can be replayed from its marker, but a replay earns NO points */
  private replay = false;

  /** M4.3 (game review): once the boss arena is reached, losing a life restarts at the boss, not at the street's start */
  private reachedBoss = false;
  private atCheckpoint = false;

  /** hits taken in earlier tries of this mission (restarts after a lost life): they count toward the rank */
  private carriedHits = 0;

  create(data: { mission?: string; debug?: boolean; replay?: boolean; checkpoint?: boolean; hits?: number }) {
    const want = MISSIONS[data?.mission ?? 'bike_lane_war'];
    this.mission = (want?.action ? want : MISSIONS.bike_lane_war) as MissionDef & { action: NonNullable<MissionDef['action']> }; // explore missions never come here
    this.debugRun = !!data?.debug; this.replay = !!data?.replay;
    this.rats = []; this.cars = []; this.boss = undefined; this.escort = undefined; this.chase = undefined; this.build = undefined;
    this.waveIdx = 0; this.lock = null; this.finished = false; this.killed = 0; this.layers = []; this.usedHits.clear();
    this.bossDone = false; this.buildDone = false; this.chaseDone = false;
    this.input2 = new InputManager(this);
    const a = this.mission.action;
    // the Lane Eater's boss is the end of its autoscroll: no checkpoint there
    this.atCheckpoint = !!data?.checkpoint && !!a.boss && a.boss.kind !== 'laneeater';
    this.reachedBoss = this.atCheckpoint; this.carriedHits = data?.hits ?? 0;
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
    // M4 (mission 9): construction hoardings along the sidewalk
    if (a.decor === 'hoarding') for (let x = 160; x < a.length; x += 230) bakedImage(this, x, STREET_Y + 12, 'world', 'hoarding', 1.2).setOrigin(0.5, 1).setDepth(20); // M4.6: drawn once at 1.2x (no shimmer)

    // the Lane Eater mission starts the raccoon clear of the machine creeping in from the left
    this.player = new SidePlayer(this, this.atCheckpoint ? Math.max(60, a.boss!.at - 230) : a.autoscroll ? 150 : 60, this.groundY - 10);
    // M3.1: the difficulty sets how many hits one life takes (easy 7, normal 5, hard 3)
    this.player.maxHp = hitsPerLife(ctx.state); this.player.hp = this.player.maxHp; this.earned = 0; this.scored = { pieces: 0, riders: 0, cleared: 0 };
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
    // M4.2: the arena's spots (asphalt, fences, stakes, rail piles) are already there as you ride up, not popped in at the lock
    this.depavePre = a.depave && !this.atCheckpoint ? new DepaveSpots(this, a.depave, this.arenaLeftAt(a.depave.at), this.groundY) : undefined;
    this.buildPre = a.build ? new BuildSpots(this, a.build, this.arenaLeftAt(a.build.at), this.groundY) : undefined;
    this.peloton = undefined; this.eater = undefined; this.scrolling = false; this.ambushIdx = 0; this.autoX = 0;
    this.depave = undefined; this.depaveDone = false; this.monster = undefined; this.monsterWaves = 0; this.digger = undefined; this.tug = undefined; this.cases = [];
    this.patrols = []; this.crates = []; this.wrecker = undefined; this.mech = undefined;
    if (a.autoscroll) {
      this.peloton = new Peloton(this, a.autoscroll.riders, this.groundY);
      this.eater = new LaneEater(this, -100, this.groundY); // front just off screen; it creeps in
      this.scrolling = true;
    }
    if (a.chase && !a.chase.startAt && !this.atCheckpoint) this.chase = new Chase(this, a.chase, 60, this.groundY);
    // M4 (mission 6): crates to crouch behind, guards on watch with flashlights
    // M4.2 (Ivan: "can I hide behind the crate? not clear"): the crates stand IN FRONT of the raccoon (depth over the player's 100)
    this.hideTag?.destroy(); this.hideTag = undefined;
    for (const cx of a.crates ?? []) { this.add.image(cx, this.groundY + 2, 'world', 'crate').setOrigin(0.5, 1).setDepth(101); this.crates.push(cx); }
    for (const pd of this.atCheckpoint ? [] : a.patrols ?? []) {
      const r = this.spawnRat('guard', pd.at);
      // M4.4: its beat runs from past the crate before it to a little beyond where it starts
      const crate = Math.max(...(a.crates ?? []).filter((c) => c < pd.at), pd.at - 140);
      this.patrols.push(new Patrol(this, r, this.groundY, [crate - 60, pd.at + 60], (x) => { this.say('SPOTTED! THE GUARD CALLED FOR BACKUP!', 0xff6347, 1800); this.time.delayedCall(300, () => this.spawnRat('basic', this.edgeX(x + 140))); this.time.delayedCall(700, () => this.spawnRat('basic', this.edgeX(x - 140))); }));
    }
    if (a.build) this.add.image(a.build.at + 60, STREET_Y, 'school_side').setOrigin(0, 1).setDepth(2);
    // at the checkpoint, everything before the boss counts as done
    if (this.atCheckpoint) {
      while (this.waveIdx < a.waves.length && a.waves[this.waveIdx].at < a.boss!.at) this.waveIdx++;
      this.depaveDone = !!a.depave; this.buildDone = !!a.build; this.chaseDone = !!a.chase;
    }

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, GAME_H).setRoundPixels(true);
    if (a.autoscroll) this.player.shield = () => !!this.peloton?.absorb();
    else { this.follow = { on: true, lerp: 0.15, x: Phaser.Math.Clamp(this.player.sprite.x + 40 - GAME_W / 2, 0, this.worldW - GAME_W), lag: 0 }; this.follow.lag = Math.round(this.follow.x - this.player.sprite.x); cam.setScroll(Math.round(this.follow.x), 0); }

    this.buildHud();
    if (wantsTouch()) { this.touch = new TouchControls(this); this.touch.setLabel('act', 'PUMP'); }
    this.scale.on('resize', this.layoutHud, this);
    this.events.on('resume', () => this.input2.swallow());
    this.events.on('postupdate', this.followCamera, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.layoutHud, this); this.events.off('postupdate', this.followCamera, this); });
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
      }, rats: () => this.rats.filter((r) => r.alive).length, ratObjs: () => this.rats.filter((r) => r.alive), killAll: () => { for (const r of this.rats) if (r.alive) { r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 0, id: 424242 + this.killed }, 0); this.killed++; } }, win: () => this.win(), boss: () => this.boss, eaterObj: () => this.eater, digger: () => this.digger, monster: () => this.monster, tug: () => this.tug, wrecker: () => this.wrecker, patrols: () => this.patrols, mech: () => this.mech, cases: () => this.cases.filter((c) => c.active), gy: () => this.groundY,
      state: () => (!this.sys.isActive() ? { finished: true } : { x: this.player.sprite.x, frozen: this.player.frozen, hp: this.player.hp,
        rats: this.rats.filter((r) => r.alive).map((r) => Math.round(r.sprite.x)), carsAt: this.cars.filter((c) => c.alive && !c.tame).map((c) => [Math.round(c.x), c.dir]), bossX: this.boss?.alive ? Math.round(this.boss.sprite.x) : this.monster?.alive ? Math.round(this.monster.x) : null, depaved: this.depave?.done ?? null, spots: this.depave?.openSpots ?? null, monsterStalled: this.monster?.stalled ?? null, tug: this.tug ? { x: Math.round(this.tug.x), hp: this.tug.hp, phase: this.tug.phase, dir: this.tug.dir } : null, wrecker: this.wrecker ? { x: Math.round(this.wrecker.x), hp: this.wrecker.hp, phase: this.wrecker.phaseName, ball: this.wrecker.ballPos() } : null, mech: this.mech ? { x: Math.round(this.mech.x), hp: this.mech.hp, phase: this.mech.phase } : null, bossMove: this.boss?.move ?? null, alarms: this.patrols.filter((p) => p.alarmed).length, cases: this.cases.filter((c) => c.active).length,
        front: this.escort ? Math.round(this.escort.front) : null, scrolling: this.scrolling, peloton: this.peloton?.size ?? null, eater: this.eater ? { x: Math.round(this.eater.x), boss: this.eater.boss, hp: this.eater.totalHp, hot: this.eater.hot, move: this.eater.state, dir: this.eater.facing } : null, haul: this.chase ? Math.round(this.chase.rearX) : null, lock: this.lock?.kind ?? null, wave: this.waveIdx, boss: this.boss ? this.boss.hp : null, escort: this.escort ? { car: Math.round(this.escort.car.x), delay: +this.escort.delay.toFixed(1), done: this.escort.done } : null, chase: this.chase?.state ?? null, built: this.build?.built ?? null, cars: this.cars.filter((c) => c.alive).length, finished: this.finished, camX: Math.round(this.cameras.main.scrollX), song: music.current }) };
  }

  /** the pixel-stable follow; runs on POST_UPDATE, after Arcade has copied the body onto the sprite */
  private followCamera(_t: number, dt: number) {
    if (!this.follow.on || this.scrolling) return;
    const cam = this.cameras.main;
    const lo = this.lock ? this.lock.left : 0, hi = this.lock ? this.lock.left : this.worldW - GAME_W;
    const x = this.player.sprite.x;
    const target = Phaser.Math.Clamp(x + 40 - GAME_W / 2, lo, hi);
    this.follow.x += (target - this.follow.x) * Math.min(1, this.follow.lerp * (dt / 16.67));
    // the camera's lag behind the raccoon in whole pixels, with hysteresis: frame times wobble, so the true lag
    // hovers around a half pixel; it changes only when it has really moved
    const raw = this.follow.x - x;
    if (Math.abs(raw - this.follow.lag) > 0.75) this.follow.lag = Math.round(raw);
    cam.setScroll(Phaser.Math.Clamp(Math.round(x) + this.follow.lag, lo, hi), cam.scrollY);
    for (const l of this.layers) l.update(cam.scrollX);
  }

  private buildBackground() {
    const a = this.mission.action, sky = a.sky;
    const layer = (key: string, y: number, f: number) => this.layers.push(new ScrollLayer(this, key, y, f));
    layer(`sky_${sky}`, 0, 0);
    // M3.1 (Ivan): on the waterfront we look OUT at the lake: the Toronto Islands + the airport, not the skyline
    if (a.bg === 'lake') { layer('islands_wf', STREET_Y - 140, 0.2); this.planes(); }
    else layer(`skyline_${sky}`, SKYLINE_Y, 0.08);
    // the front row (buildings or park) and the sidewalk scroll together as one plane (Ivan, M1.1)
    if (a.bg === 'king') layer('facades_dt', FRONT_Y.king, 1.0);
    else if (a.bg === 'parkside') layer('park_hp', FRONT_Y.parkside, 1.0);
    else if (a.bg === 'bigbox') layer('bigbox_ee', STREET_Y - 120, 1.0);
    else if (a.bg === 'lake') layer('lake_wf', STREET_Y - 120, 1.0);
    else if (a.bg === 'science') layer('science_nd', FRONT_Y.science, 1.0);
    else if (a.bg === 'gardiner') layer('gardiner_side', FRONT_Y.king, 1.0);
    else { layer(`backrow_${sky}`, BACKROW_Y, 0.3); layer('facades_qw', FRONT_Y.queen, 1.0); }
    layer(`street_${a.street}`, STREET_Y, 1.0);
  }

  private queenDecor() {
    // parked cars to hop on + Dog Fjord's "ANOTHER CAR LANE" cones (the ride beat)
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

  /**
   * Planes at Billy Bishop over the islands. M3.3 (Ivan: "airplanes should not fall into water"): every plane
   * crosses the whole screen along the approach line (top-left to bottom-right): the turboprop LANDS left to
   * right, coming down onto the island; the Cessna TAKES OFF right to left, climbing. Nothing dips into the lake.
   */
  private planes() {
    const fly = (s: Phaser.GameObjects.Sprite, x0: number, y0: number, x1: number, y1: number, ms: number, then: () => void) => {
      s.setPosition(x0, y0).setVisible(true);
      this.tweens.add({ targets: s, x: x1, y: y1, duration: ms, ease: 'Linear', onComplete: () => { s.setVisible(false); then(); } });
    };
    const tp = this.add.sprite(0, 0, 'world', 'plane_tp_0').setScrollFactor(0).setDepth(1).setFlipX(true).setVisible(false).play('plane_tp');
    const cs = this.add.sprite(0, 0, 'world', 'plane_cs_0').setScrollFactor(0).setDepth(1).setFlipX(true).setVisible(false).play('plane_cs');
    const land = () => fly(tp, -70, 4, GAME_W + 70, 48, 15000, () => this.time.delayedCall(5000, land));
    const takeOff = () => fly(cs, GAME_W + 60, 46, -60, 2, 13000, () => this.time.delayedCall(7000, takeOff));
    land();
    this.time.delayedCall(6500, takeOff);
  }

  /**
   * M3.3 (Ivan: "the jump attack happens simply over the car... it dies in one jump"): a stomp counts only
   * when the raccoon LANDS on the roof: falling, feet within a short band of the roof top, over its width,
   * and not again on the same target for a moment (the bounce used to score every 150 ms while hovering).
   */
  private stompAt = new Map<object, number>();
  private landingOn(pRect: Phaser.Geom.Rectangle, roofY: number, x0: number, x1: number, target: object) {
    if (this.player.body.velocity.y <= 40) return false;
    // M4.2: you land ON it: no bounce while you're still visibly above the roof (a fall covers ~8 px a frame)
    const prevBottom = this.player.body.prev.y + this.player.body.height;
    if (pRect.bottom < roofY - 3 || prevBottom > roofY + 10) return false; // crossed the roof line this frame (or is just on it)
    if (pRect.right <= x0 || pRect.x >= x1) return false;
    // 650 ms: a plain bounce comes back down in about half a second, so a chain of stomps takes a real
    // second approach (Ivan: one jump used to kill the SUV by itself)
    if (this.time.now - (this.stompAt.get(target) ?? -1e9) < 650) return false;
    this.stompAt.set(target, this.time.now);
    return true;
  }

  /** a prop you can stand on (one-way from below), its top at `top`. `float`: drawn at that height on a
   *  concrete pier, not standing on the ground (M4.1, Ivan: the slabs showed on the ground) */
  /**
   * M4.2 (Ivan: "make sure objects never just appear on the screen from nowhere"): a boss or prop created where
   * the camera can see it slides in from beyond the right edge instead (physics bodies follow).
   */
  private enterFromRight(objs: (Phaser.GameObjects.GameObject & { x: number; y: number })[], ms = 1000) {
    const cam = this.cameras.main, edge = cam.scrollX + GAME_W;
    const minX = Math.min(...objs.map((o) => o.x));
    const dx = Math.max(0, edge + 70 - minX);
    if (!dx) return;
    for (const o of objs) {
      const x1 = o.x; o.x = x1 + dx;
      const body = (o as unknown as { body?: Phaser.Physics.Arcade.Body }).body;
      if (body) body.reset(o.x, o.y);
      this.tweens.add({ targets: o, x: x1, duration: ms, ease: 'Quad.easeOut', onUpdate: () => { if (body) body.reset(o.x, o.y); } });
    }
  }
  /** the camera's left edge when the player crosses `at` (where an arena will lock), for things placed before it */
  private arenaLeftAt(at: number) { return Phaser.Math.Clamp(Math.round(at + 40 - GAME_W / 2), 0, this.worldW - GAME_W); }

  private oneWay(x: number, top: number, w: number, key: string, float = false) {
    const drop = float ? 150 : 0; // M4.2: a dropped slab falls in from above the screen
    if (float) {
      const pier = this.add.graphics().setDepth(47);
      pier.fillStyle(0x16121f).fillRect(x - 8, top + 10, 16, this.groundY - top - 8).fillStyle(0x7b7889).fillRect(x - 7, top + 10, 14, this.groundY - top - 9).fillStyle(0xa39c8b).fillRect(x - 7, top + 10, 3, this.groundY - top - 9);
      const slab = this.add.image(x, top + 10, 'world', key).setOrigin(0.5, 1).setDepth(48);
      pier.y = -drop; slab.y -= drop;
      this.tweens.add({ targets: [pier, slab], y: `+=${drop}`, duration: 420, ease: 'Quad.easeIn', onComplete: () => { shake(this, 160, 0.008); puff(this, x, this.groundY - 4, 0xa39c8b, 10, 24, 105); } });
    } else this.add.image(x, this.groundY + 2, 'world', key).setOrigin(0.5, 1).setDepth(48);
    const z = this.add.zone(x, top + 3, w, 6);
    this.physics.add.existing(z, true);
    const b = z.body as Phaser.Physics.Arcade.StaticBody;
    b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false;
    // M4.3 (review): a falling slab is solid only once it has landed (no invisible platform in mid-air)
    if (float) { b.enable = false; this.time.delayedCall(420, () => { if (z.active) b.enable = true; }); }
    this.platforms.add(z);
  }

  private async intro() {
    this.player.frozen = true;
    await iris(this, 'open', 80, this.groundY - 20, 500);
    if (this.atCheckpoint) { this.flashGo('CHECKPOINT: THE BOSS!'); this.player.frozen = false; return; }
    const a = this.mission.action;
    // M3.1: stacked top-down (origin y 0). Multi-line text centred on a fixed y grew upward into the title.
    const t1 = text(this, GAME_W / 2, 48, this.mission.title, 'font_big').setScrollFactor(0).setDepth(1000);
    const s1 = fitText(t1, GAME_W - 16), h1 = t1.height; t1.setScale(0.1);
    this.tweens.add({ targets: t1, scale: s1, duration: 300, ease: 'Back.easeOut' });
    const t2 = fitText(text(this, GAME_W / 2, 48 + h1 / 2 + 8, a.intro, 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000), GAME_W - 16, true);
    const hint = a.hint ? (wantsTouch() ? a.hint[1] : a.hint[0]) : wantsTouch() ? 'RED: PUMP   BLUE: DASH   GREEN: JUMP' : 'E: PUMP (3-HIT COMBO)   Q: DASH   SPACE: JUMP';
    const t3 = fitText(text(this, GAME_W / 2, t2.y + t2.height + 6, hint, 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000).setTint(0xfff08a), GAME_W - 16, true);
    if (this.replay) t3.setText(`${t3.text}\nREPLAY: NO POINTS THIS TIME`);
    const top = 48 - (h1 * s1) / 2 - 8, bottom = t3.y + t3.height + 8;
    const band = this.add.graphics().setScrollFactor(0).setDepth(999).fillStyle(0x16121f, 0.92).fillRect(0, top, GAME_W, bottom - top); // 1.0: near opaque (a shop sign showed through: text on text)
    sfx.bell();
    await new Promise((r) => this.time.delayedCall(2600, r));
    t1.destroy(); t2.destroy(); t3.destroy(); band.destroy();
    this.flashGo(this.chase ? 'AFTER THEM!' : 'RIDE!');
    this.player.frozen = false;
  }

  /**
   * One instruction line under the GO banner, fixed on screen (M3.1: hints were placed at a world x with
   * scrollFactor 0, or right over the banner). A new line replaces the old one.
   */
  private sayObj?: Phaser.GameObjects.BitmapText;
  private sayBox?: Phaser.GameObjects.Graphics;
  /** M4.2: the hint box goes when a result takes the screen (no text over text) */
  private clearSay() { this.sayObj?.destroy(); this.sayBox?.destroy(); this.sayObj = undefined; this.sayBox = undefined; }
  private say(msg: string, tint = 0xfff08a, hold = 1600) {
    if (this.finished) return; // M4.3 (review): a delayed hint must not land on the result card
    this.sayObj?.destroy(); this.sayBox?.destroy();
    const t = fitText(text(this, GAME_W / 2, 34, msg, 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(2001).setTint(tint), GAME_W - 16, true);
    // M3.3 (Ivan: text over text): the hint sits in its own dark box, like the dialogue box without a name
    const g = this.add.graphics().setScrollFactor(0).setDepth(2000.5);
    g.fillStyle(0x16121f, 0.94).fillRoundedRect(GAME_W / 2 - t.width / 2 - 7, 30, t.width + 14, t.height + 8, 3).lineStyle(1, 0x69657a).strokeRoundedRect(GAME_W / 2 - t.width / 2 - 7, 30, t.width + 14, t.height + 8, 3);
    this.sayObj = t; this.sayBox = g;
    this.tweens.add({ targets: [t, g], alpha: 0, delay: hold, duration: 400, onComplete: () => { t.destroy(); g.destroy(); if (this.sayObj === t) { this.sayObj = undefined; this.sayBox = undefined; } } });
  }

  /** award points and float them where they were earned (world coordinates) */
  private pts(kind: ScoreKind, x: number, y: number, n = 1) {
    if (this.replay) return;
    const p = award(ctx.state, kind, n);
    this.earned += p;
    floatText(this, x, y, `+${p}`, 'font_outline', 0xfff08a, 300).setDepth(2500);
  }
  /** score from objectives counted by the mission objects (pieces built, riders joined, cone rats cleared) */
  private scored = { pieces: 0, riders: 0, cleared: 0 };
  private scoreObjectives() {
    const pieces = (this.depave?.done ?? 0) + (this.build?.built ?? 0), riders = this.peloton?.joinedTotal ?? 0, cleared = this.escort?.cleared ?? 0;
    const px = this.player.sprite.x, py = this.player.sprite.y - 44;
    if (pieces > this.scored.pieces) this.pts('piece', px, py, pieces - this.scored.pieces);
    if (riders > this.scored.riders) this.pts('rider', px, py - 10, riders - this.scored.riders);
    if (cleared > this.scored.cleared) this.pts('rat', px, py, cleared - this.scored.cleared);
    this.scored = { pieces, riders, cleared };
  }

  private goBand?: Phaser.GameObjects.Graphics;
  private flashGo(msg: string) {
    this.hud.go.setText(msg).setScale(1);
    const s = fitText(this.hud.go, GAME_W - 16);
    this.hud.go.setAlpha(1).setScale(s * 1.5);
    this.tweens.add({ targets: this.hud.go, scale: s, duration: 200 });
    this.tweens.add({ targets: this.hud.go, alpha: 0, delay: 900, duration: 300 });
    // M4.3: on its own dark band (it landed on the Megamart's signs: text on text)
    const h = this.hud.go.height * s + 8;
    this.goBand?.destroy();
    this.goBand = this.add.graphics().setScrollFactor(0).setDepth(1999.5).fillStyle(0x16121f, 0.9).fillRect(0, this.hud.go.y - h / 2, GAME_W, h);
    this.tweens.add({ targets: this.goBand, alpha: 0, delay: 900, duration: 300 });
  }
  /** M4.3: a dark band behind a result card (head + sub lines), so it never sits on lettering in the background */
  private cardBand(headY: number, headH: number, sub: Phaser.GameObjects.BitmapText) {
    const top = headY - headH / 2 - 6, bottom = sub.y + sub.height + 6;
    this.add.graphics().setScrollFactor(0).setDepth(2999).fillStyle(0x16121f, 0.86).fillRect(0, top, GAME_W, bottom - top);
  }

  /** M4.3 (game review): a dark band behind the top HUD line, so it reads over towers and the Gardiner's deck */
  private hudBand?: Phaser.GameObjects.Graphics;
  private drawHudBand() {
    this.hudBand ??= this.add.graphics().setScrollFactor(0).setDepth(1999);
    this.hudBand.clear().fillStyle(0x16121f, 0.5).fillRect(0, 0, GAME_W, 18).fillStyle(0x16121f, 0.25).fillRect(0, 18, GAME_W, 2);
  }
  private buildHud() {
    this.hudBand = undefined; this.drawHudBand();
    const g = this.add.graphics().setScrollFactor(0).setDepth(2000);
    const label = text(this, GAME_W / 2, 6, '', 'font_outline', 0).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2000);
    const go = text(this, GAME_W / 2, 70, '', 'font_big').setScrollFactor(0).setDepth(2000).setAlpha(0);
    const score = text(this, GAME_W - 6, 6, '', 'font_outline', 0).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);
    this.hud = { g, label, go, score };
  }

  private layoutHud() {
    this.hud.label.setX(GAME_W / 2); this.hud.go.setX(GAME_W / 2); this.hud.score.setX(GAME_W - 6); this.drawHudBand();
    for (const l of this.layers) l.refit();
    if (wantsTouch() && window.innerHeight > window.innerWidth && !this.finished) openPause(this);
  }

  private drawHud() {
    const g = this.hud.g;
    g.clear();
    const a = this.mission.action;
    if (!a.noCombat) {
      // M3.1 (Ivan): a health bar of 3 / 5 / 7 segments (difficulty) instead of five hearts; it flashes
      // on the last hit before you lose a life
      const n = this.player.maxHp, segW = Math.max(6, Math.floor(56 / n)), bw = n * segW + 1;
      const blink = this.player.hp === 1 && Math.floor(this.time.now / 180) % 2 === 0;
      g.fillStyle(0x16121f).fillRect(7, 7, bw + 2, 9).fillStyle(0x2a2536).fillRect(8, 8, bw, 7);
      for (let i = 0; i < n; i++) {
        const full = i < this.player.hp, x = 9 + i * segW;
        g.fillStyle(full ? (blink ? 0xfff08a : 0x55a144) : 0x443f54).fillRect(x, 9, segW - 1, 5);
        if (full) g.fillStyle(blink ? 0xffffff : 0x9bd35a).fillRect(x, 9, segW - 1, 1);
      }
      // lives: little hearts under the bar (lose the whole bar = lose a life and restart the mission)
      for (let i = 0; i < Math.min(ctx.state.lives, 9); i++) {
        const x = 8 + i * 9, y = 19;
        g.fillStyle(0x16121f).fillRect(x, y, 9, 8);
        g.fillStyle(0xd42a24).fillRect(x + 1, y + 2, 7, 2).fillRect(x + 1, y + 1, 3, 1).fillRect(x + 5, y + 1, 3, 1).fillRect(x + 2, y + 4, 5, 1).fillRect(x + 3, y + 5, 3, 1).fillRect(x + 4, y + 6, 1, 1);
        g.fillStyle(0xff6347).fillRect(x + 2, y + 2, 1, 1);
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
    } else if (this.digger?.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0xd9646f).fillRect(x, 18, (w * this.digger.hp) / this.digger.maxHp, 5);
      this.hud.label.setText(this.digger.title);
    } else if (this.mech?.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0xa39c8b).fillRect(x, 18, (w * this.mech.hp) / this.mech.maxHp, 5);
      this.hud.label.setText(this.mech.title);
    } else if (this.wrecker?.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0xff9a2e).fillRect(x, 18, (w * this.wrecker.hp) / this.wrecker.maxHp, 5);
      this.hud.label.setText(this.wrecker.title);
    } else if (this.tug?.alive) {
      const w = 140, x = GAME_W / 2 - w / 2;
      g.fillStyle(0x16121f).fillRect(x - 1, 17, w + 2, 7).fillStyle(0x443f54).fillRect(x, 18, w, 5).fillStyle(0x7cc6f2).fillRect(x, 18, (w * this.tug.hp) / this.tug.maxHp, 5);
      this.hud.label.setText(this.tug.title);
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
      this.hud.label.setText(`GAP ${gap}M   ${this.mission.action.chase!.goal === 'truck' ? 'TRUCK' : 'POND'} IN ${toPond}M`);
    } else if (this.lock?.kind === 'build') this.hud.label.setText(`BUILT ${this.build?.built ?? 0}/3   RATS ${alive}`);
    else this.hud.label.setText(this.lock ? `RATS ${alive}` : `RATS DEFEATED ${this.killed}`);
  }

  // ---------------- arena lock ----------------
  /** M4.3: the impact star at the middle of where a hitbox meets its target */
  private impact(h: { x: number; y: number; w: number; h: number; dmg?: number }, r: { x: number; y: number; width: number; height: number }) {
    const x0 = Math.max(h.x, r.x), x1 = Math.min(h.x + h.w, r.x + r.width), y0 = Math.max(h.y, r.y), y1 = Math.min(h.y + h.h, r.y + r.height);
    impactStar(this, x1 > x0 ? (x0 + x1) / 2 : h.x + h.w / 2, y1 > y0 ? (y0 + y1) / 2 : h.y + h.h / 2, (h.dmg ?? 1) > 1);
  }
  /** a stomp lands: the star under the raccoon's feet */
  private stompStar() { impactStar(this, this.player.sprite.x, this.player.body.bottom, true); }

  private lockArena(kind: Lock['kind'], total: number, suvs = 0, want?: number): Lock {
    const cam = this.cameras.main;
    cam.stopFollow(); this.follow.on = false;
    // lock exactly where the camera already is: no jump. M4.3 (review): an arena whose spots were placed before
    // you arrived (want) locks where they expect it, the camera easing over the few pixels it lagged
    const here = Phaser.Math.Clamp(Math.round(cam.scrollX), 0, this.worldW - GAME_W);
    const left = want === undefined ? here : Phaser.Math.Clamp(want, 0, this.worldW - GAME_W);
    if (left !== here) { cam.setScroll(here, cam.scrollY); this.tweens.add({ targets: cam, scrollX: left, duration: 220, ease: 'Sine.easeOut', onUpdate: () => { for (const l of this.layers) l.update(Math.round(cam.scrollX)); } }); }
    else cam.setScroll(left, cam.scrollY);
    cam.setBounds(left, 0, GAME_W, GAME_H);
    this.physics.world.setBounds(left, 0, GAME_W, GAME_H + 100);
    this.player.body.setCollideWorldBounds(true);
    this.lock = { kind, left, startKills: this.killed, total, suvsLeft: suvs, suvT: 0.8 };
    if (kind === 'boss') this.reachedBoss = true; // M4.3: the checkpoint
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
    this.follow = { on: true, lerp: 0.01, x: cam.scrollX, lag: Math.round(cam.scrollX - this.player.sprite.x) };
    cam.setScroll(sx, sy);
    this.tweens.add({ targets: this.follow, lerp: 0.15, duration: 1400, ease: 'Sine.easeIn' });
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

  /** a spawn point just off the nearer screen edge to x (M4.2) */
  private edgeX(x: number) { const cam = this.cameras.main; return x - cam.scrollX < GAME_W / 2 ? cam.scrollX - 12 : cam.scrollX + GAME_W + 12; }

  private spawnRat(kind: RatKind, x: number): Rat {
    const r = new Rat(this, x, this.groundY - 30, kind, (rat) => (rat.kind === 'baggage' ? this.rollCase(rat.sprite.x + rat.facing * 12, rat.facing) : this.throwCone(rat)));
    if (kind === 'lobbyist' && !this.lobbyTip) {
      this.lobbyTip = true;
      this.say('LOBBYIST! HE MAKES EVERY RAT TOUGHER.\nTAKE HIM OUT FIRST!', 0xf5c22e, 2600);
    }
    this.physics.add.collider(r.sprite, this.ground);
    this.rats.push(r);
    return r;
  }

  private spawnCar(lock: Lock) {
    const fromRight = lock.suvsLeft % 2 === 1 || Math.random() < 0.5;
    const x = fromRight ? lock.left + GAME_W + 40 : lock.left - 40;
    const car = new SuvRat(this, x, this.groundY, fromRight ? -1 : 1, lock.kind === 'build' ? 175 : 150, lock.kind === 'build' ? 2 : 3);
    this.cars.push(car);
    lock.suvsLeft--;
    floatText(this, Phaser.Math.Clamp(x, lock.left + 40, lock.left + GAME_W - 40), this.groundY - 64, 'HONK!', 'font_red', 0xffffff, 300);
  }

  /** M3.4: a suitcase rolled along the ground toward `dir`: jump it (or swat it) */
  private rollCase(x: number, dir: 1 | -1) {
    const c = this.physics.add.image(x, this.groundY - 6, 'world', 'suitcase').setOrigin(0.5, 1).setDepth(96).setFlipX(dir === -1);
    const b = c.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(false); b.setVelocityX(dir * 175); b.setSize(12, 10).setOffset(1, 2);
    c.setData('born', this.time.now);
    this.cases.push(c);
    sfx.throwIt();
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
    const kind = bk === 'foreman' ? 'foreman' : bk === 'megarat' ? 'megarat' : 'bureaucrat';
    if (kind === 'bureaucrat') {
      // Dog Fjord watches from his podium on the sidewalk (Ivan: "where was Dog Fjord?")
      this.dogFjord = this.add.image(l.left + 70, STREET_Y + 10, 'chars', 'dfs_pod').setOrigin(0.5, 0.97).setDepth(20).setFlipX(true); // M4.13: the new sprite faces left; turn him to the fight
      // 1.0: after the BOSS! banner and the boss's own shout have gone (all three landed on each other), on a panel
      this.time.delayedCall(1700, () => { if (this.dogFjord) { floatTextInView(this, this.dogFjord.x + 90, this.dogFjord.y - 84, 'GET HIM, PAPERWORK!', 'font_red', 0xffffff, 1400); sfx.laugh(); this.dogFjord.setFrame('dfs_podlaugh'); this.time.delayedCall(1500, () => this.dogFjord?.setFrame('dfs_pod')); } });
    }
    this.boss = new Boss(this, l.left + GAME_W - 90, this.groundY, {
      summon: (x) => { void x; this.spawnRat('basic', l.left + GAME_W + 10); this.time.delayedCall(400, () => this.spawnRat('basic', l.left - 10)); },
      clerksAlive: () => this.rats.filter((r) => r.alive).length,
      hurtPlayer: (fx) => { if (this.player.hurt(fx)) { shake(this, 140, 0.01); hitStop(this, 70); } },
    }, kind);
    this.physics.add.collider(this.boss.sprite, this.ground);
    this.enterFromRight([this.boss.sprite, ...this.boss.props]);
    this.flashGo('BOSS!');
    music.play(SONG_BOSS);
  }

  private startBuild() {
    const b = this.mission.action.build!;
    const l = this.lockArena('build', b.rats.length + b.suvs, b.suvs, this.buildPre ? this.arenaLeftAt(b.at) : undefined);
    this.build = this.buildPre ?? new BuildSpots(this, b, l.left, this.groundY);
    this.spawnRats(b.rats, l.left);
    this.flashGo('BUILD IT!');
    this.say('PUMP THE STAKES TO BUILD');
  }

  /** M4.3: a result card takes the screen: no banner fading out behind it */
  private clearGo() { this.tweens.killTweensOf(this.hud.go); this.hud.go.setAlpha(0); this.goBand?.destroy(); this.goBand = undefined; }

  private async win() {
    if (this.finished) return;
    this.finished = true;
    this.clearSay(); this.clearGo();
    this.player.frozen = true;
    music.play(SONG_WIN);
    sfx.ding();
    const a = this.mission.action;
    const head = a.escort ? 'RIGHT ON TIME!' : a.patrols ? 'THE SCIENCE IS SAVED!' : a.boss?.kind === 'highwaymech' ? 'THE GARDINER IS DOWN!' : a.depave?.style === 'rail' ? 'THE LINE IS FINISHED!' : a.build ? 'SCHOOL ZONE SLOWED!' : a.autoscroll ? 'BLOOR IS SAFE!' : a.depave?.style === 'fence' ? 'THE SHORE IS PUBLIC!' : a.depave?.style === 'stakes' ? 'THE PARK STAYS!' : a.depave ? 'THE LOT IS GREEN!' : 'STREET CLEARED!';
    const t = text(this, GAME_W / 2, 60, head, 'font_big').setScrollFactor(0).setDepth(3000);
    const ts = fitText(t, GAME_W - 16), th = t.height; t.setScale(0.1);
    this.tweens.add({ targets: t, scale: ts, duration: 300, ease: 'Back.easeOut' });
    const sub0 = this.escort ? `DELAY: ${this.escort.delay.toFixed(1)} S\nCLEARED: ${this.escort.cleared}` : this.peloton ? `RIDERS RALLIED: ${this.peloton.joinedTotal}\nRATS DEFEATED: ${this.killed}` : `RATS DEFEATED: ${this.killed}`;
    const firstWin = !ctx.state.completedMissions.includes(this.mission.id) && !this.replay;
    if (firstWin) this.earned += award(ctx.state, 'mission');
    // M4.3: the rank (hits taken; the escort: its delay); the best one is kept, replays can improve it
    const hits = this.carriedHits + this.player.hitsTaken;
    const r: MissionRank = this.escort ? { rank: rankByDelay(this.escort.delay), detail: `${this.escort.delay.toFixed(1)} S LATE` } : { rank: rankByHits(hits), detail: hits === 1 ? '1 HIT' : `${hits} HITS` };
    const rec = recordRank(ctx.state, this.mission.id, r);
    const sub = `${rankLine(r, rec)}\n${this.replay ? `${sub0}\nREPLAY: NO POINTS` : `${sub0}\nSCORE +${this.earned}${firstWin ? ' (MISSION BONUS)' : ''}`}`;
    if (this.peloton && !this.replay) ctx.state.ridersRallied += this.peloton.joinedTotal;
    const subT = fitText(text(this, GAME_W / 2, 60 + th / 2 + 8, sub, 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(3000).setCenterAlign(), GAME_W - 16, true);
    this.cardBand(60, th, subT);
    subT.setCharacterTint(0, `RANK ${r.rank}`.length, false, RANK_COLOR[r.rank]);
    if (!this.replay) ctx.state.ratsDefeated += this.killed + (this.escort?.cleared ?? 0);
    await new Promise((r) => this.time.delayedCall(2000, r));
    await iris(this, 'close', this.player.sprite.x - this.cameras.main.scrollX, this.player.sprite.y - 16, 500);
    this.physics.world.gravity.y = 0;
    ctx.save();
    const next = { from: 'mission', missionId: this.mission.id, won: true, district: this.mission.district, replay: this.replay };
    const [to, toData] = this.debugRun ? ['Title', { replay: { kind: 'mission', id: this.mission.id } }] as const : ['Explore', next] as const;
    // M3.3: after every second win Dog Fjord reacts to the Livability score (once per beat, never on replays)
    const done = ctx.state.completedMissions.includes(this.mission.id) ? ctx.state.completedMissions.length : ctx.state.completedMissions.length + 1;
    const beat = !this.replay && !this.debugRun && [2, 4, 6].includes(done) && !ctx.state.flags[`fjord_${done}`] ? `fjord_${done / 2}` : null;
    if (beat) { ctx.state.flags[`fjord_${done}`] = true; ctx.save(); }
    const ids = [this.mission.debrief, beat].filter((x): x is string => !!x);
    const vars = { LIV: String(livability([...ctx.state.upgrades, ...this.mission.upgrades])) };
    if (ids.length) this.scene.start('Cutscene', { ids, vars, next: to, nextData: toData });
    else this.scene.start(to, toData);
  }

  /**
   * M2.1 (Ivan): losing all hearts costs a LIFE and restarts the mission; out of lives sends you back to
   * the map (lives refilled). Failing an objective (the streetcar is late, the camera hits the pond)
   * just restarts, no life lost.
   */
  private async lose(msg = 'BONK!', costsLife = true) {
    if (this.finished) return;
    this.clearSay(); this.clearGo();
    this.finished = true;
    if (costsLife) music.play(SONG_LOSE); else music.stop();
    this.player.frozen = true;
    if (costsLife) ctx.state.lives = Math.max(0, ctx.state.lives - 1);
    const out = costsLife && ctx.state.lives <= 0;
    const loseT = text(this, GAME_W / 2, 70, out ? 'OUT OF LIVES!' : msg, 'font_big').setScrollFactor(0).setDepth(3000).setTint(0xff6347);
    const loseS = fitText(loseT, GAME_W - 16);
    const cp = this.reachedBoss && !out && !!this.mission.action.boss && this.mission.action.boss.kind !== 'laneeater';
    const sub = out ? 'BACK TO THE MAP TO REGROUP' : costsLife ? `-1 LIFE   LIVES LEFT: ${ctx.state.lives}${cp ? '\nBACK TO THE BOSS' : ''}` : 'TRY AGAIN';
    const loseSub = fitText(text(this, GAME_W / 2, 84, sub, 'font_outline').setOrigin(0.5, 0).setScrollFactor(0).setDepth(3000).setCenterAlign(), GAME_W - 16, true);
    this.cardBand(70, loseT.height, loseSub); void loseS;
    if (costsLife) { sfx.hurt(); shake(this, 300, 0.01); }
    if (out) ctx.state.lives = START_LIVES;
    ctx.save();
    await new Promise((r) => this.time.delayedCall(2200, r));
    await iris(this, 'close');
    if (out) { this.physics.world.gravity.y = 0; if (this.debugRun) this.scene.start('Title', { replay: { kind: 'mission', id: this.mission.id } }); else this.scene.start('Explore', { district: this.mission.district, from: undefined }); }
    else this.scene.restart({ mission: this.mission.id, debug: this.debugRun, replay: this.replay, checkpoint: cp, hits: this.carriedHits + this.player.hitsTaken });
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
      else if (a.depave && !this.depave && !this.depaveDone && px > a.depave.at) {
        const l = this.lockArena('depave', a.depave.rats.length, 0, this.depavePre ? this.arenaLeftAt(a.depave.at) : undefined);
        this.depave = this.depavePre ?? new DepaveSpots(this, a.depave, l.left, this.groundY);
        this.spawnRats(a.depave.rats, l.left);
        this.flashGo(this.depave.fence ? 'TEAR IT DOWN!' : this.depave.stakes ? 'PULL THE STAKES!' : this.depave.rail ? 'LAY THE TRACK!' : 'DEPAVE IT!');
        this.say(this.depave.fence ? 'PUMP THE FENCES DOWN' : this.depave.stakes ? 'PUMP THE STAKES OUT OF THE GROUND' : this.depave.rail ? 'PUMP THE RAIL PILES INTO TRACK' : 'PUMP THE CRACKED ASPHALT');
      }
      else if (a.boss?.kind === 'monstersuv' && !this.monster && px > a.boss.at) {
        const l = this.lockArena('boss', 0);
        this.monster = new MonsterSuv(this, l.left + GAME_W - 70, this.groundY, { left: l.left, right: l.left + GAME_W });
        this.enterFromRight([this.monster.img]);
        // M3.4 (Ivan: "only leave the pallets"): low pallet stacks, lower than the SUV. Standing on one you're
        // still in its way; a jump from it clears the roof. No more shelters to hide on
        for (const sx of [l.left + 90, l.left + GAME_W / 2, l.left + GAME_W - 90]) this.oneWay(sx, this.groundY - 26, 30, 'pallets');
        this.flashGo('BOSS!'); music.play(SONG_BOSS);
        this.time.delayedCall(1300, () => this.say('JUMP ITS CHARGE FROM THE PALLETS.\nSTOMP ITS ROOF. PUMP IT WHEN IT STALLS!', 0xfff08a, 3200));
      }
      else if (a.boss?.kind === 'spadigger' && !this.digger && px > a.boss.at) {
        const l = this.lockArena('boss', 2);
        this.digger = new SpaDigger(this, l.left + GAME_W - 100, this.groundY, { left: l.left, right: l.left + GAME_W }, (fx) => { if (this.player.hurt(fx)) { shake(this, 150, 0.01); hitStop(this, 70); } });
        this.enterFromRight([this.digger.img]);
        this.time.delayedCall(1500, () => { const L2 = this.lock; if (L2) ['basic', 'lobbyist'].forEach((k, i) => this.time.delayedCall(i * 600, () => this.spawnRat(k as RatKind, L2.left - 10))); });
        this.flashGo('BOSS!'); music.play(SONG_BOSS);
        this.time.delayedCall(1300, () => this.say('THE BUCKET SLAMS WHERE ITS SHADOW FALLS.\nPUMP THE STUCK ARM. STOMP THE CAB!', 0xfff08a, 3400));
      }
      else if (a.boss?.kind === 'jettug' && !this.tug && px > a.boss.at) {
        const l = this.lockArena('boss', 0);
        this.tug = new JetTug(this, l.left + GAME_W - 120, this.groundY, { left: l.left, right: l.left + GAME_W }, (x, d) => this.rollCase(x, d));
        this.physics.add.collider(this.player.sprite, this.tug.platform); // ride the jet's fuselage
        this.flashGo('BOSS!'); music.play(SONG_BOSS);
        this.time.delayedCall(1300, () => this.say('ONLY THE TUG HURTS. RIDE THE JET!\nSTOMP ITS ROOF. PUMP IT WHEN IT REFUELS!', 0xfff08a, 3600));
      }
      else if (a.boss && a.boss.kind !== 'laneeater' && a.boss.kind !== 'monstersuv' && a.boss.kind !== 'spadigger' && a.boss.kind !== 'jettug' && a.boss.kind !== 'wrecker' && a.boss.kind !== 'highwaymech' && !this.boss && px > a.boss.at) this.startBoss();
      else if (a.boss?.kind === 'highwaymech' && !this.mech && px > a.boss.at) {
        const l = this.lockArena('boss', 0);
        this.mech = new HighwayMech(this, l.left + GAME_W - 88, this.groundY, { left: l.left, right: l.left + GAME_W }, {
          hurt: (fx) => { if (this.player.hurt(fx)) { shake(this, 150, 0.012); hitStop(this, 80); } },
          // 1.0: the hint sits by the slab, not in the top box (that box covered the mech's ANOTHER LANE sign)
          lane: (x) => { this.oneWay(x, this.groundY - 52, 66, 'slabplat', true); this.time.delayedCall(450, () => !this.finished && floatTextInView(this, x, this.groundY - 74, 'A SLAB FELL! JUMP ON IT,\nTHEN ONTO THE DECK!', 'font_outline', 0x9bd35a, 2200)); },
        });
        this.enterFromRight([this.mech.img]);
        this.flashGo('FINAL BOSS!'); music.play(SONG_BOSS);
        this.time.delayedCall(1500, () => this.say('JUMP THE SHOCKWAVES AND THE CARS!\nPUMP THE GLOWING VENT. STOMP ITS DECK!', 0xfff08a, 3600));
      }
      else if (a.build && !this.build && !this.buildDone && this.chaseDone && px > a.build.at) this.startBuild();
      // M4.17: the rats start off screen ahead; they bolt when the raccoon catches up with them
      else if (a.chase?.startAt && !this.chase && !this.chaseDone && px > a.chase.startAt) this.chase = new Chase(this, a.chase, px, this.groundY, this.cameras.main.scrollX + GAME_W + 40, () => { this.flashGo('AFTER THEM!'); this.say('THEY\'VE GOT THE EXHIBITS!\nCATCH THEM BEFORE THE TRUCK!', 0xfff08a, 2400); });
      else if (a.boss?.kind === 'wrecker' && !this.wrecker && px > a.boss.at) {
        const l = this.lockArena('boss', 0);
        this.wrecker = new Wrecker(this, l.left + GAME_W - 70, this.groundY, { left: l.left, right: l.left + GAME_W });
        this.enterFromRight([this.wrecker.img]);
        this.flashGo('BOSS!'); music.play(SONG_BOSS);
        this.time.delayedCall(1300, () => this.say('IT CAN ONLY BE HIT WHILE THE BALL IS STUCK.\nTHEN GET CLEAR: JUMP THE SWING!', 0xfff08a, 3600));
      }
    }

    // ---- the Lane Eater: auto-scroll, the peloton, the machine ----
    if (this.peloton && this.eater && !this.finished) {
      const as = a.autoscroll!;
      if (this.scrolling && !this.player.frozen) {
        const speed = as.speed;
        this.autoX = Math.min(this.autoX + speed * (dt / 1000), as.end - GAME_W);
        cam.scrollX = Math.floor(this.autoX);
        // keep the raccoon on screen: the left edge pushes
        const lo = cam.scrollX + 14, hi = cam.scrollX + GAME_W - 14;
        if (px < lo) { this.player.sprite.x = lo; if (pb.velocity.x < speed) pb.setVelocityX(speed); }
        if (px > hi) { this.player.sprite.x = hi; pb.setVelocityX(Math.min(pb.velocity.x, 0)); }
        if (this.input2.justPressed('act')) this.peloton.ring(px);
        const hurtBy = (fx: number) => { if (this.player.hurt(fx)) { shake(this, 140, 0.01); hitStop(this, 60); } };
        this.eater.chase(dt, this.peloton.size, px, pb.velocity.x, cam.scrollX, GAME_W, this.autoX / (as.end - GAME_W), pRect, this.player.onGround, hurtBy);
        if (this.eater.touching(pRect)) { if (this.player.hurt(this.eater.x)) shake(this, 150, 0.01); pb.setVelocityX(170); }
        // ambushes: rats step out ahead
        while (this.ambushIdx < (as.ambush?.length ?? 0) && cam.scrollX + GAME_W > as.ambush![this.ambushIdx].at) {
          const am = as.ambush![this.ambushIdx++];
          am.rats.forEach((k, j) => this.time.delayedCall(j * 500, () => this.spawnRat(k, cam.scrollX + GAME_W + 10)));
          sfx.squeak();
        }
        // end of the street: the machine turns on you
        if (this.autoX >= as.end - GAME_W - 0.5) {
          this.scrolling = false;
          const l = this.lockArena('boss', 0);
          this.eater.startBoss(l.left, l.left + GAME_W);
          this.peloton.parkAt = l.left + GAME_W - 20; this.peloton.dismissWaiting();
          this.time.delayedCall(900, () => this.say('IT CHARGES: JUMP THE GRINDER!\nPUMP THE CAB + CONVEYOR ANY TIME.\nPUMP THE GRINDER WHEN IT OVERHEATS!', 0xfff08a, 3400));
          this.flashGo('BOSS!'); music.play(SONG_BOSS);
        }
      }
      this.peloton.update(dt, px, cam.scrollX);
      if (this.eater.boss) {
        this.eater.updateBoss(dt, px, pRect, this.player.onGround, (fx) => { if (this.player.hurt(fx)) { shake(this, 140, 0.01); hitStop(this, 70); } },
          (side) => { const L2 = this.lock; if (L2) this.spawnRat('construction', side === 1 ? L2.left + GAME_W + 10 : L2.left - 10); },
          this.rats.filter((r) => r.alive).length);
        this.eater.takeHits(hits, () => { hitStop(this, 120); });
        if (!this.eater.alive && !this.bossDone) {
          this.bossDone = true; this.clearSay(); this.killed++; this.pts('boss', this.eater.x, this.groundY - 90);
          for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99998 }, px);
          this.peloton.riders.forEach((r, i) => this.tweens.add({ targets: r, y: r.y - 8, duration: 160, yoyo: true, repeat: 3, delay: i * 50 }));
          this.time.delayedCall(1500, () => this.endArena());
        }
      }
    }

    // ---- the parking lot: depave + the Monster SUV ----
    if (this.depave && !this.depaveDone) this.depave.update(hits, px);
    // ---- the Pink Digger (mission 8) ----
    if (this.digger) {
      const d = this.digger;
      d.update(dt, px, pRect);
      if (d.alive) {
        const rr = d.roofRect();
        if (this.landingOn(pRect, d.roofY(), rr.x, rr.right, d)) {
          if (d.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 7900 + Math.floor(this.time.now / 150) }, 'stomp')) { this.stompStar(); this.player.bounce(); hitStop(this, 70); }
        } else {
          const ar = d.armRect();
          for (const h of hits) if (overlap(h, ar) && d.hit(h, 'pump')) { this.impact(h, ar); hitStop(this, 70); shake(this, 90, 0.005); }
          if (Phaser.Geom.Rectangle.Overlaps(d.rect(), pRect) && pRect.bottom > d.roofY() + 40 && this.player.hurt(d.x)) { shake(this, 140, 0.01); hitStop(this, 70); }
        }
      } else if (!this.bossDone) {
        this.bossDone = true; this.clearSay(); this.killed++; this.pts('boss', d.x, this.groundY - 100);
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99996 }, px);
        this.time.delayedCall(1700, () => this.endArena());
      }
    }
    if (this.monster) {
      const m = this.monster;
      m.update(dt, px);
      if (m.alive) {
        // M4.16: Megamart's rats join in: two when it rolls in, two more at half its health, two at a quarter
        const wave = m.hp <= m.maxHp / 4 ? 3 : m.hp <= m.maxHp / 2 ? 2 : 1, L = this.lock;
        if (wave > this.monsterWaves && L) {
          const kinds: RatKind[][] = [[], ['basic', 'traffic'], ['construction', 'basic'], ['traffic', 'construction']];
          this.monsterWaves = wave;
          this.time.delayedCall(wave === 1 ? 1500 : 300, () => kinds[wave].forEach((k, i) => this.time.delayedCall(i * 600, () => { if (this.lock && m.alive) this.spawnRat(k, i % 2 ? this.lock.left + GAME_W + 10 : this.lock.left - 10); })));
        }
        const mr = m.rect();
        if (this.landingOn(pRect, m.roofY(), mr.x + 6, mr.right - 6, m)) {
          if (m.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 7700 + Math.floor(this.time.now / 150) }, 'stomp')) { this.stompStar(); this.player.bounce(); hitStop(this, 70); }
        } else {
          const tr = m.tyreRect();
          for (const h of hits) if (overlap(h, tr) && m.hit(h, 'pump')) { this.impact(h, tr); hitStop(this, 70); shake(this, 90, 0.005); }
          if (m.dangerous && Phaser.Geom.Rectangle.Overlaps(m.frontRect(), pRect) && pRect.bottom > m.roofY() + 8 && this.player.hurt(m.x)) { shake(this, 160, 0.012); hitStop(this, 80); }
        }
      } else if (!this.bossDone) {
        this.bossDone = true; this.clearSay(); this.killed++; this.pts('boss', m.x, this.groundY - 90);
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99997 }, px);
        this.time.delayedCall(1300, () => this.endArena());
      }
    }

    // ---- mission 6: the guards' flashlights (hidden behind a crate = safe), the Wrecker ----
    if (this.patrols.length) {
      const hidden = this.player.onGround && this.crates.some((cx) => Math.abs(px - cx) < 16);
      for (const pt of this.patrols) pt.update(dt, pRect, hidden);
      // hidden: the raccoon goes into the crate's shadow; near a crate, a bobbing HIDE shows where to stand
      if (this.player.invulnT <= 0) this.player.sprite.setAlpha(hidden ? 0.55 : 1); // M4.3 (review): keep the hurt blink
      const near = this.crates.find((cx) => Math.abs(px - cx) < 60 && Math.abs(px - cx) >= 16);
      const guarded = this.patrols.some((pt) => !pt.alarmed && pt.rat.alive && Math.abs(pt.rat.sprite.x - px) < 260);
      if (!this.hideTag) this.hideTag = text(this, 0, 0, 'HIDE HERE', 'font_outline').setDepth(212).setTint(0xfff08a).setVisible(false);
      const tagAt = hidden ? this.crates.find((cx) => Math.abs(px - cx) < 16) : near;
      this.hideTag.setVisible(guarded && tagAt !== undefined).setText(hidden ? 'HIDDEN' : 'HIDE HERE').setTint(hidden ? 0x9bd35a : 0xfff08a);
      if (tagAt !== undefined) this.hideTag.setPosition(tagAt, this.groundY - 48 + Math.sin(this.time.now / 160) * 2);
    }
    if (this.wrecker) {
      const wk = this.wrecker;
      wk.update(dt, px);
      if (wk.alive) {
        const rr = wk.roofRect();
        if (this.landingOn(pRect, wk.roofY(), rr.x, rr.right, wk)) {
          if (wk.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 7500 + Math.floor(this.time.now / 150) }, 'stomp')) { this.stompStar(); this.player.bounce(); hitStop(this, 70); }
        } else {
          const er = wk.engineRect();
          for (const h of hits) if (overlap(h, er) && wk.hit(h, 'pump')) { this.impact(h, er); hitStop(this, 70); shake(this, 90, 0.005); }
          // M4.2: only the ball (and its shockwaves) hurt; the truck itself is safe to stand by and pump
          if (wk.touches(pRect) && this.player.hurt(wk.ballPos().x)) { shake(this, 200, 0.014); hitStop(this, 90); }
          else if (wk.waveHits(pRect, this.player.onGround) && this.player.hurt(wk.ballPos().x)) { shake(this, 140, 0.01); hitStop(this, 70); }
        }
      } else if (!this.bossDone) {
        this.bossDone = true; this.clearSay(); this.killed++; this.pts('boss', wk.x, this.groundY - 90);
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99994 }, px);
        this.time.delayedCall(1500, () => this.endArena());
      }
    }
    // ---- the Highway Mech (mission 10) ----
    if (this.mech) {
      const m = this.mech;
      m.update(dt, px, pRect, this.player.onGround);
      if (m.alive) {
        const rr = m.roofRect();
        if (this.landingOn(pRect, m.roofY(), rr.x, rr.right, m)) {
          if (m.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 7400 + Math.floor(this.time.now / 150) }, 'stomp')) { this.stompStar(); this.player.bounce(); hitStop(this, 70); }
        } else {
          const cr = m.chestRect();
          for (const h of hits) if (overlap(h, cr) && m.hit(h, 'pump')) { this.impact(h, cr); hitStop(this, 70); shake(this, 90, 0.005); }
        }
      } else if (!this.bossDone) {
        this.bossDone = true; this.clearSay(); this.killed++; this.pts('boss', m.x, this.groundY - 120);
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99993 }, px);
        this.time.delayedCall(2200, () => this.endArena());
      }
    }
    // ---- the Jet Tug (mission 11) ----
    if (this.tug) {
      const g = this.tug;
      g.update(dt, px);
      if (g.alive) {
        const rr = g.roofRect();
        if (g.blast(pRect, pb, dt / 1000) && !this.player.frozen && Math.random() < 0.05) floatText(this, px, pRect.y - 12, 'WHOOSH', 'font', 0xc9c5d1, 200);
        if (this.landingOn(pRect, g.roofY(), rr.x, rr.right, g)) {
          if (g.hit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 7600 + Math.floor(this.time.now / 150) }, 'stomp')) { this.stompStar(); this.player.bounce(); hitStop(this, 70); }
        } else {
          const tr = g.tugRect();
          for (const h of hits) if (overlap(h, tr) && g.hit(h, 'pump')) { this.impact(h, tr); hitStop(this, 70); shake(this, 90, 0.005); }
          if (g.dangerous && Phaser.Geom.Rectangle.Overlaps(g.rect(), pRect) && pRect.bottom > g.roofY() + 10 && this.player.hurt(g.x)) { shake(this, 150, 0.012); hitStop(this, 80); }
        }
      } else if (!this.bossDone) {
        this.bossDone = true; this.clearSay(); this.killed++; this.pts('boss', g.x, this.groundY - 90);
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99995 }, px);
        this.time.delayedCall(1500, () => this.endArena());
      }
    }
    // ---- rolling suitcases ----
    for (const c of [...this.cases]) {
      if (!c.active) { this.cases.splice(this.cases.indexOf(c), 1); continue; }
      const cb = c.body as Phaser.Physics.Arcade.Body, cRect = new Phaser.Geom.Rectangle(cb.x, cb.y, cb.width, cb.height);
      if (hits.some((h) => overlap(h, cRect))) { sfx.clang(); puff(this, c.x, c.y - 6, 0x7cc6f2, 6, 14, 96); c.destroy(); continue; }
      if (Phaser.Geom.Rectangle.Overlaps(cRect, pRect) && this.player.hurt(c.x)) { shake(this, 120, 0.008); c.destroy(); continue; }
      const bl = this.lock ? this.lock.left : cam.scrollX;
      const old = this.time.now - (c.getData('born') as number) > 3200, out = c.x < bl - 60 || c.x > bl + GAME_W + 60;
      if (old || out) { puff(this, c.x, c.y - 6, 0xc9c5d1, 4, 10, 96); c.destroy(); }
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
      } else if (st === 'splash') { this.chaseDone = true; void this.lose(a.chase!.goal === 'truck' ? 'IT\'S IN THE TRUCK. GONE.' : 'SPLASH! IT\'S IN THE POND.', false); }
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
      if (this.landingOn(pRect, c.roofY(), cr.x + 4, cr.right - 4, c)) {
        if (c.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 0, id: 9000 + Math.floor(this.time.now / 150) })) { this.stompStar(); this.player.bounce(); hitStop(this, 60); if (!c.alive) { this.killed++; this.pts('suv', c.x, this.groundY - 50); } }
        continue;
      }
      let wasHit = false;
      for (const h of hits) if (overlap(h, cr) && c.takeHit(h)) { wasHit = true; this.impact(h, cr); hitStop(this, 60); shake(this, 80, 0.005); if (!c.alive) { this.killed++; this.pts('suv', c.x, this.groundY - 50); } }
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
        for (const h of hits) if (overlap(h, bRect) && this.boss.takeHit(h, px)) { this.impact(h, bRect); hitStop(this, h.dmg > 1 ? 100 : 55); shake(this, 90, h.dmg > 1 ? 0.01 : 0.004); }
        if (pb.velocity.y > 60 && pRect.bottom < bRect.y + 10 && overlap({ x: pRect.x, y: pRect.y, w: pRect.width, h: pRect.height }, bRect)) {
          if (this.boss.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 260, id: 8000 + Math.floor(this.time.now / 200) }, px)) { this.stompStar(); this.player.bounce(); }
        }
        const bab = this.boss.attackBox();
        if (bab && overlap(bab, pRect) && this.player.hurt(this.boss.sprite.x)) { shake(this, 150, 0.01); hitStop(this, 80); }
      } else if (!this.bossDone) {
        this.bossDone = true; this.clearSay();
        this.killed++; this.pts('boss', this.boss.sprite.x, this.groundY - 90);
        for (const r of this.rats) if (r.alive) r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 99, kb: 120, id: 99999 }, px);
        if (this.dogFjord) {
          const df = this.dogFjord;
          floatText(this, df.x + 60, df.y - 84, 'THIS ISN\'T OVER!', 'font_red', 0xffffff, 900);
          this.tweens.add({ targets: df, x: df.x - 200, duration: 1400, delay: 500, ease: 'Quad.easeIn' });
        }
        this.time.delayedCall(1300, () => this.endArena(this.mission.action.boss?.kind === 'foreman' ? 'LANE OPEN! >>' : this.mission.action.boss?.kind === 'megarat' ? 'ALL ABOARD! >>' : 'KING ST IS OPEN! >>'));
      }
    }

    // ---- rats ----
    // M3.1 (Ivan): a lobbyist anywhere on screen lobbies for EVERY rat on screen (a third of the damage)
    const onScreen = (x: number) => x > cam.scrollX - 16 && x < cam.scrollX + GAME_W + 16;
    const lobbying = this.rats.some((r) => r.alive && r.kind === 'lobbyist' && onScreen(r.sprite.x));
    for (const r of this.rats) r.shielded = lobbying && r.kind !== 'lobbyist' && onScreen(r.sprite.x);
    for (const r of this.rats) {
      r.update(dt, px);
      if (!r.alive) continue;
      const rb = r.body, rRect = new Phaser.Geom.Rectangle(rb.x, rb.y, rb.width, rb.height);
      let wasHit = false;
      for (let h of hits) if (overlap(h, rRect)) {
        // M3.4: a Barrier Rat's board takes anything from the front; get behind it, or stomp
        if (r.blocks(px)) { if (newHit(h.id)) { sfx.clang(); puff(this, r.sprite.x + r.facing * 10, r.sprite.y - 16, 0xff9a2e, 6, 14, 95); floatText(this, r.sprite.x, r.sprite.y - 40, 'BLOCKED!', 'font', 0xff9a2e, 300); } wasHit = true; continue; }
        // M4.4: a guard on patrol hit from behind is a one-hit TAKEDOWN; from the front, it raises the alarm
        const watch = this.patrols.find((pt) => pt.rat === r && !pt.alarmed);
        if (watch && watch.behind(px)) { h = { ...h, dmg: 99 }; floatText(this, r.sprite.x, r.sprite.y - 44, 'TAKEDOWN!', 'font_outline', 0x9bd35a, 600); }
        else if (watch) watch.alarm();
        if (!r.takeHit(h, px)) continue;
        wasHit = true; this.impact(h, rRect);
        hitStop(this, h.dmg > 1 ? 90 : 50); shake(this, 90, h.dmg > 1 ? 0.008 : 0.004);
        if (!r.alive) { this.killed++; if (!this.replay) { r.reward = `+${award(ctx.state, 'rat')}`; this.earned += POINTS_OF(r.reward); } }
      }
      if (!wasHit && pb.velocity.y > 60 && pRect.bottom < rRect.y + 10 && overlap({ x: pRect.x, y: pRect.y, w: pRect.width, h: pRect.height }, rRect)) {
        if (r.takeHit({ x: 0, y: 0, w: 0, h: 0, dmg: 1, kb: 60, id: 5000 + Math.floor(this.time.now / 200) }, px)) { this.stompStar(); this.player.bounce(); hitStop(this, 50); if (!r.alive) { this.killed++; if (!this.replay) { r.reward = `+${award(ctx.state, 'rat')}`; this.earned += POINTS_OF(r.reward); } } }
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
      else if (L.kind === 'depave' && this.depave?.allDone && this.rats.every((r) => !r.alive)) { this.depaveDone = true; this.depave.finish(); this.endArena(this.depave.fence ? 'OPEN! >>' : this.depave.stakes ? 'PARK! >>' : this.depave.rail ? 'ALL ABOARD! >>' : 'GREEN! >>'); }
      else if (L.kind === 'caught' && this.killed - L.startKills >= L.total) { const truck = a.chase?.goal === 'truck'; floatText(this, px, this.groundY - 60, truck ? 'EXHIBITS RECOVERED!' : 'CAMERA RECOVERED!', 'font_outline', 0x9bd35a, 900); this.endArena(truck ? 'TO THE CENTRE! >>' : 'TO THE SCHOOL! >>'); }
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
    this.scoreObjectives();
    this.hud.score.setText(this.replay ? 'REPLAY' : fmtScore(ctx.state.score));
    if (this.player.dead) void this.lose();
    if (this.player.sprite.y > GAME_H + 40) { this.player.hp = 0; this.player.dead = true; }
    this.drawHud();
  }
}
