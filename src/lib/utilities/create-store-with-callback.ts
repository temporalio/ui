import { Updater, Writable, writable } from 'svelte/store';

const call = (fn: () => void) => {
  if (fn && typeof fn === 'function') fn();
};

export const createStoreWithCallback = <T>(
  value: T,
  callback: () => void,
): Writable<T> => {
  const store = writable(value);

  return {
    ...store,
    set: (value: T) => {
      store.set(value);
      call(callback);
    },
    update: (updater: Updater<T>) => {
      store.update(updater);
      call(callback);
    },
  };
};
