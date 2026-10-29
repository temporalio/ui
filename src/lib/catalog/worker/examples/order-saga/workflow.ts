import { proxyActivities, workflowInfo } from '@temporalio/workflow';

import type * as activities from './activities.js';
import type { OrderSagaOrder } from './activities.js';

export type OrderSagaInput = Omit<OrderSagaOrder, 'orderId'>;

const {
  orderSagaReserveInventory,
  orderSagaChargePayment,
  orderSagaCreateShipment,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 3, initialInterval: '1 second' },
});

const { orderSagaReleaseInventory, orderSagaRefundPayment } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
});

export async function orderSaga(input: OrderSagaInput): Promise<string> {
  const order: OrderSagaOrder = {
    ...input,
    orderId: workflowInfo().workflowId,
  };
  const compensations: (() => Promise<string>)[] = [];

  try {
    compensations.unshift(() =>
      orderSagaReleaseInventory.executeWithOptions(
        { summary: 'Compensate: release inventory' },
        [order],
      ),
    );
    await orderSagaReserveInventory.executeWithOptions(
      { summary: 'Reserve inventory' },
      [order],
    );

    compensations.unshift(() =>
      orderSagaRefundPayment.executeWithOptions(
        { summary: 'Compensate: refund payment' },
        [order],
      ),
    );
    await orderSagaChargePayment.executeWithOptions(
      { summary: 'Charge payment' },
      [order],
    );

    await orderSagaCreateShipment.executeWithOptions(
      { summary: 'Create shipment' },
      [order],
    );

    return `Order ${order.orderId} shipped`;
  } catch (error) {
    for (const compensate of compensations) {
      await compensate();
    }
    throw error;
  }
}
