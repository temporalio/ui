import { translate } from '$lib/i18n/translate';
import type {
  BuildIdReachability,
  PollerInfo,
  TaskQueueCompatibleVersionSet,
  TaskQueueStatus,
} from '$lib/types';
import type { NamespaceScopedRequest } from '$lib/types/global';
import {
  type APIErrorResponse,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };

export type GetWorkerTaskReachabilityRequest = NamespaceScopedRequest & {
  taskQueue: string;
  buildIds: string[];
};

export type GetPollersResponse = {
  pollers: PollerWithTaskQueueTypes[];
  taskQueueStatus: TaskQueueStatus;
};

export type TaskQueueCompatibility = {
  majorVersionSets: TaskQueueCompatibleVersionSet[];
};

export type WorkerReachability = {
  buildIdReachability: BuildIdReachability[];
};

type PollersData = {
  [key: string]: Poller;
};

type TaskQueueType = 'ACTIVITY' | 'WORKFLOW';

export type Poller = {
  lastAccessTime: PollerInfo['lastAccessTime'];
  taskQueueTypes: TaskQueueType[];
};

export type PollerWithTaskQueueTypes = PollerInfo & {
  taskQueueTypes?: TaskQueueType[];
};

export async function getPollers(
  parameters: GetAllPollersRequest,
  request = fetch,
): Promise<GetPollersResponse> {
  const route = routeForApi('task-queue', parameters);
  const workflowPollers = await requestFromAPI<GetPollersResponse>(route, {
    request,
    params: { taskQueueType: '1' },
  });

  const activityPollers = await requestFromAPI<GetPollersResponse>(route, {
    request,
    params: { taskQueueType: '2' },
  });

  activityPollers.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
    poller.taskQueueTypes = ['ACTIVITY'];
  });

  workflowPollers.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
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

  activityPollers.pollers.filter((pollerA: PollerWithTaskQueueTypes) =>
    workflowPollers.pollers.some((pollerW: PollerWithTaskQueueTypes) => {
      if (pollerA.identity === pollerW.identity) {
        pollerA.taskQueueTypes = [
          ...pollerW.taskQueueTypes,
          ...pollerA.taskQueueTypes,
        ];
        return pollerA;
      }
    }),
  );

  activityPollers.pollers.reduce(
    r('ACTIVITY'),
    workflowPollers.pollers.reduce(r('WORKFLOW'), {}),
  );

  const pollers = !activityPollers.pollers.length
    ? workflowPollers.pollers
    : activityPollers.pollers;
  const taskQueueStatus = !activityPollers.pollers.length
    ? workflowPollers.taskQueueStatus
    : activityPollers.taskQueueStatus;
  return {
    pollers,
    taskQueueStatus,
  };
}

export async function getTaskQueueCompatibility(
  parameters: GetAllPollersRequest,
  request = fetch,
): Promise<TaskQueueCompatibility> {
  const route = routeForApi('task-queue.compatibility', parameters);
  return requestFromAPI(route, {
    request,
    onError: (e: APIErrorResponse) => console.error(e),
  });
}

export async function getWorkerTaskReachability(
  parameters: GetWorkerTaskReachabilityRequest,
  request = fetch,
): Promise<WorkerReachability> {
  const { namespace, buildIds, taskQueue } = parameters;
  const route = routeForApi('worker-task-reachability', { namespace });
  const params = new URLSearchParams();

  if (buildIds.length) {
    for (const buildId of buildIds) {
      params.append('buildIds', buildId);
    }
  } else {
    params.append('buildIds', '');
    params.append('taskQueues', taskQueue);
  }

  return await requestFromAPI(route, {
    request,
    params,
    onError: (e: APIErrorResponse) => {
      console.error(e);
      return {
        buildIdReachability: [],
      };
    },
  });
}

function getLabelForReachability(reachability: unknown[]): string {
  if (!reachability || !reachability.length)
    return translate('workers', 'ready-to-be-retired');
  if (reachability.length === 1 && reachability.includes('CLOSED')) {
    return translate('maybe');
  }
  return translate('no');
}

export function getBuildIdReachability(
  workerTaskReachability: WorkerReachability,
  taskQueue: string,
  buildId: string,
): string {
  const buildIdReachability = workerTaskReachability?.buildIdReachability?.find(
    (bird) => bird.buildId === buildId,
  );
  if (!buildIdReachability) return '';
  const currentTaskQueueReachability =
    buildIdReachability?.taskQueueReachability?.find(
      (tqr) => tqr?.taskQueue === taskQueue,
    );
  if (!currentTaskQueueReachability) return '';
  const reachability = currentTaskQueueReachability?.reachability;
  return getLabelForReachability(reachability);
}
