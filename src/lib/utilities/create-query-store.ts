import { browser } from '$app/env';
import { writable } from 'svelte/store';

export type QueryStore<T> = T & {
  loading: boolean;
  updating: boolean;
  ids: string[];
};

export const createQueryStore = <T, S = QueryStore<T>>(
  key: string,
  update: () => void,
) => {
  const store = writable<S>(
    {
      loading: true,
      updating: false,
      ids: [],
      [key]: {},
    } as unknown as S,
    createIntervalCallback(update),
  );

  return store;
};

export const createIntervalCallback = (update: () => void): (() => void) => {
  let idleCallback: number;

  const callback = () => {
    if (browser) {
      if (idleCallback) cancelIdleCallback(idleCallback);
      update();
      // idleCallback = requestIdleCallback(update);
    }
    console.log({ browser, idleCallback });
  };

  setTimeout(callback, 0);
  const interval = setInterval(callback, 3000);

  return () => {
    console.log('unsubscribing');
    if (browser && idleCallback) cancelIdleCallback(idleCallback);
    clearInterval(interval);
  };
};
