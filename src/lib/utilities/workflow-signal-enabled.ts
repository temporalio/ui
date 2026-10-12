import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowSignalEnabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean => corePermissions.namespaces.canSignalWorkflow(namespace, settings);
