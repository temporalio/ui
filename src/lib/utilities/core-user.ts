import { CoreUser, CoreUserKey } from '$lib/models/core-user';
import { hasContext, getContext } from 'svelte';

export const getCoreUser = (): CoreUser => {
  if (!hasContext(CoreUserKey)) return {} as CoreUser;
  return getContext(CoreUserKey);
};
