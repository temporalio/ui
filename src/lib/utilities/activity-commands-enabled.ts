import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const activityCommandsEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !coreUser.namespaceWriteDisabled(namespace) &&
    !coreUser.isActivityCommandsDisabled &&
    !settings.activityCommandsDisabled
  );
};
