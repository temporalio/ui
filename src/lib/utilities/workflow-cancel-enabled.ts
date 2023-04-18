import type { Settings } from '$lib/types/global';

export const workflowCancelEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowCancelDisabled;
};
