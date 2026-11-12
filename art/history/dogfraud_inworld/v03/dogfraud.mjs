// Dog Fraud cutscene portrait. Cartoon bulldog politician (NOT a likeness of any real person).
// Shape language from the user's street-art reference: huge flushed pear head, horn-like ears,
// smug squinting grin, tiny dark suit. v06 (Ivan's review): no moustache, swept white hair,
// more dog: longer muzzle, bigger nose, whisker spots, droopier flews.
import { sd, scene, render, orthoCam, smin, pitchInv, norm } from '../lib/sdf.mjs';
import { Img } from '../lib/raster.mjs';

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
      // bull-terrier eye patch (a darker splodge around his left eye) - the strongest "dog" cue
      { const dx = x - 9.5, dz = z - 56; const wob = Math.sin(Math.atan2(dz, dx) * 3) * 1.1; if (Math.hypot(dx * 0.9, dz * 1.05) < 7.8 + wob) return Math.hypot(dx * 0.9, dz * 1.05) > 6.6 + wob ? 'x' : 'X'; }
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
  objs.push({ d: (p) => smin(sd.ellipsoid([0, 21, 45], [13.5, 13, 8.8])(p), sd.ellipsoid([0, 14, 44], [15, 9, 9.5])(p), 4), m: { ramp: PINK_LIGHT, fn: (p) => {
    if (Math.abs(p[0]) < 0.7 && p[2] < 46 && p[2] > 39.5) return 'p'; // philtrum
    for (const [wx, wz] of [[5, 44], [8, 43], [6.5, 41.5], [9.5, 45.5]]) if (Math.hypot(Math.abs(p[0]) - wx, p[2] - wz) < 0.8) return 'p'; // whisker spots
    if (p[2] < 39.5 && Math.abs(p[0]) > 3) return 'P'; // flews curling down at the sides
    return null;
  } } });
  objs.push({ d: sd.ellipsoid([0, 33, 50.5], [7.2, 4.4, 4.6]), m: { ramp: ['K', 'K', 'k', 'g'], spec: 1, fn: (p) => (p[2] < 50 && Math.abs(Math.abs(p[0]) - 2.6) < 1.2 && p[1] > 33 ? 'K' : null) } });
  objs.push({ d: sd.sphere([-2.2, 35.5, 52.6], 1.0), m: { flat: 'G' } }); // nose shine
  if (laugh) {
    // wide-open laughing mouth: FRA-HA-HA-HA-HA!
    objs.push({ d: sd.ellipsoid([0, 21, 31], [15, 6, 7]), m: { flat: 'K', fn: (p) => {
      const top = 35.5 - (p[0] * p[0]) / 60;
      if (p[2] > top) return Math.abs(p[0]) % 3.4 < 0.55 ? 'H' : 'W';
      if (p[2] < 27.5 && Math.abs(p[0]) < 8) return p[2] < 26 ? 'P' : 'p';
      return 'k';
    } } });
  }
  // pointed ear tufts, tilted outward like horns
  for (const s of [-1, 1]) {
    const base = [19 * s, 3, 65];
    const tilt = -0.62 * s;
    objs.push({ d: (p) => sd.cone(base, 8.5, 22)(pitchInv(p, tilt, base)), m: { ramp: ['p', 'P', 'm', 'M'] } });
    objs.push({ d: (p) => sd.cone([base[0], 6.4, base[2] + 2], 4.6, 15)(pitchInv(p, tilt, base)), m: { ramp: ['v', 'p', 'P'] } });
  }
  // swept-back white hair: a big combed coif with a forward swoop and side wings
  const HAIR = { ramp: ['G', 'h', 'H', 'W', 'W'], fn: (p) => ((Math.round(p[0] * 0.55 + p[1] * 0.25) % 3 === 0 && p[2] > 70) ? 'h' : null) };
  objs.push({ d: (p) => {
    let d = sd.ellipsoid([0, -4, 73], [18, 16, 8.5])(p);
    d = smin(d, sd.ellipsoid([4, 8, 78.5], [15, 10, 6.5])(p), 4);   // the big swoop
    d = smin(d, sd.ellipsoid([11, 15, 77], [7, 6, 4.5])(p), 3);     // curl over the brow
    d = smin(d, sd.ellipsoid([-15, -8, 62], [3.5, 6, 5])(p), 3);    // trimmed sides
    d = smin(d, sd.ellipsoid([15, -8, 62], [3.5, 6, 5])(p), 3);
    return d;
  }, m: HAIR });
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

/**
 * In-world Dog Fraud (side vignettes + map): the same head model rendered small on a tiny suited body.
 * Big-head proportions are the joke. ~44 x 64.
 */
export function dogFraudStanding(expr = 'grin', podium = false) {
  // v02 (Ivan: "upper torso looks weird"): the head model is clipped at the jowls so the portrait's own
  // shoulders + tie don't show, and a proper little suit is drawn under it: shoulders as wide as the
  // jowls, lapels, white shirt V, the purple dotted tie, arms with pink paws, short legs.
  const W = 60, H = 80;
  const raw = scene(model(expr));
  const clipped = (p) => { const r = raw(p); return p[2] < 25 ? [Math.max(r[0], 25 - p[2]), r[1]] : r; };
  const head = render(clipped, { w: W, h: 54, cx: W / 2 + 1, cy: 54, cam: orthoCam([-0.32, -1, -0.12]), light: norm([-0.55, 0.7, 0.75]), ambient: 0.2, scale: 0.44 });
  const img = new Img(W, H);
  const cx = Math.round(W / 2), by = 44;
  // jacket: rounded shoulders tapering to the waist
  // v03 (Ivan, M3: "separate his arms and torso by using different shades, instead of one diagonal
  // shadow"): the torso is one mid tone with a thin shade on its far edge; the arms are a darker tone with
  // a light edge along the top of the sleeve and a dark seam where they meet the torso.
  img.poly([[cx - 14, by + 4], [cx - 11, by], [cx + 11, by], [cx + 14, by + 4], [cx + 12, by + 22], [cx - 12, by + 22]], 'G');
  img.line(cx - 12, by + 3, cx - 11, by + 21, 'g'); img.line(cx - 11, by + 1, cx + 10, by + 1, 'h'); // far-edge shade, shoulder light
  // shirt V + lapels + tie
  img.poly([[cx - 5, by], [cx + 5, by], [cx, by + 10]], 'W');
  img.line(cx - 5, by, cx - 1, by + 12, 'g'); img.line(cx + 5, by, cx + 1, by + 12, 'g'); // lapels
  img.rect(cx - 1, by + 1, 2, 11, 'V'); img.set(cx - 1, by + 3, 'Z'); img.set(cx, by + 6, 'Z'); img.set(cx - 1, by + 9, 'Z');
  img.set(cx + 3, by + 15, 'h'); img.set(cx + 3, by + 19, 'h'); // buttons
  // arms + paws
  for (const sgn of [-1, 1]) {
    img.poly([[cx + sgn * 14, by + 3], [cx + sgn * 18, by + 18], [cx + sgn * 14, by + 19], [cx + sgn * 11, by + 7]], 'k');
    img.line(cx + sgn * 14, by + 3, cx + sgn * 17, by + 16, sgn > 0 ? 'g' : 'G'); // sleeve edge catching the light
    img.line(cx + sgn * 11, by + 7, cx + sgn * 14, by + 18, 'K');                  // the seam against the torso
  }
  img.ellipse(cx - 15, by + 20, 2, 2, 'P'); img.ellipse(cx + 15, by + 20, 2, 2, 'P');
  // legs + shoes
  img.rect(cx - 7, by + 22, 5, 9, 'k'); img.rect(cx + 2, by + 22, 5, 9, 'k');
  img.rect(cx - 9, by + 30, 7, 3, 'K'); img.rect(cx + 2, by + 30, 7, 3, 'K'); img.set(cx - 8, by + 30, 'g'); img.set(cx + 3, by + 30, 'g');
  img.outline('K');
  img.blit(head, 0, -2);
  if (podium) {
    img.rect(cx - 15, 58, 30, 20, 'v'); img.rect(cx - 14, 59, 28, 18, 'V'); img.hline(cx - 15, cx + 14, 58, 'Z');
    img.rect(cx - 7, 63, 14, 7, 'W'); img.rect(cx - 5, 65, 10, 3, 'V'); // the DF crest
    img.vline(cx + 8, 50, 58, 'g'); img.rect(cx + 7, 48, 3, 3, 'G'); // microphone
  }
  img.pivot = { x: 0.5, y: (H - 2) / H };
  return img;
}

export function dogFraudStandingPreview() {
  return { frames: [dogFraudStanding('grin'), dogFraudStanding('laugh'), dogFraudStanding('grin', true), dogFraudStanding('laugh', true)], cols: 4 };
}
