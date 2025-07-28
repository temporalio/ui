import { translate } from '$lib/i18n/translate';
import type {
  BuildIdReachability,
  PollerInfo,
  TaskQueueCompatibleVersionSet,
  TaskQueueResponse,
  TaskQueueStatus,
} from '$lib/types';
import type { RoutingConfig } from '$lib/types/deployments';
import type { NamespaceScopedRequest } from '$lib/types/global';
import { reducePollerTypes } from '$lib/utilities/reduce-poller-types';
import {
  type APIErrorResponse,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { getOrderedVersionSets } from '$lib/utilities/task-queue-compatibility';

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };

export type GetWorkerTaskReachabilityRequest = NamespaceScopedRequest & {
  queue: string;
  buildIds: string[];
};

export type GetPollersResponse = {
  pollers?: PollerWithTaskQueueTypes[];
  taskQueueStatus?: TaskQueueStatus;
  versioningInfo?: RoutingConfig;
};

export type AssignmentRule = {
  rule: {
    targetBuildId: string;
    percentageRamp?: {
      rampPercentage?: number;
    };
  };
  createTime: string;
};

type CompatibleRedirectRule = {
  rule: {
    sourceBuildId: string;
    targetBuildId: string;
  };
  createTime: string;
};

export type TaskQueueRules = {
  assignmentRules?: AssignmentRule[];
  compatibleRedirectRules?: CompatibleRedirectRule[];
  conflictToken: string;
};

export type TaskQueueCompatibility = {
  majorVersionSets: TaskQueueCompatibleVersionSet[];
};

export type WorkerReachability = {
  buildIdReachability: BuildIdReachability[];
};

type TaskQueueType = 'ACTIVITY' | 'WORKFLOW' | 'NEXUS';

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

  const activityPollers = await requestFromAPI<TaskQueueResponse>(route, {
    request,
    params: { taskQueueType: '2' },
  });

  const nexusPollers = await requestFromAPI<TaskQueueResponse>(route, {
    request,
    params: { taskQueueType: '3' },
  });

  return reducePollerTypes({ activityPollers, nexusPollers, workflowPollers });
}

export type VersionResults = {
  rules: TaskQueueRules;
  compatibility: TaskQueueCompatibility;
  versionSets: TaskQueueCompatibleVersionSet[];
};

export async function getVersioning(
  parameters: GetAllPollersRequest,
  request = fetch,
): Promise<VersionResults> {
  const rules = await getTaskQueueRules(parameters, request);
  const compatibility = await getTaskQueueCompatibility(parameters, request);
  const versionSets = getOrderedVersionSets(compatibility);

  return { rules, compatibility, versionSets };
}

export async function getTaskQueueRules(
  parameters: GetAllPollersRequest,
  request = fetch,
): Promise<TaskQueueRules | undefined> {
  const route = routeForApi('task-queue.rules', parameters);
  return requestFromAPI(route, {
    request,
    handleError: (_e: APIErrorResponse) => {
      return;
    },
  });
}

export async function getTaskQueueCompatibility(
  parameters: GetAllPollersRequest,
  request = fetch,
): Promise<TaskQueueCompatibility | undefined> {
  const route = routeForApi('task-queue.compatibility', parameters);
  return requestFromAPI(route, {
    request,
    handleError: (_e: APIErrorResponse) => {
      return;
    },
  });
}

export async function getWorkerTaskReachability(
  parameters: GetWorkerTaskReachabilityRequest,
  request = fetch,
): Promise<WorkerReachability> {
  const { namespace, buildIds, queue } = parameters;
  const route = routeForApi('worker-task-reachability', { namespace });
  const params = new URLSearchParams();

  if (buildIds.length) {
    for (const buildId of buildIds) {
      params.append('buildIds', buildId);
    }
  } else {
    params.append('buildIds', '');
    params.append('taskQueues', queue);
  }

  return await requestFromAPI(route, {
    request,
    params,
    handleError: (_e: APIErrorResponse) => {
      return {
        buildIdReachability: [],
      };
    },
  });
}

function getLabelForReachability(reachability: unknown[]): string {
  if (!reachability || !reachability.length)
    return translate('workers.ready-to-be-retired');
  if (reachability.length === 1 && reachability.includes('CLOSED')) {
    return translate('common.maybe');
  }
  return translate('common.no');
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
