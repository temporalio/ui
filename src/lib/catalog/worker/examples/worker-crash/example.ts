import { workerCrashWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [120],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Run duration in seconds',
        type: 'integer',
        minimum: 10,
        maximum: 600,
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
  id: 'worker-crash',
  title: 'Worker crash and recovery',
  description:
    'Exits the Worker process on request, then continues the run on the restarted Worker.',
  capabilityTags: ['updates', 'activities', 'retries', 'workers'],
  expectedEvidence: [
    'The crashWorker update returns that attempt 2 ran on a new Worker.',
    'The run completes after the Worker restarts.',
  ],
  input,
  startOptions,
  setupMarkdown: [
    'Start the worker with `CATALOG_CONTROL=on`. The worker then restarts after it exits.',
    '',
    'While the run waits, send the `crashWorker` update:',
    '',
    '```',
    'temporal workflow update execute --name crashWorker --workflow-id <workflow id>',
    '```',
    '',
    'The worker process exits and restarts. The update returns once the crash activity succeeds on the new worker. Without `CATALOG_CONTROL=on`, the update fails and the worker keeps running.',
  ].join('\n'),
  execution: {
    kind: 'workflow',
    workflowType: 'workerCrashWorkflow',
    workflow: workerCrashWorkflow,
    activities: {},
  },
};
