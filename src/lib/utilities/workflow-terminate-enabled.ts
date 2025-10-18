import { get } from 'svelte/store';

import type { CoreUser } from '$lib/models/core-user';
import { authUser } from '$lib/stores/auth-user';
import type { Settings } from '$lib/types/global';

import { canPerformWorkflowAction, WORKFLOW_ACTIONS } from './permissions';

export const workflowTerminateEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  const user = get(authUser);

  const canTerminate = canPerformWorkflowAction(
    user,
    WORKFLOW_ACTIONS.TERMINATE,
  );

  return (
    !settings.disableWriteActions &&
    !settings.workflowTerminateDisabled &&
    !coreUser.namespaceWriteDisabled(namespace) &&
    canTerminate
  );
};
