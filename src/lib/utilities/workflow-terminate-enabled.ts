import type { Settings } from '$lib/types/global';

export const workflowTerminateEnabled = (settings: Settings): boolean => {
  return !settings.disableWriteActions && !settings.workflowTerminateDisabled;
};
