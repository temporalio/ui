import { retryingActivity, unpolledActivity } from './activity.js';
import { pendingActivitiesWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const activityCountSchema = (title: string) => ({
  title,
  type: 'integer',
  minimum: 0,
  maximum: 10,
});

const input: RuntimeJsonDocument = {
  defaultValue: [2, 2],
  schema: {
    type: 'array',
    prefixItems: [
      activityCountSchema('Retrying activities'),
      activityCountSchema('Unpolled activities'),
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
  id: 'pending-activities',
  title: 'Pending activities',
  description:
    'Keeps several activities pending indefinitely for debugging: some fail and retry forever, others wait on a task queue no Worker polls. Runs until cancelled or terminated.',
  capabilityTags: ['activities', 'retries'],
  expectedEvidence: [
    'Retrying activities stay pending with a growing attempt count, a last failure, and a next retry time.',
    'Unpolled activities stay pending on attempt 1 with no failure because no Worker polls their task queue.',
    'The workflow keeps running until it is cancelled or terminated.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'pendingActivitiesWorkflow',
    workflow: pendingActivitiesWorkflow,
    activities: { retryingActivity, unpolledActivity },
  },
};
