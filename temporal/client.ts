import { Connection, Client, WorkflowHandle } from '@temporalio/client';
import { Workflow, BlockingWorkflow } from './workflows';
import { getDataConverter } from './data-converter';

let connection: Connection;

export const disconnect = async () => {
  if (connection) {
    connection.close();
  }
};

export const connect = async () => {
  connection = await Connection.connect();

  const client = new Client({
    connection,
    dataConverter: getDataConverter(),
  });

  return client;
};

const workflows: WorkflowHandle[] = [];

export const startWorkflows = async (client: Client): Promise<string[]> => {
  const wf1 = await client.workflow.start(Workflow, {
    taskQueue: 'e2e-1',
    args: ['Plain text input 1'],
    workflowId: 'e2e-workflow-1',
  });

  const wf2 = await client.workflow.start(BlockingWorkflow, {
    taskQueue: 'e2e-1',
    args: ['Plain text input 2'],
    workflowId: 'e2e-workflow-2',
  });

  workflows.push(wf1, wf2);

  return Promise.all([wf1.result()]);
};

export const stopWorkflows = (): Promise<void[]> => {
  return Promise.all(
    workflows.map(async (workflow) => {
      try {
        await workflow.terminate();
        console.log(`🔪 terminated workflow ${workflow.workflowId}`);
      } catch {} // eslint-disable-line no-empty
    }),
  );
};
