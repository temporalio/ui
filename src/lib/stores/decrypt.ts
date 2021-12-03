import { browser } from '$app/env';
import { writable } from 'svelte/store';

export const decryptPort = persistStore('port', null);

type DecryptStatus = 'notRequested' | 'success' | 'error';
export const lastDecryptStatus = writable<DecryptStatus>('notRequested');

export const portNumber = writable<null | number>(null);

export function setLastDecryptFailure() {
  lastDecryptStatus.set('error');
}

export function setLastDecryptSuccess() {
  lastDecryptStatus.set('success');
}

export function persistStore(name, initialValue) {
  let initialStoreValue = initialValue;
  if (browser) {
    initialStoreValue =
      window?.localStorage?.getItem(name) ?? initialStoreValue;
  }

  const { subscribe, set } = writable(initialStoreValue);

  return {
    subscribe,

    set: (x) => {
      if (browser) {
        if (window?.localStorage) {
          window.localStorage.setItem(name, x);
        }
      }
      set(x);
    },
  };
}
