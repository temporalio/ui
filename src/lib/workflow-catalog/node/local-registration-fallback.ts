import type { WorkflowCatalogRegistrationSource } from './registration-source';

export const workflowCatalogRegistrationSource: WorkflowCatalogRegistrationSource =
  {
    source: { id: 'local', label: 'Local' },
    sourceFiles: [
      'src/lib/workflow-catalog/node/local-registration-fallback.ts',
    ],
    register: () => undefined,
  };
