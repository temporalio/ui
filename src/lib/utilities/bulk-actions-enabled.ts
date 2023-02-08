const ALLOWED_BULK_ACTIONS: (keyof Pick<
  Settings,
  | 'workflowSignalDisabled'
  | 'workflowCancelDisabled'
  | 'workflowResetDisabled'
  | 'workflowTerminateDisabled'
>)[] = ['workflowCancelDisabled', 'workflowTerminateDisabled'];

export const bulkActionsEnabled = (
  settings: Settings,
  supportsAdvancedVisibility: boolean,
) => {
  if (!supportsAdvancedVisibility) return false;
  if (settings.disableWriteActions) return false;
  if (settings.batchActionsDisabled) return false;

  return ALLOWED_BULK_ACTIONS.some((action) => !settings[action]);
};
