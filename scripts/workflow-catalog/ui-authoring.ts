import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  composeWorkflowCatalogArtifacts,
  createWorkflowCatalogAuthoring,
  defineWorkflowCatalogArtifact,
  deleteWorkflowCatalogArtifact,
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
  assertLocalWorkflowCatalogAssembliesWritable,
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
) =>
  createWorkflowCatalogAuthoring({
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
        {
          defaultNamespace: 'default',
          defaultTaskQueue: 'workflow-catalog',
          id: 'local-catalog',
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
    generate: async () => {
      const local = await renderLocalWorkflowCatalogAssemblies(rootDirectory);
      const currentLocalRegistration = await readFile(
        join(rootDirectory, 'workflow-catalog.local/registration.ts'),
        'utf8',
      ).catch((error) => {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
        throw error;
      });
      const generatedHeader = '// GENERATED FILE. DO NOT EDIT.\n';
      const localSource =
        await loadLocalWorkflowCatalogRegistrationSource(rootDirectory);
      const hasLegacyLocalRegistration =
        currentLocalRegistration !== undefined &&
        !currentLocalRegistration.startsWith(generatedHeader);
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
        : hasLegacyLocalRegistration
          ? []
          : [
              deleteWorkflowCatalogArtifact(
                'workflow-catalog.local/registration.ts',
              ),
              deleteWorkflowCatalogArtifact(
                'workflow-catalog.local/workflows.ts',
              ),
            ];
      if (localSource) {
        await assertLocalWorkflowCatalogAssembliesWritable(rootDirectory);
      }
      const [canonicalAssemblies, sharedSource] = await Promise.all([
        renderCanonicalWorkflowCatalogAssemblies(rootDirectory),
        loadCanonicalWorkflowCatalogRegistrationSource(rootDirectory),
      ]);
      const project = await renderProjectWorkflowCatalogArtifacts({
        sharedSource,
        ...(localSource
          ? { localSource }
          : hasLegacyLocalRegistration
            ? {}
            : { localSource: null }),
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
    },
    verify: () => verifyProjectWorkflowCatalogBoundaries(),
  });
