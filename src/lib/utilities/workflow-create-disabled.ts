import type { Settings } from '$lib/types/global';
import { corePermissions } from '$lib/utilities/core-provider';

export const workflowCreateDisabled = (
  namespace: string,
  settings: Partial<Settings> = {},
): boolean =>
  settings.disableWriteActions === true ||
  settings.startWorkflowDisabled === true ||
  !corePermissions.namespaces.canStartWorkflow(namespace);
