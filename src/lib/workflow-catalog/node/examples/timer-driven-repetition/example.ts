import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';
import { processData } from '../shared-activities.js';
import { scheduleWorkflow } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: [2, 3],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Timer interval in seconds',
        type: 'integer',
        minimum: 1,
        maximum: 300,
      },
      { title: 'Run count', type: 'integer', minimum: 1, maximum: 25 },
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

export const timerDrivenRepetitionExample: WorkflowCatalogExampleRegistration =
  {
    id: 'timer-driven-repetition',
    title: 'Timer-driven repeated activities',
    description: 'Uses durable timers between repeated activity commands.',
    targetId: 'shared-workflows',
    capabilityTags: ['timers', 'activities'],
    expectedEvidence: [
      'Timer events separate each repeated activity execution.',
    ],
    input,
    startOptions,
    execution: {
      kind: 'workflow',
      workflowType: 'scheduleWorkflow',
      workflow: scheduleWorkflow,
      activities: { processData },
    },
  };
export const timerDrivenRepetitionSourceFiles = [
  'src/lib/workflow-catalog/node/examples/timer-driven-repetition/example.ts',
  'src/lib/workflow-catalog/node/examples/timer-driven-repetition/workflow.ts',
] as const;
