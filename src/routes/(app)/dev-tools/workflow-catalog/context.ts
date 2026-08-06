import { createContext } from 'svelte';

import type { WorkflowCatalogSessionStore } from '$lib/workflow-catalog/browser/session-store';
import type { WorkbenchHost } from '$lib/workflow-catalog/browser/workbench-host';

export type WorkflowCatalogContext = {
  host: WorkbenchHost;
  sessionStore: WorkflowCatalogSessionStore;
};

export const [getWorkflowCatalogContext, setWorkflowCatalogContext] =
  createContext<WorkflowCatalogContext>();
