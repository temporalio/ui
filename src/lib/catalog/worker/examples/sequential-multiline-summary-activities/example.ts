import { recordMultilineActivity } from './activities.js';
import { sequentialMultilineSummaryActivities } from './workflow.js';

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
  id: 'sequential-multiline-summary-activities',
  title: 'Sequential activities with multi-line Markdown summaries',
  description:
    'Runs 20 activities by default with Markdown summaries that alternate between a paragraph break and a hard break.',
  capabilityTags: ['activities', 'sequencing'],
  expectedEvidence: [
    'The configured number of non-overlapping activity executions in deterministic order.',
    'Each activity summary spans two Markdown blocks, and the timeline label stays on one line.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow' as const,
    workflowType: 'sequentialMultilineSummaryActivities',
    workflow: sequentialMultilineSummaryActivities,
    activities: { recordMultilineActivity },
  },
};
