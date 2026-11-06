import type {
  BrowserCatalogDescriptor,
  BrowserCatalogExecution,
  BrowserCatalogSource,
} from './types';

const workspace = {
  workspaceId: 'catalog',
  namespace: 'default',
  taskQueue: 'catalog-tasks',
};

const oss: BrowserCatalogSource = { id: 'oss', label: 'OSS' };

export const testDescriptor = (
  id: string,
  execution: BrowserCatalogExecution,
  capabilityTags: string[] = [],
  source: BrowserCatalogSource = oss,
): BrowserCatalogDescriptor => ({
  id,
  source,
  title: id,
  description: '',
  capabilityTags,
  expectedEvidence: [],
  input: { defaultValue: [], schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution,
});

export const workflowExecution = (
  workflowType = 'Workflow',
): BrowserCatalogExecution => ({
  ...workspace,
  kind: 'workflow',
  workflowType,
});

export const activityExecution: BrowserCatalogExecution = {
  ...workspace,
  kind: 'standalone-activity',
  activityType: 'activity',
  timeouts: {},
  policies: {},
};

export const nexusOperationExecution: BrowserCatalogExecution = {
  ...workspace,
  kind: 'standalone-nexus-operation',
  endpoint: 'catalog-endpoint',
  service: 'service',
  operation: 'operation',
  policies: {},
};
