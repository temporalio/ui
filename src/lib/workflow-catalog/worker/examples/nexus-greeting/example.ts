import { greetingServiceHandler } from './service.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { WorkflowCatalogExampleRegistration } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: { name: 'Temporal' },
  schema: {
    type: 'object',
    properties: { name: { type: 'string', minLength: 1 } },
    required: ['name'],
    additionalProperties: false,
  },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { operationId: { type: 'string', minLength: 1 } },
  },
};

export const nexusGreetingExample: WorkflowCatalogExampleRegistration = {
  id: 'nexus-greeting',
  title: 'Nexus greeting operation',
  description:
    'Runs a standalone Nexus operation through a declared Nexus endpoint.',
  targetId: 'shared-workflows',
  capabilityTags: ['nexus', 'standalone', 'terminal-outcome'],
  expectedEvidence: [
    'A completed standalone Nexus operation with its returned greeting.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'standalone-nexus-operation',
    endpoint: 'ui-workflow-catalog',
    service: 'workflow-catalog-greeting',
    operation: 'greet',
    handler: greetingServiceHandler,
    policies: { scheduleToClose: '60s' },
  },
};

export const nexusGreetingSourceFiles = [
  'src/lib/workflow-catalog/worker/examples/nexus-greeting/example.ts',
  'src/lib/workflow-catalog/worker/examples/nexus-greeting/service.ts',
] as const;
