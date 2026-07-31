import type { Settings } from '$lib/types/global';

const ALLOWED_BULK_ACTIONS: (keyof Pick<
  Settings,
  | 'workflowSignalDisabled'
  | 'workflowCancelDisabled'
  | 'workflowResetDisabled'
  | 'workflowTerminateDisabled'
>)[] = ['workflowCancelDisabled', 'workflowTerminateDisabled'];

type BulkActionSettings = Partial<
  Pick<
    Settings,
    | 'disableWriteActions'
    | 'batchActionsDisabled'
    | 'workflowCancelDisabled'
    | 'workflowResetDisabled'
    | 'workflowSignalDisabled'
    | 'workflowTerminateDisabled'
  >
>;

export const workflowBulkActionsEnabled = (settings: BulkActionSettings) => {
  if (settings.disableWriteActions) return false;
  if (settings.batchActionsDisabled) return false;

  return ALLOWED_BULK_ACTIONS.some((action) => !settings[action]);
};
