/**
 * Performance test: start a HighVolumeSignalWorkflow and hammer it with 10k
 * perf-signal signals, measuring throughput and latency.
 *
 * Usage:
 *   pnpm perf:signals                  # 10 000 signals, concurrency 50
 *   pnpm perf:signals --count 5000     # custom count
 *   pnpm perf:signals --concurrency 100
 *   pnpm perf:signals --no-worker      # skip starting the embedded worker
 */

import yargs from 'yargs/yargs';

import { connect } from '../temporal/client';
import { runWorker, stopWorker } from '../temporal/worker';
import { HighVolumeSignalWorkflow } from '../temporal/workflows';

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
  .option('worker', {
    type: 'boolean',
    default: true,
    describe: 'Start embedded Temporal worker',
  })
  .parse();

const SIGNAL_COUNT: number = argv.count;
const CONCURRENCY: number = argv.concurrency;
const WORKFLOW_ID = `perf-signals-${Date.now()}`;

async function sendSignals(
  handle: Awaited<
    ReturnType<(typeof import('../temporal/client'))['connect']>
  > extends never
    ? never
    : Awaited<ReturnType<typeof connect>> extends infer C
      ? C extends { workflow: { getHandle(id: string): infer H } }
        ? H
        : never
      : never,
  count: number,
  concurrency: number,
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
          .signal('perf-signal', { seq, data: `signal-${seq}` })
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

async function main() {
  console.log('\n🚀 Temporal signal perf test');
  console.log(`   Signals    : ${SIGNAL_COUNT.toLocaleString()}`);
  console.log(`   Concurrency: ${CONCURRENCY}`);
  console.log(`   Workflow   : ${WORKFLOW_ID}\n`);

  if (argv.worker) {
    console.log('⏳ Starting embedded worker...');
    await runWorker();
  }

  const client = await connect();

  console.log('⏳ Starting HighVolumeSignalWorkflow...');
  const handle = await client.workflow.start(HighVolumeSignalWorkflow, {
    taskQueue: 'e2e-1',
    workflowId: WORKFLOW_ID,
    args: [SIGNAL_COUNT],
  });

  console.log(`✅ Workflow started: ${handle.workflowId}`);
  console.log(
    `\n📤 Sending ${SIGNAL_COUNT.toLocaleString()} signals (concurrency=${CONCURRENCY})...\n`,
  );

  await sendSignals(handle as never, SIGNAL_COUNT, CONCURRENCY);

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
    console.log(
      `   History rate : ${Math.round(result.received / (result.durationMs / 1000))} sig/s`,
    );
  }

  if (argv.worker) {
    await stopWorker();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
