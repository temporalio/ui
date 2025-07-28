import type {
  Poller,
  PollerWithTaskQueueTypes,
  TaskQueueType,
} from '$lib/services/pollers-service';
import type { PollerInfo, TaskQueueResponse } from '$lib/types';

type PollersData = {
  [key: string]: Poller;
};

export const reducePollerTypes = ({
  activityPollers,
  nexusPollers,
  workflowPollers,
}: {
  activityPollers: TaskQueueResponse;
  nexusPollers: TaskQueueResponse;
  workflowPollers: TaskQueueResponse;
}): TaskQueueResponse => {
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

  activityPollers.pollers.filter((pollerA: PollerWithTaskQueueTypes) =>
    nexusPollers.pollers.some((pollerN: PollerWithTaskQueueTypes) => {
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
        pollerN.taskQueueTypes = [
          ...pollerW.taskQueueTypes,
          ...pollerN.taskQueueTypes,
        ];
        return pollerN;
      }
    }),
  );

  activityPollers.pollers?.reduce(
    r('ACTIVITY'),
    nexusPollers.pollers?.reduce(
      r('NEXUS'),
      workflowPollers.pollers.reduce(r('WORKFLOW'), {}),
    ),
  );

  const pollers = activityPollers.pollers.length
    ? activityPollers.pollers
    : !nexusPollers.pollers.length
      ? workflowPollers.pollers
      : nexusPollers.pollers;

  const taskQueueStatus = activityPollers.pollers.length
    ? nexusPollers.taskQueueStatus
    : !nexusPollers.pollers.length
      ? workflowPollers.taskQueueStatus
      : nexusPollers.taskQueueStatus;

  const versioningInfo = activityPollers.pollers.length
    ? nexusPollers.versioningInfo
    : !nexusPollers.pollers.length
      ? workflowPollers.versioningInfo
      : nexusPollers.versioningInfo;

  return {
    pollers,
    taskQueueStatus,
    versioningInfo,
  };
};
