import { Updater, Writable, writable } from 'svelte/store';
import { isFunction } from '$lib/utilities/is-function';

const call = (fn: () => void) => {
  if (isFunction(fn)) fn();
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
