import { get } from 'svelte/store';

import type { CoreUser } from '$lib/models/core-user';
import { authUser } from '$lib/stores/auth-user';
import type { Settings } from '$lib/types/global';

import { canPerformWorkflowAction, WORKFLOW_ACTIONS } from './permissions';

export const workflowResetEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  const user = get(authUser);

  return (
    !settings.disableWriteActions &&
    !settings.workflowResetDisabled &&
    !coreUser.namespaceWriteDisabled(namespace) &&
    canPerformWorkflowAction(user, WORKFLOW_ACTIONS.RESET)
  );
};
