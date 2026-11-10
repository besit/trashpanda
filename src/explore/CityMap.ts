// Renders a generated map: tile ground, ground decals, y-sorted buildings + props, static colliders,
// improvement patches (tile swaps, new props, removal of tagged objects such as parked cars).
import Phaser from 'phaser';
import type { Manifest } from '../scenes/BootScene';
import { puff } from '../ui/fx';

export interface MapObject {
  type: 'building' | 'prop'; key: string; x: number; y: number; w?: number; d?: number; imgH?: number;
  /** small square collider half-size (trees) */ solid?: number;
  /** explicit collider [dx, dy, w, h] relative to the anchor */ solidBox?: [number, number, number, number];
  /** several colliders relative to the anchor (the park gates' piers) */ solids?: [number, number, number, number][];
  tag?: string; mapColor?: string; landmark?: string;
  /** draw-order override (graffiti sits just in front of its wall) */ depth?: number;
}
export interface Lane { id: string; axis: 'x' | 'y'; dir: 1 | -1; pos: number; streetcar?: boolean; stops?: number[]; bikeOnly?: boolean; requires?: string; light?: boolean; cyclists?: 'mixed' }
export interface Intersection { x0: number; x1: number; y0: number; y1: number; tee?: boolean }
export interface MapData {
  width: number; height: number; tileSize: number;
  tileset: { png: string; margin: number; spacing: number };
  ground: number[][];
  objects: MapObject[];
  decals?: { key: string; x: number; y: number }[];
  improvements: Record<string, { tiles: [number, number, number][]; addProps: MapObject[]; removeTag?: string }>;
  spawn: { x: number; y: number };
  markers: { id: string; x: number; y: number; label: string }[];
  lanes: Lane[];
  intersections: Intersection[];
  walkways: [number, number][][];
  labels?: { text: string; x: number; y: number; vertical?: boolean; kind?: string }[];
  critters?: { kind: string; x: number; y: number }[];
  landmarks?: { id: string; x: number; y: number; label: string; fact: string }[];
  tileColors?: number[];
}

export interface BuildingRef { img: Phaser.GameObjects.Image; x: number; y: number; w: number; d: number; h: number; mapColor?: string }

export class CityMap {
  readonly tilemap: Phaser.Tilemaps.Tilemap;
  readonly layer: Phaser.Tilemaps.TilemapLayer;
  readonly solids: Phaser.Physics.Arcade.StaticGroup;
  readonly buildings: BuildingRef[] = [];
  readonly widthPx: number;
  readonly heightPx: number;
  private applied = new Set<string>();
  private pivots: Manifest['pivots'];
  private tagged = new Map<string, { img: Phaser.GameObjects.Image; zones: Phaser.GameObjects.Zone[] }[]>();

  constructor(private scene: Phaser.Scene, readonly data: MapData) {
    this.pivots = (scene.registry.get('manifest') as Manifest).pivots;
    const ts = data.tileSize;
    this.widthPx = data.width * ts; this.heightPx = data.height * ts;
    this.tilemap = scene.make.tilemap({ data: data.ground, tileWidth: ts, tileHeight: ts });
    const tileset = this.tilemap.addTilesetImage('tiles', 'tiles', ts, ts, data.tileset.margin, data.tileset.spacing)!;
    this.layer = this.tilemap.createLayer(0, tileset, 0, 0)!.setDepth(-10);
    for (const d of data.decals ?? []) scene.add.image(d.x, d.y, d.key).setOrigin(0).setDepth(-9);
    this.solids = scene.physics.add.staticGroup();
    for (const o of data.objects) this.addObject(o);
  }

  private addObject(o: MapObject, pop = false) {
    if (o.type === 'building') {
      const base = o.y + o.d!;
      const img = this.scene.add.image(o.x, base, 'world', o.key).setOrigin(0, 1).setDepth(base);
      const h = o.imgH ?? img.height;
      this.buildings.push({ img, x: o.x, y: o.y, w: o.w!, d: o.d!, h, mapColor: o.mapColor });
      // the whole drawn block is solid: no riding "behind" a facade into its roof
      this.solid(o.x + 1, base - h + 4, o.w! - 2, h - 5);
      return img;
    }
    const pv = this.pivots[o.key] ?? { x: 0.5, y: 1 };
    const img = this.scene.add.image(o.x, o.y, 'world', o.key).setOrigin(pv.x, pv.y).setDepth(o.depth ?? o.y);
    const zones: Phaser.GameObjects.Zone[] = [];
    if (o.solid) zones.push(this.solid(o.x - o.solid, o.y - o.solid / 2, o.solid * 2, o.solid));
    if (o.solidBox) { const [dx, dy, w, h] = o.solidBox; zones.push(this.solid(o.x + dx, o.y + dy, w, h)); }
    for (const [dx, dy, w, h] of o.solids ?? []) zones.push(this.solid(o.x + dx, o.y + dy, w, h));
    if (o.tag) { const list = this.tagged.get(o.tag) ?? []; list.push({ img, zones }); this.tagged.set(o.tag, list); }
    if (pop) { img.setScale(0, 0); this.scene.tweens.add({ targets: img, scale: 1, duration: 300, ease: 'Back.easeOut' }); }
    return img;
  }

  private solid(x: number, y: number, w: number, h: number) {
    const z = this.scene.add.zone(x + w / 2, y + h / 2, w, h);
    this.scene.physics.add.existing(z, true);
    this.solids.add(z);
    return z;
  }

  isApplied(id: string) { return this.applied.has(id); }

  /** Apply an improvement patch. If animate, tiles change in a sweep with sparkles; returns duration ms. */
  applyImprovement(id: string, animate = false, sweepFromX = 0): number {
    const imp = this.data.improvements[id];
    if (!imp || this.applied.has(id)) return 0;
    this.applied.add(id);
    const ts = this.data.tileSize;
    const removed = imp.removeTag ? this.tagged.get(imp.removeTag) ?? [] : [];
    this.tagged.delete(imp.removeTag ?? '');
    if (!animate) {
      for (const r of removed) { r.img.destroy(); r.zones.forEach((z) => z.destroy()); }
      for (const [x, y, t] of imp.tiles) this.tilemap.putTileAt(t, x, y, false, this.layer);
      for (const p of imp.addProps) this.addObject(p);
      return 0;
    }
    const speed = 0.11; // tiles per ms
    let maxDelay = 0;
    // parked cars drive off just ahead of the sweep
    for (const r of removed) {
      const delay = Math.max(0, Math.abs(r.img.x - sweepFromX) / ts / speed - 350);
      r.zones.forEach((z) => z.destroy());
      this.scene.tweens.add({ targets: r.img, delay, x: r.img.x + (r.img.frame.name.endsWith('_W') ? -260 : 260), alpha: 0, duration: 900, ease: 'Cubic.easeIn', onComplete: () => r.img.destroy() });
    }
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

  /** Fade facades that hide the player (tall roofs can still overlap the sidewalk behind them). */
  updateOcclusion(px: number, py: number) {
    for (const b of this.buildings) {
      const base = b.y + b.d;
      const behind = px > b.x - 4 && px < b.x + b.w + 4 && py < base && py > base - b.h;
      const target = behind ? 0.45 : 1;
      if (b.img.alpha !== target) {
        const a = b.img.alpha + (target - b.img.alpha) * 0.25;
        b.img.setAlpha(Math.abs(a - target) < 0.03 ? target : a);
      }
    }
  }
}
