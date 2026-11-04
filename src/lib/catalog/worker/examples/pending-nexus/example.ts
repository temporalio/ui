import { pendingServiceHandler } from './handler.js';
import { pendingEndpoint } from './service.js';
import { pendingNexus } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [3],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Pending operations',
        type: 'integer',
        minimum: 1,
        maximum: 10,
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
  id: 'pending-nexus',
  title: 'Pending Nexus operations',
  description:
    'Starts several Nexus operations that keep retrying, so they stay pending on the workflow indefinitely. Runs until cancelled or terminated.',
  capabilityTags: ['nexus', 'retries', 'concurrency'],
  expectedEvidence: [
    'A running workflow with one pending Nexus operation per requested operation, each showing retry attempts and a last failure.',
    'The workflow keeps running until it is cancelled or terminated.',
  ],
  setupMarkdown: [
    'The workflow calls the `hold` operation on the `catalog-pending` service through the `ui-catalog-pending-nexus` Nexus endpoint.',
    '',
    'The handler always fails with a retryable error, so every operation stays pending until the workflow is cancelled or terminated.',
    '',
    '- **Local development:** the catalog worker creates the endpoint automatically when it starts.',
    '- **Other environments:** create the endpoint yourself before running:',
    '',
    '```',
    'temporal operator nexus endpoint create --name ui-catalog-pending-nexus --target-namespace <namespace> --target-task-queue ui-catalog',
    '```',
  ].join('\n'),
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'pendingNexus',
    workflow: pendingNexus,
    activities: {},
    nexusEndpoints: [pendingEndpoint],
    nexusServices: [pendingServiceHandler],
  },
};
