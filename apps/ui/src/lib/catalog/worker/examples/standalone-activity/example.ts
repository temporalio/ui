import { standaloneActivity } from './activity.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: { name: 'Temporal' },
  schema: {
    type: 'object',
    properties: { name: { type: 'string', minLength: 1 } },
    required: ['name'],
    additionalProperties: false,
  },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: { type: 'object', properties: {} },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'standalone-activity',
  title: 'Standalone activity',
  description: 'Runs an Activity directly without a Workflow execution.',
  capabilityTags: ['activities', 'standalone', 'terminal-outcome'],
  expectedEvidence: [
    'Standalone Activity details and result are available without a Workflow execution.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'standalone-activity',
    activityType: 'standalone-activity',
    activity: standaloneActivity,
    timeouts: { scheduleToCloseTimeout: '60s', startToCloseTimeout: '30s' },
    policies: { retryPolicy: { maximumAttempts: 3 } },
  },
};
