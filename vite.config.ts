import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/trashpanda/' : '/',
  // M3.3: the Arcade-only Phaser build (no Matter, no Impact): the game never uses them
  resolve: { alias: { phaser: 'phaser/dist/phaser-arcade-physics.js' } },
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 1600 },
  server: { host: true },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
}));
