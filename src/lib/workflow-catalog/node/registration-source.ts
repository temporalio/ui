import type { WorkflowCatalogRegistry } from './registry';

export type WorkflowCatalogRegistrationSource = {
  sourceFiles: string[];
  register: (registry: WorkflowCatalogRegistry) => void;
};
