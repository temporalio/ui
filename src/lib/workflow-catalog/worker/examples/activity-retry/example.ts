import { retryActivity } from './activity.js';
import { retryWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [2],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Failures before success',
        type: 'integer',
        minimum: 0,
        maximum: 4,
      },
    ],
    items: false,
    maxItems: 1,
  },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const activityRetryExample: WorkflowCatalogExampleRegistration = {
  id: 'activity-retry',
  title: 'Activity retry',
  description: 'Fails deterministic activity attempts before succeeding.',
  targetId: 'shared-workflows',
  capabilityTags: ['activities', 'retries'],
  expectedEvidence: [
    'Failed activity attempts followed by success within the retry policy.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'retryWorkflow',
    workflow: retryWorkflow,
    activities: { retryActivity },
  },
};

export const activityRetrySourceFiles = [
  'src/lib/workflow-catalog/worker/examples/activity-retry/example.ts',
  'src/lib/workflow-catalog/worker/examples/activity-retry/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/activity-retry/activity.ts',
] as const;
