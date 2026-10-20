import type { Settings } from '$lib/types/global';
import { corePermissions } from '$lib/utilities/core-provider';

export const workflowPauseEnabled = (
  namespace: string,
  settings: Partial<Settings> = {},
): boolean =>
  !settings.disableWriteActions &&
  !settings.workflowPauseDisabled &&
  corePermissions.namespaces.canChangeWorkflowPauseState(namespace);
