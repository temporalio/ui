import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json'], [process.env.CI ? 'list' : 'github']],
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

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'VITE_API=http://localhost:7777 pnpm run dev:local --port=3333',
      port: 3333,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm run server --ui-port=7777 --port=6666',
      port: 7777,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
