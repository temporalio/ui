import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';

export const getWorkerHostName = (
  worker: WorkerListInfo | WorkerHeartbeat | null | undefined,
): string | undefined => {
  if (!worker) return undefined;
  if ('hostName' in worker) return worker.hostName ?? undefined;
  if ('hostInfo' in worker) return worker.hostInfo?.hostName ?? undefined;
  return undefined;
};
