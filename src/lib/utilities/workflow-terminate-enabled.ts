import type { Settings } from 'src/types/global';

export const workflowTerminateEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowTerminateDisabled;
};
