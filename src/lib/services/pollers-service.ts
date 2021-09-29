import type { PollerInfo, TaskQueueStatus } from '$types';

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };
export type GetPollersResponse = {
  pollers: PollerInfo[];
  taskQueueStatus: TaskQueueStatus;
};

const base = import.meta.env.VITE_API;

export async function getPollers(
  { queue, namespace }: GetAllPollersRequest,
  request = fetch,
): Promise<GetPollersResponse> {
  const pollersWorkflow: GetPollersResponse = await request(
    `${base}/namespaces/${namespace}/task-queues/${queue}?task_queue_type=1`,
  )
    .then((response) => response.json())
    .catch(console.error);

  const pollersActivity: GetPollersResponse = await request(
    `${base}/namespaces/${namespace}/task-queues/${queue}?task_queue_type=2`,
  )
    .then((response) => response.json())
    .catch(console.error);

  pollersActivity.pollers.forEach((poller) => {
    poller[`taskQueueTypes`] = ['ACTIVITY'];
  });

  pollersWorkflow.pollers.forEach((poller) => {
    poller[`taskQueueTypes`] = ['WORKFLOW'];
  });

  const r = (type) => (o, poller) => {
    const i = o[poller.identity] || {};

    o[poller.identity] = {
      lastAccessTime:
        !i.lastAccessTime || i.lastAccessTime < poller.lastAccessTime
          ? poller.lastAccessTime
          : i.lastAccessTime,
      taskQueueTypes: i.taskQueueTypes
        ? i.taskQueueTypes.concat([type])
        : [type],
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
