import { get } from 'svelte/store';

import type { CoreUser } from '$lib/models/core-user';
import { authUser } from '$lib/stores/auth-user';
import type { Settings } from '$lib/types/global';

import { canPerformWorkflowAction, WORKFLOW_ACTIONS } from './permissions';

export const workflowUpdateEnabled = (
  settings: Settings,
  coreUser: CoreUser,
  namespace: string,
): boolean => {
  const user = get(authUser);

  return (
    !settings.disableWriteActions &&
    !settings.workflowUpdateDisabled &&
    !coreUser.namespaceWriteDisabled(namespace) &&
    canPerformWorkflowAction(user, WORKFLOW_ACTIONS.UPDATE)
  );
};
