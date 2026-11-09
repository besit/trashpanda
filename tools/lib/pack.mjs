// Simple shelf atlas packer -> Phaser JSON-hash atlas.
import { Img, save } from './raster.mjs';
import fs from 'node:fs';
import path from 'node:path';

/** items: [{ name, img }]. Returns { png path, json path } */
export function packAtlas(items, outBase, maxW = 1024, pad = 1) {
  const sorted = [...items].sort((a, b) => b.img.h - a.img.h || b.img.w - a.img.w);
  let x = pad, y = pad, rowH = 0, W = 0;
  const placed = [];
  for (const it of sorted) {
    if (x + it.img.w + pad > maxW) { x = pad; y += rowH + pad; rowH = 0; }
    placed.push({ ...it, x, y });
    x += it.img.w + pad; rowH = Math.max(rowH, it.img.h); W = Math.max(W, x);
  }
  const H = y + rowH + pad;
  const pow2 = (n) => 2 ** Math.ceil(Math.log2(n));
  const atlas = new Img(pow2(W), pow2(H));
  const frames = {};
  for (const p of placed) {
    atlas.blit(p.img, p.x, p.y);
    frames[p.name] = { frame: { x: p.x, y: p.y, w: p.img.w, h: p.img.h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: p.img.w, h: p.img.h }, sourceSize: { w: p.img.w, h: p.img.h } };
  }
  save(atlas, `${outBase}.png`);
  fs.writeFileSync(`${outBase}.json`, JSON.stringify({ frames, meta: { image: path.basename(`${outBase}.png`), size: { w: atlas.w, h: atlas.h }, scale: 1 } }));
  return { w: atlas.w, h: atlas.h, count: items.length };
}

/** Tileset with 1px extrusion on every side (prevents seams). Returns { margin, spacing, cols } */
export function packTileset(tiles, outFile, ts = 16, cols = 8) {
  const rows = Math.ceil(tiles.length / cols);
  const cell = ts + 2;
  const img = new Img(cols * cell, rows * cell);
  tiles.forEach((t, i) => {
    const ox = (i % cols) * cell + 1, oy = Math.floor(i / cols) * cell + 1;
    img.blit(t, ox, oy);
    for (let k = 0; k < ts; k++) {
      img.set(ox - 1, oy + k, t.get(0, k)); img.set(ox + ts, oy + k, t.get(ts - 1, k));
      img.set(ox + k, oy - 1, t.get(k, 0)); img.set(ox + k, oy + ts, t.get(k, ts - 1));
    }
    img.set(ox - 1, oy - 1, t.get(0, 0)); img.set(ox + ts, oy - 1, t.get(ts - 1, 0));
    img.set(ox - 1, oy + ts, t.get(0, ts - 1)); img.set(ox + ts, oy + ts, t.get(ts - 1, ts - 1));
  });
  save(img, outFile);
  return { margin: 1, spacing: 2, cols };
}
