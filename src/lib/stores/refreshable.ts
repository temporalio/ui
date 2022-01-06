import { onDestroy, onMount } from 'svelte';

import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type SetIntervalType = typeof setInterval;
type Timer = ReturnType<SetIntervalType>;
type Timeout = Parameters<SetIntervalType>[1];

export const refreshable = <T>(
  callback: () => PromiseLike<T>,
  initialData: PromiseLike<T> = callback(),
  timeout: Timeout = 10000,
): Writable<PromiseLike<T>> => {
  const store = writable<PromiseLike<T>>(initialData);
  let interval: Timer;

  onMount(() => {
    interval = setInterval(() => {
      callback().then((data: T) => store.set(Promise.resolve(data)));
    }, timeout);
  });

  onDestroy(() => clearInterval(interval));

  return store;
};
