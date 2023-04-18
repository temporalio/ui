import type { Settings } from '$lib/types/global';

export const workflowResetEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowResetDisabled;
};
