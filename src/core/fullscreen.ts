// Fullscreen on phones (Ivan, M3.1 review: "Can we do fullscreen on mobile?").
//  - Android Chrome / Firefox, iPad Safari: the Fullscreen API works, but only inside a user gesture. The
//    first tap on a touch device goes fullscreen (and tries to lock landscape); the pause menu toggles it.
//  - iPhone Safari has no Fullscreen API for pages at all. There, "Add to Home Screen" launches the game
//    from public/manifest.webmanifest in fullscreen landscape, with no browser bars.
type FsDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void; webkitFullscreenEnabled?: boolean };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

const doc = () => document as FsDoc;

/** can this browser put a page in fullscreen? (false on iPhone Safari) */
export const fullscreenSupported = () => typeof document !== 'undefined' && !!(doc().fullscreenEnabled || doc().webkitFullscreenEnabled);
export const isFullscreen = () => typeof document !== 'undefined' && !!(doc().fullscreenElement || doc().webkitFullscreenElement);
/** launched from the home screen (manifest display: fullscreen/standalone): already has no browser bars */
export const isInstalled = () => typeof window !== 'undefined' && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export async function enterFullscreen(): Promise<boolean> {
  if (!fullscreenSupported() || isFullscreen()) return isFullscreen();
  const el = document.documentElement as FsEl;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else await el.webkitRequestFullscreen?.();
  } catch { return false; }
  // landscape lock is only allowed in fullscreen, and only on some browsers: best-effort
  try { await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape'); } catch { /* not supported */ }
  return isFullscreen();
}

export async function exitFullscreen() {
  if (!isFullscreen()) return;
  try { if (document.exitFullscreen) await document.exitFullscreen(); else await doc().webkitExitFullscreen?.(); } catch { /* ignore */ }
}

export const toggleFullscreen = () => (isFullscreen() ? exitFullscreen() : enterFullscreen());

/**
 * On a touch device, the first tap anywhere goes fullscreen (a real DOM gesture, which the browser
 * requires). Only once per page load: if the player leaves fullscreen, the pause menu brings it back.
 */
export function autoFullscreenOnFirstTap(isTouch: boolean) {
  if (!isTouch || !fullscreenSupported() || isInstalled()) return;
  const go = () => { window.removeEventListener('pointerup', go, true); window.removeEventListener('touchend', go, true); void enterFullscreen(); };
  window.addEventListener('pointerup', go, true);
  window.addEventListener('touchend', go, true);
}
