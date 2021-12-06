import { browser } from '$app/env';
import { writable } from 'svelte/store';

export const webDecoderPort = persistStore('port', null);

type WebDecoderStatus = 'notRequested' | 'success' | 'error';
export const lastDecoderstatus = writable<WebDecoderStatus>('notRequested');

export function setLastWebDecoderFailure() {
  lastDecoderstatus.set('error');
}

export function setLastWebDecoderSuccess() {
  lastDecoderstatus.set('success');
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
