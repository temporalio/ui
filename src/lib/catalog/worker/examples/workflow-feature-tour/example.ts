import { featureTourActivity } from './activity.js';
import { featureTourServiceHandler } from './handler.js';
import { featureTourEndpoint } from './service.js';
import { featureTourWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [10],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Timer duration in seconds',
        type: 'integer',
        minimum: 1,
        maximum: 300,
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
  id: 'workflow-feature-tour',
  title: 'Workflow feature tour',
  description:
    'Runs an activity, a timer, a child workflow, and a Nexus operation, accepts updates, and stays open until a close signal arrives.',
  capabilityTags: [
    'activities',
    'timers',
    'child-workflows',
    'nexus',
    'updates',
    'signals',
  ],
  expectedEvidence: [
    'An activity, a fired timer, a completed child workflow, and a completed Nexus operation in workflow history.',
    'Accepted and completed update events for each `add-note` update sent.',
    'A `close` signal followed by workflow completion.',
  ],
  setupMarkdown: [
    'The workflow runs every step on its own, then waits for a signal before it completes.',
    '',
    '1. Optionally send one or more **updates** named `add-note` with a non-empty string, for example `"hello"`. Updates are accepted at any point while the workflow is running.',
    '2. Send a **signal** named `close` with no input to complete the workflow.',
    '',
    'The Nexus operation calls the `echo` operation on the `catalog-feature-tour` service through the `ui-catalog` endpoint, which the catalog worker creates automatically in local development. Elsewhere, create it first:',
    '',
    '```',
    'temporal operator nexus endpoint create --name ui-catalog --target-namespace <namespace> --target-task-queue ui-catalog',
    '```',
  ].join('\n'),
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'featureTourWorkflow',
    workflow: featureTourWorkflow,
    activities: { featureTourActivity },
    nexusEndpoints: [featureTourEndpoint],
    nexusServices: [featureTourServiceHandler],
  },
};
