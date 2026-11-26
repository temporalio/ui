import { timeoutActivity } from './activity.js';
import { timeoutWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [true],
  schema: {
    type: 'array',
    prefixItems: [{ title: 'Force the activity to time out', type: 'boolean' }],
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
  id: 'activity-timeout',
  title: 'Activity timeout',
  description: 'Demonstrates a start-to-close activity timeout.',
  capabilityTags: ['activities', 'timeouts'],
  expectedEvidence: [
    'A timed-out activity attempt and a workflow result that identifies the timeout.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'timeoutWorkflow',
    workflow: timeoutWorkflow,
    activities: { timeoutActivity },
  },
};
