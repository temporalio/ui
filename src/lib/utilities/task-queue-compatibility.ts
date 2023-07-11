export const getDefaultVersionForSet = (buildIds: string[]) => {
  const reverseSortedBuildIds = buildIds.reverse();
  return reverseSortedBuildIds[0];
};

export const getNonDefaultVersionsForSet = (buildIds: string[]) => {
  const reverseSortedBuildIds = buildIds.reverse();
  return reverseSortedBuildIds.slice(1);
};
