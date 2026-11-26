import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';
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

export const catalogExample: CatalogExampleDefinition = {
  id: 'hello',
  title: 'Hello activity',
  description: 'Runs one activity and returns its greeting.',
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
