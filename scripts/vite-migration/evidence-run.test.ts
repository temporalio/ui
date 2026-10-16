import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  assertDistinctPreviews,
  buildIdentityForHtml,
  buildIdentityForIndexFile,
  createFreshOutputRoot,
  verifyPreview,
  writeJsonExclusive,
} from './evidence-run';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'vite-migration-evidence-run-'),
  );
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('evidence run safety', () => {
  it('normalizes the per-response CSP nonce in build identity', () => {
    expect(buildIdentityForHtml('<script nonce="first">start()</script>')).toBe(
      buildIdentityForHtml('<script nonce="second">start()</script>'),
    );
  });

  it('identifies archived and served shells by immutable entry assets', () => {
    const archived =
      '<link href="/_app/immutable/entry/start.start-hash.js"><link href="/_app/immutable/entry/app.app-hash.js">';
    const served =
      '<link href="./_app/immutable/assets/app.css"><link href="./_app/immutable/entry/start.start-hash.js"><link href="./_app/immutable/entry/app.app-hash.js">';

    expect(buildIdentityForHtml(archived)).toBe(buildIdentityForHtml(served));
  });

  it('creates a new output root exclusively', async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputRoot = path.join(temporaryDirectory, 'nested', 'evidence');

    await createFreshOutputRoot(outputRoot);

    await expect(createFreshOutputRoot(outputRoot)).rejects.toThrow(
      'already exists',
    );
  });

  it('derives build identity from an archived index file', async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const indexPath = path.join(temporaryDirectory, 'index.html');
    const html = '<html><body>archived build</body></html>';
    await writeFile(indexPath, html);

    await expect(buildIdentityForIndexFile(indexPath)).resolves.toBe(
      buildIdentityForHtml(html),
    );
  });

  it('rejects the same preview URL for a real comparison', () => {
    expect(() =>
      assertDistinctPreviews({
        allowIdentical: false,
        baselineProvenanceId: 'baseline',
        baselineUrl: 'http://127.0.0.1:4173',
        candidateProvenanceId: 'candidate',
        candidateUrl: 'http://127.0.0.1:4173/',
      }),
    ).toThrow('preview URLs must be distinct');
  });

  it('rejects the same provenance for a real comparison', () => {
    expect(() =>
      assertDistinctPreviews({
        allowIdentical: false,
        baselineProvenanceId: 'same',
        baselineUrl: 'http://127.0.0.1:4173',
        candidateProvenanceId: 'same',
        candidateUrl: 'http://127.0.0.1:4174',
      }),
    ).toThrow('provenance IDs must be distinct');
  });

  it('allows identical content identities with distinct provenance', () => {
    expect(() =>
      assertDistinctPreviews({
        allowIdentical: false,
        baselineProvenanceId: 'baseline',
        baselineUrl: 'http://127.0.0.1:4173',
        candidateProvenanceId: 'candidate',
        candidateUrl: 'http://127.0.0.1:4174',
      }),
    ).not.toThrow();
  });

  it('allows identical previews only for an explicit baseline self-test', () => {
    expect(() =>
      assertDistinctPreviews({
        allowIdentical: true,
        baselineProvenanceId: 'same',
        baselineUrl: 'http://127.0.0.1:4173',
        candidateProvenanceId: 'same',
        candidateUrl: 'http://127.0.0.1:4173',
      }),
    ).not.toThrow();
  });

  it('rejects a self-test exception when URL and provenance are not both identical', () => {
    expect(() =>
      assertDistinctPreviews({
        allowIdentical: true,
        baselineProvenanceId: 'same',
        baselineUrl: 'http://127.0.0.1:4173',
        candidateProvenanceId: 'same',
        candidateUrl: 'http://127.0.0.1:4174',
      }),
    ).toThrow('requires identical preview URLs and provenance IDs');
  });

  it('refuses to overwrite an evidence file', async () => {
    const temporaryDirectory = await createTemporaryDirectory();
    const outputPath = path.join(temporaryDirectory, 'evidence.json');
    await writeFile(outputPath, '{}\n');

    await expect(
      writeJsonExclusive(outputPath, { routeCount: 75 }),
    ).rejects.toThrow('already exists');
  });

  it('rejects an unreachable preview', async () => {
    const fetchPreview = vi
      .fn()
      .mockRejectedValue(new Error('connection refused'));

    await expect(
      verifyPreview({
        expectedBundleSha256: 'unused',
        expectedProvenanceId: 'unused',
        expectedSha256: 'unused',
        fetchPreview,
        url: 'http://127.0.0.1:4173',
        variant: 'baseline',
      }),
    ).rejects.toThrow('baseline preview is unreachable');
  });

  it('aborts a preview whose response body stalls', async () => {
    const body = '<html>baseline</html>';
    const fetchPreview = vi.fn(
      (
        _input: string | URL | Request,
        init?: RequestInit,
      ): Promise<Response> => {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            init?.signal?.addEventListener(
              'abort',
              () => controller.error(new Error('aborted')),
              { once: true },
            );
          },
        });
        return Promise.resolve(
          new Response(stream, {
            headers: {
              'content-type': 'text/html',
              'x-migration-evidence-bundle-sha256': 'baseline-bundle',
              'x-migration-evidence-provenance-id': 'baseline-provenance',
            },
            status: 200,
          }),
        );
      },
    );

    await expect(
      verifyPreview({
        expectedBundleSha256: 'baseline-bundle',
        expectedProvenanceId: 'baseline-provenance',
        expectedSha256: buildIdentityForHtml(body),
        fetchPreview,
        timeoutMilliseconds: 10,
        url: 'http://127.0.0.1:4173',
        variant: 'baseline',
      }),
    ).rejects.toThrow('baseline preview response timed out');
  });

  it('rejects a preview with the wrong build identity', async () => {
    const body = '<html>candidate</html>';
    const fetchPreview = vi.fn().mockResolvedValue(
      new Response(body, {
        headers: {
          'content-type': 'text/html',
          'x-migration-evidence-bundle-sha256': 'candidate-bundle',
          'x-migration-evidence-provenance-id': 'candidate-provenance',
        },
        status: 200,
      }),
    );

    await expect(
      verifyPreview({
        expectedBundleSha256: 'candidate-bundle',
        expectedProvenanceId: 'candidate-provenance',
        expectedSha256: createHash('sha256')
          .update('<html>baseline</html>')
          .digest('hex'),
        fetchPreview,
        url: 'http://127.0.0.1:4174',
        variant: 'candidate',
      }),
    ).rejects.toThrow('candidate build identity mismatch');
  });

  it('returns the verified build identity for a ready preview', async () => {
    const body = '<html>baseline</html>';
    const sha256 = createHash('sha256').update(body).digest('hex');
    const fetchPreview = vi.fn().mockResolvedValue(
      new Response(body, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-migration-evidence-bundle-sha256': 'baseline-bundle',
          'x-migration-evidence-provenance-id': 'baseline-provenance',
        },
        status: 200,
      }),
    );

    await expect(
      verifyPreview({
        expectedBundleSha256: 'baseline-bundle',
        expectedProvenanceId: 'baseline-provenance',
        expectedSha256: sha256,
        fetchPreview,
        url: 'http://127.0.0.1:4173',
        variant: 'baseline',
      }),
    ).resolves.toMatchObject({
      bundleSha256: 'baseline-bundle',
      provenanceId: 'baseline-provenance',
      sha256,
      status: 200,
    });
  });

  it('rejects a preview with the wrong provenance header', async () => {
    const body = '<html>baseline</html>';
    const fetchPreview = vi.fn().mockResolvedValue(
      new Response(body, {
        headers: {
          'content-type': 'text/html',
          'x-migration-evidence-bundle-sha256': 'baseline-bundle',
          'x-migration-evidence-provenance-id': 'unexpected',
        },
        status: 200,
      }),
    );

    await expect(
      verifyPreview({
        expectedBundleSha256: 'baseline-bundle',
        expectedProvenanceId: 'baseline-provenance',
        expectedSha256: buildIdentityForHtml(body),
        fetchPreview,
        url: 'http://127.0.0.1:4173',
        variant: 'baseline',
      }),
    ).rejects.toThrow('baseline provenance mismatch');
  });

  it('rejects a preview with the wrong archived bundle identity', async () => {
    const body = '<html>baseline</html>';
    const fetchPreview = vi.fn().mockResolvedValue(
      new Response(body, {
        headers: {
          'content-type': 'text/html',
          'x-migration-evidence-bundle-sha256': 'unexpected',
          'x-migration-evidence-provenance-id': 'baseline-provenance',
        },
        status: 200,
      }),
    );

    await expect(
      verifyPreview({
        expectedBundleSha256: 'baseline-bundle',
        expectedProvenanceId: 'baseline-provenance',
        expectedSha256: buildIdentityForHtml(body),
        fetchPreview,
        url: 'http://127.0.0.1:4173',
        variant: 'baseline',
      }),
    ).rejects.toThrow('baseline archived bundle identity mismatch');
  });
});
