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
  /** texture atlas (district building atlases); default 'world' */ atlas?: string;
  /** collision only, nothing drawn (pond edges) */ invisible?: boolean;
  /** draw-order override (graffiti sits just in front of its wall) */ depth?: number;
}
export interface Lane {
  id: string; axis: 'x' | 'y'; dir: 1 | -1; pos: number; streetcar?: boolean; stops?: number[]; bikeOnly?: boolean; requires?: string; light?: boolean; cyclists?: 'mixed';
  /** upgrade id: streetcars get signal priority (no red lights, faster) */ priority?: string;
  /** upgrade id: through-car traffic removed (King St corridor) */ noCars?: string;
  /** upgrade id: traffic calmed (slower cars) */ calm?: string;
  /** drivers speed here until calmed */ speedy?: boolean;
  /** a dedicated transit right-of-way: streetcars only (Queens Quay) */ transitOnly?: boolean;
  /** runs UNDER overpasses (the DVP under the Don bridges): drawn below the bridge-deck overlay */ under?: boolean;
  /** up on an elevated deck (the Gardiner): drawn above everything on the ground, fast, jams that clear */ elevated?: boolean;
  /** no vehicles of its own: it's fed by vehicles turning into it */ noSpawn?: boolean;
  /** corners vehicles may take into another lane (first match wins, decided when a vehicle spawns) */
  turns?: { to: string; r: number; p: number; kinds?: ('car' | 'streetcar' | 'bike')[] }[];
  /** [start, end] px along the lane's axis when the street doesn't span the whole map */ range?: [number, number];
}
/** a street continuing across a map edge: w/e exits span rows y0..y1, n/s exits span columns x0..x1 */
export interface Exit { side: 'w' | 'e' | 'n' | 's'; y0?: number; y1?: number; x0?: number; x1?: number; to: string; street: string }
export const OPPOSITE = { w: 'e', e: 'w', n: 's', s: 'n' } as const;
/** the exit's span along its edge [lo, hi] (px) */
export const exitSpan = (e: Exit): [number, number] => (e.side === 'w' || e.side === 'e' ? [e.y0!, e.y1!] : [e.x0!, e.x1!]);
export interface Intersection { x0: number; x1: number; y0: number; y1: number; tee?: boolean }
export interface MapData {
  id?: string;
  exits?: Exit[];
  width: number; height: number; tileSize: number;
  tileset: { png: string; margin: number; spacing: number };
  ground: number[][];
  objects: MapObject[];
  decals?: { key: string; x: number; y: number }[];
  improvements: Record<string, { tiles: [number, number, number][]; addProps: MapObject[]; removeTag?: string | string[] }>;
  spawn: { x: number; y: number };
  markers: { id: string; x: number; y: number; label: string }[];
  lanes: Lane[];
  intersections: Intersection[];
  walkways: [number, number][][];
  labels?: { text: string; x: number; y: number; vertical?: boolean; kind?: string }[];
  critters?: { kind: string; x: number; y: number }[];
  landmarks?: { id: string; x: number; y: number; label: string; fact: string }[];
  tileColors?: number[];
  /** tile rects [x0, y0, x1, y1] redrawn above traffic that runs under them (bridge decks over the DVP, M3.1) */
  overpasses?: [number, number, number, number][];
  /** indices into walkways that run under the overpasses (the Lower Don trail) */
  underWalks?: number[];
  /** easter eggs (M3.1 scoring): ride into the rect to find one */
  eggs?: { id: string; x: number; y: number; w: number; h: number; label: string; fact: string }[];
  /** hidden extra lives (M2.1) */
  lifeTokens?: { x: number; y: number }[];
}

/** depth band for things under an overpass: above the ground (-10) and decals (-9), below the deck overlay */
export const UNDER_DEPTH = -8;
export const underDepth = (y: number) => UNDER_DEPTH + y / 100000;
/** the Gardiner deck (above everything on the ground, below the HUD at 20000); its cars sit just above it */
export const ELEVATED_DEPTH = 10000;

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
    // bridge decks: the same tiles again in a layer over the traffic that passes beneath (depth UNDER_DEPTH)
    if (data.overpasses?.length) {
      const masked = data.ground.map((row) => row.map(() => -1));
      for (const [x0, y0, x1, y1] of data.overpasses) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (data.ground[y]?.[x] !== undefined) masked[y][x] = data.ground[y][x];
      const om = scene.make.tilemap({ data: masked, tileWidth: ts, tileHeight: ts });
      const ots = om.addTilesetImage('tiles', 'tiles', ts, ts, data.tileset.margin, data.tileset.spacing)!;
      om.createLayer(0, ots, 0, 0)!.setDepth(UNDER_DEPTH + 0.5);
    }
    for (const d of data.decals ?? []) scene.add.image(d.x, d.y, d.key).setOrigin(0).setDepth(-9);
    this.solids = scene.physics.add.staticGroup();
    for (const o of data.objects) this.addObject(o);
  }

  private addObject(o: MapObject, pop = false) {
    if (o.type === 'building') {
      const base = o.y + o.d!;
      const img = this.scene.add.image(o.x, base, o.atlas ?? 'world', o.key).setOrigin(0, 1).setDepth(base);
      const h = o.imgH ?? img.height;
      this.buildings.push({ img, x: o.x, y: o.y, w: o.w!, d: o.d!, h, mapColor: o.mapColor });
      // M3.1 (Ivan): only the footprint is solid, so you can ride behind a building (it fades, see
      // updateOcclusion). The footprint is the bottom d px of the image: the ground under the facade.
      const z = this.solid(o.x + 1, base - o.d! + 2, o.w! - 2, o.d! - 3);
      // a tagged building can be removed by an improvement (M3.1: the MEGA SPA goes once the shore is public)
      if (o.tag) { const list = this.tagged.get(o.tag) ?? []; list.push({ img, zones: [z] }); this.tagged.set(o.tag, list); }
      return img;
    }
    if (o.invisible) {
      if (o.solidBox) { const [dx, dy, w, h] = o.solidBox; this.solid(o.x + dx, o.y + dy, w, h); }
      return null;
    }
    const pv = this.pivots[o.key] ?? { x: 0.5, y: 1 };
    const img = this.scene.add.image(o.x, o.y, o.atlas ?? 'world', o.key).setOrigin(pv.x, pv.y).setDepth(o.depth ?? o.y);
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
  applyImprovement(id: string, animate = false, sweepFrom = 0, axis: 'x' | 'y' = 'x'): number {
    const imp = this.data.improvements[id];
    if (!imp || this.applied.has(id)) return 0;
    this.applied.add(id);
    const ts = this.data.tileSize;
    const tags = imp.removeTag === undefined ? [] : Array.isArray(imp.removeTag) ? imp.removeTag : [imp.removeTag];
    const removed = tags.flatMap((t) => this.tagged.get(t) ?? []);
    tags.forEach((t) => this.tagged.delete(t));
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
      const delay = Math.max(0, Math.abs((axis === 'x' ? r.img.x : r.img.y) - sweepFrom) / ts / speed - 350);
      r.zones.forEach((z) => z.destroy());
      const name = r.img.frame.name, drives = name.startsWith('car_') || name.startsWith('suv_');
      this.scene.tweens.add({ targets: r.img, delay, x: drives ? r.img.x + (name.endsWith('_W') ? -260 : 260) : r.img.x, alpha: 0, duration: drives ? 900 : 400, ease: 'Cubic.easeIn', onComplete: () => r.img.destroy() });
      if (!drives) this.scene.time.delayedCall(delay, () => puff(this.scene, r.img.x, r.img.y - 8, 0xc9c5d1, 6, 14, -5));
    }
    for (const [x, y, t] of imp.tiles) {
      const delay = Math.abs((axis === 'x' ? x : y) * ts - sweepFrom) / ts / speed;
      maxDelay = Math.max(maxDelay, delay);
      this.scene.time.delayedCall(delay, () => {
        this.tilemap.putTileAt(t, x, y, false, this.layer);
        if ((axis === 'x' ? x : y) % 2 === 0) puff(this.scene, x * ts + 8, y * ts + 8, 0x9bd35a, 3, 14, -5);
      });
    }
    for (const p of imp.addProps) {
      const delay = Math.abs((axis === 'x' ? p.x : p.y) - sweepFrom) / ts / speed + 80;
      this.scene.time.delayedCall(delay, () => this.addObject(p, true));
    }
    return maxDelay + 400;
  }

  /** Fade facades that hide the player (tall roofs can still overlap the sidewalk behind them). */
  updateOcclusion(px: number, py: number) {
    for (const b of this.buildings) {
      if (!b.img.active) continue;
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
