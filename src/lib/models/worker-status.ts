const WORKER_STATUS_VALUES = [
  'Unspecified',
  'Running',
  'ShuttingDown',
] as const;

export type WorkerStatus = (typeof WORKER_STATUS_VALUES)[number];

export const workerStatuses: readonly WorkerStatus[] = [
  'Running',
  'ShuttingDown',
] as const;

export function isWorkerStatusType(value: string): value is WorkerStatus {
  return (WORKER_STATUS_VALUES as readonly string[]).includes(value);
}
