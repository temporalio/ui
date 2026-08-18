import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { isAbsolute, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';

import { format } from 'prettier';

import { assertCatalogSource } from '../../src/lib/catalog/browser/catalog-sources';
import {
  type CatalogRoutableTarget,
  type CatalogRouting,
  resolveCatalogRouting,
} from '../../src/lib/catalog/browser/routing';
import type {
  BrowserCatalogArtifact,
  BrowserCatalogSource,
} from '../../src/lib/catalog/browser/types';
import type { CatalogRegistrationSource } from '../../src/lib/catalog/worker/registration-source';
import {
  type CatalogRegistry,
  createCatalogRegistry,
  generateCatalog,
} from '../../src/lib/catalog/worker/registry';

export type CatalogSourceContentOverrides = ReadonlyMap<
  string,
  string | Uint8Array
>;

type CatalogArtifactOptions = {
  rootDirectory: string;
  sourceFiles: string[];
  sourceContentOverrides?: CatalogSourceContentOverrides;
  artifactPath: string;
  registry: CatalogRegistry;
  source: BrowserCatalogSource;
};

export type CatalogArtifactsOptions = {
  rootDirectory: string;
  sharedSource: CatalogRegistrationSource;
  sharedArtifactPath: string;
  sharedTypeScriptArtifactPath?: string;
  localModulePath: string;
  localFallback: CatalogRegistrationSource;
  localSource?: CatalogRegistrationSource | null;
  localArtifactPath: string;
  sourceContentOverrides?: CatalogSourceContentOverrides;
};

export type CatalogRenderedArtifact = {
  artifactPath: string;
  content: string | null;
};

type CatalogProjectBoundaryOptions = {
  rootDirectory: string;
  browserFiles: string[];
  declaredSourceFiles: string[];
  packageJsonPath: string;
  localPaths: string[];
};

const serializeArtifact = (artifact: BrowserCatalogArtifact) =>
  format(JSON.stringify(artifact), { parser: 'json' });

const typeScriptArtifactPrefix =
  "import type { BrowserCatalogArtifact } from './types';\n\n" +
  'export const catalogArtifact: BrowserCatalogArtifact = ';

const serializeTypeScriptArtifact = async (artifact: BrowserCatalogArtifact) =>
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
  sourceContentOverrides?: CatalogSourceContentOverrides,
) => {
  if (sourceFiles.some((path) => !isExplicitRelativePath(path))) {
    throw new Error('Catalog source paths must be explicit');
  }

  for (const sourceFile of sourceFiles) {
    if (
      !sourceContentOverrides?.has(sourceFile) &&
      !(await pathExists(join(rootDirectory, sourceFile)))
    ) {
      throw new Error(
        `Declared catalog source does not exist: "${sourceFile}"`,
      );
    }
  }
};

const calculateSourceHash = async (
  rootDirectory: string,
  sourceFiles: string[],
  sourceContentOverrides?: CatalogSourceContentOverrides,
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

const buildCatalogArtifact = async ({
  rootDirectory,
  sourceFiles,
  sourceContentOverrides,
  registry,
  source,
}: CatalogArtifactOptions) => {
  assertCatalogSource(source);
  const { browserDescriptors, workerBindings } = generateCatalog(registry);
  const artifact: BrowserCatalogArtifact = {
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

export const renderCatalogArtifact = async (
  options: CatalogArtifactOptions,
) => {
  const generated = await buildCatalogArtifact(options);

  return {
    generated,
    output: {
      artifactPath: options.artifactPath,
      content: await serializeArtifact(generated.artifact),
    } satisfies CatalogRenderedArtifact,
  };
};

export const verifyCatalogArtifact = async (
  options: CatalogArtifactOptions,
) => {
  const expected = await buildCatalogArtifact(options);
  const currentContent = await readFile(
    join(options.rootDirectory, options.artifactPath),
    'utf8',
  );
  let currentArtifact: BrowserCatalogArtifact;

  try {
    currentArtifact = JSON.parse(currentContent);
  } catch {
    throw new Error(
      `Catalog artifact "${options.artifactPath}" has generated output drift; run "pnpm catalog generate" to rewrite it`,
    );
  }

  if (currentArtifact.sourceHash !== expected.artifact.sourceHash) {
    throw new Error(
      `Catalog artifact "${options.artifactPath}" is stale because registration sources changed; run "pnpm catalog generate" to refresh it`,
    );
  }

  if (currentContent !== (await serializeArtifact(expected.artifact))) {
    throw new Error(
      `Catalog artifact "${options.artifactPath}" has generated output drift; run "pnpm catalog generate" to rewrite it`,
    );
  }
};

const renderCatalogTypeScriptArtifact = async ({
  artifactPath,
  artifact,
}: {
  artifactPath: string;
  artifact: BrowserCatalogArtifact;
}) =>
  ({
    artifactPath,
    content: await serializeTypeScriptArtifact(artifact),
  }) satisfies CatalogRenderedArtifact;

const pathExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

export const verifyCatalogProjectBoundaries = async ({
  rootDirectory,
  browserFiles,
  declaredSourceFiles,
  packageJsonPath,
  localPaths,
}: CatalogProjectBoundaryOptions) => {
  await verifyDeclaredSourceFiles(rootDirectory, [
    ...browserFiles,
    ...declaredSourceFiles,
  ]);

  for (const browserFile of browserFiles) {
    const content = await readFile(join(rootDirectory, browserFile), 'utf8');

    if (
      /(?:node:|\/worker\/|catalog\.local\/(?:registration\.ts|workflows\.ts|catalog\.generated\.json))/.test(
        content,
      )
    ) {
      throw new Error(
        'Browser catalog files cannot reference Node catalog code or local output',
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
    throw new Error('Package files must exclude local catalog paths');
  }
};

const importLocalRegistrationSource = async (absolutePath: string) => {
  const registrationModule = await import(
    /* @vite-ignore */ pathToFileURL(absolutePath).href
  );

  return registrationModule.catalogRegistrationSource as CatalogRegistrationSource;
};

export const renderCatalogArtifacts = async (
  options: CatalogArtifactsOptions,
) => {
  const { shared, local, hasLocalModule, workerBindings } =
    await createArtifactOptions(options);
  const [renderedShared, renderedLocal] = await Promise.all([
    renderCatalogArtifact(shared),
    renderCatalogArtifact(local),
  ]);
  const artifacts: CatalogRenderedArtifact[] = [renderedShared.output];

  if (options.sharedTypeScriptArtifactPath) {
    artifacts.push(
      await renderCatalogTypeScriptArtifact({
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

const createArtifactOptions = async (options: CatalogArtifactsOptions) => {
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
      `Local catalog registration source must declare source ${JSON.stringify(options.localFallback.source)}`,
    );
  }

  const sharedRegistry = createCatalogRegistry();
  const localRegistry = createCatalogRegistry();
  const combinedRegistry = createCatalogRegistry();
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

  const { workerBindings } = generateCatalog(combinedRegistry);

  const localProjectionRegistry = createCatalogRegistry();
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

export type CatalogRoutingInput =
  | CatalogRouting
  | ((targets: readonly CatalogRoutableTarget[]) => CatalogRouting);

export const loadCatalogWorkerBindings = async (
  options: CatalogArtifactsOptions,
  routing: CatalogRoutingInput = {},
) => {
  const { workerBindings } = await createArtifactOptions(options);
  const targets = workerBindings.map(({ target }) => ({
    targetId: target.id,
    namespace: target.namespace,
    taskQueue: target.taskQueue,
  }));
  const resolvedTargets = resolveCatalogRouting(
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
