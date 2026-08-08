import type { WorkflowCatalogRouting } from '../browser/routing';

type WorkflowCatalogRoutingEnvironment = Record<string, string | undefined>;

export type WorkflowCatalogRoutableTargetRegistration = {
  targetId: string;
  taskQueue: string;
};

const defaultTargets: readonly WorkflowCatalogRoutableTargetRegistration[] = [
  { targetId: 'shared-workflows', taskQueue: 'ui-workflow-catalog' },
];

export const workflowCatalogRoutingFromEnvironment = (
  environment: WorkflowCatalogRoutingEnvironment,
  targets: readonly WorkflowCatalogRoutableTargetRegistration[] = defaultTargets,
): WorkflowCatalogRouting => {
  const namespace = environment.TEMPORAL_NAMESPACE;

  if (!namespace) return {};

  return Object.fromEntries(
    targets.map(({ targetId, taskQueue }) => [
      targetId,
      { namespace, taskQueue },
    ]),
  );
};

export const requireWorkflowCatalogRoutingFromEnvironment = (
  environment: WorkflowCatalogRoutingEnvironment,
  targets?: readonly WorkflowCatalogRoutableTargetRegistration[],
): WorkflowCatalogRouting => {
  if (!environment.TEMPORAL_NAMESPACE) {
    throw new Error('TEMPORAL_NAMESPACE is required');
  }

  return workflowCatalogRoutingFromEnvironment(environment, targets);
};
