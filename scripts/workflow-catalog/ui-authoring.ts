import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  composeWorkflowCatalogArtifacts,
  createWorkflowCatalogAuthoring,
  defineWorkflowCatalogArtifact,
  deleteWorkflowCatalogArtifact,
  type WorkflowCatalogAuthoringArtifact,
} from '../../src/lib/workflow-catalog/authoring.js';
import { getProjectRoot } from '../get-project-root.js';
import {
  loadCanonicalWorkflowCatalogRegistrationSource,
  renderCanonicalWorkflowCatalogAssemblies,
} from './canonical-assemblies.js';
import {
  parseWorkflowCatalogTypeScriptModuleSpecifiers,
  planDirectoryWorkflowCatalogPromotion,
} from './directory-promotion.js';
import {
  loadLocalWorkflowCatalogRegistrationSource,
  renderLocalWorkflowCatalogAssemblies,
} from './local-assemblies.js';
import {
  renderProjectWorkflowCatalogArtifacts,
  verifyProjectWorkflowCatalogBoundaries,
} from './project-artifacts.js';
import { renderDirectoryWorkflowCatalogScaffold } from './scaffold.js';

export const uiWorkflowCatalogGeneratedPaths = [
  'workflow-catalog.local/registration.ts',
  'workflow-catalog.local/workflows.ts',
  'workflow-catalog.local/catalog.generated.json',
  'src/lib/workflow-catalog/worker/examples/index.ts',
  'src/lib/workflow-catalog/worker/workflows.ts',
  'src/lib/workflow-catalog/browser/catalog.generated.json',
  'src/lib/workflow-catalog/browser/catalog.generated.ts',
] as const;

export const createUiWorkflowCatalogAuthoring = (
  rootDirectory = getProjectRoot(),
) => {
  let renderGenerated: () => Promise<
    readonly WorkflowCatalogAuthoringArtifact[]
  >;
  return createWorkflowCatalogAuthoring({
    graph: {
      boundaries: {
        browserPaths: [
          'src/lib/workflow-catalog/browser/catalog.generated.json',
          'src/lib/workflow-catalog/browser/catalog.generated.ts',
        ],
        packageJsonPath: 'package.json',
        workerPaths: [
          'src/lib/workflow-catalog/worker/examples/index.ts',
          'src/lib/workflow-catalog/worker/shared-registrations.ts',
          'src/lib/workflow-catalog/worker/workflows.ts',
          'workflow-catalog.local/registration.ts',
          'workflow-catalog.local/workflows.ts',
        ],
      },
      outputs: [
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'workflow-catalog.local/registration.ts',
        },
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'workflow-catalog.local/workflows.ts',
        },
        {
          consumers: ['authoring', 'browser'] as const,
          path: 'workflow-catalog.local/catalog.generated.json',
        },
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'src/lib/workflow-catalog/worker/examples/index.ts',
        },
        {
          consumers: ['authoring', 'worker'] as const,
          path: 'src/lib/workflow-catalog/worker/workflows.ts',
        },
        {
          consumers: ['authoring', 'browser'] as const,
          path: 'src/lib/workflow-catalog/browser/catalog.generated.json',
        },
        {
          consumers: ['authoring', 'browser'] as const,
          path: 'src/lib/workflow-catalog/browser/catalog.generated.ts',
        },
        {
          consumers: ['worker'] as const,
          path: 'src/lib/workflow-catalog/worker/shared-registrations.ts',
        },
      ],
      sources: [
        {
          examplesPath: 'src/lib/workflow-catalog/worker/examples',
          id: 'oss',
          label: 'OSS',
          registrationOutputPath:
            'src/lib/workflow-catalog/worker/shared-registrations.ts',
          registrationTypePath:
            'src/lib/workflow-catalog/worker/registration-source.ts',
        },
        {
          examplesPath: 'workflow-catalog.local/examples',
          id: 'local',
          label: 'Local',
          registrationOutputPath: 'workflow-catalog.local/registration.ts',
          registrationTypePath:
            'src/lib/workflow-catalog/worker/registration-source.ts',
        },
      ],
      targets: [
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'ui-workflow-catalog',
          id: 'shared-workflows',
          sourceId: 'oss',
          workflowsModulePath: 'src/lib/workflow-catalog/worker/workflows.ts',
        },
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'ui-workflow-catalog-local',
          id: 'local-workflows',
          sourceId: 'local',
          workflowsModulePath: 'workflow-catalog.local/workflows.ts',
        },
      ],
    },
    rootDirectory,
    parseModuleSpecifiers: parseWorkflowCatalogTypeScriptModuleSpecifiers,
    localExamplesPath: 'workflow-catalog.local/examples',
    trackedExamplesPath: 'src/lib/workflow-catalog/worker/examples',
    generatedPaths: uiWorkflowCatalogGeneratedPaths,
    scaffold: ({ exampleId }) =>
      renderDirectoryWorkflowCatalogScaffold({ exampleId, rootDirectory }),
    loadExamples: async () => {
      const artifacts = await Promise.all(
        [
          'src/lib/workflow-catalog/browser/catalog.generated.json',
          'workflow-catalog.local/catalog.generated.json',
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
            throw new Error('Workflow catalog descriptor graph is invalid');
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
      planDirectoryWorkflowCatalogPromotion({ exampleId, rootDirectory }),
    generate: (renderGenerated = async () => {
      const local = await renderLocalWorkflowCatalogAssemblies(rootDirectory);
      const localSource =
        await loadLocalWorkflowCatalogRegistrationSource(rootDirectory);
      const localAssemblies = localSource
        ? [
            defineWorkflowCatalogArtifact(
              'workflow-catalog.local/registration.ts',
              local.registration,
            ),
            defineWorkflowCatalogArtifact(
              'workflow-catalog.local/workflows.ts',
              local.workflows,
            ),
          ]
        : [
            deleteWorkflowCatalogArtifact(
              'workflow-catalog.local/registration.ts',
            ),
            deleteWorkflowCatalogArtifact(
              'workflow-catalog.local/workflows.ts',
            ),
          ];
      const [canonicalAssemblies, sharedSource] = await Promise.all([
        renderCanonicalWorkflowCatalogAssemblies(rootDirectory),
        loadCanonicalWorkflowCatalogRegistrationSource(rootDirectory),
      ]);
      const sourceContentOverrides = new Map([
        ...localAssemblies.flatMap((artifact) =>
          artifact.delete ? [] : [[artifact.path, artifact.content] as const],
        ),
        ...canonicalAssemblies.map(
          ({ content, path }) => [path, content] as const,
        ),
      ]);
      const project = await renderProjectWorkflowCatalogArtifacts({
        rootDirectory,
        sharedSource,
        sourceContentOverrides,
        ...(localSource ? { localSource } : { localSource: null }),
      });
      return composeWorkflowCatalogArtifacts(
        localAssemblies,
        canonicalAssemblies.map(({ content, path }) =>
          defineWorkflowCatalogArtifact(path, content),
        ),
        project.artifacts.map(({ artifactPath, content }) =>
          content === null
            ? deleteWorkflowCatalogArtifact(artifactPath)
            : defineWorkflowCatalogArtifact(artifactPath, content),
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
              `Workflow catalog artifact "${artifact.path}" is stale because registration sources changed`,
            );
          }
        }
        throw new Error(
          `Workflow catalog artifact "${artifact.path}" has generated output drift`,
        );
      }
    },
    verify: async () => {
      const [sharedSource, localSource] = await Promise.all([
        loadCanonicalWorkflowCatalogRegistrationSource(rootDirectory),
        loadLocalWorkflowCatalogRegistrationSource(rootDirectory),
      ]);
      await verifyProjectWorkflowCatalogBoundaries({
        rootDirectory,
        sharedSource,
        localSource: localSource ?? null,
      });
    },
  });
};
