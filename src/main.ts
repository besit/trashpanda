import Phaser from 'phaser';
import { GAME_W, GAME_H, setGameW, viewWidthFor } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { ExploreScene } from './scenes/ExploreScene';
import { ActionScene } from './scenes/ActionScene';
import { CutsceneScene } from './scenes/CutsceneScene';
import { PauseScene } from './scenes/PauseScene';

setGameW(viewWidthFor(window.innerWidth, window.innerHeight));

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#16121f',
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  input: { gamepad: true, activePointers: 4 },
  scale: { mode: Phaser.Scale.NONE },
  fps: { target: 60, smoothStep: true },
  scene: [BootScene, TitleScene, ExploreScene, ActionScene, CutsceneScene, PauseScene],
});

/**
 * Pick the internal width for the window's aspect, then scale crisply:
 * integer zoom when there is room (desktop), otherwise fit (phones; still nearest-neighbour).
 * Scenes listen to the scale manager's 'resize' event to re-anchor HUD.
 */
function fit() {
  const w = window.innerWidth, h = window.innerHeight;
  const portrait = h > w;
  // in portrait (rotate prompt showing) keep the current width so the scene doesn't thrash
  const vw = portrait ? GAME_W : viewWidthFor(w, h);
  if (vw !== GAME_W || game.scale.width !== vw) { setGameW(vw); game.scale.resize(vw, GAME_H); }
  const s = Math.min(w / GAME_W, h / GAME_H);
  const z = s >= 2 ? Math.floor(s) : s;
  const c = game.canvas;
  if (!c) return;
  c.style.width = `${Math.floor(GAME_W * z)}px`;
  c.style.height = `${Math.floor(GAME_H * z)}px`;
  game.scale.refresh();
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 200));
game.events.once(Phaser.Core.Events.READY, fit);
fit();

(window as unknown as { __TP_GAME?: Phaser.Game }).__TP_GAME = game;
