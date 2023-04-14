import type { Settings } from 'src/types/global';

export const workflowSignalEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowSignalDisabled;
};
