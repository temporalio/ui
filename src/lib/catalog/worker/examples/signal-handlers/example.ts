import { signalActivity } from './activity.js';
import { signalWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [30],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Signal wait timeout in seconds',
        type: 'integer',
        minimum: 1,
        maximum: 300,
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

export const catalogExample: CatalogExampleDefinition = {
  id: 'signal-handlers',
  title: 'Bounded signal handlers',
  description: 'Handles data and completion signals with bounded waits.',
  capabilityTags: ['signals', 'queries', 'timeouts'],
  expectedEvidence: [
    'Signal events, queryable state changes, and completion or timeout evidence.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'signalWorkflow',
    workflow: signalWorkflow,
    activities: { signalActivity },
  },
};
