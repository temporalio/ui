import { derived } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';

export type DarkModePreference = boolean | 'system';
export type ThemeOverride = 'light' | 'dark';

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

const applyTheme = (
  node: HTMLElement,
  prefersDark: boolean,
  overrideTheme?: ThemeOverride,
) => {
  node.dataset.theme = overrideTheme ?? (prefersDark ? 'dark' : 'light');
};

export const darkMode = (node: HTMLElement, overrideTheme?: ThemeOverride) => {
  let override = overrideTheme;
  let prefersDark = false;

  const unsubscribe = useDarkMode.subscribe((value) => {
    prefersDark = value;
    applyTheme(node, prefersDark, override);
  });

  return {
    update(newOverride?: ThemeOverride) {
      override = newOverride;
      applyTheme(node, prefersDark, override);
    },
    destroy() {
      unsubscribe();
    },
  };
};
