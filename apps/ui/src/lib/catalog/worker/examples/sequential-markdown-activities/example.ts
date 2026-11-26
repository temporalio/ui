import { logStep } from './activities.js';
import { sequentialMarkdownActivities } from './workflow.js';

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
  id: 'sequential-markdown-activities',
  title: 'Sequential activities with Markdown summaries',
  description:
    'Runs 20 activities by default with Markdown summaries and retries one step three times.',
  capabilityTags: ['activities', 'sequencing', 'retries'],
  expectedEvidence: [
    'The configured number of non-overlapping activity executions in deterministic order.',
    'When included, logging step 10 fails three attempts and succeeds on attempt four.',
    'Each activity summary displays a Logging System link.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow' as const,
    workflowType: 'sequentialMarkdownActivities',
    workflow: sequentialMarkdownActivities,
    activities: { logStep },
  },
};
