import { writable, type Writable } from 'svelte/store';

import { v4 } from 'uuid';

import type { Toast } from '$lib/types/holocene';

const toasts = writable<Toast[]>([]);

export interface Toaster extends Writable<Toast[]> {
  push: (toast: Toast) => void;
  pop: (id: string) => void;
  clear: () => void;
  toasts: Writable<Toast[]>;
}

const push = (toast: Toast) => {
  const toastWithDefaults: Toast = {
    id: v4(),
    duration: 3000,
    variant: 'primary',
    ...toast,
  };
  toasts.update((ts) => [...ts, toastWithDefaults]);
  const timeoutId = setTimeout(() => {
    pop(toastWithDefaults.id);
    clearTimeout(timeoutId);
  }, toastWithDefaults.duration);
};

const pop = (id: string) => {
  toasts.update((ts) => ts.filter((t) => t.id !== id));
};

const clear = (): void => {
  toasts.set([]);
};

export const toaster: Toaster = {
  push,
  pop,
  clear,
  toasts,
  set: toasts.set,
  subscribe: toasts.subscribe,
  update: toasts.update,
};
