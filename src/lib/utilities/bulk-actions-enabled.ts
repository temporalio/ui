import { get } from 'svelte/store';

import { authUser } from '$lib/stores/auth-user';
import type { Settings } from '$lib/types/global';

import { canPerformBatchOperations } from './permissions';

const ALLOWED_BULK_ACTIONS: (keyof Pick<
  Settings,
  | 'workflowSignalDisabled'
  | 'workflowCancelDisabled'
  | 'workflowResetDisabled'
  | 'workflowTerminateDisabled'
>)[] = ['workflowCancelDisabled', 'workflowTerminateDisabled'];

export const bulkActionsEnabled = (settings: Settings) => {
  const user = get(authUser);

  if (settings.disableWriteActions) return false;
  if (settings.batchActionsDisabled) return false;
  if (!canPerformBatchOperations(user)) return false;

  return ALLOWED_BULK_ACTIONS.some((action) => !settings[action]);
};
