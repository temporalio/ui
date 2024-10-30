import { defineConfig, devices } from '@playwright/test';

const PLAYWRIGHT_MODE = process.env.PW_MODE;
const PORT = PLAYWRIGHT_MODE === 'e2e' ? 3000 : 3333;

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
    [process.env.CI ? 'github' : 'list'],
    [
      './tests/test-utilities/accessibility-reporter',
      { outputFile: 'playwright-report/accessibility-violations.json' },
    ],
  ],
  use: {
    actionTimeout: 0,
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    timezoneId: 'America/Denver',
    storageState: `./tests/${PLAYWRIGHT_MODE}/storageState.json`,
  },
  projects: [
    {
      name: 'chromium desktop',
      testIgnore: /.*mobile.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        isMobile: false,
      },
    },
    {
      name: 'chromium mobile',
      testIgnore: /.*desktop.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 480 },
        isMobile: true,
      },
    },
  ],
  webServer: {
    timeout: 2 * 60 * 1000,
    command: `pnpm serve:playwright:${PLAYWRIGHT_MODE}`,
    port: PORT,
  },
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  metadata: {
    mode: PLAYWRIGHT_MODE,
  },
});
