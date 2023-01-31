export const workflowResetEnabled = (settings: Settings): boolean => {
  if (settings?.runtimeEnvironment?.isCloud) return false;
  if (settings.disableWriteActions) return false;

  return !settings.workflowResetDisabled;
};
