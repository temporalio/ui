import { brokenStep, busyStep, flakyStep } from './activity.js';
import { executionChain } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const runList = (title: string) => ({
  title,
  type: 'array',
  items: { type: 'integer', minimum: 1, maximum: 25 },
  uniqueItems: true,
});

const input: RuntimeJsonDocument = {
  defaultValue: [14, 2, [4], [7]],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Total runs in the chain',
        type: 'integer',
        minimum: 1,
        maximum: 25,
      },
      {
        title: 'Timer per run in seconds',
        type: 'integer',
        minimum: 1,
        maximum: 30,
      },
      runList('Runs that fail once and are retried'),
      runList('Runs that schedule about 300 short activities'),
    ],
    items: false,
    maxItems: 4,
  },
};

const startOptions: RuntimeJsonDocument = {
  defaultValue: { retryPolicy: { maximumAttempts: 2 } },
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'execution-chain',
  title: 'Execution chain',
  description:
    'Builds a Workflow Execution Chain of 14 Runs linked by continue-as-new and workflow retry, for testing the chain page.',
  capabilityTags: ['continue-as-new', 'retries', 'child-workflows', 'timers'],
  expectedEvidence: [
    'Fifteen Runs with the same Workflow ID using the defaults: 14 linked by continue-as-new, plus one retry of Run 4.',
    'Each Run has a retried activity, a failed activity, a timer and a child workflow.',
    'Run 7 schedules about 300 extra activities.',
    'Sending the `proceed` signal ends the current Run’s signal wait early and adds a signal to it.',
  ],
  setupMarkdown: [
    'Run numbers count from 1 and are kept across retries, so a retried Run does not count twice toward the total. A Run listed in **Runs that fail once** fails on its first attempt only; the default Retry Policy (`maximumAttempts: 2`) starts its retry.',
    '',
    'These paths are manual only:',
    '',
    '- **Off-path Run**: reset a Run from its run page.',
    '- **Older chain**: start this example again with the same Workflow ID after the chain closes.',
    '- **Past retention**: walking back past the namespace retention period can’t be reproduced locally.',
  ].join('\n'),
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'executionChain',
    workflow: executionChain,
    activities: { flakyStep, brokenStep, busyStep },
  },
};
