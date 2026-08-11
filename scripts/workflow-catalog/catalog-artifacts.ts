import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { isAbsolute, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';

import { format } from 'prettier';

import { assertWorkflowCatalogSource } from '../../src/lib/workflow-catalog/browser/catalog-sources';
import {
  resolveWorkflowCatalogRouting,
  type WorkflowCatalogRoutableTarget,
  type WorkflowCatalogRouting,
} from '../../src/lib/workflow-catalog/browser/routing';
import type {
  BrowserWorkflowCatalogArtifact,
  BrowserWorkflowCatalogSource,
} from '../../src/lib/workflow-catalog/browser/types';
import type { WorkflowCatalogRegistrationSource } from '../../src/lib/workflow-catalog/worker/registration-source';
import {
  createWorkflowCatalogRegistry,
  generateWorkflowCatalog,
  type WorkflowCatalogRegistry,
} from '../../src/lib/workflow-catalog/worker/registry';

export type WorkflowCatalogSourceContentOverrides = ReadonlyMap<
  string,
  string | Uint8Array
>;

type WorkflowCatalogArtifactOptions = {
  rootDirectory: string;
  sourceFiles: string[];
  sourceContentOverrides?: WorkflowCatalogSourceContentOverrides;
  artifactPath: string;
  registry: WorkflowCatalogRegistry;
  source: BrowserWorkflowCatalogSource;
};

export type WorkflowCatalogArtifactsOptions = {
  rootDirectory: string;
  sharedSource: WorkflowCatalogRegistrationSource;
  sharedArtifactPath: string;
  sharedTypeScriptArtifactPath?: string;
  localModulePath: string;
  localFallback: WorkflowCatalogRegistrationSource;
  localSource?: WorkflowCatalogRegistrationSource | null;
  localArtifactPath: string;
  sourceContentOverrides?: WorkflowCatalogSourceContentOverrides;
};

export type WorkflowCatalogRenderedArtifact = {
  artifactPath: string;
  content: string | null;
};

type WorkflowCatalogProjectBoundaryOptions = {
  rootDirectory: string;
  browserFiles: string[];
  declaredSourceFiles: string[];
  packageJsonPath: string;
  localPaths: string[];
};

const serializeArtifact = (artifact: BrowserWorkflowCatalogArtifact) =>
  format(JSON.stringify(artifact), { parser: 'json' });

const typeScriptArtifactPrefix =
  "import type { BrowserWorkflowCatalogArtifact } from './types';\n\n" +
  'export const catalogArtifact: BrowserWorkflowCatalogArtifact = ';

const serializeTypeScriptArtifact = async (
  artifact: BrowserWorkflowCatalogArtifact,
) =>
  format(`${typeScriptArtifactPrefix}${JSON.stringify(artifact)};\n`, {
    parser: 'typescript',
    singleQuote: true,
  });

const isExplicitRelativePath = (path: string) =>
  path.length > 0 &&
  !isAbsolute(path) &&
  posix.normalize(path) === path &&
  !/[*?[\]{}!]/.test(path);

const verifyDeclaredSourceFiles = async (
  rootDirectory: string,
  sourceFiles: string[],
  sourceContentOverrides?: WorkflowCatalogSourceContentOverrides,
) => {
  if (sourceFiles.some((path) => !isExplicitRelativePath(path))) {
    throw new Error('Workflow catalog source paths must be explicit');
  }

  for (const sourceFile of sourceFiles) {
    if (
      !sourceContentOverrides?.has(sourceFile) &&
      !(await pathExists(join(rootDirectory, sourceFile)))
    ) {
      throw new Error(
        `Declared workflow catalog source does not exist: "${sourceFile}"`,
      );
    }
  }
};

const calculateSourceHash = async (
  rootDirectory: string,
  sourceFiles: string[],
  sourceContentOverrides?: WorkflowCatalogSourceContentOverrides,
) => {
  await verifyDeclaredSourceFiles(
    rootDirectory,
    sourceFiles,
    sourceContentOverrides,
  );
  const hash = createHash('sha256');

  for (const sourceFile of [...sourceFiles].sort()) {
    hash.update(sourceFile);
    hash.update('\0');
    hash.update(
      sourceContentOverrides?.get(sourceFile) ??
        (await readFile(join(rootDirectory, sourceFile))),
    );
    hash.update('\0');
  }

  return hash.digest('hex');
};

const buildWorkflowCatalogArtifact = async ({
  rootDirectory,
  sourceFiles,
  sourceContentOverrides,
  registry,
  source,
}: WorkflowCatalogArtifactOptions) => {
  assertWorkflowCatalogSource(source);
  const { browserDescriptors, workerBindings } =
    generateWorkflowCatalog(registry);
  const artifact: BrowserWorkflowCatalogArtifact = {
    sourceHash: await calculateSourceHash(
      rootDirectory,
      sourceFiles,
      sourceContentOverrides,
    ),
    descriptors: browserDescriptors.map((descriptor) => ({
      ...descriptor,
      source,
    })),
  };

  return { artifact, workerBindings };
};

export const renderWorkflowCatalogArtifact = async (
  options: WorkflowCatalogArtifactOptions,
) => {
  const generated = await buildWorkflowCatalogArtifact(options);

  return {
    generated,
    output: {
      artifactPath: options.artifactPath,
      content: await serializeArtifact(generated.artifact),
    } satisfies WorkflowCatalogRenderedArtifact,
  };
};

export const verifyWorkflowCatalogArtifact = async (
  options: WorkflowCatalogArtifactOptions,
) => {
  const expected = await buildWorkflowCatalogArtifact(options);
  const currentContent = await readFile(
    join(options.rootDirectory, options.artifactPath),
    'utf8',
  );
  let currentArtifact: BrowserWorkflowCatalogArtifact;

  try {
    currentArtifact = JSON.parse(currentContent);
  } catch {
    throw new Error(
      `Workflow catalog artifact "${options.artifactPath}" has generated output drift; run "pnpm workflow-catalog generate" to rewrite it`,
    );
  }

  if (currentArtifact.sourceHash !== expected.artifact.sourceHash) {
    throw new Error(
      `Workflow catalog artifact "${options.artifactPath}" is stale because registration sources changed; run "pnpm workflow-catalog generate" to refresh it`,
    );
  }

  if (currentContent !== (await serializeArtifact(expected.artifact))) {
    throw new Error(
      `Workflow catalog artifact "${options.artifactPath}" has generated output drift; run "pnpm workflow-catalog generate" to rewrite it`,
    );
  }
};

const renderWorkflowCatalogTypeScriptArtifact = async ({
  artifactPath,
  artifact,
}: {
  artifactPath: string;
  artifact: BrowserWorkflowCatalogArtifact;
}) =>
  ({
    artifactPath,
    content: await serializeTypeScriptArtifact(artifact),
  }) satisfies WorkflowCatalogRenderedArtifact;

const pathExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

export const verifyWorkflowCatalogProjectBoundaries = async ({
  rootDirectory,
  browserFiles,
  declaredSourceFiles,
  packageJsonPath,
  localPaths,
}: WorkflowCatalogProjectBoundaryOptions) => {
  await verifyDeclaredSourceFiles(rootDirectory, [
    ...browserFiles,
    ...declaredSourceFiles,
  ]);

  for (const browserFile of browserFiles) {
    const content = await readFile(join(rootDirectory, browserFile), 'utf8');

    if (
      /(?:node:|\/worker\/|workflow-catalog\.local\/(?:registration\.ts|workflows\.ts|catalog\.generated\.json))/.test(
        content,
      )
    ) {
      throw new Error(
        'Browser workflow catalog files cannot reference Node catalog code or local output',
      );
    }
  }

  const packageJson = JSON.parse(
    await readFile(join(rootDirectory, packageJsonPath), 'utf8'),
  ) as { files?: unknown };
  const packageFiles = packageJson.files;

  if (
    !Array.isArray(packageFiles) ||
    !packageFiles.some((path) => path === 'dist/**/*') ||
    packageFiles.some(
      (path) =>
        typeof path !== 'string' ||
        (!path.startsWith('!') && !path.startsWith('dist/')),
    ) ||
    localPaths.some((path) => path.startsWith('src/lib/'))
  ) {
    throw new Error('Package files must exclude local workflow catalog paths');
  }
};

const importLocalRegistrationSource = async (absolutePath: string) => {
  const registrationModule = await import(
    /* @vite-ignore */ pathToFileURL(absolutePath).href
  );

  return registrationModule.workflowCatalogRegistrationSource as WorkflowCatalogRegistrationSource;
};

export const renderWorkflowCatalogArtifacts = async (
  options: WorkflowCatalogArtifactsOptions,
) => {
  const { shared, local, hasLocalModule, workerBindings } =
    await createArtifactOptions(options);
  const [renderedShared, renderedLocal] = await Promise.all([
    renderWorkflowCatalogArtifact(shared),
    renderWorkflowCatalogArtifact(local),
  ]);
  const artifacts: WorkflowCatalogRenderedArtifact[] = [renderedShared.output];

  if (options.sharedTypeScriptArtifactPath) {
    artifacts.push(
      await renderWorkflowCatalogTypeScriptArtifact({
        artifactPath: options.sharedTypeScriptArtifactPath,
        artifact: renderedShared.generated.artifact,
      }),
    );
  }

  artifacts.push(
    hasLocalModule
      ? renderedLocal.output
      : { artifactPath: options.localArtifactPath, content: null },
  );

  return {
    shared: renderedShared.generated,
    local: renderedLocal.generated,
    workerBindings,
    artifacts,
  };
};

const createArtifactOptions = async (
  options: WorkflowCatalogArtifactsOptions,
) => {
  const localModuleAbsolutePath = join(
    options.rootDirectory,
    options.localModulePath,
  );
  const hasLocalModule =
    options.localSource === undefined
      ? await pathExists(localModuleAbsolutePath)
      : options.localSource !== null;

  const localSource =
    options.localSource === undefined
      ? hasLocalModule
        ? await importLocalRegistrationSource(localModuleAbsolutePath)
        : options.localFallback
      : (options.localSource ?? options.localFallback);

  if (
    hasLocalModule &&
    (localSource.source?.id !== options.localFallback.source.id ||
      localSource.source?.label !== options.localFallback.source.label)
  ) {
    throw new Error(
      `Local workflow catalog registration source must declare source ${JSON.stringify(options.localFallback.source)}`,
    );
  }

  const sharedRegistry = createWorkflowCatalogRegistry();
  const localRegistry = createWorkflowCatalogRegistry();
  const combinedRegistry = createWorkflowCatalogRegistry();
  options.sharedSource.register(sharedRegistry);
  localSource.register(localRegistry);

  for (const registry of [sharedRegistry, localRegistry]) {
    for (const target of registry.targets) {
      combinedRegistry.registerTarget(target);
    }
    for (const example of registry.examples) {
      combinedRegistry.registerExample(example);
    }
  }

  const { workerBindings } = generateWorkflowCatalog(combinedRegistry);

  const localProjectionRegistry = createWorkflowCatalogRegistry();
  for (const target of combinedRegistry.targets) {
    localProjectionRegistry.registerTarget(target);
  }
  for (const example of localRegistry.examples) {
    localProjectionRegistry.registerExample(example);
  }

  return {
    hasLocalModule,
    workerBindings,
    shared: {
      rootDirectory: options.rootDirectory,
      sourceFiles: options.sharedSource.sourceFiles,
      sourceContentOverrides: options.sourceContentOverrides,
      artifactPath: options.sharedArtifactPath,
      registry: sharedRegistry,
      source: options.sharedSource.source,
    },
    local: {
      rootDirectory: options.rootDirectory,
      sourceFiles: [
        ...new Set([
          ...options.sharedSource.sourceFiles,
          ...localSource.sourceFiles,
        ]),
      ].sort(),
      sourceContentOverrides: options.sourceContentOverrides,
      artifactPath: options.localArtifactPath,
      registry: localProjectionRegistry,
      source: localSource.source,
    },
  };
};

export type WorkflowCatalogRoutingInput =
  | WorkflowCatalogRouting
  | ((
      targets: readonly WorkflowCatalogRoutableTarget[],
    ) => WorkflowCatalogRouting);

export const loadWorkflowCatalogWorkerBindings = async (
  options: WorkflowCatalogArtifactsOptions,
  routing: WorkflowCatalogRoutingInput = {},
) => {
  const { workerBindings } = await createArtifactOptions(options);
  const targets = workerBindings.map(({ target }) => ({
    targetId: target.id,
    namespace: target.namespace,
    taskQueue: target.taskQueue,
  }));
  const resolvedTargets = resolveWorkflowCatalogRouting(
    targets,
    typeof routing === 'function' ? routing(targets) : routing,
  );

  return workerBindings.map((binding, index) => ({
    ...binding,
    target: {
      ...binding.target,
      namespace: resolvedTargets[index].namespace,
      taskQueue: resolvedTargets[index].taskQueue,
    },
  }));
};
