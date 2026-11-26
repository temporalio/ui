/**
 * Performance test: run HighVolumeEventWorkflow which generates a mixed
 * history of activities, timers, child workflows, and signals.
 *
 * Usage:
 *   pnpm perf:events                    # 40 000 target events
 *   pnpm perf:events --target 10000     # custom target
 *   pnpm perf:events --no-worker        # use already-running worker
 */

import yargs from 'yargs/yargs';

import { connect } from '../temporal/client';
import { runWorker, stopWorker } from '../temporal/worker';
import { HighVolumeEventWorkflow } from '../temporal/workflows';

const argv = await yargs(process.argv.slice(2))
  .option('target', {
    type: 'number',
    default: 40_000,
    describe: 'Target history event count',
  })
  .option('worker', {
    type: 'boolean',
    default: true,
    describe: 'Start embedded Temporal worker',
  })
  .parse();

const TARGET: number = argv.target;
const WORKFLOW_ID = `perf-events-${Date.now()}`;

async function main() {
  console.log('\n🚀 Temporal mixed-event perf test');
  console.log(`   Target events : ${TARGET.toLocaleString()}`);
  console.log(
    '   Mix           : activities · timers · child workflows · signals',
  );
  console.log(`   Workflow      : ${WORKFLOW_ID}\n`);

  if (argv.worker) {
    console.log('⏳ Starting embedded worker...');
    await runWorker();
  }

  const client = await connect();

  console.log('⏳ Starting HighVolumeEventWorkflow...');
  const handle = await client.workflow.start(HighVolumeEventWorkflow, {
    taskQueue: 'e2e-1',
    workflowId: WORKFLOW_ID,
    args: [TARGET],
  });

  console.log(`✅ Workflow started: ${handle.workflowId}`);
  console.log(
    `\n⚙️  Generating ${TARGET.toLocaleString()} history events...\n`,
  );

  const startMs = performance.now();
  let lastLogMs = startMs;
  let lastCount = 0;

  const poller = setInterval(async () => {
    try {
      const desc = await client.workflow.describe(WORKFLOW_ID);
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

  const result = await handle.result();
  clearInterval(poller);

  const totalMs = performance.now() - startMs;

  console.log(`\n✅ Done in ${(totalMs / 1000).toFixed(1)}s`);
  console.log('\n📊 Workflow result:');
  console.log(`   History events : ${result.historyLength.toLocaleString()}`);
  console.log(`   Activities     : ${result.activities.toLocaleString()}`);
  console.log(`   Timers         : ${result.timers.toLocaleString()}`);
  console.log(`   Child workflows: ${result.children.toLocaleString()}`);
  console.log(`   Signals recv'd : ${result.signals.toLocaleString()}`);
  if (result.durationMs) {
    console.log(
      `   Workflow span  : ${(result.durationMs / 1000).toFixed(1)}s`,
    );
    console.log(
      `   Event rate     : ${Math.round(result.historyLength / (result.durationMs / 1000)).toLocaleString()} ev/s`,
    );
  }
  console.log(`\n   Workflow ID: ${WORKFLOW_ID}`);
  console.log('   → Load in UI to test fast-history performance\n');

  if (argv.worker) {
    await stopWorker();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
