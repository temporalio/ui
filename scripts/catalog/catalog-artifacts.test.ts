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
  loadCatalogWorkerBindings,
  renderCatalogArtifact,
  renderCatalogArtifacts,
  verifyCatalogArtifact,
  verifyCatalogProjectBoundaries,
} from './catalog-artifacts';
import { catalogWorkerEntry, runCatalogWorkerDevelopment } from './catalog-cli';
import { createInRepoTemporaryDirectory } from './test-temp-root';
import { catalogRegistrationSource as localRegistrationFallback } from '../../src/lib/catalog/worker/local-registration-fallback';
import { createCatalogRegistry } from '../../src/lib/catalog/worker/registry';
import { requireCatalogRoutingFromEnvironment } from '../../src/lib/catalog/worker/routing-config';

const temporaryDirectories: string[] = [];
const execFileAsync = promisify(execFile);
const catalogCommandTestTimeoutMs = 30_000;
const packageConsumerTest =
  process.env.CATALOG_PACKAGE_TEST === '1' ? it : it.skip;

const createTemporaryDirectory = async () => {
  const directory = await createInRepoTemporaryDirectory('catalog-test-');
  temporaryDirectories.push(directory);
  return directory;
};

const createExternalTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'catalog-test-'));
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

const installRenderedArtifact = async (
  rootDirectory: string,
  artifact: { artifactPath: string; content: string | null },
) => {
  const path = join(rootDirectory, artifact.artifactPath);
  if (artifact.content === null) {
    await rm(path, { force: true });
    return;
  }
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, artifact.content);
};

const renderAndInstallArtifact = async (
  options: Parameters<typeof renderCatalogArtifact>[0],
) => {
  const rendered = await renderCatalogArtifact(options);
  await installRenderedArtifact(options.rootDirectory, rendered.output);
  return rendered.generated;
};

const renderAndInstallArtifacts = async (
  options: Parameters<typeof renderCatalogArtifacts>[0],
) => {
  const rendered = await renderCatalogArtifacts(options);
  await Promise.all(
    rendered.artifacts.map((artifact) =>
      installRenderedArtifact(options.rootDirectory, artifact),
    ),
  );
  return rendered;
};

const verifyRenderedArtifacts = async (
  options: Parameters<typeof renderCatalogArtifacts>[0],
) => {
  const localModulePath = join(options.rootDirectory, options.localModulePath);
  const localArtifactPath = join(
    options.rootDirectory,
    options.localArtifactPath,
  );
  const [hasLocalModule, hasLocalArtifact] = await Promise.all([
    readFile(localModulePath)
      .then(() => true)
      .catch(() => false),
    readFile(localArtifactPath)
      .then(() => true)
      .catch(() => false),
  ]);
  if (hasLocalModule && !hasLocalArtifact) {
    throw new Error(
      'Local catalog registration source exists without its generated artifact',
    );
  }
  if (!hasLocalModule && hasLocalArtifact) {
    throw new Error(
      'Local catalog artifact exists without its registration source',
    );
  }
  const rendered = await renderCatalogArtifacts(options);
  for (const artifact of rendered.artifacts) {
    const current = await readFile(
      join(options.rootDirectory, artifact.artifactPath),
      'utf8',
    ).catch(() => undefined);
    if (
      artifact.content === null
        ? current === undefined
        : current === artifact.content
    ) {
      continue;
    }
    if (artifact.content !== null && current) {
      const expectedSourceHash = JSON.parse(artifact.content).sourceHash;
      const actualSourceHash = JSON.parse(current).sourceHash;
      if (expectedSourceHash !== actualSourceHash) {
        throw new Error(
          `Catalog artifact "${artifact.artifactPath}" is stale because registration sources changed`,
        );
      }
    }
    throw new Error(
      `Catalog artifact "${artifact.artifactPath}" has generated output drift`,
    );
  }
};

describe('catalog artifacts', () => {
  it('renders every artifact without writing and generation preserves those bytes', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localSourcePath = 'local-registration.ts';
    const sharedArtifactPath = 'catalog.generated.json';
    const sharedTypeScriptArtifactPath = 'catalog.generated.ts';
    const localArtifactPath = 'catalog.local/catalog.generated.json';
    const options = {
      rootDirectory,
      sharedSource: {
        source: { id: 'oss', label: 'OSS' },
        sourceFiles: [sharedSourcePath],
        register: () => undefined,
      },
      sharedArtifactPath,
      sharedTypeScriptArtifactPath,
      localModulePath: 'catalog.local/registration.ts',
      localSource: null,
      localFallback: {
        source: { id: 'local', label: 'Local' },
        sourceFiles: [localSourcePath],
        register: () => undefined,
      },
      localArtifactPath,
    };

    await writeFile(join(rootDirectory, sharedSourcePath), 'export {};\n');
    await writeFile(join(rootDirectory, localSourcePath), 'export {};\n');
    await mkdir(join(rootDirectory, 'catalog.local'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, options.localModulePath),
      'this would fail if the renderer imported it\n',
    );
    await writeFile(join(rootDirectory, sharedArtifactPath), 'stale shared\n');
    await writeFile(
      join(rootDirectory, sharedTypeScriptArtifactPath),
      'stale TypeScript\n',
    );
    await writeFile(join(rootDirectory, localArtifactPath), 'stale local\n');

    const rendered = await renderCatalogArtifacts(options);

    expect(rendered.artifacts).toEqual([
      expect.objectContaining({ artifactPath: sharedArtifactPath }),
      expect.objectContaining({ artifactPath: sharedTypeScriptArtifactPath }),
      { artifactPath: localArtifactPath, content: null },
    ]);
    await expect(
      readFile(join(rootDirectory, sharedArtifactPath), 'utf8'),
    ).resolves.toBe('stale shared\n');
    await expect(
      readFile(join(rootDirectory, sharedTypeScriptArtifactPath), 'utf8'),
    ).resolves.toBe('stale TypeScript\n');
    await expect(
      readFile(join(rootDirectory, localArtifactPath), 'utf8'),
    ).resolves.toBe('stale local\n');

    await renderAndInstallArtifacts(options);

    for (const artifact of rendered.artifacts) {
      if (artifact.content === null) {
        await expect(
          readFile(join(rootDirectory, artifact.artifactPath), 'utf8'),
        ).rejects.toMatchObject({ code: 'ENOENT' });
      } else {
        await expect(
          readFile(join(rootDirectory, artifact.artifactPath), 'utf8'),
        ).resolves.toBe(artifact.content);
      }
    }
  });

  it('emits a browser TypeScript artifact alongside the shared JSON artifact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const sharedArtifactPath = 'catalog.generated.json';
    const sharedTypeScriptArtifactPath = 'catalog.generated.ts';
    const localSourcePath = 'local-registration.ts';
    const sharedSource = {
      source: { id: 'oss', label: 'OSS' },
      sourceFiles: [sharedSourcePath],
      register: () => undefined,
    };
    const localFallback = {
      source: { id: 'local', label: 'Local' },
      sourceFiles: [localSourcePath],
      register: () => undefined,
    };

    await writeFile(join(rootDirectory, sharedSourcePath), 'export {};\n');
    await writeFile(join(rootDirectory, localSourcePath), 'export {};\n');

    await renderAndInstallArtifacts({
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
      "import type { BrowserCatalogArtifact } from './types';",
    );
    expect(typeScriptArtifact).toContain(
      'export const catalogArtifact: BrowserCatalogArtifact = {',
    );
    expect(typeScriptArtifact).toContain(
      JSON.parse(sharedJsonArtifact).sourceHash,
    );
    expect(typeScriptArtifact).toContain('descriptors: []');
  });

  it('loads generated worker bindings without rewriting browser artifacts', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedArtifactPath = 'shared.generated.json';
    const localArtifactPath = 'local.generated.json';
    const sharedSourcePath = 'shared-registration.ts';
    const localSourcePath = 'local-registration.ts';
    const sharedSource = {
      source: { id: 'oss', label: 'OSS' },
      sourceFiles: [sharedSourcePath],
      register: () => undefined,
    };
    const localFallback = {
      source: { id: 'local', label: 'Local' },
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
    await renderAndInstallArtifacts(options);
    const generatedContent = await readFile(
      join(rootDirectory, sharedArtifactPath),
      'utf8',
    );

    await expect(loadCatalogWorkerBindings(options)).resolves.toEqual([]);
    await expect(
      readFile(join(rootDirectory, sharedArtifactPath), 'utf8'),
    ).resolves.toBe(generatedContent);
  });

  it('loads worker bindings with runtime routing applied to the requested target', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const workflow = () => undefined;
    const sharedSource = {
      source: { id: 'oss', label: 'OSS' },
      sourceFiles: ['shared-registration.ts'],
      register: (registry: ReturnType<typeof createCatalogRegistry>) => {
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

    const bindings = await loadCatalogWorkerBindings(
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

  it('relocates every discovered target through target-aware environment routing', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const workflow = () => undefined;
    const sharedSource = {
      source: { id: 'oss', label: 'OSS' },
      sourceFiles: ['shared-registration.ts'],
      register: (registry: ReturnType<typeof createCatalogRegistry>) => {
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

    const bindings = await loadCatalogWorkerBindings(
      {
        rootDirectory,
        sharedSource,
        sharedArtifactPath: 'shared.generated.json',
        localModulePath: 'missing-local-registration.ts',
        localFallback: localRegistrationFallback,
        localArtifactPath: 'local.generated.json',
      },
      (targets) =>
        requireCatalogRoutingFromEnvironment(
          { TEMPORAL_NAMESPACE: 'runtime-namespace' },
          targets,
        ),
    );

    expect(bindings[0]?.target).toMatchObject({
      id: 'shared-workflows',
      namespace: 'runtime-namespace',
      taskQueue: 'registered-task-queue',
    });
  });

  it('generates an empty shared registry to a deterministic hashed browser artifact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'shared-registrations.ts';
    const artifactPath = 'catalog.generated.json';
    const registry = createCatalogRegistry();
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const empty = true;\n',
    );

    await renderAndInstallArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
      source: { id: 'oss', label: 'OSS' },
    });
    const firstContent = await readFile(
      join(rootDirectory, artifactPath),
      'utf8',
    );

    await renderAndInstallArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
      source: { id: 'oss', label: 'OSS' },
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
    const registry = createCatalogRegistry();
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const populated = true;\n',
    );
    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
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

    await renderAndInstallArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
      source: { id: 'oss', label: 'OSS' },
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
    const registry = createCatalogRegistry();
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const populated = true;\n',
    );
    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
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

    const generated = await renderAndInstallArtifact({
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
      source: { id: 'oss', label: 'OSS' },
    });
    const artifactContent = await readFile(
      join(rootDirectory, artifactPath),
      'utf8',
    );

    expect(artifactContent).not.toContain('executable-marker');
    expect(JSON.parse(artifactContent).descriptors).toHaveLength(1);
    expect(
      generated.workerBindings[0]?.target.workflowExports.greetingWorkflow,
    ).toBe(workflow);
    expect(generated.workerBindings[0]?.activities.greetingActivity).toBe(
      activity,
    );
  });

  it('verifies fresh artifacts and reports source or generated-output drift', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'shared-registrations.ts';
    const artifactPath = 'catalog.generated.json';
    const registry = createCatalogRegistry();
    const options = {
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
      source: { id: 'oss', label: 'OSS' },
    };
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const version = 1;\n',
    );
    await renderAndInstallArtifact(options);

    await expect(verifyCatalogArtifact(options)).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, sourcePath),
      'export const version = 2;\n',
    );
    await expect(verifyCatalogArtifact(options)).rejects.toThrowError(
      'Catalog artifact "catalog.generated.json" is stale because registration sources changed',
    );

    await renderAndInstallArtifact(options);
    const generated = JSON.parse(
      await readFile(join(rootDirectory, artifactPath), 'utf8'),
    );
    generated.descriptors.push({ manuallyEdited: true });
    await writeFile(
      join(rootDirectory, artifactPath),
      `${JSON.stringify(generated, null, 2)}\n`,
    );

    await expect(verifyCatalogArtifact(options)).rejects.toThrowError(
      'Catalog artifact "catalog.generated.json" has generated output drift',
    );
  });

  it('renders source hashes from prospective generated content and verifies installed bytes', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = 'generated/registration.ts';
    const artifactPath = 'catalog.generated.json';
    const registry = createCatalogRegistry();
    await mkdir(join(rootDirectory, 'generated'));
    await writeFile(
      join(rootDirectory, sourcePath),
      'export const old = true;\n',
    );

    const rendered = await renderCatalogArtifacts({
      rootDirectory,
      sharedSource: {
        source: { id: 'oss', label: 'OSS' },
        sourceFiles: [sourcePath],
        register: () => undefined,
      },
      sharedArtifactPath: artifactPath,
      localModulePath: 'catalog.local/registration.ts',
      localFallback: { ...localRegistrationFallback, sourceFiles: [] },
      localArtifactPath: 'catalog.local/catalog.generated.json',
      sourceContentOverrides: new Map([
        [sourcePath, 'export const current = true;\n'],
      ]),
    });

    await writeFile(
      join(rootDirectory, sourcePath),
      'export const current = true;\n',
    );
    await writeFile(
      join(rootDirectory, artifactPath),
      rendered.artifacts[0]?.content ?? '',
    );

    const verificationOptions = {
      rootDirectory,
      sourceFiles: [sourcePath],
      artifactPath,
      registry,
      source: { id: 'oss', label: 'OSS' },
    };
    await expect(
      verifyCatalogArtifact(verificationOptions),
    ).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, sourcePath),
      'export const drift = true;\n',
    );
    await expect(verifyCatalogArtifact(verificationOptions)).rejects.toThrow(
      'is stale because registration sources changed',
    );
  });

  it('keeps clean checkouts local-artifact-free and rejects one-sided local state', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const fallbackSourcePath =
      'src/lib/catalog/worker/local-registration-fallback.ts';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await mkdir(join(rootDirectory, 'src/lib/catalog/worker'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );

    const options = {
      rootDirectory,
      sharedSource: {
        source: { id: 'oss', label: 'OSS' },
        sourceFiles: [sharedSourcePath],
        register: () => undefined,
      },
      sharedArtifactPath: 'catalog.generated.json',
      localModulePath: 'catalog.local/registration.ts',
      localFallback: {
        ...localRegistrationFallback,
        sourceFiles: [fallbackSourcePath],
      },
      localArtifactPath: 'catalog.local/catalog.generated.json',
    };
    await mkdir(join(rootDirectory, 'catalog.local'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, options.localArtifactPath),
      '{"stale":true}\n',
    );

    await renderAndInstallArtifacts(options);

    expect(
      JSON.parse(
        await readFile(join(rootDirectory, 'catalog.generated.json'), 'utf8'),
      ).descriptors,
    ).toEqual([]);
    await expect(
      readFile(join(rootDirectory, options.localArtifactPath), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(verifyRenderedArtifacts(options)).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, options.localArtifactPath),
      '{"unexpected":true}\n',
    );
    await expect(verifyRenderedArtifacts(options)).rejects.toThrowError(
      'Local catalog artifact exists without its registration source',
    );

    await rm(join(rootDirectory, options.localArtifactPath));
    await writeFile(
      join(rootDirectory, options.localModulePath),
      `export const catalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: ['catalog.local/registration.ts'],
  register() {},
};
`,
    );
    await expect(verifyRenderedArtifacts(options)).rejects.toThrowError(
      'Local catalog registration source exists without its generated artifact',
    );
  });

  it('generates a present fixed local module only to the ignored local overlay', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localModulePath = 'catalog.local/registration.ts';
    const fallbackSourcePath =
      'src/lib/catalog/worker/local-registration-fallback.ts';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await mkdir(join(rootDirectory, 'catalog.local'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, 'src/lib/catalog/worker'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );
    await writeFile(
      join(rootDirectory, localModulePath),
      `const activity = () => 'local';
export const catalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: ['catalog.local/registration.ts'],
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

    await renderAndInstallArtifacts({
      rootDirectory,
      sharedSource: {
        source: { id: 'oss', label: 'OSS' },
        sourceFiles: [sharedSourcePath],
        register: () => undefined,
      },
      sharedArtifactPath: 'catalog.generated.json',
      localModulePath,
      localFallback: {
        ...localRegistrationFallback,
        sourceFiles: [fallbackSourcePath],
      },
      localArtifactPath: 'catalog.local/catalog.generated.json',
    });

    const sharedArtifact = JSON.parse(
      await readFile(join(rootDirectory, 'catalog.generated.json'), 'utf8'),
    );
    const localArtifact = JSON.parse(
      await readFile(
        join(rootDirectory, 'catalog.local/catalog.generated.json'),
        'utf8',
      ),
    );
    const gitignore = await readFile('.gitignore', 'utf8');

    expect(sharedArtifact.descriptors).toEqual([]);
    expect(
      localArtifact.descriptors.map(({ id }: { id: string }) => id),
    ).toEqual(['local-example']);
    expect(gitignore).toContain('/catalog.local/');
    expect(gitignore).not.toContain('/catalog.local/registration.ts');
    expect(gitignore).not.toContain('/catalog.local/catalog.generated.json');
  });

  it.each([
    {
      sourceDeclaration: '',
      sourceDescription: 'missing',
    },
    {
      sourceDeclaration: "source: { id: 'oss', label: 'OSS' },",
      sourceDescription: 'mismatched',
    },
  ])(
    'rejects a $sourceDescription local registration source before artifact verification',
    async ({ sourceDeclaration }) => {
      const rootDirectory = await createTemporaryDirectory();
      const sharedSourcePath = 'shared-registrations.ts';
      const sharedArtifactPath = 'catalog.generated.json';
      const localModulePath = 'catalog.local/registration.ts';
      const localArtifactPath = 'catalog.local/catalog.generated.json';
      const sharedRegistry = createCatalogRegistry();
      const sharedSource = {
        source: { id: 'oss', label: 'OSS' },
        sourceFiles: [sharedSourcePath],
        register: () => undefined,
      };

      await writeFile(join(rootDirectory, sharedSourcePath), 'export {};\n');
      await mkdir(join(rootDirectory, 'catalog.local'), {
        recursive: true,
      });
      await writeFile(
        join(rootDirectory, localModulePath),
        `export const catalogRegistrationSource = {
  ${sourceDeclaration}
  sourceFiles: ['catalog.local/registration.ts'],
  register() {},
};
`,
      );
      await writeFile(
        join(rootDirectory, localArtifactPath),
        '{"sourceHash":"stale","descriptors":[]}\n',
      );
      await renderAndInstallArtifact({
        rootDirectory,
        sourceFiles: sharedSource.sourceFiles,
        artifactPath: sharedArtifactPath,
        registry: sharedRegistry,
        source: sharedSource.source,
      });

      await expect(
        verifyRenderedArtifacts({
          rootDirectory,
          sharedSource,
          sharedArtifactPath,
          localModulePath,
          localFallback: localRegistrationFallback,
          localArtifactPath,
        }),
      ).rejects.toThrow(
        'Local catalog registration source must declare source {"id":"local","label":"Local"}',
      );
    },
  );

  it('validates shared and local registrations together while emitting separate descriptors', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localModulePath = 'catalog.local/registration.ts';
    const fallbackSourcePath =
      'src/lib/catalog/worker/local-registration-fallback.ts';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const shared = true;\n',
    );
    await mkdir(join(rootDirectory, 'catalog.local'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, 'src/lib/catalog/worker'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );
    await writeFile(
      join(rootDirectory, localModulePath),
      `const activity = () => 'local';
export const catalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: ['catalog.local/registration.ts'],
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

    await renderAndInstallArtifacts({
      rootDirectory,
      sharedSource: {
        source: { id: 'oss', label: 'OSS' },
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
      localArtifactPath: 'catalog.local/catalog.generated.json',
    });

    expect(
      JSON.parse(
        await readFile(join(rootDirectory, 'catalog.generated.json'), 'utf8'),
      ).descriptors,
    ).toEqual([]);
    expect(
      JSON.parse(
        await readFile(
          join(rootDirectory, 'catalog.local/catalog.generated.json'),
          'utf8',
        ),
      ).descriptors.map(
        ({
          id,
          source,
        }: {
          id: string;
          source?: { id: string; label: string };
        }) => ({ id, source }),
      ),
    ).toEqual([
      {
        id: 'local-on-shared-target',
        source: { id: 'local', label: 'Local' },
      },
    ]);
  });

  it('classifies shared routing changes used by local descriptors as registration-source drift', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sharedSourcePath = 'shared-registrations.ts';
    const localModulePath = 'catalog.local/registration.ts';
    const fallbackSourcePath =
      'src/lib/catalog/worker/local-registration-fallback.ts';
    let sharedTaskQueue = 'shared-catalog-v1';
    const sharedSource = {
      source: { id: 'oss', label: 'OSS' },
      sourceFiles: [sharedSourcePath],
      register: (registry: ReturnType<typeof createCatalogRegistry>) =>
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
    await mkdir(join(rootDirectory, 'catalog.local'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, 'src/lib/catalog/worker'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, fallbackSourcePath),
      'export const fallback = true;\n',
    );
    await writeFile(
      join(rootDirectory, localModulePath),
      `const activity = () => 'local';
export const catalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: ['catalog.local/registration.ts'],
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
      localArtifactPath: 'catalog.local/catalog.generated.json',
    };
    await renderAndInstallArtifacts(options);

    sharedTaskQueue = 'shared-catalog-v2';
    await writeFile(
      join(rootDirectory, sharedSourcePath),
      'export const taskQueue = "shared-catalog-v2";\n',
    );
    const updatedSharedRegistry = createCatalogRegistry();
    sharedSource.register(updatedSharedRegistry);
    await renderAndInstallArtifact({
      rootDirectory,
      sourceFiles: sharedSource.sourceFiles,
      artifactPath: options.sharedArtifactPath,
      registry: updatedSharedRegistry,
      source: sharedSource.source,
    });

    await expect(verifyRenderedArtifacts(options)).rejects.toThrowError(
      'Catalog artifact "catalog.local/catalog.generated.json" is stale because registration sources changed',
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
      const localModulePath = 'catalog.local/registration.ts';
      const fallbackSourcePath =
        'src/lib/catalog/worker/local-registration-fallback.ts';
      const sharedActivity = () => 'shared';
      await writeFile(
        join(rootDirectory, sharedSourcePath),
        'export const shared = true;\n',
      );
      await mkdir(join(rootDirectory, 'catalog.local'), {
        recursive: true,
      });
      await mkdir(join(rootDirectory, 'src/lib/catalog/worker'), {
        recursive: true,
      });
      await writeFile(
        join(rootDirectory, fallbackSourcePath),
        'export const fallback = true;\n',
      );
      await writeFile(
        join(rootDirectory, localModulePath),
        `export const catalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: ['catalog.local/registration.ts'],
  register(registry) {
    ${localRegistration}
  },
};
`,
      );

      await expect(
        renderAndInstallArtifacts({
          rootDirectory,
          sharedSource: {
            source: { id: 'oss', label: 'OSS' },
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
          localArtifactPath: 'catalog.local/catalog.generated.json',
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
      'Duplicate catalog example id "shared-example"',
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
      'Duplicate catalog target id "shared-target"',
    );
    await expectCrossSourceConflict(
      localExample('local-example', 'collidingActivity'),
      'Activity "collidingActivity" has conflicting implementations on target "shared-target"',
      true,
    );
  });

  it('verifies explicit sources, browser isolation, and the static package boundary', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const browserModulePath = 'src/lib/catalog/browser/types.ts';
    const browserCatalogPath = 'src/lib/catalog/browser/catalog.ts';
    const browserArtifactPath =
      'src/lib/catalog/browser/catalog.generated.json';
    const browserTypeScriptArtifactPath =
      'src/lib/catalog/browser/catalog.generated.ts';
    const sharedSourcePath = 'src/lib/catalog/worker/shared-registrations.ts';
    const packageJsonPath = 'package.json';
    await mkdir(join(rootDirectory, 'src/lib/catalog/browser'), {
      recursive: true,
    });
    await mkdir(join(rootDirectory, 'src/lib/catalog/worker'), {
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
        'catalog.local/registration.ts',
        'catalog.local/workflows.ts',
        'catalog.local/catalog.generated.json',
      ],
    };

    await expect(
      verifyCatalogProjectBoundaries(options),
    ).resolves.toBeUndefined();

    await writeFile(
      join(rootDirectory, browserModulePath),
      "import '../../worker/registry';\n",
    );
    await expect(verifyCatalogProjectBoundaries(options)).rejects.toThrowError(
      'Browser catalog files cannot reference Node catalog code or local output',
    );

    await writeFile(
      join(rootDirectory, browserModulePath),
      'export type BrowserOnly = string;\n',
    );
    await writeFile(
      join(rootDirectory, browserModulePath),
      "import 'catalog.local/registration.ts';\n",
    );
    await expect(verifyCatalogProjectBoundaries(options)).rejects.toThrowError(
      'Browser catalog files cannot reference Node catalog code or local output',
    );
    await writeFile(
      join(rootDirectory, browserModulePath),
      'export type BrowserOnly = string;\n',
    );
    await writeFile(
      join(rootDirectory, browserModulePath),
      "import 'catalog.local/workflows.ts';\n",
    );
    await expect(verifyCatalogProjectBoundaries(options)).rejects.toThrowError(
      'Browser catalog files cannot reference Node catalog code or local output',
    );
    await writeFile(
      join(rootDirectory, browserModulePath),
      'export type BrowserOnly = string;\n',
    );
    await expect(
      verifyCatalogProjectBoundaries({
        ...options,
        declaredSourceFiles: ['src/lib/catalog/worker/*.ts'],
      }),
    ).rejects.toThrowError('Catalog source paths must be explicit');
    await expect(
      verifyCatalogProjectBoundaries({
        ...options,
        declaredSourceFiles: ['src/lib/catalog/worker/missing-registration.ts'],
      }),
    ).rejects.toThrowError('Declared catalog source does not exist');

    await writeFile(
      join(rootDirectory, packageJsonPath),
      '{"files":["dist/**/*","catalog.local/**/*"]}\n',
    );
    await expect(verifyCatalogProjectBoundaries(options)).rejects.toThrowError(
      'Package files must exclude local catalog paths',
    );
  });

  it('excludes a populated local overlay from the packed tarball', async () => {
    const packageDirectory = await createExternalTemporaryDirectory();
    const packDirectory = join(packageDirectory, 'packs');
    await mkdir(join(packageDirectory, 'dist/catalog/browser'), {
      recursive: true,
    });
    await mkdir(join(packageDirectory, 'dist/catalog/worker'), {
      recursive: true,
    });
    await mkdir(join(packageDirectory, 'catalog.local'), {
      recursive: true,
    });
    await mkdir(packDirectory);
    await writeFile(
      join(packageDirectory, 'package.json'),
      await readFile('package.json', 'utf8'),
    );
    await writeFile(
      join(packageDirectory, 'dist/catalog/browser/catalog.generated.json'),
      '{"shared":true}\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/catalog/browser/catalog.generated.js'),
      'export const catalogArtifact = { shared: true };\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/catalog/worker/registry.js'),
      'export const sharedBinding = true;\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/catalog/worker/runner.js'),
      'export const runnerKernel = true;\n',
    );
    await writeFile(
      join(packageDirectory, 'dist/catalog/worker/workflows.js'),
      'export {};\n',
    );
    await writeFile(
      join(packageDirectory, 'catalog.local/registration.ts'),
      'export const localSource = true;\n',
    );
    await writeFile(
      join(packageDirectory, 'catalog.local/workflows.ts'),
      'export const localWorkflow = true;\n',
    );
    await writeFile(
      join(packageDirectory, 'catalog.local/catalog.generated.json'),
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
      'package/dist/catalog/browser/catalog.generated.json',
    );
    expect(listing).toContain(
      'package/dist/catalog/browser/catalog.generated.js',
    );
    expect(listing).toContain('package/dist/catalog/worker/registry.js');
    expect(listing).toContain('package/dist/catalog/worker/runner.js');
    expect(listing).toContain('package/dist/catalog/worker/workflows.js');
    expect(listing).not.toContain('catalog.local');
    expect(listing).not.toContain('catalog.local/registration.ts');
    expect(listing).not.toContain('catalog.local/workflows.ts');
    expect(listing).not.toContain('catalog.local/catalog.generated.json');
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
          'src/lib/holocene/copyable',
          'src/lib/io/icon',
          'src/lib/holocene/icon-button.svelte',
          'src/lib/holocene/input/input.svelte',
          'src/lib/holocene/label.svelte',
          'src/lib/holocene/link.svelte',
          'src/lib/holocene/markdown-editor/preview.svelte',
          'src/lib/holocene/portal',
          'src/lib/holocene/progress-bar.svelte',
          'src/lib/holocene/table/table-header-row.svelte',
          'src/lib/holocene/table/table-row.svelte',
          'src/lib/holocene/table/table.svelte',
          'src/lib/holocene/textarea.svelte',
          'src/lib/holocene/tooltip.svelte',
          'src/lib/i18n/index.ts',
          'src/lib/i18n/locales',
          'src/lib/i18n/translate.ts',
          'src/lib/stores/event-view.ts',
          'src/lib/stores/persist-store.ts',
          'src/lib/svelte-mocks/app',
          'src/lib/types/events.ts',
          'src/lib/types/global.ts',
          'src/lib/types/index.ts',
          'src/lib/utilities/copy-to-clipboard.ts',
          'src/lib/utilities/core-provider.ts',
          'src/lib/utilities/dark-mode',
          'src/lib/utilities/encode-uri.ts',
          'src/lib/utilities/format-time.ts',
          'src/lib/utilities/has.ts',
          'src/lib/utilities/is-function.ts',
          'src/lib/utilities/is.ts',
          'src/lib/utilities/parse-with-big-int.ts',
          'src/lib/utilities/pluralize.ts',
          'src/lib/utilities/route-for.ts',
          'src/lib/utilities/to-duration.ts',
          'src/lib/utilities/to-url.ts',
          'src/lib/catalog',
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
      const testDoublesDirectory = join(packageDirectory, 'test-doubles');
      await mkdir(testDoublesDirectory);
      const componentTestDouble = join(
        testDoublesDirectory,
        'component-test-double.svelte',
      );
      await writeFile(
        componentTestDouble,
        [
          '<script module lang="ts">',
          "  export const DAYS = { label: 'day(s)', convert: (value: number) => value * 86_400 };",
          "  export const SECONDS = { label: 'second(s)', convert: (value: number) => value };",
          '  export const DEFAULT_UNITS = [DAYS];',
          '</script>',
          '',
          '<script lang="ts">',
          "  let { attributesToAdd = $bindable([]), content = $bindable(''), input = $bindable(''), value = $bindable('') } = $props();",
          '</script>',
          '',
          '<span data-testid="catalog-component-test-double">{content}{input}{value}{attributesToAdd.length}</span>',
          '',
        ].join('\n'),
      );
      const payloadEncodingTestDouble = join(
        testDoublesDirectory,
        'payload-encoding-test-double.ts',
      );
      await writeFile(
        payloadEncodingTestDouble,
        [
          'export const encodePayloads = async () => null;',
          'export const setSearchAttributes = () => ({});',
          '',
        ].join('\n'),
      );
      await Promise.all(
        [
          'src/lib/components/payload-input.svelte',
          'src/lib/components/workflow/add-search-attributes.svelte',
          'src/lib/holocene/duration-input/duration-input.svelte',
          'src/lib/holocene/markdown-editor/markdown-editor.svelte',
        ].map((targetPath) =>
          mkdir(join(packageDirectory, targetPath, '..'), {
            recursive: true,
          }).then(() =>
            cp(componentTestDouble, join(packageDirectory, targetPath)),
          ),
        ),
      );
      await cp(
        payloadEncodingTestDouble,
        join(packageDirectory, 'src/lib/utilities/encode-payload.ts'),
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
          "import { createCatalogAuthoring } from '@temporalio/ui/catalog/authoring';",
          "import { resolveCatalogRouting } from '@temporalio/ui/catalog/browser/routing';",
          "import { parseCatalogConnectionConfig } from '@temporalio/ui/catalog/worker/connection-config';",
          "import { createCatalogExecutionLogger } from '@temporalio/ui/catalog/worker/workflow-execution-logger';",
          "import { runCatalogDevelopment } from '@temporalio/ui/catalog/worker/development';",
          "import { createCatalogRegistry, generateCatalog } from '@temporalio/ui/catalog/worker/registry';",
          "import { startCatalogRunner } from '@temporalio/ui/catalog/worker/runner';",
          "import { requireCatalogRoutingFromEnvironment } from '@temporalio/ui/catalog/worker/routing-config';",
          "import { catalogRegistrationSource } from '@temporalio/ui/catalog/worker/shared-registrations';",
          "import { hello } from '@temporalio/ui/catalog/worker/workflows';",
          "const workflowsPath = import.meta.resolve('@temporalio/ui/catalog/worker/workflows');",
          'const cloudAuthoring = createCatalogAuthoring({',
          '  rootDirectory: process.cwd(),',
          "  localExamplesPath: 'local-examples',",
          "  trackedExamplesPath: 'tracked-examples',",
          "  generatedPaths: ['generated/catalog.json'],",
          "  graph: { boundaries: { browserPaths: ['generated/catalog.json'], packageJsonPath: 'package.json', workerPaths: ['generated/registration.ts', 'generated/workflows.ts'] }, outputs: [{ consumers: ['browser'], path: 'generated/catalog.json' }, { consumers: ['worker'], path: 'generated/registration.ts' }, { consumers: ['worker'], path: 'generated/workflows.ts' }], sources: [{ examplesPath: 'tracked-examples', id: 'cloud', label: 'Cloud', registrationOutputPath: 'generated/registration.ts', registrationTypePath: 'generated/registration-source.ts' }], targets: [{ defaultNamespace: 'default', defaultTaskQueue: 'cloud-catalog', id: 'cloud-catalog', sourceId: 'cloud', workflowsModulePath: 'generated/workflows.ts' }] },",
          '  loadExamples: () => [],',
          '  parseModuleSpecifiers: () => [],',
          '  scaffold: ({ exampleId }) => [{ path: `local-examples/${exampleId}/example.ts`, content: `export const id = ${JSON.stringify(exampleId)};\\n` }],',
          "  generate: () => [{ path: 'generated/catalog.json', content: '{}\\n' }],",
          '});',
          "if (typeof cloudAuthoring.scaffold !== 'function' || typeof cloudAuthoring.promote !== 'function') throw new Error('Missing authoring lifecycle');",
          "if (typeof startCatalogRunner !== 'function') throw new Error('Missing runner kernel');",
          "if (typeof resolveCatalogRouting !== 'function') throw new Error('Missing routing resolver');",
          "if (typeof parseCatalogConnectionConfig !== 'function') throw new Error('Missing connection configuration parser');",
          "if (typeof createCatalogExecutionLogger !== 'function') throw new Error('Missing workflow execution logger factory');",
          "if (typeof runCatalogDevelopment !== 'function') throw new Error('Missing development runner');",
          "if (typeof createCatalogRegistry !== 'function' || typeof generateCatalog !== 'function') throw new Error('Missing registry generation API');",
          "if (typeof requireCatalogRoutingFromEnvironment !== 'function') throw new Error('Missing routing configuration parser');",
          "if (typeof catalogRegistrationSource.register !== 'function') throw new Error('Missing shared workflow registration source');",
          "if (typeof hello !== 'function') throw new Error('Missing shared workflow export');",
          "if (!workflowsPath.endsWith('/catalog/worker/workflows.js')) throw new Error(`Unexpected workflows path: ${workflowsPath}`);",
          'const workerOptions = [];',
          'const runner = await startCatalogRunner({',
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
          "import { catalog } from '@temporalio/ui/catalog/browser/catalog';",
          "import { resolveCatalogRouting } from '@temporalio/ui/catalog/browser/routing';",
          "if (!Array.isArray(catalog)) throw new Error('Expected a catalog descriptor array');",
          "if (!catalog.every((descriptor) => typeof descriptor.id === 'string' && typeof descriptor.title === 'string')) throw new Error('Expected valid catalog descriptor data');",
          "const [target] = resolveCatalogRouting([{ targetId: 'shared-workflows', namespace: 'default', taskQueue: 'default' }], { 'shared-workflows': { namespace: 'runtime', taskQueue: 'runtime' } });",
          "if (target.namespace !== 'runtime' || target.taskQueue !== 'runtime') throw new Error('Expected injectable catalog routing');",
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
          "import { catalog } from '@temporalio/ui/catalog/browser/catalog';",
          "import { resolveCatalogRouting } from '@temporalio/ui/catalog/browser/routing';",
          "import CatalogDetail from '@temporalio/ui/catalog/browser/catalog-detail.svelte';",
          "import CatalogList from '@temporalio/ui/catalog/browser/catalog-list.svelte';",
          "import { IconAdd } from '@temporalio/ui/io/icon';",
          "const [target] = resolveCatalogRouting([{ targetId: 'shared-workflows', namespace: 'default', taskQueue: 'default' }], { 'shared-workflows': { namespace: 'runtime', taskQueue: 'runtime' } });",
          'document.body.dataset.catalogSize = String(catalog.length);',
          'document.body.dataset.catalogDetail = typeof CatalogDetail;',
          'document.body.dataset.catalogList = typeof CatalogList;',
          'document.body.dataset.catalogNamespace = target.namespace;',
          'document.body.dataset.iconAdd = typeof IconAdd;',
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
      expect(bundles.join('\n')).not.toContain('catalog/worker');
    },
    120_000,
  );

  it(
    'exposes generate and verify pnpm commands with correct exit status',
    async () => {
      const sharedArtifactPath =
        'src/lib/catalog/browser/catalog.generated.json';

      await execFileAsync('pnpm', ['catalog', 'generate']);

      try {
        await expect(
          execFileAsync('pnpm', ['catalog', 'verify']),
        ).resolves.toMatchObject({ stderr: '' });

        const artifact = JSON.parse(await readFile(sharedArtifactPath, 'utf8'));
        artifact.descriptors.push({ manuallyEdited: true });
        await writeFile(
          sharedArtifactPath,
          `${JSON.stringify(artifact, null, 2)}\n`,
        );

        let verifyFailure: unknown;
        try {
          await execFileAsync('pnpm', ['catalog', 'verify']);
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
        await execFileAsync('pnpm', ['catalog', 'generate']);
      }
    },
    catalogCommandTestTimeoutMs,
  );

  it('restarts the worker development entry when the modules it loaded change', async () => {
    const spawned: { args: readonly string[]; command: string }[] = [];
    const listeners = new Map<string, (value: never) => void>();
    const development = runCatalogWorkerDevelopment((command, args) => {
      spawned.push({ args, command });
      return {
        once: (event: string, listener: (value: never) => void) =>
          listeners.set(event, listener),
      } as never;
    });

    listeners.get('exit')?.(0 as never);
    await expect(development).resolves.toBeUndefined();
    expect(spawned).toEqual([
      {
        command: 'pnpm',
        args: [
          'exec',
          'esno',
          '--watch',
          '--watch-preserve-output',
          catalogWorkerEntry,
        ],
      },
    ]);
  });

  it(
    'reports the first worker development preflight failure clearly',
    async () => {
      let commandFailure: unknown;

      try {
        await execFileAsync('pnpm', ['exec', 'esno', catalogWorkerEntry], {
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
    },
    catalogCommandTestTimeoutMs,
  );

  it(
    'reports an unknown selected development target before connecting',
    async () => {
      let commandFailure: unknown;

      try {
        await execFileAsync('pnpm', ['exec', 'esno', catalogWorkerEntry], {
          env: {
            ...process.env,
            TEMPORAL_ADDRESS: 'localhost:7233',
            TEMPORAL_NAMESPACE: 'default',
            CATALOG_TARGET_ID: 'missing-target',
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
      ).toContain('Catalog target "missing-target" was not found');
    },
    catalogCommandTestTimeoutMs,
  );

  it(
    'rejects stale artifacts before development can load or rewrite them',
    async () => {
      const sharedSourcePath = 'src/lib/catalog/worker/shared-registrations.ts';
      const sharedArtifactPath =
        'src/lib/catalog/browser/catalog.generated.json';
      const originalSource = await readFile(sharedSourcePath, 'utf8');

      await execFileAsync('pnpm', ['catalog', 'generate']);
      const generatedArtifactContent = await readFile(
        sharedArtifactPath,
        'utf8',
      );
      await writeFile(sharedSourcePath, `${originalSource}\n`);

      try {
        let commandFailure: unknown;

        try {
          await execFileAsync('pnpm', ['catalog', 'worker'], {
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
        await execFileAsync('pnpm', ['catalog', 'generate']);
      }
    },
    catalogCommandTestTimeoutMs,
  );
});
