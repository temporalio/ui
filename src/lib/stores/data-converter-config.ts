import { browser } from '$app/env';
import { writable } from 'svelte/store';

export const dataConverterPort = persistStore('port', null);

type DataConverterStatus = 'notRequested' | 'success' | 'error';
export const lastDataConverterStatus =
  writable<DataConverterStatus>('notRequested');

export function setLastDataConverterFailure() {
  lastDataConverterStatus.set('error');
}

export function setLastDataConverterSuccess() {
  lastDataConverterStatus.set('success');
}

export function persistStore(name: string, initialValue: string | null = '') {
  let initialStoreValue = initialValue;
  if (browser) {
    try {
      initialStoreValue = JSON.parse(window?.localStorage?.getItem(name));
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
