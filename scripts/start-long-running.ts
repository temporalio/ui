/**
 * Starts long-running "open" workflows for auto-refresh and timeline testing.
 * Each workflow stays open for 10-25 minutes, covering every pending-state type:
 *
 *   pending-activity        – single long-running activity (15 min)
 *   pending-timer           – three parallel timers (12 / 16 / 20 min)
 *   pending-child           – parent waiting on a 20-min child workflow
 *   retrying-activity       – activity that always fails, retrying with backoff
 *   concurrent-pending      – five parallel 11-19 min activities
 *   signal-update-wait-a/b  – blocked on signal + update handler, two instances
 *   mixed-open              – timer → child → long activity in sequence
 *
 * Usage:
 *   pnpm tsx scripts/start-long-running.ts
 */

import { createRequire } from 'node:module';

import { Client, Connection } from '@temporalio/client';
import { Worker } from '@temporalio/worker';

import * as activities from '../temporal/activities/index';
import { getDataConverter } from '../temporal/data-converter';
import {
  ConcurrentPendingWorkflow,
  LongSleepChildWorkflow,
  MixedOpenWorkflow,
  PendingActivityWorkflow,
  PendingChildWorkflow,
  PendingTimerWorkflow,
  RetryingActivityWorkflow,
  SignalUpdateWaitWorkflow,
} from '../temporal/workflows';

const require = createRequire(import.meta.url);

async function main() {
  const connection = await Connection.connect();
  const dataConverter = await getDataConverter();

  const client = new Client({ connection, dataConverter });

  const worker = await Worker.create({
    dataConverter,
    workflowsPath: require.resolve('../temporal/workflows'),
    activities,
    taskQueue: 'e2e-1',
  });

  console.log('✨ worker starting…');
  worker.run();

  const started: string[] = [];

  async function start<A extends unknown[]>(
    workflowFn: (...args: A) => Promise<unknown>,
    id: string,
    args: A,
  ) {
    try {
      await client.workflow.start(workflowFn, {
        taskQueue: 'e2e-1',
        workflowId: id,
        args,
      });
      console.log(`▶  started ${id}`);
      started.push(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        console.log(`⏭  skipped ${id} (already running)`);
      } else {
        console.error(`✗  failed  ${id}:`, msg);
      }
    }
  }

  await start(PendingActivityWorkflow, 'lr-pending-activity', []);
  await start(PendingTimerWorkflow, 'lr-pending-timer', []);
  await start(PendingChildWorkflow, 'lr-pending-child', []);
  await start(LongSleepChildWorkflow, 'lr-standalone-child', []);
  await start(RetryingActivityWorkflow, 'lr-retrying-activity', []);
  await start(ConcurrentPendingWorkflow, 'lr-concurrent-pending', []);
  await start(SignalUpdateWaitWorkflow, 'lr-signal-update-a', ['alpha']);
  await start(SignalUpdateWaitWorkflow, 'lr-signal-update-b', ['beta']);
  await start(MixedOpenWorkflow, 'lr-mixed-open', []);

  console.log(`\n✅ started ${started.length} long-running workflow(s).`);
  console.log(
    '   Worker is running — keep this process alive (Ctrl-C to stop).',
  );
  console.log(
    '   Workflows will remain open in Temporal until they complete or are terminated.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
