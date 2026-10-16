import path from 'node:path';

import {
  assertDistinctPreviews,
  createFreshOutputRoot,
  verifyPreview,
  writeJsonExclusive,
} from '../../scripts/vite-migration/evidence-run';

const requiredEnvironment = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const globalSetup = async (): Promise<void> => {
  const outputRoot = path.resolve(
    requiredEnvironment('MIGRATION_EVIDENCE_OUTPUT_DIR'),
  );
  const baselineUrl = requiredEnvironment('MIGRATION_EVIDENCE_BASELINE_URL');
  const candidateUrl = requiredEnvironment('MIGRATION_EVIDENCE_CANDIDATE_URL');
  const baselineSha256 = requiredEnvironment(
    'MIGRATION_EVIDENCE_BASELINE_BUILD_SHA256',
  );
  const candidateSha256 = requiredEnvironment(
    'MIGRATION_EVIDENCE_CANDIDATE_BUILD_SHA256',
  );
  const baselineBundleSha256 = requiredEnvironment(
    'MIGRATION_EVIDENCE_BASELINE_BUNDLE_SHA256',
  );
  const candidateBundleSha256 = requiredEnvironment(
    'MIGRATION_EVIDENCE_CANDIDATE_BUNDLE_SHA256',
  );
  const baselineProvenanceId = requiredEnvironment(
    'MIGRATION_EVIDENCE_BASELINE_PROVENANCE_ID',
  );
  const candidateProvenanceId = requiredEnvironment(
    'MIGRATION_EVIDENCE_CANDIDATE_PROVENANCE_ID',
  );
  const allowIdentical =
    process.env.MIGRATION_EVIDENCE_ALLOW_IDENTICAL_PREVIEWS === '1';

  assertDistinctPreviews({
    allowIdentical,
    baselineProvenanceId,
    baselineUrl,
    candidateProvenanceId,
    candidateUrl,
  });
  await createFreshOutputRoot(outputRoot);
  const [baseline, candidate] = await Promise.all([
    verifyPreview({
      expectedBundleSha256: baselineBundleSha256,
      expectedProvenanceId: baselineProvenanceId,
      expectedSha256: baselineSha256,
      url: baselineUrl,
      variant: 'baseline',
    }),
    verifyPreview({
      expectedBundleSha256: candidateBundleSha256,
      expectedProvenanceId: candidateProvenanceId,
      expectedSha256: candidateSha256,
      url: candidateUrl,
      variant: 'candidate',
    }),
  ]);

  await writeJsonExclusive(path.join(outputRoot, 'preflight.json'), {
    allowIdenticalPreviews: allowIdentical,
    baseline,
    candidate,
  });
};

export default globalSetup;
