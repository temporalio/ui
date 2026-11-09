import type {
  BrowserCatalogDescriptor,
  BrowserCatalogExecution,
  BrowserCatalogSource,
} from './types';

const target = {
  targetId: 'catalog',
  namespace: 'default',
  taskQueue: 'catalog-tasks',
};

const oss: BrowserCatalogSource = { id: 'oss', label: 'OSS' };

export const testDescriptor = (
  id: string,
  execution: BrowserCatalogExecution,
  capabilityTags: string[] = [],
  source: BrowserCatalogSource = oss,
  patternTags?: string[],
): BrowserCatalogDescriptor => ({
  id,
  source,
  title: id,
  description: '',
  capabilityTags,
  ...(patternTags ? { patternTags } : {}),
  expectedEvidence: [],
  input: { defaultValue: [], schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution,
});

export const workflowExecution = (
  workflowType = 'Workflow',
): BrowserCatalogExecution => ({ ...target, kind: 'workflow', workflowType });

export const activityExecution: BrowserCatalogExecution = {
  ...target,
  kind: 'standalone-activity',
  activityType: 'activity',
  timeouts: {},
  policies: {},
};

export const nexusOperationExecution: BrowserCatalogExecution = {
  ...target,
  kind: 'standalone-nexus-operation',
  endpoint: 'catalog-endpoint',
  service: 'service',
  operation: 'operation',
  policies: {},
};
