import { Client, Connection, type WorkflowHandle } from '@temporalio/client';

import { getDataConverter } from './data-converter';
import {
  BlockingWorkflow,
  CompletedWorkflow,
  type PayloadCoverageResult,
  PayloadCoverageWorkflow,
  RunningWorkflow,
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
    dataConverter: await getDataConverter(),
  });

  return client;
};

const workflows: WorkflowHandle[] = [];

export const startWorkflows = async (
  client: Client,
): Promise<(string | number | void)[]> => {
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

  workflows.push(wf1, wf2, wf3, wf4);

  return Promise.all([wf1.result(), wf3.result()]);
};

export const startPayloadCoverageWorkflow = async (
  client: Client,
): Promise<PayloadCoverageResult> => {
  const wf = await client.workflow.start(PayloadCoverageWorkflow, {
    taskQueue: 'e2e-1',
    workflowId: 'payload-coverage-workflow',
    args: [
      {
        stringField: 'hello world',
        numberField: 42,
        floatField: 3.14159,
        booleanField: true,
        nullField: null,
        arrayOfStrings: ['alpha', 'beta', 'gamma'],
        arrayOfNumbers: [1, 2, 3, 100, -7],
        mixedArray: ['text', 99, false, null, 'more'],
        nestedObject: {
          level1: {
            level2: 'deep value',
            array: [10, 20, 30],
          },
          flag: false,
        },
        emptyObject: {},
        emptyArray: [],
      },
    ],
    memo: {
      description: 'Payload coverage test workflow',
      tags: ['e2e', 'payload', 'coverage'],
      version: 1,
      testData: { nested: { value: 42 }, active: true },
    },
  });

  workflows.push(wf);
  console.log(`✨ started payload-coverage-workflow (${wf.workflowId})`);
  return wf.result();
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
