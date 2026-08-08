import { processLongData } from './activity.js';
import { longActivity } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [5000],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Delay in milliseconds',
        type: 'integer',
        minimum: 1,
        maximum: 25000,
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

export const longActivityExample: WorkflowCatalogExampleRegistration = {
  id: 'long-activity',
  title: 'Long-running activity',
  description: 'Waits inside an activity before returning a result.',
  targetId: 'shared-workflows',
  capabilityTags: ['activities', 'long-running'],
  expectedEvidence: [
    'An activity remains running for the configured delay and then completes.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'longActivity',
    workflow: longActivity,
    activities: { processLongData },
  },
};

export const longActivitySourceFiles = [
  'src/lib/workflow-catalog/worker/examples/long-activity/example.ts',
  'src/lib/workflow-catalog/worker/examples/long-activity/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/long-activity/activity.ts',
] as const;
