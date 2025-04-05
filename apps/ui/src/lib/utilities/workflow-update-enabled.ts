import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowUpdateEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowUpdateDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
