import {
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activities.js';

export type UnpaidOrderInput = {
  holdSeconds: number;
};

export type HoldStatus = {
  paid: boolean;
  deadline: string;
  remainingSeconds: number;
  adjustments: number;
};

const adjustHoldSignal = defineSignal<[number]>('adjustHold');
const paidSignal = defineSignal('paid');
const holdStatusQuery = defineQuery<HoldStatus>('holdStatus');

const { unpaidOrderCancelOrder } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function unpaidOrderAutoCancel({
  holdSeconds,
}: UnpaidOrderInput): Promise<string> {
  const orderId = workflowInfo().workflowId;
  let deadline = Date.now() + holdSeconds * 1000;
  let paid = false;
  let deadlineChanged = false;
  let adjustments = 0;

  setHandler(adjustHoldSignal, (seconds) => {
    if (!Number.isFinite(seconds) || seconds === 0) return;
    deadline += seconds * 1000;
    deadlineChanged = true;
    adjustments += 1;
  });
  setHandler(paidSignal, () => {
    paid = true;
  });
  setHandler(holdStatusQuery, () => ({
    paid,
    deadline: new Date(deadline).toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
    adjustments,
  }));

  while (!paid) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    deadlineChanged = false;
    await condition(() => paid || deadlineChanged, remaining);
  }

  if (paid) {
    return `Order ${orderId} paid`;
  }

  await unpaidOrderCancelOrder.executeWithOptions(
    { summary: 'Cancel unpaid order' },
    [orderId],
  );

  return `Order ${orderId} cancelled after ${adjustments} hold adjustments`;
}
