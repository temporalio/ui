import { timelinePerformanceWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [200],
  schema: {
    type: 'array',
    prefixItems: [
      { title: 'Timer count', type: 'integer', minimum: 1, maximum: 7000 },
    ],
    items: false,
    minItems: 1,
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

/** Catalog workload for profiling paged timeline histories. */
export const catalogExample: CatalogExampleDefinition = {
  id: 'timeline-performance',
  title: 'Timeline performance: many timers',
  description:
    'Creates a long history with short timers run in bounded parallel batches.',
  capabilityTags: ['event-history', 'timers', 'performance'],
  expectedEvidence: [
    'Each timer produces started and fired events; each batch also produces workflow-task events.',
    'Try 200, 2000, then 6000 timers to profile increasingly large paged histories.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'timelinePerformanceWorkflow',
    workflow: timelinePerformanceWorkflow,
    activities: {},
  },
};
