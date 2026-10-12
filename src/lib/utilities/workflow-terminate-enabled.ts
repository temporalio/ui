import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowTerminateEnabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean =>
  corePermissions.namespaces.canTerminateWorkflow(namespace, settings);
