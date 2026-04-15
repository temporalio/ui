import { Client, Connection } from '@temporalio/client';

import { runWorkerUntil } from './workers';

async function main() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  // Start two runs with different prompts for A/B comparison
  const handleA = await client.workflow.start('LLMWorkflow', {
    taskQueue: 'e2e-1',
    args: [
      'I need a comprehensive overview of Temporal for our architecture review. Cover the core concepts, how it handles failures, and why companies use it for AI agent orchestration.',
    ],
    workflowId: 'llm-workflow-run-a-v2',
  });
  console.log('Started workflow A:', handleA.workflowId);

  const handleB = await client.workflow.start('LLMWorkflow', {
    taskQueue: 'e2e-1',
    args: [
      'Explain how Temporal handles failures in long-running workflows. What happens when a worker crashes mid-activity? How does replay work?',
    ],
    workflowId: 'llm-workflow-run-b-v2',
  });
  console.log('Started workflow B:', handleB.workflowId);

  await runWorkerUntil(Promise.all([handleA.result(), handleB.result()]));
  console.log('Both A/B workflows completed');

  // Session pattern: 3 sequential executions with the same workflow ID.
  // Simulates Block's agentic chat pattern where a conversation spans
  // multiple workflow executions (complete after idle, restart on return).
  const sessionId = 'chat-session-user-123';
  const turns = [
    {
      turn: 1,
      message:
        'What are the best practices for deploying Temporal in production?',
    },
    {
      turn: 2,
      message:
        'Can you look up our current cluster configuration and compare it to those best practices?',
    },
    {
      turn: 3,
      message:
        'Go ahead and update the retention period to 30 days and enable archival.',
    },
  ];

  for (const { turn, message } of turns) {
    const handle = await client.workflow.start('ChatSessionWorkflow', {
      taskQueue: 'e2e-1',
      args: [{ turnNumber: turn, userMessage: message }],
      workflowId: sessionId,
    });
    console.log(
      `Started session turn ${turn}:`,
      handle.workflowId,
      `(run: ${handle.firstExecutionRunId})`,
    );
    await runWorkerUntil(handle.result());
    console.log(`Session turn ${turn} completed`);
  }

  console.log('All workflows completed');
  connection.close();
}

main().catch(console.error);
