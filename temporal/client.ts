import { Connection, Client } from '@temporalio/client';
import { Workflow, BlockingWorkflow } from './workflows';
import { defaultDataConverter } from '@temporalio/common';

export const connect = async () => {
  const connection = await Connection.connect();

  const client = new Client({
    connection,
    dataConverter: defaultDataConverter,
  });

  return client;
};

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

  return Promise.all([wf1.result(), wf2.result()]);
};
