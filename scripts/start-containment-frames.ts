import { createRequire } from 'node:module';

import { Client, Connection } from '@temporalio/client';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import * as activities from '../temporal/activities/index';
import { ContainmentFrameRootWorkflow } from '../temporal/workflows';

Runtime.install({ logger: new DefaultLogger('WARN') });

const require = createRequire(import.meta.url);

const address = process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7333';
const uiPort = process.env.VITE_DEV_PORT ?? '3100';
const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';
const taskQueue = 'containment-frames';

const flag = (name: string) => process.argv.includes(`--${name}`);
const option = (name: string, fallback: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
};

const paceSeconds = Number(option('pace', '1'));
const keepWorker = flag('keep-worker');
const workerOnly = flag('worker-only');

async function main() {
  const nativeConnection = await NativeConnection.connect({ address });
  const worker = await Worker.create({
    connection: nativeConnection,
    namespace,
    taskQueue,
    workflowsPath: require.resolve('../temporal/workflows'),
    activities,
  });

  if (workerOnly) {
    console.log(
      `Containment frames worker polling ${taskQueue} on ${address}. Ctrl-C to stop.`,
    );
    await worker.run();
    return;
  }

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace });

  const workflowId = `containment-frames-${Date.now()}`;
  const handle = await client.workflow.start(ContainmentFrameRootWorkflow, {
    taskQueue,
    workflowId,
    args: [paceSeconds],
  });

  console.log(`Containment frames fixture: workflowId=${workflowId}`);
  console.log(
    `  http://localhost:${uiPort}/namespaces/${namespace}/workflows/${workflowId}/${handle.firstExecutionRunId}/timeline`,
  );

  if (keepWorker) {
    console.log('Worker stays up after the run. Ctrl-C to stop.');
    await worker.run();
    return;
  }

  await worker.runUntil(handle.result());

  console.log('Containment frames fixture complete.');

  await nativeConnection.close();
  connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
