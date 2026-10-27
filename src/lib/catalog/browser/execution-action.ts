import type { BrowserCatalogExecution } from './types';

export const getCatalogExecutionAction = (
  execution: BrowserCatalogExecution,
) => (execution.kind === 'schedule' ? execution.action : execution);
