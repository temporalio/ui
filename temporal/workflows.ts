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

const { double } = workflow.proxyActivities<typeof activities>({
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
  // No maximumAttempts → retries indefinitely (0 is rejected as non-positive).
  retry: {
    initialInterval: '5 minutes',
    backoffCoefficient: 1.5,
    maximumInterval: '30 minutes',
  },
});

// Fast, endless retry so the pending activity's attempt count climbs on a
// human-watchable cadence (used by TimelineFixVerificationWorkflow). No
// maximumAttempts → retries indefinitely (0 is rejected as non-positive).
const { alwaysFails: fastRetry } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: {
    initialInterval: '10 seconds',
    backoffCoefficient: 1,
    maximumInterval: '10 seconds',
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
 * Child workflow that completes after ~90s so the parent's timeline shows a
 * child-workflow dot flip from in-progress to completed live.
 */
export async function VerificationChildWorkflow(): Promise<string> {
  await workflow.sleep('90 seconds');
  return 'child done';
}

/**
 * Manual verification harness for the timeline live-refresh fixes. Runs in
 * parallel and stays open ~1 hour:
 *
 *   Issue #1 (stuck "in progress"): a steady cadence of ~60s activities and
 *   ~90s child workflows keeps completing, so there is always something in
 *   progress to watch flip to done LIVE — no page refresh.
 *
 *   Issue #2 (commands/values not reflecting): a long-pending activity and a
 *   fast-retrying activity to pause / unpause / edit options on, and watch the
 *   UI reflect the change LIVE — no page refresh. The retrying activity's
 *   attempt count also climbs on a ~10s cadence.
 */
export async function TimelineFixVerificationWorkflow(): Promise<void> {
  await Activity('setup');

  const steadyActivities = (async () => {
    for (let i = 0; i < 60; i++) await longSleep(60_000);
  })();

  const steadyChildren = (async () => {
    for (let i = 0; i < 40; i++) {
      await workflow.executeChild(VerificationChildWorkflow, {
        workflowId: `${workflow.workflowInfo().workflowId}-child-${i}`,
        taskQueue: 'e2e-1',
      });
    }
  })();

  await Promise.all([
    steadyActivities,
    steadyChildren,
    longSleep(60 * 60 * 1000),
    fastRetry(workflow.workflowInfo().attempt),
  ]);
}
