import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowResetEnabled = (
  settings: Partial<
    Pick<Settings, 'disableWriteActions' | 'workflowResetDisabled'>
  >,
  coreUser: Pick<CoreUser, 'namespaceWriteDisabled'>,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowResetDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
