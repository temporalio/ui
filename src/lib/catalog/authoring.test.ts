import { execFile } from 'node:child_process';
import {
  access,
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import {
  type CatalogAuthoringAdapter,
  type CatalogComposedExample,
  type CatalogSaveProgressEvent,
  composeCatalogArtifacts,
  createCatalogAuthoring as createCatalogAuthoringSdk,
  createCatalogLocalArtifactVitePlugin,
  createCatalogMutationRevision,
  defineCatalogArtifact,
  renderCatalogSourceAssembly,
  runCatalogCli,
  validateCatalogAuthoringGraph,
} from './authoring';
import { parseCatalogTypeScriptModuleSpecifiers } from '../../../scripts/catalog/directory-promotion';

const execFileAsync = promisify(execFile);

const temporaryDirectories: string[] = [];

const createCatalogAuthoring = (
  adapter: Omit<
    CatalogAuthoringAdapter,
    'describePromotion' | 'graph' | 'loadExamples' | 'parseModuleSpecifiers'
  > &
    Partial<
      Pick<
        CatalogAuthoringAdapter,
        'describePromotion' | 'graph' | 'loadExamples' | 'parseModuleSpecifiers'
      >
    >,
) => {
  const supportOutputs = [
    '.catalog-test/local-registration.ts',
    '.catalog-test/local-workflows.ts',
    '.catalog-test/tracked-registration.ts',
    '.catalog-test/tracked-workflows.ts',
  ];
  return createCatalogAuthoringSdk({
    describePromotion: ({ from, to }) => ({
      authoredSource: from,
      destination: { id: 'tracked', path: to },
      generatedOutputs: adapter.generatedPaths.map((path) => ({
        gitEffect: 'tracked-update' as const,
        path,
      })),
      gitEffects: {
        destination: 'tracked-addition' as const,
        source: 'ignored-removal' as const,
      },
      source: { id: 'local', path: from },
    }),
    graph: {
      boundaries: {
        browserPaths: [],
        packageJsonPath: 'package.json',
        workerPaths: [],
      },
      outputs: [...new Set([...supportOutputs, ...adapter.generatedPaths])].map(
        (path) => ({ consumers: ['authoring'] as const, path }),
      ),
      sources: [
        {
          examplesPath: adapter.localExamplesPath,
          id: 'local',
          label: 'Local',
          registrationOutputPath: supportOutputs[0],
          registrationTypePath: '.catalog-test/registration-source.ts',
        },
        {
          examplesPath: adapter.trackedExamplesPath,
          id: 'tracked',
          label: 'Tracked',
          registrationOutputPath: supportOutputs[2],
          registrationTypePath: '.catalog-test/registration-source.ts',
        },
      ],
      targets: [
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'local-task-queue',
          id: 'local-target',
          sourceId: 'local',
          workflowsModulePath: supportOutputs[1],
        },
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'tracked-task-queue',
          id: 'tracked-target',
          sourceId: 'tracked',
          workflowsModulePath: supportOutputs[3],
        },
      ],
    },
    loadExamples: () => [],
    parseModuleSpecifiers: parseCatalogTypeScriptModuleSpecifiers,
    ...adapter,
  });
};

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'catalog-authoring-'));
  temporaryDirectories.push(directory);
  return directory;
};

const createSaveAuthoring = async ({
  afterLoadExamples,
  exampleId,
  generate,
  rootDirectory,
  transactionFilesystem,
}: {
  afterLoadExamples?: (loadCount: number) => void | Promise<void>;
  exampleId: string;
  generate: CatalogAuthoringAdapter['generate'];
  rootDirectory: string;
  transactionFilesystem?: CatalogAuthoringAdapter['transactionFilesystem'];
}) => {
  const exampleDirectory = join(rootDirectory, `local/examples/${exampleId}`);
  let loadCount = 0;
  const loadExamples = async () => {
    const content = await readFile(
      join(exampleDirectory, 'workflow.ts'),
      'utf8',
    );
    const mode = await lstat(join(exampleDirectory, 'workflow.ts')).then(
      (metadata) => metadata.mode & 0o777,
    );
    const examples = [
      {
        id: exampleId,
        sourceFiles: [{ content, editable: true, mode, path: 'workflow.ts' }],
        sourceId: 'local',
        sourceSnapshot: {
          baseRevision: content,
          limits: {
            maxDepth: 8,
            maxFileBytes: 1024,
            maxFiles: 8,
            maxTotalBytes: 4096,
          },
        },
        targetId: 'local-target',
      },
    ];
    await afterLoadExamples?.(++loadCount);
    return examples;
  };
  return createCatalogAuthoringSdk({
    editor: {
      limits: {
        maxDepth: 8,
        maxFileBytes: 1024,
        maxFiles: 8,
        maxTotalBytes: 4096,
      },
      loadExamples,
    },
    generatedPaths: ['generated/catalog.json'],
    graph: {
      boundaries: {
        browserPaths: [],
        packageJsonPath: 'package.json',
        workerPaths: [],
      },
      outputs: [
        { consumers: ['authoring'], path: 'generated/catalog.json' },
        { consumers: ['authoring'], path: 'local-registration.ts' },
        { consumers: ['authoring'], path: 'local-workflows.ts' },
        { consumers: ['authoring'], path: 'tracked-registration.ts' },
        { consumers: ['authoring'], path: 'tracked-workflows.ts' },
      ],
      sources: [
        {
          examplesPath: 'local/examples',
          id: 'local',
          label: 'Local',
          registrationOutputPath: 'local-registration.ts',
          registrationTypePath: 'registration-source.ts',
        },
        {
          examplesPath: 'tracked/examples',
          id: 'tracked',
          label: 'Tracked',
          registrationOutputPath: 'tracked-registration.ts',
          registrationTypePath: 'registration-source.ts',
        },
      ],
      targets: [
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'local',
          id: 'local-target',
          sourceId: 'local',
          workflowsModulePath: 'local-workflows.ts',
        },
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'tracked',
          id: 'tracked-target',
          sourceId: 'tracked',
          workflowsModulePath: 'tracked-workflows.ts',
        },
      ],
    },
    loadExamples: () => [],
    localExamplesPath: 'local/examples',
    parseModuleSpecifiers: () => [],
    rootDirectory,
    scaffold: () => [],
    trackedExamplesPath: 'tracked/examples',
    generate,
    transactionFilesystem,
    verify: () => undefined,
  });
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('catalog authoring', () => {
  it('binds the transaction backup to the expected revision before writing', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'transaction-revision-race';
    const exampleDirectory = join(rootDirectory, `local/examples/${exampleId}`);
    const workflowPath = join(exampleDirectory, 'workflow.ts');
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(workflowPath, 'before\n');
    const externalContent = 'external\n';
    const authoring = await createSaveAuthoring({
      afterLoadExamples: async (loadCount) => {
        if (loadCount === 3) await writeFile(workflowPath, externalContent);
      },
      exampleId,
      generate: () => [],
      rootDirectory,
    });
    const [loaded] = await authoring.loadExamples();

    const terminal = await authoring.save({
      baseRevision: loaded!.sourceSnapshot.baseRevision,
      exampleId,
      files: [{ content: 'browser\n', path: 'workflow.ts' }],
      operationId: 'transaction-revision-race-operation',
    });

    expect(terminal).toMatchObject({
      outcome: { reason: 'stale-revision', status: 'refused' },
      ownership: 'released',
      reload: 'none',
    });
    await expect(readFile(workflowPath, 'utf8')).resolves.toBe(externalContent);
  });

  it('retains an incomplete Save rollback map until restart recovery succeeds', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    const exampleId = 'incomplete-save-recovery';
    const exampleDirectory = join(rootDirectory, `local/examples/${exampleId}`);
    const generatedDirectory = join(rootDirectory, 'generated');
    await mkdir(exampleDirectory, { recursive: true });
    await mkdir(generatedDirectory, { recursive: true });
    await writeFile(join(exampleDirectory, 'workflow.ts'), 'before\n');
    await writeFile(join(generatedDirectory, 'catalog.json'), 'before\n');
    let obstructRollback = true;
    const generate = async () => {
      if (!obstructRollback) return [];
      await rm(generatedDirectory, { force: true, recursive: true });
      await symlink(externalDirectory, generatedDirectory, 'dir');
      throw new Error('generation and rollback fail');
    };
    const authoring = await createSaveAuthoring({
      exampleId,
      generate,
      rootDirectory,
    });
    const [loaded] = await authoring.loadExamples();

    const terminal = await authoring.save({
      baseRevision: loaded!.sourceSnapshot.baseRevision,
      exampleId,
      files: [{ content: 'after\n', path: 'workflow.ts' }],
      operationId: 'incomplete-save-recovery-operation',
    });

    expect(terminal).toMatchObject({
      outcome: {
        reason: 'recovery-incomplete',
        recovery: 'incomplete',
        status: 'failed',
      },
      ownership: 'retained',
    });
    const journal = JSON.parse(
      await readFile(join(rootDirectory, '.catalog.journal.json'), 'utf8'),
    ) as {
      operationTerminal?: unknown;
      snapshots?: { backupPath?: string }[];
      transactionPath?: string;
    };
    expect(journal).toMatchObject({
      operationTerminal: terminal,
      snapshots: expect.any(Array),
      transactionPath: expect.stringMatching(/^\.catalog\.transaction-/),
    });
    await expect(
      access(join(rootDirectory, journal.snapshots![0]!.backupPath!)),
    ).resolves.toBeUndefined();

    await rm(generatedDirectory, { force: true, recursive: true });
    await mkdir(generatedDirectory);
    obstructRollback = false;
    let failJournalUnlink = true;
    const cleanupFailedRestart = await createSaveAuthoring({
      exampleId,
      generate,
      rootDirectory,
      transactionFilesystem: {
        rm,
        unlink: async (path) => {
          if (failJournalUnlink && path.endsWith('.catalog.journal.json')) {
            failJournalUnlink = false;
            throw new Error('journal cleanup failed');
          }
          await unlink(path);
        },
      },
    });
    await expect(cleanupFailedRestart.loadExamples()).rejects.toThrow(
      'journal cleanup failed',
    );
    expect(
      JSON.parse(
        await readFile(join(rootDirectory, '.catalog.journal.json'), 'utf8'),
      ),
    ).toMatchObject({ operationTerminal: terminal, state: 'restored' });
    expect(
      JSON.parse(
        await readFile(
          join(rootDirectory, '.catalog.journal.terminal.pending.json'),
          'utf8',
        ),
      ),
    ).toMatchObject({ state: 'terminal', terminal });

    // Simulate interruption after journal unlink but before staged replacement.
    await unlink(join(rootDirectory, '.catalog.journal.json'));

    const finalizedRestart = await createSaveAuthoring({
      exampleId,
      generate,
      rootDirectory,
    });
    await finalizedRestart.loadExamples();

    await expect(
      readFile(join(generatedDirectory, 'catalog.json'), 'utf8'),
    ).resolves.toBe('before\n');
    await expect(
      access(join(rootDirectory, journal.transactionPath!)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      finalizedRestart.inspectSaveOperation(terminal.operationId),
    ).resolves.toMatchObject({
      events: [terminal],
      ownership: 'retained',
      status: 'terminal',
      terminal,
    });
  });

  it('retains committed Save cleanup evidence until restart finalization succeeds', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'committed-save-recovery';
    const exampleDirectory = join(rootDirectory, `local/examples/${exampleId}`);
    const generatedDirectory = join(rootDirectory, 'generated');
    await mkdir(exampleDirectory, { recursive: true });
    await mkdir(generatedDirectory, { recursive: true });
    await writeFile(join(exampleDirectory, 'workflow.ts'), 'before\n');
    await writeFile(join(generatedDirectory, 'catalog.json'), 'before\n');
    let failCleanup = true;
    const generate = () => [
      { content: 'generated after\n', path: 'generated/catalog.json' },
    ];
    const authoring = await createSaveAuthoring({
      exampleId,
      generate,
      rootDirectory,
      transactionFilesystem: {
        rm: async (path, options) => {
          if (failCleanup && path.includes('.catalog.transaction-')) {
            failCleanup = false;
            throw new Error('transaction cleanup failed');
          }
          await rm(path, options);
        },
        unlink,
      },
    });
    const [loaded] = await authoring.loadExamples();

    const terminal = await authoring.save({
      baseRevision: loaded!.sourceSnapshot.baseRevision,
      exampleId,
      files: [{ content: 'after\n', path: 'workflow.ts' }],
      operationId: 'committed-save-recovery-operation',
    });

    expect(terminal).toMatchObject({
      outcome: {
        reason: 'finalization-failed',
        recovery: 'committed',
        status: 'failed',
      },
      ownership: 'retained',
    });
    const journal = JSON.parse(
      await readFile(join(rootDirectory, '.catalog.journal.json'), 'utf8'),
    ) as {
      operationTerminal?: unknown;
      snapshots?: unknown[];
      state?: string;
      transactionPath?: string;
    };
    expect(journal).toMatchObject({
      operationTerminal: terminal,
      snapshots: expect.any(Array),
      state: 'committed',
      transactionPath: expect.stringMatching(/^\.catalog\.transaction-/),
    });

    const restarted = await createSaveAuthoring({
      exampleId,
      generate,
      rootDirectory,
    });
    await restarted.loadExamples();

    await expect(
      readFile(join(exampleDirectory, 'workflow.ts'), 'utf8'),
    ).resolves.toBe('after\n');
    await expect(
      readFile(join(generatedDirectory, 'catalog.json'), 'utf8'),
    ).resolves.toBe('generated after\n');
    await expect(
      access(join(rootDirectory, journal.transactionPath!)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      restarted.inspectSaveOperation(terminal.operationId),
    ).resolves.toMatchObject({
      events: [terminal],
      ownership: 'retained',
      status: 'terminal',
      terminal,
    });
  });

  it('emits verification as not reached after Save regeneration fails', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'regeneration-progress';
    const exampleDirectory = join(rootDirectory, `local/examples/${exampleId}`);
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(join(exampleDirectory, 'workflow.ts'), 'before\n');
    const authoring = await createSaveAuthoring({
      exampleId,
      generate: () => {
        throw new Error('regeneration failed');
      },
      rootDirectory,
    });
    const [loaded] = await authoring.loadExamples();
    const events: CatalogSaveProgressEvent[] = [];

    const terminal = await authoring.save(
      {
        baseRevision: loaded!.sourceSnapshot.baseRevision,
        exampleId,
        files: [{ content: 'after\n', path: 'workflow.ts' }],
        operationId: 'regeneration-progress-operation',
      },
      (event) => events.push(event),
    );

    expect(terminal).toMatchObject({
      outcome: { reason: 'check-failed', status: 'failed' },
      ownership: 'released',
      reload: 'publish',
    });
    expect(
      events.map((event) =>
        event.kind === 'check'
          ? [event.sequence, event.step, event.state]
          : [event.sequence, event.kind, event.outcome.status],
      ),
    ).toEqual([
      [1, 'write_files', 'started'],
      [2, 'write_files', 'passed'],
      [3, 'regen', 'started'],
      [4, 'regen', 'failed'],
      [5, 'verify', 'not-reached'],
      [6, 'terminal', 'failed'],
    ]);
    expect(
      events.every(({ operationId }) => operationId === terminal.operationId),
    ).toBe(true);
    expect(events.at(-1)).toBe(terminal);
    await expect(
      readFile(join(exampleDirectory, 'workflow.ts'), 'utf8'),
    ).resolves.toBe('before\n');
  });

  it('restores complete-tree edits, additions, removals, modes, and generated output after a blocking Save check fails', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'local/examples/rollback-save',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await mkdir(join(rootDirectory, 'generated'), { recursive: true });
    await writeFile(join(exampleDirectory, 'keep.ts'), 'before\n');
    await chmod(join(exampleDirectory, 'keep.ts'), 0o640);
    await writeFile(join(exampleDirectory, 'remove.ts'), 'remove before\n');
    await writeFile(join(rootDirectory, 'generated/catalog.json'), 'before\n');
    await writeFile(join(rootDirectory, 'static-input.ts'), 'static\n');
    let journalPaths: string[] = [];
    const loadExamples = async () => [
      {
        id: 'rollback-save',
        sourceFiles: [
          {
            content: await readFile(join(exampleDirectory, 'keep.ts'), 'utf8'),
            editable: true,
            mode: 0o640,
            path: 'keep.ts',
          },
          {
            content: await readFile(
              join(exampleDirectory, 'remove.ts'),
              'utf8',
            ),
            editable: true,
            mode: 0o644,
            path: 'remove.ts',
          },
        ],
        sourceId: 'local',
        sourceSnapshot: {
          baseRevision: 'rollback-save-revision',
          limits: {
            maxDepth: 8,
            maxFileBytes: 1024,
            maxFiles: 8,
            maxTotalBytes: 4096,
          },
        },
        targetId: 'local-target',
      },
    ];
    const authoring = createCatalogAuthoringSdk({
      editor: {
        limits: {
          maxDepth: 8,
          maxFileBytes: 1024,
          maxFiles: 8,
          maxTotalBytes: 4096,
        },
        loadExamples,
      },
      generatedPaths: ['generated/catalog.json'],
      graph: {
        boundaries: {
          browserPaths: [],
          packageJsonPath: 'package.json',
          workerPaths: [],
        },
        outputs: [
          { consumers: ['authoring'], path: 'generated/catalog.json' },
          { consumers: ['authoring'], path: 'local-registration.ts' },
          { consumers: ['authoring'], path: 'local-workflows.ts' },
          { consumers: ['authoring'], path: 'tracked-registration.ts' },
          { consumers: ['authoring'], path: 'tracked-workflows.ts' },
          { consumers: ['authoring'], path: 'static-input.ts' },
        ],
        sources: [
          {
            examplesPath: 'local/examples',
            id: 'local',
            label: 'Local',
            registrationOutputPath: 'local-registration.ts',
            registrationTypePath: 'registration-source.ts',
          },
          {
            examplesPath: 'tracked/examples',
            id: 'tracked',
            label: 'Tracked',
            registrationOutputPath: 'tracked-registration.ts',
            registrationTypePath: 'registration-source.ts',
          },
        ],
        targets: [
          {
            defaultNamespace: 'default',
            defaultTaskQueue: 'local',
            id: 'local-target',
            sourceId: 'local',
            workflowsModulePath: 'local-workflows.ts',
          },
          {
            defaultNamespace: 'default',
            defaultTaskQueue: 'tracked',
            id: 'tracked-target',
            sourceId: 'tracked',
            workflowsModulePath: 'tracked-workflows.ts',
          },
        ],
      },
      loadExamples: () => [],
      localExamplesPath: 'local/examples',
      parseModuleSpecifiers: () => [],
      rootDirectory,
      scaffold: () => [],
      trackedExamplesPath: 'tracked/examples',
      generate: async () => {
        const journal = JSON.parse(
          await readFile(join(rootDirectory, '.catalog.journal.json'), 'utf8'),
        ) as { snapshots: { path: string }[] };
        journalPaths = journal.snapshots.map(({ path }) => path).sort();
        return [
          {
            content: 'generated during save\n',
            path: 'generated/catalog.json',
          },
        ];
      },
      verify: () => {
        throw new Error('blocking verification failed');
      },
    });

    const events: CatalogSaveProgressEvent[] = [];
    const terminal = await authoring.save(
      {
        baseRevision: 'rollback-save-revision',
        exampleId: 'rollback-save',
        files: [
          { content: 'after\n', path: 'keep.ts' },
          { content: 'remove before\n', path: 'remove.ts', removed: true },
          { content: 'added\n', path: 'added.ts' },
        ],
        operationId: 'rollback-save-operation',
      },
      (event) => events.push(event),
    );

    expect(terminal).toMatchObject({
      outcome: {
        filesystem: 'restored',
        reason: 'check-failed',
        recovery: 'rolled-back',
        status: 'failed',
      },
      ownership: 'released',
      reload: 'publish',
    });
    await expect(
      readFile(join(exampleDirectory, 'keep.ts'), 'utf8'),
    ).resolves.toBe('before\n');
    await expect(
      lstat(join(exampleDirectory, 'keep.ts')).then(({ mode }) => mode & 0o777),
    ).resolves.toBe(0o640);
    await expect(
      readFile(join(exampleDirectory, 'remove.ts'), 'utf8'),
    ).resolves.toBe('remove before\n');
    await expect(
      access(join(exampleDirectory, 'added.ts')),
    ).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(
      readFile(join(rootDirectory, 'generated/catalog.json'), 'utf8'),
    ).resolves.toBe('before\n');
    expect(journalPaths).toEqual([
      'generated/catalog.json',
      'local/examples/rollback-save/added.ts',
      'local/examples/rollback-save/keep.ts',
      'local/examples/rollback-save/remove.ts',
    ]);
    expect(journalPaths).not.toContain('static-input.ts');
    expect(
      events.map((event) =>
        event.kind === 'check'
          ? [event.sequence, event.step, event.state]
          : [event.sequence, event.kind, event.outcome.status],
      ),
    ).toEqual([
      [1, 'write_files', 'started'],
      [2, 'write_files', 'passed'],
      [3, 'regen', 'started'],
      [4, 'regen', 'passed'],
      [5, 'verify', 'started'],
      [6, 'verify', 'failed'],
      [7, 'terminal', 'failed'],
    ]);
  });

  it('confirms a saved Local promotion with the same result as Promote', async () => {
    const createPromotionFixture = async () => {
      const rootDirectory = await createTemporaryDirectory();
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: ['generated/catalog.json'],
        scaffold: ({ exampleId }) => [
          {
            path: `local/examples/${exampleId}/example.ts`,
            content: 'export const example = true;\n',
          },
        ],
        generate: async () => {
          const tracked = await readdir(
            join(rootDirectory, 'tracked/examples'),
          ).catch(() => []);
          return [
            {
              path: 'generated/catalog.json',
              content: `${JSON.stringify(tracked.sort())}\n`,
            },
          ];
        },
      });
      await authoring.scaffold('saved-example');
      return { authoring, rootDirectory };
    };
    const confirmedFixture = await createPromotionFixture();
    const directFixture = await createPromotionFixture();

    const preview = await confirmedFixture.authoring.previewPromote({
      exampleId: 'saved-example',
      saveState: { durability: 'durable', status: 'saved' },
    });
    expect(preview.status).toBe('available');
    if (preview.status !== 'available') throw new Error('preview unavailable');
    const confirmed = await confirmedFixture.authoring.confirmPromote({
      exampleId: 'saved-example',
      revision: preview.revision,
      saveState: { durability: 'durable', status: 'saved' },
    });
    const direct = await directFixture.authoring.promote('saved-example');

    expect(confirmed).toEqual({
      commit: 'durable',
      direction: 'promote',
      result: direct,
      status: 'succeeded',
    });
    await expect(
      readFile(
        join(confirmedFixture.rootDirectory, 'generated/catalog.json'),
        'utf8',
      ),
    ).resolves.toBe(
      await readFile(
        join(directFixture.rootDirectory, 'generated/catalog.json'),
        'utf8',
      ),
    );
  });

  it('makes Promote available only for a durable Save and explains each unavailable state', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const localExample = join(rootDirectory, 'local/examples/save-state');
    await mkdir(localExample, { recursive: true });
    await writeFile(join(localExample, 'example.ts'), 'export {};\n');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(
      authoring.previewPromote({
        exampleId: 'save-state',
        saveState: { status: 'dirty' },
      }),
    ).resolves.toEqual({ reason: 'unsaved-changes', status: 'unavailable' });
    await expect(
      authoring.previewPromote({
        exampleId: 'save-state',
        saveState: { status: 'stale' },
      }),
    ).resolves.toEqual({
      reason: 'saved-revision-stale',
      status: 'unavailable',
    });
    await expect(
      authoring.previewPromote({
        exampleId: 'save-state',
        saveState: { status: 'failed' },
      }),
    ).resolves.toEqual({ reason: 'save-failed', status: 'unavailable' });
    await expect(
      authoring.previewPromote({
        exampleId: 'save-state',
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({ status: 'available' });
  });

  it('keeps legacy adapters usable when promotion preview effects are not configured', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const legacyAdapter = {
      generatedPaths: [],
      generate: () => [],
      graph: {
        boundaries: {
          browserPaths: [],
          packageJsonPath: 'package.json',
          workerPaths: [],
        },
        outputs: [],
        sources: [],
        targets: [],
      },
      loadExamples: () => [],
      localExamplesPath: 'local/examples',
      parseModuleSpecifiers: () => [],
      rootDirectory,
      scaffold: () => [],
      trackedExamplesPath: 'tracked/examples',
    } satisfies CatalogAuthoringAdapter;
    const authoring = createCatalogAuthoringSdk(legacyAdapter);

    await expect(
      authoring.previewPromote({
        exampleId: 'legacy-adapter',
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      reason: 'preview-not-supported',
      status: 'unavailable',
    });
    await expect(authoring.verify()).resolves.toBeUndefined();
  });

  it('changes its deterministic opaque revision for every source and destination change', async () => {
    const revision = (
      overrides: {
        destination?: {
          contentHash?: string;
          entries?: {
            contentHash: string;
            mode: number;
            path: string;
            type: 'directory' | 'file';
          }[];
          mode?: number;
          path?: string;
          state: 'absent' | 'directory' | 'file';
        };
        source?: {
          contentHash: string;
          mode: number;
          path: string;
          type: 'directory' | 'file';
        }[];
        sourceRoot?: { identity: string; mode: number; path: string };
      } = {},
    ) =>
      createCatalogMutationRevision({
        destination: overrides.destination
          ? { path: '/repo/tracked/example', ...overrides.destination }
          : { path: '/repo/tracked/example', state: 'absent' },
        source: overrides.source ?? [
          {
            contentHash: 'first',
            mode: 0o644,
            path: 'example.ts',
            type: 'file',
          },
        ],
        sourceRoot: overrides.sourceRoot ?? {
          identity: 'source-root-1',
          mode: 0o755,
          path: '/repo/local/example',
        },
      });
    const original = revision();
    const variants = [
      revision({
        source: [
          {
            contentHash: 'first',
            mode: 0o644,
            path: 'example.ts',
            type: 'file',
          },
          {
            contentHash: 'added',
            mode: 0o644,
            path: 'workflow.ts',
            type: 'file',
          },
        ],
      }),
      revision({ source: [] }),
      revision({
        source: [
          {
            contentHash: 'changed',
            mode: 0o644,
            path: 'example.ts',
            type: 'file',
          },
        ],
      }),
      revision({
        source: [
          {
            contentHash: 'first',
            mode: 0o755,
            path: 'example.ts',
            type: 'file',
          },
        ],
      }),
      revision({
        source: [
          {
            contentHash: 'first',
            mode: 0o644,
            path: 'example.ts',
            type: 'directory',
          },
        ],
      }),
      revision({
        sourceRoot: {
          identity: 'source-root-1',
          mode: 0o700,
          path: '/repo/local/example',
        },
      }),
      revision({
        destination: {
          contentHash: 'destination-one',
          mode: 0o644,
          path: '/repo/tracked/example',
          state: 'file',
        },
      }),
      revision({
        destination: {
          contentHash: 'destination-two',
          mode: 0o644,
          path: '/repo/tracked/example',
          state: 'file',
        },
      }),
      revision({
        destination: {
          contentHash: 'destination-one',
          mode: 0o600,
          path: '/repo/tracked/example',
          state: 'file',
        },
      }),
      revision({
        destination: {
          entries: [],
          mode: 0o755,
          path: '/repo/tracked/example',
          state: 'directory',
        },
      }),
      revision({
        destination: {
          path: '/repo/tracked/renamed-example',
          state: 'absent',
        },
      }),
    ];

    expect(original).toMatch(/^[a-f0-9]{64}$/);
    expect(new Set(variants).size).toBe(variants.length);
    expect(variants).not.toContain(original);
    expect(
      revision({
        source: [
          {
            contentHash: 'added',
            mode: 0o644,
            path: 'workflow.ts',
            type: 'file',
          },
          {
            contentHash: 'first',
            mode: 0o644,
            path: 'example.ts',
            type: 'file',
          },
        ],
      }),
    ).toBe(variants[0]);
    expect(original).not.toContain('example.ts');
    expect(original).not.toContain('first');
  });

  it('refuses a stale confirmation before moving a changed source', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const localExample = join(rootDirectory, 'local/examples/stale-preview');
    await mkdir(localExample, { recursive: true });
    await writeFile(
      join(localExample, 'example.ts'),
      'export const value = 1;\n',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });
    const preview = await authoring.previewPromote({
      exampleId: 'stale-preview',
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (preview.status !== 'available') throw new Error('preview unavailable');
    await writeFile(
      join(localExample, 'example.ts'),
      'export const value = 2;\n',
    );

    await expect(
      authoring.confirmPromote({
        exampleId: 'stale-preview',
        revision: preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      reason: 'stale-preview',
      status: 'refused',
    });
    await expect(
      readFile(join(localExample, 'example.ts'), 'utf8'),
    ).resolves.toContain('value = 2');
    await expect(
      access(join(rootDirectory, 'tracked/examples/stale-preview')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('returns a named refusal with a repository-relative detail for invalid source', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'invalid-source';
    const localExample = join(rootDirectory, `local/examples/${exampleId}`);
    await mkdir(localExample, { recursive: true });
    await writeFile(join(localExample, 'example.ts'), 'export {};\n');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });
    const preview = await authoring.previewPromote({
      exampleId,
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (preview.status !== 'available') throw new Error('preview unavailable');
    await writeFile(
      join(localExample, 'example.ts'),
      "import '../../outside';\n",
    );

    const result = await authoring.confirmPromote({
      exampleId,
      revision: preview.revision,
      saveState: { durability: 'durable', status: 'saved' },
    });
    expect(result).toEqual({
      detail:
        'local/examples/invalid-source/example.ts relative imports must stay within its example directory',
      direction: 'promote',
      reason: 'source-invalid',
      status: 'refused',
    });
    expect(JSON.stringify(result)).not.toContain(rootDirectory);
  });

  it('returns a named refusal when the previewed source disappears', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'missing-source';
    const localExample = join(rootDirectory, `local/examples/${exampleId}`);
    await mkdir(localExample, { recursive: true });
    await writeFile(join(localExample, 'example.ts'), 'export {};\n');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });
    const preview = await authoring.previewPromote({
      exampleId,
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (preview.status !== 'available') throw new Error('preview unavailable');
    await rm(localExample, { recursive: true });

    await expect(
      authoring.confirmPromote({
        exampleId,
        revision: preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      detail:
        'Local catalog example does not exist: local/examples/missing-source',
      direction: 'promote',
      reason: 'source-invalid',
      status: 'refused',
    });
  });

  it('returns typed destination and lock refusals before moving the source', async () => {
    const createFixture = async (exampleId: string) => {
      const rootDirectory = await createTemporaryDirectory();
      const localExample = join(rootDirectory, `local/examples/${exampleId}`);
      await mkdir(localExample, { recursive: true });
      await writeFile(join(localExample, 'example.ts'), 'export {};\n');
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => [],
        generate: () => [],
      });
      const preview = await authoring.previewPromote({
        exampleId,
        saveState: { durability: 'durable', status: 'saved' },
      });
      if (preview.status !== 'available')
        throw new Error('preview unavailable');
      return { authoring, localExample, preview, rootDirectory };
    };
    const conflict = await createFixture('destination-conflict');
    await mkdir(
      join(conflict.rootDirectory, 'tracked/examples/destination-conflict'),
      { recursive: true },
    );
    await expect(
      conflict.authoring.confirmPromote({
        exampleId: 'destination-conflict',
        revision: conflict.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      reason: 'destination-conflict',
      status: 'refused',
    });
    await expect(access(conflict.localExample)).resolves.toBeUndefined();

    const busy = await createFixture('busy-catalog');
    await writeFile(
      join(busy.rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: Date.now(), pid: process.pid })}\n`,
    );
    await expect(
      busy.authoring.confirmPromote({
        exampleId: 'busy-catalog',
        revision: busy.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      reason: 'catalog-busy',
      status: 'refused',
    });
    await expect(access(busy.localExample)).resolves.toBeUndefined();

    const recovery = await createFixture('recovery-refusal');
    await writeFile(
      join(recovery.rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999_999 })}\n`,
    );
    await writeFile(
      join(recovery.rootDirectory, '.catalog.lock.recovery'),
      'not a directory\n',
    );
    await expect(
      recovery.authoring.confirmPromote({
        exampleId: 'recovery-refusal',
        revision: recovery.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      reason: 'recovery-refused',
      status: 'refused',
    });
    await expect(access(recovery.localExample)).resolves.toBeUndefined();
  });

  it('replans and completes all validation under the mutation lock before durable success', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const localExample = join(rootDirectory, 'local/examples/checked-confirm');
    await mkdir(localExample, { recursive: true });
    await writeFile(join(localExample, 'example.ts'), 'export {};\n');
    const calls: string[] = [];
    let expectLock = false;
    const record = async (name: string) => {
      if (expectLock) {
        await expect(
          access(join(rootDirectory, '.catalog.lock')),
        ).resolves.toBeUndefined();
      }
      calls.push(name);
    };
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: async () => {
        await record('generate');
        return [];
      },
      parseModuleSpecifiers: async () => {
        await record('self-containment');
        return [];
      },
      validatePromotion: async () => record('promotion-policy'),
      verifyGenerated: async () => record('verify-generated'),
      verify: async () => record('verify-all'),
    });
    const preview = await authoring.previewPromote({
      exampleId: 'checked-confirm',
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (preview.status !== 'available') throw new Error('preview unavailable');
    calls.length = 0;
    expectLock = true;

    await expect(
      authoring.confirmPromote({
        exampleId: 'checked-confirm',
        revision: preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({ status: 'succeeded' });
    expect(calls).toEqual([
      'self-containment',
      'promotion-policy',
      'generate',
      'self-containment',
      'promotion-policy',
      'generate',
      'verify-generated',
      'verify-all',
    ]);
  });

  it('runs server-owned peer checks in order, stops on blocking failure, and continues after advisory failure', async () => {
    const createFixture = async (
      exampleId: string,
      checks: CatalogAuthoringAdapter['promotionChecks'],
    ) => {
      const rootDirectory = await createTemporaryDirectory();
      const localExample = join(rootDirectory, `local/examples/${exampleId}`);
      await mkdir(localExample, { recursive: true });
      await writeFile(join(localExample, 'example.ts'), 'export {};\n');
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => [],
        generate: () => [],
        promotionChecks: checks,
      });
      const preview = await authoring.previewPromote({
        exampleId,
        saveState: { durability: 'durable', status: 'saved' },
      });
      if (preview.status !== 'available')
        throw new Error('preview unavailable');
      return { authoring, localExample, preview };
    };
    const blockingCalls: string[] = [];
    const blocking = await createFixture('blocking-check', [
      {
        id: 'first',
        label: 'First check',
        run: async () => {
          blockingCalls.push('first');
          return { status: 'passed' as const };
        },
        severity: 'blocking',
      },
      {
        id: 'blocked',
        label: 'Blocking check',
        run: async () => {
          blockingCalls.push('blocked');
          return { detail: 'fix the peer', status: 'failed' as const };
        },
        severity: 'blocking',
      },
      {
        id: 'later',
        label: 'Later check',
        run: async () => {
          blockingCalls.push('later');
          return { status: 'passed' as const };
        },
        severity: 'advisory',
      },
    ]);
    expect(blocking.preview).not.toHaveProperty('replayPolicy');
    await expect(
      blocking.authoring.confirmPromote({
        exampleId: 'blocking-check',
        revision: blocking.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      checks: [
        {
          id: 'first',
          label: 'First check',
          severity: 'blocking',
          status: 'passed',
        },
        {
          detail: 'fix the peer',
          id: 'blocked',
          label: 'Blocking check',
          severity: 'blocking',
          status: 'failed',
        },
        {
          id: 'later',
          label: 'Later check',
          severity: 'advisory',
          status: 'not-reached',
        },
      ],
      direction: 'promote',
      reason: 'check-blocked',
      status: 'refused',
    });
    expect(blockingCalls).toEqual(['first', 'blocked']);
    await expect(access(blocking.localExample)).resolves.toBeUndefined();

    const advisoryCalls: string[] = [];
    const advisory = await createFixture('advisory-check', [
      {
        id: 'advisory',
        label: 'Advisory check',
        run: async () => {
          advisoryCalls.push('advisory');
          return { detail: 'informational', status: 'failed' as const };
        },
        severity: 'advisory',
      },
      {
        id: 'after-advisory',
        label: 'After advisory',
        run: async () => {
          advisoryCalls.push('after-advisory');
          return { status: 'passed' as const };
        },
        severity: 'blocking',
      },
    ]);
    await expect(
      advisory.authoring.confirmPromote({
        exampleId: 'advisory-check',
        revision: advisory.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({
      checks: [
        {
          detail: 'informational',
          id: 'advisory',
          label: 'Advisory check',
          severity: 'advisory',
          status: 'failed',
        },
        {
          id: 'after-advisory',
          label: 'After advisory',
          severity: 'blocking',
          status: 'passed',
        },
      ],
      status: 'succeeded',
    });
    expect(advisoryCalls).toEqual(['advisory', 'after-advisory']);
  });

  it('revalidates source and destination after slow peer checks before moving', async () => {
    const createFixture = async (
      exampleId: string,
      duringCheck: (context: {
        localExample: string;
        rootDirectory: string;
      }) => Promise<void>,
    ) => {
      const rootDirectory = await createTemporaryDirectory();
      const localExample = join(rootDirectory, `local/examples/${exampleId}`);
      await mkdir(localExample, { recursive: true });
      await writeFile(
        join(localExample, 'example.ts'),
        'export const value = 1;\n',
      );
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => [],
        generate: () => [],
        promotionChecks: [
          {
            id: 'slow-peer',
            label: 'Slow peer',
            run: async () => {
              await duringCheck({ localExample, rootDirectory });
              return { status: 'passed' as const };
            },
            severity: 'blocking',
          },
        ],
      });
      const preview = await authoring.previewPromote({
        exampleId,
        saveState: { durability: 'durable', status: 'saved' },
      });
      if (preview.status !== 'available')
        throw new Error('preview unavailable');
      return { authoring, localExample, preview, rootDirectory };
    };

    const edited = await createFixture(
      'edited-during-check',
      async ({ localExample }) => {
        await writeFile(
          join(localExample, 'example.ts'),
          'export const value = 2;\n',
        );
      },
    );
    await expect(
      edited.authoring.confirmPromote({
        exampleId: 'edited-during-check',
        revision: edited.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({
      direction: 'promote',
      reason: 'stale-preview',
      status: 'refused',
    });
    await expect(
      readFile(join(edited.localExample, 'example.ts'), 'utf8'),
    ).resolves.toContain('value = 2');

    const conflicted = await createFixture(
      'created-during-check',
      async ({ rootDirectory }) => {
        await mkdir(
          join(rootDirectory, 'tracked/examples/created-during-check'),
          { recursive: true },
        );
      },
    );
    await expect(
      conflicted.authoring.confirmPromote({
        exampleId: 'created-during-check',
        revision: conflicted.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({
      direction: 'promote',
      reason: 'destination-conflict',
      status: 'refused',
    });
    await expect(access(conflicted.localExample)).resolves.toBeUndefined();
  });

  it('does not replace a destination created after the final promotion plan', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'late-destination';
    const localExample = join(rootDirectory, `local/examples/${exampleId}`);
    const destination = join(rootDirectory, `tracked/examples/${exampleId}`);
    await mkdir(localExample, { recursive: true });
    await writeFile(join(localExample, 'example.ts'), 'export {}\n');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: async () => {
        await mkdir(destination, { recursive: true });
        return [];
      },
    });
    const preview = await authoring.previewPromote({
      exampleId,
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (preview.status !== 'available') throw new Error('preview unavailable');

    await expect(
      authoring.confirmPromote({
        exampleId,
        revision: preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({
      direction: 'promote',
      reason: 'destination-conflict',
      status: 'refused',
    });
    await expect(access(localExample)).resolves.toBeUndefined();
    await expect(readdir(destination)).resolves.toEqual([]);
  });

  it('reports truthful direction-neutral mutation lifecycle outcomes', async () => {
    const createFixture = async ({
      exampleId,
      finalizePromotion,
      generate,
      generatedPaths = [],
      promotionChecks,
    }: {
      exampleId: string;
      finalizePromotion?: CatalogAuthoringAdapter['finalizePromotion'];
      generate: CatalogAuthoringAdapter['generate'];
      generatedPaths?: string[];
      promotionChecks?: CatalogAuthoringAdapter['promotionChecks'];
    }) => {
      const rootDirectory = await createTemporaryDirectory();
      const localExample = join(rootDirectory, `local/examples/${exampleId}`);
      await mkdir(localExample, { recursive: true });
      await writeFile(join(localExample, 'example.ts'), 'export {};\n');
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths,
        scaffold: () => [],
        generate,
        finalizePromotion,
        promotionChecks,
      });
      const preview = await authoring.previewPromote({
        exampleId,
        saveState: { durability: 'durable', status: 'saved' },
      });
      if (preview.status !== 'available')
        throw new Error('preview unavailable');
      return { authoring, localExample, preview, rootDirectory };
    };
    let cleanGenerationCalls = 0;
    const cleanRollback = await createFixture({
      exampleId: 'clean-rollback',
      generatedPaths: ['generated/catalog.json'],
      generate: () => {
        cleanGenerationCalls += 1;
        if (cleanGenerationCalls === 1) {
          return [{ content: 'after\n', path: 'generated/catalog.json' }];
        }
        throw new Error('generation failed after move');
      },
    });
    await mkdir(join(cleanRollback.rootDirectory, 'generated'), {
      recursive: true,
    });
    await writeFile(
      join(cleanRollback.rootDirectory, 'generated/catalog.json'),
      'before\n',
    );
    const refused = await createFixture({
      exampleId: 'save-state-refusal',
      generate: () => [],
    });
    await expect(
      refused.authoring.confirmPromote({
        exampleId: 'save-state-refusal',
        revision: refused.preview.revision,
        saveState: { status: 'dirty' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      reason: 'save-state-changed',
      status: 'refused',
    });
    await expect(access(refused.localExample)).resolves.toBeUndefined();

    await expect(
      cleanRollback.authoring.confirmPromote({
        exampleId: 'clean-rollback',
        revision: cleanRollback.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      filesystem: 'restored',
      reason: 'execution-failed',
      recovery: 'rolled-back',
      status: 'failed',
    });
    await expect(access(cleanRollback.localExample)).resolves.toBeUndefined();
    await expect(
      access(
        join(cleanRollback.rootDirectory, 'tracked/examples/clean-rollback'),
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(
        join(cleanRollback.rootDirectory, 'generated/catalog.json'),
        'utf8',
      ),
    ).resolves.toBe('before\n');

    let incompleteRoot = '';
    let incompleteGenerationCalls = 0;
    const incomplete = await createFixture({
      exampleId: 'incomplete-rollback',
      generatedPaths: ['generated/catalog.json'],
      generate: async () => {
        incompleteGenerationCalls += 1;
        if (incompleteGenerationCalls === 1) {
          return [{ content: 'after\n', path: 'generated/catalog.json' }];
        }
        await rm(join(incompleteRoot, 'generated'), {
          force: true,
          recursive: true,
        });
        await symlink(
          await createTemporaryDirectory(),
          join(incompleteRoot, 'generated'),
          'dir',
        );
        throw new Error('generation and rollback fail');
      },
    });
    incompleteRoot = incomplete.rootDirectory;
    await mkdir(join(incompleteRoot, 'generated'), { recursive: true });
    await writeFile(join(incompleteRoot, 'generated/catalog.json'), 'before\n');
    await expect(
      incomplete.authoring.confirmPromote({
        exampleId: 'incomplete-rollback',
        revision: incomplete.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      filesystem: 'may-have-changed',
      reason: 'recovery-incomplete',
      recovery: 'incomplete',
      status: 'failed',
    });

    let finalizedUnderLock = false;
    const finalization = await createFixture({
      exampleId: 'finalization-failure',
      finalizePromotion: async () => {
        finalizedUnderLock = await access(
          join(finalization.rootDirectory, '.catalog.lock'),
        )
          .then(() => true)
          .catch(() => false);
        throw new Error('finalization failed');
      },
      generate: () => [],
    });
    await expect(
      finalization.authoring.confirmPromote({
        exampleId: 'finalization-failure',
        revision: finalization.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      filesystem: 'changed',
      reason: 'finalization-failed',
      recovery: 'committed',
      status: 'failed',
    });
    expect(finalizedUnderLock).toBe(true);
    await expect(access(finalization.localExample)).rejects.toMatchObject({
      code: 'ENOENT',
    });

    const unknown = await createFixture({
      exampleId: 'unknown-outcome',
      generate: () => [],
      promotionChecks: [
        {
          id: 'unknown',
          label: 'Unknown outcome',
          run: () => {
            throw new Error('peer disappeared');
          },
          severity: 'blocking',
        },
      ],
    });
    await expect(
      unknown.authoring.confirmPromote({
        exampleId: 'unknown-outcome',
        revision: unknown.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      detail: 'unknown: peer disappeared',
      direction: 'promote',
      reason: 'check-failed',
      status: 'refused',
    });

    const policyRoot = await createTemporaryDirectory();
    const policyExample = join(policyRoot, 'local/examples/policy-refusal');
    await mkdir(policyExample, { recursive: true });
    await writeFile(join(policyExample, 'example.ts'), 'export {};\n');
    let policyCalls = 0;
    const policy = createCatalogAuthoring({
      rootDirectory: policyRoot,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
      validatePromotion: () => {
        policyCalls += 1;
        if (policyCalls > 1) throw new Error('repository policy rejected it');
      },
    });
    const policyPreview = await policy.previewPromote({
      exampleId: 'policy-refusal',
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (policyPreview.status !== 'available')
      throw new Error('preview unavailable');
    await expect(
      policy.confirmPromote({
        exampleId: 'policy-refusal',
        revision: policyPreview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      detail: 'repository policy rejected it',
      direction: 'promote',
      reason: 'policy-rejected',
      status: 'refused',
    });

    const durable = await createFixture({
      exampleId: 'durable-success',
      generate: () => [],
    });
    await expect(
      durable.authoring.confirmPromote({
        exampleId: 'durable-success',
        revision: durable.preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({ commit: 'durable', status: 'succeeded' });
    await mkdir(join(durable.rootDirectory, '.catalog.transaction-committed'), {
      recursive: true,
    });
    await writeFile(
      join(durable.rootDirectory, '.catalog.journal.json'),
      `${JSON.stringify({
        id: 'committed',
        move: {
          from: 'local/examples/durable-success',
          marker: '.catalog-move-owner-committed',
          to: 'tracked/examples/durable-success',
        },
        snapshots: [],
        state: 'committed',
        transactionPath: '.catalog.transaction-committed',
      })}\n`,
    );
    await durable.authoring.verify();
    await expect(access(durable.localExample)).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(
      access(
        join(
          durable.rootDirectory,
          'tracked/examples/durable-success/example.ts',
        ),
      ),
    ).resolves.toBeUndefined();
  });

  it.each(['unlink', 'rm'] as const)(
    'retains committed recovery evidence when transaction %s cleanup fails',
    async (failedOperation) => {
      const rootDirectory = await createTemporaryDirectory();
      const exampleId = `cleanup-${failedOperation}`;
      const localExample = join(rootDirectory, `local/examples/${exampleId}`);
      await mkdir(localExample, { recursive: true });
      await writeFile(join(localExample, 'example.ts'), 'export {};\n');
      let failOnce = true;
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => [],
        generate: () => [],
        transactionFilesystem: {
          rm: async (path, options) => {
            if (
              failedOperation === 'rm' &&
              failOnce &&
              path.includes('.catalog.transaction-')
            ) {
              failOnce = false;
              throw new Error('transaction rm failed');
            }
            await rm(path, options);
          },
          unlink: async (path) => {
            if (
              failedOperation === 'unlink' &&
              failOnce &&
              path.endsWith('.catalog.journal.json')
            ) {
              failOnce = false;
              throw new Error('journal unlink failed');
            }
            await unlink(path);
          },
        },
      });
      const preview = await authoring.previewPromote({
        exampleId,
        saveState: { durability: 'durable', status: 'saved' },
      });
      if (preview.status !== 'available')
        throw new Error('preview unavailable');

      await expect(
        authoring.confirmPromote({
          exampleId,
          revision: preview.revision,
          saveState: { durability: 'durable', status: 'saved' },
        }),
      ).resolves.toMatchObject({
        direction: 'promote',
        filesystem: 'changed',
        reason: 'committed-finalization-failed',
        recovery: 'committed',
        recoveryEvidence: {
          journal: '.catalog.journal.json',
          transaction: expect.stringMatching(/^\.catalog\.transaction-/),
        },
        status: 'failed',
      });
      await expect(access(localExample)).rejects.toMatchObject({
        code: 'ENOENT',
      });
      await expect(
        access(join(rootDirectory, '.catalog.journal.json')),
      ).resolves.toBeUndefined();

      await authoring.verify();
      await expect(
        access(join(rootDirectory, '.catalog.journal.json')),
      ).rejects.toMatchObject({ code: 'ENOENT' });
      await expect(
        access(join(rootDirectory, `tracked/examples/${exampleId}/example.ts`)),
      ).resolves.toBeUndefined();
    },
  );

  it('reports outcome unknown when rollback loses the result of its move', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleId = 'unknown-rollback';
    const localExample = join(rootDirectory, `local/examples/${exampleId}`);
    await mkdir(localExample, { recursive: true });
    await writeFile(join(localExample, 'example.ts'), 'export {};\n');
    let generationCalls = 0;
    let loseRollbackResponse = true;
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => {
        generationCalls += 1;
        if (generationCalls === 2) throw new Error('fail after move');
        return [];
      },
      transactionFilesystem: {
        rename: async (from, to) => {
          await rename(from, to);
          if (
            loseRollbackResponse &&
            to.endsWith(`/local/examples/${exampleId}`)
          ) {
            loseRollbackResponse = false;
            throw Object.assign(new Error('rollback response lost'), {
              code: 'EIO',
            });
          }
        },
        rm,
        unlink,
      },
    });
    const preview = await authoring.previewPromote({
      exampleId,
      saveState: { durability: 'durable', status: 'saved' },
    });
    if (preview.status !== 'available') throw new Error('preview unavailable');

    await expect(
      authoring.confirmPromote({
        exampleId,
        revision: preview.revision,
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toEqual({
      direction: 'promote',
      filesystem: 'unknown',
      reason: 'outcome-unknown',
      recovery: 'unknown',
      status: 'failed',
    });
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).resolves.toBeUndefined();
    await authoring.verify();
    await expect(readdir(localExample)).resolves.toEqual(['example.ts']);
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('runs one configured example through scaffold, generation, dry-run promotion, and verification', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const listExampleIds = async (path: string) =>
      (
        await readdir(join(rootDirectory, path), { withFileTypes: true }).catch(
          () => [],
        )
      )
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'cloud-catalog.local/examples',
      trackedExamplesPath: 'src/cloud-catalog/examples',
      generatedPaths: ['generated/catalog.json', 'generated/workflows.ts'],
      scaffold: ({ exampleId }) => [
        {
          path: `cloud-catalog.local/examples/${exampleId}/example.ts`,
          content: `import { cloudHello } from './workflow.js';\nexport const example = { id: '${exampleId}', workflow: cloudHello };\n`,
        },
        {
          path: `cloud-catalog.local/examples/${exampleId}/workflow.ts`,
          content: `export const cloudHello = () => '${exampleId}';\n`,
        },
      ],
      generate: async () => {
        const tracked = await listExampleIds('src/cloud-catalog/examples');
        const local = await listExampleIds('cloud-catalog.local/examples');
        return [
          {
            path: 'generated/catalog.json',
            content: `${JSON.stringify({ local, tracked }, null, 2)}\n`,
          },
          {
            path: 'generated/workflows.ts',
            content: tracked
              .map(
                (id) =>
                  `export { cloudHello } from '../src/cloud-catalog/examples/${id}/workflow.js';`,
              )
              .join('\n')
              .concat('\n'),
          },
        ];
      },
      verify: async ({ exampleIds }) => {
        expect([...exampleIds.local, ...exampleIds.tracked]).toEqual([
          'cloud-hello',
        ]);
      },
    });

    await authoring.scaffold('cloud-hello');
    await expect(authoring.verify()).resolves.toBeUndefined();
    await expect(authoring.planPromote('cloud-hello')).resolves.toEqual({
      operations: [
        {
          from: 'cloud-catalog.local/examples/cloud-hello',
          kind: 'move-directory',
          to: 'src/cloud-catalog/examples/cloud-hello',
        },
        { kind: 'generate' },
        { kind: 'verify' },
      ],
    });
    await expect(authoring.promote('cloud-hello')).resolves.toEqual({
      changedPaths: expect.arrayContaining([
        'cloud-catalog.local/examples/cloud-hello',
        'src/cloud-catalog/examples/cloud-hello',
        'generated/catalog.json',
        'generated/workflows.ts',
      ]),
      moved: {
        from: 'cloud-catalog.local/examples/cloud-hello',
        to: 'src/cloud-catalog/examples/cloud-hello',
      },
    });
    await expect(authoring.verify()).resolves.toBeUndefined();
    await expect(
      readFile(join(rootDirectory, 'generated/catalog.json'), 'utf8'),
    ).resolves.toBe(
      `${JSON.stringify({ local: [], tracked: ['cloud-hello'] }, null, 2)}\n`,
    );
  });

  it('rolls back a failed scaffold transaction without deleting unknown files', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(join(rootDirectory, 'known-generated.json'), 'before\n');
    await writeFile(join(rootDirectory, 'keep.txt'), 'unrelated\n');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['known-generated.json'],
      scaffold: ({ exampleId }) => [
        {
          path: `local/examples/${exampleId}/example.ts`,
          content: 'export const example = true;\n',
        },
      ],
      generate: async () => {
        await writeFile(
          join(rootDirectory, 'known-generated.json'),
          'during\n',
        );
        throw new Error('generation failed');
      },
    });

    await expect(authoring.scaffold('broken-example')).rejects.toThrow(
      'generation failed',
    );
    await expect(
      access(join(rootDirectory, 'local/examples/broken-example/example.ts')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(rootDirectory, 'known-generated.json'), 'utf8'),
    ).resolves.toBe('before\n');
    await expect(
      readFile(join(rootDirectory, 'keep.txt'), 'utf8'),
    ).resolves.toBe('unrelated\n');
    await expect(
      access(join(rootDirectory, '.catalog.lock')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rolls back a failed promotion transaction to the local example', async () => {
    const rootDirectory = await createTemporaryDirectory();
    let failGeneration = false;
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      scaffold: ({ exampleId }) => [
        {
          path: `local/examples/${exampleId}/example.ts`,
          content: 'export const example = true;\n',
        },
      ],
      generate: () => {
        if (failGeneration) throw new Error('promotion generation failed');
        return [
          { path: 'generated/catalog.json', content: 'before promotion\n' },
        ];
      },
    });
    await authoring.scaffold('rollback-example');
    await writeFile(join(rootDirectory, 'keep.txt'), 'unrelated\n');
    failGeneration = true;

    await expect(authoring.promote('rollback-example')).rejects.toThrow(
      'promotion generation failed',
    );
    await expect(
      readFile(
        join(rootDirectory, 'local/examples/rollback-example/example.ts'),
        'utf8',
      ),
    ).resolves.toBe('export const example = true;\n');
    await expect(
      access(join(rootDirectory, 'tracked/examples/rollback-example')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(rootDirectory, 'generated/catalog.json'), 'utf8'),
    ).resolves.toBe('before promotion\n');
    await expect(
      readFile(join(rootDirectory, 'keep.txt'), 'utf8'),
    ).resolves.toBe('unrelated\n');
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('plans demotion from tracked to local without changing the filesystem', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const trackedExample = join(
      rootDirectory,
      'tracked/examples/dry-run-example',
    );
    await mkdir(trackedExample, { recursive: true });
    await writeFile(
      join(trackedExample, 'example.ts'),
      'export const example = true;\n',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planDemote('dry-run-example')).resolves.toEqual({
      operations: [
        {
          from: 'tracked/examples/dry-run-example',
          kind: 'move-directory',
          to: 'local/examples/dry-run-example',
        },
        { kind: 'generate' },
        { kind: 'verify' },
      ],
    });
    await expect(
      readFile(join(trackedExample, 'example.ts'), 'utf8'),
    ).resolves.toBe('export const example = true;\n');
    await expect(
      access(join(rootDirectory, 'local/examples/dry-run-example')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('demotes a tracked example and regenerates and verifies in one transaction', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const trackedExample = join(
      rootDirectory,
      'tracked/examples/transaction-example',
    );
    await mkdir(trackedExample, { recursive: true });
    await writeFile(
      join(trackedExample, 'example.ts'),
      'export const example = true;\n',
    );
    const listExampleIds = async (path: string) =>
      (
        await readdir(join(rootDirectory, path), {
          withFileTypes: true,
        }).catch(() => [])
      )
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      scaffold: () => [],
      generate: async () => [
        {
          path: 'generated/catalog.json',
          content: `${JSON.stringify({
            local: await listExampleIds('local/examples'),
            tracked: await listExampleIds('tracked/examples'),
          })}\n`,
        },
      ],
      verify: ({ exampleIds }) => {
        expect(exampleIds).toEqual({
          local: ['transaction-example'],
          tracked: [],
        });
      },
    });

    await expect(authoring.demote('transaction-example')).resolves.toEqual({
      changedPaths: [
        'tracked/examples/transaction-example',
        'local/examples/transaction-example',
        'generated/catalog.json',
      ],
      moved: {
        from: 'tracked/examples/transaction-example',
        to: 'local/examples/transaction-example',
      },
    });
    await expect(
      access(join(rootDirectory, 'tracked/examples/transaction-example')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(
        join(rootDirectory, 'local/examples/transaction-example/example.ts'),
        'utf8',
      ),
    ).resolves.toBe('export const example = true;\n');
    await expect(
      readFile(join(rootDirectory, 'generated/catalog.json'), 'utf8'),
    ).resolves.toBe('{"local":["transaction-example"],"tracked":[]}\n');
  });

  it.each(['generation', 'verification'] as const)(
    'rolls back demotion source and generated outputs when %s fails',
    async (failure) => {
      const rootDirectory = await createTemporaryDirectory();
      const trackedExample = join(
        rootDirectory,
        'tracked/examples/rollback-demotion',
      );
      await mkdir(trackedExample, { recursive: true });
      await mkdir(join(rootDirectory, 'generated'), { recursive: true });
      await writeFile(
        join(trackedExample, 'example.ts'),
        'export const example = true;\n',
      );
      await writeFile(
        join(rootDirectory, 'generated/catalog.json'),
        'before demotion\n',
      );
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: ['generated/catalog.json'],
        scaffold: () => [],
        generate: async () => {
          if (failure === 'generation') {
            await writeFile(
              join(rootDirectory, 'generated/catalog.json'),
              'partial demotion\n',
            );
            throw new Error('demotion generation failed');
          }
          return [
            {
              path: 'generated/catalog.json',
              content: 'generated during demotion\n',
            },
          ];
        },
        verify: () => {
          if (failure === 'verification') {
            throw new Error('demotion verification failed');
          }
        },
      });

      await expect(authoring.demote('rollback-demotion')).rejects.toThrow(
        `demotion ${failure} failed`,
      );
      await expect(
        readFile(join(trackedExample, 'example.ts'), 'utf8'),
      ).resolves.toBe('export const example = true;\n');
      await expect(
        access(join(rootDirectory, 'local/examples/rollback-demotion')),
      ).rejects.toMatchObject({ code: 'ENOENT' });
      await expect(
        readFile(join(rootDirectory, 'generated/catalog.json'), 'utf8'),
      ).resolves.toBe('before demotion\n');
      await expect(
        access(join(rootDirectory, '.catalog.journal.json')),
      ).rejects.toMatchObject({ code: 'ENOENT' });
    },
  );

  it('refuses to demote an unknown tracked example', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.demote('unknown-example')).rejects.toThrow(
      'Tracked catalog example does not exist: tracked/examples/unknown-example',
    );
    await expect(
      access(join(rootDirectory, 'local/examples/unknown-example')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('refuses to overwrite an existing local example during demotion', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const trackedExample = join(
      rootDirectory,
      'tracked/examples/occupied-example',
    );
    const localExample = join(rootDirectory, 'local/examples/occupied-example');
    await Promise.all([
      mkdir(trackedExample, { recursive: true }),
      mkdir(localExample, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(trackedExample, 'example.ts'), 'tracked source\n'),
      writeFile(join(localExample, 'example.ts'), 'local source\n'),
    ]);
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.demote('occupied-example')).rejects.toThrow(
      'Demotion destination already exists: local/examples/occupied-example',
    );
    await expect(
      readFile(join(trackedExample, 'example.ts'), 'utf8'),
    ).resolves.toBe('tracked source\n');
    await expect(
      readFile(join(localExample, 'example.ts'), 'utf8'),
    ).resolves.toBe('local source\n');
  });

  it('keeps a tracked example in place when an external dependency prevents automatic demotion', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const trackedExample = join(
      rootDirectory,
      'tracked/examples/dependent-example',
    );
    await mkdir(trackedExample, { recursive: true });
    await writeFile(
      join(trackedExample, 'example.ts'),
      "export { shared } from '../shared.js';\n",
    );
    await writeFile(
      join(rootDirectory, 'tracked/examples/shared.ts'),
      'export const shared = true;\n',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.demote('dependent-example')).rejects.toThrow(
      'cannot be demoted automatically because tracked/examples/dependent-example/example.ts imports outside its example directory',
    );
    await expect(
      readFile(join(trackedExample, 'example.ts'), 'utf8'),
    ).resolves.toBe("export { shared } from '../shared.js';\n");
    await expect(
      access(join(rootDirectory, 'local/examples/dependent-example')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('preserves the journal and backups when rollback is incomplete', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'generated'), { recursive: true });
    await writeFile(join(rootDirectory, 'generated/catalog.json'), 'before\n');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      scaffold: () => [],
      generate: async () => {
        await rm(join(rootDirectory, 'generated'), {
          force: true,
          recursive: true,
        });
        await symlink(
          externalDirectory,
          join(rootDirectory, 'generated'),
          'dir',
        );
        throw new Error('generation and rollback fail');
      },
    });

    await expect(authoring.generate()).rejects.toThrow(
      'rollback was incomplete',
    );
    const journal = JSON.parse(
      await readFile(join(rootDirectory, '.catalog.journal.json'), 'utf8'),
    ) as { transactionPath: string };
    await expect(
      access(join(rootDirectory, journal.transactionPath, 'backups/0')),
    ).resolves.toBeUndefined();
  });

  it('recovers a stale authoring lock before starting a mutation', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999 })}\n`,
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      lockStaleAfterMs: 1,
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.generate()).resolves.toEqual([]);
    await expect(
      access(join(rootDirectory, '.catalog.lock')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recovers a stale authoring lock before public verification', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999 })}\n`,
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      lockStaleAfterMs: 1,
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.verify()).resolves.toBeUndefined();
    await expect(
      access(join(rootDirectory, '.catalog.lock')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recovers a stale recovery lock left during lock takeover', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999, token: 'stale' })}\n`,
    );
    const recoveryPath = join(rootDirectory, '.catalog.lock.recovery');
    const staleRecoveryToken = '00000000-0000-4000-8000-000000000000';
    await mkdir(recoveryPath);
    await writeFile(
      join(recoveryPath, 'owner.json'),
      `${JSON.stringify({
        createdAt: 0,
        pid: 999_999,
        token: staleRecoveryToken,
      })}\n`,
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      lockStaleAfterMs: 1,
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.generate()).resolves.toEqual([]);
    await expect(
      access(join(rootDirectory, '.catalog.lock.recovery')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    expect(
      (await readdir(rootDirectory)).some((path) =>
        path.startsWith('.catalog.lock.recovery.stale-'),
      ),
    ).toBe(true);
  });

  it('serializes simultaneous stale recovery lock takeovers', async () => {
    const rootDirectory = await realpath(await createTemporaryDirectory());
    const lockPath = join(rootDirectory, '.catalog.lock');
    const recoveryPath = join(rootDirectory, '.catalog.lock.recovery');
    const staleRecoveryToken = '00000000-0000-4000-8000-000000000000';
    await writeFile(
      lockPath,
      `${JSON.stringify({ createdAt: 0, pid: 999_999, token: 'stale' })}\n`,
    );
    await mkdir(recoveryPath);
    await writeFile(
      join(recoveryPath, 'owner.json'),
      `${JSON.stringify({
        createdAt: 0,
        pid: 999_999,
        token: staleRecoveryToken,
      })}\n`,
    );
    const runnerPath = join(rootDirectory, 'recovery-lock-race.mjs');
    await writeFile(
      runnerPath,
      `import { createRequire, syncBuiltinESMExports } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const fileSystem = require('node:fs/promises');
const originalRename = fileSystem.rename;
const { readFile, readdir } = fileSystem;
const rootDirectory = process.env.RACE_ROOT_DIRECTORY;
const lockPath = join(rootDirectory, '.catalog.lock');
const recoveryPath = join(rootDirectory, '.catalog.lock.recovery');
const staleRecoveryToken = process.env.RACE_STALE_TOKEN;
const recoveryRenames = [];
const recoveryRenameDestinations = [];
const primaryRenames = [];
let prepopulatedCandidates = 0;
let allowFirstPrimaryRename;
const secondPrimaryRenameStarted = new Promise((resolve) => {
  allowFirstPrimaryRename = resolve;
});
const waitForFreshToken = async (path) => {
  for (;;) {
    const token = await readFile(
      path === recoveryPath ? join(path, 'owner.json') : path,
      'utf8',
    )
      .then((content) => JSON.parse(content).token)
      .catch(() => undefined);
    const staleToken = path === recoveryPath ? staleRecoveryToken : 'stale';
    if (token !== undefined && token !== staleToken) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};
fileSystem.rename = async (from, to) => {
  if (
    typeof from === 'string' &&
    from.includes('.catalog.lock.recovery.candidate-')
  ) {
    const owner = JSON.parse(await readFile(join(from, 'owner.json'), 'utf8'));
    if (typeof owner.token !== 'string') throw new Error('Candidate was empty');
    prepopulatedCandidates += 1;
  }
  const renames = from === recoveryPath ? recoveryRenames : primaryRenames;
  if (from === recoveryPath || from === lockPath) {
    if (from === recoveryPath) recoveryRenameDestinations.push(String(to));
    const renameIndex = renames.length;
    const operation = (async () => {
      if (from === lockPath && renameIndex === 0) {
        await Promise.race([
          secondPrimaryRenameStarted,
          new Promise((resolve) => setTimeout(resolve, 50)),
        ]);
      } else if (renameIndex > 0) {
        if (from === lockPath) allowFirstPrimaryRename();
        await waitForFreshToken(from);
      }
      await originalRename(from, to);
    })();
    renames.push(operation);
    return operation;
  }
  return originalRename(from, to);
};
syncBuiltinESMExports();

try {
  const { createCatalogAuthoring } = await import(
    process.env.AUTHORING_MODULE_URL
  );
  let activeMutations = 0;
  let maximumActiveMutations = 0;
  let releaseMutation;
  let reportFirstMutation;
  let reportSecondMutation;
  const mutationGate = new Promise((resolve) => {
    releaseMutation = resolve;
  });
  const firstMutationStarted = new Promise((resolve) => {
    reportFirstMutation = resolve;
  });
  const secondMutationStarted = new Promise((resolve) => {
    reportSecondMutation = resolve;
  });
  const createContender = () =>
    createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      lockStaleAfterMs: 1,
      graph: {
        boundaries: { browserPaths: [], packageJsonPath: 'package.json', workerPaths: [] },
        outputs: [],
        sources: [],
        targets: [],
      },
      loadExamples: () => [],
      parseModuleSpecifiers: () => [],
      scaffold: () => [],
      generate: async () => {
        activeMutations += 1;
        if (activeMutations === 1) reportFirstMutation();
        if (activeMutations === 2) reportSecondMutation();
        maximumActiveMutations = Math.max(maximumActiveMutations, activeMutations);
        await mutationGate;
        activeMutations -= 1;
        return [];
      },
    });
  const mutations = [createContender().generate(), createContender().generate()];
  const settledMutations = Promise.allSettled(mutations);
  await firstMutationStarted;
  await Promise.race([
    secondMutationStarted,
    new Promise((resolve) => setTimeout(resolve, 50)),
  ]);
  releaseMutation();
  const results = await settledMutations;
  const recoveryTombstones = (await readdir(rootDirectory)).filter((path) =>
    path.startsWith('.catalog.lock.recovery.stale-'),
  );
  console.log(JSON.stringify({
    maximumActiveMutations,
    prepopulatedCandidates,
    recoveryRenameDestinations,
    recoveryTombstones,
    statuses: results.map(({ status }) => status),
  }));
} finally {
  fileSystem.rename = originalRename;
  syncBuiltinESMExports();
}
`,
    );
    const { stdout } = await execFileAsync(
      join(process.cwd(), 'node_modules/.bin/esno'),
      [runnerPath],
      {
        env: {
          ...process.env,
          AUTHORING_MODULE_URL: pathToFileURL(
            join(process.cwd(), 'src/lib/catalog/authoring.ts'),
          ).href,
          RACE_ROOT_DIRECTORY: rootDirectory,
          RACE_STALE_TOKEN: staleRecoveryToken,
        },
      },
    );
    const result = JSON.parse(stdout.trim()) as {
      maximumActiveMutations: number;
      prepopulatedCandidates: number;
      recoveryRenameDestinations: string[];
      recoveryTombstones: string[];
      statuses: PromiseSettledResult<unknown>['status'][];
    };

    expect(result.maximumActiveMutations).toBe(1);
    expect(result.statuses).toEqual(
      expect.arrayContaining(['fulfilled', 'rejected']),
    );
    expect(result.prepopulatedCandidates).toBeGreaterThanOrEqual(2);
    expect(result.recoveryRenameDestinations).toHaveLength(2);
    expect(result.recoveryRenameDestinations[1]).toBe(
      result.recoveryRenameDestinations[0],
    );
    expect(result.recoveryTombstones).toHaveLength(1);
    expect(result.recoveryTombstones[0]).toContain(staleRecoveryToken);
  });

  it.each([
    ['traversal', '../outside'],
    ['absolute', '/tmp/outside'],
    ['file URL', 'file:///tmp/outside'],
  ])('rejects a %s configured repository path', async (_kind, unsafePath) => {
    const rootDirectory = await createTemporaryDirectory();

    expect(() =>
      createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: unsafePath,
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => [],
        generate: () => [],
      }),
    ).toThrow('Catalog paths must be explicit relative paths');
  });

  it.each(['../outside', 'two/segments', 'Uppercase', 'double--dash'])(
    'rejects an unsafe example ID before invoking the adapter: %s',
    async (exampleId) => {
      const rootDirectory = await createTemporaryDirectory();
      let scaffoldCalls = 0;
      const authoring = createCatalogAuthoring({
        rootDirectory,
        localExamplesPath: 'local/examples',
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => {
          scaffoldCalls += 1;
          return [];
        },
        generate: () => [],
      });

      await expect(authoring.scaffold(exampleId)).rejects.toThrow(
        'Catalog example IDs must use lowercase kebab-case',
      );
      expect(scaffoldCalls).toBe(0);
      await expect(authoring.planPromote(exampleId)).rejects.toThrow(
        'Catalog example IDs must use lowercase kebab-case',
      );
      await expect(authoring.planDemote(exampleId)).rejects.toThrow(
        'Catalog example IDs must use lowercase kebab-case',
      );
    },
  );

  it('rejects an undeclared generated output before writing it', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      scaffold: () => [],
      generate: () => [
        { path: 'generated/undeclared.json', content: 'unsafe\n' },
      ],
    });

    await expect(authoring.generate()).rejects.toThrow(
      'Adapter returned an undeclared catalog output',
    );
    await expect(
      access(join(rootDirectory, 'generated/undeclared.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects a scaffold output outside the requested example directory', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [{ path: 'keep.txt', content: 'overwrite\n' }],
      generate: () => [],
    });

    await expect(authoring.scaffold('unsafe-example')).rejects.toThrow(
      'Scaffold outputs must stay within the requested example directory',
    );
    await expect(access(join(rootDirectory, 'keep.txt'))).rejects.toMatchObject(
      { code: 'ENOENT' },
    );
  });

  it('rejects a symlinked local example before planning promotion', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'local/examples'), { recursive: true });
    await writeFile(
      join(externalDirectory, 'example.ts'),
      'export const example = true;\n',
    );
    await symlink(
      externalDirectory,
      join(rootDirectory, 'local/examples/linked-example'),
      'dir',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('linked-example')).rejects.toThrow(
      'Catalog paths cannot traverse symbolic links',
    );
  });

  it('rejects a generated output whose parent is a symbolic link', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    await symlink(externalDirectory, join(rootDirectory, 'generated'), 'dir');
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      scaffold: () => [],
      generate: () => [{ path: 'generated/catalog.json', content: 'unsafe\n' }],
    });

    await expect(authoring.generate()).rejects.toThrow(
      'Catalog paths cannot traverse symbolic links',
    );
    await expect(
      access(join(externalDirectory, 'catalog.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recovers a durable file snapshot left by an interrupted transaction', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const transactionId = 'interrupted';
    const transactionPath = `.catalog.transaction-${transactionId}`;
    await mkdir(join(rootDirectory, transactionPath, 'backups'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, 'generated'), { recursive: true });
    await writeFile(join(rootDirectory, 'generated/catalog.json'), 'partial\n');
    await writeFile(
      join(rootDirectory, transactionPath, 'backups/0'),
      'before\n',
    );
    await writeFile(
      join(rootDirectory, '.catalog.journal.json'),
      `${JSON.stringify({
        id: transactionId,
        snapshots: [
          {
            backupPath: `${transactionPath}/backups/0`,
            existed: true,
            path: 'generated/catalog.json',
          },
        ],
        transactionPath,
      })}\n`,
    );
    await writeFile(
      join(rootDirectory, '.catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999 })}\n`,
    );
    let recoveredContent = '';
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      lockStaleAfterMs: 1,
      scaffold: () => [],
      generate: async () => {
        recoveredContent = await readFile(
          join(rootDirectory, 'generated/catalog.json'),
          'utf8',
        );
        return [];
      },
    });

    await authoring.generate();
    expect(recoveredContent).toBe('before\n');
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      access(join(rootDirectory, transactionPath)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('refuses a journal move marker that can escape its destination', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const victim = join(rootDirectory, 'victim');
    await writeFile(victim, 'keep me\n');
    await mkdir(join(rootDirectory, 'tracked/examples/hostile-marker'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, '.catalog.transaction-hostile'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, '.catalog.journal.json'),
      `${JSON.stringify({
        id: 'hostile',
        move: {
          from: 'local/examples/hostile-marker',
          marker: '../../../victim',
          to: 'tracked/examples/hostile-marker',
        },
        snapshots: [],
        state: 'pending',
        transactionPath: '.catalog.transaction-hostile',
      })}\n`,
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.verify()).rejects.toThrow(
      'Catalog transaction journal is invalid',
    );
    await expect(readFile(victim, 'utf8')).resolves.toBe('keep me\n');
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).resolves.toBeUndefined();
  });

  it('refuses a move journal without its exact owner marker', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, '.catalog.transaction-markerless'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, '.catalog.journal.json'),
      `${JSON.stringify({
        id: 'markerless',
        move: {
          from: 'local/examples/markerless',
          to: 'tracked/examples/markerless',
        },
        snapshots: [],
        state: 'pending',
        transactionPath: '.catalog.transaction-markerless',
      })}\n`,
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.verify()).rejects.toThrow(
      'Catalog transaction journal is invalid',
    );
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).resolves.toBeUndefined();
  });

  it('preserves ambiguous recovery evidence when a crash precedes the owner marker', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const source = join(rootDirectory, 'local/examples/unowned-destination');
    const destination = join(
      rootDirectory,
      'tracked/examples/unowned-destination',
    );
    const transaction = join(rootDirectory, '.catalog.transaction-unowned');
    await mkdir(source, { recursive: true });
    await writeFile(join(source, 'example.ts'), 'export {};\n');
    await mkdir(destination, { recursive: true });
    await mkdir(transaction, { recursive: true });
    await writeFile(
      join(rootDirectory, '.catalog.journal.json'),
      `${JSON.stringify({
        id: 'unowned',
        move: {
          from: 'local/examples/unowned-destination',
          marker: '.catalog-move-owner-unowned',
          to: 'tracked/examples/unowned-destination',
        },
        snapshots: [],
        state: 'pending',
        transactionPath: '.catalog.transaction-unowned',
      })}\n`,
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(
      authoring.confirmPromote({
        exampleId: 'unowned-destination',
        revision: 'preview-revision',
        saveState: { durability: 'durable', status: 'saved' },
      }),
    ).resolves.toMatchObject({
      direction: 'promote',
      filesystem: 'may-have-changed',
      reason: 'recovery-incomplete',
      recovery: 'incomplete',
      status: 'failed',
    });
    await expect(access(source)).resolves.toBeUndefined();
    await expect(access(destination)).resolves.toBeUndefined();
    await expect(access(transaction)).resolves.toBeUndefined();
    await expect(
      access(join(rootDirectory, '.catalog.journal.json')),
    ).resolves.toBeUndefined();
  });

  it('rejects a symlink or special file inside an authored example', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'local/examples/special-example',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(join(externalDirectory, 'outside.ts'), 'export {};\n');
    await symlink(
      join(externalDirectory, 'outside.ts'),
      join(exampleDirectory, 'example.ts'),
      'file',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('special-example')).rejects.toThrow(
      'Catalog example sources must be regular files',
    );
  });

  it('rejects relative imports that escape an authored example', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'local/examples/escape-import',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'example.ts'),
      "export { outside } from '../../../outside.js';\n",
    );
    await writeFile(
      join(rootDirectory, 'outside.ts'),
      'export const outside = 1;\n',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('escape-import')).rejects.toThrow(
      'relative imports must stay within its example directory',
    );
  });

  it('rejects compact TypeScript exports that escape an authored example', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'local/examples/compact-export',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'example.ts'),
      "export{x}from'../../../outside.js';\n",
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('compact-export')).rejects.toThrow(
      'relative imports must stay within its example directory',
    );
  });

  it('rejects computed module loading that cannot be confined statically', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'local/examples/computed-import',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'example.ts'),
      'export const load = () => import(`../../../outside.js`);\n',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('computed-import')).rejects.toThrow(
      'module loading must use a string literal',
    );
  });

  it('runs repository-specific promotion validation before returning a plan', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'local/examples/policy-example',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'example.ts'),
      'export const example = true;\n',
    );
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
      validatePromotion: ({ exampleId }) => {
        throw new Error(`repository policy rejected ${exampleId}`);
      },
    });

    await expect(authoring.planPromote('policy-example')).rejects.toThrow(
      'repository policy rejected policy-example',
    );
  });

  it('rejects removed CLI aliases', async () => {
    const authoring: Parameters<typeof runCatalogCli>[0]['authoring'] = {
      demote: async () => ({
        changedPaths: [],
        moved: { from: '', to: '' },
      }),
      scaffold: async () => undefined,
      generate: async () => [],
      verify: async () => undefined,
      planDemote: async () => ({ operations: [] }),
      planPromote: async () => ({ operations: [] }),
      promote: async () => ({
        changedPaths: [],
        moved: { from: '', to: '' },
      }),
    };

    await expect(
      runCatalogCli({
        authoring,
        argv: ['new', 'aliased-example'],
        io: {
          writeError: () => undefined,
          writeOutput: () => undefined,
        },
      }),
    ).rejects.toThrow('Unknown catalog command "new"');
  });

  it('dispatches demotion dry-run to the planner without mutating', async () => {
    const calls: string[] = [];
    const output: string[] = [];
    const expectedPlan = {
      operations: [
        {
          from: 'tracked/examples/cli-example',
          kind: 'move-directory' as const,
          to: 'local/examples/cli-example',
        },
        { kind: 'generate' as const },
        { kind: 'verify' as const },
      ],
    };
    const authoring: Parameters<typeof runCatalogCli>[0]['authoring'] = {
      demote: async () => {
        calls.push('demote');
        return { changedPaths: [], moved: { from: '', to: '' } };
      },
      scaffold: async () => undefined,
      generate: async () => [],
      verify: async () => undefined,
      planDemote: async (exampleId) => {
        calls.push(`plan:${exampleId}`);
        return expectedPlan;
      },
      planPromote: async () => ({ operations: [] }),
      promote: async () => ({
        changedPaths: [],
        moved: { from: '', to: '' },
      }),
    };

    await runCatalogCli({
      authoring,
      argv: ['demote', 'cli-example', '--dry-run'],
      io: {
        writeError: () => undefined,
        writeOutput: (message) => output.push(message),
      },
    });

    expect(calls).toEqual(['plan:cli-example']);
    expect(output).toEqual([JSON.stringify(expectedPlan, null, 2)]);
  });

  it('dispatches promotion dry-run to planPromote without mutating or changing its JSON', async () => {
    const calls: string[] = [];
    const output: string[] = [];
    const expectedPlan = {
      operations: [
        {
          from: 'local/examples/cli-example',
          kind: 'move-directory' as const,
          to: 'tracked/examples/cli-example',
        },
        { kind: 'generate' as const },
        { kind: 'verify' as const },
      ],
    };
    const authoring: Parameters<typeof runCatalogCli>[0]['authoring'] = {
      demote: async () => ({
        changedPaths: [],
        moved: { from: '', to: '' },
      }),
      scaffold: async () => undefined,
      generate: async () => [],
      verify: async () => undefined,
      planDemote: async () => ({ operations: [] }),
      planPromote: async (exampleId) => {
        calls.push(`plan:${exampleId}`);
        return expectedPlan;
      },
      promote: async () => {
        calls.push('promote');
        return { changedPaths: [], moved: { from: '', to: '' } };
      },
    };

    await runCatalogCli({
      authoring,
      argv: ['promote', 'cli-example', '--dry-run'],
      io: {
        writeError: () => undefined,
        writeOutput: (message) => output.push(message),
      },
    });

    expect(calls).toEqual(['plan:cli-example']);
    expect(output).toEqual([JSON.stringify(expectedPlan, null, 2)]);
  });

  it('reports promotion as a concise shared-catalog handoff', async () => {
    const output: string[] = [];
    const authoring: Parameters<typeof runCatalogCli>[0]['authoring'] = {
      demote: async () => ({
        changedPaths: [],
        moved: { from: '', to: '' },
      }),
      scaffold: async () => undefined,
      generate: async () => [],
      verify: async () => undefined,
      planDemote: async () => ({ operations: [] }),
      planPromote: async () => ({ operations: [] }),
      promote: async () => ({
        changedPaths: [
          'local/examples/cli-example',
          'tracked/examples/cli-example',
        ],
        moved: {
          from: 'local/examples/cli-example',
          to: 'tracked/examples/cli-example',
        },
      }),
    };

    await runCatalogCli({
      authoring,
      argv: ['promote', 'cli-example'],
      io: {
        writeError: () => undefined,
        writeOutput: (message) => output.push(message),
      },
    });

    expect(output).toEqual([
      [
        'Promoted "cli-example" to the shared catalog.',
        'Moved:',
        '  local/examples/cli-example → tracked/examples/cli-example',
        'Regenerated catalog artifacts.',
        'Next: review the tracked changes with git status, then commit them when ready.',
      ].join('\n'),
    ]);
  });

  it('reports a demoted example as local and ignored by Git without calling it deleted', async () => {
    const calls: string[] = [];
    const output: string[] = [];
    const authoring: Parameters<typeof runCatalogCli>[0]['authoring'] = {
      demote: async (exampleId) => {
        calls.push(`demote:${exampleId}`);
        return {
          changedPaths: [
            `tracked/examples/${exampleId}`,
            `local/examples/${exampleId}`,
          ],
          moved: {
            from: `tracked/examples/${exampleId}`,
            to: `local/examples/${exampleId}`,
          },
        };
      },
      scaffold: async () => undefined,
      generate: async () => [],
      verify: async () => undefined,
      planDemote: async () => ({ operations: [] }),
      planPromote: async () => ({ operations: [] }),
      promote: async () => ({
        changedPaths: [],
        moved: { from: '', to: '' },
      }),
    };

    await runCatalogCli({
      authoring,
      argv: ['demote', 'cli-example'],
      io: {
        writeError: () => undefined,
        writeOutput: (message) => output.push(message),
      },
    });

    expect(calls).toEqual(['demote:cli-example']);
    expect(output).toEqual([
      [
        'Demoted "cli-example" to the local catalog.',
        'Moved:',
        '  tracked/examples/cli-example → local/examples/cli-example',
        'Regenerated catalog artifacts.',
        'The local example is ignored by Git.',
        'Next: review the tracked changes with git status, then commit the tracked removal only if the shared example was already committed.',
      ].join('\n'),
    ]);
    expect(output[0]).not.toMatch(/deleted?/i);
  });

  it('loads and watches a configurable local artifact through Vite', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'cloud/local'), { recursive: true });
    await writeFile(
      join(rootDirectory, 'cloud/local/catalog.json'),
      JSON.stringify({ descriptors: [{ id: 'cloud-example' }] }),
    );
    const watched: string[] = [];
    const plugin = createCatalogLocalArtifactVitePlugin({
      artifactPath: 'cloud/local/catalog.json',
      sourcePaths: ['cloud/local/registration.ts'],
      virtualModuleId: 'virtual:cloud-catalog-local',
      validateDescriptor: (descriptor) =>
        typeof descriptor === 'object' &&
        descriptor !== null &&
        'id' in descriptor &&
        descriptor.id === 'cloud-example',
    });
    const configure = plugin.configResolved as (config: {
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;
    const load = plugin.load as (id: string) => Promise<string | undefined>;

    configure({ root: rootDirectory });
    configureServer({
      watcher: {
        add: (path: string) => watched.push(path),
        on: () => undefined,
      },
      moduleGraph: { getModuleById: () => undefined },
      ws: { send: () => undefined },
    });

    await expect(load('\0virtual:cloud-catalog-local')).resolves.toBe(
      'export const localCatalog = [{"id":"cloud-example"}];',
    );
    expect(watched).toEqual([
      join(rootDirectory, 'cloud/local/catalog.json'),
      join(rootDirectory, 'cloud/local/registration.ts'),
    ]);
  });

  it('composes deterministic generated artifacts without repository tooling', () => {
    const artifacts = composeCatalogArtifacts(
      [defineCatalogArtifact('generated/z.ts', 'export const z = 1;\n')],
      [defineCatalogArtifact('generated/a.json', '{}\n')],
    );

    expect(artifacts.map(({ path }) => path)).toEqual([
      'generated/a.json',
      'generated/z.ts',
    ]);
  });

  it('renders and validates a declared source, target, output, and example graph', () => {
    const source = {
      examplesPath: 'cloud/examples',
      id: 'cloud',
      label: 'Cloud',
      registrationOutputPath: 'cloud/registration.ts',
      registrationTypePath: 'cloud/registration-source.ts',
    };
    const target = {
      defaultNamespace: 'default',
      defaultTaskQueue: 'cloud-catalog',
      id: 'cloud-catalog',
      sourceId: 'cloud',
      workflowsModulePath: 'cloud/workflows.ts',
    };
    const example = {
      definitionImportPath: 'cloud/examples/cloud-hello/example.ts',
      id: 'cloud-hello',
      sourceFiles: [
        'cloud/examples/cloud-hello/example.ts',
        'cloud/examples/cloud-hello/workflow.ts',
      ],
      sourceId: 'cloud',
      targetId: 'cloud-catalog',
      workflowExport: 'cloudHello',
      workflowImportPath: 'cloud/examples/cloud-hello/workflow.ts',
      workflowType: 'cloudHello',
    };
    const graph = {
      boundaries: {
        browserPaths: ['cloud/catalog.json'],
        packageJsonPath: 'package.json',
        workerPaths: ['cloud/registration.ts', 'cloud/workflows.ts'],
      },
      outputs: [
        { consumers: ['browser'] as const, path: 'cloud/catalog.json' },
        { consumers: ['worker'] as const, path: 'cloud/registration.ts' },
        { consumers: ['worker'] as const, path: 'cloud/workflows.ts' },
      ],
      sources: [source],
      targets: [target],
    };

    expect(() => validateCatalogAuthoringGraph(graph, [example])).not.toThrow();
    const assembly = renderCatalogSourceAssembly({
      examples: [example],
      source,
      target,
    });
    expect(assembly.map(({ path }) => path)).toEqual([
      'cloud/registration.ts',
      'cloud/workflows.ts',
    ]);
    expect(String(assembly[0].content)).toContain(
      "registry.registerTarget({\n      id: 'cloud-catalog'",
    );
    expect(String(assembly[1].content)).toContain(
      "export { cloudHello } from './examples/cloud-hello/workflow.js';",
    );

    expect(() =>
      validateCatalogAuthoringGraph(
        {
          ...graph,
          outputs: [
            {
              consumers: ['authoring'],
              path: 'cloud/catalog.json',
            },
            ...graph.outputs.slice(1),
          ],
        },
        [example],
      ),
    ).toThrow('browser boundary must declare a browser consumer');
  });

  it('preserves mutable dry-run plan operations for existing consumers', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'local/examples/mutable-plan'), {
      recursive: true,
    });
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    const plan = await authoring.planPromote('mutable-plan');

    expectTypeOf(plan.operations).toEqualTypeOf<
      (
        | { from: string; kind: 'move-directory'; to: string }
        | { kind: 'generate' | 'verify' }
      )[]
    >();
    plan.operations.push({ kind: 'verify' });
    expect(plan.operations.at(-1)).toEqual({ kind: 'verify' });
  });

  it('does not expose rename or folder management in the v1 authoring contract', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    expectTypeOf(authoring).not.toHaveProperty('renameFile');
    expectTypeOf(authoring).not.toHaveProperty('createFolder');
    expect(authoring).not.toHaveProperty('renameFile');
    expect(authoring).not.toHaveProperty('createFolder');
  });

  it('keeps editor operations off the base authoring contract', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    expectTypeOf(authoring).not.toHaveProperty('loadExamples');
    expectTypeOf(authoring).not.toHaveProperty('addFile');
    expectTypeOf(authoring).not.toHaveProperty('save');
    expectTypeOf(authoring).not.toHaveProperty('inspectSaveOperation');
    expectTypeOf(authoring).not.toHaveProperty('subscribeSaveOperation');
    expectTypeOf<
      Awaited<ReturnType<CatalogAuthoringAdapter['loadExamples']>>
    >().toEqualTypeOf<readonly CatalogComposedExample[]>();
    expect(authoring).not.toHaveProperty('loadExamples');
    expect(authoring).not.toHaveProperty('addFile');
    expect(authoring).not.toHaveProperty('save');
    expect(authoring).not.toHaveProperty('inspectSaveOperation');
    expect(authoring).not.toHaveProperty('subscribeSaveOperation');
  });
});
