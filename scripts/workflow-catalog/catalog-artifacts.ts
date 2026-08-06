import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';

import { format } from 'prettier';

import type {
  BrowserWorkflowCatalogArtifact,
  BrowserWorkflowCatalogSource,
} from '../../src/lib/workflow-catalog/browser/types';
import type { WorkflowCatalogRegistrationSource } from '../../src/lib/workflow-catalog/node/registration-source';
import {
  createWorkflowCatalogRegistry,
  generateWorkflowCatalog,
  type WorkflowCatalogRegistry,
} from '../../src/lib/workflow-catalog/node/registry';

type WorkflowCatalogArtifactOptions = {
  rootDirectory: string;
  sourceFiles: string[];
  artifactPath: string;
  registry: WorkflowCatalogRegistry;
  source?: BrowserWorkflowCatalogSource;
};

type WorkflowCatalogArtifactsOptions = {
  rootDirectory: string;
  sharedSource: WorkflowCatalogRegistrationSource;
  sharedArtifactPath: string;
  sharedTypeScriptArtifactPath?: string;
  localModulePath: string;
  localFallback: WorkflowCatalogRegistrationSource;
  localArtifactPath: string;
};

type WorkflowCatalogProjectBoundaryOptions = {
  rootDirectory: string;
  browserFiles: string[];
  declaredSourceFiles: string[];
  packageJsonPath: string;
  localPaths: string[];
};

const serializeArtifact = (artifact: BrowserWorkflowCatalogArtifact) =>
  `${JSON.stringify(artifact, null, 2)}\n`;

const typeScriptArtifactPrefix =
  "import type { BrowserWorkflowCatalogArtifact } from './types';\n\n" +
  'export const catalogArtifact: BrowserWorkflowCatalogArtifact = ';

const serializeTypeScriptArtifact = async (
  artifact: BrowserWorkflowCatalogArtifact,
) =>
  format(
    `${typeScriptArtifactPrefix}${serializeArtifact(artifact).trim()};\n`,
    {
      parser: 'typescript',
      singleQuote: true,
    },
  );

const isExplicitRelativePath = (path: string) =>
  path.length > 0 &&
  !isAbsolute(path) &&
  posix.normalize(path) === path &&
  !/[*?[\]{}!]/.test(path);

const verifyDeclaredSourceFiles = async (
  rootDirectory: string,
  sourceFiles: string[],
) => {
  if (sourceFiles.some((path) => !isExplicitRelativePath(path))) {
    throw new Error('Workflow catalog source paths must be explicit');
  }

  for (const sourceFile of sourceFiles) {
    if (!(await pathExists(join(rootDirectory, sourceFile)))) {
      throw new Error(
        `Declared workflow catalog source does not exist: "${sourceFile}"`,
      );
    }
  }
};

const calculateSourceHash = async (
  rootDirectory: string,
  sourceFiles: string[],
) => {
  await verifyDeclaredSourceFiles(rootDirectory, sourceFiles);
  const hash = createHash('sha256');

  for (const sourceFile of [...sourceFiles].sort()) {
    hash.update(sourceFile);
    hash.update('\0');
    hash.update(await readFile(join(rootDirectory, sourceFile)));
    hash.update('\0');
  }

  return hash.digest('hex');
};

const buildWorkflowCatalogArtifact = async ({
  rootDirectory,
  sourceFiles,
  registry,
  source = 'shared',
}: WorkflowCatalogArtifactOptions) => {
  const { browserDescriptors, nodeBindings } =
    generateWorkflowCatalog(registry);
  const artifact: BrowserWorkflowCatalogArtifact = {
    sourceHash: await calculateSourceHash(rootDirectory, sourceFiles),
    descriptors: browserDescriptors.map((descriptor) => ({
      ...descriptor,
      source,
    })),
  };

  return { artifact, nodeBindings };
};

export const generateWorkflowCatalogArtifact = async (
  options: WorkflowCatalogArtifactOptions,
) => {
  const { rootDirectory, artifactPath } = options;
  const generated = await buildWorkflowCatalogArtifact(options);
  const outputPath = join(rootDirectory, artifactPath);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serializeArtifact(generated.artifact));

  return generated;
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
      `Workflow catalog artifact "${options.artifactPath}" has generated output drift`,
    );
  }

  if (currentArtifact.sourceHash !== expected.artifact.sourceHash) {
    throw new Error(
      `Workflow catalog artifact "${options.artifactPath}" is stale because registration sources changed`,
    );
  }

  if (currentContent !== serializeArtifact(expected.artifact)) {
    throw new Error(
      `Workflow catalog artifact "${options.artifactPath}" has generated output drift`,
    );
  }
};

const generateWorkflowCatalogTypeScriptArtifact = async ({
  rootDirectory,
  artifactPath,
  artifact,
}: {
  rootDirectory: string;
  artifactPath: string;
  artifact: BrowserWorkflowCatalogArtifact;
}) => {
  const outputPath = join(rootDirectory, artifactPath);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, await serializeTypeScriptArtifact(artifact));
};

const verifyWorkflowCatalogTypeScriptArtifact = async ({
  rootDirectory,
  sourceFiles,
  artifactPath,
  registry,
}: WorkflowCatalogArtifactOptions) => {
  const expected = await buildWorkflowCatalogArtifact({
    rootDirectory,
    sourceFiles,
    artifactPath,
    registry,
  });
  const currentContent = await readFile(
    join(rootDirectory, artifactPath),
    'utf8',
  );
  const currentSourceHash = /sourceHash:\s*'([a-f0-9]+)'/.exec(
    currentContent,
  )?.[1];

  if (!currentSourceHash) {
    throw new Error(
      `Workflow catalog artifact "${artifactPath}" has generated output drift`,
    );
  }

  if (currentSourceHash !== expected.artifact.sourceHash) {
    throw new Error(
      `Workflow catalog artifact "${artifactPath}" is stale because registration sources changed`,
    );
  }

  if (
    currentContent !== (await serializeTypeScriptArtifact(expected.artifact))
  ) {
    throw new Error(
      `Workflow catalog artifact "${artifactPath}" has generated output drift`,
    );
  }
};

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
      /(?:node:|\/node\/|\.workflow-catalog|local\.generated|local-registration)/.test(
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

export const generateWorkflowCatalogArtifacts = async (
  options: WorkflowCatalogArtifactsOptions,
) => {
  const { shared, local, hasLocalModule, nodeBindings } =
    await createArtifactOptions(options);
  const generateSharedArtifacts = async () => {
    const generatedShared = await generateWorkflowCatalogArtifact(shared);

    if (options.sharedTypeScriptArtifactPath) {
      await generateWorkflowCatalogTypeScriptArtifact({
        rootDirectory: options.rootDirectory,
        artifactPath: options.sharedTypeScriptArtifactPath,
        artifact: generatedShared.artifact,
      });
    }

    return generatedShared;
  };

  if (!hasLocalModule) {
    await rm(join(options.rootDirectory, options.localArtifactPath), {
      force: true,
    });
    const [generatedShared, generatedLocal] = await Promise.all([
      generateSharedArtifacts(),
      buildWorkflowCatalogArtifact(local),
    ]);

    return { shared: generatedShared, local: generatedLocal, nodeBindings };
  }

  const [generatedShared, generatedLocal] = await Promise.all([
    generateSharedArtifacts(),
    generateWorkflowCatalogArtifact(local),
  ]);

  return { shared: generatedShared, local: generatedLocal, nodeBindings };
};

const createArtifactOptions = async (
  options: WorkflowCatalogArtifactsOptions,
) => {
  const localModuleAbsolutePath = join(
    options.rootDirectory,
    options.localModulePath,
  );
  const hasLocalModule = await pathExists(localModuleAbsolutePath);

  const localSource = hasLocalModule
    ? await importLocalRegistrationSource(localModuleAbsolutePath)
    : options.localFallback;
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

  const { nodeBindings } = generateWorkflowCatalog(combinedRegistry);

  const localProjectionRegistry = createWorkflowCatalogRegistry();
  for (const target of combinedRegistry.targets) {
    localProjectionRegistry.registerTarget(target);
  }
  for (const example of localRegistry.examples) {
    localProjectionRegistry.registerExample(example);
  }

  return {
    hasLocalModule,
    nodeBindings,
    shared: {
      rootDirectory: options.rootDirectory,
      sourceFiles: options.sharedSource.sourceFiles,
      artifactPath: options.sharedArtifactPath,
      registry: sharedRegistry,
      source: 'shared' as const,
    },
    local: {
      rootDirectory: options.rootDirectory,
      sourceFiles: [
        ...new Set([
          ...options.sharedSource.sourceFiles,
          ...localSource.sourceFiles,
        ]),
      ].sort(),
      artifactPath: options.localArtifactPath,
      registry: localProjectionRegistry,
      source: 'local' as const,
    },
  };
};

export const loadWorkflowCatalogNodeBindings = async (
  options: WorkflowCatalogArtifactsOptions,
) => (await createArtifactOptions(options)).nodeBindings;

export const verifyWorkflowCatalogArtifacts = async (
  options: WorkflowCatalogArtifactsOptions,
) => {
  const [hasLocalModule, hasLocalArtifact] = await Promise.all([
    pathExists(join(options.rootDirectory, options.localModulePath)),
    pathExists(join(options.rootDirectory, options.localArtifactPath)),
  ]);

  if (hasLocalModule && !hasLocalArtifact) {
    throw new Error(
      'Local workflow catalog registration source exists without its generated artifact',
    );
  }

  if (!hasLocalModule && hasLocalArtifact) {
    throw new Error(
      'Local workflow catalog artifact exists without its registration source',
    );
  }

  const { shared, local } = await createArtifactOptions(options);

  if (!hasLocalModule) {
    await verifyWorkflowCatalogArtifact(shared);
    if (options.sharedTypeScriptArtifactPath) {
      await verifyWorkflowCatalogTypeScriptArtifact({
        ...shared,
        artifactPath: options.sharedTypeScriptArtifactPath,
      });
    }
    return;
  }

  await Promise.all([
    verifyWorkflowCatalogArtifact(shared),
    verifyWorkflowCatalogArtifact(local),
    ...(options.sharedTypeScriptArtifactPath
      ? [
          verifyWorkflowCatalogTypeScriptArtifact({
            ...shared,
            artifactPath: options.sharedTypeScriptArtifactPath,
          }),
        ]
      : []),
  ]);
};
