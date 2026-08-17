import { generateSummary, processItem } from './activity.js';
import { signalCollector } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [{ timeoutSeconds: 30, maxItems: 3 }],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Collector configuration',
        type: 'object',
        properties: {
          timeoutSeconds: { type: 'integer', minimum: 1, maximum: 300 },
          maxItems: { type: 'integer', minimum: 1, maximum: 100 },
        },
        additionalProperties: false,
      },
    ],
    items: false,
    maxItems: 1,
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
  id: 'signal-collector',
  title: 'Signal collector',
  description:
    'Collects signaled items before processing and summarizing them.',
  capabilityTags: ['signals', 'activities', 'timeouts'],
  expectedEvidence: [
    'Item signals followed by activity processing and a completion reason.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'signalCollector',
    workflow: signalCollector,
    activities: { generateSummary, processItem },
  },
};
