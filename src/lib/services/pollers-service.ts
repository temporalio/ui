import { translate } from '$lib/i18n/translate';
import type {
  BuildIdReachability,
  PollerInfo,
  TaskQueueCompatibleVersionSet,
  TaskQueueStatus,
} from '$lib/types';
import type { RoutingConfig } from '$lib/types/deployments';
import type { NamespaceScopedRequest } from '$lib/types/global';
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
  taskQueueStatus: TaskQueueStatus;
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

type PollersData = {
  [key: string]: Poller;
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

  const nexusPollers = await requestFromAPI<GetPollersResponse>(route, {
    request,
    params: { taskQueueType: '3' },
  });

  if (!workflowPollers?.pollers) workflowPollers.pollers = [];
  if (!activityPollers?.pollers) activityPollers.pollers = [];
  if (!nexusPollers?.pollers) nexusPollers.pollers = [];

  activityPollers.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
    poller.taskQueueTypes = ['ACTIVITY'];
  });

  workflowPollers.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
    poller.taskQueueTypes = ['WORKFLOW'];
  });

  nexusPollers.pollers.forEach((poller: PollerWithTaskQueueTypes) => {
    poller.taskQueueTypes = ['NEXUS'];
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

  nexusPollers.pollers.filter((pollerN: PollerWithTaskQueueTypes) =>
    activityPollers.pollers.some((pollerA: PollerWithTaskQueueTypes) => {
      if (pollerN.identity === pollerA.identity) {
        pollerA.taskQueueTypes = [
          ...pollerA.taskQueueTypes,
          ...pollerN.taskQueueTypes,
        ];
        return pollerA;
      }
    }),
  );

  nexusPollers.pollers.filter((pollerN: PollerWithTaskQueueTypes) =>
    workflowPollers.pollers.some((pollerW: PollerWithTaskQueueTypes) => {
      if (pollerN.identity === pollerW.identity) {
        pollerW.taskQueueTypes = [
          ...pollerW.taskQueueTypes,
          ...pollerN.taskQueueTypes,
        ];
        return pollerW;
      }
    }),
  );

  nexusPollers.pollers?.reduce(
    r('NEXUS'),
    activityPollers.pollers?.reduce(
      r('ACTIVITY'),
      workflowPollers.pollers.reduce(r('WORKFLOW'), {}),
    ),
  );

  const pollers = nexusPollers.pollers.length
    ? nexusPollers.pollers
    : !activityPollers.pollers.length
      ? workflowPollers.pollers
      : activityPollers.pollers;

  const taskQueueStatus = nexusPollers.pollers.length
    ? nexusPollers.taskQueueStatus
    : !activityPollers.pollers.length
      ? workflowPollers.taskQueueStatus
      : activityPollers.taskQueueStatus;

  const versioningInfo = nexusPollers.pollers.length
    ? nexusPollers.versioningInfo
    : !activityPollers.pollers.length
      ? workflowPollers.versioningInfo
      : activityPollers.versioningInfo;

  return {
    pollers,
    taskQueueStatus,
    versioningInfo,
  };
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
