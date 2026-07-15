/**
 * Performance test: start a HighVolumeSignalWorkflow and hammer it with 10k
 * perf-signal signals, measuring throughput and latency.
 *
 * Usage:
 *   pnpm perf:signals                  # 10 000 steady signals, concurrency 50
 *   pnpm perf:signals --count 5000     # custom count
 *   pnpm perf:signals --concurrency 100
 *   pnpm perf:signals --profile all
 *   pnpm perf:signals --profile payload-heavy --payload-bytes 4096
 *   pnpm perf:signals --no-worker      # skip starting the embedded worker
 */

import yargs from 'yargs/yargs';

import { connect } from '../temporal/client';
import { runWorker, stopWorker } from '../temporal/worker';
import { HighVolumeSignalWorkflow } from '../temporal/workflows';

const profiles = ['steady', 'burst', 'payload-heavy'] as const;
type SignalProfile = (typeof profiles)[number];
type ProfileArg = SignalProfile | 'all';

type SignalHandle = {
  workflowId: string;
  firstExecutionRunId?: string;
  signal: (
    name: string,
    payload: { seq: number; data: string },
  ) => Promise<void>;
  result: () => Promise<{
    received: number;
    target: number;
    durationMs: number | null;
  }>;
};

const argv = await yargs(process.argv.slice(2))
  .option('count', {
    type: 'number',
    default: 10_000,
    describe: 'Signal count',
  })
  .option('concurrency', {
    type: 'number',
    default: 50,
    describe: 'Max in-flight signal requests',
  })
  .option('profile', {
    type: 'string',
    default: 'steady',
    choices: [...profiles, 'all'],
    describe: 'Signal workload profile',
  })
  .option('payload-bytes', {
    type: 'number',
    default: 0,
    describe: 'Payload string bytes per signal',
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

const SIGNAL_COUNT: number = argv.count;
const CONCURRENCY: number = argv.concurrency;
const selectedProfiles =
  (argv.profile as ProfileArg) === 'all'
    ? profiles
    : [argv.profile as SignalProfile];

const timelineUrl = (workflowId: string, runId = ''): string => {
  const base = argv.uiBaseUrl.replace(/\/$/, '');
  return `${base}/namespaces/${argv.namespace}/workflows/${workflowId}/${runId}/timeline?timeline_perf=1`;
};

const profileConfig = (
  profile: SignalProfile,
): { count: number; concurrency: number; payloadBytes: number } => {
  if (profile === 'burst') {
    return {
      count: SIGNAL_COUNT,
      concurrency: Math.max(CONCURRENCY, 200),
      payloadBytes: argv.payloadBytes,
    };
  }
  if (profile === 'payload-heavy') {
    return {
      count: Math.min(SIGNAL_COUNT, 5_000),
      concurrency: CONCURRENCY,
      payloadBytes: Math.max(argv.payloadBytes, 2048),
    };
  }
  return {
    count: SIGNAL_COUNT,
    concurrency: CONCURRENCY,
    payloadBytes: argv.payloadBytes,
  };
};

const payloadFor = (seq: number, payloadBytes: number): string => {
  if (!payloadBytes) return `signal-${seq}`;
  return `${seq}:`.padEnd(payloadBytes, 'x');
};

async function sendSignals(
  handle: SignalHandle,
  count: number,
  concurrency: number,
  payloadBytes: number,
): Promise<void> {
  let sent = 0;
  let inFlight = 0;
  const errors: Error[] = [];
  const startMs = performance.now();
  let lastLogMs = startMs;

  await new Promise<void>((resolve, reject) => {
    const dispatch = () => {
      while (inFlight < concurrency && sent < count) {
        const seq = sent;
        sent++;
        inFlight++;

        handle
          .signal('perf-signal', { seq, data: payloadFor(seq, payloadBytes) })
          .then(() => {
            inFlight--;

            const now = performance.now();
            if (now - lastLogMs >= 2000) {
              const elapsed = ((now - startMs) / 1000).toFixed(1);
              const throughput = Math.round(sent / ((now - startMs) / 1000));
              console.log(
                `  [${elapsed}s] sent ${sent}/${count} (${throughput} sig/s, ${inFlight} in-flight)`,
              );
              lastLogMs = now;
            }

            if (sent === count && inFlight === 0) {
              resolve();
            } else {
              dispatch();
            }
          })
          .catch((err: Error) => {
            errors.push(err);
            inFlight--;
            if (errors.length > 10) {
              reject(new Error(`Too many signal errors: ${errors[0].message}`));
            } else if (sent === count && inFlight === 0) {
              resolve();
            } else {
              dispatch();
            }
          });
      }

      if (sent === count && inFlight === 0) resolve();
    };

    dispatch();
  });

  const totalMs = performance.now() - startMs;
  if (errors.length) {
    console.warn(`  ⚠ ${errors.length} signal(s) failed`);
  }

  console.log('\n📊 Signal send stats');
  console.log(`   Signals sent : ${sent - errors.length} / ${count}`);
  console.log(`   Errors       : ${errors.length}`);
  console.log(`   Wall time    : ${(totalMs / 1000).toFixed(2)}s`);
  console.log(
    `   Throughput   : ${Math.round(count / (totalMs / 1000))} sig/s`,
  );
}

async function runProfile(
  client: Awaited<ReturnType<typeof connect>>,
  profile: SignalProfile,
  index: number,
): Promise<void> {
  const config = profileConfig(profile);
  const workflowId = `perf-signals-${profile}-${Date.now()}-${index}`;

  console.log(`\n🚀 Temporal signal perf test: ${profile}`);
  console.log(`   Signals      : ${config.count.toLocaleString()}`);
  console.log(`   Concurrency  : ${config.concurrency}`);
  console.log(`   Payload bytes: ${config.payloadBytes}`);
  console.log(`   Workflow     : ${workflowId}\n`);

  console.log('⏳ Starting HighVolumeSignalWorkflow...');
  const handle = await client.workflow.start(HighVolumeSignalWorkflow, {
    taskQueue: 'e2e-1',
    workflowId,
    args: [config.count],
  });

  console.log(`✅ Workflow started: ${handle.workflowId}`);
  console.log(
    `   UI: ${timelineUrl(handle.workflowId, handle.firstExecutionRunId)}`,
  );
  console.log(
    `\n📤 Sending ${config.count.toLocaleString()} signals (concurrency=${config.concurrency})...\n`,
  );

  await sendSignals(
    handle as unknown as SignalHandle,
    config.count,
    config.concurrency,
    config.payloadBytes,
  );

  console.log('\n⏳ Waiting for workflow to complete...');
  const t0 = performance.now();
  const result = await handle.result();
  const waitMs = performance.now() - t0;

  console.log(
    `\n✅ Workflow completed in ${(waitMs / 1000).toFixed(2)}s after receiving all signals`,
  );
  console.log('\n📊 Workflow result:');
  console.log(
    `   Received     : ${result.received.toLocaleString()} / ${result.target.toLocaleString()}`,
  );
  if (result.durationMs !== null) {
    console.log(
      `   History span : ${(result.durationMs / 1000).toFixed(2)}s (first → last signal timestamp)`,
    );
    const historyRate =
      result.durationMs > 0
        ? `${Math.round(result.received / (result.durationMs / 1000))} sig/s`
        : 'n/a (<1ms span)';
    console.log(`   History rate : ${historyRate}`);
  }

  console.log(`\n   Workflow ID: ${workflowId}`);
  console.log(
    `   UI         : ${timelineUrl(handle.workflowId, handle.firstExecutionRunId)}\n`,
  );
}

async function main() {
  console.log('\n🚀 Temporal signal perf profiles');
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
