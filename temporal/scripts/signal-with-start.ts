import { Client, Connection } from '@temporalio/client';

const connect = async () => {
  const connection = await Connection.connect();
  return new Client({ connection });
};

const run = async () => {
  const client = await connect();

  const handle = await client.workflow.signalWithStart('signalWorkflow', {
    taskQueue: 'unversioned.default.Rosss-MacBook-Pro.local',
    workflowId: `signal-with-start-${Date.now()}`,
    args: [],
    signal: 'testSignal',
    signalArgs: [{ message: 'hello from signalWithStart', value: 42 }],
    memo: {
      triggeredBy: 'signal-with-start script',
    },
  });

  console.log(`workflow id:    ${handle.workflowId}`);
  console.log(`signaled run:   ${handle.signaledRunId}`);
  console.log(
    `\nhttp://localhost:3000/namespaces/default/workflows/${handle.workflowId}/${handle.signaledRunId}/history`,
  );
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
