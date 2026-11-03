import { continueAsNewChain } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [5, 2],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Total runs in the chain',
        type: 'integer',
        minimum: 1,
        maximum: 25,
      },
      {
        title: 'Delay per run in seconds',
        type: 'integer',
        minimum: 1,
        maximum: 30,
      },
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
  id: 'continue-as-new',
  title: 'Continue-As-New chain',
  description:
    'Creates a bounded chain of workflow runs with the same Workflow ID and distinct Run IDs, then completes the final run.',
  capabilityTags: ['continue-as-new', 'timers', 'terminal-outcome'],
  expectedEvidence: [
    'Five runs with the same Workflow ID and distinct Run IDs using the default inputs.',
    'The first four runs have Continued-As-New status and link to the next run; the fifth completes.',
    'Each run contains a durable timer and carries its progress into the next run through workflow input.',
    'The final workflow result reports the total number of runs in the chain.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'continueAsNewChain',
    workflow: continueAsNewChain,
    activities: {},
  },
};
