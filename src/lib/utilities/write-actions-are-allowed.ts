import { get } from 'svelte/store';

import { settings } from '$lib/stores/settings';

export const writeActionsAreAllowed = (store = settings): boolean => {
  const isDisabled = get(store).disableWriteActions;
  return !isDisabled;
};
