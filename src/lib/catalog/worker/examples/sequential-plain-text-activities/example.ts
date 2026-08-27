import { recordActivity } from './activities.js';
import { sequentialPlainTextActivities } from './workflow.js';

const input = {
  defaultValue: [],
  schema: { type: 'array', items: false, maxItems: 0 },
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
    'Runs 2,000 activities sequentially with an indexed plain-text summary.',
  capabilityTags: ['activities', 'sequencing'],
  expectedEvidence: [
    'Two thousand non-overlapping activity executions in deterministic order.',
    'Activity summaries range from Activity 1 through Activity 2000.',
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
