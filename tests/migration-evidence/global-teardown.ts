import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { writeJsonExclusive } from '../../scripts/vite-migration/evidence-run';
import { migrationRouteManifest } from '../../scripts/vite-migration/route-manifest';
import {
  compareScreenshotEvidence,
  type ScreenshotEvidence,
} from '../../scripts/vite-migration/screenshot-evidence';

type Evidence = {
  initialUrl: string;
  finalUrl: string;
  serverResponse: unknown;
  navigation: unknown;
  appApiRequests: unknown;
  appApiRequestsForParity: unknown;
  catchAllMocks: unknown;
  consoleMessages: unknown;
  pageErrors: unknown;
  unexpectedPageErrors: unknown;
  semantic: unknown;
  accessibility: unknown;
  scenario: unknown;
  scenarioForParity: unknown;
  screenshot: ScreenshotEvidence;
  expectationFailures: string[];
};

const comparableFields = [
  'initialUrl',
  'finalUrl',
  'serverResponse',
  'navigation',
  'appApiRequestsForParity',
  'catchAllMocks',
  'consoleMessages',
  'unexpectedPageErrors',
  'semantic',
  'accessibility',
  'scenarioForParity',
  'expectationFailures',
] as const;

const readEvidence = async (
  outputRoot: string,
  variant: 'baseline' | 'candidate',
  routeId: string,
): Promise<Evidence | null> => {
  try {
    const contents = await readFile(
      path.join(outputRoot, variant, 'routes', routeId, 'evidence.json'),
      'utf8',
    );
    return JSON.parse(contents) as Evidence;
  } catch {
    return null;
  }
};

const globalTeardown = async (): Promise<void> => {
  const configuredOutputRoot = process.env.MIGRATION_EVIDENCE_OUTPUT_DIR;
  if (!configuredOutputRoot) return;

  const outputRoot = path.resolve(configuredOutputRoot);
  const routes = [];
  const evidenceByRoute = new Map<string, Evidence>();

  for (const route of migrationRouteManifest) {
    const baseline = await readEvidence(outputRoot, 'baseline', route.id);
    const candidate = await readEvidence(outputRoot, 'candidate', route.id);
    if (baseline) evidenceByRoute.set(`baseline:${route.id}`, baseline);
    if (candidate) evidenceByRoute.set(`candidate:${route.id}`, candidate);
    const differences: string[] = comparableFields.filter(
      (field) =>
        JSON.stringify(baseline?.[field]) !==
        JSON.stringify(candidate?.[field]),
    );
    const screenshotComparison =
      baseline && candidate
        ? compareScreenshotEvidence(baseline.screenshot, candidate.screenshot)
        : null;
    if (
      (screenshotComparison && !screenshotComparison.normalizedMatches) ||
      (!screenshotComparison && (baseline !== null || candidate !== null))
    ) {
      differences.push('screenshot');
    }

    routes.push({
      id: route.id,
      family: route.family,
      baseline: baseline ? 'collected' : 'missing',
      candidate: candidate ? 'collected' : 'missing',
      matches:
        baseline !== null && candidate !== null && differences.length === 0,
      differences,
      screenshotComparison,
    });
  }

  const summary = {
    routeCount: migrationRouteManifest.length,
    collected: {
      baseline: routes.filter(({ baseline }) => baseline === 'collected')
        .length,
      candidate: routes.filter(({ candidate }) => candidate === 'collected')
        .length,
    },
    matchingRoutes: routes.filter(({ matches }) => matches).length,
    differingRoutes: routes.filter(
      ({ baseline, candidate, matches }) =>
        baseline === 'collected' && candidate === 'collected' && !matches,
    ).length,
    missingRoutes: routes.filter(
      ({ baseline, candidate }) =>
        baseline === 'missing' || candidate === 'missing',
    ).length,
    failedEvidenceRoutes: routes.filter(({ id }) => {
      const baseline = evidenceByRoute.get(`baseline:${id}`);
      const candidate = evidenceByRoute.get(`candidate:${id}`);
      return (
        (baseline?.expectationFailures.length ?? 0) > 0 ||
        (candidate?.expectationFailures.length ?? 0) > 0
      );
    }).length,
    normalizedScreenshotMatches: routes.filter(
      ({ screenshotComparison }) =>
        screenshotComparison?.normalizedMatches &&
        !screenshotComparison.rawSha256Matches,
    ).length,
    routes,
  };

  await writeJsonExclusive(path.join(outputRoot, 'summary.json'), summary);

  if (
    process.env.MIGRATION_EVIDENCE_REQUIRE_EQUAL === '1' &&
    (summary.differingRoutes > 0 ||
      summary.missingRoutes > 0 ||
      summary.failedEvidenceRoutes > 0)
  ) {
    throw new Error(
      `Migration evidence differs for ${summary.differingRoutes} routes, is missing for ${summary.missingRoutes} routes, and failed expectations for ${summary.failedEvidenceRoutes} routes`,
    );
  }
};

export default globalTeardown;
