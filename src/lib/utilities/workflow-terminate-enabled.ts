import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowTerminateEnabled = (
  settings: Partial<
    Pick<Settings, 'disableWriteActions' | 'workflowTerminateDisabled'>
  >,
  coreUser: Pick<CoreUser, 'namespaceWriteDisabled'>,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowTerminateDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
