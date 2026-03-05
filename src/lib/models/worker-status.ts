export type WorkerStatus = 'Unspecified' | 'Running' | 'ShuttingDown' | null;

export type WorkerFilters = readonly (WorkerStatus | 'All')[];

export const workerStatuses: readonly WorkerStatus[] = [
  'Running',
  'ShuttingDown',
] as const;

export const workerStatusFilters: WorkerFilters = [
  'All',
  ...workerStatuses,
] as const;
