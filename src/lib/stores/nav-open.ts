import { writable } from 'svelte/store';

import { persistStore } from './persist-store';

const navOpenKey = 'navOpen';
const savedQueryNavOpenKey = 'savedQueryNavOpen';

export const navOpen = persistStore(navOpenKey, true);

export const namespaceSelectorOpen = writable<boolean | null>();

export const savedQueryNavOpen = persistStore(savedQueryNavOpenKey, false);

let navDefaultsInitialized = false;

export const initializeNavDefaults = (collapsedByDefault?: boolean) => {
  if (navDefaultsInitialized || collapsedByDefault === undefined) return;

  navDefaultsInitialized = true;

  if (!collapsedByDefault) {
    savedQueryNavOpen.setInitialValue(true);
    return;
  }

  navOpen.setInitialValue(false);
  savedQueryNavOpen.setInitialValue(false);
};
