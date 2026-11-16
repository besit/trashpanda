// M4.1 (Ivan: "share buttons for socials... after each mission, small buttons. It should generate an image with
// our raccoon and maybe Dog Fjord... 3-5 poster-like images, portrait and landscape, with the game progress or the
// livability score and their scores on top"). An overlay that composes a pixel-art poster from the game's own
// sprites and backgrounds at native resolution, stamps the player's numbers on it, upscales it crisply, and hands
// it to X / Facebook / Instagram (the phone's share sheet when there is one) or saves it.
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { ctx } from '../core/ctx';
import { livability } from '../core/Livability';
import { fmtScore } from '../core/Score';
import { MISSIONS } from '../data/missions';
import { text } from '../ui/fx';
import { sfx } from '../audio/sfx';
import { STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { InputManager } from '../input/InputManager';

export interface ShareSceneData { from: string; mission?: string }

export const GAME_URL = 'https://besit.github.io/trashpanda/';
export const POSTERS = ['queen', 'faceoff', 'bikebus', 'lake'] as const;
type Poster = typeof POSTERS[number];
const UP = 5; // the upscale for the posted image: 1920x1080 landscape, 1080x1920 portrait

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

  constructor() { super('Share'); }

  init(data: ShareSceneData) { this.from = data.from; this.mission = data.mission; this.poster = 0; this.portrait = false; this.file = undefined; }

  create() {
    this.input2 = new InputManager(this);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x16121f, 0.94).setOrigin(0).setScrollFactor(0);
    text(this, GAME_W / 2, 8, 'SHARE YOUR CITY', 'font_outline').setTint(0xfff08a);
    this.status = text(this, GAME_W / 2, GAME_H - 26, '', 'font').setTint(0x9793a6);
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
    this.compose();
    const w = window as unknown as { __TP?: Record<string, unknown> };
    w.__TP = { ...(w.__TP ?? {}), share: () => ({ poster: POSTERS[this.poster], portrait: this.portrait, ready: !!this.file, size: this.file?.size ?? 0, w: this.rt?.width, h: this.rt?.height }) };
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
    if (this.fileUrl) URL.revokeObjectURL(this.fileUrl);
    this.scene.stop();
    this.scene.resume(this.from);
  }

  /** the numbers stamped on the poster */
  private stats() {
    const s = ctx.state, total = Object.keys(MISSIONS).length;
    return { liv: livability(s.upgrades), score: fmtScore(s.score), done: s.completedMissions.filter((m) => m in MISSIONS).length, total };
  }

  /** compose the poster at native resolution in a render texture, then export it (async) */
  private compose() {
    const W = this.portrait ? 216 : 384, H = this.portrait ? 384 : 216;
    this.rt?.destroy();
    const rt = this.rt = this.add.renderTexture(0, 0, W, H).setOrigin(0.5);
    const off = this.portrait ? 96 : 0; // portrait: the street scene sits in the middle band
    const P: Poster = POSTERS[this.poster];
    const has = (k: string) => this.textures.exists(k);
    const band = (key: string, y: number) => {
      if (!has(key)) return;
      const tw = this.textures.get(key).getSourceImage().width as number;
      for (let x = 0; x < W; x += tw) { const im = this.make.image({ x, y, key }, false).setOrigin(0); rt.draw(im); im.destroy(); }
    };
    const put = (frame: string, x: number, y: number, scale = 1, flip = false, atlas = 'chars') => {
      if (!this.textures.get(atlas).has(frame)) return;
      const im = this.make.image({ x, y, key: atlas, frame }, false).setOrigin(0.5, 1).setScale(scale).setFlipX(flip);
      rt.draw(im); im.destroy();
    };
    const sky = P === 'faceoff' || P === 'lake' ? 'sky_dusk' : 'sky_day';
    // the sky fills the whole poster (stretched for portrait), then the layers of a street
    if (has(sky)) { const im = this.make.image({ x: 0, y: 0, key: sky }, false).setOrigin(0).setDisplaySize(W, H); rt.draw(im); im.destroy(); }
    const ground = (street: string) => { band(street, STREET_Y + off); if (this.portrait) { const g = this.make.graphics({}, false); g.fillStyle(0x363644).fillRect(0, STREET_Y + off + 66, W, H); rt.draw(g); g.destroy(); } };
    const cx = W / 2;
    if (P === 'queen') {
      band('skyline_day', SKYLINE_Y + off); band('backrow_day', BACKROW_Y + off); band('facades_qw', FRONT_Y.queen + off); ground('street_paint');
      put('streetcarside', cx + (this.portrait ? 60 : 110), GROUND_Y + off, 1, false, 'world');
      put('rs_2', cx - (this.portrait ? 20 : 50), GROUND_Y + off + 2, this.portrait ? 3 : 2.5);
    } else if (P === 'faceoff') {
      band('skyline_dusk', SKYLINE_Y + off); band('facades_dt', FRONT_Y.king + off); ground('street_plain');
      put('rs_2', cx - (this.portrait ? 50 : 90), GROUND_Y + off + 2, this.portrait ? 2.5 : 3);
      put('dfs_laugh', cx + (this.portrait ? 52 : 95), GROUND_Y + off, this.portrait ? 2 : 2.5, true);
      const vs = this.add.bitmapText(cx, GROUND_Y + off - 70, 'font_big', 'VS').setOrigin(0.5).setTint(0xff9a2e); rt.draw(vs); vs.destroy();
    } else if (P === 'bikebus') {
      band('skyline_day', SKYLINE_Y + off); band('backrow_day', BACKROW_Y + off); band('facades_qw', FRONT_Y.queen + off); ground('street_protected');
      const step = this.portrait ? 34 : 50, lead = cx + (this.portrait ? 60 : 120);
      put('rs_2', lead, GROUND_Y + off + 2, 2);
      ['cys_a_0', 'cys_b_0', 'cys_c_0', 'cys_a_1', 'cys_b_1'].forEach((f, i) => put(f, lead - 40 - i * step, GROUND_Y + off + 1, 1.5));
    } else {
      band('islands_wf', STREET_Y - 140 + off); band('lake_wf', STREET_Y - 120 + off); ground('street_quay');
      ['sailboat_w_0', 'sailboat_r_0', 'sailboat_y_0', 'sailboat_b_0'].forEach((f, i) => put(f, 30 + i * (W - 60) / 3, STREET_Y - 98 + off + (i % 2) * 8, 1, false, 'world'));
      put('rs_2', cx, GROUND_Y + off + 2, this.portrait ? 3 : 2.5);
    }
    // the words: the title, what you did, your numbers, where to play
    const st = this.stats();
    const strip = (y: number, h: number) => { const g = this.make.graphics({}, false); g.fillStyle(0x16121f, 0.72).fillRect(0, y, W, h); rt.draw(g); g.destroy(); };
    const words = (s: string, x: number, y: number, font: string, tint = 0xffffff) => {
      // too wide: the smaller font first (a scaled bitmap font breaks its pixels), scaling only as a last resort
      let t = this.add.bitmapText(x, y, font, s).setOrigin(0.5, 0).setTint(tint);
      if (t.width > W - 8 && font === 'font_outline') { t.destroy(); t = this.add.bitmapText(x, y, 'font', s).setOrigin(0.5, 0).setTint(tint); }
      if (t.width > W - 8) t.setScale((W - 8) / t.width);
      rt.draw(t); t.destroy();
    };
    const head = this.mission ? `I JUST WON: ${MISSIONS[this.mission]?.title ?? ''}` : 'MY TORONTO SO FAR';
    const nums = this.portrait ? [`LIVABILITY ${st.liv}`, `SCORE ${st.score}`, `${st.done}/${st.total} MISSIONS`] : [`LIVABILITY ${st.liv}   SCORE ${st.score}   ${st.done}/${st.total} MISSIONS`];
    if (this.portrait) {
      strip(0, 82); words('TRASH PANDA', cx, 10, 'font_big', 0xfff08a); words('RIGHT OF WAY', cx, 34, 'font_outline', 0xff6347); words(head, cx, 56, 'font_outline');
      strip(H - 82, 82); nums.forEach((n, i) => words(n, cx, H - 76 + i * 14, 'font_outline', i === 0 ? 0x9bd35a : 0xffffff)); words('PLAY FREE: BESIT.GITHUB.IO/TRASHPANDA', cx, H - 26, 'font', 0x9793a6);
    } else {
      strip(0, 44); words('TRASH PANDA: RIGHT OF WAY', cx, 6, 'font_big', 0xfff08a); words(head, cx, 28, 'font_outline');
      strip(H - 30, 30); words(nums[0], cx, H - 26, 'font_outline', 0x9bd35a); words('PLAY FREE: BESIT.GITHUB.IO/TRASHPANDA', cx, H - 12, 'font', 0x9793a6);
    }
    // the preview, scaled to fit above the buttons
    const room = GAME_H - 60;
    rt.setPosition(GAME_W / 2, 20 + room / 2).setScale(Math.min((GAME_W - 56) / W, room / H));
    this.status.setText(`POSTER ${this.poster + 1}/${POSTERS.length}  ${this.portrait ? 'TALL (STORIES)' : 'WIDE (POSTS)'}  < > MORE POSTERS`);
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
        this.file = new File([b], `trash-panda-${POSTERS[this.poster]}-${this.portrait ? 'tall' : 'wide'}.png`, { type: 'image/png' });
        this.fileUrl = URL.createObjectURL(b);
      }, 'image/png');
    });
  }

  private shareText() {
    const st = this.stats();
    return `${this.mission ? `I just won ${MISSIONS[this.mission]?.title ?? 'a mission'}` : 'Fixing Toronto\'s streets'} in TRASH PANDA: RIGHT OF WAY. Livability ${st.liv}, score ${st.score}. Play free:`;
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
