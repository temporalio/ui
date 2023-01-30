import { persistStore } from './persist-store';
import { writable } from 'svelte/store';

export const navOpen = persistStore('navOpen', false);

export const namespaceSelectorOpen = writable<boolean | null>();
