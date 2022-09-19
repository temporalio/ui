import { CoreUser, CoreUserKey } from '$lib/models/core-user';
import { hasContext, getContext } from 'svelte';

export const getCoreUser = (): CoreUser | undefined => {
  if (!hasContext(CoreUserKey)) return undefined;
  return getContext(CoreUserKey);
};
