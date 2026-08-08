import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';
import { greet } from '../shared-activities.js';
import { hello } from './workflow.js';

const input: RuntimeJsonDocument = {
  defaultValue: ['Temporal'],
  schema: {
    type: 'array',
    prefixItems: [{ title: 'Name', type: 'string', minLength: 1 }],
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

export const helloExample: WorkflowCatalogExampleRegistration = {
  id: 'hello',
  title: 'Hello activity',
  description: 'Runs one activity and returns its greeting.',
  targetId: 'shared-workflows',
  capabilityTags: ['activities', 'terminal-outcome'],
  expectedEvidence: ['One completed activity and a completed workflow result.'],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'hello',
    workflow: hello,
    activities: { greet },
  },
};

export const helloSourceFiles = [
  'src/lib/workflow-catalog/worker/examples/hello/example.ts',
  'src/lib/workflow-catalog/worker/examples/hello/workflow.ts',
] as const;
