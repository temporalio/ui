import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
import { processData } from '../shared-activities.js';
import { patchWorkflow } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: ['catalog-patch'],
  schema: {
    type: 'array',
    prefixItems: [{ title: 'Data ID', type: 'string', minLength: 1 }],
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
  id: 'workflow-patching',
  title: 'Workflow patching',
  description: 'Records patch markers around versioned workflow behavior.',
  capabilityTags: ['patching', 'versioning'],
  expectedEvidence: [
    'Patch markers and version-specific result sections in history.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'patchWorkflow',
    workflow: patchWorkflow,
    activities: { processData },
  },
};
