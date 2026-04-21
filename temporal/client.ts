import { Client, Connection, type WorkflowHandle } from '@temporalio/client';

import { getDataConverter } from './data-converter';
import {
  BlockingWorkflow,
  CompletedWorkflow,
  RunningWorkflow,
  UserMetadataWorkflow,
  Workflow,
} from './workflows';

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

export const startWorkflows = async (
  client?: Client,
): Promise<(string | number | void)[]> => {
  if (!client) {
    client = await connect();
  }

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

  const wf3 = await client.workflow.start(CompletedWorkflow, {
    taskQueue: 'e2e-1',
    args: [2],
    workflowId: 'completed-workflow',
  });

  const wf4 = await client.workflow.start(RunningWorkflow, {
    taskQueue: 'e2e-1',
    args: [],
    workflowId: 'running-workflow',
  });

  const wf5 = await client.workflow.start(UserMetadataWorkflow, {
    taskQueue: 'e2e-1',
    args: ['Plain text input 5'],
    workflowId: 'user-metadata-workflow',
    staticSummary: '# Summary\n **this is the summary**',
    staticDetails: '# Details\n **these are the details**',
  });

  workflows.push(wf1, wf2, wf3, wf4, wf5);

  return Promise.all([wf1.result(), wf3.result(), wf5.result()]);
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

startWorkflows().catch((err) => {
  console.error(err);
  process.exit(1);
});
