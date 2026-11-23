import { brokenStep, busyStep, flakyStep } from './activity.js';
import { executionChain } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const runIndexList = (description: string) => ({
  description,
  type: 'array',
  items: { type: 'integer', minimum: 0, maximum: 24 },
  uniqueItems: true,
});

const input: RuntimeJsonDocument = {
  defaultValue: {
    totalRuns: 14,
    baseTimerSeconds: 1,
    runIndexesThatFailOnce: [3],
    runIndexesWith300Activities: [6],
    runIndexesWith8000Activities: [9],
  },
  schema: {
    type: 'object',
    properties: {
      totalRuns: {
        description: 'Number of Runs in the chain, not counting retries.',
        type: 'integer',
        minimum: 1,
        maximum: 25,
      },
      baseTimerSeconds: {
        description:
          'Each Run sleeps this long times 1, 12, 3, 30, 1, 6, 20, repeating.',
        type: 'integer',
        minimum: 1,
        maximum: 30,
      },
      runIndexesThatFailOnce: runIndexList(
        'Indexes of Runs that fail on their first attempt and are retried.',
      ),
      runIndexesWith300Activities: runIndexList(
        'Indexes of Runs that schedule about 300 extra activities.',
      ),
      runIndexesWith8000Activities: runIndexList(
        'Indexes of Runs that schedule about 8,000 extra activities, for about 24,000 events.',
      ),
    },
    additionalProperties: false,
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
    'Fifteen Runs with the same Workflow ID using the defaults: 14 linked by continue-as-new, plus one retry of the Run at index 3.',
    'Each Run has a retried activity, a failed activity, a timer and a child workflow.',
    'Run lengths vary widely: each Run’s timer is the base timer times 1, 12, 3, 30, 1, 6, 20, repeating, so with the defaults the Run at index 3 waits 30 seconds and the Run at index 4 waits 1.',
    'The Run at index 6 schedules about 300 extra activities.',
    'The Run at index 9 schedules about 8,000 extra activities in batches of 1,000, for a history of about 24,000 events.',
    'Sending the `proceed` signal ends the current Run’s signal wait early and adds a signal to it.',
  ],
  setupMarkdown: [
    'Run indexes count from 0 and are kept across retries, so a retried Run does not count twice toward the total. A Run listed in `runIndexesThatFailOnce` fails on its first attempt only; the default Retry Policy (`maximumAttempts: 2`) starts its retry.',
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
