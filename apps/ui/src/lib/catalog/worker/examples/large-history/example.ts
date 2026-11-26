import { largeHistoryStep } from './activity.js';
import { largeHistory } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [10_000, 100],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Target event count',
        type: 'integer',
        minimum: 1_000,
        maximum: 50_000,
      },
      {
        title: 'Activities per batch',
        type: 'integer',
        minimum: 1,
        maximum: 500,
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
  id: 'large-history',
  title: 'Large event history',
  description:
    'Runs batches of instant activities until the workflow history approaches a target event count, for performance testing with 10k, 25k, or 50k events.',
  capabilityTags: ['event-history', 'activities'],
  expectedEvidence: [
    'A completed workflow whose history length is close to, and never above, the target event count.',
    'The result reports how many activities ran and the final event count.',
  ],
  setupMarkdown: [
    'Set **Target event count** to 10000, 25000, or 50000.',
    '',
    'A default Temporal server terminates a workflow once its history passes about 51,200 events, so the target is capped at 50,000. Larger histories need `limit.historyCount.error` raised in the server dynamic config.',
  ].join('\n'),
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'largeHistory',
    workflow: largeHistory,
    activities: { largeHistoryStep },
  },
};
