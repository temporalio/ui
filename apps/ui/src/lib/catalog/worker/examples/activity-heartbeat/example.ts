import { heartbeatActivity } from './activity.js';
import { heartbeatWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [5, 1000],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Heartbeat steps',
        type: 'integer',
        minimum: 1,
        maximum: 25,
      },
      {
        title: 'Step delay in milliseconds',
        type: 'integer',
        minimum: 1,
        maximum: 1000,
      },
    ],
    items: false,
    maxItems: 2,
  },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'activity-heartbeat',
  title: 'Activity heartbeats',
  description: 'Reports progress while an activity processes several steps.',
  capabilityTags: ['activities', 'heartbeats'],
  expectedEvidence: [
    'Heartbeat details advance through the configured number of steps.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'heartbeatWorkflow',
    workflow: heartbeatWorkflow,
    activities: { heartbeatActivity },
  },
};
