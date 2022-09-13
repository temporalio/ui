import { browser } from '$app/env';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
export function persistStore<T>(
  name: string,
  initialValue: T,
  broadcastToAll = false,
): Pick<Writable<T>, 'subscribe' | 'set'> {
  let initialStoreValue = initialValue;
  let broadcaster: null | BroadcastChannel;

  if (browser) {
    try {
      if (window?.localStorage?.getItem(name)) {
        initialStoreValue = JSON.parse(
          window?.localStorage?.getItem(name) ?? '',
        );
      }
    } catch (_err) {
      console.error(`Could not get localstorage ${name}`);
    }
  }

  const { subscribe, set } = writable<T>(initialStoreValue);

  if (browser && broadcastToAll) {
    broadcaster = new BroadcastChannel(`persist-store-${name}`);
    broadcaster?.addEventListener('message', (event) => {
      set(event.data);
    });
  }

  return {
    subscribe,
    set: (x: T) => {
      if (browser) {
        if (broadcaster) broadcaster.postMessage(x);
        if (x === null) {
          window?.localStorage?.removeItem(name);
        } else {
          window?.localStorage?.setItem(name, JSON.stringify(x));
        }
      }
      set(x);
    },
  };
}
