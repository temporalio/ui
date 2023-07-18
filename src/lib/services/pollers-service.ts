import type {
  BuildIdReachability,
  PollerInfo,
  TaskQueueCompatibleVersionSet,
  TaskQueueStatus,
  TaskReachability,
} from '$lib/types';
import type { NamespaceScopedRequest } from '$lib/types/global';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };

export type GetWorkerTaskReachabilityRequest = NamespaceScopedRequest & {
  buildIds?: string[];
  taskQueues?: string[];
};

export type GetPollersResponse = {
  pollers: PollerWithTaskQueueTypes[];
  taskQueueStatus: TaskQueueStatus;
};

export type TaskQueueCompatibility = {
  majorVersionSets: TaskQueueCompatibleVersionSet[];
};

export type GetWorkerTaskReachabilityResponse = {
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
  return requestFromAPI(route, { request });
}

export async function getWorkerTaskReachability(
  parameters: GetWorkerTaskReachabilityRequest,
  request = fetch,
): Promise<GetWorkerTaskReachabilityResponse> {
  const { namespace, taskQueues, buildIds } = parameters;
  const route = routeForApi('worker-task-reachability', { namespace });
  return requestFromAPI(route, {
    request,
    params: { buildIds, taskQueues },
  });
}

function getLabelForReachability(reachability: TaskReachability[]): string {
  if (!reachability || !reachability.length) return 'Ready to be Retired';
  if (reachability.length === 1 && reachability.includes('CLOSED')) {
    return 'Maybe';
  }
  return 'No';
  // if (reachability.includes(TaskReachability.TASK_REACHABILITY_NEW_WORKFLOWS)) {
  //   return 'NEW_WORKFLOWS';
  // }
  // if (reachability.includes(TaskReachability.TASK_REACHABILITY_EXISTING_WORKFLOWS)) {
  //   return 'EXISTING_WORKFLOWS';
  // }
  // if (reachability.includes(TaskReachability.TASK_REACHABILITY_OPEN_WORKFLOWS)) {
  //   return 'OPEN_WORKFLOWS';
  // }
}

export async function getWorkerTaskRetirementStatus(
  parameters: GetWorkerTaskReachabilityRequest,
  request = fetch,
): Promise<string> {
  const reachability = await getWorkerTaskReachability(parameters, request);
  const buildIdReachability = reachability?.buildIdReachability[0];
  const taskQueueReachability =
    buildIdReachability?.taskQueueReachability?.[0]?.reachability;
  return getLabelForReachability(taskQueueReachability);
}
