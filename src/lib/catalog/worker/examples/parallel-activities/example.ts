import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { processData } from '../shared-activities.js';
import { parallelActivities } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: ['catalog-parallel'],
  schema: {
    type: 'array',
    prefixItems: [{ title: 'Data ID', type: 'string', minLength: 1 }],
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
  id: 'parallel-activities',
  title: 'Parallel activities',
  description: 'Runs three activity commands concurrently.',
  capabilityTags: ['activities', 'concurrency'],
  expectedEvidence: [
    'Three overlapping activity executions and one combined result.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'parallelActivities',
    workflow: parallelActivities,
    activities: { processData },
  },
};
