import { ApplicationFailure } from '@temporalio/common';

export type OrderSagaStep =
  | 'reserve-inventory'
  | 'charge-payment'
  | 'create-shipment';

export type OrderSagaOrder = {
  orderId: string;
  sku: string;
  quantity: number;
  amountCents: number;
  failAt: OrderSagaStep | 'none';
};

const failIfRequested = (order: OrderSagaOrder, step: OrderSagaStep) => {
  if (order.failAt === step) {
    throw ApplicationFailure.nonRetryable(
      `${step} failed for order ${order.orderId}`,
      'OrderSagaStepFailed',
    );
  }
};

export async function orderSagaReserveInventory(
  order: OrderSagaOrder,
): Promise<string> {
  failIfRequested(order, 'reserve-inventory');
  return `Reserved ${order.quantity} × ${order.sku} for order ${order.orderId}`;
}

export async function orderSagaChargePayment(
  order: OrderSagaOrder,
): Promise<string> {
  failIfRequested(order, 'charge-payment');
  return `Charged ${order.amountCents} cents for order ${order.orderId}`;
}

export async function orderSagaCreateShipment(
  order: OrderSagaOrder,
): Promise<string> {
  failIfRequested(order, 'create-shipment');
  return `Created shipment for order ${order.orderId}`;
}

export async function orderSagaReleaseInventory(
  order: OrderSagaOrder,
): Promise<string> {
  return `Released ${order.quantity} × ${order.sku} for order ${order.orderId}`;
}

export async function orderSagaRefundPayment(
  order: OrderSagaOrder,
): Promise<string> {
  return `Refunded ${order.amountCents} cents for order ${order.orderId}`;
}
