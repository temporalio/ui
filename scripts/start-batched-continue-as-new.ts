import { createRequire } from 'node:module';

import { Client, Connection } from '@temporalio/client';
import { NativeConnection, Worker } from '@temporalio/worker';
import yargs from 'yargs/yargs';

import * as activities from '../temporal/activities/index';
import { getDataConverter } from '../temporal/data-converter';
import { BatchedContinueAsNewWorkflow } from '../temporal/workflows';

const require = createRequire(import.meta.url);

const taskQueue = 'e2e-1';

const argv = await yargs(process.argv.slice(2))
  .option('workflow-id', {
    type: 'string',
    default: `batched-continue-as-new-${Date.now()}`,
  })
  .option('iterations', { type: 'number', default: 10 })
  .option('activities', { type: 'number', default: 9 })
  .option('child-levels', { type: 'number', default: 1 })
  .option('activity-duration-ms', { type: 'number', default: 10_000 })
  .option('delay-between-ms', { type: 'number', default: 0 })
  .option('parallel-activity-duration-ms', {
    type: 'number',
    default: 10_000,
  })
  .parse();

async function main() {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7233',
  });
  const dataConverter = await getDataConverter();
  const client = new Client({ connection, dataConverter });
  const nativeAddress = process.env.TEMPORAL_ADDRESS;
  const worker = await Worker.create({
    connection: nativeAddress
      ? await NativeConnection.connect({ address: nativeAddress })
      : undefined,
    activities,
    dataConverter,
    taskQueue,
    workflowsPath: require.resolve('../temporal/workflows'),
  });
  const handle = await client.workflow.start(BatchedContinueAsNewWorkflow, {
    args: [
      2,
      argv.iterations,
      argv.activities,
      argv.activityDurationMs,
      argv.delayBetweenMs,
      argv.parallelActivityDurationMs,
      argv.childLevels,
    ],
    taskQueue,
    workflowId: argv.workflowId,
  });

  console.log(`Started ${argv.workflowId}`);
  await worker.runUntil(handle.result());
  await connection.close();
  console.log(`Completed ${argv.workflowId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
