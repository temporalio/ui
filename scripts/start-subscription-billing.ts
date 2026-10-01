import { createRequire } from 'node:module';

import { Client, Connection } from '@temporalio/client';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import * as activities from '../temporal/activities/index';
import { BillingCycleWorkflow } from '../temporal/workflows';

Runtime.install({ logger: new DefaultLogger('WARN') });

const require = createRequire(import.meta.url);

const address = process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7333';
const uiPort = process.env.VITE_DEV_PORT ?? '3100';
const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';
const taskQueue = 'subscription-billing';

const flag = (name: string) => process.argv.includes(`--${name}`);

const option = (name: string, fallback: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
};

const number = (name: string, fallback: number) => {
  const parsed = Number(option(name, String(fallback)));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

async function main() {
  const nativeConnection = await NativeConnection.connect({ address });
  const worker = await Worker.create({
    connection: nativeConnection,
    namespace,
    taskQueue,
    workflowsPath: require.resolve('../temporal/workflows'),
    activities,
  });

  if (flag('worker-only')) {
    console.log(
      `Subscription billing worker polling ${taskQueue} on ${address}. Ctrl-C to stop.`,
    );
    await worker.run();
    return;
  }

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace });

  const now = new Date();
  const period = option(
    'period',
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  );
  const cycleId = option('cycle-id', `billing-cycle-${period}`);
  const remainingBatches = number('batches', 3);
  const accountsPerBatch = number('accounts-per-batch', 4);

  const handle = await client.workflow.start(BillingCycleWorkflow, {
    taskQueue,
    workflowId: cycleId,
    args: [{ cycleId, period, remainingBatches, accountsPerBatch }],
  });

  console.log(
    `Subscription billing fixture: workflowId=${cycleId} batches=${remainingBatches} accountsPerBatch=${accountsPerBatch}`,
  );
  const timelineUrl = (runId: string) =>
    `  http://localhost:${uiPort}/namespaces/${namespace}/workflows/${cycleId}/${runId}/timeline?timeline_mode=lanes`;

  console.log(timelineUrl(handle.firstExecutionRunId));

  if (flag('keep-worker')) {
    console.log('Worker stays up after the run. Ctrl-C to stop.');
    await worker.run();
    return;
  }

  await worker.runUntil(handle.result());

  // The timeline walks a chain backwards from the run you open, so the last
  // run is the one that shows every batch.
  const { runId } = await client.workflow.getHandle(cycleId).describe();

  console.log('Subscription billing fixture complete. Whole chain:');
  console.log(timelineUrl(runId));

  await nativeConnection.close();
  connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
