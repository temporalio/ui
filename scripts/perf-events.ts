/**
 * Performance test: run HighVolumeEventWorkflow histories with selectable event
 * mixes for timeline load and scroll testing.
 *
 * Usage:
 *   pnpm perf:events
 *   pnpm perf:events --profile all --target 20000
 *   pnpm perf:events --profile signal-heavy --signal-count 30000
 *   pnpm perf:events --no-worker
 */

import yargs from 'yargs/yargs';

import { connect } from '../temporal/client';
import { runWorker, stopWorker } from '../temporal/worker';
import {
  type HighVolumeEventProfile,
  HighVolumeEventWorkflow,
} from '../temporal/workflows';

const profiles = [
  'mixed',
  'activity-heavy',
  'timer-heavy',
  'child-heavy',
  'signal-heavy',
  'bursty',
] as const satisfies readonly HighVolumeEventProfile[];

type ProfileArg = HighVolumeEventProfile | 'all';

type SignalHandle = {
  workflowId: string;
  firstExecutionRunId?: string;
  signal: (name: string, payload: { seq: number }) => Promise<void>;
};

const argv = await yargs(process.argv.slice(2))
  .option('target', {
    type: 'number',
    default: 40_000,
    describe: 'Target history event count per workflow',
  })
  .option('profile', {
    type: 'string',
    default: 'mixed',
    choices: [...profiles, 'all'],
    describe: 'History mix to generate',
  })
  .option('signal-count', {
    type: 'number',
    default: 0,
    describe: 'Signal budget for signal-heavy and mixed profiles',
  })
  .option('signal-concurrency', {
    type: 'number',
    default: 50,
    describe: 'Max in-flight signal requests for event profiles',
  })
  .option('ui-base-url', {
    type: 'string',
    default: 'http://localhost:3000',
    describe: 'UI base URL printed with timeline_perf=1 links',
  })
  .option('namespace', {
    type: 'string',
    default: 'default',
    describe: 'Namespace for printed UI links',
  })
  .option('worker', {
    type: 'boolean',
    default: true,
    describe: 'Start embedded Temporal worker',
  })
  .parse();

const TARGET: number = argv.target;
const SIGNAL_CONCURRENCY: number = argv.signalConcurrency;
const selectedProfiles =
  (argv.profile as ProfileArg) === 'all'
    ? profiles
    : [argv.profile as HighVolumeEventProfile];

const timelineUrl = (workflowId: string, runId = ''): string => {
  const base = argv.uiBaseUrl.replace(/\/$/, '');
  return `${base}/namespaces/${argv.namespace}/workflows/${workflowId}/${runId}/timeline?timeline_perf=1`;
};

const signalBudgetFor = (profile: HighVolumeEventProfile): number => {
  if (argv.signalCount) return argv.signalCount;
  if (profile === 'signal-heavy') return TARGET;
  if (profile === 'bursty') return Math.min(5_000, Math.ceil(TARGET / 4));
  if (profile === 'mixed') return Math.min(2_000, Math.ceil(TARGET / 10));
  return 0;
};

async function sendSignals(
  handle: SignalHandle,
  count: number,
  concurrency: number,
  isDone: () => boolean,
): Promise<number> {
  if (!count) return 0;

  let sent = 0;
  let acknowledged = 0;
  let inFlight = 0;

  await new Promise<void>((resolve) => {
    const dispatch = () => {
      while (!isDone() && inFlight < concurrency && sent < count) {
        const seq = sent++;
        inFlight++;
        handle
          .signal('hv-event-signal', { seq })
          .then(() => {
            acknowledged++;
          })
          .catch(() => undefined)
          .finally(() => {
            inFlight--;
            if ((sent >= count || isDone()) && inFlight === 0) {
              resolve();
            } else {
              dispatch();
            }
          });
      }

      if ((sent >= count || isDone()) && inFlight === 0) resolve();
    };

    dispatch();
  });

  return acknowledged;
}

async function runProfile(
  client: Awaited<ReturnType<typeof connect>>,
  profile: HighVolumeEventProfile,
  index: number,
): Promise<void> {
  const workflowId = `perf-events-${profile}-${Date.now()}-${index}`;
  const signalBudget = signalBudgetFor(profile);

  console.log(`\n🚀 Temporal event perf test: ${profile}`);
  console.log(`   Target events : ${TARGET.toLocaleString()}`);
  console.log(`   Signal budget : ${signalBudget.toLocaleString()}`);
  console.log(`   Workflow      : ${workflowId}\n`);

  const handle = await client.workflow.start(HighVolumeEventWorkflow, {
    taskQueue: 'e2e-1',
    workflowId,
    args: [TARGET, profile],
  });

  console.log(`✅ Workflow started: ${handle.workflowId}`);
  console.log(
    `   UI: ${timelineUrl(handle.workflowId, handle.firstExecutionRunId)}\n`,
  );

  const startMs = performance.now();
  let lastLogMs = startMs;
  let lastCount = 0;
  let done = false;

  const poller = setInterval(async () => {
    try {
      const desc = await client.workflow.describe(workflowId);
      const count = desc.historyLength ?? 0;
      const now = performance.now();
      const elapsed = ((now - startMs) / 1000).toFixed(1);
      const rate = Math.round((count - lastCount) / ((now - lastLogMs) / 1000));
      const pct = Math.min(100, Math.round((count / TARGET) * 100));
      console.log(
        `  [${elapsed}s] ${count.toLocaleString()} / ${TARGET.toLocaleString()} events (${pct}%) · ${rate.toLocaleString()} ev/s`,
      );
      lastLogMs = now;
      lastCount = count;
    } catch {
      // workflow may not be describable yet
    }
  }, 3000);

  const resultPromise = handle.result().finally(() => {
    done = true;
  });
  const signalPromise = sendSignals(
    handle as unknown as SignalHandle,
    signalBudget,
    SIGNAL_CONCURRENCY,
    () => done,
  );

  const [result, signalsSent] = await Promise.all([
    resultPromise,
    signalPromise,
  ]);
  clearInterval(poller);

  const totalMs = performance.now() - startMs;

  console.log(`\n✅ ${profile} done in ${(totalMs / 1000).toFixed(1)}s`);
  console.log('📊 Workflow result:');
  console.log(`   History events : ${result.historyLength.toLocaleString()}`);
  console.log(`   Activities     : ${result.activities.toLocaleString()}`);
  console.log(`   Timers         : ${result.timers.toLocaleString()}`);
  console.log(`   Child workflows: ${result.children.toLocaleString()}`);
  console.log(`   Signals sent   : ${signalsSent.toLocaleString()}`);
  console.log(`   Signals recv'd : ${result.signals.toLocaleString()}`);
  console.log(`   Workflow span  : ${(result.durationMs / 1000).toFixed(1)}s`);
  const eventRate =
    result.durationMs > 0
      ? `${Math.round(result.historyLength / (result.durationMs / 1000)).toLocaleString()} ev/s`
      : 'n/a (<1ms span)';
  console.log(`   Event rate     : ${eventRate}`);
  console.log(`   Workflow ID    : ${workflowId}`);
  console.log(
    `   UI             : ${timelineUrl(handle.workflowId, handle.firstExecutionRunId)}\n`,
  );
}

async function main() {
  console.log('\n🚀 Temporal event perf profiles');
  console.log(`   Profiles: ${selectedProfiles.join(', ')}`);

  if (argv.worker) {
    console.log('⏳ Starting embedded worker...');
    await runWorker();
  }

  const client = await connect();

  try {
    for (const [index, profile] of selectedProfiles.entries()) {
      await runProfile(client, profile, index);
    }
  } finally {
    if (argv.worker) {
      await stopWorker();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
