import { logStep } from './activities.js';
import { sequentialMarkdownActivities } from './workflow.js';

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
  id: 'sequential-markdown-activities',
  title: 'Sequential activities with Markdown summaries',
  description:
    'Runs 2,000 activities sequentially with Markdown summaries and retries one step three times.',
  capabilityTags: ['activities', 'sequencing', 'retries'],
  expectedEvidence: [
    'Two thousand non-overlapping activity executions in deterministic order.',
    'Logging step 10 fails three attempts and succeeds on attempt four.',
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
