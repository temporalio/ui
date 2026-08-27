import { recordActivityWithoutSummary } from './activities.js';
import { sequentialNoSummaryActivities } from './workflow.js';

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
  id: 'sequential-no-summary-activities',
  title: 'Sequential activities without summaries',
  description: 'Runs 2,000 activities sequentially without summaries.',
  capabilityTags: ['activities', 'sequencing'],
  expectedEvidence: [
    'Two thousand non-overlapping activity executions in deterministic order.',
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
