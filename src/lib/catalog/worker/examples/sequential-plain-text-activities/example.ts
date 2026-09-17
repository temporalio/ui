import { recordActivity } from './activities.js';
import { sequentialPlainTextActivities } from './workflow.js';

const input = {
  defaultValue: [20],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Activity count',
        type: 'integer',
        minimum: 1,
        maximum: 2_000,
      },
    ],
    items: false,
    maxItems: 1,
  },
};

const startOptions = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const catalogExample = {
  id: 'sequential-plain-text-activities',
  title: 'Sequential plain text activities',
  description:
    'Runs 20 activities by default with an indexed plain-text summary.',
  capabilityTags: ['activities', 'sequencing'],
  expectedEvidence: [
    'The configured number of non-overlapping activity executions in deterministic order.',
    'Activity summaries range from Activity 1 through the configured count.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow' as const,
    workflowType: 'sequentialPlainTextActivities',
    workflow: sequentialPlainTextActivities,
    activities: { recordActivity },
  },
};
