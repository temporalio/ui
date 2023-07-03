import { getContext, hasContext } from 'svelte';
import { readable, type Readable } from 'svelte/store';

import { type CoreUser, CoreUserKey } from '$lib/models/core-user';

export const defaultCoreUserStore: Readable<CoreUser> = readable({
  namespaceWriteDisabled: () => false,
});

export const coreUserStore = (): Readable<CoreUser> => {
  if (!hasContext(CoreUserKey)) return defaultCoreUserStore;
  return getContext(CoreUserKey);
};
