export const workflowTerminateEnabled = (settings: Settings): boolean => {
  if (settings.disableWriteActions) return false;

  return !settings.workflowTerminateDisabled;
};
