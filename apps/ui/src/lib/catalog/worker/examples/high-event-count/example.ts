import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { processData } from '../shared-activities.js';
import { highEventCountWorkflow } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: [7, 2000],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Concurrent activity count',
        type: 'integer',
        minimum: 1,
        maximum: 100,
      },
      {
        title: 'Activity delay in milliseconds',
        type: 'integer',
        minimum: 1,
        maximum: 25000,
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
  id: 'high-event-count',
  title: 'High event count',
  description: 'Runs many concurrent activities to produce a dense history.',
  capabilityTags: ['event-history', 'concurrency'],
  expectedEvidence: [
    'A dense group of concurrent activity events in workflow history.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'highEventCountWorkflow',
    workflow: highEventCountWorkflow,
    activities: { processData },
  },
};
