import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';
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
export const workflowPatchingExample: WorkflowCatalogExampleRegistration = {
  id: 'workflow-patching',
  title: 'Workflow patching',
  description: 'Records patch markers around versioned workflow behavior.',
  targetId: 'shared-workflows',
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
export const workflowPatchingSourceFiles = [
  'src/lib/workflow-catalog/node/examples/workflow-patching/example.ts',
  'src/lib/workflow-catalog/node/examples/workflow-patching/workflow.ts',
] as const;
