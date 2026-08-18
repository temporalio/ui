import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { processData } from '../shared-activities.js';
import { sequentialActivities } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: ['catalog-sequential'],
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
  id: 'sequential-activities',
  title: 'Sequential activities',
  description: 'Runs three activity commands one after another.',
  capabilityTags: ['activities', 'sequencing'],
  expectedEvidence: [
    'Three non-overlapping activity executions in deterministic order.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'sequentialActivities',
    workflow: sequentialActivities,
    activities: { processData },
  },
};
