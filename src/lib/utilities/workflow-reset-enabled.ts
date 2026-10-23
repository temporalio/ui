import type { Settings } from '$lib/types/global';
import { corePermissions } from '$lib/utilities/core-provider';

export const workflowResetEnabled = (
  namespace: string,
  settings: Partial<Settings> = {},
): boolean =>
  !settings.disableWriteActions &&
  !settings.workflowResetDisabled &&
  corePermissions.namespaces.canResetWorkflow(namespace);
