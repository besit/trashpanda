import Phaser from 'phaser';
import { GAME_W, GAME_H, DEBUG } from '../config';
import { ScrollLayer, STREET_Y, GROUND_Y, FRONT_Y, BACKROW_Y, SKYLINE_Y } from '../ui/sideLayout';
import { openPause } from './PauseScene';
import { MISSIONS, missionOrder } from '../data/missions';
import { DISTRICTS } from '../data/districts';
import { CUTSCENES } from '../data/cutscenes';
import { UPGRADES } from '../data/upgrades';
import { DISCLAIMER_LINES, CREDITS_LINES, CREDIT_LINKS, LINKS } from '../data/villain';
import { InputManager } from '../input/InputManager';
import { text, iris, wrapLines } from '../ui/fx';
import { synth } from '../audio/Synth';
import { music } from '../audio/Sequencer';
import { SONG_MAIN } from '../audio/songs';
import { sfx } from '../audio/sfx';
import { ctx } from '../core/ctx';
import { SaveSystem } from '../core/SaveSystem';
import { wantsTouch } from '../input/TouchControls';
import { DIFFICULTY, HighScores, fmtScore, type Difficulty } from '../core/Score';
import { fetchTop, leaderboardEnabled } from '../core/Leaderboard';
import { fullscreenSupported, isInstalled } from '../core/fullscreen';

/** M4.5: a name of up to 10 letters / digits (it was 3 initials) */
export const NAME_MAX = 10;
const NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SLOT_W = 14;

export const VERSION_LABEL = 'M4.6 PREVIEW';

/** M3.3 (Ivan): after a debug mission or vignette, come back to a REPLAY / BACK TO THE LIST / MAIN MENU menu */
export interface Replay { kind: 'mission' | 'vignette'; id: string }

export class TitleScene extends Phaser.Scene {
  private input2!: InputManager;
  private items: { label: string; action: () => void; t?: Phaser.GameObjects.BitmapText }[] = [];
  private sel = 0;
  private started = false;
  private rider!: Phaser.GameObjects.Sprite;
  private layers: ScrollLayer[] = [];
  private scroll = 0;
  private prompt!: Phaser.GameObjects.BitmapText;
  private menu!: Phaser.GameObjects.Container;
  private leaving = false;
  private lastNY = 0;
  private lastNX = 0;

  constructor() { super('Title'); }

  create(data?: { replay?: Replay }) {
    this.started = false; this.leaving = false; this.sel = 0; this.menuBg = undefined;
    this.input2 = new InputManager(this);
    this.scroll = 0;
    this.layers = [
      new ScrollLayer(this, 'sky_dusk', 0, 0),
      new ScrollLayer(this, 'skyline_dusk', SKYLINE_Y + 22, 0.08, 60),
      new ScrollLayer(this, 'backrow_dusk', BACKROW_Y + 8, 0.25),
      new ScrollLayer(this, 'facades_qw', FRONT_Y.queen, 1, 0, 0, 0xc8a8d8), // M4.1 (Ivan): the front row moves with the sidewalk
      new ScrollLayer(this, 'street_paint', STREET_Y, 1, 0, 0, 0xd0b8d8),
    ];
    this.rider = this.add.sprite(-40, GROUND_Y + 4, 'chars', 'rs_2').setOrigin(0.5, 42 / 44).play('rs_ride');
    this.tweens.add({ targets: this.rider, x: GAME_W + 60, duration: 7000, repeat: -1, repeatDelay: 1500 });

    // logo
    const logo = this.add.container(GAME_W / 2, 44);
    this.logo = logo;
    const shadow = text(this, 2, 2, 'TRASH PANDA', 'font_big').setTint(0x16121f).setScale(2);
    const main = text(this, 0, 0, 'TRASH PANDA', 'font_big').setScale(2);
    const sub = text(this, 0, 26, 'RIGHT OF WAY', 'font_red').setScale(1);
    logo.add([shadow, main, sub]);
    this.tweens.add({ targets: logo, y: 48, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.prompt = text(this, GAME_W / 2, 128, wantsTouch() ? 'TAP TO START' : 'PRESS ENTER', 'font_outline');
    this.tweens.add({ targets: this.prompt, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    // M3.3: the satire notice is one tap away, and named on the front page
    this.footers = [text(this, GAME_W - 4, GAME_H - 4, VERSION_LABEL, 'font', 1).setTint(0x9793a6), text(this, 4, GAME_H - 4, 'SATIRE. FICTIONAL CHARACTERS. SEE ABOUT.', 'font', 0).setOrigin(0, 1).setTint(0x9793a6)];

    // menu (shown after first input)
    this.menu = this.add.container(GAME_W / 2, 118).setVisible(false).setDepth(5);
    const hasSave = SaveSystem.hasSave();
    this.mainItems = [
      ...(hasSave ? [{ label: 'CONTINUE', action: () => this.go(true) }] : []),
      { label: 'NEW GAME', action: () => this.setItems(this.difficultyItems()) },
      { label: 'HIGH SCORES', action: () => this.showScores() },
      { label: 'CONTROLS', action: () => { this.leaving = false; openPause(this, 'controls'); } },
      { label: 'ABOUT', action: () => this.showAbout() },
      // debug (?debug): pick ANY mission (with its briefing) or watch any vignette on its own (M2.1, Ivan)
      ...(DEBUG ? [
        { label: 'SELECT MISSION', action: () => this.setItems(this.missionItems()) },
        { label: 'WATCH VIGNETTES', action: () => this.setItems(this.vignetteItems()) },
      ] : []),
    ];
    this.setItems(this.mainItems);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.started) { this.begin(); return; }
      if (this.closePage) {
        const link = this.pageLinks.find((l) => l.r.contains(p.x, p.y));
        if (link) { this.openLink(link.url); return; }
        if (this.pageNav && p.y > GAME_H - 40 && p.x < 60 && this.pageNav.prev) { sfx.move(); this.pageNav.prev(); return; }
        if (this.pageNav && p.y > GAME_H - 40 && p.x > GAME_W - 60 && this.pageNav.next) { sfx.move(); this.pageNav.next(); return; }
        this.closePage(); return;
      }
      if (this.naming) return; // the letters + START handle their own taps
      // M4.6 (Ivan: on an iPhone the name box stayed over the next screens): the tap on START finished the name, then
      // reached the HIDDEN difficulty list under it and opened a second name box. Only a visible menu takes taps.
      if (!this.menu.visible || this.leaving || this.pageObjs.length) return;
      // tap a menu item (one: an item's action can swap the list, destroying the others)
      const i = this.items.findIndex((it) => { const b = it.t!.getBounds(); return p.x > b.x - 10 && p.x < b.right + 10 && p.y > b.y - 3 && p.y < b.bottom + 3; });
      if (i >= 0) { const it = this.items[i]; this.sel = i; this.refresh(); sfx.select(); it.action(); }
    });
    void iris(this, 'open');
    // re-layout for a new view width (phone rotation, window resize)
    // M4.4: only a new view WIDTH needs a re-layout; a phone keyboard opening (or the page scrolling to a focused text
    // field) also fires 'resize', and a restart then wiped the open page and its timers
    const laidOutW = this.scale.width;
    const onResize = () => { this.naming?.place?.(); if (this.naming || this.scale.width === laidOutW) return; if (!this.leaving) this.scene.restart(); };
    this.scale.on('resize', onResize);
    this.events.once('shutdown', () => { this.scale.off('resize', onResize); this.dropNameField(); this.naming = undefined; });
    this.events.on('resume', () => this.input2.swallow());
    const kb = this.input.keyboard!;
    const menuKey = (d: number) => () => { if (this.started && !this.leaving && !this.naming && !this.closePage && this.menu.visible) this.moveSel(d); };
    for (const k of ['UP', 'W']) kb.on(`keydown-${k}`, menuKey(-1));
    for (const k of ['DOWN', 'S']) kb.on(`keydown-${k}`, menuKey(1));
    // M4.1: ABOUT pages flip with LEFT / RIGHT
    const pageKey = (d: number) => () => { const f = d < 0 ? this.pageNav?.prev : this.pageNav?.next; if (this.closePage && f && !this.naming) { sfx.move(); f(); } };
    for (const k of ['LEFT', 'A']) kb.on(`keydown-${k}`, pageKey(-1));
    for (const k of ['RIGHT', 'D']) kb.on(`keydown-${k}`, pageKey(1));
    // back from a debug mission or vignette: straight to the replay menu (the audio is already unlocked)
    if (data?.replay) { this.begin(true); this.setItems(this.replayItems(data.replay)); }
  }

  private begin(quiet = false) {
    synth.unlock();
    ctx.applySettings();
    music.play(SONG_MAIN);
    if (!quiet) sfx.bell();
    this.started = true;
    this.prompt.setVisible(false);
    this.menu.setVisible(true);
    this.refresh();
    this.drawMenuBg();
    this.iosHint();
  }

  /**
   * M3.3 (Ivan: "doesn't go fullscreen on my iPhone"): iPhone browsers have no page fullscreen at all, so
   * the first time, say how to get it: Share > Add to Home Screen, then open from the icon.
   */
  private iosHint() {
    if (!wantsTouch() || fullscreenSupported() || isInstalled() || ctx.settings.iosHintSeen) return;
    ctx.settings.iosHintSeen = true; ctx.applySettings();
    this.menu.setVisible(false); this.logo?.setVisible(false);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.pageObjs.push(o); return o; };
    const panel = this.add.graphics().fillStyle(0x16121f, 0.85).fillRoundedRect(GAME_W / 2 - 150, 30, 300, 150, 6).lineStyle(1, 0xfff08a).strokeRoundedRect(GAME_W / 2 - 150, 30, 300, 150, 6);
    add(panel);
    add(text(this, GAME_W / 2, 48, 'FULLSCREEN ON IPHONE', 'font_big'));
    ['IPHONE BROWSERS CAN\'T GO FULLSCREEN.', 'TO PLAY WITHOUT THE BROWSER BARS:', '', '1. TAP SHARE (THE BOX WITH THE ARROW)', '2. ADD TO HOME SCREEN', '3. OPEN THE GAME FROM THAT ICON'].forEach((l, i) => add(text(this, GAME_W / 2, 70 + i * 12, l, 'font_outline').setTint(i >= 3 ? 0xfff08a : 0xffffff)));
    add(text(this, GAME_W / 2, 158, '> TAP TO CONTINUE <', 'font_outline').setTint(0x9bd35a));
    this.time.delayedCall(250, () => { this.closePage = () => { this.pageObjs.forEach((o) => o.destroy()); this.pageObjs = []; this.closePage = undefined; this.menu.setVisible(true); this.logo?.setVisible(true); this.refresh(); }; });
  }

  private mainItems: { label: string; action: () => void; t?: Phaser.GameObjects.BitmapText }[] = [];
  private logo?: Phaser.GameObjects.Container;
  /** swap the menu's items (submenus); long lists scroll in a window of 8 */
  private setItems(list: { label: string; action: () => void }[]) {
    this.menu.removeAll(true);
    this.items = list.map((it) => ({ ...it }));
    this.items.forEach((it, i) => { it.t = text(this, 0, i * 11, it.label, 'font_outline'); this.menu.add(it.t); });
    const sub = list !== this.mainItems;
    // M4.1 (Ivan: the mission list was drawn up over the title): submenus sit below the logo, which stays
    this.logo?.setVisible(true);
    this.menu.setY(sub ? 90 : 118);
    this.subMenu = sub;
    this.drawMenuBg();
    this.sel = 0;
    if (this.started) this.refresh();
  }
  /** M3.1: pick a difficulty for the new run (hits per life + score multiplier), then your initials */
  private difficultyItems() {
    const back = { label: '< BACK', action: () => this.setItems(this.mainItems) };
    const pick = (d: Difficulty) => ({ label: `${DIFFICULTY[d].label}: ${DIFFICULTY[d].hits} HITS A LIFE, SCORE X${DIFFICULTY[d].mult}`, action: () => this.startNaming(d) });
    const list = [pick('easy'), pick('normal'), pick('hard'), back];
    this.time.delayedCall(0, () => { this.sel = 1; this.refresh(); });
    return list;
  }

  // ---- your name (M4.4, Ivan: "I want to use a keyboard when entering the initials, and on the phone as well"; M4.5:
  // "change 3 initials to maybe up to 10 letters"): type it (Backspace goes back); the arrows / stick still work
  // arcade-style; on a phone, tapping the letters focuses a hidden text field over them, which brings up the
  // phone's own keyboard. Letters and digits, up to NAME_MAX; an empty name plays as RAC ----
  private naming?: { d: Difficulty; letters: string[]; pos: number; objs: Phaser.GameObjects.BitmapText[]; title: Phaser.GameObjects.BitmapText; panel: Phaser.GameObjects.Graphics; field?: HTMLInputElement; place?: () => void };
  private startNaming(d: Difficulty) {
    if (this.naming || this.leaving) return; // never two name boxes
    this.menu.setVisible(false); this.logo?.setVisible(false); // (the big logo showed through the panel: text on text)
    const touch = wantsTouch();
    // on a phone the keyboard covers the bottom of the screen: the letters sit near the top
    const top = touch ? 6 : 44, ly = top + 46;
    const panel = this.add.graphics().fillStyle(0x16121f, 0.82).fillRoundedRect(GAME_W / 2 - 120, top, 240, touch ? 100 : 112, 6);
    const title = text(this, GAME_W / 2, top + 14, 'YOUR NAME', 'font_big');
    const objs = Array.from({ length: NAME_MAX }, (_, i) => text(this, GAME_W / 2 + (i - (NAME_MAX - 1) / 2) * SLOT_W, ly, '_', 'font_big'));
    const help = text(this, GAME_W / 2, ly + 26, touch ? 'TAP THE LETTERS TO TYPE' : 'TYPE YOUR NAME   BACKSPACE: BACK', 'font');
    const ok = text(this, GAME_W / 2, ly + (touch ? 40 : 46), touch ? '> TAP HERE TO START <' : 'ENTER: START', 'font_outline').setTint(0xfff08a);
    ok.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.finishNaming());
    objs.push(help, ok);
    this.naming = { d, letters: [], pos: 0, objs, title, panel };
    if (touch) this.nameField(ly);
    this.drawNaming();
    // keyboard: real keydown events, so a quick tap is never missed between frames
    const kb = this.input.keyboard!;
    const on = (k: string, f: () => void) => kb.on(`keydown-${k}`, () => { if (this.naming && !this.typingInField()) f(); });
    on('UP', () => this.bumpLetter(1)); on('DOWN', () => this.bumpLetter(-1));
    on('LEFT', () => this.moveCursor(-1)); on('RIGHT', () => this.moveCursor(1));
    kb.on('keydown', this.onNameKey, this);
  }
  /** a letter or digit typed on a keyboard goes in at the cursor and moves on; Backspace takes the one before it out */
  private onNameKey(e: KeyboardEvent) {
    const n = this.naming; if (!n || this.typingInField() || e.repeat) return;
    // a captured key (Backspace) reaches this listener twice with the same event: count it once
    if (e === this.lastNameKey) return;
    this.lastNameKey = e;
    if (/^[a-z0-9]$/i.test(e.key)) { this.typedFrame = this.game.loop.frame; if (n.pos < NAME_MAX) { n.letters[n.pos] = e.key.toUpperCase(); n.pos++; } sfx.move(); this.drawNaming(); }
    else if (e.key === 'Backspace' && n.pos > 0) { n.pos--; n.letters.splice(n.pos, 1); sfx.move(); this.drawNaming(); }
  }
  /** E, Z and X are letters here, not CONFIRM: a frame that typed one ignores confirm */
  private typedFrame = -9;
  private lastNameKey?: KeyboardEvent;
  private typingInField() { return !!this.naming?.field && document.activeElement === this.naming.field; }
  /** phones: an invisible text field over the letters; a tap focuses it (the browser opens the keyboard) */
  private nameField(ly: number) {
    const n = this.naming!;
    const f = document.createElement('input');
    Object.assign(f, { type: 'text', autocomplete: 'off', spellcheck: false, value: '' }); // no maxLength: a space or a symbol must not use up a slot (filtered below)
    f.setAttribute('autocapitalize', 'characters'); f.setAttribute('autocorrect', 'off'); f.setAttribute('enterkeyhint', 'go'); f.setAttribute('aria-label', 'Your name');
    // 16px text: iOS zooms the page into anything smaller
    Object.assign(f.style, { position: 'fixed', opacity: '0.01', fontSize: '16px', color: 'transparent', background: 'transparent', border: 'none', outline: 'none', caretColor: 'transparent', zIndex: '10', padding: '0' });
    const half = (NAME_MAX * SLOT_W) / 2 + 4;
    const place = () => {
      const r = this.game.canvas.getBoundingClientRect(), k = r.width / GAME_W;
      Object.assign(f.style, { left: `${r.left + (GAME_W / 2 - half) * k}px`, top: `${r.top + (ly - 14) * k}px`, width: `${half * 2 * k}px`, height: `${28 * k}px` });
    };
    place();
    f.addEventListener('focus', () => { this.input.keyboard?.disableGlobalCapture(); f.value = n.letters.join(''); });
    f.addEventListener('blur', () => this.input.keyboard?.enableGlobalCapture());
    f.addEventListener('input', () => {
      const v = f.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, NAME_MAX);
      if (f.value !== v) f.value = v;
      n.letters = v.split(''); n.pos = v.length; sfx.move(); this.drawNaming();
    });
    f.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); f.blur(); this.finishNaming(); } });
    document.body.appendChild(f);
    n.field = f; n.place = place;
  }
  /** UP / DOWN: cycle the character at the cursor (on the first blank: start a new one at A, or 9 going down) */
  private bumpLetter(dir: number) {
    const n = this.naming!;
    if (n.pos >= NAME_MAX) n.pos = NAME_MAX - 1;
    const cur = n.letters[n.pos];
    const i = cur === undefined ? (dir > 0 ? 0 : NAME_CHARS.length - 1) : (NAME_CHARS.indexOf(cur) + dir + NAME_CHARS.length) % NAME_CHARS.length;
    n.letters[n.pos] = NAME_CHARS[i];
    sfx.move(); this.drawNaming();
  }
  /** LEFT / RIGHT: over the name typed so far and the first blank after it */
  private moveCursor(dx: number) {
    const n = this.naming!;
    n.pos = Phaser.Math.Clamp(n.pos + dx, 0, Math.min(n.letters.length, NAME_MAX - 1));
    sfx.move(); this.drawNaming();
  }
  private drawNaming() {
    const n = this.naming!;
    for (let i = 0; i < NAME_MAX; i++) {
      const c = n.letters[i];
      n.objs[i].setText(c ?? '_').setTint(i === n.pos ? 0xfff08a : c ? 0xffffff : 0x6a6580);
    }
  }
  private dropNameField() {
    const f = this.naming?.field; if (!f) return;
    this.input.keyboard?.enableGlobalCapture();
    f.remove();
  }
  private finishNaming() {
    const n = this.naming; if (!n) return;
    sfx.select();
    this.dropNameField();
    this.naming = undefined;
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach((k) => this.input.keyboard?.off(`keydown-${k}`));
    this.input.keyboard?.off('keydown', this.onNameKey, this);
    [...n.objs, n.title, n.panel].forEach((o) => o.destroy());
    void this.go(false, n.d, n.letters.join('') || 'RAC');
  }

  // ---- full-screen text pages: high scores, about, sources ----
  private pageObjs: Phaser.GameObjects.GameObject[] = [];
  private closePage?: () => void;
  /** M4.1: ABOUT pages flip with LEFT / RIGHT (and the arrows on screen), and their links open in a new tab */
  private pageNav?: { prev?: () => void; next?: () => void };
  private pageLinks: { r: Phaser.Geom.Rectangle; url: string }[] = [];
  private lastPageNX = 0;
  private openLink(url: string) { sfx.select(); window.open(url, '_blank', 'noopener'); }
  /** a link row: underlined, tinted, tappable */
  private linkRow(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, label: string, url: string) {
    const t = add(text(this, x, y, label, 'font').setTint(0x7cc6f2));
    const b = t.getBounds();
    add(this.add.graphics().fillStyle(0x7cc6f2, 0.8).fillRect(b.x, b.bottom, b.width, 1));
    this.pageLinks.push({ r: new Phaser.Geom.Rectangle(b.x - 4, b.y - 3, b.width + 8, b.height + 6), url });
    return t;
  }
  private footers: Phaser.GameObjects.BitmapText[] = [];
  /** show a page over the menu; `onClose` runs when it's dismissed (default: back to the menu) */
  private openPage(build: (add: <T extends Phaser.GameObjects.GameObject>(o: T) => T) => void, onClose?: () => void) {
    this.menu.setVisible(false); this.logo?.setVisible(false); this.footers.forEach((f) => f.setVisible(false));
    this.pageNav = undefined; this.pageLinks = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.pageObjs.push(o); return o; };
    build(add);
    this.closePage = undefined;
    this.time.delayedCall(250, () => {
      this.closePage = () => {
        this.pageObjs.forEach((o) => o.destroy()); this.pageObjs = []; this.closePage = undefined; this.pageNav = undefined; this.pageLinks = [];
        if (onClose) onClose(); else { this.menu.setVisible(true); this.logo?.setVisible(true); this.footers.forEach((f) => f.setVisible(true)); this.refresh(); }
      };
    });
  }
  private pageFooter(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, label = 'BACK') {
    add(text(this, GAME_W / 2, GAME_H - 14, wantsTouch() ? `> TAP: ${label} <` : `> ENTER: ${label} <`, 'font_outline').setTint(0xfff08a));
  }

  /** local top 10 (+ the online top 10 when the leaderboard is configured) */
  private showScores() {
    this.openPage((add) => {
      const online = leaderboardEnabled();
      const colX = online ? [GAME_W / 4 + 6, (GAME_W * 3) / 4 - 6] : [GAME_W / 2];
      const table = (x: number, head: string, rows: { name: string; score: number; difficulty: Difficulty }[]) => {
        add(text(this, x, 18, head, 'font_outline').setTint(0xfff08a));
        if (!rows.length) add(text(this, x, 40, 'NO SCORES YET', 'font'));
        rows.slice(0, 10).forEach((e, i) => add(text(this, x, 34 + i * 12, `${String(i + 1).padStart(2, ' ')}. ${e.name.padEnd(NAME_MAX, ' ')} ${fmtScore(e.score)} ${DIFFICULTY[e.difficulty]?.label[0] ?? '?'}`, 'font')));
      };
      table(colX[0], 'HIGH SCORES (THIS DEVICE)', HighScores.load());
      if (online) {
        const wait = add(text(this, colX[1], 40, 'LOADING...', 'font'));
        void fetchTop(10).then((rows) => { if (!this.pageObjs.length) return; wait.destroy(); table(colX[1], 'WORLD TOP 10', rows); });
      }
      add(text(this, GAME_W / 2, GAME_H - 26, 'E = EASY  N = NORMAL  H = HARD', 'font').setTint(0x9793a6));
      this.pageFooter(add);
    });
  }

  /** M3.3: ABOUT: the satire + AI notice, then the credits, then SOURCES (one page per claim) */
  /** close the ABOUT pages straight back to the menu (ESC), from any page */
  private leavePages() {
    this.pageObjs.forEach((o) => o.destroy()); this.pageObjs = []; this.closePage = undefined; this.pageNav = undefined; this.pageLinks = [];
    this.menu.setVisible(true); this.logo?.setVisible(true); this.footers.forEach((f) => f.setVisible(true)); this.refresh();
  }
  private showAbout(page = 0) {
    const pages: { title: string; lines: string[]; tint?: (i: number) => number; links?: readonly { label: string; url: string }[] }[] = [
      { title: 'CREDITS', lines: CREDITS_LINES, links: CREDIT_LINKS },
      { title: 'ABOUT THIS GAME', lines: DISCLAIMER_LINES },
      ...Object.values(UPGRADES).map((u) => ({ title: 'SOURCES', lines: [u.name, '', u.blurb, '', 'SOURCE:', u.source], tint: (i: number) => (i === 0 ? 0x9bd35a : i === 4 ? 0xfff08a : 0xffffff), links: [LINKS.research] })),
    ];
    page = (page + pages.length) % pages.length;
    const p = pages[page];
    this.openPage((add) => {
      // wrapped by real glyph widths, on a dark panel (the first cut ran off both edges of the screen)
      const tints: number[] = [];
      const lines = p.lines.flatMap((l, i) => { const w = l ? wrapLines(this, 'font', l, GAME_W - 32) : ['']; w.forEach(() => tints.push(p.tint ? p.tint(i) : 0xffffff)); return w; });
      const nLinks = p.links?.length ?? 0;
      const step = lines.length + nLinks > 14 ? 9 : 10;
      const totalH = lines.length * step + (nLinks ? step + nLinks * 14 : 0);
      const y0 = Math.max(36, Math.round((GAME_H - 14) / 2 - totalH / 2 + 6));
      add(this.add.graphics().fillStyle(0x16121f, 0.82).fillRoundedRect(8, 28, GAME_W - 16, GAME_H - 56, 5).lineStyle(1, 0x69657a).strokeRoundedRect(8, 28, GAME_W - 16, GAME_H - 56, 5));
      add(text(this, GAME_W / 2, 16, p.title, 'font_big'));
      lines.forEach((l, i) => add(text(this, GAME_W / 2, y0 + i * step, l, 'font').setTint(tints[i])));
      (p.links ?? []).forEach((l, i) => this.linkRow(add, GAME_W / 2, y0 + (lines.length + 1) * step + i * 14, l.label, l.url)); // spaced for a finger
      // page arrows (keys LEFT / RIGHT, or tap them) and the page count
      add(text(this, 14, GAME_H - 14, '<', 'font_outline').setTint(0xfff08a));
      add(text(this, GAME_W - 14, GAME_H - 14, '>', 'font_outline').setTint(0xfff08a));
      add(text(this, GAME_W - 6, GAME_H - 26, `${page + 1}/${pages.length}`, 'font', 1).setOrigin(1, 0.5).setTint(0x9793a6));
      add(text(this, GAME_W / 2, GAME_H - 14, wantsTouch() ? '> TAP < >: PAGES   TAP: BACK <' : '> LEFT/RIGHT: PAGES   ENTER: BACK <', 'font_outline').setTint(0xfff08a));
      this.pageNav = { prev: () => this.flipAbout(page - 1), next: () => this.flipAbout(page + 1) };
    });
  }
  private flipAbout(page: number) {
    this.pageObjs.forEach((o) => o.destroy()); this.pageObjs = []; this.closePage = undefined;
    this.showAbout(page);
  }

  /** M4.1 (Ivan): the satire + AI notice once, at the start of a new game (not the whole credits) */
  private showDisclaimer(then: () => void) {
    this.openPage((add) => {
      const lines = DISCLAIMER_LINES.flatMap((l) => (l ? wrapLines(this, 'font', l, GAME_W - 40) : ['']));
      const y0 = Math.round(GAME_H / 2 - (lines.length * 10) / 2 + 4);
      add(this.add.graphics().fillStyle(0x16121f, 0.9).fillRoundedRect(8, 28, GAME_W - 16, GAME_H - 56, 5).lineStyle(1, 0x69657a).strokeRoundedRect(8, 28, GAME_W - 16, GAME_H - 56, 5));
      add(text(this, GAME_W / 2, 16, 'BEFORE YOU RIDE', 'font_big'));
      lines.forEach((l, i) => add(text(this, GAME_W / 2, y0 + i * 10, l, 'font')));
      this.pageFooter(add, 'RIDE');
    }, then);
  }
  /** a movement key is held: keyboard input already went through the keydown handlers */
  private anyKeyDown() { const kb = this.input.keyboard; return !!kb && ['UP', 'DOWN', 'LEFT', 'RIGHT', 'W', 'A', 'S', 'D'].some((k) => kb.addKey(k).isDown); }

  private missionItems() {
    const back = { label: '< BACK', action: () => this.setItems(this.mainItems) };
    // M4.2 (Ivan): numbered in the order they open up, to check the difficulty rises
    return [back, ...missionOrder().map((id, i) => { const m = MISSIONS[id]; const rk = ctx.state.ranks?.[id]?.rank; return { label: `${i + 1}. ${m.title} (${DISTRICTS[m.district]?.name ?? m.district})${rk ? ` ${rk}` : ''}`, action: () => this.playMission(m.id) }; })];
  }
  private vignetteItems() {
    const back = { label: '< BACK', action: () => this.setItems(this.mainItems) };
    return [back, ...Object.keys(CUTSCENES).map((id) => ({ label: id.toUpperCase().replace(/_/g, ' '), action: () => this.playVignette(id) }))];
  }
  private replayItems(r: Replay) {
    const name = r.kind === 'mission' ? MISSIONS[r.id]?.title ?? r.id : r.id.toUpperCase().replace(/_/g, ' ');
    return [
      { label: `REPLAY ${name}`, action: () => (r.kind === 'mission' ? this.playMission(r.id) : this.playVignette(r.id)) },
      { label: r.kind === 'mission' ? 'BACK TO MISSIONS' : 'BACK TO VIGNETTES', action: () => this.setItems(r.kind === 'mission' ? this.missionItems() : this.vignetteItems()) },
      { label: 'MAIN MENU', action: () => this.setItems(this.mainItems) },
    ];
  }
  /** debug: a mission from the start, briefing vignette included, on your save (or a fresh one) */
  private async playMission(id: string) {
    if (this.leaving) return;
    this.leaving = true;
    if (!ctx.continue()) ctx.newGame();
    await iris(this, 'close');
    const m = MISSIONS[id];
    // M4.1: the Bike Bus is played on the map
    const [to, nextData] = m.explore ? ['Explore', { district: m.district, bikebus: id, debug: true }] as const : ['Action', { mission: id, debug: true }] as const;
    if (m.briefing) this.scene.start('Cutscene', { id: m.briefing, next: to, nextData });
    else this.scene.start(to, nextData);
  }
  private playVignette(id: string) { void this.goScene('Cutscene', { id, next: 'Title', nextData: { replay: { kind: 'vignette', id } satisfies Replay } }); }

  private moveSel(d: number) { this.sel = (this.sel + d + this.items.length) % this.items.length; sfx.move(); this.refresh(); }

  private subMenu = false;
  private menuBg?: Phaser.GameObjects.Graphics;
  /** a dark panel behind the menu, so the items read over the busy facades */
  private drawMenuBg() {
    if (!this.menuBg) this.menuBg = this.add.graphics().setDepth(4);
    const n = Math.min(this.items.length, this.subMenu ? 6 : 8);
    const w = Math.min(GAME_W - 16, Math.max(120, ...this.items.map((it) => (it.t?.width ?? 0) + 40)));
    const y0 = this.menu.y - 8;
    this.menuBg.clear().fillStyle(0x16121f, 0.62).fillRoundedRect(GAME_W / 2 - w / 2, y0, w, n * 11 + 10, 4);
    this.menuBg.setVisible(this.menu.visible);
  }
  private refresh() {
    const win = this.subMenu ? 6 : 8, start = Math.max(0, Math.min(this.sel - 3, this.items.length - win));
    this.items.forEach((it, i) => {
      const vis = this.items.length <= win || (i >= start && i < start + win);
      it.t!.setVisible(vis).setY((i - (this.items.length <= win ? 0 : start)) * 11);
      it.t!.setText(i === this.sel ? `> ${it.label} <` : it.label).setTint(i === this.sel ? 0xfff08a : 0xffffff);
    });
  }

  private async go(cont: boolean, difficulty: Difficulty = 'normal', name = 'RAC') {
    if (this.leaving) return;
    this.leaving = true;
    if (cont && ctx.continue()) {
      await iris(this, 'close');
      // an explicit {}: Phaser reuses a scene's last start data when given none (CONTINUE replayed the last payoff)
      this.scene.start('Explore', {});
    } else {
      ctx.newGame(difficulty, name);
      ctx.save(); // the run (difficulty, initials) exists from the first second: CONTINUE finds it
      // the page's keys are read in update(), which skips everything while leaving
      this.leaving = false;
      await new Promise<void>((res) => this.showDisclaimer(res));
      // M4.6 (Ivan): the first new game on this device shows the controls before the ride
      if (!ctx.settings.controlsSeen) {
        ctx.settings.controlsSeen = true; ctx.applySettings();
        await new Promise<void>((res) => { this.events.once('resume', () => { this.leaving = true; res(); }); openPause(this, 'controls', true); });
      }
      this.leaving = true;
      await iris(this, 'close');
      this.scene.start('Cutscene', { id: 'intro', next: 'Explore' });
    }
  }
  private async goScene(key: string, data: object = { id: 'intro', next: 'Title' }) {
    if (this.leaving) return;
    this.leaving = true;
    if (!ctx.sessionStart) ctx.newGame();
    await iris(this, 'close');
    this.scene.start(key, data);
  }

  update(_t: number, dt: number) {
    this.input2.update();
    this.menuBg?.setVisible(this.menu.visible && this.started);
    this.scroll += dt * 0.05;
    for (const l of this.layers) l.update(this.scroll);
    if (!this.started) { if (this.input2.justPressed('confirm')) this.begin(); return; }
    if (this.leaving) return;
    const up = this.input2.moveY < -0.5, down = this.input2.moveY > 0.5;
    const ny = up ? -1 : down ? 1 : 0;
    if (this.closePage) {
      const nx = this.input2.moveX < -0.5 ? -1 : this.input2.moveX > 0.5 ? 1 : 0;
      const flip = nx !== 0 && this.lastPageNX === 0 && !this.anyKeyDown() ? (nx < 0 ? this.pageNav?.prev : this.pageNav?.next) : undefined; // stick / pad (keys use keydown)
      this.lastPageNX = nx;
      if (flip) { sfx.move(); flip(); return; }
      if (this.input2.justPressed('pause') && this.pageNav) { sfx.select(); this.leavePages(); return; }
      if (this.input2.justPressed('confirm') || this.input2.justPressed('pause')) { sfx.select(); this.closePage(); }
      return;
    }
    if (this.pageObjs.length) return; // a page is opening (its close handler arms after a moment)
    if (this.naming) {
      // the cursor's slot blinks (the letters and the cursor share the big font's yellow)
      this.naming.objs.slice(0, NAME_MAX).forEach((o, i) => o.setAlpha(i === this.naming!.pos && Math.floor(this.time.now / 260) % 2 ? 0.3 : 1));
      if (this.typingInField()) return; // the phone keyboard is typing into the field
      // the touch stick / gamepad (keys are handled by keydown events in startNaming)
      const nx = this.input2.moveX < -0.5 ? -1 : this.input2.moveX > 0.5 ? 1 : 0;
      if (ny !== 0 && this.lastNY === 0 && !this.anyKeyDown()) this.bumpLetter(-ny);
      if (nx !== 0 && this.lastNX === 0 && !this.anyKeyDown()) this.moveCursor(nx);
      this.lastNY = ny; this.lastNX = nx;
      // CONFIRM: on a keyboard (Enter / Space) it starts the run; on a pad it steps to the next slot, and on a
      // blank (or the last slot) it starts
      if (this.input2.justPressed('confirm') && this.game.loop.frame - this.typedFrame > 1) {
        const n = this.naming;
        if (this.input2.lastDevice !== 'keyboard' && n.pos < n.letters.length && n.pos < NAME_MAX - 1) { n.pos++; sfx.move(); this.drawNaming(); } else this.finishNaming();
      }
      return;
    }
    // the touch stick / gamepad (keyboard arrows go through keydown events: a quick tap is never missed)
    if (ny !== 0 && this.lastNY === 0 && !this.anyKeyDown()) this.moveSel(ny);
    this.lastNY = ny;
    if (this.input2.justPressed('confirm')) { sfx.select(); this.items[this.sel].action(); }
  }
}
