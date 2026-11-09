import {
  orderSagaChargePayment,
  orderSagaCreateShipment,
  orderSagaRefundPayment,
  orderSagaReleaseInventory,
  orderSagaReserveInventory,
} from './activities.js';
import { orderSaga } from './workflow.js';

export const catalogExample = {
  id: 'order-saga',
  title: 'Order fulfillment saga',
  description:
    'Reserves inventory, charges payment, and creates a shipment. When a step fails, the completed steps are undone in reverse order.',
  capabilityTags: ['activities', 'retries', 'sequencing'],
  patternTags: ['saga'],
  expectedEvidence: [
    'With `failAt` set to `none`, the Reserve inventory, Charge payment, and Create shipment activities complete and the workflow returns that the order shipped.',
    'With `failAt` set to `create-shipment`, the shipment fails, then Compensate: refund payment runs before Compensate: release inventory, and the workflow fails with the shipment error.',
    'With `failAt` set to `charge-payment`, only Compensate: release inventory runs before the workflow fails.',
    'With `failAt` set to `reserve-inventory`, no compensations run because nothing completed.',
  ],
  setupMarkdown: [
    'Choose which step fails with **Fail at step**. Each step shows as an activity with a summary in the timeline.',
    '',
    '| Fail at step | What runs |',
    '| --- | --- |',
    '| `none` | Reserve → Charge → Ship. The order ships. |',
    '| `reserve-inventory` | Reserve fails. Nothing to undo. |',
    '| `charge-payment` | Reserve → Charge fails → Release inventory. |',
    '| `create-shipment` | Reserve → Charge → Ship fails → Refund payment → Release inventory. |',
    '',
    'Try `none` first, then the default `create-shipment` to see compensations run in reverse order. Set **Workflow ID** to an order ID such as `order-1001`; activities use it as the order ID.',
  ].join('\n'),
  input: {
    defaultValue: [
      {
        sku: 'SKU-123',
        quantity: 2,
        amountCents: 4999,
        failAt: 'create-shipment',
      },
    ],
    schema: {
      type: 'array',
      prefixItems: [
        {
          title: 'Order',
          type: 'object',
          properties: {
            sku: { title: 'SKU', type: 'string', minLength: 1 },
            quantity: {
              title: 'Quantity',
              type: 'integer',
              minimum: 1,
              maximum: 100,
            },
            amountCents: {
              title: 'Amount in cents',
              type: 'integer',
              minimum: 1,
              maximum: 100000000,
            },
            failAt: {
              title: 'Fail at step',
              type: 'string',
              enum: [
                'none',
                'reserve-inventory',
                'charge-payment',
                'create-shipment',
              ],
            },
          },
          required: ['sku', 'quantity', 'amountCents', 'failAt'],
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
    workflowType: 'orderSaga',
    workflow: orderSaga,
    activities: {
      orderSagaReserveInventory,
      orderSagaChargePayment,
      orderSagaCreateShipment,
      orderSagaReleaseInventory,
      orderSagaRefundPayment,
    },
  },
};
