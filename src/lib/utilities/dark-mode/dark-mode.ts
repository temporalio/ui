import { derived } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';

export const useDarkModePreference = persistStore<boolean | null>(
  'dark mode',
  import.meta.env.VITE_DARK_MODE ?? null,
  true,
);

export const useDarkMode = derived(
  useDarkModePreference,
  ($useDarkModePreference) => {
    if ($useDarkModePreference == null) {
      return (
        window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
      );
    } else {
      return $useDarkModePreference;
    }
  },
);

export const darkMode = (node: HTMLElement) => {
  useDarkMode.subscribe((value) => {
    if (value) {
      node.dataset.theme = 'dark';
    } else {
      node.dataset.theme = 'light';
    }
  });
};
