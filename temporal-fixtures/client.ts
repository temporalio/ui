import { Connection, Client, type WorkflowHandle } from '@temporalio/client';
import { Workflow } from '$temporal-fixtures/workflows';

export const connect = async () => {
  const connection = await Connection.connect();

  const client = new Client({
    connection,
  });

  return client;
};

export const startWorkflows = async (
  client: Client,
): Promise<WorkflowHandle[]> => {
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

  return [wf1];
};
