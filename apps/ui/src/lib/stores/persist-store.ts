import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { isFunction } from '$lib/utilities/is-function';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

export type PersistedStore<T> = Pick<
  Writable<T>,
  'subscribe' | 'set' | 'update'
> & {
  hasStoredValue: () => boolean;
  setInitialValue: (value: T) => void;
};

export function persistStore<T>(
  name: string,
  initialValue: T | (() => T),
  broadcastToAll = false,
): PersistedStore<T> {
  let initialStoreValue = isFunction<() => T>(initialValue)
    ? initialValue()
    : initialValue;
  let broadcaster: null | BroadcastChannel;

  const getStoredValue = () => window?.localStorage?.getItem(name);

  const hasStoredValue = () => {
    if (!BROWSER) return false;

    try {
      return getStoredValue() !== null;
    } catch {
      return false;
    }
  };

  if (BROWSER) {
    try {
      const storedValue = getStoredValue();

      if (storedValue !== null) {
        initialStoreValue = parseWithBigInt(storedValue);
      }
    } catch {
      // Keep the original initialStoreValue if localStorage parsing fails
    }
  }

  const { subscribe, set, update } = writable<T>(initialStoreValue);

  if (BROWSER && broadcastToAll) {
    try {
      broadcaster = new BroadcastChannel(`persist-store-${name}`);
      broadcaster?.addEventListener('message', (event) => {
        set(event.data);
      });
    } catch {
      console.error('Browser does not support BroadcastChannel');
    }
  }

  return {
    subscribe,
    set: (x: T) => {
      if (BROWSER) {
        if (broadcaster) broadcaster.postMessage(x);
        if (x === null) {
          window?.localStorage?.removeItem(name);
        } else {
          window?.localStorage?.setItem(name, stringifyWithBigInt(x));
        }
      }
      set(x);
    },
    update: (updater: (x: T) => T) => {
      if (BROWSER) {
        window?.localStorage?.removeItem(name);
        update((previousValue) => {
          const updatedValue = updater(previousValue);
          window?.localStorage?.setItem(
            name,
            stringifyWithBigInt(updatedValue),
          );
          return updatedValue;
        });
      }
    },
    hasStoredValue,
    setInitialValue: (value: T) => {
      if (!BROWSER || hasStoredValue()) return;
      set(value);
    },
  };
}
