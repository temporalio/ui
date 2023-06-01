import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 10 * 1000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
    [process.env.CI ? 'list' : 'github'],
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    timezoneId: 'America/Denver',
    storageState: './tests/storageState.json',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev:local --port=3333 --mode=test',
    port: 3333,
  },
  globalSetup: './tests/global-setup.ts',
  metadata: {
    mode: process.env.PW_MODE,
  },
});
