import { defineConfig, devices } from '@playwright/test';

const visualProfiles = [
  {
    name: '375-light',
    viewport: { width: 375, height: 812 },
    theme: 'light',
  },
  {
    name: '375-dark',
    viewport: { width: 375, height: 812 },
    theme: 'dark',
  },
  {
    name: '768-light',
    viewport: { width: 768, height: 1024 },
    theme: 'light',
  },
  {
    name: '768-dark',
    viewport: { width: 768, height: 1024 },
    theme: 'dark',
  },
  {
    name: '1440-light',
    viewport: { width: 1440, height: 900 },
    theme: 'light',
  },
  {
    name: '1440-dark',
    viewport: { width: 1440, height: 900 },
    theme: 'dark',
  },
] as const;

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  timeout: 20 * 1000,
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      scale: 'css',
      stylePath: './tests/visual/visual-stability.css',
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/visual-results.json' }],
    [process.env.CI ? 'github' : 'list'],
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://127.0.0.1:3333',
    locale: 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  projects: visualProfiles.map(({ name, theme, viewport }) => ({
    name,
    metadata: { theme, viewportWidth: viewport.width },
    use: {
      ...devices['Desktop Chrome'],
      colorScheme: theme,
      hasTouch: viewport.width <= 768,
      isMobile: viewport.width < 768,
      viewport,
    },
  })),
  webServer: {
    command: 'pnpm serve:playwright:visual',
    port: 3333,
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
});
