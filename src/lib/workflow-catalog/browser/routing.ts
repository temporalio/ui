export type WorkflowCatalogTargetRouting = {
  namespace: string;
  taskQueue: string;
};

export type WorkflowCatalogRouting = Readonly<
  Record<string, WorkflowCatalogTargetRouting>
>;

export type WorkflowCatalogRoutableTarget = WorkflowCatalogTargetRouting & {
  targetId: string;
};

export const resolveWorkflowCatalogRouting = <
  Target extends WorkflowCatalogRoutableTarget,
>(
  targets: readonly Target[],
  routing: WorkflowCatalogRouting,
): Target[] => {
  const targetIds = new Set(targets.map(({ targetId }) => targetId));

  for (const targetId of Object.keys(routing)) {
    if (!targetIds.has(targetId)) {
      throw new Error(`Unknown workflow catalog routing target "${targetId}"`);
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
