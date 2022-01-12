import { writable } from 'svelte/store';

import type { Readable } from 'svelte/store';

type SetIntervalType = typeof setInterval;
type Timer = ReturnType<SetIntervalType>;
type Timeout = Parameters<SetIntervalType>[1];

export interface Refreshable<T> extends Readable<PromiseLike<T>> {
  refresh: () => void;
}

export const refreshable = <T>(
  callback: () => PromiseLike<T>,
  initialData: PromiseLike<T> | T = callback(),
  timeout: Timeout = 10000,
): Refreshable<T> => {
  let interval: Timer;

  const refresh = () => {
    callback().then((data: T) => store.set(Promise.resolve(data)));
  };

  const cleanUp = () => clearInterval(interval);

  const setUp = () => {
    interval = setInterval(refresh, timeout);
    return cleanUp;
  };

  const store = writable<PromiseLike<T>>(Promise.resolve(initialData), setUp);

  return {
    subscribe: store.subscribe,
    refresh,
  };
};
