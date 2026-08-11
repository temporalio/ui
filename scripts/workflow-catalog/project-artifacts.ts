import type {
  WorkflowCatalogRoutingInput,
  WorkflowCatalogSourceContentOverrides,
} from './catalog-artifacts';
import {
  loadWorkflowCatalogWorkerBindings,
  renderWorkflowCatalogArtifacts,
  verifyWorkflowCatalogProjectBoundaries,
} from './catalog-artifacts';
import { workflowCatalogRegistrationSource as localFallback } from '../../src/lib/workflow-catalog/worker/local-registration-fallback';
import type { WorkflowCatalogRegistrationSource } from '../../src/lib/workflow-catalog/worker/registration-source';
import { workflowCatalogRegistrationSource as sharedSource } from '../../src/lib/workflow-catalog/worker/shared-registrations';
import { getProjectRoot } from '../get-project-root';

const projectOptions = {
  rootDirectory: getProjectRoot(),
  sharedSource,
  sharedArtifactPath: 'src/lib/workflow-catalog/browser/catalog.generated.json',
  sharedTypeScriptArtifactPath:
    'src/lib/workflow-catalog/browser/catalog.generated.ts',
  localModulePath: 'workflow-catalog.local/registration.ts',
  localFallback,
  localArtifactPath: 'workflow-catalog.local/catalog.generated.json',
};

const projectBoundaryOptions = {
  rootDirectory: projectOptions.rootDirectory,
  browserFiles: [
    'src/lib/workflow-catalog/browser/catalog-detail.svelte',
    'src/lib/workflow-catalog/browser/catalog-list.svelte',
    'src/lib/workflow-catalog/browser/routing.ts',
    'src/lib/workflow-catalog/browser/readiness-loader.ts',
    'src/lib/workflow-catalog/browser/session-presentation.ts',
    'src/lib/workflow-catalog/browser/start-example.ts',
    'src/lib/workflow-catalog/browser/types.ts',
    'src/lib/workflow-catalog/browser/workbench-host.ts',
    'src/lib/workflow-catalog/browser/execution-log.ts',
    'src/lib/workflow-catalog/browser/catalog.ts',
    'src/lib/workflow-catalog/browser/catalog.generated.json',
    'src/lib/workflow-catalog/browser/catalog.generated.ts',
    'src/lib/workflow-catalog/host/workbench-host.ts',
  ],
  packageJsonPath: 'package.json',
  localPaths: [
    projectOptions.localModulePath,
    projectOptions.localArtifactPath,
  ],
};

export type ProjectWorkflowCatalogArtifactsOptions = {
  rootDirectory?: string;
  sharedSource?: WorkflowCatalogRegistrationSource;
  localSource?: WorkflowCatalogRegistrationSource | null;
  sourceContentOverrides?: WorkflowCatalogSourceContentOverrides;
};

export type ProjectWorkflowCatalogBoundaryOptions = Pick<
  ProjectWorkflowCatalogArtifactsOptions,
  'localSource' | 'rootDirectory' | 'sharedSource'
>;

export const renderProjectWorkflowCatalogArtifacts = async (
  options: ProjectWorkflowCatalogArtifactsOptions = {},
) =>
  renderWorkflowCatalogArtifacts({
    ...projectOptions,
    rootDirectory: options.rootDirectory ?? projectOptions.rootDirectory,
    sharedSource: options.sharedSource ?? sharedSource,
    sourceContentOverrides: options.sourceContentOverrides,
    ...(Object.hasOwn(options, 'localSource')
      ? { localSource: options.localSource }
      : {}),
  });

export const loadProjectWorkflowCatalogWorkerBindings = (
  routing: WorkflowCatalogRoutingInput = {},
) => loadWorkflowCatalogWorkerBindings(projectOptions, routing);

export const verifyProjectWorkflowCatalogBoundaries = (
  options: ProjectWorkflowCatalogBoundaryOptions = {},
) =>
  verifyWorkflowCatalogProjectBoundaries({
    ...projectBoundaryOptions,
    rootDirectory: options.rootDirectory ?? projectOptions.rootDirectory,
    declaredSourceFiles: [
      ...new Set([
        ...(options.sharedSource ?? sharedSource).sourceFiles,
        ...localFallback.sourceFiles,
        ...(options.localSource?.sourceFiles ?? []),
      ]),
    ],
  });
