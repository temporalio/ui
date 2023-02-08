export const workflowResetEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowResetDisabled;
};
