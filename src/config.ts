// Internal resolution. Height is fixed at 216; width stretches with the screen's aspect ratio
// (384 = 16:9 up to 480 = 20:9 phones), so wide phones see more city instead of black bars.
// GAME_W is a live binding: read it at use time, never cache it in module scope.
export const GAME_H = 216;
export const MIN_W = 384;
export const MAX_W = 480;
export let GAME_W = MIN_W;

export function viewWidthFor(w: number, h: number): number {
  if (!w || !h) return MIN_W;
  const want = Math.round((GAME_H * w) / h / 2) * 2;
  return Math.max(MIN_W, Math.min(MAX_W, want));
}
export function setGameW(w: number) { GAME_W = w; }

export const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).has('debug');
