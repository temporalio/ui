import type { TaskQueueCompatibility } from '$lib/services/pollers-service';
import type { PollerInfo, TaskQueueCompatibleVersionSet } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

export const getOrderedVersionSets = (
  compatibility: TaskQueueCompatibility,
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

export const getNonDefaultVersionsForSet = (buildIds?: string[]): string[] => {
  if (!buildIds) return [];
  return buildIds.slice(0, buildIds.length - 1).reverse();
};

export const getCurrentCompatibilityDefaultVersion = (
  compatibility: TaskQueueCompatibility,
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
  if (workflow?.mostRecentWorkerVersionStamp?.useVersioning) {
    return workflow.mostRecentWorkerVersionStamp?.buildId || undefined;
  }
  return undefined;
};

export const getCurrentPollerBuildId = (
  poller: PollerInfo,
): string | undefined => {
  if (poller.workerVersionCapabilities?.useVersioning) {
    return poller.workerVersionCapabilities?.buildId || undefined;
  }
  return undefined;
};
