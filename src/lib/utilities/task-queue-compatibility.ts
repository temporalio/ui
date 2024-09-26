import type {
  PollerWithTaskQueueTypes,
  TaskQueueCompatibility,
} from '$lib/services/pollers-service';
import type { PollerInfo, TaskQueueCompatibleVersionSet } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

export const getOrderedVersionSets = (
  compatibility: TaskQueueCompatibility | undefined,
): TaskQueueCompatibleVersionSet[] => {
  const sets = compatibility?.majorVersionSets
    ? [...compatibility.majorVersionSets]
    : [];
  return sets.reverse();
};

export const getDefaultVersionForSet = (
  buildIds?: string[],
): string | undefined => {
  if (!buildIds || !buildIds.length) return undefined;
  return buildIds[buildIds.length - 1];
};

export const getDefaultVersionForSetFromABuildId = (
  compatibility: TaskQueueCompatibility | undefined,
  buildId: string,
): string | undefined => {
  const buildIdSet = compatibility?.majorVersionSets?.find(
    (set) => set.buildIds?.includes(buildId),
  );
  return getDefaultVersionForSet(buildIdSet?.buildIds);
};

export const getNonDefaultVersionsForSet = (buildIds?: string[]): string[] => {
  if (!buildIds) return [];
  return buildIds.slice(0, buildIds.length - 1).reverse();
};

export const getCurrentCompatibilityDefaultVersion = (
  compatibility: TaskQueueCompatibility | undefined,
): string | undefined => {
  const orderedSets = getOrderedVersionSets(compatibility);
  if (!orderedSets.length) return undefined;

  const defaultVersionBuildIds = orderedSets[0]?.buildIds;
  if (!defaultVersionBuildIds?.length) return undefined;

  return getDefaultVersionForSet(orderedSets[0].buildIds);
};

export const getCurrentWorkflowBuildId = (
  workflow: WorkflowExecution,
): string | undefined => {
  if (workflow?.assignedBuildId) return workflow.assignedBuildId;
  if (workflow?.mostRecentWorkerVersionStamp?.useVersioning) {
    return workflow.mostRecentWorkerVersionStamp?.buildId || undefined;
  }
  return undefined;
};

export const getCurrentPollerBuildId = (
  poller: PollerInfo,
): string | undefined => {
  if (poller?.workerVersionCapabilities?.useVersioning) {
    return poller.workerVersionCapabilities?.buildId || undefined;
  }
  return undefined;
};

export const getUniqueBuildIdsFromPollers = (
  pollers: PollerWithTaskQueueTypes[],
): string[] => {
  const buildIds = [
    ...new Set(pollers?.map(getCurrentPollerBuildId).filter(Boolean)),
  ];
  return buildIds;
};

export const pollerHasVersioning = (
  pollers: PollerWithTaskQueueTypes[],
): boolean => {
  return pollers?.some(
    (poller) => poller?.workerVersionCapabilities?.useVersioning,
  );
};

export const workflowIsCompatibleWithWorkers = (
  workflow: WorkflowExecution,
  pollers: PollerWithTaskQueueTypes[],
  compatibility: TaskQueueCompatibility | undefined,
): boolean => {
  const workflowBuildId = getCurrentWorkflowBuildId(workflow);
  if (!workflowBuildId) return true;
  const defaultVersionForBuildId = getDefaultVersionForSetFromABuildId(
    compatibility,
    workflowBuildId,
  );
  const buildIds = getUniqueBuildIdsFromPollers(pollers);
  return buildIds.includes(defaultVersionForBuildId);
};
