import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  type CatalogAuthoringArtifact,
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

export const createUiCatalogAuthoring = (rootDirectory = getProjectRoot()) => {
  let renderGenerated: () => Promise<readonly CatalogAuthoringArtifact[]>;
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
      sources: [
        {
          examplesPath: 'src/lib/catalog/worker/examples',
          id: 'oss',
          label: 'OSS',
          registrationOutputPath:
            'src/lib/catalog/worker/shared-registrations.ts',
          registrationTypePath: 'src/lib/catalog/worker/registration-source.ts',
        },
        {
          examplesPath: 'catalog.local/examples',
          id: 'local',
          label: 'Local',
          registrationOutputPath: 'catalog.local/registration.ts',
          registrationTypePath: 'src/lib/catalog/worker/registration-source.ts',
        },
      ],
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
    parseModuleSpecifiers: parseCatalogTypeScriptModuleSpecifiers,
    localExamplesPath: 'catalog.local/examples',
    trackedExamplesPath: 'src/lib/catalog/worker/examples',
    generatedPaths: uiCatalogGeneratedPaths,
    scaffold: ({ exampleId }) =>
      renderDirectoryCatalogScaffold({ exampleId, rootDirectory }),
    loadExamples: async () => {
      const artifacts = await Promise.all(
        [
          'src/lib/catalog/browser/catalog.generated.json',
          'catalog.local/catalog.generated.json',
        ].map((path) =>
          readFile(join(rootDirectory, path), 'utf8')
            .then(
              (content) => JSON.parse(content) as { descriptors?: unknown[] },
            )
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
          return {
            id: value.id,
            sourceFiles: [],
            sourceId: value.source.id,
            targetId: value.execution.targetId,
            workflowType:
              typeof value.execution.workflowType === 'string'
                ? value.execution.workflowType
                : undefined,
          };
        }),
      );
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
