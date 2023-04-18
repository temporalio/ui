import type { Settings } from '$lib/types/global';

export const workflowSignalEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowSignalDisabled;
};
