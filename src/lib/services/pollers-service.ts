import { requestFromAPI } from '$lib/utilities/request-from-api';
import type { PollerInfo, TaskQueueStatus } from '$types';

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };
export type GetPollersResponse = {
  pollers: PollerInfo[];
  taskQueueStatus: TaskQueueStatus;
};

type PollersData = {
  [key: string]: Poller;
};

type Poller = {
  lastAccessTime: PollerInfo['lastAccessTime'];
  taskQueueTypes: string[];
};

const base = import.meta.env.VITE_API;

export async function getPollers(
  { queue, namespace }: GetAllPollersRequest,
  request = fetch,
): Promise<GetPollersResponse> {
  const pollersWorkflow = await requestFromAPI<GetPollersResponse>(
    `/namespaces/${namespace}/task-queues/${queue}?task_queue_type=1`,
    { request },
  );

  const pollersActivity = await requestFromAPI<GetPollersResponse>(
    `${base}/namespaces/${namespace}/task-queues/${queue}?task_queue_type=2`,
    { request },
  );

  pollersActivity.pollers.forEach((poller) => {
    poller[`taskQueueTypes`] = ['ACTIVITY'];
  });

  pollersWorkflow.pollers.forEach((poller) => {
    poller[`taskQueueTypes`] = ['WORKFLOW'];
  });

  const r = (type: string) => (o: PollersData, poller: PollerInfo) => {
    const i: Poller = o[poller.identity] || {
      lastAccessTime: undefined,
      taskQueueTypes: [],
    };

    o[poller.identity] = {
      lastAccessTime:
        !i.lastAccessTime || i.lastAccessTime < poller.lastAccessTime
          ? poller.lastAccessTime
          : i.lastAccessTime,
      taskQueueTypes: i.taskQueueTypes.concat([type]),
    };

    return o;
  };

  pollersActivity.pollers.filter((pollerA) =>
    pollersWorkflow.pollers.some((pollerW) => {
      if (pollerA.identity === pollerW.identity) {
        pollerA['taskQueueTypes'] = [
          ...pollerW['taskQueueTypes'],
          ...pollerA['taskQueueTypes'],
        ];
        return pollerA;
      }
    }),
  );

  pollersActivity.pollers.reduce(
    r('ACTIVITY'),
    pollersWorkflow.pollers.reduce(r('WORKFLOW'), {}),
  );

  return {
    pollers: pollersActivity.pollers,
    taskQueueStatus: pollersActivity.taskQueueStatus,
  };
}
