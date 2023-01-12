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
  if (settings?.runtimeEnvironment?.isCloud) return false;
  if (settings.disableWriteActions) return false;

  return ALLOWED_BULK_ACTIONS.some((action) => !settings[action]);
};
