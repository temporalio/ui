import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { isFunction } from '$lib/utilities/is-function';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

export function persistStore<T>(
  name: string,
  initialValue: T | (() => T) | null = null,
  broadcastToAll = false,
): Pick<Writable<T | null>, 'subscribe' | 'set' | 'update'> {
  let initialStoreValue = isFunction<() => T>(initialValue)
    ? initialValue()
    : initialValue;
  let broadcaster: null | BroadcastChannel;

  if (BROWSER) {
    try {
      if (window?.localStorage?.getItem(name)) {
        initialStoreValue = parseWithBigInt(
          window?.localStorage?.getItem(name) ?? '',
        );
      }
    } catch (_err) {
      initialStoreValue = null;
    }
  }

  const { subscribe, set, update } = writable<T>(initialStoreValue);

  if (BROWSER && broadcastToAll) {
    try {
      broadcaster = new BroadcastChannel(`persist-store-${name}`);
      broadcaster?.addEventListener('message', (event) => {
        set(event.data);
      });
    } catch (e) {
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
  };
}
