import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { greet } from '../shared-activities.js';
import { priorityFairnessWorkflow } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: [],
  schema: { type: 'array', items: false, maxItems: 0 },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {
    priority: {
      priorityKey: 1,
      fairnessKey: 'catalog',
      fairnessWeight: 2,
    },
  },
  schema: {
    type: 'object',
    properties: {
      workflowId: { type: 'string', minLength: 1 },
      priority: {
        type: 'object',
        properties: {
          priorityKey: { type: 'integer', minimum: 1 },
          fairnessKey: { type: 'string', minLength: 1 },
          fairnessWeight: { type: 'number', minimum: 0.001, maximum: 1000 },
        },
        required: ['priorityKey', 'fairnessKey', 'fairnessWeight'],
        additionalProperties: false,
      },
    },
    required: ['priority'],
  },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'priority-fairness',
  title: 'Priority and fairness',
  description:
    'Starts a prioritized workflow whose activity inherits its priority.',
  capabilityTags: ['priority-fairness', 'activities'],
  expectedEvidence: [
    'Workflow details show priority and fairness fields; the scheduled activity attributes show inherited priority.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'priorityFairnessWorkflow',
    workflow: priorityFairnessWorkflow,
    activities: { greet },
  },
};
