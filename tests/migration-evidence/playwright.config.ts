import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@playwright/test';

const baselineUrl =
  process.env.MIGRATION_EVIDENCE_BASELINE_URL ?? 'http://127.0.0.1:4173';
const candidateUrl =
  process.env.MIGRATION_EVIDENCE_CANDIDATE_URL ?? 'http://127.0.0.1:4174';
const configuredOutputRoot =
  process.env.MIGRATION_EVIDENCE_OUTPUT_DIR ??
  'migration-evidence/unconfigured';

const outputRoot = path.resolve(configuredOutputRoot);
const testDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: testDirectory,
  testMatch: 'migration-evidence.spec.ts',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  outputDir: path.join(outputRoot, '.playwright'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(outputRoot, 'playwright-results.json') }],
  ],
  globalSetup: path.join(testDirectory, 'global-setup.ts'),
  globalTeardown: path.join(testDirectory, 'global-teardown.ts'),
  use: {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    serviceWorkers: 'block',
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'baseline',
      use: { baseURL: baselineUrl },
    },
    {
      name: 'candidate',
      use: { baseURL: candidateUrl },
    },
  ],
});
