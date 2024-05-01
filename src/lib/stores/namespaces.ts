import { derived } from 'svelte/store';

import { page } from '$app/stores';

import { persistStore } from './persist-store';

export const lastUsedNamespace = persistStore('lastNamespace', 'default', true);

export const namespaces = derived([page], ([$page]) => {
  return $page.data.namespaces || [];
});
