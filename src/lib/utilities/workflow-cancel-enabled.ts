import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowCancelEnabled = (
  settings: Partial<
    Pick<Settings, 'disableWriteActions' | 'workflowCancelDisabled'>
  >,
  coreUser: Pick<CoreUser, 'namespaceWriteDisabled'>,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowCancelDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
