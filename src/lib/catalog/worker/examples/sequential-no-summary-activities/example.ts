import { recordActivityWithoutSummary } from './activities.js';
import { sequentialNoSummaryActivities } from './workflow.js';

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
  id: 'sequential-no-summary-activities',
  title: 'Sequential activities without summaries',
  description: 'Runs 20 activities by default without summaries.',
  capabilityTags: ['activities', 'sequencing'],
  expectedEvidence: [
    'The configured number of non-overlapping activity executions in deterministic order.',
    'Activity timeline entries do not display summaries.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow' as const,
    workflowType: 'sequentialNoSummaryActivities',
    workflow: sequentialNoSummaryActivities,
    activities: { recordActivityWithoutSummary },
  },
};
