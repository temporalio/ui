import { browser } from '$app/env';
import { writable } from 'svelte/store';

export type QueryStore = {
  [x: string]: {};
  loading: boolean;
  updating: boolean;
  ids: string[];
};

export type QueryAction<T = string, P = {}> = {
  type: T;
  payload: P;
};

export const createQueryStore = <T extends QueryStore>(
  key: string,
  update: () => void,
) => {
  const store = writable<T>(
    {
      loading: true,
      updating: false,
      ids: {},
      [key]: {},
    } as T,
    createIntervalCallback(update),
  );

  return {
    ...store,
  };
};

export const createIntervalCallback = (update: () => void): (() => void) => {
  let idleCallback: number;

  const callback = () => {
    if (browser) {
      if (idleCallback) cancelIdleCallback(idleCallback);
      idleCallback = requestIdleCallback(update);
    }
  };

  setTimeout(callback, 0);
  const interval = setInterval(callback, 30000);

  return () => {
    if (browser && idleCallback) cancelIdleCallback(idleCallback);
    clearInterval(interval);
  };
};
