import { browser } from '$app/env';
import { writable } from 'svelte/store';

import type { Writable } from 'svelte/store';

export function persistStore(
  name: string,
  initialValue: string | null = '',
): Pick<Writable<string | null>, 'subscribe' | 'set'> {
  let initialStoreValue = initialValue;
  if (browser) {
    try {
      if (window?.localStorage?.getItem(name)) {
        initialStoreValue = JSON.parse(window?.localStorage?.getItem(name));
      }
    } catch (_err) {
      initialStoreValue = null;
    }
  }

  const { subscribe, set } = writable(initialStoreValue);

  return {
    subscribe,

    set: (x: string | null) => {
      if (browser) {
        window?.localStorage?.setItem(name, JSON.stringify(x));
      }
      set(x);
    },
  };
}
