import { CoreUser, CoreUserKey } from '$lib/models/core-user';
import { hasContext, getContext } from 'svelte';

export const getCoreUser = (): CoreUser => {
  if (!hasContext(CoreUserKey)) return { terminateDisabled: () => false };
  return getContext(CoreUserKey);
};
