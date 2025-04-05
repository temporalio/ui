import type { Writable } from 'svelte/store';

export const delay = 300;

export const withLoading = async (
  loading: Writable<boolean>,
  updating: Writable<boolean>,
  fn: () => Promise<void>,
): Promise<void> => {
  updating.set(true);
  try {
    await fn();
  } catch (error) {
    console.error(error);
  }
  loading.set(false);
  setTimeout(() => {
    updating.set(false);
  }, delay);
};
