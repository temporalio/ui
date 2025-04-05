import { writable } from 'svelte/store';

import { pollBatchOperation } from '$lib/services/batch-service';
import { persistStore } from '$lib/stores/persist-store';

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

export const autoRefresh = persistStore<boolean>(
  'auto-refresh-batch-operation',
  false,
);
