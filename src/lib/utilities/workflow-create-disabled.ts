import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowCreateDisabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean => !corePermissions.namespaces.canStartWorkflow(namespace, settings);
