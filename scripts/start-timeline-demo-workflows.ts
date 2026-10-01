import { createRequire } from 'node:module';

import { Client, Connection, type WorkflowHandle } from '@temporalio/client';
import { NativeConnection, Worker } from '@temporalio/worker';

import * as activities from '../temporal/activities/index';
import { getDataConverter } from '../temporal/data-converter';
import {
  TimelineDemoNestedChildrenWorkflow,
  TimelineDemoThreeActivitiesWorkflow,
  TimelineDemoThreeChildrenWorkflow,
} from '../temporal/workflows';

const require = createRequire(import.meta.url);
const taskQueue = 'e2e-1';

async function main() {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7233',
  });
  const dataConverter = await getDataConverter();
  const client = new Client({ connection, dataConverter });
  const suffix = Date.now();
  const handles: WorkflowHandle[] = [];

  handles.push(
    await client.workflow.start(TimelineDemoThreeActivitiesWorkflow, {
      taskQueue,
      workflowId: `timeline-demo-1-activities-${suffix}`,
    }),
    await client.workflow.start(TimelineDemoThreeChildrenWorkflow, {
      taskQueue,
      workflowId: `timeline-demo-2-children-${suffix}`,
    }),
    await client.workflow.start(TimelineDemoNestedChildrenWorkflow, {
      taskQueue,
      workflowId: `timeline-demo-3-nested-children-${suffix}`,
    }),
  );

  for (const [index, handle] of handles.entries()) {
    console.log(
      `Demo ${index + 1}: workflowId=${handle.workflowId} runId=${handle.firstExecutionRunId}`,
    );
  }

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
  await worker.runUntil(Promise.all(handles.map((handle) => handle.result())));
  await connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
