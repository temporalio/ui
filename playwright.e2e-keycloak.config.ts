import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e-keycloak',
  timeout: 90 * 1000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report/e2e-keycloak' }],
    [
      'json',
      { outputFile: 'playwright-report/e2e-keycloak/test-results.json' },
    ],
    [process.env.CI ? 'github' : 'list'],
  ],
  use: {
    baseURL: 'http://localhost:8083',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
