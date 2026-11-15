// M4: the ending. After the last mission's payoff and Dog Fjord's concession: the run's numbers, then the
// credits roll, then back to the title. The run is saved and sent to the leaderboard before anything shows.
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { InputManager } from '../input/InputManager';
import { text, iris, wrapLines } from '../ui/fx';
import { ScrollLayer, STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { ctx } from '../core/ctx';
import { livability, tierName } from '../core/Livability';
import { endStats } from '../core/Livability';
import { fmtScore, DIFFICULTY } from '../core/Score';
import { submitRun } from '../core/Leaderboard';
import { music } from '../audio/Sequencer';
import { SONG_MAIN } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { CREDITS_LINES, DISCLAIMER_LINES } from '../data/villain';
import { wantsTouch } from '../input/TouchControls';
import { MISSIONS } from '../data/missions';

export class EndingScene extends Phaser.Scene {
  private input2!: InputManager;
  private layers: ScrollLayer[] = [];
  private scroll = 0;
  private done = false;
  private roll?: Phaser.GameObjects.Container;
  private rollY = 0;
  private rollH = 0;
  private stage: 'stats' | 'credits' | 'end' = 'stats';

  constructor() { super('Ending'); }

  create() {
    this.input2 = new InputManager(this);
    this.done = false; this.stage = 'stats'; this.scroll = 0;
    ctx.state.flags.ended = true;
    ctx.save();
    void submitRun(ctx.state);
    this.layers = [
      new ScrollLayer(this, 'sky_dusk', 0, 0),
      new ScrollLayer(this, 'skyline_dusk', SKYLINE_Y + 22, 0.08, 60),
      new ScrollLayer(this, 'backrow_dusk', BACKROW_Y + 8, 0.25),
      new ScrollLayer(this, 'facades_qw', FRONT_Y.queen, 0.6, 0, 0, 0xc8a8d8),
      new ScrollLayer(this, 'street_protected', STREET_Y, 1, 0, 0, 0xd0b8d8),
    ];
    const rider = this.add.sprite(GAME_W / 2, GROUND_Y + 4, 'chars', 'rs_2').setOrigin(0.5, 42 / 44).play('rs_ride');
    this.tweens.add({ targets: rider, y: GROUND_Y + 3, duration: 400, yoyo: true, repeat: -1 });
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x16121f, 0.55).setOrigin(0).setDepth(5);
    music.play(SONG_MAIN, { bpm: 126 });
    void iris(this, 'open');
    this.showStats();
    this.input.on('pointerdown', () => this.advance());
  }

  private showStats() {
    const s = ctx.state, st = endStats(s.upgrades), liv = livability(s.upgrades);
    const total = Object.keys(MISSIONS).length, done = s.completedMissions.length;
    const lines: [string, string][] = [
      ['MISSIONS', `${done} / ${total}`],
      ['LIVABILITY', `${liv} / 100`],
      ['PROTECTED BIKE LANES', String(st.bikeLanes)],
      ['PARKS + PUBLIC SPACES', String(st.parksCreated)],
      ['TRANSIT UPGRADES', String(st.transitUpgrades)],
      ['HIGHWAY LANES REMOVED', String(st.lanesRemoved)],
      ['SAFER SCHOOL ZONES', String(st.protectedIntersections)],
      ['RIDERS RALLIED', String(s.ridersRallied)],
      ['RATS DEFEATED', String(s.ratsDefeated)],
      ['SCORE', `${fmtScore(s.score)}  (${DIFFICULTY[s.difficulty].label})`],
    ];
    const c = this.add.container(0, 0).setDepth(10);
    c.add(text(this, GAME_W / 2, 14, "THE RACCOON'S REPORT CARD", 'font_big'));
    c.add(text(this, GAME_W / 2, 28, tierName(liv), 'font').setTint(0x9bd35a));
    lines.forEach(([k, v], i) => {
      const y = 44 + i * 13;
      const a = text(this, GAME_W / 2 - 8, y, k, 'font_outline', 0).setOrigin(1, 0.5).setAlpha(0), b = text(this, GAME_W / 2 + 8, y, v, 'font_outline', 0).setOrigin(0, 0.5).setTint(0xfff08a).setAlpha(0);
      c.add([a, b]);
      this.time.delayedCall(300 + i * 260, () => { a.setAlpha(1); b.setAlpha(1); sfx.blip(); });
    });
    const hint = text(this, GAME_W / 2, GAME_H - 12, wantsTouch() ? '> TAP <' : '> ENTER <', 'font_outline').setTint(0x9bd35a).setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, delay: 300 + lines.length * 260 + 400, duration: 300 });
    c.add(hint);
    this.roll = c;
  }

  private showCredits() {
    this.roll?.destroy();
    const lines = ['TRASH PANDA: RIGHT OF WAY', '', ...CREDITS_LINES, '', '', ...DISCLAIMER_LINES, '', '', 'THANK YOU FOR RIDING.', '', 'TORONTO IS A PRETTY GOOD CITY.', 'KEEP FIXING IT.'];
    const c = this.add.container(0, GAME_H).setDepth(10);
    let y = 0;
    for (const l of lines) {
      if (!l) { y += 8; continue; }
      const big = l === 'TRASH PANDA: RIGHT OF WAY' || l === 'THANK YOU FOR RIDING.';
      const words = big ? [l] : wrapLines(this, 'font_outline', l, GAME_W - 24);
      for (const w of words) { c.add(text(this, GAME_W / 2, y, w, big ? 'font_big' : 'font_outline')); y += big ? 18 : 11; }
    }
    this.rollH = y; this.rollY = GAME_H;
    this.roll = c;
  }

  private advance() {
    if (this.stage === 'stats') { this.stage = 'credits'; sfx.select(); this.showCredits(); }
    else if (this.stage === 'credits') { this.stage = 'end'; this.finish(); }
  }
  private async finish() {
    if (this.done) return;
    this.done = true;
    sfx.bell();
    await iris(this, 'close');
    this.scene.start('Title', {});
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.scroll += dt * 0.05;
    for (const l of this.layers) l.update(this.scroll);
    if (this.stage === 'credits' && this.roll) {
      this.rollY -= dt * 0.022;
      this.roll.setY(Math.round(this.rollY));
      if (this.rollY < -this.rollH - 20) void this.finish();
    }
    if (this.input2.justPressed('confirm')) this.advance();
    if (this.input2.justPressed('back')) void this.finish();
  }
}
