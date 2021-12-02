import { writable } from 'svelte/store';

export const decryptPort = persistStore('port', null);

// An enum or string union may be more appropriate here so we dont' get a
// if thing and the falsiness evaluates to the null case, but start with this
export const lastDecryptStatus = writable<null | boolean>(null);

export const portNumber = writable<null | number>(null);

export function lastDecryptFailure() {
  lastDecryptStatus.set(false);
}

export function lastDecryptSuccess() {
  lastDecryptStatus.set(true);
}

export function persistStore(name, initialValue) {
  if (window?.localStorage) {
    const storedValue = window.localStorage.getItem(name);

    if (storedValue) {
      initialValue = storedValue;
    }
  }

  const { subscribe, set } = writable(initialValue);

  return {
    subscribe,

    set: (x) => {
      if (window?.localStorage) {
        window.localStorage.setItem(name, x);
      }
      set(x);
    },
  };
}
