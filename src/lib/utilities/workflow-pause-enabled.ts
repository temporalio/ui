import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowPauseEnabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean =>
  corePermissions.namespaces.canChangeWorkflowPauseState(namespace, settings);
