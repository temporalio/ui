import { execFile } from 'node:child_process';
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import {
  createUiCatalogAuthoring,
  uiCatalogAuthoringLimits,
} from './ui-authoring';
import type { CatalogLoadedExample } from '../../src/lib/catalog/authoring';

const temporaryDirectories: string[] = [];
const execFileAsync = promisify(execFile);

const createIsolatedCatalogRoot = async () => {
  const rootDirectory = await mkdtemp(
    join(process.cwd(), '.catalog-ui-authoring-'),
  );
  temporaryDirectories.push(rootDirectory);
  await Promise.all([
    cp('src/lib/catalog', join(rootDirectory, 'src/lib/catalog'), {
      recursive: true,
    }),
    cp('package.json', join(rootDirectory, 'package.json')),
  ]);
  return rootDirectory;
};

const createIsolatedCatalogCliRoot = async () => {
  const rootDirectory = await mkdtemp(
    join(process.cwd(), '.catalog-ui-authoring-cli-'),
  );
  temporaryDirectories.push(rootDirectory);
  await Promise.all([
    cp('scripts/catalog', join(rootDirectory, 'scripts/catalog'), {
      recursive: true,
    }),
    cp(
      'scripts/get-project-root.ts',
      join(rootDirectory, 'scripts/get-project-root.ts'),
    ),
    cp('src/lib/catalog', join(rootDirectory, 'src/lib/catalog'), {
      recursive: true,
    }),
    cp('package.json', join(rootDirectory, 'package.json')),
  ]);
  return rootDirectory;
};

const runIsolatedCatalogCli = async (
  rootDirectory: string,
  ...arguments_: string[]
) =>
  execFileAsync(
    'pnpm',
    [
      'exec',
      'esno',
      join(rootDirectory, 'scripts/catalog/catalog-cli.ts'),
      ...arguments_,
    ],
    { cwd: rootDirectory },
  );

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('UI catalog authoring adapter', () => {
  it('previews the exact repository effects without mutating or reserving the example', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);
    await authoring.scaffold('preview-effects');

    const preview = await authoring.previewPromote({
      exampleId: 'preview-effects',
      saveState: { durability: 'durable', status: 'saved' },
    });

    expect(preview).toEqual({
      authoredSource: 'catalog.local/examples/preview-effects',
      destination: {
        id: 'oss',
        path: 'src/lib/catalog/worker/examples/preview-effects',
      },
      exampleId: 'preview-effects',
      generatedOutputs: [
        { gitEffect: 'ignored-update', path: 'catalog.local/registration.ts' },
        { gitEffect: 'ignored-update', path: 'catalog.local/workflows.ts' },
        {
          gitEffect: 'ignored-update',
          path: 'catalog.local/catalog.generated.json',
        },
        {
          gitEffect: 'tracked-update',
          path: 'src/lib/catalog/worker/examples/index.ts',
        },
        {
          gitEffect: 'tracked-update',
          path: 'src/lib/catalog/worker/workflows.ts',
        },
        {
          gitEffect: 'tracked-update',
          path: 'src/lib/catalog/browser/catalog.generated.json',
        },
        {
          gitEffect: 'tracked-update',
          path: 'src/lib/catalog/browser/catalog.generated.ts',
        },
      ],
      gitEffects: {
        destination: 'tracked-addition',
        source: 'ignored-removal',
      },
      revision: expect.any(String),
      source: {
        id: 'local',
        path: 'catalog.local/examples/preview-effects',
      },
      status: 'available',
    });
    expect(preview.status === 'available' && preview.revision).not.toContain(
      rootDirectory,
    );
    await expect(
      readFile(
        join(
          rootDirectory,
          'catalog.local/examples/preview-effects/example.ts',
        ),
        'utf8',
      ),
    ).resolves.toContain("id: 'preview-effects'");
    await expect(
      readFile(join(rootDirectory, '.catalog.lock'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/catalog/worker/examples/preview-effects/example.ts',
        ),
        'utf8',
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('loads one supported file as a revision-bound editable snapshot', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/snapshot-example',
    );
    const filePath = join(exampleDirectory, 'workflow.ts');
    const content = "export const greeting = 'Hej, Temporal π';\n";
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(filePath, content);
    await chmod(filePath, 0o640);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: {
              targetId: 'shared-workflows',
              workflowType: 'snapshotExample',
            },
            id: 'snapshot-example',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);

    const examples = await authoring.loadExamples();

    expectTypeOf(examples).toEqualTypeOf<readonly CatalogLoadedExample[]>();
    expect(examples).toEqual([
      {
        id: 'snapshot-example',
        sourceFiles: [
          {
            content,
            editable: true,
            mode: 0o640,
            path: 'workflow.ts',
          },
        ],
        sourceId: 'oss',
        sourceSnapshot: {
          baseRevision: expect.stringMatching(/^[a-f\d]{64}$/),
          limits: {
            maxDepth: 8,
            maxFileBytes: 256 * 1024,
            maxFiles: 64,
            maxTotalBytes: 1024 * 1024,
          },
        },
        targetId: 'shared-workflows',
        workflowType: 'snapshotExample',
      },
    ]);
  });

  it('derives a stable revision from file paths, contents, and modes', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/stable-revision',
    );
    const sourcePath = join(exampleDirectory, 'workflow.ts');
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(sourcePath, 'export const version = 1;\n');
    await chmod(sourcePath, 0o640);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'stable-revision',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const loadRevision = async () =>
      (await authoring.loadExamples())[0]!.sourceSnapshot.baseRevision;

    const original = await loadRevision();
    expect(await loadRevision()).toBe(original);

    await writeFile(sourcePath, 'export const version = 2;\n');
    const contentChanged = await loadRevision();
    expect(contentChanged).not.toBe(original);

    await chmod(sourcePath, 0o600);
    const modeChanged = await loadRevision();
    expect(modeChanged).not.toBe(contentChanged);

    const nestedDirectory = join(exampleDirectory, 'nested');
    await mkdir(nestedDirectory);
    await rename(sourcePath, join(nestedDirectory, 'workflow.ts'));
    expect(await loadRevision()).not.toBe(modeChanged);
  });

  it('rejects an unsafe descriptor ID before resolving its source directory', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: '../outside',
            source: { id: 'oss' },
          },
        ],
      }),
    );

    await expect(
      createUiCatalogAuthoring(rootDirectory).loadExamples(),
    ).rejects.toThrow('Catalog descriptor has an invalid example ID');
  });

  it('reports a busy catalog instead of loading while a mutation owns the revision lock', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    await writeFile(
      join(rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: Date.now(), pid: process.pid })}\n`,
    );

    await expect(
      createUiCatalogAuthoring(rootDirectory).loadExamples(),
    ).rejects.toThrow('Another catalog mutation is already in progress');
  });

  it('keeps new scaffolds focused while loading every file in an existing example tree', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);

    await authoring.scaffold('new-example');
    expect(
      (
        await readdir(join(rootDirectory, 'catalog.local/examples/new-example'))
      ).sort(),
    ).toEqual(['example.ts', 'workflow.ts']);

    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/complete-tree',
    );
    await mkdir(join(exampleDirectory, 'notes'), { recursive: true });
    await Promise.all([
      writeFile(
        join(exampleDirectory, 'example.ts'),
        'export const catalogExample = true;\n',
      ),
      writeFile(
        join(exampleDirectory, 'notes/context.md'),
        '# Why this example exists\n',
      ),
      writeFile(
        join(exampleDirectory, 'workflow.ts'),
        'export async function completeTree() {}\n',
      ),
    ]);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: {
              targetId: 'shared-workflows',
              workflowType: 'completeTree',
            },
            id: 'complete-tree',
            source: { id: 'oss' },
          },
        ],
      }),
    );

    const examples = await authoring.loadExamples();

    expect(
      examples
        .find(({ id }) => id === 'complete-tree')
        ?.sourceFiles.map(({ content, path }) => ({ content, path })),
    ).toEqual([
      {
        content: 'export const catalogExample = true;\n',
        path: 'example.ts',
      },
      {
        content: '# Why this example exists\n',
        path: 'notes/context.md',
      },
      {
        content: 'export async function completeTree() {}\n',
        path: 'workflow.ts',
      },
    ]);
  });

  it('adds one confined file to the buffered example without writing it to disk', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/buffered-example',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'workflow.ts'),
      'export async function bufferedExample() {}\n',
    );
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: {
              targetId: 'shared-workflows',
              workflowType: 'bufferedExample',
            },
            id: 'buffered-example',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const [example] = await authoring.loadExamples();

    const buffered = authoring.addFile(example!, {
      content: '# Buffered notes\n',
      path: 'notes/context.md',
    });

    expect(buffered.sourceFiles).toContainEqual({
      content: '# Buffered notes\n',
      editable: true,
      mode: 0o644,
      path: 'notes/context.md',
    });
    expect(example!.sourceFiles.map(({ path }) => path)).toEqual([
      'workflow.ts',
    ]);
    expect(() =>
      authoring.addFile(buffered, {
        content: '# Replacement notes\n',
        path: 'notes/context.md',
      }),
    ).toThrow('Catalog file already exists: notes/context.md');
    await expect(
      readFile(join(exampleDirectory, 'notes/context.md'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('marks an existing buffered file for removal and restores it without changing disk', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/removable-example',
    );
    const filePath = join(exampleDirectory, 'workflow.ts');
    const content = 'export async function removableExample() {}\n';
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(filePath, content);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: {
              targetId: 'shared-workflows',
              workflowType: 'removableExample',
            },
            id: 'removable-example',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const [example] = await authoring.loadExamples();

    const pendingRemoval = authoring.removeFile(example!, 'workflow.ts');

    expect(pendingRemoval.sourceFiles).toContainEqual({
      content,
      editable: true,
      mode: 0o644,
      path: 'workflow.ts',
      removed: true,
    });
    expect(await readFile(filePath, 'utf8')).toBe(content);

    const restored = authoring.restoreFile(pendingRemoval, 'workflow.ts');

    expect(restored.sourceFiles).toContainEqual({
      content,
      editable: true,
      mode: 0o644,
      path: 'workflow.ts',
    });
    expect(await readFile(filePath, 'utf8')).toBe(content);
  });

  it('preserves loaded modes and refuses a client-supplied mode for a new buffered file', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/mode-example',
    );
    const filePath = join(exampleDirectory, 'workflow.ts');
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(filePath, 'export async function modeExample() {}\n');
    await chmod(filePath, 0o640);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: {
              targetId: 'shared-workflows',
              workflowType: 'modeExample',
            },
            id: 'mode-example',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const [example] = await authoring.loadExamples();

    const buffered = authoring.addFile(example!, {
      content: '# Notes\n',
      mode: 0o777,
      path: 'notes.md',
    } as Parameters<typeof authoring.addFile>[1]);

    expect(buffered.sourceFiles).toEqual([
      {
        content: '# Notes\n',
        editable: true,
        mode: 0o644,
        path: 'notes.md',
      },
      {
        content: 'export async function modeExample() {}\n',
        editable: true,
        mode: 0o640,
        path: 'workflow.ts',
      },
    ]);
  });

  it('excludes files that cannot safely participate in the editable fileset', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/confined-example',
    );
    const externalPath = join(rootDirectory, 'outside.ts');
    await mkdir(exampleDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(exampleDirectory, 'workflow.ts'),
        'export async function confinedExample() {}\n',
      ),
      writeFile(
        join(exampleDirectory, 'asset.bin'),
        Buffer.from([0xff, 0xd8, 0xff]),
      ),
      writeFile(join(exampleDirectory, 'nul.bin'), Buffer.from([0, 1, 2])),
      writeFile(join(exampleDirectory, 'catalog.generated.json'), '{}\n'),
      writeFile(join(exampleDirectory, 'unsafe\\name.ts'), 'export {};\n'),
      writeFile(externalPath, 'export const outside = true;\n'),
    ]);
    await symlink(externalPath, join(exampleDirectory, 'linked.ts'));
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: {
              targetId: 'shared-workflows',
              workflowType: 'confinedExample',
            },
            id: 'confined-example',
            source: { id: 'oss' },
          },
        ],
      }),
    );

    const [example] =
      await createUiCatalogAuthoring(rootDirectory).loadExamples();

    expect(example?.sourceFiles.map(({ path }) => path)).toEqual([
      'workflow.ts',
    ]);
  });

  it('does not follow a source file replaced by a symlink immediately before open', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/replaced-entry',
    );
    const victimPath = join(exampleDirectory, 'victim.ts');
    const outsidePath = join(rootDirectory, 'outside.ts');
    await mkdir(exampleDirectory, { recursive: true });
    await Promise.all([
      writeFile(victimPath, 'export const original = true;\n'),
      writeFile(outsidePath, 'export const secret = true;\n'),
      writeFile(
        join(exampleDirectory, 'workflow.ts'),
        'export async function replacedEntry() {}\n',
      ),
    ]);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'replaced-entry',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory, {
      beforeOpenSourceFile: async (path) => {
        if (path !== victimPath) return;
        await unlink(victimPath);
        await symlink(outsidePath, victimPath);
      },
    });

    const [example] = await authoring.loadExamples();

    expect(example?.sourceFiles.map(({ path }) => path)).toEqual([
      'workflow.ts',
    ]);
  });

  it('rejects an example directory entry that is a symbolic link', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const externalDirectory = join(rootDirectory, 'external-example');
    const linkedDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/linked-directory',
    );
    await mkdir(externalDirectory);
    await writeFile(join(externalDirectory, 'workflow.ts'), 'export {};\n');
    await symlink(externalDirectory, linkedDirectory, 'dir');
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'linked-directory',
            source: { id: 'oss' },
          },
        ],
      }),
    );

    await expect(
      createUiCatalogAuthoring(rootDirectory).loadExamples(),
    ).rejects.toThrow('source directory must be a real directory');
  });

  it('rejects a configured examples ancestor that is a symbolic link', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const examplesDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples',
    );
    const externalExamplesDirectory = join(rootDirectory, 'outside-examples');
    const exampleId = 'linked-ancestor';
    await rm(examplesDirectory, { recursive: true });
    await mkdir(join(externalExamplesDirectory, exampleId), {
      recursive: true,
    });
    await writeFile(
      join(externalExamplesDirectory, exampleId, 'workflow.ts'),
      'export const outside = true;\n',
    );
    await symlink(externalExamplesDirectory, examplesDirectory, 'dir');
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: exampleId,
            source: { id: 'oss' },
          },
        ],
      }),
    );

    await expect(
      createUiCatalogAuthoring(rootDirectory).loadExamples(),
    ).rejects.toThrow('source root cannot traverse symbolic links');
  });

  it('rejects a parent directory replaced while opening a source file', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/replaced-parent',
    );
    const nestedDirectory = join(exampleDirectory, 'nested');
    const victimPath = join(nestedDirectory, 'victim.ts');
    const outsideDirectory = join(rootDirectory, 'outside-parent');
    await Promise.all([
      mkdir(nestedDirectory, { recursive: true }),
      mkdir(outsideDirectory, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(victimPath, 'export const original = true;\n'),
      writeFile(
        join(outsideDirectory, 'victim.ts'),
        'export const outside = true;\n',
      ),
    ]);
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'replaced-parent',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory, {
      beforeOpenSourceFile: async (path) => {
        if (path !== victimPath) return;
        await rm(nestedDirectory, { recursive: true });
        await symlink(outsideDirectory, nestedDirectory, 'dir');
      },
    });

    await expect(authoring.loadExamples()).rejects.toThrow(
      'source tree changed while loading',
    );
  });

  it('bounds a source read and rejects a file that grows after opening', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/growing-source',
    );
    const sourcePath = join(exampleDirectory, 'workflow.ts');
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(sourcePath, 'x');
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'growing-source',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory, {
      beforeReadSourceFile: async (path) => {
        if (path === sourcePath) {
          await writeFile(path, 'x'.repeat(256 * 1024 + 1));
        }
      },
    });

    await expect(authoring.loadExamples()).rejects.toThrow(
      'maximum file size of 262144 bytes',
    );
  });

  it('rejects editable trees that exceed the declared snapshot limits', async () => {
    const loadLimitedExample = async (
      exampleId: string,
      createFiles: (directory: string) => Promise<void>,
    ) => {
      const rootDirectory = await createIsolatedCatalogRoot();
      const exampleDirectory = join(
        rootDirectory,
        `src/lib/catalog/worker/examples/${exampleId}`,
      );
      await mkdir(exampleDirectory, { recursive: true });
      await createFiles(exampleDirectory);
      await writeFile(
        join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
        JSON.stringify({
          descriptors: [
            {
              execution: { targetId: 'shared-workflows' },
              id: exampleId,
              source: { id: 'oss' },
            },
          ],
        }),
      );
      return createUiCatalogAuthoring(rootDirectory).loadExamples();
    };
    const results = await Promise.allSettled([
      loadLimitedExample('deep-example', async (directory) => {
        const deepDirectory = join(directory, 'a/b/c/d/e/f/g/h');
        await mkdir(deepDirectory, { recursive: true });
        await writeFile(join(deepDirectory, 'too-deep.ts'), 'export {};\n');
      }),
      loadLimitedExample('large-file-example', (directory) =>
        writeFile(join(directory, 'large.ts'), 'x'.repeat(256 * 1024 + 1)),
      ),
      loadLimitedExample('many-files-example', async (directory) => {
        await Promise.all(
          Array.from({ length: 65 }, (_, index) =>
            writeFile(join(directory, `${index}.ts`), 'export {};\n'),
          ),
        );
      }),
      loadLimitedExample('large-tree-example', async (directory) => {
        await Promise.all(
          Array.from({ length: 5 }, (_, index) =>
            writeFile(join(directory, `${index}.ts`), 'x'.repeat(220 * 1024)),
          ),
        );
      }),
    ]);

    expect(
      results.map((result) =>
        result.status === 'rejected' ? String(result.reason) : 'loaded',
      ),
    ).toEqual([
      expect.stringContaining('maximum depth of 8'),
      expect.stringContaining('maximum file size of 262144 bytes'),
      expect.stringContaining('maximum file count of 64'),
      expect.stringContaining('maximum total size of 1048576 bytes'),
    ]);
  });

  it('keeps ordinary verification independent from editor snapshot limits', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);
    await authoring.scaffold('verify-large-source');
    await writeFile(
      join(
        rootDirectory,
        'catalog.local/examples/verify-large-source/notes.md',
      ),
      'x'.repeat(256 * 1024 + 1),
    );
    await authoring.generate();

    await expect(authoring.verify()).resolves.toBeUndefined();
    await expect(authoring.loadExamples()).rejects.toThrow(
      'maximum file size of 262144 bytes',
    );
  });

  it('refuses unsupported or over-limit files before adding them to the buffered fileset', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/add-limits-example',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(join(exampleDirectory, 'workflow.ts'), 'abc');
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'add-limits-example',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const [loaded] = await authoring.loadExamples();
    const example = {
      ...loaded!,
      sourceSnapshot: {
        ...loaded!.sourceSnapshot,
        limits: {
          maxDepth: Number.MAX_SAFE_INTEGER,
          maxFileBytes: Number.MAX_SAFE_INTEGER,
          maxFiles: Number.MAX_SAFE_INTEGER,
          maxTotalBytes: Number.MAX_SAFE_INTEGER,
        },
      },
    };
    const file = (path: string, content = '') => ({
      content,
      editable: true,
      mode: 0o644,
      path,
    });
    const additions = [
      () => authoring.addFile(example, { content: '\0', path: 'binary.ts' }),
      () =>
        authoring.addFile(example, {
          content: 'abc',
          path: 'notes.generated.ts',
        }),
      () =>
        authoring.addFile(example, {
          content: 'a',
          path: 'a/b/c/d/e/f/g/h/i.ts',
        }),
      () =>
        authoring.addFile(example, {
          content: 'x'.repeat(256 * 1024 + 1),
          path: 'large.ts',
        }),
      () =>
        authoring.addFile(
          {
            ...example,
            sourceFiles: Array.from({ length: 64 }, (_, index) =>
              file(`${index}.ts`),
            ),
          },
          { content: '', path: 'extra.ts' },
        ),
      () =>
        authoring.addFile(
          {
            ...example,
            sourceFiles: Array.from({ length: 4 }, (_, index) =>
              file(`${index}.ts`, 'x'.repeat(256 * 1024)),
            ),
          },
          { content: 'a', path: 'total.ts' },
        ),
    ];

    expect(
      additions.map((add) => {
        try {
          add();
          return 'added';
        } catch (error) {
          return String(error);
        }
      }),
    ).toEqual([
      expect.stringContaining('binary content'),
      expect.stringContaining('generated file'),
      expect.stringContaining('maximum depth of 8'),
      expect.stringContaining('maximum file size of 262144 bytes'),
      expect.stringContaining('maximum file count of 64'),
      expect.stringContaining('maximum total size of 1048576 bytes'),
    ]);
  });

  it('refuses Restore when intervening additions would exceed server-owned limits', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/restore-limits',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(join(exampleDirectory, 'workflow.ts'), 'export {};\n');
    await writeFile(
      join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
      JSON.stringify({
        descriptors: [
          {
            execution: { targetId: 'shared-workflows' },
            id: 'restore-limits',
            source: { id: 'oss' },
          },
        ],
      }),
    );
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const [loaded] = await authoring.loadExamples();
    const file = (path: string, content = '') => ({
      content,
      editable: true,
      mode: 0o644,
      path,
    });
    const fullByCount = {
      ...loaded!,
      sourceFiles: Array.from({ length: 64 }, (_, index) =>
        file(`${index}.ts`),
      ),
    };
    const countPending = authoring.removeFile(fullByCount, '0.ts');
    const countWithAddition = authoring.addFile(countPending, {
      content: '',
      path: 'added.ts',
    });
    const fullByBytes = {
      ...loaded!,
      sourceFiles: Array.from({ length: 4 }, (_, index) =>
        file(`${index}.ts`, 'x'.repeat(256 * 1024)),
      ),
    };
    const bytesPending = authoring.removeFile(fullByBytes, '0.ts');
    const bytesWithAddition = authoring.addFile(bytesPending, {
      content: 'a',
      path: 'added.ts',
    });

    expect(() => authoring.restoreFile(countWithAddition, '0.ts')).toThrow(
      'maximum file count of 64',
    );
    expect(() => authoring.restoreFile(bytesWithAddition, '0.ts')).toThrow(
      'maximum total size of 1048576 bytes',
    );
  });

  it('keeps production loader limits immutable and server-owned', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const example = {
      id: 'immutable-limits',
      sourceFiles: Array.from({ length: 64 }, (_, index) => ({
        content: '',
        editable: true,
        mode: 0o644,
        path: `${index}.ts`,
      })),
      sourceId: 'oss',
      sourceSnapshot: {
        baseRevision: 'revision',
        limits: {
          maxDepth: Number.MAX_SAFE_INTEGER,
          maxFileBytes: Number.MAX_SAFE_INTEGER,
          maxFiles: Number.MAX_SAFE_INTEGER,
          maxTotalBytes: Number.MAX_SAFE_INTEGER,
        },
      },
      targetId: 'shared-workflows',
    };

    expect(Object.isFrozen(uiCatalogAuthoringLimits)).toBe(true);
    expect(() =>
      authoring.addFile(example, { content: '', path: 'added.ts' }),
    ).toThrow('maximum file count of 64');
  });

  it('regenerates and verifies the canonical UI catalog', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);

    await authoring.generate();
    await expect(authoring.verify()).resolves.toBeUndefined();
  });

  it('scaffolds, promotes, and immediately verifies in an isolated catalog', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);

    await authoring.scaffold('promotion-regression');
    await expect(
      authoring.promote('promotion-regression'),
    ).resolves.toBeDefined();
    await expect(authoring.verify()).resolves.toBeUndefined();

    const indexPath = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/index.ts',
    );
    await writeFile(indexPath, `${await readFile(indexPath, 'utf8')}\n`);
    await expect(authoring.verify()).rejects.toThrow(
      'has generated output drift',
    );
  });

  it('scaffolds, promotes, and demotes across fresh CLI processes', async () => {
    const rootDirectory = await createIsolatedCatalogCliRoot();

    await runIsolatedCatalogCli(rootDirectory, 'scaffold', 'round-trip');
    await runIsolatedCatalogCli(rootDirectory, 'promote', 'round-trip');
    await runIsolatedCatalogCli(rootDirectory, 'demote', 'round-trip');
    await runIsolatedCatalogCli(rootDirectory, 'verify');

    await expect(
      readFile(
        join(rootDirectory, 'catalog.local/examples/round-trip/example.ts'),
        'utf8',
      ),
    ).resolves.toContain("id: 'round-trip'");
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/catalog/worker/examples/round-trip/example.ts',
        ),
        'utf8',
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(
        join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
        'utf8',
      ),
    ).resolves.not.toContain('"id": "round-trip"');
    await expect(
      readFile(
        join(rootDirectory, 'catalog.local/catalog.generated.json'),
        'utf8',
      ),
    ).resolves.toContain('"id": "round-trip"');
    await expect(
      readFile(join(rootDirectory, '.catalog.lock'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(rootDirectory, '.catalog.journal.json'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  }, 30_000);

  it('demotes a canonical example into the ignored local catalog and immediately verifies', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiCatalogAuthoring(rootDirectory);
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples/demotion-regression',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'workflow.ts'),
      "export const demotionRegression = () => 'demoted';\n",
    );
    await writeFile(
      join(exampleDirectory, 'example.ts'),
      `import { demotionRegression } from './workflow.js';

export const catalogExample = {
  id: 'demotion-regression',
  title: 'Demotion regression',
  description: 'Exercises the demotion transaction.',
  capabilityTags: ['terminal-outcome'],
  expectedEvidence: ['A completed workflow result.'],
  input: { defaultValue: [], schema: { type: 'array' } },
  startOptions: { defaultValue: {}, schema: { type: 'object' } },
  execution: {
    kind: 'workflow' as const,
    workflowType: 'demotionRegression',
    workflow: demotionRegression,
    activities: {},
  },
};
`,
    );

    await expect(
      authoring.demote('demotion-regression'),
    ).resolves.toBeDefined();
    await expect(authoring.verify()).resolves.toBeUndefined();

    await expect(
      readFile(
        join(
          rootDirectory,
          'catalog.local/examples/demotion-regression/example.ts',
        ),
        'utf8',
      ),
    ).resolves.toContain("id: 'demotion-regression'");
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/catalog/worker/examples/demotion-regression/example.ts',
        ),
        'utf8',
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(rootDirectory, 'catalog.local/registration.ts'), 'utf8'),
    ).resolves.toContain("from './examples/demotion-regression/example.js'");
    await expect(
      readFile(
        join(rootDirectory, 'src/lib/catalog/browser/catalog.generated.json'),
        'utf8',
      ),
    ).resolves.not.toContain('"id": "demotion-regression"');
  });
});
