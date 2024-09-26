import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowTerminateEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowTerminateDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
