import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { greet, processData } from '../shared-activities.js';
import { childWorkflowTest } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: [],
  schema: { type: 'array', items: false, maxItems: 0 },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};
export const catalogExample: CatalogExampleDefinition = {
  id: 'child-workflows',
  title: 'Child workflows',
  description: 'Starts and joins three child workflow executions.',
  capabilityTags: ['child-workflows', 'concurrency'],
  expectedEvidence: [
    'Three child workflow relationships and one joined parent result.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'childWorkflowTest',
    workflow: childWorkflowTest,
    activities: { greet, processData },
  },
};
