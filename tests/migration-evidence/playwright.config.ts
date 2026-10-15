import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@playwright/test';

const baselineUrl = process.env.MIGRATION_EVIDENCE_BASELINE_URL;
const candidateUrl = process.env.MIGRATION_EVIDENCE_CANDIDATE_URL;
const configuredOutputRoot = process.env.MIGRATION_EVIDENCE_OUTPUT_DIR;
const baselineBuildSha256 =
  process.env.MIGRATION_EVIDENCE_BASELINE_BUILD_SHA256;
const candidateBuildSha256 =
  process.env.MIGRATION_EVIDENCE_CANDIDATE_BUILD_SHA256;
const baselineBundleSha256 =
  process.env.MIGRATION_EVIDENCE_BASELINE_BUNDLE_SHA256;
const candidateBundleSha256 =
  process.env.MIGRATION_EVIDENCE_CANDIDATE_BUNDLE_SHA256;
const baselineProvenanceId =
  process.env.MIGRATION_EVIDENCE_BASELINE_PROVENANCE_ID;
const candidateProvenanceId =
  process.env.MIGRATION_EVIDENCE_CANDIDATE_PROVENANCE_ID;

if (
  !baselineUrl ||
  !candidateUrl ||
  !configuredOutputRoot ||
  !baselineBuildSha256 ||
  !candidateBuildSha256 ||
  !baselineBundleSha256 ||
  !candidateBundleSha256 ||
  !baselineProvenanceId ||
  !candidateProvenanceId
) {
  throw new Error(
    'Migration evidence URLs, build and bundle SHA-256 markers, provenance IDs, and output directory are required',
  );
}

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
