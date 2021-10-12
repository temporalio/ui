import { is_function } from 'svelte/internal';
import { Updater, Writable, writable } from 'svelte/store';
import { isFunction } from './is-function';

const call = (fn: () => void) => {
  console.log(typeof fn);
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
