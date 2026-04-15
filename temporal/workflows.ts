import * as workflow from '@temporalio/workflow';

import type * as activities from './activities';

const { echo: Activity } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

const { echo: LocalActivity } = workflow.proxyLocalActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

const isBlockedQuery = workflow.defineQuery<boolean>('is-blocked');
const unblockSignal = workflow.defineSignal('unblock');

const { double } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 hour',
  retry: {
    maximumAttempts: 1,
  },
});

const {
  echo,
  callLLM,
  callLLMClaude,
  callLLMGemini,
  callLLMFlaky,
  runGuardrail,
  searchKnowledgeBase,
  executeTool,
} = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

export async function Workflow(input: string): Promise<string> {
  let result: string;

  result = await LocalActivity(input);
  result = await Activity(input);

  return result;
}

export async function BlockingWorkflow(input: string): Promise<string> {
  let isBlocked = true;

  workflow.setHandler(unblockSignal, () => void (isBlocked = false));
  workflow.setHandler(isBlockedQuery, () => isBlocked);

  try {
    await workflow.condition(() => !isBlocked);
  } catch (err) {
    if (err instanceof workflow.CancelledFailure) {
      console.log('Cancelled');
    }
    throw err;
  }

  return Activity(input);
}

export async function CompletedWorkflow(
  amount: number,
  iterations = 0,
): Promise<number> {
  if (iterations) {
    await workflow.continueAsNew(amount, iterations - 1);
  }

  return await double(amount);
}

export async function RunningWorkflow(): Promise<void> {
  return await workflow.sleep('10 days');
}

export async function LLMWorkflow(
  prompt: string,
): Promise<Record<string, unknown>[]> {
  const r1 = await callLLM(prompt);
  await echo('Processing intermediate result...');
  const r2 = await callLLMClaude(prompt);
  const r3 = await callLLMGemini(prompt);
  await echo('Validating responses...');
  const r4 = await callLLM(
    'Summarize the key points from the previous responses',
  );
  await echo('Generating final report...');
  const r5 = await callLLMClaude('Create an executive summary of the analysis');
  const r6 = await callLLMFlaky('Generate compliance check for the report');
  const r7 = await callLLM('List action items and next steps');
  return [r1, r2, r3, r4, r5, r6, r7];
}

// Simulates one "turn" of an agentic chat session.
// Each turn runs a different mix of LLM and non-LLM activities.
// Multiple executions with the same workflow ID form a "session".
export async function ChatSessionWorkflow(input: {
  turnNumber: number;
  userMessage: string;
}): Promise<Record<string, unknown>[]> {
  const { turnNumber, userMessage } = input;
  if (turnNumber === 1) {
    // Turn 1: User asks a question - guardrail, LLM, guardrail
    const g1 = await runGuardrail({
      type: 'input',
      policy: 'content-safety-v2',
      content: userMessage,
    });
    const r1 = await callLLM(userMessage);
    const g2 = await runGuardrail({
      type: 'output',
      policy: 'pii-detection',
      content: 'Based on the query...',
    });
    return [g1, r1, g2];
  } else if (turnNumber === 2) {
    // Turn 2: Follow-up - parse intent, search, synthesize
    const r1 = await callLLMClaude(userMessage);
    const search = await searchKnowledgeBase({
      query: userMessage,
      collection: 'temporal-docs',
      topK: 3,
    });
    const r2 = await callLLM(
      'Synthesize the following search results into a recommendation: ' +
        JSON.stringify(search),
    );
    const g1 = await runGuardrail({
      type: 'output',
      policy: 'factual-accuracy',
      content: 'Recommended settings include...',
    });
    return [r1, search, r2, g1];
  } else {
    // Turn 3: Action request - plan with LLM, then execute via child workflow
    const r1 = await callLLMGemini(userMessage);
    const r2 = await callLLMClaude('Confirm action plan: ' + userMessage);

    // Execute the action in a child workflow (isolated execution boundary)
    const childResult = await workflow.executeChild(ToolExecutionWorkflow, {
      args: ['update_settings', { retention: '30 days', archival: true }],
      workflowId: `tool-exec-${workflow.workflowInfo().workflowId}-turn-${turnNumber}`,
    });

    const r3 = await callLLM(
      'Generate summary of changes made: ' + JSON.stringify(childResult),
    );
    return [r1, r2, childResult, r3];
  }
}

// Child workflow: executes a tool action with its own guardrails and retry boundary.
// Shows up as an expandable node in the session tree view.
export async function ToolExecutionWorkflow(
  toolName: string,
  toolArgs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const g1 = await runGuardrail({
    type: 'input',
    policy: 'action-authorization',
    content: `${toolName}: ${JSON.stringify(toolArgs)}`,
  });

  const result = await executeTool({
    tool: toolName,
    args: toolArgs,
  });

  const g2 = await runGuardrail({
    type: 'output',
    policy: 'action-audit',
    content: JSON.stringify(result),
  });

  return { ...result, guardrails: { input: g1, output: g2 } };
}
