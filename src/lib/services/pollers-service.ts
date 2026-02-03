import type { PollerInfo, TaskQueueResponse } from '$lib/types';
import type { NamespaceScopedRequest } from '$lib/types/global';
import { reducePollerTypes } from '$lib/utilities/reduce-poller-types';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };

export type TaskQueueType = 'ACTIVITY' | 'WORKFLOW' | 'NEXUS';

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
): Promise<TaskQueueResponse> {
  const route = routeForApi('task-queue', parameters);
  const workflowPollers = await requestFromAPI<TaskQueueResponse>(route, {
    request,
    params: { taskQueueType: '1' },
  });

  const activityPollers = await getActivityPollers(parameters, request);

  const nexusPollers = await requestFromAPI<TaskQueueResponse>(route, {
    request,
    params: { taskQueueType: '3' },
  });

  return reducePollerTypes({ activityPollers, nexusPollers, workflowPollers });
}

export async function getActivityPollers(
  parameters: GetAllPollersRequest,
  request = fetch,
): Promise<TaskQueueResponse> {
  const route = routeForApi('task-queue', parameters);

  return requestFromAPI<TaskQueueResponse>(route, {
    request,
    params: { taskQueueType: '2' },
  });
}
