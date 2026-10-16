import {
  ApplicationFailure,
  CancellationScope,
  CancelledFailure,
  ChildWorkflowFailure,
  condition,
  continueAsNew,
  defineSignal,
  defineUpdate,
  getExternalWorkflowHandle,
  proxyActivities,
  proxyLocalActivities,
  setHandler,
  sleep,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const { recordTimelineStep, retryTimelineStep } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5 seconds',
  retry: { maximumAttempts: 2, initialInterval: '100 milliseconds' },
});
const { recordLocalTimelineStep } = proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
});

const showcaseSignal = defineSignal<[string]>('timelineKitchenSinkSignal');
const showcaseUpdate = defineUpdate<string, [string]>(
  'timelineKitchenSinkUpdate',
);

type Role = 'root' | 'child' | 'grandchild' | 'failure';

export async function timelineKitchenSink(
  totalRuns = 2,
  finalHoldSeconds = 3,
  run = 1,
  role: Role = 'root',
  parentWorkflowId = '',
): Promise<string> {
  if (role === 'failure') {
    throw ApplicationFailure.nonRetryable('Expected showcase child failure');
  }

  const { workflowId } = workflowInfo();
  let receivedSignal = '';
  setHandler(showcaseSignal, (message) => {
    receivedSignal = message;
  });
  setHandler(showcaseUpdate, (message) => `Acknowledged: ${message}`);

  if (role === 'grandchild') {
    await sleep('300 milliseconds');
    return `Grandchild ${workflowId} completed`;
  }

  if (role === 'child') {
    if (!parentWorkflowId) {
      throw ApplicationFailure.nonRetryable('Missing parent workflow ID');
    }
    const grandchild = await startChild(timelineKitchenSink, {
      args: [1, 0, 1, 'grandchild', workflowId],
      workflowId: `${workflowId}-nested`,
    });
    await grandchild.result();
    const signaled = await condition(
      () => receivedSignal.length > 0,
      '10 seconds',
    );
    if (!signaled) {
      throw ApplicationFailure.nonRetryable(
        'Showcase child did not receive its signal',
      );
    }
    await getExternalWorkflowHandle(parentWorkflowId).signal(
      showcaseSignal,
      `Child ${workflowId} completed`,
    );
    return `Child ${workflowId} completed`;
  }

  const child = await startChild(timelineKitchenSink, {
    args: [1, 0, 1, 'child', workflowId],
    workflowId: `${workflowId}-child-run-${run}`,
  });
  await child.signal(showcaseSignal, `Hello from parent run ${run}`);

  await Promise.all([
    recordTimelineStep(`run-${run}`),
    retryTimelineStep(`run-${run}`),
    sleep('350 milliseconds'),
  ]);
  await recordLocalTimelineStep(`run-${run}`);

  const cancellation = new CancellationScope();
  const pendingTimer = cancellation.run(() => sleep('30 seconds'));
  await sleep('100 milliseconds');
  cancellation.cancel();
  try {
    await pendingTimer;
  } catch (error) {
    if (!(error instanceof CancelledFailure)) throw error;
  }

  const signaled = await condition(
    () => receivedSignal.length > 0,
    '10 seconds',
  );
  if (!signaled) {
    throw ApplicationFailure.nonRetryable(
      'Showcase parent did not receive its signal',
    );
  }
  await child.result();

  if (run === 1) {
    const failingChild = await startChild(timelineKitchenSink, {
      args: [1, 0, 1, 'failure', workflowId],
      workflowId: `${workflowId}-expected-failure`,
      retry: { maximumAttempts: 1 },
    });
    try {
      await failingChild.result();
      throw ApplicationFailure.nonRetryable('Expected showcase child to fail');
    } catch (error) {
      if (!(error instanceof ChildWorkflowFailure)) throw error;
    }
  }

  if (run < totalRuns) {
    return continueAsNew<typeof timelineKitchenSink>(
      totalRuns,
      finalHoldSeconds,
      run + 1,
    );
  }

  if (finalHoldSeconds > 0) await sleep(`${finalHoldSeconds} seconds`);
  return `Timeline showcase completed ${totalRuns} runs`;
}
