import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { processData } from '../shared-activities.js';
import { localActivityWorkflow } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: ['catalog-local'],
  schema: {
    type: 'array',
    prefixItems: [{ title: 'Input data', type: 'string', minLength: 1 }],
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
  id: 'local-activity',
  title: 'Local activity',
  description: 'Runs activity code in the workflow worker process.',
  capabilityTags: ['local-activities', 'activities'],
  expectedEvidence: ['A local activity marker and completed workflow result.'],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'localActivityWorkflow',
    workflow: localActivityWorkflow,
    activities: { processData },
  },
};
