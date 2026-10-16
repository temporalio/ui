import { continueAsNewWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [3],
  schema: {
    type: 'array',
    prefixItems: [
      { title: 'Total runs', type: 'integer', minimum: 1, maximum: 10 },
    ],
    items: false,
    minItems: 1,
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
  id: 'continue-as-new',
  title: 'Continue-as-new run chain',
  description: 'Runs a short timer in each execution before continuing as new.',
  capabilityTags: ['continue-as-new', 'timers', 'event-history'],
  expectedEvidence: [
    'By default, three executions share one workflow ID and have distinct run IDs.',
    'The first two histories end with WorkflowExecutionContinuedAsNew; the final history completes.',
    'Each execution contains a timer lifecycle.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'continueAsNewWorkflow',
    workflow: continueAsNewWorkflow,
    activities: {},
  },
};
