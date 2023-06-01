import { Connection, Client } from '@temporalio/client';
import { Workflow } from './workflows';
import { getDataConverter } from './data-converter';

export const connect = async () => {
  const connection = await Connection.connect();

  const client = new Client({
    connection,
    dataConverter: getDataConverter(),
  });

  return client;
};

export const startWorkflows = async (client: Client): Promise<string> => {
  const wf1 = await client.workflow.start(Workflow, {
    args: ['Plain text input 1'],
    taskQueue: 'e2e-1',
    workflowId: 'e2e-workflow-1',
  });

  client.workflow.start(Workflow, {
    args: ['Plain text input 2'],
    taskQueue: 'e2e-2',
    workflowId: 'e2e-workflow-2',
  });

  return wf1.result();
};
