// An exact 8-bit indexed PNG encoder (M3.3). Every image in the game is drawn from a 48-colour palette, so
// an indexed PNG holds the same pixels as pngjs's 32-bit RGBA output at roughly half the bytes. Returns null
// when an image has more than 256 distinct colours (the caller then falls back to RGBA).
import zlib from 'node:zlib';

const CRC = new Int32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c; }
const crc32 = (buf) => { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** rgba: Uint8Array of width*height*4. Fully transparent pixels all share one palette entry. */
export function encodePNG8(width, height, rgba) {
  const map = new Map(), pal = [], idx = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4, a = rgba[o + 3];
    const key = a === 0 ? 0 : (((rgba[o] << 24) | (rgba[o + 1] << 16) | (rgba[o + 2] << 8) | a) >>> 0) || 1;
    let p = map.get(key);
    if (p === undefined) { if (pal.length === 256) return null; p = pal.length; map.set(key, p); pal.push(a === 0 ? [0, 0, 0, 0] : [rgba[o], rgba[o + 1], rgba[o + 2], a]); }
    idx[i] = p;
  }
  // translucent entries first, so the tRNS chunk stays short
  const order = pal.map((_, i) => i).sort((a, b) => ((pal[a][3] < 255 ? 0 : 1) - (pal[b][3] < 255 ? 0 : 1)) || a - b);
  const remap = new Uint8Array(256); order.forEach((old, ni) => { remap[old] = ni; });
  const pal2 = order.map((i) => pal[i]);
  for (let i = 0; i < idx.length; i++) idx[i] = remap[idx[i]];
  // adaptive filtering: per row, the filter whose output has the smallest sum of absolute values
  const stride = width + 1, raw = Buffer.alloc(stride * height);
  const prev = new Uint8Array(width), cur = new Uint8Array(width), outs = [0, 1, 2, 3, 4].map(() => new Uint8Array(width));
  for (let y = 0; y < height; y++) {
    cur.set(idx.subarray(y * width, (y + 1) * width));
    let best = 0, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const out = outs[f]; let sum = 0;
      for (let x = 0; x < width; x++) {
        const a = x ? cur[x - 1] : 0, b = prev[x], c = x ? prev[x - 1] : 0, v = cur[x];
        let pr = 0;
        if (f === 1) pr = a; else if (f === 2) pr = b; else if (f === 3) pr = (a + b) >> 1;
        else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        const r = (v - pr) & 255; out[x] = r; sum += r < 128 ? r : 256 - r;
      }
      if (sum < bestSum) { bestSum = sum; best = f; }
    }
    raw[y * stride] = best; raw.set(outs[best], y * stride + 1); prev.set(cur);
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 3;
  const plte = Buffer.alloc(pal2.length * 3); pal2.forEach((c, i) => { plte[i * 3] = c[0]; plte[i * 3 + 1] = c[1]; plte[i * 3 + 2] = c[2]; });
  const nT = pal2.filter((c) => c[3] < 255).length;
  const parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('PLTE', plte)];
  if (nT) parts.push(chunk('tRNS', Buffer.from(pal2.slice(0, nT).map((c) => c[3]))));
  parts.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}
