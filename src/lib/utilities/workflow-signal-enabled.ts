import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowSignalEnabled = (
  settings: Partial<
    Pick<Settings, 'disableWriteActions' | 'workflowSignalDisabled'>
  >,
  coreUser: Pick<CoreUser, 'namespaceWriteDisabled'>,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowSignalDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
