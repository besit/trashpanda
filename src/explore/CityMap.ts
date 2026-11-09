// Renders a generated map: tile ground, y-sorted buildings + props, static colliders, improvement patches.
import Phaser from 'phaser';
import type { Manifest } from '../scenes/BootScene';
import { puff } from '../ui/fx';

export interface MapObject { type: 'building' | 'prop'; key: string; x: number; y: number; w?: number; d?: number; imgH?: number; solid?: number; tag?: string }
export interface MapData {
  width: number; height: number; tileSize: number;
  tileset: { png: string; margin: number; spacing: number };
  ground: number[][];
  objects: MapObject[];
  improvements: Record<string, { tiles: [number, number, number][]; addProps: MapObject[]; removeTag?: string }>;
  spawn: { x: number; y: number };
  markers: { id: string; x: number; y: number; label: string }[];
  lanes: { wb: number; eb: number; crossX: number };
}

interface BuildingRef { img: Phaser.GameObjects.Image; x: number; y: number; w: number; d: number; h: number }

export class CityMap {
  readonly tilemap: Phaser.Tilemaps.Tilemap;
  readonly layer: Phaser.Tilemaps.TilemapLayer;
  readonly solids: Phaser.Physics.Arcade.StaticGroup;
  readonly buildings: BuildingRef[] = [];
  readonly widthPx: number;
  readonly heightPx: number;
  private applied = new Set<string>();
  private pivots: Manifest['pivots'];

  constructor(private scene: Phaser.Scene, readonly data: MapData) {
    this.pivots = (scene.registry.get('manifest') as Manifest).pivots;
    const ts = data.tileSize;
    this.widthPx = data.width * ts; this.heightPx = data.height * ts;
    this.tilemap = scene.make.tilemap({ data: data.ground, tileWidth: ts, tileHeight: ts });
    const tileset = this.tilemap.addTilesetImage('tiles', 'tiles', ts, ts, data.tileset.margin, data.tileset.spacing)!;
    this.layer = this.tilemap.createLayer(0, tileset, 0, 0)!.setDepth(-10);
    this.solids = scene.physics.add.staticGroup();
    for (const o of data.objects) this.addObject(o);
  }

  private addObject(o: MapObject, pop = false) {
    if (o.type === 'building') {
      const img = this.scene.add.image(o.x, o.y + o.d!, 'world', o.key).setOrigin(0, 1).setDepth(o.y + o.d!);
      this.buildings.push({ img, x: o.x, y: o.y, w: o.w!, d: o.d!, h: o.imgH ?? img.height });
      this.solid(o.x, o.y + 2, o.w!, o.d! - 2);
      return img;
    }
    const pv = this.pivots[o.key] ?? { x: 0.5, y: 1 };
    const img = this.scene.add.image(o.x, o.y, 'world', o.key).setOrigin(pv.x, pv.y).setDepth(o.y);
    if (o.tag) img.setData('tag', o.tag);
    if (o.solid) this.solid(o.x - o.solid, o.y - o.solid / 2, o.solid * 2, o.solid);
    if (pop) { img.setScale(0, 0); this.scene.tweens.add({ targets: img, scale: 1, duration: 300, ease: 'Back.easeOut' }); }
    return img;
  }

  private solid(x: number, y: number, w: number, h: number) {
    const z = this.scene.add.zone(x + w / 2, y + h / 2, w, h);
    this.scene.physics.add.existing(z, true);
    this.solids.add(z);
  }

  isApplied(id: string) { return this.applied.has(id); }

  /** Apply an improvement patch. If animate, tiles change in a sweep with sparkles; returns duration ms. */
  applyImprovement(id: string, animate = false, sweepFromX = 0): number {
    const imp = this.data.improvements[id];
    if (!imp || this.applied.has(id)) return 0;
    this.applied.add(id);
    const ts = this.data.tileSize;
    if (!animate) {
      for (const [x, y, t] of imp.tiles) this.tilemap.putTileAt(t, x, y, false, this.layer);
      for (const p of imp.addProps) this.addObject(p);
      return 0;
    }
    const speed = 0.11; // tiles per ms
    let maxDelay = 0;
    for (const [x, y, t] of imp.tiles) {
      const delay = Math.abs(x * ts - sweepFromX) / ts / speed;
      maxDelay = Math.max(maxDelay, delay);
      this.scene.time.delayedCall(delay, () => {
        this.tilemap.putTileAt(t, x, y, false, this.layer);
        if (x % 2 === 0) puff(this.scene, x * ts + 8, y * ts + 8, 0x9bd35a, 3, 14, -5);
      });
    }
    for (const p of imp.addProps) {
      const delay = Math.abs(p.x - sweepFromX) / ts / speed + 80;
      this.scene.time.delayedCall(delay, () => this.addObject(p, true));
    }
    return maxDelay + 400;
  }

  /** Fade roofs/facades that hide the player. */
  updateOcclusion(px: number, py: number) {
    for (const b of this.buildings) {
      const behind = px > b.x - 4 && px < b.x + b.w + 4 && py < b.y + b.d && py > b.y + b.d - b.h;
      const target = behind ? 0.45 : 1;
      if (b.img.alpha !== target) {
        const a = b.img.alpha + (target - b.img.alpha) * 0.25;
        b.img.setAlpha(Math.abs(a - target) < 0.03 ? target : a);
      }
    }
  }
}
