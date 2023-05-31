import {
  Connection,
  Client,
  Workflow,
  WorkflowHandle,
} from '@temporalio/client';
import { echoWorkflow } from '$temporal-fixtures/workflows';

const connect = async () => {
  const connection = await Connection.connect();

  const client = new Client({
    connection,
  });

  return client;
};

export const startWorkflows = async (): Promise<WorkflowHandle[]> => {
  const client = await connect();

  const wf1 = await client.workflow.start(echoWorkflow, {
    args: ['Plain text input 1'],
    taskQueue: 'e2e-1',
    workflowId: 'e2e-workflow-1',
  });

  client.workflow.start(echoWorkflow, {
    args: ['Plain text input 2'],
    taskQueue: 'e2e-2',
    workflowId: 'e2e-workflow-2',
  });

  return [wf1];
};
