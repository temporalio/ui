import { bankAccountEntity } from './workflow.js';

export const catalogExample = {
  id: 'bank-account-entity',
  title: 'Bank account entity',
  description:
    'Keeps one long-lived workflow per bank account that changes its balance through deposit and withdraw Updates, answers a balance Query, and continues as new every few operations.',
  capabilityTags: [
    'updates',
    'queries',
    'signals',
    'continue-as-new',
    'long-running',
  ],
  patternTags: ['entity-workflow'],
  expectedEvidence: [
    'Accepted and completed `deposit` and `withdraw` update events, each returning the new balance.',
    'A `withdraw` larger than the balance is rejected by its validator and leaves no update events in history.',
    'The `balance` query returns the current balance in cents.',
    'After the configured number of operations, the run continues as new and the next run starts with the carried-over balance.',
    'A `close-account` signal completes the workflow with a final balance.',
  ],
  setupMarkdown: [
    'The workflow is the account, so its Workflow ID is the account ID. Set **Workflow ID** to something like `account-1001` before running.',
    '',
    'Amounts are whole numbers of cents.',
    '',
    '1. Send an **update** named `deposit` with `2500`. It returns the new balance.',
    '2. Send an **update** named `withdraw` with `999999`. The validator rejects it as an overdraft.',
    '3. Send a **query** named `balance` to read the current balance.',
    '4. Keep sending updates. After **Operations before Continue-As-New** accepted updates, the workflow continues as new with the same balance.',
    '5. Send a **signal** named `close-account` with no input to complete the workflow.',
  ].join('\n'),
  input: {
    defaultValue: [{ balanceCents: 10000, continueAsNewEvery: 5 }],
    schema: {
      type: 'array',
      prefixItems: [
        {
          title: 'Account',
          type: 'object',
          properties: {
            balanceCents: {
              title: 'Opening balance in cents',
              type: 'integer',
              minimum: 0,
              maximum: 100000000,
            },
            continueAsNewEvery: {
              title: 'Operations before Continue-As-New',
              type: 'integer',
              minimum: 1,
              maximum: 100,
            },
          },
          required: ['balanceCents', 'continueAsNewEvery'],
          additionalProperties: false,
        },
      ],
      items: false,
      minItems: 1,
      maxItems: 1,
    },
  },
  startOptions: {
    defaultValue: {},
    schema: {
      type: 'object',
      properties: { workflowId: { type: 'string', minLength: 1 } },
    },
  },
  execution: {
    kind: 'workflow' as const,
    workflowType: 'bankAccountEntity',
    workflow: bankAccountEntity,
    activities: {},
  },
};
