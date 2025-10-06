import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const editDisabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  return (
    settings.disableWriteActions || coreUser.namespaceWriteDisabled(namespace)
  );
};
