import { writable } from 'svelte/store';

export const nexusOperationRefresh = writable(0);
export const nexusOperationLoading = writable(true);
export const nexusOperationUpdating = writable(true);

export const nexusOperationCount = writable({
  count: 0,
  newCount: 0,
});

export const nexusOperationError = writable('');
export const nexusOperationsQuery = writable<string>('');
export const nexusOperationsSearchParams = writable<string>('');
