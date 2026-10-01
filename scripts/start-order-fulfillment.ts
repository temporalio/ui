import { createRequire } from 'node:module';

import { Client, Connection } from '@temporalio/client';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import * as activities from '../temporal/activities/index';
import { OrderFulfillmentWorkflow } from '../temporal/workflows';

Runtime.install({ logger: new DefaultLogger('WARN') });

const require = createRequire(import.meta.url);

const address = process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7333';
const uiPort = process.env.VITE_DEV_PORT ?? '3100';
const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';
const taskQueue = 'order-fulfillment';

const flag = (name: string) => process.argv.includes(`--${name}`);

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
      `Order fulfillment worker polling ${taskQueue} on ${address}. Ctrl-C to stop.`,
    );
    await worker.run();
    return;
  }

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace });

  const orderId = `order-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
  const handle = await client.workflow.start(OrderFulfillmentWorkflow, {
    taskQueue,
    workflowId: orderId,
    args: [orderId],
  });

  console.log(`Order fulfillment fixture: workflowId=${orderId}`);
  console.log(
    `  http://localhost:${uiPort}/namespaces/${namespace}/workflows/${orderId}/${handle.firstExecutionRunId}/timeline?timeline_mode=lanes`,
  );

  if (flag('keep-worker')) {
    console.log('Worker stays up after the run. Ctrl-C to stop.');
    await worker.run();
    return;
  }

  await worker.runUntil(handle.result());

  console.log('Order fulfillment fixture complete.');

  await nativeConnection.close();
  connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
