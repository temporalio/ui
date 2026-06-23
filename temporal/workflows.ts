import * as workflow from '@temporalio/workflow';

import type * as activities from './activities';
import type { ComplexActivityResult } from './activities/complex';

const { echo: Activity, multi: MultiInputActivity } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

const { echo: LocalActivity } = workflow.proxyLocalActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

const isBlockedQuery = workflow.defineQuery<boolean>('is-blocked');
const unblockSignal = workflow.defineSignal('unblock');
const proceedSignal = workflow.defineSignal('proceed');

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

export async function LLMWorkflow(prompt: string): Promise<unknown[]> {
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

export async function ChatSessionWorkflow(input: {
  turnNumber: number;
  userMessage: string;
}): Promise<unknown[]> {
  const { turnNumber, userMessage } = input;
  if (turnNumber === 1) {
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
    const r1 = await callLLMGemini(userMessage);
    const r2 = await callLLMClaude('Confirm action plan: ' + userMessage);

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

export async function UserMetadataWorkflow(input: string): Promise<string> {
  let signalReceived = false;

  workflow.setHandler(proceedSignal, () => void (signalReceived = true));

  workflow.setCurrentDetails(
    `# Paused at checkpoint.\n Send 'proceed' signal to continue, or workflow will auto-proceed after 10 minutes. Input: ${input}`,
  );

  await workflow.condition(() => signalReceived, '10 minutes', {
    summary: 'Sleeping for 10 minutes',
  });

  const currentDetails = workflow.getCurrentDetails();
  console.log(`Current details: ${currentDetails}`);

  workflow.setCurrentDetails(
    signalReceived
      ? 'Received proceed signal, continuing execution'
      : 'Timed out after 10 minutes, continuing execution',
  );

  return await Activity.executeWithOptions(
    {
      summary: '# This is the summary',
    },
    [input],
  );
}

interface PayloadCoverageInput {
  stringField: string;
  numberField: number;
  floatField: number;
  booleanField: boolean;
  nullField: null;
  arrayOfStrings: string[];
  arrayOfNumbers: number[];
  mixedArray: (string | number | boolean | null)[];
  nestedObject: {
    level1: {
      level2: string;
      array: number[];
    };
    flag: boolean;
  };
  emptyObject: Record<string, never>;
  emptyArray: never[];
}

interface ChildWorkflowInput {
  message: string;
  parentInput: PayloadCoverageInput;
}

interface ChildWorkflowResult {
  echoed: string;
  activityResult: string;
  receivedInput: ChildWorkflowInput;
}

export interface PayloadCoverageResult {
  received: PayloadCoverageInput;
  localActivityResult: string;
  activityResult: ComplexActivityResult;
  childWorkflowResult: ChildWorkflowResult;
  signalCount: number;
  accumulatedData: Record<string, unknown>;
  timedOut: boolean;
  completedAt: string;
}

const { complex: complexActivity } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
});

const { complex: failingActivity } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 1 },
});

const addDataSignal =
  workflow.defineSignal<[{ key: string; value: unknown }]>('add-data');

const triggerSignal = workflow.defineSignal<[string[]]>('trigger');

const getStatusQuery = workflow.defineQuery<{
  status: string;
  data: Record<string, unknown>;
  count: number;
}>('get-status');

const getFieldQuery = workflow.defineQuery<unknown, [string]>('get-field');

const processUpdate = workflow.defineUpdate<
  { processed: boolean; echo: unknown },
  [{ operation: string; payload: unknown }]
>('process-update');

export async function PayloadCoverageChildWorkflow(
  input: ChildWorkflowInput,
): Promise<ChildWorkflowResult> {
  const activityResult = await Activity(input.message);
  return {
    echoed: `child echoed: ${input.message}`,
    activityResult,
    receivedInput: input,
  };
}

export async function PayloadCoverageWorkflow(
  input: PayloadCoverageInput,
): Promise<PayloadCoverageResult> {
  let signalCount = 0;
  let triggered = false;
  const accumulatedData: Record<string, unknown> = {};

  workflow.setHandler(addDataSignal, ({ key, value }) => {
    accumulatedData[key] = value;
    signalCount++;
  });

  workflow.setHandler(triggerSignal, (tags) => {
    accumulatedData['triggerTags'] = tags;
    signalCount++;
    triggered = true;
  });

  workflow.setHandler(getStatusQuery, () => ({
    status: triggered ? 'triggered' : 'waiting',
    data: accumulatedData,
    count: signalCount,
  }));

  workflow.setHandler(getFieldQuery, (field) => {
    if (field in input)
      return (input as unknown as Record<string, unknown>)[field];
    return accumulatedData[field] ?? null;
  });

  workflow.setHandler(processUpdate, ({ operation, payload }) => ({
    processed: true,
    echo: {
      operation,
      payload,
      handledAt: workflow.workflowInfo().historyLength,
    },
  }));

  workflow.upsertSearchAttributes({
    CustomKeywordField: ['payload-coverage'],
    CustomIntField: [1],
  });

  const localActivityResult = await LocalActivity(
    JSON.stringify({ type: 'local', input }),
  );

  const activityResult = await complexActivity({
    strings: input.arrayOfStrings,
    numbers: input.arrayOfNumbers,
    nested: {
      key: input.nestedObject.level1.level2,
      count: input.nestedObject.level1.array.length,
      tags: input.arrayOfStrings,
    },
    flag: input.booleanField,
    nullable: null,
  });

  try {
    await failingActivity({
      strings: ['fail'],
      numbers: [0],
      nested: { key: 'error-path', count: 0, tags: [] },
      flag: false,
      nullable: null,
      shouldFail: true,
    });
  } catch {
    accumulatedData['activityFailureRecorded'] = true;
  }

  const childWorkflowResult = await workflow.executeChild(
    PayloadCoverageChildWorkflow,
    {
      args: [
        { message: 'hello from PayloadCoverageWorkflow', parentInput: input },
      ],
      workflowId: workflow.workflowInfo().workflowId + '-child',
    },
  );

  const timedOut = !(await workflow.condition(() => triggered, '1 hour'));

  return {
    received: input,
    localActivityResult,
    activityResult,
    childWorkflowResult,
    signalCount,
    accumulatedData,
    timedOut,
    completedAt: new Date().toISOString(),
  };
}

export async function MultiInputWorkflow(
  input1: string,
  input2: object,
  input3: unknown[],
): Promise<string> {
  const activityResult = await MultiInputActivity(input1, input2, input3);

  return activityResult;
}
