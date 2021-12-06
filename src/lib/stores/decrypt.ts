import { browser } from '$app/env';
import { writable } from 'svelte/store';

export const decryptPort = persistStore('port', null);

type DecryptStatus = 'notRequested' | 'success' | 'error';
export const lastDecryptStatus = writable<DecryptStatus>('notRequested');

export function setLastDecryptFailure() {
  lastDecryptStatus.set('error');
}

export function setLastDecryptSuccess() {
  lastDecryptStatus.set('success');
}

export function persistStore(name: string, initialValue: string | null = '') {
  let initialStoreValue = initialValue;
  if (browser) {
    initialStoreValue =
      JSON.parse(window?.localStorage?.getItem(name) ?? '{}') ??
      initialStoreValue;
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
