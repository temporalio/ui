import { writable } from 'svelte/store';

import { persistStore } from './persist-store';

export const navOpen = persistStore('navOpen', false);

export const namespaceSelectorOpen = writable<boolean | null>();

export const savedQueryNavOpen = persistStore('savedQueryNavOpen', true);

export const savedActivityNavOpen = persistStore('savedActivityNavOpen', true);
