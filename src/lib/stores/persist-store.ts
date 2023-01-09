import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { isFunction } from '$lib/utilities/is-function';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

export function persistStore<T>(
  name: string,
  initialValue: T | (() => T) | null = null,
  broadcastToAll = false,
): Pick<Writable<T | null>, 'subscribe' | 'set'> {
  let initialStoreValue = isFunction<() => T>(initialValue)
    ? initialValue()
    : initialValue;
  let broadcaster: null | BroadcastChannel;

  if (browser) {
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

  const { subscribe, set } = writable<T>(initialStoreValue);

  if (browser && broadcastToAll) {
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
      if (browser) {
        if (broadcaster) broadcaster.postMessage(x);
        if (x === null) {
          window?.localStorage?.removeItem(name);
        } else {
          window?.localStorage?.setItem(name, stringifyWithBigInt(x));
        }
      }
      set(x);
    },
  };
}
