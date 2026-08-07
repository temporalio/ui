import type { WorkflowCatalogRouting } from '../../src/lib/workflow-catalog/browser/routing';
import { workflowCatalogRegistrationSource as localFallback } from '../../src/lib/workflow-catalog/node/local-registration-fallback';
import { workflowCatalogRegistrationSource as sharedSource } from '../../src/lib/workflow-catalog/node/shared-registrations';
import { getProjectRoot } from '../get-project-root';
import {
  generateWorkflowCatalogArtifacts,
  loadWorkflowCatalogNodeBindings,
  verifyWorkflowCatalogArtifacts,
  verifyWorkflowCatalogProjectBoundaries,
} from './catalog-artifacts';

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
    'src/lib/workflow-catalog/browser/routing.ts',
    'src/lib/workflow-catalog/browser/types.ts',
    'src/lib/workflow-catalog/browser/workbench-host.ts',
    'src/lib/workflow-catalog/browser/execution-log.ts',
    'src/lib/workflow-catalog/browser/workbench.svelte',
    'src/lib/workflow-catalog/browser/catalog.ts',
    'src/lib/workflow-catalog/browser/catalog.generated.json',
    'src/lib/workflow-catalog/browser/catalog.generated.ts',
    'src/lib/workflow-catalog/oss/workbench-host.ts',
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

export const generateProjectWorkflowCatalog = () =>
  generateWorkflowCatalogArtifacts(projectOptions);

export const loadProjectWorkflowCatalogNodeBindings = (
  routing: WorkflowCatalogRouting = {},
) => loadWorkflowCatalogNodeBindings(projectOptions, routing);

export const verifyProjectWorkflowCatalog = async () => {
  await verifyWorkflowCatalogArtifacts(projectOptions);
  await verifyWorkflowCatalogProjectBoundaries(projectBoundaryOptions);
};
