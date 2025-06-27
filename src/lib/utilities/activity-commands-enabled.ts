import type { CoreUser } from '$lib/models/core-user';
import { isCloud } from '$lib/stores/advanced-visibility';
import type { Settings } from '$lib/types/global';

export const activityCommandsEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !coreUser.namespaceWriteDisabled(namespace) &&
    !settings.activityCommandsDisabled &&
    !isCloud
    // TODO: Remove isCloud check and add back isActivityCommandsDisabled check when feature is ready for Cloud
    // !coreUser.isActivityCommandsDisabled
  );
};
