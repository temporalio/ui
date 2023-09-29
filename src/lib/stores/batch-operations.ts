import { writable } from 'svelte/store';

import { pollBatchOperation } from '$lib/services/batch-service';
import { persistStore } from '$lib/stores/persist-store';
import type { BatchOperation, BatchOperationInfo } from '$lib/types/batch';

export const inProgressBatchOperation = writable<{
  namespace: string;
  jobId: string;
}>();

inProgressBatchOperation.subscribe(async (operation) => {
  if (operation) {
    await pollBatchOperation(operation).then(() =>
      inProgressBatchOperation.set(undefined),
    );
  }
});

export const autoRefresh = persistStore<'on' | 'off'>(
  'auto-refresh-batch-operation',
  'off',
);

export const batchOperation = writable<BatchOperation>();
export const batchOperations = writable<BatchOperationInfo[]>([]);
