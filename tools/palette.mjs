// Master palette for Trash Panda: Right of Way.
// One character per colour so sprites can be authored as text grids.
// '.' and ' ' are transparent.
export const PALETTE = {
  // outlines + neutrals (cool, slightly purple to avoid flat black)
  K: '#16121f', // outline
  k: '#2a2536', // deep shadow
  g: '#443f54', // dark grey
  G: '#69657a', // mid grey
  h: '#9793a6', // light grey
  H: '#c9c5d1', // pale grey
  W: '#f6f2e9', // warm white
  // TTC red family
  r: '#7e1620', R: '#d42a24', q: '#ff6347',
  // Toronto brick
  b: '#5e261f', B: '#93412d', n: '#bd5f3c', N: '#e08b5b',
  // yellows / oranges (signals, cones, sunlight)
  o: '#d9691c', O: '#ff9a2e', y: '#f5c22e', Y: '#fff08a',
  // greens (parks, trees)
  e: '#173f2b', E: '#2a6e38', l: '#55a144', L: '#9bd35a',
  // blues (lake, glass, sky)
  u: '#162750', U: '#25529b', c: '#3a88cf', C: '#7cc6f2', i: '#cdefff',
  // pinks (Dog Fraud, sunset)
  p: '#93374a', P: '#d9646f', m: '#ffa199', M: '#ffd3c4',
  // browns (wood, wicker, fur accents)
  w: '#3f2719', x: '#74482a', X: '#b17b47', j: '#d9a86c',
  // purples (dusk, villain)
  v: '#3f2560', V: '#7d47a8', Z: '#c38ae0',
  // asphalt / pavement / concrete
  a: '#262631', A: '#363644', s: '#53515f', S: '#7b7889', t: '#a39c8b', T: '#cfc6b0',
  // sky gradient helpers
  z: '#ff7a59', d: '#ffbf7a', D: '#ffe3a8',
  // teal (bike share / accents)
  f: '#1f6f74', F: '#35b2a6',
};

export const KEYS = Object.keys(PALETTE);
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
