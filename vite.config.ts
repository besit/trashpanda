import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/trashpanda/' : '/',
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 1600 },
  server: { host: true },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
}));
