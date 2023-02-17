import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 5 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
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
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm run dev:local --port=3333 --mode=test',
      port: 3333,
    },
  ],
});
