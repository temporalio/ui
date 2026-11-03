import { unpaidOrderCancelOrder } from './activities.js';
import { unpaidOrderAutoCancel } from './workflow.js';

export const catalogExample = {
  id: 'unpaid-order-auto-cancel',
  title: 'Unpaid order auto-cancel',
  description:
    'Holds an order until a deadline and cancels it if it is not paid. Signals move the deadline later or earlier, or mark the order paid.',
  capabilityTags: ['timers', 'signals', 'queries', 'activities'],
  patternTags: ['updatable-timer'],
  expectedEvidence: [
    'Without signals, the timer fires after the hold time and the Cancel unpaid order activity runs.',
    'Each `adjustHold` signal cancels the current timer and starts a new one for the moved deadline.',
    'A negative `adjustHold` that moves the deadline into the past cancels the order straight away.',
    'A `paid` signal cancels the timer and completes the workflow without running the cancel activity.',
  ],
  setupMarkdown: [
    'The order cancels itself after **Hold time in seconds** unless it is paid. Set **Workflow ID** to an order ID such as `order-1001`.',
    '',
    '1. Run it and wait for the hold time to see the auto-cancel.',
    '2. Run it again and send a **signal** named `adjustHold` with `30` to push the deadline 30 seconds later, or `-30` to pull it 30 seconds earlier.',
    '3. Send a **query** named `holdStatus` to see the new deadline and the seconds remaining.',
    '4. Send a **signal** named `paid` with no input to stop the timer and complete the order.',
    '',
    'From the CLI:',
    '',
    '```',
    'temporal workflow signal --workflow-id order-1001 --name adjustHold --input 30',
    'temporal workflow query --workflow-id order-1001 --type holdStatus',
    'temporal workflow signal --workflow-id order-1001 --name paid',
    '```',
  ].join('\n'),
  input: {
    defaultValue: [{ holdSeconds: 60 }],
    schema: {
      type: 'array',
      prefixItems: [
        {
          title: 'Order hold',
          type: 'object',
          properties: {
            holdSeconds: {
              title: 'Hold time in seconds',
              type: 'integer',
              minimum: 10,
              maximum: 600,
            },
          },
          required: ['holdSeconds'],
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
    workflowType: 'unpaidOrderAutoCancel',
    workflow: unpaidOrderAutoCancel,
    activities: { unpaidOrderCancelOrder },
  },
};
