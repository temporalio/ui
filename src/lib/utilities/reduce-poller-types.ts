import type {
  PollerWithTaskQueueTypes,
  TaskQueueType,
} from '$lib/services/pollers-service';
import type { PollerInfo, TaskQueueResponse } from '$lib/types';

export const reducePollerTypes = ({
  activityPollers,
  nexusPollers,
  workflowPollers,
}: {
  activityPollers: TaskQueueResponse;
  nexusPollers: TaskQueueResponse;
  workflowPollers: TaskQueueResponse;
}): TaskQueueResponse => {
  const workflowPollersList = workflowPollers?.pollers ?? [];
  const activityPollersList = activityPollers?.pollers ?? [];
  const nexusPollersList = nexusPollers?.pollers ?? [];

  const pollerMap = new Map<
    string,
    {
      poller: PollerInfo;
      taskQueueTypes: TaskQueueType[];
    }
  >();

  const addPoller = (poller: PollerInfo, type: TaskQueueType) => {
    if (poller.identity) {
      const existing = pollerMap.get(poller.identity);
      if (existing) {
        existing.taskQueueTypes.push(type);
        if (poller?.lastAccessTime > existing?.poller?.lastAccessTime) {
          existing.poller = poller;
        }
      } else {
        pollerMap.set(poller.identity, {
          poller,
          taskQueueTypes: [type],
        });
      }
    }
  };

  workflowPollersList.forEach((poller) => addPoller(poller, 'WORKFLOW'));
  activityPollersList.forEach((poller) => addPoller(poller, 'ACTIVITY'));
  nexusPollersList.forEach((poller) => addPoller(poller, 'NEXUS'));

  const pollers: PollerWithTaskQueueTypes[] = Array.from(
    pollerMap.values(),
  ).map(({ poller, taskQueueTypes }) => ({
    ...poller,
    taskQueueTypes,
  }));

  const versioningInfo =
    activityPollers?.versioningInfo ??
    workflowPollers?.versioningInfo ??
    nexusPollers?.versioningInfo;

  const taskQueueStatus =
    activityPollers?.taskQueueStatus ??
    workflowPollers?.taskQueueStatus ??
    nexusPollers?.taskQueueStatus;

  return {
    pollers,
    taskQueueStatus,
    versioningInfo,
  };
};
