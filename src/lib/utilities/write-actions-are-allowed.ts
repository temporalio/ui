import type { Settings } from '$lib/types/global';

export const writeActionsAreAllowed = (settings: Settings): boolean => {
  return !settings.disableWriteActions;
};
