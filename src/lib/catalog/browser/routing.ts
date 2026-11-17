export type CatalogWorkspaceRouting = {
  namespace: string;
  taskQueue: string;
};

export type CatalogRouting = Readonly<Record<string, CatalogWorkspaceRouting>>;

export type CatalogRoutableWorkspace = CatalogWorkspaceRouting & {
  workspaceId: string;
};

export const resolveCatalogRouting = <
  Workspace extends CatalogRoutableWorkspace,
>(
  workspaces: readonly Workspace[],
  routing: CatalogRouting,
): Workspace[] => {
  const workspaceIds = new Set(
    workspaces.map(({ workspaceId }) => workspaceId),
  );

  for (const workspaceId of Object.keys(routing)) {
    if (!workspaceIds.has(workspaceId)) {
      throw new Error(`Unknown catalog routing workspace "${workspaceId}"`);
    }
  }

  return workspaces.map((workspace) => {
    const resolved = routing[workspace.workspaceId];

    return resolved
      ? {
          ...workspace,
          namespace: resolved.namespace,
          taskQueue: resolved.taskQueue,
        }
      : { ...workspace };
  });
};
