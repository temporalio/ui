import { defineConfig, devices } from '@playwright/test';

const themes = ['light', 'dark'] as const;

export default defineConfig({
  testDir: './tests/accessibility',
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
    ['json', { outputFile: 'playwright-report/accessibility-results.json' }],
    [process.env.CI ? 'github' : 'list'],
    [
      './tests/test-utilities/accessibility-reporter',
      { outputFile: 'playwright-report/accessibility-violations.json' },
    ],
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3333',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    storageState: './tests/integration/storageState.json',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  projects: themes.map((theme) => ({
    name: `v2-${theme}`,
    metadata: { theme, visualVersion: 'v2' },
    use: {
      ...devices['Desktop Chrome'],
      colorScheme: theme,
      viewport: { width: 1440, height: 900 },
    },
  })),
  webServer: {
    command: 'pnpm serve:playwright:integration',
    env: {
      VITE_TEMPORAL_UI_VISUAL_VERSION: 'v2',
    },
    port: 3333,
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  metadata: {
    mode: 'integration',
    visualVersion: 'v2',
  },
});
