import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type FetchPreview = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type PreviewVariant = 'baseline' | 'candidate';

export type PreviewVerification = {
  url: string;
  status: number;
  contentType: string;
  sha256: string;
  bundleSha256: string;
  provenanceId: string;
};

export const buildIdentityForHtml = (html: string): string => {
  const immutableEntries = [
    ...new Set(
      (
        html.match(
          /(?:\.?\/)?_app\/immutable\/entry\/(?:app|start)\.[A-Za-z0-9_-]+\.js/g,
        ) ?? []
      ).map((entry) => `/${entry.replace(/^\.?\//, '')}`),
    ),
  ].sort();
  const identitySource =
    immutableEntries.length > 0
      ? immutableEntries.join('\n')
      : html.replaceAll(/nonce="[^"]+"/g, 'nonce="<nonce>"');

  return createHash('sha256').update(identitySource).digest('hex');
};

export const buildIdentityForIndexFile = async (
  indexPath: string,
): Promise<string> => {
  return buildIdentityForHtml(await readFile(indexPath, 'utf8'));
};

export const assertDistinctPreviews = ({
  allowIdentical,
  baselineProvenanceId,
  baselineUrl,
  candidateProvenanceId,
  candidateUrl,
}: {
  allowIdentical: boolean;
  baselineProvenanceId: string;
  baselineUrl: string;
  candidateProvenanceId: string;
  candidateUrl: string;
}): void => {
  const sameUrl =
    new URL('/', baselineUrl).href === new URL('/', candidateUrl).href;
  const sameProvenance = baselineProvenanceId === candidateProvenanceId;

  if (allowIdentical) {
    if (sameUrl && sameProvenance) return;
    throw new Error(
      'MIGRATION_EVIDENCE_ALLOW_IDENTICAL_PREVIEWS=1 requires identical preview URLs and provenance IDs',
    );
  }

  if (sameUrl) {
    throw new Error(
      'Baseline and candidate preview URLs must be distinct; set MIGRATION_EVIDENCE_ALLOW_IDENTICAL_PREVIEWS=1 only for a baseline self-test',
    );
  }
  if (sameProvenance) {
    throw new Error(
      'Baseline and candidate provenance IDs must be distinct; set MIGRATION_EVIDENCE_ALLOW_IDENTICAL_PREVIEWS=1 only for a baseline self-test',
    );
  }
};

const exclusiveWriteError = (outputPath: string, error: unknown): never => {
  if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
    throw new Error(`Evidence output already exists: ${outputPath}`);
  }
  throw error;
};

export const createFreshOutputRoot = async (
  outputRoot: string,
): Promise<void> => {
  await mkdir(path.dirname(outputRoot), { recursive: true });
  try {
    await mkdir(outputRoot);
  } catch (error) {
    exclusiveWriteError(outputRoot, error);
  }
};

export const writeJsonExclusive = async (
  outputPath: string,
  value: unknown,
): Promise<void> => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, {
      flag: 'wx',
    });
  } catch (error) {
    exclusiveWriteError(outputPath, error);
  }
};

export const writeBufferExclusive = async (
  outputPath: string,
  value: Uint8Array,
): Promise<void> => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await writeFile(outputPath, value, { flag: 'wx' });
  } catch (error) {
    exclusiveWriteError(outputPath, error);
  }
};

export const verifyPreview = async ({
  expectedBundleSha256,
  expectedProvenanceId,
  expectedSha256,
  fetchPreview = fetch,
  timeoutMilliseconds = 5000,
  url,
  variant,
}: {
  expectedBundleSha256: string;
  expectedProvenanceId: string;
  expectedSha256: string;
  fetchPreview?: FetchPreview;
  timeoutMilliseconds?: number;
  url: string;
  variant: PreviewVariant;
}): Promise<PreviewVerification> => {
  const rootUrl = new URL('/', url);
  let response: Response | undefined;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMilliseconds);

  try {
    response = await fetchPreview(rootUrl, {
      redirect: 'error',
      signal: controller.signal,
    });

    if (response.status !== 200) {
      throw new Error(
        `${variant} preview returned ${response.status} at ${rootUrl.href}`,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('text/html')) {
      throw new Error(
        `${variant} preview did not expose HTML at ${rootUrl.href}: ${contentType}`,
      );
    }

    const provenanceId =
      response.headers.get('x-migration-evidence-provenance-id') ?? '';
    if (provenanceId !== expectedProvenanceId) {
      throw new Error(
        `${variant} provenance mismatch: expected ${expectedProvenanceId}, received ${provenanceId || 'missing header'}`,
      );
    }
    const bundleSha256 =
      response.headers.get('x-migration-evidence-bundle-sha256') ?? '';
    if (bundleSha256.toLowerCase() !== expectedBundleSha256.toLowerCase()) {
      throw new Error(
        `${variant} archived bundle identity mismatch: expected ${expectedBundleSha256.toLowerCase()}, received ${bundleSha256 || 'missing header'}`,
      );
    }

    const body = await response.text();
    const sha256 = buildIdentityForHtml(body);
    if (sha256 !== expectedSha256.toLowerCase()) {
      throw new Error(
        `${variant} build identity mismatch: expected ${expectedSha256.toLowerCase()}, received ${sha256}`,
      );
    }

    return {
      url: rootUrl.href,
      status: response.status,
      contentType,
      sha256,
      bundleSha256,
      provenanceId,
    };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(
        `${variant} preview response timed out at ${rootUrl.href}`,
      );
    }
    if (!response) {
      throw new Error(
        `${variant} preview is unreachable at ${rootUrl.href}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
