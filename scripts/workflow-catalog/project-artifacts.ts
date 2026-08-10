import type { WorkflowCatalogRoutingInput } from './catalog-artifacts';
import {
  loadWorkflowCatalogWorkerBindings,
  renderWorkflowCatalogArtifacts,
  verifyWorkflowCatalogArtifacts,
  verifyWorkflowCatalogProjectBoundaries,
  writeWorkflowCatalogArtifacts,
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
  declaredSourceFiles: [
    ...sharedSource.sourceFiles,
    ...localFallback.sourceFiles,
  ],
  packageJsonPath: 'package.json',
  localPaths: [
    projectOptions.localModulePath,
    projectOptions.localArtifactPath,
  ],
};

export type ProjectWorkflowCatalogArtifactsOptions = {
  sharedSource?: WorkflowCatalogRegistrationSource;
  localSource?: WorkflowCatalogRegistrationSource | null;
};

export const renderProjectWorkflowCatalogArtifacts = async (
  options: ProjectWorkflowCatalogArtifactsOptions = {},
) =>
  renderWorkflowCatalogArtifacts({
    ...projectOptions,
    sharedSource: options.sharedSource ?? sharedSource,
    ...(Object.hasOwn(options, 'localSource')
      ? { localSource: options.localSource }
      : {}),
  });

export const generateProjectWorkflowCatalog = async () => {
  const rendered = await renderProjectWorkflowCatalogArtifacts();

  await writeWorkflowCatalogArtifacts(
    projectOptions.rootDirectory,
    rendered.artifacts,
  );

  return {
    shared: rendered.shared,
    local: rendered.local,
    workerBindings: rendered.workerBindings,
  };
};

export const loadProjectWorkflowCatalogWorkerBindings = (
  routing: WorkflowCatalogRoutingInput = {},
) => loadWorkflowCatalogWorkerBindings(projectOptions, routing);

export const verifyProjectWorkflowCatalogBoundaries = () =>
  verifyWorkflowCatalogProjectBoundaries(projectBoundaryOptions);

export const verifyProjectWorkflowCatalog = async () => {
  await verifyWorkflowCatalogArtifacts(projectOptions);
  await verifyProjectWorkflowCatalogBoundaries();
};
