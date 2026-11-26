import type { Settings } from '$lib/types/global';
import { corePermissions } from '$lib/utilities/core-provider';

export const workflowTerminateEnabled = (
  namespace: string,
  settings: Partial<Settings> = {},
): boolean =>
  !settings.disableWriteActions &&
  !settings.workflowTerminateDisabled &&
  corePermissions.namespaces.canTerminateWorkflow(namespace);
