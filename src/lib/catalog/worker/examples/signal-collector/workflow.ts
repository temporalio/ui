import {
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const { generateSummary, processItem } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});
const addItemSignal = defineSignal<[string]>('addItem');
const collectorCompleteSignal = defineSignal('complete');
export type CollectorConfig = { timeoutSeconds?: number; maxItems?: number };
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
