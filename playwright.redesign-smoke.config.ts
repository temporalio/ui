import { defineConfig, devices } from '@playwright/test';

const viewport = { width: 1440, height: 900 };

export default defineConfig({
  testDir: './tests/redesign-smoke',
  timeout: 20 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/redesign-smoke-results.json' }],
    [process.env.CI ? 'github' : 'list'],
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://127.0.0.1:3333',
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
    viewport,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport,
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport,
      },
    },
  ],
  webServer: {
    command: 'pnpm serve:playwright:visual',
    env: {
      VITE_TEMPORAL_UI_VISUAL_VERSION: 'v2',
    },
    port: 3333,
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
  metadata: {
    visualVersion: 'v2',
  },
});
