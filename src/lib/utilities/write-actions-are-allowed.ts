import { get } from 'svelte/store';

import { authUser } from '$lib/stores/auth-user';
import { settings } from '$lib/stores/settings';

import { hasWriteAccess } from './permissions';

export const writeActionsAreAllowed = (store = settings): boolean => {
  const isDisabled = get(store).disableWriteActions;
  const user = get(authUser);

  return !isDisabled && hasWriteAccess(user);
};
