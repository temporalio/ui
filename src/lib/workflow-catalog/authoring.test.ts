import { execFile } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import {
  composeWorkflowCatalogArtifacts,
  createWorkflowCatalogAuthoring as createWorkflowCatalogAuthoringSdk,
  createWorkflowCatalogLocalArtifactVitePlugin,
  defineWorkflowCatalogArtifact,
  renderWorkflowCatalogAssembly,
  renderWorkflowCatalogSourceAssembly,
  runWorkflowCatalogCli,
  validateWorkflowCatalogAuthoringGraph,
  type WorkflowCatalogAuthoringAdapter,
} from './authoring';
import { parseWorkflowCatalogTypeScriptModuleSpecifiers } from '../../../scripts/workflow-catalog/directory-promotion';

const execFileAsync = promisify(execFile);

const temporaryDirectories: string[] = [];

const createWorkflowCatalogAuthoring = (
  adapter: Omit<
    WorkflowCatalogAuthoringAdapter,
    'graph' | 'loadExamples' | 'parseModuleSpecifiers'
  > &
    Partial<
      Pick<
        WorkflowCatalogAuthoringAdapter,
        'graph' | 'loadExamples' | 'parseModuleSpecifiers'
      >
    >,
) => {
  const supportOutputs = [
    '.workflow-catalog-test/local-registration.ts',
    '.workflow-catalog-test/local-workflows.ts',
    '.workflow-catalog-test/tracked-registration.ts',
    '.workflow-catalog-test/tracked-workflows.ts',
  ];
  return createWorkflowCatalogAuthoringSdk({
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
          registrationTypePath: '.workflow-catalog-test/registration-source.ts',
        },
        {
          examplesPath: adapter.trackedExamplesPath,
          id: 'tracked',
          label: 'Tracked',
          registrationOutputPath: supportOutputs[2],
          registrationTypePath: '.workflow-catalog-test/registration-source.ts',
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
    parseModuleSpecifiers: parseWorkflowCatalogTypeScriptModuleSpecifiers,
    ...adapter,
  });
};

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'catalog-authoring-'));
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

describe('workflow catalog authoring', () => {
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
    const authoring = createWorkflowCatalogAuthoring({
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
    const authoring = createWorkflowCatalogAuthoring({
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
      access(join(rootDirectory, '.workflow-catalog.lock')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      access(join(rootDirectory, '.workflow-catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rolls back a failed promotion transaction to the local example', async () => {
    const rootDirectory = await createTemporaryDirectory();
    let failGeneration = false;
    const authoring = createWorkflowCatalogAuthoring({
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
      access(join(rootDirectory, '.workflow-catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('preserves the journal and backups when rollback is incomplete', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'generated'), { recursive: true });
    await writeFile(join(rootDirectory, 'generated/catalog.json'), 'before\n');
    const authoring = createWorkflowCatalogAuthoring({
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
      await readFile(
        join(rootDirectory, '.workflow-catalog.journal.json'),
        'utf8',
      ),
    ) as { transactionPath: string };
    await expect(
      access(join(rootDirectory, journal.transactionPath, 'backups/0')),
    ).resolves.toBeUndefined();
  });

  it('recovers a stale authoring lock before starting a mutation', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.workflow-catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999 })}\n`,
    );
    const authoring = createWorkflowCatalogAuthoring({
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
      access(join(rootDirectory, '.workflow-catalog.lock')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recovers a stale recovery lock left during lock takeover', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.workflow-catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999, token: 'stale' })}\n`,
    );
    const recoveryPath = join(rootDirectory, '.workflow-catalog.lock.recovery');
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
    const authoring = createWorkflowCatalogAuthoring({
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
      access(join(rootDirectory, '.workflow-catalog.lock.recovery')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    expect(
      (await readdir(rootDirectory)).some((path) =>
        path.startsWith('.workflow-catalog.lock.recovery.stale-'),
      ),
    ).toBe(true);
  });

  it('serializes simultaneous stale recovery lock takeovers', async () => {
    const rootDirectory = await realpath(await createTemporaryDirectory());
    const lockPath = join(rootDirectory, '.workflow-catalog.lock');
    const recoveryPath = join(rootDirectory, '.workflow-catalog.lock.recovery');
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
const lockPath = join(rootDirectory, '.workflow-catalog.lock');
const recoveryPath = join(rootDirectory, '.workflow-catalog.lock.recovery');
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
    from.includes('.workflow-catalog.lock.recovery.candidate-')
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
  const { createWorkflowCatalogAuthoring } = await import(
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
    createWorkflowCatalogAuthoring({
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
    path.startsWith('.workflow-catalog.lock.recovery.stale-'),
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
            join(process.cwd(), 'src/lib/workflow-catalog/authoring.ts'),
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
      createWorkflowCatalogAuthoring({
        rootDirectory,
        localExamplesPath: unsafePath,
        trackedExamplesPath: 'tracked/examples',
        generatedPaths: [],
        scaffold: () => [],
        generate: () => [],
      }),
    ).toThrow('Workflow catalog paths must be explicit relative paths');
  });

  it.each(['../outside', 'two/segments', 'Uppercase', 'double--dash'])(
    'rejects an unsafe example ID before invoking the adapter: %s',
    async (exampleId) => {
      const rootDirectory = await createTemporaryDirectory();
      let scaffoldCalls = 0;
      const authoring = createWorkflowCatalogAuthoring({
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
        'Workflow catalog example IDs must use lowercase kebab-case',
      );
      expect(scaffoldCalls).toBe(0);
      await expect(authoring.planPromote(exampleId)).rejects.toThrow(
        'Workflow catalog example IDs must use lowercase kebab-case',
      );
    },
  );

  it('rejects an undeclared generated output before writing it', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createWorkflowCatalogAuthoring({
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
      'Adapter returned an undeclared workflow catalog output',
    );
    await expect(
      access(join(rootDirectory, 'generated/undeclared.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects a scaffold output outside the requested example directory', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const authoring = createWorkflowCatalogAuthoring({
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
    const authoring = createWorkflowCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('linked-example')).rejects.toThrow(
      'Workflow catalog paths cannot traverse symbolic links',
    );
  });

  it('rejects a generated output whose parent is a symbolic link', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const externalDirectory = await createTemporaryDirectory();
    await symlink(externalDirectory, join(rootDirectory, 'generated'), 'dir');
    const authoring = createWorkflowCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: ['generated/catalog.json'],
      scaffold: () => [],
      generate: () => [{ path: 'generated/catalog.json', content: 'unsafe\n' }],
    });

    await expect(authoring.generate()).rejects.toThrow(
      'Workflow catalog paths cannot traverse symbolic links',
    );
    await expect(
      access(join(externalDirectory, 'catalog.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recovers a durable file snapshot left by an interrupted transaction', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const transactionId = 'interrupted';
    const transactionPath = `.workflow-catalog.transaction-${transactionId}`;
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
      join(rootDirectory, '.workflow-catalog.journal.json'),
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
      join(rootDirectory, '.workflow-catalog.lock'),
      `${JSON.stringify({ createdAt: 0, pid: 999_999 })}\n`,
    );
    let recoveredContent = '';
    const authoring = createWorkflowCatalogAuthoring({
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
      access(join(rootDirectory, '.workflow-catalog.journal.json')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      access(join(rootDirectory, transactionPath)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
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
    const authoring = createWorkflowCatalogAuthoring({
      rootDirectory,
      localExamplesPath: 'local/examples',
      trackedExamplesPath: 'tracked/examples',
      generatedPaths: [],
      scaffold: () => [],
      generate: () => [],
    });

    await expect(authoring.planPromote('special-example')).rejects.toThrow(
      'Workflow catalog example sources must be regular files',
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
    const authoring = createWorkflowCatalogAuthoring({
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
    const authoring = createWorkflowCatalogAuthoring({
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
    const authoring = createWorkflowCatalogAuthoring({
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
    const authoring = createWorkflowCatalogAuthoring({
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

  it('routes the legacy new CLI alias through the scaffold transaction', async () => {
    const scaffolded: string[] = [];
    const output: string[] = [];
    const authoring = {
      scaffold: async (exampleId: string) => {
        scaffolded.push(exampleId);
      },
    } as ReturnType<typeof createWorkflowCatalogAuthoring>;

    await runWorkflowCatalogCli({
      authoring,
      argv: ['new', 'aliased-example'],
      io: {
        writeError: () => undefined,
        writeOutput: (message) => output.push(message),
      },
    });

    expect(scaffolded).toEqual(['aliased-example']);
    expect(output).toEqual([
      'Created local workflow catalog example "aliased-example". Edit its files, then run "pnpm workflow-catalog dev".',
    ]);
  });

  it('loads and watches a configurable local artifact through Vite', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'cloud/local'), { recursive: true });
    await writeFile(
      join(rootDirectory, 'cloud/local/catalog.json'),
      JSON.stringify({ descriptors: [{ id: 'cloud-example' }] }),
    );
    const watched: string[] = [];
    const plugin = createWorkflowCatalogLocalArtifactVitePlugin({
      artifactPath: 'cloud/local/catalog.json',
      sourcePaths: ['cloud/local/registration.ts'],
      virtualModuleId: 'virtual:cloud-workflow-catalog-local',
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

    await expect(load('\0virtual:cloud-workflow-catalog-local')).resolves.toBe(
      'export const localWorkflowCatalog = [{"id":"cloud-example"}];',
    );
    expect(watched).toEqual([
      join(rootDirectory, 'cloud/local/catalog.json'),
      join(rootDirectory, 'cloud/local/registration.ts'),
    ]);
  });

  it('composes deterministic generated artifacts without repository tooling', () => {
    const assembly = renderWorkflowCatalogAssembly({
      header: '// GENERATED',
      imports: [
        "import { beta } from './beta.js';",
        "import { alpha } from './alpha.js';",
      ],
      statements: ['export const examples = [beta, alpha];'],
    });
    const artifacts = composeWorkflowCatalogArtifacts(
      [defineWorkflowCatalogArtifact('generated/z.ts', assembly)],
      [defineWorkflowCatalogArtifact('generated/a.json', '{}\n')],
    );

    expect(assembly).toBe(
      "// GENERATED\nimport { alpha } from './alpha.js';\nimport { beta } from './beta.js';\n\nexport const examples = [beta, alpha];\n",
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

    expect(() =>
      validateWorkflowCatalogAuthoringGraph(graph, [example]),
    ).not.toThrow();
    const assembly = renderWorkflowCatalogSourceAssembly({
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
      validateWorkflowCatalogAuthoringGraph(
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
});
