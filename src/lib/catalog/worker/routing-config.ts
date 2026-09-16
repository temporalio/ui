import type { CatalogRouting } from '../browser/routing';

type CatalogRoutingEnvironment = Record<string, string | undefined>;

export type CatalogRoutableTargetRegistration = {
  targetId: string;
  taskQueue: string;
};

const defaultTargets: readonly CatalogRoutableTargetRegistration[] = [
  { targetId: 'shared-workflows', taskQueue: 'ui-catalog' },
];

export const catalogRoutingFromEnvironment = (
  environment: CatalogRoutingEnvironment,
  targets: readonly CatalogRoutableTargetRegistration[] = defaultTargets,
): CatalogRouting => {
  const namespace = environment.TEMPORAL_NAMESPACE;

  if (!namespace) return {};

  return Object.fromEntries(
    targets.map(({ targetId, taskQueue }) => [
      targetId,
      { namespace, taskQueue },
    ]),
  );
};

export const requireCatalogRoutingFromEnvironment = (
  environment: CatalogRoutingEnvironment,
  targets?: readonly CatalogRoutableTargetRegistration[],
): CatalogRouting => {
  if (!environment.TEMPORAL_NAMESPACE) {
    throw new Error('TEMPORAL_NAMESPACE is required');
  }

  return catalogRoutingFromEnvironment(environment, targets);
};
