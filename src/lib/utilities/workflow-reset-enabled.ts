import type { Settings } from 'src/types/global';

export const workflowResetEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowResetDisabled;
};
