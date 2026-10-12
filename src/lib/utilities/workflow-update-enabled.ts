import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowUpdateEnabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean => corePermissions.namespaces.canUpdateWorkflow(namespace, settings);
