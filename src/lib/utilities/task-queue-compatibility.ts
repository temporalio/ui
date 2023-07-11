import type { TaskQueueCompatibility } from '$lib/services/pollers-service';

export const getOrderedVersionSets = (
  compatibility: TaskQueueCompatibility,
) => {
  const sets = compatibility?.majorVersionSets
    ? [...compatibility.majorVersionSets]
    : [];
  return sets.reverse();
};

export const getDefaultVersionForSet = (buildIds: string[]) => {
  return buildIds[buildIds.length - 1];
};

export const getNonDefaultVersionsForSet = (buildIds: string[]) => {
  return buildIds.slice(0, buildIds.length - 1).reverse();
};
