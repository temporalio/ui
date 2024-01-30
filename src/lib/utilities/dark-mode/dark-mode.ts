import { persistStore } from '$lib/stores/persist-store';

export const useDarkMode = persistStore(
  'dark mode',
  !!import.meta.env.VITE_DARK_MODE,
  true,
);

export const darkMode = (node: HTMLElement) => {
  useDarkMode.subscribe((value) => {
    if (value) {
      node.classList.add('dark');
    } else {
      node.classList.remove('dark');
    }
  });
};
