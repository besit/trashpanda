import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';

export interface Manifest {
  atlases: Record<string, { png: string; json: string }>;
  anims: Record<string, { frames: string[]; rate: number; loop: boolean; atlas?: string }>;
  pivots: Record<string, { x: number; y: number }>;
  images: Record<string, string>;
  fonts: Record<string, { png: string; cw: number; ch: number; chars: string }>;
  maps: Record<string, string>;
  peds?: string[];
  cyclists?: string[];
}

/** Loads the manifest, then every asset it lists, then builds fonts + animations. */
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.load.json('manifest', 'gen/manifest.json');
  }

  create() {
    const m = this.cache.json.get('manifest') as Manifest;
    const bar = this.add.graphics();
    this.load.on('progress', (p: number) => {
      bar.clear().fillStyle(0x2a2536).fillRect(GAME_W / 2 - 60, GAME_H / 2, 120, 6).fillStyle(0xd42a24).fillRect(GAME_W / 2 - 59, GAME_H / 2 + 1, 118 * p, 4);
    });
    for (const [k, a] of Object.entries(m.atlases)) this.load.atlas(k, a.png, a.json);
    for (const [k, f] of Object.entries(m.fonts)) this.load.image(k, f.png);
    for (const [k, i] of Object.entries(m.images)) this.load.image(k, i);
    for (const [k, p] of Object.entries(m.maps)) this.load.json(`map_${k}`, p);
    this.load.image('tiles', 'gen/tiles.png');
    this.load.once('complete', () => this.finish(m));
    this.load.start();
  }

  private finish(m: Manifest) {
    for (const [k, f] of Object.entries(m.fonts)) {
      const cfg: Phaser.Types.GameObjects.BitmapText.RetroFontConfig = {
        image: k, width: f.cw, height: f.ch, chars: f.chars, charsPerRow: f.chars.length,
        'offset.x': 0, 'offset.y': 0, 'spacing.x': 0, 'spacing.y': 0, lineSpacing: 2,
      };
      this.cache.bitmapFont.add(k, Phaser.GameObjects.RetroFont.Parse(this, cfg));
    }
    for (const [k, a] of Object.entries(m.anims)) {
      const atlas = a.atlas ?? (k.startsWith('rs_') || k.startsWith('rt_') || k.startsWith('rat_') || k.startsWith('ped_') || k.startsWith('cy_') ? 'chars' : 'world');
      this.anims.create({ key: k, frames: a.frames.map((frame) => ({ key: atlas, frame })), frameRate: a.rate, repeat: a.loop ? -1 : 0 });
    }
    this.registry.set('manifest', m);
    const q = new URLSearchParams(location.search);
    const start = q.get('scene');
    const data = q.get('cs') ? { id: q.get('cs'), next: 'Title' } : q.get('mission') ? { mission: q.get('mission') } : undefined;
    this.scene.start(start && this.scene.get(start) ? start : 'Title', data);
  }
}
