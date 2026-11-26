import type { CatalogRouting } from '../browser/routing';

type CatalogRoutingEnvironment = Record<string, string | undefined>;

export type CatalogRoutableWorkspaceRegistration = {
  workspaceId: string;
  taskQueue: string;
};

const defaultWorkspaces: readonly CatalogRoutableWorkspaceRegistration[] = [
  { workspaceId: 'shared-workflows', taskQueue: 'ui-catalog' },
];

export const catalogRoutingFromEnvironment = (
  environment: CatalogRoutingEnvironment,
  workspaces: readonly CatalogRoutableWorkspaceRegistration[] = defaultWorkspaces,
): CatalogRouting => {
  const namespace = environment.TEMPORAL_NAMESPACE;

  if (!namespace) return {};

  return Object.fromEntries(
    workspaces.map(({ workspaceId, taskQueue }) => [
      workspaceId,
      { namespace, taskQueue },
    ]),
  );
};

export const requireCatalogRoutingFromEnvironment = (
  environment: CatalogRoutingEnvironment,
  workspaces?: readonly CatalogRoutableWorkspaceRegistration[],
): CatalogRouting => {
  if (!environment.TEMPORAL_NAMESPACE) {
    throw new Error('TEMPORAL_NAMESPACE is required');
  }

  return catalogRoutingFromEnvironment(environment, workspaces);
};
