import * as workflow from '@temporalio/workflow';

import type * as activities from './activities';
import type { ComplexActivityResult } from './activities/complex';

const { echo: Activity, multi: MultiInputActivity } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

const { echo: LocalActivity } = workflow.proxyLocalActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

const isBlockedQuery = workflow.defineQuery<boolean>('is-blocked');
const unblockSignal = workflow.defineSignal('unblock');
const proceedSignal = workflow.defineSignal('proceed');

const { double, delayedDouble } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 hour',
  retry: {
    maximumAttempts: 1,
  },
});

const { longSleep } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  heartbeatTimeout: '2 minutes',
  retry: { maximumAttempts: 1 },
});

const { alwaysFails } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: {
    initialInterval: '5 minutes',
    backoffCoefficient: 1.5,
    maximumInterval: '30 minutes',
    maximumAttempts: 0,
  },
});

export async function Workflow(input: string): Promise<string> {
  let result: string;

  result = await LocalActivity(input);
  result = await Activity(input);

  return result;
}

export async function BlockingWorkflow(input: string): Promise<string> {
  let isBlocked = true;

  workflow.setHandler(unblockSignal, () => void (isBlocked = false));
  workflow.setHandler(isBlockedQuery, () => isBlocked);

  try {
    await workflow.condition(() => !isBlocked);
  } catch (err) {
    if (err instanceof workflow.CancelledFailure) {
      console.log('Cancelled');
    }
    throw err;
  }

  return Activity(input);
}

export async function CompletedWorkflow(
  amount: number,
  iterations = 0,
): Promise<number> {
  if (iterations) {
    await workflow.continueAsNew(amount, iterations - 1);
  }

  return await double(amount);
}

export async function BatchedContinueAsNewChildWorkflow(
  amount: number,
  label: string,
  activityDurationMs: number,
  remainingContinueAsNewRuns = 0,
  remainingChildLevels = 1,
  childLevel = 1,
): Promise<number> {
  await delayedDouble.executeWithOptions(
    { summary: `${label} child activity before grandchild` },
    [amount, activityDurationMs],
  );
  const result =
    remainingChildLevels > 1
      ? await workflow.executeChild(BatchedContinueAsNewChildWorkflow, {
          args: [
            amount,
            `${label}, child level ${childLevel + 1}`,
            activityDurationMs,
            0,
            remainingChildLevels - 1,
            childLevel + 1,
          ],
          workflowId: `${workflow.workflowInfo().workflowId}-${workflow.workflowInfo().runId}-level-${childLevel + 1}`,
        })
      : amount;
  await delayedDouble.executeWithOptions(
    { summary: `${label} child activity after grandchild` },
    [amount, activityDurationMs],
  );
  if (remainingContinueAsNewRuns > 0) {
    return await workflow.continueAsNew<
      typeof BatchedContinueAsNewChildWorkflow
    >(
      amount,
      label,
      activityDurationMs,
      remainingContinueAsNewRuns - 1,
      remainingChildLevels,
      childLevel,
    );
  }
  return result;
}

export async function BatchedContinueAsNewWorkflow(
  amount: number,
  iterations = 0,
  activitiesPerRun = 9,
  activityDurationMs = 10_000,
  delayBetweenActivitiesMs = 0,
  parallelActivityDurationMs = 10_000,
  childWorkflowLevels = 1,
): Promise<number> {
  const runTrack = async ({
    label,
    activityCount,
    durationMs,
    delayMs,
  }: {
    label: string;
    activityCount: number;
    durationMs: number;
    delayMs: number;
  }): Promise<number> => {
    let trackResult = amount;
    for (let activity = 1; activity <= activityCount; activity++) {
      trackResult = await delayedDouble.executeWithOptions(
        { summary: `${label} ${activity} of ${activityCount}` },
        [amount, durationMs],
      );
      if (activity < activityCount && delayMs > 0) {
        await workflow.sleep(delayMs);
      }
    }
    return trackResult;
  };

  const fastTrackDurationMs =
    activitiesPerRun * activityDurationMs +
    Math.max(0, activitiesPerRun - 1) * delayBetweenActivitiesMs;
  const slowActivityCount =
    parallelActivityDurationMs > 0
      ? Math.max(1, Math.ceil(fastTrackDurationMs / parallelActivityDurationMs))
      : 0;
  const nestedActivityDurationMs = activityDurationMs;
  const currentRunId = workflow.workflowInfo().runId;
  const runChildTrack = async (): Promise<number> => {
    let childResult = amount;
    if (childWorkflowLevels < 1) return childResult;
    for (let child = 1; child <= activitiesPerRun; child++) {
      const label = `Child ${child} of ${activitiesPerRun}`;
      childResult = await workflow.executeChild(
        BatchedContinueAsNewChildWorkflow,
        {
          args: [
            amount,
            label,
            nestedActivityDurationMs,
            child % 2 === 0 ? 1 : 0,
            Math.floor(childWorkflowLevels),
            1,
          ],
          workflowId: `${workflow.workflowInfo().workflowId}-${currentRunId}-child-${child}`,
        },
      );
    }
    return childResult;
  };
  await Promise.all([
    runTrack({
      label: 'Fast track activity',
      activityCount: activitiesPerRun,
      durationMs: activityDurationMs,
      delayMs: delayBetweenActivitiesMs,
    }),
    runTrack({
      label: 'Slow track activity',
      activityCount: slowActivityCount,
      durationMs: parallelActivityDurationMs,
      delayMs: 0,
    }),
    runChildTrack(),
  ]);

  return await workflow.continueAsNew<typeof BatchedContinueAsNewWorkflow>(
    amount,
    Math.max(0, iterations - 1),
    activitiesPerRun,
    activityDurationMs,
    delayBetweenActivitiesMs,
    parallelActivityDurationMs,
    childWorkflowLevels,
  );
}

export interface ThousandActivitiesContinueAsNewResult {
  activityExecutions: number;
  continueAsNewCalls: number;
  runs: number;
}

export async function ThousandActivitiesContinueAsNewWorkflow(
  activitiesPerRun = 1_000,
  remainingContinueAsNewCalls = 10,
  runNumber = 1,
  batchSize = 100,
): Promise<ThousandActivitiesContinueAsNewResult> {
  const activityCount = Math.max(0, Math.floor(activitiesPerRun));
  const activityBatchSize = Math.max(1, Math.floor(batchSize));

  for (
    let batchStart = 0;
    batchStart < activityCount;
    batchStart += activityBatchSize
  ) {
    const batchEnd = Math.min(batchStart + activityBatchSize, activityCount);
    await Promise.all(
      Array.from({ length: batchEnd - batchStart }, (_, offset) => {
        const activityNumber = batchStart + offset + 1;
        return double.executeWithOptions(
          {
            summary: `Run ${runNumber}: activity ${activityNumber} of ${activityCount}`,
          },
          [activityNumber],
        );
      }),
    );
  }

  if (remainingContinueAsNewCalls > 0) {
    return await workflow.continueAsNew<
      typeof ThousandActivitiesContinueAsNewWorkflow
    >(
      activityCount,
      remainingContinueAsNewCalls - 1,
      runNumber + 1,
      activityBatchSize,
    );
  }

  return {
    activityExecutions: activityCount * runNumber,
    continueAsNewCalls: runNumber - 1,
    runs: runNumber,
  };
}

const runThreeDemoActivities = async (label: string): Promise<number> => {
  let result = 2;
  for (let activity = 1; activity <= 3; activity++) {
    result = await delayedDouble.executeWithOptions(
      { summary: `${label}: activity ${activity} of 3` },
      [result, 5_000],
    );
  }
  return result;
};

export async function TimelineDemoThreeActivitiesWorkflow(): Promise<void> {
  await runThreeDemoActivities('Top-level workflow');
  return await workflow.continueAsNew<
    typeof TimelineDemoThreeActivitiesWorkflow
  >();
}

export async function TimelineDemoThreeActivitiesChildWorkflow(
  label: string,
  remainingContinueAsNewRuns = 1,
): Promise<number> {
  const result = await runThreeDemoActivities(label);
  if (remainingContinueAsNewRuns > 0) {
    return await workflow.continueAsNew<
      typeof TimelineDemoThreeActivitiesChildWorkflow
    >(label, remainingContinueAsNewRuns - 1);
  }
  return result;
}

export async function TimelineDemoThreeChildrenWorkflow(): Promise<void> {
  const info = workflow.workflowInfo();
  for (let child = 1; child <= 3; child++) {
    await workflow.executeChild(TimelineDemoThreeActivitiesChildWorkflow, {
      args: [`Child ${child} of 3`, 1],
      workflowId: `${info.workflowId}-${info.runId}-child-${child}`,
    });
  }
  return await workflow.continueAsNew<
    typeof TimelineDemoThreeChildrenWorkflow
  >();
}

export async function TimelineDemoNestedChildWorkflow(
  label: string,
  remainingContinueAsNewRuns = 1,
): Promise<void> {
  const info = workflow.workflowInfo();
  for (let child = 1; child <= 3; child++) {
    await workflow.executeChild(TimelineDemoThreeActivitiesChildWorkflow, {
      args: [`${label}, child ${child} of 3`, 1],
      workflowId: `${info.workflowId}-${info.runId}-child-${child}`,
    });
  }
  if (remainingContinueAsNewRuns > 0) {
    return await workflow.continueAsNew<typeof TimelineDemoNestedChildWorkflow>(
      label,
      remainingContinueAsNewRuns - 1,
    );
  }
}

export async function TimelineDemoNestedChildrenWorkflow(): Promise<void> {
  const info = workflow.workflowInfo();
  for (let child = 1; child <= 3; child++) {
    await workflow.executeChild(TimelineDemoNestedChildWorkflow, {
      args: [`Child ${child} of 3`, 1],
      workflowId: `${info.workflowId}-${info.runId}-child-${child}`,
    });
  }
  return await workflow.continueAsNew<
    typeof TimelineDemoNestedChildrenWorkflow
  >();
}

export async function RunningWorkflow(): Promise<void> {
  return await workflow.sleep('10 days');
}

export async function UserMetadataWorkflow(input: string): Promise<string> {
  let signalReceived = false;

  workflow.setHandler(proceedSignal, () => void (signalReceived = true));

  workflow.setCurrentDetails(
    `# Paused at checkpoint.\n Send 'proceed' signal to continue, or workflow will auto-proceed after 10 minutes. Input: ${input}`,
  );

  await workflow.condition(() => signalReceived, '10 minutes', {
    summary: 'Sleeping for 10 minutes',
  });

  const currentDetails = workflow.getCurrentDetails();
  console.log(`Current details: ${currentDetails}`);

  workflow.setCurrentDetails(
    signalReceived
      ? 'Received proceed signal, continuing execution'
      : 'Timed out after 10 minutes, continuing execution',
  );

  return await Activity.executeWithOptions(
    {
      summary: '# This is the summary',
    },
    [input],
  );
}

interface PayloadCoverageInput {
  stringField: string;
  numberField: number;
  floatField: number;
  booleanField: boolean;
  nullField: null;
  arrayOfStrings: string[];
  arrayOfNumbers: number[];
  mixedArray: (string | number | boolean | null)[];
  nestedObject: {
    level1: {
      level2: string;
      array: number[];
    };
    flag: boolean;
  };
  emptyObject: Record<string, never>;
  emptyArray: never[];
}

interface ChildWorkflowInput {
  message: string;
  parentInput: PayloadCoverageInput;
}

interface ChildWorkflowResult {
  echoed: string;
  activityResult: string;
  receivedInput: ChildWorkflowInput;
}

export interface PayloadCoverageResult {
  received: PayloadCoverageInput;
  localActivityResult: string;
  activityResult: ComplexActivityResult;
  childWorkflowResult: ChildWorkflowResult;
  signalCount: number;
  accumulatedData: Record<string, unknown>;
  timedOut: boolean;
  completedAt: string;
}

const { complex: complexActivity } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
});

const { complex: failingActivity } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 1 },
});

const addDataSignal =
  workflow.defineSignal<[{ key: string; value: unknown }]>('add-data');

const triggerSignal = workflow.defineSignal<[string[]]>('trigger');

const getStatusQuery = workflow.defineQuery<{
  status: string;
  data: Record<string, unknown>;
  count: number;
}>('get-status');

const getFieldQuery = workflow.defineQuery<unknown, [string]>('get-field');

const processUpdate = workflow.defineUpdate<
  { processed: boolean; echo: unknown },
  [{ operation: string; payload: unknown }]
>('process-update');

export async function PayloadCoverageChildWorkflow(
  input: ChildWorkflowInput,
): Promise<ChildWorkflowResult> {
  const activityResult = await Activity(input.message);
  return {
    echoed: `child echoed: ${input.message}`,
    activityResult,
    receivedInput: input,
  };
}

export async function PayloadCoverageWorkflow(
  input: PayloadCoverageInput,
): Promise<PayloadCoverageResult> {
  let signalCount = 0;
  let triggered = false;
  const accumulatedData: Record<string, unknown> = {};

  workflow.setHandler(addDataSignal, ({ key, value }) => {
    accumulatedData[key] = value;
    signalCount++;
  });

  workflow.setHandler(triggerSignal, (tags) => {
    accumulatedData['triggerTags'] = tags;
    signalCount++;
    triggered = true;
  });

  workflow.setHandler(getStatusQuery, () => ({
    status: triggered ? 'triggered' : 'waiting',
    data: accumulatedData,
    count: signalCount,
  }));

  workflow.setHandler(getFieldQuery, (field) => {
    if (field in input)
      return (input as unknown as Record<string, unknown>)[field];
    return accumulatedData[field] ?? null;
  });

  workflow.setHandler(processUpdate, ({ operation, payload }) => ({
    processed: true,
    echo: {
      operation,
      payload,
      handledAt: workflow.workflowInfo().historyLength,
    },
  }));

  workflow.upsertSearchAttributes({
    CustomKeywordField: ['payload-coverage'],
    CustomIntField: [1],
  });

  const localActivityResult = await LocalActivity(
    JSON.stringify({ type: 'local', input }),
  );

  const activityResult = await complexActivity({
    strings: input.arrayOfStrings,
    numbers: input.arrayOfNumbers,
    nested: {
      key: input.nestedObject.level1.level2,
      count: input.nestedObject.level1.array.length,
      tags: input.arrayOfStrings,
    },
    flag: input.booleanField,
    nullable: null,
  });

  try {
    await failingActivity({
      strings: ['fail'],
      numbers: [0],
      nested: { key: 'error-path', count: 0, tags: [] },
      flag: false,
      nullable: null,
      shouldFail: true,
    });
  } catch {
    accumulatedData['activityFailureRecorded'] = true;
  }

  const childWorkflowResult = await workflow.executeChild(
    PayloadCoverageChildWorkflow,
    {
      args: [
        { message: 'hello from PayloadCoverageWorkflow', parentInput: input },
      ],
      workflowId: workflow.workflowInfo().workflowId + '-child',
    },
  );

  const timedOut = !(await workflow.condition(() => triggered, '1 hour'));

  return {
    received: input,
    localActivityResult,
    activityResult,
    childWorkflowResult,
    signalCount,
    accumulatedData,
    timedOut,
    completedAt: new Date().toISOString(),
  };
}

export async function MultiInputWorkflow(
  input1: string,
  input2: object,
  input3: unknown[],
): Promise<string> {
  const activityResult = await MultiInputActivity(input1, input2, input3);

  return activityResult;
}

export interface HighVolumeSignalResult {
  received: number;
  target: number;
  firstSignalAt: string | null;
  lastSignalAt: string | null;
  durationMs: number | null;
}

const perfSignal =
  workflow.defineSignal<[{ seq: number; data?: string }]>('perf-signal');

export async function HighVolumeSignalWorkflow(
  target = 10_000,
  totalReceived = 0,
  firstSignalAt: string | null = null,
): Promise<HighVolumeSignalResult> {
  const SIGNALS_PER_RUN = 9_000;
  let batchReceived = 0;
  let lastSignalAt: string | null = null;

  workflow.setHandler(perfSignal, ({ seq: _seq }) => {
    totalReceived++;
    batchReceived++;
    const now = new Date().toISOString();
    if (firstSignalAt === null) firstSignalAt = now;
    lastSignalAt = now;
  });

  await workflow.condition(
    () => batchReceived >= SIGNALS_PER_RUN || totalReceived >= target,
  );

  if (totalReceived < target) {
    await workflow.continueAsNew<typeof HighVolumeSignalWorkflow>(
      target,
      totalReceived,
      firstSignalAt,
    );
  }

  const durationMs =
    firstSignalAt && lastSignalAt
      ? new Date(lastSignalAt).getTime() - new Date(firstSignalAt).getTime()
      : null;

  return {
    received: totalReceived,
    target,
    firstSignalAt,
    lastSignalAt,
    durationMs,
  };
}

export interface HighVolumeEventResult {
  historyLength: number;
  signals: number;
  activities: number;
  timers: number;
  children: number;
  durationMs: number;
}

const highVolumeEventSignal =
  workflow.defineSignal<[{ seq: number }]>('hv-event-signal');

const { echo: pingActivity } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

export async function HighVolumeEventChildWorkflow(n: number): Promise<number> {
  return n * 2;
}

export async function RecursiveTimelineLeafWorkflow(
  label: string,
): Promise<string> {
  return Activity(`${label}:leaf`);
}

export async function RecursiveTimelineChildWorkflow({
  label,
  includeGrandchild,
}: {
  label: string;
  includeGrandchild: boolean;
}): Promise<string> {
  await Activity(`${label}:before`);
  if (includeGrandchild) {
    await workflow.executeChild(RecursiveTimelineLeafWorkflow, {
      args: [label],
      workflowId: `${workflow.workflowInfo().workflowId}-grandchild`,
    });
  }
  return Activity(`${label}:after`);
}

export async function RecursiveTimelineParentWorkflow(): Promise<string[]> {
  const workflowId = workflow.workflowInfo().workflowId;
  return Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      workflow.executeChild(RecursiveTimelineChildWorkflow, {
        args: [
          {
            label: `child-${index + 1}`,
            includeGrandchild: index === 0,
          },
        ],
        workflowId: `${workflowId}-child-${index + 1}`,
      }),
    ),
  );
}

export async function HighVolumeEventWorkflow(
  targetEvents = 40_000,
): Promise<HighVolumeEventResult> {
  const t0 = new Date().getTime();
  let signals = 0;
  let activitiesRun = 0;
  let timersRun = 0;
  let childrenRun = 0;

  workflow.setHandler(highVolumeEventSignal, () => {
    signals++;
  });

  const historyLength = () => workflow.workflowInfo().historyLength;
  let round = 0;

  while (historyLength() < targetEvents) {
    round++;

    // 5 parallel activities → ~18 events per round
    await Promise.all([
      pingActivity('a'),
      pingActivity('b'),
      pingActivity('c'),
      pingActivity('d'),
      pingActivity('e'),
    ]);
    activitiesRun += 5;

    // Timer every 5 rounds → ~3 events
    if (round % 5 === 0) {
      await workflow.sleep(1);
      timersRun++;
    }

    // Child workflow every 20 rounds → ~5 events in parent
    if (round % 20 === 0) {
      await workflow.executeChild(HighVolumeEventChildWorkflow, {
        args: [round],
        workflowId: `${workflow.workflowInfo().workflowId}-child-${round}`,
      });
      childrenRun++;
    }
  }

  return {
    historyLength: historyLength(),
    signals,
    activities: activitiesRun,
    timers: timersRun,
    children: childrenRun,
    durationMs: new Date().getTime() - t0,
  };
}

// ── Long-running "open" workflows for auto-refresh testing ─────────────────

/**
 * Pending activity: does some quick work then blocks on a 15-min activity.
 * Shows a single pending dot at the end of the timeline.
 */
export async function PendingActivityWorkflow(): Promise<string> {
  await Activity('step-1');
  await Activity('step-2');
  await Activity('step-3');
  await longSleep(15 * 60 * 1000);
  return 'done';
}

/**
 * Pending timer: fires several timers in parallel so the timeline shows
 * multiple in-flight timer dots. Stays open for 20 minutes.
 */
export async function PendingTimerWorkflow(): Promise<void> {
  await Activity('before-timers');
  await Promise.all([
    workflow.sleep('12 minutes'),
    workflow.sleep('16 minutes'),
    workflow.sleep('20 minutes'),
  ]);
}

/**
 * Child workflow that sleeps so its parent stays open.
 */
export async function LongSleepChildWorkflow(): Promise<string> {
  await workflow.sleep('20 minutes');
  return 'child done';
}

/**
 * Pending child workflow: parent starts a long-running child then waits.
 * Shows a child-workflow pending dot in the parent's timeline.
 */
export async function PendingChildWorkflow(): Promise<string> {
  await Activity('before-child');
  const result = await workflow.executeChild(LongSleepChildWorkflow, {
    workflowId: workflow.workflowInfo().workflowId + '-child',
    taskQueue: 'e2e-1',
  });
  return result;
}

/**
 * Retrying activity: an activity that always fails, retrying with 5-min
 * backoff. Shows growing retry count on the pending dot.
 */
export async function RetryingActivityWorkflow(): Promise<void> {
  await Activity('setup');
  await alwaysFails(workflow.workflowInfo().attempt);
}

/**
 * Multiple concurrent pending activities: five long-sleep activities running
 * in parallel so the timeline shows several pending dots simultaneously.
 */
export async function ConcurrentPendingWorkflow(): Promise<void> {
  await Activity('setup');
  await Promise.all([
    longSleep(11 * 60 * 1000),
    longSleep(13 * 60 * 1000),
    longSleep(15 * 60 * 1000),
    longSleep(17 * 60 * 1000),
    longSleep(19 * 60 * 1000),
  ]);
}

/**
 * Signal + update + condition wait: does some activities then blocks waiting
 * for either a 'proceed' signal or 25 minutes, whichever comes first.
 * Exercises update handlers and the query path alongside the signal wait.
 */
const longRunningProcessUpdate = workflow.defineUpdate<
  { received: string },
  [string]
>('long-running-update');

export async function SignalUpdateWaitWorkflow(label: string): Promise<string> {
  let unblocked = false;
  let lastUpdate = '';

  workflow.setHandler(proceedSignal, () => void (unblocked = true));
  workflow.setHandler(longRunningProcessUpdate, (payload) => {
    lastUpdate = payload;
    return { received: payload };
  });
  workflow.setHandler(isBlockedQuery, () => !unblocked);

  await Activity(`setup:${label}`);
  await LocalActivity(`local:${label}`);

  workflow.setCurrentDetails(
    `Waiting for 'proceed' signal or 25-min timeout. label=${label}`,
  );

  await workflow.condition(() => unblocked, '25 minutes');

  return `finished:${label}:lastUpdate=${lastUpdate}`;
}

/**
 * Mixed open workflow: combines a pending activity with a mid-sleep timer,
 * a child workflow, and a terminal signal wait all in sequence so the history
 * tab has a rich mix of event types, some pending.
 */
export async function MixedOpenWorkflow(): Promise<void> {
  await Activity('init');

  await workflow.sleep('2 minutes');

  await workflow.executeChild(LongSleepChildWorkflow, {
    workflowId: workflow.workflowInfo().workflowId + '-mixed-child',
    taskQueue: 'e2e-1',
  });

  await longSleep(12 * 60 * 1000);
}

/**
 * Containment frame fixtures: a nested workflow tree built to exercise the
 * timeline containment frames. Between them they produce sibling frames that
 * overlap in time, a frame holding several runs from continue-as-new, a frame
 * holding several runs from workflow retries, and a five-level deep nest.
 *
 * `paceSeconds` stretches every sleep so the run is slow enough to watch the
 * frames fill in live.
 */
type ContainmentFrameArgs = {
  label: string;
  paceSeconds: number;
};

export async function ContainmentFrameLeafWorkflow({
  label,
  paceSeconds,
}: ContainmentFrameArgs): Promise<string> {
  await Activity(`${label}:leaf-start`);
  await workflow.sleep(`${paceSeconds} seconds`);

  return Activity(`${label}:leaf-done`);
}

export async function ContainmentFrameDeepWorkflow({
  label,
  paceSeconds,
  depth,
}: ContainmentFrameArgs & { depth: number }): Promise<string> {
  const { workflowId } = workflow.workflowInfo();

  await Activity(`${label}:enter-depth-${depth}`);
  await workflow.sleep(`${paceSeconds} seconds`);

  if (depth > 1) {
    await workflow.executeChild(ContainmentFrameDeepWorkflow, {
      args: [{ label, paceSeconds, depth: depth - 1 }],
      workflowId: `${workflowId}-d${depth - 1}`,
    });
  } else {
    await workflow.executeChild(ContainmentFrameLeafWorkflow, {
      args: [{ label, paceSeconds }],
      workflowId: `${workflowId}-leaf`,
    });
  }

  return Activity(`${label}:exit-depth-${depth}`);
}

export async function ContainmentFrameBranchWorkflow({
  label,
  paceSeconds,
  includeLeaf,
}: ContainmentFrameArgs & { includeLeaf: boolean }): Promise<string> {
  const { workflowId } = workflow.workflowInfo();

  await Activity(`${label}:before`);
  await workflow.sleep(`${paceSeconds} seconds`);

  if (includeLeaf) {
    await workflow.executeChild(ContainmentFrameLeafWorkflow, {
      args: [{ label, paceSeconds }],
      workflowId: `${workflowId}-leaf`,
    });
  }

  await workflow.sleep(`${paceSeconds} seconds`);

  return Activity(`${label}:after`);
}

export async function ContainmentFrameContinueAsNewWorkflow({
  label,
  paceSeconds,
  remaining,
}: ContainmentFrameArgs & { remaining: number }): Promise<string> {
  await Activity(`${label}:run-with-${remaining}-remaining`);
  await workflow.sleep(`${paceSeconds * 2} seconds`);

  if (remaining > 1) {
    await workflow.continueAsNew<typeof ContainmentFrameContinueAsNewWorkflow>({
      label,
      paceSeconds,
      remaining: remaining - 1,
    });
  }

  return `${label}:chain-complete`;
}

export async function ContainmentFrameRetryWorkflow({
  label,
  paceSeconds,
}: ContainmentFrameArgs): Promise<string> {
  const { attempt } = workflow.workflowInfo();

  await Activity(`${label}:attempt-${attempt}`);
  await workflow.sleep(`${paceSeconds} seconds`);

  if (attempt < 3) {
    throw workflow.ApplicationFailure.create({
      message: `${label} failed on attempt ${attempt}`,
    });
  }

  return `${label}:succeeded-on-attempt-${attempt}`;
}

export async function ContainmentFrameRootWorkflow(
  paceSeconds = 1,
): Promise<string[]> {
  const { workflowId } = workflow.workflowInfo();

  await Activity('root:setup');

  const concurrent = await Promise.all([
    workflow.executeChild(ContainmentFrameBranchWorkflow, {
      args: [{ label: 'branch-a', paceSeconds, includeLeaf: true }],
      workflowId: `${workflowId}-branch-a`,
    }),
    workflow.executeChild(ContainmentFrameBranchWorkflow, {
      args: [{ label: 'branch-b', paceSeconds, includeLeaf: false }],
      workflowId: `${workflowId}-branch-b`,
    }),
    workflow.executeChild(ContainmentFrameContinueAsNewWorkflow, {
      args: [{ label: 'continue-chain', paceSeconds, remaining: 3 }],
      workflowId: `${workflowId}-continue-chain`,
    }),
    workflow.executeChild(ContainmentFrameRetryWorkflow, {
      args: [{ label: 'retry-chain', paceSeconds }],
      workflowId: `${workflowId}-retry-chain`,
      retry: {
        initialInterval: `${paceSeconds} seconds`,
        backoffCoefficient: 1,
        maximumAttempts: 3,
      },
    }),
  ]);

  await workflow.sleep(`${paceSeconds * 2} seconds`);

  const deep = await workflow.executeChild(ContainmentFrameDeepWorkflow, {
    args: [{ label: 'deep', paceSeconds, depth: 3 }],
    workflowId: `${workflowId}-deep-d3`,
  });

  await Activity('root:teardown');

  return [...concurrent, deep];
}

/**
 * Order-fulfillment fixture: the same shapes as the containment-frame
 * workflows — a deep nest, sibling children, a continue-as-new chain and a
 * retry chain — but named the way a real application would be, so the timeline
 * can be designed against representative labels.
 */
const {
  allocateStock,
  bookCarrier,
  capturePayment,
  generateLabel,
  notifyCustomer,
  packItems,
  renderInvoice,
  reserveInventory,
  schedulePickup,
  scoreTransaction,
  tokenizeCard,
  validateOrder,
} = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function FraudCheckWorkflow(orderId: string): Promise<string> {
  return scoreTransaction(orderId);
}

export async function PaymentWorkflow(orderId: string): Promise<string> {
  await tokenizeCard(orderId);

  await workflow.executeChild(FraudCheckWorkflow, {
    args: [orderId],
    workflowId: `fraud-check-${orderId}`,
  });

  return capturePayment(orderId);
}

export async function InventoryWorkflow(orderId: string): Promise<string> {
  return allocateStock(orderId);
}

export async function InvoiceBatchWorkflow({
  orderId,
  remainingBatches,
}: {
  orderId: string;
  remainingBatches: number;
}): Promise<string> {
  await renderInvoice(orderId);

  if (remainingBatches > 1) {
    await workflow.continueAsNew<typeof InvoiceBatchWorkflow>({
      orderId,
      remainingBatches: remainingBatches - 1,
    });
  }

  return `invoiced:${orderId}`;
}

export async function CarrierBookingWorkflow(orderId: string): Promise<string> {
  const { attempt } = workflow.workflowInfo();

  await bookCarrier(orderId);

  if (attempt < 3) {
    throw workflow.ApplicationFailure.create({
      message: `Carrier API unavailable for ${orderId} (attempt ${attempt})`,
    });
  }

  return `booked:${orderId}:attempt-${attempt}`;
}

export async function CarrierPickupWorkflow(orderId: string): Promise<string> {
  return schedulePickup(orderId);
}

export async function LabelGenerationWorkflow(
  orderId: string,
): Promise<string> {
  await generateLabel(orderId);

  await workflow.executeChild(CarrierPickupWorkflow, {
    args: [orderId],
    workflowId: `pickup-${orderId}`,
  });

  return `labelled:${orderId}`;
}

export async function PackagingWorkflow(orderId: string): Promise<string> {
  await packItems(orderId);

  await workflow.executeChild(LabelGenerationWorkflow, {
    args: [orderId],
    workflowId: `label-${orderId}`,
  });

  return `packaged:${orderId}`;
}

export async function ShipmentWorkflow(orderId: string): Promise<string> {
  await workflow.executeChild(PackagingWorkflow, {
    args: [orderId],
    workflowId: `packaging-${orderId}`,
  });

  return `shipped:${orderId}`;
}

export async function OrderFulfillmentWorkflow(
  orderId: string,
): Promise<string> {
  await validateOrder(orderId);
  await reserveInventory(orderId);

  await Promise.all([
    workflow.executeChild(PaymentWorkflow, {
      args: [orderId],
      workflowId: `payment-${orderId}`,
    }),
    workflow.executeChild(InventoryWorkflow, {
      args: [orderId],
      workflowId: `inventory-${orderId}`,
    }),
    workflow.executeChild(InvoiceBatchWorkflow, {
      args: [{ orderId, remainingBatches: 3 }],
      workflowId: `invoice-${orderId}`,
    }),
    workflow.executeChild(CarrierBookingWorkflow, {
      args: [orderId],
      workflowId: `carrier-booking-${orderId}`,
      retry: {
        initialInterval: '1 second',
        backoffCoefficient: 1,
        maximumAttempts: 3,
      },
    }),
  ]);

  await workflow.executeChild(ShipmentWorkflow, {
    args: [orderId],
    workflowId: `shipment-${orderId}`,
  });

  await notifyCustomer(orderId);

  return `fulfilled:${orderId}`;
}

/**
 * Subscription-billing fixture: a monthly billing run over an account base too
 * large to bill inside one history. The cycle rates and invoices a batch of
 * accounts, then hands the cursor to a fresh run — the textbook reason to
 * reach for continue-as-new. Dunning does the same thing three levels down,
 * one run per escalation stage, so the timeline has a chain inside a chain.
 */
const {
  applyCreditsAndDiscounts,
  calculateTax,
  chargePaymentMethod,
  closeBillingPeriod,
  emitBillingMetrics,
  issueInvoice,
  loadAccountBatch,
  postJournalEntries,
  rateUsageRecords,
  recordCollectionAttempt,
  refreshRevenueSchedule,
  sendDunningNotice,
  suspendService,
} = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

const DUNNING_STAGES = ['first-reminder', 'final-notice', 'suspension'];

export interface DunningInput {
  accountId: string;
  period: string;
  stage?: number;
}

export async function DunningWorkflow({
  accountId,
  period,
  stage = 1,
}: DunningInput): Promise<string> {
  const name = DUNNING_STAGES[stage - 1] ?? 'suspension';

  await sendDunningNotice(`${accountId}:${period}:${name}`);

  // A dunning sequence spans weeks of waiting. One run per stage keeps each
  // history small and makes the escalation legible as a chain.
  if (stage < DUNNING_STAGES.length) {
    await workflow.continueAsNew<typeof DunningWorkflow>({
      accountId,
      period,
      stage: stage + 1,
    });
  }

  await suspendService(accountId);

  return `dunned:${accountId}`;
}

export interface PaymentCollectionInput {
  accountId: string;
  period: string;
  declined: boolean;
  gatewayTimeout: boolean;
}

export async function PaymentCollectionWorkflow({
  accountId,
  period,
  declined,
  gatewayTimeout,
}: PaymentCollectionInput): Promise<string> {
  const { attempt } = workflow.workflowInfo();

  await recordCollectionAttempt(`${accountId}:${period}:attempt-${attempt}`);

  if (gatewayTimeout && attempt < 2) {
    throw workflow.ApplicationFailure.create({
      message: `Payment gateway timed out for ${accountId} (attempt ${attempt})`,
    });
  }

  if (declined) {
    await workflow.executeChild(DunningWorkflow, {
      args: [{ accountId, period }],
      workflowId: `dunning-${accountId}-${period}`,
    });

    return `escalated:${accountId}`;
  }

  await chargePaymentMethod(`${accountId}:${period}`);

  return `collected:${accountId}`;
}

export interface AccountInvoicingInput {
  accountId: string;
  period: string;
  declined: boolean;
  gatewayTimeout: boolean;
}

export async function AccountInvoicingWorkflow({
  accountId,
  period,
  declined,
  gatewayTimeout,
}: AccountInvoicingInput): Promise<string> {
  await issueInvoice(`${accountId}:${period}`);

  await workflow.executeChild(PaymentCollectionWorkflow, {
    args: [{ accountId, period, declined, gatewayTimeout }],
    workflowId: `collection-${accountId}-${period}`,
    retry: {
      initialInterval: '1 second',
      backoffCoefficient: 1,
      maximumAttempts: 3,
    },
  });

  return `invoiced:${accountId}`;
}

export interface BillingCycleInput {
  cycleId: string;
  period: string;
  batch?: number;
  remainingBatches?: number;
  accountsPerBatch?: number;
}

export async function BillingCycleWorkflow({
  cycleId,
  period,
  batch = 1,
  remainingBatches = 3,
  accountsPerBatch = 4,
}: BillingCycleInput): Promise<string> {
  const cursor = `${period}:batch-${batch}`;
  const firstAccount = 10001 + (batch - 1) * accountsPerBatch;
  const accountIds = Array.from(
    { length: accountsPerBatch },
    (_, index) => `acct-${firstAccount + index}`,
  );

  await loadAccountBatch(cursor);
  await rateUsageRecords(cursor);

  await Promise.all([
    (async () => {
      await applyCreditsAndDiscounts(cursor);
      await calculateTax(cursor);
    })(),
    (async () => {
      await postJournalEntries(cursor);
      await refreshRevenueSchedule(cursor);
    })(),
    ...accountIds.map((accountId, index) =>
      workflow.executeChild(AccountInvoicingWorkflow, {
        args: [
          {
            accountId,
            period,
            declined: index % 3 === 0,
            gatewayTimeout: index % 4 === 1,
          },
        ],
        workflowId: `invoicing-${accountId}-${period}`,
      }),
    ),
  ]);

  await emitBillingMetrics(cursor);

  // The account base does not fit in one history, so each batch hands the
  // cursor to a fresh run. The chain is what makes the cycle resumable.
  if (remainingBatches > 1) {
    await workflow.continueAsNew<typeof BillingCycleWorkflow>({
      cycleId,
      period,
      batch: batch + 1,
      remainingBatches: remainingBatches - 1,
      accountsPerBatch,
    });
  }

  await closeBillingPeriod(cycleId);

  return `billed:${cycleId}`;
}

/**
 * Lanes scenario fixtures: three workflows of rising complexity that between
 * them end in every status and use every primitive the Lanes view draws —
 * activities and local activities, retries, timers, signals, updates, child
 * workflows that complete, fail, time out, get cancelled or terminated, and a
 * continue-as-new chain.
 */
const {
  createAccount,
  provisionWorkspace,
  scheduleDripEmail,
  sendWelcomeEmail,
  notifyCustomerOfRefund,
  scoreRefundRisk,
  fetchCatalogPage,
  upsertProducts,
  rebuildPriceIndex,
  publishCatalog,
} = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

const { normalizeEmail, checkRefundPolicy, loadSyncCursor } =
  workflow.proxyLocalActivities<typeof activities>({
    startToCloseTimeout: '10 seconds',
  });

// Task queues the scenario script staffs late (a backlog) or never (nobody
// owns them), so activities on them sit waiting for a worker.
export const LANES_BACKLOG_TASK_QUEUE = 'lanes-scenarios-backlog';
export const LANES_UNSTAFFED_TASK_QUEUE = 'lanes-scenarios-unstaffed';

const { lookupOrder: lookupOrderOnBacklog } = workflow.proxyActivities<
  typeof activities
>({
  taskQueue: LANES_BACKLOG_TASK_QUEUE,
  startToCloseTimeout: '1 minute',
});

const { notifySalesTeam } = workflow.proxyActivities<typeof activities>({
  taskQueue: LANES_UNSTAFFED_TASK_QUEUE,
  startToCloseTimeout: '1 minute',
});

const { syncCrmContact } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    initialInterval: '2 seconds',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
  },
});

const { holdInventory } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  heartbeatTimeout: '5 seconds',
  cancellationType:
    workflow.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
});

const { issueRefund, fetchRegionalOverrides } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
  retry: { initialInterval: '1 second', backoffCoefficient: 1 },
});

export const emailVerifiedSignal = workflow.defineSignal('email-verified');
export const choosePlanUpdate = workflow.defineUpdate<string, [string]>(
  'choose-plan',
);

/** Runs alongside a trial, sending its drip emails; still waiting on day 3. */
export async function OnboardingDripWorkflow(email: string): Promise<string> {
  await scheduleDripEmail(`${email}:day-1`);
  await workflow.sleep('3 days');
  await scheduleDripEmail(`${email}:day-3`);
  return `dripped:${email}`;
}

/**
 * Simple, and still running: a trial signup that waits for the user to
 * verify their email and pick a plan, then keeps trying to reach a CRM that
 * rate-limits every call, while its drip campaign waits on a timer.
 */
export async function TrialSignupWorkflow(email: string): Promise<string> {
  let verified = false;
  let plan = 'free';
  workflow.setHandler(emailVerifiedSignal, () => void (verified = true));
  workflow.setHandler(choosePlanUpdate, (chosen) => {
    plan = chosen;
    return `plan:${chosen}`;
  });

  const normalized = await normalizeEmail(email);
  await createAccount(normalized);
  await sendWelcomeEmail(normalized);

  await workflow.condition(() => verified, '1 hour');
  await provisionWorkspace(`${normalized}:${plan}`);

  await Promise.all([
    workflow.executeChild(OnboardingDripWorkflow, {
      args: [normalized],
      workflowId: `${workflow.workflowInfo().workflowId}-drip`,
    }),
    syncCrmContact(normalized),
    notifySalesTeam(normalized),
    workflow.sleep('14 days'),
  ]);

  return `trial-ended:${normalized}`;
}

/** A fraud check that takes far longer than the refund will wait for it. */
export async function FraudReviewWorkflow(orderId: string): Promise<string> {
  await scoreRefundRisk(orderId);
  await workflow.sleep('1 minute');
  return `reviewed:${orderId}`;
}

export async function RefundNotificationWorkflow(
  orderId: string,
): Promise<string> {
  await notifyCustomerOfRefund(orderId);
  return `notified:${orderId}`;
}

/**
 * Medium, and failed: a refund that gives up on a slow fraud review (the
 * child times out), releases the stock it was holding (the activity is
 * cancelled), tells the customer, then fails for good when the card turns out
 * to be closed after two gateway timeouts.
 */
export async function RefundRequestWorkflow(orderId: string): Promise<string> {
  await lookupOrderOnBacklog(orderId);
  await checkRefundPolicy(orderId);

  try {
    await workflow.executeChild(FraudReviewWorkflow, {
      args: [orderId],
      workflowId: `${workflow.workflowInfo().workflowId}-fraud-review`,
      workflowExecutionTimeout: '3 seconds',
    });
  } catch (error) {
    if (!(error instanceof workflow.ChildWorkflowFailure)) throw error;
  }

  const hold = new workflow.CancellationScope();
  const held = hold.run(() => holdInventory(orderId));
  await workflow.sleep('2 seconds');
  hold.cancel();
  try {
    await held;
  } catch (error) {
    if (!workflow.isCancellation(error)) throw error;
  }

  await workflow.executeChild(RefundNotificationWorkflow, {
    args: [orderId],
    workflowId: `${workflow.workflowInfo().workflowId}-notification`,
  });

  await issueRefund(orderId);

  return `refunded:${orderId}`;
}

export const manifestReadySignal = workflow.defineSignal('manifest-ready');
export const publishSignal = workflow.defineSignal('publish');
export const rebalanceShardsUpdate = workflow.defineUpdate<number, [number]>(
  'rebalance-shards',
);

export async function PriceIndexWorkflow(region: string): Promise<string> {
  await rebuildPriceIndex(region);
  return `indexed:${region}`;
}

export interface RegionSyncInput {
  region: string;
  page: number;
  flakyOverrides?: boolean;
  waitForManifest?: boolean;
}

/**
 * One region's share of a catalog page. Some regions wait on a manifest that
 * never comes (and get terminated), some hit a flaky overrides service, and
 * every region that finishes rebuilds its price index in a grandchild.
 */
export async function RegionSyncWorkflow({
  region,
  page,
  flakyOverrides = false,
  waitForManifest = false,
}: RegionSyncInput): Promise<string> {
  let manifestReady = false;
  workflow.setHandler(manifestReadySignal, () => void (manifestReady = true));

  if (waitForManifest) {
    await workflow.condition(() => manifestReady, '10 minutes');
  }

  await upsertProducts(`${region}:page-${page}`);
  if (flakyOverrides) await fetchRegionalOverrides(region);
  await workflow.sleep('2 seconds');

  await workflow.executeChild(PriceIndexWorkflow, {
    args: [region],
    workflowId: `${workflow.workflowInfo().workflowId}-price-index`,
  });

  return `synced:${region}:${page}`;
}

export interface CatalogSyncInput {
  syncId: string;
  page?: number;
  pages?: number;
}

/**
 * Complex, and completed as a chain: each page fans out to regional syncs in
 * parallel. On the first page APAC waits on a manifest until an operator
 * terminates it; on the second the sync gives up on LATAM and cancels it, is
 * rebalanced by an update and waits for a publish signal. Each page is its
 * own run, handed on with continue-as-new.
 */
export async function CatalogSyncWorkflow({
  syncId,
  page = 1,
  pages = 2,
}: CatalogSyncInput): Promise<string> {
  let published = false;
  let shards = 4;
  workflow.setHandler(publishSignal, () => void (published = true));
  workflow.setHandler(rebalanceShardsUpdate, (count) => {
    shards = count;
    return shards;
  });

  const cursor = await loadSyncCursor(page);
  await fetchCatalogPage(cursor);

  const region = (name: string, options: Partial<RegionSyncInput> = {}) =>
    workflow.executeChild(RegionSyncWorkflow, {
      args: [{ region: name, page, ...options }],
      workflowId: `${syncId}-p${page}-${name}`,
    });
  const tolerate = async (pending: Promise<unknown>) => {
    try {
      await pending;
    } catch (error) {
      if (
        !(error instanceof workflow.ChildWorkflowFailure) &&
        !workflow.isCancellation(error)
      ) {
        throw error;
      }
    }
  };

  if (page === 1) {
    await Promise.all([
      region('us'),
      region('eu', { flakyOverrides: true }),
      tolerate(region('apac', { waitForManifest: true })),
    ]);
  } else {
    const latamScope = new workflow.CancellationScope();
    const latam = latamScope.run(() =>
      workflow.executeChild(RegionSyncWorkflow, {
        args: [{ region: 'latam', page, waitForManifest: true }],
        workflowId: `${syncId}-p${page}-latam`,
        cancellationType:
          workflow.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
      }),
    );
    await Promise.all([
      region('us'),
      region('eu'),
      (async () => {
        await workflow.sleep('3 seconds');
        latamScope.cancel();
        await tolerate(latam);
      })(),
    ]);
    await workflow.condition(() => published, '2 minutes');
  }

  await publishCatalog(`${cursor}:shards-${shards}`);

  if (page < pages) {
    await workflow.continueAsNew<typeof CatalogSyncWorkflow>({
      syncId,
      page: page + 1,
      pages,
    });
  }

  return `catalog-synced:${syncId}`;
}
