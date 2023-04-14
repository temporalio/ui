import type { Settings } from 'src/types/global';

export const workflowCancelEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowCancelDisabled;
};
