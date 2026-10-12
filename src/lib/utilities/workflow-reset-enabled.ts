import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowResetEnabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean => corePermissions.namespaces.canResetWorkflow(namespace, settings);
