import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  archiveBuild,
  artifactContentIdentity,
  compareArtifactMatrices,
  createArtifactMatrix,
  inventoryBuild,
  requiredArtifactOutputs,
  writeArtifactInventory,
} from './artifact-inventory';

const temporaryDirectories: string[] = [];

const createBuild = async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), 'vite-migration-inventory-'),
  );
  temporaryDirectories.push(temporaryDirectory);

  const buildDirectory = path.join(temporaryDirectory, 'build');
  await mkdir(path.join(buildDirectory, 'assets'), { recursive: true });
  await writeFile(path.join(buildDirectory, 'index.html'), '<h1>UI</h1>\n');
  await writeFile(
    path.join(buildDirectory, 'assets', 'app.js'),
    'console.log("ui");\n',
  );

  return { buildDirectory, temporaryDirectory };
};

afterEach(async () => {
  const { rm } = await import('node:fs/promises');

  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('build artifact inventory', () => {
  it('records deterministic digests and raw, gzip, and Brotli sizes', async () => {
    const { buildDirectory } = await createBuild();

    const first = await inventoryBuild(buildDirectory);
    const second = await inventoryBuild(buildDirectory);

    expect(first).toEqual(second);
    expect(first.files.map(({ path: filePath }) => filePath)).toEqual([
      'assets/app.js',
      'index.html',
    ]);
    expect(first.files[0]).toEqual({
      type: 'file',
      path: 'assets/app.js',
      sha256:
        '4adee8395c217656c1ae82d6cc98780e1c357a83debf427021018764e56b6ef6',
      bytes: 19,
      gzipBytes: expect.any(Number),
      brotliBytes: expect.any(Number),
    });
  });

  it('derives the inventory identity without compression calculations', async () => {
    const { buildDirectory } = await createBuild();
    const inventory = await inventoryBuild(buildDirectory);

    await expect(artifactContentIdentity(buildDirectory)).resolves.toBe(
      inventory.sha256,
    );
  });

  it('writes an inventory outside the supplied build without changing it', async () => {
    const { buildDirectory, temporaryDirectory } = await createBuild();
    const outputPath = path.join(temporaryDirectory, 'inventory.json');
    const before = await inventoryBuild(buildDirectory);

    await writeArtifactInventory(buildDirectory, outputPath);

    expect(await inventoryBuild(buildDirectory)).toEqual(before);
    expect(JSON.parse(await readFile(outputPath, 'utf8'))).toEqual(before);
  });

  it('refuses to overwrite an existing inventory', async () => {
    const { buildDirectory, temporaryDirectory } = await createBuild();
    const outputPath = path.join(temporaryDirectory, 'inventory.json');
    await writeFile(outputPath, '{}\n');

    await expect(
      writeArtifactInventory(buildDirectory, outputPath),
    ).rejects.toThrow('already exists');
  });

  it('refuses to place an inventory inside the supplied build', async () => {
    const { buildDirectory } = await createBuild();

    await expect(
      writeArtifactInventory(
        buildDirectory,
        path.join(buildDirectory, 'inventory.json'),
      ),
    ).rejects.toThrow('outside the build directory');
  });

  it('requires every migration artifact output in a matrix', () => {
    expect(requiredArtifactOutputs).toEqual([
      'static',
      'docker',
      'embedded-server',
      'vercel',
      'package',
      'storybook',
      'catalog',
    ]);

    expect(() =>
      createArtifactMatrix({
        static: {
          files: 1,
          sha256: 'static',
          bytes: 1,
          gzipBytes: 1,
          brotliBytes: 1,
        },
      }),
    ).toThrow('Missing required artifact outputs');
  });

  it('fails comparison when a required artifact is missing', () => {
    expect(() =>
      compareArtifactMatrices(
        { version: 1, artifacts: {} },
        { version: 1, artifacts: {} },
      ),
    ).toThrow('Missing required artifact outputs');
  });

  it('rejects empty required artifact outputs', () => {
    const artifacts = Object.fromEntries(
      requiredArtifactOutputs.map((output) => [
        output,
        {
          files: output === 'catalog' ? 0 : 1,
          sha256: output,
          bytes: 1,
          gzipBytes: 1,
          brotliBytes: 1,
        },
      ]),
    ) as Parameters<typeof createArtifactMatrix>[0];

    expect(() => createArtifactMatrix(artifacts)).toThrow(
      'Missing required artifact outputs: catalog',
    );
  });

  it('compares every required output in complete matrices', () => {
    const artifacts = Object.fromEntries(
      requiredArtifactOutputs.map((output) => [
        output,
        {
          files: 1,
          sha256: output,
          bytes: 1,
          gzipBytes: 1,
          brotliBytes: 1,
        },
      ]),
    ) as Parameters<typeof createArtifactMatrix>[0];
    const comparison = compareArtifactMatrices(
      createArtifactMatrix(artifacts),
      createArtifactMatrix(artifacts),
    );

    expect(Object.keys(comparison.artifacts).sort()).toEqual(
      [...requiredArtifactOutputs].sort(),
    );
    expect(
      Object.values(comparison.artifacts).every(({ changed }) => !changed),
    ).toBe(true);
  });

  it('creates archive parents without overwriting an existing archive', async () => {
    const { buildDirectory, temporaryDirectory } = await createBuild();
    const archiveDirectory = path.join(temporaryDirectory, 'nested', 'archive');

    await archiveBuild(buildDirectory, archiveDirectory);

    expect(
      await readFile(path.join(archiveDirectory, 'assets', 'app.js'), 'utf8'),
    ).toBe('console.log("ui");\n');
    await expect(
      archiveBuild(buildDirectory, archiveDirectory),
    ).rejects.toThrow('already exists');
  });

  it('records a symlink target without following it outside the root', async () => {
    const { buildDirectory, temporaryDirectory } = await createBuild();
    await writeFile(path.join(temporaryDirectory, 'outside.txt'), 'outside\n');
    await symlink(
      path.join('..', '..', 'outside.txt'),
      path.join(buildDirectory, 'assets', 'external.txt'),
    );

    const inventory = await inventoryBuild(buildDirectory);

    expect(
      inventory.files.find(
        ({ path: filePath }) => filePath === 'assets/external.txt',
      ),
    ).toEqual({
      type: 'symlink',
      path: 'assets/external.txt',
      linkTarget: '../../outside.txt',
      sha256:
        '5c2c1e16ef166d0a4bd8086dd3ab0cf8962a491a600b4ceb890664576ea5dc5b',
      bytes: 17,
      gzipBytes: expect.any(Number),
      brotliBytes: expect.any(Number),
    });
  });

  it('archives a symlink without dereferencing its target', async () => {
    const { buildDirectory, temporaryDirectory } = await createBuild();
    const linkTarget = path.join('..', '..', 'outside.txt');
    await writeFile(path.join(temporaryDirectory, 'outside.txt'), 'outside\n');
    await symlink(
      linkTarget,
      path.join(buildDirectory, 'assets', 'external.txt'),
    );
    const archiveDirectory = path.join(temporaryDirectory, 'archive');

    await archiveBuild(buildDirectory, archiveDirectory);

    const archivedLink = path.join(archiveDirectory, 'assets', 'external.txt');
    expect((await lstat(archivedLink)).isSymbolicLink()).toBe(true);
    expect(await readlink(archivedLink)).toBe(linkTarget);
  });
});
