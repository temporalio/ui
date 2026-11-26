import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { format, resolveConfig } from 'prettier';

import {
  type CatalogAuthoringArtifact,
  type CatalogAuthoringSource,
  type CatalogAuthoringWorkspace,
  composeCatalogArtifacts,
  createCatalogAuthoring,
  defineCatalogArtifact,
  deleteCatalogArtifact,
  discoverCatalogSource,
  loadCatalogSource,
  renderCatalogSourceAssembly,
} from '../../src/lib/catalog/authoring.js';
import { getProjectRoot } from '../get-project-root.js';
import {
  parseCatalogTypeScriptModuleSpecifiers,
  planDirectoryCatalogPromotion,
} from './directory-promotion.js';
import {
  renderProjectCatalogArtifacts,
  verifyProjectCatalogBoundaries,
} from './project-artifacts.js';
import { renderDirectoryCatalogScaffold } from './scaffold.js';

const registrationModulePath = 'src/lib/catalog/worker/registration-source.ts';
const exampleFiles = {
  example: 'example.ts',
  workflow: 'workflow.ts',
  workspace: 'workspace.ts',
};

const sharedSource: CatalogAuthoringSource = {
  examplesPath: 'src/lib/catalog/worker/examples',
  id: 'oss',
  label: 'OSS',
  registrationOutputPath: 'src/lib/catalog/worker/shared-registrations.ts',
  registrationModulePath,
  files: exampleFiles,
  sourceFiles: [
    'src/lib/catalog/worker/examples/inventory.ts',
    'src/lib/catalog/worker/examples/shared-activities.ts',
  ],
};

const localSource: CatalogAuthoringSource = {
  examplesPath: 'catalog.local/examples',
  id: 'local',
  label: 'Local',
  registrationOutputPath: 'catalog.local/registration.ts',
  registrationModulePath,
  files: exampleFiles,
};

const sharedWorkspace: CatalogAuthoringWorkspace = {
  defaultNamespace: 'default',
  defaultTaskQueue: 'ui-catalog',
  id: 'shared-workflows',
  sourceId: sharedSource.id,
  workflowsModulePath: 'src/lib/catalog/worker/workflows.ts',
};

const localWorkspace: CatalogAuthoringWorkspace = {
  defaultNamespace: 'default',
  defaultTaskQueue: 'ui-catalog-local',
  id: 'local-workflows',
  sourceId: localSource.id,
  workflowsModulePath: 'catalog.local/workflows.ts',
};

export const uiCatalogGeneratedPaths = [
  'catalog.local/registration.ts',
  'catalog.local/workflows.ts',
  'catalog.local/catalog.generated.json',
  'src/lib/catalog/worker/shared-registrations.ts',
  'src/lib/catalog/worker/workflows.ts',
  'src/lib/catalog/browser/catalog.generated.json',
  'src/lib/catalog/browser/catalog.generated.ts',
] as const;

const formatTypeScript = async (
  rootDirectory: string,
  artifact: CatalogAuthoringArtifact,
) => {
  if (artifact.delete) return artifact;
  const prettierConfig =
    (await resolveConfig(join(rootDirectory, 'package.json'))) ?? {};
  return defineCatalogArtifact(
    artifact.path,
    await format(artifact.content.toString(), {
      ...prettierConfig,
      filepath: join(rootDirectory, artifact.path),
      singleQuote: true,
      trailingComma: 'all',
    }),
  );
};

const prepareSource = async (
  rootDirectory: string,
  source: CatalogAuthoringSource,
  workspace: CatalogAuthoringWorkspace,
) => {
  const discovered = await discoverCatalogSource({ rootDirectory, source });
  const [assemblies, registrationSource] = await Promise.all([
    Promise.all(
      renderCatalogSourceAssembly({ discovered, source, workspace }).map(
        (artifact) => formatTypeScript(rootDirectory, artifact),
      ),
    ),
    loadCatalogSource({ discovered, rootDirectory, source, workspace }),
  ]);
  return {
    assemblies,
    registrationSource,
    empty: discovered.folders.length === 0,
  };
};

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
          consumers: ['authoring', 'worker'] as const,
          path: 'src/lib/catalog/worker/shared-registrations.ts',
        },
      ],
      sources: [sharedSource, localSource],
      workspaces: [sharedWorkspace, localWorkspace],
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
            execution?: { workspaceId?: unknown; workflowType?: unknown };
            id?: unknown;
            source?: { id?: unknown };
          };
          if (
            typeof value.id !== 'string' ||
            typeof value.source?.id !== 'string' ||
            typeof value.execution?.workspaceId !== 'string'
          ) {
            throw new Error('Catalog descriptor graph is invalid');
          }
          return {
            id: value.id,
            sourceFiles: [],
            sourceId: value.source.id,
            workspaceId: value.execution.workspaceId,
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
      const [shared, local] = await Promise.all([
        prepareSource(rootDirectory, sharedSource, sharedWorkspace),
        prepareSource(rootDirectory, localSource, localWorkspace),
      ]);
      const localAssemblies = !local.empty
        ? local.assemblies
        : [
            deleteCatalogArtifact(localSource.registrationOutputPath),
            deleteCatalogArtifact(localWorkspace.workflowsModulePath),
          ];
      const assemblies = [...shared.assemblies, ...localAssemblies];
      const project = await renderProjectCatalogArtifacts({
        rootDirectory,
        sharedSource: shared.registrationSource,
        localSource: local.empty ? null : local.registrationSource,
        sourceContentOverrides: new Map(
          assemblies.flatMap((artifact) =>
            artifact.delete ? [] : [[artifact.path, artifact.content] as const],
          ),
        ),
      });
      return composeCatalogArtifacts(
        assemblies,
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
      const [shared, local] = await Promise.all([
        prepareSource(rootDirectory, sharedSource, sharedWorkspace),
        prepareSource(rootDirectory, localSource, localWorkspace),
      ]);
      await verifyProjectCatalogBoundaries({
        rootDirectory,
        sharedSource: shared.registrationSource,
        localSource: local.empty ? null : local.registrationSource,
      });
    },
  });
};
