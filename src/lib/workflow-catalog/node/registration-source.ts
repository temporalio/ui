import type { WorkflowCatalogRegistry } from './registry';
import type { BrowserWorkflowCatalogSource } from '../browser/types';

export type WorkflowCatalogRegistrationSource = {
  source: BrowserWorkflowCatalogSource;
  sourceFiles: string[];
  register: (registry: WorkflowCatalogRegistry) => void;
};
