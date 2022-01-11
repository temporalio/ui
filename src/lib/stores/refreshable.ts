import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type SetIntervalType = typeof setInterval;
type Timer = ReturnType<SetIntervalType>;
type Timeout = Parameters<SetIntervalType>[1];

export const refreshable = <T>(
  callback: () => PromiseLike<T>,
  initialData: PromiseLike<T> | T = callback(),
  timeout: Timeout = 10000,
): Writable<PromiseLike<T>> => {
  let interval: Timer;

  const cleanUp = () => clearInterval(interval);
  const setUp = () => {
    interval = setInterval(() => {
      callback().then((data: T) => store.set(Promise.resolve(data)));
    }, timeout);
    return cleanUp;
  };

  const store = writable<PromiseLike<T>>(Promise.resolve(initialData), setUp);

  return store;
};
