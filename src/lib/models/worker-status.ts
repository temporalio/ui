export type WorkerStatus = 'Unspecified' | 'Running' | 'Shutting Down' | null;

export type WorkerFilters = readonly (WorkerStatus | 'All')[];

export const workerStatuses: readonly WorkerStatus[] = [
  'Running',
  'Shutting Down',
] as const;

export const workerStatusFilters: WorkerFilters = [
  'All',
  ...workerStatuses,
] as const;
