import { persistStore } from '$lib/stores/persist-store';

const useDarkMode = persistStore(
  'dark mode',
  !!import.meta.env.VITE_DARK_MODE,
  true,
);

export const darkMode = (node: HTMLElement) => {
  useDarkMode.subscribe((value) => {
    console.log({ darkMode: value });
    if (value) {
      node.classList.add('dark');
    } else {
      node.classList.remove('dark');
    }
  });
};
