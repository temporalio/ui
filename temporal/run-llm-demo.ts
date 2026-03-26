import { Client, Connection } from '@temporalio/client';

import { runWorkerUntil } from './workers';

async function main() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  // Start two runs with different prompts for A/B comparison
  const handleA = await client.workflow.start('LLMWorkflow', {
    taskQueue: 'e2e-1',
    args: ['Tell me about Temporal'],
    workflowId: 'llm-workflow-run-a',
  });
  console.log('Started workflow A:', handleA.workflowId);

  const handleB = await client.workflow.start('LLMWorkflow', {
    taskQueue: 'e2e-1',
    args: ['Explain durable execution'],
    workflowId: 'llm-workflow-run-b',
  });
  console.log('Started workflow B:', handleB.workflowId);

  await runWorkerUntil(Promise.all([handleA.result(), handleB.result()]));
  console.log('Both workflows completed');
  connection.close();
}

main().catch(console.error);
