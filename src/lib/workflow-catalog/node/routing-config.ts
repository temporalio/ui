import type { WorkflowCatalogRouting } from '../browser/routing';

type WorkflowCatalogRoutingEnvironment = Record<string, string | undefined>;

export const workflowCatalogRoutingFromEnvironment = (
  environment: WorkflowCatalogRoutingEnvironment,
): WorkflowCatalogRouting => {
  const namespace = environment.TEMPORAL_NAMESPACE;

  if (!namespace) return {};

  return {
    'shared-workflows': {
      namespace,
      taskQueue: environment.TEMPORAL_TASK_QUEUE || 'ui-workflow-catalog',
    },
  };
};

export const requireWorkflowCatalogRoutingFromEnvironment = (
  environment: WorkflowCatalogRoutingEnvironment,
): WorkflowCatalogRouting => {
  if (!environment.TEMPORAL_NAMESPACE) {
    throw new Error('TEMPORAL_NAMESPACE is required');
  }

  return workflowCatalogRoutingFromEnvironment(environment);
};
