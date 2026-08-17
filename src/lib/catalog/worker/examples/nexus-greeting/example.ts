import { greetingServiceHandler } from './handler.js';
import { greetingEndpoint } from './service.js';
import { nexusGreeting } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

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
  id: 'nexus-greeting',
  title: 'Nexus greeting',
  description:
    'Calls a Nexus operation from a workflow through a declared Nexus endpoint.',
  capabilityTags: ['nexus', 'terminal-outcome'],
  expectedEvidence: [
    'A completed workflow whose result is the greeting returned by the Nexus operation.',
  ],
  input,
  startOptions,
  setupMarkdown: [
    'The workflow calls the `greet` operation on the `catalog-greeting` service through the `ui-catalog` Nexus endpoint.',
    '',
    '- **Local development:** the catalog worker creates the endpoint automatically when it starts.',
    '- **Other environments:** create the endpoint yourself before running, adjusting the address for your server:',
    '',
    '```',
    'temporal operator nexus endpoint create --name ui-catalog --target-namespace <namespace> --target-task-queue ui-catalog',
    '```',
  ].join('\n'),
  execution: {
    kind: 'workflow',
    workflowType: 'nexusGreeting',
    workflow: nexusGreeting,
    activities: {},
    nexusEndpoints: [greetingEndpoint],
    nexusServices: [greetingServiceHandler],
  },
};
