export const workflowSignalEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowSignalDisabled;
};
