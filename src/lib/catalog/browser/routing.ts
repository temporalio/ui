export type CatalogTargetRouting = {
  namespace: string;
  taskQueue: string;
};

export type CatalogRouting = Readonly<Record<string, CatalogTargetRouting>>;

export type CatalogRoutableTarget = CatalogTargetRouting & {
  targetId: string;
};

export const resolveCatalogRouting = <Target extends CatalogRoutableTarget>(
  targets: readonly Target[],
  routing: CatalogRouting,
): Target[] => {
  const targetIds = new Set(targets.map(({ targetId }) => targetId));

  for (const targetId of Object.keys(routing)) {
    if (!targetIds.has(targetId)) {
      throw new Error(`Unknown catalog routing target "${targetId}"`);
    }
  }

  return targets.map((target) => {
    const resolved = routing[target.targetId];

    return resolved
      ? {
          ...target,
          namespace: resolved.namespace,
          taskQueue: resolved.taskQueue,
        }
      : { ...target };
  });
};
