import type { Settings } from '$lib/types/global';
import { corePermissions } from '$lib/utilities/core-provider';

export const workflowUpdateEnabled = (
  namespace: string,
  settings: Partial<Settings> = {},
): boolean =>
  !settings.disableWriteActions &&
  !settings.workflowUpdateDisabled &&
  corePermissions.namespaces.canUpdateWorkflow(namespace);
