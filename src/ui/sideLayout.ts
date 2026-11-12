// One place for the side-view geometry (missions, vignettes, title). M2.1 moved everything up 18px so
// streetcars and the near lane fit on screen (Ivan: the streetcar was cut off and not on its tracks).
import Phaser from 'phaser';

/** top of the sidewalk / street strip (strip is 70px tall: sidewalk 0-11, curb 12-15, road 16+) */
export const STREET_Y = 150;
/** where the raccoon rides in missions (curb lane) */
export const GROUND_Y = STREET_Y + 26;
/** front-row layers sit on the sidewalk */
export const FRONT_Y = { queen: STREET_Y - 96, king: STREET_Y - 140, parkside: STREET_Y - 120 } as const;
export const BACKROW_Y = STREET_Y - 72;
export const SKYLINE_Y = 12;

/**
 * A horizontally repeating background layer built from plain images on whole pixels.
 * Replaces Phaser TileSprites, whose shader-side texture wrapping produced a one-row colour seam on
 * some GPUs (Ivan's M2 report: a line under the 2nd-floor windows that shifted with the skyline).
 */
export class ScrollLayer {
  private imgs: Phaser.GameObjects.Image[] = [];
  readonly texW: number;
  constructor(private scene: Phaser.Scene, readonly key: string, readonly y: number, readonly factor: number, private base = 0, depth = 0, tint?: number) {
    this.texW = scene.textures.get(key).getSourceImage().width as number;
    this.fit(depth, tint);
  }
  private fit(depth = 0, tint?: number) {
    const view = this.scene.scale.width;
    const need = Math.ceil(view / this.texW) + 1;
    while (this.imgs.length < need) {
      const im = this.scene.add.image(0, this.y, this.key).setOrigin(0).setScrollFactor(0).setDepth(depth);
      if (tint !== undefined) im.setTint(tint);
      this.imgs.push(im);
    }
  }
  /** call after a resize (wider view may need another copy) */
  refit() { this.fit(this.imgs[0]?.depth ?? 0); }
  /** scroll = world px scrolled; the layer moves by scroll * factor (+ base offset) */
  update(scroll: number) {
    const off = (((scroll * this.factor + this.base) % this.texW) + this.texW) % this.texW;
    const x0 = -Math.round(off);
    this.imgs.forEach((im, k) => im.setX(x0 + k * this.texW));
  }
  setDepth(d: number) { this.imgs.forEach((i) => i.setDepth(d)); return this; }
  destroy() { this.imgs.forEach((i) => i.destroy()); this.imgs = []; }
  get objects() { return this.imgs; }
}
