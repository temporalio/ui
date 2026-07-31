import type { CoreUser } from '$lib/models/core-user';
import type { Settings } from '$lib/types/global';

export const workflowUpdateEnabled = (
  settings: Partial<
    Pick<Settings, 'disableWriteActions' | 'workflowUpdateDisabled'>
  >,
  coreUser: Pick<CoreUser, 'namespaceWriteDisabled'>,
  namespace: string,
): boolean => {
  return (
    !settings.disableWriteActions &&
    !settings.workflowUpdateDisabled &&
    !coreUser.namespaceWriteDisabled(namespace)
  );
};
