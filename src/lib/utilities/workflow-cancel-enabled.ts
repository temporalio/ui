import {
  corePermissions,
  type WorkflowPermissionSettings,
} from '$lib/utilities/core-provider';

export const workflowCancelEnabled = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
): boolean =>
  corePermissions.namespaces.canRequestWorkflowCancellation(
    namespace,
    settings,
  );
