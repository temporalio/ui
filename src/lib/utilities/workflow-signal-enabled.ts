import type { Settings } from '$lib/types/global';
import { corePermissions } from '$lib/utilities/core-provider';

export const workflowSignalEnabled = (
  namespace: string,
  settings: Partial<Settings> = {},
): boolean =>
  !settings.disableWriteActions &&
  !settings.workflowSignalDisabled &&
  corePermissions.namespaces.canSignalWorkflow(namespace);
