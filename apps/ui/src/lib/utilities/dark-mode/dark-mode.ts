import { derived } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';

export type DarkModePreference = boolean | 'system';

export const useDarkModePreference = persistStore<DarkModePreference>(
  'dark mode',
  'system',
  true,
);

export const prefersDarkMode = (useDarkModePreference: DarkModePreference) => {
  if (useDarkModePreference == 'system') {
    return (
      window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
    );
  } else {
    return useDarkModePreference;
  }
};

export const useDarkMode = derived(useDarkModePreference, prefersDarkMode);

export const getNextDarkModePreference = (value: DarkModePreference) =>
  value == 'system' ? true : value == true ? false : 'system';

export const darkMode = (node: HTMLElement) => {
  useDarkMode.subscribe((value) => {
    if (value) {
      node.dataset.theme = 'dark';
    } else {
      node.dataset.theme = 'light';
    }
  });
};
