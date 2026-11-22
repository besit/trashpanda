// M4.1 (Ivan: "share buttons for socials... after each mission, small buttons. It should generate an image with
// our raccoon and maybe Dog Fjord... 3-5 poster-like images, portrait and landscape, with the game progress or the
// livability score and their scores on top"). An overlay that composes a pixel-art poster, stamps the player's
// numbers on it, upscales it with hard pixels, and hands it to X / Facebook / Instagram (the phone's share sheet when
// there is one) or saves it.
// M4.4 (Ivan: "a lot of the text is just unreadable... they need to be higher res... a hero portrait of the raccoon...
// posters in the style of legendary games, like a VS screen"): posters are composed at 768 x 432 (tall 432 x 768),
// twice the game's resolution. The street scenes are drawn at 2x; the hero portraits, the emblem and every word are
// drawn on the finer grid, and the export is that x3 (2304 x 1296). The preview on screen is the exported PNG itself,
// shown over the game at the device's own resolution (the game canvas would shrink it back to 384 x 216).
import { networkDone, NETWORK_TOTAL } from '../data/network';
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { ctx } from '../core/ctx';
import { livability } from '../core/Livability';
import { fmtScore, HighScores, DIFFICULTY } from '../core/Score';
import { MISSIONS } from '../data/missions';
import { text } from '../ui/fx';
import { sfx } from '../audio/sfx';
import { STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { InputManager } from '../input/InputManager';
import type { Manifest } from './BootScene';

export interface ShareSceneData { from: string; mission?: string; poster?: string; portrait?: boolean }

export const GAME_URL = 'https://besit.github.io/trashpanda/';
/** M4.4: the classics first (VS screen, title screen, boss select, high scores...), then the street scenes */
export const POSTERS = ['versus', 'title', 'sunset', 'bosses', 'streets', 'scores', 'queen', 'faceoff', 'bikebus', 'lake'] as const;
type Poster = typeof POSTERS[number];
const S = 2;  // the street scenes: game pixels drawn 2x on the poster's grid
const UP = 3; // the exported image: 3x the poster (2304 x 1296 wide, 1296 x 2304 tall), hard pixels
const LINK = 'BESIT.GITHUB.IO/TRASHPANDA';

type FontKey = 'font' | 'font_outline' | 'font_big' | 'font_red';

/** the bosses of the boss-select poster, in mission order: [mission, atlas, frame, name] */
const BOSSES: [string, string, string, string][] = [
  ['bike_lane_war', 'chars', 'rat_foreman_0', 'THE FOREMAN'],
  ['king_of_street', 'chars', 'rat_bureaucrat_0', 'THE BUREAUCRAT'],
  ['lane_eater', 'world', 'laneeater_0', 'LANE EATER'],
  ['great_parking_lot', 'world', 'monstersuv_0', 'MONSTER SUV'],
  ['waterfront_heist', 'world', 'digger_0', 'SPA DIGGER'],
  ['save_the_science', 'world', 'wrecker', 'THE WRECKER'],
  ['finish_the_line', 'chars', 'rat_megarat_0', 'MEGA RAT'],
  ['island_airport', 'world', 'jettug_0', 'JET TUG'],
  ['death_by_highway', 'world', 'highwaymech_0', 'HIGHWAY MECH'],
];

export class ShareScene extends Phaser.Scene {
  private from = '';
  private mission?: string;
  private poster = 0;
  private portrait = false;
  private rt?: Phaser.GameObjects.RenderTexture;
  private file?: File;
  private fileUrl?: string;
  private status!: Phaser.GameObjects.BitmapText;
  private buttons: { t: Phaser.GameObjects.BitmapText; act: () => void }[] = [];
  private input2!: InputManager;
  private token = 0;
  /** the crisp preview: the exported PNG in an <img> over the canvas */
  private view?: HTMLImageElement;

  constructor() { super('Share'); }

  init(data: ShareSceneData) {
    this.from = data.from; this.mission = data.mission; this.file = undefined;
    this.poster = Math.max(0, POSTERS.indexOf((data.poster ?? '') as Poster)); this.portrait = !!data.portrait;
  }

  preload() {
    // the posters' own art (portraits, emblem, ribbon): loaded the first time the share screen opens
    const m = this.registry.get('manifest') as Manifest | undefined;
    if (m?.posters && !this.textures.exists('posters')) this.load.atlas('posters', m.posters.png, m.posters.json);
  }

  create() {
    this.input2 = new InputManager(this);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x16121f, 0.94).setOrigin(0).setScrollFactor(0);
    text(this, GAME_W / 2, 8, 'SHARE YOUR CITY', 'font_outline').setTint(0xfff08a);
    this.status = text(this, GAME_W / 2, GAME_H - 26, '', 'font').setTint(0x9793a6);
    this.buttons = [];
    // the poster arrows sit beside the preview; the actions in one row along the bottom, spread to fit
    for (const [label, x, d] of [['<', 12, -1], ['>', GAME_W - 12, 1]] as const) this.buttons.push({ t: text(this, x, 20 + (GAME_H - 60) / 2, label, 'font_big').setTint(0xfff08a), act: () => this.flip(d) });
    const row: [string, () => void][] = [
      ['TALL/WIDE', () => this.turn()], ['X', () => this.shareTo('x')], ['FACEBOOK', () => this.shareTo('facebook')],
      ['INSTAGRAM', () => this.shareTo('instagram')], ['SAVE', () => this.shareTo('save')], ['BACK', () => this.close()],
    ];
    const ts = row.map(([label]) => text(this, 0, GAME_H - 11, label, 'font_outline', 0).setOrigin(0, 0.5).setTint(label === 'BACK' ? 0x9793a6 : 0xffffff));
    const gap = (GAME_W - 16 - ts.reduce((n, t) => n + t.width, 0)) / (ts.length - 1);
    let x = 8;
    ts.forEach((t, i) => { t.setX(Math.round(x)); x += t.width + gap; this.buttons.push({ t, act: row[i][1] }); });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const b = this.buttons.find((b) => { const r = b.t.getBounds(); return p.x > r.x - 5 && p.x < r.right + 5 && p.y > r.y - 5 && p.y < r.bottom + 5; });
      if (b) { sfx.select(); b.act(); }
    });
    const kb = this.input.keyboard!;
    kb.on('keydown-LEFT', () => this.flip(-1)); kb.on('keydown-RIGHT', () => this.flip(1));
    kb.on('keydown-UP', () => this.turn()); kb.on('keydown-DOWN', () => this.turn());
    kb.on('keydown-ESC', () => this.close());
    const place = () => this.placeView();
    this.scale.on('resize', place);
    this.events.once('shutdown', () => { this.scale.off('resize', place); this.view?.remove(); this.view = undefined; });
    this.compose();
    const w = window as unknown as { __TP?: Record<string, unknown> };
    w.__TP = { ...(w.__TP ?? {}), share: () => ({ poster: POSTERS[this.poster], portrait: this.portrait, ready: !!this.file, size: this.file?.size ?? 0, w: this.rt?.width, h: this.rt?.height, url: this.fileUrl }), shareShow: (i: number, tall: boolean) => { this.poster = ((i % POSTERS.length) + POSTERS.length) % POSTERS.length; this.portrait = tall; this.compose(); } };
  }

  update() {
    this.input2.update();
    if (this.input2.justPressed('confirm')) this.shareTo('instagram');
    if (this.input2.justPressed('pause')) this.close();
  }

  private flip(d: number) { sfx.move(); this.poster = (this.poster + d + POSTERS.length) % POSTERS.length; this.compose(); }
  private turn() { sfx.move(); this.portrait = !this.portrait; this.compose(); }

  private close() {
    sfx.select();
    this.view?.remove(); this.view = undefined;
    if (this.fileUrl) URL.revokeObjectURL(this.fileUrl);
    this.scene.stop();
    this.scene.resume(this.from);
  }

  /** the numbers stamped on the poster */
  private stats() {
    const s = ctx.state, total = Object.keys(MISSIONS).length;
    return { liv: livability(s.upgrades), score: fmtScore(s.score), done: s.completedMissions.filter((m) => m in MISSIONS).length, total, net: networkDone(s.completedMissions).length };
  }

  /** where the preview goes on screen (game coordinates) */
  private previewRect(W: number, H: number) {
    const room = GAME_H - 60, k = Math.min((GAME_W - 56) / W, room / H);
    return { cx: GAME_W / 2, cy: 20 + room / 2, k, w: W * k, h: H * k };
  }
  /** the <img> preview over the canvas, at the device's own pixels */
  private placeView() {
    if (!this.view || !this.rt) return;
    const r = this.game.canvas.getBoundingClientRect(), z = r.width / GAME_W;
    const p = this.previewRect(this.rt.width, this.rt.height);
    Object.assign(this.view.style, { left: `${r.left + (p.cx - p.w / 2) * z}px`, top: `${r.top + (p.cy - p.h / 2) * z}px`, width: `${p.w * z}px`, height: `${p.h * z}px` });
  }

  /** compose the poster in a render texture on the poster grid, then export it (async) */
  private compose() {
    const tall = this.portrait;
    const W = tall ? 432 : 768, H = tall ? 768 : 432;
    const lw = W / S, lh = H / S; // the street scene's own (game) pixels
    this.rt?.destroy();
    const rt = this.rt = this.add.renderTexture(0, 0, W, H).setOrigin(0.5);
    const P: Poster = POSTERS[this.poster];
    const has = (k: string) => this.textures.exists(k);
    const frameOk = (atlas: string, frame: string) => has(atlas) && this.textures.get(atlas).has(frame);
    // ---- drawing helpers. lo*: game pixels (x2 on the poster); the rest: poster pixels ----
    const draw = (o: Phaser.GameObjects.GameObject) => { rt.draw(o); o.destroy(); };
    const loBand = (key: string, y: number, tint?: number) => {
      if (!has(key)) return;
      const tw = this.textures.get(key).getSourceImage().width as number;
      for (let x = 0; x < lw; x += tw) { const im = this.make.image({ x: x * S, y: y * S, key }, false).setOrigin(0).setScale(S); if (tint !== undefined) im.setTint(tint); draw(im); }
    };
    /** a sprite in the street scene, bottom-centre anchored; `k` is its size in game pixels (1 = as in the game) */
    const loPut = (frame: string, x: number, y: number, k = 1, flip = false, atlas = 'chars', tint?: number) => {
      if (!frameOk(atlas, frame)) return;
      const im = this.make.image({ x: x * S, y: y * S, key: atlas, frame }, false).setOrigin(0.5, 1).setScale(k * S).setFlipX(flip);
      if (tint !== undefined) im.setTint(tint);
      draw(im);
    };
    const loFill = (color: number, x: number, y: number, w: number, h: number, a = 1) => { const g = this.make.graphics({}, false); g.fillStyle(color, a).fillRect(x * S, y * S, w * S, h * S); draw(g); };
    /** poster-grid art: the portraits, emblem, ribbon (atlas 'posters'), or any sprite at a whole-number scale */
    const hi = (frame: string, x: number, y: number, o: { k?: number; flip?: boolean; ox?: number; oy?: number; atlas?: string; tint?: number; alpha?: number; crop?: [number, number, number, number] } = {}) => {
      const atlas = o.atlas ?? 'posters';
      if (!frameOk(atlas, frame)) return;
      const k = o.k ?? 1;
      const im = this.make.image({ x, y, key: atlas, frame }, false).setOrigin(o.ox ?? 0.5, o.oy ?? 1).setScale(k).setFlipX(!!o.flip).setAlpha(o.alpha ?? 1);
      if (o.crop) {
        // a crop keeps the frame's own placement: anchor the cropped part itself at (x, y)
        const [cx0, cy0, cw0, ch0] = o.crop;
        im.setOrigin(0, 0).setCrop(cx0, cy0, cw0, ch0).setPosition(Math.round(x - (o.ox ?? 0.5) * cw0 * k - cx0 * k), Math.round(y - (o.oy ?? 1) * ch0 * k - cy0 * k));
      }
      if (o.tint !== undefined) im.setTint(o.tint);
      draw(im);
    };
    const fill = (color: number, x: number, y: number, w: number, h: number, a = 1) => { const g = this.make.graphics({}, false); g.fillStyle(color, a).fillRect(x, y, w, h); draw(g); };
    const gfx = (f: (g: Phaser.GameObjects.Graphics) => void) => { const g = this.make.graphics({}, false); f(g); draw(g); };
    /**
     * words on the poster grid, at whole-number scales only (a fractional scale breaks the pixel font): the first
     * of the sizes that fits the width wins; returns the height used
     */
    const words = (s: string, x: number, y: number, sizes: [FontKey, number][], tint = 0xffffff, maxW = W - 16, ox = 0.5, plate = false) => {
      let t: Phaser.GameObjects.BitmapText | undefined;
      for (const [font, k] of sizes) {
        t?.destroy();
        t = this.add.bitmapText(x, y, font, s).setOrigin(ox, 0).setScale(k).setTint(tint);
        if (t.width <= maxW) break;
      }
      // a dark plate behind words that sit on busy art (no text on art)
      if (plate) fill(0x16121f, t!.x - ox * t!.width - 8, y - 5, t!.width + 16, t!.height + 10, 0.82);
      const h = t!.height; draw(t!); return h;
    };
    const BIG: [FontKey, number][] = [['font_big', 2], ['font_outline', 2], ['font', 2], ['font', 1]];
    const MID: [FontKey, number][] = [['font_outline', 2], ['font', 2], ['font_outline', 1], ['font', 1]];
    const SMALL: [FontKey, number][] = [['font', 2], ['font', 1]];
    const st = this.stats();
    const head = this.mission ? `I JUST WON: ${MISSIONS[this.mission]?.title ?? ''}` : 'MY TORONTO SO FAR';
    const numsWide = `LIVABILITY ${st.liv}/100   BIKE NETWORK ${st.net}/${NETWORK_TOTAL}   SCORE ${st.score}`;
    const numsTall = [`LIVABILITY ${st.liv}/100`, `BIKE NETWORK ${st.net}/${NETWORK_TOTAL}`, `SCORE ${st.score}`];
    /** the standard words: the title and what you did on top, your numbers and where to play at the bottom */
    const standardWords = (band = 0.72) => {
      if (tall) {
        fill(0x16121f, 0, 0, W, 164, band);
        words('TRASH PANDA', W / 2, 18, BIG, 0xfff08a); words('RIGHT OF WAY', W / 2, 62, MID, 0xff6347); words(head, W / 2, 104, MID);
        fill(0x16121f, 0, H - 186, W, 186, band);
        numsTall.forEach((n, i) => words(n, W / 2, H - 176 + i * 28, MID, i === 0 ? 0x9bd35a : 0xffffff));
        // M4.4 (Ivan): PLAY FREE on one line, the link on its own (it used to shrink out of reading)
        words('PLAY FREE', W / 2, H - 82, MID, 0xfff08a); words(LINK, W / 2, H - 52, SMALL, 0xc9c5d1);
      } else {
        fill(0x16121f, 0, 0, W, 90, band);
        words('TRASH PANDA: RIGHT OF WAY', W / 2, 12, BIG, 0xfff08a); words(head, W / 2, 56, MID);
        fill(0x16121f, 0, H - 64, W, 64, band);
        words(numsWide, W / 2, H - 56, MID, 0x9bd35a); words(`PLAY FREE: ${LINK}`, W / 2, H - 26, SMALL, 0xc9c5d1);
      }
    };
    const sky = (key: string) => { if (has(key)) draw(this.make.image({ x: 0, y: 0, key }, false).setOrigin(0).setDisplaySize(W, H)); };
    // the street scene's vertical place: tall posters put it in the middle band
    const off = tall ? 64 : 0;
    const street = (key: string) => { loBand(key, STREET_Y + off); if (tall) loFill(0x363644, 0, STREET_Y + off + 66, lw, lh); };
    const cx = lw / 2;

    if (P === 'queen') {
      // M4.4 (Ivan: the raccoon was much bigger than the streetcar, and mixed with it on the tall one): the raccoon at
      // 1.5x is nearer the camera, so lower on the screen and clear of the streetcar
      sky('sky_day');
      loBand('skyline_day', SKYLINE_Y + off); loBand('backrow_day', BACKROW_Y + off); loBand('facades_qw', FRONT_Y.queen + off); street('street_paint');
      loPut('streetcarside', tall ? lw + 34 : cx + 96, GROUND_Y + off - 2, 1, false, 'world');
      loPut('rs_2', tall ? cx - 40 : lw / 3 - 20, tall ? GROUND_Y + off + 26 : GROUND_Y + 10, 1.5);
      standardWords();
    } else if (P === 'faceoff') {
      sky('sky_dusk');
      loBand('skyline_dusk', SKYLINE_Y + off); loBand('facades_dt', FRONT_Y.king + off); street('street_plain');
      loPut('rs_2', cx - (tall ? 52 : 92), GROUND_Y + off + 2, 1.5);
      // M4.4 (Ivan): Dog Fjord looks LEFT, at the raccoon
      loPut('dfs_laugh', cx + (tall ? 52 : 92), GROUND_Y + off, 1.5, false);
      gfx((g) => starburst(g, cx * S, (GROUND_Y + off - 66) * S + 25, 50, 32, 12));
      words('VS', cx * S, (GROUND_Y + off - 66) * S, [['font_big', 3]], 0xfff08a);
      standardWords();
    } else if (P === 'bikebus') {
      // M4.4 (Ivan: the raccoon should be on top of the others; the lower a rider, the more in front): two rows,
      // drawn back to front, the raccoon leading on the nearest line
      sky('sky_day');
      loBand('skyline_day', SKYLINE_Y + off); loBand('backrow_day', BACKROW_Y + off); loBand('facades_qw', FRONT_Y.queen + off); street('street_protected');
      const step = tall ? 30 : 44, lead = tall ? cx + 60 : cx + 120;
      const riders: [string, number, number][] = [];
      ['cys_a_0', 'cys_b_1', 'cys_c_0', 'cys_d_1', 'cys_e_0'].forEach((f, i) => riders.push([f, lead - 38 - i * step, GROUND_Y + off - 5 + (i % 2) * 2]));
      ['cys_f_1', 'cys_c_1', 'cys_b_0', 'cys_a_1'].forEach((f, i) => riders.push([f, lead - 60 - i * step, GROUND_Y + off + 6 + (i % 2) * 2]));
      riders.sort((a, b) => a[2] - b[2]).forEach(([f, x, y]) => loPut(f, x, y, 1));
      loPut('rs_2', lead, GROUND_Y + off + 10, 1.5);
      standardWords();
    } else if (P === 'lake') {
      // M4.4 (Ivan: the raccoon on the third of the picture; boats were up on the island): the boats sit in the water
      sky('sky_dusk');
      loBand('islands_wf', STREET_Y - 140 + off); loBand('lake_wf', STREET_Y - 120 + off); street('street_quay');
      const boats = ['sailboat_w_0', 'sailboat_r_0', 'sailboat_y_0', 'sailboat_b_0'];
      boats.forEach((f, i) => loPut(f, 24 + i * (lw - 48) / 3 + (i % 2) * 10, STREET_Y - 18 + off - (i % 2) * 14, 1, i % 2 === 1, 'world'));
      loPut('rs_2', tall ? cx : lw / 3, GROUND_Y + off + 4, 1.5);
      standardWords();
    } else if (P === 'versus') {
      // a fighting game's VS screen: the two of them in the corners, facing each other, VS between them
      const split = (g: Phaser.GameObjects.Graphics, part: 'all' | 'red' | 'rest' = 'all') => {
        if (part !== 'rest') {
          g.fillStyle(0x7e1620).fillRect(0, 0, W, H);
          // the red side's speed lines
          g.fillStyle(0xd42a24, 0.55);
          for (let i = 0; i < 9; i++) { const y = 20 + i * (H / 9); if (tall) g.fillRect(0, y * 0.55, W * 0.9, 3); else g.fillRect(0, y, W * 0.42, 3); }
        }
        if (part === 'red') return;
        g.fillStyle(0x3f2560);
        if (tall) g.fillPoints([{ x: 0, y: H * 0.58 }, { x: W, y: H * 0.42 }, { x: W, y: H }, { x: 0, y: H }], true);
        else g.fillPoints([{ x: W * 0.56, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: W * 0.44, y: H }], true);
        g.fillStyle(0x7d47a8, 0.55);
        for (let i = 0; i < 9; i++) { const y = 26 + i * (H / 9); if (tall) g.fillRect(W * 0.1, H * 0.45 + y * 0.55, W * 0.9, 3); else g.fillRect(W * 0.58, y, W * 0.42, 3); }
        // the white slash between them
        g.fillStyle(0xf6f2e9);
        if (tall) g.fillPoints([{ x: 0, y: H * 0.58 - 5 }, { x: W, y: H * 0.42 - 5 }, { x: W, y: H * 0.42 + 5 }, { x: 0, y: H * 0.58 + 5 }], true);
        else g.fillPoints([{ x: W * 0.56 - 6, y: 0 }, { x: W * 0.56 + 6, y: 0 }, { x: W * 0.44 + 6, y: H }, { x: W * 0.44 - 6, y: H }], true);
      };
      // M4.10 (Ivan: "really angry versions... the raccoon top left and the dog bottom right, they should look at each
      // other... and reach at each other"): the hero images' VERSUS poses, both whole on top of the split
      gfx((g) => split(g));
      if (tall) {
        hi('pr_racc_vs', 6, 392, { ox: 0 });
        hi('pr_dog_vs', W + 4, H - 110, { ox: 1 });
        words('TRASH PANDA', W - 16, 146, MID, 0xfff08a, W, 1, true); // M4.12 (Ivan): his name, not THE RACCOON
        words('DOG FJORD', 16, H - 142, MID, 0xffa199, W, 0, true);
        // VS in the empty corner between them: right of the raccoon's claw, above the dog's fist
        gfx((g) => starburst(g, W - 96, 318, 56, 36, 14));
        words('VS', W - 96, 282, [['font_big', 4]], 0xfff08a);
        fill(0x16121f, 0, 0, W, 132, 0.8);
        words('TRASH PANDA', W / 2, 16, BIG, 0xfff08a); words('RIGHT OF WAY', W / 2, 58, MID, 0xff6347); words(head, W / 2, 96, MID);
        fill(0x16121f, 0, H - 110, W, 110, 0.8);
        words(`LIVABILITY ${st.liv}/100   SCORE ${st.score}`, W / 2, H - 100, SMALL, 0x9bd35a);
        words('PLAY FREE', W / 2, H - 76, MID, 0xfff08a); words(LINK, W / 2, H - 46, SMALL, 0xc9c5d1);
      } else {
        hi('pr_racc_vs', 44, 84 + 252, { ox: 0 });
        hi('pr_dog_vs', W - 28, H - 52, { ox: 1 });
        words('TRASH PANDA', 18, H - 92, MID, 0xfff08a, W, 0, true);
        words('DOG FJORD', W - 18, 98, MID, 0xffa199, W, 1, true);
        gfx((g) => starburst(g, W / 2, H * 0.5 + 4, 64, 40, 14));
        words('VS', W / 2, H * 0.5 - 36, [['font_big', 4]], 0xfff08a);
        fill(0x16121f, 0, 0, W, 84, 0.8);
        words('TRASH PANDA: RIGHT OF WAY', W / 2, 10, BIG, 0xfff08a); words(head, W / 2, 52, MID);
        fill(0x16121f, 0, H - 52, W, 52, 0.85);
        words(numsWide, W / 2, H - 46, SMALL, 0x9bd35a); words(`PLAY FREE: ${LINK}`, W / 2, H - 24, SMALL, 0xc9c5d1);
      }
    } else if (P === 'title') {
      // a 16-bit title screen: the hero bursting out of a big emblem (a bike wheel), the name on a ribbon, PRESS START
      sky('sky_day');
      loBand('skyline_day', SKYLINE_Y + (tall ? 150 : 0), 0xc9e4ff);
      const ey = tall ? 330 : 200;
      gfx((g) => { g.fillStyle(0xfff08a, 0.25).fillCircle(W / 2, ey, tall ? 205 : 164); g.fillStyle(0xfff08a, 0.18).fillCircle(W / 2, ey, tall ? 228 : 182); });
      hi(tall ? 'pr_wheel' : 'pr_wheel_s', W / 2, ey, { k: 2, oy: 0.5 });
      const rib = tall ? 'pr_ribbon_s' : 'pr_ribbon';
      const ry = ey + (tall ? 92 : 62);
      // M4.10: the standing hero's upper body (Ivan: "crop him for when he is in a circle"); the ribbon hides the cut
      const rf = this.textures.getFrame('posters', 'pr_racc_stand');
      if (rf) { const ch = tall ? 190 : 170; hi('pr_racc_stand', W / 2 + 4, ry + 16, { crop: [0, 0, rf.width, ch] }); }
      hi(rib, W / 2, ry, { oy: 0 });
      words('TRASH PANDA', W / 2, ry + 3, [['font_big', 2]], 0xfff6c8);
      words('RIGHT OF WAY', W / 2, ry + (tall ? 54 : 50), [['font_outline', 2]], 0xff6347, W, 0.5, true);
      words('PRESS START', W / 2, ry + (tall ? 104 : 86), [['font_outline', 2]], 0xfff08a, W, 0.5, true);
      if (tall) {
        fill(0x16121f, 0, 0, W, 64, 0.75); words(head, W / 2, 20, MID);
        fill(0x16121f, 0, H - 112, W, 112, 0.8);
        words(`LIVABILITY ${st.liv}/100   SCORE ${st.score}`, W / 2, H - 100, SMALL, 0x9bd35a);
        words('PLAY FREE', W / 2, H - 76, MID, 0xfff08a); words(LINK, W / 2, H - 46, SMALL, 0xc9c5d1);
      } else {
        fill(0x16121f, 0, 0, W, 44, 0.75); words(head, W / 2, 12, MID);
        fill(0x16121f, 0, H - 28, W, 28, 0.85); words(`${numsWide}   ${LINK}`, W / 2, H - 20, SMALL, 0xc9c5d1);
      }
    } else if (P === 'sunset') {
      // an arcade racer's sunset: the road (a protected bike lane on each side) runs to the horizon, the sun sets over
      // the lake behind the skyline, and the raccoon rides off into it
      sky('sky_dusk');
      const hz = tall ? 360 : 200;
      gfx((g) => {
        // the sun: bands of colour, its lower half cut by widening gaps
        const r = tall ? 112 : 100, cols = [0xfff08a, 0xffe3a8, 0xffbf7a, 0xff9a2e, 0xff7a59, 0xd9646f];
        for (let y = -r; y < 0; y++) {
          const w = Math.sqrt(r * r - y * y), band = Math.floor(((y + r) / r) * cols.length);
          const gapEvery = y > -r * 0.45 ? Math.max(3, Math.round(10 + (y / r) * 14)) : 999;
          if ((y + r) % gapEvery === gapEvery - 1) continue;
          g.fillStyle(cols[Math.min(cols.length - 1, band)]).fillRect(W / 2 - w, hz + y, w * 2, 1);
        }
      });
      // M4.12 (Ivan: "change the bg to Toronto skyline"): the skyline from the lake in silhouette against the sun
      hi(tall ? 'pr_toronto_t' : 'pr_toronto_w', 0, hz - 5, { ox: 0 });
      fill(0x25529b, 0, hz - 6, W, 8); fill(0x3a88cf, 0, hz - 6, W, 2);
      gfx((g) => {
        // the road, row by row: alternating rumble strips and verge make the speed (the classic racer trick)
        for (let y = hz + 2; y < H; y++) {
          const t = (y - hz) / (H - hz), half = 6 + t * W * 0.62, c = W / 2 + (1 - t) * (1 - t) * 20;
          const ph = Math.floor(14 / (t + 0.05)) % 2 === 0;
          g.fillStyle(ph ? 0x2a6e38 : 0x173f2b).fillRect(0, y, W, 1);
          g.fillStyle(ph ? 0xf6f2e9 : 0xd42a24).fillRect(c - half - half * 0.1, y, half * 2.2, 1);
          g.fillStyle(0x55a144).fillRect(c - half, y, half * 2, 1);                                 // the bike lanes
          g.fillStyle(0xc9c5d1).fillRect(c - half * 0.74, y, half * 1.48, 1);                       // their curbs
          g.fillStyle(0x363644).fillRect(c - half * 0.7, y, half * 1.4, 1);                         // the road
          if (ph) g.fillStyle(0xf6f2e9).fillRect(c - Math.max(1, half * 0.03), y, Math.max(2, half * 0.06), 1);
        }
      });
      hi('pr_racc_bike', W / 2 - (tall ? 0 : 20), H - (tall ? 116 : 64)); // M4.10: the hero image on his bike
      if (tall) {
        fill(0x16121f, 0, 0, W, 132, 0.6);
        words('TRASH PANDA', W / 2, 16, BIG, 0xfff08a); words('RIGHT OF WAY', W / 2, 58, MID, 0xff6347); words(head, W / 2, 96, MID);
        fill(0x16121f, 0, H - 110, W, 110, 0.75);
        words(`BIKE NETWORK ${st.net}/${NETWORK_TOTAL}   SCORE ${st.score}`, W / 2, H - 100, SMALL, 0x9bd35a);
        words('PLAY FREE', W / 2, H - 76, MID, 0xfff08a); words(LINK, W / 2, H - 46, SMALL, 0xc9c5d1);
      } else standardWords(0.94);
    } else if (P === 'bosses') {
      // a boss-select screen: the hero in the middle, the bosses around; the beaten ones lit, the rest in shadow
      fill(0x162750, 0, 0, W, H);
      gfx((g) => { g.fillStyle(0x25529b, 0.35); for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 2); });
      const cols = tall ? 3 : 4, rows = tall ? 4 : 3, top = tall ? 124 : 70, bottom = tall ? 112 : 40;
      const gap = 8, cw = (W - 24 - gap * (cols - 1)) / cols, ch = (H - top - bottom - gap * (rows - 1)) / rows;
      const cell = (c: number, r: number, wc = 1, hc = 1) => ({ x: 12 + c * (cw + gap), y: top + r * (ch + gap), w: cw * wc + gap * (wc - 1), h: ch * hc + gap * (hc - 1) });
      const frameCell = (b: { x: number; y: number; w: number; h: number }, lit: boolean) => gfx((g) => { g.fillStyle(0x16121f).fillRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6); g.fillStyle(lit ? 0x3a88cf : 0x25529b).fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4); g.fillStyle(lit ? 0x7cc6f2 : 0x162750).fillRect(b.x, b.y, b.w, b.h); });
      // the hero's cell: the middle (two wide, or two tall)
      const hero = tall ? cell(1, 1, 1, 2) : cell(1, 1, 2, 1);
      const spots: [number, number][] = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const inHero = tall ? c === 1 && (r === 1 || r === 2) : r === 1 && (c === 1 || c === 2);
        if (!inHero) spots.push([c, r]);
      }
      frameCell(hero, true);
      // M4.10: the hero bust, cropped from the top (his head) to the cell; M4.12 (Ivan): a smaller one, so more of him fits
      // (the tall poster's cell is two rows high: the standing raccoon fills it)
      const heroFrame = tall ? 'pr_racc_stand' : 'pr_racc_bust_sm';
      const bf = this.textures.getFrame('posters', heroFrame), pw = bf?.width ?? 1, ph = bf?.height ?? 1;
      const showH = Math.min(hero.h, ph), showW = Math.min(hero.w, pw);
      hi(heroFrame, hero.x + hero.w / 2, hero.y + hero.h, { crop: [Math.floor((pw - showW) / 2), 0, Math.floor(showW), Math.floor(showH)] });
      words('YOU', hero.x + 6, hero.y + 4, [['font_outline', 2], ['font_outline', 1]], 0xfff08a, hero.w, 0);
      const done = ctx.state.completedMissions;
      const list = [...BOSSES.map(([m, atlas, frame, name]) => ({ beaten: done.includes(m), atlas, frame, name })), { beaten: !!ctx.state.flags.ended, atlas: 'posters', frame: 'pr_dog_bust', name: 'DOG FJORD' }];
      list.forEach((b, i) => {
        const [c, r] = spots[i]; const box = cell(c, r);
        frameCell(box, b.beaten);
        if (!frameOk(b.atlas, b.frame)) return;
        const src = this.textures.getFrame(b.atlas, b.frame);
        // whole-number sizes only; bigger than the cell: cropped around the middle (the head for the tall ones)
        const room = box.h - 16, k = Math.max(1, Math.floor(Math.min(box.w / src.width, room / src.height)));
        const sw = Math.min(src.width, box.w / k), sh = Math.min(src.height, room / k);
        hi(b.frame, box.x + box.w / 2, box.y + box.h - 14, { atlas: b.atlas, k, crop: [Math.floor((src.width - sw) / 2), 0 /* M4.10: the hero busts start at the top of the head */, Math.floor(sw), Math.floor(sh)], tint: b.beaten ? undefined : 0x16121f });
        words(b.beaten ? b.name : '???', box.x + box.w / 2, box.y + box.h - 12, [['font', 1]], b.beaten ? 0xfff08a : 0x9793a6, box.w);
        if (b.beaten) words('BEATEN', box.x + box.w - 4, box.y + 4, [['font', 1]], 0x9bd35a, box.w, 1);
      });
      const beaten = list.filter((b) => b.beaten).length;
      if (tall) {
        words('TRASH PANDA', W / 2, 12, BIG, 0xfff08a); words('SELECT YOUR NEXT FIGHT', W / 2, 54, MID, 0xff6347); words(`BOSSES BEATEN ${beaten}/${list.length}`, W / 2, 86, MID);
        words(`LIVABILITY ${st.liv}/100   SCORE ${st.score}`, W / 2, H - 96, SMALL, 0x9bd35a);
        words('PLAY FREE', W / 2, H - 72, MID, 0xfff08a); words(LINK, W / 2, H - 42, SMALL, 0xc9c5d1);
      } else {
        words('TRASH PANDA: RIGHT OF WAY', W / 2, 8, BIG, 0xfff08a); words(`BOSSES BEATEN ${beaten}/${list.length}`, W / 2, 46, [['font', 1]], 0xff6347);
        words(`${numsWide}   ${LINK}`, W / 2, H - 28, SMALL, 0xc9c5d1);
      }
    } else if (P === 'streets') {
      // a beat-em-up cover: night street, the raccoon up front, the rats coming, the boss looming in the sky
      sky('sky_dusk');
      fill(0x16121f, 0, 0, W, H, 0.35);
      loBand('skyline_dusk', SKYLINE_Y + off + 10, 0x9a86c8); loBand('facades_dt', FRONT_Y.king + off, 0x8c80b8); street('street_plain');
      hi('pr_dog_laugh', W - (tall ? 0 : 40), (tall ? 400 : 380), { ox: 1, alpha: 0.82 }); // M4.10: the hero image, laughing
      const rats = ['rat_basic_0', 'rat_construction_0', 'rat_lobbyist_0', 'rat_traffic_0', 'rat_barrier_0'];
      rats.forEach((f, i) => loPut(f, (tall ? cx + 6 : cx + 40) + i * (tall ? 20 : 34), GROUND_Y + off + (i % 2) * 6, 1, true));
      hi('pr_racc_stand', tall ? 4 : 16, tall ? H - 150 : H - 60, { ox: 0 }); // M4.10: the standing hero
      if (tall) {
        fill(0x16121f, 0, 0, W, 132, 0.75);
        words('TRASH PANDA', W / 2, 16, BIG, 0xfff08a); words('TAKE BACK THE STREETS', W / 2, 58, MID, 0xff6347); words(head, W / 2, 96, MID);
        fill(0x16121f, 0, H - 150, W, 150, 0.8);
        numsTall.forEach((n, i) => words(n, W / 2, H - 142 + i * 22, SMALL, i === 0 ? 0x9bd35a : 0xffffff));
        words('PLAY FREE', W / 2, H - 70, MID, 0xfff08a); words(LINK, W / 2, H - 40, SMALL, 0xc9c5d1);
      } else {
        fill(0x16121f, 0, 0, W, 90, 0.75);
        words('TRASH PANDA: RIGHT OF WAY', W / 2, 12, BIG, 0xfff08a); words('TAKE BACK THE STREETS', W / 2, 56, MID, 0xff6347);
        fill(0x16121f, 0, H - 60, W, 60, 0.85);
        words(numsWide, W / 2, H - 52, SMALL, 0x9bd35a); words(`PLAY FREE: ${LINK}`, W / 2, H - 28, SMALL, 0xc9c5d1);
      }
    } else {
      // an arcade high-score table: your run among this device's best
      fill(0x0d0a14, 0, 0, W, H);
      gfx((g) => { for (let i = 0; i < 90; i++) { const x = (i * 97) % W, y = (i * 53 + (i % 7) * 31) % H; g.fillStyle(i % 3 ? 0x69657a : 0xf6f2e9).fillRect(x, y, 2, 2); } });
      const s = ctx.state;
      const rows = HighScores.load().slice(0, 10).map((e) => ({ ...e, you: e.runId === s.runId }));
      if (!rows.some((r) => r.you) && s.score > 0 && !s.flags.debugRun) { rows.push({ name: s.name, score: s.score, difficulty: s.difficulty, runId: s.runId, missions: s.completedMissions.length, date: '', you: true }); rows.sort((a, b) => b.score - a.score); }
      const shown = rows.slice(0, tall ? 10 : 8);
      const RAIN = [0xff6347, 0xff9a2e, 0xfff08a, 0x9bd35a, 0x35b2a6, 0x7cc6f2, 0x7d47a8, 0xc38ae0, 0xffa199, 0xc9c5d1];
      const t0 = tall ? 190 : 134, lh2 = tall ? 40 : 30;
      words('HIGH SCORES', W / 2, tall ? 76 : 40, [['font_big', 3], ['font_big', 2]], 0xfff08a);
      // M4.5: names run up to 10 letters: the name column is as wide as the longest name shown, and the
      // heading is built with the same widths (each line is centred, so they must all be the same length)
      const nw = Math.max(4, ...shown.map((r) => r.name.length));
      const row = (rank: string, name: string, score: string, level: string) => tall ? `${rank.padStart(4, ' ')}  ${name.padEnd(nw, ' ')}  ${score.padEnd(6, ' ')}` : `${rank.padStart(4, ' ')}   ${name.padEnd(nw, ' ')}   ${score.padEnd(6, ' ')}   ${level.padEnd(6, ' ')}`;
      words(row('RANK', 'NAME', 'SCORE', 'LEVEL'), W / 2, t0 - (tall ? 34 : 26), SMALL, 0x9793a6);
      const ord = (n: number) => `${n}${n === 1 ? 'ST' : n === 2 ? 'ND' : n === 3 ? 'RD' : 'TH'}`;
      shown.forEach((r, i) => {
        const line = row(ord(i + 1), r.name, fmtScore(r.score), DIFFICULTY[r.difficulty]?.label ?? '');
        // M4.5: your run is a lit band behind its row (a "< YOU" beside it ran into the score once names grew)
        if (r.you) fill(0xfff08a, 0, t0 + i * lh2 - (tall ? 8 : 6), W, tall ? 34 : 26, 0.22);
        words(line, W / 2, t0 + i * lh2, MID, r.you ? 0xffffff : RAIN[i % RAIN.length]);
      });
      if (!shown.length) words('NO SCORES YET: BE THE FIRST', W / 2, t0 + 20, MID, 0xc9c5d1);
      if (tall && shown.length <= 4) hi('pr_racc_bust', W / 2 + 6, H - 176); // M4.10: the hero bust
      if (tall) {
        words(`LIVABILITY ${st.liv}/100`, W / 2, H - 150, MID, 0x9bd35a);
        words('PLAY FREE', W / 2, H - 92, MID, 0xfff08a); words(LINK, W / 2, H - 62, SMALL, 0xc9c5d1);
        words('TRASH PANDA: RIGHT OF WAY', W / 2, 20, [['font_outline', 2], ['font', 2]], 0xff6347);
      } else {
        words(`TRASH PANDA: RIGHT OF WAY   LIVABILITY ${st.liv}/100`, W / 2, 10, SMALL, 0xff6347);
        words(`PLAY FREE: ${LINK}`, W / 2, H - 28, SMALL, 0xc9c5d1);
      }
    }
    // the preview (the canvas copy shows until the crisp <img> is ready)
    const p = this.previewRect(W, H);
    rt.setPosition(p.cx, p.cy).setScale(p.k);
    this.status.setText(`POSTER ${this.poster + 1}/${POSTERS.length}  ${tall ? 'TALL (STORIES)' : 'WIDE (POSTS)'}  < > MORE POSTERS`);
    // export: snapshot -> upscale with hard pixels -> a PNG file, ready before any button is pressed (a share
    // or a popup has to start inside the tap itself)
    this.file = undefined;
    const token = ++this.token;
    rt.snapshot((img) => {
      if (token !== this.token || !(img instanceof HTMLImageElement)) return;
      const c = document.createElement('canvas'); c.width = W * UP; c.height = H * UP;
      const g = c.getContext('2d')!; g.imageSmoothingEnabled = false; g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b || token !== this.token) return;
        if (this.fileUrl) URL.revokeObjectURL(this.fileUrl);
        this.file = new File([b], `trash-panda-${POSTERS[this.poster]}-${tall ? 'tall' : 'wide'}.png`, { type: 'image/png' });
        this.fileUrl = URL.createObjectURL(b);
        if (!this.view) {
          this.view = document.createElement('img');
          Object.assign(this.view.style, { position: 'fixed', imageRendering: 'pixelated', pointerEvents: 'none', zIndex: '5' });
          this.view.alt = 'Your poster';
          document.body.appendChild(this.view);
        }
        this.view.src = this.fileUrl;
        this.placeView();
        rt.setAlpha(0);
      }, 'image/png');
    });
  }

  private shareText() {
    const st = this.stats();
    return `${this.mission ? `I just won ${MISSIONS[this.mission]?.title ?? 'a mission'}` : 'Fixing Toronto\'s streets'} in TRASH PANDA: RIGHT OF WAY. Livability ${st.liv}/100, bike network ${st.net}/${NETWORK_TOTAL} streets, score ${st.score}. Play free:`;
  }

  private save() {
    if (!this.fileUrl || !this.file) return false;
    const a = document.createElement('a'); a.href = this.fileUrl; a.download = this.file.name; document.body.appendChild(a); a.click(); a.remove();
    return true;
  }

  private shareTo(where: 'x' | 'facebook' | 'instagram' | 'save') {
    if (!this.file) { this.status.setText('ONE MOMENT: DRAWING THE POSTER...'); return; }
    const text = this.shareText(), url = GAME_URL;
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    const native = where !== 'save' && !!nav.share && !!nav.canShare?.({ files: [this.file] });
    // phones: the system share sheet with the image attached (Instagram, X, Facebook, Messages...)
    if (native) { nav.share({ files: [this.file], text: `${text} ${url}` }).catch(() => undefined); return; }
    if (where === 'save') { this.save(); this.status.setText('POSTER SAVED.'); return; }
    if (where === 'x') { this.save(); window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener'); this.status.setText('POSTER SAVED: ADD IT TO YOUR POST.'); return; }
    if (where === 'facebook') { this.save(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener'); this.status.setText('POSTER SAVED: ADD IT TO YOUR POST.'); return; }
    // Instagram has no web share link: save the poster to post from the app
    this.save(); this.status.setText('POSTER SAVED: POST IT FROM INSTAGRAM.');
  }
}

/** a jagged burst behind the VS */
function starburst(g: Phaser.GameObjects.Graphics, x: number, y: number, r1: number, r0: number, n: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r0 : r1; pts.push({ x: x + Math.cos(a) * r * 1.25, y: y + Math.sin(a) * r }); }
  g.fillStyle(0x16121f).fillPoints(pts.map((p) => ({ x: p.x + 4, y: p.y + 4 })), true);
  g.fillStyle(0xff9a2e).fillPoints(pts, true);
  g.fillStyle(0xd42a24).fillPoints(pts.map((p) => ({ x: x + (p.x - x) * 0.72, y: y + (p.y - y) * 0.72 })), true);
}
