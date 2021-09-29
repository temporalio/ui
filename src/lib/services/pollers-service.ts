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

type TaskQueueType = 'ACTIVITY' | 'WORKFLOW';

type Poller = {
  lastAccessTime: PollerInfo['lastAccessTime'];
  taskQueueTypes: TaskQueueType[];
};

type PollerWithTaskQueueTypes = PollerInfo & {
  taskQueueTypes?: TaskQueueType[];
};

export async function getPollers(
  { queue, namespace }: GetAllPollersRequest,
  request = fetch,
): Promise<GetPollersResponse> {
  const pollersWorkflow = await requestFromAPI<GetPollersResponse>(
    `/namespaces/${namespace}/task-queues/${queue}?task_queue_type=1`,
    { request },
  );

  const pollersActivity = await requestFromAPI<GetPollersResponse>(
    `/namespaces/${namespace}/task-queues/${queue}?task_queue_type=2`,
    { request },
  );

  pollersActivity.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
    poller.taskQueueTypes = ['ACTIVITY'];
  });

  pollersWorkflow.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
    poller.taskQueueTypes = ['WORKFLOW'];
  });

  const r =
    (type: TaskQueueType) => (pollers: PollersData, poller: PollerInfo) => {
      const currentPoller: Poller = pollers[poller.identity] || {
        lastAccessTime: undefined,
        taskQueueTypes: [],
      };

      pollers[poller.identity] = {
        lastAccessTime:
          !currentPoller.lastAccessTime ||
          currentPoller.lastAccessTime < poller.lastAccessTime
            ? poller.lastAccessTime
            : currentPoller.lastAccessTime,
        taskQueueTypes: currentPoller.taskQueueTypes.concat([type]),
      };

      return pollers;
    };

  pollersActivity.pollers.filter((pollerA: PollerWithTaskQueueTypes) =>
    pollersWorkflow.pollers.some((pollerW: PollerWithTaskQueueTypes) => {
      if (pollerA.identity === pollerW.identity) {
        pollerA.taskQueueTypes = [
          ...pollerW.taskQueueTypes,
          ...pollerA.taskQueueTypes,
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
