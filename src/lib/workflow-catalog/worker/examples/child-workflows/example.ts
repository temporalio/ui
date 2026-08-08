import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';
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
export const childWorkflowsExample: WorkflowCatalogExampleRegistration = {
  id: 'child-workflows',
  title: 'Child workflows',
  description: 'Starts and joins three child workflow executions.',
  targetId: 'shared-workflows',
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
export const childWorkflowsSourceFiles = [
  'src/lib/workflow-catalog/worker/examples/child-workflows/example.ts',
  'src/lib/workflow-catalog/worker/examples/child-workflows/workflow.ts',
] as const;
