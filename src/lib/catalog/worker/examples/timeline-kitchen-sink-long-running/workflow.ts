import {
  ApplicationFailure,
  CancellationScope,
  CancelledFailure,
  ChildWorkflowCancellationType,
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

import type * as activities from '../timeline-kitchen-sink/activity.js';

const { recordTimelineStep, retryTimelineStep } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5 seconds',
  retry: { maximumAttempts: 2, initialInterval: '100 milliseconds' },
});
const { recordLocalTimelineStep } = proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
});

const showcaseSignal = defineSignal<[string]>(
  'timelineKitchenSinkLongRunningSignal',
);
const showcaseUpdate = defineUpdate<string, [string]>(
  'timelineKitchenSinkLongRunningUpdate',
);

type Role = 'root' | 'child' | 'grandchild' | 'failure';

async function settleOperations(operations: Promise<unknown>[]): Promise<void> {
  const results = await Promise.allSettled(operations);
  for (const result of results) {
    if (result.status === 'rejected') throw result.reason;
  }
}

async function cancelTimer(): Promise<void> {
  const scope = new CancellationScope();
  const timer = Promise.allSettled([scope.run(() => sleep('30 seconds'))]);
  const [delayResult] = await Promise.allSettled([sleep('100 milliseconds')]);
  scope.cancel();
  const [result] = await timer;
  if (delayResult.status === 'rejected') throw delayResult.reason;
  if (
    result.status === 'rejected' &&
    !(result.reason instanceof CancelledFailure)
  ) {
    throw result.reason;
  }
}

export async function timelineKitchenSinkLongRunning(
  totalRuns = 100,
  holdSeconds = 30,
  batchesPerRun = 5,
  branchesPerBatch = 3,
  run = 1,
  role: Role = 'root',
  parentWorkflowId = '',
): Promise<string> {
  const bounds = [
    [totalRuns, 2, 1000],
    [holdSeconds, 1, 3600],
    [batchesPerRun, 1, 20],
    [branchesPerBatch, 1, 10],
    [run, 1, totalRuns],
  ];
  if (
    bounds.some(
      ([value, minimum, maximum]) =>
        !Number.isInteger(value) || value < minimum || value > maximum,
    )
  ) {
    throw ApplicationFailure.nonRetryable(
      'Invalid long-running showcase options',
    );
  }
  if (role === 'failure') {
    throw ApplicationFailure.nonRetryable('Expected showcase child failure');
  }

  const { workflowId } = workflowInfo();
  const receivedSignals = new Set<string>();
  setHandler(showcaseSignal, (message) => {
    receivedSignals.add(message);
  });
  setHandler(
    showcaseUpdate,
    (message) => `Acknowledged run ${run}: ${message}`,
  );

  if (role === 'grandchild') {
    await sleep('300 milliseconds');
    return `Grandchild ${workflowId} completed`;
  }

  async function startRole(childRole: Role, childId: string) {
    return startChild(timelineKitchenSinkLongRunning, {
      args: [
        totalRuns,
        holdSeconds,
        batchesPerRun,
        branchesPerBatch,
        run,
        childRole,
        workflowId,
      ],
      workflowId: childId,
      cancellationType:
        ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
      retry: { maximumAttempts: 1 },
    });
  }

  if (role === 'child') {
    if (!parentWorkflowId) {
      throw ApplicationFailure.nonRetryable('Missing parent workflow ID');
    }
    const grandchild = await startRole('grandchild', `${workflowId}-nested`);
    await grandchild.result();
    if (!(await condition(() => receivedSignals.size > 0, '10 seconds'))) {
      throw ApplicationFailure.nonRetryable(
        'Showcase child did not receive its signal',
      );
    }
    await getExternalWorkflowHandle(parentWorkflowId).signal(
      showcaseSignal,
      workflowId,
    );
    return `Child ${workflowId} completed`;
  }

  async function runBranch(batch: number, branch: number): Promise<void> {
    const childId = `${workflowId}-run-${run}-batch-${batch}-branch-${branch}`;
    const child = await startRole('child', childId);
    await settleOperations([
      child.result(),
      child.signal(
        showcaseSignal,
        `Hello from parent run ${run} batch ${batch}`,
      ),
    ]);
    if (!(await condition(() => receivedSignals.has(childId), '10 seconds'))) {
      throw ApplicationFailure.nonRetryable(
        'Showcase parent did not receive its signal',
      );
    }
  }

  for (let batch = 1; batch <= batchesPerRun; batch++) {
    const step = `run-${run}-batch-${batch}`;
    await settleOperations([
      ...Array.from({ length: branchesPerBatch }, (_, index) =>
        runBranch(batch, index + 1),
      ),
      recordTimelineStep(step),
      retryTimelineStep(step),
      recordLocalTimelineStep(step),
      cancelTimer(),
    ]);
  }

  const failingChild = await startRole(
    'failure',
    `${workflowId}-run-${run}-expected-failure`,
  );
  try {
    await failingChild.result();
    throw ApplicationFailure.nonRetryable('Expected showcase child to fail');
  } catch (error) {
    if (!(error instanceof ChildWorkflowFailure)) throw error;
  }

  await sleep(`${holdSeconds} seconds`);
  if (run < totalRuns) {
    return continueAsNew<typeof timelineKitchenSinkLongRunning>(
      totalRuns,
      holdSeconds,
      batchesPerRun,
      branchesPerBatch,
      run + 1,
    );
  }
  return `Long-running timeline showcase completed ${totalRuns} runs`;
}
