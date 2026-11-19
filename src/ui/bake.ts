import Phaser from 'phaser';

/**
 * M4.6 (Ivan: "the flowerbeds get redrawn all the time and they flicker. Draw them once and just move rasterized
 * versions"): a sprite scaled by a fraction (1.2, 1.5...) is resampled on screen every frame, so as it moves its
 * doubled pixel rows and columns change and its dithering shimmers. This draws the frame at that size ONCE, into its
 * own texture; the image then moves as a fixed picture at scale 1. Returns the texture key.
 */
export function baked(scene: Phaser.Scene, atlas: string, frame: string, scale: number): string {
  const key = `${atlas}/${frame}@${scale}`;
  if (scene.textures.exists(key)) return key;
  const f = scene.textures.getFrame(atlas, frame);
  const w = Math.round(f.realWidth * scale), h = Math.round(f.realHeight * scale);
  const tex = scene.textures.createCanvas(key, w, h)!;
  const c = tex.getContext();
  c.imageSmoothingEnabled = false;
  // a trimmed frame sits at its trim offset inside its real size
  c.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, Math.round(f.x * scale), Math.round(f.y * scale), Math.round(f.cutWidth * scale), Math.round(f.cutHeight * scale));
  tex.refresh();
  return key;
}

/** an image of `frame` at `scale`, drawn once (see baked) */
export function bakedImage(scene: Phaser.Scene, x: number, y: number, atlas: string, frame: string, scale: number) {
  return scale === 1 ? scene.add.image(x, y, atlas, frame) : scene.add.image(x, y, baked(scene, atlas, frame, scale));
}
