import { CoreUser, CoreUserKey } from '$lib/models/core-user';
import { hasContext, getContext } from 'svelte';
import { readable, Readable } from 'svelte/store';

export const defaultCoreUserStore: Readable<CoreUser> = readable({
  terminateDisabled: () => false,
  scheduleWriteDisabled: () => false,
});

export const coreUserStore = (): Readable<CoreUser> => {
  if (!hasContext(CoreUserKey)) return defaultCoreUserStore;
  return getContext(CoreUserKey);
};
