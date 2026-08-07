import { execFile } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { format } from 'prettier';
import { afterEach, describe, expect, it } from 'vitest';

import {
  generateWorkflowCatalogArtifact,
  generateWorkflowCatalogArtifacts,
  loadWorkflowCatalogNodeBindings,
  verifyWorkflowCatalogArtifact,
  verifyWorkflowCatalogArtifacts,
  verifyWorkflowCatalogProjectBoundaries,
} from './catalog-artifacts';
import { workflowCatalogRegistrationSource as localRegistrationFallback } from '../../src/lib/workflow-catalog/node/local-registration-fallback';
import { createWorkflowCatalogRegistry } from '../../src/lib/workflow-catalog/node/registry';

const temporaryDirectories: string[] = [];
const execFileAsync = promisify(execFile);
const packageConsumerTest =
  process.env.WORKFLOW_CATALOG_PACKAGE_TEST === '1' ? it : it.skip;

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(
    join(process.cwd(), '.workflow-catalog-test-'),
  );
  temporaryDirectories.push(directory);
  return directory;
};

const createExternalTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'workflow-catalog-test-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 100,
      }),
    ),
  );
});

describe('workflow catalog artifacts', () => {
  it('emits a browser TypeScript artifact alongside the shared JSON artifact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const sharedArtifactPath = 'catalog.generated.json';
    const sharedTypeScriptArtifactPath = 'catalog.generated.ts';
    const localSourcePath = 'local-registration.ts';
    const sharedSource = {
      sourceFiles: [sharedSourcePath],
      register: () => undefined,
    };
    const localFallback = {
      sourceFiles: [localSourcePath],
      register: () => undefined,
    };

    await writeFile(join(rootDirectory, sharedSourcePath), 'export {};\n');
    await writeFile(join(rootDirectory, localSourcePath), 'export {};\n');

    await generateWorkflowCatalogArtifacts({
      rootDirectory,
      sharedSource,
      sharedArtifactPath,
      sharedTypeScriptArtifactPath,
      localModulePath: 'missing-local-registration.ts',
      localFallback,
      localArtifactPath: 'local.generated.json',
    });

    const sharedJsonArtifact = await readFile(
      join(rootDirectory, sharedArtifactPath),
      'utf8',
    );

    const typeScriptArtifact = await readFile(
      join(rootDirectory, sharedTypeScriptArtifactPath),
      'utf8',
    );

    expect(typeScriptArtifact).toContain(
      "import type { BrowserWorkflowCatalogArtifact } from './types';",
    );
    expect(typeScriptArtifact).toContain(
      'export const catalogArtifact: BrowserWorkflowCatalogArtifact = {',
    );
    expect(typeScriptArtifact).toContain(
      JSON.parse(sharedJsonArtifact).sourceHash,
    );
    expect(typeScriptArtifact).toContain('descriptors: []');
  });

  it('loads generated node bindings without rewriting browser artifacts', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedArtifactPath = 'shared.generated.json';
    const localArtifactPath = 'local.generated.json';
    const sharedSourcePath = 'shared-registration.ts';
    const localSourcePath = 'local-registration.ts';
    const sharedSource = {
      sourceFiles: [sharedSourcePath],
      register: () => undefined,
    };
    const localFallback = {
      sourceFiles: [localSourcePath],
      register: () => undefined,
    };
    const options = {
      rootDirectory,
      sharedSource,
      sharedArtifactPath,
      localModulePath: 'missing-local-registration.ts',
      localFallback,
      localArtifactPath,
    };

    await writeFile(join(rootDirectory, sharedSourcePath), 'export {};\n');
    await writeFile(join(rootDirectory, localSourcePath), 'export {};\n');
    await generateWorkflowCatalogArtifacts(options);
    const generatedContent = await readFile(
      join(rootDirectory, sharedArtifactPath),
      'utf8',
    );

    await expect(loadWorkflowCatalogNodeBindings(options)).resolves.toEqual([]);
    await expect(
      readFile(join(rootDirectory, sharedArtifactPath), 'utf8'),
    ).resolves.toBe(generatedContent);
  });

  it('loads node bindings with runtime routing applied to the requested target', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const workflow = () => undefined;
    const sharedSource = {
      sourceFiles: ['shared-registration.ts'],
      register: (
        registry: ReturnType<typeof createWorkflowCatalogRegistry>,
      ) => {
        registry.registerTarget({
          id: 'shared-workflows',
          namespace: 'registered-namespace',
          taskQueue: 'registered-task-queue',
          workflowsPath: './workflows',
          workflowExports: { workflow },
        });
        registry.registerExample({
          id: 'shared-example',
          title: 'Shared example',
          description: 'Runs a shared workflow.',
          targetId: 'shared-workflows',
          capabilityTags: [],
          expectedEvidence: [],
          input: { defaultValue: [], schema: {} },
          startOptions: { defaultValue: {}, schema: {} },
          execution: {
            kind: 'workflow' as const,
            workflowType: 'workflow',
            workflow,
            activities: {},
          },
        });
      },
    };

    const bindings = await loadWorkflowCatalogNodeBindings(
      {
        rootDirectory,
        sharedSource,
        sharedArtifactPath: 'shared.generated.json',
        localModulePath: 'missing-local-registration.ts',
        localFallback: localRegistrationFallback,
        localArtifactPath: 'local.generated.json',
      },
      {
        'shared-workflows': {
          namespace: 'runtime-namespace',
          taskQueue: 'runtime-task-queue',
        },
      },
    );

    expect(bindings[0]?.target).toMatchObject({
      id: 'shared-workflows',
      namespace: 'runtime-namespace',
      taskQueue: 'runtime-task-queue',
    });
  });

  it('generates an empty shared registry to a deterministic hashed browser artifact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'shared-registrations.ts';
    const artifactPath = 'catalog.generated.json';
    const registry = createWorkflowCatalogRegistry();
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const empty = true;\n',
    );

    await generateWorkflowCatalogArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
    });
    const firstContent = await readFile(
      join(rootDirectory, artifactPath),
      'utf8',
    );

    await generateWorkflowCatalogArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
    });
    const secondContent = await readFile(
      join(rootDirectory, artifactPath),
      'utf8',
    );

    expect(secondContent).toBe(firstContent);
    expect(JSON.parse(firstContent)).toEqual({
      sourceHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      descriptors: [],
    });
  });

  it('formats a nonempty generated JSON artifact with the repository Prettier settings', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'shared-registrations.ts';
    const artifactPath = 'catalog.generated.json';
    const workflow = () => 'hello';
    const registry = createWorkflowCatalogRegistry();
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const populated = true;\n',
    );
    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'workflow-catalog',
      workflowsPath: './workflows',
      workflowExports: { workflow },
    });
    registry.registerExample({
      id: 'hello',
      title: 'Hello',
      description: 'Returns a greeting.',
      targetId: 'catalog',
      capabilityTags: ['activities', 'terminal-outcome'],
      expectedEvidence: ['A completed result'],
      input: { defaultValue: ['Temporal'], schema: { type: 'array' } },
      startOptions: {
        defaultValue: { workflowId: 'hello' },
        schema: { type: 'object' },
      },
      execution: {
        kind: 'workflow',
        workflowType: 'workflow',
        workflow,
        activities: {},
      },
    });

    await generateWorkflowCatalogArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
    });
    const generatedContent = await readFile(
      join(rootDirectory, artifactPath),
      'utf8',
    );

    expect(generatedContent).toBe(
      await format(generatedContent, { parser: 'json' }),
    );
  });

  it('writes only browser descriptors while retaining executable bindings in memory', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'shared-registrations.ts';
    const artifactPath = 'catalog.generated.json';
    const workflow = () => 'workflow-executable-marker';
    const activity = () => 'activity-executable-marker';
    const registry = createWorkflowCatalogRegistry();
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const populated = true;\n',
    );
    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'workflow-catalog',
      workflowsPath: './workflows',
      workflowExports: { greetingWorkflow: workflow },
    });
    registry.registerExample({
      id: 'greeting',
      title: 'Greeting',
      description: 'Returns a greeting.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed result'],
      input: { defaultValue: [], schema: { type: 'array' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'workflow',
        workflowType: 'greetingWorkflow',
        workflow,
        activities: { greetingActivity: activity },
      },
    });

    const generated = await generateWorkflowCatalogArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
    });
    const artifactContent = await readFile(
      join(rootDirectory, artifactPath),
      'utf8',
    );

    expect(artifactContent).not.toContain('executable-marker');
    expect(JSON.parse(artifactContent).descriptors).toHaveLength(1);
    expect(
      generated.nodeBindings[0]?.target.workflowExports.greetingWorkflow,
    ).toBe(workflow);
    expect(generated.nodeBindings[0]?.activities.greetingActivity).toBe(
      activity,
    );
  });

  it('verifies fresh artifacts and reports source or generated-output drift', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'shared-registrations.ts';
    const artifactPath = 'catalog.generated.json';
    const registry = createWorkflowCatalogRegistry();
    const options = {
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
    };
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const version = 1;\n',
    );
    await generateWorkflowCatalogArtifact(options);

    await expect(
      verifyWorkflowCatalogArtifact(options),
    ).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, sourcePath),
      'export const version = 2;\n',
    );
    await expect(verifyWorkflowCatalogArtifact(options)).rejects.toThrowError(
      'Workflow catalog artifact "catalog.generated.json" is stale because registration sources changed',
    );

    await generateWorkflowCatalogArtifact(options);
    const generated = JSON.parse(
      await readFile(join(rootDirectory, artifactPath), 'utf8'),
    );
    generated.descriptors.push({ manuallyEdited: true });
    await writeFile(
      join(rootDirectory, artifactPath),
      `${JSON.stringify(generated, null, 2)}\n`,
    );

    await expect(verifyWorkflowCatalogArtifact(options)).rejects.toThrowError(
      'Workflow catalog artifact "catalog.generated.json" has generated output drift',
    );
  });

  it('keeps clean checkouts local-artifact-free and rejects one-sided local state', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const fallbackSourcePath =
      'src/lib/workflow-catalog/node/local-registration-fallback.ts';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/node'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );

    const options = {
      rootDirectory,
      sharedSource: {
        sourceFiles: [sharedSourcePath],
        register: () => undefined,
      },
      sharedArtifactPath: 'catalog.generated.json',
      localModulePath: '.workflow-catalog/local-registration.ts',
      localFallback: {
        ...localRegistrationFallback,
        sourceFiles: [fallbackSourcePath],
      },
      localArtifactPath: '.workflow-catalog/local.generated.json',
    };
    await mkdir(join(rootDirectory, '.workflow-catalog'), { recursive: true });
    await writeFile(
      join(rootDirectory, options.localArtifactPath),
      '{"stale":true}\n',
    );

    await generateWorkflowCatalogArtifacts(options);

    expect(
      JSON.parse(
        await readFile(join(rootDirectory, 'catalog.generated.json'), 'utf8'),
      ).descriptors,
    ).toEqual([]);
    await expect(
      readFile(join(rootDirectory, options.localArtifactPath), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      verifyWorkflowCatalogArtifacts(options),
    ).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, options.localArtifactPath),
      '{"unexpected":true}\n',
    );
    await expect(verifyWorkflowCatalogArtifacts(options)).rejects.toThrowError(
      'Local workflow catalog artifact exists without its registration source',
    );

    await rm(join(rootDirectory, options.localArtifactPath));
    await writeFile(
      join(rootDirectory, options.localModulePath),
      `export const workflowCatalogRegistrationSource = {
  sourceFiles: ['.workflow-catalog/local-registration.ts'],
  register() {},
};
`,
    );
    await expect(verifyWorkflowCatalogArtifacts(options)).rejects.toThrowError(
      'Local workflow catalog registration source exists without its generated artifact',
    );
  });

  it('generates a present fixed local module only to the ignored local overlay', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localModulePath = '.workflow-catalog/local-registration.ts';
    const fallbackSourcePath =
      'src/lib/workflow-catalog/node/local-registration-fallback.ts';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await mkdir(join(rootDirectory, '.workflow-catalog'), { recursive: true });
    await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/node'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );
    await writeFile(
      join(rootDirectory, localModulePath),
      `const activity = () => 'local';
export const workflowCatalogRegistrationSource = {
  sourceFiles: ['.workflow-catalog/local-registration.ts'],
  register(registry) {
    registry.registerTarget({
      id: 'local',
      namespace: 'default',
      taskQueue: 'local-catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'local-example',
      title: 'Local example',
      description: 'Stays local.',
      targetId: 'local',
      capabilityTags: [],
      expectedEvidence: ['A local result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'localActivity',
        activity,
        timeouts: {},
        policies: {},
      },
    });
  },
};
`,
    );

    await generateWorkflowCatalogArtifacts({
      rootDirectory,
      sharedSource: {
        sourceFiles: [sharedSourcePath],
        register: () => undefined,
      },
      sharedArtifactPath: 'catalog.generated.json',
      localModulePath,
      localFallback: {
        ...localRegistrationFallback,
        sourceFiles: [fallbackSourcePath],
      },
      localArtifactPath: '.workflow-catalog/local.generated.json',
    });

    const sharedArtifact = JSON.parse(
      await readFile(join(rootDirectory, 'catalog.generated.json'), 'utf8'),
    );
    const localArtifact = JSON.parse(
      await readFile(
        join(rootDirectory, '.workflow-catalog/local.generated.json'),
        'utf8',
      ),
    );
    const gitignore = await readFile('.gitignore', 'utf8');

    expect(sharedArtifact.descriptors).toEqual([]);
    expect(
      localArtifact.descriptors.map(({ id }: { id: string }) => id),
    ).toEqual(['local-example']);
    expect(gitignore).toContain('/.workflow-catalog/');
    expect(gitignore).not.toContain('/.workflow-catalog/local-registration.ts');
    expect(gitignore).not.toContain('/.workflow-catalog/local.generated.json');
  });

  it('validates shared and local registrations together while emitting separate descriptors', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localModulePath = '.workflow-catalog/local-registration.ts';
    const fallbackSourcePath =
      'src/lib/workflow-catalog/node/local-registration-fallback.ts';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await mkdir(join(rootDirectory, '.workflow-catalog'), { recursive: true });
    await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/node'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );
    await writeFile(
      join(rootDirectory, localModulePath),
      `const activity = () => 'local';
export const workflowCatalogRegistrationSource = {
  sourceFiles: ['.workflow-catalog/local-registration.ts'],
  register(registry) {
    registry.registerExample({
      id: 'local-on-shared-target',
      title: 'Local on shared target',
      description: 'Uses a shared target.',
      targetId: 'shared-target',
      capabilityTags: [],
      expectedEvidence: ['A local result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'localActivity',
        activity,
        timeouts: {},
        policies: {},
      },
    });
  },
};
`,
    );

    await generateWorkflowCatalogArtifacts({
      rootDirectory,
      sharedSource: {
        sourceFiles: [sharedSourcePath],
        register: (registry) =>
          registry.registerTarget({
            id: 'shared-target',
            namespace: 'default',
            taskQueue: 'shared-catalog',
            workflowsPath: './workflows',
            workflowExports: {},
          }),
      },
      sharedArtifactPath: 'catalog.generated.json',
      localModulePath,
      localFallback: {
        ...localRegistrationFallback,
        sourceFiles: [fallbackSourcePath],
      },
      localArtifactPath: '.workflow-catalog/local.generated.json',
    });

    expect(
      JSON.parse(
        await readFile(join(rootDirectory, 'catalog.generated.json'), 'utf8'),
      ).descriptors,
    ).toEqual([]);
    expect(
      JSON.parse(
        await readFile(
          join(rootDirectory, '.workflow-catalog/local.generated.json'),
          'utf8',
        ),
      ).descriptors.map(({ id, source }: { id: string; source?: string }) => ({
        id,
        source,
      })),
    ).toEqual([{ id: 'local-on-shared-target', source: 'local' }]);
  });

  it('classifies shared routing changes used by local descriptors as registration-source drift', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localModulePath = '.workflow-catalog/local-registration.ts';
    const fallbackSourcePath =
      'src/lib/workflow-catalog/node/local-registration-fallback.ts';
    let sharedTaskQueue = 'shared-catalog-v1';
    const sharedSource = {
      sourceFiles: [sharedSourcePath],
      register: (registry: ReturnType<typeof createWorkflowCatalogRegistry>) =>
        registry.registerTarget({
          id: 'shared-target',
          namespace: 'default',
          taskQueue: sharedTaskQueue,
          workflowsPath: './workflows',
          workflowExports: {},
        }),
    };
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const taskQueue = "shared-catalog-v1";\n',
    );
    await mkdir(join(rootDirectory, '.workflow-catalog'), { recursive: true });
    await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/node'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );
    await writeFile(
      join(rootDirectory, localModulePath),
      `const activity = () => 'local';
export const workflowCatalogRegistrationSource = {
  sourceFiles: ['.workflow-catalog/local-registration.ts'],
  register(registry) {
    registry.registerExample({
      id: 'local-on-shared-target',
      title: 'Local on shared target',
      description: 'Uses shared routing.',
      targetId: 'shared-target',
      capabilityTags: [],
      expectedEvidence: ['A local result'],
      input: { defaultValue: {}, schema: {} },
      startOptions: { defaultValue: {}, schema: {} },
      execution: {
        kind: 'standalone-activity',
        activityType: 'localActivity',
        activity,
        timeouts: {},
        policies: {},
      },
    });
  },
};
`,
    );
    const options = {
      rootDirectory,
      sharedSource,
      sharedArtifactPath: 'catalog.generated.json',
      localModulePath,
      localFallback: {
        ...localRegistrationFallback,
        sourceFiles: [fallbackSourcePath],
      },
      localArtifactPath: '.workflow-catalog/local.generated.json',
    };
    await generateWorkflowCatalogArtifacts(options);

    sharedTaskQueue = 'shared-catalog-v2';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const taskQueue = "shared-catalog-v2";\n',
    );
    const updatedSharedRegistry = createWorkflowCatalogRegistry();
    sharedSource.register(updatedSharedRegistry);
    await generateWorkflowCatalogArtifact({
      rootDirectory,
      sourceFiles: sharedSource.sourceFiles,
      artifactPath: options.sharedArtifactPath,
      registry: updatedSharedRegistry,
    });

    await expect(verifyWorkflowCatalogArtifacts(options)).rejects.toThrowError(
      'Workflow catalog artifact ".workflow-catalog/local.generated.json" is stale because registration sources changed',
    );
  });

  it('rejects duplicate examples, target conflicts, and activity collisions across sources', async () => {
    const expectCrossSourceConflict = async (
      localRegistration: string,
      expectedMessage: string,
      registerSharedExample = false,
    ) => {
      const rootDirectory = await createTemporaryDirectory();
      const sharedSourcePath = 'shared-registrations.ts';
      const localModulePath = '.workflow-catalog/local-registration.ts';
      const fallbackSourcePath =
        'src/lib/workflow-catalog/node/local-registration-fallback.ts';
      const sharedActivity = () => 'shared';
      await writeFile(
        join(rootDirectory, sharedSourcePath),
        'export const shared = true;\n',
      );
      await mkdir(join(rootDirectory, '.workflow-catalog'), {
        recursive: true,
      });
      await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/node'), {
        recursive: true,
      });
      await writeFile(
        join(rootDirectory, fallbackSourcePath),
        'export const fallback = true;\n',
      );
      await writeFile(
        join(rootDirectory, localModulePath),
        `export const workflowCatalogRegistrationSource = {
  sourceFiles: ['.workflow-catalog/local-registration.ts'],
  register(registry) {
    ${localRegistration}
  },
};
`,
      );

      await expect(
        generateWorkflowCatalogArtifacts({
          rootDirectory,
          sharedSource: {
            sourceFiles: [sharedSourcePath],
            register: (registry) => {
              registry.registerTarget({
                id: 'shared-target',
                namespace: 'default',
                taskQueue: 'shared-catalog',
                workflowsPath: './workflows',
                workflowExports: {},
              });
              if (registerSharedExample) {
                registry.registerExample({
                  id: 'shared-example',
                  title: 'Shared example',
                  description: 'Shared.',
                  targetId: 'shared-target',
                  capabilityTags: [],
                  expectedEvidence: ['Shared evidence'],
                  input: { defaultValue: {}, schema: {} },
                  startOptions: { defaultValue: {}, schema: {} },
                  execution: {
                    kind: 'standalone-activity',
                    activityType: 'collidingActivity',
                    activity: sharedActivity,
                    timeouts: {},
                    policies: {},
                  },
                });
              }
            },
          },
          sharedArtifactPath: 'catalog.generated.json',
          localModulePath,
          localFallback: {
            ...localRegistrationFallback,
            sourceFiles: [fallbackSourcePath],
          },
          localArtifactPath: '.workflow-catalog/local.generated.json',
        }),
      ).rejects.toThrowError(expectedMessage);
    };

    const localExample = (id: string, activityType: string) => `
const activity = () => 'local';
registry.registerExample({
  id: '${id}',
  title: 'Local example',
  description: 'Local.',
  targetId: 'shared-target',
  capabilityTags: [],
  expectedEvidence: ['Local evidence'],
  input: { defaultValue: {}, schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution: {
    kind: 'standalone-activity',
    activityType: '${activityType}',
    activity,
    timeouts: {},
    policies: {},
  },
});`;

    await expectCrossSourceConflict(
      localExample('shared-example', 'localActivity'),
      'Duplicate workflow catalog example id "shared-example"',
      true,
    );
    await expectCrossSourceConflict(
      `registry.registerTarget({
  id: 'shared-target',
  namespace: 'other',
  taskQueue: 'other-catalog',
  workflowsPath: './other-workflows',
  workflowExports: {},
});`,
      'Duplicate workflow catalog target id "shared-target"',
    );
    await expectCrossSourceConflict(
      localExample('local-example', 'collidingActivity'),
      'Activity "collidingActivity" has conflicting implementations on target "shared-target"',
      true,
    );
  });

  it('verifies explicit sources, browser isolation, and the static package boundary', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const browserModulePath = 'src/lib/workflow-catalog/browser/types.ts';
    const browserCatalogPath = 'src/lib/workflow-catalog/browser/catalog.ts';
    const browserArtifactPath =
      'src/lib/workflow-catalog/browser/catalog.generated.json';
    const browserTypeScriptArtifactPath =
      'src/lib/workflow-catalog/browser/catalog.generated.ts';
    const sharedSourcePath =
      'src/lib/workflow-catalog/node/shared-registrations.ts';
    const packageJsonPath = 'package.json';
    await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/browser'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/node'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, browserModulePath),
      'export type BrowserOnly = string;\n',
    );
    await writeFile(
      join(rootDirectory, browserCatalogPath),
      "import { catalogArtifact } from './catalog.generated.js';\nexport const catalog = catalogArtifact;\n",
    );
    await writeFile(
      join(rootDirectory, browserArtifactPath),
      '{"sourceHash":"hash","descriptors":[]}\n',
    );
    await writeFile(
      join(rootDirectory, browserTypeScriptArtifactPath),
      "import type { BrowserOnly } from './types';\nexport const catalogArtifact: BrowserOnly = '';\n",
    );
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await writeFile(
      join(rootDirectory, packageJsonPath),
      '{"files":["dist/**/*","!dist/**/*.test.*"]}\n',
    );
    const options = {
      rootDirectory,
      browserFiles: [
        browserModulePath,
        browserCatalogPath,
        browserArtifactPath,
        browserTypeScriptArtifactPath,
      ],
      declaredSourceFiles: [sharedSourcePath],
      packageJsonPath,
      localPaths: [
        '.workflow-catalog/local-registration.ts',
        '.workflow-catalog/local.generated.json',
      ],
    };

    await expect(
      verifyWorkflowCatalogProjectBoundaries(options),
    ).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, browserModulePath),
      "import '../../node/registry';\n",
    );
    await expect(
      verifyWorkflowCatalogProjectBoundaries(options),
    ).rejects.toThrowError(
      'Browser workflow catalog files cannot reference Node catalog code or local output',
    );

    await writeFile(
      join(rootDirectory, browserModulePath),
      'export type BrowserOnly = string;\n',
    );
    await expect(
      verifyWorkflowCatalogProjectBoundaries({
        ...options,
        declaredSourceFiles: ['src/lib/workflow-catalog/node/*.ts'],
      }),
    ).rejects.toThrowError('Workflow catalog source paths must be explicit');
    await expect(
      verifyWorkflowCatalogProjectBoundaries({
        ...options,
        declaredSourceFiles: [
          'src/lib/workflow-catalog/node/missing-registration.ts',
        ],
      }),
    ).rejects.toThrowError('Declared workflow catalog source does not exist');

    await writeFile(
      join(rootDirectory, packageJsonPath),
      '{"files":["dist/**/*",".workflow-catalog/**/*"]}\n',
    );
    await expect(
      verifyWorkflowCatalogProjectBoundaries(options),
    ).rejects.toThrowError(
      'Package files must exclude local workflow catalog paths',
    );
  });

  it('excludes a populated local overlay from the packed tarball', async () => {
    const packageDirectory = await createExternalTemporaryDirectory();
    const packDirectory = join(packageDirectory, 'packs');
    await mkdir(join(packageDirectory, 'dist/workflow-catalog/browser'), {
      recursive: true,
    });
    await mkdir(join(packageDirectory, 'dist/workflow-catalog/node'), {
      recursive: true,
    });
    await mkdir(join(packageDirectory, '.workflow-catalog'), {
      recursive: true,
    });
    await mkdir(packDirectory);
    await writeFile(
      join(packageDirectory, 'package.json'),
      await readFile('package.json', 'utf8'),
    );
    await writeFile(
      join(
        packageDirectory,
        'dist/workflow-catalog/browser/catalog.generated.json',
      ),
      '{"shared":true}\n',
    );
    await writeFile(
      join(
        packageDirectory,
        'dist/workflow-catalog/browser/catalog.generated.js',
      ),
      'export const catalogArtifact = { shared: true };\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/workflow-catalog/node/registry.js'),
      'export const sharedBinding = true;\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/workflow-catalog/node/runner.js'),
      'export const runnerKernel = true;\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/workflow-catalog/node/workflows.js'),
      'export {};\n',
    );
    await writeFile(
      join(packageDirectory, '.workflow-catalog/local-registration.ts'),
      'export const localSource = true;\n',
    );
    await writeFile(
      join(packageDirectory, '.workflow-catalog/local.generated.json'),
      '{"local":true}\n',
    );

    const { stdout } = await execFileAsync(
      'pnpm',
      ['pack', '--pack-destination', packDirectory],
      {
        cwd: packageDirectory,
        env: { ...process.env, npm_config_ignore_scripts: 'true' },
      },
    );
    const tarballPath = stdout.trim().split('\n').at(-1)!;
    const { stdout: listing } = await execFileAsync(
      'tar',
      ['-tf', tarballPath],
      { cwd: packageDirectory },
    );

    expect(listing).toContain(
      'package/dist/workflow-catalog/browser/catalog.generated.json',
    );
    expect(listing).toContain(
      'package/dist/workflow-catalog/browser/catalog.generated.js',
    );
    expect(listing).toContain('package/dist/workflow-catalog/node/registry.js');
    expect(listing).toContain('package/dist/workflow-catalog/node/runner.js');
    expect(listing).toContain(
      'package/dist/workflow-catalog/node/workflows.js',
    );
    expect(listing).not.toContain('.workflow-catalog');
    expect(listing).not.toContain('local-registration');
    expect(listing).not.toContain('local.generated');
  });

  packageConsumerTest(
    'lets a clean consumer import the packaged runner and browser catalog without Node code in its browser graph',
    async () => {
      const rootDirectory = process.cwd();
      const testDirectory = await createExternalTemporaryDirectory();
      const packageDirectory = join(testDirectory, 'package');
      const packDirectory = join(testDirectory, 'packs');
      const consumerDirectory = join(testDirectory, 'consumer');

      await mkdir(packageDirectory);
      await Promise.all(
        [
          '.npmrc',
          'package.json',
          'svelte.config.js',
          'tsconfig.json',
          'scripts/generate-exports.mjs',
          'src/lib/holocene/badge.svelte',
          'src/lib/holocene/button.svelte',
          'src/lib/holocene/card.svelte',
          'src/lib/holocene/icon',
          'src/lib/holocene/icon-button.svelte',
          'src/lib/holocene/input/input.svelte',
          'src/lib/holocene/label.svelte',
          'src/lib/holocene/textarea.svelte',
          'src/lib/i18n/index.ts',
          'src/lib/i18n/locales',
          'src/lib/i18n/translate.ts',
          'src/lib/svelte-mocks/app/navigation.ts',
          'src/lib/types/global.ts',
          'src/lib/utilities/copy-to-clipboard.ts',
          'src/lib/workflow-catalog',
        ].map((sourcePath) =>
          cp(
            join(rootDirectory, sourcePath),
            join(packageDirectory, sourcePath),
            {
              recursive: true,
            },
          ),
        ),
      );
      const packageJson = JSON.parse(
        await readFile(join(packageDirectory, 'package.json'), 'utf8'),
      );
      packageJson.scripts.prepare = 'svelte-kit sync';
      await writeFile(
        join(packageDirectory, 'package.json'),
        `${JSON.stringify(packageJson, null, 2)}\n`,
      );
      await symlink(
        join(rootDirectory, 'node_modules'),
        join(packageDirectory, 'node_modules'),
        'dir',
      );
      await execFileAsync('pnpm', ['exec', 'svelte-kit', 'sync'], {
        cwd: packageDirectory,
      });
      await mkdir(packDirectory);
      const { stdout } = await execFileAsync(
        'pnpm',
        ['pack', '--pack-destination', packDirectory],
        { cwd: packageDirectory },
      );
      const tarballPath = stdout.trim().split('\n').at(-1)!;

      await mkdir(join(consumerDirectory, 'src'), { recursive: true });
      await writeFile(
        join(consumerDirectory, 'package.json'),
        JSON.stringify({
          type: 'module',
          dependencies: { '@temporalio/ui': `file:${tarballPath}` },
          devDependencies: {
            '@sveltejs/vite-plugin-svelte': '^6.2.4',
            svelte: '^5.55.7',
            vite: '^6.4.3',
          },
        }),
      );
      await writeFile(
        join(consumerDirectory, 'runner.mjs'),
        [
          "import { fileURLToPath } from 'node:url';",
          "import { startWorkflowCatalogRunner } from '@temporalio/ui/workflow-catalog/node/runner';",
          "import { workflowCatalogRegistrationSource } from '@temporalio/ui/workflow-catalog/node/shared-registrations';",
          "import { hello } from '@temporalio/ui/workflow-catalog/node/workflows';",
          "const workflowsPath = import.meta.resolve('@temporalio/ui/workflow-catalog/node/workflows');",
          "if (typeof startWorkflowCatalogRunner !== 'function') throw new Error('Missing runner kernel');",
          "if (typeof workflowCatalogRegistrationSource.register !== 'function') throw new Error('Missing shared workflow registration source');",
          "if (typeof hello !== 'function') throw new Error('Missing shared workflow export');",
          "if (!workflowsPath.endsWith('/workflow-catalog/node/workflows.js')) throw new Error(`Unexpected workflows path: ${workflowsPath}`);",
          'const workerOptions = [];',
          'const runner = await startWorkflowCatalogRunner({',
          "  bindings: [{ target: { id: 'catalog', namespace: 'default', taskQueue: 'catalog', workflowsPath: './workflows.js', workflowExports: {} }, examples: [], activities: {}, nexusServices: [] }],",
          '  connection: { close: async () => undefined },',
          '  createWorker: async (options) => {',
          '    workerOptions.push(options);',
          '    return { run: async () => undefined, shutdown: () => undefined };',
          '  },',
          '});',
          'await runner.completion;',
          'if (workerOptions[0]?.workflowsPath !== fileURLToPath(workflowsPath)) {',
          '  throw new Error(`Unexpected Worker.create workflows path: ${workerOptions[0]?.workflowsPath}`);',
          '}',
        ].join('\n'),
      );
      await writeFile(
        join(consumerDirectory, 'browser-catalog.mjs'),
        [
          "import { workflowCatalog } from '@temporalio/ui/workflow-catalog/browser/catalog';",
          "import { resolveWorkflowCatalogRouting } from '@temporalio/ui/workflow-catalog/browser/routing';",
          "if (!Array.isArray(workflowCatalog)) throw new Error('Expected a workflow catalog descriptor array');",
          "if (!workflowCatalog.every((descriptor) => typeof descriptor.id === 'string' && typeof descriptor.title === 'string')) throw new Error('Expected valid workflow catalog descriptor data');",
          "const [target] = resolveWorkflowCatalogRouting([{ targetId: 'shared-workflows', namespace: 'default', taskQueue: 'default' }], { 'shared-workflows': { namespace: 'runtime', taskQueue: 'runtime' } });",
          "if (target.namespace !== 'runtime' || target.taskQueue !== 'runtime') throw new Error('Expected injectable workflow catalog routing');",
        ].join('\n'),
      );
      await writeFile(
        join(consumerDirectory, 'index.html'),
        '<script type="module" src="/src/main.js"></script>\n',
      );
      await writeFile(
        join(consumerDirectory, 'vite.config.js'),
        [
          "import { svelte } from '@sveltejs/vite-plugin-svelte';",
          "import { defineConfig } from 'vite';",
          '',
          "export default defineConfig({ plugins: [svelte({ hot: false })], resolve: { alias: { $app: '@temporalio/ui/svelte-mocks/app' } } });",
        ].join('\n'),
      );
      await writeFile(
        join(consumerDirectory, 'src/main.js'),
        [
          "import { workflowCatalog } from '@temporalio/ui/workflow-catalog/browser/catalog';",
          "import { resolveWorkflowCatalogRouting } from '@temporalio/ui/workflow-catalog/browser/routing';",
          "import Workbench from '@temporalio/ui/workflow-catalog/browser/workbench.svelte';",
          "const [target] = resolveWorkflowCatalogRouting([{ targetId: 'shared-workflows', namespace: 'default', taskQueue: 'default' }], { 'shared-workflows': { namespace: 'runtime', taskQueue: 'runtime' } });",
          'document.body.dataset.workflowCatalogSize = String(workflowCatalog.length);',
          'document.body.dataset.workflowCatalogWorkbench = typeof Workbench;',
          'document.body.dataset.workflowCatalogNamespace = target.namespace;',
        ].join('\n'),
      );

      await execFileAsync('pnpm', ['install', '--ignore-scripts'], {
        cwd: consumerDirectory,
      });
      await expect(
        execFileAsync(process.execPath, ['runner.mjs'], {
          cwd: consumerDirectory,
        }),
      ).resolves.toMatchObject({ stderr: '' });
      await expect(
        execFileAsync(process.execPath, ['browser-catalog.mjs'], {
          cwd: consumerDirectory,
        }),
      ).resolves.toMatchObject({ stderr: '' });
      await execFileAsync(
        join(rootDirectory, 'node_modules/.bin/vite'),
        ['build'],
        {
          cwd: consumerDirectory,
        },
      );

      const assets = await readdir(join(consumerDirectory, 'dist/assets'));
      const bundles = await Promise.all(
        assets
          .filter((asset) => asset.endsWith('.js'))
          .map((asset) =>
            readFile(join(consumerDirectory, 'dist/assets', asset), 'utf8'),
          ),
      );

      expect(bundles.join('\n')).not.toContain('node:');
      expect(bundles.join('\n')).not.toContain('workflow-catalog/node');
    },
    120_000,
  );

  it('exposes generate and verify pnpm commands with correct exit status', async () => {
    const sharedArtifactPath =
      'src/lib/workflow-catalog/browser/catalog.generated.json';

    await execFileAsync('pnpm', ['workflow-catalog:generate']);

    try {
      await expect(
        execFileAsync('pnpm', ['workflow-catalog:verify']),
      ).resolves.toMatchObject({ stderr: '' });

      const artifact = JSON.parse(await readFile(sharedArtifactPath, 'utf8'));
      artifact.descriptors.push({ manuallyEdited: true });
      await writeFile(
        sharedArtifactPath,
        `${JSON.stringify(artifact, null, 2)}\n`,
      );

      let verifyFailure: unknown;
      try {
        await execFileAsync('pnpm', ['workflow-catalog:verify']);
      } catch (error) {
        verifyFailure = error;
      }

      expect(verifyFailure).toMatchObject({ code: 1 });
      expect(
        `${(verifyFailure as { stdout?: string }).stdout ?? ''}${
          (verifyFailure as { stderr?: string }).stderr ?? ''
        }`,
      ).toContain('has generated output drift');
    } finally {
      await execFileAsync('pnpm', ['workflow-catalog:generate']);
    }
  });

  it('exposes a separate workflow catalog worker development command that reports its first preflight failure clearly', async () => {
    let commandFailure: unknown;

    try {
      await execFileAsync('pnpm', ['dev:workflow-catalog-worker'], {
        env: {
          ...process.env,
          TEMPORAL_ADDRESS: '',
          TEMPORAL_NAMESPACE: '',
        },
      });
    } catch (error) {
      commandFailure = error;
    }

    expect(commandFailure).toMatchObject({ code: 1 });
    expect(
      `${(commandFailure as { stdout?: string }).stdout ?? ''}${
        (commandFailure as { stderr?: string }).stderr ?? ''
      }`,
    ).toContain('TEMPORAL_NAMESPACE is required');
  });

  it('rejects stale artifacts before development can load or rewrite them', async () => {
    const sharedSourcePath =
      'src/lib/workflow-catalog/node/shared-registrations.ts';
    const sharedArtifactPath =
      'src/lib/workflow-catalog/browser/catalog.generated.json';
    const originalSource = await readFile(sharedSourcePath, 'utf8');

    await execFileAsync('pnpm', ['workflow-catalog:generate']);
    const generatedArtifactContent = await readFile(sharedArtifactPath, 'utf8');
    await writeFile(sharedSourcePath, `${originalSource}\n`);

    try {
      let commandFailure: unknown;

      try {
        await execFileAsync('pnpm', ['dev:workflow-catalog-worker'], {
          env: { ...process.env, TEMPORAL_ADDRESS: '' },
        });
      } catch (error) {
        commandFailure = error;
      }

      expect(commandFailure).toMatchObject({ code: 1 });
      expect(
        `${(commandFailure as { stdout?: string }).stdout ?? ''}${
          (commandFailure as { stderr?: string }).stderr ?? ''
        }`,
      ).toContain('is stale because registration sources changed');
      await expect(readFile(sharedArtifactPath, 'utf8')).resolves.toBe(
        generatedArtifactContent,
      );
    } finally {
      await writeFile(sharedSourcePath, originalSource);
      await execFileAsync('pnpm', ['workflow-catalog:generate']);
    }
  });
});
