import { isUtf8 } from 'node:buffer';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import {
  type FileHandle,
  lstat,
  open,
  readdir,
  readFile,
} from 'node:fs/promises';
import { isAbsolute, join, posix, resolve } from 'node:path';

import {
  type CatalogAuthoringArtifact,
  type CatalogAuthoringFile,
  type CatalogAuthoringLimits,
  composeCatalogArtifacts,
  createCatalogAuthoring,
  defineCatalogArtifact,
  deleteCatalogArtifact,
} from '../../src/lib/catalog/authoring.js';
import { getProjectRoot } from '../get-project-root.js';
import {
  loadCanonicalCatalogRegistrationSource,
  renderCanonicalCatalogAssemblies,
} from './canonical-assemblies.js';
import {
  parseCatalogTypeScriptModuleSpecifiers,
  planDirectoryCatalogPromotion,
} from './directory-promotion.js';
import {
  loadLocalCatalogRegistrationSource,
  renderLocalCatalogAssemblies,
} from './local-assemblies.js';
import {
  renderProjectCatalogArtifacts,
  verifyProjectCatalogBoundaries,
} from './project-artifacts.js';
import { renderDirectoryCatalogScaffold } from './scaffold.js';

export const uiCatalogGeneratedPaths = [
  'catalog.local/registration.ts',
  'catalog.local/workflows.ts',
  'catalog.local/catalog.generated.json',
  'src/lib/catalog/worker/examples/index.ts',
  'src/lib/catalog/worker/workflows.ts',
  'src/lib/catalog/browser/catalog.generated.json',
  'src/lib/catalog/browser/catalog.generated.ts',
] as const;

export const uiCatalogAuthoringLimits = Object.freeze({
  maxDepth: 8,
  maxFileBytes: 256 * 1024,
  maxFiles: 64,
  maxTotalBytes: 1024 * 1024,
} as const) satisfies CatalogAuthoringLimits;

const compareCodePoints = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

const assertDescriptorExampleId = (exampleId: string) => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(exampleId)) {
    throw new Error('Catalog descriptor has an invalid example ID');
  }
};

const isEditableRelativePath = (path: string) =>
  path.length > 0 &&
  !isAbsolute(path) &&
  !path.includes('\\') &&
  !/^[a-z][a-z+.-]*:/i.test(path) &&
  posix.normalize(path) === path &&
  path !== '..' &&
  !path.startsWith('../') &&
  !posix.basename(path).includes('.generated.');

type DirectoryIdentity = {
  dev: number;
  ino: number;
  path: string;
};

const captureRealDirectory = async (
  directory: string,
  error: string,
): Promise<DirectoryIdentity> => {
  const metadata = await lstat(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error(error);
  }
  return { dev: metadata.dev, ino: metadata.ino, path: directory };
};

const assertUnchangedDirectoryChain = async (
  identities: readonly DirectoryIdentity[],
) => {
  // Node has no portable openat2-style API for fd-relative traversal. Identity
  // checks ensure an observed parent replacement is rejected before content is
  // returned. A same-user swap and restore entirely between checks cannot be
  // excluded without platform-specific native code.
  try {
    for (const identity of identities) {
      const current = await captureRealDirectory(
        identity.path,
        'Catalog source tree changed while loading',
      );
      if (current.dev !== identity.dev || current.ino !== identity.ino) {
        throw new Error('Catalog source tree changed while loading');
      }
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Catalog source tree changed while loading'
    ) {
      throw error;
    }
    throw new Error('Catalog source tree changed while loading', {
      cause: error,
    });
  }
};

const captureConfinedSourceRoot = async (
  rootDirectory: string,
  examplesPath: string,
): Promise<DirectoryIdentity[]> => {
  if (
    isAbsolute(examplesPath) ||
    posix.normalize(examplesPath) !== examplesPath ||
    examplesPath === '..' ||
    examplesPath.startsWith('../')
  ) {
    throw new Error('Catalog source root must be confined');
  }
  let directory = resolve(rootDirectory);
  const identities = [
    await captureRealDirectory(
      directory,
      'Catalog source root cannot traverse symbolic links',
    ),
  ];
  for (const component of examplesPath.split('/')) {
    directory = join(directory, component);
    identities.push(
      await captureRealDirectory(
        directory,
        'Catalog source root cannot traverse symbolic links',
      ),
    );
  }
  return identities;
};

const readAtMost = async (handle: FileHandle, maxBytes: number) => {
  const buffer = Buffer.allocUnsafe(maxBytes + 1);
  let offset = 0;
  while (offset < buffer.byteLength) {
    const { bytesRead } = await handle.read(
      buffer,
      offset,
      buffer.byteLength - offset,
      null,
    );
    if (bytesRead === 0) break;
    offset += bytesRead;
  }
  return buffer.subarray(0, offset);
};

const loadExampleSourceFiles = async (
  directory: string,
  relativeDirectory = '',
  totals = { bytes: 0, files: 0 },
  beforeOpenSourceFile?: (path: string) => void | Promise<void>,
  beforeReadSourceFile?: (path: string) => void | Promise<void>,
  ancestorIdentities: readonly DirectoryIdentity[] = [],
  limits: CatalogAuthoringLimits = uiCatalogAuthoringLimits,
): Promise<CatalogAuthoringFile[]> => {
  const directoryIdentity = await captureRealDirectory(
    directory,
    `Catalog source directory must be a real directory: ${directory}`,
  );
  const directoryIdentities = [...ancestorIdentities, directoryIdentity];
  await assertUnchangedDirectoryChain(directoryIdentities);
  const entries = (await readdir(directory, { withFileTypes: true })).sort(
    (left, right) => compareCodePoints(left.name, right.name),
  );
  await assertUnchangedDirectoryChain(directoryIdentities);
  const files: CatalogAuthoringFile[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    const depth = relativePath.split('/').length;
    if (depth > limits.maxDepth) {
      throw new Error(
        `Catalog editable tree exceeds maximum depth of ${limits.maxDepth}: ${relativePath}`,
      );
    }
    if (entry.isDirectory()) {
      files.push(
        ...(await loadExampleSourceFiles(
          path,
          relativePath,
          totals,
          beforeOpenSourceFile,
          beforeReadSourceFile,
          directoryIdentities,
          limits,
        )),
      );
      continue;
    }
    if (!entry.isFile() || !isEditableRelativePath(relativePath)) continue;
    await beforeOpenSourceFile?.(path);
    await assertUnchangedDirectoryChain(directoryIdentities);
    const handle = await open(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    ).catch((error) => {
      if (
        ['ELOOP', 'ENOENT'].includes(
          (error as NodeJS.ErrnoException).code ?? '',
        )
      ) {
        return;
      }
      throw error;
    });
    if (!handle) continue;
    const { buffer, metadata } = await (async () => {
      try {
        const metadata = await handle.stat();
        if (!metadata.isFile()) return { buffer: undefined, metadata };
        if (metadata.size > limits.maxFileBytes) {
          throw new Error(
            `Catalog editable tree exceeds maximum file size of ${limits.maxFileBytes} bytes: ${relativePath}`,
          );
        }
        await beforeReadSourceFile?.(path);
        return {
          buffer: await readAtMost(handle, limits.maxFileBytes),
          metadata,
        };
      } finally {
        await handle.close();
      }
    })();
    await assertUnchangedDirectoryChain(directoryIdentities);
    if (!buffer) continue;
    const currentFileMetadata = await lstat(path).catch(() => undefined);
    if (
      !currentFileMetadata?.isFile() ||
      currentFileMetadata.isSymbolicLink() ||
      currentFileMetadata.dev !== metadata.dev ||
      currentFileMetadata.ino !== metadata.ino
    ) {
      throw new Error('Catalog source tree changed while loading');
    }
    if (!isUtf8(buffer) || buffer.includes(0)) continue;
    if (buffer.byteLength > limits.maxFileBytes) {
      throw new Error(
        `Catalog editable tree exceeds maximum file size of ${limits.maxFileBytes} bytes: ${relativePath}`,
      );
    }
    totals.files += 1;
    if (totals.files > limits.maxFiles) {
      throw new Error(
        `Catalog editable tree exceeds maximum file count of ${limits.maxFiles}`,
      );
    }
    totals.bytes += buffer.byteLength;
    if (totals.bytes > limits.maxTotalBytes) {
      throw new Error(
        `Catalog editable tree exceeds maximum total size of ${limits.maxTotalBytes} bytes`,
      );
    }
    files.push({
      content: buffer.toString('utf8'),
      editable: true,
      mode: metadata.mode & 0o777,
      path: relativePath,
    });
  }
  await assertUnchangedDirectoryChain(directoryIdentities);
  return files;
};

export const createUiCatalogAuthoring = (
  rootDirectory = getProjectRoot(),
  hooks: {
    beforeOpenSourceFile?: (path: string) => void | Promise<void>;
    beforeReadSourceFile?: (path: string) => void | Promise<void>;
  } = {},
) => {
  const loaderLimits = Object.freeze({
    ...uiCatalogAuthoringLimits,
  });
  const sources = [
    {
      examplesPath: 'src/lib/catalog/worker/examples',
      id: 'oss',
      label: 'OSS',
      registrationOutputPath: 'src/lib/catalog/worker/shared-registrations.ts',
      registrationTypePath: 'src/lib/catalog/worker/registration-source.ts',
    },
    {
      examplesPath: 'catalog.local/examples',
      id: 'local',
      label: 'Local',
      registrationOutputPath: 'catalog.local/registration.ts',
      registrationTypePath: 'src/lib/catalog/worker/registration-source.ts',
    },
  ];
  let renderGenerated: () => Promise<readonly CatalogAuthoringArtifact[]>;
  const loadDescriptors = async () => {
    const artifacts = await Promise.all(
      [
        'src/lib/catalog/browser/catalog.generated.json',
        'catalog.local/catalog.generated.json',
      ].map((path) =>
        readFile(join(rootDirectory, path), 'utf8')
          .then((content) => JSON.parse(content) as { descriptors?: unknown[] })
          .catch((error) => {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
            throw error;
          }),
      ),
    );
    return artifacts.flatMap((artifact) =>
      (artifact?.descriptors ?? []).map((descriptor) => {
        const value = descriptor as {
          execution?: { targetId?: unknown; workflowType?: unknown };
          id?: unknown;
          source?: { id?: unknown };
        };
        if (
          typeof value.id !== 'string' ||
          typeof value.source?.id !== 'string' ||
          typeof value.execution?.targetId !== 'string'
        ) {
          throw new Error('Catalog descriptor graph is invalid');
        }
        assertDescriptorExampleId(value.id);
        const source = sources.find(({ id }) => id === value.source?.id);
        if (!source) {
          throw new Error('Catalog descriptor graph is invalid');
        }
        return {
          id: value.id,
          source,
          sourceId: value.source.id,
          targetId: value.execution.targetId,
          workflowType:
            typeof value.execution.workflowType === 'string'
              ? value.execution.workflowType
              : undefined,
        };
      }),
    );
  };
  return createCatalogAuthoring({
    graph: {
      boundaries: {
        browserPaths: [
          'src/lib/catalog/browser/catalog.generated.json',
          'src/lib/catalog/browser/catalog.generated.ts',
        ],
        packageJsonPath: 'package.json',
        workerPaths: [
          'src/lib/catalog/worker/examples/index.ts',
          'src/lib/catalog/worker/shared-registrations.ts',
          'src/lib/catalog/worker/workflows.ts',
          'catalog.local/registration.ts',
          'catalog.local/workflows.ts',
        ],
      },
      outputs: [
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'catalog.local/registration.ts',
        },
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'catalog.local/workflows.ts',
        },
        {
          consumers: ['authoring', 'browser'] as const,
          path: 'catalog.local/catalog.generated.json',
        },
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'src/lib/catalog/worker/examples/index.ts',
        },
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'src/lib/catalog/worker/workflows.ts',
        },
        {
          consumers: ['authoring', 'browser'] as const,
          path: 'src/lib/catalog/browser/catalog.generated.json',
        },
        {
          consumers: ['authoring', 'browser'] as const,
          path: 'src/lib/catalog/browser/catalog.generated.ts',
        },
        {
          consumers: ['worker'] as const,
          path: 'src/lib/catalog/worker/shared-registrations.ts',
        },
      ],
      sources,
      targets: [
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'ui-catalog',
          id: 'shared-workflows',
          sourceId: 'oss',
          workflowsModulePath: 'src/lib/catalog/worker/workflows.ts',
        },
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'ui-catalog-local',
          id: 'local-workflows',
          sourceId: 'local',
          workflowsModulePath: 'catalog.local/workflows.ts',
        },
      ],
    },
    rootDirectory,
    describePromotion: ({ from, to }) => ({
      authoredSource: from,
      destination: { id: 'oss', path: to },
      generatedOutputs: uiCatalogGeneratedPaths.map((path) => ({
        gitEffect: path.startsWith('catalog.local/')
          ? ('ignored-update' as const)
          : ('tracked-update' as const),
        path,
      })),
      gitEffects: {
        destination: 'tracked-addition',
        source: 'ignored-removal',
      },
      source: { id: 'local', path: from },
    }),
    parseModuleSpecifiers: parseCatalogTypeScriptModuleSpecifiers,
    localExamplesPath: 'catalog.local/examples',
    trackedExamplesPath: 'src/lib/catalog/worker/examples',
    generatedPaths: uiCatalogGeneratedPaths,
    scaffold: ({ exampleId }) =>
      renderDirectoryCatalogScaffold({ exampleId, rootDirectory }),
    loadExamples: async () =>
      (await loadDescriptors()).map(
        ({ id, sourceId, targetId, workflowType }) => ({
          id,
          sourceFiles: [],
          sourceId,
          targetId,
          workflowType,
        }),
      ),
    editor: {
      limits: loaderLimits,
      loadExamples: async () =>
        Promise.all(
          (await loadDescriptors()).map(
            async ({ id, source, sourceId, targetId, workflowType }) => {
              const sourceRootIdentities = await captureConfinedSourceRoot(
                rootDirectory,
                source.examplesPath,
              );
              const sourceFiles = await loadExampleSourceFiles(
                join(rootDirectory, source.examplesPath, id),
                '',
                { bytes: 0, files: 0 },
                hooks.beforeOpenSourceFile,
                hooks.beforeReadSourceFile,
                sourceRootIdentities,
                loaderLimits,
              );
              return {
                id,
                sourceFiles,
                sourceId,
                sourceSnapshot: {
                  baseRevision: createHash('sha256')
                    .update(JSON.stringify(sourceFiles))
                    .digest('hex'),
                  limits: { ...loaderLimits },
                },
                targetId,
                workflowType,
              };
            },
          ),
        ),
    },
    validatePromotion: ({ exampleId }) =>
      planDirectoryCatalogPromotion({ exampleId, rootDirectory }),
    generate: (renderGenerated = async () => {
      const local = await renderLocalCatalogAssemblies(rootDirectory);
      const localSource =
        await loadLocalCatalogRegistrationSource(rootDirectory);
      const localAssemblies = localSource
        ? [
            defineCatalogArtifact(
              'catalog.local/registration.ts',
              local.registration,
            ),
            defineCatalogArtifact(
              'catalog.local/workflows.ts',
              local.workflows,
            ),
          ]
        : [
            deleteCatalogArtifact('catalog.local/registration.ts'),
            deleteCatalogArtifact('catalog.local/workflows.ts'),
          ];
      const [canonicalAssemblies, sharedSource] = await Promise.all([
        renderCanonicalCatalogAssemblies(rootDirectory),
        loadCanonicalCatalogRegistrationSource(rootDirectory),
      ]);
      const sourceContentOverrides = new Map([
        ...localAssemblies.flatMap((artifact) =>
          artifact.delete ? [] : [[artifact.path, artifact.content] as const],
        ),
        ...canonicalAssemblies.map(
          ({ content, path }) => [path, content] as const,
        ),
      ]);
      const project = await renderProjectCatalogArtifacts({
        rootDirectory,
        sharedSource,
        sourceContentOverrides,
        ...(localSource ? { localSource } : { localSource: null }),
      });
      return composeCatalogArtifacts(
        localAssemblies,
        canonicalAssemblies.map(({ content, path }) =>
          defineCatalogArtifact(path, content),
        ),
        project.artifacts.map(({ artifactPath, content }) =>
          content === null
            ? deleteCatalogArtifact(artifactPath)
            : defineCatalogArtifact(artifactPath, content),
        ),
      );
    }),
    verifyGenerated: async () => {
      const artifacts = await renderGenerated();
      for (const artifact of artifacts) {
        const actual = await readFile(join(rootDirectory, artifact.path)).catch(
          (error) => {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
            throw error;
          },
        );
        if (
          artifact.delete
            ? actual === undefined
            : actual?.equals(Buffer.from(artifact.content))
        ) {
          continue;
        }
        if (!artifact.delete && actual) {
          const expectedSourceHash =
            /["']?sourceHash["']?\s*:\s*["']([a-f0-9]+)["']/.exec(
              artifact.content.toString(),
            )?.[1];
          const actualSourceHash =
            /["']?sourceHash["']?\s*:\s*["']([a-f0-9]+)["']/.exec(
              actual.toString(),
            )?.[1];
          if (
            expectedSourceHash &&
            actualSourceHash &&
            expectedSourceHash !== actualSourceHash
          ) {
            throw new Error(
              `Catalog artifact "${artifact.path}" is stale because registration sources changed`,
            );
          }
        }
        throw new Error(
          `Catalog artifact "${artifact.path}" has generated output drift`,
        );
      }
    },
    verify: async () => {
      const [sharedSource, localSource] = await Promise.all([
        loadCanonicalCatalogRegistrationSource(rootDirectory),
        loadLocalCatalogRegistrationSource(rootDirectory),
      ]);
      await verifyProjectCatalogBoundaries({
        rootDirectory,
        sharedSource,
        localSource: localSource ?? null,
      });
    },
  });
};
