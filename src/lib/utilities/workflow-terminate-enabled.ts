export const workflowTerminateEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowTerminateDisabled;
};
