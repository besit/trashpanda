import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  retries: 0,
  use: { baseURL: 'http://localhost:4173/trashpanda/', viewport: { width: 1152, height: 648 }, launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/trashpanda/', reuseExistingServer: true, timeout: 60_000 },
  reporter: [['list']],
});
