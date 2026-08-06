import type { WorkflowCatalogRegistrationSource } from './registration-source';

export const workflowCatalogRegistrationSource: WorkflowCatalogRegistrationSource =
  {
    sourceFiles: ['src/lib/workflow-catalog/node/shared-registrations.ts'],
    register: () => undefined,
  };
