export const workflowSignalEnabled = (settings: Settings): boolean => {
  if (settings?.runtimeEnvironment?.isCloud) return false;
  if (settings.disableWriteActions) return false;

  return !settings.workflowSignalDisabled;
};
