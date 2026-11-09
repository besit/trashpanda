// Dog Fraud cutscene portrait. Cartoon bulldog politician (NOT a likeness of any real person).
// Shape language from the user's street-art reference: huge flushed pear head, horn-like ear tufts,
// handlebar moustache, smug squinting grin, tiny dark suit.
import { sd, scene, render, orthoCam, smin, pitchInv, norm } from '../lib/sdf.mjs';

export const FW = 112, FH = 100;

const PINK = ['p', 'P', 'P', 'm', 'M'];
const PINK_LIGHT = ['P', 'm', 'M', 'M'];

// approximate front surface y of an ellipsoid at (x, z) for painting features
function surfY(c, r, x, z) {
  const t = 1 - ((x - c[0]) / r[0]) ** 2 - ((z - c[2]) / r[2]) ** 2;
  return c[1] + Math.sqrt(Math.max(t, 0)) * r[1];
}

function model(expr) {
  const skullC = [0, 0, 60], skullR = [21, 18, 19];
  const jowlC = [0, 3, 42], jowlR = [31, 23, 19];
  const muzC = [0, 17, 45], muzR = [12, 9, 8];
  const laugh = expr === 'laugh', shock = expr === 'shock';

  const faceMat = {
    ramp: PINK,
    fn: (p) => {
      const [x, , z] = p;
      if (p[1] < 4) return null;
      // mouth: wide grin under the moustache
      const zc = (laugh ? 30 : 33) + (x * x) / (laugh ? 38 : 48);
      const halfW = laugh ? 17 : 15.5;
      if (Math.abs(x) < halfW && !shock) {
        const dz = z - zc;
        if (laugh) {
          if (dz > -6.5 && dz < 1.6) {
            if (dz > -1.2) return Math.abs(x) % 3.4 < 0.55 ? 'H' : 'W'; // top teeth
            if (dz > -5.2) return dz < -4.0 ? 'P' : 'p'; // mouth interior + tongue
            return 'K';
          }
          if (dz >= 1.6 && dz < 2.6) return 'K';
        } else {
          if (dz > -1.6 && dz < 1.6) return Math.abs(x) % 3.2 < 0.5 ? 'H' : 'W';
          if (Math.abs(dz) < 2.5) return 'K';
        }
      }
      if (shock && Math.hypot(x, (z - 33) * 1.3) < 3.2) return Math.hypot(x, (z - 33) * 1.3) < 2.2 ? 'p' : 'K';
      // jowl smile creases
      if (Math.abs(Math.abs(x) - (laugh ? 19 : 18) - (z - 34) * 0.3) < 0.7 && z > 28 && z < 40) return 'p';
      // eyes: smug squint arcs (∩) / closed laugh / wide shock
      for (const ex of [-8.5, 8.5]) {
        const ez = 55, dx = x - ex, dz = z - ez, d = Math.hypot(dx, dz * 1.3);
        if (shock) {
          if (d < 3.6) return d < 1.6 ? 'K' : d < 2.8 ? 'W' : 'K';
        } else if (laugh) {
          if (Math.abs(d - 3.2) < 0.75 && dz < 0.5) return 'K'; // ∪ closed happy
        } else {
          if (Math.abs(d - 3.3) < 0.8 && dz > -0.6) return 'K'; // ∩ smug squint
          if (d < 2.5 && dz > -0.2 && dz < 1.6) return 'p';
          if (Math.abs(dx - 1.2) < 0.9 && Math.abs(dz + 0.3) < 0.9) return 'W'; // glint
        }
        // eyebrows
        // smug arched brows (shock: raised high)
        const bz = ez + (shock ? 8 : 6.2) - 0.09 * dx * dx + (Math.abs(x) < 8.5 ? 0.6 : 0);
        if (Math.abs(dx) < 5.5 && Math.abs(z - bz) < 1.25) return 'k';
      }
      // forehead worry wrinkles
      if (Math.abs(x) < 7 && (Math.abs(z - 66) < 0.45 || Math.abs(z - 69) < 0.45)) return 'p';
      return null;
    },
  };

  const objs = [];
  // tiny suited body
  objs.push({ d: (p) => smin(sd.ellipsoid([0, -4, 10], [19, 13, 12])(p), sd.ellipsoid([0, -3, 0], [15, 11, 10])(p), 4), m: { ramp: ['K', 'k', 'k', 'g', 'G'] } });
  objs.push({ d: sd.ellipsoid([0, 6, 18], [7, 7, 8]), m: { ramp: ['U', 'c', 'C', 'C'] } }); // shirt
  objs.push({ d: (p) => Math.max(sd.box([0, 13, 14], [3.2, 2, 7])(p), (Math.abs(p[0]) - (2.5 - (p[2] - 20) * 0.08))), m: { ramp: ['K', 'u', 'U'], fn: (p) => ((Math.round(p[0] * 0.8) + Math.round(p[2] * 0.8)) % 3 === 0 ? 'c' : null) } });
  objs.push({ d: sd.box([0, 12.5, 21.5], [2.6, 2, 1.8], 0.6), m: { ramp: ['K', 'u', 'U'] } });
  // lapels
  objs.push({ d: sd.capsule([-6, 10, 25], [-2, 13, 8], 1.6), m: { ramp: ['K', 'k', 'g'] } });
  objs.push({ d: sd.capsule([6, 10, 25], [2, 13, 8], 1.6), m: { ramp: ['K', 'k', 'g'] } });
  // HEAD: pear of skull + jowls, smoothly blended
  objs.push({ d: (p) => {
    let d = smin(sd.ellipsoid(skullC, skullR)(p), sd.ellipsoid(jowlC, jowlR)(p), 9);
    // droopy bulldog jowls hanging over the collar
    d = smin(d, sd.ellipsoid([-17, 8, 31], [12, 13, 10])(p), 6);
    d = smin(d, sd.ellipsoid([17, 8, 31], [12, 13, 10])(p), 6);
    return d;
  }, m: faceMat });
  // protruding muzzle with split upper lip + dog nose
  objs.push({ d: sd.ellipsoid([0, 19, 45], [13, 10, 8.5]), m: { ramp: PINK_LIGHT, fn: (p) => (Math.abs(p[0]) < 0.7 && p[2] < 45 && p[2] > 40 ? 'p' : null) } });
  objs.push({ d: sd.ellipsoid([0, 28.5, 50], [6, 3.6, 4]), m: { ramp: ['K', 'K', 'k', 'g'], spec: 1 } });
  // handlebar moustache (two curled capsule chains)
  for (const s of [-1, 1]) {
    const pts = [[0.5 * s, 29, 43.5], [6 * s, 28.5, 42.5], [11 * s, 26, 41.5], [15.5 * s, 22, 43], [17 * s, 19, 46.5], [15.5 * s, 17.5, 49.5]];
    for (let i = 0; i < pts.length - 1; i++) {
      const r1 = [2.6, 2.4, 2.0, 1.6, 1.2][i], r2 = [2.4, 2.0, 1.6, 1.2, 0.8][i];
      objs.push({ d: sd.capsule(pts[i], pts[i + 1], r1, r2), m: { ramp: ['K', 'K', 'k', 'g'] } });
    }
  }
  // pointed ear tufts, tilted outward like horns
  for (const s of [-1, 1]) {
    const base = [17 * s, 2, 66];
    const tilt = -0.5 * s;
    objs.push({ d: (p) => sd.cone(base, 7.5, 18)(pitchInv(p, tilt, base)), m: { ramp: ['p', 'P', 'm', 'M'] } });
    objs.push({ d: (p) => sd.cone([base[0], 4.6, base[2] + 2], 4, 12)(pitchInv(p, tilt, base)), m: { ramp: ['v', 'p', 'P'] } });
  }
  // spiky tuft on top
  objs.push({ d: sd.cone([0, 0, 76], 5, 7), m: { ramp: ['p', 'P', 'm'] } });
  objs.push({ d: sd.cone([-4, 1, 75], 3.5, 5), m: { ramp: ['p', 'P', 'm'] } });
  return objs;
}

export function dogFraudPortrait(expr = 'grin') {
  const sc = scene(model(expr));
  const cam = orthoCam([-0.32, -1, -0.12]);
  return render(sc, { w: FW, h: FH, cx: FW / 2 + 2, cy: FH - 4, cam, light: norm([-0.55, 0.7, 0.75]), ambient: 0.2, scale: 1.1 });
}

export function dogFraudFrames() {
  return { frames: ['grin', 'laugh', 'shock'].map((e) => dogFraudPortrait(e)), cols: 3 };
}
