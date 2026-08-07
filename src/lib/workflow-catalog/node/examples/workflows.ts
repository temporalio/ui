import {
  condition,
  defineSignal,
  deprecatePatch,
  patched,
  proxyActivities,
  proxyLocalActivities,
  setHandler,
  sleep,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activities.js';
import { hello } from './hello/workflow.js';
import { parallelActivities } from './parallel-activities/workflow.js';

const { generateSummary, processData, processItem } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

const { processData: processLocalData } = proxyLocalActivities<
  typeof activities
>({
  startToCloseTimeout: '5 seconds',
});

const addItemSignal = defineSignal<[string]>('addItem');
const collectorCompleteSignal = defineSignal('complete');

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function scheduleWorkflow(
  intervalSeconds = 10,
  maxRuns = 3,
): Promise<string> {
  const runs: string[] = [];

  for (let run = 1; run <= maxRuns; run += 1) {
    const runStart = Date.now();
    const result = await processData(`timer-run-${run}`, 1000, 2);
    runs.push(`Run ${run} (${new Date(runStart).toISOString()}): ${result}`);

    if (run < maxRuns) await sleep(`${intervalSeconds} seconds`);
  }

  return `TIMER LOOP COMPLETED: Executed ${maxRuns} runs at ${intervalSeconds}s intervals:\n${runs.join('\n')}`;
}

export async function highEventCountWorkflow(
  count = 7,
  activityDelay = 2000,
): Promise<string> {
  const results = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      processData(`async-${index}`, activityDelay, 1),
    ),
  );
  return `HIGH EVENT COUNT: ${results.length} concurrent activities completed`;
}

export async function childWorkflowTest(): Promise<string> {
  const parentWorkflowId = workflowInfo().workflowId;

  try {
    const child1 = await startChild(hello, {
      args: ['Child1'],
      workflowId: `child-${parentWorkflowId}-1`,
    });
    const child2 = await startChild(parallelActivities, {
      args: [`child-data-${Date.now()}`],
      workflowId: `child-${parentWorkflowId}-2`,
    });
    const child3 = await startChild(highEventCountWorkflow, {
      args: [7],
      workflowId: `child-${parentWorkflowId}-high-events`,
    });
    const [result1, result2, result3] = await Promise.all([
      child1.result(),
      child2.result(),
      child3.result(),
    ]);

    return `CHILD WORKFLOWS SUCCESS: Child1: ${result1}, Child2: ${result2}, Child3: ${result3}`;
  } catch (error) {
    return `CHILD WORKFLOWS FAILURE: ${errorMessage(error)}`;
  }
}

export async function localActivityWorkflow(
  inputData = `local_${Date.now()}`,
): Promise<string> {
  const localData = await processLocalData(inputData, 1000, 1);
  return `LOCAL ACTIVITY SUCCESS: ${localData}`;
}

export async function patchWorkflow(
  dataId = `patch_${Date.now()}`,
): Promise<string> {
  const results: string[] = [];
  results.push(`Initial: ${await processData(dataId, 1000, 2)}`);

  if (patched('add-validation-step')) {
    results.push(
      dataId.trim() !== '' && dataId.length <= 100
        ? 'Validation: passed'
        : 'Validation failed: invalid data',
    );
  }

  results.push(`Common: ${await processData(`${dataId}-common`, 1500, 3)}`);

  if (patched('enhanced-processing')) {
    const transformedData = `transformed_${dataId}_${Date.now()}`;
    const checksum = [...transformedData].reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    );
    results.push(`Enhanced: ${transformedData} (checksum: ${checksum})`);
  } else {
    results.push(`Simple: ${dataId}_processed`);
  }

  if (patched('final-step')) {
    results.push(`Final: ${await processData(`${dataId}-final`, 2000, 1)}`);
  }

  if (patched('old-feature')) {
    deprecatePatch('old-feature');
    results.push('Old feature executed (deprecated)');
  }

  const versionInfo = [
    patched('add-validation-step') ? 'validation' : 'no-validation',
    patched('enhanced-processing') ? 'enhanced' : 'simple',
    patched('final-step') ? 'final-step' : 'no-final-step',
    patched('old-feature') ? 'old-feature' : 'no-old-feature',
  ].join(', ');

  return `PATCH WORKFLOW SUCCESS (${versionInfo}): ${results.join(' | ')}`;
}

export type CollectorConfig = {
  timeoutSeconds?: number;
  maxItems?: number;
};

export type CollectorResult = {
  items: string[];
  itemCount: number;
  processedItems: string[];
  summary: string;
  completedBy: 'signal' | 'timeout' | 'maxItems';
};

export async function signalCollector(
  config: CollectorConfig = {},
): Promise<CollectorResult> {
  const { timeoutSeconds = 60, maxItems = 10 } = config;
  const items: string[] = [];
  let completed = false;

  setHandler(addItemSignal, (item) => {
    if (!completed && items.length < maxItems) items.push(item);
  });
  setHandler(collectorCompleteSignal, () => {
    completed = true;
  });

  await condition(
    () => completed || items.length >= maxItems,
    `${timeoutSeconds} seconds`,
  );

  const completedBy: CollectorResult['completedBy'] = completed
    ? 'signal'
    : items.length >= maxItems
      ? 'maxItems'
      : 'timeout';
  const processedItems: string[] = [];

  for (const item of items) processedItems.push(await processItem(item));

  return {
    items,
    itemCount: items.length,
    processedItems,
    summary: await generateSummary(items.length, completedBy),
    completedBy,
  };
}
